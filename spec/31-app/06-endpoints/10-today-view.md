# Endpoints — 10 Today View

## Database Routing

**Read:** App DB (per-workspace; one SQLite file per workspace) — `Items WHERE DueAt = today()`.
**Read:** Root DB (per-user / workspace-membership scope) — user TZ via `OptionNameType::USER_TIMEZONE`.
**Write:** none (read-only view).

> **Audit cite:** Section added 2026-04-30 to close **F-AUD42-01** (App-folder audit Phase 4). Per ADR-0019 split-DB rules.


> **Version:** 1.0.0
> **Updated:** 2026-04-26 (UTC+8)
> **Parent:** [`./00-overview.md`](./00-overview.md)
> **Mirrors feature:** [`../01-features/10-today-view.md`](../01-features/10-today-view.md)

---

## Summary

| ID | M | Path | Auth | Purpose |
|----|---|------|------|---------|
| EP-VIEWS-TODAY | GET | `views/today` | user | Items whose `DueDate` is today, in user's TZ |

---

## EP-VIEWS-TODAY — GET `views/today`

- **Auth**: `user`.
- **Query params**:
  - `Timezone` (IANA, optional — defaults to `EP-ME`'s `Timezone`)
  - `IncludeOverdue` (boolean, default `true`)
  - `Limit` (int, ≤ 250, default 250)
- **Success (200)** `Results`: `{ Items: Item[], OverdueCount: number, TodayCount: number }`.
  - Items are sorted by `DueDate` ascending, then by `FractionalIndex`.
- **Errors**: `ERR_INVALID_TIMEZONE`, `ERR_LIMIT_EXCEEDED`.
- **Side effects**: none (read-only projection).
- **AC refs**: `AT-APP-21`.

---

## Notes

- The 250-item cap (L4) applies. If a user has more than 250 items due today + overdue, the response is truncated and `OverdueCount` / `TodayCount` reflect the **true** totals (not the truncated set).
- Mirrors are included if their canonical has a `DueDate` matching today; the result row is the **mirror** item, not the canonical, so the user can navigate to the location they expect.

---

## Cross-References

| Topic | Link |
|-------|------|
| Today behavior | [`../01-features/10-today-view.md`](../01-features/10-today-view.md) |
