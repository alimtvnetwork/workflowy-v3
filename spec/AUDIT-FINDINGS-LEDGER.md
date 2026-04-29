# Audit Findings Ledger

> **Version:** 1.0.0
> **Created:** 2026-04-29 (UTC+8)
> **Status:** Authoritative SSOT for every `F-AUDIT-NN` and `F-AUDxx-NN` finding produced by any spec-implementability or per-folder audit.
> **Closes:** F-AUDIT-30 (MED, "Poor Discoverability of Resolution Evidence")
> **Hygiene gate:** [`scripts/spec-hygiene/74-check-audit-findings-ledger.mjs`](../scripts/spec-hygiene/74-check-audit-findings-ledger.mjs)
> **Parent:** [`spec/health-dashboard.md`](./health-dashboard.md)

---

## Why this ledger exists

The v7 Gemini-2.5-Pro audit (2026-04-29) raised **F-AUDIT-30** after observing
that `F-AUDIT-26` had been carried as "open" across **two consecutive audit
cycles** despite being resolved in v4 by `_GATE-GRADUATION-LEDGER` v1.1.0 +
ADR-0031. Root cause: no single, machine-checkable place mapped a finding ID
to its resolution evidence, so each new audit had to re-discover prior work.

This ledger is that single place. **Every** finding produced by **any** audit
artifact under `/mnt/documents/spec*audit*` MUST appear in the table below
within the same response that mentions it. The hygiene gate fails CI if a
finding is referenced in `spec/` but absent from this table, or if a row is
marked `Resolved` without a verifiable evidence link.

---

## Status vocabulary (closed enum)

| Status | Meaning |
|---|---|
| `Open` | Finding is real, ratified, and not yet resolved. Evidence link MAY be `—`. |
| `Resolved` | Fix landed; evidence link MUST point to the closing artifact (ADR, ledger, file:line, or hygiene script). |
| `Stale` | Was carried as Open in a prior audit but had already been resolved earlier. Evidence link MUST point to the prior resolution artifact. Used to prevent re-discovery loops. |
| `Retracted` | Finding was a false positive or based on misread spec. Evidence link MUST point to the corrective explanation. |

Out-of-vocabulary statuses (`Pending`, `WIP`, `Wontfix`, `Deferred`, …) are
**forbidden** and will fail the gate.

---

## Findings — `F-AUDIT-NN` family (cross-cycle implementability audits)

| ID | Severity | First raised | Status | Resolved by | Evidence |
|---|---|---|---|---|---|
| F-AUDIT-02 | LOW | v3 | Resolved | Exemption granted | [`spec/_AUDIT-EXEMPTIONS.md`](./_AUDIT-EXEMPTIONS.md) |
| F-AUDIT-15 | MED | v4 | Retracted | False-positive cascade ratified by v6→v7 | [`spec/00-adrs/97-acceptance-criteria.md#F-AUDIT-15`](./00-adrs/97-acceptance-criteria.md) |
| F-AUDIT-21 | HIGH | v5 | Resolved | AT-ADR-G07..G14 (7 ADRs) | [`spec/00-adrs/97-acceptance-criteria.md#F-AUDIT-21`](./00-adrs/97-acceptance-criteria.md) |
| F-AUDIT-24 | LOW | v5 | Resolved | Exemption granted | [`spec/_AUDIT-EXEMPTIONS.md`](./_AUDIT-EXEMPTIONS.md) |
| F-AUDIT-25 | MED | v6 | Resolved | `scripts/spec-hygiene/44-fix-feature-block-format.mjs` parser fix | [`spec/00-adrs/97-acceptance-criteria.md#F-AUDIT-25`](./00-adrs/97-acceptance-criteria.md) |
| F-AUDIT-26 | MED | v5 | **Stale** | Resolved in v4 by `_GATE-GRADUATION-LEDGER` v1.1.0 + ADR-0031 (audit failed to detect) | [`spec/00-adrs/0031-warn-only-strict-flip-pattern.md`](./00-adrs/0031-warn-only-strict-flip-pattern.md), [`spec/_GATE-GRADUATION-LEDGER.md`](./_GATE-GRADUATION-LEDGER.md) |
| F-AUDIT-27 | MED | v6 | Resolved | Ratified closed by v7 | [`spec/00-adrs/97-acceptance-criteria.md#F-AUDIT-27`](./00-adrs/97-acceptance-criteria.md) |
| F-AUDIT-28 | MED | v6 | Resolved | `spec/00-scoping.md` SSOT (36 Active / 3 Archived / 5 Legacy) | [`spec/00-scoping.md`](./00-scoping.md) |
| F-AUDIT-29 | LOW | v6 | Resolved | 5 corpus-wide false-positives only; ratified by v7 | [`spec/00-adrs/97-acceptance-criteria.md#F-AUDIT-29`](./00-adrs/97-acceptance-criteria.md) |
| F-AUDIT-30 | MED | v7 | Resolved | This ledger + hygiene gate #74 | [`spec/AUDIT-FINDINGS-LEDGER.md`](./AUDIT-FINDINGS-LEDGER.md), [`scripts/spec-hygiene/74-check-audit-findings-ledger.mjs`](../scripts/spec-hygiene/74-check-audit-findings-ledger.mjs) |
| F-AUDIT-31 | MED | v6 | Resolved | ADR-0030 audit-exemption manifest | [`spec/00-adrs/0030-audit-exemption-manifest.md`](./00-adrs/0030-audit-exemption-manifest.md) |
| F-AUDIT-32 | LOW | v6 | Resolved | `_GATE-REGISTRY` row + `AT-FIX-COMPANION-SHAPE` baseline | [`spec/_GATE-REGISTRY.md`](./_GATE-REGISTRY.md), [`spec/_LEDGER-G-00-AT-FIX-COMPANION-SHAPE-BASELINE.md`](./_LEDGER-G-00-AT-FIX-COMPANION-SHAPE-BASELINE.md) |

**Open count:** 0 — **Resolved:** 10 — **Stale:** 1 — **Retracted:** 1

---

## Findings — `F-AUDxx-NN` family (per-folder content audits)

| ID | Severity | Source audit | Status | Evidence |
|---|---|---|---|---|
| F-AUD27-01 | MED | spec/18-spec-issues/06-app-folder-audit-2026-04-26.md | Resolved | [`spec/18-spec-issues/09-app-folder-re-audit-2026-04-26.md`](./18-spec-issues/09-app-folder-re-audit-2026-04-26.md) |
| F-AUD27-02 | LOW | spec/18-spec-issues/06-app-folder-audit-2026-04-26.md | Resolved | [`spec/18-spec-issues/09-app-folder-re-audit-2026-04-26.md`](./18-spec-issues/09-app-folder-re-audit-2026-04-26.md) |
| F-AUD27-03 | LOW | spec/18-spec-issues/06-app-folder-audit-2026-04-26.md | Resolved | [`spec/18-spec-issues/09-app-folder-re-audit-2026-04-26.md`](./18-spec-issues/09-app-folder-re-audit-2026-04-26.md) |
| F-AUD30-01 | MED | spec/18-spec-issues/10-content-audit-endpoints-and-db-diagram.md | Resolved | SSE event vocabulary fix in same pass — see [`spec/18-spec-issues/10-content-audit-endpoints-and-db-diagram.md`](./18-spec-issues/10-content-audit-endpoints-and-db-diagram.md) |
| F-AUD30-02 | LOW | spec/18-spec-issues/10-content-audit-endpoints-and-db-diagram.md | Resolved | [`spec/18-spec-issues/10-content-audit-endpoints-and-db-diagram.md`](./18-spec-issues/10-content-audit-endpoints-and-db-diagram.md) |
| F-AUD30-03 | LOW | spec/18-spec-issues/10-content-audit-endpoints-and-db-diagram.md | Resolved | [`spec/18-spec-issues/10-content-audit-endpoints-and-db-diagram.md`](./18-spec-issues/10-content-audit-endpoints-and-db-diagram.md) |
| F-AUD30-07 | MED | spec/18-spec-issues/11-content-audit-at-app-coverage.md | Resolved | Canonical 9-name SSE event set restored — see [`spec/18-spec-issues/11-content-audit-at-app-coverage.md`](./18-spec-issues/11-content-audit-at-app-coverage.md) |
| F-AUD30-09 | LOW | spec/18-spec-issues/11-content-audit-at-app-coverage.md | Resolved | [`spec/18-spec-issues/11-content-audit-at-app-coverage.md`](./18-spec-issues/11-content-audit-at-app-coverage.md) |

**Open count:** 0 — **Resolved:** 8

---

## Findings — `F-SCOPE-NN` family (scope/estimate corrections)

Surfaces inflated or outdated effort estimates that distort task prioritization.
Resolution = corrected baseline + evidence trail.

| ID | Severity | First raised | Status | Resolved by | Evidence |
|---|---|---|---|---|---|
| F-SCOPE-01 | LOW | 2026-04-29 (task #6 first attempt) | Resolved | Re-baselined "prose→AT migration" scope from inflated 2,170 to actual 682 non-ADR prose-MUSTs (3.2× over-estimate). ADR clauses (352) excluded as legitimately load-bearing prose. See [Retraction case study #2](#retraction-case-study-2--f-scope-01) | This row + case study below |
| F-SCOPE-02 | LOW | 2026-04-29 (task #6-batch-1) | Resolved | Re-baselined again with AT-block-aware methodology: 682 → **724** when MUSTs inside `### \`AT-…\`` heading blocks are correctly excluded (line-scoped regex undercounted because AT identifiers sit in headings, not the assertion line). First selected migration file (`spec/31-app/97d-acceptance-criteria-fixtures.md`, 29 lines) re-classifies to **0 real prose-MUSTs** — all 29 are canonical "Negative assertion" slots inside AT rows. Authoritative scope: **724 prose-MUSTs across 287 files**, top hit `spec/31-app/06-endpoints/97b-endpoint-envelope-fixtures.md` (14). Methodology codified in `/tmp/count-prose-musts.mjs`; see [Retraction case study #3](#retraction-case-study-3--f-scope-02) | This row + case study below |
| F-SCOPE-03 | MED | 2026-04-29 (task #6-batch-1b) | Resolved | F-SCOPE-02 methodology had a nested-heading bug: walked up to *first* enclosing heading only. When AT-WIRE-EGRESS-01 (line 284, `### `) had sibling sub-sections (`### Setup contract`, `### Assertion contract`, …) hosting its assertions, those siblings shadowed the AT heading and produced 14 false-positive prose-MUSTs in 97b. Resolution: (a) demoted 7 sibling `###` to `####` in 97b so they nest correctly under AT-WIRE-EGRESS-01 (zero content change, pure structural fix); (b) authored v2 counter `/tmp/count-prose-musts-v2.mjs` that walks the *full* heading-stack and returns true if any ancestor cites `AT-…-`. Corpus re-baseline: 724 → **697** (Δ –27 false positives eliminated). 3 independent methodologies now bracket the true count at **697 ± ~30**. See [Retraction case study #4](#retraction-case-study-4--f-scope-03) | This row + case study below |
| F-SCOPE-04 | LOW | 2026-04-29 (task NEW-5) | Resolved | F-SCOPE-02 lesson #1 ("Counting scripts MUST be checked-in artifacts, not inline shell one-liners") closed: promoted v2 counter from `/tmp/count-prose-musts-v2.mjs` (volatile) to `scripts/spec-hygiene/audits/count-prose-musts.mjs` (versioned) with companion `audits/README.md` documenting algorithm, output baseline (697/285), and methodology history (F-SCOPE-01 → -02 → -03 → -04). Audits directory is intentionally **not** wired into `00-run-all.mjs` — these are reporting scripts, not gates. Verified output reproduces 697 figure on first run from new path. | `scripts/spec-hygiene/audits/count-prose-musts.mjs`, `scripts/spec-hygiene/audits/README.md` |
| F-SCOPE-05 | MED | 2026-04-29 (task #6-batch-1c) | Resolved | v2 counter had **two** false-positive patterns missed by F-SCOPE-03's heading-stack fix: (a) canonical fixture-table slot rows (`\| **Negative assertion** \|`, `\| **Then** \|`, `\| **Side effects** \|`, `\| **Given** \|`, `\| **When** \|`, `\| **Linter command** \|`, `\| **Response envelope** \|`, `\| **Expected …** \|`) — these ARE the AT-shaped form per `19-acceptance-criteria-io-table.md` SSOT, but lack `### AT-…` headings when used as cross-referenced *patterns* (e.g. `spec/97a-acceptance-criteria-fixtures.md` Pattern 1..10 catalogue); (b) blockquoted lines (`> …`) that quote OTHER docs' MUSTs as citations, not new normative statements. **Discovered while attempting #6-batch-1c** on `spec/97a-acceptance-criteria-fixtures.md` (then-#1 hit @ 11 prose-MUSTs) — manual inspection revealed all 11 were false positives in these two categories. Authored v3 counter (`scripts/spec-hygiene/audits/count-prose-musts.mjs` lines 25–48) with `FIXTURE_SLOT_RE` + blockquote skip. **Corpus re-baseline: 697 → 623** (Δ –74 false positives eliminated; –22 files dropped to 0). 4 independent methodologies now bracket the true count at **623 ± ~50** (cluster: 623, 682, 697, 724; σ ≈ 38). Target file `spec/97a-acceptance-criteria-fixtures.md` correctly drops to 0 (verified). See [Retraction case study #5](#retraction-case-study-5--f-scope-05) | `scripts/spec-hygiene/audits/count-prose-musts.mjs` v3, `scripts/spec-hygiene/audits/README.md`, this row + case study below |
| F-SCOPE-06 | MED | 2026-04-29 (task #6-batch-2) | Resolved | v3 counter regex `G-[0-9N][0-9NS]?-` required a trailing `-` after the gate digits, so bare-form citations (`G-40`, `G-22`, `G-32`, `G-N1`) were NOT skipped. Real-world gate ids use varied terminators: `)`, `,`, `.`, ` `, end-of-line. Corpus contains **2,037 bare-form** vs **1,149 dashed-form** gate citations — bare form is the dominant idiom. **Discovered while attempting #6-batch-2** on `spec/03-error-manage/00-overview.md` (then-#1 hit @ 11 prose-MUSTs): lines 13 (`Vitest/PHPUnit suite names MUST start with the AT id (enforced by hygiene gate G-40)`) and 92 (`New codes MUST be added in the **same PR** … Gate G-22`) were already gate-bound but counter missed them. Authored v4 regex `\bG-[0-9N][0-9NS-]*\b` (word-boundary terminator, dash optional). **Corpus re-baseline: 623 → 594** (Δ –29 false positives, –4 files dropped to 0). Target file dropped 11 → 9 (remaining 9 are genuine substantive prose-MUSTs in §Error Taxonomy/§Anti-Patterns/§Core Principles requiring real AT migration in next batch). 5 independent methodologies now bracket the true count at **594 ± ~50** (cluster: 594, 623, 682, 697, 724; σ ≈ 47). See [Retraction case study #6](#retraction-case-study-6--f-scope-06) | `scripts/spec-hygiene/audits/count-prose-musts.mjs` v4, `scripts/spec-hygiene/audits/README.md`, this row + case study below |
| F-SCOPE-07 | LOW | 2026-04-29 (task #6-batch-4) | Resolved | v4 counter flagged 10 lines in `spec/03-error-manage/02-error-architecture/07-logging-and-diagnostics/01-react-execution-logger.md` that were RFC-2119 priority cells in a requirements matrix (`\| F1 \| Track function executions with arguments \| MUST \|` etc.). These are tag-style priority markers in standard requirements-engineering tabular convention, NOT prose normative claims. v5 (`scripts/spec-hygiene/audits/count-prose-musts.mjs` line 53) adds skip pattern `^\|\s*[A-Z]+[0-9]+\s*\|.*\|\s*(MUST\|SHALL\|SHOULD\|MAY)\s*\|`. Corpus has 23 such rows total (narrow but real). **Corpus re-baseline: 585 → 565** (Δ –20, –2 files dropped to 0; banked 9 more via real content migration in same turn → 556). 6 methodologies now bracket: cluster `[556, 565, 585, 623, 682, 697, 724]` σ ≈ 64, CoV ≈ 10% (still under 20% broken-methodology threshold but trending up; suggests we may be discovering legitimate skip patterns rather than approaching true count). | `scripts/spec-hygiene/audits/count-prose-musts.mjs` v5, `scripts/spec-hygiene/audits/README.md`, this row |
| F-SCOPE-08 | LOW | 2026-04-29 (task #6-batch-5) | Resolved | v5 counter regex `\bG-[0-9N][0-9NS-]*\b` rejected gate ids with **alphabetic domain prefixes** (e.g. `G-A4-STREAM-SEPARATION`, `G-ERR-02`, `G-UPD-01`, `G-SPLIT-03`). The character class `[0-9N]` accepted only the bare-numeric or N-prefixed forms. Discovered while binding 9 new `G-A4-*` gates on `spec/31-app/05-conventions/09-audit-log-policy.md`: after editing the file to cite the new gates, the counter still reported 9 prose-MUSTs because the alphabetic gate ids were not recognized. v6 broadens the regex to `\bG-[A-Z0-9][A-Z0-9-]*\b` (full ASCII alphanumeric domain prefix). **Corpus re-baseline: 556 → 547** (Δ –9 in target file; net delta is mixed because v6 also picked up alphabetic-gate citations across other files that were previously over-counted). 7 methodologies now bracket: cluster `[547, 556, 565, 585, 623, 682, 697, 724]` σ ≈ 67, CoV ≈ 11% (trending stable). Streak-watch: this turn combined parser-fix (qualifies under exception by eliminating real false-positive content findings) with **9 substantive prose-MUST migrations** (real content work, 9 new gates registered) — streak counter resets. | `scripts/spec-hygiene/audits/count-prose-musts.mjs` v6, `spec/_GATE-REGISTRY.md` v1.7.2, `spec/31-app/05-conventions/09-audit-log-policy.md`, this row |
| F-SCOPE-09 | LOW | 2026-04-29 (task #6-batch-6) | Resolved | Pure content migration (no parser change): 8 prose-MUSTs in `spec/00-scoping.md` (§Classification Vocabulary lines 17/21/22/23 + §Reclassification Procedure lines 95/98/99 + §Hygiene Gate line 106) bound to 9 new/promoted `G-NS-SCOPING-*` gates registered under new **Domain-SCOPING** registry subsection. Three of the gates (`G-NS-SCOPING-INVENTORY-COMPLETE`, `-STATUS-VALID`, `-LEGACY-NO-CITATIONS`) were already named-but-unregistered in the source file's §Hygiene Gate (per ADR-0031 reservation pattern); batch-6 promotes them to formal registry rows with DOC-NORM tier. Six new gates added (`-STATUS-REQUIRED`, `-AI-ACTIVE-CONSUME`, `-AI-ARCHIVED-NOEMIT`, `-AI-LEGACY-NOCONSUME`, `-NO-SILENT-RECLASS`, `-RECLASS-ADR-COUPLING`). Bindings cross-reference the existing `AT-NS-SCOPING-*` ATs in `spec/00-adrs/97-acceptance-criteria.md` (4 ATs covering same prose). **Corpus re-baseline: 547 → 539** (Δ –8 = exact match to flagged-line count; no parser drift). Pattern note: this is the cleanest batch yet — every prose-MUST had a pre-existing AT or named-but-unregistered gate; the work was promoting the named gates to registry rows + 1-line citation bindings. **Streak-watch: pure content turn — no parser change — streak counter remains reset.** | `spec/_GATE-REGISTRY.md` v1.7.3, `spec/00-scoping.md`, this row |
| F-SCOPE-10 | LOW | 2026-04-29 (task #6-batch-7) | Resolved | Pure content migration (no parser change): 8 prose-MUSTs in `spec/01-spec-authoring-guide/21-feature-block-format.md` (§R1 lines 21/27/28/29 + §R2 lines 33/40 + §R3 line 44 + §R4 line 54) bound to 4 new sub-rule gates `G-39-R1-ROW-SHAPE`, `G-39-R2-SHORTCUT-PLACEMENT`, `G-39-R3-SLASH-INLINE`, `G-39-R4-SEARCH-OPERATORS` plus the umbrella `G-39` (5 new CI gates total). All 5 registered under new **Spec-Authoring · F8 Feature-Block Format** subsection. The umbrella `G-39` was already cited inline in the source file's front matter and R3/R4 prose (`forbidden (G-39 rule R3)`) and bound by 4 ATs (`AT-F8-01..04`); batch-7 promotes both umbrella + sub-rules to formal registry rows so the parser regex `\bG-[A-Z0-9][A-Z0-9-]*\b` recognises the citation form. Implementation gate `scripts/spec-hygiene/39-check-feature-block-format.mjs` already exists per the source file's front matter — gates ship as `CI` tier from day one (rare for migration work; usually `DOC-NORM`). **Corpus re-baseline: 539 → 531** (Δ –8 = exact match; no parser drift, second consecutive). Pattern note: the "named-but-unregistered gate + existing implementation script + existing ATs" pattern repeats here from batch-6 — both batches found that the spec authoring tradition under-uses the formal registry. Future batches should expect this; estimate **40–60 such gates** await registration corpus-wide. **Streak-watch: pure content turn — no parser change — streak counter remains reset.** | `spec/_GATE-REGISTRY.md` v1.7.4, `spec/01-spec-authoring-guide/21-feature-block-format.md`, this row |
| F-SCOPE-11 | MED | 2026-04-29 (task #6-batch-8) | Resolved | v6 counter did not skip fenced-code-block contents (` ```…``` ` or `~~~…~~~`). Discovered while inspecting `spec/02-coding-guidelines/00-overview.md` line 320 (`STOP — EVERY AI AGENT MUST READ THIS SECTION BEFORE GENERATING CODE.`) — flagged as a prose-MUST but actually inside a triple-backtick ASCII-art notice block. Code blocks contain code, ASCII figures, fixture inputs, and quoted error messages — none of which are normative prose claims. v7 (`scripts/spec-hygiene/audits/count-prose-musts.mjs` lines 35-37) toggles `inFence` on every `^[ \t]*(```\|~~~)` line (info-string agnostic) and skips heading/MUST detection while `inFence === true`. **Corpus re-baseline: 531 → 506** (Δ –25 false positives across 8 files: code blocks containing the literal string `MUST` are common in syntax examples, error fixtures, and admonition figures). Severity bumped to MED (vs prior LOW for F-SCOPE-07/-08): blast radius is wider (8 files × ~3 lines/file vs prior 1-2-file-localised fixes). 8 methodologies now bracket: cluster `[506, 531, 539, 547, 556, 565, 585, 623, 682, 697, 724]` σ ≈ 76, CoV ≈ 13% — broadening as expected (more skip patterns discovered = wider methodology spread until convergence). Combined with content migration in same turn (7 prose-MUSTs in target file → 0): **net turn delta 531 → 499** = first sub-500 figure. Streak-watch: parser-fix qualifies under exception (eliminates real false-positive content findings) AND combined with substantive content migration — streak counter resets. | `scripts/spec-hygiene/audits/count-prose-musts.mjs` v7, `spec/_GATE-REGISTRY.md` v1.7.5, `spec/02-coding-guidelines/00-overview.md`, this row |
| F-SCOPE-17 | LOW | 2026-04-29 (task #6-batch-14) | Resolved | Pure content migration (no parser change): 7 prose-MUSTs in `spec/13-cicd-pipeline-workflows/00-overview.md` (§AI Contract L40, §Pipeline Job DAG L89, §Required-vs-Optional Gate Matrix L133+L144, §Anti-Patterns L164, §Error-code registry L275, §Purpose L310) bound to 7 new `G-13-*` sub-gates registered in the existing **ADR-0013** registry section: `G-13-OVERVIEW-ARCHETYPE-EMIT`, `G-13-DAG-EXACT-MIRROR`, `G-13-BRANCH-PROTECTION-MIRROR`, `G-13-SIGN-REQUIRED-ON-TAG`, `G-13-ANTIPATTERN-COMPLIANCE`, `G-13-FIXTURE-STRING-PARITY`, `G-13-FOLDER-PLACEMENT` (all DOC-NORM tier — gate-table consumers + spec-shape claims). Source file dropped 7 → 0 prose-MUSTs (verified). Net corpus delta this turn: 467 → 453 (Δ –14; second 7 lines came from collateral re-baseline as new ADR-0013 sub-gate citations make the bare-form regex skip prior-flagged lines on other files). Pre-flight namespace check applied — `G-13-*` family already established with 16 sibling gates, no collisions. **Streak-watch: pure content turn — no parser change — counter remains reset; 8th consecutive zero-parser-drift batch.** | `spec/_GATE-REGISTRY.md` v1.7.11, `spec/13-cicd-pipeline-workflows/00-overview.md`, this row |

**Open count:** 0 — **Resolved:** 16

---

## Implementation-side findings (`F-IMPL-AUD-NN`)

Audit-v8 (spec-vs-impl, 2026-04-29) raised these against the `src/` scaffold.
Implementation findings are **deferred** until the user issues `exit spec-only`
or `go for implementation`. They are recorded here for traceability.

| ID | Severity | Subject | Status | Notes |
|---|---|---|---|---|
| F-IMPL-AUD-02 | HIGH | `Item.sortOrder: number` violates ADR-0016 (must be base-62 string) | Resolved | Closed under `exit spec-only` exception (AUD-02 task) — `src/types/index.ts` now exposes branded `SortKey` + `asSortKey()` constructor |
| F-IMPL-AUD-03 | HIGH | `src/main.tsx` uses `BrowserRouter` instead of RRv7 data-router (ADR-0023) | Open | Deferred — requires `exit spec-only` |
| F-IMPL-AUD-04 | LOW | `"dashboard"` in `ItemType` allegedly violates ADR-0015 | Retracted | See [Retraction case study #1](#retraction-case-study-1--f-impl-aud-04) below |
| F-IMPL-AUD-05 | MED | `Enter` key collision in `itemRow` scope (`ItemSplit` vs `ItemNewSibling`) | Resolved | AUD-05 task: added `WhenContext` predicate to `HotkeyBinding` + `resolveHotkey()` dispatcher + uniqueness/mutual-exclusion hygiene tests |
| F-IMPL-AUD-06 | LOW | 8 `.gitkeep.ts` files leak into TS pipeline | Open | Deferred — requires `exit spec-only`; rename to `.gitkeep` |

---

## Update protocol

1. **Adding a new finding:** append a row in the matching family table within the same response that introduces the ID. Status starts as `Open` (or `Retracted` if it's a same-pass false positive).
2. **Closing a finding:** flip status to `Resolved`/`Stale`/`Retracted` AND populate the Evidence column with a clickable relative path. Same-day fixes MAY cite the closing commit hash inline.
3. **Never delete rows.** Historical IDs are permanent; closure is by status flip only. Audit cycles depend on this for stale-detection.
4. **Counts at the bottom of each table** MUST be hand-updated to match the rows above. The hygiene gate verifies this arithmetic.

---

## Retraction case studies

Long-form post-mortems for findings flipped to `Retracted`. Each entry is a
worked example of how a future audit could have resurrected the same false
positive without this ledger — i.e. empirical evidence that F-AUDIT-30 was a
real procedural risk, not a hypothetical one.

### Retraction case study #1 — F-IMPL-AUD-04

**Audit:** spec-vs-impl audit-v8 (2026-04-29) — `/mnt/documents/spec-vs-impl-audit-2026-04-29.md`
**Original claim:** *"`src/types/index.ts` includes `"dashboard"` in the `ItemType` union despite ADR-0015 and internal comments forbidding it. Delete the literal."*
**Severity at time of raise:** LOW
**Outcome:** **Retracted in same cycle** — claim was based on misreading ADR-0015.

#### Evidence trail

1. **The ADR actually says** (`spec/00-adrs/0015-twelve-itemtypes-enum.md`): the closed enum has **exactly 12** members and `"dashboard"` is one of them (it backs the dashboard-view feature, see `mem://features/dashboard-view`). The "internal comments forbidding it" the audit cited turned out to be a *route-level* comment forbidding a `/dashboard` URL alias, not a type-level prohibition.
2. **`mem://index.md` Core** confirms the same: *"12 closed ItemTypes (ADR-0015)"* — and the dashboard-view memory entry references `itemType: "dashboard"` directly.
3. **Counter-action taken** instead of the (wrong) deletion: AUD-04 task formalized the registry by adding `ITEM_TYPES: ReadonlySet<ItemType>` (SSOT), `isItemType(raw)` type guard, and `assertNeverItemType(value: never)` exhaustive-switch trap to `src/types/index.ts`, plus 11 Vitest cases asserting the 12-type set is closed and complete. This converts a future repeat of the same mis-claim into a compile error rather than a code change.

#### Why this matters for F-AUDIT-30

Without this ledger, audit-v9 (or any future cycle) would have re-scanned
`src/types/index.ts`, seen `"dashboard"`, and re-raised F-IMPL-AUD-04 as a
"new" finding — the exact discoverability failure F-AUDIT-30 describes
(F-AUDIT-26 surviving 2 cycles for the same reason). The retraction is now
permanent, indexed by ID, and machine-checkable: the hygiene gate
`scripts/spec-hygiene/74-check-audit-findings-ledger.mjs` will fail any
future audit that lists `F-IMPL-AUD-04` without `Retracted` status.

#### Lessons (codified for future audits)

- **Audits MUST cite the ADR clause text, not just the ADR number.** A bare *"violates ADR-0015"* with no quoted clause hides misreads. Future audits SHOULD inline the ≤80-char quote that prompted the finding.
- **When a finding contradicts a Core memory rule** (here: *"12 closed ItemTypes"*), the audit MUST resolve the contradiction in-band before raising — either by retracting the finding or by proposing a Core memory update with explicit before/after.
- **Closed-set enum changes are content findings, not impl findings.** A claim of the form "delete a member from a closed enum" belongs in a spec-side `F-AUDIT-NN` because it changes the data model, not in `F-IMPL-AUD-NN`. Misclassification was the second error here.

---

### Retraction case study #2 — F-SCOPE-01

**Source:** Self-imposed task #6 ("Prose→AT migration, 2,170 MUST/SHALL formalization"), carried in remaining-tasks list across 4 cycles (2026-04-28 → 2026-04-29).
**Original claim:** *"2,170 prose `MUST`/`SHALL` clauses corpus-wide require migration to AT-shaped acceptance criteria."*
**Severity:** LOW (estimate distortion, not a correctness defect)
**Outcome:** **Re-baselined in same pass** — the figure was 3.2× the true count; the corrected baseline is **682 non-ADR prose-MUSTs**.

#### Evidence trail

1. **Naive corpus count** matched the originally-cited number: `grep -cE "\b(MUST|SHALL)\b" spec/**/*.md` ≈ 2,170. This is what the task description used.
2. **Filter for unformalized prose-MUSTs only** (excluding lines that already cite an `AT-…-` row, a `G-NN-` gate, or sit inside a markdown table cell): **1,030 MUSTs** corpus-wide.
3. **Further split by scope**: ADR files contain **352** of those 1,030 — but ADR-clause MUSTs (D1, D2, …) are *load-bearing constitutional decisions ATs cite*, **not** AT migration targets. Migrating them would be a category error (an AT cannot supersede the ADR clause it derives from).
4. **True migration target = non-ADR prose-MUSTs only: 682 lines.** That is the number the prioritization layer should plan against, not 2,170.

#### Why this matters for F-AUDIT-30

A task estimate inflated 3.2× perpetuates the same discoverability failure F-AUDIT-30 codifies, but in the *forward* direction: instead of re-discovering a closed finding, the planner repeatedly defers a tractable task because its perceived size exceeds turn budget. Carrying the inflated 2,170 across 4 cycles is empirical proof — the true scope (~682 lines, batches of 50/turn = ~14 turns) was always within reach.

#### Lessons (codified for future planning)

- **Effort estimates MUST cite the regex/script used to derive them.** A bare "2,170 prose-MUSTs" with no methodology hides counting errors. Future task entries SHOULD inline the one-liner: e.g. `find spec -name "*.md" … | grep -vE "AT-…|G-NN-…" | wc -l`.
- **Counting "every keyword token" is almost never the right baseline.** Always exclude already-formalized rows (table cells with `AT-` columns, gate-registry briefs, ADR clause stems) before quoting a migration count.
- **ADR clauses are sources, not targets.** The "prose→AT migration" scope is by definition `spec/` minus `spec/00-adrs/`. Future passes that include ADR MUSTs in the count are committing the same category error this case study retracts.

---

### Retraction case study #3 — F-SCOPE-02

**Source:** Self-imposed task #6-batch-1 (2026-04-29) — first attempt at the prose→AT migration following the F-SCOPE-01 re-baseline.
**Original claim:** *"`spec/31-app/97d-acceptance-criteria-fixtures.md` contains 29 non-AT prose-MUSTs to migrate (smallest-file batch)."*
**Severity:** LOW (methodology defect, not a correctness defect)
**Outcome:** **Re-classified in same pass** — all 29 are already canonical AT-row "Negative assertion" slots; the line-scoped regex from F-SCOPE-01 missed this because AT identifiers sit in `### \`AT-…\`` headings 3–7 lines *above* the assertion line, not on the same line.

#### Evidence trail

1. **F-SCOPE-01's regex** was `grep -E '\b(MUST|SHALL)\b' | grep -vE 'AT-…|G-…'` — purely line-scoped, no AST-style block awareness.
2. **Sample line** at `spec/31-app/97d-acceptance-criteria-fixtures.md:19`: `> | **Negative assertion** | Dashboard MUST NOT recurse beyond depth 1; …` — clearly a MUST, no AT- token on the line, but the heading 4 lines above is `### \`AT-APP-68\` — depth=1 only`.
3. **Block-aware re-count** (`/tmp/count-prose-musts.mjs`, walks upward to nearest `### `/`## ` heading and excludes the row if that heading cites `AT-…-`): 97d falls from 29 → **0**.
4. **Corpus-wide re-count** with the same methodology: 682 → **724** (some files had non-AT MUSTs the simpler regex was incorrectly suppressing because an AT-style token appeared elsewhere on the same line — e.g. a `[See AT-{ID}-{NN}] All requests MUST …` reference where the bracketed pseudo-ID is illustrative only, not a real cited acceptance test).

#### Why this matters for F-AUDIT-30

A 2nd consecutive estimate-correction in 1 cycle is empirical proof that *single-pass scope corrections are insufficient*. F-SCOPE-01 thought it had landed the authoritative number; F-SCOPE-02 immediately invalidated it. The discoverability failure F-AUDIT-30 codifies generalizes from "did this finding already close?" to "did the count I'm planning against pass methodology review?". Both questions are answered by the same machinery: a permanent ledger row with a verifiable derivation script.

#### Lessons (codified for future planning)

- **Counting scripts MUST be checked-in artifacts, not inline shell one-liners.** F-SCOPE-01 quoted a regex; F-SCOPE-02 had to write a real script (`/tmp/count-prose-musts.mjs`) to discover the truth. Future scope estimates SHOULD live as committed scripts under `scripts/spec-hygiene/audits/` so the methodology is itself versionable.
- **Block-scoped grammars beat line-scoped regexes for spec analysis.** Spec markdown carries semantic context across line boundaries (heading scope, table-row scope, blockquote scope). Any tool that ignores this will systematically over- or under-count.
- **A "smallest tractable file" pre-check MUST verify non-zero work.** Picking 97d as the batch-1 target turned out to be picking a file with 0 work. Future batches MUST run the AT-block-aware count on the candidate file before committing the turn budget.
- **Regression danger:** the "724" figure itself is now under suspicion until a 3rd independent methodology corroborates it. Treat as `~700 ± 50` for planning purposes; do not bank precision the methodology hasn't earned.

---

### Retraction case study #4 — F-SCOPE-03

**Source:** Self-imposed task #6-batch-1b (2026-04-29) — second attempt at the prose→AT migration following F-SCOPE-02's pivot to `spec/31-app/06-endpoints/97b-endpoint-envelope-fixtures.md` (14 alleged prose-MUSTs).
**Original claim:** *"97b contains 14 real prose-MUSTs requiring AT migration."*
**Severity:** MED (the bug invalidated the F-SCOPE-02 corpus baseline of 724, not just one file's count)
**Outcome:** **Methodology bug discovered and patched in same pass.** True count was **0** real prose-MUSTs in 97b once heading hierarchy was repaired; the 14 were false positives caused by a `### `-as-sibling structural mistake combined with a single-step heading-walk in the v1 counter.

#### Evidence trail

1. **Structural mistake in 97b:** `### AT-WIRE-EGRESS-01 — PHP serializer egress test` at line 284 was followed by 7 sibling `### ` headings (`Setup contract`, `Endpoints exercised`, `Assertion contract`, `Drift guard`, `Failure messages`, `Why this is TEST-tier`, `Cross-references`) — all of which were *semantic* children of the AT but *syntactic* siblings. Per markdown convention, that means each sibling is its own scope.
2. **v1 counter bug:** `/tmp/count-prose-musts.mjs` walked upward to the *first* `### `/`## ` heading and stopped. For lines 297/316/etc., the first ancestor was the sibling sub-heading (`### Assertion contract`), not the AT heading 4–10 lines higher. The "AT-block check" therefore returned false even though the AT was the correct semantic ancestor.
3. **Two-axis fix applied:**
   - **Spec side:** demoted 7 sibling `### ` to `#### ` in 97b (lines 288, 297, 316, 326, 332, 345, 349). Pure structural change — zero content edits, zero AT-WIRE-EGRESS-01 semantic change.
   - **Tooling side:** authored `/tmp/count-prose-musts-v2.mjs` that maintains a heading **stack** (popping descendants on each new heading) and returns true if *any* ancestor frame cites `AT-…-`. This is the correct algorithm for nested-heading semantics.
4. **Re-count under v2 + after fix:** 97b real prose-MUSTs = **0** (was 14). Corpus total: 724 → **697** (Δ –27 — the bug was over-counting in 13 other files too, not just 97b).

#### Why this matters for F-AUDIT-30

This is the **third** scope-correction in 3 turns (F-SCOPE-01 → 02 → 03), each invalidating the prior. Convergence is now plausible because 3 independent methodologies bracket the true value: 682 (v1 line-scoped, F-SCOPE-01), 724 (v1 single-walk, F-SCOPE-02), 697 (v2 stack-walk, F-SCOPE-03). The cluster `[682, 697, 724]` has σ ≈ 17, so **697 ± 30** is a defensible planning figure. F-AUDIT-30's "discoverability of resolution evidence" generalizes here to "convergence of measurement methodologies" — both require permanent ledger entries with reproducible derivation.

#### Lessons (codified for future planning)

- **Heading-walk algorithms MUST traverse the full ancestor stack.** Stopping at the first heading found gives wrong answers whenever spec authors use sibling headings to organize children of a named AT (a common-enough pattern that 14/14 cases in 97b hit it).
- **Spec hygiene rule (proposed):** an `AT-…-` heading SHOULD have all its children at strictly deeper heading levels (`####` if AT is `###`). Sibling sub-sections ambiguate scope and break automated tooling. **Candidate gate name:** `G-00-AT-CHILDREN-NESTED-DEEPER` — DOC tier, can promote to CI once a runner exists.
- **Methodology bugs are MED severity, not LOW.** F-SCOPE-01 and -02 were LOW (single-file estimate noise). F-SCOPE-03 invalidates an entire baseline figure across 287 files. Severity should track blast radius, not turn-of-discovery.
- **Convergence is a quality signal.** When 3 methodologies cluster (σ < 5%), trust the cluster median. When they diverge (σ > 20%), at least one is broken — debug methodology before banking the figure. The current cluster σ ≈ 2.4% supports the 697 baseline.
- **Structural fixes count as content migration.** The 14-line "migration" in 97b touched zero AT semantics — pure heading-level demotion — yet it eliminated 14 prose-MUSTs from the corpus. This validates the "promote-to-AT-scope-via-nesting" pattern as a high-leverage migration technique distinct from the line-by-line rewriting the original task #6 envisioned.

---

### Retraction case study #5 — F-SCOPE-05

**Discovery context.** Task #6-batch-1c per F-SCOPE-03 picked the new top hit (`spec/97a-acceptance-criteria-fixtures.md`, 11 prose-MUSTs). Manual inspection of every flagged line revealed all 11 were false positives: 10 sat in canonical fixture-table slot rows (`| **Negative assertion** |`, `| **Then** |`, …) inside the file's "Pattern 1..10" catalogue, and 1 sat in a blockquoted citation of `19-acceptance-criteria-io-table.md`. None were unformalized prose-MUSTs.

**Why v2 missed them.** v2's heading-stack walk only excluded `MUST` lines under headings citing `AT-…-`. But canonical patterns referenced *by* ATs (the entire purpose of `97a-acceptance-criteria-fixtures.md`) live under `### Pattern N — <name>` headings without AT identifiers — by design, since they're templates, not ATs. The fixture-table slot label (`| **Negative assertion** |`, etc.) is the AT-shape signal at row level, not heading level. v2 also ignored markdown blockquote semantics: a `> MUST` line is by definition quoting another doc, not asserting a new norm.

**Resolution.** v3 (`scripts/spec-hygiene/audits/count-prose-musts.mjs` lines 25–48) adds two skip clauses:
1. `FIXTURE_SLOT_RE` — matches the closed set of canonical slot labels per format SSOT.
2. `^\s*>\s` — skips blockquoted lines.

**Methodology lessons.**
- **Format SSOT compliance ≠ heading citation.** The format SSOT (`19-acceptance-criteria-io-table.md`) defines AT-shape at *row level* via slot labels. Counters that only inspect heading nesting will systematically over-count files that use the canonical pattern catalogue idiom (`spec/97a-…-fixtures.md` files).
- **Blockquote semantics matter.** Markdown's `> ` prefix is the standard "this is a quotation" signal. Any normative-keyword counter that ignores it will double-count every cross-doc citation.
- **4 methodologies = real convergence.** Cluster `[623, 682, 697, 724]` σ ≈ 38 (6.1% of mean). The current best estimate is **623**, but the 95% CI per σ is ±76, suggesting at least one more methodology bug is plausible. Continue treating each batch attempt as a methodology probe until 3 consecutive batches produce zero new F-SCOPE-NN entries.
- **Streak-watch exception triggered correctly.** The "parser-fix counts as content when it eliminates a false-positive content finding" exception applied here: the v3 fix eliminated 11 false-positive prose-MUSTs in the targeted file (and 74 across the corpus) without editing the file. This was a real content-finding closure, not a tooling lap.

---

### Retraction case study #6 — F-SCOPE-06

**Discovery context.** Task #6-batch-2 per F-SCOPE-05 picked the new top hit (`spec/03-error-manage/00-overview.md`, 11 prose-MUSTs). Manual inspection of every flagged line revealed 2 of the 11 (lines 13 and 92) were already gate-bound — both cited `G-40` and `G-22` respectively in narrative text — but the v3 counter regex `G-[0-9N][0-9NS]?-` required a trailing `-` after the digits and missed the bare-form citations. The remaining 9 lines are genuine substantive prose-MUSTs (real migration work for batch-3).

**Why v3 missed them.** The regex was authored under the implicit assumption that gate ids are always referenced with a trailing component (e.g. `G-N1-FOO`), but corpus evidence shows the bare form is **2,037 instances vs 1,149 dashed** — bare is 64% of all gate citations. Real-world terminators include `)`, `,`, `.`, ` `, end-of-line, none of which match a literal `-`.

**Resolution.** v4 (`scripts/spec-hygiene/audits/count-prose-musts.mjs` line 43) updates the regex to `\bG-[0-9N][0-9NS-]*\b` — word-boundary terminator with optional dash continuation. This matches both `G-40` (bare) and `G-N1-FOO` (dashed) without requiring the trailing `-`.

**Methodology lessons.**
- **Regex assumptions about identifier shape MUST be validated against corpus frequencies.** F-SCOPE-06 is the third regex-shape bug in the F-SCOPE-NN family (preceded by F-SCOPE-01 line-scoping and F-SCOPE-03 single-heading walk). A `grep -cE` of bare vs dashed forms is a 5-second sanity check that would have prevented this. Add to checklist for any new identifier-class regex.
- **Word boundaries beat literal terminators.** Whenever an identifier can appear with multiple natural-language terminators, `\b` is the correct boundary marker. Literal terminators only work for stylized contexts (e.g. inside JSON keys or specific markdown patterns).
- **Methodology probes are converging.** F-SCOPE-03 → -05 → -06 each eliminated ~30–75 false positives. The deltas are shrinking (74 → 29) which is the convergence signal predicted by case study #5. Cluster σ has grown slightly (38 → 47) as v4 added a 5th methodology, but coefficient of variation is **stable at ~7%** — well under the 20% "broken methodology" threshold.
- **Streak-watch exception triggered correctly (2nd consecutive).** The "parser-fix counts as content when it eliminates a false-positive content finding" exception applied here: v4 eliminated 2 false-positive prose-MUSTs in the targeted file (and 29 across the corpus). The next batch (#6-batch-3) MUST tackle the 9 remaining substantive lines in `spec/03-error-manage/00-overview.md` — no further parser-fix exceptions are available without re-triggering streak-violation.

---

## Related

- [`spec/_AUDIT-EXEMPTIONS.md`](./_AUDIT-EXEMPTIONS.md) — granted exemptions per ADR-0030
- [`spec/_GATE-REGISTRY.md`](./_GATE-REGISTRY.md) — every CI gate
- [`spec/_GATE-GRADUATION-LEDGER.md`](./_GATE-GRADUATION-LEDGER.md) — warn→strict graduation history (ADR-0031)
- [`spec/00-scoping.md`](./00-scoping.md) — folder scoping SSOT (closes F-AUDIT-28)
- [`spec/18-spec-issues/00-overview.md`](./18-spec-issues/00-overview.md) — per-folder audit dashboard
- [`/mnt/documents/spec-ai-implementability-audit-v7.json`](../mnt/documents/spec-ai-implementability-audit-v7.json) — v7 audit artifact (raised F-AUDIT-30)
- [`mem://index.md`](mem://index.md) — Core rules referencing this ledger
