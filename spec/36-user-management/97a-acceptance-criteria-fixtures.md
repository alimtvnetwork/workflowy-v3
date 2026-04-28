# User Management — Acceptance Criteria I/O Fixtures

> **Version:** 1.0.0
> **Created:** 2026-04-28 (UTC+8)
> **Status:** Normative companion to [`97-acceptance-criteria.md`](./97-acceptance-criteria.md).
> **Format spec:** [`spec/01-spec-authoring-guide/19-acceptance-criteria-io-table.md`](../01-spec-authoring-guide/19-acceptance-criteria-io-table.md)
> **Spawned by:** `.lovable/plans/00-active.md` § P2e.

---

## `AT-USERMANAGEMENT-01` — `User` table shape

| When | `pragma table_info('User')`. |
|---|---|
| **Then** | `UserId INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL` is column 0. |
| **Negative assertion** | UUID PK or `Users` plural MUST fail. |

## `AT-USERMANAGEMENT-02` — Roles in separate `UserRole` table

| When | `pragma table_info('User')` and `pragma table_info('UserRole')`. |
|---|---|
| **Then** | `User` has NO `Role` column; `UserRole(UserId, Role)` exists with composite uniqueness. |
| **Negative assertion** | A `Role` column on `User` MUST fail the schema-shape test. |

## `AT-USERMANAGEMENT-03` — `Role` enum exactly three values

| Linter command | `rg -nP "['\"](User\|Editor\|Admin)['\"]" src/ \| rg -vP "Role\.\|UserRole" \| wc -l` |
|---|---|
| **Expected** | `0` magic-string occurrences outside the enum module. Enum file declares `enum Role { User='User', Editor='Editor', Admin='Admin' }` and nothing else. |

## `AT-USERMANAGEMENT-04` — Capability matrix is SSOT

| Linter command | `node scripts/spec-hygiene/07-extract-contract-map.mjs --capabilities` |
|---|---|
| **Expected exit code** | `0` |
| **Negative assertion** | A capability referenced in code but missing from `00-overview.md` capability table MUST fail with `CAP_NOT_IN_MATRIX: <name>`. |

## `AT-USERMANAGEMENT-05` — RBAC via `hasRole` only

| Linter command | `rg -nP "user\.role\s*===\s*['\"](User\|Editor\|Admin)" src/` |
|---|---|
| **Expected exit code** | `1` |
| **Negative assertion** | Inline role comparisons MUST fail. |

## `AT-USERMANAGEMENT-06` — `hasRole` queries DB, not session cache

| Given | Session cache claims `usr_42` has Admin; DB does NOT have an Admin row for `usr_42` (revoked). |
|---|---|
| **When** | Code calls `hasRole(usr_42, 'Admin')` for a privilege-elevation check. |
| **Then** | Helper executes `SELECT 1 FROM UserRole WHERE UserId=? AND Role=?` and returns `false`. |
| **Negative assertion** | UI rendering MAY use cache, but elevation MUST NOT. |

## `AT-USERMANAGEMENT-07` — Password + optional WebAuthn

| Given | Auth config. |
|---|---|
| **Linter command** | `rg -nP "webauthn\|passkey" src/auth/` |
|---|---|
| **Expected exit code** | `0` |
| **Then** | Auth module exposes `loginWithPassword` AND `registerPasskey` + `loginWithPasskey`; password-only build (no passkey path) MUST fail. |

## `AT-USERMANAGEMENT-08` — Argon2id config

| Linter command | `rg -nP "argon2id" src/auth/ && rg -nP "memoryCost:\s*(6553[6-9]\|[7-9]\d{4}\|\d{6,})" src/auth/` |
|---|---|
| **Expected exit code** | `0` |
| **Then** | Hash params: `memoryCost ≥ 65536` (KB), `timeCost ≥ 3`, `parallelism ≥ 1`. |
| **Negative assertion** | `bcrypt`, `pbkdf2`, `sha256` MUST NOT appear in `src/auth/`. |

## `AT-USERMANAGEMENT-09` — Session cookie flags (sync mode)

| When | `POST /wp-json/workflowy/v1/auth/login` succeeds in sync mode. |
|---|---|
| **Then** | `Set-Cookie` header matches `/^Session=[^;]+; HttpOnly; Secure; SameSite=Lax(; Path=\/)?$/`. |
| **Negative assertion** | Missing `HttpOnly` or `Secure` MUST fail; solo-mode-only build MAY use `localStorage`. |

## `AT-USERMANAGEMENT-10` — JWT carries only `userId`

| Given | A JWT issued to `usr_42`. |
|---|---|
| **When** | Decode payload (no signature check). |
| **Then** | Payload keys ⊆ `{"sub", "iat", "exp"}` where `sub === "usr_42"`. |
| **Negative assertion** | `role`, `permissions`, `email` MUST NOT appear in JWT claims. |

## `AT-USERMANAGEMENT-11` — Solo mode works without server

| Given | App built in solo mode; network disabled. |
|---|---|
| **When** | First-launch flow. |
| **Then** | App reaches the editor without any HTTP request to an auth endpoint; local user record auto-created. |

## `AT-USERMANAGEMENT-12` — Solo → sync migration is lossless

| Given | Solo user has 100 items + 5 templates. |
|---|---|
| **When** | User links a sync account. |
| **Then** | Server reports `Results.Migrated = { Items:100, Templates:5 }`; subsequent `GET /items` returns 100; no row missing. |
| **Negative assertion** | A failure mid-migration MUST roll back atomically — no partial state allowed. |

## `AT-USERMANAGEMENT-13` — Admin invite/deactivate/role-change; deletion separate

| Given | Admin UI rendered. |
|---|---|
| **Then** | Buttons present: `Invite`, `Deactivate`, `Change Role`, `Delete`. Clicking `Delete` opens an additional confirmation modal requiring typing the user's email; `Deactivate` does NOT delete data. |

## `AT-USERMANAGEMENT-14` — Admin actions emit activity events

| Given | Admin deactivates `usr_42`. |
|---|---|
| **Then** | One row inserted into `ActivityEvent` with `EventType="UserDeactivated"`, `UserId=<admin>`, `TargetUserId="usr_42"`. |
| **Negative assertion** | Silent admin actions MUST fail the audit-coverage test. |

## `AT-USERMANAGEMENT-15` — Admin override of share permissions logged + notified

| Given | `usr_A` owns `itm_X`; admin force-adds `usr_B` as Editor. |
|---|---|
| **Then** | Activity event `EventType="ShareOverridden"` written; in-app + email notification queued for `usr_A` containing override actor + reason. |
| **Negative assertion** | Override without notification MUST fail. |

## `AT-USERMANAGEMENT-16` — Export + delete account

| Given | `usr_42` has data across `user.db`, `feedback.db`, `activity.db`. |
|---|---|
| **When (a)** | `POST /users/me:export` → returns single `.zip` archive containing all three datasets. |
| **When (b)** | `POST /users/me:delete` → single transaction removes per-user DB file, `Feedback` rows, `ActivityEvent` rows, `Session` rows. |
| **Then** | Post-delete `SELECT … WHERE UserId=42` on every table returns 0 rows; per-user DB file no longer exists on disk. |
| **Negative assertion** | Piecemeal deletion across multiple operator calls MUST fail GDPR test. |

---

## Verification

```bash
grep -rn "AT-USERMANAGEMENT-" spec/36-user-management/97a-acceptance-criteria-fixtures.md | wc -l   # → 16
node scripts/spec-hygiene/00-run-all.mjs
```

## Related

- [`97-acceptance-criteria.md`](./97-acceptance-criteria.md) — Prose rollup
- [`spec/31-app/97e-roles-inline-acceptance-fixtures.md`](../31-app/97e-roles-inline-acceptance-fixtures.md) — `AT-ROLES` UI fixtures

*P2e/D — created 2026-04-28 (UTC+8). Covers 16/16 user-management ATs.*
