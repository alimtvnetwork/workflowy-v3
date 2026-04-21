# Interaction Clarifications

> **Version:** 1.1.0  
> **Updated:** 2026-04-18

---

### 6D.1 Arrow Key Navigation — Visible Item Traversal (H1)

Visible items are computed by a **depth-first pre-order traversal** of the item tree, **skipping the entire subtree of any collapsed node**.

**Traversal algorithm (↓ Arrow — next visible item):**
1. If the current item is expanded and has children → move to the first child.
2. If the current item has a next sibling → move to that sibling.
3. Otherwise → walk up the parent chain until finding an ancestor with a next sibling, then move to that sibling.
4. If no ancestor has a next sibling → do nothing (we're at the last visible item).

**Traversal algorithm (↑ Arrow — previous visible item):**
1. If the current item has a previous sibling → move to that sibling's **deepest last visible descendant** (recursively: if the sibling is expanded and has children, go to its last child, repeat).
2. If no previous sibling exists → move to the parent.
3. If no parent exists → do nothing (we're at the first visible item).

**Edge cases:**
- Collapsed items are still themselves visible — only their children are skipped.
- Mirror items follow the same traversal as regular items.
- In board view, arrow keys are disabled (board uses its own navigation).

---

### 6D.2 Multi-Select Range — Visual Order (H2)

Multi-select range (Shift+click) operates on **visual render order**, which is identical to the depth-first pre-order traversal of visible items (same as arrow key navigation in §6D.1).

**Rules:**
- Shift+click selects all items between the anchor (first click) and the target (shift+click) **in visual order**, inclusive of both endpoints.
- This includes items at any nesting depth that fall between the two points in visual order.
- If the anchor is deeper than the target (or vice versa), all intermediate items at all depths are selected.
- Cmd+click adds/removes individual items without affecting the rest of the selection.
- ⌘A selects all visible items under the current zoom root.
- The **anchor item** (the first non-shift click) is remembered. Subsequent shift+clicks recalculate the range from the anchor to the new target.

---

### 6D.3 Markdown Auto-Conversion — Trigger Rules (H3)

Markdown shortcuts trigger **only** when the typed sequence is the **entire content** of the item at the moment the space (or Enter for `---`) is pressed.

| Rule | Detail |
|------|--------|
| Trigger condition | The item content must match the pattern exactly, with nothing else before or after. E.g., `# ` triggers only if the item's full content is `# ` at the moment space is pressed. |
| After conversion | The trigger characters (`# `, `## `, `> `, etc.) are **removed** from the content. The item is left empty with the new type applied. |
| Existing text | If an item already has other text and the user types `# ` at the beginning, conversion does **NOT** trigger. The characters remain as literal text. |
| Code block items | Auto-conversion does **NOT** trigger inside code block items. All characters are treated as literal text. |
| `---` + Enter | If the item's entire content is `---` when Enter is pressed, the item converts to a Divider type and its content is cleared. This replaces the current item (does not create a new one). |
| Undo | Auto-conversion is a single undoable action. ⌘Z reverts the type change and restores the trigger characters. |

---

### 6D.4 Text Formatting Toolbar — Positioning Rules (H4)

| Scenario | Toolbar Position |
|----------|-----------------|
| Normal selection | Centered horizontally above the selection. Vertically: 8px above the top of the selection range. |
| Selection near top of viewport (< 48px from top) | Toolbar appears **below** the selection instead (8px below the bottom of the selection range). |
| Selection spans multiple items | Toolbar appears above the **first selected item** in the range. |
| Selection extends (user drags to extend) | Toolbar repositions in real-time to stay centered above the full selection. |
| Keyboard selection (Shift+Arrow) | Toolbar appears identically to mouse selection — same positioning rules. |
| Mobile / touch | Toolbar appears above the native selection handles, same rules as desktop. If insufficient space above, appears below. |
| Click away / selection lost | Toolbar disappears immediately (no fade animation). |
| Selection within a code block item | Toolbar does **NOT** appear. Code blocks have no inline formatting. |
| Selection within a note editor | Toolbar appears with the same rules — notes support the same inline formatting as item content. |

---

### 6D.5 Color Picker — Scope Clarification (H5)

The color picker serves **two different purposes** depending on context:

| Context | What Gets Colored | Data Storage |
|---------|-------------------|-------------|
| Text selected + color picker clicked | Only the **selected text range** is colored inline | Stored as `<span data-color="red">selected text</span>` inside `rich_content` |
| No text selected + color picker clicked | The **entire item's** default text color changes | Stored in the item's `text_color` field |

**Interaction flow:**
1. User selects text → toolbar appears → clicks A▾ → color swatch grid opens → click a color → selected text wraps in `<span data-color="colorname">`.
2. User focuses an item (no selection) → opens item context menu or toolbar → clicks A▾ → click a color → entire item's `text_color` field is set.
3. "Default" swatch removes the color: for inline selections it removes the `<span data-color>` wrapper; for whole items it sets `text_color` to `null`.

**Precedence:** Inline `<span data-color>` overrides the item-level `text_color`. An item with `text_color: "blue"` and a word wrapped in `<span data-color="red">` renders the word in red and everything else in blue.

---

### 6D.6 Board View — Interaction Details (H6)

| Question | Answer |
|----------|--------|
| Can cards be edited inline in board view? | **No.** Clicking a card zooms into that item (same as clicking a bullet dot in list view). To edit, the user must zoom in. |
| Can columns be resized? | **No.** All columns are fixed at 280px width. |
| Is there a maximum column count? | **No limit.** The board container scrolls horizontally when columns exceed viewport width. |
| What does a card preview show? | The card's own content text only (truncated to 2 lines). Children are NOT shown in the preview. |
| Card text font size | Same as bullet text: 15px (0.9375rem). |
| Card max height | No max height. The card grows to fit its content (up to 2-line truncation for the content text, plus badges). |
| Can cards be created inline? | Clicking "+ Add card" at the bottom of a column creates a new child item and immediately zooms into it for editing. |
| Can column headers be multi-line? | **No.** Column header text is single-line with ellipsis truncation at the column width. |
| Board view within a zoomed item | Board view renders for the currently zoomed item if its type is "board". Changing the zoomed item's type to "board" switches the view immediately. |

---

### 6D.7 Comment Panel — State Rules (H7)

| Rule | Behavior |
|------|----------|
| Simultaneous panels | Only **one** comment panel can be open at a time. Opening comments on a different item replaces the current panel content. |
| Sidebar coexistence | The sidebar (left) and comment panel (right) CAN be open simultaneously. On screens narrower than 1024px, the comment panel overlays the content area instead of pushing it. |
| Zoom navigation | The comment panel **auto-closes** when the user zooms to a different item (click bullet, breadcrumb, search result, back/forward). |
| Panel persistence within same item | If the user edits the item's content while the comment panel is open, the panel stays open. |
| Opening behavior | Opening comments on an item that already has the panel open scrolls to the comment input. |
| Close triggers | Panel closes on: ✕ button click, Escape key (only if no other overlay is open above it), or clicking the comment trigger button again (toggle behavior). |
| Empty to populated | When a user submits the first comment on an item, the comment count badge (💬) appears on the item row in real-time. |
| Panel width on mobile | On screens < 768px, the comment panel takes the full screen width as an overlay with a back button instead of ✕. |

---

### 6D.8 Breadcrumb Overflow — Display Rules (H8)

**Segment visibility rules:**

| Path Length | What's Shown |
|-------------|-------------|
| 1 segment (root) | `Home` (bold, no separator) |
| 2 segments | `Home › Current` |
| 3 segments | `Home › Parent › Current` |
| 4+ segments | `Home › … › Parent › Current` |

The **first** segment (Home) and the **last two** segments (parent + current) are always visible. Everything in between collapses into `…`.

**Overflow behavior:**

| Interaction | Behavior |
|-------------|----------|
| Click `…` | Opens a dropdown menu listing all collapsed ancestor segments, in order from shallowest to deepest. Each is clickable to zoom to that ancestor. |
| Hover `…` (desktop only) | Same dropdown appears on hover. |
| Touch `…` (mobile) | Tap to open dropdown. No hover behavior. |
| Individual segment click | Zooms to that ancestor. Current zoom state is pushed to history. |
| Current item (last segment) | Displayed in **bold** text. NOT clickable (it's the current view). |
| Ancestor segments | Displayed in **muted** text. Underline on hover. Clickable. |
| Maximum breadcrumb width | Breadcrumbs occupy at most 50% of the NavBar width. If even with overflow collapse the text exceeds this, individual segments are truncated with ellipsis (CSS `text-overflow: ellipsis`) at ~120px max per segment. |

---
