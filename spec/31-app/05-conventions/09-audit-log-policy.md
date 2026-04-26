# Audit-Log Policy (SSOT)

> **Version:** 1.0.0
> **Updated:** 2026-04-26
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

> Adding a new action requires (a) a new row above, (b) a translation key under `errors.audit.*` in i18n table, and (c) an acceptance test under `97-acceptance-criteria.md` (`AT-AUDIT-*`).

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
