# Mirror Create Flow

> **Version:** 1.1.0
> **Created:** 2026-04-27 (UTC+8) — F16 (No-Questions Mode); v1.1.0 (F21) sharpened the `08-mirror-detach-flow.md` link as the explicit **inverse path** and added a cross-reference to `10-migration-execution-flow.md` (the bootstrap path that creates peer groups in batch via M-116 backfill).
> **Status:** Canonical — cross-feature flow
> **Parent:** [`00-overview.md`](./00-overview.md)
> **SSOT for the underlying feature:** [`spec/31-app/01-features/09b-mirror-peer-group-model.md`](../01-features/09b-mirror-peer-group-model.md)
> **Cycle prevention:** [`spec/31-app/01-features/09a-mirror-cycle-detection.md`](../01-features/09a-mirror-cycle-detection.md)
> **Endpoint contract:** [`spec/31-app/06-endpoints/09b-mirror-peer-group.md`](../06-endpoints/09b-mirror-peer-group.md), [`spec/31-app/06-endpoints/16-endpoint-at-matrix.md`](../06-endpoints/16-endpoint-at-matrix.md) row 16 (`EP-MIRRORS-CREATE`)
> **LWW rules:** [`spec/31-app/01-features/14-concurrency-and-sync.md`](../01-features/14-concurrency-and-sync.md)

---

## Why this file exists

The peer-group model in `01-features/09b-mirror-peer-group-model.md` describes the **end-state** ("two items become peers; both render the diamond ◇ badge"), and `09a-mirror-cycle-detection.md` describes the **cycle-rejection algorithm**. Neither file pins the **end-to-end create sequence** of "user picks target → cycle check → group lookup-or-create → membership insert × 2 → set `PeerGroupId` × 2 → SSE fan-out". F11's `08-mirror-detach-flow.md` covers the inverse path; this file is its create-side counterpart and closes the symmetry.

Without this flow, AI implementers either (a) skip the cycle-detection check entirely (violates `AT-APP-62`), (b) create the peer-group row before the cycle check passes (leaving an orphan `MirrorPeerGroups` row when the request 409s), or (c) emit `mirrors.created` SSE before the group's `PeerGroupId` is committed to both items (clients render a phantom badge on one peer only).

This file pins the sequence. Each step cites the SSOT that governs its rule.

---

## Actors

| Actor | Role |
|-------|------|
| User | Invokes `/mirror`, `/mirror to {parent}`, `/mirror here`, or **⇧⌘M** on Item X. |
| Client (React) | Sends `POST /api/mirrors` with `{ sourceItemId, targetParentId }`. |
| WP REST handler (PHP) | Authorizes, runs cycle detection, transactionally creates group + members. |
| App DB (workspace) | Owns `MirrorPeerGroups`, `MirrorPeerGroupMembers`, `Items.PeerGroupId`. |
| Cycle-detection helper | Recursive CTE per [`09a-mirror-cycle-detection.md`](../01-features/09a-mirror-cycle-detection.md) — pure SQL, no PHP fallback. |
| SSE channel | Broadcasts `mirrors.created` event to peers in the workspace. |

---

## Preconditions

- `Auth::hasRole($userId, 'Edit', 'Item', $sourceItemId)` returns true (mirroring is an Edit-class operation on the source).
- `Auth::hasRole($userId, 'Edit', 'Item', $targetParentId)` returns true (creating a child requires Edit on the parent).
- `$sourceItemId` is not the workspace root (root cannot be mirrored — UI blocks per `AT-MIRRORS-15`; backend re-checks).
- `$sourceItemId` is not soft-deleted (`Items.DeletedAt IS NULL`).
- `$targetParentId` is not in the descendant subtree of `$sourceItemId` — enforced by the cycle-detection algorithm in step 3d.

---

## Sequence

```
1. User invokes "Mirror to…" picker on Item X (the source).
2. User selects target parent P. Client validates locally:
     - Block if P == X or P is a known descendant of X (UI hint, NOT authoritative).
     - Block if X is the root.
3. Client → POST /api/mirrors  { sourceItemId: X, targetParentId: P }
4. PHP handler:
     a. Auth::hasRole($userId, 'Edit', 'Item', X) → 403 if false.
     b. Auth::hasRole($userId, 'Edit', 'Item', P) → 403 if false.
     c. SELECT 1 FROM Items WHERE ItemId = X AND DeletedAt IS NULL  → 409 if none.
        SELECT 1 FROM Items WHERE ItemId = P AND DeletedAt IS NULL  → 409 if none.
     d. Cycle check (recursive CTE per 09a-mirror-cycle-detection.md):
          WITH RECURSIVE descendants AS (
            SELECT ItemId FROM Items WHERE ItemId = X
            UNION ALL
            SELECT i.ItemId FROM Items i
              JOIN descendants d ON i.ParentItemId = d.ItemId
          )
          SELECT 1 FROM descendants WHERE ItemId = P;
        If row exists → 409 "Cannot mirror an item into itself or its descendants" (AT-APP-62).
     e. BEGIN TRANSACTION.
     f. SELECT PeerGroupId FROM MirrorPeerGroupMembers
          WHERE ItemId = X
          FOR UPDATE.
        IF row exists:
          groupId = row.PeerGroupId         (X is already a peer; reuse group)
          createdGroup = false
        ELSE:
          INSERT INTO MirrorPeerGroups (PeerGroupId, CanonicalItemId, CreatedAt)
            VALUES (gen_uuid(), X, now())  RETURNING PeerGroupId;
          groupId = returned id
          createdGroup = true
          INSERT INTO MirrorPeerGroupMembers (MemberId, PeerGroupId, ItemId)
            VALUES (gen_uuid(), groupId, X);
          UPDATE Items SET PeerGroupId = groupId WHERE ItemId = X;
     g. INSERT new peer Item P₂ as a child of P:
          INSERT INTO Items (ItemId, ParentItemId, Title, Content, FractionalIndex,
                             PeerGroupId, CreatedAt, UpdatedAt, ServerTs, OwnerUserId)
            SELECT gen_uuid(), P, X.Title, X.Content,
                   next_fractional_index(P), groupId, now(), now(), now(), $userId
            FROM   Items WHERE ItemId = X;
          newItemId = inserted ItemId
     h. INSERT INTO MirrorPeerGroupMembers (MemberId, PeerGroupId, ItemId)
          VALUES (gen_uuid(), groupId, newItemId);
     i. (Idempotency) UNIQUE constraint on (PeerGroupId, ItemId) prevents
        duplicate inserts on retry — see Idempotency section.
     j. COMMIT.
5. Server emits SSE on workspace channel:
     - `mirrors.created` with { groupId, sourceItemId: X, newItemId, parentItemId: P, createdGroup }
     - IF createdGroup → also emit `item.updated` for X (its PeerGroupId changed)
6. Client refreshes:
     - Diamond ◇ badge appears on BOTH X and the new peer P₂.
     - Toast: "Mirror created in {P.Title}". Subtitle: "Mirrors stay synced. Duplicates do not."
     - The picker dialog closes.
```

> **Single-mutation principle:** Create is one HTTP call, one transaction, one (or two) SSE events. The `MirrorPeerGroups` row, both `MirrorPeerGroupMembers` rows, the new `Items` row, and both `Items.PeerGroupId` updates land in a single COMMIT — partial-failure states ("group exists but only one peer"), ("two members but `Items.PeerGroupId` not set on source") are physically impossible.

---

## Failure modes

| Failure | HTTP | Recovery |
|---------|------|----------|
| 403 — caller lacks `Edit` on source or target parent | 403 | Toast: "You don't have permission to mirror here." |
| 409 — source or parent soft-deleted | 409 | Client refreshes view; row removed from picker. |
| 409 — cycle detected (parent is descendant of source) | 409 | Toast (per `AT-MIRRORS-08`): "Cannot mirror an item into itself or its descendants." Picker stays open. |
| 409 — source is the workspace root | 409 | Toast (per `AT-MIRRORS-15`): "Cannot mirror the root item." |
| 409 — already mirrored under same parent (UNIQUE on `(PeerGroupId, ParentItemId)` if enforced) | 409 | Toast (per `AT-MIRRORS-09`): "Already mirrored in this location." |
| 410 — source hard-deleted by reaper mid-request | 410 | Client refreshes view; row removed. |
| Trigger raises (defensive) | 500 | ROLLBACK; user sees generic "Could not create mirror" toast; engineer investigates. |
| Network drops mid-request | (n/a) | Operation queued per `mem://features/offline-resilience`; replays via [`07-sync-replay-flow.md`](./07-sync-replay-flow.md) on reconnect. |
| SSE broadcast fails | (n/a) | 5 s poll fallback per `14-concurrency-and-sync.md` §14.1. |

---

## Idempotency

Mirror create is **conditionally idempotent** — replays of the *same* request shape with the *same* `X-WorkFlowy-Idempotency-Key` MUST return the original response, not insert a second peer. Implementation:

- The handler SHOULD persist `(idempotencyKey, userId) → response` in `ProcessedMutations` for **24 h** (per `14-concurrency-and-sync.md`).
- Without an idempotency key, two near-simultaneous create requests with the *same* `(sourceItemId, targetParentId)` will both succeed and produce **two distinct peers under the same parent** — this matches Workflowy's behavior (the user explicitly invoked "Mirror to…" twice). The picker UI MUST debounce the submit button to prevent accidental double-submit.

The `FOR UPDATE` lock in step 4f serializes group lookup so two concurrent mirrors of the same source never create two `MirrorPeerGroups` rows for it.

---

## Forbidden in implementations

- ❌ Performing the cycle check in PHP instead of SQL. Splits the check across two code paths, creates a TOCTOU window where a concurrent move could turn the parent into a descendant between PHP check and INSERT.
- ❌ Skipping step 4d (cycle check) when `createdGroup = false`. Even reusing an existing group, the new peer's parent must still pass cycle detection.
- ❌ Creating the `MirrorPeerGroups` row outside the transaction. A failed cycle check would leave an orphan group row.
- ❌ Inserting the new `Items` row before the `MirrorPeerGroupMembers` row for the source. The source's `PeerGroupId` MUST be set in the same transaction; otherwise the new peer COMMITs with `PeerGroupId` set but the source still NULL — clients render only one badge.
- ❌ Emitting `mirrors.created` SSE before COMMIT.
- ❌ Treating "Mirror to existing peer-group target" as a different endpoint. The same `EP-MIRRORS-CREATE` handles both first-mirror (creates group) and Nth-mirror (reuses group); the `createdGroup` flag in the SSE payload is the only distinction.
- ❌ Allowing a peer to be created under a parent that is itself a descendant of any *other* peer in the same group (would form a cycle through the peer-group, not just the source subtree). The cycle CTE in step 4d MUST be re-run from each existing peer when adding to an existing group — see [`09a-mirror-cycle-detection.md`](../01-features/09a-mirror-cycle-detection.md) §3.
- ❌ Copying `Items.UpdatedAt` or `Items.ServerTs` from the source. The new peer is a fresh row with `now()` timestamps; LWW operates on per-row stamps.

---

## Acceptance Tests (canonical)

| ID | Canonical | Source | Scenario | Expected |
|----|-----------|--------|----------|----------|
| `AT-WF-CREATE-01` | `AT-APP-58` | This flow | Mirror regular item X under parent P (first mirror) | New `MirrorPeerGroups` row; both X and P₂ in `MirrorPeerGroupMembers`; both `Items.PeerGroupId` set; both render ◇ badge |
| `AT-WF-CREATE-02` | `AT-APP-59` | This flow | After successful create, edit P₂'s title | All peers (including X) render new title within **1 s** via SSE `item.updated` fan-out |
| `AT-WF-CREATE-03` | `AT-APP-62` | This flow | Attempt to mirror X under a parent P where P ∈ descendants(X) | Cycle CTE matches; transaction NOT begun; HTTP 409 with cycle message; no rows inserted |
| `AT-WF-CREATE-04` | `AT-APP-66` | This flow | Replay create with same `X-WorkFlowy-Idempotency-Key` | Returns cached response; no second peer created |
| `AT-WF-CREATE-05` | `AT-APP-67` | This flow | Attempt to write to legacy `Mirrors` table post-v2 migration | HTTP 410 (legacy table is read-only after `M-117`) |

> ✅ **Canonical-mapped:** each `AT-WF-CREATE-NN` maps 1:1 to an `AT-APP-NN` row in [`spec/31-app/97-acceptance-criteria.md`](../97-acceptance-criteria.md). Canonical column is authoritative.

---

## Related

- [`08-mirror-detach-flow.md`](./08-mirror-detach-flow.md) — **inverse path**; create grows a peer group (≥2 members), detach shrinks it; both share the auto-dissolve trigger when membership count would fall to 1
- [`10-migration-execution-flow.md`](./10-migration-execution-flow.md) — bootstrap path that **batch-creates** peer groups (M-116 backfill) using the same `MirrorPeerGroup`/`MirrorPeerGroupMember` invariants this runtime flow enforces per-row
- [`07-sync-replay-flow.md`](./07-sync-replay-flow.md) — offline mirror-create mutations drain via this flow's request shape
- [`../01-features/09b-mirror-peer-group-model.md`](../01-features/09b-mirror-peer-group-model.md) — feature-level SSOT
- [`../01-features/09a-mirror-cycle-detection.md`](../01-features/09a-mirror-cycle-detection.md) — cycle-prevention algorithm SSOT
- [`../01-features/09-mirrors.md`](../01-features/09-mirrors.md) — original (pre-peer-group) mirror feature spec
- [`../06-endpoints/09b-mirror-peer-group.md`](../06-endpoints/09b-mirror-peer-group.md) — endpoint contract for group inspection + detach
- [`../07-db-diagram/07-migrations.md`](../07-db-diagram/07-migrations.md) — migration M-115/M-116/M-117 (legacy → peer-group)
- [`mem://features/mirroring`](mem://features/mirroring) — peer-group memory note
