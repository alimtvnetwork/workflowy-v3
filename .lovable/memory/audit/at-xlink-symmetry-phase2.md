# Audit memo — `G-00-ADR-XLINK-SYMMETRY` Phase 2 promotion

**Date:** 2026-04-29  
**Task:** #18 (cheap polish bundle, leg 1 of 2 completed)  
**Gate:** `G-00-ADR-XLINK-SYMMETRY`  
**Tier shift:** DOC-NORM → **CI** (hard-fail from day 1)

## What changed

Mechanized the frozen fixture-as-spec at
`spec/13-cicd-pipeline-workflows/scripts-as-spec/xlink-symmetry-audit.md`
into a JS runner with **anchor-locality** strengthening:

- New runner: `scripts/spec-hygiene/56-check-adr-xlink-symmetry.mjs`
- Locality window: ±8 lines around the matching heading.
- Honours explicit `{#id}` heading attributes (kramdown/pandoc) **and**
  GitHub-style auto-slug (lowercase, strip non-letter/digit, em-dash
  preserved-as-hyphen via space retention).
- Anchorless links still pass with file-level back-link only (Phase-1 behaviour).

## Verification

- All 4 baseline pairs from
  `spec/00-adrs/_LEDGER-G-00-ADR-XLINK-SYMMETRY-BASELINE.md` pass clean.
- Negative test: setting `LOCALITY_LINES = 2` and corrupting the inline
  `Ratified by [ADR-0024 §D1]` blockquote → runner correctly emits
  `ANCHOR-LOCALITY` violation with exit code 1.
- Full `00-run-all.mjs` sweep green after wire-in.

## Follow-ups

- Task #11 follow-on: per-(gate, path) ledger upgrade still pending.
- Task #16 (refine `[owning section]` pointer in `00-adrs/00-overview.md`
  Out-of-Scope §2): completed in same change → coding-guidelines + gate-registry.
