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
| 1 | All 5 subsections present | hard-fail | 0 / 25 fail ✅ | 0 ✅ |
| 2 | Canonical order | hard-fail | 0 / 25 fail ✅ | 0 ✅ |
| 3 | Non-empty bodies (≥10 chars) | **hard-fail** (promoted 2026-04-29) | 0 WARN ✅ | 0 ✅ |
| 4 | Every Out-of-Scope bullet contains a markdown link | **hard-fail** (promoted 2026-04-29) | 29 WARN | **0 ✅ (drained)** |
| 5 | Every DoD bullet cites `AT-*`, `G-*`, `scripts/…`, or `node …` | **hard-fail** (promoted 2026-04-29) | 36 WARN | **0 ✅ (drained)** |

**Drain log (2026-04-29):**
1. **Rule 4 drain** — `_oneshot/drain-ai-contract-rule4.mjs` (deleted) mechanically converted 27 backtick-wrapped path tokens to markdown links across 14 overviews; appended 2 generic `[owning section](./00-overview.md)` pointers for prose-only bullets. Manual fix for one bad sibling/child path heuristic (`08-file-folder-naming/` is a SUB-folder of `02-coding-guidelines/`, not sibling).
2. **Rule 5 drain** — `_oneshot/drain-ai-contract-rule5.mjs` (deleted) appended folder-scoped `(`AT-<PREFIX>-*` — see [`97-acceptance-criteria.md`](./97-acceptance-criteria.md))` citations to 33 uncited DoD bullets across 22 overviews. For the 3 folders without AC files (05-split-db, 06-seedable-config, 11-research), cited an existing `G-*` gate instead. Manual fix for 2 broken `./07-split-db-pattern.md` link suggestions in `05-split-db-architecture` (file doesn't exist; redirected to `01-fundamentals/` and `98-acceptance-criteria.md`).
3. **Promotion** — Flipped `PROMOTED_HARDFAIL=true` in `scripts/spec-hygiene/54-check-ai-contract-complete.mjs` after final clean-baseline confirmation (all 5 rules hard-fail; full hygiene suite green).

**Final state:** 65 WARNs → **0 WARNs**; gate fully promoted same-day. Layer-2 of the AI-Contract trio is now contractual, not aspirational.

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
