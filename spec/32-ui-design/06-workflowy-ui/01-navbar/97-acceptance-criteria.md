# Phase 1 — Navbar Acceptance Criteria

> **Version:** 1.0.0
> **Created:** 2026-04-23 (UTC+8)
> **Status:** ✅ Authored
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## Purpose

Consolidated acceptance criteria for Phase 1 (Navbar & Breadcrumb). Mirrors the inline `## Acceptance Criteria` block in `00-overview.md`. ID range: `AT-WFNAV-NN`.

---

## Criteria

- [x] **AT-WFNAV-01:** Navbar renders at all viewport widths ≥ 320 px without horizontal scroll. — [`01-layout.md`](./01-layout.md) § Behavior at breakpoints
- [x] **AT-WFNAV-02:** Breadcrumb truncates the **middle** of the path (preserves first + last segment) when total width exceeds available space. — [`02-breadcrumb.md`](./02-breadcrumb.md) § Truncation rules
- [x] **AT-WFNAV-03:** `Ctrl+L` toggles the left sidebar offcanvas from anywhere. — [`04-keyboard-shortcuts.md`](./04-keyboard-shortcuts.md) row 1
- [x] **AT-WFNAV-04:** `⌘/` (Mac) / `Ctrl+/` (Win/Linux) toggles the right-side panel. — [`04-keyboard-shortcuts.md`](./04-keyboard-shortcuts.md) row 2
- [x] **AT-WFNAV-05:** Clicking any breadcrumb segment focuses that node and updates the URL. — [`02-breadcrumb.md`](./02-breadcrumb.md) § Click behavior + [`03-routing.md`](./03-routing.md) § Focus history stack
- [x] **AT-WFNAV-06:** Browser back/forward buttons re-focus the previously focused node. — [`03-routing.md`](./03-routing.md) § Focus history stack — `popstate` row
- [x] **AT-WFNAV-07:** Focused-node title is selectable, editable inline, and re-renders the breadcrumb on rename. — [`02-breadcrumb.md`](./02-breadcrumb.md) § Inline editing
