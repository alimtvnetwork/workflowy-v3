# Multi-Factor Authentication (MFA) Policy — SSOT

> **Version:** 1.0.0
> **Created:** 2026-04-26 (UTC+8)
> **Status:** Active — runtime-agnostic contract
> **Parent:** [`00-overview.md`](./00-overview.md)
> **Closes:** A-42 (MFA policy SSOT)
> **Companion:** [`09-audit-log-policy.md`](./09-audit-log-policy.md), [`10-role-escalation-policy.md`](./10-role-escalation-policy.md), [`11-session-token-lifecycle.md`](./11-session-token-lifecycle.md)

---

## Purpose

`10-role-escalation-policy.md` § dual-control and `11-session-token-lifecycle.md` § sessions both reference "MFA challenge" without defining the protocol. This SSOT pins:

- Which factors are allowed (and which are explicitly rejected)
- Enrollment and recovery flows
- Step-up vs sign-in challenges
- The `MfaSatisfiedAt` freshness contract
- Anti-bypass and rate-limiting rules

Without this SSOT, AI implementers will accept SMS, store TOTP secrets in plain text, or skip step-up on sensitive endpoints.

---

## 1 — Allowed Factors

| Factor | Standard | Use | Required for new accounts? |
|--------|----------|-----|----------------------------|
| **TOTP** | RFC 6238 (30 s window, SHA-1, 6 digits) | Default; works offline; QR-code enrollment | ✅ Yes — minimum 1 TOTP enrolled |
| **WebAuthn / Passkey** | W3C WebAuthn Level 3, FIDO2 | Phishing-resistant; preferred for `Owner` and `Admin` | ⚠️ Required for `Owner`; recommended for `Admin` |
| **Recovery Codes** | 10 single-use base32-encoded codes (10 chars) | Break-glass when factor is lost | ✅ Auto-generated on first MFA enrollment |

### Explicitly forbidden

| Factor | Reason |
|--------|--------|
| **SMS / Text message** | SIM-swap risk; not phishing-resistant; PSTN cost |
| **Email OTP** | Email account = single point of failure; often == reset path |
| **Voice call** | Same risks as SMS |
| **Push notification only (no number-matching)** | Push-fatigue / MFA-bombing |
| **"Remember this device" without re-challenge** | Skips MFA; only `MfaSatisfiedAt` freshness allowed |

> **Rule:** No code path may add SMS, email-OTP, or voice MFA. The factor whitelist lives in `Auth\Mfa\FactorRegistry::ALLOWED` and is enforced by gate G-26.

---

## 2 — Enrollment Flow

### First-time enrollment (mandatory)

```
                 ┌─────────────────┐
                 │ Login success   │
                 └────────┬────────┘
                          │ no MFA enrolled
                          ▼
              ┌──────────────────────┐
              │ /mfa/enroll (forced) │ ← cannot dismiss; no app access until done
              └────────┬─────────────┘
                       │
                       ▼
       ┌─────────────────────────────────────┐
       │ Step 1 — TOTP setup (mandatory)     │
       │   show QR + secret; verify 1 code   │
       └────────┬────────────────────────────┘
                │
                ▼
       ┌─────────────────────────────────────┐
       │ Step 2 — Recovery codes             │
       │   show 10 codes; require checkbox   │
       │   "I have saved these"              │
       └────────┬────────────────────────────┘
                │
                ▼
       ┌─────────────────────────────────────┐
       │ Step 3 — Optional WebAuthn          │
       │   skip allowed (except Owners)      │
       └────────┬────────────────────────────┘
                │
                ▼
              Done — set MfaEnrolledAt
```

### Adding a second factor (post-enrollment)

- Requires fresh MFA challenge (≤ 5 min old) on existing factor.
- Audit row `AUTH.MFA_FACTOR_ADD` at `info`.

### Removing a factor

- Cannot remove the **last remaining** non-recovery factor.
- Requires fresh MFA challenge on a **different** factor than the one being removed.
- 24-hour cooling-off period before recovery codes can be regenerated after a factor removal.
- Audit row `AUTH.MFA_FACTOR_REMOVE` at `warn`.

---

## 3 — Storage

```sql
CREATE TABLE MfaFactor (
    FactorId        INTEGER PRIMARY KEY AUTOINCREMENT,
    UserId          INTEGER NOT NULL,
    Kind            TEXT    NOT NULL,            -- 'TOTP' | 'WebAuthn' | 'Recovery'
    Label           TEXT    NOT NULL,            -- e.g. "Pixel 8" or "YubiKey-blue"
    SecretEncrypted BLOB    NOT NULL,            -- AES-256-GCM, key from WP_AUTH_KEY-derived
    PublicKeyCose   BLOB    NULL,                -- WebAuthn only
    Counter         INTEGER NULL,                -- WebAuthn signature counter
    LastUsedAt      TEXT    NULL,
    CreatedAt       TEXT    NOT NULL,
    DisabledAt      TEXT    NULL                 -- soft-disable for break-glass scenarios
);

CREATE TABLE MfaRecoveryCode (
    CodeId         INTEGER PRIMARY KEY AUTOINCREMENT,
    UserId         INTEGER NOT NULL,
    CodeHash       BLOB    NOT NULL,             -- argon2id of code
    UsedAt         TEXT    NULL,
    GeneratedAt    TEXT    NOT NULL
);

CREATE INDEX idx_MFA_user ON MfaFactor (UserId);
CREATE INDEX idx_MFAREC_user_unused ON MfaRecoveryCode (UserId) WHERE UsedAt IS NULL;
```

### Encryption rules

- TOTP secret encrypted with AES-256-GCM; key derived from `WP_AUTH_KEY` via HKDF with per-user salt.
- WebAuthn keeps only the COSE public key (no secret to encrypt).
- Recovery codes hashed with **argon2id** (`m=64MB, t=3, p=1`); plaintext shown to user **once** at generation, never recoverable.
- Migration `M-015` (next slot after A-40's `M-014`) creates these tables.

---

## 4 — Challenge Types

| Challenge | Trigger | What it proves | Sets `MfaSatisfiedAt`? |
|-----------|---------|----------------|------------------------|
| **Sign-in** | Every login after password verification | Identity at session start | ✅ Yes |
| **Step-up** | Sensitive endpoint (per §6) when `MfaSatisfiedAt` is stale | Continued presence of the human | ✅ Yes (refreshes timestamp) |
| **Re-challenge** | After 12 h absolute since last MFA, regardless of activity | Same as step-up | ✅ Yes |
| **Recovery** | User clicks "I lost my factor" | Identity via single-use code | ✅ Yes (then forces re-enrollment) |

### `MfaSatisfiedAt` freshness ladder

| Endpoint class | Max staleness allowed | If stale → |
|----------------|----------------------|-----------|
| Read endpoints (GET /items, /search) | ∞ (only sign-in MFA required) | — |
| Write endpoints (POST/PUT/DELETE on items, comments) | 12 h | Step-up challenge |
| Sharing endpoints (`/share/*`) | 1 h | Step-up challenge |
| Account endpoints (`/account/email`, `/account/password`) | 5 min | Step-up challenge |
| Role-escalation endpoints (per A-40 L2/L3/break-glass) | 5 min | Step-up challenge |
| MFA factor add/remove | 5 min | Step-up challenge |
| Data export (per A-43) | 5 min | Step-up challenge |

The session JWT carries `mfa` (epoch of last satisfaction). On every request, the middleware compares to the endpoint's max staleness from a static map.

---

## 5 — Sign-in Challenge Flow

```
POST /auth/login (user, pass)
  └─▶ 200 { Status: "mfa_required",
            Attributes: { ChallengeId, AllowedFactors: ["TOTP","WebAuthn"] } }

POST /auth/mfa/verify { ChallengeId, Factor: "TOTP", Code: "123456" }
  └─▶ 200 { Status: "ok", Attributes: { AccessToken, … } }
        + Set-Cookie: refresh=…   (per 11-session-token-lifecycle.md)
```

### Challenge state

```sql
CREATE TABLE MfaChallenge (
    ChallengeId   TEXT PRIMARY KEY,         -- opaque uuid
    UserId        INTEGER NOT NULL,
    Purpose       TEXT NOT NULL,             -- 'SignIn' | 'StepUp' | 'Recovery'
    AttemptCount  INTEGER NOT NULL DEFAULT 0,
    CreatedAt     TEXT NOT NULL,
    ExpiresAt     TEXT NOT NULL,             -- 5 min from creation
    SatisfiedAt   TEXT NULL
);
```

| Rule | Value |
|------|-------|
| Challenge TTL | 5 minutes |
| Max attempts per challenge | 5 (then challenge invalidated, user must restart) |
| Per-user MFA-verify rate limit | 10 attempts / 10 min (returns `ERR_MFA_RATE_LIMITED`, see A-36) |
| Lockout after consecutive failures | 30 min lockout after **20 failed attempts in 1 h** across all challenges |

---

## 6 — Sensitive-Endpoint Step-Up Map

The middleware checks `mfa` claim freshness against this static map. Endpoints not listed inherit the **write-endpoint default** (12 h).

| Endpoint pattern | Max MFA staleness |
|------------------|-------------------|
| `/account/password` | 5 min |
| `/account/email` | 5 min |
| `/account/delete` | 5 min |
| `/mfa/factor/*` | 5 min |
| `/recovery-codes/regenerate` | 5 min |
| `/escalation/request` (A-40 L2/L3) | 5 min |
| `/escalation/approve` | 5 min |
| `/escalation/break-glass` | 5 min |
| `/export/*` (A-43) | 5 min |
| `/workspace/transfer-ownership` | 5 min |
| `/share/*` (mutations) | 1 h |
| `/items` (POST/PUT/DELETE) | 12 h |
| `/items/*` (GET), `/search` | ∞ (sign-in MFA only) |

A 401 with `ERR_MFA_STEP_UP_REQUIRED` carries `WwwAuthenticate: WF-StepUp purpose="…"` so the client can launch the modal without parsing error text.

---

## 7 — Recovery Flow

```
1. User clicks "I lost my factor" on login screen.
2. Enter email → server sends one-time recovery link (15 min TTL) using existing
   WP password-reset infrastructure but routed to /auth/recovery/start.
3. User opens link → enters one of their 10 recovery codes.
4. On success:
     - Code marked UsedAt = NOW().
     - All MFA factors disabled (DisabledAt set, NOT deleted — auditable).
     - User forced through §2 enrollment again before any other action.
     - Audit AUTH.MFA_RECOVERY at WARN with: { CodesRemaining }.
     - Email sent to the user: "Your MFA was reset on …".
5. RefreshToken family revoked (per 11-session-token-lifecycle.md §6).
```

### Code-exhaustion rule

When the user has only **2 unused codes left**, the next login displays a banner:
"⚠ Only 2 recovery codes remain. Generate new codes now." This is non-dismissible from `Owner` accounts.

---

## 8 — Anti-Bypass Rules

| Rule | Enforcement |
|------|-------------|
| No "remember this device" cookies that skip MFA | G-26 forbids `RememberMfa*` cookie names |
| No env-var or query-param to disable MFA | G-26 forbids `MFA_DISABLED`, `?bypass_mfa`, `WP_DEBUG_MFA_OFF` literals |
| No admin UI to toggle MFA-required off | Workspace-level `MfaRequired` is permanent ON; not configurable |
| No grace period for new users | Forced enrollment on first login (per §2) |
| Recovery code reuse | `UsedAt IS NOT NULL` ⇒ rejected with `ERR_MFA_RECOVERY_USED` |
| Side-channel timing on TOTP verify | Constant-time compare via `hash_equals()`; fixed 50 ms minimum response |
| TOTP clock skew | Accept ±1 window (90 s total), no more |
| WebAuthn counter rollback | Reject if `signCount <= stored Counter`; audit `AUTHZ.WEBAUTHN_COUNTER_ROLLBACK` at `error` |

---

## 9 — Hygiene Gate G-26 (proposed)

| Property | Value |
|----------|-------|
| Gate ID | `G-26` |
| Script | `scripts/spec-hygiene/16-mfa-policy-coverage-audit.mjs` |
| Trigger | Pre-commit + CI |
| Exit codes | `0` ok · `1` violation · `2` runner error |

**Checks:**

1. No source file under `src/` references `'sms'`, `'email_otp'`, `'voice'`, `'remember_mfa'`, `MFA_DISABLED`, or `bypass_mfa` literals.
2. Every PHP route file with method `POST|PUT|DELETE` declares an MFA staleness via `Mfa::requireFreshness(seconds)` OR explicitly opts out via `Mfa::skipForRead()`.
3. The endpoint-to-staleness map in §6 matches `Auth\Mfa\StepUpMap::MAX_AGE_SECONDS` byte-for-byte.
4. No call to `mfa_factor_create()` for `Kind` outside `Auth\Mfa\FactorRegistry::ALLOWED` (`'TOTP'`, `'WebAuthn'`, `'Recovery'`).
5. Recovery-code generation calls `password_hash($code, PASSWORD_ARGON2ID, …)` — never `md5`, `sha1`, or `password_hash` with `PASSWORD_DEFAULT`.

---

## 10 — Audit Integration

| Event | `Action` | `Severity` | Mandatory `Context` |
|-------|----------|------------|---------------------|
| Sign-in MFA success | `AUTH.MFA_VERIFY_SUCCESS` | `info` | `Factor`, `ChallengeId` |
| Sign-in MFA failure | `AUTH.MFA_VERIFY_FAILURE` | `warn` | `Factor`, `ChallengeId`, `AttemptCount` |
| Step-up success | `AUTH.MFA_STEPUP_SUCCESS` | `info` | `Factor`, `Endpoint`, `RequiredFreshnessSec` |
| Step-up failure | `AUTH.MFA_STEPUP_FAILURE` | `warn` | `Factor`, `Endpoint` |
| MFA enrolled (first factor) | `AUTH.MFA_ENROLL` | `info` | `Factor` |
| Factor added | `AUTH.MFA_FACTOR_ADD` | `info` | `Factor`, `Label` |
| Factor removed | `AUTH.MFA_FACTOR_REMOVE` | `warn` | `Factor`, `Label`, `RemainingFactors` |
| Recovery code used | `AUTH.MFA_RECOVERY` | `warn` | `CodesRemaining` |
| Recovery codes regenerated | `AUTH.MFA_RECOVERY_REGEN` | `warn` | — |
| Lockout triggered | `AUTH.MFA_LOCKOUT` | `error` | `FailureCount`, `WindowMinutes` |
| WebAuthn counter rollback | `AUTHZ.WEBAUTHN_COUNTER_ROLLBACK` | `error` | `FactorId`, `OldCounter`, `NewCounter` |

> All 11 codes go into the **v1.2.0 audit-log backfill batch** (combined with A-40's 10 + A-41's 9 = **30 codes total**).

---

## 11 — Acceptance Tests `AT-MFA-01..16`

| ID | Given | When | Then |
|----|-------|------|------|
| `AT-MFA-01` | Brand-new user logs in successfully | Lands on app | Redirected to forced enrollment; cannot navigate elsewhere |
| `AT-MFA-02` | User completes TOTP enrollment | Step 2 of flow | 10 recovery codes shown; checkbox required before proceeding |
| `AT-MFA-03` | Owner skips WebAuthn enrollment | Submit | Rejected — Owners MUST enroll a WebAuthn factor |
| `AT-MFA-04` | User has TOTP only, attempts to remove TOTP | Submit | Rejected `ERR_MFA_LAST_FACTOR` — cannot remove last factor |
| `AT-MFA-05` | User logs in with correct password | Server response | `Status: "mfa_required"`, `AllowedFactors` enumerated; no AccessToken yet |
| `AT-MFA-06` | TOTP code entered with ±30 s clock skew | Verify | Accepted (within ±1 window) |
| `AT-MFA-07` | TOTP code entered with 91 s skew | Verify | Rejected `ERR_MFA_INVALID_CODE` |
| `AT-MFA-08` | User on PUT /items with `MfaSatisfiedAt` 13 h old | Request | 401 `ERR_MFA_STEP_UP_REQUIRED`; `WwwAuthenticate` carries `purpose="write"` |
| `AT-MFA-09` | User on POST /share/grant with `MfaSatisfiedAt` 70 min old | Request | 401 step-up required (1 h limit) |
| `AT-MFA-10` | User on POST /account/password with `MfaSatisfiedAt` 6 min old | Request | 401 step-up required (5 min limit) |
| `AT-MFA-11` | 20 failed MFA attempts in 1 h | 21st attempt | Account locked 30 min; `AUTH.MFA_LOCKOUT` audit at `error` |
| `AT-MFA-12` | User reuses already-used recovery code | Verify | Rejected `ERR_MFA_RECOVERY_USED` |
| `AT-MFA-13` | Recovery flow completes successfully | After verify | All factors `DisabledAt` set; RefreshToken family revoked; forced re-enrollment |
| `AT-MFA-14` | User has 2 unused recovery codes | Login | Non-dismissible banner shown for Owner; dismissible-once for others |
| `AT-MFA-15` | WebAuthn assertion with `signCount` ≤ stored `Counter` | Verify | Rejected; `AUTHZ.WEBAUTHN_COUNTER_ROLLBACK` audit at `error` |
| `AT-MFA-16` | TOTP secret retrieved from DB by attacker dump | Inspect | Bytes encrypted under AES-256-GCM, undecryptable without `WP_AUTH_KEY` |

---

## 12 — Cross-References

| Reference | Location |
|-----------|----------|
| Parent overview | [`00-overview.md`](./00-overview.md) |
| Audit-log SSOT | [`09-audit-log-policy.md`](./09-audit-log-policy.md) |
| Role-escalation SSOT | [`10-role-escalation-policy.md`](./10-role-escalation-policy.md) |
| Session/token lifecycle | [`11-session-token-lifecycle.md`](./11-session-token-lifecycle.md) |
| Error catalogue | [`../../03-error-manage/02-error-architecture/05-response-envelope/05-error-code-catalogue.md`](../../03-error-manage/02-error-architecture/05-response-envelope/05-error-code-catalogue.md) |
| API rate limiting | [`08-api-rate-limiting.md`](./08-api-rate-limiting.md) |

---

## 13 — Keywords

`mfa` · `2fa` · `totp` · `webauthn` · `passkey` · `recovery-codes` · `step-up` · `enrollment` · `phishing-resistant` · `G-26`

---

## 14 — Change Log

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-04-26 | Initial SSOT — closes A-42. 3 allowed factors (TOTP/WebAuthn/Recovery), explicit SMS/email-OTP/voice ban, mandatory enrollment, 5-tier step-up freshness ladder (5 min → 12 h → ∞), AES-256-GCM TOTP storage + argon2id recovery codes, recovery flow with forced re-enrollment, anti-bypass rules, G-26 gate, 16 ATs `AT-MFA-01..16`, migration `M-015`, 11 new audit codes for v1.2.0 batch. |
