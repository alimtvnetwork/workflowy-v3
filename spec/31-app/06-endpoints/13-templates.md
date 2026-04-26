# Endpoints — 13 Templates

> **Version:** 1.0.0
> **Updated:** 2026-04-26 (UTC+8)
> **Parent:** [`./00-overview.md`](./00-overview.md)
> **Mirrors feature:** [`../01-features/13-templates.md`](../01-features/13-templates.md)

---

## Summary

| ID | M | Path | Auth | Purpose |
|----|---|------|------|---------|
| EP-TEMPLATES-LIST | GET | `templates` | user | List user-visible templates |
| EP-TEMPLATES-CREATE | POST | `templates` | user | Save a subtree as a template |
| EP-TEMPLATES-GET | GET | `templates/{id}` | user | Fetch a template payload |
| EP-TEMPLATES-APPLY | POST | `templates/{id}/apply` | user | Instantiate a template under a parent |
| EP-TEMPLATES-DELETE | DELETE | `templates/{id}` | owner | Delete a template |

---

## EP-TEMPLATES-LIST — GET `templates`

- **Auth**: `user`.
- **Query**: `Scope` (`mine` | `shared` | `all`, default `all`).
- **Success (200)** `Results`: `{ Templates: TemplateSummary[] }` where `TemplateSummary = { Id, Name, NodeCount, OwnerUserId, CreatedAt }`.
- **Errors**: —.
- **Side effects**: none.

---

## EP-TEMPLATES-CREATE — POST `templates`

- **Auth**: `user` with read on the source subtree.
- **Request body**: `{ SourceItemId: string, Name: string, Description?: string, Scope: 'private' | 'workspace' }`.
- **Rule**: source subtree size ≤ 1000 nodes per `mem://features/templates`.
- **Success (201)** `Results`: full `Template`.
- **Errors**: `ERR_FORBIDDEN`, `ERR_LIMIT_EXCEEDED`, `ERR_INVALID_NAME`.
- **Side effects**: serializes the subtree into `Templates.Payload` (JSON). No SSE event (templates are out-of-band).

---

## EP-TEMPLATES-GET — GET `templates/{id}`

- **Auth**: `user` per scope (`private` = owner only, `workspace` = workspace members).
- **Success (200)** `Results`: full `Template` including `Payload`.
- **Errors**: `ERR_NOT_FOUND`, `ERR_FORBIDDEN`.
- **Side effects**: none.

---

## EP-TEMPLATES-APPLY — POST `templates/{id}/apply`

- **Auth**: `user` with write on `TargetParentId` and read on the template per scope.
- **Request body**: `{ TargetParentId: string, Position?: 'above' | 'below' | 'end' }`.
- **Success (201)** `Results`: `{ NewRootId: string, InsertedCount: number }`.
- **Errors**: `ERR_NOT_FOUND`, `ERR_FORBIDDEN`, `ERR_PARENT_FULL`, `ERR_LIMIT_EXCEEDED`.
- **Side effects**: inserts a fresh subtree with **new IDs** (mirrors NOT preserved — they degrade to plain items per `mem://features/templates`). Emits one `item.created` per inserted node.
- **AC refs**: `AT-APP-26`.

---

## EP-TEMPLATES-DELETE — DELETE `templates/{id}`

- **Auth**: `owner` of the template.
- **Success (204)**: empty.
- **Errors**: `ERR_NOT_FOUND`, `ERR_FORBIDDEN`.
- **Side effects**: removes row from `Templates`. Already-applied instances are unaffected.

---

## Cross-References

| Topic | Link |
|-------|------|
| Template serialization | `mem://features/templates` |
| Apply flow | [`../02-workflows/02-template-application-flow.md`](../02-workflows/02-template-application-flow.md) |
