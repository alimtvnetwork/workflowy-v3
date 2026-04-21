# Exemption Process, Dashboard & Integration Checklist

> **Parent:** [09-ci-pipeline-quality-gate overview](./00-overview.md)

---

## 8. Exemption Process

When a rule must be suppressed:

| Requirement | Description |
|-------------|-------------|
| **Inline justification** | Every suppression MUST include a comment explaining why |
| **PR description** | Exemptions MUST be listed in the PR description |
| **Time-boxed** | Suppressions MUST include a TODO with a ticket number for removal |
| **No blanket disables** | Never disable a rule for an entire file or project |

### Suppression Syntax per Language

| Language | Syntax | Example |
|----------|--------|---------|
| TypeScript / Node.js | `// eslint-disable-next-line rule-name -- reason` | `// eslint-disable-next-line max-params -- factory requires 4 deps` |
| Go | `//nolint:lintername // reason` | `//nolint:funlen // migration helper — TODO: PROJ-1234` |
| PHP | `// phpcs:ignore Sniff.Name -- reason` | `// phpcs:ignore Generic.Metrics.FunctionLength -- legacy` |
| C# / VB.NET | `#pragma warning disable RULE // reason` | `#pragma warning disable S138 // generated code` |
| Rust | `#[allow(clippy::lint_name)] // reason` | `#[allow(clippy::too_many_arguments)] // FFI boundary` |
| Python | `# noqa: RULE -- reason` | `# noqa: PLR0913 -- CLI entrypoint` |

---

## 9. Dashboard & Reporting

| Metric | Source | Frequency |
|--------|--------|-----------|
| Quality gate pass rate | SonarQube | Per PR |
| Code coverage trend | SonarQube | Weekly |
| Technical debt ratio | SonarQube | Sprint review |
| Lint warning trend | CI logs | Weekly |
| Suppression count | `grep -r "nolint\|noqa\|eslint-disable\|phpcs:ignore\|pragma warning disable\|allow(clippy" src/` | Monthly |

---

## 10. Integration Checklist

| # | Task | Status |
|---|------|--------|
| 1 | CI pipeline created with all 5 stages | 🔲 |
| 2 | Language-specific linter configured per §3 | 🔲 |
| 3 | All linter warnings treated as errors (`--max-warnings 0` / `-D warnings` / `/warnaserror`) | 🔲 |
| 4 | SonarQube project created with `sonar-project.properties` | 🔲 |
| 5 | SonarQube quality gate created with thresholds from §4.2 | 🔲 |
| 6 | SonarQube rule profile configured with rules from §4.3 | 🔲 |
| 7 | Coverage reports wired to SonarQube | 🔲 |
| 8 | Quality gate set as required status check on `main` / `develop` | 🔲 |
| 9 | Exemption process documented in `CONTRIBUTING.md` | 🔲 |
| 10 | Team reviewed and approved pipeline + thresholds | 🔲 |

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`05-ci-workflows.md`](./05-ci-workflows.md) — CI workflows
- [`01-quality-gate-thresholds.md`](./01-quality-gate-thresholds.md) — Thresholds

---

*Exemptions, dashboard & checklist v3.2.0 — 2026-04-20*
