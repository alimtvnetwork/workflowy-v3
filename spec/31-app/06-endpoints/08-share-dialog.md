# Endpoints — 08 Share Dialog

## Database Routing

**Read:** Root DB (per-user / workspace-membership scope) — `Share`, `PendingInvites`, `WorkspaceMember`. **Read:** App DB (per-workspace; one SQLite file per workspace) — `Items` (target item metadata only).
**Write:** Root DB (per-user / workspace-membership scope) — `Share` (grants), `PendingInvites` (email invites).
**Cross-DB joins:** Forbidden. Item ID validation reads App DB; grant write lands in Root DB in a separate transaction.

> **Audit cite:** Section added 2026-04-30 to close **F-AUD42-01** (App-folder audit Phase 4). Per ADR-0019 split-DB rules.


> **Version:** 1.0.0
> **Updated:** 2026-04-26 (UTC+8)
> **Parent:** [`./00-overview.md`](./00-overview.md)
> **Mirrors feature:** [`../01-features/08-share-dialog.md`](../01-features/08-share-dialog.md)

---

## Summary

| ID | M | Path | Auth | Purpose |
|----|---|------|------|---------|
| EP-SHARES-LIST | GET | `items/{id}/shares` | user | List share grants |
| EP-SHARES-INVITE | POST | `items/{id}/shares` | owner | Invite user(s) by email |
| EP-SHARES-UPDATE | PUT | `items/{id}/shares/{shareId}` | owner | Change role on a grant |
| EP-SHARES-REVOKE | DELETE | `items/{id}/shares/{shareId}` | owner | Revoke a grant |
| EP-SHARES-PUBLIC | POST | `items/{id}/shares/public` | owner | Toggle public link |

---

## EP-SHARES-LIST — GET `items/{id}/shares`

- **Auth**: `user` with read access on the item (any role can see who else has access).
- **Success (200)** `Results`: `{ Grants: Share[], PublicSlug?: string, IsPublicEnabled: boolean }` (boolean field carries `Is` prefix per coding-guidelines boolean naming convention).
- **Errors**: `ERR_NOT_FOUND`, `ERR_FORBIDDEN`.
- **Side effects**: none.

---

## EP-SHARES-INVITE — POST `items/{id}/shares`

- **Auth**: `owner` (per `Auth::hasRole`).
- **Request body**: `{ Email: string, Role: 'viewer' | 'editor' | 'owner', Message?: string }`.
- **Success (201)** `Results`: the created `Share`.
- **Errors**: `ERR_NOT_FOUND`, `ERR_FORBIDDEN`, `ERR_INVALID_EMAIL`, `ERR_DUPLICATE_GRANT`.
- **Side effects**: inserts into `Shares`. Sends invite email via WP `wp_mail`. Emits SSE `share-granted` on `item:{id}`.
- **AC refs**: `AT-APP-16`.

---

## EP-SHARES-UPDATE — PUT `items/{id}/shares/{shareId}`

- **Auth**: `owner`.
- **Request body**: `{ Role: 'viewer' | 'editor' | 'owner' }`.
- **Success (200)** `Results`: updated `Share`.
- **Errors**: `ERR_NOT_FOUND`, `ERR_FORBIDDEN`, `ERR_LAST_OWNER` (cannot demote sole owner).
- **Side effects**: updates `Shares.Role`. Emits SSE `share-granted` (re-grant).

---

## EP-SHARES-REVOKE — DELETE `items/{id}/shares/{shareId}`

- **Auth**: `owner`.
- **Success (204)**: empty.
- **Errors**: `ERR_NOT_FOUND`, `ERR_FORBIDDEN`, `ERR_LAST_OWNER`.
- **Side effects**: deletes row from `Shares`. Emits SSE `share-revoked`. Affected user loses access immediately.

---

## EP-SHARES-PUBLIC — POST `items/{id}/shares/public`

- **Auth**: `owner`.
- **Request body**: `{ IsEnabled: boolean }` (boolean field carries `Is` prefix per coding-guidelines boolean naming convention; legacy `Enabled` shape rejected by the request validator `[gate: G-EP-BOOL-PREFIX]`).
- **Success (200)** `Results`: `{ IsEnabled: boolean, PublicSlug?: string }` (slug present only when `IsEnabled = true`).
- **Errors**: `ERR_NOT_FOUND`, `ERR_FORBIDDEN`.
- **Side effects**: rotates the public slug whenever enabled→disabled→enabled. Anyone holding an old slug loses access immediately. Emits SSE `share-granted` (public variant).
- **AC refs**: `AT-APP-17`.

---

## Cross-References

| Topic | Link |
|-------|------|
| Share roles | [`../01-features/15-roles-and-permissions.md`](../01-features/15-roles-and-permissions.md) |
| Public-link semantics | `mem://features/sharing-model` |

---

## Database Scope

- **Anchor:** [`07-db-diagram/00b-split-db-anchor.md`](../07-db-diagram/00b-split-db-anchor.md)
- **Scope:** `[db-scope: cross-db]`
- **Tables:** root.share_invites + app.shares (orchestrated)
- **Cross-DB JOINs:** forbidden (split-DB invariant). Cross-DB orchestration, if any, follows ADR-0019.
