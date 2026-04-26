# Multi-Select Behavior

> **Version:** 2.2.0
> **Updated:** 2026-04-26 — APP-FIX-03: Realtime Transport callout added (closes audit F-05 for this file)
> **Parent:** [00-overview.md](./00-overview.md)
> **Template:** [13-feature-file-template.md](../../01-spec-authoring-guide/13-feature-file-template.md)

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

## Related

- [05-interactions.md](./05-interactions.md) — single-item Shift/Cmd-click base behavior
- [06-item-context-menu.md](./06-item-context-menu.md) — Move To… and Turn Into menus reused for bulk
- [09-mirrors.md](./09-mirrors.md) — bulk actions resolve to canonical source
- [11-trash-view.md](./11-trash-view.md) — Bulk Delete sends here
- `mem://features/multi-select` — Shift/Cmd-click bulk-operation rules
