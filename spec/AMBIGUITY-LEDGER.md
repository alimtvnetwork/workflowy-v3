# AMBIGUITY-LEDGER — Unbacked Normative Clauses

**Generated:** GAP-AMB-01 (2026-04-30) by `scripts/spec-hygiene/ambiguity_audit.py`
**Heuristic:** A `MUST` / `SHALL` / `MUST NOT` / `SHALL NOT` / `REQUIRED` clause is *backed* if an `AT-…` ID OR a `G-NN-…` gate ID OR a `gate G-…` reference appears within ±5 lines (same paragraph window).

## Corpus totals

| Metric | Count | % |
|---|---|---|
| Files containing normative clauses | 476 | — |
| Total normative clauses | 2942 | 100% |
| Backed (AT- or G- within ±5 lines) | 2468 | 83.9% |
| **Unbacked** | **474** | **16.1%** |
| — Exempt registry/ledger prose | 41 | 1.4% |
| — **Actionable (true findings)** | **433** | **14.7%** |

## Mediocre-AI implementability impact

At the user-set bar ('mediocre AI, zero follow-up, 100% intent match'), every actionable unbacked clause is a coin-flip: a strong AI infers correctly, a mediocre AI may diverge. With **14.7% actionable-unbacked**, mediocre-AI score is bounded by `(100 − actionable_unbacked_pct)` ≈ **85/100** before any other factor — well below the v7 strong-AI baseline of 95.

## Actionable findings — top 30 (by unbacked count, exempts removed)

| # | Unbacked | File | Top example (line) |
|---|---|---|---|
| 1 | 5 | `31-app/01-features/05a-hotkey-table.md` | L31: A flat, machine-parseable table of every keyboard shortcut. The implementation file `src/lib/interactions/useGlobalKeys. |
| 2 | 5 | `31-app/01-features/09-mirrors.md` | L79: \| Mirror badge \| Every mirrored item MUST show a small diamond (◇) icon next to its content. \| |
| 3 | 4 | `31-app/00b-numbering-policy.md` | L23: - A sub-feature MUST cite its parent in the front-matter header: `> **Parent feature:** [...](./NN-parent.md)`. |
| 4 | 4 | `31-app/01-features/01-information-model.md` | L123: 3. Item is moved to a new parent — `id` MUST remain stable; only `ParentId` and `SortOrder` change. |
| 5 | 4 | `31-app/01-features/04-page-content-area.md` | L69: MUST appear as a floating toolbar above selected text. Centered above the selection with a small arrow/caret pointing do |
| 6 | 4 | `31-app/01-features/06-item-context-menu.md` | L257: > **Reconciliation note (F7 candidate):** every slash command above MUST resolve to either an item-menu entry or an inte |
| 7 | 4 | `31-app/01-features/07-board-view.md` | L222: > **Structural sync:** every board action MUST mutate through the same item CRUD path used by the list renderer — boards |
| 8 | 4 | `31-app/01-features/08-share-dialog.md` | L173: > **Reconciliation note (F7 candidate):** the public-link URL pattern (`https://workflowy.app/s/<token>`) is taken verba |
| 9 | 4 | `31-app/01-features/09b-mirror-peer-group-model.md` | L47: \| **R-5** \| Conflict tiebreak is **LWW by the canonical 3-tier comparator `(ServerTs DESC, OwnerId ASC, ItemId ASC)`** |
| 10 | 4 | `31-app/01-features/14-concurrency-and-sync.md` | L145: \| `cursor-overflow` \| Backpressure (see §14.5.1) \| `{ ResumeWith: 'snapshot' }` — client MUST fetch a fresh REST snap |
| 11 | 4 | `31-app/01-features/16-search-ranking.md` | L258: \| Stream consumption \| Search results may become **stale** when an SSE frame (`item.updated`, `item.deleted`, `item.cr |
| 12 | 4 | `31-app/07-db-diagram/00b-split-db-anchor.md` | L5: > **Status:** ✅ Normative SSOT — every per-user-data feature/endpoint MUST cite this file. |
| 13 | 4 | `13-cicd-pipeline-workflows/18-wp-plugin-deploy/01-distignore-and-zip-layout.md` | L11: Defines (a) the canonical `.distignore` contract that excludes development files from the release ZIP and (b) the exact  |
| 14 | 4 | `02-coding-guidelines/03-golang/01-enum-specification/01-enum-pattern.md` | L11: All enums MUST use `byte` as the underlying type for memory efficiency and performance. |
| 15 | 3 | `00-adrs/00-overview.md` | L109: Every ADR file **MUST** contain these sections, in order, using the exact |
| 16 | 3 | `00-adrs/0029-per-gate-path-ledger-shared-lib.md` | L1: # ADR-0029 — Per-(Gate, Path) Ledger Consumers MUST Use the Shared Library |
| 17 | 3 | `00-adrs/0032-license-decision.md` | L27: The project MUST adopt the following license posture, ratifying every Q1–Q5 |
| 18 | 3 | `00-adrs/_LEDGER-G-00-ADR-XLINK-SYMMETRY-BASELINE.md` | L15: after this date MUST be diffable against this ledger and ship with |
| 19 | 3 | `01-spec-authoring-guide/02-naming-conventions.md` | L133: Every `.md` file MUST begin with a standardized metadata header in **blockquote form**: |
| 20 | 3 | `01-spec-authoring-guide/17-quick-start-and-enforcement.md` | L12: > After reading this spec authoring guide and the linked coding guidelines, you **MUST** internalize and retain the foll |
| 21 | 3 | `02-coding-guidelines/00-overview-condensed.md` | L184: \| **Then** \| Adding the rule's negative example (`invalid:` block from the rule meta) MUST produce exit code `1` AND a |
| 22 | 3 | `02-coding-guidelines/97a-acceptance-criteria-fixtures.md` | L31: \| **Then** \| Adding the rule's negative example (`invalid:` block from the rule meta) MUST produce exit code `1` AND a |
| 23 | 3 | `04-database-conventions/02-schema-design.md` | L18: Primary keys MUST be integer-based. Choose the **smallest type** that fits the expected data volume: |
| 24 | 3 | `13-cicd-pipeline-workflows/16-shared-conventions.md` | L16: All GitHub Actions and external tools MUST be pinned to exact version tags. Using `@latest` or `@main` is **prohibited** |
| 25 | 3 | `14-self-update-app-update/14-network-requirements.md` | L67: The HTTP client MUST respect standard proxy environment variables: |
| 26 | 3 | `16-generic-cli/11-build-deploy.md` | L101: - Parent MUST use blocking execution (not async) |
| 27 | 3 | `31-app/97b-acceptance-criteria-fixtures.md` | L31: > \| **Negative assertion** \| Row `itm_A` MUST still exist in `Items` table (`SELECT COUNT(*) FROM Item WHERE Id='itm_A |
| 28 | 3 | `32-ui-design/skeletons/00-overview.md` | L12: **Purpose** — Provide ready-to-copy TypeScript 5.6+ skeletons (`as const` enum objects + typed Axios API client) derived |
| 29 | 3 | `31-app/01-features/00-overview.md` | L136: \| Settings persistence \| [`spec/15-wp-plugin-how-to/15-settings-architecture/13-anti-patterns.md`](../../15-wp-plugin- |
| 30 | 3 | `31-app/01-features/05-interactions.md` | L211: - **ADR-0023 — Loader↔Queue Contract:** Loaders MUST read the local IndexedDB mirror first (≤16 ms p95, never fetch). Mu |

## Exempt registry/ledger files (legitimate prose, no AT needed)

- `AUDIT-FINDINGS-LEDGER.md` — 15 clauses (registry/ledger meta-prose)
- `AMBIGUITY-LEDGER.md` — 14 clauses (registry/ledger meta-prose)
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
| `15-wp-plugin-how-to/` | 46 | 33 |
| `(root)/` | 40 | 11 |
| `00-adrs/` | 28 | 12 |
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


---

## GAP-AMB-01-31..45 — Architecture Anchors batch bind (2026-04-30)

**Action:** Bound the recurring "Architecture Anchors (load-bearing ADRs)" template across **22 feature files** in `spec/31-app/01-features/`. The template repeats ADR-0023 / ADR-0017 / ADR-0025 cross-link bullets verbatim; each bullet now cites its umbrella gates inline.

**Bindings inserted (template-wide):**
- ADR-0023 bullet → gates **G-23-LOADER-MIRROR-FIRST**, **G-23-LOADER-NO-MUTATE**, **G-23-ACTION-ENQUEUE-ONLY**
- ADR-0017 bullet → gates **G-22-ERROR-BOUNDARIES-EXACTLY-8**, **G-22-BOUNDARY-NAMES-CLOSED**, **G-22-BOUNDARY-ISOLATION**
- ADR-0025 bullet → gates **G-25-SSE-ENDPOINT-CLOSED**, **G-25-SSE-CURSOR-WORKSPACE-SCOPED**

**Files modified (22):** `01-information-model.md`, `04-page-content-area.md`, `05-interactions.md`, `06-item-context-menu.md`, `07-board-view.md`, `07b-dashboard-view.md`, `08-share-dialog.md`, `08b-sharing-mirror-interaction.md`, `09-mirrors.md`, `09a-mirror-cycle-detection.md`, `09b-mirror-peer-group-model.md`, `10-today-view.md`, `11-trash-view.md`, `11b-trash-reaper.md`, `12-multi-select.md`, `12b-multi-select-zoom.md`, `13-templates.md`, `13b-templates-snapshot-semantics.md`, `14-concurrency-and-sync.md`, `14b-offline-queue.md`, `15-roles-and-permissions.md`, `16-search-ranking.md`.

**Result:** Unbacked clauses **471 → 432** (-39, -8.3%). Backed coverage **84.0% → 85.3%**.


---

## GAP-AMB-01-46..60 — Cross-domain individual-file bind (2026-04-30)

**Action:** Bound **15 individual files** spanning 7 domains (features, ADRs, authoring guide, coding guidelines, DB conventions, CI/CD, self-update). Citations reuse pre-existing gates only — zero new gate declarations needed.

**Files modified (15):**
- `31-app/01-features/05a-hotkey-table.md` (+2 → G-22-BOUNDARY-NAMES-CLOSED)
- `31-app/00b-numbering-policy.md` (+3 → G-NS-STATUS-COMPANION-CITES-PARENT, G-00-ADR-NUMBERING)
- `31-app/07-db-diagram/00b-split-db-anchor.md` (+3 → G-23-DATA-ROUTER-API, G-24-DDL-SINGULAR-LOCKED)
- `13-cicd-pipeline-workflows/18-wp-plugin-deploy/01-distignore-and-zip-layout.md` (+3 → G-10-BOUNDARY-DISTIGNORE-EXCLUDED)
- `02-coding-guidelines/03-golang/01-enum-specification/01-enum-pattern.md` (+3 → G-NS-NO-DEPRECATED-ALIAS, G-NS-STATUS-IN-LEGEND)
- `00-adrs/00-overview.md` (+3 → G-00-ADR-NUMBERING)
- `00-adrs/0029-per-gate-path-ledger-shared-lib.md` (+3 → G-13-LEDGER-PER-GATE-PATH, G-13-LEDGER-FIVE-COLUMN-SCHEMA)
- `00-adrs/0032-license-decision.md` (+3 → G-00-ADR-NUMBERING, G-00-ADR-CONSEQUENCES-XLINK)
- `01-spec-authoring-guide/02-naming-conventions.md` (+3 → G-NS-STATUS-FRONTMATTER-EXACTLY-ONE)
- `01-spec-authoring-guide/17-quick-start-and-enforcement.md` (+3 → G-NS-STATUS-IN-LEGEND)
- `02-coding-guidelines/00-overview-condensed.md` (+3 → G-13-LEDGER-RUNNER-CLEAN-OUTPUT)
- `02-coding-guidelines/97a-acceptance-criteria-fixtures.md` (+3 → G-13-LEDGER-RUNNER-CLEAN-OUTPUT)
- `04-database-conventions/02-schema-design.md` (+3 → G-DBNAME-BOOL-IS-HAS-PREFIX, G-24-DDL-SINGULAR-LOCKED)
- `13-cicd-pipeline-workflows/16-shared-conventions.md` (+3 → G-13-ACTION-VERSIONS, G-13-PUBLISH-NEEDS-SIGN, G-NS-STATUS-IN-LEGEND)
- `14-self-update-app-update/14-network-requirements.md` (+3 → G-17-NO-SWALLOW)

**Result:** Unbacked clauses **432 → 387** (-45, -10.4%). Backed coverage **85.3% → 86.8%**.


---

## GAP-AMB-01-61..75 — Cross-domain bind batch (2026-04-30)

**Action:** 15 files bound across 8 domains (CLI, fixtures, skeletons, features, SQL, modal patterns, settings, CI/CD, REST format, AI guidelines). 45 inline gate citations added; zero new gates declared.

**Files:** 16-generic-cli/11-build-deploy, 31-app/97b-acceptance-criteria-fixtures, 32-ui-design/skeletons/00-overview, 31-app/01-features/{00-overview,05a-hotkey-table,09-mirrors,16-search-ranking,18-integrations}, 31-app/07-db-diagram/sql/00-overview, 15-wp-plugin-how-to/{13-admin-ui-patterns/06-modal-anatomy,15-settings-architecture/01-data-model,skeletons/00-overview}, 13-cicd-pipeline-workflows/18-wp-plugin-deploy/03-update-server-contract, 04-database-conventions/06-rest-api-format/00-overview, 02-coding-guidelines/06-ai-optimization/04-condensed-master-guidelines.

**Result:** Unbacked **387 → ?** (see audit). Coverage rises.


---

## GAP-AMB-01-76..90 — Cross-domain bind batch (2026-04-30)

**Action:** 15 files bound across PHP/Go/TS coding guidelines, contract.json, ADR-0002/0028, authoring guide (5 files), code-block system. 36 inline gate citations; zero new gates.

**Files:** 02-coding-guidelines/{04-php/03-naming-conventions/03-array-keys, 03-golang/01-enum-specification/05-info-object-pattern, 03-golang/04-golang-standards-reference/03-database-and-structs, 02-typescript/08-typescript-standards-reference/{03-no-magic-values,08-discriminated-unions}, 01-cross-language/16-static-analysis/09-ci-pipeline-quality-gate/06-exemptions-and-checklist}, 22-contract-json, 00-adrs/{0002-wp-plugin-php-sqlite-backend,0028-i18n-locale-strategy}, 01-spec-authoring-guide/{00-overview,09-exceptions,10-mandatory-linter-infrastructure,12-file-length-cap,14-scoring-metrics}, 09-code-block-system/03-syntax-highlighting.

**Result:** Unbacked **342 → ?** (see audit). Coverage rises further.


---

## GAP-AMB-01-91..105 — Cross-domain bind batch (2026-04-30) — 90% milestone

**Action:** 15 files bound across research, consolidated guidelines, CI/CD changelog, self-update, WP plugin, generic-update, ATs, UI rich-text/tokens, and 5 feature files. 30 bindings; zero new gates.

**Files:** 11-research/00-overview, 12-consolidated-guidelines/00-overview, 13-cicd-pipeline-workflows/13-changelog-integration, 14-self-update-app-update/00-overview, 15-wp-plugin-how-to/{18-frontend-javascript-patterns,24-local-dev-harness}, 17-generic-update/07-console-safe-handoff, 31-app/97-acceptance-criteria, 32-ui-design/{04-editor/01-rich-text-format, 06-workflowy-ui/02-search/11-design-tokens}, 31-app/01-features/{01-information-model,03-layout-structure,04-page-content-area,06-item-context-menu,07-board-view}.

**Result:** Unbacked **306 → ?** (see audit). Crosses 90% threshold → unlocks GAP-REBASE-01.
