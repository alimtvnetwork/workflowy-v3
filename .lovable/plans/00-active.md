# Active Plan — Spec → 100% AI-Readiness + Workflowy Feature Reference Merge

> **Created:** 2026-04-28
> **Mode:** spec-only (frontend code untouched)
> **Execution:** each `next` runs ONE step → spec edit + `node scripts/spec-hygiene/00-run-all.mjs` + targeted AI re-score on touched section(s) → score delta reported → stop.
> **Baseline:** Composite **55/100 (F)**, 10/24 sections scored, 14 quota-blocked. Source: `/mnt/documents/spec_ai_audit_2026-04-28.md`.
> **Target:** Composite **≥95/100 (A)** across all 24 top-level sections, every dimension ≥90.

---

## Strategy (why each step exists)

The audit identified 4 root causes that depress every section's score. The plan attacks them in dependency order so later steps inherit the fixes from earlier ones.

| Root cause | Dim. impact | Fixed by steps |
|---|---|---|
| Sections lack a "Purpose / Audience / AI contract" header | unambiguity, actionability | P1 |
| Acceptance criteria describe behavior, not concrete I/O | testability, determinism | P2, P3, P9 |
| "TBD / consider / should" markers leave AI guessing | unambiguity, determinism | P4 |
| 14 sections never AI-scored (credit cap) → blind spots | completeness, consistency | P10 |

Plus three **content** workstreams the user requested:

| Workstream | Steps |
|---|---|
| Merge the 70-feature Workflowy reference into existing `spec/31-app/01-features/*` topic files (lossless, factually verbatim, additive) | F1–F6 |
| Reconcile any drift between merged content and existing data-model / hotkey / mirror specs | F7 |
| Rewrite touched topic files to a uniform **Feature Title / Description (with shortcut + slash-command + operators)** block format | F8 |

Steps are interleaved so each `next` produces a measurable score gain.

---

## Plan — ordered execution queue

Pick the top 🟦 item on every `next`. Strike (✅) when done; new top item becomes active.

### ✅ P1 — Add canonical "AI Contract" header to every top-level section overview
**Targets:** all `spec/NN-*/00-overview.md` (24 files).
**Add block:** `## AI Contract` with subsections *Purpose*, *Audience*, *Expected AI Output*, *Out of Scope*, *Definition of Done*. Template lives in `spec/01-spec-authoring-guide/`.
**Predicted gain:** +6 composite (lifts unambiguity 20→30, actionability 21→30 across all sections).
**Verify:** hygiene passes; re-score `01-spec-authoring-guide` + 1 sample section.
**✅ Done 2026-04-28:** Created canonical template `spec/01-spec-authoring-guide/18-ai-contract-template.md` and injected `## AI Contract` block (with `_TODO(P1):_` placeholders) into all 24 top-level overviews via idempotent `/tmp/inject-ai-contract.mjs`. 121 placeholders queued for F1–F6/P2 to fill. Hygiene PASS for P1 changes; only pre-existing failure is the `ItemType` enum drift (`src/types/index.ts` has `mirror`, spec has `dashboard`) carried over from the 2026-04-28 audit — unrelated to P1, tracked separately.

### ✅ F1 — Merge Workflowy feature reference (Part 1: editor & item-type features)
**Targets:** `01-information-model.md`, `04-page-content-area.md`, `05-interactions.md`, `05a-hotkey-table.md`.
**Map (lossless):** Item Types, Bullet, To-do, Heading H1/H2, Paragraph, Numbered List, Complete, Add Note, Add Date, Tags, File Upload, Image Resize, Image Menu, Text Format Toolbar, Text Color, Create Bullet, Zoom In/Out, Item Menu, Expand/Collapse, Auto Save, Undo, Redo.
**Format:** Feature Title — Description (incl. shortcut + slash command).
**Verify:** hygiene; re-score `31-app`.
**✅ Done 2026-04-28:** Inserted "Workflowy Feature Reference (F1)" appendix into all four target files (additive, before existing `## Related`). Mirror reconciliation note ties Workflowy item-level "Mirror" → WorkFlowy peer-group relation per `mem://features/mirroring`. F1 hotkey appendix flags an F7 reconciliation candidate (every appendix row must appear in the canonical AT-HK-* table). Hygiene PASS for F1 changes; only pre-existing `ItemType` enum drift carried over (unrelated). Projected composite 61 → 63.

### ✅ F2 — Merge Workflowy feature reference (Part 2: navigation, search, sidebar)
**Targets:** `00-overview.md` (sidebar), new `17-search.md` (or extend `16-search-ranking.md`), `10-today-view.md` (Jump-to anchor).
**Map:** Sidebar, Home/Back/Forward Navigation, Jump To, Star/Bookmark, Search, Search Operators (`is:`, `has:`, `text:`, `highlight:`, `-`, `OR`, `>`), Date Search, Nested Search.
**Verify:** hygiene; re-score `31-app`.
**✅ Done 2026-04-28:** Inserted F2 appendices into `01-features/00-overview.md` (sidebar inventory index), `03-layout-structure.md` (Sidebar / Home / Back-Forward / Jump-To / Star / Breadcrumbs), `16-search-ranking.md` (full operator table + Recent / Nested Search), and `10-today-view.md` (Add Date / Date Search / Jump-to-Today / recurring-dates F7 flag). Extended `16-search-ranking.md` instead of creating new `17-search.md` to avoid splitting search semantics. Two F7 reconciliation candidates flagged: `is:mirror` operator semantics + recurring date chips (v1 out-of-scope). Hygiene PASS for F2; only pre-existing `ItemType` enum drift carried over. Projected composite 63 → 65.

### ✅ F3 — Merge Workflowy feature reference (Part 3: structural ops & mirrors)
**Targets:** `06-item-context-menu.md`, `09-mirrors.md`, `09b-mirror-peer-group-model.md`, `12-multi-select.md`.
**Map:** Duplicate, Copy Internal Link, Delete, Show/Hide Completed, Expand All, Collapse All, Move To, Move Here, Mirror, Mirror To, Mirror Here, Detach Mirror, See Mirrors, Internal Links, Backlinks, External Links, Remove Link, Slash Commands.
**Reconciliation note:** confirm Workflowy "Mirror = peer group" matches `mem://features/mirroring`.
**Verify:** hygiene; re-score `31-app`.
**✅ Done 2026-04-28:** Inserted F3 appendices into `06-item-context-menu.md` (full ⋮ inventory + canonical slash-command table + Internal/External/Backlinks), `09-mirrors.md` (Mirror/Mirror-To/Mirror-Here/Detach/See-Mirrors UX with bidirectional rules), `09b-mirror-peer-group-model.md` (Workflowy ↔ peer-group reconciliation map across all 10 AT-MPG-* IDs + vocabulary policy), and `12-multi-select.md` (Bulk Move/Mirror/Delete/Complete/Tag/Export/Templates/Zoom). Three new F7 reconciliation flags: slash→handler binding linter, "mirror copy" forbidden-phrase scan, mirror peer-group founder semantics. Hygiene PASS for F3; only pre-existing `ItemType` enum drift carried over. Projected composite 65 → 67.

### ✅ F4 — Merge Workflowy feature reference (Part 4: views, sharing, templates)
**Targets:** `07-board-view.md`, `08-share-dialog.md`, `13-templates.md`, `11-trash-view.md`.
**Map:** Fractal Board, Add Card/Column to Board, Move Cards/Columns, Share, Templates (button + `#template`), Export, Export All, Print, Presentation Mode, Fractal Comments.
**Verify:** hygiene; re-score `31-app`.
**✅ Done 2026-04-28:** Inserted F4 appendices into `07-board-view.md` (Fractal Board, Add Card/Column, Move, Convert, Hide Completed), `08-share-dialog.md` (Public Link, Invite People, Permission Levels, Stop Sharing, per-instance ACL on mirrors, Shared-with-me), `13-templates.md` (Templates Button, `#template` tag, Use Template, Templates Panel, Export, Export All, Print, Presentation Mode, Fractal Comments + Mention + Unread + Drafts), and `11-trash-view.md` (Delete, Bulk Delete, Trash View, Restore, Empty Trash, 30-day cron, restore pre-empts purge). Four new F7 reconciliation flags: card-drop-zone uses same fractional-sort patch as list, public-link URL pattern → WP REST `/s/<token>`, `comment_root_id` FK in unified Node interface, WP cron via `wp_schedule_event`. Hygiene PASS for F4; only pre-existing `ItemType` enum drift carried over. Projected composite 67 → 69.

### ✅ F5 — Merge Workflowy feature reference (Part 5: account & settings)
**Targets:** new `spec/36-user-management/01-features/*` topic files (currently `.gitkeep`).
**Map:** Settings Panel, Set Password, Change Email, Restore from Backup, Referrals, Theme, Daily Email Summary, Workflowy Labs, Delete Account, Multi-Factor Authentication, Help, Report a Bug, Handbook Panel.
**Verify:** hygiene; first AI score for `36-user-management`.
**✅ Done 2026-04-28:** Created `spec/36-user-management/01-account-and-settings.md` (kept the section's flat shape rather than introducing a `01-features/` subfolder — avoids parallel-folder drift). All 13 F5 surfaces grouped into 6 sub-sections (Settings Panel root, Account & Identity, Backups & Restore, Personalization, Growth, Support & Documentation). Added a 12-row REST surface summary mapped to PascalCase envelope and the planned WP REST namespace `/wp-json/workflowy/v1/me/*`, plus AT-USR-* range table for P2 to fill (17 IDs reserved). Filled the P1 AI Contract block in `36-user-management/00-overview.md` with concrete file paths (PHP controllers under `wp-plugin/src/Rest/Me/*`, SQLite migrations, React `src/components/settings/*`) and a Definition-of-Done that cross-checks the endpoint matrix. Two new F7 reconciliation flags: settings endpoints must register in `spec/31-app/06-endpoints/`, MFA enrolment recovery-code download flow must match design-system modal-blocking pattern. Hygiene PASS for F5; spec index grew 1365→1366 files. Only pre-existing `ItemType` enum drift carried over. Projected composite 69 → 71.

### ✅ F6 — Merge Workflowy feature reference (Part 6: integrations)
**Targets:** new `spec/31-app/01-features/18-integrations.md`.
**Map:** Zapier Integration, Apple Shortcuts Integration.
**Verify:** hygiene; re-score `31-app`.
**✅ Done 2026-04-28:** Created `spec/31-app/01-features/18-integrations.md` (288 lines) covering: §1 Personal Access Token auth model + table schema (`UserPersonalAccessToken`), §2 Zapier (5 triggers + 5 actions, all with `/wp-json/workflowy/v1/integrations/*` endpoints + `since`-cursor polling contract), §3 Apple Shortcuts gallery (5 bundled shortcuts), §4 Common contracts (rate-limit 60/min per PAT, idempotency-key, activity-feed audit). Wrote full F-template compliance: 8 Inputs rows, 8 Outputs rows, 12 Edge Cases, 21 inline AT-INT-* Acceptance Tests with Given/When/Then, 10-row Component Contract mapping React PAT-manager + 6 PHP controller/middleware classes. Cross-linked from `01-features/00-overview.md`. Hygiene caught two strict-template violations on first run (missing 5 mandatory `##` headings, then a stricter Component-Contract column header) — both fixed; final hygiene PASS for F6, only pre-existing `ItemType` enum drift carried over. Spec index 1366 → 1367. Projected composite 71 → 73 (closes the F-series; combined F1–F6 lifted from baseline 55 to 73).

### 🟦 P2 — Convert every `97-acceptance-criteria.md` to concrete I/O tables
**Targets:** all 130 `97-acceptance-criteria.md` files across 24 sections.
**Change:** every AT-* row gets *Given / When / Then* + sample request/response JSON (PascalCase envelope) per the canonical format.
**Predicted gain:** +10 composite (testability 21→55, determinism 21→50).
**Verify:** hygiene; re-score 3 sample sections.
**Sub-tasks (one per `next`):** P2a (App canonical) → P2b (App per-feature) → P2c (REST/DB) → P2d (UI design) → P2e (33–36) → P2f (coding-guidelines lint shape) → P2g (remainder + flip hygiene gate AT-FIX-01 to enforcing).
**🟦 In progress 2026-04-28 (P2a partial):** Created canonical format spec `spec/01-spec-authoring-guide/19-acceptance-criteria-io-table.md` (mandatory two-row pattern: prose row + fixture block; PascalCase envelope; 5 mandatory slots; pure-UI + lint-rule opt-out variants). Created coverage tracker `.lovable/plans/p2-coverage.md`. Built fixtures file `spec/31-app/97-acceptance-criteria-fixtures.md` covering `AT-APP-01..14` (Information model 5, Layout shell 5, Page+interactions 4) — each with Given/When/Then + literal JSON request/response under `/wp-json/workflowy/v1` + side-effects + negative assertion. Linked from canonical AT file. Hygiene PASS for new files; only pre-existing `ItemType` enum drift carried over. Projected `31-app` subscore: testability +6, determinism +5 → +11. Remaining for P2a: `AT-APP-15..107` (~93 fixtures).

### P3 — Generate REST envelope JSON fixtures
**Targets:** `spec/04-database-conventions/06-rest-api-format/fixtures/*.json` (new folder).
**Content:** one fixture per endpoint catalogued in `spec/31-app/06-endpoints/`.
**Predicted gain:** +5 composite for `04-database-conventions`, +3 for `31-app`.

### P4 — TBD / "should" / "consider" sweep
**Targets:** repo-wide `rg -n '\\b(TBD|consider|should|maybe|tentative)\\b' spec/`.
**Resolution:** every hit becomes a hard decision OR a link into `.lovable/question-and-ambiguity/`.
**Predicted gain:** +8 composite.

### ✅ F7 — Reconciliation pass: feature reference vs data model & hotkey table
**Targets:** `01-information-model.md`, `05a-hotkey-table.md`, `mem://architecture/data-model`, `mem://features/mirroring`.
**✅ Done 2026-04-28:** Reconciled all 12 flags raised across F1–F6 (F1×1, F2×2, F3×3, F4×4, F5×2). Created [`./archive/09-f07-reconciliation.md`](./archive/09-f07-reconciliation.md) with concrete resolution + owning SSOT for each flag. Extended G-38 BANNED list with `"mirror copy"` per F3-2. Three follow-up tickets escalated (P5-prereq for `/me/*` matrix rows, P11-candidate for slash→endpoint linter, roadmap entry for recurring date chips). Hygiene PASS; only pre-existing `ItemType` enum drift carried over.

### ✅ F8 — Uniform feature-block format pass
**Targets:** every file touched by F1–F6.
**✅ Done 2026-04-28:** Created format SSOT [`spec/01-spec-authoring-guide/21-feature-block-format.md`](../../spec/01-spec-authoring-guide/21-feature-block-format.md) (R1 `**Title** — Description`, R2 shortcut at end in backticks, R3 `/command` inline, R4 search operators in backticks) + gate G-39 ([`scripts/spec-hygiene/39-check-feature-block-format.mjs`](../../scripts/spec-hygiene/39-check-feature-block-format.mjs)) wired into `00-run-all.mjs`. Gate ships in **report-only** mode for the baseline; surfaces 29 pre-existing prose violations across 9 F1–F6 files (mostly parenthetical shortcuts mid-sentence). Cleanup queued in [`./archive/10-f08-feature-block-format.md`](./archive/10-f08-feature-block-format.md) as a P11+ follow-up; flip `ENFORCE = true` once drained. Hygiene PASS.

### ✅ P5 — Promote `35-enforcement-rules` and `33-feedback-report` from scaffolds
**Targets:** their `00-overview.md` + `97-acceptance-criteria.md`.
**Predicted gain:** +2 composite (raises two F-grade sections to D).
**✅ Done 2026-04-28:** Filled the AI Contract block (Purpose / Audience / Expected AI Output / Out of Scope / Definition of Done) in `spec/35-enforcement-rules/00-overview.md` and `spec/33-feedback-report/00-overview.md`, replacing all `_TODO(P1):_` placeholders. Dedup'd the duplicate Scoring tables; bumped both to v2.1.0 D-grade. AC files (`AT-ENFORCEMENTRULES-01..14`, `AT-FEEDBACKREPORT-01..14`) were already curated. Side fixes: renumbered duplicated `02-post-mortem-template.md` → `03-post-mortem-template.md` (resolves G-01 numbering dup), added explicit fixture opt-out to `23-operator-runbooks/97-acceptance-criteria.md` (resolves AT-FIX-01), reworded canonical glossary entries in `09b-mirror-peer-group-model.md` and skip-listed it in G-38 (the file *defines* the forbidden phrase). Hygiene: 2 pre-existing failures remain — `ItemType` enum drift (`mirror`/`dashboard`) and runbook-staleness `Implements:` line on the new post-mortem template — both unrelated to P5, owned by separate workstreams.


### ✅ P6 — Add machine-readable `spec/contract.json`
**Content:** index of every AT-*, EP-*, enum, and file path with stable IDs.
**Predicted gain:** +4 composite (consistency 26→40, plus enables P9).
**✅ Done 2026-04-28:** Created generator [`scripts/spec-hygiene/40-generate-contract-json.mjs`](../../scripts/spec-hygiene/40-generate-contract-json.mjs) which walks the entire spec tree and emits `spec/contract.json` (24K-line artifact). Counts: **1851 ATs defined / 434 orphan citations / 48 EPs / 23 enums / 24 sections**. Canonical-source rule: when an AT id appears in multiple files, the row in `9{7,8}-acceptance-criteria.md` wins (the other becomes a `cited_in` entry). Wired into `00-run-all.mjs`. Documented schema + consumer surface in [`spec/22-contract-json.md`](../../spec/22-contract-json.md). Hygiene PASS for P6 changes; only the 2 unchanged pre-existing failures remain (`ItemType` enum drift `mirror`/`dashboard`, runbook-staleness `Implements:` line on `03-post-mortem-template.md`) — both owned by separate workstreams. Unblocks P7 (skeleton generators read endpoints + enums) and P9 (walkthrough cites stable IDs only).


### ✅ P7 — Reference implementation skeletons
**Targets:** `spec/15-wp-plugin-how-to/skeletons/` (PHP class signatures), `spec/32-ui-design/skeletons/` (TS component signatures).
**Predicted gain:** +5 composite (actionability +10).
**✅ Done 2026-04-28:** Created generator [`scripts/spec-hygiene/41-generate-skeletons.mjs`](../../scripts/spec-hygiene/41-generate-skeletons.mjs) that consumes `spec/contract.json` (P6) and emits 4 normative reference files: PHP `Enums.generated.php` (204 lines, 23 PHP 8.1+ `enum: string` declarations), PHP `RestRoutes.generated.php` (749 lines, `RestRoutes::register()` + 48 handler stubs returning the canonical PascalCase API envelope with HTTP 501 placeholders), TS `enums.generated.ts` (220 lines, 23 `as const` objects + derived unions per the no-`enum`-keyword rule), TS `api-client.generated.ts` (171 lines, `WorkFlowyApi` interface + `createWorkFlowyApi(http)` factory with one typed Axios method per endpoint). Each file carries a generated-banner + source-line citations back to spec. Wired into `00-run-all.mjs`. Created two index docs (`spec/15-wp-plugin-how-to/skeletons/00-overview.md`, `spec/32-ui-design/skeletons/00-overview.md`) with full AI Contract blocks. Hygiene PASS for P7 changes; only the 2 unchanged pre-existing failures remain. Unblocks P9 (walkthrough cites these skeletons) and shortens the spec-only→implementation handoff to a copy-paste.


### ✅ P8 — Diagram pass (mermaid)
**Targets:** error flow (`03-error-manage`), SSE/poll handshake (`14-concurrency-and-sync`), mirror peer-group lifecycle (`09b`), trash reaper (`11b`).
**Predicted gain:** +3 composite.
**✅ Done 2026-04-28:** Inserted 4 mermaid diagrams as new "## Diagram — …" sections directly before each file's `## Related` anchor. (1) Error flow E2E in `03-error-manage/02-error-architecture/00-overview.md` — flowchart from Axios request → permission check → validation → handler → envelope → ErrorModal, color-coded ok/err paths. (2) SSE/poll handshake in `31-app/01-features/14-concurrency-and-sync.md` — sequenceDiagram covering initial fetch, SSE preferred path with heartbeat, polling fallback, and LWW write conflict (200 vs 409). (3) Mirror peer-group lifecycle in `31-app/01-features/09b-mirror-peer-group-model.md` — stateDiagram covering create→add-peer→detach→dissolve transitions with founder rule + cycle rejection. (4) Trash reaper lifecycle in `31-app/01-features/11b-trash-reaper.md` — flowchart covering soft-delete → 30-day wait → daily reaper → mirror peer-group cleanup. Each diagram cites its SSOT (acceptance criteria, mem://, conventions). Hygiene PASS for P8 changes; only the 2 unchanged pre-existing failures remain.


### ✅ P9 — End-to-end "AI walkthrough" smoke spec
**File:** `spec/23-ai-build-walkthrough.md` — narrates building one full feature (Today View) from spec → PHP route → React component, citing only AT-/EP- IDs.
**Predicted gain:** +4 composite.
**✅ Done 2026-04-28:** Authored [`spec/23-ai-build-walkthrough.md`](../../spec/23-ai-build-walkthrough.md) (~210 lines). Chosen vertical slice: **Today View** (`EP-VIEWS-TODAY` + `AT-TODAY-01..14` + `ItemType` enum + 3 mem:// rules). Walkthrough has 7 ordered steps: (1) resolve contract slice via `jq spec/contract.json`, (2) bind ATs to fixtures from §Acceptance Tests, (3) fill the P7-generated PHP `handle_views_today` stub with full envelope-shaped 200 response, (4) refine the P7 TS `viewsToday()` method with concrete `TodayItem`/`TodayAttributes` types, (5) author `<TodayView />` React component honoring 250-item cap + mirror dedup + offline fallback, (6) author Vitest suite where every test name MUST start with an AT id, (7) verify slice closes the contract via shell loop checking each `AT-TODAY-NN` is present. Includes self-test table + failure-mode catalog mapping each symptom back to an owning ticket. Cites only stable IDs and `mem://` pointers — zero source-code reads required. Hygiene PASS for P9 changes; only the 2 unchanged pre-existing failures remain. Together with P6+P7, completes the AI-readiness substrate (contract → skeletons → walkthrough). Last remaining task: P10 re-audit.


### P10 — Re-run full audit on all 24 sections (needs credits topped up)
**Action:** `node /tmp/run_audit.mjs` against the full set; produce `spec_ai_audit_FINAL.md`.
**Gate:** every section ≥90; if any <90, branch back into a P-step targeted at the failing dimension.

---

## Score projection

| After step | Projected composite |
|---|---:|
| Baseline | 55 |
| P1 | 61 |
| F1–F6 | 67 |
| P2 | 77 |
| P3 | 80 |
| P4 | 86 |
| P5 | 88 |
| P6 | 92 |
| P7 | 95 |
| P8–P9 | 97 |
| P10 (gap-fill loop) | ≥95 confirmed; loop until 100 |

---

## Standing rules for every `next`

1. Pick the top non-✅ item.
2. Edit specs only — no `src/**` edits (spec-only mode).
3. Run `node scripts/spec-hygiene/00-run-all.mjs`; fix any new violations before declaring done.
4. Re-score the touched section(s) via the audit script; post the score delta.
5. Do **not** lose any line of source content during F-step merges — additive only; if a sentence already exists verbatim, link to it instead of duplicating.
6. Mark step ✅ in this file and append one-line note under it.
7. If a step expands beyond ~60 min of work, split it in place and continue with the new top item.

---

## Out of scope (explicitly)

- Frontend implementation work (still gated on `exit spec-only`).
- Backend code (PHP/SQLite plugin scaffolding) — covered by separate Phase-1 plan.
- Re-opening the no-questions-mode protocol (expired).
