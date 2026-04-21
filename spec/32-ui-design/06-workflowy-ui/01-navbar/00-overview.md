# Phase 1 — Navbar & Breadcrumb

> **Version:** 1.0.0
> **Created:** 2026-04-21 (UTC+8)
> **Status:** ✅ Authored
> **Parent:** [`../00-overview.md`](../00-overview.md)
> **Reference screenshots:** `40-navbar-breadcrumb.png`, `52-absolute-path-and-context-menu.png`, `59-vibe-coding-prompts-context.png`, `60-left-menu-button.png`

---

## Topic Index

| § | File | Topic |
|---|------|-------|
| 01 | [`01-layout.md`](./01-layout.md) | Top bar layout, regions, controls, dimensions |
| 02 | [`02-breadcrumb.md`](./02-breadcrumb.md) | Breadcrumb path, separator, truncation, click behavior |
| 03 | [`03-routing.md`](./03-routing.md) | URL structure, history, focus mode routing |
| 04 | [`04-keyboard-shortcuts.md`](./04-keyboard-shortcuts.md) | Navbar-related keyboard shortcuts |

---

## Purpose

Defines the top navigation bar of the WorkFlowy application: layout regions, controls, breadcrumb behavior, routing rules, and keyboard shortcuts. The navbar is **always visible** (never collapses) and provides the primary way to navigate between the focused node, the home tree, and global actions.

---

## Locked Decisions (from screenshots)

| Item | Value | Source |
|------|-------|--------|
| Left-menu (≡) shortcut | `Ctrl+L` (or `^L`) | img-60 hover tooltip |
| Breadcrumb separator | `›` (single-character right-pointing angle quote, U+203A) | img-40, img-52 |
| Breadcrumb truncation suffix | `…` (single-character horizontal ellipsis, U+2026) | img-52 |
| Right-side icon order | search · share · ⋮ (more) · `⌘/` (panel toggle) | img-40 |
| Focused-node title rendering | bold, H1-style, rendered **above** the bullet tree (not as a bullet itself) | img-59 |
| Breadcrumb visibility | always visible when focused on any non-root node; hidden at home root | img-40 vs img-52 |

---

## Acceptance Criteria

- [ ] Navbar renders at all viewport widths ≥ 320 px without horizontal scroll.
- [ ] Breadcrumb truncates the **middle** of the path (preserves first + last segment) when total width exceeds available space.
- [ ] `Ctrl+L` toggles the left sidebar offcanvas from anywhere.
- [ ] `⌘/` (Mac) / `Ctrl+/` (Win/Linux) toggles the right-side panel.
- [ ] Clicking any breadcrumb segment focuses that node and updates the URL.
- [ ] Browser back/forward buttons re-focus the previously focused node (history stack matches focus stack).
- [ ] Focused-node title is selectable, editable inline, and re-renders the breadcrumb on rename.

---

## Cross-References

- [`../00-overview.md`](../00-overview.md) — Workflowy UI parent
- [`../03-right-panel/00-overview.md`](../03-right-panel/00-overview.md) — Right panel toggled by `⌘/`
- [`../06-sidebar/00-overview.md`](../06-sidebar/00-overview.md) — Left sidebar toggled by `Ctrl+L`
- [`../04-bullet/00-overview.md`](../04-bullet/00-overview.md) — Bullet rendering inside the focused tree
