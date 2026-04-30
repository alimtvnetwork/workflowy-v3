# Runbook: Backup KEK Rotation

> **Version:** 1.0.0
> **Created:** 2026-04-27 (UTC+8)
> **Status:** Active
> **Implements:** [`spec/31-app/05-conventions/14-backup-and-dr-policy.md`](../../31-app/05-conventions/14-backup-and-dr-policy.md) §5 (Encryption — Key rotation) _(matches A-44 v1.0.0)_
> **Audience:** On-call operator. Quarterly scheduled work; not an incident response.
> **Severity if you skip a step:** `warn` per audit code `SYSTEM.BACKUP_KEY_ROTATE`; **`fatal`** if you destroy an old KEK before its 2-year overlap window expires (silently breaks restore for any backup encrypted with that KEK).

---

## 0 — Stop. Read this whole runbook before touching anything.

This runbook **rotates the Backup Key-Encryption-Key (KEK)** stored in the operator vault. The KEK encrypts per-tarball Data Encryption Keys (DEKs); the DEKs encrypt the actual SQLite snapshots before they leave the host (per A-44 §5).

**Cadence:** every **90 days** (per A-44 §5.Key-rotation, AT-BACKUP-17).
**Overlap window:** old KEKs MUST remain available for **2 years** after retirement so monthly archives within retention can still be restored (per AT-BACKUP-17 retention-overlap clause).
**Forbidden:** rotating the WordPress `WP_AUTH_KEY` — that is a **different KEK** with a different blast radius (per A-44 §5 row 2). This runbook touches **only** the backup-only KEK.

If you do not know the difference between the backup KEK and `WP_AUTH_KEY`, **stop and call the architect.** Do not guess.

---

## 1 — Pre-flight

### Variables (set these once, in your shell)

```bash
# Required — fill before continuing
export ROTATION_REASON="quarterly-cadence"      # quarterly-cadence|suspected-compromise|operator-departure
export OLD_KEK_ID="kek-2026-q1"                 # the currently-active KEK label
export NEW_KEK_ID="kek-2026-q2"                 # the new label (date-scoped, monotonically newer)
export OPERATOR_EMAIL="oncall@example.com"
export TICKET_ID="OPS-2026-04-27-001"

# Standard — should match your deployment
export KEK_VAULT_DIR="/etc/workflowy/kek-vault"             # directory of {ID}.gpg files
export KEK_VAULT_ACTIVE_LINK="$KEK_VAULT_DIR/active.gpg"    # symlink → currently-active KEK
export KEK_VAULT_RETIRED_DIR="$KEK_VAULT_DIR/retired"       # 2-year overlap storage
export OFFSITE_BUCKET="s3://workflowy-backups-eu-west-1"
export OFFSITE_BUCKET_DR="s3://workflowy-backups-us-east-1"
export AUDIT_TOOL="/usr/local/bin/wf-audit"                 # CLI shipped with plugin
export BACKUP_TOOL="/usr/local/bin/wf-backup"               # CLI shipped with plugin
```

### Pre-flight checks (all MUST pass before step 2)

```bash
test -d "$KEK_VAULT_DIR" || { echo "FATAL: KEK vault dir missing"; exit 1; }
test -w "$KEK_VAULT_DIR" || { echo "FATAL: vault not writable by operator"; exit 1; }
test -L "$KEK_VAULT_ACTIVE_LINK" || { echo "FATAL: active KEK symlink missing"; exit 1; }
test -r "$KEK_VAULT_DIR/$OLD_KEK_ID.gpg" || { echo "FATAL: old KEK file missing"; exit 1; }
test ! -e "$KEK_VAULT_DIR/$NEW_KEK_ID.gpg" || { echo "FATAL: new KEK label already exists — pick a unique ID"; exit 1; }
which gpg openssl aws sha256sum "$AUDIT_TOOL" "$BACKUP_TOOL" || { echo "FATAL: missing CLI tool"; exit 1; }

# Verify last DR drill is within 100-day window (A-44 §monitoring blocks releases otherwise)
"$BACKUP_TOOL" drill-status --max-age-days=100 || { echo "FATAL: DR drill overdue (>100d) — block rotation until a successful drill is recorded"; exit 1; }
```

If any pre-flight fails: **stop**, fix, and start over. Do not continue with workarounds.

---

## 2 — Declare the rotation (audit row at `warn`)

This MUST happen **before** any KEK file is created. It creates the `SYSTEM.BACKUP_KEY_ROTATE` audit row that monitoring depends on (per A-44 §monitoring row 9 + AT-BACKUP-17).

```bash
"$AUDIT_TOOL" log \
  --code "SYSTEM.BACKUP_KEY_ROTATE" \
  --severity "warn" \
  --actor "$OPERATOR_EMAIL" \
  --ticket "$TICKET_ID" \
  --metadata "{\"reason\":\"$ROTATION_REASON\",\"oldKekId\":\"$OLD_KEK_ID\",\"newKekId\":\"$NEW_KEK_ID\",\"phase\":\"declared\"}"
```

Verify the row landed:

```bash
"$AUDIT_TOOL" tail --code SYSTEM.BACKUP_KEY_ROTATE --limit 1 | grep -q "$TICKET_ID" \
  || { echo "FATAL: audit row not visible — abort"; exit 1; }
```

---

## 3 — Generate the new KEK

The KEK is **32 bytes of CSPRNG output**, never a password-derived key.

```bash
# Generate raw 32-byte key
umask 077
openssl rand -out "$KEK_VAULT_DIR/$NEW_KEK_ID.raw" 32
test "$(stat -c %s "$KEK_VAULT_DIR/$NEW_KEK_ID.raw")" = "32" \
  || { echo "FATAL: generated KEK is not 32 bytes"; exit 1; }

# Encrypt the raw key with the operator GPG identity (vault is GPG-wrapped)
gpg --encrypt --armor --recipient "$OPERATOR_EMAIL" \
    --output "$KEK_VAULT_DIR/$NEW_KEK_ID.gpg" \
    "$KEK_VAULT_DIR/$NEW_KEK_ID.raw"

# Wipe the plaintext raw key — MUST happen before continuing
shred -u "$KEK_VAULT_DIR/$NEW_KEK_ID.raw"
test ! -e "$KEK_VAULT_DIR/$NEW_KEK_ID.raw" || { echo "FATAL: raw KEK still on disk"; exit 1; }
```

Record the new KEK fingerprint for the audit trail:

```bash
NEW_KEK_FPR=$(sha256sum "$KEK_VAULT_DIR/$NEW_KEK_ID.gpg" | awk '{print $1}')
echo "New KEK fingerprint: $NEW_KEK_FPR"
```

---

## 4 — Test-encrypt + test-decrypt (proof of viability)

**Forbidden:** flipping the `active.gpg` symlink before this round-trip succeeds. A bad KEK file would break every subsequent backup silently until the next drill.

```bash
# Round-trip test
echo "rotation-canary-$NEW_KEK_ID-$(date -u +%s)" > /tmp/canary.txt

"$BACKUP_TOOL" encrypt --kek "$KEK_VAULT_DIR/$NEW_KEK_ID.gpg" \
  --in /tmp/canary.txt --out /tmp/canary.enc --dek-out /tmp/canary.dek.enc

"$BACKUP_TOOL" decrypt --kek "$KEK_VAULT_DIR/$NEW_KEK_ID.gpg" \
  --in /tmp/canary.enc --dek /tmp/canary.dek.enc --out /tmp/canary.dec

diff -q /tmp/canary.txt /tmp/canary.dec \
  || { echo "FATAL: round-trip mismatch — DO NOT promote new KEK"; exit 1; }

shred -u /tmp/canary.txt /tmp/canary.enc /tmp/canary.dek.enc /tmp/canary.dec
```

If any line above fails: **stop**, delete `$KEK_VAULT_DIR/$NEW_KEK_ID.gpg`, return to step 3, do not continue.

---

## 5 — Promote: flip the `active.gpg` symlink atomically

```bash
# Atomic rename — never use cp + mv
ln -sfn "$NEW_KEK_ID.gpg" "$KEK_VAULT_ACTIVE_LINK.new"
mv -Tf  "$KEK_VAULT_ACTIVE_LINK.new" "$KEK_VAULT_ACTIVE_LINK"

# Verify
test "$(readlink "$KEK_VAULT_ACTIVE_LINK")" = "$NEW_KEK_ID.gpg" \
  || { echo "FATAL: symlink did not flip"; exit 1; }
```

---

## 6 — Take a fresh hot snapshot under the new KEK

A backup taken with the new KEK proves end-to-end rotation works **before** retention starts depending on it.

```bash
"$BACKUP_TOOL" snapshot \
  --tier 2 \
  --workspace ALL \
  --reason "post-rotation-canary" \
  --upload-region primary

"$BACKUP_TOOL" snapshot \
  --tier 2 \
  --workspace ALL \
  --reason "post-rotation-canary" \
  --upload-region dr
```

Verify both regions received the new tarball + `.key.enc` companion within **15 min** (per AT-BACKUP-02):

```bash
NOW=$(date -u +%s)
aws s3 ls "$OFFSITE_BUCKET"      --recursive | awk -v t=$((NOW-900)) '$1" "$2 ~ /^[0-9]/ && mktime($1" "$2) > t' | grep "post-rotation-canary" \
  || { echo "FATAL: primary upload missing"; exit 1; }
aws s3 ls "$OFFSITE_BUCKET_DR"   --recursive | awk -v t=$((NOW-900)) '$1" "$2 ~ /^[0-9]/ && mktime($1" "$2) > t' | grep "post-rotation-canary" \
  || { echo "FATAL: DR-region upload missing"; exit 1; }
```

---

## 7 — Move the old KEK into the 2-year overlap retention store

**Forbidden:** deleting the old KEK. Monthly-archive backups within the 2-year overlap window are encrypted with it and become **unrecoverable** if it is destroyed.

```bash
mkdir -p "$KEK_VAULT_RETIRED_DIR"
mv "$KEK_VAULT_DIR/$OLD_KEK_ID.gpg" "$KEK_VAULT_RETIRED_DIR/$OLD_KEK_ID.gpg"

# Stamp retirement metadata for the cleanup cron
RETIRE_AT=$(date -u +%s)
PURGE_AT=$((RETIRE_AT + 63072000))   # +730 days (2 years)
cat > "$KEK_VAULT_RETIRED_DIR/$OLD_KEK_ID.meta.json" <<EOF
{
  "kekId": "$OLD_KEK_ID",
  "retiredAt": $RETIRE_AT,
  "earliestPurgeAt": $PURGE_AT,
  "retiredByTicket": "$TICKET_ID",
  "retiredBy": "$OPERATOR_EMAIL",
  "successorKekId": "$NEW_KEK_ID"
}
EOF
```

The `wf-backup vault-cleanup` cron (runs daily) is the **only** thing allowed to remove a retired KEK, and only when `now() > earliestPurgeAt`. Do not invoke it manually.

---

## 8 — Close the audit trail

Emit the **completion** half of the rotation event so the monitoring dashboard's `oldest-active-KEK-age` metric resets.

```bash
"$AUDIT_TOOL" log \
  --code "SYSTEM.BACKUP_KEY_ROTATE" \
  --severity "warn" \
  --actor "$OPERATOR_EMAIL" \
  --ticket "$TICKET_ID" \
  --metadata "{\"reason\":\"$ROTATION_REASON\",\"oldKekId\":\"$OLD_KEK_ID\",\"newKekId\":\"$NEW_KEK_ID\",\"newKekFingerprint\":\"$NEW_KEK_FPR\",\"phase\":\"completed\",\"canarySnapshotsUploaded\":2}"
```

---

## 9 — Failure modes & rollback

| Failed step | Symptom | Rollback |
|---|---|---|
| Step 3 (generate) | `openssl rand` fails or wrong size | Delete `$NEW_KEK_ID.raw` and `.gpg`; abort; re-run. **Old KEK still active**, no impact. |
| Step 4 (round-trip) | Decrypt diff fails | Delete `$NEW_KEK_ID.gpg`; abort; investigate `wf-backup` build. **Old KEK still active**, no impact. |
| Step 5 (symlink flip) | Symlink missing or wrong target after `mv` | `ln -sfn "$OLD_KEK_ID.gpg" "$KEK_VAULT_ACTIVE_LINK"`; verify; emit `SYSTEM.BACKUP_KEY_ROTATE` with `phase=rolled-back`; file incident ticket. |
| Step 6 (canary snapshot) | Upload not visible in either region within 15 min | Investigate object-storage credentials; re-run `snapshot`; if persistent → roll symlink back to old KEK (step 5 inverse) and file P1 incident — backups are **not durable** under the new KEK. |
| Step 7 (move old) | `mv` fails / disk error | Restore original location: `mv "$KEK_VAULT_RETIRED_DIR/$OLD_KEK_ID.gpg" "$KEK_VAULT_DIR/$OLD_KEK_ID.gpg"`; do **not** delete the new KEK — both can coexist; file ticket to retry retirement. |
| **Suspected key compromise** mid-flight | Anything anomalous | Treat as P0: roll symlink to a freshly-generated emergency KEK, emit `SYSTEM.BACKUP_KEY_ROTATE` with `reason=suspected-compromise`, schedule out-of-band re-encrypt of all retained tarballs (separate runbook, not yet authored). |

---

## 10 — Post-rotation verification (next business day)

Run the standard backup-health probe:

```bash
"$BACKUP_TOOL" health-check --since "$(date -u -d '24 hours ago' +%FT%TZ)"
```

Expected output:
- All scheduled hot snapshots since the rotation timestamp succeeded.
- `oldestActiveKekAgeDays` ≤ 1.
- `retiredKeks` lists exactly one entry pointing at `$OLD_KEK_ID` with `earliestPurgeAt` ≈ now + 730 d.
- No `SYSTEM.BACKUP_DECRYPT_FAILED` rows in the audit log since rotation.

If any expectation fails: open a P1 ticket and re-read step 5–7.

---

## 11 — Post-mortem template

Even on a clean rotation, fill in the post-mortem template within **48 hours**:

> Post-rotation review template at `spec/99-operations/01-post-mortem-template.md` _(planned; not yet authored — see backup-key-rotation runbook backlog)_

Until the template exists, attach a short note to ticket `$TICKET_ID` listing:
- Wall-clock duration of each step
- Any deviation from this runbook
- Whether the next quarterly cadence date is correctly scheduled

---

## Acceptance criteria for this runbook

| ID | Given | When | Then |
|----|-------|------|------|
| AT-RUNBOOK-KEK-01 | A scheduled quarterly rotation | Operator follows steps 1–8 in order | Two `SYSTEM.BACKUP_KEY_ROTATE` audit rows are emitted (declared + completed); old KEK is in `retired/` with metadata; new KEK is symlinked active; two canary snapshots exist in both regions within 15 min (AT-BACKUP-02 satisfied for the new KEK). |
| AT-RUNBOOK-KEK-02 | Step 4 (round-trip) fails | Operator continues anyway | The runbook's pre-conditions (atomic `mv -Tf` + verification) prevent step 5 from succeeding silently. The promoted symlink would be detectably broken on the next backup attempt. |
| AT-RUNBOOK-KEK-03 | Step 7 is skipped (old KEK destroyed) | Restore is later attempted from a tarball encrypted with the old KEK | `wf-backup decrypt` fails with `KEK_NOT_FOUND`; restore runbook §6 ("Decrypt with operator-vault KEK") cannot proceed. **Forbidden by step 7.** |
| AT-RUNBOOK-KEK-04 | DR drill is overdue (>100 d) | Operator runs step 1 pre-flight | `wf-backup drill-status` exits non-zero; runbook aborts before any KEK is touched (per A-44 §monitoring "overdue >100d blocks releases"). |

---

## Cross-references

| Topic | Link |
|-------|------|
| Backup & DR policy SSOT (this runbook implements §5) | [`../../31-app/05-conventions/14-backup-and-dr-policy.md`](../../31-app/05-conventions/14-backup-and-dr-policy.md) |
| Sibling: DR-restore runbook (consumes the KEKs this runbook manages) | [`./01-disaster-recovery-restore.md`](./01-disaster-recovery-restore.md) |
| MFA TOTP-secret encryption (same KEK strategy, different scope) | [`../../31-app/05-conventions/12-mfa-policy.md`](../../31-app/05-conventions/12-mfa-policy.md) |
| Audit log policy (the `SYSTEM.BACKUP_KEY_ROTATE` code) | [`../../31-app/05-conventions/09-audit-log-policy.md`](../../31-app/05-conventions/09-audit-log-policy.md) |
| Operator runbooks index | [`./00-overview.md`](./00-overview.md) |

---

## Changelog

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-04-27 | Initial runbook authored as the second sibling under `23-operator-runbooks/`. Implements A-44 §5 Key-rotation requirement (90-day cadence, 2-year overlap retention, `SYSTEM.BACKUP_KEY_ROTATE` audit dual-emission). Covers happy path (steps 1–8), failure modes & rollback (§9), post-rotation verification (§10), 4 acceptance criteria. Atomic `mv -Tf` symlink flip + canary round-trip enforced before promotion. **Forbidden:** destroying retired KEKs before 2-year `earliestPurgeAt`. |
