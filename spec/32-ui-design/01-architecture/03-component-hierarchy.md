# Component Hierarchy

> **Version:** 1.1.0  
> **Updated:** 2026-04-18

---

### 3.1 Top Level

The app wraps everything in a query cache provider, authentication provider, and router. A global toast notification system is available throughout.

### 3.2 Layout

The main authenticated layout contains:

- **NavBar** (fixed at top, ~48px height)
  - **NavBar Left**: Menu toggle, back arrow, forward arrow, home button, breadcrumbs with overflow
  - **NavBar Right**: Search button, share button (hidden on home), clipboard/copy button, favorite button (hidden on home), checkmark (complete), layout toggle (list/board), settings menu dropdown
- **Sidebar** (~240px, collapsible from left, shortcut: ^L)
  - Collapse/expand arrow at top
  - Today shortcut (📅 "Today") at top
  - Home tree browser — collapsible hierarchical view of the user's entire outline starting from "Home"
  - Special nodes with icons (e.g. 📅 Calendar)
  - "+ New node" button at bottom
- **Content Area** (main scrollable region, renders the current page)
- **Usage Quota Indicator** (top-right, free-tier only: progress bar + "X/Y bullets this month" + "Upgrade to unlimited →")
- **Search Overlay** (full-screen, conditionally rendered)
- **Command Palette** (⌘K dialog, conditionally rendered)

### 3.3 Settings Menu Dropdown

Contains all items described in the Workflow spec §2.4, organized into 5 groups with visual dividers:

1. Resources: What's New, Learn WorkFlowy, Integrations, Handbook
2. Edit: Undo (with disabled state), Redo (with disabled state), Save (with autosave timestamp)
3. View: Expand all, Collapse all, Print, Export all, Download Files (disabled when no attachments)
4. System: Settings, Help, Report a problem, Trash, Log out
5. Account: Avatar, display name, email (informational only)

### 3.4 Bullet Item (core component)

Each bullet item row contains, in order:

1. **Indent spacer** — invisible spacing that grows with nesting depth (~24px per level)
2. **Expand/collapse toggle** — small triangle, only visible when children exist, animates rotation
3. **Bullet dot** — appearance varies by item type (see Workflow spec §3.3 for all type variations: filled circle for bullets, checkbox for to-dos, number for numbered lists, invisible for paragraphs, etc.)
4. **Content editor** — inline-editable rich text area, styled differently per item type (heading sizes, quote styling, code block monospace, etc.)
5. **Note editor** — conditionally rendered below content when a note exists and is expanded
6. **Inline badges** — mirror diamond badge, note indicator icon, date badge, file attachment chips
7. **Child count badge** — visible only when collapsed with children, shows "X items"
8. **Hover actions** — comment button (with unresolved count dot) and context menu trigger (⋮), fade in on row hover
9. **Add button** — "+" to create a new sibling, visible on hover

Children render recursively below the item when expanded.

### 3.4b Multi-Select UI

When multiple items are selected (see Workflow spec §12):

- **Selection highlight** — each selected BulletItem row shows a light accent background
- **SelectionCountBadge** — floating pill at the bottom center of the screen showing "X items selected" with a "Clear" button
- **BulkActionBar** — floating toolbar above the selection badge containing: Complete, Delete, Move To…, Indent, Outdent, Duplicate, Change type (opens Turn Into submenu). Appears only when 2+ items are selected. Disappears on clear or Escape.



When an item is in board mode, its children render as a horizontal row of columns instead of a nested list:

- **Board container** — horizontally scrollable area with column gaps
- **Board column** — each direct child renders as a ~280px vertical column with muted background, sticky header (editable title + context menu), and a scrollable card area
- **Board card** — each grandchild renders as a card with content preview (2-line truncation), optional checkbox, date badge, mirror badge, comment count, and hover shadow
- **Add column button** — dashed-border button at the far right
- **Add card button** — at the bottom of each column

### 3.6 Item Context Menu

A dropdown anchored to the ⋮ trigger, containing:

1. **Turn Into submenu** — nested submenu with all 12 item types (Bullets, H1, H2, H3, Paragraph, To-do, Number, Board, Dashboard, Quote, Code Block, Divider), each with their keyboard shortcut
2. **Core actions** — Complete, Add note, Add date, Add comment (with shortcuts)
3. **Move actions** — Move To…, Move to Today, Move to Tomorrow, Move to Next Week
4. **Advanced actions** — Upload file, Mirror To…, Duplicate, Share, Export, Copy internal link, Make template
5. **View actions** — Expand all, Collapse all, Sort A-Z, Sort Z-A
6. **Danger zone** — Delete (styled in destructive/red color)
7. **Metadata** — Changed timestamp + user, Created timestamp + user, Mirror source info (if applicable)

Groups are separated by visual dividers.

### 3.7 Text Formatting Toolbar

Floating toolbar that appears above selected text, containing:

1. Type buttons: H1, H2, H3, ¶ (with active state highlighting)
2. Visual separator
3. Format buttons: Bold, Underline, Italic, Strikethrough, Code (with active states and keyboard shortcuts)
4. Visual separator
5. Special buttons: @ mention (opens inline search), A▾ color picker (opens color swatch grid)

### 3.8 Search Overlay

Full-screen overlay with:

- Centered search input (~640px max width) with magnifier icon, auto-focus, and loading spinner
- Results list below: each result shows content (with highlighted matches) and parent breadcrumb path
- Keyboard navigation (↑↓ to select, Enter to zoom, Escape to close)
- Empty state shows recent items; no-results state shows "No items found"

### 3.9 Location Picker

Used by both "Move To…" and "Mirror To…" actions:

- Dialog with search input at top
- Tree browser showing all user items with indentation
- Excludes invalid targets (e.g. self and descendants for Move)
- For Mirror To…, shows an informational note: "Mirrors stay synced. Duplicates do not."

### 3.10 Comment Side Panel

Comments open in a right-side panel (slide-in from the right, ~360px width) rather than inline or in a modal:

- **Panel header** — shows the item's content text (truncated) and a close button (✕)
- **Comment thread** — chronological list of comments, each showing: user avatar, display name, timestamp, and comment text
- **Threaded replies** — replies are indented below their parent comment with a subtle connector line
- **Resolved toggle** — each comment has a "Resolve" action. Resolved comments are visually muted with strikethrough
- **Input area** — text input at the bottom with a "Comment" submit button
- **Empty state** — "No comments yet. Start the conversation."
- **Close behavior** — panel closes on ✕ click, Escape key, or clicking outside

### 3.11 Tag Picker

In addition to inline `#hashtag` parsing, a dedicated tag picker UI is available:

- **Access** — via item context menu ("Add tag…") or a tag icon button in hover actions
- **Picker layout** — small popover anchored to the trigger, showing: search input at top, list of existing tags below (each with colored dot and name), "Create new tag" option at the bottom when search text doesn't match existing tags
- **Tag selection** — click a tag to toggle it on/off for the current item. Active tags show a checkmark
- **Tag creation** — typing a new name and pressing Enter or clicking "Create" adds the tag and assigns it
- **Color assignment** — optional color picker (same swatch grid as text color) appears when creating or editing a tag
- **Assigned tags display** — small colored tag pills below the item content, inline with note indicator and date badge

### 3.12 Archive Action UI

- **Archive action** — available in the item context menu: "Archive" moves the subtree to an archive database
- **Archive badge** — archived nodes in a parent's children list show a muted "Archived" badge
- **Unarchive action** — archived items show "Unarchive" in their context menu to restore
- **Loading behavior** — clicking an archived node shows a brief loading state while the archive database is loaded

### 3.13 Other Dialogs

- **Share Dialog** — email input, permission dropdown, shared users list, public link toggle, copy link, cascade notice
- **Date Picker Dialog** — calendar-style date selector for assigning dates
- **Template Save Dialog** — name and description input for saving templates
- **Template Picker Dialog** — browsable list of saved templates with name, description, preview of top-level structure (first 3 items), creation date, and a right-side preview panel showing the full tree. "Apply" button creates template items as children of the current item. (See Workflow spec §13 for full flow.)
- **Export Dialog** — format selection (OPML, Plain Text, JSON, Markdown)
- **Delete Confirmation Dialog** — for destructive actions requiring user confirmation

### 3.11 Auth Pages

- **Login** — email/password fields, social login buttons (Google, Apple), link to signup and password reset
- **Signup** — email, password, display name fields, social signup buttons
- **Reset Password** — email input, confirmation message

---
