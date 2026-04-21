# SonarQube Configuration

> **Parent:** [09-ci-pipeline-quality-gate overview](./00-overview.md)

---

## 4. SonarQube Configuration

### 4.1 `sonar-project.properties`

```properties
# Project identification
sonar.projectKey=<project-key>
sonar.projectName=<project-name>
sonar.projectVersion=1.0

# Source configuration
sonar.sources=src
sonar.tests=tests
sonar.sourceEncoding=UTF-8

# Language-specific coverage reports
# TypeScript / Node.js
sonar.javascript.lcov.reportPaths=coverage/lcov.info

# Go
sonar.go.coverage.reportPaths=coverage.out

# PHP
sonar.php.coverage.reportPaths=coverage.xml

# C# / VB.NET
sonar.cs.opencover.reportsPaths=**/coverage.opencover.xml
sonar.vbnet.opencover.reportsPaths=**/coverage.opencover.xml

# Python
sonar.python.coverage.reportPaths=coverage.xml

# Rust (community plugin)
# sonar.rust.lcov.reportPaths=lcov.info

# Quality gate thresholds (custom)
sonar.qualitygate.wait=true
```

### 4.2 Quality Gate Definition

Create this quality gate in SonarQube and set as default:

| Condition | Metric | Operator | Value |
|-----------|--------|----------|-------|
| New bugs | Bugs on new code | > | 0 |
| New vulnerabilities | Vulnerabilities on new code | > | 0 |
| New code smells rating | Maintainability on new code | worse than | A |
| New coverage | Coverage on new code | < | 80% |
| New duplicated lines | Duplicated lines on new code | > | 3% |
| New security hotspots | Security hotspots reviewed on new code | < | 100% |

### 4.3 SonarQube Rule Profile

Enable these rules in **every** language profile:

| Rule | Description | Threshold |
|------|-------------|-----------|
| S3776 | Cognitive Complexity | 10 |
| S138 | Function too long | 15 lines |
| S107 | Too many parameters | 3 |
| S134 | Nesting depth | 1 |
| S1871 | Identical branches | — |
| S4144 | Identical functions | — |
| S1066 | Collapsible if | — |
| S1126 | Return boolean directly | — |
| S1192 | Duplicated string literals | 3 occurrences |

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`01-quality-gate-thresholds.md`](./01-quality-gate-thresholds.md) — Thresholds
- [`05-ci-workflows.md`](./05-ci-workflows.md) — CI workflows

---

*SonarQube configuration v3.2.0 — 2026-04-20*
