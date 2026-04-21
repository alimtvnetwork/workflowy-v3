# Frontend Failure Analysis — WorkFlowy Specs

> **Generated:** 2026-03-18
> **Scope:** Frontend-only (backend excluded per user request)
> **Goal:** Identify every area where an AI will fail or produce broken code, so specs can be fixed to reach 100/100.

---

## Severity Legend

| Level | Meaning |
|-------|---------|
| 🔴 CRITICAL | AI **will** fail here. Missing information makes correct implementation impossible. |
| 🟠 HIGH | AI will likely produce **buggy or incomplete** code. Spec is ambiguous. |
| 🟡 MEDIUM | AI may get it wrong on **edge cases**. Needs clarification. |
| 🟢 LOW | Minor gap. AI will probably guess correctly but may not match your vision. |

---

## 🔴 CRITICAL FAILURES (Will Break)

### C1 — Contenteditable Rich Text: No HTML Format Defined

**Spec says:** "Native contenteditable divs" for editing, `rich_content` field stores formatted content.

**What's missing:**
- What HTML tags represent bold, italic, underline, strikethrough, code? (`<strong>` vs `<b>`? `<em>` vs `<i>`?)
- How is `rich_content` structured? Is it raw HTML, a JSON AST, or Markdown?
- How does the system sanitize pasted HTML from external sources (Word, Google Docs)?
- How does `content` (plain text) stay in sync with `rich_content` (formatted)?
- How does inline `#hashtag` parsing coexist with rich formatting?
- How does inline `@mention` work? What HTML does it produce? How is it stored?
- How does the `!!` date trigger work inside contenteditable? Is it parsed on every keystroke?

**Why AI fails:** Every AI will make different assumptions. One will use `<b>`, another `<strong>`, another will try to use Markdown. The content will be inconsistent and unsearchable. Paste handling from external apps will produce garbage HTML.

**Fix needed:** Add a new section to `spec/02-FRONTEND.spec.md` defining:
1. Exact HTML tag mapping for each format type
2. Storage format for `rich_content` (recommend: sanitized HTML subset)
3. Allowed HTML tags whitelist
4. Paste sanitization rules
5. How `content` (plain text) is derived from `rich_content`
6. Inline element specs (`#tag`, `@mention`, `!!date`)

---

### C2 — Enter Key: Split Text at Caret Position

**Spec says (§4.1):** "Cursor splits text at the caret position. Text before the caret stays in the current item. Text after the caret moves to a new sibling item below."

**What's missing:**
- How does this work with **rich text**? If the caret is inside a `<strong>` tag, does the bold continue in the new item?
- If the caret is at the start: "creates an empty sibling above" — but if the item has rich formatting, does the empty sibling inherit the format?
- What happens when Enter is pressed inside a note editor? (Create new line? Or new sibling?)
- What happens when Enter is pressed in an H1/H2/H3? Does the new sibling become H1 too, or revert to bullet?

**Why AI fails:** Text splitting in contenteditable across HTML nodes is one of the hardest problems in web development. Without exact rules for format inheritance, AI will produce broken split behavior.

**Fix needed:** Add sub-rules:
1. Format inheritance on split (yes/no per format type)
2. Type inheritance on Enter (new item type = bullet, regardless of parent type)
3. Enter behavior in note editors (newline, not new item)
4. Enter behavior in code blocks (newline, not new item)

---

### C3 — Drag-and-Drop: Sibling vs Child Distinction

**Spec says (§4.1):** "Two types of drop zones: (a) between items as a sibling (horizontal blue line), (b) onto an item as its child (blue left-border highlight)."

**What's missing:**
- What is the **pixel threshold** for distinguishing sibling vs child drop? (e.g., dropping on the left 30% = sibling, right 70% = child?)
- Or is it vertical position-based? (upper half = before, lower half = after, center = child?)
- How does this work at different indent levels? If I drag from level 3 to level 1, which sibling/child position?
- What about dropping at the **end of a list**? Is there a drop zone after the last item?

**Why AI fails:** Without a clear algorithm, AI will implement a broken drop zone system that either always drops as sibling or always as child. Users will constantly mis-drop items.

**Fix needed:** Define the drop zone algorithm:
1. Vertical zones (upper 25% = before, lower 25% = after, middle 50% = child) — or whatever logic you want
2. Horizontal offset behavior for indent-level targeting
3. Visual indicator exact positioning

---

## 🟠 HIGH FAILURES (Will Be Buggy)

### H1 — Arrow Key Navigation: "Previous/Next Visible Item"

**Spec says:** "Moves focus to the previous/next visible item (skips collapsed children)."

**What's missing:** The algorithm for computing "next visible item" in a recursive tree. This requires a depth-first traversal that skips collapsed subtrees. Not obvious to an AI. Also:
- What happens when pressing ↓ on the last child of a collapsed parent? Jump to parent's next sibling?
- What about deeply nested items where the parent chain has mixed expand states?

**Fix needed:** Add a prose description of the traversal order, or state: "Visible items are those produced by a depth-first pre-order traversal of the tree, skipping children of collapsed nodes."

---

### H2 — Multi-Select: Shift+Click Range in Recursive Tree

**Spec says (§12):** "Selects a contiguous range of visible items between the two clicks."

**What's missing:** "Contiguous range" in a recursive tree is ambiguous. Is it based on the rendered visual order (depth-first)? What if the range spans multiple nesting levels? If I click item at level 1 and shift+click item at level 3, do all intermediate nested items get selected?

**Fix needed:** State explicitly: "Range is based on visual render order (depth-first traversal of visible items). All items between the two click targets in visual order are selected, regardless of nesting depth."

---

### H3 — Markdown Auto-Conversion Timing

**Spec says (§11.6):** "# + Space converts to Heading 1 at the start of an empty item."

**What's missing:**
- Does "empty item" mean the item had no content before typing? Or the item is currently empty (user deleted all text)?
- What if the item already has text and the user types `# ` at the beginning? Convert or not?
- Does `---` + Enter convert the **existing** item to a divider, or create a new divider below?
- After conversion (e.g., `# ` → H1), is the `# ` prefix removed from the content?
- Do these work inside code blocks? (They shouldn't.)

**Fix needed:** Clarify: "Auto-conversion triggers only when the typed sequence is the **entire content** of the item at the moment Space/Enter is pressed. The trigger characters are removed after conversion. Does not trigger inside code block items."

---

### H4 — Breadcrumb Overflow: "…" Dropdown Behavior

**Spec says (§2.2):** "When path exceeds 3 segments, middle items collapse to '…'. Hovering '…' reveals full ancestor list."

**What's missing:**
- Is it exactly 3 visible segments (first, "…", last)? Or first, "…", last two?
- What's the maximum width before truncation triggers? Character count or pixel width?
- On mobile, is the behavior different? (Touch = no hover)
- Does clicking "…" open the dropdown, or only hover?

**Fix needed:** Define: "Show the first segment (Home), the last 2 segments, and collapse everything in between to '…'. The '…' is clickable (not just hoverable) and opens a dropdown of collapsed ancestors. On mobile, it's always click-to-open."

---

### H5 — Text Formatting Toolbar Positioning

**Spec says (§3.4):** "Appears as a floating toolbar above selected text, centered above the selection."

**What's missing:**
- What happens when the selection is near the top of the viewport? (Toolbar would go off-screen.)
- What happens when the selection spans multiple items?
- Does the toolbar follow as the user extends the selection?
- What happens on mobile where there's no mouse hover?
- Does the toolbar appear on keyboard selection (Shift+Arrow) or only mouse selection?

**Fix needed:** Add: "Toolbar appears above the selection, or below if insufficient space above. Selection across multiple items: toolbar appears above the first selected item. Appears on both mouse and keyboard selections. On mobile, appears above the native selection handles."

---

### H6 — Color Picker: Which Part Gets Colored?

**Spec says (§3.5):** Color picker in the text formatting toolbar.

**What's missing:**
- Does the color apply to **selected text only** (inline span coloring) or to the **entire item** (the `text_color` field)?
- The data model has a `text_color` field on the item (whole item), but the toolbar implies inline text coloring.
- These are two different things. Which is it? Or both?

**Fix needed:** Clarify: "Color picker in the toolbar applies color to the **selected text range** (inline). The item-level `text_color` field is a separate concept applied when no text is selected, coloring the entire item."

---

### H7 — Board View: Missing Interaction Details

**Spec says (§6):** Board columns are 280px, cards are draggable.

**What's missing:**
- Can cards be **edited inline** in board view, or only by clicking to zoom?
- Can columns be **resized**?
- Is there a **maximum column count** before horizontal scrolling kicks in?
- What happens when a card has deeply nested children — does the card preview show them?
- Card says "2-line truncation" — but what font size? Same as bullet text?

**Fix needed:** Add: "Cards are not inline-editable in board view — clicking zooms in. Columns cannot be resized. No column limit; container scrolls horizontally. Card previews show only the card's own content (not children). Card text uses the same font size as bullet text (15px)."

---

### H8 — Comment Panel: Concurrent State

**Spec says (§3.10):** Comment panel slides in from the right.

**What's missing:**
- Can the comment panel be open simultaneously with the sidebar? (Both take screen space.)
- Can comments be open for one item while the user navigates to another item?
- Does the panel auto-close on zoom navigation?
- Can the user have multiple comment threads open?

**Fix needed:** Add: "Only one comment panel open at a time. Sidebar and comment panel can coexist (sidebar left, comments right). Panel auto-closes on zoom navigation. Opening comments on a different item replaces the current panel."

---

## 🟡 MEDIUM FAILURES (Edge Cases)

### M1 — Undo/Redo Scope

**Spec says (§2.4, §11):** Undo/redo with ⌘Z/⇧⌘Z.

**What's missing:**
- What actions are undoable? (Content edits? Type changes? Moves? Deletes? Completions? Color changes? All of them?)
- How deep is the undo stack? (Unlimited? Last 50 actions?)
- Does undo work across zoom navigation? (Undo an action from a different zoomed view?)
- Does undo restore the cursor position?

**Fix needed:** List all undoable actions, stack depth (recommend: 100 actions), and scope (current session only, not persisted).

---

### M2 — Command Palette: Which Actions?

**Spec says (§17):** "Mirrors every menu action for keyboard-first users."

**What's missing:** An actual list of all command palette commands. "Every menu action" is vague — does it include item-specific context menu actions? Search? Navigation?

**Fix needed:** State: "Command palette includes: all settings menu actions, all item type conversions, navigation (Home, Search, Today, Trash, Settings), and the current item's context menu actions if an item is focused."

---

### M3 — Fractional Ordering: Implementation Detail

**Spec says (Backend §9):** "Midpoint ordering, renumber when gap < 0.0001."

**Why it matters for frontend:** The frontend needs to compute new `sort_order` values for optimistic updates (before server confirms). If the frontend doesn't implement the same midpoint logic, optimistic order will diverge from server order.

**Fix needed:** Add to Frontend spec: "The frontend computes sort_order locally using the same midpoint algorithm as the backend for optimistic updates."

---

### M4 — Paste Multi-Line: Format Preservation

**Spec says (§4.1):** "Preserves basic formatting (bold, italic) when pasting formatted text. Strips complex or unknown formatting."

**What's missing:**
- What counts as "basic" vs "complex" formatting?
- Does pasting from a spreadsheet create a table? Or individual items per cell?
- Does pasting a URL auto-link it?
- Does pasting an image inline it or create a file attachment?

**Fix needed:** Define: "Basic = bold, italic, underline, strikethrough, code, links. Complex = tables, images, custom fonts, colors, headings. Pasted URLs become clickable links. Pasted images are ignored (use Upload file instead)."

---

### M5 — Settings Panel Contents

**Spec says (§2.4):** "Opens the settings panel (theme, font size, default view, show completed items, auto-collapse depth)."

**What's missing:** Full settings panel layout. What are the options for each setting?
- Theme: Light/Dark/System?
- Font size: Slider? Presets (Small/Medium/Large)?
- Default view: List/Board?
- Show completed: Toggle?
- Auto-collapse depth: Number input? Slider? What range?

**Fix needed:** Add a Settings Panel section with exact UI for each preference.

---

### M6 — Today View: Grouping and Editing

**Spec says (§9):** "Items are grouped by parent context — each group shows the breadcrumb path above it."

**What's missing:**
- Can items be reordered in Today view?
- Can items be indented/outdented in Today view?
- If an item is edited in Today view, does it update in the main tree?
- Can items be dragged between the "Overdue" and "Today" sections?

---

### M7 — Offline Queue and Conflict Resolution

**Spec says (§4.4):** "Queue all changes locally. On reconnect: sync queued changes in order."

**What's missing:**
- What if the user made conflicting changes offline? (Edited then deleted the same item?)
- Maximum queue size?
- Does the queue persist across page reloads? (localStorage? IndexedDB?)

---

### M8 — Search: Tag and Date Searching

**Spec says (§4.3):** "Debounced search across all the user's items (content and notes)."

**What's missing:**
- Can users search by tag? (e.g., typing `#urgent` in search)
- Can users search by date? (e.g., "items due today")
- Can users search by completion status?
- Is search limited to content + notes, or does it include tags and dates?

---

## 🟢 LOW FAILURES (Minor Gaps)

### L1 — Dark Mode HSL Values
No exact HSL values for dark mode tokens. AI will guess.

### L2 — Error Boundary Granularity
Spec says "each major section has its own error boundary" but doesn't list which sections exactly.

### L3 — Skeleton Loader Exact Dimensions
Spec says "6-8 gray pulsing lines at varied widths" but doesn't specify exact widths.

### L4 — Toast Duration
No specification for how long toast notifications remain visible (except the 5-second undo toast).

### L5 — Mobile Breakpoints
"Responsive" is mentioned but no specific breakpoints defined (e.g., sm: 640px, md: 768px, lg: 1024px).

### L6 — Focus Management After Actions
After zooming, deleting, or moving: where exactly does keyboard focus go?

### L7 — Location Picker Tree Depth
Should the location picker show the full tree, or only the first N levels with lazy loading?

---

## Summary Scorecard

| Severity | Count | Fixed | Remaining |
|----------|-------|-------|-----------|
| 🔴 CRITICAL | 3 | ✅ 3 (C1, C2, C3) | 0 |
| 🟠 HIGH | 8 | ✅ 8 (H1–H8) | 0 |
| 🟡 MEDIUM | 8 | ✅ 8 (M1–M8) | 0 |
| 🟢 LOW | 7 | ✅ 7 (L1–L7) | 0 |
| **Total** | **26** | **26** | **0** |

## Current Score Estimate: **100/100** ✅

All identified frontend spec gaps have been resolved:
1. ~~Fix all 3 🔴 CRITICAL items~~ ✅ Done (§6A, §6B, §6C)
2. ~~Fix all 8 🟠 HIGH items~~ ✅ Done (§6D.1–§6D.8)
3. ~~Fix all 8 🟡 MEDIUM items~~ ✅ Done (§6E.1–§6E.8)
4. ~~Fix all 7 🟢 LOW items~~ ✅ Done (§6F.1–§6F.7)
