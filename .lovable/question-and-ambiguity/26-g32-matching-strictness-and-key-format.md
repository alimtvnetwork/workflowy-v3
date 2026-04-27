# Ambiguity #26 — F30 G-32 design: matching strictness, scope boundary, naming-convention assumption

**Date:** 2026-04-27
**Task:** F30 (promote `/tmp/audit_unique.mjs` to gate G-32)
**Decision class:** Gate scope + matching algorithm choice

## The branch points

Promoting the F26 UNIQUE-coverage prototype to a permanent gate forced
three substantive design decisions that didn't matter when the script
was a one-shot probe.

### Choice 1: How strict should the documentation match be?

Three levels considered:

- **Substring presence** (chosen): the candidate index name appears
  *anywhere* in `06-indexes.md` — table row, prose, Mermaid node,
  cross-reference. Permissive but catches the F26 bug class.
- **Table-row presence**: only matches if the name appears as the first
  cell of a markdown table row. Stricter but brittle to refactors that
  move documentation into prose paragraphs.
- **Structural AST parity**: parse `06-indexes.md` into table → columns
  → index-name AST and compare row-by-row against DDL AST. Strictest
  but treats `06-indexes.md` as a machine-readable manifest rather than
  a narrative document.

**Decision: substring presence.** Documented rationale in SSOT §"Why
name presence not structural parity". Mirrors G-31's "reciprocity not
graph connectivity" choice — local invariants over global ones.

### Choice 2: Which UNIQUE forms to parse?

Three syntactic shapes appear in our DDL:

- Column-level: `Email TEXT NOT NULL UNIQUE`
- Table-level: `UNIQUE(MirrorGroupId, ItemId)` as separate constraint
- Explicit: `CREATE UNIQUE INDEX IdxName ON Table(Cols)`

**Decision: all three.** The prototype already covered all three (it
had to, to find the F26 bugs). Production runner preserves this. A
fourth potential shape — `PRIMARY KEY(Col1, Col2)` — produces an
implicit unique constraint but is conceptually different (PK semantics)
so excluded.

### Choice 3: What's the candidate naming convention?

For non-explicit declarations, the runner needs to predict what name
might document them. Two candidates per declaration:

1. `Idx{Table}_{Cols joined by _}` — the project's explicit-named
   index convention (used in `IdxMirrorMember_ItemId`, etc.).
2. `sqlite_autoindex_{Table}` — the SQLite implicit autoindex name
   pattern (used in `06-indexes.md` §Implicit Indexes after F26).

ANY match satisfies the gate. The two-candidate strategy means
authors can document EITHER as an explicit-named alias OR as the
SQLite-autoindex form — both valid choices.

**Note**: `sqlite_autoindex_{Table}` uses just the table name (not
columns) because SQLite's actual auto-index naming is
`sqlite_autoindex_{Table}_{N}` where N is a counter. We document via
the un-numbered prefix because it's stable across future schema
evolution (adding a 2nd UNIQUE to a table changes the numbers but
not the prefix).

### Choice 4: What's a stable allow-list key?

The G-30.2 and G-31 allow-lists used simple keys (`AT-FOO-` prefix
string and `from → to` pair string respectively). G-32 is more complex
because each violation has multiple identifying fields (file, table,
columns, kind).

Settled on: `${fileBase}:${signature}` where signature is
`Table(Col1,Col2,…)` for column/table or `explicit:IndexName` for
explicit. The fileBase is included so that a column named `Name` on
both Root and App tables can be exempted independently.

This keeps the allow-list grep-friendly (string matching only) while
being precise enough to never accidentally exempt the wrong decl.

## What surprised me

The prototype emitted ✅/❌ glyphs for human readability but had no
exit code. Promoting to a CI gate required rewriting the output as
**summary counters first, then per-violation block, then suppression
hint** — same structure as G-29/G-30/G-31. The prototype's per-line
inline ✅/❌ doesn't compose into a summary; the structured form does.

The prototype also conflated two cases: "matched" vs "matched-and-cited".
Production runner only emits `expected: one of …` when a violation
exists; on success it stays silent (per-decl noise would dominate the
output for 13 declarations × 6+ files in CI logs).

## Why F30 doesn't need to change DDL or 06-indexes.md

F26 already drained the queue to 0/13 violations. F30's job is purely
infrastructure — the gate runs against current state and finds zero
issues. Negative-test probe (sed-rewrote `IdxUserRole_User_Role` →
`IdxXXX_BROKEN` in `06-indexes.md`) confirmed the gate correctly
surfaces the synthetic violation with exit 1, and that removing the
edit restores ✅ 0 violations.

## Future-promotion ladder (deferred — NOT F30)

Three further escalation steps logged in the SSOT:

1. **F-future-G32a**: Reverse-drift sub-check — enumerate `Idx*` and
   `sqlite_autoindex_*` mentions in `06-indexes.md` and verify each
   maps back to real DDL. Would have caught F26's fabricated-column
   bugs at gate level (F26 found them via manual audit).
2. **F-future-G32b**: Extend scope to non-UNIQUE indexes (`CREATE INDEX`
   without UNIQUE).
3. **F-future-G32c**: Machine-check that every `COVERAGE_EXEMPT` entry
   has a rationale comment (mirrors G-30.3 + G-31.2 plans).

The first one is the highest-value follow-up — it would close the
forward+reverse drift loop completely.

## Files changed

- `scripts/spec-hygiene/32-check-ddl-unique-coverage.mjs` (new, v1.0.0)
- `scripts/spec-hygiene/00-run-all.mjs` (registered new check)
- `spec/31-app/05-conventions/02-ci-quality-gates.md` (added G-32 row, updated note)
- `spec/31-app/05-conventions/25-g32-ddl-unique-coverage-gate.md` (new SSOT, v1.0.0)
- Deleted `/tmp/audit_unique.mjs` (prototype obsolete)
