# 3. Routing & Focus

> **Parent:** [`./00-overview.md`](./00-overview.md)
> **Reference:** `40-navbar-breadcrumb.png`, `52-absolute-path-and-context-menu.png`

---

## URL structure

| Route | Pattern | Meaning |
|-------|---------|---------|
| Home root | `/` | User's root node, no focus. Breadcrumb hidden. |
| Focused node | `/n/{nodeId}` | Focused on the node with ID `{nodeId}`. Breadcrumb visible. |
| Search active | `/search?q={query}` | **Search Popover open** (Phase 2 v2.0.0 — popover anchored to navbar, not full-screen). Tree below remains interactive but is live-filtered + highlighted. |
| Today view | `/today` | Special calendar/today view. See Phase 7. |
| Trash | `/trash` | Trash view. See Phase 6 special nodes. |
| Settings | `/settings` | Settings page. See Phase 8. |

> Node IDs are opaque ULIDs (e.g. `01HX3K9ZB7QR8VWMNPYTC4FE2D`). They are stable across renames and never re-used. (See data-model spec for ID generation rules.)

---

## Focus history stack

The navbar's `←` / `→` buttons operate on a focus history stack, separate from the browser's history but mirrored to it via `pushState` / `popState`.

| Action | Stack effect |
|--------|--------------|
| User clicks a node to focus on it | `back.push(currentFocus); current = clickedNode; forward.clear()` |
| User clicks `←` | `forward.push(current); current = back.pop()` |
| User clicks `→` | `back.push(current); current = forward.pop()` |
| User clicks `⌂` home | `back.push(current); current = root; forward.clear()` |
| User clicks a breadcrumb segment | Same as clicking a node: `back.push(current); current = segment; forward.clear()` |
| Browser `popstate` event | Mirrors stack — moves cursor without push. |

---

## Focus mode rules

When focused on a non-root node:

1. The breadcrumb in the navbar shows the absolute path.
2. The **focused node's content is rendered as an H1-style title** above the tree (NOT as a bullet). See [`01-layout.md`](./01-layout.md) → focused-node title.
3. Only **descendants** of the focused node are rendered in the tree below.
4. The focused node's bullet (`●`) is **not** shown — its title acts as the implicit root.
5. No expand/collapse arrow on the focused node title (it is always "expanded").

When focused on the root (`/`):

1. Breadcrumb is hidden.
2. The root node's label is shown as the H1 title (e.g. "Home" or user-defined).
3. All top-level children are rendered as bullets.

---

## Special routes

| Route | Behavior |
|-------|----------|
| `/n/{invalidId}` | Show "Node not found" empty state. Offer "Go home" button. |
| `/n/{trashedId}` | If node is in trash, show banner "This node is in trash" + "Restore" / "Go home" buttons. |
| `/n/{deniedId}` | If user lacks permission (shared node), show 403 empty state. |

---

## Deep-link behavior

- Opening a `/n/{nodeId}` URL in a new tab focuses on that node directly. The focus history stack starts empty (back/forward both disabled).
- Refreshing the page preserves focus.
- `Ctrl+Click` on a breadcrumb segment opens that focus in a new tab.

---

## URL ↔ breadcrumb sync

The breadcrumb is derived from the URL on every render:

```
url.nodeId → resolveAncestors(nodeId) → ancestor[] → render breadcrumb
```

If the focused node is renamed, the URL does **not** change (IDs are stable). Only the breadcrumb labels re-render.

---

## Out of scope

- Search Popover routing details (URL ↔ query sync) → see [`../02-search/`](../02-search/00-overview.md).
- Today/Calendar routing → see [`../07-calendar/`](../07-calendar/00-overview.md).
- Settings page routing → see [`../08-app-shell/`](../08-app-shell/00-overview.md).
- Sharing routes (public links) → deferred to sharing model spec.
