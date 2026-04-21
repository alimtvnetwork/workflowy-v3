# S01 — Workflowy Spec Consolidation (10-Phase Initiative)

- **suggestionId:** S01
- **createdAt:** 2026-04-21 (UTC+8)
- **source:** Lovable
- **affectedProject:** WorkFlowy
- **affectedArea:** `spec/32-ui-design/06-workflowy-ui/` (10 phases nested as subfolders `01-navbar/` … `10-mobile/`; D1 resolved 2026-04-21 via Option C)
- **status:** inProgress
- **priority:** High

## Description
Consolidate Workflowy product into editable spec folders. 10 phases total — 8 active + 2 deferred. Full plan lives at `.lovable/plans/03-workflowy-spec-consolidation.md`. Phases: (1) Navbar & breadcrumb, (2) Search overlay & filter syntax, (3) Right panel (Handbook + Hotkeys + What's New), (4) Bullet anatomy & 3-dot menus, (5) Editor (slash, selection toolbar, item types, color palettes, code/quote, markdown), (6) Left sidebar offcanvas + special nodes, (7) Calendar/Today + Quick Add modal, (8) App shell. Deferred: (9) Email-to-Workflowy, (10) Mobile/PWA.

## Rationale
Reference Workflowy is the design north-star; without consolidating its visual + interaction spec into our editable folders, AI implementations will diverge from the canonical UX.

## Proposed Change
Sequentially execute Phase 1 → Phase 8 (Phase 0 is complete: 28 screenshots saved + visually inspected). Each phase produces 1–6 files in its target subfolder.

### User decisions locked (2026-04-21)
- Sequential 1 → 8.
- Headings H1–H5 (Workflowy slash menu shows H1–H3; we extend).
- Handbook = English-only at launch, both structure and content.
- Sidebar = shadcn `Sidebar` with `collapsible="offcanvas"`.
- Default sidebar items: Today, Home, Inbox, Drafts, Mentions, Calendar, Trash, + New node.
- Hotkeys = img-65 verbatim (~30 entries).
- Code Block forward conversion = N selected siblings merge into ONE node with N internal line breaks.
- Email-to-Workflowy deferred to Phase 9.
- Quick Add = global `⌘⇧N` web modal that appends to Inbox (no PWA in v1).

### Cross-cutting blockers (parked — must be resolved during their phase)
1. 11+11 hex swatches from img-47 (Phase 5).
2. Sidebar drag semantics: move vs mirror (Phase 6).
3. Launch theme list (Phase 8).
4. LinkedIn integration scope (out of scope until Phase 9 deferred work begins).

## Acceptance Criteria
- [x] **D1 resolved (2026-04-21):** parent folder `spec/32-ui-design/06-workflowy-ui/` scaffolded with 10 subfolder overviews.
- [x] **W1 done (2026-04-21):** Phase 1 spec authored — `00-overview.md` + `01-layout.md` + `02-breadcrumb.md` + `03-routing.md` + `04-keyboard-shortcuts.md` published under `06-workflowy-ui/01-navbar/`.
- [x] **W2 done (2026-04-21):** Phase 2 spec authored — `00-overview.md` + `01-overlay.md` + `02-filter-syntax.md` published under `06-workflowy-ui/02-search/`.
- [x] **W3 done (2026-04-21):** Phase 3 spec authored — `00-overview.md` + `01-handbook-content.md` + `02-hotkeys.md` + `03-whats-new.md` published under `06-workflowy-ui/03-right-panel/`.
- [x] **W4 done (2026-04-21):** Phase 4 spec authored — `00-overview.md` + `01-anatomy.md` + `02-three-dot-menu.md` + `03-focused-item-menu.md` + `04-comment-icon.md` published under `06-workflowy-ui/04-bullet/`.
- [x] **W5 done (2026-04-21):** Phase 5 spec authored — 7 files under `06-workflowy-ui/05-editor/`. Blocker B1 (11+11 swatches) RESOLVED via image inspection.
- [ ] All 4 cross-cutting blockers resolved during their owning phase.
- [ ] `.lovable/plans/03-workflowy-spec-consolidation.md` updated after each phase completion.
- [ ] No spec file exceeds 400 lines (split into subfolder if it would).

## Completion Notes
*(pending — Phase 1 awaiting user "go")*
