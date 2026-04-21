# Suggestions

> **Updated:** 2026-04-20
> Single source of truth for all suggestions. Detailed legacy entries live in `.lovable/memory/suggestions/`.

---

## Active Suggestions

### Workflowy spec consolidation (10-phase initiative — 8 active + 2 deferred)
- **Status:** In Progress — Phase 0 complete (28 screenshots saved + visually inspected, full phase plan published); Phase 1 awaiting user "go"
- **Priority:** High
- **Description:** Consolidate Workflowy product into editable spec folders (18+). Full phase plan: `.lovable/plans/03-workflowy-spec-consolidation.md`. (1) Navbar & breadcrumb, (2) Search overlay & filter syntax, (3) Right panel (Handbook + Hotkeys + What's New), (4) Bullet anatomy & 3-dot menus, (5) Editor (slash, selection toolbar, item types, color palettes, code/quote, markdown), (6) Left sidebar offcanvas + special nodes, (7) Calendar/Today + Quick Add modal, (8) App shell. Deferred: (9) Email-to-Workflowy, (10) Mobile/PWA.
- **User decisions locked (2026-04-21):** sequential 1→8; H1–H5; English-only Handbook; sidebar offcanvas; default items = Today/Home/Inbox/Drafts/Mentions/Calendar/Trash/+New; Hotkeys img-65 verbatim; Code Block forward = merge siblings to one node; Email deferred; Quick Add = `⌘⇧N` web modal.
- **Reference assets:** `.lovable/references/workflowy-screenshots/40-…67-…png` (28 saved + visually inspected 2026-04-21)
- **Cross-cutting blockers:** (a) 11+11 hex swatches from img-47; (b) sidebar drag semantics (move vs mirror); (c) launch theme list; (d) LinkedIn integration scope.
- **Added:** 2026-04-21 (updated from earlier 8-phase entry)

### Fix 5 audit findings in spec/ folders 31–36
- **Status:** Pending (user decision needed)
- **Priority:** Medium
- **Description:** (1) Renumber `spec/31-app/03-…` → `02-…` to close numbering gap and update inbound links; (2) regenerate `spec/31-app/99-consistency-report.md` with accurate inventory (remove non-existent `02-audits/` row); (3) add missing `> **Version:** 1.0.0` to `spec/32-ui-design/03-design-system/03-tailwind-version-ssot.md`; (4) refresh date + add `97-acceptance-criteria.md` rows where missing across all 17 consistency reports; (5) update subfolder reports for newly added files. Stay within folders 18+.
- **Added:** 2026-04-20 (audit session)
- **Tracked in:** `.lovable/pending-issues/01-spec-31-36-audit-findings.md`

### Fix 49 broken relative links in spec/*.md
- **Status:** Pending
- **Priority:** Low (folders 01–17 are read-only; only 18+ subset is actionable)
- **Description:** Cross-reference audit found stale `03-coding-guidelines` paths, legacy `03-general/` and `01-app/` references, wrong `../` depth in `15-wp-plugin-how-to`, and missing `.mmd`/PNG assets. Most are in read-only folders; only links inside folders 18+ may be fixed.
- **Added:** 2026-04-18

### CI: fail on missing 00-overview.md or 99-consistency-report.md
- **Status:** Pending
- **Priority:** Medium
- **Description:** Add a CI script that fails the build if any `spec/` folder (≥18) is missing `00-overview.md` or `99-consistency-report.md`.
- **Added:** 2026-04-18

### CI: fail on broken relative links
- **Status:** Pending
- **Priority:** Medium
- **Description:** Add a CI script that runs the cross-reference audit and fails on any broken relative link inside folders 18+.
- **Added:** 2026-04-18

### Move parallel spec folders into spec/31-app/
- **Status:** Pending
- **Priority:** Low
- **Description:** Move `spec/22-app-issues`, `spec/23-app-database`, `spec/24-app-design-system-and-ui` into `spec/31-app/` as nested subfolders (currently they parallel both 21–24 and 31-app).
- **Added:** 2026-04-18

---

## Implemented Suggestions

### Save "Write Memory" prompt to prompts folder
- **Implemented:** 2026-04-20
- **Notes:** Saved as `.lovable/prompts/02-write-memory-prompt.md` and referenced in `.lovable/prompt.md` index. Trigger phrases: `write memory`, `end memory`, `update memory`.

### Lock spec edit scope to folders 18+
- **Implemented:** 2026-04-20
- **Notes:** Codified in `.lovable/memory/docs/specifications.md` and `.lovable/memory/workflow/01-project-status.md`. R3-1 (400-line cap split task) marked VOID. Added rule to `.lovable/strictly-avoid.md`.

### Frontend gap analysis (26 gaps fixed)
- **Implemented:** Earlier sessions
- **Notes:** See `.lovable/memory/workflow/04-frontend-failure-analysis.md`.

---

*Legacy archive of completed suggestions: `.lovable/memory/suggestions/completed/`.*
