# AT — Per-(gate, path) Ledger Phase-3 Enforcement Extended to G-31 + G-32

**Gate:** G-13-LEDGER-PER-GATE-PATH (Phase-3 extension to G-31 / G-32)
**Date:** 2026-04-29
**Trigger:** Apply the G-30 Phase-3 `pathGlob` enforcement pattern to the two
sibling runners so each ledger row is bounded to its declared host path.

## What changed

### `scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs`

1. Added `globToRegExp()` helper (verbatim port from G-30, ≤15-line logic).
2. Added per-(scopeId, category, entry) → `[RegExp, …]` map `G31_GLOBS_BY_KEY`.
3. Loader now reads + validates the `pathGlob` cell (hard-fails on empty).
4. New `isG31Exempt(scopeId, category, entry, hostFile)`:
   - returns `false` if entry not in the in-source override Set,
   - returns `true` (path-agnostic) if entry has no ledger row (override-only hotfix),
   - else requires ≥1 of the row's pathGlobs to match the host file.
5. Three check sites threaded through `isG31Exempt`:
   - `findAsymmetries` — host = declaring file (`${scope.dir}/${a}`).
   - `findIslands` — host = the candidate island file.
   - `findHeadingDrift` — host = the file being scanned.

### `scripts/spec-hygiene/32-check-ddl-unique-coverage.mjs`

1. Same `globToRegExp()` + per-(category, entry) glob map `G32_GLOBS_BY_KEY`.
2. Loader reads + validates `pathGlob`.
3. New `isG32Exempt(category, entry, hostFile)` (same semantics).
4. `findFabricatedIndexes` site uses `G32_REVERSE_HOST = "spec/31-app/07-db-diagram/06-indexes.md"`
   (the only doc input the scanner consumes for this check).

## Negative tests (proof Phase-3 is enforced, not vacuous)

| Runner | Mutation | Expected | Observed |
|---|---|---|---|
| G-31 | Replace `spec/31-app/01-features/**` → `spec/UNREACHABLE/**` in features-peer rows | 7 features-peer asymmetries re-surface | ✅ `unreciprocated forward-links: 7` (was 0) |
| G-32 | Replace `06-indexes.md` → `UNREACHABLE.md` in all reverse rows | 8 reverse names re-flagged as fabricated | ✅ `fabricated: 8` (was 0) |

Both negative tests reverted; runners restored to green baseline.

## Verification

- `node scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs` →
  `0 ERROR-scope asymmetries, 18 ledger entries imported`.
- `node scripts/spec-hygiene/32-check-ddl-unique-coverage.mjs` →
  `reverse-exempt: 8, fabricated: 0`.
- Full sweep `00-run-all.mjs` → **✅ All spec-hygiene checks passed**.

## Trilogy + Phase-3 status — COMPLETE

| Sibling | Phase-2 (ledger) | Phase-3 (`pathGlob` enforced) | Negative-tested |
|---|---|---|---|
| ✅ G-30 | 41 rows | ✅ since 2026-04-29 (1.6.0) | ✅ |
| ✅ G-31 | 18 rows | ✅ this PR | ✅ |
| ✅ G-32 | 8 rows  | ✅ this PR | ✅ |

**67 ledger rows across 3 runners, all path-bounded, all negative-test verified.**

A future ADR-0029 candidate could promote `G-13-LEDGER-PER-GATE-PATH` from
"G-30 first consumer" to "all-ledger-consumers must enforce pathGlob"
since the pattern has now been proven across three independent runners.
