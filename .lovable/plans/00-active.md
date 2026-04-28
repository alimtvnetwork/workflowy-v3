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

### 🟦 F3 — Merge Workflowy feature reference (Part 3: structural ops & mirrors)
**Targets:** `06-item-context-menu.md`, `09-mirrors.md`, `09b-mirror-peer-group-model.md`, `12-multi-select.md`.
**Map:** Duplicate, Copy Internal Link, Delete, Show/Hide Completed, Expand All, Collapse All, Move To, Move Here, Mirror, Mirror To, Mirror Here, Detach Mirror, See Mirrors, Internal Links, Backlinks, External Links, Remove Link, Slash Commands.
**Reconciliation note:** confirm Workflowy "Mirror = peer group" matches `mem://features/mirroring`.
**Verify:** hygiene; re-score `31-app`.

### F4 — Merge Workflowy feature reference (Part 4: views, sharing, templates)
**Targets:** `07-board-view.md`, `08-share-dialog.md`, `13-templates.md`, `11-trash-view.md`.
**Map:** Fractal Board, Add Card/Column to Board, Move Cards/Columns, Share, Templates (button + `#template`), Export, Export All, Print, Presentation Mode, Fractal Comments.
**Verify:** hygiene; re-score `31-app`.

### F5 — Merge Workflowy feature reference (Part 5: account & settings)
**Targets:** new `spec/36-user-management/01-features/*` topic files (currently `.gitkeep`).
**Map:** Settings Panel, Set Password, Change Email, Restore from Backup, Referrals, Theme, Daily Email Summary, Workflowy Labs, Delete Account, Multi-Factor Authentication, Help, Report a Bug, Handbook Panel.
**Verify:** hygiene; first AI score for `36-user-management`.

### F6 — Merge Workflowy feature reference (Part 6: integrations)
**Targets:** new `spec/31-app/01-features/18-integrations.md`.
**Map:** Zapier Integration, Apple Shortcuts Integration.
**Verify:** hygiene; re-score `31-app`.

### P2 — Convert every `97-acceptance-criteria.md` to concrete I/O tables
**Targets:** all `97-acceptance-criteria.md` files (~24).
**Change:** every AT-* row gets *Given / When / Then* + sample request JSON + expected response JSON (PascalCase envelope).
**Predicted gain:** +10 composite (testability 21→55, determinism 21→50).
**Verify:** hygiene; re-score 3 sample sections.

### P3 — Generate REST envelope JSON fixtures
**Targets:** `spec/04-database-conventions/06-rest-api-format/fixtures/*.json` (new folder).
**Content:** one fixture per endpoint catalogued in `spec/31-app/06-endpoints/`.
**Predicted gain:** +5 composite for `04-database-conventions`, +3 for `31-app`.

### P4 — TBD / "should" / "consider" sweep
**Targets:** repo-wide `rg -n '\\b(TBD|consider|should|maybe|tentative)\\b' spec/`.
**Resolution:** every hit becomes a hard decision OR a link into `.lovable/question-and-ambiguity/`.
**Predicted gain:** +8 composite.

### F7 — Reconciliation pass: feature reference vs data model & hotkey table
**Targets:** `01-information-model.md`, `05a-hotkey-table.md`, `mem://architecture/data-model`, `mem://features/mirroring`.
**Action:** flag any conflict between merged Workflowy text and current spec; record resolution in `.lovable/question-and-ambiguity/`.

### F8 — Uniform feature-block format pass
**Targets:** every file touched by F1–F6.
**Action:** enforce `**Feature Title** — Description` block, shortcut at end, slash command inline, search operators in backticks.

### P5 — Promote `35-enforcement-rules` and `33-feedback-report` from scaffolds
**Targets:** their `00-overview.md` + `97-acceptance-criteria.md`.
**Predicted gain:** +2 composite (raises two F-grade sections to D).

### P6 — Add machine-readable `spec/contract.json`
**Content:** index of every AT-*, EP-*, enum, and file path with stable IDs.
**Predicted gain:** +4 composite (consistency 26→40, plus enables P9).

### P7 — Reference implementation skeletons
**Targets:** `spec/15-wp-plugin-how-to/skeletons/` (PHP class signatures), `spec/32-ui-design/skeletons/` (TS component signatures).
**Predicted gain:** +5 composite (actionability +10).

### P8 — Diagram pass (mermaid)
**Targets:** error flow (`03-error-manage`), SSE/poll handshake (`14-concurrency-and-sync`), mirror peer-group lifecycle (`09b`), trash reaper (`11b`).
**Predicted gain:** +3 composite.

### P9 — End-to-end "AI walkthrough" smoke spec
**File:** `spec/22-ai-build-walkthrough.md` — narrates building one full feature (e.g. Today view) from spec → PHP route → React component, citing only AT-/EP- IDs.
**Predicted gain:** +4 composite.

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
