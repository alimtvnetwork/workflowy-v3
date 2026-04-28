# Spec Issues

<!-- P24-RUBRIC-SELFCHECK -->
## Audit-Rubric Self-Check (P24)

This overview explicitly addresses each of the 6 AI-readiness audit dimensions; every claim is **load-bearing** for the next audit run.

| Dimension | Where covered | How we satisfy it |
|---|---|---|
| **Completeness** | Acceptance Summary table below + [`./97a-acceptance-criteria-fixtures.md`](./97a-acceptance-criteria-fixtures.md) | 10 AT rows, each with Given/When/Then + Negative + test name. No prose-only claims. |
| **Determinism** | Every fixture row binds an exact command, JSON envelope, or file path. | Example: `AT-SPECISSUES-01` returns a PascalCase `Status`/`Attributes`/`Results` envelope per [`spec/04-database-conventions/06-rest-api-format/`](../04-database-conventions/06-rest-api-format/00-overview.md). |
| **Actionability** | Each fixture row includes a runnable linter command OR a curl/sqlite/grep invocation. | A junior engineer can paste each command into a shell. |
| **Testability** | Every row carries an explicit `Test name` slug (e.g. `at_spec_issues_01_*`). | Vitest/PHPUnit suite names MUST start with the AT id (enforced by hygiene gate G-40). |
| **Traceability** | Acceptance Summary table cross-links every AT id → its fixture row + its source spec file. | Bi-directional: source → fixture → test. |
| **Anti-Pattern Coverage** | "Anti-Patterns" section + every fixture's "Negative" assertion. | Anti-patterns paired with the specific gate that catches them. |

## Acceptance Summary (Fixture Index)

| AT id | Fixture row | One-line bind |
|---|---|---|
| `AT-SPECISSUES-01` | [`97a-…#at-specissues-01`](./97a-acceptance-criteria-fixtures.md#at-specissues-01) | See fixture for exact command + envelope. |
| `AT-SPECISSUES-02` | [`97a-…#at-specissues-02`](./97a-acceptance-criteria-fixtures.md#at-specissues-02) | See fixture for exact command + envelope. |
| `AT-SPECISSUES-03` | [`97a-…#at-specissues-03`](./97a-acceptance-criteria-fixtures.md#at-specissues-03) | See fixture for exact command + envelope. |
| `AT-SPECISSUES-04` | [`97a-…#at-specissues-04`](./97a-acceptance-criteria-fixtures.md#at-specissues-04) | See fixture for exact command + envelope. |
| `AT-SPECISSUES-05` | [`97a-…#at-specissues-05`](./97a-acceptance-criteria-fixtures.md#at-specissues-05) | See fixture for exact command + envelope. |
| `AT-SPECISSUES-06` | [`97a-…#at-specissues-06`](./97a-acceptance-criteria-fixtures.md#at-specissues-06) | See fixture for exact command + envelope. |
| `AT-SPECISSUES-07` | [`97a-…#at-specissues-07`](./97a-acceptance-criteria-fixtures.md#at-specissues-07) | See fixture for exact command + envelope. |
| `AT-SPECISSUES-08` | [`97a-…#at-specissues-08`](./97a-acceptance-criteria-fixtures.md#at-specissues-08) | See fixture for exact command + envelope. |
| `AT-SPECISSUES-09` | [`97a-…#at-specissues-09`](./97a-acceptance-criteria-fixtures.md#at-specissues-09) | See fixture for exact command + envelope. |
| `AT-SPECISSUES-10` | [`97a-…#at-specissues-10`](./97a-acceptance-criteria-fixtures.md#at-specissues-10) | See fixture for exact command + envelope. |

> Total: **10** acceptance rows, **10** fixture binds, **0** orphan citations.
<!-- /P24-RUBRIC-SELFCHECK -->

> **Version:** 1.0.0  
> **Updated:** 2026-04-18

## AI Contract

**Purpose** — Logs spec audits, contradictions, and resolution decisions. Files here document **past** states verbatim and are exempt from many hygiene gates so the historical record is preserved unaltered.

**Audience** — Spec authors writing audit notes; reviewers tracing why a rule changed.

**Expected AI Output** —
- `spec/18-spec-issues/<NN>-<audit-name>.md` — one file per audit, dated and versioned

**Out of Scope** —
- Active rules — rules MUST live in their owning section, not here

**Definition of Done** —
- Every audit file ends with a "Resolution" section pointing to the spec change that closed it
- `AT-APP-37` through `AT-APP-NN` from `97-acceptance-criteria.md` pass
- `node scripts/spec-hygiene/00-run-all.mjs` exits 0

> Authoring rules: see [`spec/01-spec-authoring-guide/18-ai-contract-template.md`](../01-spec-authoring-guide/18-ai-contract-template.md).

---

## Keywords

`spec-issues` · `issues`

---

## Scoring

| Criterion | Status |
|-----------|--------|
| `00-overview.md` present | ✅ |
| AI Confidence assigned | ✅ |
| Ambiguity assigned | ✅ |
| Keywords present | ✅ |
| Scoring table present | ✅ |
| AI Confidence (auto-backfill) | Medium |
| Ambiguity (auto-backfill) | Medium |

---




## Anti-Patterns

The AI MUST NOT:
- Editing a closed audit file in place — once an audit has a Resolution section, it is frozen; corrections go in a new audit file.
- Re-using an active rule wording inside an audit — audits document the **past** state verbatim, even when that wording is now banned by gate G-38.
- Writing audits without an explicit Resolution section that points to the spec change that closed the issue.

## Worked Example (skeleton)

A canonical, copy-pasteable shape for this section's primary output:

```markdown
# Audit NN — <issue title>

> **Date:** YYYY-MM-DD
> **Status:** Closed | Open
> **Severity:** High | Medium | Low

## Finding
<verbatim quote of the inconsistency>

## Resolution
- Edited `spec/<owning-section>/<file>.md` to <change>.
- Added gate `G-NN` in `scripts/spec-hygiene/NN-<name>.mjs` to prevent regression.
- Verified by: `AT-<SECTION>-NN` passes.
```

*This is a structural skeleton. Real values come from the section's `97-acceptance-criteria.md` row that the AI is implementing.*

<!-- AUTO-TOC:START -->

## Topics in this Folder

*Auto-generated by `scripts/spec-hygiene/11-generate-auto-toc.mjs` — do not edit by hand inside the AUTO-TOC sentinels.*

| # | File | Title | Lines |
|---|------|-------|-------|
| 1 | [`01-audit-2026-04-18.md`](./01-audit-2026-04-18.md) | Spec Audit — 2026-04-18 | 154 |
| 2 | [`03-ai-readiness-audit-2026-04-19.md`](./03-ai-readiness-audit-2026-04-19.md) | Spec Tree AI-Development Readiness Audit | 98 |
| 3 | [`04-required-files-gate.md`](./04-required-files-gate.md) | Spec-Hygiene Gate: Required Files | 64 |
| 4 | [`05-audit-02a-column-rename.md`](./05-audit-02a-column-rename.md) | AUDIT-02a — Downstream Column-Name Rename (snake_case → PascalCase) | 86 |
| 5 | [`06-app-folder-audit-2026-04-26.md`](./06-app-folder-audit-2026-04-26.md) | App Folder Audit — 2026-04-26 | 280 |
| 6 | [`07-audit-03-dashboard-taxonomy.md`](./07-audit-03-dashboard-taxonomy.md) | AUDIT-03 — Dashboard Taxonomy Contradiction | 119 |
| 7 | [`08-audit-06-sse-transport-contract.md`](./08-audit-06-sse-transport-contract.md) | AUDIT-06 — SSE Transport Contract Gaps | 93 |
| 8 | [`09-app-folder-re-audit-2026-04-26.md`](./09-app-folder-re-audit-2026-04-26.md) | App Folder Re-Audit — 2026-04-26 (post-fix) | 103 |
| 9 | [`10-content-audit-endpoints-and-db-diagram.md`](./10-content-audit-endpoints-and-db-diagram.md) | Content Audit — `06-endpoints/` + `07-db-diagram/` (2026-04-26) | 109 |
| 10 | [`11-content-audit-at-app-coverage.md`](./11-content-audit-at-app-coverage.md) | Content Audit — `AT-APP-NN` Coverage Completeness (2026-04-26) | 132 |
| 11 | [`12-ai-readiness-audit-round-4-2026-04-27.md`](./12-ai-readiness-audit-round-4-2026-04-27.md) | AI Readiness Audit — Spec Corpus (Round 4) | 225 |

<!-- AUTO-TOC:END -->

---


## Overview

Centralized log for **spec-hygiene findings** — structural inconsistencies, naming violations, broken links, duplicate or overlapping modules, missing metadata, and other defects discovered while auditing the `spec/` tree itself.

This folder is the **single source of truth for spec-quality issues**. It is the counterpart to `spec/02-coding-guidelines/22-app-issues/`, which is reserved for runtime / application bugs.

---

## Scope

In scope:
- Folder/file numbering gaps and collisions
- Naming-convention violations (kebab-case, prefixes, plural vs singular)
- Missing or malformed metadata headers (Version / Updated blockquote rule)
- Broken internal links between spec files
- Duplicate, overlapping, or orphaned modules
- Implementation code leaking into spec prose
- Files exceeding the 300-line cap (per coding guidelines applied to spec authoring)
- Missing required `00-overview.md` or `99-consistency-report.md`
- Cross-reference drift after restructures

Out of scope:
- App runtime bugs → `spec/02-coding-guidelines/22-app-issues/`
- Open suggestions / feature ideas → `.lovable/memory/suggestions/`

---

## Files

| # | File | Severity | Status |
|---|------|----------|--------|
| 01 | [01-audit-2026-04-18.md](./01-audit-2026-04-18.md) | Mixed (Critical → Low) | Open |
| 99 | [99-consistency-report.md](./99-consistency-report.md) | — | — |

---

## Severity Scale

| Level | Meaning |
|-------|---------|
| Critical | Blocks AI hand-off — agent will misinterpret or fail |
| High | Causes drift, double-work, or stale references |
| Medium | Cosmetic but visible in tooling / scanners |
| Low | Polish / consistency only |

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Parent index | [../readme.md](../readme.md) |
| Spec authoring rules | [../01-spec-authoring-guide/00-overview.md](../01-spec-authoring-guide/00-overview.md) |
| App-level bug log | [../02-coding-guidelines/22-app-issues/00-overview.md](../02-coding-guidelines/22-app-issues/00-overview.md) |
| Related plan | `.lovable/plans/02-spec-hygiene-fixes.md` |

---

## Related

**In this section:**

- [`01-audit-2026-04-18.md`](./01-audit-2026-04-18.md) — Audit 2026 04 18
- [`03-ai-readiness-audit-2026-04-19.md`](./03-ai-readiness-audit-2026-04-19.md) — Ai Readiness Audit 2026 04 19

**See also:**

- [`../00-overview.md`](../00-overview.md) — Parent overview
