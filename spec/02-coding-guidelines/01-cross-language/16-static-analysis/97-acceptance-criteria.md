# Acceptance Criteria — Static Analysis & Linter Enforcement

> **Version:** 3.2.0
> **Updated:** 2026-04-26 (UTC+8) — atomized narrative checklist into AT-CGSA-NN IDs (closes F-AUD30-02 / Task #4).
> **Status:** Active
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## Acceptance Criteria

| ID | Criterion | Source |
|----|-----------|--------|
| AT-CGSA-01 | Every supported language (8) has a dedicated linter spec under `spec/02-coding-guidelines/01-cross-language/16-static-analysis/`. | [`00-overview.md`](./00-overview.md) |
| AT-CGSA-02 | All language specs enforce identical thresholds: **15-line functions, 3 positional params, cyclomatic complexity ≤ 10**. | [`../../consolidated-review-guide/02-function-and-file-size.md`](../../consolidated-review-guide/02-function-and-file-size.md) |
| AT-CGSA-03 | SonarQube rule IDs are mapped for **every** enforceable rule per language. | per-language linter spec files |
| AT-CGSA-04 | Integration checklist in each spec uses the standardized table format with 🔲 status markers. | per-language linter spec files |
| AT-CGSA-05 | The CI pipeline spec defines a **unified quality gate** referencing all 8 languages. | [`./09-ci-pipeline-quality-gate/00-overview.md`](./09-ci-pipeline-quality-gate/00-overview.md) (or current numbered equivalent) |
| AT-CGSA-06 | The cross-language rule matrix covers **all 7 SonarQube rules across all 8 languages** (no empty cells). | [`./00-overview.md`](./00-overview.md) §rule-matrix |
| AT-CGSA-07 | The TypeScript ESLint spec is cross-referenced from this folder's overview, with the canonical content living in [`../../02-typescript/`](../../02-typescript/00-overview.md). | [`00-overview.md`](./00-overview.md) |
| AT-CGSA-08 | Every spec file in this folder includes a `## Keywords` and `## Scoring` section per `spec/01-spec-authoring-guide/14-scoring-metrics.md`. | [`../../../01-spec-authoring-guide/14-scoring-metrics.md`](../../../01-spec-authoring-guide/14-scoring-metrics.md) |
| AT-CGSA-09 | Each language spec documents its **exemption / suppression syntax** (e.g. `// eslint-disable-next-line`, `//nolint:gocritic`). | per-language linter spec files |
| AT-CGSA-10 | The CI spec provides **both GitHub Actions and GitLab CI** templates copy-pastable into a fresh repo. | [`./09-ci-pipeline-quality-gate/00-overview.md`](./09-ci-pipeline-quality-gate/00-overview.md) |

---

## Won't Have (this version)

- Pre-commit hook configurations — deferred to a future iteration.
- IDE-specific settings files (`.vscode/`, `.idea/`) — out of scope for static-analysis spec.

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../../consolidated-review-guide/97-acceptance-criteria.md`](../../consolidated-review-guide/97-acceptance-criteria.md) — Cross-cutting `AT-CONSOLIDATEDREVIEWGUIDE-*` IDs that subsume some rules above


---

## Fixtures

Fixtures for every AT row in this file are covered by the global P2g sweep — see [`../../../97a-acceptance-criteria-fixtures.md`](../../../97a-acceptance-criteria-fixtures.md) (apply the matching pattern by section).
