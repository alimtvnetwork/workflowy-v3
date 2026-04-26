# Share Invite Flow

> **Version:** 1.0.0
> **Created:** 2026-04-26 (UTC+8) — APP-FIX-12 (closes audit F-10)
> **Status:** Canonical — cross-feature flow
> **Parent:** [`00-overview.md`](./00-overview.md)
> **SSOT for the underlying feature:** [`spec/31-app/01-features/08-share-dialog.md`](../01-features/08-share-dialog.md)

---

## Why this file exists

`01-features/08-share-dialog.md` describes the dialog UI and the cascade-to-descendants sharing rule (`AT-APP-25`). It does NOT describe the **end-to-end sequence** of "owner adds invitee → grant row written → invitee notified → invitee accepts → effective role visible across all descendants". Without an explicit flow, AI implementers split grants and notifications inconsistently.

This file pins the sequence. Each step cites the SSOT that governs its rule.

---

## Actors

| Actor | Role |
|-------|------|
| Inviter | Workspace member with `Admin` on the item being shared. |
| Invitee | A user identified by email; may or may not have a WordPress account yet. |
| Client (React) | Renders the share dialog; sends `POST /api/items/{ItemId}/grants`. |
| WP REST handler (PHP) | Authorizes, writes the grant, dispatches the notification. |
| Root DB | Owns `User`, `WorkspaceMember`, `PendingInvite`. |
| App DB (item's workspace) | Owns `ItemGrant` (per-item ACL, cascades by ancestor walk). |
| SSE channel | Broadcasts `grants.updated` to inviter and (once accepted) invitee. |

---

## Preconditions

- `Auth::hasRole($inviterId, 'Admin', 'Item', $itemId)` returns `true` (see [`15-roles-and-permissions.md`](../01-features/15-roles-and-permissions.md)).
- The item is not in Trash (`Items.DeletedAt IS NULL` — positive guard per `00-overview.md` §Boolean Conventions).
- The invitee email is well-formed (sanitized server-side).

---

## Sequence

```
1. Inviter opens share dialog on Item I (entry from ⋮ context menu — see 06-item-context-menu).
2. Dialog enumerates current grants by reading App DB:
     SELECT * FROM ItemGrant WHERE ItemId = I.ItemId
3. Inviter enters invitee email + role (View | Edit | Admin).
4. Client → POST /api/items/{I.ItemId}/grants
                body: { email, role, message? }
                header: X-WorkFlowy-Idempotency-Key: <UUIDv7>
5. PHP handler:
     a. Auth::hasRole($inviterId, 'Admin', 'Item', I.ItemId) → must be true.
     b. Open Root DB → SELECT UserId FROM User WHERE Email = email.
     c. If user exists:
           c1. Open App DB for I.WorkspaceId.
           c2. INSERT INTO ItemGrant (GrantId, ItemId, GranteeUserId, Role,
                  GrantedBy, GrantedAt, AcceptedAt) VALUES (..., NULL).
                Auto-acceptance is NOT implicit — invitee must accept.
           c3. Stamp LWW: <Field>UpdatedAt = serverNow, <Field>UpdatedBy = $inviterId.
        Else (no account):
           c4. Open Root DB → INSERT INTO PendingInvite
                  (InviteId, Email, ItemId, WorkspaceId, Role, InvitedBy, ExpiresAt = serverNow + 14 days).
     d. Dispatch notification (email + in-app if user exists) — never block the response.
     e. Return 201 with the grant row (or pending-invite row).
6. Server emits SSE event `grants.updated` on (UserId=$inviterId, WorkspaceId=I.WorkspaceId).
7. Invitee accepts:
     a. Click link → /api/invites/{InviteId}/accept (or /api/grants/{GrantId}/accept for existing accounts).
     b. PHP handler updates AcceptedAt = serverNow.
     c. SSE emits `grants.accepted` to both parties on their respective channels.
     d. Effective-role cache (per-session, per-item ancestor walk) invalidates.
8. From this point, Auth::hasRole($inviteeId, $role, 'Item', $descendantId) returns true
   for I and every descendant unless an explicit override grant says otherwise (cascade rule, AT-APP-25).
```

> **Cross-DB rule:** Steps 5b (Root DB lookup) and 5c1 (App DB write) are TWO transactions. There is NEVER a JOIN. The `GranteeUserId` foreign key is logical; integrity is enforced in the application layer.

---

## Failure modes

| Failure | HTTP | Recovery |
|---------|------|----------|
| 403 — inviter lacks `Admin` on item | 403 | Dialog shows "Only admins can share." No DB write. |
| 422 — malformed email | 422 | Inline validation in dialog before submit. |
| 409 — grant already exists for `(ItemId, GranteeUserId)` | 409 | Dialog offers to update role instead. |
| 410 — pending invite expired | 410 | Acceptance link disabled; inviter sees "expired" badge. |
| Notification dispatch fails | (n/a) | Grant still written; failure logged via `Logger::warn()`. Inviter can resend. |
| SSE broadcast fails | (n/a) | 5 s poll fallback per [`14-concurrency-and-sync.md`](../01-features/14-concurrency-and-sync.md). |

---

## Idempotency

`X-WorkFlowy-Idempotency-Key` is required on `POST /api/items/{ItemId}/grants`. The server stores `(IdempotencyKey → GrantId)` in App DB for 24 h. Replays return the original 201 + GrantId without inserting again. This prevents duplicate-invite spam from network retries.

---

## Forbidden in implementations

- ❌ Trusting the client's claim of `inviterId` — always read from the auth session.
- ❌ Auto-accepting on the inviter's behalf (the `AcceptedAt` field exists for a reason).
- ❌ Joining `User` (Root DB) with `ItemGrant` (App DB) in a single SQL — split into two reads.
- ❌ Writing to `wp_users` directly — go through WordPress's user APIs for account creation.
- ❌ Broadcasting `grants.updated` before the App DB COMMIT.

---

## Acceptance Tests (canonical)

| ID | Source | Scenario | Expected |
|----|--------|----------|----------|
| `AT-WF-SHARE-01` | This flow | Inviter without `Admin` attempts to grant | 403; no rows written |
| `AT-WF-SHARE-02` | This flow | Inviter shares with existing account, role=`Edit` | 201; ItemGrant row inserted with `AcceptedAt = NULL`; SSE delivered to inviter within 1 s |
| `AT-WF-SHARE-03` | This flow | Inviter shares with non-existent email | 201; PendingInvite row inserted in Root DB with `ExpiresAt = serverNow + 14d` |
| `AT-WF-SHARE-04` | This flow | Invitee clicks accept link | 200; `AcceptedAt` set; SSE `grants.accepted` to both parties; `Auth::hasRole` for invitee on a descendant returns true |
| `AT-WF-SHARE-05` | This flow | Replayed POST with same `X-WorkFlowy-Idempotency-Key` | 201 with original GrantId; no duplicate row |

> These IDs live in the `AT-WF-*` namespace introduced by APP-FIX-12.

---

## Related

- [`02-template-application-flow.md`](./02-template-application-flow.md) — sister cross-feature flow
- [`04-trash-restore-flow.md`](./04-trash-restore-flow.md) — sister cross-feature flow
- [`../01-features/08-share-dialog.md`](../01-features/08-share-dialog.md) — feature-level SSOT
- [`../01-features/15-roles-and-permissions.md`](../01-features/15-roles-and-permissions.md) — `Auth::hasRole()` contract
- [`../01-features/01-information-model.md`](../01-features/01-information-model.md) §1.3 — sharing-cascade rule
