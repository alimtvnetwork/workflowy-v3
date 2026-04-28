# ADR-0006: Migrate spec SQL fragments to singular DDL identifiers

## Status

`Accepted` — 2026-04-28

## Context

ADR-0001 ratified that all DDL identifiers in `spec/` MUST be **singular
PascalCase** (`Item`, `User`, `Mirror`, `Session`, `Template`,
`Permission`). Plural English is allowed only in **prose**, never inside
a SQL fence, code fragment, or fixture cell.

The P48 sweep (see `_LEDGER-P48-PLURAL-DDL-SWEEP.md` §C) inventoried
**16 spec files** that still contained SQL fragments using plural
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

3. Column identifiers (`ItemId`, `MirrorId`, `DeletedAt`, etc.) are
   already singular and remain unchanged.

4. **Prose remains unchanged.** Sentences like *"the Items table holds
   …"* stay plural; only SQL/DDL/code fences and fixture cells citing
   SQL are rewritten. This preserves the alias rule from ADR-0001.

5. **Gate `G-04-NO-DDL-PLURALS`** is hereby promoted from
   *"applies to new content"* to *"applies to **all** content in
   `spec/`"*, with **zero grandfathered exceptions** after this ADR
   lands.

6. **Spec↔Code Alias Bridge** — implementation code MAY still use ORM
   model names that pluralise (e.g. an Eloquent `Items` model class).
   ADR-0006 governs spec text only; the bridge entry in
   `spec/04-database-conventions/` remains authoritative for
   implementation.

## Consequences

### Positive

- **ADR-0001 fully enforced** — no grandfathered SQL plurals remain,
  removing the last pattern-match risk for AIs generating new SQL by
  imitation.
- **Gate `G-04-NO-DDL-PLURALS` becomes binary** — any plural identifier
  inside a SQL fence is now a hard violation everywhere in `spec/`.
- **Acceptance-criteria fixtures stay self-consistent** — their cited
  SQL now matches the DDL chapters byte-for-byte.

### Negative

- One-time large diff across 16 files (~41 textual sites). Risk
  mitigated by `_LEDGER-P48-PLURAL-DDL-SWEEP.md` providing the exact
  inventory and by an automated regex pass with verification.
- ORM-class plurality (`Items`) and DDL-table singularity (`Item`) now
  diverge by one letter across the alias bridge — minor cognitive
  overhead for new contributors.

## Alternatives Considered

1. **Keep plural-table SQL grandfathered indefinitely** — rejected:
   leaves a permanent pattern-imitation hazard and renders the
   `G-04-NO-DDL-PLURALS` gate effectively unenforceable on the very
   files it was written to govern.
2. **Rewrite the DDL itself to plural** (supersede ADR-0001) — rejected:
   ADR-0001's reasoning (singular = one-row-per-name SSOT, matches the
   `Item` interface) still holds, and superseding it would force a much
   larger rewrite of every `CREATE TABLE`, every `ItemId` foreign-key
   name, and the entire `04-database-conventions/` chapter.

## Gates Touched

- `G-04-NO-DDL-PLURALS` — promoted from *"new content only"* to
  *"all `spec/` content, no grandfathering"*.
- `G-04-ALIAS-DDL-CANONICAL` — strengthened: SQL fragments must now
  match the canonical singular identifier in every spec page.
- DDL identifiers locked: `Item`, `User`, `Mirror`, `Session`,
  `Template`, `Permission`.

## Supersedes / Superseded-By

- **Supersedes:** (none — refines ADR-0001 without replacing it).
- **Superseded-By:** (none).
