# Roles & Permissions

> **Version:** 1.0.0
> **Created:** 2026-04-25 (UTC+8)
> **Status:** Active — runtime-agnostic contract
> **Parent:** [`00-overview.md`](./00-overview.md)
> **Closes audit finding:** F-04

---

## Purpose

Defines the **runtime-agnostic** roles, permission grants, and authorization checks used everywhere a user acts on an item, share, comment, board, or workspace. This spec describes **behavior and contracts only** — no SQL, no WordPress capability mapping, no Supabase RLS code. The chosen backend (`mem://constraints/backend-runtime-deferred`) implements these contracts.

---

## 1. Role Inventory

### 1.1 Workspace Roles (account-level)

| Role | Description | Assignable By | Default |
|------|-------------|---------------|---------|
| `Owner` | The account holder. Exactly one per workspace. Cannot be revoked, only transferred. | System (on signup) | Auto on signup |
| `Admin` | Full workspace management except billing & ownership transfer. | `Owner` | None |
| `Member` | Default authenticated user. Can create their own items. | `Owner` / `Admin` | Auto on invite |

### 1.2 Item Roles (per-item grant via Share Dialog)

| Role | Description | Source Spec |
|------|-------------|-------------|
| `View` | Read-only access to item + entire subtree. Cannot comment, edit, or share. | [`08-share-dialog.md`](./08-share-dialog.md) §7.2 |
| `Edit` | Read + modify content, add/remove children, complete todos. Cannot re-share or delete the root of the share. | [`08-share-dialog.md`](./08-share-dialog.md) §7.2 |
| `Admin` | All `Edit` rights + manage other grantees, change their permissions, revoke access. Cannot transfer ownership. | [`08-share-dialog.md`](./08-share-dialog.md) §7.2 |
| `Owner` | Implicit role of the item creator. Full control including ownership transfer and hard delete. | Implicit |

### 1.3 Public Link Role

| Role | Description |
|------|-------------|
| `PublicView` | Anonymous read-only access via shareable URL. Strictly read-only. Never inherits any other role. |

---

## 2. Capability Matrix

The single source of truth for "who can do what". Rows are actions; columns are roles. ✅ = allowed, ❌ = denied, ⚠️ = allowed with conditions (footnoted).

### 2.1 Item Actions

| Action | Owner | Admin | Edit | View | PublicView |
|--------|:-----:|:-----:|:----:|:----:|:----------:|
| Read item content & subtree | ✅ | ✅ | ✅ | ✅ | ✅ |
| Edit content / note | ✅ | ✅ | ✅ | ❌ | ❌ |
| Create child item | ✅ | ✅ | ✅ | ❌ | ❌ |
| Toggle complete | ✅ | ✅ | ✅ | ❌ | ❌ |
| Move item (re-parent) | ✅ | ✅ | ⚠️¹ | ❌ | ❌ |
| Reorder siblings | ✅ | ✅ | ✅ | ❌ | ❌ |
| Soft-delete (move to trash) | ✅ | ✅ | ⚠️² | ❌ | ❌ |
| Hard-delete (purge from trash) | ✅ | ❌ | ❌ | ❌ | ❌ |
| Restore from trash | ✅ | ✅ | ❌ | ❌ | ❌ |
| Convert item type | ✅ | ✅ | ✅ | ❌ | ❌ |
| Mirror item elsewhere | ✅ | ✅ | ⚠️³ | ❌ | ❌ |
| Apply template | ✅ | ✅ | ✅ | ❌ | ❌ |

¹ `Edit` may move only **within** the shared subtree, not out of it.
² `Edit` may delete descendants, not the share root itself.
³ `Edit` may create mirrors **into** the shared subtree, not export the source elsewhere.

### 2.2 Sharing Actions

| Action | Owner | Admin | Edit | View | PublicView |
|--------|:-----:|:-----:|:----:|:----:|:----------:|
| Open Share dialog | ✅ | ✅ | ❌ | ❌ | ❌ |
| Invite new grantee | ✅ | ✅ | ❌ | ❌ | ❌ |
| Change grantee permission | ✅ | ✅ | ❌ | ❌ | ❌ |
| Remove grantee | ✅ | ✅ | ❌ | ❌ | ❌ |
| Toggle public link | ✅ | ❌ | ❌ | ❌ | ❌ |
| Transfer ownership | ✅ | ❌ | ❌ | ❌ | ❌ |
| Lower own permission | ❌ | ✅ | ✅ | ❌ | ❌ |

### 2.3 Comment Actions

| Action | Owner | Admin | Edit | View | PublicView |
|--------|:-----:|:-----:|:----:|:----:|:----------:|
| Read comments | ✅ | ✅ | ✅ | ✅ | ❌ |
| Add comment | ✅ | ✅ | ✅ | ❌ | ❌ |
| Edit own comment | ✅ | ✅ | ✅ | ❌ | ❌ |
| Delete own comment | ✅ | ✅ | ✅ | ❌ | ❌ |
| Delete others' comments | ✅ | ✅ | ❌ | ❌ | ❌ |
| Resolve comment thread | ✅ | ✅ | ✅ | ❌ | ❌ |

### 2.4 Workspace Actions

| Action | Owner (workspace) | Admin (workspace) | Member |
|--------|:-----------------:|:-----------------:|:------:|
| Invite new workspace member | ✅ | ✅ | ❌ |
| Remove workspace member | ✅ | ✅ | ❌ |
| View billing | ✅ | ❌ | ❌ |
| Change plan | ✅ | ❌ | ❌ |
| Transfer workspace ownership | ✅ | ❌ | ❌ |
| Delete workspace | ✅ | ❌ | ❌ |
| Create own items | ✅ | ✅ | ✅ |

---

## 3. Inheritance & Cascade Rules

1. **Subtree cascade:** A grant on item `X` applies to **every descendant** of `X`, regardless of depth.
2. **Higher-permission wins:** If user `U` is granted `View` on `X` and `Edit` on a descendant `Y`, `U` has `Edit` on `Y` and its descendants.
3. **Share root is non-deletable by grantees:** A user with `Edit` on item `X` cannot delete `X` itself, only its descendants.
4. **Public link is non-cascading across grants:** Toggling public link on `X` makes `X` and its subtree publicly viewable, but it does **not** elevate any private grant.
5. **Owner is permanent until transfer:** Removing the owner from the share list is impossible. The only path is `transfer ownership`, which atomically swaps the `Owner` role to a target user.

---

## 4. Authorization Contract

Every action that mutates state MUST pass the following check (pseudocode, runtime-agnostic):

```
function canPerform(action: Action, actor: User, target: Item): boolean {
  if (actor.workspaceRole === "Owner") return true;            // workspace owner bypass
  const itemRole = resolveEffectiveRole(actor, target);        // walks ancestor chain, picks max
  return CAPABILITY_MATRIX[action][itemRole] === true;
}
```

### 4.1 `resolveEffectiveRole(actor, target)` contract

| Step | Rule |
|------|------|
| 1 | If `actor.id === target.ownerId` → return `Owner`. |
| 2 | Walk ancestors of `target` (target itself first, then parent, grandparent, …). |
| 3 | For each ancestor, look up grants where `grantee = actor`. Collect all matching roles. |
| 4 | Return the **highest** role found (`Owner` > `Admin` > `Edit` > `View`). |
| 5 | If no grant found AND public link is enabled on any ancestor → return `PublicView`. |
| 6 | Otherwise → return `null` (no access; caller must reject). |

### 4.2 Storage contract (runtime-agnostic)

The chosen backend MUST provide a roles table that satisfies these constraints. **Roles MUST NOT be stored on the user/profile table** (privilege-escalation prevention — see system-prompt mandate).

| Field | Type | Constraint |
|-------|------|------------|
| `id` | UUID-like | Primary key |
| `userId` | OwnerId | FK to user table; NOT NULL |
| `scope` | Enum | One of `Workspace` \| `Item` |
| `scopeId` | UUID-like \| null | NULL when `scope = Workspace` |
| `role` | Enum | One of the values listed in §1 |
| `grantedBy` | OwnerId | FK to user table; NOT NULL |
| `createdAt` | Timestamp | NOT NULL |

Uniqueness: `(userId, scope, scopeId, role)` must be unique.

### 4.3 Helper function contract

The backend MUST expose a server-side function `hasRole(userId, scope, scopeId, role): boolean` that:
- Runs with elevated privileges (security-definer pattern).
- Is the **only** path RLS / capability checks use.
- Returns `false` on any error rather than throwing.

---

## 5. Edge Cases

| # | Scenario | Expected Behavior |
|---|----------|-------------------|
| 1 | Grantee is removed from workspace while they have item grants | All their item grants are cascade-deleted; their authored content is preserved with `created_by = "Removed user"`. |
| 2 | Item is moved out of a shared subtree | The grant remains on the **original** ancestor; the moved item now resolves access from its new ancestor chain. |
| 3 | User invited via email but not yet signed up | Invite stored as pending; grant materializes on first login matching that email. |
| 4 | Mirror of a shared item rendered in an unshared parent | Mirror displays a "🔒 Shared from {ancestor}" badge; access still resolves from the source's grants, not the host parent. |
| 5 | Public link toggled OFF after URL was shared externally | All `PublicView` sessions invalidated within 60 seconds; subsequent requests return 404. |
| 6 | Workspace owner downgrades themselves to Admin | Blocked by §2.2 row "Lower own permission" = ❌ for `Owner`. |
| 7 | Two admins simultaneously remove the same grantee | Idempotent — second delete is a no-op, returns 200. |
| 8 | Grantee tries to access via a stale token after revocation | Token validation fails on next request; client must redirect to share-revoked screen. |

---

## 6. Acceptance Criteria

| ID | Given | When | Then |
|----|-------|------|------|
| AT-APPF-76 | Item owned by user A, shared with user B as `View` | B opens the item | B sees content but no edit affordances; Share button hidden |
| AT-APPF-77 | Item shared with user B as `Edit` | B tries to delete the share root | Action rejected; descendants remain deletable |
| AT-APPF-78 | Item shared with user B as `Admin` | B opens Share dialog and removes user C | C's grant is deleted; C loses access immediately |
| AT-APPF-79 | Item shared with user B as `Admin` | B tries to toggle public link | Toggle is disabled (Owner-only per §2.2) |
| AT-APPF-80 | User has `View` on parent + `Edit` on child | User opens child | Resolved role = `Edit` per §3 rule 2 |
| AT-APPF-81 | Public link enabled on item X | Anonymous user visits the URL | Read-only render with no comment/share affordances |
| AT-APPF-82 | Owner transfers ownership to user B | Transfer completes | B is now `Owner`; original owner is removed from grants entirely |
| AT-APPF-83 | Workspace member tries to invite another member | Action attempted | Rejected with 403; only `Owner`/`Admin` can invite |
| AT-APPF-84 | User removed from workspace | Their item grants checked | All grants cascade-deleted; authored items orphan-tagged |
| AT-APPF-85 | Backend `hasRole()` throws | Capability check called | Returns `false`; action denied; logged at `Warn` level |

---

## 7. Cross-References

- [`08-share-dialog.md`](./08-share-dialog.md) — UI surface for granting per-item roles
- [`mem://features/sharing-model`](mem://features/sharing-model) — public + invited-user rules
- [`spec/20-enums-index.md`](../../20-enums-index.md) §3.5 — `SharePermissionType` enum SSOT
- [`spec/19-glossary.md`](../../19-glossary.md) — terminology
- [`mem://constraints/backend-runtime-deferred`](mem://constraints/backend-runtime-deferred) — runtime-agnostic mandate
- System-prompt mandate: roles MUST live in a separate table; never on user/profile

---

## 8. Open Questions

1. **Comment-only role?** Spec currently bundles "comment" rights into `Edit`. Decide whether to add a 4th tier `Comment` between `View` and `Edit`. (Deferred — not requested by users yet.)
2. **Time-bound grants?** Some Workflowy competitors support "expires after N days" on share grants. Out of scope for v1.
3. **Per-field permissions?** E.g. allow `View` on content but not on notes. Out of scope for v1.

---

*Roles & Permissions spec v1.0.0 — closes audit finding F-04. Runtime-agnostic. 2026-04-25 (UTC+8).*
