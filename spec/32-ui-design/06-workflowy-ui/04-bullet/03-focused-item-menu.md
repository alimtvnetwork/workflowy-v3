# Focused-Item Three-Dot Menu

> **Parent:** [`00-overview.md`](./00-overview.md)
> **Screenshots:** img-52, 63

---

## Context

When a node is **zoomed in** (focused as the page root), it renders as an H1-style title (Phase 1 navbar spec). The ⋯ menu for the focused item lives in the **top-right of the focused header area**, NOT inline beside the row.

This menu has a **distinct action set** from the per-row ⋯ menu because the focused item is no longer "in a list" — it IS the page.

---

## Trigger

| Trigger | Result |
|---------|--------|
| Click ⋯ button in focused-header top-right | Opens menu |
| Keyboard: `⌘⇧.` | Opens menu (focus first item) |

---

## Menu Order (LOCKED)

| # | Item | Icon | Shortcut | Notes |
|---|------|------|----------|-------|
| 1 | Add note | ¶ | ⇧↵ | Adds note below title |
| 2 | — divider — | | | |
| 3 | Expand all descendants | ▾▾ | — | Recursive expand |
| 4 | Collapse all descendants | ▸▸ | — | Recursive collapse |
| 5 | — divider — | | | |
| 6 | Duplicate this branch | ⎘ | ⌘⇧D | Copies entire subtree |
| 7 | Move this branch to... | → | — | Opens picker; auto-zooms-out after move |
| 8 | — divider — | | | |
| 9 | Convert to | ⇆ | — | Same submenu as per-row |
| 10 | Color | 🎨 | — | Same swatches as per-row |
| 11 | — divider — | | | |
| 12 | Copy link to this view | 🔗 | ⌘⇧C | Copies zoom-in URL |
| 13 | Export this branch | ⤓ | — | Plain / MD / OPML / JSON |
| 14 | Share this branch | ↗ | — | Opens share dialog |
| 15 | Print this branch | 🖨 | ⌘P | Browser print dialog |
| 16 | — divider — | | | |
| 17 | View settings | ⚙ | — | Per-view: hide notes, hide completed, sort |
| 18 | — divider — | | | |
| 19 | Delete this branch | 🗑 | ⌘⌫ | Confirmation dialog (irreversible-feeling action) |

---

## Differences vs Per-Row Menu

| Action | Per-Row | Focused |
|--------|---------|---------|
| Complete (todo toggle) | ✅ Available | ❌ Removed (focused titles aren't checkboxes) |
| Mirror | ✅ Available | ❌ Removed (cannot mirror your current view) |
| Print | ❌ N/A | ✅ Added |
| View settings | ❌ N/A | ✅ Added |

---

## View Settings Submenu

Click "View settings" (item 17) opens a sticky popover:

| Toggle | Default | Notes |
|--------|---------|-------|
| Hide completed | OFF | Hides all `complete = true` descendants |
| Hide notes | OFF | Collapses note lines |
| Show creation date | OFF | Adds metadata column |
| Show modified date | OFF | Adds metadata column |
| Sort by... | (manual) | manual / alpha / created / modified |

Settings persist per-view (per zoomed-node), not globally.

---

## Visual Treatment

Same tokens as per-row menu (Phase 4 `02-three-dot-menu.md`). Differences:
- Anchored to top-right corner of focused header (not inline)
- Width min 240px (slightly wider for verbose labels like "Duplicate this branch")
- Always opens downward (since header is top of viewport)

---

## Delete Confirmation

Item 19 ("Delete this branch") shows confirmation dialog because focused-item delete is high-impact:

```
Delete "<title>" and all N descendants?
This will move 1 + N items to Trash.
You can restore them within 30 days.

[Cancel]  [Move to Trash]
```

Per-row delete does NOT show confirmation (less destructive, single item).
