---
slug: g32-ddl-unique-coverage-gate
version: 2.0.0
updated: 2026-04-27
parent: ../../05-conventions/02-ci-quality-gates.md
status: canonical
gate_id: G-32
---

# G-32 — DDL ↔ Doc Index Coverage Gate

> **Version:** 2.0.0
> **Updated:** 2026-04-27 (UTC+8)
> **Parent:** [`02-ci-quality-gates.md`](./02-ci-quality-gates.md)
> **Sibling:** [`24-g31-workflow-xref-reciprocity-gate.md`](./24-g31-workflow-xref-reciprocity-gate.md)
> **Runner:** [`scripts/spec-hygiene/32-check-ddl-unique-coverage.mjs`](../../../scripts/spec-hygiene/32-check-ddl-unique-coverage.mjs)

---

## Sub-checks

| ID       | Direction | Question                                                                  | Added in |
|----------|-----------|---------------------------------------------------------------------------|----------|
| G-32.1   | forward   | Does every DDL `UNIQUE` declaration appear in `06-indexes.md`?            | v1.0.0   |
| G-32.2   | reverse   | Does every `Idx*` / `sqlite_autoindex_*` name in `06-indexes.md` resolve to an explicit DDL index, a UNIQUE-implied autoindex, or a documented alias? | v2.0.0   |

G-32.2 closes the symmetric gap: F26 caught the **fabricated-column**
class (UNIQUE in DDL but cited the wrong column name in docs); G-32.2
catches the **fabricated-index** class (a name written into prose with
no DDL backing whatsoever — exactly the F26 ambiguity #23 root cause if
nobody had spotted it manually).

---

## Why this gate exists

F26 (2026-04-27) audited UNIQUE declarations across `01-root-schema.sql`
and `02-app-schema.sql` and found **3 critical bugs** + 6 documentation
gaps (only 3/13 declarations were correctly documented). Triage showed:

1. **Fabricated soft-delete columns** referenced in `06-indexes.md` but
   absent from DDL — `MirrorPeerGroupMember.DetachedAt` and
   `MirrorPeerGroup.DissolvedAt` were both ghost references from a
   pre-B1-pivot design (when detach/dissolve used soft-delete instead of
   row-DELETE via trigger). See ambiguity #23.
2. **Explicit `CREATE UNIQUE INDEX` rows** added to DDL but never
   documented — `IdxUserRole_User_Role` was created in line 97 of
   `01-root-schema.sql` but had zero mentions in `06-indexes.md`.
3. **Misclassified UNIQUE-side-effect indexes** documented as "required
   indexes" — `IdxUser_Email` was wrongly listed in the Required-Indexes
   table even though no `CREATE INDEX IdxUser_Email` exists in DDL (the
   uniqueness comes from `User.Email TEXT UNIQUE`, backed by the
   automatic `sqlite_autoindex_User_*`). F26 moved it to a new
   §Implicit Indexes subsection.

Without an automated check, this drift class re-accumulates whenever
DDL is edited or `06-indexes.md` is reorganised. G-32 prevents silent
regression by failing CI on any UNIQUE declaration that lacks a
documented backing index in `06-indexes.md`.

---

## Scope

| # | Path | Filter | Notes |
|---|------|--------|-------|
| 1 | `spec/31-app/07-db-diagram/sql/01-root-schema.sql` | All UNIQUE statements | Root DB schema (Workspace, User, RoleType, etc.) |
| 2 | `spec/31-app/07-db-diagram/sql/02-app-schema.sql` | All UNIQUE statements | Per-workspace App DB schema |
| — | `spec/31-app/07-db-diagram/06-indexes.md` | Documentation target | Single-file scan for backing-index name presence |

The runner parses three syntactic forms of UNIQUE in the DDL files:

- **Column-level**: `ColName TYPE … UNIQUE` (e.g. `Email TEXT NOT NULL UNIQUE`)
- **Table-level**: `UNIQUE(Col1, Col2, …)` (e.g. `UNIQUE(MirrorGroupId, ItemId)`)
- **Explicit**: `CREATE UNIQUE INDEX [IF NOT EXISTS] IdxName ON Table(Cols)`

---

## Algorithm

```
1. Read 06-indexes.md as a single string (the documentation target).
2. For each schema file:
     a. Read line by line, tracking the most recent CREATE TABLE
        statement to attribute UNIQUE declarations to a table.
     b. Detect each UNIQUE form (column / table / explicit) and
        record source file:line for diagnostics.
3. For every parsed declaration D:
     a. Compute candidate documentation names:
          - Explicit:    [IndexName]
          - Column/Table: [Idx{Table}_{Cols joined by _},
                          sqlite_autoindex_{Table}]
     b. If D's `key` is in COVERAGE_EXEMPT, skip.
     c. If NONE of the candidate names appear as a substring in
        06-indexes.md, report D as undocumented.
4. Print summary + per-violation hint.
5. Exit 0 if zero violations, else exit 1.
```

The substring match is intentionally permissive — `06-indexes.md` may
mention the index in a Required-Indexes table, an Implicit-Indexes
subsection, a Mermaid flowchart node, or prose. Any single mention
satisfies the gate.

---

## Allow-list (`COVERAGE_EXEMPT`)

Empty as of v1.0.0. Authors who want to document a UNIQUE declaration
elsewhere (e.g. inside an authentication-flow spec rather than the
indexes file) MUST add the decl key as a string entry with a one-line
`// rationale` comment:

```js
const COVERAGE_EXEMPT = new Set([
  "01-root-schema.sql:User(Email):docs-in-auth-spec",
  // (reason: User.Email uniqueness is described in 15-roles-and-permissions.md
  //  alongside the login flow; cross-referencing in 06-indexes.md would
  //  duplicate without adding value)
]);
```

The decl key format is `${fileBase}:${signature}` where signature is:
- `Table(Col1,Col2,…)` for column/table UNIQUE
- `explicit:IndexName` for explicit `CREATE UNIQUE INDEX`

This mirrors the F27 G-30.2 `REDUNDANCY_ALLOWLIST` and F29 G-31
`ASYMMETRIC_BY_DESIGN` patterns: explicit opt-out with written
justification rather than silent suppression.

---

## Output examples

**Clean state (current).**
```
G-32 DDL UNIQUE documentation coverage:
  schema files scanned:               2
  UNIQUE declarations found:          13
    column-level:                     7
    table-level:                      4
    explicit CREATE UNIQUE INDEX:     2
  coverage-exempt (allow-list):       0
  undocumented declarations:          0
  ✅ all UNIQUE declarations documented in 06-indexes.md
```

**Drift detected.**
```
G-32 DDL UNIQUE documentation coverage:
  schema files scanned:               2
  UNIQUE declarations found:          13
    column-level:                     7
    table-level:                      4
    explicit CREATE UNIQUE INDEX:     2
  coverage-exempt (allow-list):       0
  undocumented declarations:          1

  ❌ 1 undocumented declaration(s) — expected mention in spec/31-app/07-db-diagram/06-indexes.md:

    [explicit] IdxUserRole_User_Role
      source:    spec/31-app/07-db-diagram/sql/01-root-schema.sql:97
      expected:  one of `IdxUserRole_User_Role`

  To fix: add the index to 06-indexes.md (Required-Indexes for explicit
  CREATE INDEX, or §Implicit Indexes for UNIQUE-implied autoindexes).
  To suppress an intentional omission, add the decl key to
  COVERAGE_EXEMPT in this runner with a rationale comment.
```

---

## Exit codes

| Code | Meaning |
|------|---------|
| 0 | All UNIQUE declarations documented (or covered by allow-list) |
| 1 | One or more undocumented UNIQUE declarations detected |
| 2 | Runner error (missing schema file, parse failure, etc.) |

---

## Out of scope

- **Reverse drift** (documented index doesn't exist in DDL). This is the
  class that produced F26's fabricated-column bug; a separate gate
  (`F-future-G32a`) could enumerate `Idx*` and `sqlite_autoindex_*`
  identifiers in `06-indexes.md` and verify each maps back to a real
  CREATE statement. Logged in §Future-promotion ladder.
- **Non-UNIQUE indexes** (plain `CREATE INDEX`). G-32 only covers UNIQUE.
  A future gate `F-future-G32b` could extend coverage.
- **Trigger-created indexes / shadow tables** (FTS5 virtual tables, etc.).
  These are out of scope because their backing-index naming convention is
  database-specific and not amenable to the `Idx{Table}_{Cols}` matcher.
- **Cross-DB referential integrity** (logical FK between Root and App).
  Governed by `01-features/15-roles-and-permissions.md` + the migrations
  SSOT, not by this gate.

---

## Why "name presence" not "structural parity"

A stronger gate could parse `06-indexes.md` into a structured AST
(table → columns → index name) and compare it row-by-row against the
DDL AST. We deliberately do NOT do this because:

1. `06-indexes.md` is a **human-readable narrative document** with
   tables, prose, Mermaid flowcharts, and cross-references — not a
   machine-readable manifest. Forcing it into a strict schema would
   eliminate its documentation value.
2. The substring match catches the F26 bug class (missing entirely)
   without false positives on legitimately reorganised content.
3. Structural parity is a **global** property whose violations require
   author judgement to fix. Substring-presence is a **local** invariant:
   if it fails, the fix is obvious and bounded ("add a row mentioning
   this index").

Mirrors the same justification as G-31's "reciprocity not graph
connectivity" choice.

---

## Future-promotion ladder (not scoped to this gate)

Two further enhancements remain available for future tasks:

1. **F-future-G32b**: Extend scope to non-UNIQUE indexes (`CREATE INDEX`
   without UNIQUE). Would require deciding how to handle partial
   indexes and expression indexes whose names don't follow
   `Idx{Table}_{Cols}` convention.
2. **F-future-G32c**: Add G-32.3 enforcing every `COVERAGE_EXEMPT` /
   `REVERSE_EXEMPT` entry has a corresponding rationale comment in the
   runner source (machine-checkable; mirrors the G-30.3 and G-31.2 plans).

Logging here so they're discoverable when "check memory for remaining
tasks" runs in a later loop.

---

## Change history

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-04-27 | F30 — initial implementation; promoted from F26 prototype `/tmp/audit_unique.mjs`; allow-list empty; current state ✅ 13/13 UNIQUE declarations documented across 2 schema files (7 column-level + 4 table-level + 2 explicit) |
| 2.0.0 | 2026-04-27 | F-future-G32a — added **G-32.2 reverse-drift sub-check**. Parses every backticked `Idx*`/`sqlite_autoindex_*` identifier in `06-indexes.md`, builds DDL universe from explicit `CREATE INDEX` across 3 SQL files + UNIQUE-implied autoindexes + alias rows from `sql/00-overview.md` §Index-name aliases. New `REVERSE_EXEMPT` allow-list (8 entries: 2 logical-tag aliases for autoindex shorthands, 3 prose-rejected names from §"Indexes intentionally NOT created", 3 v2-deprecated names retained for traceability). Negative-tested by injecting `IdxFabricated_Foo` (correctly exits 1). Current state ✅ 37 doc identifiers / 42 DDL identifiers / 0 fabricated. |
