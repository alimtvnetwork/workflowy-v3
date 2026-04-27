# Endpoints — 11 Trash View

> **Version:** 1.0.0
> **Updated:** 2026-04-26 (UTC+8)
> **Parent:** [`./00-overview.md`](./00-overview.md)
> **Mirrors feature:** [`../01-features/11-trash-view.md`](../01-features/11-trash-view.md)

---

## Summary

| ID | M | Path | Auth | Purpose |
|----|---|------|------|---------|
| EP-TRASH-LIST | GET | `trash` | user | List soft-deleted items (≤ 30 d) |
| EP-TRASH-RESTORE | POST | `trash/{id}/restore` | user | Restore one item to its prior parent |
| EP-TRASH-PURGE-ONE | DELETE | `trash/{id}` | user | Hard-delete one item now |
| EP-TRASH-PURGE-ALL | DELETE | `trash` | user | Empty trash entirely |

---

## EP-TRASH-LIST — GET `trash`

- **Auth**: `user`.
- **Query**: `Limit` (≤ 250), `Cursor`.
- **Success (200)** `Results`: `{ Items: Item[], NextCursor?: string }` — each item includes `DeletedAt` and `DaysRemaining` (30 − age).
- **Errors**: `ERR_LIMIT_EXCEEDED`.
- **Side effects**: none.
- **AC refs**: `AT-APP-22`.

---

## EP-TRASH-RESTORE — POST `trash/{id}/restore`

- **Auth**: `user` with write on the prior parent **or** the user's root if prior parent is also deleted.
- **Request body**: `{ TargetParentId?: string }` — optional override; defaults to original parent or root if parent is gone.
- **Success (200)** `Results`: the restored `Item`.
- **Errors**: `ERR_NOT_FOUND`, `ERR_FORBIDDEN`, `ERR_RETENTION_EXPIRED` (item is older than 30 d), `ERR_PARENT_FULL`.
- **Side effects**: clears `DeletedAt`. Restores the **subtree** (all descendants soft-deleted by the same operation). Emits SSE `item-restored`.
- **AC refs**: `AT-APP-23`.

---

## EP-TRASH-PURGE-ONE — DELETE `trash/{id}`

- **Auth**: `user` who owns the item.
- **Success (204)**: empty.
- **Errors**: `ERR_NOT_FOUND`, `ERR_FORBIDDEN`.
- **Side effects**: hard-deletes the row and its subtree. Mirrors of the purged item receive `Mirrors.BrokenAt = now()` per §14.4. **Irreversible**.

---

## EP-TRASH-PURGE-ALL — DELETE `trash`

- **Auth**: `user`.
- **Success (204)**: empty.
- **Errors**: `ERR_FORBIDDEN`.
- **Side effects**: hard-deletes all soft-deleted items owned by the user. Mirrors broken as above. **Irreversible**.
- **AC refs**: `AT-APP-24`. Background reaper also runs daily for items > 30 d (per `mem://features/trash-logic`).

---

## Cross-References

| Topic | Link |
|-------|------|
| Retention policy | `mem://features/trash-logic` |
| Mirror breakage on purge | [`../01-features/14-concurrency-and-sync.md`](../01-features/14-concurrency-and-sync.md) §14.4 |
| ← Background reaper job (forward link from) | [`./11b-trash-reaper.md`](./11b-trash-reaper.md) |
