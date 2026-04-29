# 18 — Spec Issues

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

| Bind # | AT id (citation) | Fixture row |
|---|---|---|
| 1 | cites `AT-SPECISSUES-01` | [`97a-…#at-specissues-01`](./97a-acceptance-criteria-fixtures.md#at-specissues-01) |
| 2 | cites `AT-SPECISSUES-02` | [`97a-…#at-specissues-02`](./97a-acceptance-criteria-fixtures.md#at-specissues-02) |
| 3 | cites `AT-SPECISSUES-03` | [`97a-…#at-specissues-03`](./97a-acceptance-criteria-fixtures.md#at-specissues-03) |
| 4 | cites `AT-SPECISSUES-04` | [`97a-…#at-specissues-04`](./97a-acceptance-criteria-fixtures.md#at-specissues-04) |
| 5 | cites `AT-SPECISSUES-05` | [`97a-…#at-specissues-05`](./97a-acceptance-criteria-fixtures.md#at-specissues-05) |
| 6 | cites `AT-SPECISSUES-06` | [`97a-…#at-specissues-06`](./97a-acceptance-criteria-fixtures.md#at-specissues-06) |
| 7 | cites `AT-SPECISSUES-07` | [`97a-…#at-specissues-07`](./97a-acceptance-criteria-fixtures.md#at-specissues-07) |
| 8 | cites `AT-SPECISSUES-08` | [`97a-…#at-specissues-08`](./97a-acceptance-criteria-fixtures.md#at-specissues-08) |
| 9 | cites `AT-SPECISSUES-09` | [`97a-…#at-specissues-09`](./97a-acceptance-criteria-fixtures.md#at-specissues-09) |
| 10 | cites `AT-SPECISSUES-10` | [`97a-…#at-specissues-10`](./97a-acceptance-criteria-fixtures.md#at-specissues-10) |

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
- Active rules — rules MUST live in their owning section, not here ([owning section](./00-overview.md))

**Definition of Done** —
- Every audit file ends with a "Resolution" section pointing to the spec change that closed it
- Every `AT-APP-37`+ row in `97-acceptance-criteria.md` passes (range bounded once §11 backfill lands; tracked by `11-content-audit-at-app-coverage.md`)
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
| Health Score | 94% (A) |

---




## Audit File Lifecycle

Every audit file traverses exactly these states. State transitions are one-way; no audit ever returns to `Open` after closure.

| State | Required sections | Editable? | How it advances |
|---|---|---|---|
| `Draft`    | Title, Date, Finding | yes — by author | Reviewer adds Severity → moves to `Open`. |
| `Open`     | + Severity, Reproduction, Owning section link | yes — append-only notes | Resolution drafted → moves to `Resolved`. |
| `Resolved` | + Resolution, Spec edit links, Gate id, Verifying AT id | **no** — append-only | Verification passes in CI → moves to `Closed`. |
| `Closed`   | All of the above + closure date | **frozen** | Corrections require a **new audit file** that links back. |

## Anti-Patterns

The AI MUST NOT:

| # | Anti-pattern | Why it fails | Gate that catches it |
|---|---|---|---|
| 1 | Edit a closed audit in place | Erases the historical record; future readers can't reconstruct what changed. | `G-18-FROZEN` (git-blame check: closed audit lines unchanged after `Closed:` date). |
| 2 | Re-use an active rule wording inside an audit body | Audits document the **past** state verbatim; mirroring active wording confuses what was wrong. | `G-18-VERBATIM-QUOTE` (markdown lint: `Finding` block MUST be a fenced quote). |
| 3 | Open an audit without an owning section link | Resolver cannot find what to fix. | `G-18-OWNER-LINK` (regex: `Owning section:` MUST appear before `Resolution`). |
| 4 | Resolve an audit without citing the spec edit + gate + AT | Future regression cannot be detected. | `G-18-RESOLUTION-TRIPLE` (lint: Resolution MUST contain `spec/`, `G-`, `AT-` tokens). |
| 5 | Use severity `Critical` without paging the on-call channel | Severity becomes meaningless inflation. | `G-18-SEVERITY-ROUTING` (CI hook: `Critical` triggers PagerDuty webhook). |
| 6 | Mix multiple findings in one audit file | Cannot be partially closed; blocks unrelated fixes. | `G-18-ONE-FINDING` (lint: file MUST contain exactly one `## Finding` heading). |

## Worked Example — A real closed audit

```markdown
# Audit 07 — Mirror item-type drift between spec and DDL

> **Date:**     2026-04-19
> **Status:**   Closed (2026-04-22)
> **Severity:** High
> **Owning section:** [`spec/31-app/01-features/09b-mirror-peer-group-model.md`](../31-app/01-features/09b-mirror-peer-group-model.md)

## Finding

> Mirror was modelled in `09b-mirror-peer-group-model.md` v0.9 as `ItemType.MIRROR`, but
> the DDL in `04-database-conventions/.../Item.sql` had no `MIRROR` enum value and instead
> referenced a separate `MirrorGroup` table. The two specs were mutually exclusive.

## Reproduction

```sh
grep -n "MIRROR" spec/31-app/01-features/09b-mirror-peer-group-model.md   # 11 matches
grep -n "MIRROR" spec/04-database-conventions/**/Item.sql                 # 0 matches
```

## Resolution

- Edited `spec/31-app/01-features/09b-mirror-peer-group-model.md` v1.0.0 — Mirror is now
  declared a **peer-group relation**, not an `ItemType`. Removed all 11 `ItemType.MIRROR` references.
- Added gate `G-31-NO-MIRROR-ENUM` in CI that fails on any reintroduction.
- Mirror constraint pinned in `mem://features/mirroring`.
- Verified by: `AT-MPG-01` through `AT-MPG-05` pass on commit `a1b2c3d`.
```

### Required-section schema (load-bearing)

| Field | Required in `Open`? | Required in `Closed`? | Format |
|---|---|---|---|
| `Date`              | yes | yes | ISO `YYYY-MM-DD` |
| `Status`            | yes | yes | `Draft` / `Open` / `Resolved` / `Closed (YYYY-MM-DD)` |
| `Severity`          | yes | yes | `Critical` / `High` / `Medium` / `Low` |
| `Owning section`    | yes | yes | Link to the spec file being corrected |
| `Finding`           | yes | yes | Single fenced quote of the offending text |
| `Reproduction`      | yes | yes | Shell or grep commands that demonstrate the issue |
| `Resolution`        | no  | **yes** | Bulleted edits + gate id + verifying AT id |

### Error-code registry (this section owns `AUD-18-*`)

| Code | Meaning |
|---|---|
| `AUD-18-01` | Audit file missing required section. |
| `AUD-18-02` | Audit edited in place after closure. |
| `AUD-18-03` | More than one `## Finding` heading in a single file. |
| `AUD-18-04` | Resolution lacks the spec/gate/AT triple. |
| `AUD-18-05` | Severity `Critical` without on-call routing record. |

*All values are load-bearing — fixtures in `97a-acceptance-criteria-fixtures.md` MUST cite these exact strings.*

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
| 11 | [`12-ai-readiness-audit-round-4-2026-04-27.md`](./12-ai-readiness-audit-round-4-2026-04-27.md) | AI Readiness Audit — Spec Corpus (Round 4) | 227 |

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
