# Interaction Behaviors

> **Version:** 2.1.0
> **Updated:** 2026-04-26 — APP-FIX-08: aspirational-paths disclaimer added to Component Contract (closes audit F-07 for this file). Prior: 2026-04-19
> **Parent:** [00-overview.md](./00-overview.md)
> **Template:** [13-feature-file-template.md](../../01-spec-authoring-guide/13-feature-file-template.md)

---

## Overview

Defines every keyboard, pointer, and drag interaction on items: Enter/Backspace/Tab semantics, zoom, full-screen search, and autosave. These are the muscle-memory behaviors that make WorkFlowy feel like a native outliner rather than a web form.

## User Story

As a power user, I want every common action — split a line, indent, move, complete, search, undo — to be reachable from the keyboard with predictable, lossless behavior, so that I can structure my outline at typing speed without ever reaching for a menu.

---

### 4.1 Bullet Behaviors

| Interaction | Exact Behavior | Edge Case |
|-------------|----------------|-----------|
| **Enter** on item with text | Cursor splits text at the caret position. Text before the caret stays in the current item. Text after the caret moves to a new sibling item below. The new item gets focus. | If the caret is at the very start: creates an empty sibling above, current item keeps all text. |
| **Enter** on empty item | Creates a new sibling below. Focus moves to the new item. | New sibling is at the same depth level. |
| **Backspace** on empty item | Deletes the item. Cursor moves to the end of the previous visible item. If the deleted item had children, those children move up to become children of the deleted item's parent. | If it's the very first item in the list with no previous item: do nothing. |
| **Tab** | Indents the item — it becomes the last child of the sibling directly above it. | If the item is the first in its level (no sibling above): do nothing. Cannot indent root-level items past the root. |
| **⇧Tab** (Shift+Tab) | Outdents the item — moves it to the parent's level, inserted directly after the parent. Children move together with the item. | If the item is already at root level: do nothing. |
| **⌘↑** (Cmd+Up) | Moves the item up one position in sibling order. | If already the first sibling: do nothing. |
| **⌘↓** (Cmd+Down) | Moves the item down one position in sibling order. | If already the last sibling: do nothing. |
| **↑ Arrow** | Moves focus/cursor to the previous visible item (skips over collapsed children). | At the very first item: do nothing. |
| **↓ Arrow** | Moves focus/cursor to the next visible item (skips over collapsed children). | At the very last item: do nothing. |
| **Click bullet dot** | Zooms into that item — it becomes the root of the view. URL changes to reflect the item. Breadcrumbs update. | — |
| **Drag bullet dot** | Shows a drag ghost of the item. Two types of drop zones appear: (a) between items as a sibling (shown as a horizontal blue line), (b) onto an item as its child (shown as a blue left-border highlight on the target). | Cannot drop an item into its own descendants — show error toast: "Cannot move item into its own children". |
| **Collapse toggle click** | Hides all children. Shows the child count badge. Smooth height animation. | If the item has no children: toggle is invisible. |
| **Expand toggle click** | Shows all children. Removes the child count badge. Smooth height animation. | — |
| **⌘↵** (Cmd+Enter) | Toggles completion state. Completed: text gets strikethrough and muted color. Uncomplete: restores normal style. | Completing a parent does NOT auto-complete its children. |
| **Paste multi-line text** | Auto-splits by newlines. Each line becomes a new sibling item below the current one. The first line replaces the current item's content if the item is empty. | Preserves basic formatting (bold, italic) when pasting formatted text. Strips complex or unknown formatting. |

### 4.2 Zoom Behaviors

| Interaction | Behavior | URL | Breadcrumbs |
|-------------|----------|-----|-------------|
| Click bullet dot | Pushes the current zoom state to the history stack. Sets the clicked item as the new root. Fetches its children. | Changes to item-specific URL. | Updates to show the full ancestor path. |
| Back arrow (←) | Pops from the history stack. Zooms to the previous item. | Updates to reflect the previous item. | Updates accordingly. |
| Forward arrow (→) | Pushes forward in history. Zooms to the next item. | Updates. | Updates. |
| Home button (🏠) | Clears zoom entirely. Shows root-level items. Resets the history stack. | Returns to root URL. | Shows only "Home". |
| Breadcrumb segment click | Zooms to that ancestor. Current zoom state is pushed to history. | Changes to that ancestor's URL. | Truncates breadcrumbs to that level. |

### 4.3 Search Behaviors

| State | Behavior | Visual |
|-------|----------|--------|
| Search opened | Full-screen overlay with a centered search input (max ~640px wide). Semi-transparent dimmed backdrop. Auto-focus on the input field. | Large text input with no border, just a bottom line. Magnifier icon left of input. Close with ✕ button or Escape key. |
| Typing | Debounced search (300ms delay) across all the user's items (content and notes). | Results appear below the input in real time. Loading: subtle spinner inside the input area. |
| Results display | Each result shows: item content with matching text highlighted, and the parent path below in small muted text. Maximum 20 results visible, scrollable beyond that. | Keyboard navigation: ↑↓ arrows to move selection, Enter to zoom into the selected result, Escape to close. Selected result has a light accent background. |
| Click or Enter on result | Closes search. Zooms into that item. | — |
| No results | Shows: "No items found" centered in muted text. | — |
| Empty query | Shows recently visited items (last 5). Header text: "Recent" in muted text. | — |

### 4.4 Autosave Behaviors

| Trigger | Behavior |
|---------|----------|
| Any content change | Debounce 1.5 seconds of inactivity, then save to server. |
| Save in progress | Subtle indicator (pulsing dot or "Saving..." text) somewhere visible. |
| Save complete | Settings menu shows "Autosaved X minutes ago" under the Save action. |
| Save error | Toast notification: "Failed to save. Retrying…" with auto-retry up to 3 times with increasing delays. After 3 failures: persistent toast "Changes not saved. Check your connection." |
| ⌘S manual save | Immediately saves all pending changes. Toast: "✓ Saved". |
| Offline | Queue all changes locally. On reconnect: sync queued changes in order. Toast: "Back online. Syncing changes…" then "✓ All changes synced". |
| Tab/window close with unsaved changes | Browser warning: "You have unsaved changes." |

---

## Inputs

| Field | Type | Source | Required | Notes |
|-------|------|--------|----------|-------|
| `focusedItemId` | `string \| null` | DOM focus tracker | Yes | Drives keyboard handlers |
| `caretOffset` | `number` | DOM Selection API | Yes | Required for Enter-split semantics |
| `keyEvent` | `KeyboardEvent` | Global key listener | Yes | Modifier keys (⌘/⇧/Alt) drive variants |
| `dragSource` | `Item \| null` | DnD library | No | Set on bullet-dot drag start |
| `dropTarget` | `{ itemId: string; mode: 'sibling' \| 'child' } \| null` | DnD library | No | Drives blue line / blue border highlight |
| `searchQuery` | `string` | Search overlay input | No | Debounced 300ms before query fires |
| `recentItemIds` | `string[]` (max 5) | `localStorage` | No | Shown when search query is empty |
| `pendingMutations` | `Mutation[]` | Autosave queue | Yes | Drives save indicator + offline replay |
| `networkOnline` | `boolean` | `navigator.onLine` + ping | Yes | Switches autosave to local-queue mode |

## Outputs

| Output | Persisted? | Channel | Notes |
|--------|-----------|---------|-------|
| Item split / new sibling row | ✅ SQLite | `items` insert + `ParentId` + `SortOrder` | One transaction per Enter |
| Item delete (Backspace on empty) | ✅ SQLite | `items` delete + child re-parent | Children inherit grandparent |
| Indent / outdent | ✅ SQLite | `Items.ParentId` + `Items.SortOrder` | Subtree moves intact |
| Sibling reorder (⌘↑/⌘↓) | ✅ SQLite | `Items.SortOrder` | Fractional sort |
| Toggle complete (⌘↵) | ✅ SQLite | `Items.CompletedAt` | Children unaffected |
| Zoom navigation | ✅ Browser history | `history.pushState` | Drives URL + breadcrumb |
| Search-result selection | ❌ | Router navigate | Pushes new zoom state |
| Autosave commit | ✅ Server | API `PATCH /items/{id}` | Debounced 1.5 s |
| Save toast / error toast | ❌ | Toast bus | "✓ Saved" / "Failed to save…" |
| Offline-queue flush | ✅ Server | API batch on reconnect | Replays in submitted order |

## Edge Cases

1. Enter pressed with caret at position 0 of a non-empty item — creates an empty sibling **above**; current item keeps all text.
2. Backspace on the very first item in the entire outline — no-op.
3. Tab pressed on the first sibling in its level — no-op (no sibling above to nest under).
4. ⇧Tab pressed on a root-level item — no-op (cannot outdent past root).
5. ⌘↑ on the first sibling, or ⌘↓ on the last — no-op.
6. ↑/↓ arrow lands on a divider-type item — skip to the next editable item (per `04-page-content-area.md` AT-PAGE-15).
7. Drag attempts to drop an item onto its own descendant — block with toast "Cannot move item into its own children" (per edge-case row 1 in `03-edge-cases/01-edge-cases.md`).
8. ⌘↵ on a parent with completed children — only the parent's `CompletedAt` toggles; children unaffected.
9. Paste multi-line text into an empty item — first line replaces the empty content; remaining lines become new siblings below.
10. Pasted formatted text contains unknown tags (e.g. `<table>`) — strip to plain text; preserve only Bold / Italic / Underline / Strikethrough / Code.
11. Search query has zero results — show "No items found" centered, do not show the Recent list.
12. Search debounce timer elapses while user is still typing — cancel the in-flight request before firing the new one.
13. Autosave fails 3 times in a row — surface persistent toast "Changes not saved. Check your connection." until next successful save.
14. User closes the tab with `pendingMutations.length > 0` — fire `beforeunload` browser warning.
15. Network drops mid-edit — every subsequent edit appends to the local queue; UI shows offline banner per `03-edge-cases/01-edge-cases.md` row 9.

## Acceptance Tests

| ID | Given | When | Then | testid |
|----|-------|------|------|--------|
| AT-INTERACT-01 | Item content "Hello world" with caret between "Hello " and "world" | User presses Enter | Current item content becomes "Hello "; new sibling below contains "world" and receives focus | `item-row` |
| AT-INTERACT-02 | Empty item with focus | User presses Backspace | Item row is removed; cursor lands at end of previous visible item | `item-row` |
| AT-INTERACT-03 | Item is the first sibling at its level | User presses Tab | No DOM mutation; no API call fires | `item-row` |
| AT-INTERACT-04 | Item is a non-first sibling at depth 2 | User presses Tab | Item becomes last child of the sibling above; depth becomes 3; subtree moves with it | `item-row` |
| AT-INTERACT-05 | Item is at depth 3 | User presses ⇧Tab | Item moves to depth 2 directly after its parent | `item-row` |
| AT-INTERACT-06 | Item is the 2nd of 3 siblings | User presses ⌘↑ | Item becomes the 1st sibling; `SortOrder` updates | `item-row` |
| AT-INTERACT-07 | Item is the last sibling | User presses ⌘↓ | No DOM mutation; no API call | `item-row` |
| AT-INTERACT-08 | Active item is a non-completed to-do | User presses ⌘↵ | Row renders strikethrough + muted; `CompletedAt` is set; child rows unchanged | `todo-checkbox` |
| AT-INTERACT-09 | User drags item A onto its own descendant B | Drop fires | Toast renders "Cannot move item into its own children"; tree state unchanged | `dnd-error-toast` |
| AT-INTERACT-10 | User clicks the search button (or presses ⌘F) | Overlay opens | Full-screen overlay with auto-focused input renders | `search-overlay` |
| AT-INTERACT-11 | Search overlay is open with non-empty query | User types | After 300 ms of inactivity, results render with matching text highlighted | `search-results` |
| AT-INTERACT-12 | Search overlay shows results | User presses ↓ then Enter | Selected result is zoomed; overlay closes | `search-result-row` |
| AT-INTERACT-13 | Search overlay is open with empty query | Overlay renders | "Recent" header + last 5 visited items render | `search-recent` |
| AT-INTERACT-14 | User edits an item | After 1.5 s inactivity | Save indicator appears; API `PATCH /items/{id}` fires once | `save-indicator` |
| AT-INTERACT-15 | Network is offline | User edits an item | Mutation queued locally; offline banner visible; no API call attempted | `offline-banner` |
| AT-INTERACT-16 | Pending mutations exist | User attempts to close the tab | Browser `beforeunload` warning fires | `unsaved-warning` |

## Component Contract

> **Note:** None of these components exist yet — paths are the planned implementation order (aspirational, not normative). The disclaimer mirrors `01-information-model.md` L149 and feeds the global component-contract map (M-3). AI implementers MUST NOT treat the paths as binding imports.

| Surface | Component path | `data-testid` | Acceptance tests |
|---------|---------------|---------------|------------------|
| Global key handler | `src/lib/interactions/useGlobalKeys.ts` | — (hook) | AT-INTERACT-01..08 |
| Item row keyboard handlers | `src/components/tree/ItemRow.tsx` | `item-row` | AT-INTERACT-01..07 |
| To-do checkbox | `src/components/items/TodoCheckbox.tsx` | `todo-checkbox` | AT-INTERACT-08 |
| Drag-and-drop layer | `src/components/tree/DragLayer.tsx` | `dnd-layer` | AT-INTERACT-09 |
| DnD error toast | `src/components/feedback/ErrorToast.tsx` | `dnd-error-toast` | AT-INTERACT-09 |
| Search overlay shell | `src/components/search/SearchOverlay.tsx` | `search-overlay` | AT-INTERACT-10..13 |
| Search results list | `src/components/search/SearchResults.tsx` | `search-results`, `search-result-row` | AT-INTERACT-11..12 |
| Recent items list | `src/components/search/SearchRecent.tsx` | `search-recent` | AT-INTERACT-13 |
| Autosave indicator | `src/components/feedback/SaveIndicator.tsx` | `save-indicator` | AT-INTERACT-14 |
| Offline banner | `src/components/feedback/OfflineBanner.tsx` | `offline-banner` | AT-INTERACT-15 |
| Unsaved-changes warning hook | `src/lib/interactions/useBeforeUnload.ts` | `unsaved-warning` | AT-INTERACT-16 |

> **Note:** None of these components exist yet — paths are the planned implementation order. This table feeds the global component-contract map (M-3).

---

## Related

- [01-information-model.md](./01-information-model.md) — what items the interactions mutate
- [04-page-content-area.md](./04-page-content-area.md) — DOM surface the keys target
- [03-layout-structure.md](./03-layout-structure.md) — Search button, Back/Forward chrome
- [06-item-context-menu.md](./06-item-context-menu.md) — pointer alternative for the same actions
- [03-edge-cases/01-edge-cases.md](../03-edge-cases/01-edge-cases.md) — drag/drop, paste, offline edge cases
