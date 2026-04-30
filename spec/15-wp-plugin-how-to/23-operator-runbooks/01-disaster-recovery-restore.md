# Runbook: Disaster-Recovery Restore

> **Version:** 1.0.0
> **Created:** 2026-04-26 (UTC+8)
> **Status:** Active
> **Implements:** [`spec/31-app/05-conventions/14-backup-and-dr-policy.md`](../../31-app/05-conventions/14-backup-and-dr-policy.md) §7 _(matches A-44 v1.0.0)_
> **Audience:** On-call operator. Assume 03:00, half-asleep, no architect available.
> **Severity if you skip a step:** `fatal` — silent data loss or audit-chain corruption.

---

## 0 — Stop. Read this whole runbook before touching anything.

This runbook restores either:
- **Tier 0 (audit DB)** — irreplaceable, hash-chained, never overwrite blindly
- **Tier 1 (root DB)** — workspace metadata, identity
- **Tier 2 (app DB)** — workspace items, mirrors, grants
- **Tier 3 (uploaded files)** — image attachments
- **Tier 4 (config)** — `wp-config.php` excluded; only re-deriveable settings

If you do not know which tier is affected, **stop and call the architect.** Do not guess.

---

## 1 — Pre-flight

### Variables (set these once, in your shell)

```bash
# Required — fill before continuing
export RESTORE_TIER=2                        # 0|1|2|3|4
export RESTORE_WORKSPACE_ID="ws_XXXXXXXX"    # only for Tier 2; "ALL" for Tier 0/1
export TARGET_RPO_TS="2026-04-26T02:30:00Z"  # latest acceptable data point
export OPERATOR_EMAIL="oncall@example.com"
export TICKET_ID="INC-2026-04-26-001"

# Standard — should match your deployment
export STAGING_DIR="/var/restore-staging"
export PROD_DIR="/var/www/wordpress/wp-content/uploads/workflowy"
export OFFSITE_BUCKET="s3://workflowy-backups-eu-west-1"
export OFFSITE_BUCKET_DR="s3://workflowy-backups-us-east-1"   # cross-region failover
export KEK_VAULT_PATH="/etc/workflowy/kek-vault.gpg"
export AUDIT_TOOL="/usr/local/bin/wf-audit"   # CLI shipped with plugin
```

### Pre-flight checks (all MUST pass before step 2) `[gate: G-BACKUP]`

```bash
test -d "$STAGING_DIR" || { echo "FATAL: staging dir missing"; exit 1; }
test -w "$STAGING_DIR" || { echo "FATAL: staging not writable"; exit 1; }
df -BG "$STAGING_DIR" | awk 'NR==2 && $4+0 < 50 {print "FATAL: <50GB free"; exit 1}'
which sqlite3 aws gpg sha256sum || { echo "FATAL: missing CLI tool"; exit 1; }
test -r "$KEK_VAULT_PATH" || { echo "FATAL: cannot read KEK vault"; exit 1; }
```

If any pre-flight fails: **stop**, fix, and start over. Do not continue with workarounds.

---

## 2 — Declare the restore (audit row at `fatal`)

This MUST happen **before** any file is touched `[gate: G-BACKUP-RESTORE-DECLARE-FIRST]`. It creates the `SYSTEM.RESTORE_INITIATED` audit row that downstream alerting depends on.

```bash
"$AUDIT_TOOL" log \
  --action="SYSTEM.RESTORE_INITIATED" \
  --severity=fatal \
  --metadata='{"Tier":"'"$RESTORE_TIER"'","WorkspaceId":"'"$RESTORE_WORKSPACE_ID"'","TargetRpoTs":"'"$TARGET_RPO_TS"'","Ticket":"'"$TICKET_ID"'","Operator":"'"$OPERATOR_EMAIL"'"}'
```

**Verify:** the command MUST print `audit_id=...` `[gate: G-BACKUP-AUDIT-CHAIN-PRESERVE]`. If it does not, the audit DB itself is unreachable — escalate immediately; you cannot restore safely without an audit trail.

---

## 3 — Stop write traffic to the affected scope

### Tier 0 or Tier 1 → stop the entire plugin

```bash
sudo wp --path=/var/www/wordpress plugin deactivate workflowy
```

### Tier 2 → workspace-scoped freeze (preferred)

```bash
sudo wp --path=/var/www/wordpress workflowy workspace freeze \
  --workspace-id="$RESTORE_WORKSPACE_ID" \
  --reason="restore $TICKET_ID"
```

**Verify:** subsequent `POST /wp-json/workflowy/v1/items/...` requests for the workspace MUST return `423 Locked` with envelope `{"Status":"error","Errors":[{"Code":"ERR_WORKSPACE_FROZEN"}]}` `[gate: G-BACKUP-RESTORE-FREEZE-423]`.

### Forbidden during restore (per A-44 §7)

- ❌ Concurrent writes to the live DB while WAL replay runs (step 8).
- ❌ Restoring a single workspace from a multi-workspace tarball without splitting first.
- ❌ Skipping `PRAGMA integrity_check` ("looks fine to me").

---

## 4 — Choose source

```bash
# List candidates from primary off-site, sorted newest first
aws s3 ls "$OFFSITE_BUCKET/tier-$RESTORE_TIER/" --recursive | sort -r | head -20
```

**Decision tree:**

| If… | Choose… |
|---|---|
| A hot snapshot exists with `Timestamp ≤ TARGET_RPO_TS` and `Timestamp ≥ (TARGET_RPO_TS - 1h)` | That hot snapshot **+** WAL files between snapshot and `TARGET_RPO_TS` |
| No hot snapshot in the last hour, but a daily full exists today | That daily full **+** WAL files between full and `TARGET_RPO_TS` |
| Primary bucket returns no listing within 60 s | Switch to `$OFFSITE_BUCKET_DR` and retry |
| Both buckets unreachable | **Stop. Page the architect. Do not proceed.** |

```bash
# Set after choosing
export CHOSEN_SNAPSHOT="tier-$RESTORE_TIER/2026-04-26/02-00-hot.tar.gz.enc"
export CHOSEN_KEY_BLOB="${CHOSEN_SNAPSHOT}.key.enc"
export CHOSEN_WAL_PREFIX="tier-$RESTORE_TIER/2026-04-26/wal/02-"
```

---

## 5 — Download to clean staging

```bash
rm -rf "$STAGING_DIR"/*    # MUST be empty — staging is single-use
aws s3 cp "$OFFSITE_BUCKET/$CHOSEN_SNAPSHOT"  "$STAGING_DIR/snapshot.tar.gz.enc"
aws s3 cp "$OFFSITE_BUCKET/$CHOSEN_KEY_BLOB"  "$STAGING_DIR/snapshot.key.enc"
aws s3 cp "$OFFSITE_BUCKET/$CHOSEN_WAL_PREFIX" "$STAGING_DIR/wal/" --recursive
```

**Verify expected sizes against the off-site manifest** (`aws s3api head-object` returns `ContentLength` and `Metadata.OriginalSha256`). A short download is a silent corruption.

---

## 6 — Decrypt with operator-vault KEK

```bash
# Decrypt the per-job DEK with the KEK
gpg --quiet --batch --yes \
  --decrypt --output "$STAGING_DIR/snapshot.key" \
  "$STAGING_DIR/snapshot.key.enc"

# Decrypt the snapshot (AES-256-GCM); openssl validates the GCM tag
openssl enc -d -aes-256-gcm \
  -K "$(cat $STAGING_DIR/snapshot.key)" \
  -in "$STAGING_DIR/snapshot.tar.gz.enc" \
  -out "$STAGING_DIR/snapshot.tar.gz"
```

**Failure modes:**

| Symptom | Cause | Action |
|---|---|---|
| `gpg: decryption failed: No secret key` | Wrong KEK loaded | Reload KEK from vault; retry once. If retry fails: `STOP` |
| `bad decrypt` from openssl | GCM tag mismatch → tampering or corruption | Mark snapshot bad in audit log; go back to step 4 with the next-newest snapshot |
| `gzip: stdin: not in gzip format` | Truncated download | Re-download (step 5); do NOT proceed |

```bash
tar -xzf "$STAGING_DIR/snapshot.tar.gz" -C "$STAGING_DIR/"
```

After extraction, the SQLite file is at `$STAGING_DIR/<dbname>.sqlite` (e.g. `app.sqlite`).

---

## 7 — Integrity check (`PRAGMA integrity_check`)

```bash
RESULT=$(sqlite3 "$STAGING_DIR/<dbname>.sqlite" 'PRAGMA integrity_check;')
test "$RESULT" = "ok" || {
  "$AUDIT_TOOL" log --action=SYSTEM.BACKUP_CORRUPT --severity=fatal \
    --metadata='{"Snapshot":"'"$CHOSEN_SNAPSHOT"'","IntegrityResult":"'"$RESULT"'"}'
  echo "FATAL: integrity check failed — go back to step 4"
  exit 1
}
```

**Do not skip this check.** "Looks fine to me" is a forbidden phrase in this runbook.

---

## 8 — (Tier 0 only) Walk the audit hash chain

This step applies **only** to Tier 0 (audit DB). For Tier 1/2/3/4, skip to step 9.

```bash
"$AUDIT_TOOL" verify-chain \
  --db="$STAGING_DIR/audit.sqlite" \
  --from=genesis \
  --to=latest
```

The output MUST be `chain ok, N rows verified, last_hash=<hex>`.

If the chain is broken:
1. **Do NOT proceed.** A broken chain in a backup means either the backup itself is tampered, OR the live DB before backup was already tampered.
2. Fall back to the next-newest snapshot (return to step 4).
3. If two consecutive snapshots fail chain verification: page the architect — this is a **suspected breach**, not a routine restore.

---

## 9 — WAL replay up to the target RPO

```bash
"$AUDIT_TOOL" wal-replay \
  --db="$STAGING_DIR/<dbname>.sqlite" \
  --wal-dir="$STAGING_DIR/wal/" \
  --until-ts="$TARGET_RPO_TS"
```

**This is the only step that loses data.** Anything written between `TARGET_RPO_TS` and the moment of the incident is gone — that's the RPO trade-off you accepted at step 1.

**Verify:** the tool prints `replayed N records, final_ts=<TARGET_RPO_TS or earlier>`.

---

## 10 — (Tier 0 only) Detect chain-rewind

After replay, if you are restoring Tier 0 to a point **earlier** than the live audit DB's last `IntegrityHash`, you have rewound the chain. The next live write will detect this and emit a `fatal` audit row.

```bash
LIVE_LAST_TS=$(sqlite3 "$PROD_DIR/audit.sqlite" 'SELECT MAX(CreatedAt) FROM AuditLog;')
RESTORED_LAST_TS=$(sqlite3 "$STAGING_DIR/audit.sqlite" 'SELECT MAX(CreatedAt) FROM AuditLog;')

if [[ "$RESTORED_LAST_TS" < "$LIVE_LAST_TS" ]]; then
  echo "WARNING: this restore will rewind the audit chain by $(( $(date -d $LIVE_LAST_TS +%s) - $(date -d $RESTORED_LAST_TS +%s) )) seconds"
  echo "Acknowledge in writing (ticket comment) before continuing."
  read -p "Type ACKNOWLEDGE-REWIND to continue: " confirm
  test "$confirm" = "ACKNOWLEDGE-REWIND" || exit 1
fi
```

**The `SYSTEM.AUDIT_CHAIN_REWIND` audit row will fire automatically** on the next live write after step 11. Document the acknowledgement in the post-mortem (step 13).

---

## 11 — Move into production

```bash
# Atomic-ish: rename old aside, move new in, fsync
DBNAME="<dbname>"
mv "$PROD_DIR/$DBNAME.sqlite" "$PROD_DIR/$DBNAME.sqlite.pre-restore-$TICKET_ID"
mv "$STAGING_DIR/$DBNAME.sqlite" "$PROD_DIR/$DBNAME.sqlite"
sync
chown www-data:www-data "$PROD_DIR/$DBNAME.sqlite"
chmod 0640 "$PROD_DIR/$DBNAME.sqlite"
```

**Do not delete `$PROD_DIR/$DBNAME.sqlite.pre-restore-$TICKET_ID`** until the post-mortem (step 13) is complete and signed off. It is your only escape hatch if the restore is wrong.

---

## 12 — Restart and verify

```bash
# Reactivate the plugin OR thaw the workspace
sudo wp --path=/var/www/wordpress plugin activate workflowy   # Tier 0/1
# OR
sudo wp --path=/var/www/wordpress workflowy workspace thaw \
  --workspace-id="$RESTORE_WORKSPACE_ID"                       # Tier 2
```

**Verify within 60 s:**

```bash
# 1. RESTORE_COMPLETE audit row appears
"$AUDIT_TOOL" tail --filter='action=SYSTEM.RESTORE_COMPLETE' --since=2m

# 2. Health endpoint returns 200
curl -fsSL https://wordpress.example.com/wp-json/workflowy/v1/health

# 3. A canary item read against the restored DB returns expected content
sudo wp --path=/var/www/wordpress workflowy item show \
  --workspace-id="$RESTORE_WORKSPACE_ID" \
  --item-id="<known canary id>"
```

If any verify step fails: `mv $PROD_DIR/$DBNAME.sqlite.pre-restore-$TICKET_ID $PROD_DIR/$DBNAME.sqlite` and start the runbook over.

---

## 13 — Notify and post-mortem

### Within 15 min of step 12

Email all `Owner` and `Admin` accounts on the affected workspaces:

```bash
"$AUDIT_TOOL" notify-restore \
  --tier="$RESTORE_TIER" \
  --workspace-id="$RESTORE_WORKSPACE_ID" \
  --rpo-ts="$TARGET_RPO_TS" \
  --ticket="$TICKET_ID"
```

The email template is owned by the i18n SSOT and MUST state:
- The tier restored (in user-readable terms — not "Tier 2")
- The RPO timestamp (data after this point is lost)
- Any audit-chain rewind acknowledgement (Tier 0 only)
- Ticket reference + operator contact

### Within 7 days

Open a post-mortem from the canonical template at [`spec/15-wp-plugin-how-to/23-operator-runbooks/03-post-mortem-template.md`](./03-post-mortem-template.md), linked from the `SYSTEM.RESTORE_INITIATED` audit row by `Ticket` field. Per A-44 §7 step 12, the post-mortem MUST include:

- Root cause (what failed in production)
- Why backups were needed (not: "as a precaution")
- RPO/RTO actually achieved vs target
- Snapshot age chosen and why
- Audit-chain rewind acknowledgement (if Tier 0)
- Action items to prevent recurrence

---

## Appendix A — Failure escalation tree

| Step where it failed | Severity | Escalate to |
|---|---|---|
| 1 (pre-flight) | low | Self-fix, restart |
| 2 (audit unavailable) | **fatal** | Architect on-call **immediately** |
| 3 (cannot stop traffic) | high | Platform team |
| 4 (no backup found) | **fatal** | Architect + DPO |
| 6 (decrypt fail × 2) | **fatal** | Security on-call (suspected tampering) |
| 7 (integrity check fail × 2) | **fatal** | Security on-call (suspected tampering) |
| 8 (chain broken × 2) | **fatal** | Security on-call (**suspected breach**, not routine) |
| 11 (move fails) | high | Roll back via `.pre-restore` snapshot, retry |
| 12 (verify fails) | high | Roll back, retry, then escalate if 2nd attempt fails |

## Appendix B — Cross-references

- **Policy SSOT:** [`14-backup-and-dr-policy.md`](../../31-app/05-conventions/14-backup-and-dr-policy.md) §7 (this runbook implements it)
- **Audit-log codes used:** `SYSTEM.RESTORE_INITIATED`, `SYSTEM.RESTORE_COMPLETE`, `SYSTEM.BACKUP_CORRUPT`, `SYSTEM.AUDIT_CHAIN_REWIND` — all registered in [`09-audit-log-policy.md`](../../31-app/05-conventions/09-audit-log-policy.md) v1.2.1 §2.1
- **Drill cadence:** A-44 §8 — quarterly, blocks releases at 100 days overdue
- **Encryption:** A-44 §5 — AES-256-GCM with operator-vault KEK
- **Acceptance tests:** `AT-BACKUP-01..18` in `spec/31-app/05-conventions/14-backup-and-dr-policy.md` §11

## Appendix C — Drill-mode differences

When running this runbook **as a drill** (per A-44 §8), apply these substitutions:

| Step | Production restore | Drill |
|------|---|---|
| 2 | `SYSTEM.RESTORE_INITIATED` at `fatal` | `SYSTEM.RESTORE_DRILL_PASS`/`_FAIL` at `warn`/`error` after step 12 |
| 3 | Real plugin deactivate/freeze | Spin up isolated staging env; DO NOT touch production |
| 11 | `mv` into `$PROD_DIR` | `mv` into `$STAGING_DIR/restored/` |
| 12 | Reactivate plugin / thaw workspace | Run canary checks in staging only |
| 13 | Email all Owners + Admins | Email drill participants only |

A failed drill triggers a P1 incident per A-44 §8: root cause within 7 days, next drill within 14.
