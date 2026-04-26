# Endpoints — 09 Mirrors

> **Version:** 1.0.0
> **Updated:** 2026-04-26 (UTC+8)
> **Parent:** [`./00-overview.md`](./00-overview.md)
> **Mirrors feature:** [`../01-features/09-mirrors.md`](../01-features/09-mirrors.md)

---

## Summary

| ID | M | Path | Auth | Purpose |
|----|---|------|------|---------|
| EP-MIRRORS-CREATE | POST | `items/{id}/mirror` | user | Create a mirror pointing at canonical source |
| EP-MIRRORS-LIST | GET | `items/{id}/mirrors` | user | List all mirrors of a canonical item |
| EP-MIRRORS-DELETE | DELETE | `mirrors/{mirrorId}` | user | Detach a single mirror (canonical untouched) |

---

## EP-MIRRORS-CREATE — POST `items/{id}/mirror`

- **Path**: `id` MUST be a **canonical** item (not itself a mirror) per L6. Otherwise `ERR_MIRROR_OF_MIRROR`.
- **Auth**: `user` with read on `id` AND write on `TargetParentId`.
- **Request body**: `{ TargetParentId: string, Position?: 'above' | 'below' | 'end' }`.
- **Success (201)** `Results`: the new mirror `Item` (a thin row whose `MirrorOf = id`).
- **Errors**: `ERR_NOT_FOUND`, `ERR_FORBIDDEN`, `ERR_MIRROR_OF_MIRROR`, `ERR_PARENT_FULL`.
- **Side effects**: inserts a mirror row. Emits SSE `mirror.created` on both `item:{id}` and `item:{TargetParentId}`.
- **AC refs**: `AT-APP-19`.

---

## EP-MIRRORS-LIST — GET `items/{id}/mirrors`

- **Auth**: `user` with read on `id`.
- **Success (200)** `Results`: `{ Mirrors: Item[], Count: number }`.
- **Errors**: `ERR_NOT_FOUND`, `ERR_FORBIDDEN`.
- **Side effects**: none.

---

## EP-MIRRORS-DELETE — DELETE `mirrors/{mirrorId}`

- **Auth**: `user` with write access on the mirror's parent.
- **Success (204)**: empty.
- **Errors**: `ERR_NOT_FOUND`, `ERR_FORBIDDEN`, `ERR_NOT_A_MIRROR`.
- **Side effects**: removes the mirror row only — the canonical item is untouched (per L6). Emits SSE `mirror.deleted`. The `Mirrors.BrokenAt` LWW rule from §14.4 applies if the canonical was concurrently deleted.
- **AC refs**: `AT-APP-20`.

---

## Cross-References

| Topic | Link |
|-------|------|
| Mirror semantics | [`../01-features/09-mirrors.md`](../01-features/09-mirrors.md) |
| Broken-mirror LWW | [`../01-features/14-concurrency-and-sync.md`](../01-features/14-concurrency-and-sync.md) §14.4 |
