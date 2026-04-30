# Endpoints — 09 Mirrors

## Database Routing

**Read:** App DB (per-workspace; one SQLite file per workspace) — `Items`, `MirrorGroup`, `MirrorMember`.
**Write:** App DB (per-workspace; one SQLite file per workspace) — `MirrorGroup` + `MirrorMember` (peer-group create / detach).
**Root DB:** untouched.

> **Audit cite:** Section added 2026-04-30 to close **F-AUD42-01** (App-folder audit Phase 4). Per ADR-0019 split-DB rules.


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
- **Side effects**: inserts a mirror row. Emits SSE `item-updated` (mirror parent) on both `item:{id}` and `item:{TargetParentId}`.
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
- **Side effects**: removes the mirror row only — the canonical item is untouched (per L6). Emits SSE `item-updated` (mirror parent). The `Mirrors.BrokenAt` LWW rule from §14.4 applies if the canonical was concurrently deleted.
- **AC refs**: `AT-APP-20`.

---

## Cross-References

| Topic | Link |
|-------|------|
| Mirror semantics | [`../01-features/09-mirrors.md`](../01-features/09-mirrors.md) |
| Broken-mirror LWW | [`../01-features/14-concurrency-and-sync.md`](../01-features/14-concurrency-and-sync.md) §14.4 |

---

## Database Scope

- **Anchor:** [`07-db-diagram/00b-split-db-anchor.md`](../07-db-diagram/00b-split-db-anchor.md)
- **Scope:** `[db-scope: app]`
- **Tables:** mirror_groups, nodes
- **Cross-DB JOINs:** forbidden (split-DB invariant). Cross-DB orchestration, if any, follows ADR-0019.
