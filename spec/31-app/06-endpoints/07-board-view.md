# Endpoints — 07 Board View

## Database Routing

**Read:** App DB (per-workspace; one SQLite file per workspace) only — `Items` (board is a *view* over the same rows the list view uses).
**Write:** App DB (per-workspace; one SQLite file per workspace) — `Items.ParentId` + `Items.SortOrder` on drag.
**Root DB:** untouched.

> **Audit cite:** Section added 2026-04-30 to close **F-AUD42-01** (App-folder audit Phase 4). Per ADR-0019 split-DB rules.


> **Version:** 1.0.0
> **Updated:** 2026-04-26 (UTC+8)
> **Parent:** [`./00-overview.md`](./00-overview.md)
> **Mirrors feature:** [`../01-features/07-board-view.md`](../01-features/07-board-view.md)

---

## Summary

| ID | M | Path | Auth | Purpose |
|----|---|------|------|---------|
| EP-BOARD-GET | GET | `items/{id}/board` | user | Fetch board projection |
| EP-BOARD-MOVE | POST | `items/{id}/board/move` | user | Move card across columns |

---

## EP-BOARD-GET — GET `items/{id}/board`

- **Path**: `id` MUST be an `Item` whose `ItemType` is `BoardProject`. Otherwise `ERR_NOT_BOARD`.
- **Auth**: `user` with read access.
- **Request body**: —
- **Success (200)** `Results`: `{ Columns: BoardColumn[], Cards: Item[] }` where each `BoardColumn = { Id, Title, Order }` and `Cards` are the children grouped by their column-discriminator field (per `07-board-view.md`).
- **Errors**: `ERR_NOT_FOUND`, `ERR_FORBIDDEN`, `ERR_NOT_BOARD`.
- **Side effects**: none.
- **AC refs**: `AT-APP-14`.

---

## EP-BOARD-MOVE — POST `items/{id}/board/move`

- **Path**: `id` is the **card** (child item) being moved.
- **Auth**: `user` with write access on the parent board.
- **Request body**:
  - `ToColumnId` (string, required)
  - `BeforeCardId` (string, optional)
  - `AfterCardId` (string, optional)
- **Rule**: at most one of `BeforeCardId` / `AfterCardId` may be set. Server updates the card's column-discriminator and computes new `FractionalIndex` within the destination column.
- **Success (200)** `Results`: updated `Item` (the card).
- **Errors**: `ERR_NOT_FOUND`, `ERR_FORBIDDEN`, `ERR_NOT_BOARD`, `ERR_INVALID_COLUMN`.
- **Side effects**: updates card's column field + `FractionalIndex`. Emits SSE `item-updated` on `item:{boardId}`.
- **AC refs**: `AT-APP-15`. Structural sync per `mem://features/board-view`.

---

## Cross-References

| Topic | Link |
|-------|------|
| Board model | [`../01-features/07-board-view.md`](../01-features/07-board-view.md) |
| Kanban behavior | `mem://features/board-view` |

---

## Database Scope

- **Anchor:** [`07-db-diagram/00b-split-db-anchor.md`](../07-db-diagram/00b-split-db-anchor.md)
- **Scope:** `[db-scope: app]`
- **Tables:** nodes (board children), node_view_state
- **Cross-DB JOINs:** forbidden (split-DB invariant). Cross-DB orchestration, if any, follows ADR-0019.
