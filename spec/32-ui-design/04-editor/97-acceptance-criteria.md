# Editor (UI) — Acceptance Criteria

> **Version:** 1.0.1
> **Created:** 2026-04-23 (UTC+8)
> **Status:** Scaffold
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## Purpose

Aggregated acceptance criteria for the editing surface architecture (separate from Workflowy Phase 5 spec). ID range: `AT-UIEDIT-NN`.

---

## Coverage Map

| # | Topic | Source File | ID Range |
|---|-------|-------------|----------|
| 1 | Rich text format | [`01-rich-text-format.md`](./01-rich-text-format.md) | AT-UIEDIT-01..05 |
| 2 | Enter key rules | [`02-enter-key-rules.md`](./02-enter-key-rules.md) | AT-UIEDIT-06..10 |
| 3 | Drag and drop | [`03-drag-and-drop.md`](./03-drag-and-drop.md) | AT-UIEDIT-11..15 |
| 4 | Interaction clarifications | [`04-interaction-clarifications.md`](./04-interaction-clarifications.md) | AT-UIEDIT-16..20 |
| 5 | Additional behaviors | [`05-additional-behaviors.md`](./05-additional-behaviors.md) | AT-UIEDIT-21..25 |

---

## Criteria Summary

- [x] Cursor position preserved across all node operations.
- [x] Enter key rules documented for every item type (bullet, todo, heading, etc.).
- [x] Drag-and-drop adapter supports both move (default) and ⌥-mirror.
- [x] All keyboard shortcuts match `spec/31-app/01-features/05-interactions.md`.
- [x] IME composition events do not trigger autosave (covered in additional behaviors).
