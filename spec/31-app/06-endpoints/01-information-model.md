# Endpoints — 01 Information Model (Items CRUD)

## Database Routing

**N/A** — schema reference only; no endpoint surface. See [`spec/31-app/07-db-diagram/`](../07-db-diagram/) for SSOT table definitions per DB.

> **Audit cite:** Section added 2026-04-30 to close **F-AUD42-01** (App-folder audit Phase 4). Per ADR-0019 split-DB rules.


> **Version:** 1.0.0
> **Updated:** 2026-04-26 (UTC+8)
> **Parent:** [`./00-overview.md`](./00-overview.md)
> **Mirrors feature:** [`../01-features/01-information-model.md`](../01-features/01-information-model.md)

---

## Summary

| ID | M | Path | Auth | Purpose |
|----|---|------|------|---------|
| EP-ITEMS-LIST | GET | `items?ParentId={id}&Limit=250&Cursor={c}` | user | List children of a parent |
| EP-ITEMS-GET | GET | `items/{id}` | user | Fetch one item |
| EP-ITEMS-CREATE | POST | `items` | user | Create a new item |
| EP-ITEMS-UPDATE | PUT | `items/{id}` | user | Update content / metadata |
| EP-ITEMS-MOVE | POST | `items/{id}/move` | user | Reparent + reorder |
| EP-ITEMS-DELETE | DELETE | `items/{id}` | user | Soft-delete to Trash |
| EP-ITEMS-ROOT | GET | `items/root` | user | Fetch user's root item |

---

## EP-ITEMS-LIST — GET `items`

- **Path/Query**: `ParentId` (string, required), `Limit` (int, ≤ 250, default 250), `Cursor` (opaque string, optional).
- **Auth**: `user` — caller must have read access on `ParentId` (own item, shared item, or public).
- **Request body**: —
- **Success (200)** `Results`: `{ Items: Item[], NextCursor?: string }`.
- **Errors**: `ERR_NOT_FOUND` (parent missing), `ERR_FORBIDDEN` (no read access), `ERR_LIMIT_EXCEEDED` (Limit > 250).
- **Side effects**: none (read-only).
- **AC refs**: `AT-APP-01`, `AT-APP-04` (250-item cap).

---

## EP-ITEMS-GET — GET `items/{id}`

- **Path**: `id` = `Item.id` (immutable, per L2).
- **Auth**: `user` with read access.
- **Request body**: —
- **Success (200)** `Results`: a single `Item` object including `ItemType`, `Content`, `ParentId`, `FractionalIndex`, `Tags[]`, `DueDate?`, `MirrorOf?`.
- **Errors**: `ERR_NOT_FOUND`, `ERR_FORBIDDEN`.
- **Side effects**: none.
- **AC refs**: `AT-APP-02`.

---

## EP-ITEMS-CREATE — POST `items`

- **Auth**: `user` with write access on the target `ParentId`.
- **Request body** (PascalCase):
  - `ParentId` (string, required)
  - `ItemType` (enum, required, must satisfy allowed-transition rules)
  - `Content` (string, optional, default `""`)
  - `FractionalIndex` (string, optional — server generates if omitted)
  - `Tags` (string[], optional)
- **Success (201)** `Results`: the created `Item`.
- **Errors**: `ERR_FORBIDDEN`, `ERR_INVALID_TYPE` (bad `ItemType`), `ERR_PARENT_FULL` (250-cap on view).
- **Side effects**: inserts row in `Items`; emits SSE `item-updated` (new ID) on `item:{ParentId}`.
- **AC refs**: `AT-APP-03`.

---

## EP-ITEMS-UPDATE — PUT `items/{id}`

- **Auth**: `user` with write access.
- **Request body** (any subset, all PascalCase): `Content`, `ItemType`, `Tags`, `DueDate`, `Completed`.
- **Success (200)** `Results`: the updated `Item`.
- **Errors**: `ERR_NOT_FOUND`, `ERR_FORBIDDEN`, `ERR_INVALID_TRANSITION` (illegal `ItemType` change).
- **Side effects**: updates row; emits SSE `item-updated` on `item:{id}`. LWW conflict resolution per §14.4.
- **AC refs**: `AT-APP-05`.

---

## EP-ITEMS-MOVE — POST `items/{id}/move`

- **Auth**: `user` with write access on **both** old and new parent.
- **Request body**:
  - `NewParentId` (string, required)
  - `BeforeId` (string, optional) — sibling that the moved item should appear *before*
  - `AfterId` (string, optional) — sibling it should appear *after*
- **Rule**: at most one of `BeforeId` / `AfterId` may be set. Server computes new `FractionalIndex`.
- **Success (200)** `Results`: `{ Item, OldParentId, NewParentId, FractionalIndex }`.
- **Errors**: `ERR_NOT_FOUND`, `ERR_FORBIDDEN`, `ERR_CYCLE` (would make item ancestor of itself), `ERR_PARENT_FULL`.
- **Side effects**: updates `ParentId`, `FractionalIndex`. Emits SSE `item-updated` on `item:{OldParentId}` AND `item:{NewParentId}`.
- **AC refs**: `AT-APP-06`, `AT-APP-07`.

---

## EP-ITEMS-DELETE — DELETE `items/{id}`

- **Auth**: `user` with write access. Root item per L3 cannot be deleted (`ERR_ROOT_PROTECTED`).
- **Request body**: —
- **Success (204)**: empty.
- **Errors**: `ERR_NOT_FOUND`, `ERR_FORBIDDEN`, `ERR_ROOT_PROTECTED`.
- **Side effects**: sets `DeletedAt = now()` (soft-delete). Subtree is recursively marked. Emits SSE `item-deleted`. Mirrors get `MirrorBroken` event per §14.4. See [`./11-trash-view.md`](./11-trash-view.md) for restore flow.
- **AC refs**: `AT-APP-18` (Trash retention).

---

## EP-ITEMS-ROOT — GET `items/root`

- **Auth**: `user`.
- **Request body**: —
- **Success (200)** `Results`: the caller's root `Item` (always exists per L3, never deletable).
- **Errors**: `ERR_UNAUTHENTICATED`.
- **Side effects**: none. Auto-creates root on first call only if signup hook missed it.
- **AC refs**: `AT-APP-08`.

---

## Cross-References

| Topic | Link |
|-------|------|
| Item interface | `mem://architecture/data-model` |
| Fractional index rules | `mem://features/editor-core` |
| Conflict resolution | [`../01-features/14-concurrency-and-sync.md`](../01-features/14-concurrency-and-sync.md) |

---

## Database Scope

- **Anchor:** [`07-db-diagram/00b-split-db-anchor.md`](../07-db-diagram/00b-split-db-anchor.md)
- **Scope:** `[db-scope: app]`
- **Tables:** nodes, mirror_groups, item_types
- **Cross-DB JOINs:** forbidden (split-DB invariant). Cross-DB orchestration, if any, follows ADR-0019.
