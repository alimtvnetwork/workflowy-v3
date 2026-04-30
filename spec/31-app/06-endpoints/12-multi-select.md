# Endpoints — 12 Multi-Select (Bulk Operations)

## Database Routing

**Read:** Root DB (per-user / workspace-membership scope) for capability checks. **Read:** App DB (per-workspace; one SQLite file per workspace) — `Items` (selection set validation).
**Write:** App DB (per-workspace; one SQLite file per workspace) — bulk `Items` mutations + `ItemTags` + `Mirrors` in a single transaction per App DB.
**Cross-workspace selection:** not supported (selection is workspace-scoped).

> **Audit cite:** Section added 2026-04-30 to close **F-AUD42-01** (App-folder audit Phase 4). Per ADR-0019 split-DB rules.


> **Version:** 1.0.0
> **Updated:** 2026-04-26 (UTC+8)
> **Parent:** [`./00-overview.md`](./00-overview.md)
> **Mirrors feature:** [`../01-features/12-multi-select.md`](../01-features/12-multi-select.md)

---

## Summary

| ID | M | Path | Auth | Purpose |
|----|---|------|------|---------|
| EP-BULK-MOVE | POST | `items/bulk/move` | user | Move N items to a new parent |
| EP-BULK-DELETE | POST | `items/bulk/delete` | user | Soft-delete N items |
| EP-BULK-COMPLETE | POST | `items/bulk/complete` | user | Toggle completion on N items |
| EP-BULK-TAGS | POST | `items/bulk/tags` | user | Add/remove tags on N items |

> **Hard cap**: every bulk endpoint accepts **at most 250 IDs per request** (per L4). Exceeding returns `ERR_LIMIT_EXCEEDED`. Larger operations MUST be batched client-side.
> **Atomicity**: each bulk endpoint is executed inside a single SQLite transaction. Either all changes commit or none do; partial success is forbidden.

---

## EP-BULK-MOVE — POST `items/bulk/move`

- **Auth**: `user` with write access on every source AND the target parent.
- **Request body**: `{ Ids: string[], TargetParentId: string, Order?: 'preserve' | 'append' }` (default `append`).
- **Success (200)** `Results`: `{ MovedCount: number, NewParentId: string }`.
- **Errors**: `ERR_FORBIDDEN`, `ERR_CYCLE`, `ERR_PARENT_FULL`, `ERR_LIMIT_EXCEEDED`.
- **Side effects**: updates `ParentId` + `FractionalIndex` for all items. Emits one combined SSE `items.moved` per affected parent.
- **AC refs**: `AT-APP-25`.

---

## EP-BULK-DELETE — POST `items/bulk/delete`

- **Auth**: `user` with write on every item.
- **Request body**: `{ Ids: string[] }`.
- **Success (200)** `Results`: `{ DeletedCount: number }`.
- **Errors**: `ERR_FORBIDDEN`, `ERR_ROOT_PROTECTED`, `ERR_LIMIT_EXCEEDED`.
- **Side effects**: soft-deletes each item + subtree. Emits SSE `items.deleted`.

---

## EP-BULK-COMPLETE — POST `items/bulk/complete`

- **Auth**: `user` with write on every item.
- **Request body**: `{ Ids: string[], Completed: boolean }`.
- **Success (200)** `Results`: `{ UpdatedCount: number }`.
- **Errors**: `ERR_FORBIDDEN`, `ERR_LIMIT_EXCEEDED`.
- **Side effects**: emits SSE `items.updated`.

---

## EP-BULK-TAGS — POST `items/bulk/tags`

- **Auth**: `user` with write on every item.
- **Request body**: `{ Ids: string[], Add?: string[], Remove?: string[] }` (at least one of `Add`/`Remove` required).
- **Success (200)** `Results`: `{ UpdatedCount: number }`.
- **Errors**: `ERR_FORBIDDEN`, `ERR_INVALID_TAG`, `ERR_LIMIT_EXCEEDED`.
- **Side effects**: emits SSE `items.updated`.

---

## Cross-References

| Topic | Link |
|-------|------|
| Multi-select rules | [`../01-features/12-multi-select.md`](../01-features/12-multi-select.md) |
| Bulk semantics | `mem://features/multi-select` |
