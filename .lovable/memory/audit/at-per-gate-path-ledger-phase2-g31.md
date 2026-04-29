# AT — Per-(gate, path) Ledger Phase-2 Sibling: G-31 Migration

**Gate:** G-13-LEDGER-PER-GATE-PATH (Phase-2 sibling application to G-31)
**Date:** 2026-04-29
**Trigger:** Apply the proven G-30 Phase-2 pattern to G-31's twelve in-source allow-list Sets.

## What changed

1. **New ledger** `spec/31-app/05-conventions/_LEDGER-G-31-EXEMPTIONS.md`
   - 18 rows: 7 G-31.2.peer (features-exempt) + 9 G-31.3.island (endpoints-island) + 2 G-31.2.head (features-head).
   - Schema conforms to `spec/13-cicd-pipeline-workflows/scripts-as-spec/per-gate-path-ledger-schema.md`
     with G-31 specialisation: `gate` column carries sub-category suffix
     (`.peer` / `.island` / `.head`).

2. **Runner update** `scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs`
   - Twelve in-source allow-list Sets retained as **empty emergency-override slots**.
   - Added `loadG31Exemptions()` parser + `G31_SCOPE_TO_SETS` registry.
   - Module-load `loadG31Exemptions()` unions ledger entries into the in-source Sets.
   - Parser strips surrounding markdown backticks from cell values.
   - G-31.5 report now prints `ledger entries imported: N (path)`.

## Verification

- `node scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs` →
  `0 ERROR-scope asymmetries, 0 WARN-scope asymmetries, 18 ledger entries imported, 0 unrationaled`.
  Behaviour parity confirmed (identical to pre-migration: 7 features-peer + 9 endpoints-island + 2 features-head suppressions).
- Regenerated `spec/31-app/05-conventions/26-allow-list-inventory.md` (G-35) → drift resolved.
- Full sweep `node scripts/spec-hygiene/00-run-all.mjs` → **✅ All spec-hygiene checks passed**.

## Sibling status

- ✅ G-30 (`30-check-at-citation-validity.mjs`, `_LEDGER-G-30-EXEMPTIONS.md`) — Phase-2, 41 rows.
- ✅ G-31 (`31-check-workflow-xref-reciprocity.mjs`, `_LEDGER-G-31-EXEMPTIONS.md`) — Phase-2, 18 rows. **(this PR)**
- ⏳ G-32 (`32-check-ddl-unique-coverage.mjs`, `DDL_UNIQUE_ALLOWLIST`) — pending (Task #12).

## Phase-3 readiness

Once `G-13-LEDGER-PER-GATE-PATH` promotes to CI, the `pathGlob` column in this
ledger will be re-validated per row — each `entry` filename must resolve
under its row's `pathGlob`. The G-31 ledger is structured so that
validation is a one-line glob-match per entry.
