# Audit memo — Per-(gate, path) ledger Phase 2 (G-30 migration)

**Date:** 2026-04-29  
**Task:** #11 Phase-2 (follow-on to Phase-1 schema spec)  
**Gate:** `G-30-AT-CITATION-VALIDITY` §G-30.2  
**Ledger created:** `spec/01-spec-authoring-guide/_LEDGER-G-30-EXEMPTIONS.md` (41 rows)

## What changed

- All 41 entries of the in-source `REDUNDANCY_ALLOWLIST` Set (5 future-licensing + 14 convention-doc + 11 namespace-placeholder + 9 workflow-family + 2 frozen-dispatch) moved to a sibling per-(gate, path) ledger using the canonical 5-column schema.
- Runner gained a `loadG30RedundancyExemptions(ledgerPath)` helper (≤15-line logic per ADR-0007 R3) that parses the ledger's pipe-table rows and returns `{ entries, rows }`.
- `REDUNDANCY_ALLOWLIST` const retained as an effective union of `LEDGER_ENTRIES ∪ REDUNDANCY_ALLOWLIST_INSOURCE` so all 5 existing call-sites (`.has(prefix)` + 1 message string + 3 doc-comment refs) continue to work.
- `REDUNDANCY_ALLOWLIST_INSOURCE` is empty by design — emergency-only escape hatch.

## Verification

- Pre/post diff: `G-30.2 redundancy: 0 cleanup candidates` in both states.
- Negative test: removing the `AT-FOO-` row from the ledger → runner correctly re-flags it as a redundancy candidate (recovered after re-add).
- Full `00-run-all.mjs` sweep green (36 runners) after regenerating `26-allow-list-inventory.md`.

## Path-glob notes

Every row's `pathGlob` is set to the consumer scope where the prefix is declared (`spec/01-spec-authoring-guide/97-acceptance-criteria.md` for §G-30 closure rows; `spec/02-workflows/00-overview.md` for AT-WF-* rows; `spec/**/*.md` for AT-APP-* / AT-APPF-* frozen dispatch). The runner does **not** yet enforce path-glob filtering — that's Phase-3.

## Follow-ups

- **Phase 3:** thread the citing-file path into G-30.2's redundancy check and consult `pathGlob` per row before silencing. Promotes `G-13-LEDGER-PER-GATE-PATH` DOC-NORM → CI.
- **Sibling migrations:** `WORKFLOW_PROXY_ALLOWLIST` in `31-…mjs` and `DDL_UNIQUE_ALLOWLIST` in `32-…mjs` are candidates for the same migration pattern.
