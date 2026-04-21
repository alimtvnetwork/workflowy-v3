# Low-Severity Clarifications

> **Version:** 1.1.0  
> **Updated:** 2026-04-18

---

### 6F.1 Dark Mode HSL Values (L1)

**Dark mode core tokens:**

| Token | Light Mode HSL | Dark Mode HSL |
|-------|---------------|---------------|
| background | 0 0% 100% | 0 0% 7% |
| foreground | 0 0% 8% | 0 0% 95% |
| primary | 210 100% 50% | 210 100% 60% |
| primary-foreground | 0 0% 100% | 0 0% 100% |
| secondary | 0 0% 96% | 0 0% 12% |
| muted | 0 0% 96% | 0 0% 15% |
| muted-foreground | 0 0% 45% | 0 0% 60% |
| accent | 210 100% 95% | 210 40% 18% |
| destructive | 0 72% 51% | 0 62% 55% |
| warning | 38 92% 50% | 38 92% 55% |
| success | 142 71% 45% | 142 60% 50% |
| border | 0 0% 90% | 0 0% 20% |

**Dark mode WorkFlowy-specific tokens:**

| Token | Light Mode HSL | Dark Mode HSL |
|-------|---------------|---------------|
| bullet | 0 0% 70% | 0 0% 45% |
| bullet-hover | 210 100% 50% | 210 100% 60% |
| completed | 0 0% 75% | 0 0% 40% |
| note | 0 0% 55% | 0 0% 50% |
| highlight | 48 100% 88% | 48 60% 20% |
| drag-indicator | 210 100% 60% | 210 100% 60% |
| mirror | 210 100% 50% | 210 100% 60% |

**Dark mode text color picker colors:**

| Color | Light HSL | Dark HSL |
|-------|-----------|----------|
| Red | 0 72% 51% | 0 62% 60% |
| Orange | 25 95% 53% | 25 85% 58% |
| Yellow | 45 93% 47% | 45 80% 55% |
| Green | 142 71% 45% | 142 60% 55% |
| Blue | 210 100% 50% | 210 100% 60% |
| Purple | 270 60% 55% | 270 50% 65% |
| Gray | 0 0% 55% | 0 0% 50% |

---

### 6F.2 Error Boundary Granularity (L2)

Each of the following sections has its **own independent error boundary**. A crash in one section does NOT take down the others.

| Error Boundary | Wraps | Fallback UI |
|---------------|-------|-------------|
| App-level | Entire application | Full-page error: "Something went wrong" + "Reload" button |
| Content Area | BulletList, BoardView, and item rendering | Inline: "Failed to load items. Try again." + retry button |
| Sidebar | Favorites, Recent, Tags sections | Inline: "Failed to load sidebar." + retry button |
| NavBar | Breadcrumbs, right-side actions | NavBar renders without breadcrumbs; Home button always works |
| Comment Panel | CommentThread, CommentInput | Inline within panel: "Failed to load comments." + retry |
| Search Overlay | SearchResult list | Inline: "Search failed. Try again." + retry |
| Board View | BoardColumn, BoardCard rendering | Inline: "Failed to load board." + "Switch to list view" button |
| Settings Menu | Settings dropdown content | Menu renders with "Error loading menu" text |

---

### 6F.3 Skeleton Loader Dimensions (L3)

| Skeleton Element | Width | Height | Details |
|-----------------|-------|--------|---------|
| Bullet item row | Random: 40%, 65%, 80%, 55%, 70%, 45% of container width | 20px | Alternating widths to mimic real content. 8px vertical gap between rows. |
| Sidebar section title | 80px | 14px | Muted rectangle |
| Sidebar list item | Random: 60%, 75%, 50% of sidebar width | 16px | 6px vertical gap between items |
| Board column | 280px | 300px | Includes 2-3 skeleton cards inside |
| Board card | 256px (column width minus padding) | 60px | Rounded corners, 8px gap between cards |
| Breadcrumb bar | 200px | 14px | Single shimmer bar |
| Comment row | 90% of panel width | 48px | Includes circle (avatar) + two lines |

All skeleton elements use `animate-pulse` (Tailwind's built-in pulsing animation at 2s cycle).

---

### 6F.4 Toast Duration (L4)

| Toast Type | Duration | Dismissible |
|-----------|----------|-------------|
| Success ("Item completed", "Saved", etc.) | 3 seconds | Yes (click ✕) |
| Info ("Mirror created in…", "Moved to…") | 4 seconds | Yes |
| Warning ("You're offline", "Some changes couldn't sync") | Persistent until dismissed | Yes |
| Error ("Failed to save", "Cannot move item…") | 5 seconds | Yes |
| Undo ("Item deleted" with Undo button) | 5 seconds | Yes. Clicking "Undo" dismisses immediately and reverses the action. |
| Progress ("Creating X items…", "Syncing X changes…") | Persistent until complete | No (auto-dismisses on completion) |

**Stacking:** Maximum 3 toasts visible simultaneously. New toasts push older ones up. Excess toasts are queued.

---

### 6F.5 Responsive Breakpoints (L5)

| Breakpoint | Name | Layout Changes |
|-----------|------|---------------|
| < 640px | `sm` (mobile) | Sidebar overlays full-width. Comment panel overlays full-width. Board columns scroll horizontally (single column visible). NavBar: breadcrumbs hidden, only Home + Search + Settings visible. Bulk action bar stacks vertically. |
| 640px–767px | `sm-md` | Same as mobile but sidebar is 280px overlay with backdrop. |
| 768px–1023px | `md` (tablet) | Sidebar overlays with backdrop (280px). Comment panel overlays (360px). Board shows 2-3 columns. Full NavBar visible. |
| 1024px–1279px | `lg` (desktop) | Sidebar pushes content (280px). Comment panel pushes content (360px). Board shows 3-4 columns. |
| ≥ 1280px | `xl` (wide desktop) | Sidebar pushes content. Comment panel pushes content. Both can coexist. Board shows 4+ columns. |

**Touch adaptations on mobile:**
- Drag-and-drop: long-press (300ms) to initiate drag instead of immediate press
- Hover actions (comment button, ⋮): always visible as small icons instead of hover-dependent
- Text formatting toolbar: appears above keyboard near the top of the visible area

---

### 6F.6 Focus Management After Actions (L6)

| Action | Where Focus Goes |
|--------|-----------------|
| Create new item (Enter) | Caret at the start of the new item's content |
| Delete item (Backspace on empty) | Caret at the end of the previous visible item's content |
| Indent (Tab) | Focus stays in the same item, caret position unchanged |
| Outdent (⇧Tab) | Focus stays in the same item, caret position unchanged |
| Move item (⌘↑/⌘↓) | Focus stays in the moved item |
| Zoom in (click bullet) | Focus on the first child item of the zoomed view, or the empty bullet if no children |
| Zoom out (Back arrow / breadcrumb) | Focus on the item that was previously zoomed into (if visible), or the first item |
| Delete item (context menu → Delete) | Focus on the next sibling, or the previous sibling if it was the last, or the parent if no siblings remain |
| Complete item (⌘↵) | Focus stays on the same item |
| Close overlay (Escape) | Focus returns to the element that triggered the overlay |
| Search result selected | Focus on the selected item's content in the zoomed view |
| Duplicate item | Focus on the new duplicate item |

---

### 6F.7 Location Picker — Tree Display Rules (L7)

| Rule | Specification |
|------|---------------|
| Initial display | Show the first **2 levels** of the item tree (root-level items and their direct children). Deeper items are loaded on demand. |
| Expand on click | Clicking the expand arrow (▶) on an item loads and shows its children (lazy loading, max 50 children per request). |
| Search | Search input at the top filters the entire tree in real-time (debounced 300ms). Results show as a flat list with breadcrumb paths. |
| Invalid targets | For "Move To…": the item being moved and all its descendants are grayed out and unclickable. For "Mirror To…": no restrictions (mirrors can be placed anywhere). |
| Empty state | If search finds no matches: "No matching items." |
| Selected state | The selected target item has a blue accent background. |
| Confirm button | "Move here" or "Mirror here" button at the bottom of the dialog. Disabled until a valid target is selected. |
| Dialog size | 480px wide, 60vh max height. Scrollable tree area with fixed header (search) and footer (confirm button). |

---
