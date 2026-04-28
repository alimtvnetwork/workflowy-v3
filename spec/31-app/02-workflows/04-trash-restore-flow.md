# Trash Restore Flow

> **Version:** 1.2.0
> **Created:** 2026-04-26 (UTC+8) — APP-FIX-12 (closes audit F-10)
> **Updated:** 2026-04-27 (UTC+8) — v1.2.0 added back-link to `05-trash-reaper-flow.md` (F25)
> **Status:** Canonical — cross-feature flow
> **Parent:** [`00-overview.md`](./00-overview.md)
> **SSOT for the underlying feature:** [`spec/31-app/01-features/11-trash-view.md`](../01-features/11-trash-view.md)

---

## Why this file exists

`01-features/11-trash-view.md` describes Trash UI and the 30-day reaper. `01-features/14-concurrency-and-sync.md` §14.4 pins `Mirrors.BrokenAt` LWW. Neither file describes the **end-to-end sequence** of "user clicks Restore → ancestor walk validates → soft-delete cleared → broken mirrors re-heal → SSE broadcasts". Without this flow, AI implementers either (a) skip the ancestor walk and restore an item under a still-trashed parent, or (b) re-heal mirrors whose source has been hard-deleted.

This file pins the sequence. Each step cites the SSOT that governs its rule.

---

## Actors

| Actor | Role |
|-------|------|
| User | Initiates restore from `Trash → Restore` (or context menu on a trashed item). |
| Client (React) | Sends `POST /api/items/{ItemId}/restore`. |
| WP REST handler (PHP) | Authorizes, walks ancestors, clears soft-delete, re-heals mirrors. |
| App DB (workspace) | Owns `Items`, `Mirrors` (subject to LWW per §14.4). |
| SSE channel | Broadcasts `items.restored` and `mirrors.healed` to peers. |

---

## Preconditions

- `Auth::hasRole($userId, 'Edit', 'Item', $itemId)` returns `true`.
- The item is in Trash (`Items.DeletedAt IS NOT NULL`) AND has not been hard-deleted by the 30-day reaper.
- `OptionNameType::TRASH_CONFIRM_PERMANENT_DELETE` does NOT apply here — that key gates *permanent* delete, not restore. Restore is always one-click.

---

## Sequence

```
1. User clicks "Restore" on Item I in Trash view.
2. Client → POST /api/items/{I.ItemId}/restore
3. PHP handler:
     a. Auth::hasRole($userId, 'Edit', 'Item', I.ItemId) → must be true.
     b. Open App DB for I.WorkspaceId.
     c. BEGIN TRANSACTION.
     d. SELECT * FROM Item WHERE ItemId = I.ItemId.
        If DeletedAt IS NULL → 409 (already healthy).
        If row missing → 410 (reaped — cannot restore).
     e. Walk ancestors via ParentId until root or until an ancestor with DeletedAt IS NOT NULL is found.
        IF a still-trashed ancestor exists → 422 with body { blockingAncestorId }.
        Client surfaces "Restore parent first?" CTA.
     f. UPDATE Item SET DeletedAt = NULL,
                          DeletedAtUpdatedAt = serverNow,
                          DeletedAtUpdatedBy = $userId
        WHERE ItemId = I.ItemId AND DeletedAtUpdatedAt < serverNow.
        (LWW guard — see 14-concurrency §14.2; a concurrent re-delete with newer ts wins.)
        If 0 rows affected → 409 (lost LWW race).
     g. Find broken mirrors of I and its descendants:
           SELECT MirrorId, BrokenAtUpdatedAt FROM Mirror
            WHERE SourceId IN (descendant set of I)
              AND BrokenAt IS NOT NULL.
        For each:
           UPDATE Mirror SET BrokenAt = NULL,
                              BrokenAtUpdatedAt = serverNow,
                              BrokenAtUpdatedBy = $userId
            WHERE MirrorId = ? AND BrokenAtUpdatedAt < serverNow.
           (LWW guard per 14-concurrency §14.4. Stale restores LOSE.)
     h. COMMIT.
4. Server emits SSE on (UserId, WorkspaceId):
     - `items.restored`  with { itemId: I.ItemId }
     - `mirrors.healed`  with { mirrorIds: [...] } (only those whose UPDATE returned 1 row)
5. Client refreshes Trash view (item disappears) and the previous parent's view (item reappears at its original SortOrder).
```

> **Cascade scope:** Restore re-surfaces only the explicitly-clicked item. Descendants that were trashed *separately* (with their own `DeletedAt` newer than I's `DeletedAt`) stay in Trash. Per `01-features/01-information-model.md` Edge 7, the cascade-from-trash on delete is one-shot — the restore must be symmetric and NOT auto-restore independently-trashed descendants.

---

## Failure modes

| Failure | HTTP | Recovery |
|---------|------|----------|
| 403 — caller lacks `Edit` | 403 | Toast: "You don't have permission to restore this item." |
| 409 — already healthy (concurrent restore) | 409 | Client refreshes view; no error to user. |
| 410 — hard-deleted by reaper | 410 | Toast: "This item was permanently deleted." Item removed from Trash UI. |
| 422 — blocking trashed ancestor | 422 | Client shows "Restore parent first?" with `blockingAncestorId` deep-link. |
| LWW lost (newer concurrent re-delete) | 409 | Client refreshes; item stays in Trash. |
| SSE broadcast fails | (n/a) | 5 s poll fallback per `14-concurrency-and-sync.md` §14.1. |

---

## Idempotency

Restore is naturally idempotent — replaying after success is a no-op (LWW guard `DeletedAtUpdatedAt < serverNow` fails on the second attempt because the value is now equal). No `X-WorkFlowy-Idempotency-Key` is required.

---

## Forbidden in implementations

- ❌ Restoring without the ancestor walk (step 3e) — produces orphaned items in a phantom parent.
- ❌ Healing mirrors without the LWW guard (step 3g) — produces zombie mirrors when racing with a hard-delete.
- ❌ Auto-restoring independently-trashed descendants — the user must restore each separately (preserves user intent).
- ❌ Reading `DeletedAt` with `empty($row->DeletedAt)` — use the positive check `$row->DeletedAt === null` per `00-overview.md` §Boolean Conventions.
- ❌ Emitting `items.restored` SSE before COMMIT.

---

## Acceptance Tests (canonical)

| ID | Canonical | Source | Scenario | Expected |
|----|-----------|--------|----------|----------|
| `AT-WF-RESTORE-01` | `AT-APP-52` | This flow | Restore item whose parent is also trashed | 422 with `blockingAncestorId`; no DB write |
| `AT-WF-RESTORE-02` | `AT-APP-53` | This flow | Restore healthy ancestor first, then descendant | Both succeed; `items.restored` SSE for each |
| `AT-WF-RESTORE-03` | `AT-APP-54` | This flow | Restore item that was hard-deleted | 410; UI removes the row from Trash |
| `AT-WF-RESTORE-04` | `AT-APP-55` | This flow | Concurrent re-delete with newer `serverTs` | Restore returns 409; item stays trashed; LWW respected |
| `AT-WF-RESTORE-05` | `AT-APP-56` | This flow | Restore re-heals broken mirrors of restored item | `Mirrors.BrokenAt` cleared via LWW; `mirrors.healed` SSE emitted |
| `AT-WF-RESTORE-06` | `AT-APP-57` | This flow | Stale restore racing with reaper hard-delete | Mirror heal LOSES LWW (reaper's ts is newer); broken state preserved |

> ✅ **Backfilled into canonical** (2026-04-26, polish #2): each `AT-WF-RESTORE-NN` maps 1:1 to an `AT-APP-NN` row in [`spec/31-app/97-acceptance-criteria.md`](../97-acceptance-criteria.md). Canonical column is authoritative.

---

## Related

- [`02-template-application-flow.md`](./02-template-application-flow.md) — sister cross-feature flow
- [`03-share-invite-flow.md`](./03-share-invite-flow.md) — sister cross-feature flow
- [`05-trash-reaper-flow.md`](./05-trash-reaper-flow.md) — **terminal counterpart**: restore re-surfaces soft-deleted rows within the 30-day window; reaper hard-deletes the same rows once the window elapses (mutually exclusive on a given `Item.DeletedAt`)
- [`../01-features/11-trash-view.md`](../01-features/11-trash-view.md) — feature-level SSOT
- [`../01-features/14-concurrency-and-sync.md`](../01-features/14-concurrency-and-sync.md) §14.4 — `Mirrors.BrokenAt` LWW
- [`../01-features/09-mirrors.md`](../01-features/09-mirrors.md) — broken-mirror semantics
- [`../01-features/15-roles-and-permissions.md`](../01-features/15-roles-and-permissions.md) — `Auth::hasRole()` contract
