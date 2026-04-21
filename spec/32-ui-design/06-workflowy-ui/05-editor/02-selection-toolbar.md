# Selection Toolbar

> **Parent:** [`00-overview.md`](./00-overview.md)
> **Screenshots:** img-47, 59

---

## Trigger

Toolbar appears when:
- User selects ≥1 character of text within a node's content slot.
- Selection persists for >100ms (debounce to avoid flicker on click-drag).

Toolbar disappears when:
- Selection collapses (cursor with no range).
- User clicks outside the editor.
- `Esc` is pressed.

---

## Position

- Anchored **above** the selection bounding box.
- Vertical offset: 8px above selection top.
- Horizontal: centered on selection midpoint, clamped to viewport edges (8px gutter).
- Flips **below** selection if no room above (sticky to top of viewport).
- Animation: 150ms ease-out fade + 4px slide.

---

## Toolbar Order (LOCKED — from img-47)

Left → right:

| # | Group | Item | Icon | Action | Shortcut |
|---|-------|------|------|--------|----------|
| 1 | Format | Bold | **B** | Toggle bold | ⌘B |
| 2 | Format | Italic | *I* | Toggle italic | ⌘I |
| 3 | Format | Underline | U̲ | Toggle underline | ⌘U |
| 4 | Format | Strikethrough | ~~S~~ | Toggle strike | ⌘⇧X |
| 5 | Format | Inline code | `<>` | Toggle inline code | ⌘E |
| 6 | — | divider | | | |
| 7 | Color | Text color | A▾ | Opens text color popover (11 swatches) | — |
| 8 | Color | Highlight | ▣▾ | Opens highlight color popover (11 swatches) | — |
| 9 | — | divider | | | |
| 10 | Insert | Link | 🔗 | Opens URL input | ⌘K |
| 11 | Insert | Mention | @ | Opens people picker | @ |
| 12 | Insert | Date | 📅 | Opens date picker | — |
| 13 | — | divider | | | |
| 14 | More | ⋯ | ⋯ | Overflow menu (clear formatting, copy as markdown) | — |

---

## Color Popovers (Items 7 & 8)

When clicked, popover anchors below the toolbar button. Layout:

```
┌──────────────────────────────────────┐
│  ●  ●  ●  ●  ●  ●  ●  ●  ●  ●  ●     │  ← 11 text/highlight swatches
└──────────────────────────────────────┘
```

- Each swatch is 24×24, 4px gap, rounded.
- Click applies color to current selection, closes popover.
- "Default" reset chip at far left (✕ icon) clears color.
- See `04-color-palettes.md` for hex values.

---

## Visual Treatment

| Element | Token / Style |
|---------|---------------|
| Toolbar container | `--popover` bg, `--border` 1px, 6px radius, shadow-md |
| Height | 36px |
| Button | 28×28, 4px radius |
| Active state (e.g., bold-on) | `--accent` background, `--accent-foreground` icon |
| Hover | `--muted` background |
| Divider | 1px vertical line, `--border`, 4px horizontal margin |
| Tooltip | Shows on 500ms hover delay, includes label + shortcut |

---

## Multi-Row Selection

When selection spans multiple node rows (Phase 4 multi-select):
- Toolbar still appears, but only **format** group (1–6) is enabled.
- Color group enabled (applies to all selected nodes).
- Insert group disabled (Link/Mention/Date require single position).
- Tooltip explains: "Select within a single node to insert links."

---

## Keyboard Bypass

All toolbar actions have keyboard shortcuts (⌘B, ⌘I, etc.) that work without showing the toolbar — power users can skip the visual entirely.

---

## Cross-References

- `04-color-palettes.md` — full hex reference for color popovers
- Phase 4 [`04-bullet/01-anatomy.md`](../04-bullet/01-anatomy.md) — content slot defines the editable surface
