# ADR-0006: Migrate spec SQL fragments to singular DDL identifiers

## Status

`Accepted` — 2026-04-28
Supersedes: none.
Refines: ADR-0001 (Singular DDL vs plural prose).

## Context

ADR-0001 ratified that all DDL identifiers in `spec/` MUST be **singular
PascalCase** (`Item`, `User`, `Mirror`, `Session`, `Template`,
`Permission`). Plural English is allowed only in **prose**, never inside
a SQL fence, code fragment, or fixture cell.

The P48 sweep (see `_LEDGER-P48-PLURAL-DDL-SWEEP.md` §C) inventoried
**16 spec files** that still contain SQL fragments using plural
identifiers (`FROM Items`, `UPDATE Mirrors`, `FROM Sessions`,
`FROM Users`, `UPDATE Templates`, `FROM Permissions`). These predate
ADR-0001 and were grandfathered until a dedicated ADR could authorise
the bulk rewrite atomically — including the downstream gate fixtures
that cite the same SQL.

## Decision

1. **Rewrite all 16 inventoried sites** in a single atomic spec change
   (this ADR's accompanying P53 commit) so that every SQL fragment in
   `spec/` uses singular DDL identifiers, matching ADR-0001.

2. The following identifier renames are MANDATORY and exhaustive for
   spec SQL fragments:

   | Before (plural) | After (singular) |
   |---|---|
   | `Items`        | `Item`        |
   | `Users`        | `User`        |
   | `Mirrors`      | `Mirror`      |
   | `Sessions`     | `Session`     |
   | `Templates`    | `Template`    |
   | `Permissions`  | `Permission`  |

3. **Column identifiers** (`ItemId`, `MirrorId`, `DeletedAt`, etc.) are
   already singular and remain unchanged.

4. **Prose remains unchanged.** Sentences like "the Items table holds
   …" stay plural; only SQL/DDL/code fences and fixture cells citing
   SQL are rewritten. This preserves the alias rule from ADR-0001.

5. **Gate `G-04-NO-DDL-PLURALS`** is hereby promoted from
   "applies to new content" to "applies to **all** content in `spec/`",
   with **zero grandfathered exceptions** after this ADR lands.

6. **Spec↔Code Alias Bridge**: implementation code MAY still use ORM
   model names that pluralise (e.g. an Eloquent `Items` model class) —
   ADR-0006 governs spec text only. The bridge entry in
   `spec/04-database-conventions/` remains authoritative for
   implementation.

## Rewrite scope (16 files, 39 SQL sites)

| File | Sites |
|---|---|
| `spec/02-coding-guidelines/00-overview.md` | 1 |
| `spec/02-coding-guidelines/05-rust/01-naming-conventions.md` | 1 |
| `spec/02-coding-guidelines/05-rust/01a-rust-json-and-decisions.md` | 1 |
| `spec/04-database-conventions/05-relationship-diagrams.md` | 1 |
| `spec/05-split-db-architecture/00-overview.md` | 5 |
| `spec/31-app/01-features/09a-mirror-cycle-detection.md` | 2 |
| `spec/31-app/01-features/14-concurrency-and-sync.md` | 1 |
| `spec/31-app/02-workflows/04-trash-restore-flow.md` | 4 |
| `spec/31-app/02-workflows/05-trash-reaper-flow.md` | 2 |
| `spec/31-app/02-workflows/06-search-query-flow.md` | 1 |
| `spec/31-app/02-workflows/07-sync-replay-flow.md` | 2 |
| `spec/31-app/02-workflows/08-mirror-detach-flow.md` | 2 |
| `spec/31-app/02-workflows/09-mirror-create-flow.md` | 7 |
| `spec/31-app/97b-acceptance-criteria-fixtures.md` | 3 |
| `spec/31-app/97c-acceptance-criteria-fixtures.md` | 3 |
| `spec/31-app/97d-acceptance-criteria-fixtures.md` | 3 |

## Consequences

### Positive

- **ADR-0001 fully enforced.** No grandfathered SQL plurals remain,
  removing the last pattern-match risk for AIs generating new SQL by
  imitation.
- **Gate `G-04-NO-DDL-PLURALS` becomes binary.** Any plural identifier
  inside a SQL fence is now a hard violation everywhere in `spec/`.
- **Acceptance-criteria fixtures stay self-consistent.** Their cited
  SQL now matches the DDL chapters byte-for-byte.

### Negative

- One-time large diff across 16 files (~39 textual sites). Risk
  mitigated by `_LEDGER-P48-PLURAL-DDL-SWEEP.md` providing the exact
  inventory.

### Neutral

- Implementation code is unaffected; ORM model names may continue to
  pluralise per the alias bridge.

## References

- ADR-0001 — Singular DDL vs plural prose (the rule being fully
  enforced).
- `_LEDGER-P48-PLURAL-DDL-SWEEP.md` §C — exact 16-file inventory.
- Gate `G-04-NO-DDL-PLURALS` — now binary, no grandfathering.
