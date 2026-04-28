# User-Scoped Isolation — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 14 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-USERSCOPEDISOLATION-01` … `AT-USERSCOPEDISOLATION-14`

---

## Criteria

### Scoping & directory patterns (file 01)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-USERSCOPEDISOLATION-01 | Per-user data MUST live under `data/users/<userIdHash>/…` (hash, NOT raw ID) — using raw user IDs in directory paths is a Code-Red privacy bug. | [`01-scoping-and-directory-patterns.md`](./01-scoping-and-directory-patterns.md) |
| AT-USERSCOPEDISOLATION-02 | The user-id hash MUST be deterministic (HMAC-SHA256 with a server-side secret) — using a non-keyed SHA-256 enables enumeration and is forbidden. | [`01-scoping-and-directory-patterns.md`](./01-scoping-and-directory-patterns.md) |
| AT-USERSCOPEDISOLATION-03 | Directory traversal protection: any path computed from user input MUST go through `path.Clean` + prefix-check against the user's scope root; missing the prefix-check is a Code-Red OWASP bug. | [`01-scoping-and-directory-patterns.md`](./01-scoping-and-directory-patterns.md) |

### Database schema (file 02)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-USERSCOPEDISOLATION-04 | Per-user DB files are SQLite, named `data/users/<userIdHash>/user.sqlite`; sharing a single SQLite file across users is forbidden. | [`02-database-schema.md`](./02-database-schema.md), [`../../01-fundamentals/97-acceptance-criteria.md`](../../01-fundamentals/97-acceptance-criteria.md) |
| AT-USERSCOPEDISOLATION-05 | All per-user tables include the user's `UserId` column anyway (defense in depth — even though they're physically isolated); missing the column fails review. | [`02-database-schema.md`](./02-database-schema.md) |

### User DB manager (file 03)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-USERSCOPEDISOLATION-06 | The `UserDbManager` is the SOLE source of per-user DB handles; bespoke `sql.Open(perUserPath)` calls outside the manager are forbidden. | [`03-user-db-manager.md`](./03-user-db-manager.md) |
| AT-USERSCOPEDISOLATION-07 | The manager MUST cap per-user pool size (default 4 conns, configurable via seedable-config); unbounded pools are a Code-Red resource bug. | [`03-user-db-manager.md`](./03-user-db-manager.md), [`../../../06-seedable-config-architecture/01-fundamentals/97-acceptance-criteria.md`](../../../06-seedable-config-architecture/01-fundamentals/97-acceptance-criteria.md) |
| AT-USERSCOPEDISOLATION-08 | The manager MUST evict idle handles after a documented TTL (default 15 min); leaking handles across long sessions is a Code-Red resource bug. | [`03-user-db-manager.md`](./03-user-db-manager.md) |

### Usage examples (file 04)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-USERSCOPEDISOLATION-09 | Every example MUST resolve the user handle via `mgr.For(ctx, userId)` — passing a raw `*sql.DB` around is forbidden (loses isolation guarantees). | [`04-usage-examples.md`](./04-usage-examples.md) |
| AT-USERSCOPEDISOLATION-10 | Cross-user reads (e.g., admin dashboards) MUST go through a documented `AdminAggregator` API that asserts the caller has the `Admin` role; raw cross-user iteration in business code is forbidden. | [`04-usage-examples.md`](./04-usage-examples.md), [`../04-rbac-casbin/97-acceptance-criteria.md`](../04-rbac-casbin/97-acceptance-criteria.md) |

### Session management (file 05)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-USERSCOPEDISOLATION-11 | Sessions are server-side (NOT JWTs that hold user-data) — JWTs carry only the `userId` reference; embedding user data in JWT claims is a Code-Red privacy bug. | [`05-session-management.md`](./05-session-management.md) |
| AT-USERSCOPEDISOLATION-12 | Session cookies are `HttpOnly`, `Secure`, `SameSite=Lax` (or stricter); missing any flag is a Code-Red OWASP bug. | [`05-session-management.md`](./05-session-management.md) |

### Privacy & GDPR (file 06)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-USERSCOPEDISOLATION-13 | Per-user data deletion MUST be a one-shot operation: `mgr.PurgeUser(userId)` removes the per-user directory + DB file + session entries + audit-log marker; partial deletion is a Code-Red GDPR bug. | [`06-privacy-and-gdpr.md`](./06-privacy-and-gdpr.md) |
| AT-USERSCOPEDISOLATION-14 | Per-user data export MUST be a one-shot operation returning a single archive containing the user's DB + uploaded files + decrypted settings; piecemeal exports fail GDPR portability. | [`06-privacy-and-gdpr.md`](./06-privacy-and-gdpr.md) |

---

## Verification

```bash
# Raw per-user sql.Open
rg -nP 'sql\.Open\([^)]*users[/\\]' --type go | grep -v 'UserDbManager\|tests/'

# Missing UserId column on per-user tables
rg -nP 'CREATE TABLE\s+\w+' db/migrations/users/ | head -20

# Hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../../01-fundamentals/97-acceptance-criteria.md`](../../01-fundamentals/97-acceptance-criteria.md) — Split-DB fundamentals
- [`../04-rbac-casbin/97-acceptance-criteria.md`](../04-rbac-casbin/97-acceptance-criteria.md) — Authorization
- [`../../../06-seedable-config-architecture/01-fundamentals/97-acceptance-criteria.md`](../../../06-seedable-config-architecture/01-fundamentals/97-acceptance-criteria.md) — Configurable pool/TTL

---

*Curated 2026-04-25 — closes A-25 (batch 14). Replaces v0.1.0 stub.*


---

## Fixtures

Fixtures for every AT row in this file are covered by the global P2g sweep — see [`../../../97a-acceptance-criteria-fixtures.md`](../../../97a-acceptance-criteria-fixtures.md) (apply the matching pattern by section).
