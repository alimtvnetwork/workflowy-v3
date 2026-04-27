# Ambiguity #28 — G-32.3 name-presence vs predicate parity

**Date logged:** 2026-04-27
**Context:** F-future-G32b (G-32 v3.0.0 — non-UNIQUE CREATE INDEX coverage)
**Status:** Logged for later review (no-questions mode active)

## Question

G-32.3 verifies that every `CREATE INDEX` (UNIQUE or plain) in DDL has
**its name** appear in backticks in `06-indexes.md` (or its prose-alias
counterpart from `sql/00-overview.md` §Index-name aliases). It does
**NOT** verify:

1. That the documented `(columns)` cell matches DDL column order /
   column names.
2. That the documented `WHERE …` partial-index predicate matches the
   DDL predicate.
3. That the documented `DESC` / `COLLATE` modifiers match.
4. That the listed `EP-*` consumers are still real endpoints.

Examples of drift G-32.3 would NOT catch today:

| Drift class                 | Example                                                              |
|-----------------------------|----------------------------------------------------------------------|
| Column-list typo            | DDL `(UpdatedAt DESC)`, doc `(CreatedAt DESC)`                        |
| Predicate inversion         | DDL `WHERE DeletedAt IS NULL`, doc `WHERE DeletedAt IS NOT NULL`      |
| Stale endpoint reference    | Doc lists `EP-FOO-BAR` that was renamed in the endpoint matrix       |

## Decision (no-questions mode)

Kept **name-presence only**. Rationale:

- Detecting predicate parity requires a real SQL parser (we currently
  use line-regex). The spec already has an SSOT for predicates inside
  the SQL files themselves; doc cells are descriptive prose, not
  authoritative.
- The endpoint-reference drift class is partially covered by G-29
  (endpoint-matrix coverage) — if `EP-FOO-BAR` doesn't exist, G-29
  flags any other doc that cites it.
- Adding partial-/expression-index name-convention rules
  (`Idx{Table}_{Cols}_Live` for `WHERE DeletedAt IS NULL`, etc.)
  would be a project-naming change, not a gate change.

Logged as **F-future-G32d** in case the team later wants column-/predicate-
parity enforcement.

## Files affected

- `scripts/spec-hygiene/32-check-ddl-unique-coverage.mjs` (v3.0.0 — added G-32.3)
- `spec/31-app/05-conventions/25-g32-ddl-unique-coverage-gate.md` (v3.0.0)
- `spec/31-app/07-db-diagram/06-indexes.md` (v1.5.0 — added missing `IdxMirrorPeerGroup_CanonicalItemId` row caught by gate)
