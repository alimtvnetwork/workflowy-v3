# AMBIGUITY-LEDGER — Unbacked Normative Clauses

**Generated:** GAP-AMB-01 (2026-04-30) by `scripts/spec-hygiene/ambiguity_audit.py`
**Heuristic:** A `MUST` / `SHALL` / `MUST NOT` / `SHALL NOT` / `REQUIRED` clause is *backed* if an `AT-…` ID OR a `G-NN-…` gate ID OR a `gate G-…` reference appears within ±5 lines (same paragraph window).

## Corpus totals

| Metric | Count | % |
|---|---|---|
| Files containing normative clauses | 476 | — |
| Total normative clauses | 2942 | 100% |
| Backed (AT- or G- within ±5 lines) | 2335 | 79.4% |
| **Unbacked** | **607** | **20.6%** |
| — Exempt registry/ledger prose | 46 | 1.6% |
| — **Actionable (true findings)** | **561** | **19.1%** |

## Mediocre-AI implementability impact

At the user-set bar ('mediocre AI, zero follow-up, 100% intent match'), every actionable unbacked clause is a coin-flip: a strong AI infers correctly, a mediocre AI may diverge. With **19.1% actionable-unbacked**, mediocre-AI score is bounded by `(100 − actionable_unbacked_pct)` ≈ **81/100** before any other factor — well below the v7 strong-AI baseline of 95.

## Actionable findings — top 30 (by unbacked count, exempts removed)

| # | Unbacked | File | Top example (line) |
|---|---|---|---|
| 1 | 10 | `03-error-manage/02-error-architecture/07-logging-and-diagnostics/01-react-execution-logger.md` | L33: \| F1 \| Track function executions with arguments \| MUST \| |
| 2 | 10 | `03-error-manage/02-error-architecture/07-logging-and-diagnostics/02-session-based-logging/01-requirements.md` | L9: \| F1 \| Every API request must be assigned a unique session ID \| MUST \| |
| 3 | 8 | `00-adrs/0024-ratify-soft-confirm-triage-rulings.md` | L32: **D1 — Ratify [#01](../../.lovable/question-and-ambiguity/00-triage-summary.md#01--audit-100100-score-should-b1b4-addend |
| 4 | 7 | `00-adrs/0015-twelve-itemtypes-enum.md` | L24: values**. It MUST be defined identically in all three SSOTs and consumed |
| 5 | 7 | `00-adrs/0016-fractional-index-sortorder.md` | L36: `mem://features/editor-core` is hereby **superseded** and MUST be |
| 6 | 6 | `00-adrs/0017-eight-error-boundaries-ui-virtualization.md` | L30: MUST mount exactly eight independent React error boundaries, each |
| 7 | 6 | `00-adrs/0030-audit-exemption-manifest.md` | L44: this match") **MUST** live in exactly one file: |
| 8 | 5 | `00-adrs/0004-rest-envelope-pascalcase.md` | L37: Every REST response served by the WordPress plugin **MUST** be a |
| 9 | 5 | `00-adrs/0022-shadcn-radix-component-base.md` | L40: underlying primitive layer.** Components MUST come from one of: |
| 10 | 5 | `02-coding-guidelines/97a-acceptance-criteria-fixtures.md` | L17: Authoring 363 near-identical fixture blocks would be noise. Instead this file declares **one canonical template** + one  |
| 11 | 5 | `31-app/97b-acceptance-criteria-fixtures.md` | L31: > \| **Negative assertion** \| Row `itm_A` MUST still exist in `Items` table (`SELECT COUNT(*) FROM Item WHERE Id='itm_A |
| 12 | 5 | `31-app/01-features/05a-hotkey-table.md` | L31: A flat, machine-parseable table of every keyboard shortcut. The implementation file `src/lib/interactions/useGlobalKeys. |
| 13 | 5 | `31-app/01-features/09-mirrors.md` | L79: \| Mirror badge \| Every mirrored item MUST show a small diamond (◇) icon next to its content. \| |
| 14 | 5 | `31-app/01-features/09b-mirror-peer-group-model.md` | L47: \| **R-5** \| Conflict tiebreak is **LWW by the canonical 3-tier comparator `(ServerTs DESC, OwnerId ASC, ItemId ASC)`** |
| 15 | 5 | `31-app/01-features/16-search-ranking.md` | L195: - **Determinism contract:** identical `(query, DB snapshot)` MUST produce byte-identical ordering (per **I-SR-01**). |
| 16 | 4 | `00-adrs/00-overview.md` | L65: > **Golden Rule:** if a spec page says *"MUST first amend via ADR"*, that |
| 17 | 4 | `00-adrs/0029-per-gate-path-ledger-shared-lib.md` | L1: # ADR-0029 — Per-(Gate, Path) Ledger Consumers MUST Use the Shared Library |
| 18 | 4 | `00-adrs/0032-license-decision.md` | L27: The project MUST adopt the following license posture, ratifying every Q1–Q5 |
| 19 | 4 | `00-adrs/_LEDGER-G-00-ADR-XLINK-SYMMETRY-BASELINE.md` | L8: > **Phase-1 → Phase-2 delta:** Phase 1 checked file-level back-link presence anywhere in target. Phase 2 adds an **ancho |
| 20 | 4 | `02-coding-guidelines/00-overview-condensed.md` | L170: Authoring 363 near-identical fixture blocks would be noise. Instead this file declares **one canonical template** + one  |
| 21 | 4 | `31-app/00b-numbering-policy.md` | L23: - A sub-feature MUST cite its parent in the front-matter header: `> **Parent feature:** [...](./NN-parent.md)`. |
| 22 | 4 | `31-app/97-acceptance-criteria.md` | L305: - ❌ AT **fixtures** (under `97a-`/`97b-`/…) MUST use canonical singular |
| 23 | 4 | `31-app/01-features/01-information-model.md` | L123: 3. Item is moved to a new parent — `id` MUST remain stable; only `ParentId` and `SortOrder` change. |
| 24 | 4 | `31-app/01-features/04-page-content-area.md` | L69: MUST appear as a floating toolbar above selected text. Centered above the selection with a small arrow/caret pointing do |
| 25 | 4 | `31-app/01-features/06-item-context-menu.md` | L257: > **Reconciliation note (F7 candidate):** every slash command above MUST resolve to either an item-menu entry or an inte |
| 26 | 4 | `31-app/01-features/07-board-view.md` | L222: > **Structural sync:** every board action MUST mutate through the same item CRUD path used by the list renderer — boards |
| 27 | 4 | `31-app/01-features/08-share-dialog.md` | L173: > **Reconciliation note (F7 candidate):** the public-link URL pattern (`https://workflowy.app/s/<token>`) is taken verba |
| 28 | 4 | `31-app/01-features/14-concurrency-and-sync.md` | L145: \| `cursor-overflow` \| Backpressure (see §14.5.1) \| `{ ResumeWith: 'snapshot' }` — client MUST fetch a fresh REST snap |
| 29 | 4 | `31-app/07-db-diagram/00b-split-db-anchor.md` | L5: > **Status:** ✅ Normative SSOT — every per-user-data feature/endpoint MUST cite this file. |
| 30 | 4 | `13-cicd-pipeline-workflows/18-wp-plugin-deploy/01-distignore-and-zip-layout.md` | L11: Defines (a) the canonical `.distignore` contract that excludes development files from the release ZIP and (b) the exact  |

## Exempt registry/ledger files (legitimate prose, no AT needed)

- `AUDIT-FINDINGS-LEDGER.md` — 16 clauses (registry/ledger meta-prose)
- `01-spec-authoring-guide/97-acceptance-criteria.md` — 10 clauses (registry/ledger meta-prose)
- `00-adrs/_INDEX_AUTOMATION.md` — 9 clauses (registry/ledger meta-prose)
- `_GATE-GRADUATION-LEDGER.md` — 3 clauses (registry/ledger meta-prose)
- `AMBIGUITY-LEDGER.md` — 3 clauses (registry/ledger meta-prose)
- `_LEDGER-G-13-BACKLINK-EXEMPT.md` — 2 clauses (registry/ledger meta-prose)
- `_LEDGER-G-NS-CORE-MEMORY-COVERAGE.md` — 2 clauses (registry/ledger meta-prose)
- `_AUDIT-EXEMPTIONS.md` — 1 clauses (registry/ledger meta-prose)

## By scope

| Scope | Unbacked | Files |
|---|---|---|
| `31-app/` | 159 | 65 |
| `02-coding-guidelines/` | 89 | 53 |
| `00-adrs/` | 80 | 19 |
| `15-wp-plugin-how-to/` | 47 | 34 |
| `03-error-manage/` | 42 | 20 |
| `(root)/` | 34 | 12 |
| `01-spec-authoring-guide/` | 29 | 11 |
| `13-cicd-pipeline-workflows/` | 27 | 14 |
| `12-consolidated-guidelines/` | 25 | 24 |
| `32-ui-design/` | 17 | 12 |
| `04-database-conventions/` | 9 | 5 |
| `14-self-update-app-update/` | 9 | 6 |
| `16-generic-cli/` | 5 | 3 |
| `35-enforcement-rules/` | 5 | 3 |
| `07-design-system/` | 4 | 3 |

## Resolution protocol

1. **Findings GAP-AMB-01-NN** are auto-generated, one per actionable file in the ranked table above.
2. Each finding requires either: (a) adding adjacent `AT-`/`G-` IDs to the existing clause, OR (b) demoting the prose `MUST` to `SHOULD`/`MAY` if non-normative was intended, OR (c) marking the file in `LEGIT_PROSE` exemption set with justification.
3. Burn-down target: actionable-unbacked → **<5%** of corpus to claim mediocre-AI EXCELLENT (matches v7 strong-AI score).
4. Re-run `scripts/spec-hygiene/ambiguity_audit.py` after each batch.

## Next tasks (auto-derived)

- **GAP-AMB-01-01..30** — bind top-30 actionable files (ranked above)
- **GAP-AMB-02** — vague-modifier sweep (queued)
- **GAP-AMB-03** — undefined-term audit against `spec/19-glossary.md` (queued)
