# Audit — G-00-OVERVIEW-AI-CONTRACT-PRESENT

**Date:** 2026-04-29
**Task:** Mint third pillar of the overview-root contract trio.

## Baseline

| Tier | Files | Compliant | % |
|------|------:|----------:|--:|
| Top-level (`spec/[0-9][0-9]-*/00-overview.md`) | 25 | 25 | 100% |
| Sub-overview (depth ≥3) | 125 | ~2 | ~2% |

Top-level: every overview already carries `## AI Contract`. Hard-fail ships day 1, zero violations.
Sub-overview: WARN-only. Most sub-sections legitimately defer the contract to their parent overview.

## Trio status

| Gate | Aspect | Tier | Baseline |
|------|--------|------|---------:|
| G-09-OVERVIEW-H1-MATCHES-FOLDER-INDEX | H1 numeric prefix | hard-fail (top + sub) | 144/144 |
| G-00-OVERVIEW-SCORING-TABLE-PRESENT | Scoring section | hard-fail (top) | 25/25 |
| G-00-OVERVIEW-AI-CONTRACT-PRESENT | AI Contract section | hard-fail (top) + WARN (sub) | 25/25 top |

## Future

`G-00-OVERVIEW-AI-CONTRACT-COMPLETE` would enforce sub-headings (`Inputs`, `Outputs`, `Invariants`, `Failure modes`). Deferred until canonical contract schema ratified.
