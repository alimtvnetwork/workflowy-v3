# Mirror Detach Flow

> **Version:** 1.1.0
> **Created:** 2026-04-27 (UTC+8) — F11 (No-Questions Mode); v1.1.0 (F21) added bidirectional cross-references to `09-mirror-create-flow.md` (inverse path) and `10-migration-execution-flow.md` (which mimics this flow's singleton-dissolve semantics).
> **Status:** Canonical — cross-feature flow
> **Parent:** [`00-overview.md`](./00-overview.md)
> **SSOT for the underlying feature:** [`spec/31-app/01-features/09b-mirror-peer-group-model.md`](../01-features/09b-mirror-peer-group-model.md)
> **Endpoint contract:** [`spec/31-app/06-endpoints/09b-mirror-peer-group.md`](../06-endpoints/09b-mirror-peer-group.md)
> **LWW rules:** [`spec/31-app/01-features/14-concurrency-and-sync.md`](../01-features/14-concurrency-and-sync.md)

---

## Why this file exists

`01-features/09b-mirror-peer-group-model.md` describes the peer-group model and pins **AT-APP-61** ("detach removes peer; if surviving count = 1, group auto-dissolves"). `06-endpoints/09b-mirror-peer-group.md` describes the `EP-MIRRORS-DETACH` request shape. Neither file describes the **end-to-end detach sequence** of "user clicks Detach → permission check → membership delete → group-dissolve trigger → null-out PeerGroupId → SSE fan-out". Without this flow, AI implementers either (a) skip the auto-dissolve check and leave singleton peer-groups dangling (violates `mem://features/mirroring`), or (b) emit `mirrors.dissolved` SSE before the dissolve trigger COMMITs and produce client-side ghost groups.

This file pins the sequence. Each step cites the SSOT that governs its rule.

---

## Actors

| Actor | Role |
|-------|------|
| User | Clicks "Detach from peer group" on a mirrored item. |
| Client (React) | Sends `POST /api/items/{ItemId}/mirror/detach`. |
| WP REST handler (PHP) | Authorizes, deletes membership, lets DB trigger handle dissolve. |
| App DB (workspace) | Owns `MirrorPeerGroups`, `MirrorPeerGroupMembers`, `Items.PeerGroupId`. |
| Group-dissolve trigger | DB trigger AFTER DELETE on `MirrorPeerGroupMembers` — auto-dissolves singletons. |
| SSE channel | Broadcasts `mirrors.detached` and (optionally) `mirrors.dissolved` to peers. |

---

## Preconditions

- `Auth::hasRole($userId, 'Edit', 'Item', $itemId)` returns true for the peer being detached.
- The item is currently a peer (`Items.PeerGroupId IS NOT NULL` AND a `MirrorPeerGroupMembers` row exists).
- Detaching is independent of share-grants: a viewer with no `Edit` on the *peer* but with `Edit` on a different peer of the same group cannot detach the first peer (per AT-APP-60 — permissions are per-peer, not per-group).

---

## Sequence

```
1. User clicks "Detach" on Item I (a peer of group G).
2. Client → POST /api/items/{I.ItemId}/mirror/detach
3. PHP handler:
     a. Auth::hasRole($userId, 'Edit', 'Item', I.ItemId) → must be true. Else 403.
     b. BEGIN TRANSACTION.
     c. SELECT m.PeerGroupId, m.MemberId
          FROM MirrorPeerGroupMembers m
         WHERE m.ItemId = I.ItemId
         FOR UPDATE.
        If 0 rows → 409 (item is not a peer; nothing to detach).
        groupId = row.PeerGroupId; memberId = row.MemberId.
     d. DELETE FROM MirrorPeerGroupMembers
         WHERE MemberId = memberId.
        (AFTER DELETE trigger fires:
           survivingCount = SELECT count(*) FROM MirrorPeerGroupMembers
                              WHERE PeerGroupId = groupId;
           IF survivingCount = 1 THEN
             SELECT ItemId INTO survivorId
               FROM MirrorPeerGroupMembers
              WHERE PeerGroupId = groupId;
             UPDATE Item SET PeerGroupId = NULL WHERE ItemId = survivorId;
             DELETE FROM MirrorPeerGroups WHERE PeerGroupId = groupId;
             RAISE NOTICE 'group-dissolved' USING DETAIL = groupId::text;
           END IF;
           IF survivingCount = 0 THEN
             DELETE FROM MirrorPeerGroups WHERE PeerGroupId = groupId;
           END IF;)
     e. UPDATE Item SET PeerGroupId = NULL WHERE ItemId = I.ItemId.
        (The detached item is no longer in any group.)
     f. Capture trigger NOTICE messages → groupDissolved = (count > 0).
     g. COMMIT.
4. Server emits SSE on workspace channel:
     - `mirrors.detached` with { itemId: I.ItemId, formerGroupId: groupId }
     - IF groupDissolved → `mirrors.dissolved` with { groupId }
5. Client refreshes:
     - I's UI removes the "peer count" badge.
     - All peer views of G refresh; if dissolved, the surviving peer also drops its badge.
```

> **Single-mutation principle:** Detach is one HTTP call, one transaction, one (or two) SSE events. The dissolve check is a DB trigger, not a separate endpoint, so partial-failure states ("detached but group not dissolved") are physically impossible.

---

## Failure modes

| Failure | HTTP | Recovery |
|---------|------|----------|
| 403 — caller lacks `Edit` on the peer | 403 | Toast: "You don't have permission to detach this item." |
| 409 — item is not a peer | 409 | Client refreshes; UI hides the Detach action if not applicable. |
| 410 — item hard-deleted by reaper mid-request | 410 | Client refreshes view; row removed. |
| Trigger raises (defensive) | 500 | ROLLBACK; user sees generic "Could not detach" toast; engineer investigates. |
| LWW conflict (concurrent detach of same peer) | 409 | Second caller sees "not a peer" because first DELETE removed the row. |
| SSE broadcast fails | (n/a) | 5 s poll fallback per `14-concurrency-and-sync.md` §14.1. |

---

## Idempotency

Detach is naturally idempotent — replaying after success returns 409 ("item is not a peer"), not duplicate side effects. The DB trigger is idempotent because it operates on the *current* membership count, not on the delta. No `X-WorkFlowy-Idempotency-Key` is required.

If the user issues two near-simultaneous detach requests on the *same* peer, the `FOR UPDATE` row lock in step 3c serializes them; the second request observes 0 rows and returns 409 cleanly.

---

## Forbidden in implementations

- ❌ Performing the dissolve check in PHP instead of the DB trigger. Splits the dissolve guarantee across two code paths and creates a TOCTOU window where a concurrent detach could leave a singleton group.
- ❌ Skipping `Items.PeerGroupId = NULL` on the detached item. Leaves a dangling FK pointer to a now-deleted group row (or a still-valid group the item is no longer in).
- ❌ Skipping the `FOR UPDATE` lock in step 3c. Two concurrent detaches could both observe `survivingCount = 2` and both DELETE, dropping to 0 unexpectedly.
- ❌ Emitting `mirrors.detached` SSE before COMMIT.
- ❌ Treating detach as "delete the peer item". The item itself is preserved (with `PeerGroupId = NULL`); only its group membership is removed.
- ❌ Allowing detach when only one peer remains (the auto-dissolve handles this; a separate "dissolve singleton" endpoint is out of scope and not declared in `06-endpoints/`).
- ❌ Returning the dissolved-or-not state in the HTTP response body. The SSE event is the canonical channel for that signal; the HTTP response is `200 { itemId, ok: true }` only.

---

## Acceptance Tests (canonical)

| ID | Canonical | Source | Scenario | Expected |
|----|-----------|--------|----------|----------|
| `AT-WF-DETACH-01` | `AT-APP-60` | This flow | Detach peer P₁; permissions on P₂ remain unchanged | P₂'s `ItemGrants` rows untouched (per-peer, not per-group) |
| `AT-WF-DETACH-02` | `AT-APP-61` | This flow | Detach peer; group drops from 2 → 1 surviving member | DB trigger auto-dissolves group; survivor's `PeerGroupId` set NULL; `MirrorPeerGroups` row deleted |
| `AT-WF-DETACH-03` | `AT-APP-63` | This flow | Soft-delete one peer (not detach); group survives at size ≥2 | Other peers continue to mirror; no dissolve |
| `AT-WF-DETACH-04` | `AT-APP-64` | This flow | Reaper hard-deletes a peer dropping group to 1 | AFTER-DELETE trigger auto-dissolves in same transaction (same trigger as detach) |
| `AT-WF-DETACH-05` | `AT-APP-65` | This flow | Concurrent edit on shared content during detach | LWW: `ServerTs` with `OwnerId` ASC tiebreak; detach does NOT bypass LWW |

> ✅ **Canonical-mapped:** each `AT-WF-DETACH-NN` maps 1:1 to an `AT-APP-NN` row in [`spec/31-app/97-acceptance-criteria.md`](../97-acceptance-criteria.md). Canonical column is authoritative.

---

## Related

- [`09-mirror-create-flow.md`](./09-mirror-create-flow.md) — **inverse path**; create grows a peer group (≥2 members), detach shrinks it; both share the auto-dissolve trigger when membership count would fall to 1
- [`10-migration-execution-flow.md`](./10-migration-execution-flow.md) — bootstrap-time migration that backfills peer groups and runs a one-shot singleton sweep mimicking this flow's auto-dissolve semantics
- [`05-trash-reaper-flow.md`](./05-trash-reaper-flow.md) — reaper triggers the same auto-dissolve trigger on hard-delete
- [`07-sync-replay-flow.md`](./07-sync-replay-flow.md) — offline detach mutations drain via this flow's request shape
- [`../01-features/09b-mirror-peer-group-model.md`](../01-features/09b-mirror-peer-group-model.md) — feature-level SSOT
- [`../01-features/09a-mirror-cycle-detection.md`](../01-features/09a-mirror-cycle-detection.md) — cycle-prevention algorithm (relevant for *create*, not detach)
- [`../06-endpoints/09b-mirror-peer-group.md`](../06-endpoints/09b-mirror-peer-group.md) — endpoint contract (EP-MIRRORS-DETACH, EP-MIRRORS-GROUP-GET)
- [`mem://features/mirroring`](mem://features/mirroring) — peer-group memory note
