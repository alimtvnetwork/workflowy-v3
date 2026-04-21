# Drag-and-Drop Zone Algorithm

> **Version:** 1.1.0  
> **Updated:** 2026-04-18

---

### 6C.1 Drop Zone Detection

Each item row is divided into **three vertical zones** based on the cursor's Y position within the row:

| Zone | Vertical Position | Drop Effect | Visual Indicator |
|------|-------------------|-------------|-----------------|
| **Top zone** | Top 25% of the row height | Insert **before** this item (as sibling above) | Thin horizontal blue line above the row |
| **Center zone** | Middle 50% of the row height | Insert **as child** of this item (last child) | Blue left-border highlight on the entire row + slight indent highlight |
| **Bottom zone** | Bottom 25% of the row height | Insert **after** this item (as sibling below) | Thin horizontal blue line below the row |

### 6C.2 Indent-Level Targeting

When the dragged item is released, the **horizontal position** of the cursor determines the indent level:

| Cursor X Position | Behavior |
|-------------------|----------|
| Aligned with the target item's indent | Drop at the same level as the target |
| 24px+ to the right of the target | Drop as child of the target (one level deeper) |
| 24px+ to the left of the target | Drop at the parent's level (one level shallower). Repeat for each additional 24px offset. |

The horizontal offset provides a secondary signal that is combined with the vertical zone. The vertical zone (top/center/bottom) determines before/child/after, while horizontal offset adjusts the nesting depth.

### 6C.3 Visual Indicators

| Indicator | Appearance | When Shown |
|-----------|------------|------------|
| Sibling line (before) | 2px solid blue line, full width, positioned at the top edge of the target row | Cursor in top 25% of a row |
| Sibling line (after) | 2px solid blue line, full width, positioned at the bottom edge of the target row | Cursor in bottom 25% of a row |
| Child highlight | Target row gets a light blue-tinted left border (4px) and subtle background tint | Cursor in center 50% of a row |
| Drag ghost | Semi-transparent copy of the dragged item row, attached to cursor with spring physics | Always during drag |
| Invalid drop | No indicator shown. If dropped: item returns to original position with a snap-back animation | When hovering over own descendants or other invalid targets |

### 6C.4 Drop Validation Rules

| Rule | Behavior |
|------|----------|
| Cannot drop into own descendants | Show no drop indicator; snap back on release |
| Cannot drop a root-level item above root level | Clamp to root level |
| End-of-list drop zone | A 32px tall invisible drop zone exists after the last visible item at each nesting level, allowing drops at the end of any list |
| Collapsed item drop | Dropping on a collapsed item inserts as child (not visible until expanded). The item auto-expands after drop to confirm placement. |
| Empty area drop | Dropping on empty space below all items creates a new root-level sibling at the end |

---
