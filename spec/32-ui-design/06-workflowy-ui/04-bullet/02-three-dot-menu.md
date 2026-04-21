# Per-Row Three-Dot Menu

> **Parent:** [`00-overview.md`](./00-overview.md)
> **Screenshots:** img-49, 50, 51, 52 (order locked)

---

## Trigger

| Trigger | Result |
|---------|--------|
| Click left ⋯ icon (hover-revealed) | Opens menu anchored to ⋯ icon |
| Right-click anywhere on row | Opens menu at pointer position |
| Long-press on row (touch) | Opens menu (deferred to Phase 10) |

Menu closes on: outside click, `Esc` key, or action selection.

---

## Menu Order (LOCKED — from img-52)

The order below is **canonical** and must not be reordered without updating the source screenshot reference.

| # | Item | Icon | Shortcut | Notes |
|---|------|------|----------|-------|
| 1 | Complete | ☐ / ☑ | ⌘↵ | Toggle todo state (only if itemType = todo) |
| 2 | Add note | ¶ | ⇧↵ | Adds note line below content |
| 3 | Expand all | ▾▾ | — | Recursive expand of all descendants |
| 4 | Collapse all | ▸▸ | — | Recursive collapse |
| 5 | — divider — | | | |
| 6 | Duplicate | ⎘ | ⌘⇧D | Creates sibling copy |
| 7 | Mirror | ⇄ | ⌘⇧M | Creates linked instance |
| 8 | Move to... | → | — | Opens move-target picker |
| 9 | — divider — | | | |
| 10 | Convert to | ⇆ | — | Submenu with item types (Phase 5) |
| 11 | Color | 🎨 | — | Submenu with 11+11 swatches (Phase 5, Blocker B1) |
| 12 | — divider — | | | |
| 13 | Copy link | 🔗 | ⌘⇧C | Copies stable URL to clipboard |
| 14 | Export | ⤓ | — | Submenu: Plain text, Markdown, OPML, JSON |
| 15 | Share | ↗ | — | Opens share dialog (Phase 8 sharing model) |
| 16 | — divider — | | | |
| 17 | Delete | 🗑 | ⌘⌫ | Moves to Trash (30-day retention) |

---

## Submenu Behavior

Items 10, 11, 14 open submenus on hover (250ms delay) or click:
- **Convert to:** lists the 12 item types (see Phase 5 `03-item-types.md`).
- **Color:** 11 text colors (top row) + 11 highlight colors (bottom row) — see Phase 5 `04-color-palettes.md`.
- **Export:** 4 format options.

Submenu opens to the right; flips to left if viewport overflow.

---

## Visual Treatment

| Element | Token / Style |
|---------|---------------|
| Menu container | `--popover` background, `--border` 1px, 8px radius, shadow-lg |
| Item hover | `--accent` background, `--accent-foreground` text |
| Icon | 16×16, color `--muted-foreground`, becomes `--accent-foreground` on hover |
| Shortcut | Right-aligned, `--muted-foreground` 11px |
| Divider | 1px line `--border`, 4px vertical margin |
| Width | min 220px, max 320px |

---

## Multi-Select Mode

When 2+ rows are selected, opening the ⋯ menu on ANY selected row applies the action to ALL selected rows. Item labels adapt:
- "Delete" → "Delete N items"
- "Mirror" → "Mirror N items"
- "Color" → applies same color to all

Mutually-exclusive items (e.g., "Complete" with mixed todo states) show indeterminate icon (☐~).

---

## Disabled States

| Item | Disabled When |
|------|---------------|
| Complete | itemType ≠ todo |
| Expand/Collapse all | No children |
| Mirror | Already a mirror (cannot mirror a mirror) |
| Move to... | Node is root |
| Convert to | Node has children that conflict with target type |

Disabled items show 40% opacity, no hover effect, cursor `not-allowed`.
