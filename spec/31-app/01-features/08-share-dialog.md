# Share Dialog Specification

> **API Contract:** See [`spec/31-app/06-endpoints/08-share-dialog.md`](../06-endpoints/08-share-dialog.md) for the endpoint surface that backs this feature (request/response envelopes, status codes, error shapes). Bidirectional cross-link added 2026-04-30 to close **F-AUD42-04** (App-folder audit Phase 5).


> **Version:** 2.4.0
> **Updated:** 2026-04-27 — Linked addendum `08b-sharing-mirror-interaction.md` (per-instance ACL on mirror peers). Prior: 2026-04-26 — AUDIT-02a: snake_case → PascalCase rename of DB identifiers in code spans (closes audit F-01 for this file). Prior: 2026-04-26 — APP-FIX-03: Realtime Transport callout added (closes audit F-05 for this file)
> **Parent:** [00-overview.md](./00-overview.md)
> **Template:** [13-feature-file-template.md](../../01-spec-authoring-guide/13-feature-file-template.md)
> **Addendum:** [`08b-sharing-mirror-interaction.md`](./08b-sharing-mirror-interaction.md) — Sharing × Mirror interaction (Permissions keyed by `ItemId`, not `PeerGroupId`; per-peer ACL).


## Database Routing

| Database | Tables read/written | Notes |
|---|---|---|
| **Root DB** | `Share` (grants), `PendingInvites` (email invites), `WorkspaceMember` (capability check) | Sharing surfaces are workspace-membership concerns. |
| **App DB** (per workspace) | `Items` (validate target item exists; read content for share-preview) | Item ID validation only — no writes from share dialog. |
| **Cross-DB joins** | **Forbidden.** | Item validation reads App DB; grant write lands in Root DB in a separate transaction. |

> **Audit cite:** Section added 2026-04-30 to close **F-AUD42-02** (App-folder audit Phase 4). Mirrors the Root-DB / App-DB split per ADR-0019.

---

## Overview

The Share dialog is the single surface for granting other users (or the public) access to an item and its entire subtree. It exposes per-user invite (with View / Edit / Admin permission), a public read-only link toggle, and a list of current grantees the owner can manage. Sharing is **cascading** — every descendant inherits the same access.

## User Story

As an owner, I want to share an outline branch with specific people at the right permission level, or generate a public read-only link for anyone, so that I can collaborate on plans, share notes, and revoke access at any time without exposing the rest of my workspace.

---

### 7.1 Share Dialog Structure

| Element | Behavior |
|---------|----------|
| Email input | Type an email address to invite a specific user with a chosen permission level. |
| Permission dropdown | Choose between View, Edit, or Admin for each invited user. |
| Shared users list | Shows all users who currently have access. The owner can change their permission or remove them. |
| Public link toggle | ON: generates a shareable URL that anyone with the link can use to view. OFF: revokes public access. |
| Copy link button | Copies the public URL to clipboard. |
| Cascade notice | Informational text: "Sharing includes all child items." |

### 7.2 Share Permissions

| Permission | Can View | Can Edit | Can Delete | Can Re-share |
|------------|----------|----------|------------|-------------|
| View | ✅ | ❌ | ❌ | ❌ |
| Edit | ✅ | ✅ | ❌ | ❌ |
| Admin | ✅ | ✅ | ✅ | ✅ |

---

## Enum Sources (normative)

| Enum mentioned in this file | Canonical SSOT | Strategy |
|------------------------------|----------------|----------|
| `Permission` (`View` / `Edit` / `Admin`) | [`spec/20-enums-index.md`](../../20-enums-index.md) §3.5 — `SharePermissionType` | TS Strategy B (`as const` + derived union) — see [`spec/02-coding-guidelines/02-typescript/00-overview.md`](../../02-coding-guidelines/02-typescript/00-overview.md) |

> **Forbidden:** TS `enum` keyword and bare literal unions. Always import the canonical `as const` object.

---

## Realtime Transport

| Channel | Mechanism | Fallback |
|---------|-----------|----------|
| `share:granted` / `share:revoked` events to peers | **WP-native SSE** keyed by `(UserId, WorkspaceId)` | **5 s poll** of `/api/sync?since={ServerTs}` when SSE drops |

> Per [`14-concurrency-and-sync.md`](./14-concurrency-and-sync.md) §14.1 and `00-overview.md` L9. WebSockets / Pusher / Supabase Realtime are **forbidden**.

---

## Inputs

| Field | Type | Source | Required | Notes |
|-------|------|--------|----------|-------|
| `itemId` | `string` | Current zoomed item | Yes | Owner of the share grant chain |
| `currentUser` | `User` | Auth session | Yes | Must be owner OR Admin to open dialog |
| `existingShares` | `Share[]` | API: `GET /items/{id}/shares` | Yes | Drives Shared-users list |
| `publicLink` | `{ url: string; enabled: boolean } \| null` | API: `GET /items/{id}/public-link` | Yes | Drives toggle + copy button |
| `inviteEmail` | `string` | Email input | No | Validated client-side before submit |
| `invitePermission` | `Permission` enum | Permission dropdown | Yes | One of `View` \| `Edit` \| `Admin` |
| `quotaShares` | `{ used: number; limit: number } \| null` | `GET /usage/shares` | No | Free-tier may cap collaborator count |

## Outputs

| Output | Persisted? | Channel | Notes |
|--------|-----------|---------|-------|
| Invite created | ✅ SQLite | `shares` table | One row per `(ItemId, UserId, permission)` |
| Invite email sent | ✅ Email queue | Outgoing email | Subject: "{owner} shared {item title} with you" |
| Permission change | ✅ SQLite | `Shares.permission` UPDATE | Optimistic UI |
| Grantee removed | ✅ SQLite | `shares` DELETE | Cascade does NOT remove grantee's content |
| Public link enabled | ✅ SQLite | `PublicLinks` row inserted | URL: `/p/{slug}` (random 12-char slug) |
| Public link disabled | ✅ SQLite | `PublicLinks.RevokedAt` set | URL returns 404 thereafter |
| Public link copied | ❌ | `navigator.clipboard.writeText` | Toast confirms |
| Activity log entry | ✅ SQLite | `ActivityLog` table | Per share/unshare event |
| `share:granted` / `share:revoked` events | ❌ | Event bus | Drives real-time peer updates |

## Edge Cases

1. Email field is empty when user clicks Invite — show inline error "Enter an email address"; no API call.
2. Email is malformed (missing `@`) — show inline error "Enter a valid email address".
3. Email belongs to a user who already has access — disable Invite button; tooltip "Already shared with this user".
4. Email belongs to the owner themselves — disable Invite button; tooltip "You already own this item".
5. Email belongs to a user not yet registered — create a pending invite row; email contains a signup link that auto-accepts on registration.
6. Owner attempts to lower their own permission via this dialog — block (owner row is non-editable, marked "Owner").
7. Admin grantee revokes the owner's access — block server-side; only the owner can transfer ownership.
8. Public link is enabled and item is moved into a private parent — public link still resolves; the share grant is **on the item**, not its location.
9. Item has 100+ grantees — virtualize the Shared-users list; search input appears above the list.
10. Free-tier user adds the (limit+1)th collaborator — block with toast "Collaborator limit reached. Upgrade to Pro."
11. Sharing a parent that already has child-level shares — child shares remain; cascade adds the new permission as a floor, never lowers existing per-child grants.
12. User pastes a comma-separated list of emails — split into multiple invite rows; show batch progress toast.
13. User toggles public link OFF then ON — generate a **new** slug; old URLs return 404 permanently.
14. Network drops mid-invite — queue the invite locally per `mem://features/offline-resilience`; retry on reconnect; show pending state in the list.
15. Item is deleted while dialog is open — close dialog with toast "Item was deleted; shares revoked".

## Acceptance Tests

| ID | Given | When | Then | testid |
|----|-------|------|------|--------|
| AT-SHARE-01 | User clicks Share button on a non-root item | Dialog opens | Email input, permission dropdown, public-link toggle, and shared-users list all render | `share-dialog` |
| AT-SHARE-02 | Email input is empty | User clicks Invite | Inline error "Enter an email address" appears; no API call fires | `share-email-error` |
| AT-SHARE-03 | Email is "alice@example" (missing TLD) | User clicks Invite | Inline error "Enter a valid email address" appears | `share-email-error` |
| AT-SHARE-04 | Valid email entered, permission = "Edit" | User clicks Invite | API `POST /items/{id}/shares` fires; new row appears in Shared-users list with "Edit" badge | `share-user-row` |
| AT-SHARE-05 | Existing grantee row | Owner changes dropdown to "Admin" | API `PATCH /shares/{id}` fires; badge updates to "Admin" | `share-permission-dropdown` |
| AT-SHARE-06 | Existing grantee row | Owner clicks Remove | Confirmation tooltip appears; on confirm, row disappears; `shares` row deleted | `share-remove-button` |
| AT-SHARE-07 | Public link toggle is OFF | User flips it ON | Toggle animates to ON; new public URL renders next to it; `PublicLinks` row exists | `public-link-toggle` |
| AT-SHARE-08 | Public link is ON | User clicks Copy link | `navigator.clipboard.writeText` fires with the URL; toast "Link copied to clipboard ✓" | `copy-link-button` |
| AT-SHARE-09 | Public link toggle is ON | User flips it OFF | `PublicLinks.RevokedAt` set; URL field clears; copy button disabled | `public-link-toggle` |
| AT-SHARE-10 | Email matches an already-shared user | User types it | Invite button is disabled; tooltip "Already shared with this user" | `share-invite-button` |
| AT-SHARE-11 | Email matches the current owner | User types it | Invite button disabled; tooltip "You already own this item" | `share-invite-button` |
| AT-SHARE-12 | Item has 50 shared users | Dialog opens | List virtualizes; search input appears above; typing filters the visible rows | `share-search` |
| AT-SHARE-13 | Free-tier user is at collaborator cap | User clicks Invite with valid email | Toast "Collaborator limit reached. Upgrade to Pro."; no row inserted | `share-quota-toast` |
| AT-SHARE-14 | Network is offline | User clicks Invite | Invite queued locally; row shows "Pending" badge; on reconnect badge clears | `share-user-row` |
| AT-SHARE-15 | Item is deleted in another tab | Dialog is open | Dialog closes; toast "Item was deleted; shares revoked" | `share-dialog-closed-toast` |

## Component Contract

| Surface | Component path | `data-testid` | Acceptance tests |
|---------|---------------|---------------|------------------|
| Share dialog shell | `src/components/share/ShareDialog.tsx` | `share-dialog` | AT-SHARE-01, 15 |
| Email input | `src/components/share/ShareEmailInput.tsx` | `share-email-input`, `share-email-error` | AT-SHARE-02..03 |
| Invite button | `src/components/share/ShareInviteButton.tsx` | `share-invite-button` | AT-SHARE-04, 10..11, 13 |
| Permission dropdown | `src/components/share/SharePermissionDropdown.tsx` | `share-permission-dropdown` | AT-SHARE-05 |
| Shared-users list | `src/components/share/SharedUsersList.tsx` | `share-user-row`, `share-search` | AT-SHARE-04..06, 12, 14 |
| Remove-grantee button | `src/components/share/ShareRemoveButton.tsx` | `share-remove-button` | AT-SHARE-06 |
| Public-link toggle | `src/components/share/PublicLinkToggle.tsx` | `public-link-toggle` | AT-SHARE-07, 09 |
| Copy-link button | `src/components/share/CopyLinkButton.tsx` | `copy-link-button` | AT-SHARE-08 |
| Cascade notice | `src/components/share/CascadeNotice.tsx` | `cascade-notice` | AT-SHARE-01 |
| Quota toast | `src/components/feedback/QuotaToast.tsx` | `share-quota-toast` | AT-SHARE-13 |
| Item-deleted toast | `src/components/feedback/InfoToast.tsx` | `share-dialog-closed-toast` | AT-SHARE-15 |

> **Note:** None of these components exist yet — paths are the planned implementation order. This table feeds the global component-contract map (M-3).

---

## Workflowy Feature Reference (F4) — Sharing UX

> **Source:** Workflowy product feature list, merged 2026-04-28 (lossless, additive). Reproduced verbatim; cross-linked to existing AT-SHARE-* rows above and to the permission model in `mem://features/sharing-model`.

- **Share** — Open the share dialog from the item-menu (or shortcut ⌘+Shift+S). The dialog has two tabs: *Public link* and *Invite people*.
- **Public Link** — Toggle generates a `https://workflowy.app/s/<token>` URL. Anyone with the link can view (default) or edit (if "Allow editing" is on). Revoke regenerates the token, invalidating the old link. (component: `share-public-link-tab`)
- **Invite People** — Add named users by email. Each invitee gets `view` or `edit` permission independently of the public-link state. Invitees see the item appear under a *Shared with me* sidebar group on next sync. (component: `share-invite-tab`)
- **Permission Levels** — `view` (read-only render, no toolbar / item-menu mutations), `edit` (full CRUD on the shared subtree, but cannot re-share or delete the share root), `owner` (the user who initiated the share; can delete the share root and revoke any invite).
- **Stop Sharing** — Removes the public token AND all invitee ACLs in one action. (component: `share-stop-button`)
- **Per-instance ACL on Mirrors** — Sharing applies to the **specific peer**, not the whole mirror peer group. Sharing peer A does not share peer B (per `mem://features/sharing-model` and [`./08b-sharing-mirror-interaction.md`](./08b-sharing-mirror-interaction.md)).
- **Share Status Pill** — Items with any active share render a `share-status-pill` on the row (see [`./01-information-model.md`](./01-information-model.md)).
- **Shared with Me** — Sidebar group listing every item the current user has been invited to. Click to navigate; the breadcrumb shows the share-root only (ancestors above are hidden because the user has no permission to see them).

> **Reconciliation note (F7 candidate):** the public-link URL pattern (`https://workflowy.app/s/<token>`) is taken verbatim from the Workflowy spec for parity. WorkFlowy's WP-plugin backend MUST host the equivalent at `/wp-json/workflowy/v1/s/<token>` and serve a server-rendered viewer for unauthenticated visitors. Tracked under `.lovable/question-and-ambiguity/`.

---

## Related

- [01-information-model.md](./01-information-model.md) — Item ↔ Share relationship and cascade rules
- [03-layout-structure.md](./03-layout-structure.md) — NavBar Share button that opens this dialog
- [06-item-context-menu.md](./06-item-context-menu.md) — context-menu Share entry point
- [09-mirrors.md](./09-mirrors.md) — share grants follow the source, not the mirror
- [03-edge-cases/01-edge-cases.md](../03-edge-cases/01-edge-cases.md) — sharing-cascade edge case
- `mem://features/sharing-model` — public + invited-user permission rules
- [`./14-concurrency-and-sync.md`](./14-concurrency-and-sync.md) — ← Concurrency + sync rules (forward link from)
- [`./15-roles-and-permissions.md`](./15-roles-and-permissions.md) — ← Roles + permissions (forward link from)
- [08b-sharing-mirror-interaction.md](./08b-sharing-mirror-interaction.md) — addendum: how share grants interact with mirror peer-group membership

---

## Database Scope

- **Anchor:** [`07-db-diagram/00b-split-db-anchor.md`](../07-db-diagram/00b-split-db-anchor.md)
- **Scope:** `[db-scope: cross-db]`
- **Tables:** root.share_invites + app.shares (orchestrated)
- **Cross-DB JOINs:** forbidden (split-DB invariant). Cross-DB orchestration, if any, follows ADR-0019.
