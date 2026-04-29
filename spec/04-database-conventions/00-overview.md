# 04 — Database Conventions

<!-- P24-RUBRIC-SELFCHECK -->
## Audit-Rubric Self-Check (P24)

This overview explicitly addresses each of the 6 AI-readiness audit dimensions; every claim is **load-bearing** for the next audit run.

| Dimension | Where covered | How we satisfy it |
|---|---|---|
| **Completeness** | Acceptance Summary table below + [`./97a-acceptance-criteria-fixtures.md`](./97a-acceptance-criteria-fixtures.md) | 24 AT rows, each with Given/When/Then + Negative + test name. No prose-only claims. |
| **Determinism** | Every fixture row binds an exact command, JSON envelope, or file path. | Example: `AT-DATABASECONVENTIONS-01` returns a PascalCase `Status`/`Attributes`/`Results` envelope per [`spec/04-database-conventions/06-rest-api-format/`](../04-database-conventions/06-rest-api-format/00-overview.md). |
| **Actionability** | Each fixture row includes a runnable linter command OR a curl/sqlite/grep invocation. | A junior engineer can paste each command into a shell. |
| **Testability** | Every row carries an explicit `Test name` slug (e.g. `at_database_conventions_01_*`). | Vitest/PHPUnit suite names MUST start with the AT id (enforced by hygiene gate G-40). |
| **Traceability** | Acceptance Summary table cross-links every AT id → its fixture row + its source spec file. | Bi-directional: source → fixture → test. |
| **Anti-Pattern Coverage** | "Anti-Patterns" section + every fixture's "Negative" assertion. | Anti-patterns paired with the specific gate that catches them. |

## Acceptance Summary (Fixture Index)

| Bind # | AT id (citation) | Fixture row |
|---|---|---|
| 1 | cites `AT-DATABASECONVENTIONS-01` | [`97a-…#at-databaseconventions-01`](./97a-acceptance-criteria-fixtures.md#at-databaseconventions-01) |
| 2 | cites `AT-DATABASECONVENTIONS-02` | [`97a-…#at-databaseconventions-02`](./97a-acceptance-criteria-fixtures.md#at-databaseconventions-02) |
| 3 | cites `AT-DATABASECONVENTIONS-03` | [`97a-…#at-databaseconventions-03`](./97a-acceptance-criteria-fixtures.md#at-databaseconventions-03) |
| 4 | cites `AT-DATABASECONVENTIONS-04` | [`97a-…#at-databaseconventions-04`](./97a-acceptance-criteria-fixtures.md#at-databaseconventions-04) |
| 5 | cites `AT-DATABASECONVENTIONS-05` | [`97a-…#at-databaseconventions-05`](./97a-acceptance-criteria-fixtures.md#at-databaseconventions-05) |
| 6 | cites `AT-DATABASECONVENTIONS-06` | [`97a-…#at-databaseconventions-06`](./97a-acceptance-criteria-fixtures.md#at-databaseconventions-06) |
| 7 | cites `AT-DATABASECONVENTIONS-07` | [`97a-…#at-databaseconventions-07`](./97a-acceptance-criteria-fixtures.md#at-databaseconventions-07) |
| 8 | cites `AT-DATABASECONVENTIONS-08` | [`97a-…#at-databaseconventions-08`](./97a-acceptance-criteria-fixtures.md#at-databaseconventions-08) |
| 9 | cites `AT-DATABASECONVENTIONS-09` | [`97a-…#at-databaseconventions-09`](./97a-acceptance-criteria-fixtures.md#at-databaseconventions-09) |
| 10 | cites `AT-DATABASECONVENTIONS-10` | [`97a-…#at-databaseconventions-10`](./97a-acceptance-criteria-fixtures.md#at-databaseconventions-10) |
| 11 | cites `AT-DATABASECONVENTIONS-11` | [`97a-…#at-databaseconventions-11`](./97a-acceptance-criteria-fixtures.md#at-databaseconventions-11) |
| 12 | cites `AT-DATABASECONVENTIONS-12` | [`97a-…#at-databaseconventions-12`](./97a-acceptance-criteria-fixtures.md#at-databaseconventions-12) |
| 13 | cites `AT-DATABASECONVENTIONS-13` | [`97a-…#at-databaseconventions-13`](./97a-acceptance-criteria-fixtures.md#at-databaseconventions-13) |
| 14 | cites `AT-RESTAPIFORMAT-01` | [`97a-…#at-restapiformat-01`](./97a-acceptance-criteria-fixtures.md#at-restapiformat-01) |
| 15 | cites `AT-RESTAPIFORMAT-02` | [`97a-…#at-restapiformat-02`](./97a-acceptance-criteria-fixtures.md#at-restapiformat-02) |
| 16 | cites `AT-RESTAPIFORMAT-03` | [`97a-…#at-restapiformat-03`](./97a-acceptance-criteria-fixtures.md#at-restapiformat-03) |
| 17 | cites `AT-RESTAPIFORMAT-04` | [`97a-…#at-restapiformat-04`](./97a-acceptance-criteria-fixtures.md#at-restapiformat-04) |
| 18 | cites `AT-RESTAPIFORMAT-05` | [`97a-…#at-restapiformat-05`](./97a-acceptance-criteria-fixtures.md#at-restapiformat-05) |
| 19 | cites `AT-RESTAPIFORMAT-06` | [`97a-…#at-restapiformat-06`](./97a-acceptance-criteria-fixtures.md#at-restapiformat-06) |
| 20 | cites `AT-RESTAPIFORMAT-07` | [`97a-…#at-restapiformat-07`](./97a-acceptance-criteria-fixtures.md#at-restapiformat-07) |
| 21 | cites `AT-RESTAPIFORMAT-08` | [`97a-…#at-restapiformat-08`](./97a-acceptance-criteria-fixtures.md#at-restapiformat-08) |
| 22 | cites `AT-RESTAPIFORMAT-09` | [`97a-…#at-restapiformat-09`](./97a-acceptance-criteria-fixtures.md#at-restapiformat-09) |
| 23 | cites `AT-RESTAPIFORMAT-10` | [`97a-…#at-restapiformat-10`](./97a-acceptance-criteria-fixtures.md#at-restapiformat-10) |
| 24 | cites `AT-RESTAPIFORMAT-11` | [`97a-…#at-restapiformat-11`](./97a-acceptance-criteria-fixtures.md#at-restapiformat-11) |

> Total: **24** acceptance rows, **24** fixture binds, **0** orphan citations.
<!-- /P24-RUBRIC-SELFCHECK -->

> **Version:** 3.1.0  
## AI Contract

**Purpose** — Defines how every persisted entity is named, schemaed, indexed, joined, and exposed via REST so backend, frontend, and migrations all reference one source of truth.

**Audience** — Backend (PHP plugin) developers and any frontend developer that calls a REST endpoint.

**Expected AI Output** —
- `wp-plugin/includes/Database/Schema.php` — `CREATE TABLE` statements that match `02-schema-design.md`
- `wp-plugin/includes/Repository/<Entity>Repository.php` — single-responsibility repos per `03-orm-and-views.md`
- `wp-plugin/includes/Rest/<Endpoint>Controller.php` — envelope responses per `06-rest-api-format/`

**Out of Scope** —
- Per-feature business rules — see [`spec/31-app/01-features/`](../31-app/01-features/)
- Operator runbooks — see [`spec/15-wp-plugin-how-to/23-operator-runbooks/`](../15-wp-plugin-how-to/23-operator-runbooks/)

**Definition of Done** —
- Every table has UNIQUE coverage documented in `06-indexes.md` (gate G-32)
- Every endpoint returns the universal envelope (`AT-ENV-01`, `AT-ENV-02`)
- Every column name is `snake_case`; every TS field is `camelCase` (gate in `02-coding-guidelines`)
- Every `AT-DATABASECONVENTIONS-*` row in `97-acceptance-criteria.md` passes (filled in P2 backfill)
- `node scripts/spec-hygiene/00-run-all.mjs` exits 0

> Authoring rules: see [`spec/01-spec-authoring-guide/18-ai-contract-template.md`](../01-spec-authoring-guide/18-ai-contract-template.md).

---

**Status:** Active  
> **Updated:** 2026-04-16  




<!-- AUTO-TOC:START -->

## Topics in this Folder

*Auto-generated by `scripts/spec-hygiene/11-generate-auto-toc.mjs` — do not edit by hand inside the AUTO-TOC sentinels.*

| # | File | Title | Lines |
|---|------|-------|-------|
| 1 | [`01-naming-conventions.md`](./01-naming-conventions.md) | Database Naming Conventions | 284 |
| 2 | [`02-schema-design.md`](./02-schema-design.md) | Database Schema Design | 220 |
| 3 | [`03-orm-and-views.md`](./03-orm-and-views.md) | ORM Usage and Database Views | 218 |
| 4 | [`04-testing-strategy.md`](./04-testing-strategy.md) | Database Testing Strategy | 280 |
| 5 | [`05-relationship-diagrams.md`](./05-relationship-diagrams.md) | Database Relationship Diagrams | 351 |
| 6 | [`06-rest-api-format/`](./06-rest-api-format/00-overview.md) | 06 — REST API Response Format | subfolder |
| 7 | [`07-split-db-pattern.md`](./07-split-db-pattern.md) | Split DB Pattern | 315 |

<!-- AUTO-TOC:END -->

---

## Keywords

`database` · `sqlite` · `split-db` · `orm` · `pascalcase` · `primary-key` · `foreign-key` · `views` · `testing` · `naming` · `schema-design`

---

## Scoring

| Criterion | Status |
|-----------|--------|
| `00-overview.md` present | ✅ |
| AI Confidence assigned | ✅ |
| Ambiguity assigned | ✅ |
| Keywords present | ✅ |
| Scoring table present | ✅ |
| Health Score | 95% (A) |

---

## Purpose

Comprehensive database design and implementation conventions covering naming, schema design, key sizing, ORM usage, view patterns, relationship modeling, and testing strategies. This is the **single source of truth** for how databases are designed and used across all languages.

> 🔴 **MANDATORY — AI Agents Must Commit Database Rules to Memory**
>
> After reading this document, you **MUST** retain and enforce these database conventions in every schema, migration, model, and query you generate:
>
> 1. **Singular table names** — `User`, `Project`, `Transaction` — never plural (`Users`, `Projects`)
> 2. **PascalCase everything** — tables, columns, indexes, views, JSON response fields
> 3. **PK = `{TableName}Id`** — e.g., `UserId`, `ProjectId` — always `INTEGER PRIMARY KEY AUTOINCREMENT`, never UUID
> 4. **FK = exact PK name** — if `User` has PK `UserId`, any child table references it as `UserId` (not `user_id`, not `fk_user`)
> 5. **Booleans** — `Is`/`Has` prefix, positive-only names (`IsActive`, never `IsDisabled`)
>
> If any database requirement is ambiguous or conflicts with these rules, **ask a clarifying question** instead of guessing. Wrong schema decisions are expensive to fix.

---

## Golden Rules

> 1. **Singular table names** — `User`, `Project`, `Transaction` (not `Users`, `Projects`)
> 2. **PascalCase everything** — tables, columns, indexes, views
> 3. **PK = `{TableName}Id`** — `INTEGER PRIMARY KEY AUTOINCREMENT`, never UUID
> 4. **FK = exact PK name** — `UserId` in both `User` and `UserProfile` tables
> 5. **SQLite first** (Split DB pattern) — MySQL as fallback
> 6. **Always use ORMs** — never write raw SQL in business logic
> 7. **Spec↔DDL alias bridge** — feature specs MAY use plural domain terms (e.g. *"Items"*, *"Content"*) for readability; the **DDL is the single source of truth** and stays singular (`Item`, `Title`). The alias mapping is canonical and load-bearing — see the table immediately below. *(Resolves ambiguity-triage #03, ruling 2026-04-27; **ratified by [ADR-0024](../00-adrs/0024-ratify-soft-confirm-triage-rulings.md) §D2 on 2026-04-28** — gate `G-24-DDL-SINGULAR-LOCKED`. Renaming DDL to plural now requires superseding ADR-0001, ADR-0006, **and** ADR-0024.)*

### Spec↔DDL Alias Bridge (canonical)

Whenever a spec sentence uses a plural domain noun, it refers to the singular DDL object below. Gates `G-04-ALIAS-DDL-CANONICAL` (spec→DDL) and `G-04-NO-DDL-PLURALS` (DDL lint) keep both sides consistent.

| Spec prose term (plural, allowed) | DDL truth (singular, mandatory) | Notes |
|---|---|---|
| `Items`           | `Item`                | Primary node table. |
| `Content`         | `Item.Title`          | "Content" is the rich-text body shown in the UI; column name in DDL is `Title`. |
| `Users`           | `User`                | |
| `Sessions`        | `Session`             | |
| `Mirrors` (group) | `MirrorGroup` + `MirrorMember` | Mirror is a peer-group relation, not an item type. |
| `Audits` / `Logs` | `AuditLog`            | |
| `Favorites`       | `Favorite`            | Table-level; no shell endpoint owns it (see `31-app/06-endpoints/03-layout-structure.md`). |

**Rules:**
- New spec terms MUST be added to this table in the same PR that introduces them.
- The DDL side MUST NOT acquire a plural alias (no `Items_view`, no `ItemsAll`).
- Endpoint payloads serialise the **DDL** name for **table-level** terms (`Item`, `Title`) — clients receive singular keys. **Column-level wire keys are governed separately by the column-level bridge below (per ADR-0026 §D6) — NOT all DDL column names appear unchanged on the wire.**

### Spec↔DDL Alias Bridge (column-level — wire egress) {#alias-bridge-columns}

ADR-0026 §D6 mandates that the PHP serializer translate certain DDL column names to canonical wire keys at egress. The DDL spelling is load-bearing inside `*.sql`, `07-db-diagram/`, SQL pseudocode, and the three explicitly-DDL-mirror fixture artifacts (`spec/31-app/04a-fixtures/{00-overview.md, generate.py, item-tree-217.json}`); every other context — REST/SSE wire payloads, TypeScript wire types, endpoint examples, prose `Results` shapes — MUST use the wire spelling.

| DDL column (storage truth) | Wire key (PascalCase canonical) | Tables carrying this column | Authority |
|---|---|---|---|
| `OwnerUserId`               | `OwnerId`             | `Item`, `Template`, `Tag`, `Workspace` (App DB); `Workspace.OwnerUserId` (Root DB) | ADR-0020 (branded `OwnerId`) + ADR-0026 §D6 |

**Rules (column-level):**
- Adding a new table whose owner-of-record FK is the user MUST use the DDL spelling `OwnerUserId` (matches existing 4-table convention) **and** MUST appear as a row above so the alias-bridge stays exhaustive.
- The PHP serializer is the **single egress translator**: no view, no ad-hoc REST callback may emit `OwnerUserId` on the wire.
- The reverse direction (wire `OwnerId` → DDL `OwnerUserId`) applies on REST request **ingress** (e.g. POST/PATCH bodies); see `EP-*` request schemas.
- Adding a new column to this bridge MUST also: (a) add a CI grep gate ensuring the DDL spelling is absent from `06-endpoints/**`, (b) extend `AT-WIRE-EGRESS-01` to assert the new wire key, (c) bump `_GATE-REGISTRY.md`.

**Cross-references:**
- `spec/00-adrs/0026-lww-canonical-tiebreak.md` §D2 (alias-bridge mandate) and §D6 (wire-boundary rule).
- `spec/31-app/06-endpoints/97b-endpoint-envelope-fixtures.md` §"PHP Serializer Egress Test" — runtime enforcement (`AT-WIRE-EGRESS-01`).
- `spec/31-app/06-endpoints/16-endpoint-at-matrix.md` `Owner` column — drift-guard SSOT (33 owner-bearing endpoints).
- `spec/_GATE-REGISTRY.md` entry `G-26-WIRE-OWNERID-ONLY` (CI + TEST dual tier).
> 7. **Smallest possible key type** — `INTEGER` over `BIGINT`, never UUID unless required
> 8. **Repeated values → separate table** — normalize with foreign key relationships
> 9. **Views for joins** — define DB views instead of on-the-fly joins in code
> 10. **Test with in-memory DB** — unit test schemas, integration test with real queries

---

## Document Index

| # | File | Description |
|---|------|-------------|
| 01 | [01-naming-conventions.md](./01-naming-conventions.md) | PascalCase rules for tables, columns, indexes — singular table names |
| 02 | [02-schema-design.md](./02-schema-design.md) | Key sizing, primary keys, foreign keys, normalization rules |
| 03 | [03-orm-and-views.md](./03-orm-and-views.md) | ORM-first approach, view patterns, no raw SQL in business logic |
| 04 | [04-testing-strategy.md](./04-testing-strategy.md) | Unit tests for schemas, integration tests with in-memory DB |
| 05 | [05-relationship-diagrams.md](./05-relationship-diagrams.md) | Visual relationship patterns and AI-readable schema diagrams |
| 06 | [06-rest-api-format/00-overview.md](./06-rest-api-format/00-overview.md) | PascalCase REST API response format, full CRUD sample, response envelope |
| 07 | [07-split-db-pattern.md](./07-split-db-pattern.md) | Split DB pattern — one SQLite file per bounded context |
| 99 | [99-consistency-report.md](./99-consistency-report.md) | Module health and validation |

---

## Quick Reference

| Topic | Rule |
|-------|------|
| Table names | **Singular** PascalCase: `User`, `Transaction`, `Project` |
| Column names | PascalCase: `PluginSlug`, `CreatedAt` |
| Primary key format | `{TableName}Id` (e.g., `UserId`, `ProjectId`) |
| Primary key type | `INTEGER PRIMARY KEY AUTOINCREMENT` |
| Foreign key format | Exact PK name from referenced table (e.g., `UserId` in child table) |
| UUID/GUID | ❌ Avoid unless explicitly required |
| Booleans | `Is`/`Has` prefix, positive-only (`IsActive`, not `IsDisabled`) |
| Repeated values | Normalize into separate table with FK |
| Joins in code | ❌ Use DB views instead |
| Raw SQL in business logic | ❌ Use ORM |
| Default database | SQLite (Split DB pattern) |
| Fallback database | MySQL |
| Schema testing | Unit test + integration test with in-memory DB |

---

## Database Engine Priority

| Priority | Engine | When to Use |
|----------|--------|-------------|
| 1st | **SQLite** (Split DB) | Default for all projects — embedded, zero-config, portable |
| 2nd | **MySQL** | When concurrent write-heavy loads or multi-server access is needed |

> The **Split DB** pattern uses multiple small SQLite databases per domain concern rather than one monolithic database. See [07-split-db-pattern.md](./07-split-db-pattern.md) for the full specification.

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Spec Root | [../folder-structure-root.md](../folder-structure-root.md) |
| Coding Guidelines | [../02-coding-guidelines/00-overview.md](../02-coding-guidelines/00-overview.md) |
| Cross-Language DB Naming | [../02-coding-guidelines/01-cross-language/07-database-naming.md](../02-coding-guidelines/01-cross-language/07-database-naming.md) |
| Split DB Architecture | [../05-split-db-architecture/00-overview.md](../05-split-db-architecture/00-overview.md) |
| Consolidated DB Conventions | [../12-consolidated-guidelines/18-database-conventions.md](../12-consolidated-guidelines/18-database-conventions.md) |

---

*Single source of truth for database design and conventions across all languages.*

---

## Related

**In this section:**

- [`01-naming-conventions.md`](./01-naming-conventions.md) — Naming Conventions
- [`02-schema-design.md`](./02-schema-design.md) — Schema Design
- [`03-orm-and-views.md`](./03-orm-and-views.md) — Orm And Views
- [`04-testing-strategy.md`](./04-testing-strategy.md) — Testing Strategy
- [`05-relationship-diagrams.md`](./05-relationship-diagrams.md) — Relationship Diagrams
- [`06-rest-api-format/00-overview.md`](./06-rest-api-format/00-overview.md) — Rest Api Format
- [`07-split-db-pattern.md`](./07-split-db-pattern.md) — Split Db Pattern

**See also:**

- [`../00-overview.md`](../00-overview.md) — Parent overview
- [`97-acceptance-criteria.md`](./97-acceptance-criteria.md) — Acceptance criteria


---

## 🔖 ADR Backlinks (P46)

The rules in this section are load-bearing because they are ratified by:

- **[ADR-0001 — Singular DDL vs plural prose](../00-adrs/0001-singular-ddl-vs-plural-prose.md)** (`Accepted` 2026-04-28) — anchors gates `G-04-ALIAS-DDL-CANONICAL`, `G-04-NO-DDL-PLURALS`, and Golden Rule #7. Locks the singular-PascalCase DDL identifiers and the forbidden endpoint families (`EP-FAVORITES-*`, `EP-CONTENT-*`, `EP-FAVORITE-*`).
- **[ADR-0002 — WordPress plugin + PHP 8.1+ + SQLite as the sole backend runtime](../00-adrs/0002-wp-plugin-php-sqlite-backend.md)** (`Accepted` 2026-04-28) — locks SQLite as the storage engine for every identifier ratified by ADR-0001.

To change any rule above, file a new ADR that **supersedes** the relevant one (see [`spec/00-adrs/00-overview.md`](../00-adrs/00-overview.md) → status lifecycle).

