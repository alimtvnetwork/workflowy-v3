# Workflowy UI Spec — Parent Overview

> **Version:** 1.0.0
> **Created:** 2026-04-21 (UTC+8)
> **Status:** Scaffolding (Phase 1 ready to author)
> **Parent:** [`../00-overview.md`](../00-overview.md)
> **Source plan:** [`.lovable/plans/03-workflowy-spec-consolidation.md`](../../../.lovable/plans/03-workflowy-spec-consolidation.md)
> **Reference assets:** `.lovable/references/workflowy-screenshots/` (28 screenshots img-40 → img-67)

---

## Purpose

Canonical UI/UX specification for the WorkFlowy product, consolidated from 28 reference screenshots and locked user decisions (2026-04-21).

This parent folder nests **10 phases** as numbered subfolders. Phase number = subfolder number (1:1 mapping). All Workflowy spec authoring happens under this folder so it cannot collide with the existing `01-architecture/` … `05-quality/` siblings.

---

## Phase Index

| # | Subfolder | Phase | Status |
|---|-----------|-------|--------|
| 01 | [`01-navbar/`](./01-navbar/00-overview.md) | Navbar & Breadcrumb | ⏳ Ready |
| 02 | [`02-search/`](./02-search/00-overview.md) | Search Overlay & Filter Syntax | ⏳ Ready |
| 03 | [`03-right-panel/`](./03-right-panel/00-overview.md) | Right-Side Panel (Handbook + Hotkeys + What's New) | ⏳ Ready |
| 04 | [`04-bullet/`](./04-bullet/00-overview.md) | Bullet Anatomy & Context Menus | ⏳ Ready |
| 05 | [`05-editor/`](./05-editor/00-overview.md) | Editor (Slash, Toolbar, Item Types, Colors, Code/Quote, Markdown) | ⏳ Ready |
| 06 | [`06-sidebar/`](./06-sidebar/00-overview.md) | Left Sidebar Offcanvas + Special Nodes | ⏳ Ready |
| 07 | [`07-calendar/`](./07-calendar/00-overview.md) | Calendar / Today + Quick Add | ⏳ Ready |
| 08 | [`08-app-shell/`](./08-app-shell/00-overview.md) | Themes, Fonts, Settings, App Menu | ⏳ Ready |
| 09 | [`09-integrations/`](./09-integrations/00-overview.md) | Email-to-Workflowy | 🚫 Deferred |
| 10 | [`10-mobile/`](./10-mobile/00-overview.md) | Mobile / PWA | 🚫 Deferred |

---

## Locked Decisions (2026-04-21)

- Sequential execution: Phase 1 → 8. Phases 9–10 are stubs.
- Headings: H1–H5 (Workflowy slash menu shows H1–H3; we extend).
- Handbook: English only at launch (structure AND content).
- Color palette: 11 text + 11 highlight swatches derived from img-47 (hex TBD — Phase 5 blocker).
- Sidebar: shadcn `Sidebar` with `collapsible="offcanvas"`.
- Default sidebar items: Today, Home, Inbox, Drafts, Mentions, Calendar, Trash, + New node.
- Hotkeys: img-65 verbatim (~30 entries, Cmd on Mac / Ctrl elsewhere).
- Code Block forward conversion: N selected siblings → ONE node with N internal line breaks.
- Quick Add: web-only `⌘⇧N` modal that appends to Inbox.
- Email-to-Workflowy: deferred to Phase 9.

---

## Cross-cutting Blockers

| # | Blocker | Owning Phase |
|---|---------|--------------|
| 1 | 11+11 hex swatches from img-47 | Phase 5 |
| 2 | Sidebar drag semantics (move vs mirror) | Phase 6 |
| 3 | Launch theme list (light/dark only or named palettes) | Phase 8 |
| 4 | LinkedIn integration scope | Phase 9 (deferred) |

---

## Cross-References

- [`../00-overview.md`](../00-overview.md) — UI Design root
- [`../01-architecture/00-overview.md`](../01-architecture/00-overview.md) — App architecture (separate track)
- [`.lovable/plans/03-workflowy-spec-consolidation.md`](../../../.lovable/plans/03-workflowy-spec-consolidation.md) — Source plan
- [`.lovable/memory/suggestions/01-workflowy-spec-consolidation.md`](../../../.lovable/memory/suggestions/01-workflowy-spec-consolidation.md) — Suggestion record
