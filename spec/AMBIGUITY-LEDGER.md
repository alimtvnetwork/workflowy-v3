# AMBIGUITY-LEDGER — Unbacked Normative Clauses

**Generated:** GAP-AMB-01 (2026-04-30) by `scripts/spec-hygiene/ambiguity_audit.py`
**Heuristic:** A `MUST` / `SHALL` / `MUST NOT` / `SHALL NOT` / `REQUIRED` clause is *backed* if an `AT-…` ID OR a `G-NN-…` gate ID OR a `gate G-…` reference appears within ±5 lines (same paragraph window).

## Corpus totals

| Metric | Count | % |
|---|---|---|
| Files containing normative clauses | 476 | — |
| Total normative clauses | 2940 | 100% |
| Backed (AT- or G- within ±5 lines) | 2429 | 82.6% |
| **Unbacked** | **511** | **17.4%** |
| — Exempt registry/ledger prose | 40 | 1.4% |
| — **Actionable (true findings)** | **471** | **16.0%** |

## Mediocre-AI implementability impact

At the user-set bar ('mediocre AI, zero follow-up, 100% intent match'), every actionable unbacked clause is a coin-flip: a strong AI infers correctly, a mediocre AI may diverge. With **16.0% actionable-unbacked**, mediocre-AI score is bounded by `(100 − actionable_unbacked_pct)` ≈ **84/100** before any other factor — well below the v7 strong-AI baseline of 95.

## Actionable findings — top 30 (by unbacked count, exempts removed)

| # | Unbacked | File | Top example (line) |
|---|---|---|---|
| 1 | 8 | `00-adrs/0024-ratify-soft-confirm-triage-rulings.md` | L32: **D1 — Ratify [#01](../../.lovable/question-and-ambiguity/00-triage-summary.md#01--audit-100100-score-should-b1b4-addend |
| 2 | 7 | `00-adrs/0015-twelve-itemtypes-enum.md` | L24: values**. It MUST be defined identically in all three SSOTs and consumed |
| 3 | 7 | `00-adrs/0016-fractional-index-sortorder.md` | L36: `mem://features/editor-core` is hereby **superseded** and MUST be |
| 4 | 5 | `00-adrs/0017-eight-error-boundaries-ui-virtualization.md` | L30: MUST mount exactly eight independent React error boundaries, each |
| 5 | 5 | `31-app/01-features/05a-hotkey-table.md` | L31: A flat, machine-parseable table of every keyboard shortcut. The implementation file `src/lib/interactions/useGlobalKeys. |
| 6 | 5 | `31-app/01-features/09-mirrors.md` | L79: \| Mirror badge \| Every mirrored item MUST show a small diamond (◇) icon next to its content. \| |
| 7 | 4 | `00-adrs/0004-rest-envelope-pascalcase.md` | L37: Every REST response served by the WordPress plugin **MUST** be a |
| 8 | 4 | `00-adrs/0030-audit-exemption-manifest.md` | L44: this match") **MUST** live in exactly one file: |
| 9 | 4 | `31-app/00b-numbering-policy.md` | L23: - A sub-feature MUST cite its parent in the front-matter header: `> **Parent feature:** [...](./NN-parent.md)`. |
| 10 | 4 | `31-app/01-features/01-information-model.md` | L123: 3. Item is moved to a new parent — `id` MUST remain stable; only `ParentId` and `SortOrder` change. |
| 11 | 4 | `31-app/01-features/04-page-content-area.md` | L69: MUST appear as a floating toolbar above selected text. Centered above the selection with a small arrow/caret pointing do |
| 12 | 4 | `31-app/01-features/06-item-context-menu.md` | L257: > **Reconciliation note (F7 candidate):** every slash command above MUST resolve to either an item-menu entry or an inte |
| 13 | 4 | `31-app/01-features/07-board-view.md` | L222: > **Structural sync:** every board action MUST mutate through the same item CRUD path used by the list renderer — boards |
| 14 | 4 | `31-app/01-features/08-share-dialog.md` | L173: > **Reconciliation note (F7 candidate):** the public-link URL pattern (`https://workflowy.app/s/<token>`) is taken verba |
| 15 | 4 | `31-app/01-features/09b-mirror-peer-group-model.md` | L47: \| **R-5** \| Conflict tiebreak is **LWW by the canonical 3-tier comparator `(ServerTs DESC, OwnerId ASC, ItemId ASC)`** |
| 16 | 4 | `31-app/01-features/14-concurrency-and-sync.md` | L145: \| `cursor-overflow` \| Backpressure (see §14.5.1) \| `{ ResumeWith: 'snapshot' }` — client MUST fetch a fresh REST snap |
| 17 | 4 | `31-app/01-features/16-search-ranking.md` | L258: \| Stream consumption \| Search results may become **stale** when an SSE frame (`item.updated`, `item.deleted`, `item.cr |
| 18 | 4 | `31-app/07-db-diagram/00b-split-db-anchor.md` | L5: > **Status:** ✅ Normative SSOT — every per-user-data feature/endpoint MUST cite this file. |
| 19 | 4 | `13-cicd-pipeline-workflows/18-wp-plugin-deploy/01-distignore-and-zip-layout.md` | L11: Defines (a) the canonical `.distignore` contract that excludes development files from the release ZIP and (b) the exact  |
| 20 | 4 | `02-coding-guidelines/03-golang/01-enum-specification/01-enum-pattern.md` | L11: All enums MUST use `byte` as the underlying type for memory efficiency and performance. |
| 21 | 3 | `00-adrs/00-overview.md` | L109: Every ADR file **MUST** contain these sections, in order, using the exact |
| 22 | 3 | `00-adrs/0022-shadcn-radix-component-base.md` | L51: **D2 — Forbidden component libraries.** The following MUST NOT |
| 23 | 3 | `00-adrs/0029-per-gate-path-ledger-shared-lib.md` | L1: # ADR-0029 — Per-(Gate, Path) Ledger Consumers MUST Use the Shared Library |
| 24 | 3 | `00-adrs/0032-license-decision.md` | L27: The project MUST adopt the following license posture, ratifying every Q1–Q5 |
| 25 | 3 | `00-adrs/_LEDGER-G-00-ADR-XLINK-SYMMETRY-BASELINE.md` | L15: after this date MUST be diffable against this ledger and ship with |
| 26 | 3 | `01-spec-authoring-guide/02-naming-conventions.md` | L133: Every `.md` file MUST begin with a standardized metadata header in **blockquote form**: |
| 27 | 3 | `01-spec-authoring-guide/17-quick-start-and-enforcement.md` | L12: > After reading this spec authoring guide and the linked coding guidelines, you **MUST** internalize and retain the foll |
| 28 | 3 | `02-coding-guidelines/00-overview-condensed.md` | L184: \| **Then** \| Adding the rule's negative example (`invalid:` block from the rule meta) MUST produce exit code `1` AND a |
| 29 | 3 | `02-coding-guidelines/97a-acceptance-criteria-fixtures.md` | L31: \| **Then** \| Adding the rule's negative example (`invalid:` block from the rule meta) MUST produce exit code `1` AND a |
| 30 | 3 | `04-database-conventions/02-schema-design.md` | L18: Primary keys MUST be integer-based. Choose the **smallest type** that fits the expected data volume: |

## Exempt registry/ledger files (legitimate prose, no AT needed)

- `AUDIT-FINDINGS-LEDGER.md` — 15 clauses (registry/ledger meta-prose)
- `AMBIGUITY-LEDGER.md` — 13 clauses (registry/ledger meta-prose)
- `00-adrs/_INDEX_AUTOMATION.md` — 7 clauses (registry/ledger meta-prose)
- `_GATE-GRADUATION-LEDGER.md` — 2 clauses (registry/ledger meta-prose)
- `_AUDIT-EXEMPTIONS.md` — 1 clauses (registry/ledger meta-prose)
- `_LEDGER-G-13-BACKLINK-EXEMPT.md` — 1 clauses (registry/ledger meta-prose)
- `01-spec-authoring-guide/97-acceptance-criteria.md` — 1 clauses (registry/ledger meta-prose)

## By scope

| Scope | Unbacked | Files |
|---|---|---|
| `31-app/` | 142 | 59 |
| `02-coding-guidelines/` | 84 | 52 |
| `00-adrs/` | 66 | 19 |
| `15-wp-plugin-how-to/` | 46 | 33 |
| `(root)/` | 39 | 11 |
| `12-consolidated-guidelines/` | 25 | 24 |
| `13-cicd-pipeline-workflows/` | 21 | 12 |
| `01-spec-authoring-guide/` | 20 | 11 |
| `03-error-manage/` | 20 | 16 |
| `32-ui-design/` | 13 | 9 |
| `04-database-conventions/` | 8 | 4 |
| `14-self-update-app-update/` | 8 | 5 |
| `16-generic-cli/` | 4 | 2 |
| `17-generic-update/` | 3 | 2 |
| `06-seedable-config-architecture/` | 3 | 3 |

## Resolution protocol

1. **Findings GAP-AMB-01-NN** are auto-generated, one per actionable file in the ranked table above.
2. Each finding requires either: (a) adding adjacent `AT-`/`G-` IDs to the existing clause, OR (b) demoting the prose `MUST` to `SHOULD`/`MAY` if non-normative was intended, OR (c) marking the file in `LEGIT_PROSE` exemption set with justification.
3. Burn-down target: actionable-unbacked → **<5%** of corpus to claim mediocre-AI EXCELLENT (matches v7 strong-AI score).
4. Re-run `scripts/spec-hygiene/ambiguity_audit.py` after each batch.

## Next tasks (auto-derived)

- **GAP-AMB-01-01..30** — bind top-30 actionable files (ranked above)
- **GAP-AMB-02** — vague-modifier sweep (queued)
- **GAP-AMB-03** — undefined-term audit against `spec/19-glossary.md` (queued)
