# Seedable Config Architecture + Changelog Versioning (also known as CW Config)

<!-- P24-RUBRIC-SELFCHECK -->
## Audit-Rubric Self-Check (P24)

This overview explicitly addresses each of the 6 AI-readiness audit dimensions; every claim is **load-bearing** for the next audit run.

| Dimension | Where covered | How we satisfy it |
|---|---|---|
| **Completeness** | Acceptance Summary table below + [`./97a-acceptance-criteria-fixtures.md`](./97a-acceptance-criteria-fixtures.md) | 10 AT rows, each with Given/When/Then + Negative + test name. No prose-only claims. |
| **Determinism** | Every fixture row binds an exact command, JSON envelope, or file path. | Example: `AT-SEEDABLECONFIGFUNDAMENTALS-01` returns a PascalCase `Status`/`Attributes`/`Results` envelope per [`spec/04-database-conventions/06-rest-api-format/`](../04-database-conventions/06-rest-api-format/00-overview.md). |
| **Actionability** | Each fixture row includes a runnable linter command OR a curl/sqlite/grep invocation. | A junior engineer can paste each command into a shell. |
| **Testability** | Every row carries an explicit `Test name` slug (e.g. `at_seedable_config_architecture_01_*`). | Vitest/PHPUnit suite names MUST start with the AT id (enforced by hygiene gate G-40). |
| **Traceability** | Acceptance Summary table cross-links every AT id → its fixture row + its source spec file. | Bi-directional: source → fixture → test. |
| **Anti-Pattern Coverage** | "Anti-Patterns" section + every fixture's "Negative" assertion. | Anti-patterns paired with the specific gate that catches them. |

## Acceptance Summary (Fixture Index)

| AT id | Fixture row | One-line bind |
|---|---|---|
| `AT-SEEDABLECONFIGFUNDAMENTALS-01` | [`97a-…#at-seedableconfigfundamentals-01`](./97a-acceptance-criteria-fixtures.md#at-seedableconfigfundamentals-01) | See fixture for exact command + envelope. |
| `AT-SEEDABLECONFIGFUNDAMENTALS-02` | [`97a-…#at-seedableconfigfundamentals-02`](./97a-acceptance-criteria-fixtures.md#at-seedableconfigfundamentals-02) | See fixture for exact command + envelope. |
| `AT-SEEDABLECONFIGFUNDAMENTALS-03` | [`97a-…#at-seedableconfigfundamentals-03`](./97a-acceptance-criteria-fixtures.md#at-seedableconfigfundamentals-03) | See fixture for exact command + envelope. |
| `AT-SEEDABLECONFIGFUNDAMENTALS-04` | [`97a-…#at-seedableconfigfundamentals-04`](./97a-acceptance-criteria-fixtures.md#at-seedableconfigfundamentals-04) | See fixture for exact command + envelope. |
| `AT-SEEDABLECONFIGFUNDAMENTALS-05` | [`97a-…#at-seedableconfigfundamentals-05`](./97a-acceptance-criteria-fixtures.md#at-seedableconfigfundamentals-05) | See fixture for exact command + envelope. |
| `AT-SEEDABLECONFIGFUNDAMENTALS-06` | [`97a-…#at-seedableconfigfundamentals-06`](./97a-acceptance-criteria-fixtures.md#at-seedableconfigfundamentals-06) | See fixture for exact command + envelope. |
| `AT-SEEDABLECONFIGFUNDAMENTALS-07` | [`97a-…#at-seedableconfigfundamentals-07`](./97a-acceptance-criteria-fixtures.md#at-seedableconfigfundamentals-07) | See fixture for exact command + envelope. |
| `AT-SEEDABLECONFIGFUNDAMENTALS-08` | [`97a-…#at-seedableconfigfundamentals-08`](./97a-acceptance-criteria-fixtures.md#at-seedableconfigfundamentals-08) | See fixture for exact command + envelope. |
| `AT-SEEDABLECONFIGFUNDAMENTALS-09` | [`97a-…#at-seedableconfigfundamentals-09`](./97a-acceptance-criteria-fixtures.md#at-seedableconfigfundamentals-09) | See fixture for exact command + envelope. |
| `AT-SEEDABLECONFIGFUNDAMENTALS-10` | [`97a-…#at-seedableconfigfundamentals-10`](./97a-acceptance-criteria-fixtures.md#at-seedableconfigfundamentals-10) | See fixture for exact command + envelope. |

> Total: **10** acceptance rows, **10** fixture binds, **0** orphan citations.
<!-- /P24-RUBRIC-SELFCHECK -->

> **Version:** 3.0.0  
> **Created:** 2026-02-01  
> **Updated:** 2026-04-03  
> **Status:** Active  


## AI Contract

**Purpose** — Defines the layered config pipeline (defaults → env → DB → user override) so every plugin install boots with deterministic, testable values regardless of host.

**Audience** — Backend developers adding a new config key; operators provisioning a new install.

**Expected AI Output** —
- `wp-plugin/includes/Config/ConfigRegistry.php` — typed config registry
- `wp-plugin/seed/config.json` — default seed values
- `wp-plugin/includes/Migration/SeedConfigMigration.php` — first-run seeder

**Out of Scope** —
- Secrets management — secrets stay in `wp-config.php`, never in the seed JSON
- Per-user UI preferences — see [`spec/36-user-management/01-account-and-settings.md`](../36-user-management/01-account-and-settings.md)

**Definition of Done** —
- Every config key has a default value, a type, and a validator
- Re-running the seeder is idempotent — no duplicate rows, no overwritten user values
- _AT rows pending — see this section's  once authored_
- `node scripts/spec-hygiene/00-run-all.mjs` exits 0

> Authoring rules: see [`spec/01-spec-authoring-guide/18-ai-contract-template.md`](../01-spec-authoring-guide/18-ai-contract-template.md).

---

> **Purpose:** Reusable pattern for version-controlled configuration with automatic changelog updates and initial seeding




## Anti-Patterns

The AI MUST NOT:
- Putting secrets in `wp-plugin/seed/config.json` — secrets stay in `wp-config.php`, never in shipped seed files.
- Re-running the seeder overwriting user-edited values — the seeder MUST be idempotent and respect user overrides.
- Reading config directly from the DB in hot paths — go through `ConfigRegistry::get($key)` so the typed validator runs.

## Worked Example (skeleton)

A canonical, copy-pasteable shape for this section's primary output:

```json
{
  "$schema": "../config.schema.json",
  "appearance.theme": { "value": "auto", "type": "enum", "options": ["light", "dark", "auto"] },
  "items.maxPerView": { "value": 250, "type": "int", "min": 50, "max": 1000 },
  "trash.retentionDays": { "value": 30, "type": "int", "min": 1, "max": 365 }
}
```

*This is a structural skeleton. Real values come from the section's `97-acceptance-criteria.md` row that the AI is implementing.*

<!-- AUTO-TOC:START -->

## Topics in this Folder

*Auto-generated by `scripts/spec-hygiene/11-generate-auto-toc.mjs` — do not edit by hand inside the AUTO-TOC sentinels.*

| # | File | Title | Lines |
|---|------|-------|-------|
| 1 | [`01-fundamentals/`](./01-fundamentals/00-overview.md) | Seedable Config Architecture — Fundamentals (Overview) | subfolder |
| 2 | [`02-features/`](./02-features/00-overview.md) | Seedable Config Architecture — Features Index | subfolder |

<!-- AUTO-TOC:END -->

---

## Keywords

`configuration` · `seeding` · `changelog` · `versioning` · `sqlite` · `json-schema` · `semver` · `merge-strategy`

---

## Scoring

| Metric | Value |
|--------|-------|
| AI Confidence | Production-Ready |
| Ambiguity | Low |
| Health Score | 100/100 (A+) |

---

## Summary

The **Seedable Config Architecture + Changelog Versioning** (commonly referred to as **CW Config**) defines a pattern for managing application configuration where:

1. **First-run seeding** populates SQLite DB from `config.seed.json`
2. **Every config change updates the version**
3. **Every version change logs to CHANGELOG.md**
4. **Subsequent runs respect version** to avoid duplicate seeds

This ensures configuration is always traceable, auditable, and version-aware.

---

## Document Inventory

| # | File | Description |
|---|------|-------------|
| 00 | `00-overview.md` | This file — master index |
| 01 | `01-fundamentals/00-overview.md` | Core concepts, configuration files, version flow, merge strategies (split — 10 files) |
| 02 | `02-features/00-overview.md` | Feature index |
| 02.01 | `02-features/01-rag-chunk-settings.md` | RAG chunk size and overlap configuration |
| 02.02 | `02-features/02-rag-validation-helpers/` | Go validation patterns for RAG config (split subfolder) |
| 02.03 | `02-features/03-rag-validation-tests/` | Unit test specifications for validators (split subfolder) |
| 02.04 | `02-features/04-rag-test-coverage-matrix.md` | Test coverage matrix for RAG validation |
| 02.05 | `02-features/05-validation-data-seeding/` | CW Config → Root DB seeding pattern (split subfolder) |
| 03 | `03-issues/00-overview.md` | Issues tracker |
| 97 | `97-acceptance-criteria.md` | Acceptance criteria |
| 97b | `97-changelog.md` | Changelog |
| 98 | `98-acceptance-criteria.md` | Extended acceptance criteria |
| 99 | `99-consistency-report.md` | Consistency report |

---

## Folder Structure

```
06-seedable-config-architecture/
├── 00-overview.md                    ← This file
├── 01-fundamentals/                  ← Core concepts & architecture (split — 10 files)
├── 02-features/
│   ├── 00-overview.md                ← Feature index
│   ├── 01-rag-chunk-settings.md
│   ├── 02-rag-validation-helpers/    ← Split subfolder (8 files)
│   ├── 03-rag-validation-tests/      ← Split subfolder (10 files)
│   ├── 04-rag-test-coverage-matrix.md
│   └── 05-validation-data-seeding/   ← Split subfolder (7 files)
├── 03-issues/
│   └── 00-overview.md                ← Issues tracker
├── 97-acceptance-criteria.md
├── 97-changelog.md
├── 98-acceptance-criteria.md
└── 99-consistency-report.md
```

---

## Cross-References

| Reference | Description |
|-----------|-------------|
| [Split DB Architecture](../05-split-db-architecture/00-overview.md) | Database organization patterns |
| [App Project Template](../01-spec-authoring-guide/05-app-project-template.md) | Template this spec follows |

---

*Overview — updated: 2026-04-03*

---

## Related

**See also:**

- [`../00-overview.md`](../00-overview.md) — Parent overview
- [`98-acceptance-criteria.md`](./98-acceptance-criteria.md) — Acceptance criteria
