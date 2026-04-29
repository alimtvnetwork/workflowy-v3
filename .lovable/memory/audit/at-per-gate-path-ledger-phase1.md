# Audit memo — Per-(gate, path) ledger schema (Phase 1)

**Date:** 2026-04-29  
**Task:** #11 (closes Task #18 polish bundle)  
**Gate minted:** `G-13-LEDGER-PER-GATE-PATH` (DOC-NORM)  
**Fixture:** `spec/13-cicd-pipeline-workflows/scripts-as-spec/per-gate-path-ledger-schema.md`

## What changed

Froze the canonical 5-column schema for per-(gate, path) ledger rows
(`gate` × `pathGlob` × `entry` × `rationale` × `addedOn`) plus
6 validation rules, the shared `loadPerGatePathLedger` helper contract,
and a 3-phase strictness roadmap.

## Migration target (Phase 2)

`REDUNDANCY_ALLOWLIST` Set in
`scripts/spec-hygiene/30-check-at-citation-validity.mjs` — 16 rows that
should each be path-scoped to either `spec/01-features/**/*.md` or
`spec/02-workflows/**/*.md` (per category labels in the runner comment).

## Verification

- Full `00-run-all.mjs` sweep green (36 runners, 0 violations).
- `G-13-FIXTURE-AS-SPEC-SHAPE` accepts the new fixture (6 H2 sections,
  fenced `markdown` algorithm block, banner cites the gate, registry
  links back to the file).
- Spec index regenerated (1462 files, +1).

## Follow-ups (deferred to future `next` cycles)

- **Phase 2:** migrate `REDUNDANCY_ALLOWLIST` (16 rows) to a sibling
  ledger and consume via `loadPerGatePathLedger`.
- **Phase 3:** promote `G-13-LEDGER-PER-GATE-PATH` DOC-NORM → CI when
  G-30 / G-31 / G-32 all consume ledgers via the helper.
