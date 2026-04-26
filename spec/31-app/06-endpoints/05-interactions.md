# Endpoints — 05 Interactions

> **Version:** 1.0.0
> **Updated:** 2026-04-26 (UTC+8)
> **Parent:** [`./00-overview.md`](./00-overview.md)
> **Mirrors feature:** [`../01-features/05-interactions.md`](../01-features/05-interactions.md)

---

## Summary

**No dedicated server endpoints.**

Keyboard and mouse interactions (Enter to create sibling, Tab to indent, Shift+Tab to outdent, drag-and-drop reorder) are translated client-side into calls to existing endpoints:

| Interaction | Resulting endpoint |
|-------------|--------------------|
| Enter (new sibling) | `EP-ITEMS-CREATE` |
| Tab (indent) | `EP-ITEMS-MOVE` (new parent = previous sibling) |
| Shift+Tab (outdent) | `EP-ITEMS-MOVE` (new parent = grandparent) |
| Drag-and-drop reorder | `EP-ITEMS-MOVE` with `BeforeId`/`AfterId` |
| Backspace on empty | `EP-ITEMS-DELETE` |
| Cmd/Ctrl+Z / Cmd/Ctrl+Shift+Z | Client-side undo stack — never a server endpoint |

---

## Why no endpoints

Interactions are an input layer; the contract is in `01-information-model.md`. Defining a `POST /interactions/keypress` endpoint would couple UI to wire format and is explicitly forbidden.

---

## Cross-References

| Topic | Link |
|-------|------|
| Keyboard contract | [`../01-features/05-interactions.md`](../01-features/05-interactions.md) |
| Editor undo/redo | `mem://features/editor-core` |
