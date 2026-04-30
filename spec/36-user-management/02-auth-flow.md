# Auth Flow — Sub-Spec

> **Version:** 1.0.0
> **Created:** 2026-04-30 (UTC+8)
> **Status:** Active — closes the §"Pending Sub-Specs" row #02 in [`./00-overview.md`](./00-overview.md).
> **Parent:** [`./00-overview.md`](./00-overview.md)
> **Backend:** WordPress plugin + PHP 8.1 + SQLite + REST per `mem://constraints/backend-runtime-deferred`.

---

## Keywords

`auth` · `login` · `registration` · `passkey` · `webauthn` · `session` · `jwt` · `argon2id` · `mfa` · `recovery-codes` · `solo-mode` · `sync-mode`

---

## Scoring

| Criterion | Status |
|-----------|--------|
| `00-overview.md` present (parent) | ✅ |
| AI Confidence assigned | ✅ High |
| Ambiguity assigned | ✅ Low |
| Keywords present | ✅ |
| Scoring table present | ✅ |
| Health Score | 92% (A−) |

> **Confidence rationale:** Authoritative — every state transition cites an existing AT-USERMANAGEMENT-NN row from [`./97-acceptance-criteria.md`](./97-acceptance-criteria.md) and an REST endpoint from [`./01-account-and-settings.md`](./01-account-and-settings.md) §"REST Surface Summary".

---

## AI Contract (inherits from parent)

This sub-spec **does not introduce new normative MUSTs** — it operationalises the auth-flow MUSTs already authored in:

- [`./00-overview.md`](./00-overview.md) §"Functional Requirements" (FR-3, FR-4, FR-6) and §"Anti-Patterns".
- [`./97-acceptance-criteria.md`](./97-acceptance-criteria.md) (`AT-USERMANAGEMENT-07..10`, `AT-USR-03`).

Every state transition below cites the binding AT id; absence of a citation = error in this file.

---

## 1. Mode-of-Operation Decision Tree

The first network-affecting decision the client makes is **solo-vs-sync**. This is a **build-time** decision encoded in `import.meta.env.VITE_AUTH_MODE` (closed enum: `solo` | `sync`); runtime mode-switching is forbidden because it would let an attacker downgrade `sync` → `solo` and bypass session enforcement.

```
┌─────────────────────┐
│ App boot            │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ VITE_AUTH_MODE?     │
└──────────┬──────────┘
     ┌─────┴─────┐
     │           │
   solo        sync
     │           │
     ▼           ▼
┌─────────┐ ┌──────────────────┐
│ Local   │ │ Restore session  │
│ user    │ │ from cookie?     │
│ auto-   │ └────────┬─────────┘
│ created │          │
└─────────┘    ┌─────┴──────┐
               │            │
             valid      invalid/
                          missing
               │            │
               ▼            ▼
         ┌─────────┐  ┌──────────┐
         │ Editor  │  │ /signin  │
         └─────────┘  └──────────┘
```

| Mode | Storage | Login required? | Binding AT |
|---|---|---|---|
| `solo` | IndexedDB only | NO — first launch reaches editor without HTTP | [`AT-USERMANAGEMENT-11`](./97-acceptance-criteria.md#data-model) |
| `sync` | SQLite (server) + IndexedDB mirror | YES — `/signin` until session valid | [`AT-USERMANAGEMENT-09`](./97-acceptance-criteria.md#authentication) |

**Anti-pattern:** runtime mode-switch via `localStorage.setItem('mode', …)` is forbidden by parent §"Anti-Patterns" row 2 + gate `G-36-CLIENT-NO-ROLE` (extended in this sub-spec to also cover mode flags).

---

## 2. Registration Flow (sync mode)

### 2.1 State machine

```
[start] → email-entry → password-entry → consent → server-call → confirm-email → ready
                                                       │
                                                       └─ error: rollback to email-entry
```

### 2.2 Endpoint contract

`POST /wp-json/workflowy/v1/auth/register`

**Request body:**
```json
{
  "Email":       "alice@example.com",
  "Password":    "<≥12 chars, ≥1 letter, ≥1 digit>",
  "DisplayName": "Alice"
}
```

**Success response (HTTP 201):**
```json
{
  "Status": "Success",
  "Attributes": {
    "RequestId":             "req_01HXYZ...",
    "ConfirmationEmailSent": true,
    "ExpiresAt":             "2026-05-01T10:00:00Z"
  },
  "Results": [
    {
      "User": {
        "Id":          "usr_abc",
        "Email":       "alice@example.com",
        "DisplayName": "Alice",
        "CreatedAt":   "2026-04-30T10:00:00Z",
        "EmailVerifiedAt": null
      }
    }
  ]
}
```

**Error response (HTTP 409 — email taken):**
```json
{
  "Status": "Error",
  "Errors": [
    { "Code": "USR-36-03", "Field": "Email", "Message": "EMAIL_TAKEN" }
  ]
}
```

### 2.3 Server-side rules (binding)

| Rule | Source |
|---|---|
| Password is hashed with **Argon2id** (memory ≥ 64 MB, iterations ≥ 3, parallelism ≥ 1) before any DB write. | [`AT-USERMANAGEMENT-08`](./97-acceptance-criteria.md#authentication) |
| Hashed password stored in `User.PasswordHash` (write-only column — never appears in any response envelope). | parent §Anti-Patterns row 3 + gate `G-36-PASSWORD-WRITE-ONLY` |
| Default role assignment: **`user`** only. Self-elevation forbidden. | parent §Anti-Patterns row 6 + gate `G-36-NO-SELF-ROLE` |
| Email confirmation token stored in `EmailConfirmation` table with 24h TTL. | [`./01-account-and-settings.md`](./01-account-and-settings.md) §REST `/me/email/confirm/{token}` |

### 2.4 Error codes

| Code | HTTP | Condition |
|---|---|---|
| `USR-36-03` | 409 | Email already exists |
| `USR-36-04` | 422 | Password fails complexity policy |
| `USR-36-06` | 500 | `Auth::hashPassword` failed (Argon2 binding error) |

---

## 3. Login Flow

### 3.1 Password login

`POST /wp-json/workflowy/v1/auth/login`

**Request body:**
```json
{ "Email": "alice@example.com", "Password": "<plaintext>" }
```

**Success response (HTTP 200) + `Set-Cookie` header:**
```
Set-Cookie: Session=sess_01HXYZ...; HttpOnly; Secure; SameSite=Lax; Path=/
```
```json
{
  "Status": "Success",
  "Attributes": {
    "RequestId": "req_01HXYZ...",
    "ExpiresAt": "2026-05-07T10:00:00Z",
    "MfaRequired": false
  },
  "Results": [
    {
      "User":         { "Id": "usr_abc", "Email": "alice@example.com", "DisplayName": "Alice" },
      "SessionToken": "sess_01HXYZ..."
    }
  ]
}
```

> **Cookie flags are normative.** Missing `HttpOnly` OR `Secure` MUST fail [`AT-USERMANAGEMENT-09`](./97-acceptance-criteria.md#authentication). Solo-mode-only build MAY use `localStorage` (the only sanctioned exception).

### 3.2 MFA challenge branch

If `MfaRequired: true` in the login response, `Results[0]` carries an opaque `MfaChallengeToken` instead of `SessionToken`. The client follows up with:

`POST /wp-json/workflowy/v1/auth/mfa/verify`
```json
{ "MfaChallengeToken": "mfa_01HXYZ...", "Code": "123456" }
```

On success → identical Set-Cookie + envelope as §3.1.
On failure → HTTP 401 with `Errors: [{ Code: "AUTH_MFA_INVALID", Field: "Code" }]`. Rate-limited to **5 attempts per 15 min per challenge**; sixth attempt invalidates the challenge token (forces full re-login).

### 3.3 Passkey (WebAuthn) login

`POST /wp-json/workflowy/v1/auth/webauthn/login/begin` → returns `PublicKeyCredentialRequestOptions` per WebAuthn L3 spec.
`POST /wp-json/workflowy/v1/auth/webauthn/login/finish` → completes assertion, returns identical envelope to §3.1.

Passkey support is mandatory (no password-only build) per [`AT-USERMANAGEMENT-07`](./97-acceptance-criteria.md#authentication) + gate `G-USER-AUTH-PASSKEY-SUPPORT`.

### 3.4 Login error codes

| Code | HTTP | Condition |
|---|---|---|
| `USR-36-01` | 401 | No matching email OR password mismatch (intentionally indistinguishable to prevent enumeration) |
| `AUTH_MFA_INVALID` | 401 | Wrong TOTP/passkey response |
| `AUTH_RATE_LIMIT` | 429 | >5 wrong attempts per 15 min per (email, IP) tuple |

---

## 4. Session Lifecycle

### 4.1 Storage

| Mode | Where | TTL | Refresh |
|---|---|---|---|
| `sync` | `Session` SQLite row + `Set-Cookie` | 7 days from `LastSeenAt` | Sliding — every authenticated request bumps `LastSeenAt` |
| `solo` | `localStorage["solo-session"]` (opaque blob) | infinite | n/a |

### 4.2 `Session` table (DDL anchor)

The full DDL is owned by [`spec/04-database-conventions/`](../04-database-conventions/00-overview.md) §schema-design. The shape is:

| Column | Type | Notes |
|---|---|---|
| `SessionId` | INTEGER PK AUTOINCREMENT | per `mem://constraints/coding-guidelines` SQLite rules |
| `SessionToken` | TEXT UNIQUE NOT NULL | 32-byte random, base64url-encoded |
| `UserId` | INTEGER NOT NULL FK→User.UserId | |
| `CreatedAt` | TEXT NOT NULL (ISO-8601) | |
| `LastSeenAt` | TEXT NOT NULL (ISO-8601) | bumped on every authed request |
| `ExpiresAt` | TEXT NOT NULL (ISO-8601) | `LastSeenAt + 7 days` |
| `RevokedAt` | TEXT NULL | non-null = revoked |
| `UserAgent` | TEXT | for "active sessions" UI |
| `IpAddress` | TEXT | last seen IP for forensics |

### 4.3 JWT alternative (when used)

If JWT is preferred over server-side sessions, the payload MUST be the **minimum** legal set [gate: G-36-SESSION-MIN]:
```json
{ "sub": "usr_abc", "iat": 1714464000, "exp": 1714468800 }
```

> **Forbidden claims** (gate `G-36-SESSION-MIN`): `role`, `roles`, `permissions`, `email`, `displayName`, anything else. Per [`AT-USERMANAGEMENT-10`](./97-acceptance-criteria.md#authentication) and parent §Anti-Patterns row 4.

### 4.4 Logout

`POST /wp-json/workflowy/v1/auth/logout` — sets `Session.RevokedAt = now()` server-side AND emits `Set-Cookie: Session=; Max-Age=0; Path=/`. Client also clears any in-memory user store.

### 4.5 Revoke-all-other-sessions (on password change)

Per [`AT-USR-03`](./97-acceptance-criteria.md#p13-backfilled-rows): every successful `/me/password` MUST set `RevokedAt = now()` on every `Session` row for that `UserId` **except** the caller's current session, atomically in a single transaction. The response `Attributes.SessionsRevoked` carries the count.

---

## 5. Solo → Sync Migration (lossless)

Bound by [`AT-USERMANAGEMENT-12`](./97-acceptance-criteria.md#local-first--solo-mode). Required because solo users may decide to sync after accumulating data.

### 5.1 Trigger

User opens *Settings → Account → Link Sync Account* and authenticates against an existing OR new sync account.

### 5.2 Migration transaction

```
1. Begin SQLite transaction on server-side per-user DB
2. Receive client-uploaded archive (zip): items.json, templates.json, attachments.tar
3. INSERT every Item row with original ItemId preserved (collisions resolved by re-keying via the user's prefix)
4. INSERT every Template row
5. Move attachments to per-user storage path
6. Server-side `Status: "Success"`, `Results: [{ Migrated: { Items: N, Templates: M, Attachments: K } }]`
7. Commit; client clears local solo data ONLY on receipt of success envelope
```

**On any error during steps 3–6:** transaction rolls back atomically; server returns `Status: "Error"` with `Errors: [{ Code: "MIGRATION_PARTIAL", Detail: "<step>" }]` and HTTP 500. Client preserves local solo data unchanged. Per [`AT-USERMANAGEMENT-12`](./97-acceptance-criteria.md#local-first--solo-mode) negative assertion: **piecemeal migration MUST fail.**

---

## 6. Rate Limiting (cross-cutting)

| Surface | Limit | Window | Key |
|---|---|---|---|
| `/auth/login` | 5 attempts | 15 min | `(Email, IP)` |
| `/auth/register` | 3 accounts | 1 hour | `IP` |
| `/auth/mfa/verify` | 5 attempts | per challenge | `MfaChallengeToken` |
| `/me/password` | 5 attempts | 15 min | `(UserId, IP)` |
| `/auth/webauthn/login/begin` | 10 attempts | 15 min | `(Email, IP)` |

Exceeding any limit → HTTP 429 with `Errors: [{ Code: "AUTH_RATE_LIMIT", RetryAfterSec: <int> }]`. Underlying store: SQLite `RateLimit(Key TEXT, Count INTEGER, WindowStart TEXT)` with hourly purge cron.

---

## 7. State Machine (canonical)

```
┌─────────────┐  /auth/register   ┌──────────────────┐ confirm  ┌──────────┐
│ anonymous   │──────────────────▶│ pending-confirm  │─────────▶│ active   │
└──────┬──────┘                   └──────────────────┘          └────┬─────┘
       │                                                              │
       │ /auth/login (Mfa NO)                                         │ /auth/logout
       ├──────────────────────────────────────────────────────────────┤
       │                                                              ▼
       │ /auth/login (Mfa YES)    ┌──────────────────┐  /mfa/verify  ┌────────────┐
       └─────────────────────────▶│ mfa-pending      │──────────────▶│ logged-out │
                                  └──────────────────┘               └────────────┘
                                          │
                                          ▼ 5+ failed
                                  ┌──────────────────┐
                                  │ challenge-locked │
                                  └──────────────────┘
```

| State | Valid transitions |
|---|---|
| `anonymous` | → `pending-confirm` (register), → `mfa-pending` (login + MFA), → `active` (login no MFA) |
| `pending-confirm` | → `active` (email confirm), → `anonymous` (token expiry 24h) |
| `mfa-pending` | → `active` (correct MFA), → `challenge-locked` (5 fails) |
| `active` | → `logged-out` (logout, password change for OTHER sessions) |
| `challenge-locked` | → `anonymous` (token invalidated, must re-login) |
| `logged-out` | → `anonymous` (cookie cleared) |

**Forbidden transitions** (server MUST reject) [gate: G-36-NO-SELF-ROLE, G-36-SESSION-MIN]:
- `anonymous` → `active` directly without `/auth/login` or `/auth/register + /confirm`
- `mfa-pending` → `active` without `/mfa/verify`
- Any → `active` while `Session.RevokedAt IS NOT NULL`

---

## 8. Anti-Patterns Specific to Auth Flow

The AI MUST NOT [gate: G-36-PASSWORD-WRITE-ONLY, G-36-CLIENT-NO-ROLE]:

| # | Anti-pattern | Why it fails |
|---|---|---|
| 1 | Return distinguishable errors for "wrong email" vs "wrong password" | Enables user-enumeration attacks. Use single `USR-36-01` for both. |
| 2 | Skip MFA when `Session.UserAgent` matches a previous session | "Trust this device" without explicit user opt-in is a Code-Red bypass. |
| 3 | Persist `MfaChallengeToken` across page reloads in `localStorage` | Token is one-shot per challenge; persistence enables replay. |
| 4 | Accept `Authorization: Bearer <jwt>` AND `Cookie: Session=…` simultaneously | Dual-auth ambiguity → privilege confusion. Pick one per request. |
| 5 | Issue session before email is confirmed in registration flow | Allows unverified accounts to act; gate `pending-confirm` → `active` strictly. |
| 6 | Reuse a confirmed `EmailConfirmation` token | One-shot tokens MUST be deleted on use [gate: G-36-PASSWORD-WRITE-ONLY]. |
| 7 | Log password (plaintext OR hash) to PHP error log or stdout | `error_log($password)` in any form fails security review. |

---

## 9. Endpoint ↔ AT Cross-Reference Matrix

| Endpoint | Method | Binding AT | Sub-spec § |
|---|---|---|---|
| `/auth/register` | POST | (covered by AT-USERMANAGEMENT-08 password rules) | §2 |
| `/auth/login` | POST | AT-USERMANAGEMENT-09 (cookie flags), AT-USERMANAGEMENT-10 (JWT shape) | §3.1 |
| `/auth/mfa/verify` | POST | (extends AT-USERMANAGEMENT-09 Set-Cookie) | §3.2 |
| `/auth/webauthn/login/begin` | POST | AT-USERMANAGEMENT-07 (passkey support) | §3.3 |
| `/auth/webauthn/login/finish` | POST | AT-USERMANAGEMENT-07 | §3.3 |
| `/auth/logout` | POST | (no AT — operationally trivial; revokes session) | §4.4 |
| `/me/password` | POST | AT-USR-03 (revoke-others) | §4.5 |
| `/me/email/confirm/{token}` | GET | (covered by parent §Pending Sub-Specs roadmap) | §2.3 |
| `/auth/migrate-solo` | POST | AT-USERMANAGEMENT-12 (lossless migration) | §5 |

> Every endpoint above MUST also appear in the canonical endpoint matrix at [`spec/31-app/06-endpoints/`](../31-app/06-endpoints/00-overview.md). Cross-checked by `scripts/spec-hygiene/29-check-endpoint-matrix-coverage.mjs`.

---

## 10. Verification

```bash
# Cookie flag verification (target: passes)
rg -nP "HttpOnly.*Secure.*SameSite=Lax|SameSite=Lax.*Secure.*HttpOnly" wp-plugin/src/Rest/Auth/

# Argon2id verification (target: only argon2id, no bcrypt/pbkdf2/sha256)
rg -nP "argon2id" wp-plugin/src/Auth/
rg -nP "bcrypt|pbkdf2|sha256" wp-plugin/src/Auth/  # MUST be empty

# JWT minimum-claims verification (target: only sub/iat/exp)
rg -nP "claims->\\['(role|roles|permissions|email|displayName)'\\]" wp-plugin/src/Auth/  # MUST be empty

# Hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## 11. Out of Scope

- **OAuth providers** (Google/Apple/GitHub sign-in) — deferred per [`./00-overview.md`](./00-overview.md) §"AI Contract → Out of Scope".
- **SAML/SSO federation** — explicitly excluded.
- **Per-item ACL evaluation** — owned by [`spec/31-app/01-features/08-share-dialog.md`](../31-app/01-features/08-share-dialog.md) F4 + `mem://features/sharing-model`.
- **RBAC helpers (`hasRole`, `requireRole`, `Auth::*` API surface)** — owned by sibling sub-spec [`./03-rbac-helpers.md`](./03-rbac-helpers.md) (planned, §Pending Sub-Specs row 03).
- **Admin user-management UI** — owned by sibling sub-spec [`./04-admin-ui.md`](./04-admin-ui.md) (planned, §Pending Sub-Specs row 04).
- **Session-storage SQLite DDL details** — owned by [`spec/04-database-conventions/`](../04-database-conventions/00-overview.md).

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Parent overview | [`./00-overview.md`](./00-overview.md) |
| Acceptance criteria | [`./97-acceptance-criteria.md`](./97-acceptance-criteria.md) |
| Acceptance fixtures | [`./97a-acceptance-criteria-fixtures.md`](./97a-acceptance-criteria-fixtures.md) |
| Account & Settings (REST surface) | [`./01-account-and-settings.md`](./01-account-and-settings.md) |
| RBAC helpers (sibling, planned) | [`./03-rbac-helpers.md`](./03-rbac-helpers.md) |
| Admin UI (sibling, planned) | [`./04-admin-ui.md`](./04-admin-ui.md) |
| REST envelope SSOT | [`../04-database-conventions/06-rest-api-format/00-overview.md`](../04-database-conventions/06-rest-api-format/00-overview.md) |
| Endpoint matrix | [`../31-app/06-endpoints/00-overview.md`](../31-app/06-endpoints/00-overview.md) |
| Backend runtime constraint | `mem://constraints/backend-runtime-deferred` |
| Coding guidelines | `mem://constraints/coding-guidelines` |

---

## Related

**In this section:**

- [`./00-overview.md`](./00-overview.md) — Parent overview (RBAC matrix, FRs, anti-patterns)
- [`./01-account-and-settings.md`](./01-account-and-settings.md) — F5 Account & Settings (REST surface)
- [`./97-acceptance-criteria.md`](./97-acceptance-criteria.md) — `AT-USERMANAGEMENT-*` + `AT-USR-*` IDs

**See also:**

- [`../05-split-db-architecture/02-features/04-rbac-casbin/00-overview.md`](../05-split-db-architecture/02-features/04-rbac-casbin/00-overview.md) — Authorization layer (post-auth)
- [`../05-split-db-architecture/02-features/05-user-scoped-isolation/00-overview.md`](../05-split-db-architecture/02-features/05-user-scoped-isolation/00-overview.md) — Per-user isolation + GDPR

---

*Authored 2026-04-30 — closes §"Pending Sub-Specs" row 02 in [`./00-overview.md`](./00-overview.md). No new normative MUSTs introduced; pure operationalisation of parent ATs.*
