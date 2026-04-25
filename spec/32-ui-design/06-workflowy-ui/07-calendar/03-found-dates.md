# Found Dates & Calendar Picker

> **Parent:** [`00-overview.md`](./00-overview.md)
> **Screenshots:** img-55, 57
> **Route:** `/calendar`

---

## Purpose

Visual month-grid view of all dates referenced anywhere in the user's tree. Each date with at least one referencing item gets a "Found Date marker" — a visual indicator that something exists on that date.

---

## Layout

```
┌──────────────────────────────────────────┐
│  ◀  April 2026  ▶          [Today] [⋮]   │  ← Month header + nav
├──────────────────────────────────────────┤
│  Mon  Tue  Wed  Thu  Fri  Sat  Sun       │  ← Day-of-week labels
├──────────────────────────────────────────┤
│  31    1    2    3    4    5    6        │  ← Week 1 (greyed prev month)
│       ●●        ●                         │  ← Markers
│   7    8    9   10   11   12   13        │
│                  ●●●                      │
│  14   15   16   17   18   19   20        │
│             ●         ●●                  │
│  21   22   23   24   25   26   27        │  ← Today highlighted
│  ●●●         ●●                           │
│  28   29   30    1    2    3    4        │  ← Last week + next month
└──────────────────────────────────────────┘
```

| Cell | Spec |
|------|------|
| Cell size | ~52×52px desktop, equal grid 7×6 |
| Day number | Top-left, 14px, `--foreground` |
| Today | Background `--accent`, text `--accent-foreground`, bold |
| Other-month days | 40% opacity |
| Selected (clicked) | Ring 2px `--primary` |
| Hover | Background `--muted/50` |

---

## Found Date Markers

Below the day number, render up to **3 dots** indicating found items on that date:

| Item Count | Display |
|------------|---------|
| 0 | No marker |
| 1 | ● single dot |
| 2 | ●● two dots |
| 3 | ●●● three dots |
| 4+ | ●●● + small "+N" badge |

Dot color = `--accent` by default. If date is overdue (past + has incomplete todos), color shifts to a destructive token.

---

## Marker Source

A date is "found" if ANY of these match:
- A node has explicit `date = YYYY-MM-DD` attribute.
- A node's content contains an inline date chip (`@2026-04-21` or natural language parsed).
- A node's content contains a hashtag-date syntax (`#2026-04-21`).

Markers update reactively — if user adds/removes date references, the calendar reflects within 200ms.

---

## Click Behavior

| Click Target | Action |
|--------------|--------|
| Day cell with markers | Open inline drawer below calendar showing all items on that date |
| Day cell empty | Opens "+ Add to <date>" inline composer |
| Today button | Scrolls to current month + selects today |
| ◀ / ▶ | Navigate prev/next month |
| Month header text | Opens month/year picker dropdown |

---

## Inline Drawer (Date Selected)

When a date with markers is clicked:

```
┌──────────────────────────────────────────┐
│  [Calendar grid stays visible]            │
├──────────────────────────────────────────┤
│  ▼ Items on Apr 21, 2026 (3)              │
│                                           │
│  ●  9:00  Team standup       ↗ Projects   │
│  ●  14:00 Design review      ↗ Projects   │
│  ●  Lunch with Sara          ↗ Personal   │
│                                           │
│  [+ Add item to this date]                │
└──────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Drawer animation | 200ms slide-down |
| Item rows | Same anatomy as Today view |
| ↗ link | Zooms to source node (closes calendar) |

---

## Drag-onto-Calendar

Per Phase 6 `03-drag-drop.md`:
- Drag node from any view onto **Calendar sidebar icon** → assigns `date = today`.
- Drag onto a **specific date cell in this view** → assigns that date.
- ⌥ + drag → mirror with date assignment.

---

## Month Header Menu (⋮)

| Option | Behavior |
|--------|----------|
| Jump to date... | Opens date picker, navigates calendar to that month |
| Jump to today | Same as Today button |
| Filter: show only overdue | Filters markers to incomplete past-dated todos |
| Filter: show only my items | Hide items shared with you (multi-user contexts) |
| Export this month as CSV | Downloads `dated-items-YYYY-MM.csv` |

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Initial render (current month) | < 200ms |
| Month navigation (prev/next) | < 100ms |
| Marker recalculation on edit | < 200ms |
| Inline drawer open | < 150ms |

---

## Empty State

If user's tree contains zero dated items:
```
📅 No dated items yet.

Add a date to any node:
• Type @today, @tomorrow, or @YYYY-MM-DD
• Drag a node onto a date cell
• Use the date picker in selection toolbar
```

---

## Cross-References

- Phase 2 [`02-search/06-query-grammar.md`](../02-search/06-query-grammar.md) — `date:`, `date-before:`, `date-after:` (Phase 2 v2.0.0)
- Phase 6 [`06-sidebar/02-special-nodes.md`](../06-sidebar/02-special-nodes.md) — Calendar sidebar item
- `01-today-view.md` — Today view sister surface
