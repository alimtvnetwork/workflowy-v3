# Today View

> **Parent:** [`00-overview.md`](./00-overview.md)
> **Screenshots:** img-57
> **Route:** `/today`

---

## Purpose

Aggregates all items relevant to "today" in a single, focused view — items with `date = today` plus all starred items (acts as a daily dashboard).

---

## Source Query

Items shown WHERE:
- `date = today` (today as `YYYY-MM-DD` in user's timezone) **OR**
- `starred = true`

Sorted per the active sort mode (default: manual order).

---

## Layout

```
┌──────────────────────────────────────┐
│  📅 Today           Tuesday, Apr 21  │  ← Header
│                       [⋯ View opts]  │
├──────────────────────────────────────┤
│  ⭐ STARRED                            │  ← Section
│  ●  Project Alpha kickoff            │
│  ●  Review PR #234                    │
│                                      │
│  📅 SCHEDULED FOR TODAY                │  ← Section
│  ●  9:00  Team standup                │
│  ●  14:00 Design review               │
│  ●  Lunch with Sara                   │  ← no time → bottom
│                                      │
│  ✓ COMPLETED (3)                       │  ← Collapsed by default
└──────────────────────────────────────┘
```

| Section | Contents | Default Collapse |
|---------|----------|------------------|
| Starred | All `starred = true` items | Expanded |
| Scheduled for Today | All `date = today` items | Expanded |
| Completed | Today's completed todos | Collapsed |

If a single item satisfies BOTH (starred + dated today), it appears in **Scheduled for Today** only (avoid duplication; star icon shown inline).

---

## Item Display

Items render as standard bullet rows (Phase 4 anatomy), with one addition:

| Element | Spec |
|---------|------|
| Time prefix | `HH:MM` in `--muted-foreground`, 12px monospace, before content |
| Star icon | ⭐ small icon at end of content (if also starred) |
| Source breadcrumb | Below content, 11px `--muted-foreground`, e.g. "in Projects › Alpha" |
| Click bullet dot | Zooms to source location (not Today view) |

---

## View Options Menu (⋯)

| Option | Default | Notes |
|--------|---------|-------|
| Sort by manual | ✅ | User drag-order, persists |
| Sort by time | | Time-of-day asc; no-time items last |
| Sort by alpha | | A→Z by content |
| Show completed | OFF | Reveals Completed section |
| Hide notes | OFF | Collapses note lines |
| Group by source | OFF | Sub-headers per parent node |

Settings persist per-user, applied across sessions.

---

## Manual Reordering

In manual mode, drag items within Today to reorder. Order is stored as `todayOrder: number` per item, separate from the natural tree position.

---

## Empty State

```
✨ Nothing scheduled for today.

Start your day by adding a task:
[+ Quick Add (⌘⇧N)]
```

---

## "+ Add to Today" Action

Inline button at end of each section:
- Adds new bullet with `date = today` (Scheduled section) or `starred = true` (Starred section).
- Inline editor opens immediately for content entry.

---

## Date Boundary

"Today" is computed at view load + refreshed every 60s. At midnight local-time:
- Items with yesterday's date drop off automatically.
- Toast notification: "It's a new day. Refresh Today view." with [Refresh] action (optional manual refresh, no forced reload).

---

## Cross-References

- Phase 6 [`06-sidebar/02-special-nodes.md`](../06-sidebar/02-special-nodes.md) — Today sidebar item routes here
- Phase 4 [`04-bullet/01-anatomy.md`](../04-bullet/01-anatomy.md) — Item rendering
- `03-found-dates.md` — Calendar view alternative
