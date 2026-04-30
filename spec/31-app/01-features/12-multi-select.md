# Multi-Select Behavior

> **API Contract:** See [`spec/31-app/06-endpoints/12-multi-select.md`](../06-endpoints/12-multi-select.md) for the endpoint surface that backs this feature (request/response envelopes, status codes, error shapes). Bidirectional cross-link added 2026-04-30 to close **F-AUD42-04** (App-folder audit Phase 5).


> **Version:** 2.4.0
> **Updated:** 2026-04-27 — Linked addendum `12b-multi-select-zoom.md` (zoom with N>1 selected → ephemeral virtual scope). Prior: 2026-04-26 — APP-FIX-08: aspirational-paths disclaimer added to Component Contract (closes audit F-07 for this file). Prior: 2026-04-26 — APP-FIX-03: Realtime Transport callout added (closes audit F-05 for this file)
> **Parent:** [00-overview.md](./00-overview.md)
> **Template:** [13-feature-file-template.md](../../01-spec-authoring-guide/13-feature-file-template.md)
> **Addendum:** [`12b-multi-select-zoom.md`](./12b-multi-select-zoom.md) — Multi-select zoom virtual-scope behaviour, AT-MZ-01..06.


## Database Routing

| Database | Tables read/written | Notes |
|---|---|---|
| **Root DB** | (read) `WorkspaceMember` for capability check | Selection scope cannot cross workspace. |
| **App DB** (per workspace) | `Items` (bulk move/delete/tag writes), `ItemTags`, `MirrorGroup` (when bulk affects sources) | All bulk operations batched into a single App-DB transaction. |
| **Cross-DB joins** | **Forbidden.** | Cross-workspace selection is not supported. |

> **Audit cite:** Section added 2026-04-30 to close **F-AUD42-02** (App-folder audit Phase 4). Mirrors the Root-DB / App-DB split per ADR-0019.

---

## Overview

Multi-select lets users act on many items at once via Shift/Cmd-click ranges, ⌘A, or click-and-drag (future). A floating bulk-action bar appears at the bottom with Complete, Delete, Move To…, Indent/Outdent, Duplicate, and Change Type. Selection is scoped to the current zoom view and never crosses zoom boundaries.

## User Story

As a power user reorganizing a long outline, I want to select dozens of items at once and act on them in bulk, so that I avoid hundreds of repetitive clicks.

---

### 12.1 Selecting Multiple Items

| Interaction | Behavior |
|-------------|----------|
| Click item + hold ⇧ (Shift) + click another item | Selects a contiguous range of visible items between the two clicks (inclusive). |
| Click item + hold ⌘ (Cmd) + click another item | Adds or removes individual items from the selection without affecting others. |
| ⌘A (Cmd+A) | Selects all visible items under the current zoom root. |
| Escape | Clears the entire selection. |

### 12.2 Visual Feedback
- Selected items show a light accent background highlight across the full row.
- A floating selection count badge appears at the bottom of the screen: "X items selected".
- The badge includes a "Clear" button to deselect all.

### 12.3 Bulk Actions on Selection

When multiple items are selected, a **bulk action bar** appears at the bottom of the screen (above the selection badge):

| Action | Behavior |
|--------|----------|
| Complete | Marks all selected items as completed. |
| Delete | Moves all selected items to trash. Confirmation dialog if count > 5. |
| Move To… | Opens location picker. Moves all selected items to the chosen parent. |
| Indent | Indents all selected items one level (if valid for all). |
| Outdent | Outdents all selected items one level (if valid for all). |
| Duplicate | Duplicates all selected items as siblings below their original positions. |
| Change type | Opens Turn Into submenu. Converts all selected items to the chosen type. |

### 12.4 Multi-Select Restrictions

| Restriction | Rule |
|-------------|------|
| Cannot select across zoom levels | Selection only applies to items visible in the current zoom view. |
| Cannot drag multi-selected items | Drag-and-drop works on single items only. For bulk moves, use "Move To…". |
| Mirrors in selection | Bulk actions apply to the canonical source. A warning is shown if mirrors are in the selection. |

---

## Storage

| Layer | Tables | Notes |
|-------|--------|-------|
| **Root DB** | — | Selection state is client-only; no Root DB touch. |
| **App DB** (per workspace) | `Items` (bulk move/delete/tag writes), `ItemTags`, `Mirrors` (when bulk action affects sources) | Bulk operations are batched into a single transaction per App DB. |
| **Cross-DB joins** | **Forbidden.** | A selection cannot span workspaces. |

---

## Realtime Transport

| Channel | Mechanism | Fallback |
|---------|-----------|----------|
| Bulk move / delete / tag broadcast to peers (one batch event per transaction) | **WP-native SSE** keyed by `(UserId, WorkspaceId)` | **5 s poll** of `/api/sync?since={ServerTs}` when SSE drops |

> Per [`14-concurrency-and-sync.md`](./14-concurrency-and-sync.md) §14.1 and `00-overview.md` L9. WebSockets / Pusher / Supabase Realtime are **forbidden**. Bulk operations emit a single SSE event with the affected `ItemId` list, not one event per row.

---

## Inputs

| Field | Type | Source | Required | Notes |
|-------|------|--------|----------|-------|
| `currentZoomId` | `string` | URL / zoom state | Yes | Selection is scoped to this subtree |
| `visibleItems` | `Item[]` | Current page render | Yes | Drives ⌘A and Shift-range bounds |
| `anchorItemId` | `string \| null` | Last clicked item | No | Range start for Shift-click |
| `selectedIds` | `Set<string>` | React state | Yes | The current selection set |
| `modifierKeys` | `{ shift: boolean; meta: boolean }` | DOM event | Yes | Drives range vs toggle behavior |

## Outputs

| Output | Persisted? | Channel | Notes |
|--------|-----------|---------|-------|
| Selected row highlight | ❌ | React state | Accent background on `.row[data-selected]` |
| Selection count badge | ❌ | React state | "X items selected" + Clear button |
| Bulk action bar render | ❌ | React state | Visible only when `selectedIds.size > 1` |
| Bulk Complete | ✅ SQLite | UPDATE `Item.completedAt` for all IDs | Atomic batch |
| Bulk Delete | ✅ SQLite | UPDATE `Item.deletedAt` for all IDs | Confirm if >5 |
| Bulk Move | ✅ SQLite | UPDATE `Item.parentId` for all IDs | Single transaction |
| Bulk Indent/Outdent | ✅ SQLite | UPDATE `Item.parentId` + sort_key | Skips invalid items |
| Bulk Duplicate | ✅ SQLite | INSERT N new items | New IDs, sibling position |
| Bulk Change Type | ✅ SQLite | UPDATE `Item.itemType` | All selected rows |
| `selection:changed` event | ❌ | Event bus | Drives bar visibility |

## Edge Cases

1. User Shift-clicks across a collapsed parent — range includes only visible items (collapsed children excluded).
2. User ⌘A while focused inside a contenteditable — block; ⌘A selects text in the field, not items.
3. User ⌘A under a deeply zoomed root with 250+ visible items — selects all 250 (matches view cap).
4. User attempts to drag a multi-selected item — block with toast "Use Move To… for bulk moves".
5. Selection contains a mirror — warning banner "Bulk actions apply to the original item; X mirrors in selection".
6. Selection contains items the user can only View (shared, no Edit) — bulk Edit/Delete actions are disabled with tooltip "No edit access on N items".
7. User triggers Bulk Delete with 6+ items — confirmation dialog "Delete N items? They'll move to trash".
8. User triggers Bulk Indent on items where some are already first-children — those items skip; toast "N items couldn't be indented".
9. User zooms while items are selected — selection clears with toast "Selection cleared (zoom changed)".
10. User presses Escape — selection clears immediately; bar hides.
11. Selection includes the zoom root — exclude root from any action (root cannot be deleted/indented).
12. Network drops mid-bulk operation — operation queues per offline-resilience; rows show pending state.
13. User Shift-clicks to extend a selection beyond the current page (scroll-virtualized) — virtualizer pre-renders the range to compute IDs.

## Acceptance Tests

| ID | Given | When | Then | testid |
|----|-------|------|------|--------|
| AT-MULTISELECT-01 | Items A, B, C, D visible | User clicks A, then Shift-clicks D | A, B, C, D all show selected highlight | `multiselect-row` |
| AT-MULTISELECT-02 | Item A is selected | User ⌘-clicks C | A and C are selected; B and D are not | `multiselect-row` |
| AT-MULTISELECT-03 | Focus is on the outline (not in contenteditable) | User presses ⌘A | All visible items under zoom root become selected | `multiselect-row` |
| AT-MULTISELECT-04 | Focus is inside a contenteditable | User presses ⌘A | Text selects in the field; no items selected | `multiselect-row` |
| AT-MULTISELECT-05 | 3 items selected | View renders | Floating badge "3 items selected" + Clear button appear | `multiselect-badge` |
| AT-MULTISELECT-06 | Selection has 2+ items | View renders | Bulk action bar appears with Complete, Delete, Move, Indent, Outdent, Duplicate, Change Type buttons | `multiselect-action-bar` |
| AT-MULTISELECT-07 | 3 items selected | User clicks Complete in bar | All 3 marked completed atomically | `bulk-complete-button` |
| AT-MULTISELECT-08 | 3 items selected | User clicks Delete | Items move to trash without dialog (count ≤5) | `bulk-delete-button` |
| AT-MULTISELECT-09 | 6 items selected | User clicks Delete | Confirm dialog "Delete 6 items?" appears | `bulk-delete-confirm` |
| AT-MULTISELECT-10 | 4 items selected | User clicks Move To… | Location picker opens; on confirm all 4 reparent atomically | `bulk-move-dialog` |
| AT-MULTISELECT-11 | Selection contains a mirror | Bar renders | Warning banner "Bulk actions apply to the original item; 1 mirror in selection" | `multiselect-mirror-warning` |
| AT-MULTISELECT-12 | Selection contains View-only items | Bar renders | Edit/Delete/Move buttons disabled; tooltip "No edit access on N items" | `bulk-permission-disabled` |
| AT-MULTISELECT-13 | Items selected | User attempts to drag one | Drag blocked; toast "Use Move To… for bulk moves" | `multiselect-drag-block-toast` |
| AT-MULTISELECT-14 | Items selected | User zooms into a child | Selection clears; toast "Selection cleared (zoom changed)" | `multiselect-cleared-toast` |
| AT-MULTISELECT-15 | Items selected | User presses Escape | Selection clears; bar and badge disappear | `multiselect-action-bar` |
| AT-MULTISELECT-16 | Bulk Indent on 3 items where 1 is already first-child | User clicks Indent | 2 indent successfully; toast "1 item couldn't be indented" | `bulk-indent-button` |

## Component Contract

> **Note:** None of these components exist yet — paths are the planned implementation order (aspirational, not normative). The disclaimer mirrors `01-information-model.md` L149 and feeds the global component-contract map (M-3). AI implementers MUST NOT treat the paths as binding imports.

| Surface | Component path | `data-testid` | Acceptance tests |
|---------|---------------|---------------|------------------|
| Selectable item row | `src/components/items/BulletItem.tsx` | `multiselect-row` | AT-MULTISELECT-01..04 |
| Selection badge | `src/components/multiselect/SelectionBadge.tsx` | `multiselect-badge` | AT-MULTISELECT-05 |
| Bulk action bar | `src/components/multiselect/BulkActionBar.tsx` | `multiselect-action-bar` | AT-MULTISELECT-06, 15 |
| Bulk Complete button | `src/components/multiselect/BulkCompleteButton.tsx` | `bulk-complete-button` | AT-MULTISELECT-07 |
| Bulk Delete button | `src/components/multiselect/BulkDeleteButton.tsx` | `bulk-delete-button` | AT-MULTISELECT-08 |
| Bulk Delete confirm | `src/components/multiselect/BulkDeleteDialog.tsx` | `bulk-delete-confirm` | AT-MULTISELECT-09 |
| Bulk Move dialog | `src/components/multiselect/BulkMoveDialog.tsx` | `bulk-move-dialog` | AT-MULTISELECT-10 |
| Bulk Indent button | `src/components/multiselect/BulkIndentButton.tsx` | `bulk-indent-button` | AT-MULTISELECT-16 |
| Mirror warning | `src/components/multiselect/MirrorWarning.tsx` | `multiselect-mirror-warning` | AT-MULTISELECT-11 |
| Permission-disabled tooltip | `src/components/multiselect/PermissionDisabledTooltip.tsx` | `bulk-permission-disabled` | AT-MULTISELECT-12 |
| Drag-block toast | `src/components/feedback/InfoToast.tsx` | `multiselect-drag-block-toast` | AT-MULTISELECT-13 |
| Selection-cleared toast | `src/components/feedback/InfoToast.tsx` | `multiselect-cleared-toast` | AT-MULTISELECT-14 |

> **Note:** Components are planned paths — none exist yet. Feeds the global component-contract map (M-3).

---

## Workflowy Feature Reference (F3) — Bulk Structural Operations

> **Source:** Workflowy product feature list, merged 2026-04-28 (lossless, additive). Reproduced verbatim; cross-linked to existing AT-MS-* rows above and to the per-item operations defined in [`./06-item-context-menu.md`](./06-item-context-menu.md) F3 appendix.

When N ≥ 2 items are selected via Shift/Cmd-click (or keyboard range), the floating multi-select toolbar exposes:

- **Bulk Move To** — Open the move-target picker; selected items (and their subtrees) are moved as a contiguous block under the chosen destination, preserving sibling order. Cycle-protected. `⌘+Shift+M`
- **Bulk Mirror To** — Create a mirror peer for **each** selected item at the chosen destination. Each mirror joins the corresponding source's peer group (or creates a new singleton-then-pair group). `⌘+Shift+L`
- **Move Here / Mirror Here** — When dragging the selection, drop targets show inline `Move Here` / `Mirror Here` chips; choose at drop time. (drag chrome)
- **Bulk Delete** — Soft-delete every selected item; all subtrees go to Trash. Single confirmation toast covers the whole batch with an Undo affordance (`global-undo-toast`). `⌘⌫`
- **Bulk Complete / Uncomplete** — On a selection of `todo` rows, toggle `completed` for every row in one action. Rows of other types in the selection are ignored (no error). `⌘↵`
- **Bulk Tag / Untag** — Apply or remove a `#tag` across the entire selection. (toolbar)
- **Bulk Export** — Export the selection (and subtrees) as a single Markdown / OPML / plain-text document. → [`./13-templates.md`](./13-templates.md) F4 appendix.
- **Bulk Add to Templates** — Snapshot the selection as a multi-root template. → [`./13-templates.md`](./13-templates.md) F4 appendix.
- **Zoom Selection** — When N ≥ 2 selected, ⌘. opens the **virtual scope** ephemeral page containing only the selection (per `mem://features/multi-select`). `⌘`
- **Clear Selection** — Esc clears the selection and dismisses the toolbar. `Esc`

### Selection rules (already canonical)

- Selection is **flat**: choosing a parent does not implicitly select its children, but bulk operations on a parent always include its subtree.
- Selection survives expand/collapse of unrelated items; collapsing an ancestor of a selected item does NOT deselect it.
- The 250-item view limit applies to render, not to selection — bulk ops on > 250 items are allowed and progress is reported via `bulk-progress` toast.

> Cross-link: per-item equivalents in [`./06-item-context-menu.md`](./06-item-context-menu.md) F3 appendix; multi-select zoom semantics in [`./12b-multi-select-zoom.md`](./12b-multi-select-zoom.md).

---

## Related

- [05-interactions.md](./05-interactions.md) — single-item Shift/Cmd-click base behavior
- [06-item-context-menu.md](./06-item-context-menu.md) — Move To… and Turn Into menus reused for bulk
- [09-mirrors.md](./09-mirrors.md) — bulk actions resolve to canonical source
- [11-trash-view.md](./11-trash-view.md) — Bulk Delete sends here
- `mem://features/multi-select` — Shift/Cmd-click bulk-operation rules
- [`./14-concurrency-and-sync.md`](./14-concurrency-and-sync.md) — ← Concurrency + sync rules (forward link from)
- [12b-multi-select-zoom.md](./12b-multi-select-zoom.md) — addendum: zoom interaction when ≥2 items selected

---

## Database Scope

- **Anchor:** [`07-db-diagram/00b-split-db-anchor.md`](../07-db-diagram/00b-split-db-anchor.md)
- **Scope:** `[db-scope: app]`
- **Tables:** nodes (bulk), trash
- **Cross-DB JOINs:** forbidden (split-DB invariant). Cross-DB orchestration, if any, follows ADR-0019.

---

## Architecture Anchors (load-bearing ADRs)

- **ADR-0023 — Loader↔Queue Contract:** Loaders MUST read the local IndexedDB mirror first (≤16 ms p95, never fetch). Mutations MUST write `{mirror, queue_ledger}` in a **single IDB transaction**; the queue worker is the **sole egress** to the WordPress REST surface. SSE frames are read-signals only and MUST NOT enqueue to the FIFO. See `spec/30-architecture/adr/0023-loader-queue-contract.md`.
- **ADR-0017 — Named Error Boundaries:** This feature renders inside **`EditorBoundary`**. A single top-level boundary is **forbidden**. Loader/action errors surface via the matching named boundary; uncaught render errors escalate to `AppErrorBoundary`. See `spec/30-architecture/adr/0017-error-boundaries.md`.
- **ADR-0025 — Realtime is SSE-only:** Cross-tab/cross-client signals arrive via `/stream/page/{id}` and `/stream/user/{id}` (PascalCase frames, `Last-Event-ID` replay). WebSocket / long-poll / 3rd-party push are **forbidden**.

---

## Settings Surface

- **Persisted booleans introduced by this feature:** None.
- **N/A justification:** Pure interaction grammar — no persisted booleans.
- **Compliance:** Satisfies the MUST in [`00-overview.md:140`](./00-overview.md) by explicit declaration. Any future boolean added here MUST route through `Sanitizer::bool()` and be enumerated in an `OptionNameType` case (see APP-FIX-05).

---

## Backend Write Surface

> Enumerated per F-AUD42-22 (BE:0 closure). All routes follow the **PascalCase API envelope** (ADR-0004/0019: `Status, Attributes, Results` mandatory). Mutations go through the **queue worker** (ADR-0023) — never direct fetch from React.

### REST Routes (write)

| Method | Path | Operation | Idempotency / Concurrency |
|--------|------|-----------|---------------------------|
| `POST` | `/wp-json/workflowy/v1/items/bulk-move` | `BulkMove` | IdempotencyKey (per batch) |
| `POST` | `/wp-json/workflowy/v1/items/bulk-complete` | `BulkToggleComplete` | IdempotencyKey |
| `DELETE` | `/wp-json/workflowy/v1/items/bulk` | `BulkSoftDelete` | IdempotencyKey |

### SSE Frames Emitted (read-signal only, ADR-0025)

`BulkOperationCommitted (single fan-out frame with Results[])` on `/stream/page/{id}` and/or `/stream/user/{id}`. SSE MUST NOT enqueue to the FIFO (read-signal only).

### Storage

- **Tables touched:** nodes (bulk), trash
- **Error boundary on failure:** `EditorBoundary`
- **Cross-DB JOINs:** forbidden (see Database Scope stanza above).

### Endpoint SSOTs

Detailed request/response fixtures live under [`spec/31-app/06-endpoints/`](../06-endpoints/) and [`97b-endpoint-envelope-fixtures.md`](../06-endpoints/97b-endpoint-envelope-fixtures.md).
