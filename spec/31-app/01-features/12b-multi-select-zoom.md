# 12b — Multi-Select Zoom: Virtual Scope (Clarification)

**Version:** 1.0.0
**Status:** Approved — 2026-04-27
**Supersedes:** Ambiguity in `12-multi-select.md` §Zoom interaction
**Owner:** Product
**Decision context:** Batch 4 clarifications, AI-readiness round 4

---

## 1. Decision

Zooming with multiple items selected creates an **ephemeral virtual scope** — a transient "view" containing only the selected items as if they shared a virtual parent. Closing the virtual scope returns the user to the original tree position with selection preserved.

---

## 2. Behaviour

| Aspect | Value |
|---|---|
| Persistence | **Ephemeral** — virtual scope is client-only state, not written to DB |
| Virtual parent | Synthetic node `virtual:<sessionId>` with title `"N items"` (e.g., "3 items") |
| Children | The N selected items, in their original tree order (DFS pre-order) |
| Editing inside scope | Edits affect the **real** items (titles, completion, drag within scope) |
| Drag out of scope | Disabled — items can only be reordered within the virtual scope |
| Drag into scope | Disabled — virtual scope has fixed membership for its lifetime |
| Add child | Adds a real child to whichever selected item is hovered (not to the virtual parent) |
| Breadcrumb | Shows: `Home › … › "3 items (virtual)"` with the virtual segment styled distinctly (italic + badge) |
| Exit | Click breadcrumb up-level, press `Esc`, or close virtual scope explicitly |
| Selection on exit | Original N items remain selected in the real tree |

---

## 3. State machine

```
NORMAL ──(zoom with N>1 selected)──▶ VIRTUAL_SCOPE
VIRTUAL_SCOPE ──(Esc | breadcrumb up)──▶ NORMAL  (selection preserved)
VIRTUAL_SCOPE ──(zoom into one item I)──▶ NORMAL  (zoomed to I, selection cleared)
VIRTUAL_SCOPE ──(deselect all)──▶ stays in VIRTUAL_SCOPE (membership locked)
```

---

## 4. Edge cases

| Case | Behaviour |
|---|---|
| One of the N items is deleted while in virtual scope | Item disappears from virtual scope; if N drops to 1, auto-collapse to normal zoom on that item; if N drops to 0, exit to NORMAL |
| One of the N items is a mirror peer; peer group edited elsewhere | Content updates live in virtual scope (peer-group sync) |
| User shares an item from inside virtual scope | Standard share flow; virtual parent itself is not shareable |
| User opens Board / Dashboard view inside virtual scope | Renders the N items as cards/columns; virtual parent acts as the container |
| Refresh / navigation away | Virtual scope is lost (ephemeral); user returns to last persisted scope |

---

## 5. Acceptance tests

| ID | Given | When | Then |
|---|---|---|---|
| AT-MZ-01 | 3 items selected (A, B, C) at different tree depths | User presses zoom hotkey | Virtual scope opens with A, B, C as siblings under "3 items" |
| AT-MZ-02 | In virtual scope of {A, B, C} | User edits B's title | Real item B's title updates in DB |
| AT-MZ-03 | In virtual scope of {A, B, C} | User presses Esc | Returns to normal view; A, B, C still selected |
| AT-MZ-04 | In virtual scope of {A, B, C} | User deletes A and B | Scope auto-collapses to normal zoom on C |
| AT-MZ-05 | In virtual scope of {A, B, C} | User tries to drag A out of scope | Drag is rejected (no-drop cursor) |
| AT-MZ-06 | In virtual scope of {A, B, C} | User refreshes page | Returns to last persisted scope (not virtual); A,B,C no longer selected |

---

## 6. Non-goals

- ❌ Persistent virtual scopes (saved views) — future
- ❌ Sharing a virtual scope as a unit — future
- ❌ Cross-account virtual scopes — never (security boundary)

---

## Related

- `spec/31-app/01-features/12-multi-select.md` (parent SSOT)
- `spec/31-app/01-features/05-interactions.md` (zoom hotkey)
- `spec/31-app/01-features/09b-mirror-peer-group-model.md` (peer sync inside scope)
