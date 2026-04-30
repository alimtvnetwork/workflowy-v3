# Board View Specification

> **API Contract:** See [`spec/31-app/06-endpoints/07-board-view.md`](../06-endpoints/07-board-view.md) for the endpoint surface that backs this feature (request/response envelopes, status codes, error shapes). Bidirectional cross-link added 2026-04-30 to close **F-AUD42-04** (App-folder audit Phase 5).


> **Version:** 2.6.0
> **Updated:** 2026-04-27 — Linked sibling SSOT `07b-dashboard-view.md` (same data, depth=1 card-grid presentation). Prior: 2026-04-26 — AUDIT-02a: snake_case → PascalCase rename of DB identifiers in code spans (closes audit F-01 for this file). Prior: 2026-04-26 — APP-FIX-08: aspirational-paths disclaimer added to Component Contract (closes audit F-07 for this file). Prior: 2026-04-26 — APP-FIX-03: Realtime Transport callout added (closes audit F-05 for this file)
> **Parent:** [00-overview.md](./00-overview.md)
> **Template:** [13-feature-file-template.md](../../01-spec-authoring-guide/13-feature-file-template.md)
> **Sibling SSOT:** [`07b-dashboard-view.md`](./07b-dashboard-view.md) — Dashboard view (same tree data, depth-1 inline-editable card grid).

---

## Overview

Board view is a Kanban-style **presentation mode** of the current item's subtree. Direct children render as columns, grandchildren as cards. The underlying tree model is unchanged — toggling between List and Board never mutates structure, only rendering. Drag/drop on the board mutates the same `ParentId` + `SortOrder` fields list view uses.

## User Story

As a user managing a workflow (tasks, releases, recruiting pipeline), I want to flip my outline into a draggable Kanban board without restructuring it, so that I can visualize and rebalance work columns and switch back to outline view at any time without losing data.

---

### 6.1 Definition
Board view is a **Kanban-style visualization of the current item's subtree**. It is a **presentation mode only** — it does NOT change the underlying data structure. The tree model remains exactly the same.

**Key principle**: Board view does not break the underlying tree model. It only changes how items are displayed.

### 6.2 Structure Mapping

| Tree Concept | Board Concept | Relationship |
|-------------|---------------|-------------|
| Current zoomed item | Board root | The item whose type is set to "board". |
| Direct children of root | Columns | Each child renders as a vertical column. The column header is the child's content text. |
| Grandchildren (children within each column) | Cards | Rendered as draggable cards inside their parent column. |

Visual example:
- Tree: `Project Launch > Todo > [Task A, Task B]` + `Project Launch > Doing > [Task D]` + `Project Launch > Done > [Task F]`
- Board: Three columns (Todo, Doing, Done) with cards (A, B in Todo; D in Doing; F in Done).

### 6.3 Column Behavior

| Interaction | Behavior |
|-------------|----------|
| Reorder columns | Drag column header to a new position. This changes the sibling order of the root's direct children. |
| Rename column | Click the column header text to edit it inline. This updates the child item's content. |
| Add column | A "+ Add column" button at the far right creates a new child of the board root. |
| Delete column | Column header has a small context menu with "Delete column". Warning shown if the column has cards. |
| Collapse column | Click a toggle on the column header to collapse it to just the header (hides cards). |

### 6.4 Card Behavior

| Interaction | Behavior |
|-------------|----------|
| Click card | Zooms into that item (same as clicking a bullet dot in list view). |
| Drag card within column | Reorders the card within the same column. Changes the sibling order within that parent. |
| Drag card between columns | Moves the card to a different column. This changes the card's parent item to the new column. |
| Card display | Shows: content text (truncated to 2 lines), completion checkbox (if the item is a to-do type), date badge, mirror badge, and comment count. |
| Add card | A "+ Add card" button at the bottom of each column creates a new child of that column item. |
| Card context menu | Right-click or ⋮ on a card opens the same item context menu as list view (§5). |

### 6.5 Board View Eligibility

| Condition | Board View Available? |
|-----------|----------------------|
| Item has at least 1 child | ✅ Yes |
| Item has 0 children | ❌ No — show message: "Add child items to use Board view." |
| User explicitly selects Board layout | ✅ Yes |
| Item is a leaf node (no children at all) | ❌ No — disable the board toggle. |

### 6.6 Board View Visual Design

| Element | Description |
|---------|-------------|
| Column | Light muted background. Rounded corners. ~280px wide. Minimum height ~200px. Scrollable vertically when cards overflow. |
| Column header | Slightly bolder text. Sticky at top of column while scrolling. Includes a small context menu trigger. |
| Card | White/light background with subtle border. Rounded corners. Padding inside. Slight shadow. Hover: shadow deepens. |
| Board container | Horizontal scroll when columns exceed viewport width. Spacing between columns. Padding around the board. |
| Drop indicator | A thin blue line where the card will be inserted on drop. |

### 6.7 Columns Are Customizable

Columns are just regular items, so users can name them anything:
- "Todo", "Doing", "Done"
- "Backlog", "In Review", "Approved", "Blocked"
- "Week 1", "Week 2", "Week 3"

No special admin logic required — the tree model handles everything naturally.

---

## Enum Sources (normative)

| Enum mentioned in this file | Canonical SSOT | Strategy |
|------------------------------|----------------|----------|
| `ViewMode` (`List` / `Board`) | [`spec/20-enums-index.md`](../../20-enums-index.md) §3 | TS Strategy B (`as const` + derived union) — see [`spec/02-coding-guidelines/02-typescript/00-overview.md`](../../02-coding-guidelines/02-typescript/00-overview.md) |
| `Breakpoint` (`Mobile` / `Tablet` / `Desktop`) | [`spec/20-enums-index.md`](../../20-enums-index.md) §3 | TS Strategy B |
| `ItemType` (when card kind matters) | [`spec/20-enums-index.md`](../../20-enums-index.md) §2 | TS Strategy B |

> **Forbidden:** TS `enum` keyword and bare literal unions. Always import the canonical `as const` object.

---

## Storage

| Layer | Tables | Notes |
|-------|--------|-------|
| **Root DB** | — | Board view does not touch Root DB. |
| **App DB** (per workspace) | `Items` (read tree, write `ParentId` + `SortOrder` on drag) | Board is a *view* over the same `Items` rows the list view uses. No board-specific table. |
| **Cross-DB joins** | **Forbidden.** | Workspace resolved before opening this view. |

---

## Realtime Transport

| Channel | Mechanism | Fallback |
|---------|-----------|----------|
| Card add / move / rename broadcast to peers | **WP-native SSE** keyed by `(UserId, WorkspaceId)` | **5 s poll** of `/api/sync?since={ServerTs}` when SSE drops |

> Per [`14-concurrency-and-sync.md`](./14-concurrency-and-sync.md) §14.1 and `00-overview.md` L9. WebSockets / Pusher / Supabase Realtime are **forbidden**.

---

## Inputs

| Field | Type | Source | Required | Notes |
|-------|------|--------|----------|-------|
| `boardRootId` | `string` | Router (current zoomed item) | Yes | Drives query for columns |
| `columns` | `Item[]` | SQLite — direct children of `boardRootId` | Yes | Order = `SortOrder` |
| `cardsByColumn` | `Record<string, Item[]>` | SQLite — children of each column item | Yes | Lazy-loaded per column on first render |
| `viewMode` | `ViewMode` enum | Persisted on `boardRootId` | Yes | Must equal `Board` to render this view |
| `dragState` | `DragState \| null` | DnD library | No | Tracks card or column drag |
| `collapsedColumns` | `Set<string>` | `localStorage` per user | Yes | Per-column collapse persists across sessions |
| `viewport` | `Breakpoint` enum | `matchMedia` | Yes | Drives column width / horizontal scroll |

## Outputs

| Output | Persisted? | Channel | Notes |
|--------|-----------|---------|-------|
| Column reorder | ✅ SQLite | `Items.SortOrder` of column row | Same field list view uses |
| Column rename | ✅ SQLite | `Items.Content` of column row | Optimistic update |
| New column | ✅ SQLite | `items` insert under `boardRootId` | Inherits Board parent |
| Column delete | ✅ SQLite | `Items.DeletedAt` (soft) | 30-day retention; cards cascade |
| Card move within column | ✅ SQLite | `Items.SortOrder` of card row | Fractional sort |
| Card move across columns | ✅ SQLite | `Items.ParentId` + `Items.SortOrder` | One transaction |
| New card | ✅ SQLite | `items` insert under column row | Default `ItemType = 'Bullet'` |
| Card click → zoom | ❌ | Router push | Same as bullet-dot click in list view |
| Column collapse toggle | ✅ `localStorage` | `ui.boardCollapsed[id]` | Per-user persisted |
| `board:dropped` event | ❌ | Event bus | Drives telemetry + sync broadcast |

## Edge Cases

1. Board root has 0 children — show empty-state message "Add child items to use Board view."; toolbar still allows adding the first column.
2. User deletes the only remaining column — auto-switch back to List view (per `03-edge-cases/01-edge-cases.md` row 13).
3. Column has 0 cards — render the column with just the header and the "+ Add card" button (per row 14).
4. Card is a mirror — render the mirror badge on the card; dragging the mirror moves the **mirror** (not the source); zoom click navigates to the source's deep link.
5. Drag card onto its own descendant — block the drop with the same toast list view uses ("Cannot move item into its own children").
6. Column item already has the `ItemType = 'Board'` (a board-of-boards) — render its cards but flag with a small icon indicating nested board; clicking the column header zooms into the nested board.
7. User toggles List ↔ Board on the same item rapidly — debounce the persisted `viewMode` write to 200 ms; UI flips immediately.
8. Two tabs reorder different columns concurrently — both writes apply via fractional `SortOrder`; LWW per M-4 if they collide on the same column.
9. Column is collapsed and a new card arrives via real-time sync — the column header card-count increments; the column stays collapsed until user expands it.
10. Card content exceeds 2 lines — truncate with ellipsis; full content visible on zoom or hover-tooltip after 500 ms.
11. Free-tier user adds a 251st item via "+ Add card" — block per `03-edge-cases/01-edge-cases.md` row 4 (item-limit toast).
12. Horizontal scroll past the rightmost column reveals the "+ Add column" button always anchored at the end.

## Acceptance Tests

| ID | Given | When | Then | testid |
|----|-------|------|------|--------|
| AT-BOARD-01 | Item has 3 children, each with 2 grandchildren | User toggles to Board view | 3 columns render with 2 cards each in `SortOrder` | `board-container` |
| AT-BOARD-02 | Item has 0 children | User toggles to Board view | Empty-state message + "+ Add column" button render; no columns | `board-empty` |
| AT-BOARD-03 | Board has 3 columns | User drags column 3 to position 1 | Columns re-render in new order; `Items.SortOrder` of all 3 columns updates | `board-column-header` |
| AT-BOARD-04 | Column header reads "Todo" | User clicks the header text | Header becomes inline-editable; on commit `Items.Content = "WIP"` persists | `board-column-name` |
| AT-BOARD-05 | Board has 3 columns | User clicks "+ Add column" | New column appears at far right; new `items` row exists under `boardRootId` | `board-add-column` |
| AT-BOARD-06 | Card C is in column A at position 1 | User drags it to column A position 3 | Card re-renders at position 3; `SortOrder` updates; `ParentId` unchanged | `board-card` |
| AT-BOARD-07 | Card C is in column A | User drags it onto column B | Card appears in column B; `ParentId = B.id`; `SortOrder` reflects drop position | `board-card` |
| AT-BOARD-08 | Card row | User clicks the card | Router navigates to `/items/{cardId}`; zoom occurs (same as bullet-dot click) | `board-card` |
| AT-BOARD-09 | Card content is 5 lines long | Card renders | Visible content is 2 lines with ellipsis; tooltip with full content appears after 500 ms hover | `board-card-content` |
| AT-BOARD-10 | Card is a mirror | Card renders | Mirror badge visible on the card; clicking zooms to the source item | `mirror-badge` |
| AT-BOARD-11 | User drags card C onto its own descendant | Drop fires | Toast "Cannot move item into its own children"; tree state unchanged | `dnd-error-toast` |
| AT-BOARD-12 | Column has 4 cards; user clicks the column collapse toggle | Toggle fires | Cards hide; header remains; `localStorage.ui.boardCollapsed[id] = true` | `board-column-collapse` |
| AT-BOARD-13 | Board has 1 column with 1 card; user deletes the column | Confirm fires | Column + card removed; viewMode auto-switches to List (per edge-case 2) | `board-delete-column` |
| AT-BOARD-14 | Free-tier user is at 250-item cap | User clicks "+ Add card" | Toast "Item limit reached…" with upgrade button; no row inserted | `quota-toast` |
| AT-BOARD-15 | Columns exceed viewport width | Page renders | Board container is horizontally scrollable; "+ Add column" anchored at far right | `board-container` |

## Component Contract

> **Note:** None of these components exist yet — paths are the planned implementation order (aspirational, not normative). The disclaimer mirrors `01-information-model.md` L149 and feeds the global component-contract map (M-3). AI implementers MUST NOT treat the paths as binding imports.

| Surface | Component path | `data-testid` | Acceptance tests |
|---------|---------------|---------------|------------------|
| Board container | `src/components/board/BoardContainer.tsx` | `board-container`, `board-empty` | AT-BOARD-01..02, 15 |
| Column | `src/components/board/BoardColumn.tsx` | `board-column` | AT-BOARD-03..05 |
| Column header (editable) | `src/components/board/BoardColumnHeader.tsx` | `board-column-header`, `board-column-name` | AT-BOARD-03..04 |
| Add-column button | `src/components/board/AddColumnButton.tsx` | `board-add-column` | AT-BOARD-05 |
| Column collapse toggle | `src/components/board/ColumnCollapseToggle.tsx` | `board-column-collapse` | AT-BOARD-12 |
| Column delete confirm | `src/components/board/ColumnDeleteDialog.tsx` | `board-delete-column` | AT-BOARD-13 |
| Card | `src/components/board/BoardCard.tsx` | `board-card`, `board-card-content` | AT-BOARD-06..09 |
| Mirror badge on card | `src/components/items/MirrorBadge.tsx` | `mirror-badge` | AT-BOARD-10 |
| DnD error toast | `src/components/feedback/ErrorToast.tsx` | `dnd-error-toast` | AT-BOARD-11 |
| Quota toast | `src/components/feedback/QuotaToast.tsx` | `quota-toast` | AT-BOARD-14 |
| Drop indicator | `src/components/board/DropIndicator.tsx` | `board-drop-indicator` | AT-BOARD-06..07 |

> **Note:** None of these components exist yet — paths are the planned implementation order. This table feeds the global component-contract map (M-3).

---

## Workflowy Feature Reference (F4) — Fractal Board UX

> **Source:** Workflowy product feature list, merged 2026-04-28 (lossless, additive). Reproduced verbatim; cross-linked to existing AT-BOARD-* rows above and to the structural-sync rules in `mem://features/board-view`.

- **Fractal Board** — Convert any item into a Kanban-style board. Direct children render as **columns**; each column's children render as **cards**. The board is "fractal" because zooming into any card opens it as a board if it has the `board` ItemType, or as a list otherwise — the same data tree is just visualised differently. (slash: `/board`, item-menu: *Convert to Board*)
- **Add Column to Board** — The `+ Column` button on the right edge appends a new direct child to the board item; that child is the new column. (component: `board-add-column`)
- **Add Card to Column** — The `+ Card` button at the bottom of any column appends a new child to that column. New cards inherit the default `bullet` ItemType. (component: `board-add-card`)
- **Move Cards** — Drag a card across columns to re-parent it; drop targets render `card-drop-zone` overlays. Move within a column reorders via fractional sort keys (per `mem://features/editor-core`).
- **Move Columns** — Drag a column header horizontally to reorder; reorders via fractional sort key on the board's direct-child sequence.
- **Card Click** — Single click opens an inline card editor; double-click (or click the bullet) zooms into the card as a full page. (interaction: `card-row`)
- **Column Header Edit** — The column header is the column item's content field; clicking it switches to an inline editor (same `item-row` text component).
- **Hide Completed (per board)** — Boards honour the global Show/Hide Completed toggle (see [`./06-item-context-menu.md`](./06-item-context-menu.md) F3 appendix); completed cards are dimmed or hidden depending on toggle state.
- **Convert Board → List** — Item-menu *Convert to Bullet* (or any non-board type) reverts the visualisation to the list renderer. The underlying tree is unchanged. (item-menu)

> **Structural sync:** every board action MUST mutate through the same item CRUD path used by the list renderer — boards are a view, not a separate store. See `mem://features/board-view` for the sync invariant. F7 reconciliation candidate: confirm `card-drop-zone` reorder dispatches the same fractional-sort patch as the list renderer's drag handler.

---

## Related

- [01-information-model.md](./01-information-model.md) — board view is presentation only; data model unchanged
- [03-layout-structure.md](./03-layout-structure.md) — NavBar layout-toggle that switches List ↔ Board
- [04-page-content-area.md](./04-page-content-area.md) — list-view counterpart
- [06-item-context-menu.md](./06-item-context-menu.md) — same context menu fires on cards
- [09-mirrors.md](./09-mirrors.md) — mirror-card semantics
- [03-edge-cases/01-edge-cases.md](../03-edge-cases/01-edge-cases.md) — board edge-case rows
- [07b-dashboard-view.md](./07b-dashboard-view.md) — sister card-grid view (same data, different layout)

---

## Database Scope

- **Anchor:** [`07-db-diagram/00b-split-db-anchor.md`](../07-db-diagram/00b-split-db-anchor.md)
- **Scope:** `[db-scope: app]`
- **Tables:** nodes (board children), node_view_state
- **Cross-DB JOINs:** forbidden (split-DB invariant). Cross-DB orchestration, if any, follows ADR-0019.

---

## Architecture Anchors (load-bearing ADRs)

- **ADR-0023 — Loader↔Queue Contract:** Loaders MUST read the local IndexedDB mirror first (≤16 ms p95, never fetch). Mutations MUST write `{mirror, queue_ledger}` in a **single IDB transaction**; the queue worker is the **sole egress** to the WordPress REST surface. SSE frames are read-signals only and MUST NOT enqueue to the FIFO. See `spec/30-architecture/adr/0023-loader-queue-contract.md`.
- **ADR-0017 — Named Error Boundaries:** This feature renders inside **`RouteErrorBoundary`**. A single top-level boundary is **forbidden**. Loader/action errors surface via the matching named boundary; uncaught render errors escalate to `AppErrorBoundary`. See `spec/30-architecture/adr/0017-error-boundaries.md`.
- **ADR-0025 — Realtime is SSE-only:** Cross-tab/cross-client signals arrive via `/stream/page/{id}` and `/stream/user/{id}` (PascalCase frames, `Last-Event-ID` replay). WebSocket / long-poll / 3rd-party push are **forbidden**.
