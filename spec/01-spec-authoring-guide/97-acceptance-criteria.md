# Spec Authoring Guide — Acceptance Criteria

> **Version:** 3.2.0  
> **Updated:** 2026-04-29 — renamed 4 section headers `AC-01..04` → `AT-SPECAUTHORING-G01..G04` and 18 row IDs `AC-001..018` → `AT-SPECAUTHORING-001..018` (audit task #20, P3 hot-spot closed). Cascading refs in `00-overview.md` updated; template-example IDs in `03-required-files.md` and `04-cli-module-template.md` migrated to `AT-EXAMPLE-NNN`. **22 active legacy IDs migrated; new `AT-SPECAUTHORING-` namespace registered.**

---

## Overview

18 testable criteria across 4 areas covering spec structure, naming, content, and tooling.

---

## AT-SPECAUTHORING-G01: Folder Structure & Required Files

| # | Criterion | Source |
|---|-----------|--------|
| AT-SPECAUTHORING-001 | Every spec module has `00-overview.md` at root | `03-required-files.md` |
| AT-SPECAUTHORING-002 | Every spec module has `99-consistency-report.md` at root | `03-required-files.md` |
| AT-SPECAUTHORING-003 | CLI modules follow 3-folder pattern (`01-backend/`, `02-frontend/`, `03-deploy/`) | `04-cli-module-template.md` |
| AT-SPECAUTHORING-004 | Subfolders with 3+ files include their own `00-overview.md` | `03-required-files.md` |

---

## AT-SPECAUTHORING-G02: Naming Conventions

| # | Criterion | Source |
|---|-----------|--------|
| AT-SPECAUTHORING-005 | All files use lowercase kebab-case naming | `02-naming-conventions.md` |
| AT-SPECAUTHORING-006 | All folders use lowercase kebab-case naming | `02-naming-conventions.md` |
| AT-SPECAUTHORING-007 | All spec files have unique numeric sequence prefixes within their folder | `02-naming-conventions.md` |
| AT-SPECAUTHORING-008 | Reserved prefixes (00, 97, 98, 99) used only for their designated purposes | `02-naming-conventions.md` |

---

## AT-SPECAUTHORING-G03: Overview Content Standards

| # | Criterion | Source |
|---|-----------|--------|
| AT-SPECAUTHORING-009 | Every `00-overview.md` includes Version and Updated metadata | `00-overview.md` |
| AT-SPECAUTHORING-010 | Every `00-overview.md` includes AI Confidence score | `00-overview.md` |
| AT-SPECAUTHORING-011 | Every `00-overview.md` includes Ambiguity score | `00-overview.md` |
| AT-SPECAUTHORING-012 | Every `00-overview.md` includes Keywords section | `00-overview.md` |
| AT-SPECAUTHORING-013 | Every `00-overview.md` includes Scoring table | `00-overview.md` |
| AT-SPECAUTHORING-014 | Every `00-overview.md` includes numbered file inventory table | `00-overview.md` |
| AT-SPECAUTHORING-015 | Every `00-overview.md` includes Cross-References table | `00-overview.md` |

---

## AT-SPECAUTHORING-G04: Cross-References & Validation

| # | Criterion | Source |
|---|-----------|--------|
| AT-SPECAUTHORING-016 | All cross-references use relative paths (never root-relative or absolute) | `08-cross-references.md` |
| AT-SPECAUTHORING-017 | All linked files include `.md` extension | `08-cross-references.md` |
| AT-SPECAUTHORING-018 | Zero broken links reported by dashboard scanner | `08-cross-references.md` |

---

## Cross-References

- [Overview](./00-overview.md)
- [Required Files](./03-required-files.md)
- [Naming Conventions](./02-naming-conventions.md)
- [Cross-References Guide](./08-cross-references.md)


---

## Fixtures

Fixtures for every AT row in this file are covered by the global P2g sweep — see [`../97a-acceptance-criteria-fixtures.md`](../97a-acceptance-criteria-fixtures.md) (apply the matching pattern by section).

---

## Enforcement Gate

**`G-01-AT-ID-FORMAT-CANONICAL`** (CI, minted 2026-04-29 — see `_GATE-REGISTRY.md` → Spec-Authoring).

- **Regex:** `^AT-[A-Z][A-Z0-9]*(-[A-Z0-9]+)*-[GA-Z]?[0-9]{2,3}$`
- **Scope:** all `spec/**/97-acceptance-criteria.md` and `spec/**/97a-acceptance-criteria-fixtures.md`.
- **Exempt zones (lint MUST strip before regex):** fenced code blocks (```` ``` ````) and inline `code spans` (single backticks). This carve-out exists because guidance docs legitimately quote legacy IDs as illustrative bad-examples.
- **Failure mode:** CI lint emits `<file>:<line>: non-canonical AT-ID '<token>'` and exits non-zero.
- **Enforceable since:** 2026-04-29 (legacy `AC-NNN` sweep closed at 0/2,387 — no exemption list required).

---

## Gate `G-NS-NO-DEPRECATED-ALIAS` (CI, hard-fail)

- **Purpose:** Prevent re-introduction of any of the 17 namespace aliases catalogued in the 2026-04-29 namespace synonym audit. Without this gate, the canonical/alias drift catalogued there will silently regrow as new ATs are authored.
- **SSOT for alias list:** [`.lovable/memory/audit/at-namespace-synonym-audit.md`](../../.lovable/memory/audit/at-namespace-synonym-audit.md) (canonical/alias ledger, §1).
- **Forbidden alias namespaces (17):**
  `AT-DESIGNSYSTEM-`, `AT-UIDS-`, `AT-MIRRORS-`, `AT-WORKFLOW-`,
  `AT-CODINGGUIDELINES-`, `AT-MASTERCODINGGUIDELINES-`, `AT-ERRORMANAGE-`,
  `AT-RESTAPICONVENTIONS-`, `AT-TYPESCRIPT-`, `AT-GOLANG-`, `AT-PHP-`,
  `AT-ENUMSPECIFICATION-`, `AT-OPERATORRUNBOOKS-`, `AT-RATE-`,
  `AT-VISUALRENDER-`, `AT-CONSOLIDATEDREVIEWGUIDE-`,
  *(17th slot reserved for next audit pass)*.
- **Canonical replacements:** see audit ledger §1 (one-to-one mapping).
- **Scope:** `spec/**/97-acceptance-criteria.md` and `spec/**/97a-acceptance-criteria-fixtures.md`.
- **Exempt zones (lint MUST strip before scan):** fenced code blocks (```` ``` ````) and inline `code spans`. Same carve-out logic as `G-01-AT-ID-FORMAT-CANONICAL`.
- **Legacy exemption:** Existing rows that already use a deprecated alias are listed in `spec/_LEDGER-G-NS-LEGACY-EXEMPT.md` (dated allow-list, max 90-day TTL per `scripts/spec-hygiene/34-check-allow-list-age.mjs`). Any AT row NOT on the allow-list MUST use the canonical namespace.
- **Failure mode:** CI lint emits `<file>:<line>: deprecated namespace alias '<alias>-' — use canonical '<canonical>-' (audit ledger §1)` and exits non-zero.
- **Promotion path:** As the P3 namespace consolidation sweep migrates aliased rows to canonical, entries are removed from the allow-list. Gate becomes 100% enforceable (zero exemptions) when the legacy ledger is empty.
- **Distinct-pair guard:** The lint MUST NOT flag the 10 ratified distinct-but-confusable pairs (audit ledger §2: `AT-FIX-`/`AT-FIXTURE-`, `AT-INT-`/`AT-INTERACT-`, `AT-INFO-`/`AT-INFOMODEL-`, `AT-STATE-`/`AT-UISTATE-`, `AT-SR-`/`AT-USR-`, `AT-TR-`/`AT-TRASH-`, `AT-MS-`/`AT-MULTISELECT-`, `AT-WF-` parent vs `AT-WFxx-` children, `AT-CG-` parent vs `AT-CGxx-` children, `AT-WPPLUGIN-`/`AT-WPPLUGINDEPLOY-`). These are explicitly allow-listed.

---

## Gate `G-NS-STATUS-IN-LEGEND` (CI, hard-fail; WARN-only until P3 sweep)

- **Purpose:** Reduce 46-value `**Status:**` drift (audit 2026-04-29) to a closed 9-value enum so status-based filtering, DOC-tier promotion, and `STATUS: DEFERRED` tagging become mechanical.
- **SSOT for enum:** [`20-status-legend.md`](./20-status-legend.md) §1 (9 values: `DRAFT`, `REVIEW`, `CANONICAL`, `COMPANION`, `DISPATCH`, `DEFERRED`, `DEPRECATED`, `REDIRECT`, `ARCHIVED`).
- **Audit ledger:** [`.lovable/memory/audit/at-status-legend-audit.md`](../../.lovable/memory/audit/at-status-legend-audit.md) — full inventory + mapping table.
- **Scope:**
  - File-level `**Status:**` lines in any `spec/**/*.md` front-matter block.
  - Per-row `STATUS: <token>` inline tags inside `97-acceptance-criteria.md` description columns.
- **Regex:** `^\*\*Status:\*\*\s+(DRAFT|REVIEW|CANONICAL|COMPANION|DISPATCH|DEFERRED|DEPRECATED|REDIRECT|ARCHIVED)(\s*\(.*\))?\s*$`
- **Exempt zones (lint MUST strip before scan):** fenced code blocks (```` ``` ````) and inline `code spans` — same carve-out as `G-01-AT-ID-FORMAT-CANONICAL` and `G-NS-NO-DEPRECATED-ALIAS`. This permits the legend SSOT itself to quote legacy values.
- **Optional qualifier:** parenthetical free text after the canonical token is permitted and excluded from gate matching (e.g. `CANONICAL (post-AUDIT-03 backfill)`).
- **WARN-only initial mode:** Gate ships emitting warnings only. Hard-fail flag flips when the P3 status sweep retires the legacy 46 values (target: legacy count 0).
- **Failure mode (hard-fail mode):** CI emits `<file>:<line>: non-canonical status '<value>' — see spec/01-spec-authoring-guide/20-status-legend.md §2 for canonical mapping` and exits non-zero.
- **Promotion path:** WARN → HARD when `rg -c '\*\*Status:\*\*\s*(Curated|Active|Complete|...)' spec/` returns 0.

---

## Gate `G-NS-ADR-MUST-HAS-AT` (CI, hard-fail; WARN-only initial mode)

- **Purpose:** Prevent ADR prose orphaning. As of 2026-04-29, **23 of 29 ADRs (79%)** contain ≥5 `MUST`/`SHALL` rules but are cited by **zero** `97-acceptance-criteria.md` files (285 orphaned MUSTs total). Without this gate, the AUDIT-03 backfill (#1) would have to be manually scoped each pass.
- **Rule:** Every ADR file in `spec/00-adrs/` whose body contains ≥5 occurrences of `\b(MUST|SHALL)\b` (counted outside fenced code blocks and inline backticks) MUST be cited by at least one row in some `spec/**/97-acceptance-criteria.md` file using the canonical citation form `ADR-NNNN` or a path link to the ADR file.
- **Threshold rationale:** 5 MUSTs is the empirical floor below which ADR prose is typically a context note rather than enforceable obligation. ADRs with <5 MUSTs (currently ADR-00, 0001, 0002, 0003, 0006) are exempt from this gate but remain CANONICAL.
- **Audit ledger:** [`.lovable/memory/audit/at-prose-must-shall-sweep.md`](../../.lovable/memory/audit/at-prose-must-shall-sweep.md) — full coverage matrix.
- **Failure mode (hard-fail mode):** CI emits `spec/00-adrs/<adr>.md: ADR has <N> MUST/SHALL rules but zero AT citations — author at least one structured AT row in a 97-acceptance-criteria.md file (see legend §1 for canonical statuses)` and exits non-zero.
- **WARN-only initial mode:** Gate ships with the 23 currently-uncited ADRs allow-listed in `spec/_LEDGER-G-NS-ADR-COVERAGE.md` (TTL 90 days). Each AT row added under the AUDIT-03 backfill removes its target ADR from the allow-list. Hard-fail flag flips when the allow-list is empty.
- **Exempt zones (lint MUST strip before MUST/SHALL counting):** fenced code blocks (```` ``` ````) and inline `code spans` — same carve-out as the other `G-NS-*` gates.
- **Distinct-ADR guard:** A single AT row citing multiple ADRs (e.g. `per ADR-0020 + ADR-0026`) covers each cited ADR independently. Citation count is per-ADR, not per-row.

---

## Gate `G-01-DOD-NO-NN-PLACEHOLDER` (CI, hard-fail)

- **Purpose:** Enforce template rule §5 (`18-ai-contract-template.md`): every Definition-of-Done bullet MUST be testable. Literal `NN` in an AT-id range (`AT-FOO-01 through AT-FOO-NN`) and empty markdown link text (`see this section's  once authored`) are non-testable placeholders that silently bypass the DoD contract.
- **Audit ledger:** [`.lovable/memory/audit/at-dod-range-sweep.md`](../../.lovable/memory/audit/at-dod-range-sweep.md) — 13 normalized files (2026-04-29 sweep).
- **Scope:** any line in `spec/**/00-overview.md` between `**Definition of Done**` and the next `---` / `## ` / `> Authoring`.
- **Forbidden patterns (regex, applied after stripping fenced code blocks and inline backticks):**
  - `AT-[A-Z]+-NN` (literal `NN` token in any AT id)
  - `see this section's\s\s+once authored` (double-space artefact from broken xref template)
  - `_AT rows pending —` (untestable placeholder prose)
- **Canonical replacement form:** `Every \`AT-<SECTION>-*\` row in \`97-acceptance-criteria.md\` passes` (optionally followed by ` (filled in P2 backfill)`); concrete numeric ranges (`AT-CODEBLOCKSYSTEM-01 through -18`) are also permitted when all ids in the range exist.
- **Exempt zones:** non-DoD prose elsewhere in the file (e.g. audit-document table titles like `Content Audit — AT-APP-NN Coverage Completeness`); fenced code blocks; inline `code spans`.
- **Failure mode:** CI emits `<file>:<line>: non-testable DoD placeholder — see G-01-DOD-NO-NN-PLACEHOLDER and 18-ai-contract-template.md §5` and exits non-zero.

---

## Gate `G-01-DOD-CONDENSED-MIRRORS-OVERVIEW` (CI, WARN-only)

- **Purpose:** Enforce template rule §6 (`18-ai-contract-template.md`): the DoD block lives in the overview *only* — sub-files MUST NOT duplicate it. The `00-overview-condensed.md` sibling is an exception (it intentionally mirrors), but its DoD MUST be byte-identical to `00-overview.md`'s DoD or the two files have silently drifted.
- **Scope:** every directory containing both `00-overview.md` and `00-overview-condensed.md` (currently 4: `02-coding-guidelines`, `03-error-manage`, `15-wp-plugin-how-to`, `31-app`, `32-ui-design`).
- **Rule:** the DoD block (between `**Definition of Done**` and the next `---` / `## ` / `> Authoring` line) MUST hash-match across both siblings.
- **Failure mode (WARN):** CI emits `<dir>: DoD drift between 00-overview.md and 00-overview-condensed.md — re-mirror or delete the condensed copy` and continues. Promotion to hard-fail deferred until next overview-condensation pass.

---

## Gate `G-09-OVERVIEW-H1-MATCHES-FOLDER-INDEX` (CI, hard-fail mandatory — Phase 3 active 2026-04-29)

- **Purpose:** Catch silent drift between an overview file's `# H1` numeric prefix and its parent folder's two-digit prefix. Closes the regression-class behind audit issue #6 in `spec/09-code-block-system/00-overview.md` (H1 carried `08` while folder was `09` — surfaced 2026-04-29).
- **Mandatory rule (Phase 3, active):** For every `spec/[0-9][0-9]-*/00-overview.md`, the H1 line MUST match `^# (\d{2,3})\b — ` and the captured prefix MUST equal the folder's leading two-digit (or three-digit) numeric prefix. Both presence and value are enforced.
- **Scope:** the first `^# ` line in any `spec/[0-9][0-9]*/00-overview.md`. Sub-overview files (`spec/**/<deeper>/00-overview.md`) are also in scope, matched against their immediate parent folder prefix.
- **Phase history:**
  1. **Phase 1 (2026-04-29 morning):** Conditional WARN. Caught mismatches; permitted absence. Baseline: 1 of 25 overviews compliant.
  2. **Phase 2 (2026-04-29 afternoon):** H1-prefix sweep authored explicit `# NN — Title` prefix in all 24 remaining top-level overviews. Audit ledger: [`.lovable/memory/audit/at-h1-prefix-sweep.md`](../../.lovable/memory/audit/at-h1-prefix-sweep.md). Baseline: 25 of 25 compliant.
  3. **Phase 3 (active):** Hard-fail mandatory — both H1 presence and prefix-match enforced.
- **Exempt zones:** fenced code blocks (no H1 inside fences anyway); the `spec/00-adrs/` per-ADR files (which intentionally use `# ADR-NNNN — Title` form) — only that folder's own `00-overview.md` is in scope (now `# 00 — Architecture Decision Records (ADRs)`).
- **Canonical form:** `# NN — <Title>` (en-dash separator, two-digit prefix; three-digit allowed if folder uses three).
- **Failure modes (hard-fail, both non-zero exit):**
  - `<file>:1: H1 prefix '<h1prefix>' does not match folder prefix '<folder>' — see G-09-OVERVIEW-H1-MATCHES-FOLDER-INDEX`
  - `<file>:1: H1 missing required folder-prefix '<folder>' — expected '# <folder> — <Title>'`

---

## Gate `G-00-OVERVIEW-SCORING-TABLE-PRESENT` (CI, hard-fail)

- **Purpose:** Every top-level `spec/[0-9][0-9]-*/00-overview.md` MUST carry a Scoring section so AI implementability, AI Confidence, Ambiguity, and Health Score are explicitly tracked at the section root. Without this gate, sections silently lose their scoring table during refactors and the per-section quality signal vanishes.
- **Rule:** the file MUST contain at least one of:
  - a heading line matching `^(##|###)\s+Scoring\b`
  - a bold-prefix line matching `^\*\*Scoring\*\*`
  - the canonical Scoring-criterion table header `^\| Criterion \|` (used in audit-style overviews)
- **Scope:** all 25 top-level `spec/[0-9][0-9]-*/00-overview.md`. Sub-overview files are out of scope (Scoring lives at the section root only).
- **Baseline (2026-04-29):** 25 of 25 already compliant — gate ships hard-fail from day 1 with zero violations.
- **Exempt zones:** fenced code blocks (Scoring inside a code fence does not count as compliance — must be a real section in document body).
- **Failure mode:** CI emits `<file>: missing Scoring section — every overview MUST carry one of: '## Scoring', '### Scoring', '**Scoring**', or a '| Criterion |' table header. See G-00-OVERVIEW-SCORING-TABLE-PRESENT.` and exits non-zero.
- **Future companion:** a `G-00-OVERVIEW-SCORING-TABLE-COMPLETE` gate could later enforce specific row presence (e.g. `AI Confidence`, `Ambiguity`, `Health Score`) — deferred until canonical scoring schema is ratified.
