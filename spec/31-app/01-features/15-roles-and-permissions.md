# Roles & Permissions

> **Version:** 1.1.0
> **Created:** 2026-04-25 (UTC+8)
> **Updated:** 2026-04-26 — APP-FIX-06: enum sources linked (closes audit F-02 for this file)
> **Status:** Active — runtime-agnostic contract
> **Parent:** [`00-overview.md`](./00-overview.md)
> **Closes audit finding:** F-04

---

## Overview

Defines the **runtime-agnostic** roles, permission grants, and authorization checks used everywhere a user acts on an item, share, comment, board, or workspace. Behavior and contracts only — no SQL, no WordPress capability mapping, no Supabase RLS code. The chosen backend (`mem://constraints/backend-runtime-deferred`) implements these contracts.

---

## Role Inventory

### Workspace Roles (account-level)

| Role | Description | Assignable By | Default |
|------|-------------|---------------|---------|
| `Owner` | The account holder. Exactly one per workspace. Cannot be revoked, only transferred. | System (on signup) | Auto on signup |
| `Admin` | Full workspace management except billing & ownership transfer. | `Owner` | None |
| `Member` | Default authenticated user. Can create their own items. | `Owner` / `Admin` | Auto on invite |

### Item Roles (per-item grant via Share Dialog)

| Role | Description | Source Spec |
|------|-------------|-------------|
| `View` | Read-only access to item + entire subtree. Cannot comment, edit, or share. | [`08-share-dialog.md`](./08-share-dialog.md) §7.2 |
| `Edit` | Read + modify content, add/remove children, complete todos. Cannot re-share or delete the share root. | [`08-share-dialog.md`](./08-share-dialog.md) §7.2 |
| `Admin` | All `Edit` rights + manage other grantees, change permissions, revoke access. Cannot transfer ownership. | [`08-share-dialog.md`](./08-share-dialog.md) §7.2 |
| `Owner` | Implicit role of the item creator. Full control including ownership transfer and hard delete. | Implicit |
| `PublicView` | Anonymous read-only access via shareable URL. Strictly read-only. Never inherits any other role. | Public link |

---

## Capability Matrix

### Item Actions

| Action | Owner | Admin | Edit | View | PublicView |
|--------|:-----:|:-----:|:----:|:----:|:----------:|
| Read item content & subtree | ✅ | ✅ | ✅ | ✅ | ✅ |
| Edit content / note | ✅ | ✅ | ✅ | ❌ | ❌ |
| Create child item | ✅ | ✅ | ✅ | ❌ | ❌ |
| Toggle complete | ✅ | ✅ | ✅ | ❌ | ❌ |
| Move item (re-parent) | ✅ | ✅ | ⚠️¹ | ❌ | ❌ |
| Reorder siblings | ✅ | ✅ | ✅ | ❌ | ❌ |
| Soft-delete (move to trash) | ✅ | ✅ | ⚠️² | ❌ | ❌ |
| Hard-delete (purge) | ✅ | ❌ | ❌ | ❌ | ❌ |
| Restore from trash | ✅ | ✅ | ❌ | ❌ | ❌ |
| Convert item type | ✅ | ✅ | ✅ | ❌ | ❌ |
| Mirror item elsewhere | ✅ | ✅ | ⚠️³ | ❌ | ❌ |
| Apply template | ✅ | ✅ | ✅ | ❌ | ❌ |

¹ `Edit` may move only **within** the shared subtree.
² `Edit` may delete descendants, not the share root.
³ `Edit` may create mirrors **into** the shared subtree, not export the source.

### Sharing Actions

| Action | Owner | Admin | Edit | View | PublicView |
|--------|:-----:|:-----:|:----:|:----:|:----------:|
| Open Share dialog | ✅ | ✅ | ❌ | ❌ | ❌ |
| Invite new grantee | ✅ | ✅ | ❌ | ❌ | ❌ |
| Change grantee permission | ✅ | ✅ | ❌ | ❌ | ❌ |
| Remove grantee | ✅ | ✅ | ❌ | ❌ | ❌ |
| Toggle public link | ✅ | ❌ | ❌ | ❌ | ❌ |
| Transfer ownership | ✅ | ❌ | ❌ | ❌ | ❌ |
| Lower own permission | ❌ | ✅ | ✅ | ❌ | ❌ |

### Comment Actions

| Action | Owner | Admin | Edit | View | PublicView |
|--------|:-----:|:-----:|:----:|:----:|:----------:|
| Read comments | ✅ | ✅ | ✅ | ✅ | ❌ |
| Add comment | ✅ | ✅ | ✅ | ❌ | ❌ |
| Edit own comment | ✅ | ✅ | ✅ | ❌ | ❌ |
| Delete own comment | ✅ | ✅ | ✅ | ❌ | ❌ |
| Delete others' comments | ✅ | ✅ | ❌ | ❌ | ❌ |
| Resolve comment thread | ✅ | ✅ | ✅ | ❌ | ❌ |

---

## Inheritance & Cascade Rules

1. **Subtree cascade:** A grant on item `X` applies to **every descendant** of `X`.
2. **Higher-permission wins:** If user `U` has `View` on `X` and `Edit` on descendant `Y`, `U` has `Edit` on `Y`.
3. **Share root non-deletable by grantees:** A user with `Edit` on `X` cannot delete `X`, only its descendants.
4. **Public link non-cascading across grants:** Toggling public link on `X` makes `X`+subtree publicly viewable; does NOT elevate any private grant.
5. **Owner is permanent until transfer:** Removing the owner is impossible — only `transfer ownership` swaps the role atomically.

---

## Enum Sources (normative)

| Enum mentioned in this file | Canonical SSOT | Strategy |
|------------------------------|----------------|----------|
| `WorkspaceRole` (`Owner` / `Admin` / `Member`) | [`spec/20-enums-index.md`](../../20-enums-index.md) §3 | TS Strategy B (`as const` + derived union) — see [`spec/02-coding-guidelines/02-typescript/00-overview.md`](../../02-coding-guidelines/02-typescript/00-overview.md) |
| `ItemRole` (`Owner` / `Admin` / `Edit` / `View` / `PublicView`) | [`spec/20-enums-index.md`](../../20-enums-index.md) §3 | TS Strategy B |
| `Action` (capability matrix verbs) | [`spec/20-enums-index.md`](../../20-enums-index.md) §3 | TS Strategy B |
| `SharePermissionType` | [`spec/20-enums-index.md`](../../20-enums-index.md) §3.5 | TS Strategy B |

> **Forbidden:** TS `enum` keyword and bare literal unions. Always import the canonical `as const` object. PHP equivalents live in `Auth::*` constants — see APP-FIX-04.

---

## Inputs

| Field | Type | Source | Required | Notes |
|-------|------|--------|----------|-------|
| `actorId` | `OwnerId` | Auth session | Yes | Current user attempting the action |
| `targetItemId` | `string` | URL / parent state | Yes | The item the action targets |
| `action` | `Action` enum | Capability matrix | Yes | One row from §Capability Matrix |
| `actorWorkspaceRole` | `WorkspaceRole` enum | Workspace roles table | Yes | One of `Owner` \| `Admin` \| `Member` |
| `effectiveItemRole` | `ItemRole` enum \| null | Computed by `resolveEffectiveRole()` | Yes | Result of ancestor walk |
| `publicLinkEnabledOnAncestor` | `boolean` | Ancestor scan | No | Defaults to `false` |

---

## Outputs

| Output | Persisted? | Channel | Notes |
|--------|-----------|---------|-------|
| Authorization decision | ❌ | Function return | `true` allows action; `false` denies |
| Audit log entry | ✅ DB | `activity_log` table | Action type, actor, target, decision, timestamp |
| Permission-denied UI toast | ❌ | React state | Only on user-initiated actions |
| Grant row mutation | ✅ DB | `user_roles` table | Insert/update/delete on share grants |
| Cascaded grant invalidation | ✅ DB | `user_roles` cascade | When grantee removed from workspace |
| `share:revoked` event | ✅ Event bus | Realtime channel | `PublicView` sessions invalidated within 60 s |

---

## Edge Cases

1. Grantee removed from workspace while holding item grants → all grants cascade-deleted; authored content preserved with `created_by = "Removed user"`.
2. Item moved out of a shared subtree → grant remains on original ancestor; moved item resolves access from new ancestor chain.
3. User invited via email but not yet signed up → invite stored as pending; grant materializes on first matching login.
4. Mirror of a shared item rendered in an unshared parent → mirror displays "🔒 Shared from {ancestor}" badge; access still resolves from source's grants.
5. Public link toggled OFF after URL was shared externally → all `PublicView` sessions invalidated within 60 s; subsequent requests return 404.
6. Workspace owner attempts to downgrade themselves to Admin → blocked by §Capability Matrix "Lower own permission" = ❌ for `Owner`.
7. Two admins simultaneously remove the same grantee → idempotent; second delete is a no-op.
8. Grantee uses stale token after revocation → token validation fails on next request; client redirects to share-revoked screen.
9. Backend `hasRole()` throws → returns `false`; action denied; logged at `Warn` level.
10. Ownership transfer in flight while old owner edits → new owner takes effect atomically; old owner's optimistic write rejected on next sync.

---

## Acceptance Tests

| ID | Given | When | Then | testid |
|----|-------|------|------|--------|
| AT-APPF-76 | Item owned by A, shared with B as `View` | B opens the item | B sees content; no edit affordances; Share button hidden | `share-dialog-trigger` |
| AT-APPF-77 | Item shared with B as `Edit` | B tries to delete the share root | Action rejected with permission-denied toast; descendants remain deletable | `permission-denied-toast` |
| AT-APPF-78 | Item shared with B as `Admin` | B opens Share dialog and removes user C | C's grant deleted; C loses access immediately | `share-remove-button` |
| AT-APPF-79 | Item shared with B as `Admin` | B tries to toggle public link | Toggle is disabled (Owner-only) | `share-public-toggle` |
| AT-APPF-80 | User has `View` on parent + `Edit` on child | User opens child | Resolved role = `Edit` per §Inheritance rule 2 | `permission-badge` |
| AT-APPF-81 | Public link enabled on item X | Anonymous user visits the URL | Read-only render with no comment/share affordances | `public-view-banner` |
| AT-APPF-82 | Owner transfers ownership to user B | Transfer completes | B is now `Owner`; original owner removed from grants | `transfer-ownership-button` |
| AT-APPF-83 | Workspace member tries to invite another member | Invite attempted | Rejected with 403; only `Owner`/`Admin` can invite | `workspace-invite-button` |
| AT-APPF-84 | User removed from workspace | Their item grants checked | All grants cascade-deleted; authored items orphan-tagged | `removed-user-badge` |
| AT-APPF-85 | Backend `hasRole()` throws | Capability check called | Returns `false`; action denied; `Warn` log emitted | `permission-denied-toast` |

---

## Component Contract

| Surface | Component path | `data-testid` | Acceptance tests |
|---------|----------------|---------------|------------------|
| Share dialog trigger button | `src/components/share/ShareDialogTrigger.tsx` | `share-dialog-trigger` | AT-APPF-76 |
| Share remove button | `src/components/share/ShareRemoveButton.tsx` | `share-remove-button` | AT-APPF-78 |
| Share public-link toggle | `src/components/share/SharePublicToggle.tsx` | `share-public-toggle` | AT-APPF-79 |
| Permission badge on item row | `src/components/items/PermissionBadge.tsx` | `permission-badge` | AT-APPF-80 |
| Permission-denied toast | `src/components/feedback/PermissionDeniedToast.tsx` | `permission-denied-toast` | AT-APPF-77, AT-APPF-85 |
| Public-view banner | `src/components/share/PublicViewBanner.tsx` | `public-view-banner` | AT-APPF-81 |
| Transfer-ownership button | `src/components/share/TransferOwnershipButton.tsx` | `transfer-ownership-button` | AT-APPF-82 |
| Workspace invite button | `src/components/workspace/WorkspaceInviteButton.tsx` | `workspace-invite-button` | AT-APPF-83 |
| Removed-user badge | `src/components/items/RemovedUserBadge.tsx` | `removed-user-badge` | AT-APPF-84 |

---

## Authorization Contract (runtime-agnostic)

Every action that mutates state MUST pass the following check (pseudocode):

```
function canPerform(action: Action, actor: User, target: Item): boolean {
  if (actor.workspaceRole === "Owner") return true;            // workspace owner bypass
  const itemRole = resolveEffectiveRole(actor, target);        // walks ancestor chain
  return CAPABILITY_MATRIX[action][itemRole] === true;
}
```

### `resolveEffectiveRole(actor, target)` contract

| Step | Rule |
|------|------|
| 1 | If `actor.id === target.ownerId` → return `Owner`. |
| 2 | Walk ancestors of `target` (target itself first, then parent, grandparent, …). |
| 3 | For each ancestor, look up grants where `grantee = actor`. Collect all matching roles. |
| 4 | Return the **highest** role found (`Owner` > `Admin` > `Edit` > `View`). |
| 5 | If no grant found AND public link is enabled on any ancestor → return `PublicView`. |
| 6 | Otherwise → return `null` (no access; caller must reject). |

### Storage contract

The backend MUST provide a roles table that satisfies these constraints. **Roles MUST NOT be stored on the user/profile table** (privilege-escalation prevention).

| Field | Type | Constraint |
|-------|------|------------|
| `id` | UUID-like | Primary key |
| `userId` | OwnerId | FK to user table; NOT NULL |
| `scope` | Enum | One of `Workspace` \| `Item` |
| `scopeId` | UUID-like \| null | NULL when `scope = Workspace` |
| `role` | Enum | One of the values listed in §Role Inventory |
| `grantedBy` | OwnerId | FK to user table; NOT NULL |
| `createdAt` | Timestamp | NOT NULL |

Uniqueness: `(userId, scope, scopeId, role)` must be unique.

### Helper function contract

The backend MUST expose a server-side function `hasRole(userId, scope, scopeId, role): boolean` that:
- Runs with elevated privileges (security-definer pattern).
- Is the **only** path RLS / capability checks use.
- Returns `false` on any error rather than throwing.

---

## Cross-References

- [`08-share-dialog.md`](./08-share-dialog.md) — UI surface for granting per-item roles
- [`mem://features/sharing-model`](mem://features/sharing-model) — public + invited-user rules
- [`spec/20-enums-index.md`](../../20-enums-index.md) §3.5 — `SharePermissionType` enum SSOT
- [`spec/19-glossary.md`](../../19-glossary.md) — terminology
- [`mem://constraints/backend-runtime-deferred`](mem://constraints/backend-runtime-deferred) — runtime-agnostic mandate
- System-prompt mandate: roles MUST live in a separate table; never on user/profile

---

## Open Questions

1. **Comment-only role?** Currently bundled into `Edit`. Add a 4th tier `Comment` between `View` and `Edit`? Deferred — not requested.
2. **Time-bound grants?** "Expires after N days" on share grants. Out of scope for v1.
3. **Per-field permissions?** E.g. `View` on content but not on notes. Out of scope for v1.

---

## Related

**See also:**

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`08-share-dialog.md`](./08-share-dialog.md) — Share dialog UI
- [`97-acceptance-criteria.md`](./97-acceptance-criteria.md) — AT rollup

---

*Roles & Permissions spec v1.0.0 — closes audit finding F-04. Runtime-agnostic. 2026-04-25 (UTC+8).*
