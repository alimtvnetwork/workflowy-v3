# Backup & Disaster-Recovery Policy — SSOT

> **Version:** 1.0.0
> **Created:** 2026-04-26 (UTC+8)
> **Status:** Active — runtime-agnostic contract
> **Parent:** [`00-overview.md`](./00-overview.md)
> **Closes:** A-44 (backup & DR policy SSOT)
> **Companion:** [`09-audit-log-policy.md`](./09-audit-log-policy.md), [`13-data-export-policy.md`](./13-data-export-policy.md)

---

## Purpose

The plugin runs against SQLite databases bundled inside `wp-content/uploads/workflowy/`. Loss of a single host means **total data loss** unless backups exist, are off-site, are encrypted, and have been **proven restorable**.

This SSOT pins:

- What is backed up (and what isn't)
- RPO / RTO objectives per data class
- Schedule, retention, encryption, and off-site placement
- Restore procedure and **mandatory** quarterly drill
- Audit and alerting contract

Without this SSOT, an AI implementer will dump SQLite while writes are in flight (corrupt backup), forget the audit-chain integrity table, or store backups on the same disk as the live DB.

---

## 1 — Scope

### Included in backup

| Asset | Location | Why |
|-------|----------|-----|
| Root DB (`workflowy_root.sqlite`) | `wp-content/uploads/workflowy/` | Workspace + user + role data |
| Per-workspace App DBs (`workflowy_app_{wsId}.sqlite`) | `wp-content/uploads/workflowy/workspaces/` | Items, comments, mirrors, shares |
| Audit-log DB (`workflowy_audit.sqlite`) | `wp-content/uploads/workflowy/` | Hash-chained audit trail (per A-39) |
| File-attachment store (`uploads/`) | `wp-content/uploads/workflowy/files/` | User-uploaded files |
| Plugin config (`workflowy-options.json`) | `wp-content/workflowy-config/` | HMAC secret references (NOT the secrets themselves), feature flags |

### Explicitly excluded

| Asset | Reason |
|-------|--------|
| WordPress core MySQL (`wp_*` tables) | Owned by WP host's own backup; not the plugin's responsibility |
| Export artifacts (`workflowy-exports/`) | Re-generatable; 7-day TTL anyway (see A-43) |
| Session/token caches in transient store | Recreated on next login |
| `WP_AUTH_KEY` and other `wp-config.php` secrets | NEVER backed up alongside data — kept in operator's password vault |
| TLS certificates | WP host's responsibility |

> **Rule:** If a backup tarball ever contains `wp-config.php` or anything matching `/AUTH_KEY|SECRET|PASSWORD/i` outside an encrypted SQLite blob, that is a **P0 security incident**.

---

## 2 — RPO / RTO Objectives

| Data class | RPO (max data loss) | RTO (max time to restore) |
|------------|---------------------|---------------------------|
| **Tier 0** — Audit-log DB (compliance, hash chain) | **15 min** | **1 hour** |
| **Tier 1** — Root DB (auth, roles) | **15 min** | **1 hour** |
| **Tier 2** — App DBs (items, comments) | **1 hour** | **4 hours** |
| **Tier 3** — File attachments | **24 hours** | **24 hours** |
| **Tier 4** — Plugin config | **7 days** (changes rare) | **24 hours** |

These are operational SLOs, not contractual SLAs. They drive the schedule and the restore drill pass criteria.

---

## 3 — Backup Types & Schedule

| Type | Method | Frequency | Retention |
|------|--------|-----------|-----------|
| **Continuous WAL ship** | SQLite WAL file rsync (read-only, no `VACUUM` interference) | every **15 min** | 48 h on hot off-site |
| **Hot snapshot** | `sqlite3 .backup` API (online, consistent) | hourly | 7 days |
| **Daily full** | `sqlite3 .backup` + tar attachments | daily 03:00 host-local | 30 days |
| **Weekly archive** | Daily-full copy promoted | every Sunday | 12 weeks |
| **Monthly archive** | Weekly-archive copy promoted | first Sunday of month | 12 months |
| **Yearly archive** | Monthly-archive copy promoted | first Sunday of January | 7 years (audit floor) |

### Why `.backup` API and not file copy

A naive `cp workflowy_app.sqlite ./backup/` while a writer holds a transaction produces a **torn page** — the backup will fail integrity check. `sqlite3 .backup` (or PHP's `\SQLite3::backup()`) reads pages under a read transaction and is the **only sanctioned method**.

> **Rule:** No code path may copy a `*.sqlite` file via `copy()`, `cp`, or `rsync` for backup purposes. WAL ship is the sole exception (and is read-only by nature).

---

## 4 — Off-Site Placement

A backup that lives on the same disk as the primary is not a backup — it's a duplicate.

| Tier | Primary location | Required off-site location |
|------|------------------|----------------------------|
| WAL ship | `wp-content/workflowy-backups/wal/` | Object storage (S3-compatible) within **5 min** of write |
| Hot snapshot | `wp-content/workflowy-backups/hot/` | Object storage within **15 min** |
| Daily full | `wp-content/workflowy-backups/daily/` | Object storage within **1 h** + secondary cold-storage region |
| Weekly / Monthly / Yearly | (promoted from daily) | Object storage **two regions** + cold-storage tier |

### Region rule

Daily/Weekly/Monthly/Yearly backups MUST land in **at least two geographically separate regions** (e.g., `eu-west-1` AND `us-east-1`). A single-region cloud outage MUST NOT block restore.

### Object-storage requirements

| Property | Required value |
|----------|----------------|
| Bucket policy | Private — block all public access (deny-by-default) |
| Versioning | Enabled |
| Object lock / WORM | Enabled for monthly + yearly tiers (compliance) |
| Server-side encryption | AES-256 (SSE-S3 or SSE-KMS) |
| TLS in transit | TLS 1.2+; no plaintext upload |
| Lifecycle policy | Deletes match §3 retention exactly; no manual deletion below floors |

---

## 5 — Encryption

Every backup tarball is encrypted **before** leaving the host:

| Property | Value |
|----------|-------|
| Algorithm | AES-256-GCM (per-tarball random nonce) |
| Key derivation | HKDF from a backup-only KEK held in operator vault (NOT `WP_AUTH_KEY` — different blast radius) |
| Per-tarball DEK | Random 32 bytes; encrypted with KEK; stored alongside as `{TarballName}.key.enc` |
| Integrity | Tarball ends with SHA-256 of (plaintext-tar) embedded in GCM tag's authenticated-data |

### Key rotation

- Backup KEK rotates every **90 days**.
- Old KEK kept available for **2 years** (sufficient to restore any monthly-archive within retention).
- KEK rotation event is itself audited (`SYSTEM.BACKUP_KEY_ROTATE`).

> **Rule:** Server-side bucket encryption is **not enough** — backups MUST be client-side encrypted before upload. Object-storage encryption protects against bucket-misconfig, not against a stolen access key.

---

## 6 — Audit-Log Backup Special Handling

The audit-log DB carries the hash chain (per A-39). Backup MUST preserve chain integrity:

1. Backup MUST include the **last hash row** of the live DB AT the moment of `.backup` snapshot.
2. After restore, the verifier MUST be able to re-walk the chain from genesis to last-row and produce the same `IntegrityHash` as the live DB recorded.
3. WAL-ship of the audit DB is permitted but the daily full is **authoritative** for hash-chain restore (WAL alone cannot prove genesis).
4. Restoring an audit DB to a point earlier than the latest will trigger a `SYSTEM.AUDIT_CHAIN_REWIND` audit row at `fatal` severity on the next live write — operator MUST acknowledge in runbook.

---

## 7 — Restore Procedure

### Step-by-step (encoded as runbook in `docs/operations/restore.md` later)

1. **Declare** restore in operator runbook; create `RestoreOperation` audit row at `fatal`.
2. **Stop** the WordPress process for the workspace(s) affected (or full plugin if Tier-0/1).
3. **Choose source:** prefer most recent hot snapshot ≤ RPO; fall back to daily full.
4. **Download** tarball + `.key.enc` from off-site to a clean restore-staging directory.
5. **Decrypt** with operator-vault KEK; verify SHA-256 in GCM tag.
6. **`PRAGMA integrity_check`** against decrypted SQLite — MUST return `ok`.
7. For audit DB: **walk hash chain** from genesis to last row — MUST match recorded `IntegrityHash`.
8. **Replay WAL** files from after the snapshot timestamp up to the desired RPO point.
9. **Move** restored files into `wp-content/uploads/workflowy/`.
10. **Restart** plugin; observe `SYSTEM.RESTORE_COMPLETE` audit row.
11. **Notify** all workspace `Owner`s and `Admin`s by email of the restore window and any data loss.
12. **Post-mortem** within 7 days (linked from audit row).

### Forbidden during restore

- Concurrent writes to the live DB while WAL is being replayed.
- Skipping integrity check ("looks fine to me").
- Restoring a single workspace from a tarball that contains other workspaces (must be split first; no cross-workspace data leak).

---

## 8 — Mandatory Restore Drill

A backup that has never been restored is **not a backup**. The drill makes restore real:

| Property | Value |
|----------|-------|
| Cadence | **Quarterly** (4× per year) |
| Scope | Full Tier 0 + Tier 1 + at least 1 Tier 2 workspace |
| Target | Isolated staging environment (NOT production) |
| Pass criteria | All RTOs from §2 met; integrity check passes; audit chain re-verifies; sample item content matches |
| Failure handling | P1 incident; root cause within 7 days; next drill within 14 days |
| Audit row | `SYSTEM.RESTORE_DRILL_PASS` or `SYSTEM.RESTORE_DRILL_FAIL` at `warn`/`error` |
| Skip allowed? | **No.** Skipping a drill triggers `SYSTEM.RESTORE_DRILL_OVERDUE` at `error` after 100 days since last pass |

The drill is a **policy gate**, not a nice-to-have. Operators that miss two consecutive drills cannot ship to production until a passing drill is recorded.

---

## 9 — Monitoring & Alerting

| Signal | Threshold | Severity | Audit code |
|--------|-----------|----------|------------|
| WAL ship lag | > 10 min behind live | `warn` | `SYSTEM.BACKUP_LAG` |
| WAL ship failure | 3 consecutive failures | `error` | `SYSTEM.BACKUP_FAILURE` |
| Hourly snapshot missed | > 90 min since last successful snapshot | `error` | `SYSTEM.BACKUP_MISSED` |
| Daily full missed | > 26 h since last successful daily | `fatal` | `SYSTEM.BACKUP_DAILY_MISSED` |
| Off-site upload failure | > 30 min after local snapshot | `error` | `SYSTEM.BACKUP_OFFSITE_FAILURE` |
| Integrity check failure on backup | Immediate | `fatal` | `SYSTEM.BACKUP_CORRUPT` |
| Restore drill overdue | 100 days since last pass | `error` | `SYSTEM.RESTORE_DRILL_OVERDUE` |
| Restore drill executed | Any outcome | `warn`/`error` | `SYSTEM.RESTORE_DRILL_PASS`/`_FAIL` |
| Live restore initiated | Any | `fatal` | `SYSTEM.RESTORE_INITIATED` |
| Live restore complete | Any | `warn` | `SYSTEM.RESTORE_COMPLETE` |
| Backup KEK rotated | Any | `warn` | `SYSTEM.BACKUP_KEY_ROTATE` |
| Audit chain rewind detected | Any | `fatal` | `SYSTEM.AUDIT_CHAIN_REWIND` |

> All 12 codes added to the **v1.2.0 audit-log backfill batch** (combined: A-40 = 10, A-41 = 9, A-42 = 11, A-43 = 10, A-44 = 12 ⇒ **52 codes total**).

`fatal`-severity events MUST trigger an operator pager alert (PagerDuty / OpsGenie / equivalent). `error` events trigger ticket creation. `warn` events log only.

---

## 10 — Hygiene Gate G-28 (proposed)

| Property | Value |
|----------|-------|
| Gate ID | `G-28` |
| Script | `scripts/spec-hygiene/28-check-backup-policy-coverage.mjs` *(numeric prefix matches gate ID; original `18-` slot reserved for G-18 cycle-algorithm SQL drift check)* — algorithm SSOT: [`21-g28-backup-coverage-gate.md`](./21-g28-backup-coverage-gate.md) |
| Trigger | Pre-commit + CI |

**Checks:**

1. No source file uses `copy()`, `\file_put_contents()` with a source from `*.sqlite`, or shell `cp`/`rsync` of `*.sqlite` for backup purposes — only `Backup\SqliteBackup::dump()` (which wraps `\SQLite3::backup()`).
2. No tarball-creation code path skips `Crypto::aesGcmEncrypt()` before object-storage upload.
3. Object-storage client config has `'encryption' => 'AES256'`, `'acl' => 'private'`, and TLS endpoint.
4. No code path uploads `wp-config.php` or files matching `/auth_key|secret|password/i` to the backup bucket.
5. Restore code path performs `PRAGMA integrity_check` AND audit-chain re-walk before swapping live DB.
6. Quarterly drill scheduler exists in `Backup\DrillScheduler.php` with `cadence = 90 days`.
7. Schedule in §3 matches the cron entries shipped in the plugin install hook byte-for-byte.

---

## 11 — Acceptance Tests `AT-BACKUP-01..18`

| ID | Given | When | Then |
|----|-------|------|------|
| `AT-BACKUP-01` | Live workspace under heavy write load | Hot-snapshot fires | Backup completes; `PRAGMA integrity_check` returns `ok`; live writes uninterrupted |
| `AT-BACKUP-02` | Hot snapshot just completed | Off-site upload | Tarball arrives in object-storage region A within 15 min; encrypted at rest |
| `AT-BACKUP-03` | Daily full just completed | Off-site upload | Tarball arrives in regions A AND B within 1 h |
| `AT-BACKUP-04` | Backup tarball intercepted | Inspect | AES-256-GCM ciphertext; `*.key.enc` file present; SHA-256 in GCM tag |
| `AT-BACKUP-05` | Tarball decrypted with wrong KEK | Decrypt | GCM tag mismatch; abort; no plaintext written |
| `AT-BACKUP-06` | Audit DB hot snapshot taken | Restore + walk chain | Chain re-walks from genesis to last row; `IntegrityHash` matches |
| `AT-BACKUP-07` | Code attempts `copy('workflowy_app.sqlite', '/backup/...')` | G-28 runs | Gate fails with code 1; references `\SQLite3::backup()` requirement |
| `AT-BACKUP-08` | WAL ship lags 12 min | Monitor | `SYSTEM.BACKUP_LAG` audit at `warn` |
| `AT-BACKUP-09` | 3 consecutive WAL ship failures | Monitor | `SYSTEM.BACKUP_FAILURE` at `error`; ticket created |
| `AT-BACKUP-10` | 27 h since last daily full | Monitor | `SYSTEM.BACKUP_DAILY_MISSED` at `fatal`; pager alert |
| `AT-BACKUP-11` | Quarterly drill executed in staging | Drill completes within RTO §2 | `SYSTEM.RESTORE_DRILL_PASS` at `warn` |
| `AT-BACKUP-12` | 100 days since last drill pass | Cron runs | `SYSTEM.RESTORE_DRILL_OVERDUE` at `error`; CI release gate fails |
| `AT-BACKUP-13` | Drill restoring Tier 0 audit DB | Restore from earlier-than-latest snapshot | `SYSTEM.AUDIT_CHAIN_REWIND` at `fatal` on next live write; runbook acknowledgement required |
| `AT-BACKUP-14` | Live restore initiated | Audit | `SYSTEM.RESTORE_INITIATED` at `fatal`; pager alert |
| `AT-BACKUP-15` | Restore completes | Audit | `SYSTEM.RESTORE_COMPLETE` at `warn`; emails fired to all affected `Owner`/`Admin` |
| `AT-BACKUP-16` | Backup tarball contains `wp-config.php` | G-28 runs | Gate fails; treated as P0 security finding |
| `AT-BACKUP-17` | Backup KEK rotates (90-day cadence) | Rotation runs | `SYSTEM.BACKUP_KEY_ROTATE` at `warn`; new tarballs use new KEK; previous KEK retained 2 years |
| `AT-BACKUP-18` | Object-storage bucket policy audit | Inspect | Versioning ON; public-access blocked; WORM on monthly+yearly; lifecycle matches §3 |

---

## 12 — Cross-References

| Reference | Location |
|-----------|----------|
| Parent overview | [`00-overview.md`](./00-overview.md) |
| Audit-log SSOT (hash chain, RPO Tier 0) | [`09-audit-log-policy.md`](./09-audit-log-policy.md) |
| Data-export policy (artifacts excluded from backup) | [`13-data-export-policy.md`](./13-data-export-policy.md) |
| MFA policy (TOTP secret encryption — same KEK strategy) | [`12-mfa-policy.md`](./12-mfa-policy.md) |
| Session/token lifecycle | [`11-session-token-lifecycle.md`](./11-session-token-lifecycle.md) |
| Role-escalation policy | [`10-role-escalation-policy.md`](./10-role-escalation-policy.md) |
| Error catalogue | [`../../03-error-manage/02-error-architecture/05-response-envelope/05-error-code-catalogue.md`](../../03-error-manage/02-error-architecture/05-response-envelope/05-error-code-catalogue.md) |

---

## 13 — Keywords

`backup` · `disaster-recovery` · `dr` · `rpo` · `rto` · `wal-ship` · `sqlite-backup` · `off-site` · `kek` · `restore-drill` · `worm` · `G-28`

---

## 14 — Change Log

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-04-26 | Initial SSOT — closes A-44. 5 backup tiers (Audit/Root/App/Files/Config) with RPO 15min→7d / RTO 1h→24h, 6 backup types (WAL-ship 15min / hot 1h / daily / weekly / monthly / yearly 7y), `\SQLite3::backup()` API mandatory (no `cp`/`copy()`), client-side AES-256-GCM with operator-vault KEK (90-day rotation, 2-yr overlap), two-region off-site placement with WORM + versioning + lifecycle, audit-chain re-walk required on restore, **mandatory quarterly restore drill** (overdue >100d blocks releases), 12-signal monitoring with pager alerts on `fatal`, hygiene gate **G-28**, 18 ATs `AT-BACKUP-01..18`, 12 new audit codes for v1.2.0 batch (now **52 total** across A-40+A-41+A-42+A-43+A-44). |
| 1.0.1 | 2026-04-27 | §10 path correction — implementation slot moved from `18-` (reserved for G-18 cycle-algorithm SQL drift check) to `28-` (matches gate ID). Algorithm SSOT linked: [`21-g28-backup-coverage-gate.md`](./21-g28-backup-coverage-gate.md). **Follow-up required:** add a "WP Hook" column to §3's "Backup Types & Schedule" table (one canonical hook name per row: `workflowy_wal_ship`, `workflowy_hot_snap`, `workflowy_daily_full`, `workflowy_weekly_full`, `workflowy_monthly_full`, `workflowy_yearly_full`) — precondition for axis 7 implementation; see Edge Case 7 in the algorithm spec. |
