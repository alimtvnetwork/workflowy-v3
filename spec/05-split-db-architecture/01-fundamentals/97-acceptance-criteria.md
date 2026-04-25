# Split DB Architecture — Fundamentals — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 15 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-SPLITDBFUNDAMENTALS-01` … `AT-SPLITDBFUNDAMENTALS-15`

---

## Criteria

### Terminology & concepts (file 01)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-SPLITDBFUNDAMENTALS-01 | The terminology in §01 is the SSOT for **Root DB**, **Domain DB**, **History DB**, **Cache DB**; alternative names (e.g., "main DB") in other specs MUST be reconciled to these. | [`01-terminology-and-concepts.md`](./01-terminology-and-concepts.md) |
| AT-SPLITDBFUNDAMENTALS-02 | The architecture supports a 2-, 3-, OR 4-layer hierarchy (root → domain [→ scope [→ user]]); deeper hierarchies are forbidden. | [`01-terminology-and-concepts.md`](./01-terminology-and-concepts.md) |

### Root schema & DB types (file 02)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-SPLITDBFUNDAMENTALS-03 | The Root DB tables and the supported DB-type enum are defined in §02; adding a new DB type requires a doc bump AND an update to the `DbManager` factory. | [`02-root-schema-and-types.md`](./02-root-schema-and-types.md) |
| AT-SPLITDBFUNDAMENTALS-04 | Each DB type has a documented retention policy (forever / N days / per-action); a DB type without retention metadata fails review. | [`02-root-schema-and-types.md`](./02-root-schema-and-types.md) |

### Concurrency & locking (file 03)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-SPLITDBFUNDAMENTALS-05 | All SQLite databases run in **WAL mode**; `journal_mode = DELETE` (default) is forbidden in production. | [`03-concurrency-and-locking.md`](./03-concurrency-and-locking.md) |
| AT-SPLITDBFUNDAMENTALS-06 | Connection pooling is per-database (NOT one global pool); the documented pool-size policy in §03 applies uniformly. | [`03-concurrency-and-locking.md`](./03-concurrency-and-locking.md) |

### Backup & recovery (file 04)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-SPLITDBFUNDAMENTALS-07 | Incremental backup uses SQLite's online backup API (NOT file copy); WAL-checkpoint is performed before backup snapshot. | [`04-backup-and-recovery.md`](./04-backup-and-recovery.md) |
| AT-SPLITDBFUNDAMENTALS-08 | Point-in-time recovery is supported per DB (not just root) via the documented WAL-archive policy in §04. | [`04-backup-and-recovery.md`](./04-backup-and-recovery.md) |

### Go implementation — DbManager (file 05)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-SPLITDBFUNDAMENTALS-09 | All DB access goes through the `DbManager` interface; direct `sql.Open` / `sqlite3.Open` outside the manager is forbidden. | [`05-go-implementation.md`](./05-go-implementation.md), [`../../02-coding-guidelines/03-golang/04-golang-standards-reference/97-acceptance-criteria.md`](../../02-coding-guidelines/03-golang/04-golang-standards-reference/97-acceptance-criteria.md) |
| AT-SPLITDBFUNDAMENTALS-10 | `GetOrCreateDb(type, scope) (*Db, error)` is idempotent — concurrent calls with the same `(type, scope)` return the same handle and never trigger duplicate-create races. | [`05-go-implementation.md`](./05-go-implementation.md) |

### Paths & lifecycle (file 07)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-SPLITDBFUNDAMENTALS-11 | DB file paths follow the canonical pattern `<root>/<type>/<scope-slug>/<name>.db`; raw filesystem paths constructed in business code are forbidden. | [`07-paths-and-lifecycle.md`](./07-paths-and-lifecycle.md) |
| AT-SPLITDBFUNDAMENTALS-12 | Slug generation is deterministic (lowercased, normalized, hashed if length > N); a non-deterministic slug fails review. | [`07-paths-and-lifecycle.md`](./07-paths-and-lifecycle.md) |
| AT-SPLITDBFUNDAMENTALS-13 | DB lifecycle (create → active → archived → purged) is documented in §07; transitions out of order (e.g., active → purged without archive) fail review. | [`07-paths-and-lifecycle.md`](./07-paths-and-lifecycle.md) |

### Import / Export (file 08)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-SPLITDBFUNDAMENTALS-14 | Export ZIP contains **selective** content by type (export "history only", "cache only", or "everything"); the manifest inside the ZIP enumerates included types. | [`08-import-export.md`](./08-import-export.md) |

### Logging & references (file 09)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-SPLITDBFUNDAMENTALS-15 | DB operations emit structured logs with fields: `dbType`, `scope`, `operation`, `durationMs`, `rowsAffected`; printf-style log lines are forbidden. | [`09-logging-benefits-references.md`](./09-logging-benefits-references.md), [`../../03-error-manage/02-error-architecture/07-logging-and-diagnostics/02-session-based-logging/97-acceptance-criteria.md`](../../03-error-manage/02-error-architecture/07-logging-and-diagnostics/02-session-based-logging/97-acceptance-criteria.md) |

---

## Verification

```bash
# Direct sql.Open / sqlite3.Open outside DbManager
rg -n 'sql\.Open|sqlite3\.Open' --type go server/ | grep -v 'internal/db/manager'

# Hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../02-features/`](../02-features/) — Feature-level specs (RBAC, user-scoped, CLI)
- [`../../02-coding-guidelines/03-golang/04-golang-standards-reference/97-acceptance-criteria.md`](../../02-coding-guidelines/03-golang/04-golang-standards-reference/97-acceptance-criteria.md) — Go standards
- [`../../03-error-manage/02-error-architecture/07-logging-and-diagnostics/02-session-based-logging/97-acceptance-criteria.md`](../../03-error-manage/02-error-architecture/07-logging-and-diagnostics/02-session-based-logging/97-acceptance-criteria.md) — Logging

---

*Curated 2026-04-25 — closes A-21 (batch 10). Replaces v0.1.0 stub.*
