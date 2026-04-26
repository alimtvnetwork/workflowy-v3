# Endpoints — 15 Roles & Permissions

> **Version:** 1.0.0
> **Updated:** 2026-04-26 (UTC+8)
> **Parent:** [`./00-overview.md`](./00-overview.md)
> **Mirrors feature:** [`../01-features/15-roles-and-permissions.md`](../01-features/15-roles-and-permissions.md)

---

## Summary

| ID | M | Path | Auth | Purpose |
|----|---|------|------|---------|
| EP-ROLES-LIST | GET | `roles?WorkspaceId={id}` | user | List role assignments in a workspace |
| EP-ROLES-ASSIGN | POST | `roles` | owner | Assign a role to a user |
| EP-ROLES-REVOKE | DELETE | `roles/{assignmentId}` | owner | Revoke an assignment |

> **L8 reminder**: roles live in their own table (`UserRoles`). They are NEVER stored on `Users` / `Profiles`. Every authorization decision goes through `Auth::hasRole($userId, $role)` — server-side, never client-trusted.

---

## EP-ROLES-LIST — GET `roles`

- **Auth**: `user` who is a member of `WorkspaceId`.
- **Query**: `WorkspaceId` (required).
- **Success (200)** `Results`: `{ Assignments: RoleAssignment[] }` where `RoleAssignment = { Id, UserId, DisplayName, Email, Role, AssignedAt }`.
- **Errors**: `ERR_NOT_FOUND`, `ERR_FORBIDDEN`.
- **Side effects**: none.

---

## EP-ROLES-ASSIGN — POST `roles`

- **Auth**: `owner` of the workspace.
- **Request body**: `{ WorkspaceId: string, UserId: int, Role: 'viewer' | 'editor' | 'owner' | 'admin' }`.
- **Success (201)** `Results`: the new `RoleAssignment`.
- **Errors**: `ERR_NOT_FOUND`, `ERR_FORBIDDEN`, `ERR_INVALID_ROLE`, `ERR_DUPLICATE_ASSIGNMENT`.
- **Side effects**: inserts `UserRoles` row. Emits SSE `role.assigned` on `workspace:{WorkspaceId}`. Affected user gains/changes access on next request (no token refresh required — checks are per-request).

---

## EP-ROLES-REVOKE — DELETE `roles/{assignmentId}`

- **Auth**: `owner`.
- **Success (204)**: empty.
- **Errors**: `ERR_NOT_FOUND`, `ERR_FORBIDDEN`, `ERR_LAST_OWNER` (cannot revoke the sole owner of a workspace).
- **Side effects**: deletes `UserRoles` row. Emits SSE `role.revoked`. Affected user loses access immediately on the next request.
- **AC refs**: `AT-APP-28`.

---

## Cross-References

| Topic | Link |
|-------|------|
| Roles SSOT | [`../01-features/15-roles-and-permissions.md`](../01-features/15-roles-and-permissions.md) |
| Auth helper rule | `mem://constraints/coding-guidelines` |
| User-roles table pattern | [`../../00-overview.md`](../../00-overview.md) |
