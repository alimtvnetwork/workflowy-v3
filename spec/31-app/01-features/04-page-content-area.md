# Page / Content Area

> **API Contract:** See [`spec/31-app/06-endpoints/04-page-content-area.md`](../06-endpoints/04-page-content-area.md) for the endpoint surface that backs this feature (request/response envelopes, status codes, error shapes). Bidirectional cross-link added 2026-04-30 to close **F-AUD42-04** (App-folder audit Phase 5).


> **Version:** 2.4.0
> **Updated:** 2026-04-26 — Round-3 AUDIT-03: Board / Dashboard rows in §3.3 annotated with `ItemType` values + link to taxonomy doc. Prior: 2026-04-26 — AUDIT-02a: snake_case → PascalCase rename of DB identifiers in code spans (closes audit F-01 for this file). Prior: 2026-04-26 — APP-FIX-08: aspirational-paths disclaimer added to Component Contract (closes audit F-07 for this file). Prior: 2026-04-26 — APP-FIX-06: enum sources linked (closes audit F-02 for this file)
> **Parent:** [00-overview.md](./00-overview.md)
> **Template:** [13-feature-file-template.md](../../01-spec-authoring-guide/13-feature-file-template.md)

---

## Overview

The Page is the scrollable content area below the NavBar where the user's outline lives. Every bullet item is one row composed of expand toggle, bullet dot, content, note, badges, and hover-revealed action buttons. This is where 95% of user interaction happens.

## User Story

As a user, I want every item row to expose its structure (parent/child, mirror, completion, type) at a glance and to give me one-click access to zoom, edit, comment, and the context menu, so that I can navigate and act on my outline without reaching for menus.

---

### 3.1 Bullet Item Structure

Each bullet item is a horizontal row containing these elements, in order from left to right:

| Element | Appearance | Behavior | Visual States |
|---------|------------|----------|---------------|
| Indent spacer | Invisible spacing | Creates visual nesting. Width increases with each depth level (~24px per level). | Transparent — purely structural. |
| Expand/Collapse toggle | Small right-pointing triangle (▶) | Click toggles visibility of children. Only visible when the item has children. | Collapsed: ▶ pointing right. Expanded: ▼ pointing down. Rotation animates smoothly. No children: invisible/hidden. |
| Bullet dot | Small filled circle (•) | **Click**: zooms into that item (it becomes the root of the view). **Drag**: initiates drag-and-drop reorder. | Default: gray. Hover: blue, slightly larger. Has children: filled circle. No children: outline circle. Completed items: muted color. |
| Content area | Editable inline text | The main content of the item. Supports rich text formatting. No visible placeholder on empty items. | Normal text for active items. Completed items: strikethrough with muted color. Headings render at larger sizes and bolder weights. Quotes render with a left border accent and light background. Code blocks render in monospace with light background. |
| Note indicator | Small sticky-note icon | Visible only when the item has a note. Click toggles the note editor open/closed. | Muted color. |
| Mirror badge | Small diamond (◇) icon | Visible only when the item is a mirror instance. Hover shows tooltip: "This is a mirror. Changes here update the original and all other mirrors." | Highlighted color with a subtle pulse animation. |
| Child count badge | Small pill-shaped label | Visible only when the item is collapsed AND has children. Shows text like "3 items" or "1 item". | Muted background and text. Small rounded pill shape. |
| Hover actions | Comment button + Context menu trigger | Appear on the right side when the user hovers over the row. Contains: 💬 Comment button and ⋮ Context menu. | Fade in on hover. |
| Comment button | 💬 speech bubble icon | Click opens or creates a comment thread on this item. Shows a small dot indicator if unresolved comments exist. | Muted color by default. |
| Context menu trigger | ⋮ horizontal dots | Click opens the item context menu (see §5). | Muted by default. Full color on hover. |
| Add button | + icon | Click creates a new sibling item below this one. | Visible on hover or when the item is the last in its level. Muted color. |

### 3.2 Note Display

When a note exists and is expanded:
- Renders below the content area, aligned with the content (not the bullet dot).
- Has a light background with a subtle left border accent.
- Uses smaller, muted text.
- Editable inline.
- Toggle visibility via the note indicator icon or the ⇧↵ shortcut.

### 3.3 Item Type Visual Differences

| Item Type | Bullet Dot | Content Appearance | Special Rendering |
|-----------|------------|-------------------|-------------------|
| Bullet (default) | Filled circle (•) | Normal text (15px, regular weight) | — |
| Heading 1 | Filled circle (•) | Large text (24px, bold) | — |
| Heading 2 | Filled circle (•) | Medium-large text (20px, semibold) | — |
| Heading 3 | Filled circle (•) | Slightly larger text (18px, semibold) | — |
| Paragraph | No dot (invisible spacer) | Normal text, full width | No bullet dot shown. |
| To-do | Checkbox (☐ or ☑) | Normal text. Checked items: strikethrough + muted. | Checkbox replaces the bullet dot. |
| Numbered | Auto-incremented number (1., 2., etc.) | Normal text | Number based on sibling position, replaces bullet dot. |
| Board | Filled circle (•) | Normal text | Children render as board/kanban columns instead of nested list. (`ItemType = 'board'`) |
| Dashboard | Filled circle (•) | Normal text | Children render as a dashboard/overview layout with metrics and visual summaries. (`ItemType = 'dashboard'`) — see [`spec/18-spec-issues/07-audit-03-dashboard-taxonomy.md`](../../18-spec-issues/07-audit-03-dashboard-taxonomy.md) for why both `board` and `dashboard` are `ItemType` values (not separate VIEW modes). |
| Quote | Filled circle (•) | Italic text with left border accent and light background | Left border is the primary accent color. |
| Code Block | Filled circle (•) | Monospace font with light background and padding | Rounded corners. No syntax highlighting. |
| Divider | No dot | No editable content — renders as a horizontal line | Full-width thin line. |

### 3.4 Text Formatting Toolbar

MUST appear as a floating toolbar above selected text. Centered above the selection with a small arrow/caret pointing down.

| Button | Label | Behavior | Active State |
|--------|-------|----------|-------------|
| H1 | "H1" | Converts the current item to Heading 1. | Highlighted background when item is H1. |
| H2 | "H2" | Converts to Heading 2. | Same pattern. |
| H3 | "H3" | Converts to Heading 3. | Same pattern. |
| ¶ | "¶" | Converts to paragraph. | Same pattern. |
| (divider) | Vertical line | Visual separator. | — |
| Bold | "B" in bold | Wraps selected text in bold formatting. Shortcut: ⌘B. | Bold text + highlighted background when selection is bold. |
| Underline | "U" underlined | Wraps in underline. Shortcut: ⌘U. | Underlined + highlighted. |
| Italic | "I" in italic | Wraps in italic. Shortcut: ⌘I. | Italic + highlighted. |
| Strikethrough | "S" with line-through | Wraps in strikethrough. Shortcut: ⌘⇧X. | Strikethrough + highlighted. |
| Code | "</>" | Wraps in inline code formatting. | Monospace + highlighted. |
| (divider) | Vertical line | Visual separator. | — |
| Mention | "@" | Opens an inline mention/search popover. Type to search items, select to insert an internal link. | Highlighted when the popover is open. |
| Color | "A ▾" with color bar | Opens a color picker dropdown (see §3.5). | The "A" text is colored with the current selection's color. |

### 3.5 Color Picker Dropdown (A ▾)

Grid layout (4 columns) of circular color swatches:

| Color | Description |
|-------|-------------|
| Default | Removes any custom color (returns to normal text color). |
| Red | Red text. |
| Orange | Orange text. |
| Yellow | Yellow/gold text. |
| Green | Green text. |
| Blue | Blue text. |
| Purple | Purple text. |
| Gray | Gray/muted text. |

Each swatch: small circle. Currently selected color has a ring border. Hover: slightly larger scale.

---

## Enum Sources (normative)

| Enum mentioned in this file | Canonical SSOT | Strategy |
|------------------------------|----------------|----------|
| `ViewMode` (`List` / `Board`) | [`spec/20-enums-index.md`](../../20-enums-index.md) §3 | TS Strategy B (`as const` + derived union) — see [`spec/02-coding-guidelines/02-typescript/00-overview.md`](../../02-coding-guidelines/02-typescript/00-overview.md) |
| `ItemType` | [`spec/20-enums-index.md`](../../20-enums-index.md) §2 | TS Strategy B |

> **Forbidden:** TS `enum` keyword and bare literal unions. Always import the canonical `as const` object.

---

## Inputs

| Field | Type | Source | Required | Notes |
|-------|------|--------|----------|-------|
| `currentItemId` | `ItemId \| null` | Router | Yes | `null` = root list. Branded `ItemId` per ADR-0020 — raw `string` forbidden. |
| `items` | `Item[]` | SQLite query (children of `currentItemId`) | Yes | Capped at 250 per view |
| `expandedIds` | `Set<ItemId>` | Local UI state (persisted) | Yes | Drives ▶/▼ toggle. Branded `ItemId` per ADR-0020. |
| `selection` | `{ start: number; end: number; itemId: ItemId } \| null` | DOM Selection API | No | Drives floating toolbar visibility. Branded `ItemId` per ADR-0020. |
| `hoverItemId` | `ItemId \| null` | Pointer state | No | Drives hover-action fade-in. Branded `ItemId` per ADR-0020. |
| `dragState` | `DragState \| null` | DnD library | No | Drives drop-target highlights |
| `viewMode` | `ViewMode` enum | NavBar toggle | Yes | `List` (this file) or `Board` (see `07-board-view.md`) |
| `showCompleted` | `boolean` | Settings | Yes | Toggles strikethrough rows |

## Outputs

| Output | Persisted? | Channel | Notes |
|--------|-----------|---------|-------|
| Edited content | ✅ SQLite | `Items.Content` | Debounced autosave (per `mem://features/editor-core`) |
| Item type change | ✅ SQLite | `Items.ItemType` | Toolbar buttons (H1/H2/H3/¶) |
| Inline formatting | ✅ SQLite | `Items.Content` rich-text JSON | Bold/italic/underline/strike/code |
| Color span | ✅ SQLite | `Items.Content` rich-text JSON | One of 8 colors |
| Mention link | ✅ SQLite | `Items.Content` rich-text JSON + `Mentions` table | Internal item link |
| Reorder / move | ✅ SQLite | `Items.ParentId` + `Items.SortOrder` | Fractional sort |
| Toggle expanded | ✅ `localStorage` | `ui.expandedIds` | Per-user persisted |
| Toggle complete | ✅ SQLite | `Items.CompletedAt` | To-do checkbox |
| `item:zoom` event | ❌ | Event bus | Bullet-dot click |

## Edge Cases

1. Empty content area for a brand-new item — show no placeholder text per spec; cursor blinks at left edge.
2. Item has 1000+ children expanded — virtualize the descendant list; cap render to viewport + buffer (per `03-edge-cases/01-edge-cases.md` row 5).
3. User clicks bullet dot while drag is in flight — drag wins; click is suppressed.
4. User collapses a parent that contains the currently zoomed item in another tab — collapse persists locally; zoom in other tab unaffected (LWW per M-4).
5. Selection spans two items — toolbar shows but type-conversion buttons (H1/H2/H3/¶) are disabled; only inline formatting buttons remain enabled.
6. User applies bold then immediately undoes (⌘Z) — both the format and the selection are restored to pre-format state.
7. To-do item is checked while child to-dos are unchecked — only the parent's `CompletedAt` is set; children are unaffected.
8. Mirror badge clicked — opens the mirror peers popover (see `09-Mirrors.md`); does not zoom.
9. Comment button clicked on a mirror — comment is attached to the source item; all mirrors see the same dot indicator.
10. User pastes 100+ lines into the content area — auto-split into individual sibling items per `03-edge-cases/01-edge-cases.md` row 7.
11. Pasted URL — auto-detect and render as clickable link inside the content (no item conversion).
12. Divider type item receives focus via keyboard — focus skips to the next editable item; dividers are non-editable.

## Acceptance Tests

| ID | Given | When | Then | testid |
|----|-------|------|------|--------|
| AT-PAGE-01 | An item with 3 children, currently collapsed | User clicks ▶ | Triangle rotates to ▼; children render below; `expandedIds` includes the item id | `expand-toggle` |
| AT-PAGE-02 | An item with no children | Row renders | Expand toggle slot is invisible (no ▶/▼); bullet dot is outline style | `bullet-dot-empty` |
| AT-PAGE-03 | Any item row | User clicks the bullet dot | Router navigates to `/items/{id}`; that item becomes the zoom root | `bullet-dot` |
| AT-PAGE-04 | An item is a mirror instance | Row renders | ◇ mirror badge is visible with pulse animation; tooltip text matches spec §3.1 | `mirror-badge` |
| AT-PAGE-05 | A collapsed item has 3 children | Row renders | Pill badge shows "3 items"; clicking it expands the item | `child-count-badge` |
| AT-PAGE-06 | User hovers a row | After 0 ms | Comment button (💬) and context-menu trigger (⋮) fade in on the right | `hover-actions` |
| AT-PAGE-07 | User selects text inside an item | Selection ≥ 1 char | Floating toolbar appears centered above the selection with caret arrow | `format-toolbar` |
| AT-PAGE-08 | Selection is bold | Toolbar renders | Bold button shows highlighted/active state | `format-bold` |
| AT-PAGE-09 | User clicks `H1` in toolbar | Conversion commits | Item row renders at 24px bold; `Items.ItemType = 'H1'` | `format-h1` |
| AT-PAGE-10 | User clicks `A ▾` in toolbar | Picker opens | 8 swatches render in a 4-col grid; selected color shows ring border | `color-picker` |
| AT-PAGE-11 | A to-do item is unchecked | User clicks the checkbox | Checkbox flips to ☑; row renders strikethrough + muted; `CompletedAt` is set | `todo-checkbox` |
| AT-PAGE-12 | An item has a note | User clicks the note indicator | Note editor expands below content with light bg + left border accent | `note-editor` |
| AT-PAGE-13 | User pastes 100 newline-separated lines | Paste commits | 100 sibling items are created (per `04-edge-cases` row 7); progress toast shows "Creating 100 items…" | `bulk-paste-progress` |
| AT-PAGE-14 | User pastes a URL into content | Paste commits | URL renders as clickable `<a>` with primary color underline; no item conversion | `inline-link` |
| AT-PAGE-15 | A divider-type item exists | User presses ↓ to navigate from the prior row | Focus skips the divider and lands on the next editable item | `divider-row` |

## Component Contract

> **Note:** None of these components exist yet — paths are the planned implementation order (aspirational, not normative). The disclaimer mirrors `01-information-model.md` L149 and feeds the global component-contract map (M-3). AI implementers MUST NOT treat the paths as binding imports.

| Surface | Component path | `data-testid` | Acceptance tests |
|---------|---------------|---------------|------------------|
| Item row container | `src/components/tree/ItemRow.tsx` | `item-row` | AT-PAGE-01..15 |
| Expand/collapse toggle | `src/components/tree/ExpandToggle.tsx` | `expand-toggle` | AT-PAGE-01 |
| Bullet dot (default) | `src/components/tree/BulletDot.tsx` | `bullet-dot`, `bullet-dot-empty` | AT-PAGE-02..03 |
| Mirror badge | `src/components/items/MirrorBadge.tsx` | `mirror-badge` | AT-PAGE-04 |
| Child count badge | `src/components/tree/ChildCountBadge.tsx` | `child-count-badge` | AT-PAGE-05 |
| Hover actions group | `src/components/tree/HoverActions.tsx` | `hover-actions` | AT-PAGE-06 |
| Comment button | `src/components/comments/CommentButton.tsx` | `comment-button` | AT-PAGE-06 |
| Context-menu trigger | `src/components/tree/ContextMenuTrigger.tsx` | `context-menu-trigger` | AT-PAGE-06 |
| Floating format toolbar | `src/components/editor/FormatToolbar.tsx` | `format-toolbar` | AT-PAGE-07..10 |
| Bold/Italic/Underline buttons | `src/components/editor/FormatButtons.tsx` | `format-bold`, `format-italic`, `format-underline` | AT-PAGE-08 |
| Type-conversion buttons | `src/components/editor/TypeButtons.tsx` | `format-h1`, `format-h2`, `format-h3`, `format-paragraph` | AT-PAGE-09 |
| Color picker | `src/components/editor/ColorPicker.tsx` | `color-picker` | AT-PAGE-10 |
| To-do checkbox | `src/components/items/TodoCheckbox.tsx` | `todo-checkbox` | AT-PAGE-11 |
| Note editor | `src/components/items/NoteEditor.tsx` | `note-editor` | AT-PAGE-12 |
| Bulk-paste progress | `src/components/feedback/BulkPasteProgress.tsx` | `bulk-paste-progress` | AT-PAGE-13 |
| Inline link | `src/components/editor/InlineLink.tsx` | `inline-link` | AT-PAGE-14 |
| Divider row | `src/components/items/DividerRow.tsx` | `divider-row` | AT-PAGE-15 |

> **Note:** None of these components exist yet — paths are the planned implementation order. This table feeds the global component-contract map (M-3).

---

## Workflowy Feature Reference (F1) — Page Content & Editor Affordances

> **Source:** Workflowy product feature list, merged 2026-04-28 (lossless, additive). Reproduced verbatim; cross-linked to existing component-contract rows above.

- **Text Format Toolbar** — Floating toolbar that appears on text selection. Exposes Bold / Italic / Underline / Strike / Inline-code, link insertion, type conversion (H1/H2/Paragraph/Bullet/To-do), and the colour picker. Implemented by `format-toolbar` (see component-contract table above). (shortcuts: ⌘B, ⌘I, ⌘U, ⌘+Shift+S, ⌘E, ⌘K)
- **Text Color** — Apply foreground / highlight colour to selected text via the toolbar's colour picker. (component: `color-picker`)
- **Create Bullet** — Press ↵ at the end of an item to create a new sibling bullet; press ↹ to indent the new bullet under the previous one. (shortcut: ↵, ↹, Shift+↹ to outdent)
- **Zoom In** — Open an item as the current page root, hiding all ancestors. Triggered by clicking the bullet glyph. (shortcut: ⌘.)
- **Zoom Out** — Return one ancestor level toward the home root. (shortcut: ⌘,)
- **Inline Link** — Paste or type a URL on selected text to attach a link; renders via the `inline-link` component above. (shortcut: ⌘K)
- **Image Resize / Image Menu** — When an image attachment is rendered in the page, dragging the corner handles resizes it; clicking the image opens a per-image action menu (replace / download / copy-link / delete). Backed by the `format-toolbar` and per-image overlay (see [`./01-information-model.md`](./01-information-model.md) F1 appendix).
- **Add Note** — Press Shift+↵ on an item to attach a secondary "note" block; rendered by `note-editor`. (shortcut: Shift+↵)
- **Add Date** — Insert a date chip inline (powers Today view and `is:`/date search). (slash: `/date`, shortcut: ⌘+Shift+.)
- **To-do Checkbox** — Visible leading checkbox on items of type `todo`; clicking toggles `completed` and applies completion styling. Backed by `todo-checkbox`. (shortcut on focused row: ⌘↵)

> Cross-link: shortcut reference → [`./05a-hotkey-table.md`](./05a-hotkey-table.md). Item-level affordances (Item Menu, Expand/Collapse, Auto Save, Undo, Redo) → [`./01-information-model.md`](./01-information-model.md) F1 appendix.

---

## Related

- [01-information-model.md](./01-information-model.md) — what an Item is
- [03-layout-structure.md](./03-layout-structure.md) — chrome around this Page
- [05-interactions.md](./05-interactions.md) — keyboard shortcuts referenced above
- [06-item-context-menu.md](./06-item-context-menu.md) — what ⋮ opens
- [09-mirrors.md](./09-mirrors.md) — mirror badge semantics
- [03-edge-cases/01-edge-cases.md](../03-edge-cases/01-edge-cases.md) — paste / nesting / network rows
- [`./07-board-view.md`](./07-board-view.md) — ← Board view (forward link from)
- [`./10-today-view.md`](./10-today-view.md) — ← Today view (forward link from)

---

## Database Scope

- **Anchor:** [`07-db-diagram/00b-split-db-anchor.md`](../07-db-diagram/00b-split-db-anchor.md)
- **Scope:** `[db-scope: app]`
- **Tables:** nodes (read), node_view_state
- **Cross-DB JOINs:** forbidden (split-DB invariant). Cross-DB orchestration, if any, follows ADR-0019.

---

## Architecture Anchors (load-bearing ADRs)

- **ADR-0023 — Loader↔Queue Contract:** Loaders MUST read the local IndexedDB mirror first (≤16 ms p95, never fetch). Mutations MUST write `{mirror, queue_ledger}` in a **single IDB transaction**; the queue worker is the **sole egress** to the WordPress REST surface. SSE frames are read-signals only and MUST NOT enqueue to the FIFO. See `spec/30-architecture/adr/0023-loader-queue-contract.md`.
- **ADR-0017 — Named Error Boundaries:** This feature renders inside **`AppErrorBoundary + RouteErrorBoundary`**. A single top-level boundary is **forbidden**. Loader/action errors surface via the matching named boundary; uncaught render errors escalate to `AppErrorBoundary`. See `spec/30-architecture/adr/0017-error-boundaries.md`.
- **ADR-0025 — Realtime is SSE-only:** Cross-tab/cross-client signals arrive via `/stream/page/{id}` and `/stream/user/{id}` (PascalCase frames, `Last-Event-ID` replay). WebSocket / long-poll / 3rd-party push are **forbidden**.
