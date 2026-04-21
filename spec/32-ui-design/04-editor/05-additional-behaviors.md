# Additional Behavioral Specifications

> **Version:** 1.1.0  
> **Updated:** 2026-04-18

---

### 6E.1 Undo/Redo — Scope and Stack (M1)

**Undoable actions (all are reversible with ⌘Z):**

| Action | Undo Behavior |
|--------|--------------|
| Content edit (typing) | Restores previous content. Undo groups rapid keystrokes into a single undo step (group resets after 1 second of inactivity or a different action type). |
| Item type change ("Turn Into…") | Reverts to previous type |
| Item creation (Enter key) | Deletes the new item, merges content back into the original item |
| Item deletion (Backspace on empty) | Restores the item at its original position with original content |
| Indent (Tab) | Outdents the item back |
| Outdent (⇧Tab) | Indents the item back |
| Move (⌘↑/⌘↓, Move To…) | Moves the item back to its original parent and position |
| Complete/uncomplete (⌘↵) | Toggles back |
| Text formatting (bold, italic, etc.) | Removes/restores the formatting |
| Color change | Restores previous color |
| Sort (A-Z / Z-A) | Restores original sibling order |
| Drag-and-drop reorder | Moves item back to original position |
| Delete (to trash) | Restores item from trash to original location |
| Duplicate | Deletes the duplicate |

**NOT undoable (destructive or external):**
- Permanent trash deletion
- Share/unshare actions
- Comment creation/deletion
- File upload/deletion
- Mirror creation/deletion
- Template save/delete

**Stack rules:**
- Stack depth: **100 actions** maximum. Oldest actions are dropped when the limit is reached.
- Scope: **Current session only.** Undo history is cleared on page reload or logout.
- Cross-zoom: Undo works across zoom navigation — undoing returns to the previous view if the action was in a different zoom context.
- Cursor restoration: Undo restores the cursor/caret to its position at the time of the action.
- Redo: ⇧⌘Z. The redo stack is cleared whenever a new action is performed after undo.

---

### 6E.2 Command Palette — Action List (M2)

The command palette (⌘K) provides keyboard access to all major actions. It is a searchable dialog (using shadcn/ui's `Command` component).

**Available commands:**

| Category | Commands |
|----------|----------|
| Navigation | Home, Search (⌘F), Today, Trash, Settings |
| Item types (if an item is focused) | Turn into: Bullet, H1, H2, H3, Paragraph, To-do, Numbered, Board, Quote, Code Block, Divider |
| Item actions (if an item is focused) | Complete, Add note, Add date, Add comment, Move To…, Mirror To…, Duplicate, Share, Export, Copy internal link, Make template, Delete |
| View actions | Expand all, Collapse all, Sort A-Z, Sort Z-A |
| Edit actions | Undo, Redo, Save |
| System | Settings, Help, Report a problem, Log out |
| Theme | Switch to Light mode, Switch to Dark mode, Use system theme |

**Behavior:**
- Typing filters the list by fuzzy matching on command names.
- Each command shows its keyboard shortcut (if one exists) on the right side.
- Selecting a command executes it immediately and closes the palette.
- If no item is focused, item-specific commands are hidden.
- "No results" state: muted text "No matching commands."

---

### 6E.3 Fractional Ordering — Frontend Logic (M3)

The frontend MUST compute `sort_order` values locally for optimistic updates using the same midpoint algorithm as the backend:

| Operation | sort_order Calculation |
|-----------|----------------------|
| Insert between items A (order: 2.0) and B (order: 3.0) | `(2.0 + 3.0) / 2 = 2.5` |
| Insert at the end of a list (last item order: 5.0) | `5.0 + 1.0 = 6.0` |
| Insert at the beginning (first item order: 1.0) | `1.0 - 1.0 = 0.0` |
| Insert between items with very close orders (2.0 and 2.0001) | `(2.0 + 2.0001) / 2 = 2.00005` |
| Gap too small (< 0.0001 between adjacent items) | Trigger a **renumber** — reassign all siblings to whole numbers: 1.0, 2.0, 3.0, etc. Send the renumber as a batch update to the server. |

**Important:** The frontend sends the computed `sort_order` to the server with the create/move request. The server uses the same value. No server-side recalculation is needed except for the renumber case.

---

### 6E.4 Paste Format Rules (M4)

| Paste Source | Behavior |
|-------------|----------|
| Plain text with newlines | Each line becomes a separate sibling item below the current one. First line replaces current item's content if the item is empty. |
| Rich text (Word, Google Docs) | Apply paste sanitization rules from §6A.3. Basic formatting preserved, complex formatting stripped. |
| Spreadsheet cells | Each row becomes a sibling item. Columns within a row are separated by tab characters (preserved as text, not as child items). |
| URL (plain text) | Auto-wrapped in `<a href="URL" target="_blank" rel="noopener">URL</a>`. If the URL is the only content pasted, the entire item content is the link. |
| Image | **Ignored.** Nothing is pasted. (Use "Upload file" instead.) |
| File | **Ignored.** Nothing is pasted. (Use "Upload file" instead.) |
| HTML with tables | Table tags stripped. Cell content extracted row-by-row, separated by tabs within each row, rows separated by newlines (each row = one sibling item). |
| Very large paste (100+ lines) | A progress toast appears: "Creating X items…" with a progress indicator. Items are created in batches of 20 to avoid UI freezing. |

**Format definitions:**
- **Basic (preserved):** `<strong>`, `<em>`, `<u>`, `<s>`, `<code>`, `<a>` links
- **Complex (stripped):** `<table>`, `<img>`, custom fonts, background colors, font sizes, headings (tag stripped, text kept), `<div>`, `<p>` (converted to text with line breaks)

---

### 6E.5 Settings Panel — Full Layout (M5)

The Settings page (`/settings`) contains the following preference sections:

**Appearance**

| Setting | Control Type | Options | Default |
|---------|-------------|---------|---------|
| Theme | 3-option segmented control | Light, Dark, System | System |
| Font size | 3-option segmented control | Small (14px base), Medium (15px base), Large (17px base) | Medium |

**Editor**

| Setting | Control Type | Options | Default |
|---------|-------------|---------|---------|
| Default view | 2-option segmented control | List, Board | List |
| Show completed items | Toggle switch | On / Off | On |
| Auto-collapse depth | Dropdown select | None (never auto-collapse), 2, 3, 4, 5 | None |
| Spell check | Toggle switch | On / Off | On |

**Account**

| Element | Behavior |
|---------|----------|
| Display name | Editable text input. Save button appears on change. |
| Email | Read-only display. |
| Avatar | Clickable to upload a new profile picture (max 2MB, JPEG/PNG/WebP). |
| Plan | Shows "Free" or "Pro" with item count: "X / 250 items used". |
| Upgrade button | Visible on Free plan only. |
| Delete account | Red destructive button at the bottom. Requires confirmation dialog: "This will permanently delete your account and all data. Type your email to confirm." |

---

### 6E.6 Today View — Interaction Rules (M6)

| Rule | Behavior |
|------|----------|
| Item editing | Items in Today view are fully editable in-place (same as normal outliner view). Edits propagate to the actual item in the tree. |
| Indent/outdent | **Not available** in Today view. Items are shown in a flat grouped list. |
| Reordering | **Not available** in Today view. Items are ordered by parent context groups, then by their original sort_order within each group. |
| Drag between sections | **Not available.** To change a date, use the item context menu → Add date. |
| Completing items | Completing an item in Today view applies the completion and the item remains visible (with strikethrough) until the view is refreshed. |
| Remove date | Right-clicking the date badge → "Remove date" removes the item from Today view. |
| Empty overdue section | If there are no overdue items, the "Overdue" section header is hidden entirely. |
| Grouping | Items are grouped under their parent breadcrumb path (e.g., "Projects › Website Redesign"). Groups are sorted alphabetically by breadcrumb path. |

---

### 6E.7 Offline Queue — Persistence and Conflicts (M7)

| Rule | Specification |
|------|---------------|
| Queue storage | Pending changes are stored in **localStorage** as a JSON array. Each entry contains: action type, item ID, payload (before/after state), and timestamp. |
| Persistence | The queue survives page reloads and browser restarts. It is only cleared after successful sync. |
| Maximum queue size | **500 actions.** If the queue exceeds 500, the oldest actions are dropped and a warning toast appears: "Some offline changes were too old and have been discarded." |
| Conflict handling | On reconnect, actions are replayed in timestamp order. If an action fails (e.g., item was deleted by another user), it is skipped and a toast shows: "Some changes couldn't be synced — the item may have been modified or deleted." |
| Self-conflicts | If the queue contains an edit followed by a delete for the same item, only the delete is sent (the edit is redundant). |
| Sync progress | On reconnect, a toast shows: "Syncing X changes…" with progress. On completion: "✓ All changes synced." |

---

### 6E.8 Search Scope — What's Searchable (M8)

| Data | Searchable? | How |
|------|------------|-----|
| Item content (`content` field) | ✅ Yes | Full-text search |
| Item notes (`note` / `node_description`) | ✅ Yes | Full-text search |
| Tags | ✅ Yes | Typing `#tagname` in search filters to items with that tag |
| Dates | ✅ Yes | Typing `date:today`, `date:tomorrow`, `date:overdue`, or `date:YYYY-MM-DD` filters by date |
| Completion status | ✅ Yes | Typing `is:completed` or `is:incomplete` filters by status |
| Item type | ✅ Yes | Typing `type:todo`, `type:h1`, `type:board`, etc. filters by type |
| File attachment names | ✅ Yes | File names are included in search results |
| Comment text | ❌ No | Comments are not included in the main search |
| User names (created_by, updated_by) | ❌ No | Not searchable |

**Search syntax summary:** The search input supports both free-text queries and filter prefixes. Filters can be combined: `#urgent is:incomplete date:overdue` finds incomplete overdue items tagged "urgent". Free text and filters can be mixed: `meeting notes #work` finds items containing "meeting notes" with the "work" tag.

---
