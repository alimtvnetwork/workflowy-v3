# Workflowy Spec Consolidation — 10-Phase Plan

> **Created:** 2026-04-21 · **Updated:** 2026-04-25 · **Status:** ✅ ARCHIVED — All 10 phases complete; all 4 cross-cutting blockers resolved (B1 hex swatches, B2 sidebar drag = move/⌥-mirror, B3 launch themes = light+dark, D1 LinkedIn scope = read-only). Consistency report scores 100/100. No follow-up actionable.
> **Scope rule:** Only edit folders `spec/18+`. Folders `01–17` are READ-ONLY.
> **Reference assets:** `.lovable/references/workflowy-screenshots/` (28 screenshots: img-40 → img-67, indexed in `00-index.md`).
> **D1 resolution (2026-04-21):** All 10 phases nest under `spec/32-ui-design/06-workflowy-ui/` as subfolders `01-navbar/` … `10-mobile/`. Phase number = subfolder number. Existing siblings `01-architecture/` … `05-quality/` are untouched.

## User decisions locked (2026-04-21)
- Phases run **sequentially 1 → 8**. Phases 9–10 are stubs.
- Headings: **H1–H5** (Workflowy slash shows H1–H3; we extend).
- Handbook: **English only** at launch. Both structure AND content.
- Color palette defaults: **derived from img-47** (11 text + 11 highlight swatches; exact hex TBD).
- Sidebar: shadcn `Sidebar` with `collapsible="offcanvas"`.
- Default sidebar items: Today, Home, **Inbox, Drafts, Mentions**, Calendar, **Trash**, + New node.
- Hotkeys: **img-65 list verbatim** (~30 entries, Cmd on Mac / Ctrl elsewhere).
- Code Block forward conversion: N selected siblings → ONE node with N internal line breaks.
- Email-to-Workflowy: **deferred to Phase 9**.
- Quick Add: web equivalent only — global `⌘⇧N` modal appends to Inbox.

---

## Phase Overview

| # | Phase | Status | Output Folder |
|---|-------|--------|---------------|
| 1 | Navbar & Breadcrumb | ✅ Done (2026-04-21) | `spec/32-ui-design/06-workflowy-ui/01-navbar/` |
| 2 | Search Overlay & Filter Syntax | ✅ Done (2026-04-21) | `spec/32-ui-design/06-workflowy-ui/02-search/` |
| 3 | Right-Side Panel (Handbook + Hotkeys + What's New) | ✅ Done | `spec/32-ui-design/06-workflowy-ui/03-right-panel/` |
| 4 | Bullet Anatomy & Context Menus | ✅ Done | `spec/32-ui-design/06-workflowy-ui/04-bullet/` |
| 5 | Editor (Slash, Selection Toolbar, Item Types, Markdown) | ✅ Done | `spec/32-ui-design/06-workflowy-ui/05-editor/` |
| 6 | Left Sidebar (Offcanvas) + Special Nodes | ✅ Done | `spec/32-ui-design/06-workflowy-ui/06-sidebar/` |
| 7 | Calendar / Today + Quick Add | ✅ Done | `spec/32-ui-design/06-workflowy-ui/07-calendar/` |
| 8 | Themes, Fonts, Settings, App Menu | ✅ Done | `spec/32-ui-design/06-workflowy-ui/08-app-shell/` |
| 9 | Email-to-Workflowy + LinkedIn Import | ✅ Done (2026-04-23) | `spec/32-ui-design/06-workflowy-ui/09-integrations/` |
| 10 | Mobile / PWA | ✅ Done (2026-04-23) | `spec/32-ui-design/06-workflowy-ui/10-mobile/` |

---

## Phase 1 — Navbar & Breadcrumb
**Files:** `02-navbar.md`
**Screenshots:** img-40, 52, 60
**Spec:** Top bar = left ≡ (`^L`) + back/forward/home + absolute breadcrumb path with `›` separator and `…` truncation; right = search + share + ⋮ + ⌘/ panel toggle. Routing rules. Focused-node renders title as H1-style bold (img-59).

## Phase 2 — Search
**Files:** `01-overlay.md`, `02-filter-syntax.md`
**Screenshots:** img-40, 41, 42, 43, 44
**Spec:** Full-screen overlay. 6 filter tabs (globe / @ / 📅 / 🕐 / 👥 / ⋯). Filter keywords: `date:`, `date-before:`, `date-after:`, `day-of-week:`, `changed:`, `created:`, `is:`, `has:`, `in:`, `text:`, `link:`, `highlight:`, `me`, `others`, `today`, `tomorrow`, etc. Mirror inclusion toggle (img-58).

## Phase 3 — Right-Side Panel
**Files:** `01-overview.md`, `02-handbook-content.md`, `03-hotkeys.md`, `04-whats-new.md`
**Screenshots:** img-45, 54, 55, 58, 63, 64, 65, 66, 67
**Spec:** Single panel, two tabs (Handbook | Hotkeys), language picker (English), Sections collapsible, Search field. Close `⌘/`. Handbook entry template = heading + shortcut + ⚡ + screenshot slot + paragraph + grey slash callout. Hotkeys = ~30 entries from img-65 verbatim. What's New = dated entries, 👍/👎, Pro upsell.

## Phase 4 — Bullet Anatomy & Menus
**Files:** `01-anatomy.md`, `02-three-dot-menu.md`, `03-focused-item-menu.md`, `04-comment-icon.md`
**Screenshots:** img-46, 48, 49, 50, 51, 52, 63
**Spec:** Bullet row = `[⋯ on hover left] [▸ if children] [● dot] [content]` + `[+ comment top-right on hover]`. Arrow rule: visible only on inline bullets WITH children; focused root has no arrow. In-content 3-dot menu order locked (img-52).

## Phase 5 — Editor
**Files:** `01-slash-menu.md`, `02-selection-toolbar.md`, `03-item-types.md`, `04-color-palettes.md`, `05-code-quote-blocks.md`, `06-markdown-shortcuts.md`
**Screenshots:** img-47, 53, 56, 58, 59
**Spec:** Slash menu order locked (img-53), extended H1–H5. Selection toolbar (img-47). 11+11 color swatches. Item types: Bullet, Board, To-do, H1–H5, Paragraph, Quote, Code Block, Divider, Shortcut, Numbered List. Code Block forward = merge siblings into one node. Markdown: `# `–`##### `, `> `, `[]`, `` ` ``, `1. `, `---`. Templates: `/Add from template` or `/template`.

## Phase 6 — Left Sidebar
**Files:** `01-offcanvas.md`, `02-special-nodes.md`, `03-drag-drop.md`
**Screenshots:** img-60, 61, 62, 57
**Spec:** shadcn `Sidebar` `collapsible="offcanvas"`. Default items as decided. Drag-drop targets (move vs mirror — BLOCKER). Hover tooltip card on ≡.

## Phase 7 — Calendar / Today + Quick Add
**Files:** `01-today-view.md`, `02-quick-add-modal.md`, `03-found-dates.md`
**Screenshots:** img-57
**Spec:** Today view + Starred + Calendar icon. Drag-onto-Calendar = move to Today. Calendar Picker with Found Date markers. Quick Add modal opened by `⌘⇧N` → appends to Inbox.

## Phase 8 — App Shell
**Files:** `01-app-menu.md`, `02-themes.md`, `03-fonts.md`, `04-settings.md`
**Screenshots:** img-45, 55
**Spec:** App ⋮ menu order locked (img-45). Themes free for all (light/dark + named — list TBD). Geist Mono added. Settings: Fractal Conversations toggle hides Mentions/Drafts.

## Phase 9 — Email-to-Workflowy 🚫 Deferred
Stub spec. Per-node inbound email addresses with allow-list. Implementation post-v1.

## Phase 10 — Mobile / PWA 🚫 Deferred
Stub spec. Share-target API, install prompt. Post-v1.

---

## Cross-cutting blockers (resolve before or during phases)
1. **Hex swatches** — extract 11+11 colors from img-47 (Phase 5).
2. **Sidebar drag semantics** — move or mirror? (Phase 6) — *user-visible behavior only*.
3. **Launch theme list** — light/dark only or include named palettes? (Phase 8).
4. **LinkedIn integration scope** — read-only profile vs OAuth posting? (Phase 9 sibling).

> **D2 (backend runtime) is REMOVED from this queue.** Per user, backend choice is deferred until all specs are 100% complete. Spec phases describe features + behaviors only — no DB engines, no hosting, no sync protocols.

## Open questions parked
See `.lovable/references/workflowy-screenshots/00-index.md` § "Open questions parked".
