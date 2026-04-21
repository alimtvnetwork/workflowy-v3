# Hotkeys Reference

> **Parent:** [`00-overview.md`](./00-overview.md)  
> **Source:** img-65 verbatim (~30 entries)

---

## Platform Detection

| Platform | Modifier | Display |
|----------|----------|---------|
| macOS | Cmd ⌘ | "⌘" |
| Windows | Ctrl | "Ctrl" |
| Linux | Ctrl | "Ctrl" |

All shortcuts use **Cmd on Mac, Ctrl elsewhere** — no platform-specific variants except the symbol display.

---

## Hotkey Table (~30 entries)

Sorted by functional category, then alphabetical within category.

### Navigation

| Shortcut | Action | Context |
|----------|--------|---------|
| ⌘↑ / Ctrl+↑ | Move to parent | Any node with parent |
| ⌘↓ / Ctrl+↓ | Move to first child | Nodes with children only |
| ⌘→ / Ctrl+→ | Zoom in (focus node) | Any node |
| ⌘← / Ctrl+← | Zoom out (parent view) | Zoomed state only |
| ⌘. / Ctrl+. | Go to Home | Global |
| ⌘⇧H / Ctrl+Shift+H | Go to Inbox | Global |

### Editing

| Shortcut | Action | Context |
|----------|--------|---------|
| ↵ | Edit selected node | Node selected, not editing |
| ⌘↵ / Ctrl+Enter | Save & exit edit | Editing mode |
| ⌘A / Ctrl+A | Select all text | Editing mode |
| ⌘Z / Ctrl+Z | Undo | Global |
| ⌘⇧Z / Ctrl+Shift+Z | Redo | Global |
| ⌘X / Ctrl+X | Cut node | Node selected |
| ⌘C / Ctrl+C | Copy node | Node selected |
| ⌘V / Ctrl+V | Paste node | Node selected |
| ⌘⇧V / Ctrl+Shift+V | Paste as mirror | Node selected |

### Hierarchy

| Shortcut | Action | Context |
|----------|--------|---------|
| ⌘⇧→ / Ctrl+Shift+→ | Indent (make child) | Node selected |
| ⌘⇧← / Ctrl+Shift+← | Outdent (make sibling of parent) | Indented node |
| ⌘⇧↑ / Ctrl+Shift+↑ | Move up | Node selected |
| ⌘⇧↓ / Ctrl+Shift+↓ | Move down | Node selected |
| Tab | Indent while editing | Editing mode |
| Shift+Tab | Outdent while editing | Editing mode, indented |

### Selection & Multi-Select

| Shortcut | Action | Context |
|----------|--------|---------|
| ↑ / ↓ | Navigate up/down | Navigation mode |
| ⇧↑ / Shift+↑ | Add to selection above | Navigation mode |
| ⇧↓ / Shift+↓ | Add to selection below | Navigation mode |
| ⌘Click / Ctrl+Click | Toggle item in selection | Any |
| Esc | Clear selection | Selection active |
| ⌘A / Ctrl+A (navigation) | Select all visible | Navigation mode, no edit |

### View & Interface

| Shortcut | Action | Context |
|----------|--------|---------|
| ⌘/ / Ctrl+/ | Toggle right panel | Global |
| ⌘⇧N / Ctrl+Shift+N | Quick Add modal | Global |
| ⌘F / Ctrl+F | Open search overlay | Global |
| ⌘L / Ctrl+L | Toggle left sidebar | Global |
| ⌘+ / Ctrl+Plus | Zoom in (font) | Global |
| ⌘- / Ctrl+Minus | Zoom out (font) | Global |
| ⌘0 / Ctrl+0 | Reset zoom | Global |

### Advanced

| Shortcut | Action | Context |
|----------|--------|---------|
| ⌘⇧C / Ctrl+Shift+C | Copy link to node | Node selected |
| ⌘⇧D / Ctrl+Shift+D | Duplicate node | Node selected |
| ⌘⇧M / Ctrl+Shift+M | Toggle mirror | Node selected, has mirrors |
| ⌘⇧T / Ctrl+Shift+T | Add/remove from Starred | Node selected |
| / | Open slash menu | Editing mode |

---

## Visual Treatment

| Element | Token / Style |
|---------|---------------|
| Table header | `--muted` background, `--foreground` text, uppercase 11px |
| Category divider | 2px line using `--border` |
| Shortcut chip | `--accent` background, `--accent-foreground` text, 4px radius |
| Modifier key | Bold weight within chip |
| Action description | `--foreground` 14px |
| Context tag | `--muted-foreground` 11px, italic |

---

## Interactions

- **Click shortcut chip:** Trims to "copy to clipboard" (flash toast: "⌘C copied").
- **Hover row:** Background highlight `--muted/40`.
- **Filter:** Optional search field above table (not required for v1).

---

## Source Attribution

> All shortcuts transcribed verbatim from screenshot img-65. Discrepancies with standard OS conventions (e.g., Ctrl vs Cmd) resolved by "Cmd on Mac / Ctrl elsewhere" rule.
