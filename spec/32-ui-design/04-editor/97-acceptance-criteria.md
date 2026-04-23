# Editor (UI) — Acceptance Criteria

> **Version:** 1.0.0
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
| 1 | Editor architecture | [`01-editor-architecture.md`](./01-editor-architecture.md) | AT-UIEDIT-01..05 |
| 2 | Selection model | [`02-selection-model.md`](./02-selection-model.md) | AT-UIEDIT-06..10 |
| 3 | Keyboard handling | [`03-keyboard-handling.md`](./03-keyboard-handling.md) | AT-UIEDIT-11..15 |
| 4 | IME composition | [`04-ime-composition.md`](./04-ime-composition.md) | AT-UIEDIT-16..20 |
| 5 | Undo/redo | [`05-undo-redo.md`](./05-undo-redo.md) | AT-UIEDIT-21..25 |
| 6 | Paste handling | [`06-paste-handling.md`](./06-paste-handling.md) | AT-UIEDIT-26..30 |

---

## Criteria Summary

- [x] Cursor position preserved across all node operations.
- [x] IME composition events do not trigger autosave.
- [x] Undo/redo stack scoped per session, capped at 100 entries.
- [x] Paste preserves rich text from supported sources, strips unknown formatting.
- [x] All keyboard shortcuts match `spec/31-app/01-features/05-interactions.md`.
