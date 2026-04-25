# AI Optimization — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 14 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-AIOPTIMIZATION-01` … `AT-AIOPTIMIZATION-14`

---

## Criteria

### Anti-hallucination rules (file 01)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-AIOPTIMIZATION-01 | Every "never generate X" rule MUST include: a forbidden code snippet (`❌`), a required code snippet (`✅`), and a one-line rationale; rules missing any of the three fail review because AI cannot self-correct without a positive exemplar. | [`01-anti-hallucination-rules.md`](./01-anti-hallucination-rules.md) |
| AT-AIOPTIMIZATION-02 | The rule list MUST cover at minimum: enum invention, type-cast invention, library-API invention, naming-convention invention, and import-path invention; gaps in any category fail review. | [`01-anti-hallucination-rules.md`](./01-anti-hallucination-rules.md) |
| AT-AIOPTIMIZATION-03 | Each rule MUST cite an authoritative source file (cross-language or per-language); orphan rules (no citation) fail review because they're un-traceable. | [`01-anti-hallucination-rules.md`](./01-anti-hallucination-rules.md) |

### Quick-reference checklist (file 02)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-AIOPTIMIZATION-04 | The checklist MUST contain ≤ 50 items, each phrased as a binary check (`[ ] X is …`); open-ended prompts ("consider …") are forbidden because they don't gate output. | [`02-ai-quick-reference-checklist.md`](./02-ai-quick-reference-checklist.md) |
| AT-AIOPTIMIZATION-05 | Each checklist item MUST link to its enforcing rule (in `01-anti-hallucination-rules.md` OR a cross-language file); checklist items without a deep-link fail review. | [`02-ai-quick-reference-checklist.md`](./02-ai-quick-reference-checklist.md) |
| AT-AIOPTIMIZATION-06 | The checklist MUST fit in ≤ 200 lines so it can be loaded into AI context windows alongside the task; overlong checklists fail review. | [`02-ai-quick-reference-checklist.md`](./02-ai-quick-reference-checklist.md) |

### Common AI mistakes (file 03)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-AIOPTIMIZATION-07 | Each catalogued mistake MUST include: a real-world before snippet, a corrected after snippet, AND the rule that was violated; before/after-only entries (no rule citation) fail review. | [`03-common-ai-mistakes/00-overview.md`](./03-common-ai-mistakes/00-overview.md) |
| AT-AIOPTIMIZATION-08 | The catalogue MUST be updated whenever a new repeat-offense pattern is observed in PR review; stale catalogues (no update in > 90 days while issues recur) fail review. | [`03-common-ai-mistakes/00-overview.md`](./03-common-ai-mistakes/00-overview.md) |

### Condensed master guidelines (file 04)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-AIOPTIMIZATION-09 | The condensed file MUST fit under 300 lines AND MUST be a true subset of the full master guidelines (NO new rules, NO contradictions); drift between condensed and full is a Code-Red consistency bug. | [`04-condensed-master-guidelines.md`](./04-condensed-master-guidelines.md), [`../01-cross-language/15-master-coding-guidelines/00-overview.md`](../01-cross-language/15-master-coding-guidelines/00-overview.md) |
| AT-AIOPTIMIZATION-10 | The condensed file MUST include a `Last synced from master: <date> (UTC+8)` header; missing or stale (> 30 days) sync header fails review. | [`04-condensed-master-guidelines.md`](./04-condensed-master-guidelines.md) |

### Enum naming quick reference (file 05)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-AIOPTIMIZATION-11 | The quick reference MUST cover all four languages (Go, TypeScript, PHP, Rust) AND MUST agree byte-for-byte with each language's per-language enum spec; divergence is a Code-Red consistency bug. | [`05-enum-naming-quick-reference.md`](./05-enum-naming-quick-reference.md), [`../02-typescript/97-acceptance-criteria.md`](../02-typescript/97-acceptance-criteria.md), [`../03-golang/97-acceptance-criteria.md`](../03-golang/97-acceptance-criteria.md), [`../04-php/97-acceptance-criteria.md`](../04-php/97-acceptance-criteria.md) |
| AT-AIOPTIMIZATION-12 | Each language section MUST cover declaration, naming, usage, AND a validation checklist; missing any of the four sections fails review. | [`05-enum-naming-quick-reference.md`](./05-enum-naming-quick-reference.md) |

### Cross-cutting

| ID | Criterion | Source |
|----|-----------|--------|
| AT-AIOPTIMIZATION-13 | This folder's content MUST be referenced from the project's AI context bootstrap (system prompt, README, or `AI_INSTRUCTIONS.md`); orphan AI-optimization docs not loaded into AI context fail review because they cannot prevent hallucinations they aren't read. | [`00-overview.md`](./00-overview.md), [`../../15-wp-plugin-how-to/07-reference-implementations/97-acceptance-criteria.md`](../../15-wp-plugin-how-to/07-reference-implementations/97-acceptance-criteria.md) |
| AT-AIOPTIMIZATION-14 | Every rule in this folder MUST be backed by a mechanically checkable enforcement (lint, test, hygiene script, OR review checklist line); rules with no mechanical backing fail review because AI will silently regress them. | [`00-overview.md`](./00-overview.md), [`../../35-enforcement-rules/97-acceptance-criteria.md`](../../35-enforcement-rules/97-acceptance-criteria.md) |

---

## Verification

```bash
# Sync header on condensed
grep -E "Last synced from master:" spec/02-coding-guidelines/06-ai-optimization/04-condensed-master-guidelines.md

# Checklist length
wc -l spec/02-coding-guidelines/06-ai-optimization/02-ai-quick-reference-checklist.md

# Hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../01-cross-language/15-master-coding-guidelines/00-overview.md`](../01-cross-language/15-master-coding-guidelines/00-overview.md) — Master guidelines SSOT
- [`../../35-enforcement-rules/97-acceptance-criteria.md`](../../35-enforcement-rules/97-acceptance-criteria.md) — Enforcement layer
- [`../02-typescript/97-acceptance-criteria.md`](../02-typescript/97-acceptance-criteria.md) — TS enum rules
- [`../03-golang/97-acceptance-criteria.md`](../03-golang/97-acceptance-criteria.md) — Go enum rules
- [`../04-php/97-acceptance-criteria.md`](../04-php/97-acceptance-criteria.md) — PHP enum rules

---

*Curated 2026-04-25 — closes batch-17 item 5. Replaces v1.0.0 scaffold.*
