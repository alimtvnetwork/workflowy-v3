# User Management — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 16 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-USERMANAGEMENT-01` … `AT-USERMANAGEMENT-16`

---

## Criteria

### Data model

| ID | Criterion | Source |
|----|-----------|--------|
| AT-USERMANAGEMENT-01 | `User` table MUST be singular PascalCase with `UserId` PK as `INTEGER PRIMARY KEY AUTOINCREMENT` (FR-1) — UUID PKs are forbidden because INTEGER PKs enable B-tree index lookups in O(log n) with 8-byte keys vs UUID's 16-byte string comparison on the per-user shard key. [gate: G-USER-PK-INTEGER-AUTOINC] | [`00-overview.md`](./00-overview.md) |
| AT-USERMANAGEMENT-02 | Roles MUST live in a separate `UserRole` table linking `UserId` ↔ `Role` enum (FR-2); storing role columns directly on `User` is a Code-Red privilege-escalation bug per the project memory rule. [gate: G-USER-ROLES-SEPARATE-TABLE] | [`00-overview.md`](./00-overview.md), [`mem://constraints/coding-guidelines`](mem://constraints/coding-guidelines) |
| AT-USERMANAGEMENT-03 | The `Role` enum MUST be exactly `User`, `Editor`, `Admin`; adding new roles MUST update the enum + capability matrix + this AT — magic-string roles are forbidden. [gate: G-USER-ROLE-ENUM-CLOSED] | [`00-overview.md`](./00-overview.md) |

### Capability matrix

| ID | Criterion | Source |
|----|-----------|--------|
| AT-USERMANAGEMENT-04 | The capability matrix in `00-overview.md` MUST be the SSOT — code MUST NOT introduce ad-hoc capabilities not listed; new capabilities require updating the matrix first. [gate: G-USER-CAPABILITY-MATRIX-SSOT] | [`00-overview.md`](./00-overview.md) |
| AT-USERMANAGEMENT-05 | All RBAC checks MUST go through the central `hasRole(userId, role)` helper (FR-6) — inline role comparisons (`if (user.role === 'Admin')`) are forbidden because they're un-auditable. [gate: G-USER-HASROLE-CENTRAL] | [`00-overview.md`](./00-overview.md) |
| AT-USERMANAGEMENT-06 | `hasRole` MUST be the security-definer pattern: it MUST query the `UserRole` table (NOT a session cache) for privilege-elevation checks, even though session cache may be used for UI rendering. [gate: G-USER-HASROLE-SECURITY-DEFINER] | [`00-overview.md`](./00-overview.md) |

### Authentication

| ID | Criterion | Source |
|----|-----------|--------|
| AT-USERMANAGEMENT-07 | Auth MUST support password + optional WebAuthn passkey (FR-3); password-only auth without a documented passkey upgrade path fails review. [gate: G-USER-AUTH-PASSKEY-SUPPORT] | [`00-overview.md`](./00-overview.md) |
| AT-USERMANAGEMENT-08 | Passwords MUST be hashed with Argon2id (memory ≥ 64 MB, iterations ≥ 3, parallelism ≥ 1) — bcrypt/PBKDF2/SHA-256 are forbidden as they're below the 2026 baseline. [gate: G-USER-PWHASH-ARGON2ID] | [`00-overview.md`](./00-overview.md) |
| AT-USERMANAGEMENT-09 | Session tokens MUST live in `httpOnly` + `Secure` + `SameSite=Lax` cookies when sync is enabled (FR-4); `localStorage` fallback is allowed ONLY in solo (no-sync) mode. [gate: G-USER-SESSION-COOKIE-FLAGS] | [`00-overview.md`](./00-overview.md), [`../05-split-db-architecture/02-features/05-user-scoped-isolation/97-acceptance-criteria.md`](../05-split-db-architecture/02-features/05-user-scoped-isolation/97-acceptance-criteria.md) |
| AT-USERMANAGEMENT-10 | JWTs (if used) MUST carry only the `userId` reference (NOT user data); embedding role/permissions in JWT claims is a Code-Red privilege-escalation bug. [gate: G-USER-JWT-USERID-ONLY] | [`00-overview.md`](./00-overview.md) |

### Local-first / solo mode

| ID | Criterion | Source |
|----|-----------|--------|
| AT-USERMANAGEMENT-11 | Solo mode MUST work with NO server login required; forcing login for offline use is a Code-Red product-promise violation. [gate: G-USER-SOLO-NO-LOGIN] | [`00-overview.md`](./00-overview.md) |
| AT-USERMANAGEMENT-12 | Switching from solo → sync mode MUST migrate the local user data into the synced account WITHOUT data loss; partial migration is a Code-Red data-loss bug. [gate: G-USER-SOLO-TO-SYNC-LOSSLESS] | [`00-overview.md`](./00-overview.md) |

### Admin operations

| ID | Criterion | Source |
|----|-----------|--------|
| AT-USERMANAGEMENT-13 | Admin UI MUST support invite, deactivate, role-change (FR-5); deletion MUST be a separate flow gated by an additional confirmation (NOT folded into deactivate). [gate: G-USER-ADMIN-DELETE-SEPARATE] | [`00-overview.md`](./00-overview.md) |
| AT-USERMANAGEMENT-14 | Every admin action MUST emit an entry to the activity feed (audit-of-the-audit); silent admin actions are a Code-Red audit-integrity bug. [gate: G-USER-ADMIN-ACTION-AUDITED] | [`00-overview.md`](./00-overview.md), [`../34-activity-feed/97-acceptance-criteria.md`](../34-activity-feed/97-acceptance-criteria.md) |

### Sharing & GDPR

| ID | Criterion | Source |
|----|-----------|--------|
| AT-USERMANAGEMENT-15 | Per-item sharing permissions MUST follow the sharing-model memory; admin override of share permissions MUST be logged AND user-notified — silent override is a Code-Red trust bug. [gate: G-USER-ADMIN-OVERRIDE-NOTIFIED] | [`00-overview.md`](./00-overview.md), [`mem://features/sharing-model`](mem://features/sharing-model) |
| AT-USERMANAGEMENT-16 | A user MUST be able to: (a) export all their data as a single archive, (b) delete their account in one operation that purges per-user DB + sessions + feedback + activity events. Piecemeal deletion fails GDPR. [gate: G-USER-GDPR-EXPORT-DELETE] | [`00-overview.md`](./00-overview.md), [`../05-split-db-architecture/02-features/05-user-scoped-isolation/97-acceptance-criteria.md`](../05-split-db-architecture/02-features/05-user-scoped-isolation/97-acceptance-criteria.md) |

---

## Fixtures

I/O fixtures for `AT-USERMANAGEMENT-01..16` live in [`97a-acceptance-criteria-fixtures.md`](./97a-acceptance-criteria-fixtures.md).

---

## Verification

```bash
# Inline role-string scan (should be empty)
rg -nP "user\.role\s*===\s*'(User|Editor|Admin)'" src/

# hasRole helper exists
rg -nP "function hasRole\(" src/

# Argon2id config
rg -nP "argon2id" src/

# Hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../31-app/01-features/15-roles-and-permissions.md`](../31-app/01-features/15-roles-and-permissions.md) — Capability matrix SSOT
- [`../05-split-db-architecture/02-features/04-rbac-casbin/97-acceptance-criteria.md`](../05-split-db-architecture/02-features/04-rbac-casbin/97-acceptance-criteria.md) — Authorization layer
- [`../05-split-db-architecture/02-features/05-user-scoped-isolation/97-acceptance-criteria.md`](../05-split-db-architecture/02-features/05-user-scoped-isolation/97-acceptance-criteria.md) — Per-user isolation + GDPR

---

*Curated 2026-04-25 — closes batch-16 item 5. Replaces v1.0.0 scaffold.*


---

## P13 backfilled rows

> Originally auto-appended by [`scripts/spec-hygiene/45-append-p13-orphan-stubs.mjs`](../../scripts/spec-hygiene/45-append-p13-orphan-stubs.mjs) on 2026-04-28 to close orphan AT citations surfaced by [`40-generate-contract-json.mjs`](../../scripts/spec-hygiene/40-generate-contract-json.mjs). Backfilled with concrete Given/When/Then + JSON envelope on 2026-04-29 under task #44 (F-AUDIT-25 burndown). Do **not** delete a row without first removing every citation of its ID elsewhere in spec/.

### AT-USR-01 — Settings panel auto-save

**Given** an authenticated user has the Settings panel open at `/account` and edits the `displayName` field from `"Ada"` to `"Ada L."`.
**When** the input loses focus (blur) OR 800ms elapse since last keystroke (whichever first).
**Then** the client issues `POST /wp-json/workflowy/v1/me` with `{"DisplayName":"Ada L."}` and the server returns `Status: "ok"`, `Attributes: {"DisplayName":"Ada L.","UpdatedAt":"<ISO8601>"}`, `Results: null` per the envelope SSOT in [`../04-database-conventions/06-rest-api-format/`](../04-database-conventions/06-rest-api-format/). The change MUST be reflected in the in-memory user store within one render frame [gate: G-USER-AUTOSAVE-OPTIMISTIC]; on HTTP 5xx the previous value is restored and an error toast is shown.

**Verifying test:** `AT-USR-01-settings-auto-save.spec.ts` (Vitest, frontend) — asserts blur+debounce semantics; PHPUnit companion `AT_USR_01_settings_auto_save_test.php` asserts the REST handler envelope.

### AT-USR-03 — Set password flow

**Given** an authenticated user opens the "Set Password" dialog on `/account/security`.
**When** they submit `{currentPassword: "<current>", newPassword: "<new>", confirmPassword: "<new>"}` with `<new>` satisfying the corpus password policy (min 12 chars, ≥1 letter, ≥1 digit).
**Then** the client issues `POST /wp-json/workflowy/v1/me/password` and the server returns `Status: "ok"`, `Attributes: {"PasswordChangedAt":"<ISO8601>","SessionsRevoked":<int>}`, `Results: null`. All other active sessions for the user MUST be revoked atomically [gate: G-USER-PWCHANGE-REVOKES-SESSIONS]. On `currentPassword` mismatch the server returns `Status: "error"` with `Errors: [{Code: "AUTH_INVALID_CURRENT_PASSWORD", Field: "currentPassword"}]` and HTTP 401; rate-limited to 5 attempts per 15min per user per IP.

**Verifying test:** `AT-USR-03-set-password.spec.ts` + `AT_USR_03_set_password_test.php`.

### AT-USR-09 — Restore from backup

**Given** an authenticated user has at least one backup snapshot listed under `GET /me/backups` (returning `Results: [{Id, CreatedAt, ItemCount, SizeBytes}, …]`).
**When** they trigger restore for snapshot `{id}` via `POST /wp-json/workflowy/v1/me/backups/{id}/restore`.
**Then** the server (a) creates an auto-safety snapshot of current state (recorded as `SafetySnapshotId` in the response), (b) replaces the user's item tree with the snapshot contents within a single SQLite transaction, and (c) returns `Status: "ok"`, `Attributes: {"RestoredFromId":"<id>","SafetySnapshotId":"<id>","ItemsRestored":<int>,"RestoredAt":"<ISO8601>"}`, `Results: null`. Concurrent edits during restore MUST be rejected with `Status: "error"`, `Errors: [{Code: "RESTORE_IN_PROGRESS"}]` and HTTP 409 [gate: G-USER-RESTORE-REJECTS-CONCURRENT].

**Verifying test:** `AT-USR-09-restore-backup.spec.ts` + `AT_USR_09_restore_backup_test.php`.

### AT-USR-11 — Theme selection persistence

**Given** an authenticated user is on `/account/appearance` with the current theme `"system"`.
**When** they select theme `"dark"` from the radio group.
**Then** the client issues `POST /wp-json/workflowy/v1/me` with `{"Theme":"dark"}`, the server returns `Status: "ok"`, `Attributes: {"Theme":"dark","UpdatedAt":"<ISO8601>"}`, `Results: null`, and the value MUST persist across browser reloads AND propagate to other tabs of the same user via the SSE channel `/stream/user/{id}` (per ADR-0025) within ≤2s [gate: G-USER-THEME-SSE-CROSSTAB]. Allowed values: `"light"`, `"dark"`, `"system"`; any other value returns HTTP 400 with `Errors: [{Code: "INVALID_THEME", Field: "Theme"}]`.

**Verifying test:** `AT-USR-11-theme-persistence.spec.ts` (asserts SSE cross-tab propagation) + `AT_USR_11_theme_persistence_test.php`.

### AT-USR-14 — Referrals

**Given** an authenticated user opens `/account/referrals`.
**When** the page mounts and issues `GET /wp-json/workflowy/v1/me/referrals`.
**Then** the server returns `Status: "ok"`, `Attributes: {"ReferralUrl":"https://workflowy.example/r/<userSlug>","ReferralCode":"<8-char base62>"}`, `Results: [{Email, JoinedAt, Status: "pending"|"active"|"churned"}, …]` where `Results` is empty on first load. The `ReferralUrl` MUST be deterministic per user and remain stable across sessions [gate: G-USER-REFERRAL-DETERMINISTIC]; the `ReferralCode` MUST NOT collide across users (enforced by SQLite UNIQUE constraint on `referral_codes.code`) [gate: G-USER-REFERRAL-UNIQUE].

**Verifying test:** `AT-USR-14-referrals.spec.ts` + `AT_USR_14_referrals_test.php`.

### AT-USR-15 — Help / Report a bug

**Given** an authenticated user clicks "Report a Bug" from the Help menu.
**When** they submit `{Title: "<≤120 chars>", Body: "<≤4000 chars>", Severity: "low"|"medium"|"high", IncludeDiagnostics: true|false}` via `POST /wp-json/workflowy/v1/feedback`.
**Then** the server (a) creates a feedback row in `wp_workflowy_feedback`, (b) when `IncludeDiagnostics: true` attaches the user's last-50 SSE-event log + browser/OS UA string (no item content), and (c) returns `Status: "ok"`, `Attributes: {"FeedbackId":"<uuid>","CreatedAt":"<ISO8601>"}`, `Results: null`. Rate-limited to 10 submissions per user per hour; on cap returns HTTP 429 with `Errors: [{Code: "FEEDBACK_RATE_LIMIT","RetryAfterSec":<int>}]`.

**Verifying test:** `AT-USR-15-feedback-submit.spec.ts` + `AT_USR_15_feedback_submit_test.php`.
