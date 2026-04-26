# Trash View Specification

> **Version:** 2.3.0
> **Updated:** 2026-04-26 — APP-FIX-05: Settings Keys (Seedable Config) section added (closes audit F-04 for this file). v2.2.0 added Realtime Transport callout.
> **Parent:** [00-overview.md](./00-overview.md)
> **Template:** [13-feature-file-template.md](../../01-spec-authoring-guide/13-feature-file-template.md)

---

## Overview

The Trash view is the safety net for deletions. Every soft-deleted item lives here for 30 days, sorted newest-first, with restore and permanent-delete affordances. After 30 days the server reaps the row irreversibly. This is the only surface where permanent deletion is allowed.

## User Story

As a user who occasionally deletes the wrong item, I want a 30-day grace period to restore anything I removed, so that I never lose work to a misclick — and when I do want it gone, I can purge it explicitly.

---

### 10.1 Behavior

| Element | Behavior |
|---------|----------|
| Trash list | Shows all soft-deleted items, newest first. Each item displays: content preview, date deleted, and "Expires in X days". |
| Restore button | Per item — restores the item to its original parent location (or to the root if the original parent was also deleted). Toast: "Item restored". |
| Delete permanently button | Per item — permanently and irreversibly deletes the item. Requires a confirmation dialog: "This cannot be undone. Are you sure?" |
| Empty trash button | Permanently deletes ALL trash items. Requires confirmation. |
| Auto-cleanup | Items in trash expire automatically after 30 days (handled server-side). |

---

## Storage

| Layer | Tables | Notes |
|-------|--------|-------|
| **Root DB** | — | Trash is workspace-local. |
| **App DB** (per workspace) | `Items` (filtered `WHERE DeletedAt IS NOT NULL`), `Mirrors` (cascade-broken on parent deletion) | No separate `Trash` table — soft-delete via `Items.DeletedAt`. 30-day purge job runs against App DB. |
| **Cross-DB joins** | **Forbidden.** | |

---

## Realtime Transport

| Channel | Mechanism | Fallback |
|---------|-----------|----------|
| Peer deletion / restore / 30-day reaper updates | **WP-native SSE** keyed by `(UserId, WorkspaceId)` | **5 s poll** of `/api/sync?since={ServerTs}` when SSE drops |

> Per [`14-concurrency-and-sync.md`](./14-concurrency-and-sync.md) §14.1 and `00-overview.md` L9. WebSockets / Pusher / Supabase Realtime are **forbidden**. The 30-day reaper runs server-side and emits the same SSE events as a manual permanent-delete.

---

## Inputs

| Field | Type | Source | Required | Notes |
|-------|------|--------|----------|-------|
| `currentUser` | `User` | Auth session | Yes | Trash is per-user; only owner sees their items |
| `trashedItems` | `Item[]` | API: `GET /trash` | Yes | Sorted by `deletedAt` DESC |
| `nowLocal` | `Date` | Browser clock | Yes | Drives "Expires in X days" countdown |
| `viewportSize` | `{ w: number; h: number }` | Window | Yes | 250-per-view virtualization |

## Outputs

| Output | Persisted? | Channel | Notes |
|--------|-----------|---------|-------|
| Trash list render | ❌ | React state | Newest-first |
| Restore action | ✅ SQLite | `Item.deletedAt` cleared, `Item.parentId` reset | Toast "Item restored" |
| Permanent delete (single) | ✅ SQLite | Hard DELETE row + cascade children | Irreversible — confirm dialog required |
| Empty trash | ✅ SQLite | Hard DELETE all rows where `userId = ? AND deletedAt IS NOT NULL` | Confirm dialog required |
| Auto-cleanup | ✅ SQLite | Server cron — DELETE where `deletedAt < now() - 30 days` | Background job |
| `item:restored` / `item:purged` events | ❌ | Event bus | Drives sidebar/list refresh |

## Edge Cases

1. Trash is empty — show empty state "Trash is empty. Deleted items appear here for 30 days."
2. Item's original parent was also deleted — restore places item at the root with toast "Original parent was deleted; restored to root".
3. Item's original parent was deleted then permanently purged — same: restore to root.
4. User restores an item that has 200 deleted children — children restore alongside as a single atomic operation.
5. Item is a mirror — restoring a mirror restores only the mirror reference; the source must already exist (or restore is blocked with "Original source no longer exists").
6. User clicks "Empty trash" with 1000+ items — show progress toast; operation runs in batches; UI updates as rows clear.
7. Item is at day 29 of 30 — show "Expires in 1 day" in destructive color.
8. Item has already expired but server cron hasn't run yet — hide from trash list (filter `deletedAt < now() - 30 days` client-side).
9. User permanently deletes from trash — confirm dialog, on confirm hard-delete; no undo possible.
10. User cancels the confirm dialog — no operation runs; row stays in trash.
11. Network drops during restore — queue per offline-resilience; row shows "Restoring…" badge until reconnect.
12. User restores an item that belongs to a shared workspace where access was revoked — block with toast "Workspace access removed; cannot restore here".
13. Two users (admin + owner) empty trash simultaneously — last write wins; both clients reach the same empty state.

## Acceptance Tests

| ID | Given | When | Then | testid |
|----|-------|------|------|--------|
| AT-TRASH-01 | User has 3 deleted items | User opens Trash view | List renders newest-first; each row shows preview, deleted date, "Expires in X days" | `trash-view-root` |
| AT-TRASH-02 | Trash is empty | View renders | Empty state "Trash is empty. Deleted items appear here for 30 days." appears | `trash-empty-state` |
| AT-TRASH-03 | Trash row is visible | User clicks Restore | `Item.deletedAt` cleared; row leaves Trash; toast "Item restored" | `trash-restore-button` |
| AT-TRASH-04 | Item's original parent is also deleted | User clicks Restore | Item restored to root; toast "Original parent was deleted; restored to root" | `trash-restore-toast` |
| AT-TRASH-05 | Trash row is visible | User clicks Delete permanently | Confirmation dialog "This cannot be undone. Are you sure?" appears | `trash-delete-confirm` |
| AT-TRASH-06 | Confirm dialog is open | User clicks Confirm | Row hard-deleted from DB; row removed from list | `trash-delete-confirm-yes` |
| AT-TRASH-07 | Confirm dialog is open | User clicks Cancel | Dialog closes; row remains in trash | `trash-delete-confirm-no` |
| AT-TRASH-08 | Trash has 5 items | User clicks Empty trash | Confirmation dialog appears | `trash-empty-confirm` |
| AT-TRASH-09 | Empty-trash confirm is open | User confirms | All rows hard-deleted; list shows empty state | `trash-empty-confirm-yes` |
| AT-TRASH-10 | Item is at day 29 | View renders | "Expires in 1 day" rendered in destructive color | `trash-expiry-label` |
| AT-TRASH-11 | Item has expired but cron hasn't run | View renders | Row hidden client-side (filter `deletedAt < now() - 30 days`) | `trash-view-root` |
| AT-TRASH-12 | Item has 200 deleted children | User restores parent | All 200 children restore in one atomic operation | `trash-restore-button` |
| AT-TRASH-13 | Item is a mirror; source no longer exists | User clicks Restore | Block with toast "Original source no longer exists" | `trash-restore-error` |
| AT-TRASH-14 | Network is offline | User clicks Restore | Row shows "Restoring…" badge; on reconnect operation completes | `trash-pending-state` |
| AT-TRASH-15 | 1000+ items in trash | User clicks Empty trash | Progress toast appears; batches run; list clears as rows process | `trash-empty-progress` |

## Component Contract

| Surface | Component path | `data-testid` | Acceptance tests |
|---------|---------------|---------------|------------------|
| Trash view root | `src/pages/Trash.tsx` | `trash-view-root` | AT-TRASH-01, 11 |
| Empty state | `src/components/trash/TrashEmptyState.tsx` | `trash-empty-state` | AT-TRASH-02 |
| Trash row | `src/components/trash/TrashRow.tsx` | `trash-row`, `trash-expiry-label` | AT-TRASH-01, 10 |
| Restore button | `src/components/trash/RestoreButton.tsx` | `trash-restore-button` | AT-TRASH-03, 12, 14 |
| Restore toast | `src/components/feedback/RestoreToast.tsx` | `trash-restore-toast`, `trash-restore-error` | AT-TRASH-04, 13 |
| Delete-permanently confirm dialog | `src/components/trash/DeletePermanentlyDialog.tsx` | `trash-delete-confirm`, `trash-delete-confirm-yes`, `trash-delete-confirm-no` | AT-TRASH-05..07 |
| Empty-trash button | `src/components/trash/EmptyTrashButton.tsx` | `trash-empty-button` | AT-TRASH-08 |
| Empty-trash confirm dialog | `src/components/trash/EmptyTrashDialog.tsx` | `trash-empty-confirm`, `trash-empty-confirm-yes` | AT-TRASH-08, 09 |
| Empty-trash progress toast | `src/components/feedback/ProgressToast.tsx` | `trash-empty-progress` | AT-TRASH-15 |
| Pending-restore badge | `src/components/trash/PendingBadge.tsx` | `trash-pending-state` | AT-TRASH-14 |

> **Note:** Components are planned paths — none exist yet. Feeds the global component-contract map (M-3).

---

## Related

- [01-information-model.md](./01-information-model.md) — `Item.deletedAt` soft-delete column
- [03-layout-structure.md](./03-layout-structure.md) — Trash entry point in sidebar/settings
- [06-item-context-menu.md](./06-item-context-menu.md) — Delete action that puts items here
- [09-mirrors.md](./09-mirrors.md) — restoring a mirror requires the source still exists
- [03-edge-cases/01-edge-cases.md](../03-edge-cases/01-edge-cases.md) — orphaned-parent restore cases
- `mem://features/trash-logic` — 30-day retention policy
