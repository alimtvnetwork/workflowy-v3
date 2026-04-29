# AT — Per-(gate, path) Ledger Phase-2 Sibling #3: G-32 Migration (Trilogy Complete)

**Gate:** G-13-LEDGER-PER-GATE-PATH (Phase-2 sibling application to G-32)
**Date:** 2026-04-29
**Trigger:** Close the per-runner trilogy by applying the proven G-30/G-31 pattern to G-32.

## What changed

1. **New ledger** `spec/31-app/05-conventions/_LEDGER-G-32-EXEMPTIONS.md`
   - 8 rows, all `G-32.2.reverse` category (only non-empty in-source Set).
   - `pathGlob` resolves to `spec/31-app/07-db-diagram/06-indexes.md` for every row.
   - Schema: `gate | pathGlob | entry | rationale | addedOn` (canonical).

2. **Runner update** `scripts/spec-hygiene/32-check-ddl-unique-coverage.mjs`
   - `REVERSE_EXEMPT` reduced to empty emergency-override slot.
   - `COVERAGE_EXEMPT`, `NONUNIQUE_EXEMPT`, `PARITY_EXEMPT` already empty (no change).
   - Added `loadG32Exemptions()` parser + `G32_CATEGORY_TO_SET` registry.
   - Module-load `loadG32Exemptions()` unions ledger entries into in-source Sets.
   - Markdown backticks stripped from cell values (consistent with G-30/G-31).
   - G-32.4 report now prints `ledger entries imported: N (path)`.

## Verification

- `node scripts/spec-hygiene/32-check-ddl-unique-coverage.mjs` →
  `reverse-exempt: 8, fabricated: 0` (identical to pre-migration). All 5 sub-gates green.
- Regenerated `spec/31-app/05-conventions/26-allow-list-inventory.md` (G-35) →
  **17 allow-lists, 0 entries, 0 unrationaled** (every in-source Set is now an empty override skeleton).
- Full sweep `node scripts/spec-hygiene/00-run-all.mjs` → **✅ All spec-hygiene checks passed**.

## Trilogy status — COMPLETE

| Sibling | Runner | Ledger | Rows | Status |
|---|---|---|---:|---|
| ✅ G-30 | `30-check-at-citation-validity.mjs` | `01-spec-authoring-guide/_LEDGER-G-30-EXEMPTIONS.md` | 41 | Phase-2 done; Phase-3 enforced |
| ✅ G-31 | `31-check-workflow-xref-reciprocity.mjs` | `31-app/05-conventions/_LEDGER-G-31-EXEMPTIONS.md` | 18 | Phase-2 done |
| ✅ G-32 | `32-check-ddl-unique-coverage.mjs` | `31-app/05-conventions/_LEDGER-G-32-EXEMPTIONS.md` | 8 | Phase-2 done **(this PR)** |

**Total ledger rows across the trilogy: 67.**

All historical hardcoded allow-list entries (which previously lived as
`new Set([…])` literals scattered across three runners) are now declared
in machine-parseable markdown ledgers under `spec/`, with a uniform
5-column schema, and consumed via three structurally-identical loaders.

## Phase-3 readiness for G-31 / G-32

The G-30 Phase-3 helpers (`isRedundancyExempt(prefix, declaringFile)` +
`globToRegExp()`) are reusable for G-31 and G-32 — both runners can adopt
per-row `pathGlob` enforcement with the same pattern. Tracked as future task.
