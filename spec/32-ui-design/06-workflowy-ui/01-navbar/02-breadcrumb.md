# 2. Breadcrumb

> **Parent:** [`./00-overview.md`](./00-overview.md)
> **Reference:** `40-navbar-breadcrumb.png`, `52-absolute-path-and-context-menu.png`, `59-vibe-coding-prompts-context.png`

---

## Purpose

The breadcrumb shows the **absolute path from the user's root node to the currently focused node**. It is the primary visual indicator of "where you are" in the tree.

---

## Visual format

```
Home › Projects › Q2 Roadmap › Engineering › Current Node
└──┬─┘ └──┬───┘ └────┬─────┘ └─────┬─────┘ └─────┬──────┘
 root   ancestor   ancestor    ancestor       focused
```

- **Separator:** `›` (U+203A), surrounded by single spaces on each side.
- **Each segment:** clickable text link, no underline at rest, underline on hover.
- **First segment** is always `Home` (or the user-defined root label).
- **Last segment** (focused node) is rendered with the same styling as other segments — **NOT bold** in the breadcrumb. The bold/H1 rendering happens **below** the navbar in the focused-node title (see [`01-layout.md`](./01-layout.md) → focused-node title).

---

## Truncation rules

When the rendered breadcrumb width exceeds the available center-region width:

1. Always preserve the **first segment** (`Home`).
2. Always preserve the **last segment** (focused node).
3. Replace middle segments with `…` (U+2026).
4. The `…` itself is clickable → opens a popover listing all hidden segments in order, each clickable.

### Examples

| Full path | Available width | Rendered |
|-----------|-----------------|----------|
| `Home › A › B` | wide | `Home › A › B` |
| `Home › A › B › C › D › E` | medium | `Home › … › E` |
| `Home › A › B › C › D › E` | narrow | `Home › … › E` (still — never drop first or last) |
| `Home` (focused at root) | any | breadcrumb hidden entirely; focused-node title shows `Home` |

---

## Click behavior

| Click target | Action |
|--------------|--------|
| Any segment text | Focuses that node. Pushes current focus to history stack. Updates URL. |
| `…` (truncation indicator) | Opens popover with hidden segments, each clickable. |
| Separator `›` | No-op (not a click target). |

---

## Hover behavior

| Hover target | Visual |
|--------------|--------|
| Segment text | `text-decoration: underline`, color shifts to `--foreground` (from `--muted-foreground` at rest). |
| `…` | Underline + tooltip "Show hidden path". |

---

## States

| State | Treatment |
|-------|-----------|
| Default segment | `text-muted-foreground`, no underline. |
| Hovered segment | `text-foreground`, underline. |
| Last segment (focused) | Same as default — no special bold. (Bold rendering is in the body H1, not the breadcrumb.) |
| At home root | Breadcrumb hidden. Focused-node title shows root label. |

---

## Inline editing

The breadcrumb itself is **not** editable. To rename a node:

- Click the focused-node title (the H1 below the navbar) and edit inline.
- On save, the breadcrumb's last segment updates immediately (reactive).
- Renaming an ancestor (from a different view) updates the breadcrumb on next focus change.

---

## Accessibility

- Wrap in `<nav aria-label="Breadcrumb">`.
- Use an ordered list `<ol>` of `<li>` items.
- Mark the last segment with `aria-current="page"`.
- Truncation `…` element has `aria-label="Show hidden ancestors"` and is keyboard-focusable.

---

## Tokens

| Token | Usage |
|-------|-------|
| `--muted-foreground` | Default segment color |
| `--foreground` | Hover segment color |
| `--border` | Popover border (truncation popover) |
| `--popover` | Popover background |

---

## Out of scope

- Right-click context menu on a breadcrumb segment (open in new tab, copy link, etc.) — **deferred to Phase 4** (bullet context menus may share patterns).
- Drag-drop onto a breadcrumb segment to move nodes — **deferred to Phase 6** (sidebar drag-drop, blocker 2).
