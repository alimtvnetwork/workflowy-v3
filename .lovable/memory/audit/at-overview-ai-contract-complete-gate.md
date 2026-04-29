---
gate: G-00-OVERVIEW-AI-CONTRACT-COMPLETE
runner: scripts/spec-hygiene/54-check-ai-contract-complete.mjs
slot: 54
created: 2026-04-29
status: ALL 5 RULES HARD-FAIL (promoted 2026-04-29 after baseline drained 65 → 0 WARNs same-day)
ssot: spec/01-spec-authoring-guide/18-ai-contract-template.md
---

# Audit — `G-00-OVERVIEW-AI-CONTRACT-COMPLETE`

## Baseline (2026-04-29)

| Rule | Description | Tier | Baseline | Current (2026-04-29) |
|---|---|---|---:|---:|
| 1 | All 5 subsections present (Purpose, Audience, Expected AI Output, Out of Scope, Definition of Done) | hard-fail | 0 / 25 fail ✅ | 0 ✅ |
| 2 | Canonical order | hard-fail | 0 / 25 fail ✅ | 0 ✅ |
| 3 | Non-empty bodies (≥10 chars) | WARN | 0 WARN ✅ | 0 ✅ |
| 4 | Every Out-of-Scope bullet contains a markdown link | WARN | 29 WARN | **0 ✅ (drained 2026-04-29)** |
| 5 | Every DoD bullet cites `AT-*`, `G-*`, `scripts/…`, or `node …` | WARN | 36 WARN | 36 (Task #13 target) |

**Drain log (2026-04-29):** Authored `scripts/spec-hygiene/_oneshot/drain-ai-contract-rule4.mjs` (since deleted) which mechanically converted 27 backtick-wrapped path tokens to markdown links across 14 overviews + appended 2 generic `[owning section](./00-overview.md)` pointers for prose-only bullets. Post-drain link-check caught one `08-file-folder-naming/` reference where the heuristic used `../` (sibling) instead of `./` (child); manually fixed in `02-coding-guidelines/00-overview.md` and its `00-overview-condensed.md` mirror.

**Total baseline noise: 65 WARNs → 36 WARNs (29 drained).** Rule 4 is now clean and ready for promotion as soon as Rule 5 also drains (Task #14).

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
