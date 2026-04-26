# Audit-Log Policy (SSOT)

> **Version:** 1.2.1
> **Updated:** 2026-04-26 — v1.2.0 backfill of 52 actions emitted by sibling SSOTs A-40..A-44 (role-escalation, session/token, MFA, export, backup/DR). Prior: v1.0.0 initial 22 actions.
> **Scope:** Defines what the WordPress-plugin backend MUST persist as security/compliance audit records, how long, with what integrity guarantees, and who may query. Distinct from `spec/34-activity-feed/` (user-visible undo log) and from `Logger::*` (operational logs).

---

## 1 · Why this policy exists

Three audiences consume backend events; each needs a different stream:

| Audience | Stream | Spec |
|---|---|---|
| End-user ("who edited this?") | **Activity feed** — 30-day, item-scoped, undo-friendly | `spec/34-activity-feed/` |
| Operator ("server is on fire") | **Operational log** — `Logger::*`, ephemeral, free-form | `spec/02-coding-guidelines/` |
| Owner / compliance ("prove what happened") | **Audit log** — append-only, integrity-checked, long-retention | **this file** |

Conflating them violates least-privilege (operators see PII), bloats activity-feed pagination, and prevents tamper detection. The three streams MUST be physically separate tables.

---

## 2 · Audit Event Taxonomy

Every audit record has the shape:

```json
{
  "Id": "<ULID>",
  "OccurredAt": "2026-04-26T10:00:00Z",
  "ActorOwnerId": "<OwnerId | 'system'>",
  "ActorIp": "<sha256-hash>",
  "ActorUserAgent": "<string, truncated 256>",
  "Category": "AUTH" | "AUTHZ" | "DATA" | "SHARING" | "ADMIN" | "POLICY" | "SYSTEM",
  "Action": "<dot.path verb>",
  "TargetType": "item" | "user" | "role" | "share" | "config" | "self",
  "TargetId": "<string|null>",
  "OutcomeIsSuccess": true,
  "ErrorCode": "ERR_OK | ERR_*",
  "Metadata": { "...": "category-specific JSON, scrubbed" },
  "IntegrityHash": "<sha256(prevHash || canonicalJson(thisRecord without IntegrityHash))>"
}
```

### 2.1 · Categories & required actions (SSOT — append-only)

| Category | Action | Trigger |
|---|---|---|
| `AUTH` | `auth.login.success` | Successful login |
| `AUTH` | `auth.login.failure` | Wrong password / expired token |
| `AUTH` | `auth.logout` | Explicit logout |
| `AUTH` | `auth.session.expired` | Idle / absolute timeout |
| `AUTH` | `auth.password.changed` | Self-service or admin reset |
| `AUTHZ` | `authz.role.granted` | `Auth::grantRole` succeeds |
| `AUTHZ` | `authz.role.revoked` | `Auth::revokeRole` succeeds |
| `AUTHZ` | `authz.denied` | `hasRole` returns false on protected route |
| `DATA` | `data.export.requested` | User triggers data export |
| `DATA` | `data.export.delivered` | Export download URL issued |
| `DATA` | `data.delete.account` | Account deletion executed |
| `DATA` | `data.bulk.delete` | Multi-select delete ≥ 25 items |
| `SHARING` | `sharing.public.enabled` | Item made publicly readable |
| `SHARING` | `sharing.public.disabled` | Public link revoked |
| `SHARING` | `sharing.invite.sent` | User invited |
| `SHARING` | `sharing.invite.accepted` | Invitee joined |
| `SHARING` | `sharing.invite.revoked` | Invite revoked |
| `ADMIN` | `admin.config.changed` | Plugin config modified |
| `ADMIN` | `admin.user.impersonated.start` / `.end` | Support impersonation |
| `POLICY` | `policy.rate.limited` | 429 emitted (sampled — see §6.3) |
| `POLICY` | `policy.retention.purge` | Trash retention sweep ran |
| `SYSTEM` | `system.startup` / `system.shutdown` | Plugin lifecycle |
| `SYSTEM` | `system.integrity.breach` | Hash chain verification failed |

#### v1.2.0 backfill — actions emitted by sibling SSOTs

> Added 2026-04-26. These actions are emitted by the policies in `10-role-escalation-policy.md`, `11-session-token-lifecycle.md`, `12-mfa-policy.md`, `13-data-export-policy.md`, and `14-backup-and-dr-policy.md`. Sibling SSOTs reference these in `DOT.UPPER_CASE` shorthand for readability; **the canonical wire format is `dot.lower.case` as listed below** — emitters MUST normalize via `Audit::action()` helper before write. G-23 enforces.

##### Role-escalation (A-40 → 10 actions)

| Category | Action | Trigger |
|---|---|---|
| `AUTHZ` | `authz.role.request` | L1+ grant requested (`AUTHZ.ROLE_REQUEST`) |
| `AUTHZ` | `authz.role.approve` | Approver signs off (`AUTHZ.ROLE_APPROVE`) |
| `AUTHZ` | `authz.role.deny` | Manual deny (`AUTHZ.ROLE_DENY`) |
| `AUTHZ` | `authz.role.deny.timeout` | 30-min approval window expired (`AUTHZ.ROLE_DENY_TIMEOUT`) |
| `AUTHZ` | `authz.role.grant` | Grant activated (`AUTHZ.ROLE_GRANT`) — at `warn` |
| `AUTHZ` | `authz.role.renew` | L1 standing-Admin renewal (`AUTHZ.ROLE_RENEW`) |
| `AUTHZ` | `authz.role.expire` | Cron sweep / request-time expiry (`AUTHZ.ROLE_EXPIRE`) |
| `AUTHZ` | `authz.role.revoke` | Manual revoke (`AUTHZ.ROLE_REVOKE`) — at `warn` |
| `AUTHZ` | `authz.owner.transfer` | Atomic ownership swap (`AUTHZ.OWNER_TRANSFER`) — at `error` |
| `AUTHZ` | `authz.break.glass` | Owner single-actor emergency grant (`AUTHZ.BREAK_GLASS`) — at `fatal` |

##### Session/token lifecycle (A-41 → 9 actions)

| Category | Action | Trigger |
|---|---|---|
| `AUTH` | `auth.token.refresh` | Successful RefreshToken rotation (sampled 1:100, see §6.3) |
| `AUTH` | `auth.logout.all` | "Logout from all devices" (`AUTH.LOGOUT_ALL`) — at `warn` |
| `AUTH` | `auth.session.evict` | 11th login evicts oldest session (`AUTH.SESSION_EVICT`) |
| `AUTHZ` | `authz.refresh.reuse` | Rotated RefreshToken replayed → family revoked (`AUTHZ.REFRESH_REUSE`) — at `error` |
| `SYSTEM` | `system.secret.rotate` | HMAC signing secret rotated (`SYSTEM.SECRET_ROTATE`) — at `warn` |
| `AUTH` | `auth.token.stale` | AccessToken jti added to TRL on role change (sampled 1:50) |
| `AUTH` | `auth.session.idle.expire` | Idle-timeout fired |
| `AUTH` | `auth.session.absolute.expire` | Absolute-timeout fired |
| `AUTH` | `auth.sse.ticket.consume` | SSE one-shot ticket redeemed (sampled 1:100) |

##### MFA policy (A-42 → 11 actions)

| Category | Action | Trigger |
|---|---|---|
| `AUTH` | `auth.mfa.verify.success` | Sign-in MFA challenge passed (`AUTH.MFA_VERIFY_SUCCESS`) |
| `AUTH` | `auth.mfa.verify.failure` | Wrong code / expired challenge (`AUTH.MFA_VERIFY_FAILURE`) — at `warn` |
| `AUTH` | `auth.mfa.stepup.success` | Step-up challenge passed (`AUTH.MFA_STEPUP_SUCCESS`) |
| `AUTH` | `auth.mfa.stepup.failure` | Step-up challenge failed (`AUTH.MFA_STEPUP_FAILURE`) — at `warn` |
| `AUTH` | `auth.mfa.enroll` | First-factor enrollment complete (`AUTH.MFA_ENROLL`) |
| `AUTH` | `auth.mfa.factor.add` | Additional factor added (`AUTH.MFA_FACTOR_ADD`) |
| `AUTH` | `auth.mfa.factor.remove` | Factor removed (`AUTH.MFA_FACTOR_REMOVE`) — at `warn` |
| `AUTH` | `auth.mfa.recovery` | Recovery code consumed (`AUTH.MFA_RECOVERY`) — at `warn` |
| `AUTH` | `auth.mfa.recovery.regen` | Recovery codes regenerated (`AUTH.MFA_RECOVERY_REGEN`) — at `warn` |
| `AUTH` | `auth.mfa.lockout` | 20 failures in 1 h → 30 min lockout (`AUTH.MFA_LOCKOUT`) — at `error` |
| `AUTHZ` | `authz.webauthn.counter.rollback` | WebAuthn signCount ≤ stored (`AUTHZ.WEBAUTHN_COUNTER_ROLLBACK`) — at `error` |

##### Data-export policy (A-43 → 10 actions)

| Category | Action | Trigger |
|---|---|---|
| `DATA` | `data.export.request` | Job created (`EXPORT.REQUEST`) — supersedes legacy `data.export.requested` |
| `DATA` | `data.export.start` | Worker picks up job (`EXPORT.START`) |
| `DATA` | `data.export.ready` | Artifact built and encrypted (`EXPORT.READY`) — supersedes legacy `data.export.delivered` |
| `DATA` | `data.export.failure` | Build/encrypt error (`EXPORT.FAILURE`) — at `warn` |
| `DATA` | `data.export.download` | Signed URL consumed (`EXPORT.DOWNLOAD`) |
| `DATA` | `data.export.download.throttled` | Per-IP 20 MB/s exceeded (`EXPORT.DOWNLOAD_THROTTLED`) — at `warn` |
| `DATA` | `data.export.expired` | TTL elapsed before download (`EXPORT.EXPIRED`) |
| `DATA` | `data.export.purge` | File zero-filled and unlinked (`EXPORT.PURGE`) |
| `DATA` | `data.export.account.self` | GDPR Art. 20 self-export (`EXPORT.ACCOUNT_SELF`) — at `warn` |
| `POLICY` | `policy.export.scraping.suspected` | ≥50 distinct owners exported / 24 h (`EXPORT.SCRAPING_SUSPECTED`) — at `error` |

##### Backup & DR policy (A-44 → 12 actions)

| Category | Action | Trigger |
|---|---|---|
| `SYSTEM` | `system.backup.lag` | WAL ship > 10 min behind (`SYSTEM.BACKUP_LAG`) — at `warn` |
| `SYSTEM` | `system.backup.failure` | 3 consecutive WAL ship failures (`SYSTEM.BACKUP_FAILURE`) — at `error` |
| `SYSTEM` | `system.backup.missed` | > 90 min since last hot snapshot (`SYSTEM.BACKUP_MISSED`) — at `error` |
| `SYSTEM` | `system.backup.daily.missed` | > 26 h since last daily full (`SYSTEM.BACKUP_DAILY_MISSED`) — at `fatal` |
| `SYSTEM` | `system.backup.offsite.failure` | Local snapshot ok but off-site upload failed (`SYSTEM.BACKUP_OFFSITE_FAILURE`) — at `error` |
| `SYSTEM` | `system.backup.corrupt` | Tarball integrity check failed (`SYSTEM.BACKUP_CORRUPT`) — at `fatal` |
| `SYSTEM` | `system.backup.key.rotate` | 90-day KEK rotation event (`SYSTEM.BACKUP_KEY_ROTATE`) — at `warn` |
| `SYSTEM` | `system.restore.drill.pass` | Quarterly drill met all RTOs (`SYSTEM.RESTORE_DRILL_PASS`) — at `warn` |
| `SYSTEM` | `system.restore.drill.fail` | Quarterly drill failed (`SYSTEM.RESTORE_DRILL_FAIL`) — at `error` |
| `SYSTEM` | `system.restore.drill.overdue` | > 100 days since last pass — release gate (`SYSTEM.RESTORE_DRILL_OVERDUE`) — at `error` |
| `SYSTEM` | `system.restore.initiated` | Live (production) restore started (`SYSTEM.RESTORE_INITIATED`) — at `fatal` |
| `SYSTEM` | `system.restore.complete` | Live restore finished, users emailed (`SYSTEM.RESTORE_COMPLETE`) — at `warn` |
| `SYSTEM` | `system.audit.chain.rewind` | Audit DB restored to point earlier than latest; first live write detects rewind (`SYSTEM.AUDIT_CHAIN_REWIND`) — at `fatal` |

##### Patch additions (v1.2.0 → emitted by A-41 but missed in initial backfill)

| Category | Action | Trigger |
|---|---|---|
| `AUTH` | `auth.password.change` | Password update committed; revokes all sessions (`AUTH.PASSWORD_CHANGE`) — at `warn` |
| `ADMIN` | `admin.user.disable` | Operator disables account; revokes all tokens (`ADMIN.USER_DISABLE`) — at `warn` |
| `ADMIN` | `admin.workspace.delete` | Operator deletes workspace; revokes scoped tokens (`ADMIN.WORKSPACE_DELETE`) — at `warn` |

> **Deprecation:** legacy actions `data.export.requested` and `data.export.delivered` (v1.0.0) are superseded by `data.export.request` and `data.export.ready` respectively. v1.0.0 names remain accepted by the verifier through **2027-04-26** (one-year overlap), then rejected by G-23.

#### Shorthand → canonical normalization rules

The `Audit::action()` PHP helper resolves `DOT.UPPER_CASE` shorthand to the canonical wire form before the `INSERT`. The mapping is **not** a blind `strtolower` + `tr_._.` because some short prefixes expand:

| Shorthand prefix | Canonical prefix | Example |
|---|---|---|
| `EXPORT.*` | `data.export.*` | `EXPORT.READY` → `data.export.ready` |
| `EXPORT.SCRAPING_SUSPECTED` | `policy.export.scraping.suspected` | special-case, single rule |
| `MFA.*` (if used) | `auth.mfa.*` | reserved — no current usage |
| All others | dot-lower with `_` → `.` | `AUTH.LOGIN_SUCCESS` → `auth.login.success` |

G-23 verifies every `Audit::action(<shorthand>)` call resolves to a row in §2.1; unmapped shorthand fails CI.

> Adding a new action requires (a) a new row in the appropriate sub-table above, (b) a translation key under `errors.audit.*` in i18n table, and (c) an acceptance test under `97-acceptance-criteria.md` (`AT-AUDIT-*`).

### 2.2 · Forbidden categories

The following events MUST NOT be written to the audit log (they belong in the activity feed or operational log):

- Item content edits (title / note / type changes) — activity feed
- Drag-reorder operations — activity feed
- Search queries — operational log only, never persisted with PII
- SSE keepalive / poll metrics — operational log only

---

## 3 · Retention

| Category | Minimum retention | Maximum retention | Purge mechanism |
|---|---|---|---|
| `AUTH`, `AUTHZ`, `ADMIN` | **365 days** | 730 days | Daily cron on day 731 |
| `DATA`, `SHARING` | **365 days** | 730 days | Daily cron on day 731 |
| `POLICY`, `SYSTEM` | **90 days** | 180 days | Daily cron on day 181 |

Rules:

1. **Floor is mandatory.** Records younger than the minimum MUST NOT be deleted, even on owner request — answer `ERR_RETENTION_PROTECTED` (HTTP 409).
2. **Ceiling is mandatory.** Records older than the maximum MUST be deleted within 24 h of the cron schedule. No "indefinite" retention.
3. **Account deletion** purges all records whose `ActorOwnerId == deletedOwnerId` **after the floor expires**, never sooner.
4. The purge job emits a single `policy.retention.purge` event summarising counts per category — it does NOT delete itself.

---

## 4 · PII Scrubbing

### 4.1 · Always scrubbed before write

| Field | Treatment |
|---|---|
| Raw IP address | SHA-256 with daily-rotated salt → 64-hex; original never stored |
| Email addresses inside `Metadata` | Replaced with `<email:sha256>` |
| User-agent | Truncated to 256 chars, no parsing |
| Item content snapshots | **Forbidden** in audit log — store only `TargetId` |
| Search query strings | **Forbidden** in audit log |

### 4.2 · Salt rotation

- Salt lives in the WP-options table key `riseup_audit_ip_salt_<YYYYMMDD>`.
- Rotated every 24 h at 00:00 UTC by the same cron that runs purges.
- Old salts retained for 14 days to allow same-IP correlation within a 2-week window; deleted on day 15.
- After day 15, IP correlation across that boundary is intentionally impossible. This is a feature, not a bug.

### 4.3 · Why hash, not encrypt?

Encryption requires a key, which itself becomes a compliance liability. Hashing with a rotating salt gives same-day correlation for incident response while making post-rotation re-identification computationally infeasible.

---

## 5 · Integrity Guarantees

### 5.1 · Hash chain

Each row stores `IntegrityHash = SHA256(prevRow.IntegrityHash || canonicalJson(thisRow without IntegrityHash))`.

- The first row of each calendar UTC day uses the previous day's last hash as `prev`. The genesis row uses 64 zero-bytes.
- Canonical JSON: PHP `JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRESERVE_ZERO_FRACTION` with **alphabetically sorted keys**. Identical encoding rules MUST be used by the verifier.
- Verification job runs nightly and on-demand via `EP-AUDIT-VERIFY` (§7). On failure it emits `system.integrity.breach` and locks new writes until an operator clears the alert.

### 5.2 · Append-only enforcement

- The `audit_log` SQLite table has no `UPDATE` or `DELETE` triggers; the PHP DAO calls only `INSERT` and `SELECT`.
- The purge cron is the **only** writer with `DELETE` privilege and uses a separate DB role (`audit_purge`).
- Backup procedure (out of scope here) MUST snapshot before purge.

### 5.3 · No row mutation

If a write is wrong (e.g. classification error), the correct procedure is to write a **second row** with `Action = "system.audit.correction"` and `Metadata.correctsId = "<originalId>"`. The original row is never edited.

---

## 6 · Sampling & Volume Controls

### 6.1 · Hard quotas (per `ActorOwnerId`)

| Limit | Value | Behaviour on breach |
|---|---|---|
| Audit writes per minute | 600 | Subsequent writes coalesced (see §6.2) |
| Audit storage per owner | 250 MB | Reject with `ERR_LIMIT_EXCEEDED`; oldest-purgeable-first |

### 6.2 · Coalescing

When the per-minute quota is exceeded for a single `(ActorOwnerId, Action)` pair, identical events MUST be merged into a single row with `Metadata.coalescedCount = <n>` and `Metadata.coalescedWindowEnd` set to the last suppressed event's timestamp. The first event in the window is preserved verbatim.

### 6.3 · Sampling

Only the `policy.rate.limited` action is sampled — write 1 in 10 by default; sample rate configurable via `riseup_audit_sample_rate.policy.rate.limited` in WP options. Every other action is recorded 1:1.

---

## 7 · Query API

Audit data is read-only for end-users. Three endpoints:

| Endpoint ID | Method | Path | Required role |
|---|---|---|---|
| `EP-AUDIT-LIST` | GET | `/wp-json/riseup/v1/audit` | `audit.read` |
| `EP-AUDIT-EXPORT` | POST | `/wp-json/riseup/v1/audit/export` | `audit.export` |
| `EP-AUDIT-VERIFY` | POST | `/wp-json/riseup/v1/audit/verify` | `audit.admin` |

### 7.1 · Filters (`EP-AUDIT-LIST`)

`from`, `to` (ISO 8601, max 31-day window), `category`, `action`, `actorOwnerId`, `targetId`, `outcomeIsSuccess`. Pagination via the universal envelope; default `PerPage = 50`, max 200.

### 7.2 · Export (`EP-AUDIT-EXPORT`)

Asynchronous — returns `EP-EXPORT-JOB` envelope, delivers a signed download URL via `data.export.delivered` event when ready. Format: NDJSON, gzip-compressed, includes the integrity hash chain.

### 7.3 · Verify (`EP-AUDIT-VERIFY`)

Recomputes hash chain across an `OccurredAt` range. Returns `OutcomeIsSuccess: false` on the first mismatch with `Metadata.firstBreachAt` and `Metadata.expectedHash`.

### 7.4 · Roles required

| Role | `audit.read` | `audit.export` | `audit.admin` |
|---|---|---|---|
| `owner` | ✅ (own records only) | ✅ (own records only) | ❌ |
| `admin` | ✅ (all in workspace) | ✅ (all in workspace) | ❌ |
| `super-admin` | ✅ | ✅ | ✅ |

> Self-record visibility means an `owner` always sees their own audit trail — required for personal-data-access compliance — but never another user's.

---

## 8 · Failure Modes

| Failure | Required behaviour |
|---|---|
| DB write fails | Block the originating request with `ERR_AUDIT_WRITE_FAILED` (HTTP 500) **only** for AUTH / AUTHZ / ADMIN categories. For DATA / SHARING / POLICY / SYSTEM, log to operational log and continue (best-effort), but increment `audit_drops_total` metric. |
| Integrity breach detected | Lock all `audit_log` writes via `riseup_audit_locked` flag; surface `ERR_AUDIT_LOCKED` on every audited action; emit `system.integrity.breach`. Only super-admin can unlock after manual review. |
| Salt rotation fails | Reuse previous day's salt; emit `system.salt.rotation.failed`; alert. Never write unsalted IPs. |
| Quota exceeded | See §6.1. |

---

## 9 · Gate G-23 (Audit-Log Drift)

| Gate ID | Trigger | Action |
|---|---|---|
| **G-23** | A handler that calls `Auth::*`, `Sharing::*`, or `Admin::*` mutation methods but does NOT call `AuditLog::write(...)` in the same code path | CI fails with the offending file:line list |

Implementation: `scripts/spec-hygiene/13-audit-log-coverage-audit.mjs`. Registered in `02-ci-quality-gates.md`.

---

## 10 · Frontend Contract

- The frontend MUST NOT attempt to write audit events directly. All audit writes happen server-side as side-effects of authenticated mutations.
- The frontend MAY query `EP-AUDIT-LIST` for the user's own records and render them under Settings → Security → Activity.
- Audit query responses MUST be cached for at most 60 s (audit data must always look fresh).

---

## 11 · Acceptance Tests

See `spec/31-app/05-conventions/97-acceptance-criteria.md` §AUDIT for `AT-AUDIT-01..15`.

---

## 12 · Changelog

| Version | Date | Change |
|---|---|---|
| 1.0.0 | 2026-04-26 | Initial SSOT — taxonomy of 22 audit actions across 7 categories, 365/90-day retention floors, SHA-256 + rotating-salt PII scrubbing, hash-chain integrity, three-endpoint query API, gate G-23. |
| 1.2.0 | 2026-04-26 | Backfill of **52 new actions** emitted by sibling SSOTs A-40..A-44: 10 role-escalation, 9 session/token, 11 MFA, 10 export, 12 backup/DR. Total taxonomy now **74 actions** across 7 categories. Documented `DOT.UPPER_CASE` shorthand vs canonical `dot.lower.case` wire format with `Audit::action()` normalizer. Deprecated `data.export.requested` / `data.export.delivered` with one-year overlap to 2027-04-26. |
| 1.2.1 | 2026-04-26 | Cross-reference audit patch: registered 4 missed actions referenced by sibling SSOTs — `system.audit.chain.rewind` (A-44), `auth.password.change` / `admin.user.disable` / `admin.workspace.delete` (A-41). Added explicit shorthand→canonical normalization rules table covering `EXPORT.*` → `data.export.*` ambiguity and the special-case `EXPORT.SCRAPING_SUSPECTED` → `policy.export.*`. Total taxonomy now **78 actions**. |
