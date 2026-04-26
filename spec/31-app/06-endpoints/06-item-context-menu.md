# Endpoints — 06 Item Context Menu

> **Version:** 1.0.0
> **Updated:** 2026-04-26 (UTC+8)
> **Parent:** [`./00-overview.md`](./00-overview.md)
> **Mirrors feature:** [`../01-features/06-item-context-menu.md`](../01-features/06-item-context-menu.md)

---

## Summary

| ID | M | Path | Auth | Purpose |
|----|---|------|------|---------|
| EP-ITEMS-DUPLICATE | POST | `items/{id}/duplicate` | user | Deep-copy a subtree |
| EP-ITEMS-COMPLETE | POST | `items/{id}/complete` | user | Toggle completion |
| EP-ITEMS-TURN-INTO | POST | `items/{id}/turn-into` | user | Change `ItemType` |
| EP-ITEMS-TAGS | POST | `items/{id}/tags` | user | Add/remove tags |

---

## EP-ITEMS-DUPLICATE — POST `items/{id}/duplicate`

- **Auth**: `user` with read on source + write on target parent.
- **Request body**:
  - `TargetParentId` (string, optional — defaults to source's parent)
  - `Position` (`above` | `below` | `end`, default `below`)
- **Success (201)** `Results`: `{ NewRootId, CopiedCount }`.
- **Errors**: `ERR_NOT_FOUND`, `ERR_FORBIDDEN`, `ERR_LIMIT_EXCEEDED` (subtree exceeds duplication cap, default 1000 nodes).
- **Side effects**: inserts a fresh subtree with **new IDs**. Mirrors are duplicated as new mirrors (still pointing at original canonical, per L6). Emits one `item-updated` (new ID) SSE per inserted node.
- **AC refs**: `AT-APP-10`.

---

## EP-ITEMS-COMPLETE — POST `items/{id}/complete`

- **Auth**: `user` with write access.
- **Request body**: `{ Completed: boolean }`.
- **Success (200)** `Results`: the updated `Item`.
- **Errors**: `ERR_NOT_FOUND`, `ERR_FORBIDDEN`.
- **Side effects**: sets `Completed`, `CompletedAt`. Emits SSE `item-updated`.
- **AC refs**: `AT-APP-11`.

---

## EP-ITEMS-TURN-INTO — POST `items/{id}/turn-into`

- **Auth**: `user` with write access.
- **Request body**: `{ NewItemType: ItemType }`.
- **Rule**: server validates against the **allowed-transition matrix** in `01-features/06-item-context-menu.md`. Illegal transitions return `ERR_INVALID_TRANSITION`.
- **Success (200)** `Results`: updated `Item`.
- **Errors**: `ERR_NOT_FOUND`, `ERR_FORBIDDEN`, `ERR_INVALID_TRANSITION`.
- **Side effects**: updates `ItemType`. May reset type-specific metadata (e.g. board columns when leaving `BoardProject`). Emits SSE `item-updated`.
- **AC refs**: `AT-APP-12`.

---

## EP-ITEMS-TAGS — POST `items/{id}/tags`

- **Auth**: `user` with write access.
- **Request body**: `{ Add?: string[], Remove?: string[] }` — both are optional but at least one is required.
- **Rule**: tag strings are lowercased, max 32 chars, `[a-z0-9-]+`.
- **Success (200)** `Results`: `{ Tags: string[] }` (canonical post-update list).
- **Errors**: `ERR_NOT_FOUND`, `ERR_FORBIDDEN`, `ERR_INVALID_TAG`.
- **Side effects**: updates `Items.Tags` (JSON column). Emits SSE `item-updated`.
- **AC refs**: `AT-APP-13`.

---

## Cross-References

| Topic | Link |
|-------|------|
| Allowed-transition matrix | [`../01-features/06-item-context-menu.md`](../01-features/06-item-context-menu.md) |
| Tag rules | `mem://features/search-functionality` |
