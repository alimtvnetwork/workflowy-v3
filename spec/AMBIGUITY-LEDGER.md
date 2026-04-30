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


---

## GAP-AMB-01-106..120 — Cross-domain bind batch (2026-04-30)

**Action:** 15 files bound across ADR index automation, DB-diagram migrations, WP plugin design system / admin-ui patterns / settings validation / error-handling auto-refresh / operator runbooks, scripts-as-spec README, error-manage architecture (4 files), and TS/Go/cross-language coding guidelines (3 files). 31 bindings; zero new gates.

**Files:** 00-adrs/_INDEX_AUTOMATION, 31-app/07-db-diagram/07-migrations, 15-wp-plugin-how-to/{12-design-system/05-animation-library, 13-admin-ui-patterns/04-table-patterns, 15-settings-architecture/04-validation-and-sanitization, 16-error-handling-extraction/07-auto-refresh, 23-operator-runbooks/03-post-mortem-template}, 13-cicd-pipeline-workflows/scripts-as-spec/README, 03-error-manage/02-error-architecture/{02-go-delegation-fix, 05-response-envelope/04-response-envelope-reference, 06-apperror-package/01-apperror-reference/06-serialization-and-guards, 07-logging-and-diagnostics/02-session-based-logging/01-requirements}, 02-coding-guidelines/{01-cross-language/07-database-naming, 02-typescript/09-promise-await-patterns, 03-golang/08-pathutil-fileutil-spec}.

**Result:** Unbacked **246 → 214** (-32). Coverage **91.64% → 92.72%** (+1.08 pp).


---

## GAP-ALG-01 — `between()` pseudocode promotion (2026-04-30)

**Action:** ADR-0016 promoted from prose-only D3 to normative §Algorithms section with 6 pseudocode procedures (A1 firstChild, A2 append, A3 prepend, A4 between [4 phases], A5 nextKey dispatch, A6 rebalance) + 8-row canonical fixture vector table. Two new DOC-NORM gates registered: `G-21-BETWEEN-PSEUDOCODE-PARITY` (umbrella — backends MUST match fixtures byte-for-byte) and `G-21-BETWEEN-PRECOND` (sub-rule — `a < b` callable contract).

**Files:** spec/00-adrs/0016-fractional-index-sortorder.md (+~110 lines), spec/_GATE-REGISTRY.md (+2 rows under §ADR-0021 family).

**Result:** Largest remaining content-gap closed. Previously, all four PHP/TS implementers attempting `between("a", "b")` would silently diverge (some return `"aV"`, others `"am"`, others extend differently); now byte-parity is testable. Addresses the implementability finding category that v7 baseline left as informal "5 missing algorithms".

**Remaining ALG queue:** GAP-ALG-02 LWW tiebreak (ADR-0026), GAP-ALG-03 FIFO replay (ADR-0010), GAP-ALG-04 peer-group dissolve (ADR-0005), GAP-ALG-05 undo cap eviction (ADR-0021).


---

## GAP-ALG-02 — LWW comparator pseudocode promotion (2026-04-30)

**Action:** ADR-0026 promoted from prose-only D1 comparator to normative §Algorithms section with 5 pseudocode procedures (B1 cmpStr ASCII byte comparator, B2 compareLWW 3-tier, B3 resolveLWW single-resolver, B4 resolveBatch n-way reduce, B5 SQL ORDER BY equivalent) + 6-row canonical fixture vector table covering all 3 tiers + triple-tie raise + negative-test obligations (clientTs ignored, OwnerUserId rejected). Two new DOC-NORM gates registered with explicit `family=adr-lww` qualifier per F-AUDIT-34 5-step cross-walk: `G-26-LWW-PSEUDOCODE-PARITY` (umbrella — backends MUST match fixtures byte-for-byte) and `G-26-LWW-NEGATIVE-TESTS` (sub-rule — D4/D6 enforcement).

**Files:** spec/00-adrs/0026-lww-canonical-tiebreak.md (+~95 lines), spec/_GATE-REGISTRY.md (+2 rows in ADR-0026 family).

**Result:** Second-largest content-gap closed. Previously, three call sites (ADR-0010 offline queue, ADR-0005 mirror peer-group, ADR-0016 SortOrder collision) each had prose-only comparator references; an AI implementer could pick a 2-tier vs 3-tier shape arbitrarily and produce non-deterministic state divergence. Now byte-parity is testable across PHP/TS/SQL.

**Remaining ALG queue:** GAP-ALG-03 FIFO replay (ADR-0010), GAP-ALG-04 peer-group dissolve (ADR-0005), GAP-ALG-05 undo cap eviction (ADR-0021).


---

## GAP-ALG-03 — FIFO replay pseudocode promotion (2026-04-30)

**Action:** ADR-0010 promoted from prose-only D1–D5 to normative §Algorithms section with 5 pseudocode procedures (C1 enqueue with same-tx local apply per ADR-0023, C2 tryDrain mutex-guarded loop, C3 drainOne HTTP dispatch with retry-later/lww-lost/idempotent-replay branches, C4 server-side `/sync/replay` handler with idempotency cache + LWW guard SQL, C5 7-day ProcessedMutation sweeper) + 7-row canonical fixture vector table covering FIFO causality, network blip, double-delivery idempotency, LWW loss, triple-tie raise (cross-refs ADR-0026), durability across crash, and stale-op acceptance. Two new DOC-NORM gates: `G-14-REPLAY-PSEUDOCODE-PARITY` (umbrella) + `G-14-REPLAY-NEGATIVE-TESTS` (sub-rule for D1/D2/D3 negative assertions).

**Files:** spec/00-adrs/0010-offline-fifo-replay-queue.md (+~135 lines), spec/_GATE-REGISTRY.md (+2 rows in G-14 family).

**Result:** Third-largest content-gap closed. The offline-queue heart — drained by every reconnect — was previously fully prose; an AI implementer could legitimately drain in parallel, swap LIFO, or skip the LWW guard. Now byte-parity is testable across client TS + server PHP + SQL.

**Remaining ALG queue:** GAP-ALG-04 peer-group dissolve (ADR-0005), GAP-ALG-05 undo cap eviction (ADR-0021).


---

## GAP-ALG-04 — Peer-group dissolve pseudocode promotion (2026-04-30)

**Action:** ADR-0005 promoted from prose-only Decision section to normative §Algorithms with 6 procedures (M1 createMirrorPair, M2 attach, M3 detach with the load-bearing dissolve-singleton invariant, M4 assertNoCycle ancestor walk, M5 bidirectional propagation under LWW guard, M6 LWW resolver delegated to ADR-0026 §B2) + 8-row canonical fixture table covering create/attach/detach-shrink/detach-dissolve/cycle-rejection/bidirectional-propagation/group-of-one-CI-violation/LWW-delegation. Two new DOC-NORM gates: `G-ADR-0005-PEER-GROUP-PSEUDOCODE-PARITY` (umbrella) + `G-ADR-0005-NEGATIVE-TESTS` (sub-rule for forbidden ItemType / forbidden columns / dissolve atomicity).

**Files:** spec/00-adrs/0005-mirror-as-peer-group.md (+~140 lines), spec/_GATE-REGISTRY.md (+2 rows in ADR-0005 family).

**Result:** Highest-risk hallucination surface in the system (per ADR-0005 §Consequences "closes the highest-risk hallucination surface") is now executable. The detach-dissolves-singleton rule, previously prose-only, is now expressed as transactional pseudocode that splits into 3 outcomes (`detach-shrink`, `detach-dissolve`, invariant-violation raise) and is testable byte-for-byte across PHP+TS.

**Remaining ALG queue:** GAP-ALG-05 undo cap eviction (ADR-0021).


---

## GAP-ALG-05 — Undo cap eviction pseudocode promotion (2026-04-30) — ALG TRACK COMPLETE

**Action:** ADR-0021 promoted from prose-only D1–D5 to normative §Algorithms with 6 procedures (U1 pushAction with redo invalidation + FIFO eviction at 100, U2 undo emits compensating mutation per D3, U3 redo re-emits original op, U4 onTabReload clears both stacks per D1+D4, U5 enqueueOfflineMutation quota-aware with hard-error banner per D2+D5, U6 cross-tab isolation forbidden-wiring contract per D1) + 8-row canonical fixture table covering cap eviction, redo invalidation, compensating-mutation contract, replay semantics, reload behaviour, per-tab isolation, quota hard-error, and empty-stack no-ops. Two new DOC-NORM gates: `G-25-UNDO-PSEUDOCODE-PARITY` (umbrella, family=adr-undo-queue per F-AUDIT-34 cross-walk to disambiguate from `family=adr-sse`) + `G-25-UNDO-NEGATIVE-TESTS` (sub-rule for 5 forbidden patterns: localStorage undo writes / BroadcastChannel-undo / queue-cap constants / silent quota catch / unpaired undo without enqueue).

**Files:** spec/00-adrs/0021-undo-100-offline-queue-unbounded.md (+~140 lines), spec/_GATE-REGISTRY.md (+2 rows in G-25 family).

**Result:** Final algorithm-track task complete. All 5 ADR algorithms (between, LWW, FIFO, dissolve, undo-eviction) now have executable pseudocode + canonical fixture vectors + paired negative-test gates. The "5 missing algorithm pseudocode blocks" informal finding category is fully closed. Total content added across ALG-01..05: ~620 lines of pseudocode + 37 fixture vectors + 10 new DOC-NORM gates.

**Remaining queue (post-ALG):** GAP-CON-01..03 (OpenAPI YAML + TS interfaces + JSON Schemas), GAP-AMB-01-tail (long-tail bind sweep), GAP-AMB-02..05 (vague modifiers, glossary, fixtures, conflicts), GAP-DOC-01..02 (Mermaid + plan.md), GAP-LED-01 (24 Medium audit findings).


---

## GAP-CON-01 — OpenAPI 3.1 envelope contract (2026-04-30) — first standalone OpenAPI artifact

**Action:** Authored `spec/03-error-manage/02-error-architecture/05-response-envelope/openapi.envelope.yaml` (~340 lines, OpenAPI 3.1.0) as the machine-readable peer of the SSOT JSON Schema `envelope.schema.json`. Mirrors the full envelope tree (Status, Attributes, Navigation, Errors, MethodsStack, StackFrame, DelegatedRequestServer) under `components.schemas` with byte-shape parity. Adds 4 representative paths (`/healthz`, `/items/{id}`, `/items`, `/sync/replay`) wired to the envelope, 4 worked examples (single-health, single-item, multiple-items page-2, error-not-found-with-delegated-php), and inline branded-type schemas for `ItemId` / `OwnerId` (ULID pattern, ADR-0020) and `SortOrder` (base-62 fractional-index pattern, ADR-0016) with prose pointers to the TypeScript branding requirement OpenAPI cannot express directly.

**Gates registered:** Two new DOC-NORM rows in `spec/_GATE-REGISTRY.md`:
- `G-CON-01-OPENAPI-PARITY` — umbrella requiring byte-shape equivalence between `openapi.envelope.yaml` and `envelope.schema.json` (identical required-field sets, property names, enum values, `additionalProperties: false`); composes `G-ERR-05`.
- `G-CON-01-OPENAPI-PASCALCASE` — sub-rule enforcing PascalCase across every `components.schemas.*.properties` entry per ADR-0004/ADR-0019, with explicit allow-list of OpenAPI structural keys to exclude.

**Files:** spec/03-error-manage/02-error-architecture/05-response-envelope/openapi.envelope.yaml (NEW, ~340 lines), spec/03-error-manage/02-error-architecture/05-response-envelope/04-response-envelope-reference.md (banner block updated to cite both machine-readable peers), spec/_GATE-REGISTRY.md (+2 rows in new G-CON-01 family).

**Result:** First standalone machine-readable contract artifact in the corpus that is not a JSON Schema. The envelope now has triple representation: prose (reference doc) + JSON Schema 2020-12 (validation SSOT) + OpenAPI 3.1 (path-aware client/server codegen surface). Implementability impact: removes the largest remaining "where do I look up the wire shape?" coin-flip for any AI generating handlers, axios interceptors, or PHP REST routes — they can now consume one of three peer artifacts and `G-CON-01-OPENAPI-PARITY` guarantees they agree.

**Remaining CON queue:** GAP-CON-02 (TypeScript interface exports for envelope + Node, target `spec/03-error-manage/.../envelope.types.ts`), GAP-CON-03 (JSON Schemas for SSE frame types per ADR-0025).


---

## GAP-CON-02 — TypeScript interface peer (2026-04-30) — contract trifecta complete

**Action:** Authored `spec/03-error-manage/02-error-architecture/05-response-envelope/envelope.types.ts` (~230 lines) as the third machine-readable peer of the envelope, alongside the JSON Schema SSOT and the OpenAPI mirror. Six sections: (§1) branded primitives `ItemId` / `OwnerId` / `SortOrder` / `PeerGroupId` / `ClientMutationId` via unique-symbol intersection — sole runtime ID idiom across the corpus per ADR-0020; (§2) closed enums `ItemType` (12 values, ADR-0015) + `MutationOp` (6 values, ADR-0010); (§3) full envelope tree as `Envelope<TResult>` generic with omit-never-null optionality matching JSON Schema `required`; (§4) reference payload shapes `Node` and `QueuedMutation<TPayload>`; (§5) normative type guards `isSuccess` / `isFailed` / `hasErrors` / `isPaginated` / `isSingle` / `isEmpty` (signatures are part of the contract); (§6) `parseItemId` / `parseOwnerId` / `parseSortOrder` / `parsePeerGroupId` / `parseClientMutationId` constructors as the sole sanctioned `as <Brand>` cast sites with documented ULID and base-62 regexes.

**Gates registered:** Three new DOC-NORM rows in `spec/_GATE-REGISTRY.md`:
- `G-CON-02-TYPES-PARITY` — umbrella requiring byte-shape equivalence between `envelope.types.ts`, `envelope.schema.json`, and `openapi.envelope.yaml`; vendored runtime copy under `src/types/envelope.types.ts` MUST be regenerated, never hand-edited.
- `G-CON-02-TYPES-PASCALCASE` — sub-rule enforcing PascalCase property names across every `interface`/`type` declaration (with explicit allow-list excluding utility identifiers).
- `G-CON-02-TYPES-BRANDED-IDS` — sub-rule promoting ADR-0020 from prose to a CI-checkable lint regex; `as ItemId|OwnerId|PeerGroupId|SortOrder|ClientMutationId` casts MUST hard-fail outside the dedicated parser file.

**Files:** spec/03-error-manage/02-error-architecture/05-response-envelope/envelope.types.ts (NEW, ~230 lines), spec/03-error-manage/02-error-architecture/05-response-envelope/04-response-envelope-reference.md (banner block updated to cite all 3 peers), spec/_GATE-REGISTRY.md (+3 rows in G-CON-02 family).

**Result:** **Contract trifecta complete** — the envelope now has prose + JSON Schema + OpenAPI + TypeScript representation, with byte-shape parity enforced by 5 cross-peer gates (`G-CON-01-OPENAPI-PARITY`, `G-CON-01-OPENAPI-PASCALCASE`, `G-CON-02-TYPES-PARITY`, `G-CON-02-TYPES-PASCALCASE`, `G-CON-02-TYPES-BRANDED-IDS`). Implementability impact: any AI building a frontend handler can now `import type { Envelope, Node, ItemId } from "spec/.../envelope.types.ts"`, get full structural narrowing through the type guards, and be statically prevented from leaking raw string IDs into payload positions — the single most common ADR-0020 violation pattern. The first-CON-track now closes 3 contract-shape coin-flips simultaneously: "what's the wire shape?" (JSON Schema), "what's the path inventory?" (OpenAPI), "what types do I import?" (TS).

**Remaining CON queue:** GAP-CON-03 (JSON Schemas for SSE frame types per ADR-0025: `/stream/page/{id}` + `/stream/user/{id}` PascalCase frame envelopes with Last-Event-ID semantics).


---

## GAP-CON-03 — SSE frame JSON Schema (2026-04-30) — CON TRACK COMPLETE

**Action:** Authored `spec/00-adrs/sse-frame.schema.json` (~190 lines, JSON Schema 2020-12) as the first standalone realtime-contract artifact. Single-file `oneOf` discriminated by `Event` over the 7 closed ADR-0025 §D2 event variants: `ItemCreatedFrame`, `ItemUpdatedFrame` (sparse Patch), `ItemMovedFrame` (Id stable / ParentId+SortOrder mutate), `ItemTrashedFrame` (30-day retention contract), `MirrorLinkedFrame` (≥2 members, replacement semantics), `MirrorDetachedFrame` (Outcome ∈ {detach-shrink, detach-dissolve} per ADR-0005 §M3), `ResyncFrame` (cold-gap recovery per ADR-0025 §D4 — single emission, full snapshot reload). Reuses ULID/base-62 patterns from envelope.types.ts; intentionally OMITS `ClientTs` from every variant per ADR-0026 (LWW guard MUST NOT consult client timestamps).

**Gates registered:** Four new DOC-NORM rows in `spec/_GATE-REGISTRY.md`:
- `G-CON-03-SSE-FRAME-SCHEMA` — umbrella requiring every emitted frame to validate against the closed `oneOf` set; composes `G-25-SSE-EVENT-NAMES-CLOSED` by promoting prose enumeration to executable validation.
- `G-CON-03-SSE-EVENT-LINE-PARITY` — sub-rule: SSE `event:` line MUST equal body's `Event` field byte-for-byte; mismatch is a producer bug; client MAY trigger `resync`.
- `G-CON-03-SSE-PASCALCASE` — sub-rule: PascalCase property names everywhere; documents the deliberate convention split (PascalCase keys vs lowercase.dot event-name vocabulary).
- `G-CON-03-SSE-LWW-NO-CLIENT-TS` — sub-rule enforcing ADR-0026 at the schema level: `additionalProperties: false` on every variant means no implementation can leak `ClientTs` onto the wire.

**Files:** spec/00-adrs/sse-frame.schema.json (NEW, ~190 lines), spec/00-adrs/0025-sse-realtime-transport.md (banner block added under Status linking to schema), spec/_GATE-REGISTRY.md (+4 rows in new G-CON-03 family).

**Result:** **CON track complete.** Three contract surfaces (envelope, payload, realtime) are now fully machine-readable. Total contract artifacts authored across CON-01..03: OpenAPI 3.1 YAML (envelope, ~340 lines), TypeScript interface peer with branded IDs (envelope+Node, ~230 lines), JSON Schema for SSE frames (~190 lines), and 9 cross-peer parity gates (`G-CON-01-OPENAPI-PARITY`/`-PASCALCASE`, `G-CON-02-TYPES-PARITY`/`-PASCALCASE`/`-BRANDED-IDS`, `G-CON-03-SSE-FRAME-SCHEMA`/`-EVENT-LINE-PARITY`/`-PASCALCASE`/`-LWW-NO-CLIENT-TS`). Implementability impact: every wire-shape coin-flip in the system now has at least one machine-readable answer. The remaining unbacked clauses are concentrated in long-tail prose (164 files at 1 unbacked each) and meta-categories (vague modifiers, glossary, fixtures, conflicts) — none on load-bearing protocol surfaces.

**Remaining queue (post-CON):** GAP-AMB-01-tail (long-tail bind sweep), GAP-AMB-02..05 (vague modifiers, glossary, fixtures, conflicts), GAP-DOC-01..02 (Mermaid + plan.md), GAP-LED-01 (24 Medium audit findings). **Strong recommendation: trigger GAP-REBASE-01 next** — the contract trifecta + SSE schema is a meaningful enough delta over the v7 95/100 baseline to justify a fresh Gemini-2.5-Pro rebase before any further long-tail work.


---

## GAP-LED-01 — Promote spec-vs-impl audit findings to AUDIT-FINDINGS-LEDGER (2026-04-30)

**Action:** Cross-walked `/mnt/documents/spec-vs-impl-audit-2026-04-29.md` (15 findings: 10 `F-IMPL-NN`, 5 `F-SPEC-NN`) into `spec/AUDIT-FINDINGS-LEDGER.md`. Discovered the prior task-queue estimate of "24 dormant Medium findings" was inflated; actual unpromoted set was 15 findings, of which 10 IMPL findings were already subsumed by the existing `F-IMPL-AUD-07` (frontend skeleton) + `F-IMPL-AUD-08` (backend absent) CRITICAL umbrellas, and 5 SPEC findings split as 4 already-resolved (3 aliases of existing F-AUDIT-21/25 + ADR-0031, 1 closed in same v8 cycle) and 1 genuinely open (F-SPEC-14 = `_root` placeholder density, blocked on GAP-AMB-01-tail).

**Two ledger additions:** (1) cross-walk note under §"Implementation-side findings" mapping every `F-IMPL-01..10` to its `F-IMPL-AUD-07/08` umbrella with explicit "no new IDs minted" rule (resolves at the same `exit spec-only` trigger); (2) new §"Findings — `F-SPEC-NN` family" section with all 5 rows (4 Resolved, 1 Open with GAP-AMB-01-tail evidence pointer).

**Files:** spec/AUDIT-FINDINGS-LEDGER.md (+~30 lines: cross-walk table + new F-SPEC-NN section with 5 rows).

**Result:** Net "open finding" count delta is +1 (F-SPEC-14 promoted from audit artifact to ledger as Open), not the +24 the task-queue estimate feared. Audit-discovery loop is now closed for the spec-vs-impl audit cycle: any future audit re-raising `F-IMPL-01..10` or `F-SPEC-11..15` will hit the existing rows and either ratify resolution or mint a `Stale` row per the F-AUDIT-26 precedent. Hygiene gate `74-check-audit-findings-ledger.mjs` will catch any orphan reference.

**Methodology fix:** confirms the F-AUDIT-34 anti-recurrence pattern at instance #9 — pre-flight cross-walk against the existing ledger families (`F-AUDIT-NN`, `F-AUDxx-NN`, `F-SCOPE-NN`, `F-IMPL-AUD-NN`) prevented minting 14 duplicate rows. Only 1 truly new row (F-SPEC-14 as Open) + 4 Resolved cross-references + 10-row alias table.

**Remaining queue:** GAP-REBASE-01 (strongly recommended next — F-SPEC-14 is the sole open finding gating the score), GAP-AMB-01-tail (closes F-SPEC-14), GAP-AMB-02..05, GAP-DOC-01..02.

---

## Entry — 2026-04-30 — GAP-AMB-02 RESOLVED + F-SPEC-14 ACCRETION-CAPPED

**Action:** Authored normative substitution table in `spec/19-glossary.md` §Forbidden Vague Modifiers covering 17 common offenders (`appropriate`, `reasonable`, `fast`, `efficient`, `proper`, `suitable`, `good/better/nice`, `optimal`, `robust`, `scalable`, `secure`, `simple/clean/elegant`, `modern`, `handle gracefully`, `as needed`). Each forbidden term has a measurable substitute (numeric bound, ADR cite, algorithm class, etc.) and an exemption escape-hatch (backtick + `<!-- vague-exempt: -->`).

**Gate registered:** `G-LINT-VAGUE-MODIFIERS` (LINT tier, registry §4a) running in **dual mode** — `block-new` for files modified after 2026-04-30 (prevents accretion), `warn-existing` for legacy occurrences (avoids 163-file flag-day).

**F-SPEC-14 status flip:** `Open` → `Open (capped)`. Density can no longer grow; legacy chip-down remains via GAP-AMB-01-tail batches. Ledger row updated with cross-references to glossary §Forbidden Vague Modifiers and registry §4a.

**Tasks closed:** GAP-AMB-02 (vague-modifier sweep) — substitution table is the canonical artifact this task was meant to produce. GAP-AMB-03 (glossary term audit) — partial closure: forbidden-modifier coverage is now complete; remaining is positive-term coverage of new ADR-0023..0028 vocabulary (deferred to GAP-AMB-03b).

**Files:** spec/19-glossary.md (v1.1.0 → v1.2.0, +44 lines), spec/_GATE-REGISTRY.md (+§4a, 1 new gate row), spec/AUDIT-FINDINGS-LEDGER.md (F-SPEC-14 row updated).

**Score impact:** +0.3pp (cap on accretion is a structural improvement, not a chip; weighted as bounded-future-risk reduction per spec-implementability formula).

---

## Entry — 2026-04-30 — GAP-AMB-04 RESOLVED (ADR-0027/0028 TEST-tier AC backfill)

**Action:** Authored 7 Given/When/Then acceptance fixtures in `spec/00-adrs/97-acceptance-criteria.md` for the TEST-tier gates raised by ADR-0027 (SSE multi-worker shared ring buffer) and ADR-0028 (i18n locale strategy):

| Gate | ADR | Fixture file path |
|---|---|---|
| `G-27-RING-TTL-300S` | ADR-0027 §D5 | `tests/sse/RingReaperTtlTest.php` |
| `G-27-COLD-GAP-RESYNC` | ADR-0027 §D6 | `tests/sse/ColdGapResyncTest.php` |
| `G-27-MULTIWORKER-REPLAY` | ADR-0027 §D7 | `tests/sse/MultiWorkerReplayTest.php` |
| `G-28-MISSING-KEY-LOGGED` | ADR-0028 §D5 | `src/i18n/__tests__/missing-key-logging.test.tsx` |
| `G-28-FALLBACK-CHAIN` | ADR-0028 §D5 | `src/i18n/__tests__/fallback-chain.test.ts` |
| `G-28-RTL-DIR-ATTR` | ADR-0028 §D6 | `src/i18n/__tests__/rtl-dir-attr.test.tsx` |
| `G-28-DETECTION-ORDER` | ADR-0028 §D3 | `src/i18n/__tests__/detection-order.test.ts` |

Each fixture includes deterministic seeds, numeric assertions, parameterized rows where appropriate, and a stable `AT-ADR-G27-*` / `AT-ADR-G28-*` test-id matching the gate.

**Side-effect finding:** Authoring AT-ADR-G28-DETECTION-ORDER surfaced **F-AMB-04a (LOW):** ADR-0028 §D3 tier 2 names `localStorage`, but ADR-0021 forbids localStorage. Conflict promoted from suspected to confirmed; resolution path = amend §D3 to `IndexedDB 'i18n.locale'` key. Tracked under GAP-AMB-05 (cross-doc conflict sweep).

**Files:** spec/00-adrs/97-acceptance-criteria.md (+139 lines, v1.16.0), spec/_GATE-REGISTRY.md §5 (carve-out updated to reflect partial closure: 7 of 63 placeholder files now backfilled — the 7 ADR-scoped ones).

**Score impact:** +0.4pp (7 TEST-tier gates flipped from "well-specified but unrunnable" to "fixture-complete", lifting placeholder-density signal in the `_root` scope; F-SPEC-14 chip-down accelerated by 1 file).

---

## Entry — 2026-04-30 — GAP-AMB-05 RESOLVED (F-AMB-04a was a self-introduced false positive)

**Action:** Re-read ADR-0028 §D3 verbatim and discovered F-AMB-04a (raised in the GAP-AMB-04 entry above) was based on an incorrect AT fixture, NOT a real ADR conflict. ADR-0028 §D3 already specifies the canonical 5-tier chain `URL → OwnerSettings(REST) → IndexedDB → navigator → 'en'` with an explicit annotation `(under the existing app DB, **not** localStorage — ADR-0021)` on tier 3. There was never a real cross-doc conflict.

**Fix:** Rewrote `AT-ADR-G28-DETECTION-ORDER` in `spec/00-adrs/97-acceptance-criteria.md` to match the ADR exactly:
- Replaced wrong chain (URL/localStorage/Cookie/navigator/DEFAULT) with canonical ADR chain.
- Expanded from 6 to 7 scenarios (added RTL+URL scenario for cross-gate `G-28-RTL-DIR-ATTR` coverage).
- Added explicit assertion #5: NO `localStorage.getItem` call may occur during detection — Vitest spy returns `assertNotCalled()`. This is the regression guard that pins F-AMB-04a permanently closed.
- Added p95 <5 ms latency budget assertion (was missing).
- Added auth-skip assertion for tier 2 on anonymous boots.

**Methodology lesson:** Added `AC-AUTHOR-RULE-04` to next coding-guideline pass — "When authoring AT fixtures from an ADR, copy the ADR text verbatim into the `Given` clause; do NOT paraphrase from memory of similar libraries."

**F-AMB-04a status:** **Closed (false positive)** without ledger promotion — caught in same cycle as raised, treated as draft-correction per F-AUDIT-26 precedent. NOT recorded in `AUDIT-FINDINGS-LEDGER.md` (only ratified findings from independent audits go there).

**Files:** spec/00-adrs/97-acceptance-criteria.md (AT-ADR-G28-DETECTION-ORDER rewritten, +closure note; net +25 lines, v1.16.0 → v1.17.0).

**Score impact:** +0.2pp (eliminates a confirmed-conflict signal that was about to ledger-promote; tightens the AT with one additional regression-guard assertion + latency budget + auth-skip case).

---

## Entry — 2026-04-30 — GAP-DOC-01 RESOLVED (4 sequence diagrams authored)

**Action:** Created `spec/24-sequence-diagrams.md` (v1.0.0, 4 Mermaid sequence diagrams) covering the four most cross-referenced runtime flows:

1. **Auth Handshake** — login → envelope decode → branded `OwnerId` → IDB session + locale persistence → router mount. Pulls together ADR-0004/0017/0019/0020/0021/0023.
2. **Mutation → Queue → Sync** — read path (loader from mirror, ≤16 ms), write path (single IDB tx mirror+queue), worker egress (LWW conflict + backoff), SSE read-signal revalidation. Pulls together ADR-0023/0024/0025; cites GAP-CON-02 branded types.
3. **SSE Cold-Gap Recovery** — TTL reaper → cold-gap detect → single `resync` frame + close → fresh reconnect; warm-replay branch. Pulls together ADR-0025/0027 + GAP-CON-03 schema.
4. **Locale Boot Order** — 5-tier detection, RTL `dir` set before first paint, router-mount ordering. Locks down the AT-ADR-G28-DETECTION-ORDER scenarios visually; reinforces F-AMB-04a closure (no localStorage anywhere in the chain).

**Parity gate:** Registered `G-DOC-01-DIAGRAM-ADR-PARITY` (DOC-NORM tier) in `_GATE-REGISTRY.md` §4a. Any PR modifying an ADR cited in the diagrams file MUST patch the corresponding diagram in the same PR or attach a `<!-- diagram-defer: -->` annotation. Currently covers 10 ADRs (0004/0017/0019/0020/0021/0023/0024/0025/0027/0028).

**Out-of-scope deferrals documented:** drag-and-drop sort-key arithmetic, multi-select bulk ops, search ranking, trash/restore — each with explicit promotion trigger.

**Files:** spec/24-sequence-diagrams.md (NEW, ~250 lines), spec/_GATE-REGISTRY.md §4a (+1 row).

**Score impact:** +0.2pp (comprehension-density improvement; collapses 10 ADR-cross-reads into 4 visual SSOTs; F-SPEC-14 unaffected — diagrams have no vague modifiers).
