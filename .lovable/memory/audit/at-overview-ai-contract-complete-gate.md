---
gate: G-00-OVERVIEW-AI-CONTRACT-COMPLETE
runner: scripts/spec-hygiene/54-check-ai-contract-complete.mjs
slot: 54
created: 2026-04-29
status: WARN-only for Rules 3–5 (Rules 1+2 hard-fail from day 1)
ssot: spec/01-spec-authoring-guide/18-ai-contract-template.md
---

# Audit — `G-00-OVERVIEW-AI-CONTRACT-COMPLETE`

## Baseline (2026-04-29)

| Rule | Description | Tier | Baseline |
|---|---|---|---:|
| 1 | All 5 subsections present (Purpose, Audience, Expected AI Output, Out of Scope, Definition of Done) | hard-fail | **0 / 25 fail** ✅ |
| 2 | Canonical order | hard-fail | **0 / 25 fail** ✅ |
| 3 | Non-empty bodies (≥10 chars) | WARN | **0 WARN** ✅ |
| 4 | Every Out-of-Scope bullet contains a markdown link | WARN | **29 WARN** across 14 files |
| 5 | Every DoD bullet cites `AT-*`, `G-*`, `scripts/…`, or `node …` | WARN | **36 WARN** across ~20 files |

**Total baseline noise: 65 WARNs.** Sentinel-marker regex confirmed all top-level overviews carry the canonical 5-subsection schema in canonical order from day 1 (no Rule 1/2 promotion gap).

## Promotion criteria

`PROMOTED_HARDFAIL` flips `true` (Task #17 in roadmap) once baseline WARN count
drops to **0** for Rules 3–5. Recommended drain order:
1. Rule 4 (29 WARNs, mechanical: convert path mentions to markdown links).
2. Rule 5 (36 WARNs, requires authoring AT-IDs or G-gates per DoD bullet).
3. Promote.

## Carve-outs

- Sub-overviews (`spec/NN-x/MM-y/00-overview.md`) out of scope per Authoring rule §6.
- Fenced code blocks stripped before scanning (template file `18-ai-contract-template.md` doesn't trip the gate).

## Cross-references

- SSOT: `spec/01-spec-authoring-guide/18-ai-contract-template.md`
- Sibling Layer-2 gates: `G-00-OVERVIEW-SCORING-TABLE-COMPLETE`, `G-00-OVERVIEW-SCORING-VALUES-FRESH`
- Layer-1 sibling: `G-00-OVERVIEW-AI-CONTRACT-PRESENT` (heading-existence only)
- Roadmap entry: Task #17 (promote Rules 3–5 WARN→hard-fail)
