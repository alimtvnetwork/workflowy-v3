# CI Pipeline Quality Gate — Acceptance Criteria

> **Version:** 2.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## Purpose

Testable acceptance criteria for the Unified CI Pipeline & Quality Gate. Defines the universal pass/fail thresholds, pipeline stages, language commands, SonarQube integration, and the exemption process applied across every project.

ID format: `AT-CIPIPELINEQUALITYGATE-NN`.

---

## Criteria

### Universal Quality Gate (AT-CIPIPELINEQUALITYGATE-01..03)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-CIPIPELINEQUALITYGATE-01 | Every project enforces the documented universal thresholds (coverage %, duplication %, maintainability rating, reliability rating, security rating, technical debt ratio). | [`01-quality-gate-thresholds.md`](./01-quality-gate-thresholds.md) |
| AT-CIPIPELINEQUALITYGATE-02 | A failing threshold blocks the merge — no manual override path exists outside the formal exemption process. | [`01-quality-gate-thresholds.md`](./01-quality-gate-thresholds.md) + [`06-exemptions-and-checklist.md`](./06-exemptions-and-checklist.md) |
| AT-CIPIPELINEQUALITYGATE-03 | Threshold values are versioned in this spec; changes require a changelog entry and team sign-off. | [`01-quality-gate-thresholds.md`](./01-quality-gate-thresholds.md) |

### Pipeline Stages (AT-CIPIPELINEQUALITYGATE-04..05)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-CIPIPELINEQUALITYGATE-04 | Every CI run executes the documented stages in order (e.g. lint → typecheck → test → coverage → security scan → quality gate). | [`02-pipeline-stages.md`](./02-pipeline-stages.md) |
| AT-CIPIPELINEQUALITYGATE-05 | Stages run in parallel where the dependency graph permits; serial-only stages are explicitly justified in the spec. | [`02-pipeline-stages.md`](./02-pipeline-stages.md) |

### Language Commands (AT-CIPIPELINEQUALITYGATE-06..07)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-CIPIPELINEQUALITYGATE-06 | Each supported language (Go, PHP, TypeScript, C#, Rust, VB.NET, Node.js, Python) has its exact lint + test commands documented and pinned to a tool version. | [`03-language-commands.md`](./03-language-commands.md) |
| AT-CIPIPELINEQUALITYGATE-07 | Commands match what's actually wired in `02-go-golangci-lint.md` … `08-python-ruff.md` (sibling files); no drift between docs and CI configs. | [`03-language-commands.md`](./03-language-commands.md) + sibling per-language files |

### SonarQube (AT-CIPIPELINEQUALITYGATE-08..09)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-CIPIPELINEQUALITYGATE-08 | The documented `sonar-project.properties` template applies to every project; mandatory keys (project key, sources, tests, coverage report path) are non-negotiable. | [`04-sonarqube-config.md`](./04-sonarqube-config.md) |
| AT-CIPIPELINEQUALITYGATE-09 | Coverage reports use the documented format per language (e.g. `cobertura.xml` for Go, `clover.xml` for PHP); SonarQube ingestion is verified by the pipeline. | [`04-sonarqube-config.md`](./04-sonarqube-config.md) |

### CI Workflows (AT-CIPIPELINEQUALITYGATE-10..11)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-CIPIPELINEQUALITYGATE-10 | GitHub Actions and GitLab CI templates in `05-ci-workflows.md` produce identical pass/fail results given identical source. | [`05-ci-workflows.md`](./05-ci-workflows.md) |
| AT-CIPIPELINEQUALITYGATE-11 | Mono-repo workflow only runs jobs for changed packages; the change-detection logic is documented and reproducible. | [`05-ci-workflows.md`](./05-ci-workflows.md) |

### Exemptions (AT-CIPIPELINEQUALITYGATE-12..13)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-CIPIPELINEQUALITYGATE-12 | Every exemption request follows the documented form (file, rule, justification, expiry date, reviewer); expired exemptions automatically fail the build. | [`06-exemptions-and-checklist.md`](./06-exemptions-and-checklist.md) |
| AT-CIPIPELINEQUALITYGATE-13 | The integration checklist in `06-exemptions-and-checklist.md` is run by every new project before its first quality-gate-enforced merge. | [`06-exemptions-and-checklist.md`](./06-exemptions-and-checklist.md) |

---

## Verification

```bash
grep -rn "AT-CIPIPELINEQUALITYGATE-" spec/02-coding-guidelines/01-cross-language/16-static-analysis/09-ci-pipeline-quality-gate/
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Subsection overview
- [`../97-acceptance-criteria.md`](../97-acceptance-criteria.md) — Parent static-analysis criteria
- [`../10-cross-language-rule-matrix.md`](../10-cross-language-rule-matrix.md) — Rule-to-linter matrix
- [`../../15-master-coding-guidelines/97-acceptance-criteria.md`](../../15-master-coding-guidelines/97-acceptance-criteria.md) — Master rules enforced here

*Curated v2.0.0 — 2026-04-25 (UTC+8). Replaced auto-generated H-2.1 scaffold.*
