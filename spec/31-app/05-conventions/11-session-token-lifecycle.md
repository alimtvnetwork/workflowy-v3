# Session & Token Lifecycle — SSOT

> **Version:** 1.0.0
> **Created:** 2026-04-26 (UTC+8)
> **Status:** Active — runtime-agnostic contract
> **Parent:** [`00-overview.md`](./00-overview.md)
> **Closes:** A-41 (session/token lifecycle SSOT)
> **Companion:** [`09-audit-log-policy.md`](./09-audit-log-policy.md), [`10-role-escalation-policy.md`](./10-role-escalation-policy.md)

---

## Purpose

WordPress provides cookies; the WorkFlowy plugin layers a **typed token system** on top for REST + SSE channels. This file is the single source of truth for:

- Token kinds and what each one authorizes
- Issuance, refresh, rotation, and revocation flow
- Idle vs. absolute timeouts
- Server-side `TokenRevocationList` semantics
- Session ↔ token ↔ user invariants

Without this SSOT, AI implementers will re-invent JWT lifetimes, leak refresh tokens to JS, or skip rotation on privilege change.

---

## 1 — Token Kinds

| Kind | Purpose | Lifetime | Storage (client) | Storage (server) | Sent on every request? |
|------|---------|----------|-------------------|-------------------|------------------------|
| **WPSession** | WordPress login cookie (`wordpress_logged_in_*`) | Per WP `auth_cookie_expiration` filter (default 14 d) | `HttpOnly` cookie | WP `usermeta` `session_tokens` | Yes (browser) |
| **AccessToken** | Bearer for `/wp-json/workflowy/v1/*` REST | **15 minutes** (idle) / **8 hours** (absolute) | Memory only — never `localStorage` / `sessionStorage` | Stateless (HMAC-signed); fingerprint kept in `TokenRevocationList` only on revoke | Yes, `Authorization: Bearer …` |
| **RefreshToken** | Mint a new `AccessToken` | **7 days** (idle) / **30 days** (absolute) | `HttpOnly` `Secure` `SameSite=Strict` cookie at path `/wp-json/workflowy/v1/auth/refresh` | `RefreshTokenStore` row keyed by opaque ID + SHA-256(secret) | Only on refresh endpoint |
| **SSEToken** | Single-use ticket for `EventSource` connection | **30 seconds** to connect; channel lives until `AccessToken` expiry | URL query param `?ticket=…` | `SseTicketStore` (one-shot, deleted on first use) | No (used once) |
| **CsrfToken** | Double-submit cookie for state-changing forms | Bound to `WPSession` lifetime | Readable cookie + `X-WF-CSRF` header | Stateless HMAC of session ID + secret | Yes (browser, on POST/PUT/DELETE) |

> **Forbidden:** `localStorage`, `sessionStorage`, or `IndexedDB` for any token. `RefreshToken` MUST NEVER be readable by JS.

---

## 2 — Token Format

| Token | Encoding | Claims / fields |
|-------|----------|-----------------|
| `AccessToken` | Compact JWT (HS256) | `iss="workflowy"`, `sub=UserId`, `wsp=WorkspaceId`, `iat`, `exp`, `idl` (last-activity epoch), `jti` (uuid), `sid` (session id), `rls=[…]` (cached roles, advisory only — never trust without `Auth::hasRole`) |
| `RefreshToken` | `<RefreshId>.<base64url(secret)>` (opaque) | Server stores `(RefreshId, sha256(secret), UserId, IssuedAt, ExpiresAt, RotatedTo, FamilyId)` |
| `SSEToken` | `<TicketId>.<base64url(secret)>` (opaque) | Server stores `(TicketId, sha256(secret), AccessTokenJti, ExpiresAt)` |
| `CsrfToken` | `base64url(HMAC-SHA256(SessionId, CsrfSecret))` | Stateless |

**HMAC secret rotation:** signing secret rotates every **30 days**; both current + previous secret are accepted for verification (24-h overlap window).

---

## 3 — Issuance Flow

```
Client                            Server (WP plugin)
  │                                       │
  │── POST /auth/login (user, pass) ─────▶│
  │                                       │── verify wp_check_password
  │                                       │── audit AUTH.LOGIN_SUCCESS
  │                                       │── mint AccessToken (15 m)
  │                                       │── mint RefreshToken (7 d, FamilyId=NEW)
  │◀── 200 { Attributes: { AccessToken } }│   + Set-Cookie: refresh=…; HttpOnly
  │                                       │
  │── GET /items  (Authorization: Bearer)─▶│── verify JWT, check TRL, refresh idl
  │◀── 200 …                              │
```

### Login response envelope (PascalCase per API SSOT)

```json
{
  "Status": "ok",
  "Attributes": {
    "AccessToken": "<jwt>",
    "ExpiresIn": 900,
    "User": { "Id": 42, "Name": "…", "WorkspaceId": 7 }
  }
}
```

The refresh cookie is set out-of-band; never returned in the JSON body.

---

## 4 — Refresh & Rotation

### Mandatory rotation rules

1. **Every refresh rotates the RefreshToken.** Old token is marked `RotatedTo=<newId>` and rejected on subsequent use.
2. **Reuse detection:** if an already-rotated `RefreshToken` is presented, the entire `FamilyId` is revoked (suspected theft) and `AUTHZ.REFRESH_REUSE` audit row is written at `error` severity.
3. **AccessToken is re-minted** with fresh `iat`, `exp`, `idl`; `jti` is new; `sid` carries forward.
4. **Privilege change forces refresh:** when a user's roles change (any `AUTHZ.ROLE_*` audit row from `10-role-escalation-policy.md`), all of that user's `AccessToken`s are added to TRL; the next request returns `401 ERR_TOKEN_STALE` and the client refreshes.

### Refresh endpoint

`POST /wp-json/workflowy/v1/auth/refresh` — no body, refresh cookie required.

| Outcome | HTTP | Error code |
|---------|------|------------|
| Valid refresh, rotated | 200 | — |
| Cookie missing | 401 | `ERR_AUTH_NO_REFRESH` |
| Cookie expired | 401 | `ERR_AUTH_REFRESH_EXPIRED` |
| Refresh reuse detected | 401 | `ERR_AUTH_REFRESH_REUSE` (family revoked) |
| User disabled | 401 | `ERR_AUTH_USER_DISABLED` |

---

## 5 — Idle vs Absolute Timeout

| Timer | AccessToken | RefreshToken |
|-------|-------------|--------------|
| **Idle** (resets on each successful authenticated request) | 15 min | 7 days |
| **Absolute** (hard cap from issue time, not resettable) | 8 hours | 30 days |

When **either** timer fires, the token is invalid. The client behavior:

| Trigger | Client action |
|---------|---------------|
| `AccessToken` idle expired (`401 ERR_TOKEN_EXPIRED`) | Silent refresh; retry original request once |
| `AccessToken` absolute expired (`401 ERR_TOKEN_ABSOLUTE_EXPIRED`) | Silent refresh; retry once |
| `RefreshToken` idle expired (`401 ERR_AUTH_REFRESH_EXPIRED`) | Redirect to `/login` |
| `RefreshToken` absolute expired (`401 ERR_AUTH_REFRESH_ABSOLUTE`) | Redirect to `/login` with `reason=session_max_age` |
| `AUTHZ.REFRESH_REUSE` (family revoked) | Show "your session was terminated for security" + redirect to `/login` |

> **Single-retry rule:** the auto-refresh interceptor MUST attempt refresh **at most once** per original request. Two consecutive 401s ⇒ hard logout.

---

## 6 — Revocation

### `TokenRevocationList` (TRL)

```sql
CREATE TABLE TokenRevocationList (
    Jti          TEXT PRIMARY KEY,     -- AccessToken.jti OR RefreshId
    Kind         TEXT NOT NULL,        -- 'Access' | 'Refresh' | 'Family'
    UserId       INTEGER NOT NULL,
    RevokedAt    TEXT NOT NULL,
    ExpiresAt    TEXT NOT NULL,        -- TRL row purged after this (no point keeping it)
    Reason       TEXT NOT NULL         -- 'logout' | 'role_change' | 'reuse' | 'admin' | 'password_change'
);

CREATE INDEX idx_TRL_user ON TokenRevocationList (UserId);
CREATE INDEX idx_TRL_exp  ON TokenRevocationList (ExpiresAt);
```

### Revocation triggers

| Event | What is revoked | Audit code |
|-------|-----------------|------------|
| User clicks "Logout" | This `AccessToken` jti + this `RefreshToken` family | `AUTH.LOGOUT` |
| User clicks "Logout from all devices" | All AccessToken jti + all RefreshToken families for this user | `AUTH.LOGOUT_ALL` |
| Password changed | All AccessToken jti + all RefreshToken families | `AUTH.PASSWORD_CHANGE` |
| Role granted / revoked / expired | All AccessToken jti for this user (RefreshToken survives) | `AUTHZ.ROLE_*` |
| Admin disables account | All AccessToken + RefreshToken families | `ADMIN.USER_DISABLE` |
| Refresh reuse detected | Whole RefreshToken family + all AccessToken jti for this user | `AUTHZ.REFRESH_REUSE` |
| Workspace deleted | All AccessToken jti scoped to that workspace | `ADMIN.WORKSPACE_DELETE` |

### Propagation deadline (matches `10-role-escalation-policy.md` §5)

| Layer | Deadline |
|-------|----------|
| TRL row insert | Immediate (sync transaction) |
| In-process verifier cache | ≤ 30 s (LRU TTL) |
| Active REST requests | ≤ 60 s (next request fails with 401) |
| SSE channels | ≤ 60 s (server closes channel on TRL hit) |
| Frontend reaction | ≤ 60 s (auto-refresh fails → redirect to login) |

### TRL purge

`wp-cron` job runs every **15 minutes** and deletes TRL rows where `ExpiresAt < NOW()`. Rationale: once a JWT is past its own `exp`, the verifier rejects it on signature/exp check anyway; keeping the TRL row is wasteful.

---

## 7 — Sessions vs Tokens

A **Session** is the logical "this user is signed in here" concept. It maps to a `wp_usermeta` `session_tokens` entry.

| Invariant | Description |
|-----------|-------------|
| 1:N | One Session ⇒ many AccessTokens over time (each refresh mints a new one) |
| 1:1 active | One Session ⇒ at most one **active** RefreshToken family at any moment |
| User cap | A user MAY have at most **10 concurrent Sessions**; oldest is evicted on the 11th login |
| WPSession ⇒ Session | When the WP cookie expires, the matching Session is destroyed; all child tokens added to TRL |
| MFA bind | Sessions created behind MFA carry a `MfaSatisfiedAt` timestamp; sensitive endpoints (per A-42) check freshness |

---

## 8 — SSE-Specific Lifecycle

EventSource cannot send `Authorization` headers. Flow:

1. Client `POST /auth/sse-ticket` (with valid AccessToken) → server returns `{ Ticket: "<id>.<secret>" }`.
2. Client opens `EventSource("/wp-json/workflowy/v1/stream?ticket=<…>")`.
3. Server validates ticket **once**, deletes it, then upgrades the connection. The connection inherits the `AccessToken`'s `exp`.
4. When `AccessToken.exp` passes (or TRL hit), server sends `event: auth-expired\ndata: {}\n\n` and closes the stream. Client refreshes and re-subscribes.
5. SSE tickets that aren't consumed within **30 seconds** are auto-deleted.

---

## 9 — Audit Integration

| Event | `Action` (taxonomy) | `Severity` |
|-------|---------------------|------------|
| Login success | `AUTH.LOGIN_SUCCESS` | `info` |
| Login failure | `AUTH.LOGIN_FAILURE` | `warn` |
| Logout (single device) | `AUTH.LOGOUT` | `info` |
| Logout-all-devices | `AUTH.LOGOUT_ALL` | `warn` |
| Password change | `AUTH.PASSWORD_CHANGE` | `warn` |
| Refresh success | `AUTH.TOKEN_REFRESH` | `info` (sampled 1:100 — see audit policy §sampling) |
| Refresh reuse detected | `AUTHZ.REFRESH_REUSE` | `error` |
| Concurrent session evicted (cap = 10) | `AUTH.SESSION_EVICT` | `info` |
| HMAC secret rotated | `SYSTEM.SECRET_ROTATE` | `warn` |

> All nine action codes are **additions** scheduled for `09-audit-log-policy.md` v1.2.0 (combined with the v1.1.0 batch from `10-role-escalation-policy.md` §6).

---

## 10 — Hygiene Gate G-25 (proposed)

| Property | Value |
|----------|-------|
| Gate ID | `G-25` |
| Script | `scripts/spec-hygiene/15-token-lifecycle-coverage-audit.mjs` |
| Trigger | Pre-commit + CI |
| Exit codes | `0` ok · `1` violation · `2` runner error |

**Checks:**

1. No source file under `src/` references `localStorage.setItem` or `sessionStorage.setItem` with a key matching `/token|jwt|refresh/i`.
2. Every `Auth::issueAccessToken()` call is preceded by an `Audit::log('AUTH.LOGIN_SUCCESS' | 'AUTH.TOKEN_REFRESH', …)` call.
3. Every PHP handler that calls `Auth::revokeFamily()` also calls `Audit::log` with one of `AUTH.LOGOUT*` / `AUTH.PASSWORD_CHANGE` / `AUTHZ.REFRESH_REUSE` / `ADMIN.USER_DISABLE`.
4. The refresh endpoint route file declares `'cookie_path' => '/wp-json/workflowy/v1/auth/refresh'` (path-scoping enforcement).
5. No `Set-Cookie: refresh=…` is emitted without `HttpOnly; Secure; SameSite=Strict`.

---

## 11 — Acceptance Tests `AT-TOKEN-01..14`

| ID | Given | When | Then |
|----|-------|------|------|
| `AT-TOKEN-01` | Valid login | `POST /auth/login` | 200 with `AccessToken` in body; refresh cookie set `HttpOnly Secure SameSite=Strict` at path `/wp-json/workflowy/v1/auth/refresh` |
| `AT-TOKEN-02` | AccessToken at T = 14 m 59 s of idle | Authenticated request | 200; `idl` claim updated server-side |
| `AT-TOKEN-03` | AccessToken at T = 15 m 0 s of idle | Authenticated request | 401 `ERR_TOKEN_EXPIRED`; client auto-refresh; original request retried once |
| `AT-TOKEN-04` | AccessToken at T = 8 h 0 m 1 s absolute | Authenticated request | 401 `ERR_TOKEN_ABSOLUTE_EXPIRED`; client auto-refresh succeeds (refresh still valid) |
| `AT-TOKEN-05` | RefreshToken used once and rotated | Old refresh cookie replayed | 401 `ERR_AUTH_REFRESH_REUSE`; entire family revoked; `AUTHZ.REFRESH_REUSE` audit row at `error` |
| `AT-TOKEN-06` | User logs out | `POST /auth/logout` | TRL row inserted within same transaction; subsequent request with same AccessToken → 401 |
| `AT-TOKEN-07` | User clicks "Logout all devices" | All sessions enumerated | All AccessToken jti + all RefreshToken families added to TRL; `AUTH.LOGOUT_ALL` audit row |
| `AT-TOKEN-08` | User changes password | Password update committed | Same as AT-TOKEN-07 plus `AUTH.PASSWORD_CHANGE` audit row |
| `AT-TOKEN-09` | Owner promotes Member → Admin (per `10-role-escalation-policy.md`) | Grant activated | All target user's AccessToken jti added to TRL; next request returns 401 `ERR_TOKEN_STALE`; refresh succeeds with new `rls` claim |
| `AT-TOKEN-10` | User has 10 active sessions, logs in on device 11 | Login | Oldest session (smallest `iat`) revoked; `AUTH.SESSION_EVICT` audit row |
| `AT-TOKEN-11` | Two consecutive 401s from refresh interceptor | Second 401 | Client triggers hard logout; redirects to `/login` |
| `AT-TOKEN-12` | SSE ticket issued | Client connects within 30 s | Stream opens; ticket deleted on first use |
| `AT-TOKEN-13` | SSE ticket issued | Client waits 31 s before connecting | Connection rejected with 401; ticket gone |
| `AT-TOKEN-14` | HMAC secret rotates | AccessToken signed with previous secret | Accepted within 24 h overlap; rejected after; `SYSTEM.SECRET_ROTATE` audit row |

---

## 12 — Cross-References

| Reference | Location |
|-----------|----------|
| Parent overview | [`00-overview.md`](./00-overview.md) |
| Role-escalation SSOT (revocation triggers) | [`10-role-escalation-policy.md`](./10-role-escalation-policy.md) |
| Audit-log SSOT | [`09-audit-log-policy.md`](./09-audit-log-policy.md) |
| Error catalogue | [`../../03-error-manage/02-error-architecture/05-response-envelope/05-error-code-catalogue.md`](../../03-error-manage/02-error-architecture/05-response-envelope/05-error-code-catalogue.md) |
| API rate limiting | [`08-api-rate-limiting.md`](./08-api-rate-limiting.md) |
| Roles & capabilities | [`../01-features/15-roles-and-permissions.md`](../01-features/15-roles-and-permissions.md) |

---

## 13 — Keywords

`session` · `token` · `jwt` · `refresh` · `rotation` · `revocation` · `TRL` · `idle-timeout` · `absolute-timeout` · `SSE-ticket` · `G-25`

---

## 14 — Change Log

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-04-26 | Initial SSOT — closes A-41. 5 token kinds, mandatory rotation + reuse detection, idle/absolute timeouts, TRL contract with 60s propagation, SSE-ticket flow, 9 new audit codes, G-25 gate, 14 ATs `AT-TOKEN-01..14`. |
