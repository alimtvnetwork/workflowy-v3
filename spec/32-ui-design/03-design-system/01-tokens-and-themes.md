# Design System

> **Version:** 1.1.0  
> **Updated:** 2026-04-18

---

### 6.1 Color Palette (all HSL values)

**Light Mode Core Colors**

| Token | Description |
|-------|-------------|
| background | White — main page background |
| foreground | Near-black — primary text |
| primary | Blue — accent color for interactive elements |
| primary-foreground | White — text on primary-colored backgrounds |
| secondary | Very light gray — secondary surfaces |
| muted | Very light gray — subdued backgrounds (badges, note areas) |
| muted-foreground | Medium gray — secondary text |
| accent | Very light blue — hover highlights, selected items |
| destructive | Red — error states, delete actions |
| warning | Amber/gold — warning states, favorites star, offline banner |
| success | Green — success confirmations |
| border | Light gray — dividers and borders |

**WorkFlowy-Specific Tokens**

| Token | Description |
|-------|-------------|
| bullet | Gray — default bullet dot color |
| bullet-hover | Blue — bullet dot on hover |
| completed | Light gray — completed item text |
| note | Medium gray — note text |
| highlight | Light yellow — search result match highlighting, new item flash |
| drag-indicator | Blue — drop zone indicator line |
| mirror | Blue — mirror diamond badge |

**Text Color Picker Colors** (for the A▾ dropdown)

Default (removes color), Red, Orange, Yellow, Green, Blue, Purple, Gray — each defined as an HSL token.

**Dark Mode** — all tokens have dark mode equivalents with inverted/adjusted values for proper contrast.

### 6.2 Typography Scale

| Element | Size | Weight | Color |
|---------|------|--------|-------|
| Heading 1 | 24px (1.5rem) | Bold (700) | Foreground |
| Heading 2 | 20px (1.25rem) | Semibold (600) | Foreground |
| Heading 3 | 18px (1.1rem) | Semibold (600) | Foreground |
| Bullet text | 15px (0.9375rem) | Regular (400) | Foreground |
| Note text | 13px (0.8125rem) | Regular (400) | Muted foreground |
| Breadcrumb text | 13px (0.8125rem) | Regular (400) | Muted foreground |
| Menu item text | 14px (0.875rem) | Regular (400) | Foreground |
| Badge / metadata text | 12px (0.75rem) | Medium (500) | Muted foreground |

### 6.3 Design Philosophy

- **Ultra-minimal** — white background, clean typography, very subtle borders, no decorative elements
- **Content-first** — the bullet list is the hero; everything else supports it
- **Semantic tokens only** — no hardcoded colors anywhere in components; everything references the design token system
- **Consistent spacing** — all spacing derived from the spacing scale below

### 6.3.1 Spacing Scale

All padding, margin, and gap values MUST use this scale consistently:

| Token | Value | Common Usage |
|-------|-------|-------------|
| xs | 2px | Item row vertical padding, tight inline gaps |
| sm | 4px | Icon-to-text gaps, badge internal padding |
| md | 8px | Button padding, card internal padding, list item gaps |
| lg | 12px | Section padding, board card padding, menu item padding |
| xl | 16px | Content area horizontal padding, dialog body padding |
| 2xl | 24px | Indent per nesting level, section gaps, sidebar section spacing |
| 3xl | 32px | Major section separators, page-level vertical spacing |
| 4xl | 48px | NavBar height, large layout gaps |
| 5xl | 64px | Page top/bottom padding, hero-level spacing |

### 6.4 Animation Specifications

| Animation | Duration | Easing | Used For |
|-----------|----------|--------|----------|
| Expand/collapse children | 150ms | Ease-out | Toggling item children visibility |
| Hover action fade-in | 100ms | Ease-in | Comment and context menu buttons appearing on hover |
| Sidebar slide | 200ms | Ease-out | Sidebar opening/closing |
| Bullet dot hover scale | 100ms | Ease-out | Bullet growing slightly on hover (1.0 → 1.2) |
| New item highlight flash | 1000ms | Ease-out | Briefly highlighting a newly created or duplicated item |
| Drag ghost | Spring physics | Stiffness: 300 | Item following cursor during drag |
| Sort reorder | 200ms | Ease-in-out | Items sliding to new positions after sort |
| Chevron rotation | 150ms | Ease | Expand/collapse triangle rotating 90° |

### 6.5 Key Dimensions

| Element | Size |
|---------|------|
| Indent per nesting level | 24px |
| Item row vertical padding | 2px |
| Bullet dot diameter | 6px |
| Bullet click target area | 20×20px |
| Navbar height | 48px |
| Sidebar width | 280px |
| Board column width | 280px |
| Board card padding | 12px |
| Border radius (default) | 8px (0.5rem) |

---
