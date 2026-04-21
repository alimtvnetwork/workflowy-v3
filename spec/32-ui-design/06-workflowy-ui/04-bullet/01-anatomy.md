# Bullet Row Anatomy

> **Parent:** [`00-overview.md`](./00-overview.md)
> **Screenshots:** img-46, 48, 50, 51

---

## Row Layout (left → right)

```
[⋯]  [▸]  [●]  This is the node content text...           [+ 💬]
 ↑    ↑    ↑                                                 ↑
 |    |    └─ Bullet dot (drag, zoom, select target)         |
 |    └────── Expand arrow (▸ collapsed / ▾ expanded)        |
 └────────── Left ⋯ menu trigger (hover only)             Comment + button
```

| Slot | Width | Visible When | Purpose |
|------|-------|--------------|---------|
| Left ⋯ | 16 px | Hover on row | Opens per-row action menu |
| Expand ▸/▾ | 16 px | Has children + inline (not focused-root) | Toggle child visibility |
| Dot ● | 16 px | Always | Drag, zoom, select |
| Content | flex (fills) | Always | Editable text + inline formatting |
| Comment + | 24 px | Hover OR has comments | Add/view comments |

---

## Bullet Dot States

| State | Visual Treatment |
|-------|------------------|
| Default (no children) | Solid dot, color = `--foreground` at 60% opacity |
| Has children, collapsed | Solid dot with subtle ring (2px outline `--muted`) |
| Has children, expanded | Solid dot only (ring removed) |
| Selected (multi-select) | Dot color = `--primary`, 100% opacity |
| Hovered | Cursor changes to `grab`, dot scales 1.1× |
| Dragging | Cursor `grabbing`, row opacity 0.5 |
| Mirror node | Dot color = `--accent` (visually distinct from primary) |
| Completed (todo) | Dot replaced with ✓ checkmark icon |

---

## Expand Arrow Rules

**Visible:** inline bullet WITH children.
**Hidden:** no children OR this row is the zoomed-focus root.

| State | Glyph | Rotation |
|-------|-------|----------|
| Collapsed | ▸ | 0° |
| Expanded | ▾ | 90° (animated 150ms ease) |
| Loading children (lazy) | ⋯ spinning | n/a |

Click target = full 16×16 area; hit area extended to 24×24 with transparent padding.

---

## Hover Affordances

When pointer enters the row bounding box:
1. Background color shifts to `--muted/30` (50ms ease-in).
2. Left ⋯ icon fades in (50ms).
3. Comment + icon fades in (50ms) — unless comments already exist.
4. Drag cursor becomes available over the dot.

When pointer leaves:
- All hover affordances fade out (100ms ease-out).
- Background returns to transparent.

**Touch devices:** ⋯ and + are always visible (no hover state). Deferred mobile spec → Phase 10.

---

## Content Slot

- Inherits font from app settings (default Inter, monospace if Code Block type).
- Editable inline (contenteditable surface).
- Supports inline formatting: **bold**, *italic*, ~~strike~~, `code`, `[link](url)`, @mention, #tag.
- Placeholder text "Untitled" shown when empty AND not focused.
- Word-wrap at container width; no horizontal scroll.

---

## Empty Row Behavior

A node with empty content still renders the full anatomy:
```
[⋯] [●] Untitled    [+]
```
The placeholder "Untitled" uses `--muted-foreground` italic.

---

## Click Targets (Accessibility)

| Target | Min Size |
|--------|----------|
| Dot | 24×24 (16 visual + 8 padding) |
| Expand arrow | 24×24 |
| Left ⋯ | 24×24 |
| Comment + | 32×32 |
| Content | full row height (min 32px) |

All meet WCAG 2.5.5 (Target Size, Level AAA).
