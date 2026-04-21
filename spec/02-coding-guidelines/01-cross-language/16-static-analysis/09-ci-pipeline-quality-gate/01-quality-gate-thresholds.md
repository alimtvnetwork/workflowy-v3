# Universal Quality Gate & Thresholds

> **Parent:** [09-ci-pipeline-quality-gate overview](./00-overview.md)

---

## 1. Universal Quality Gate

Every PR MUST pass **all** of these checks before merge. No exceptions without a documented exemption in the PR description.

### 1.1 Mandatory Thresholds

| Metric | Threshold | SonarQube Rule | Enforcement |
|--------|-----------|----------------|-------------|
| Cognitive complexity per function | ≤ 10 | S3776 | Linter + SonarQube |
| Max function length | ≤ 15 lines | S138 | Linter |
| Max parameters per function | ≤ 3 | S107 | Linter |
| Max nesting depth | ≤ 1 (zero nested `if`) | S134 | Linter |
| Duplicated lines density | ≤ 3% | — | SonarQube |
| Code smells rating | A | — | SonarQube |
| No new bugs | 0 | — | SonarQube |
| No new vulnerabilities | 0 | — | SonarQube |
| No new security hotspots (unreviewed) | 0 | — | SonarQube |
| Test coverage on new code | ≥ 80% | — | SonarQube |

### 1.2 Blocking vs Warning

| Severity | Effect | Examples |
|----------|--------|---------|
| **Error** (blocking) | PR cannot merge | `no-any`, zero nesting, max params, max lines, unwrap/panic |
| **Warning** (non-blocking) | Must be reviewed; tracked in SonarQube | Boolean naming, blank line before return, documentation |

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`02-pipeline-stages.md`](./02-pipeline-stages.md) — Pipeline stages
- [`04-sonarqube-config.md`](./04-sonarqube-config.md) — SonarQube config

---

*Quality gate & thresholds v3.2.0 — 2026-04-20*
