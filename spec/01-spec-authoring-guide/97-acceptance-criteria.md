# Spec Authoring Guide — Acceptance Criteria

> **Version:** 3.2.0  
> **Updated:** 2026-04-29 — renamed 4 section headers `AC-01..04` → `AT-SPECAUTHORING-G01..G04` and 18 row IDs `AC-001..018` → `AT-SPECAUTHORING-001..018` (audit task #20, P3 hot-spot closed). Cascading refs in `00-overview.md` updated; template-example IDs in `03-required-files.md` and `04-cli-module-template.md` migrated to `AT-EXAMPLE-NNN`. **22 active legacy IDs migrated; new `AT-SPECAUTHORING-` namespace registered.**

---

## Overview

19 testable criteria across 4 areas covering spec structure, naming, content, and tooling.

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
| AT-SPECAUTHORING-019 | Every top-level `00-overview.md` includes an `## AI Contract` section | `18-ai-contract-template.md` |

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

---

## Gate `G-00-OVERVIEW-AI-CONTRACT-PRESENT` (CI, hard-fail; WARN-only at sub-overview tier)

- **Purpose:** Every top-level `spec/[0-9][0-9]-*/00-overview.md` MUST carry an `## AI Contract` section so the section's machine-readable input/output/invariants contract is explicit and discoverable. Without this gate, refactors silently lose the AI Contract block and AI implementability regresses (the contract becomes implicit, ungated). Pairs with `G-00-OVERVIEW-SCORING-TABLE-PRESENT` (scoring) and `G-09-OVERVIEW-H1-MATCHES-FOLDER-INDEX` (H1) as the third pillar of the **overview-root contract** trio.
- **Rule:** the file MUST contain at least one heading line matching `^(##|###)\s+AI Contract\b`. The bare phrase elsewhere in body prose does NOT count — must be a real section heading.
- **Scope (hard-fail tier):** all 25 top-level `spec/[0-9][0-9]-*/00-overview.md`.
- **Scope (WARN-only tier):** sub-overview files (`spec/**/<deeper>/00-overview.md`, 125 files). Many sub-sections legitimately defer their AI Contract to the parent overview; gate emits a warning only at this tier so the signal surfaces without blocking. Promotion to hard-fail deferred until a sub-overview AI-Contract sweep is scoped.
- **Baseline (2026-04-29):** 25 of 25 top-level already compliant — gate ships hard-fail from day 1 with zero violations. Sub-overview baseline: ~2/125 (warn tier only).
- **Exempt zones:** fenced code blocks (an `## AI Contract` heading inside a code fence does not count as compliance — must be a real section in document body); `spec/00-adrs/` per-ADR files (the per-ADR files use ADR-specific structure; only that folder's own `00-overview.md` is in scope).
- **SSOT for contract template:** [`./18-ai-contract-template.md`](./18-ai-contract-template.md).
- **Failure mode (hard-fail tier):** CI emits `<file>: missing AI Contract section — every top-level overview MUST carry an '## AI Contract' (or '### AI Contract') heading. See G-00-OVERVIEW-AI-CONTRACT-PRESENT and 18-ai-contract-template.md.` and exits non-zero.
- **Failure mode (warn tier):** CI emits `<file>: sub-overview missing AI Contract section (WARN-only) — see G-00-OVERVIEW-AI-CONTRACT-PRESENT.` and continues.
- **Future companion:** a `G-00-OVERVIEW-AI-CONTRACT-COMPLETE` gate could later enforce specific sub-headings (`Inputs`, `Outputs`, `Invariants`, `Failure modes`) — deferred until canonical contract schema is ratified.

---

## Gate `G-13-AUDIT-RUNNER-CONTRACT` (CI, hard-fail)

- **Purpose:** The spec-hygiene runner (`scripts/spec-hygiene/00-run-all.mjs`) is the **single CI entry point** for every named spec gate. Without an enforced contract, individual checks can be silently dropped from the runner array, regress to non-zero exits being swallowed, or be added under the wrong tier — and the gate registry's "CI" tier label becomes a lie. This gate locks the runner's invariants so the registry's tier classification is trustworthy.
- **AT row:** `AT-SPECAUTHORING-020` — Audit-runner contract. Every `**CI**`-tier gate in `spec/_GATE-REGISTRY.md` MUST be backed by a concrete checker script wired into `scripts/spec-hygiene/00-run-all.mjs`'s `checks` array, and the runner MUST aggregate non-zero exits via `process.exit(1)`.
- **Rules (all hard-fail):**
  1. **Single entry point** — `scripts/spec-hygiene/00-run-all.mjs` MUST exist, be executable as `node scripts/spec-hygiene/00-run-all.mjs`, and own a top-level `checks` array of string entries.
  2. **Aggregated exit** — runner MUST end with `if (failed > 0) { ...; process.exit(1); }` so a single check failure fails the whole runner. Bare `process.exit(0)` after the loop is forbidden.
  3. **No silent skips** — runner MUST NOT contain `try`/`catch` around the per-script `spawnSync` that swallows non-zero exits without incrementing `failed`. `continue` on error without counting is forbidden.
  4. **Script existence** — every entry in `checks` (token before first whitespace) MUST resolve to an existing file on disk. Stale entries pointing at deleted scripts MUST fail.
  5. **CI workflow binding** — `.github/workflows/spec-hygiene.yml` MUST invoke `node scripts/spec-hygiene/00-run-all.mjs` (not individual checks). Per-script invocation in CI is forbidden — single entry point only.
  6. **Numeric prefix discipline** — every checker filename in `scripts/spec-hygiene/` matching `^\d{2}-` is a candidate; only `00-run-all.mjs` and helper scripts (whitelist: `04-generate-index.mjs`, `10-fix-related-blocks.mjs`, `11-generate-auto-toc.mjs`, `13-generate-at-stubs.mjs`, `14-split-oversized-files.mjs`, `40-generate-contract-json.mjs`, `41-generate-skeletons.mjs`, `43-generate-condensed-overviews.mjs`, `44-fix-feature-block-format.mjs`, `45-append-p13-orphan-stubs.mjs`, `49-fixture-stub-generator.mjs`, `50-append-fixtures-to-condensed.mjs`, `51-thicken-f-overviews.mjs`, `99-convert-headers.mjs`, `35-allow-list-inventory.mjs`) are exempt. Every other `\d{2}-check-*.mjs` MUST appear in the `checks` array.
- **Scope:** runner file (`scripts/spec-hygiene/00-run-all.mjs`), CI workflow (`.github/workflows/spec-hygiene.yml`), and the gate registry's `**CI**`-tier rows.
- **Baseline (2026-04-29):** runner exists, aggregates exits via `process.exit(1)` (line 55), and wires 32 checker scripts. CI workflow invokes the runner. **Clean baseline — gate ships hard-fail from day 1.**
- **Failure modes:**
  - `scripts/spec-hygiene/00-run-all.mjs: missing or unreadable — see G-13-AUDIT-RUNNER-CONTRACT rule 1`
  - `scripts/spec-hygiene/00-run-all.mjs: aggregated exit missing — runner MUST call process.exit(1) on failure. Rule 2.`
  - `scripts/spec-hygiene/00-run-all.mjs: silent skip detected (try/catch around spawnSync without failed++) — Rule 3.`
  - `scripts/spec-hygiene/00-run-all.mjs: stale entry '<path>' — file does not exist. Rule 4.`
  - `.github/workflows/spec-hygiene.yml: missing 'node scripts/spec-hygiene/00-run-all.mjs' invocation — Rule 5.`
  - `scripts/spec-hygiene/<NN>-check-<name>.mjs: orphan checker — exists on disk but missing from 00-run-all.mjs checks array. Rule 6.`
- **SSOT:** `.lovable/memory/audit/at-audit-runner-contract.md`.
- **Future companion:** `G-13-AUDIT-RUNNER-PARITY` (deferred) would assert the runner's `checks` array length matches the count of `**CI**`-tier rows in `_GATE-REGISTRY.md` (currently 33 CI tier vs 32 runner entries — 1-row delta is the **G-13-AUDIT-RUNNER-CONTRACT** meta-gate itself, which is enforced by file-existence rather than a dedicated checker).

---

## Gate `G-00-OVERVIEW-AI-CONTRACT-COMPLETE` (CI, hard-fail)

- **Purpose:** `G-00-OVERVIEW-AI-CONTRACT-PRESENT` (the trio's third pillar) only enforces that the `## AI Contract` heading exists. It does NOT enforce that the contract's **body** is well-formed. Without this gate, an overview can satisfy `…-PRESENT` with an empty `## AI Contract` heading followed immediately by the next H2 — gaming the gate without delivering an actual contract. This gate locks the canonical 5-subsection schema from [`./18-ai-contract-template.md`](./18-ai-contract-template.md) so the contract is **structurally complete**, not just nominally present.
- **AT row:** `AT-SPECAUTHORING-021` — Every top-level overview's `## AI Contract` block MUST contain all five mandatory bold-prefix subsections in canonical order: **Purpose**, **Audience**, **Expected AI Output**, **Out of Scope**, **Definition of Done**.
- **Rules (all hard-fail):**
  1. **All five subsections present** — between the `## AI Contract` line and the next `^## ` heading (or EOF), the block MUST contain each of these bold-prefix lines (regex per line, anchored at line start):
     - `^\*\*Purpose\*\*`
     - `^\*\*Audience\*\*`
     - `^\*\*Expected AI Output\*\*`
     - `^\*\*Out of Scope\*\*`
     - `^\*\*Definition of Done\*\*`
  2. **Canonical order** — the five subsections MUST appear in the order listed above. Re-ordering is forbidden (out-of-order is treated as a missing subsection by stricter linters; this gate enforces order explicitly so a future contract-extraction script can rely on positional parsing).
  3. **Non-empty bodies** — each subsection MUST be followed by at least one non-blank, non-heading line before the next `^\*\*` line or `^## ` heading. Empty subsections (`**Purpose** —` immediately followed by blank then `**Audience**`) are forbidden.
  4. **Out of Scope items link out** — every bullet under `**Out of Scope**` (`^- ` or `^* `) MUST contain at least one markdown link `\[.+?\]\(.+?\)`. Bare-text scope items are forbidden (Authoring rule §4 in `18-ai-contract-template.md`).
  5. **Definition of Done bullets are testable** — every bullet under `**Definition of Done**` MUST cite at least one of: an `AT-[A-Z0-9]+-\d+` ID, a `G-[A-Z0-9-]+` gate ID, a script path matching `scripts/[^\s)]+\.mjs`, or a node-runner invocation (`node scripts/spec-hygiene/00-run-all\.mjs`). Prose bullets like "looks good" or "all tests pass" without a concrete pointer are forbidden (Authoring rule §5).
- **Scope:** all 25 top-level `spec/[0-9][0-9]-*/00-overview.md`. Sub-overview tier is out of scope (sub-overviews inherit the contract from their parent per Authoring rule §6 in `18-ai-contract-template.md` — they MUST NOT duplicate it, so completeness checking on sub-overviews is a category error).
- **Baseline (2026-04-29):** 25 of 25 top-level overviews already carry all five subsections in canonical order — verified by line-counted regex sweep. Rules 3, 4, 5 not yet baselined; gate ships rule 1 + rule 2 hard-fail from day 1, rules 3–5 WARN-only until first content-quality sweep is scoped.
- **Exempt zones:** fenced code blocks (a `**Purpose**` line inside a code fence does not count as compliance — must appear in document body); `spec/01-spec-authoring-guide/18-ai-contract-template.md` itself (the template uses these tokens inside example blocks; gate scope is overviews only).
- **Failure modes:**
  - `<file>: AI Contract block missing subsection '<name>' — see G-00-OVERVIEW-AI-CONTRACT-COMPLETE rule 1 and 18-ai-contract-template.md §"Required block".`
  - `<file>: AI Contract subsections out of order — expected [Purpose, Audience, Expected AI Output, Out of Scope, Definition of Done], found <actual>. Rule 2.`
  - `<file>: AI Contract subsection '<name>' is empty — Rule 3 (WARN).`
  - `<file>: Out of Scope bullet '<text>' missing link — Rule 4 (WARN).`
  - `<file>: Definition of Done bullet '<text>' has no AT/gate/script citation — Rule 5 (WARN).`
- **SSOT:** [`./18-ai-contract-template.md`](./18-ai-contract-template.md) §"Required block" + §"Authoring rules". Audit ledger: `.lovable/memory/audit/at-overview-ai-contract-complete-gate.md`.
- **Trio status:** This gate completes the **overview-root contract trio's content-completeness layer**:
  - Layer 1 (presence): `G-09-OVERVIEW-H1-MATCHES-FOLDER-INDEX` (H1), `G-00-OVERVIEW-SCORING-TABLE-PRESENT` (Scoring), `G-00-OVERVIEW-AI-CONTRACT-PRESENT` (AI Contract heading).
  - Layer 2 (completeness): **this gate** (AI Contract body schema). A future `G-00-OVERVIEW-SCORING-TABLE-COMPLETE` would mirror this for Scoring rows.
