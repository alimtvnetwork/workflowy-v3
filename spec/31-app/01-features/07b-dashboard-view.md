# Dashboard View Specification

> **Version:** 1.0.0
> **Created:** 2026-04-27 — Closes B2 confidence gap (Dashboard rendering). Sister spec to [`07-board-view.md`](./07-board-view.md).
> **Parent:** [00-overview.md](./00-overview.md)
> **Related SSOTs:** [`20-enums-index.md`](../../20-enums-index.md) §3.5 ItemType, [`18-spec-issues/07-audit-03-dashboard-taxonomy.md`](../../18-spec-issues/07-audit-03-dashboard-taxonomy.md)

---

## 1. Overview

Dashboard view is a **card-grid presentation mode** of the current item's **direct children**. It is a **presentation mode only** — toggling between List, Board, and Dashboard never mutates tree structure. The same `ParentId` + `SortOrder` fields drive all three.

**Sister to Board.** Board renders direct children as **kanban columns** (and grandchildren as cards). Dashboard renders the **same direct children** as a **flat grid of cards** — no columns, no grandchildren shown. Same data, different visualisation.

## 2. User Story

As a user with a parent item that holds many sibling tasks/notes/items, I want to flip its rendering into a card grid (with inline title + completion editing) so I can scan progress at a glance without zooming into each child, and switch back to outline view without losing data.

---

## 3. Definition & Scope

### 3.1 Rendering rule
A Dashboard item renders its **direct children only** (`depth = 1`). Descendants below depth 1 are **not** rendered in the dashboard surface — they remain reachable by zooming into a card.

### 3.2 Card content
Each immediate child renders as a card with:

| Slot | Source | Editable inline? |
|------|--------|------------------|
| Title | child's `Content` (first line) | ✅ yes |
| Completion bar / checkbox | child's `IsCompleted` (and aggregate of `todo` descendants if any) | ✅ yes |
| Type icon | child's `ItemType` icon | ❌ |
| Snippet | first ~80 chars of child's `Content` after the title line | ❌ (zoom to edit) |
| Child count | `count(children)` | ❌ (derived) |

### 3.3 Inline edit semantics
- **Title edit** writes `Items.Content` of the **child**, not the dashboard item. Same op as bullet rename — flows through `useTreeStore.updateContent()` → `Op.Update`.
- **Completion toggle** writes `Items.IsCompleted` of the child. Same op as a `todo` checkbox.
- **Deeper edits** (notes body, sub-children, type change) require **zoom-into** the card — Dashboard surface does NOT expose them.

### 3.4 Out of scope (vs Board)
- ❌ No columns. No `ItemType` grouping.
- ❌ No grandchildren visible.
- ❌ No metrics/charts (counts on each card are per-child only, not aggregated across the dashboard).
- ❌ No saved-query / smart-folder behaviour.

---

## 4. Structure Mapping

| Tree concept | Dashboard concept | Relationship |
|--------------|-------------------|--------------|
| Current item with `ItemType = 'dashboard'` | Dashboard root | Renders the card grid for its direct children. |
| Direct children of root | Cards | Each child = one card. Order = `SortOrder`. |
| Grandchildren | Hidden | Reachable only by zooming into a card. |

Visual example:
- Tree: `Sprint 12 > [Login refactor, Billing bug, Docs cleanup]`
- Dashboard: Three cards (Login refactor, Billing bug, Docs cleanup) in a responsive grid; titles editable inline; checkbox per card.

---

## 5. Interaction & Hotkeys

| Action | Trigger | Result |
|--------|---------|--------|
| Edit card title | Click title | Inline contenteditable, `Enter` commits, `Esc` reverts. |
| Toggle completion | Click checkbox | Same as bullet `Cmd+Enter`. |
| Zoom into card | Click card body (outside title/checkbox) | Navigates to that child as the new zoom root (List rendering). |
| Reorder cards | Drag card | Updates child's `SortOrder` (same op as outline drag). |
| Add new card | `Enter` on empty grid area or `+` button | Creates new direct child of dashboard at end. |
| Switch view | `ItemType` change via context menu (`turn-into-list`, `turn-into-board`) | Re-renders, no data mutation. |

---

## 6. Acceptance Tests

| ID | Test |
|----|------|
| **AT-DV-01** | An item with `ItemType = 'dashboard'` renders as a card grid; one card per direct child. |
| **AT-DV-02** | Grandchildren are NOT visible on the dashboard surface (depth = 1 enforced). |
| **AT-DV-03** | Editing a card title writes the child's `Content` and emits a single `Op.Update` for the child (NOT the dashboard). |
| **AT-DV-04** | Toggling a card checkbox flips the child's `IsCompleted` and is undoable. |
| **AT-DV-05** | Dragging a card to a new grid position updates the child's `SortOrder` only; no other field changes. |
| **AT-DV-06** | Switching `ItemType` from `dashboard` → `bullet` or `board` changes only `ItemType`; child set, `Content`, and `SortOrder` are unchanged (presentation-only invariant). |
| **AT-DV-07** | Clicking a card body zooms into the child (URL/zoom-root changes); clicking the title enters edit mode without zooming. |
| **AT-DV-08** | Adding a card via the `+` button creates a new `Items` row with `ParentId = dashboard.Id` and `SortOrder = max+1`. |

---

## Related

- **ItemType SSOT:** [`spec/20-enums-index.md`](../../20-enums-index.md) §3.5 — `dashboard` is one of 12 `ItemType` values; child-rendering effect (parallel to `board`).
- **Why dashboard is an ItemType (not a ViewMode):** [`spec/18-spec-issues/07-audit-03-dashboard-taxonomy.md`](../../18-spec-issues/07-audit-03-dashboard-taxonomy.md) §2.3.
- **Sister view:** [`07-board-view.md`](./07-board-view.md) — same data, kanban-style.
- **Page content area row:** [`04-page-content-area.md`](./04-page-content-area.md) §3.3 (Bullet Types table).
- **Component contract:** [`spec/32-ui-design/01-architecture/05-component-contract-map.md`](../../32-ui-design/01-architecture/05-component-contract-map.md) — `turn-into-dashboard` test id.

---

## Inputs

- Current item context: an `Item` row with `ItemType = 'dashboard'` and its direct children (`Items WHERE ParentId = dashboard.Id`).
- Inline-edit input events on cards (title text, completion toggle, drag-reorder, zoom click).
- View-switch context-menu actions (`turn-into-list`, `turn-into-board`).

## Outputs

- A responsive card grid rendering one card per direct child (depth = 1).
- DB mutations on child rows only: `Items.Content`, `Items.IsCompleted`, `Items.SortOrder`, and `Items` INSERT for new cards. Dashboard parent row is **never mutated** by Dashboard-surface interactions (the `ItemType` change is a separate explicit op).

## Edge Cases

See §3.4 *Out of scope (vs Board)* and the AT table at §6 for boundary conditions: depth-1 enforcement, no aggregated metrics, no grouping, and zoom-only access to grandchildren.

## Acceptance Tests

The 8 acceptance tests **AT-DV-01 … AT-DV-08** are defined in §6 above. This bare-named heading exists to satisfy G-06 feature-shape; the canonical content lives at §6.

## Component Contract

| Surface | Component path | `data-testid` | Acceptance tests |
|---------|---------------|---------------|------------------|
| Dashboard container | `src/components/dashboard/DashboardContainer.tsx` | `dashboard-container` | AT-DV-01, AT-DV-02 |
| Dashboard card | `src/components/dashboard/DashboardCard.tsx` | `dashboard-card`, `dashboard-card-title`, `dashboard-card-checkbox` | AT-DV-03, AT-DV-04, AT-DV-05 |
| Convert action | `src/components/contextmenu/TurnIntoDashboard.tsx` | `turn-into-dashboard` | AT-DV-06, AT-DV-07, AT-DV-08 |

### Notes

- **Test-id:** `turn-into-dashboard` (context-menu action) per [`spec/32-ui-design/01-architecture/05-component-contract-map.md`](../../32-ui-design/01-architecture/05-component-contract-map.md).
- **State store:** `useTreeStore.updateContent()` (title edits) + `useTreeStore.toggleCompleted()` (checkbox) + `useTreeStore.reorder()` (drag) — same hooks as outline view; Dashboard introduces no new mutation surface.
- **Op envelope:** every card-level mutation produces exactly one `Op.Update` (or `Op.Insert` for new cards) targeting the child row.
