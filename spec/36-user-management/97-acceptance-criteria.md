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
| AT-USERMANAGEMENT-01 | `User` table MUST be singular PascalCase with `UserId` PK as `INTEGER PRIMARY KEY AUTOINCREMENT` (FR-1) — UUID PKs are forbidden because they prevent efficient joins on the per-user shard key. | [`00-overview.md`](./00-overview.md) |
| AT-USERMANAGEMENT-02 | Roles MUST live in a separate `UserRole` table linking `UserId` ↔ `Role` enum (FR-2); storing role columns directly on `User` is a Code-Red privilege-escalation bug per the project memory rule. | [`00-overview.md`](./00-overview.md), [`mem://constraints/coding-guidelines`](mem://constraints/coding-guidelines) |
| AT-USERMANAGEMENT-03 | The `Role` enum MUST be exactly `User`, `Editor`, `Admin`; adding new roles MUST update the enum + capability matrix + this AT — magic-string roles are forbidden. | [`00-overview.md`](./00-overview.md) |

### Capability matrix

| ID | Criterion | Source |
|----|-----------|--------|
| AT-USERMANAGEMENT-04 | The capability matrix in `00-overview.md` MUST be the SSOT — code MUST NOT introduce ad-hoc capabilities not listed; new capabilities require updating the matrix first. | [`00-overview.md`](./00-overview.md) |
| AT-USERMANAGEMENT-05 | All RBAC checks MUST go through the central `hasRole(userId, role)` helper (FR-6) — inline role comparisons (`if (user.role === 'Admin')`) are forbidden because they're un-auditable. | [`00-overview.md`](./00-overview.md) |
| AT-USERMANAGEMENT-06 | `hasRole` MUST be the security-definer pattern: it MUST query the `UserRole` table (NOT a session cache) for privilege-elevation checks, even though session cache may be used for UI rendering. | [`00-overview.md`](./00-overview.md) |

### Authentication

| ID | Criterion | Source |
|----|-----------|--------|
| AT-USERMANAGEMENT-07 | Auth MUST support password + optional WebAuthn passkey (FR-3); password-only auth without a documented passkey upgrade path fails review. | [`00-overview.md`](./00-overview.md) |
| AT-USERMANAGEMENT-08 | Passwords MUST be hashed with Argon2id (memory ≥ 64 MB, iterations ≥ 3, parallelism ≥ 1) — bcrypt/PBKDF2/SHA-256 are forbidden as they're below the 2026 baseline. | [`00-overview.md`](./00-overview.md) |
| AT-USERMANAGEMENT-09 | Session tokens MUST live in `httpOnly` + `Secure` + `SameSite=Lax` cookies when sync is enabled (FR-4); `localStorage` fallback is allowed ONLY in solo (no-sync) mode. | [`00-overview.md`](./00-overview.md), [`../05-split-db-architecture/02-features/05-user-scoped-isolation/97-acceptance-criteria.md`](../05-split-db-architecture/02-features/05-user-scoped-isolation/97-acceptance-criteria.md) |
| AT-USERMANAGEMENT-10 | JWTs (if used) MUST carry only the `userId` reference (NOT user data); embedding role/permissions in JWT claims is a Code-Red privilege-escalation bug. | [`00-overview.md`](./00-overview.md) |

### Local-first / solo mode

| ID | Criterion | Source |
|----|-----------|--------|
| AT-USERMANAGEMENT-11 | Solo mode MUST work with NO server login required; forcing login for offline use is a Code-Red product-promise violation. | [`00-overview.md`](./00-overview.md) |
| AT-USERMANAGEMENT-12 | Switching from solo → sync mode MUST migrate the local user data into the synced account WITHOUT data loss; partial migration is a Code-Red data-loss bug. | [`00-overview.md`](./00-overview.md) |

### Admin operations

| ID | Criterion | Source |
|----|-----------|--------|
| AT-USERMANAGEMENT-13 | Admin UI MUST support invite, deactivate, role-change (FR-5); deletion MUST be a separate flow gated by an additional confirmation (NOT folded into deactivate). | [`00-overview.md`](./00-overview.md) |
| AT-USERMANAGEMENT-14 | Every admin action MUST emit an entry to the activity feed (audit-of-the-audit); silent admin actions are a Code-Red audit-integrity bug. | [`00-overview.md`](./00-overview.md), [`../34-activity-feed/97-acceptance-criteria.md`](../34-activity-feed/97-acceptance-criteria.md) |

### Sharing & GDPR

| ID | Criterion | Source |
|----|-----------|--------|
| AT-USERMANAGEMENT-15 | Per-item sharing permissions MUST follow the sharing-model memory; admin override of share permissions MUST be logged AND user-notified — silent override is a Code-Red trust bug. | [`00-overview.md`](./00-overview.md), [`mem://features/sharing-model`](mem://features/sharing-model) |
| AT-USERMANAGEMENT-16 | A user MUST be able to: (a) export all their data as a single archive, (b) delete their account in one operation that purges per-user DB + sessions + feedback + activity events. Piecemeal deletion fails GDPR. | [`00-overview.md`](./00-overview.md), [`../05-split-db-architecture/02-features/05-user-scoped-isolation/97-acceptance-criteria.md`](../05-split-db-architecture/02-features/05-user-scoped-isolation/97-acceptance-criteria.md) |

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

## P13 stub rows

> Auto-appended by [`scripts/spec-hygiene/45-append-p13-orphan-stubs.mjs`](../../scripts/spec-hygiene/45-append-p13-orphan-stubs.mjs) on 2026-04-28 to close orphan AT citations surfaced by [`40-generate-contract-json.mjs`](../../scripts/spec-hygiene/40-generate-contract-json.mjs). Each row is a **placeholder definition** — replace the body with concrete Given/When/Then + JSON fixture during P2 (I/O table conversion). Do **not** delete a row without first removing every citation of its ID elsewhere in spec/.

### AT-USR-01 — Settings panel auto-save

📝 **P13-stub.** Definition pending. Replace this block with:
- Given/When/Then prose
- JSON request + envelope-shaped response (PascalCase `Status`/`Attributes`/`Results`) per [`spec/04-database-conventions/06-rest-api-format/`](../04-database-conventions/06-rest-api-format/).
- A pointer to the test that enforces it (Vitest or PHPUnit), test name **MUST** start with this AT id.

### AT-USR-03 — Set password flow

📝 **P13-stub.** Definition pending. Replace this block with:
- Given/When/Then prose
- JSON request + envelope-shaped response (PascalCase `Status`/`Attributes`/`Results`) per [`spec/04-database-conventions/06-rest-api-format/`](../04-database-conventions/06-rest-api-format/).
- A pointer to the test that enforces it (Vitest or PHPUnit), test name **MUST** start with this AT id.

### AT-USR-09 — Restore from backup

📝 **P13-stub.** Definition pending. Replace this block with:
- Given/When/Then prose
- JSON request + envelope-shaped response (PascalCase `Status`/`Attributes`/`Results`) per [`spec/04-database-conventions/06-rest-api-format/`](../04-database-conventions/06-rest-api-format/).
- A pointer to the test that enforces it (Vitest or PHPUnit), test name **MUST** start with this AT id.

### AT-USR-11 — Theme selection persistence

📝 **P13-stub.** Definition pending. Replace this block with:
- Given/When/Then prose
- JSON request + envelope-shaped response (PascalCase `Status`/`Attributes`/`Results`) per [`spec/04-database-conventions/06-rest-api-format/`](../04-database-conventions/06-rest-api-format/).
- A pointer to the test that enforces it (Vitest or PHPUnit), test name **MUST** start with this AT id.

### AT-USR-14 — Referrals

📝 **P13-stub.** Definition pending. Replace this block with:
- Given/When/Then prose
- JSON request + envelope-shaped response (PascalCase `Status`/`Attributes`/`Results`) per [`spec/04-database-conventions/06-rest-api-format/`](../04-database-conventions/06-rest-api-format/).
- A pointer to the test that enforces it (Vitest or PHPUnit), test name **MUST** start with this AT id.

### AT-USR-15 — Help / Report a bug

📝 **P13-stub.** Definition pending. Replace this block with:
- Given/When/Then prose
- JSON request + envelope-shaped response (PascalCase `Status`/`Attributes`/`Results`) per [`spec/04-database-conventions/06-rest-api-format/`](../04-database-conventions/06-rest-api-format/).
- A pointer to the test that enforces it (Vitest or PHPUnit), test name **MUST** start with this AT id.
