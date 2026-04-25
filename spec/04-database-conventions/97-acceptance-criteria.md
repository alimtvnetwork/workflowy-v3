# Database Conventions — Acceptance Criteria

> **Version:** 2.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## Purpose

Top-level rollup of testable acceptance criteria for the entire `04-database-conventions/` tree. Anchors the PascalCase Golden Rule end-to-end: schema → ORM → REST API → frontend types.

ID format: `AT-DATABASECONVENTIONS-NN`.

---

## Criteria

### Naming Conventions (AT-DATABASECONVENTIONS-01..03)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-DATABASECONVENTIONS-01 | Every table name is PascalCase singular (e.g. `User`, `LogEntry`); plural or snake_case names are forbidden. | [`01-naming-conventions.md`](./01-naming-conventions.md) |
| AT-DATABASECONVENTIONS-02 | Every column name is PascalCase (e.g. `Id`, `CreatedAt`, `UserId`); identical to the REST JSON key it serializes to. | [`01-naming-conventions.md`](./01-naming-conventions.md) + [`06-rest-api-format/97-acceptance-criteria.md`](./06-rest-api-format/97-acceptance-criteria.md) |
| AT-DATABASECONVENTIONS-03 | Foreign-key columns use `<ReferencedTable>Id` form (e.g. `UserId`, `ParentId`); index/constraint names follow the documented prefix rules. | [`01-naming-conventions.md`](./01-naming-conventions.md) |

### Schema Design (AT-DATABASECONVENTIONS-04..06)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-DATABASECONVENTIONS-04 | Every table has `Id` (primary key), `CreatedAt`, `UpdatedAt`; soft-deleted tables also have `DeletedAt`. | [`02-schema-design.md`](./02-schema-design.md) |
| AT-DATABASECONVENTIONS-05 | Enum-backed columns store the enum's underlying value (TEXT for string-backed, INTEGER for int-backed); a CHECK constraint or trigger enforces validity. | [`02-schema-design.md`](./02-schema-design.md) + [`spec/20-enums-index.md`](../20-enums-index.md) |
| AT-DATABASECONVENTIONS-06 | Every nullable column is justified in the schema doc; defaulting to NOT NULL is the documented preference. | [`02-schema-design.md`](./02-schema-design.md) |

### ORM & Views (AT-DATABASECONVENTIONS-07..08)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-DATABASECONVENTIONS-07 | ORM struct fields match column names exactly (PascalCase, identical spelling); JSON tags also use PascalCase. | [`03-orm-and-views.md`](./03-orm-and-views.md) |
| AT-DATABASECONVENTIONS-08 | Views follow the same naming rules as tables and are documented alongside the tables they aggregate. | [`03-orm-and-views.md`](./03-orm-and-views.md) |

### Testing (AT-DATABASECONVENTIONS-09..10)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-DATABASECONVENTIONS-09 | Every migration has a forward + rollback test; a CI check runs them on a clean SQLite instance. | [`04-testing-strategy.md`](./04-testing-strategy.md) |
| AT-DATABASECONVENTIONS-10 | Test fixtures load via the documented seed-data mechanism; ad-hoc INSERTs in tests are forbidden. | [`04-testing-strategy.md`](./04-testing-strategy.md) |

### Relationships (AT-DATABASECONVENTIONS-11)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-DATABASECONVENTIONS-11 | The relationship diagrams in `05-relationship-diagrams.md` reflect the live schema; a CI check fails if a diagram references a missing table or column. | [`05-relationship-diagrams.md`](./05-relationship-diagrams.md) |

### REST API Format (AT-DATABASECONVENTIONS-12)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-DATABASECONVENTIONS-12 | Every REST API response key is PascalCase, end-to-end, per the Golden Rule. Detailed criteria live in the subsection rollup. | [`06-rest-api-format/97-acceptance-criteria.md`](./06-rest-api-format/97-acceptance-criteria.md) |

### Split-DB Pattern (AT-DATABASECONVENTIONS-13)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-DATABASECONVENTIONS-13 | When the split-DB pattern is used, the partition key, replication strategy, and consistency model are explicitly documented per dataset. | [`07-split-db-pattern.md`](./07-split-db-pattern.md) |

---

## Verification

```bash
grep -rn "AT-DATABASECONVENTIONS-" spec/04-database-conventions/
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Section overview
- [`06-rest-api-format/97-acceptance-criteria.md`](./06-rest-api-format/97-acceptance-criteria.md) — REST format detail
- [`../03-error-manage/02-error-architecture/05-response-envelope/97-acceptance-criteria.md`](../03-error-manage/02-error-architecture/05-response-envelope/97-acceptance-criteria.md) — Universal envelope
- [`spec/19-glossary.md`](../19-glossary.md) — Terminology SSOT
- [`spec/20-enums-index.md`](../20-enums-index.md) — Enum registry

*Curated v2.0.0 — 2026-04-25 (UTC+8). Replaced auto-generated H-2.1 scaffold.*
