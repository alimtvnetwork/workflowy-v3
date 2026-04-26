# Item Context Menu (⋮)

> **Version:** 2.5.0
> **Updated:** 2026-04-26 — Round-3 AUDIT-03: clarified Board / Dashboard rows as `ItemType` values with child-rendering effect (NOT separate VIEW modes); link to taxonomy doc. Prior: 2026-04-26 — AUDIT-02a: snake_case → PascalCase rename of DB identifiers in code spans (closes audit F-01 for this file). Prior: 2026-04-26 — APP-FIX-08: aspirational-paths disclaimer added to Component Contract (closes audit F-07 for this file). Prior: 2026-04-26 — APP-FIX-03: Realtime Transport callout added (closes audit F-05 for this file)
> **Parent:** [00-overview.md](./00-overview.md)
> **Template:** [13-feature-file-template.md](../../01-spec-authoring-guide/13-feature-file-template.md)

---

## Overview

The item context menu is the dropdown that opens from the ⋮ trigger on every item row. It exposes type conversions, item-level actions (complete, note, date, comment, move, mirror, share, export, sort, archive, tag, delete), and read-only metadata. This is the catch-all action surface — every action that does not have a dedicated keyboard shortcut lives here.

## User Story

As a user, I want a single discoverable menu that lists every action I can perform on an item — without forcing me to memorize 30 keyboard shortcuts — so that I can convert types, attach files, mirror, share, sort, and recover anywhere in my outline with two clicks.

---

Opens as a dropdown anchored to the ⋮ trigger. Scrollable if content exceeds the viewport.

### 5.1 Turn Into Submenu

Appears as a nested submenu when the user hovers or clicks "Turn into…".

| Type | Icon | Shortcut | Behavior |
|------|------|----------|----------|
| Bullets | List icon | ⌥⌘8 | Converts the item to a standard bullet. This is the default type. |
| Heading 1 | "H1" text | ⌥⌘1 | Converts to Heading 1. Content renders larger and bolder. |
| Heading 2 | "H2" text | ⌥⌘2 | Converts to Heading 2. |
| Heading 3 | "H3" text | ⌥⌘3 | Converts to Heading 3. |
| Paragraph | "¶" text | ⌥⌘4 | Converts to paragraph. No bullet dot shown. Full-width text. |
| To-do | Empty checkbox | ⌥⌘9 | Converts to a checkbox item. Shows ☐ or ☑ instead of the bullet dot. |
| Number | Numbered list icon | — | Converts to numbered list. Shows auto-incremented number based on sibling position. |
| Board | Grid icon | — | Sets `Items.ItemType = 'board'`. Child-rendering mode: kanban (children become columns, grandchildren become cards — see `07-board-view.md`). Only available if the item has children. |
| Dashboard | Dashboard icon | — | Sets `Items.ItemType = 'dashboard'`. Child-rendering mode: dashboard/overview layout with metrics and visual summaries. Only available if the item has children. **Note:** "Board view" / "Dashboard view" refer to the child-rendering effect of the parent's `ItemType`, NOT a separate VIEW field — see [`spec/18-spec-issues/07-audit-03-dashboard-taxonomy.md`](../../18-spec-issues/07-audit-03-dashboard-taxonomy.md). |
| Quote | Quote mark icon | ⌥⌘7 | Converts to blockquote. Renders with a left border accent and light background. Italic text. |
| Code Block | Code icon | ⌥⌘6 | Converts to code block. Renders in monospace font with a light background. |
| Divider | Horizontal line icon | — | Converts to a horizontal divider. No editable content — just a thin line. |

### 5.2 Item Actions

| Action | Icon | Shortcut | Behavior | Feedback |
|--------|------|----------|----------|----------|
| Complete | Checkmark | ⌘↵ | Toggles completion state. | Completed: strikethrough + muted. Toast: "Item completed" or "Item uncompleted". |
| Add note | Sticky note | ⇧↵ | Opens or creates a note area below the item content. Focus moves to the note editor. | Note area slides in smoothly. |
| Add date | Calendar | !! | Opens a date picker. Select a date to assign it to the item. | Date badge appears next to the content (e.g. "📅 Mar 18"). Clicking the badge offers "Remove date". |
| Add comment | Speech bubble | ^M | Opens the comment side panel (right-side slide-in, ~360px) for this item. Focus moves to the comment input. | Comment count badge appears on the item if comments exist. |
| Move To… | Right arrow | — | Opens a location picker dialog. User browses or searches a tree of all their items. Selecting a target moves the item there (changes its parent). | Toast: "Moved to {target name}". Error if attempting to move into own descendant. |
| Move to Today | Calendar + "Today" | — | Assigns today's date to the item. | Toast: "Moved to Today". |
| Move to Tomorrow | Calendar + "Tomorrow" | — | Assigns tomorrow's date. | Toast: "Moved to Tomorrow". |
| Move to Next Week | Calendar + "Next Week" | — | Assigns next Monday's date. | Toast: "Moved to Next Week". |
| Upload file | Paperclip | — | Opens a file picker. Uploads the selected file and attaches it to this item. Max 10MB per file. | File chip appears below the note area showing: 📎 filename.pdf (2.3MB). |
| Mirror To… | Diamond + link | ⇧⌘M | Opens a location picker. Creates a mirror reference at the selected location (see §8 for full mirror spec). | Toast: "Mirror created in {target name}" with subtitle: "Mirrors stay synced. Duplicates do not." |
| Duplicate | Copy+ icon | ⇧⌘D | Deep-duplicates the item and all its children. The new copy is inserted as a sibling directly below the original. | Toast: "Item duplicated". The new item briefly highlights for ~1 second then fades. |
| Share | Share icon | — | Opens the share dialog (see §7). | — |
| Export | Download icon | — | Exports this item and all its children. Format options: OPML, Plain Text, JSON, Markdown. | Downloads the file. |
| Copy internal link | Link icon | ⇧⌘L | Copies a deep link to this specific item to the clipboard. | Toast: "Link copied to clipboard ✓". |
| Make template | Template icon | — | Saves the current item's structure (content + entire children tree) as a reusable template. Opens a dialog to name and describe the template. | Toast: "Template saved". |
| Expand all | Double chevron down | — | Recursively expands all children of this item. | Smooth cascading animation. |
| Collapse all | Double chevron up | — | Recursively collapses all children of this item. | Smooth cascading animation. |
| Sort A-Z | A-Z arrow icon | — | Sorts direct children alphabetically A→Z by content text. | Items animate/slide to new positions. |
| Sort Z-A | Z-A arrow icon | — | Sorts direct children Z→A. | Same animation. |
| Archive | Archive icon | — | Moves the item and its entire subtree to a separate archive database. The item appears as an "Archived" badge in its parent's children list. Reversible via "Unarchive" action. | Toast: "Item archived". |
| Add tag… | Tag icon | — | Opens the tag picker popover. User can search existing tags, toggle tags on/off, or create a new tag. Inline `#hashtag` typing in content also auto-creates and assigns tags. | Tag pills appear below the item content. |
| Delete | Trash can icon | — | Moves the item and all its children to trash. Soft delete with 30-day retention before permanent deletion. | Toast: "Item deleted" with an "Undo" action button that lasts 5 seconds. |

### 5.3 Item Metadata (bottom of context menu)

Separated from the actions above by a thin divider line. Non-interactive, informational only.

| Field | Format | Example |
|-------|--------|---------|
| Changed | Relative/absolute timestamp + user name | "Today at 06:54pm by Abdullah Al Mahin" |
| Created | Relative/absolute timestamp + user name | "Mar 15 at 02:30pm by Abdullah Al Mahin" |
| Mirrored from (only on mirrors) | Source item title, clickable | "Mirrored from: Project Plan" — clicking zooms to the source. |

Displayed in very small, muted text.

---

## Storage

| Layer | Tables | Notes |
|-------|--------|-------|
| **Root DB** | (read) `WorkspaceMember` for capability checks | See [`spec/05-split-db-architecture/00-overview.md`](../../05-split-db-architecture/00-overview.md). |
| **App DB** (per workspace) | `Items` (move/duplicate/delete writes), `Mirrors` (mirror create), `ItemTags` (tag actions), `Comments` (comment action) | All mutations from this menu land here. |
| **Cross-DB joins** | **Forbidden.** | Capability check resolves in Root DB → action executes in App DB. |

---

## Realtime Transport

| Channel | Mechanism | Fallback |
|---------|-----------|----------|
| Per-action mutation broadcasts (`item:moved`, `item:deleted`, `item:tagged`, `item:archived`, `item:mirrored`, `item:shared`, `item:commented`) to peers | **WP-native SSE** keyed by `(UserId, WorkspaceId)` | **5 s poll** of `/api/sync?since={ServerTs}` when SSE drops |

> Per [`14-concurrency-and-sync.md`](./14-concurrency-and-sync.md) §14.1 and `00-overview.md` L9. WebSockets / Pusher / Supabase Realtime are **forbidden**. Each menu action produces exactly one SSE event; sub-effects (e.g. mirror-cascade) reuse the callouts in `09-Mirrors.md`, `12-multi-select.md`, `07-board-view.md`.

---

## Inputs

| Field | Type | Source | Required | Notes |
|-------|------|--------|----------|-------|
| `targetItem` | `Item` | Row that owns the ⋮ trigger | Yes | Drives metadata + per-type availability |
| `triggerRect` | `DOMRect` | Anchor element | Yes | Drives popover position |
| `currentUser` | `User` | Auth session | Yes | Enables/disables share, archive, delete |
| `hasChildren` | `boolean` | Derived from `targetItem` | Yes | Gates Board, Dashboard, Sort, Expand/Collapse-all |
| `isMirror` | `boolean` | Derived from `targetItem.SourceId` | Yes | Drives "Mirrored from" metadata row |
| `tagsCatalog` | `Tag[]` | Per-user tags from SQLite | Yes | Feeds Add-tag popover |
| `templatesCount` | `number` | API: `GET /templates/count` | No | Used by template-naming dialog |
| `quotaState` | `{ used: number; limit: number } \| null` | `GET /usage` | No | Disables Duplicate when over quota |

## Outputs

| Output | Persisted? | Channel | Notes |
|--------|-----------|---------|-------|
| Type conversion | ✅ SQLite | `Items.ItemType` | One row per Turn-Into selection |
| Toggle complete | ✅ SQLite | `Items.CompletedAt` | Children unaffected |
| Note created/edited | ✅ SQLite | `Items.Note` | Inline editor commits on blur |
| Date assignment | ✅ SQLite | `Items.DueDate` | Drives Today/Tomorrow/Next Week badges |
| Comment thread opened | ✅ SQLite | `Comments` table | Side panel anchored to source item |
| Move | ✅ SQLite | `Items.ParentId` + `Items.SortOrder` | Subtree moves intact |
| Mirror | ✅ SQLite | `Mirrors` table (`SourceId` + `ParentId`) | Item ID of source unchanged (per `01-information-model.md` §1.2) |
| Duplicate | ✅ SQLite | `Items` insert (deep copy) | New IDs for every cloned row |
| Tag assignment | ✅ SQLite | `ItemTags` junction | Auto-creates `Tags` row if new |
| File upload | ✅ Object storage + SQLite `Attachments` | `POST /files` | 10 MB hard cap |
| Export download | ❌ | Browser `Blob` download | OPML / Plain / JSON / Markdown |
| Internal-link clipboard write | ❌ | `navigator.clipboard.writeText` | Toast confirms |
| Template save | ✅ SQLite | `templates` table | Snapshot + name + description |
| Sort children | ✅ SQLite | `Items.SortOrder` for children | One transaction |
| Archive | ✅ SQLite | `Items.ArchivedAt` (or separate `archive` table) | Reversible via Unarchive |
| Soft delete | ✅ SQLite | `Items.DeletedAt` | 30-day retention per `11-trash-view.md` |
| `menu:opened` / `menu:action` events | ❌ | Event bus | Drives telemetry |

## Edge Cases

1. Item has no children — Board, Dashboard, Sort A-Z, Sort Z-A, Expand-all, Collapse-all are disabled with explanatory tooltips.
2. Item is a mirror — Make Template and Archive are disabled (mirrors must be converted to canonical first); "Mirrored from" row appears in metadata.
3. Item is the user's root — Delete and Move-To are disabled (per `01-information-model.md` §1.1).
4. Free-tier user is at the 250-item quota cap — Duplicate is disabled with tooltip linking to upgrade (per `03-edge-cases/01-edge-cases.md` row 4).
5. Move-To target is the item itself or one of its descendants — block with toast "Cannot move item into its own children".
6. Mirror-To target is the same parent that already holds the source — allow but warn ("This mirror sits next to its source").
7. Mirror-To target already contains a mirror of this source under that parent — block; toast "A mirror of this item already exists here".
8. Upload file > 10 MB — block at picker with toast "File too large (max 10 MB)".
9. Sort A-Z on children that include locked-position items (e.g. divider) — locked items keep their position; only sortable children reorder.
10. Delete on an item with mirrors — show warning dialog per `03-edge-cases/01-edge-cases.md` row 2 ("This item has X mirrors. Deleting will break those references.").
11. Copy internal link in a context where `navigator.clipboard` is denied — fallback to selecting the URL in a toast input the user can copy manually.
12. User opens menu, scrolls outline, presses Escape — menu closes; focus returns to the originating ⋮ trigger.
13. Two ⋮ triggers clicked rapidly on different items — only one menu open at a time; the second click closes the first and opens the second.
14. Menu height exceeds viewport — menu becomes scrollable inside; submenu (Turn Into) opens above instead of below if there is no room.
15. Template save for a subtree of 1000+ items — show progress modal; persist atomically or rollback.

## Acceptance Tests

| ID | Given | When | Then | testid |
|----|-------|------|------|--------|
| AT-CTXMENU-01 | Item row with `hasChildren = true` | User clicks ⋮ | Menu opens; Board, Dashboard, Sort A-Z, Expand-all are enabled | `context-menu` |
| AT-CTXMENU-02 | Item row with `hasChildren = false` | User opens menu | Board, Dashboard, Sort A-Z, Expand-all are disabled with tooltips | `context-menu-disabled` |
| AT-CTXMENU-03 | User opens Turn-Into submenu and clicks "Heading 1" | Conversion commits | `Items.ItemType = 'H1'`; row re-renders at H1 size | `turn-into-h1` |
| AT-CTXMENU-04 | Item is a to-do; user clicks Complete | Action commits | `CompletedAt` set; row strikethrough; toast "Item completed" | `action-complete` |
| AT-CTXMENU-05 | User clicks Add note | Editor opens | Note area slides in below content; focus is on note editor | `note-editor` |
| AT-CTXMENU-06 | User clicks Add date and selects Mar 18 | Picker confirms | Date badge "📅 Mar 18" appears next to content; `DueDate` persisted | `date-badge` |
| AT-CTXMENU-07 | User clicks Move-To → selects descendant of itself | Confirm fires | Toast "Cannot move item into its own children"; tree state unchanged | `move-error-toast` |
| AT-CTXMENU-08 | User clicks Mirror-To → selects valid target | Confirm fires | New mirror row inserted under target; toast "Mirror created in {name}" | `action-mirror` |
| AT-CTXMENU-09 | Item is the user's root | User opens menu | Delete and Move-To items are disabled with tooltips | `context-menu-root` |
| AT-CTXMENU-10 | Free-tier user at 250-item cap clicks Duplicate | Click fires | Action is disabled; tooltip links to upgrade page | `action-duplicate-disabled` |
| AT-CTXMENU-11 | User clicks Upload file and chooses an 11 MB file | Picker validates | Toast "File too large (max 10 MB)"; no upload request fires | `upload-error-toast` |
| AT-CTXMENU-12 | User clicks Copy internal link | Action commits | `navigator.clipboard.writeText` fires with deep-link URL; toast "Link copied to clipboard ✓" | `action-copy-link` |
| AT-CTXMENU-13 | User clicks Sort A-Z on children of length 5 | Action commits | Children re-render in alphabetical order; `SortOrder` updated | `action-sort` |
| AT-CTXMENU-14 | Item has 3 mirrors; user clicks Delete | Confirm dialog opens | Dialog text includes "This item has 3 mirrors…"; cancel keeps state | `delete-mirror-warning` |
| AT-CTXMENU-15 | Menu is open; user presses Escape | Key event fires | Menu closes; focus returns to ⋮ trigger | `context-menu-trigger` |
| AT-CTXMENU-16 | Item is a mirror | User opens menu | Metadata row "Mirrored from: {source title}" renders; clicking it zooms to source | `metadata-mirrored-from` |

## Component Contract

> **Note:** None of these components exist yet — paths are the planned implementation order (aspirational, not normative). The disclaimer mirrors `01-information-model.md` L149 and feeds the global component-contract map (M-3). AI implementers MUST NOT treat the paths as binding imports.

| Surface | Component path | `data-testid` | Acceptance tests |
|---------|---------------|---------------|------------------|
| Context-menu trigger (⋮) | `src/components/tree/ContextMenuTrigger.tsx` | `context-menu-trigger` | AT-CTXMENU-15 |
| Context menu shell | `src/components/items/ContextMenu.tsx` | `context-menu`, `context-menu-disabled`, `context-menu-root` | AT-CTXMENU-01..02, 09 |
| Turn-Into submenu | `src/components/items/TurnIntoSubmenu.tsx` | `turn-into-h1`, `turn-into-h2`, `turn-into-h3`, `turn-into-paragraph`, `turn-into-todo`, `turn-into-board`, `turn-into-dashboard`, `turn-into-quote`, `turn-into-code`, `turn-into-divider` | AT-CTXMENU-03 |
| Action: Complete | `src/components/items/actions/CompleteAction.tsx` | `action-complete` | AT-CTXMENU-04 |
| Note editor (slide-in) | `src/components/items/NoteEditor.tsx` | `note-editor` | AT-CTXMENU-05 |
| Date picker + badge | `src/components/items/DatePicker.tsx` | `date-badge` | AT-CTXMENU-06 |
| Move-To dialog | `src/components/items/MoveToDialog.tsx` | `move-to-dialog`, `move-error-toast` | AT-CTXMENU-07 |
| Action: Mirror | `src/components/items/actions/MirrorAction.tsx` | `action-mirror` | AT-CTXMENU-08 |
| Action: Duplicate | `src/components/items/actions/DuplicateAction.tsx` | `action-duplicate`, `action-duplicate-disabled` | AT-CTXMENU-10 |
| Upload file action | `src/components/items/actions/UploadAction.tsx` | `upload-button`, `upload-error-toast` | AT-CTXMENU-11 |
| Action: Copy internal link | `src/components/items/actions/CopyLinkAction.tsx` | `action-copy-link` | AT-CTXMENU-12 |
| Action: Sort A-Z / Z-A | `src/components/items/actions/SortAction.tsx` | `action-sort` | AT-CTXMENU-13 |
| Delete-mirror warning dialog | `src/components/items/DeleteMirrorWarningDialog.tsx` | `delete-mirror-warning` | AT-CTXMENU-14 |
| Metadata footer | `src/components/items/ContextMenuMetadata.tsx` | `metadata-changed`, `metadata-created`, `metadata-mirrored-from` | AT-CTXMENU-16 |

> **Note:** None of these components exist yet — paths are the planned implementation order. This table feeds the global component-contract map (M-3).

---

## Related

- [04-page-content-area.md](./04-page-content-area.md) — where the ⋮ trigger lives in the row
- [05-interactions.md](./05-interactions.md) — keyboard shortcut alternatives for many of these actions
- [08-share-dialog.md](./08-share-dialog.md) — the dialog opened by Share
- [09-mirrors.md](./09-mirrors.md) — full mirror semantics
- [11-trash-view.md](./11-trash-view.md) — destination of Delete
- [13-templates.md](./13-templates.md) — destination of Make Template
- [03-edge-cases/01-edge-cases.md](../03-edge-cases/01-edge-cases.md) — global edge-case index
