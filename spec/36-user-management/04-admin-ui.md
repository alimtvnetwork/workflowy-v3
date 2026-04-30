# Admin UI — Sub-Spec

> **Version:** 1.0.0 — authored 2026-04-30
> **Owner section:** `spec/36-user-management/`
> **Status:** Draft (P1 — load-bearing for AT-USERMANAGEMENT-12..16 and gates `G-36-ADMIN-UI-*`).
> **Parent:** [`./00-overview.md`](./00-overview.md) §"Pending Sub-Specs" row 04
> **Siblings:** [`./02-auth-flow.md`](./02-auth-flow.md) · [`./03-rbac-helpers.md`](./03-rbac-helpers.md)

---

## Purpose

Define the **admin-only React UI surfaces** for managing other users — invite, list, role-assign, deactivate, reactivate, delete, audit. Every screen here is gated by a server-side `Auth::requireRole(currentUserId, AppRole::Admin)` check defined in [`./03-rbac-helpers.md`](./03-rbac-helpers.md); the UI never reads roles from client storage (Anti-Pattern #2 in `00-overview.md`).

**Out of scope** — own-account settings (covered by [`./01-account-and-settings.md`](./01-account-and-settings.md)), MFA enrolment for the admin themselves (covered by [`./02-auth-flow.md`](./02-auth-flow.md) §3.4), per-item sharing ACLs (`mem://features/sharing-model`).

---

## Routing & Mount Point

| Route | Component | Loader | Guard |
|---|---|---|---|
| `/admin/users` | `<AdminUserList>` | `adminUsersLoader` | `requireAdmin` (HOF, see §Guard) |
| `/admin/users/invite` | `<AdminInviteDialog>` (modal over list) | n/a | `requireAdmin` |
| `/admin/users/:userId` | `<AdminUserDetail>` | `adminUserDetailLoader` | `requireAdmin` |
| `/admin/users/:userId/audit` | `<AdminUserAuditLog>` | `adminUserAuditLoader` | `requireAdmin` |

All four routes mount under `<AdminLayout>` which renders inside `<AdminBoundary>` (one of the 8 named error boundaries — see ADR-0017).

> **MUST** every admin route be wrapped in `requireAdmin` and mounted under `<AdminBoundary>` `[gate: G-36-ADMIN-UI-GUARD]`.

---

## Guard — `requireAdmin`

```ts
// src/routes/guards/requireAdmin.ts
export function requireAdmin<T>(loader: LoaderFunction<T>): LoaderFunction<T> {
  return async (args) => {
    const session = await getSessionOrThrow();      // throws → AuthBoundary
    const roles = await fetchRolesViaApi(session);  // GET /me/roles — never read from cache
    if (!roles.includes("admin")) throw redirect("/403");
    return loader(args);
  };
}
```

> **MUST** `requireAdmin` re-fetch roles on every navigation (no client-side memo beyond per-request) — stale-role survival is forbidden by Anti-Pattern #4 in `00-overview.md` `[gate: G-36-ADMIN-UI-NO-CACHE]`.

---

## Surfaces (5)

### S1 — `<AdminUserList>` (route `/admin/users`)

| Element | Component | Behavior |
|---|---|---|
| Header | `<PageHeader title="Users" action={<InviteButton/>} />` | Invite opens `<AdminInviteDialog>` |
| Search | `<SearchInput debounce={300}>` | Server-side filter via `?q=…` query param |
| Filters | `<RoleFilter>` (multi-select: user/moderator/admin) + `<StatusFilter>` (active/deactivated) | Combine via `?roles=…&status=…` |
| Table | `<DataTable columns={cols} rows={rows} virtualized={rows.length>250}>` | Virtualization mandatory ≥1000 rows (ADR-0017) |
| Row actions | `<DropdownMenu>` → View · Change role · Deactivate · Delete | Each item triggers `<ConfirmDialog>` for destructive ops |
| Empty state | `<EmptyState icon={Users} title="No users match" />` | Lucide icon only — no emoji glyph |
| Pagination | Cursor-based (`?after=<UserId>`) | 50 rows per page |

> **MUST** the user list render a deactivation badge for `User.IsActive === false` rows and disable destructive actions when `userId === currentUserId` `[gate: G-36-ADMIN-UI-NO-SELF]`.

### S2 — `<AdminInviteDialog>` (modal)

Form fields: `Email` (required, RFC 5322), `Roles` (checkbox group: user/moderator/admin — at least one), `SendWelcomeEmail` (boolean, default `true`), `Note` (optional, ≤500 chars).

Submission posts to `POST /admin/users/invite` with PascalCase envelope (ADR-0004/0019). On `Status=Success`, the new pending row appears at the top of the list with a "pending" badge (server returns the row in `Results[0]`).

> **MUST** the invite form reject self-targeted invites client-side AND server-side (`SELF_ROLE_FORBIDDEN` / `USR-36-05`) `[gate: G-36-ADMIN-UI-INVITE-VALIDATE]`.

### S3 — `<AdminUserDetail>` (route `/admin/users/:userId`)

Three tabs (Radix Tabs):

1. **Profile** — read-only display of `User` row (Email, DisplayName, CreatedAt, LastLoginAt, IsActive).
2. **Roles** — `<RoleEditor>` showing current `UserRole` rows; add/remove via `POST /admin/users/{id}/roles` and `DELETE /admin/users/{id}/roles/{role}`. Each mutation is queued through the IDB queue (loader↔queue contract, ADR-0023) and produces an undo entry (cap 100 in-memory).
3. **Sessions** — list active sessions with `Revoke` action per session and `Revoke all` bulk action. Revocation does NOT delete the user, only invalidates `Session` rows.

> **MUST** every role mutation produce one row in `AdminAudit` (server-side trigger) AND one undo entry (client-side) `[gate: G-36-ADMIN-UI-AUDIT-PAIR]`.

### S4 — `<AdminUserAuditLog>` (route `/admin/users/:userId/audit`)

Read-only chronological feed of `AdminAudit` rows scoped to one user. Columns: `OccurredAt`, `ActorEmail`, `Action` (enum: invited/role-added/role-removed/deactivated/reactivated/deleted/session-revoked), `Detail` (JSON pretty-printed). Filter by action and date range. Cross-links to [`../34-activity-feed/`](../34-activity-feed/00-overview.md) for cross-user activity.

### S5 — Destructive confirmations

| Operation | Confirm dialog copy | Required typed phrase |
|---|---|---|
| Deactivate | "User can no longer sign in. Reactivate any time." | n/a (single click) |
| Delete | "This permanently deletes the user and all their items after the 30-day trash retention." | User must type the user's email |
| Revoke all sessions | "Logs the user out of every device immediately." | n/a |
| Bulk delete (≥2 selected) | "Permanently deletes N users." | User must type `DELETE N USERS` |

> **MUST** delete and bulk-delete require a typed confirmation phrase before the submit button enables `[gate: G-36-ADMIN-UI-DESTRUCTIVE-CONFIRM]`.

---

## Endpoints Used (cross-ref `spec/31-app/06-endpoints/`)

| Method | Path | Purpose | Spec |
|---|---|---|---|
| GET | `/admin/users` | List users (filter/search/paginate) | `EP-ADMIN-USERS-LIST` |
| POST | `/admin/users/invite` | Create pending invite | `EP-ADMIN-USERS-INVITE` |
| GET | `/admin/users/{userId}` | Detail row | `EP-ADMIN-USER-GET` |
| PATCH | `/admin/users/{userId}` | Update profile (Display, IsActive) | `EP-ADMIN-USER-PATCH` |
| DELETE | `/admin/users/{userId}` | Hard delete (after typed confirm) | `EP-ADMIN-USER-DELETE` |
| POST | `/admin/users/{userId}/roles` | Add role | `EP-ADMIN-USER-ROLE-ADD` |
| DELETE | `/admin/users/{userId}/roles/{role}` | Remove role | `EP-ADMIN-USER-ROLE-REMOVE` |
| GET | `/admin/users/{userId}/sessions` | List sessions | `EP-ADMIN-USER-SESSIONS` |
| DELETE | `/admin/users/{userId}/sessions/{sid}` | Revoke one session | `EP-ADMIN-USER-SESSION-REVOKE` |
| GET | `/admin/users/{userId}/audit` | Audit log feed | `EP-ADMIN-USER-AUDIT` |

Every response uses the canonical PascalCase envelope (`Status`, `Attributes`, `Results`) per ADR-0004/0019.

---

## Acceptance-Criteria Binds

| AT id | Surface | Assertion summary |
|---|---|---|
| `AT-USERMANAGEMENT-12` | S1 | Non-admin GET `/admin/users` → 403 with `USR-36-02`. |
| `AT-USERMANAGEMENT-13` | S2 | Invite with self email → client disables submit AND server returns `USR-36-05`. |
| `AT-USERMANAGEMENT-14` | S3 (Roles tab) | Adding `admin` role appends an `AdminAudit` row + undo entry. |
| `AT-USERMANAGEMENT-15` | S5 | Delete button stays disabled until typed email matches; mismatch shows inline error. |
| `AT-USERMANAGEMENT-16` | S4 | Audit feed filters by action enum and respects 250-row per-view cap. |

Fixtures live in [`./97a-acceptance-criteria-fixtures.md`](./97a-acceptance-criteria-fixtures.md) (rows already registered).

---

## Anti-Patterns (Admin-UI specific)

| # | Anti-pattern | Gate |
|---|---|---|
| 1 | Showing the admin nav link based on a client-side flag | `G-36-CLIENT-NO-ROLE` (inherits from `00-overview.md`) |
| 2 | Allowing the admin to delete or deactivate themselves | `G-36-ADMIN-UI-NO-SELF` |
| 3 | Skipping typed confirmation on destructive ops | `G-36-ADMIN-UI-DESTRUCTIVE-CONFIRM` |
| 4 | Caching `/me/roles` across navigations | `G-36-ADMIN-UI-NO-CACHE` |
| 5 | Bulk operation without virtualization above 1000 rows | `G-17-VIRTUALIZE-1000` (ADR-0017) |
| 6 | Mutating roles without producing both an audit row and an undo entry | `G-36-ADMIN-UI-AUDIT-PAIR` |

---

## Cross-References

| Reference | Location |
|---|---|
| Auth flow | [`./02-auth-flow.md`](./02-auth-flow.md) |
| RBAC helpers | [`./03-rbac-helpers.md`](./03-rbac-helpers.md) |
| Endpoint registry | [`../31-app/06-endpoints/00-overview.md`](../31-app/06-endpoints/00-overview.md) |
| Error boundaries | ADR-0017 (`spec/02-architecture-decisions/0017-*.md`) |
| Loader↔queue contract | ADR-0023 |
| Activity feed (cross-user) | [`../34-activity-feed/00-overview.md`](../34-activity-feed/00-overview.md) |

---

## Related

- [`./00-overview.md`](./00-overview.md) — Parent overview (§"Pending Sub-Specs" row 04)
- [`./97-acceptance-criteria.md`](./97-acceptance-criteria.md) — AT registry
