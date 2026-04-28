# Today View Specification

> **Version:** 2.1.0
> **Updated:** 2026-04-26 — APP-FIX-05: Settings Keys (Seedable Config) section added (closes audit F-04 for this file).
> **Parent:** [00-overview.md](./00-overview.md)
> **Template:** [13-feature-file-template.md](../../01-spec-authoring-guide/13-feature-file-template.md)

---

## Overview

The Today view is a date-driven filter that surfaces every item assigned to today (and an Overdue band for anything past). Items render with full inline-edit parity, grouped by parent breadcrumb so users can act on tasks without losing the surrounding project context.

## User Story

As a daily planner, I want a single screen that shows everything due today plus what slipped from earlier days, so that I can triage and complete work without hunting through projects.

---

### 9.1 Behavior
- Clicking the 📅 Today button in the navbar filters to all items where the assigned date is today.
- Items are grouped by parent context — each group shows the breadcrumb path above it.
- Items are fully editable in place (same interactions as the normal view).
- Overdue items (items with past dates) appear in a separate "Overdue" section above the today section, styled in a warning/red color.

---

## Settings Keys (Seedable Config)

> **Why this section:** Today View consumes `userTimezone` from settings (see Inputs §). Per [`spec/06-seedable-config-architecture/`](../../06-seedable-config-architecture/00-overview.md) + [`spec/15-wp-plugin-how-to/15-settings-architecture/`](../../15-wp-plugin-how-to/15-settings-architecture/00-overview.md), the timezone key MUST be enum-backed, defaulted, sanitized, and grouped — never read via a bare string.

| Setting | `OptionNameType` enum case | Default | Sanitizer | Group | Storage |
|---------|---------------------------|---------|-----------|-------|---------|
| User timezone | `OptionNameType::USER_TIMEZONE` → `'workflowy_user_timezone'` | Browser TZ via `Intl.DateTimeFormat().resolvedOptions().timeZone`; PHP fallback `wp_timezone_string()` | `Sanitizer::ianaTimezone()` (rejects unknown TZDB names) | `wf_locale` | Root DB (per-user) |

**Forbidden:**
- ❌ `get_option('workflowy_user_timezone')` — must go through the Settings facade.
- ❌ Storing offsets (e.g. `+08:00`) instead of IANA names — DST breaks.
- ❌ Defaulting to UTC silently — fall back to the browser TZ then `wp_timezone_string()`.

---

## Inputs

| Field | Type | Source | Required | Notes |
|-------|------|--------|----------|-------|
| `currentUser` | `User` | Auth session | Yes | Today is per-user; respects shared-item access |
| `nowLocal` | `Date` | Browser clock | Yes | Day boundary uses user's local timezone |
| `assignedItems` | `Item[]` | API: `GET /items?dateAssigned=lte:today` | Yes | Includes today + overdue |
| `viewportSize` | `{ w: number; h: number }` | Window | Yes | Drives 250-per-view virtualization |
| `userTimezone` | `string` (IANA) | Settings | No | Defaults to browser TZ |

## Outputs

| Output | Persisted? | Channel | Notes |
|--------|-----------|---------|-------|
| Today section render | ❌ | React state | Items where `dateAssigned == today` |
| Overdue section render | ❌ | React state | Items where `dateAssigned < today` and not completed |
| Breadcrumb headers | ❌ | React state | One per parent group |
| Inline edit → source update | ✅ SQLite | `Item.content` UPDATE | Same path as normal view |
| Completion toggle | ✅ SQLite | `Item.completedAt` set | Item leaves Today on next render |
| Date reschedule | ✅ SQLite | `Item.dateAssigned` UPDATE | Item moves between Overdue / Today / future |
| Empty-state illustration | ❌ | React state | Shown when both sections are empty |

## Edge Cases

1. User has no items assigned to today and none overdue — show empty state "Nothing due today 🎉".
2. Item's date is today in user TZ but yesterday in UTC — group by user's local day boundary, not UTC.
3. User reschedules a Today item to tomorrow — item disappears from Today within 100 ms (optimistic).
4. Overdue item is checked complete — item disappears from Overdue within 100 ms.
5. User has 500 overdue items — virtualize the Overdue list; respect 250-per-view cap with "Load more" sentinel.
6. Item is a mirror — shows the source's content; editing here updates source + all mirrors per `09-mirrors.md`.
7. Item's parent group has 50 children due today — render the parent breadcrumb once, then list all 50 under it.
8. User crosses midnight while view is open — auto-refresh moves yesterday's items to Overdue at the boundary.
9. User changes timezone in settings — view recomputes day boundary on next render.
10. Source item is deleted in another tab while visible in Today — row removes itself with fade-out.
11. Item assigned to today belongs to a shared workspace where access was just revoked — row removes itself with toast "Access removed".
12. User clicks a breadcrumb group header — zooms into that parent (standard zoom navigation).
13. Network is offline — render last-cached Today set; updates queue per offline-resilience.

## Acceptance Tests

| ID | Given | When | Then | testid |
|----|-------|------|------|--------|
| AT-TODAY-01 | User has items assigned today + overdue | User clicks 📅 Today in navbar | Route changes to `/today`; Today + Overdue sections render | `today-view-root` |
| AT-TODAY-02 | No items due or overdue | View renders | Empty state "Nothing due today 🎉" appears | `today-empty-state` |
| AT-TODAY-03 | 3 items overdue exist | View renders | Overdue section appears ABOVE Today section, styled with warning/destructive color | `today-overdue-section` |
| AT-TODAY-04 | 5 items due today across 2 parents | View renders | Each parent breadcrumb renders once with its children grouped under it | `today-breadcrumb-group` |
| AT-TODAY-05 | Today item is editable | User clicks content and types | Inline contenteditable activates; source `Item.content` updates on blur | `today-item-content` |
| AT-TODAY-06 | Today item is a to-do | User checks the box | `Item.completedAt` set; row leaves Today within 100 ms | `today-todo-checkbox` |
| AT-TODAY-07 | Today item exists | User reschedules to tomorrow via date picker | Item disappears from Today within 100 ms | `today-date-picker` |
| AT-TODAY-08 | Item TZ is today in user TZ but yesterday in UTC | View renders | Item appears in Today (local boundary, not UTC) | `today-item-row` |
| AT-TODAY-09 | 500 overdue items | View renders | List virtualizes to ≤250 visible rows; "Load more" sentinel appears | `today-load-more` |
| AT-TODAY-10 | Item is a mirror | User edits content in Today | Source + all other mirrors reflect change within 100 ms | `today-item-content` |
| AT-TODAY-11 | View is open at 23:59 local | Clock crosses midnight | Yesterday's items auto-shift from Today to Overdue without manual refresh | `today-view-root` |
| AT-TODAY-12 | User clicks a breadcrumb header | — | Zoom navigates to that parent item | `today-breadcrumb-group` |
| AT-TODAY-13 | Network drops | Open Today | Last-cached set renders; reschedule queues for replay on reconnect | `today-view-root` |
| AT-TODAY-14 | Source item deleted in another tab | Row is visible | Row fades out within 200 ms | `today-item-row` |

## Component Contract

| Surface | Component path | `data-testid` | Acceptance tests |
|---------|---------------|---------------|------------------|
| Today view root | `src/pages/Today.tsx` | `today-view-root` | AT-TODAY-01, 11, 13 |
| Empty state | `src/components/today/TodayEmptyState.tsx` | `today-empty-state` | AT-TODAY-02 |
| Overdue section | `src/components/today/OverdueSection.tsx` | `today-overdue-section` | AT-TODAY-03 |
| Breadcrumb group header | `src/components/today/BreadcrumbGroup.tsx` | `today-breadcrumb-group` | AT-TODAY-04, 12 |
| Today item row | `src/components/today/TodayItemRow.tsx` | `today-item-row`, `today-item-content` | AT-TODAY-05, 08, 10, 14 |
| Todo checkbox | `src/components/items/TodoCheckbox.tsx` | `today-todo-checkbox` | AT-TODAY-06 |
| Date picker | `src/components/items/DatePicker.tsx` | `today-date-picker` | AT-TODAY-07 |
| Load-more sentinel | `src/components/shared/LoadMoreSentinel.tsx` | `today-load-more` | AT-TODAY-09 |

> **Note:** Components are planned paths — none exist yet. Feeds the global component-contract map (M-3).

---

## Workflowy Feature Reference (F2) — Date Surface & Today Anchor

> **Source:** Workflowy product feature list, merged 2026-04-28 (lossless, additive). Reproduced verbatim; cross-linked to existing AT-TODAY-* rows above.

- **Today View** — A virtual page listing every item whose date chip resolves to the current calendar day (user's local TZ). Reached via the `📅 Today` chrome button (see [`./03-layout-structure.md`](./03-layout-structure.md) F2 appendix) or the sidebar Today shortcut.
- **Add Date** — Insert a date chip into any item's content. Date chips power Today view, date-keyword search, and the `has:date` operator. `⌘+Shift+. on macOS / Ctrl+Shift+. on Windows`
- **Date Search** — Find items by date using keywords (`today`, `yesterday`, `this-week`, `last-week`, `next-week`) or absolute dates (`MM/DD/YYYY`, `YYYY-MM-DD`). Combine with `has:date` for explicit chip-only filtering. See [`./16-search-ranking.md`](./16-search-ranking.md) F2 appendix for the operator table.
- **Jump To Today** — Pressing `T` while focused in Jump-To overlay (⌘P) snaps the cursor to the Today entry. `⌘P then `today` ↵`
- **Recurring Dates (out of scope, v1)** — Workflowy supports recurring date chips. WorkFlowy v1 does NOT; deferred to a post-v1 ambiguity entry. Tracked under `.lovable/question-and-ambiguity/` (F7 reconciliation candidate).

> Cross-link: full operator list and ranking → [`./16-search-ranking.md`](./16-search-ranking.md). Chrome `📅 Today` button → [`./03-layout-structure.md`](./03-layout-structure.md).

---

## Related

- [03-layout-structure.md](./03-layout-structure.md) — 📅 Today button in navbar
- [04-page-content-area.md](./04-page-content-area.md) — shared item-row rendering rules
- [09-mirrors.md](./09-mirrors.md) — mirrored items in Today edit the source
- [03-edge-cases/01-edge-cases.md](../03-edge-cases/01-edge-cases.md) — timezone + day-boundary cases
- `mem://features/offline-resilience` — cached render + queued updates
