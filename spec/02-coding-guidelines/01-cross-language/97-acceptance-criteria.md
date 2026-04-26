# Coding Guidelines — Cross-Language Acceptance Criteria

> **Version:** 3.2.0
> **Updated:** 2026-04-26 (UTC+8) — split AC-01/AC-02 macro-criteria into atomic AT-CGCL-NN IDs (closes F-AUD30-02 / Task #4).
> **Status:** Active
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## Acceptance Criteria

| ID | Criterion | Source |
|----|-----------|--------|
| AT-CGCL-01 | Boolean principles define **naming, evaluation, and composition** patterns (positive prefixes, no negated names, no plurals). | [`./02-boolean-principles/00-overview.md`](./02-boolean-principles/00-overview.md) |
| AT-CGCL-02 | Casting-elimination patterns provide type-safe alternatives to type assertions across all 8 supported languages. | [`./03-casting-elimination-patterns/00-overview.md`](./03-casting-elimination-patterns/00-overview.md) |
| AT-CGCL-03 | Code-style rules define formatting, naming, and structural conventions with concrete `❌` / `✅` examples per language. | [`./04-code-style/00-overview.md`](./04-code-style/00-overview.md) |
| AT-CGCL-04 | Every cross-language guideline includes **both** ❌ (forbidden) and ✅ (compliant) code examples — no unmatched-pair examples allowed. | every spec file in this folder |
| AT-CGCL-05 | ESLint / linter rule IDs are documented for automated enforcement of every rule that can be machine-checked. | [`./16-static-analysis/97-acceptance-criteria.md`](./16-static-analysis/97-acceptance-criteria.md) (cf. AT-CGSA-03) |
| AT-CGCL-06 | The consolidated master guide ([`../consolidated-review-guide/`](../consolidated-review-guide/00-overview.md)) reflects the latest cross-language rules and serves as the canonical AI reference. | [`../consolidated-review-guide/97-acceptance-criteria.md`](../consolidated-review-guide/97-acceptance-criteria.md) |

---

## Notes

- **Atomization:** Until v3.1, this file used 2 macro-criteria (`AC-01`, `AC-02`) each containing 3 nested bullets. v3.2 splits them into 6 atomic, individually-testable rows so PR reviewers (human or AI) can mark them off one-at-a-time.
- **Sub-folder coverage:** Each numbered sub-folder (`02-boolean-principles/`, `03-casting-elimination/`, …) has its own `97-acceptance-criteria.md` with `AT-{FOLDER-SHORTCODE}-NN` IDs that drill into the rules referenced above.

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`16-static-analysis/97-acceptance-criteria.md`](./16-static-analysis/97-acceptance-criteria.md) — `AT-CGSA-*` enforcement IDs
- [`../consolidated-review-guide/97-acceptance-criteria.md`](../consolidated-review-guide/97-acceptance-criteria.md) — `AT-CONSOLIDATEDREVIEWGUIDE-*` cross-cutting IDs
