# Endpoints — 11b Trash Reaper (Server Cron)

> **Version:** 1.0.0
> **Updated:** 2026-04-27 (UTC+8)
> **Parent:** [`./00-overview.md`](./00-overview.md)
> **Mirrors feature:** [`../01-features/11b-trash-reaper.md`](../01-features/11b-trash-reaper.md)
> **Addendum to:** [`./11-trash-view.md`](./11-trash-view.md)

---

## Summary

| ID | M | Path | Auth | Purpose |
|----|---|------|------|---------|
| EP-REAPER-RUN | POST | `admin/trash/reaper/run` | admin | Manually trigger the daily hard-delete sweep |
| EP-REAPER-RUNS-LIST | GET | `admin/trash/reaper/runs` | admin | List recent `ReaperRuns` audit rows |

> **Cron schedule**: the WP plugin registers a daily WP-Cron hook (`workflowy_reaper_daily`) that invokes the same internal handler as `EP-REAPER-RUN`. The HTTP endpoint exists only for admin diagnostics and CI smoke tests — normal operation is fully automatic.

---

## EP-REAPER-RUN — POST `admin/trash/reaper/run`

- **Auth**: `admin` (capability `manage_options`).
- **Request body**: `{ DryRun?: boolean, BatchSize?: number }` — `DryRun` defaults `false`; `BatchSize` defaults `500` (max `5000`).
- **Success (200)** `Results`: `{ RanAt: string, RowsDeleted: number, BatchCount: number, DurationMs: number, DryRun: boolean }`.
- **Errors**: `ERR_FORBIDDEN`, `ERR_REAPER_LOCKED` (another sweep is already running — single-flight via DB advisory lock).
- **Side effects**:
  - Hard-deletes every `Item` with `DeletedAt < (now() − 30 days)` and its subtree.
  - Mirrors of purged items receive `Mirrors.BrokenAt = now()` per §14.4 and emit SSE `mirror-broken`.
  - Inserts one row into `ReaperRuns` (per `02-app-schema.sql` v2.1.0).
  - When `DryRun = true`: counts only, no deletes, no `ReaperRuns` row, no SSE.
- **AC refs**: `AT-APP-81`, `AT-APP-82`, `AT-APP-83`, `AT-APP-84`.

---

## EP-REAPER-RUNS-LIST — GET `admin/trash/reaper/runs`

- **Auth**: `admin`.
- **Query**: `Limit` (≤ 100, default 30), `Cursor`.
- **Success (200)** `Results`: `{ Runs: ReaperRun[], NextCursor?: string }` — newest first by `RanAt` (uses `IdxReaperRuns_RanAt`).
- **Errors**: `ERR_FORBIDDEN`.
- **Side effects**: none.
- **AC refs**: `AT-APP-81`.

---

## Cross-References

| Topic | Link |
|-------|------|
| Retention policy (30 d hard delete) | `mem://features/trash-logic` |
| Schema | [`../07-db-diagram/sql/02-app-schema.sql`](../07-db-diagram/sql/02-app-schema.sql) — `ReaperRuns` |
| User-facing trash API | [`./11-trash-view.md`](./11-trash-view.md) |
