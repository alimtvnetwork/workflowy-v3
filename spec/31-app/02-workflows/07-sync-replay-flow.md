# Sync Replay Flow

> **Version:** 1.1.0
> **Created:** 2026-04-27 (UTC+8) — F11 (No-Questions Mode); v1.1.0 added back-link to `09-mirror-create-flow.md` (F25)
> **Status:** Canonical — cross-feature flow
> **Parent:** [`00-overview.md`](./00-overview.md)
> **SSOT for the underlying feature:** [`spec/31-app/01-features/14b-offline-queue.md`](../01-features/14b-offline-queue.md)
> **Endpoint contract:** [`spec/31-app/06-endpoints/14b-sync-replay.md`](../06-endpoints/14b-sync-replay.md)
> **LWW rules:** [`spec/31-app/01-features/14-concurrency-and-sync.md`](../01-features/14-concurrency-and-sync.md)

---

## Why this file exists

`01-features/14b-offline-queue.md` describes the FIFO queue and LWW reconciliation. `06-endpoints/14b-sync-replay.md` describes the `EP-SYNC-REPLAY` request/response shape. Neither file describes the **end-to-end reconnect sequence** of "browser fires `online` → drain head → server stamps `ServerTs` → LWW resolution → SSE fan-out → local mirror reconciles". Without this flow, AI implementers either (a) drain in parallel (loses FIFO ordering and breaks AT-APP-99), or (b) ignore server rejections and let the local mirror diverge silently from canonical state.

This file pins the sequence. Each step cites the SSOT that governs its rule.

---

## Actors

| Actor | Role |
|-------|------|
| Browser | Fires `online` event; persists queue across restarts (IndexedDB). |
| Client (React) | Owns the FIFO queue; drains head sequentially; reverts on rejection. |
| WP REST handler (PHP) | Validates each mutation, stamps `ServerTs`, applies LWW, broadcasts SSE. |
| App DB (workspace) | Owns canonical state; LWW writes guarded by `*UpdatedAt < serverNow`. |
| SSE channel | Fans out accepted mutations to all peers (including the originating session). |
| Local mirror (IndexedDB) | Holds optimistic state; reverts rejected mutations; reconciles SSE deltas. |

---

## Preconditions

- The local mirror is initialized (`AT-APP-97`).
- The queue has ≥1 pending mutation (`AT-APP-98`); idle reconnects are no-ops.
- `navigator.onLine === true` AND the auth session is still valid (refresh token has not expired during offline period).
- No prior drain is in flight (drain is single-threaded per session — enforced by client-side mutex).

---

## Sequence

```
1. Browser fires `online` → client checks queue length.
   If 0 → reconnect SSE only; skip drain.
2. Client acquires drain mutex. (Single concurrent drain per session.)
3. LOOP while queue is non-empty:
     a. head = queue.peek()
     b. POST /api/sync/replay
          body: {
            clientMutationId: head.id,         -- uuid set at enqueue time
            op: head.op,                        -- 'item.update' | 'item.create' | etc.
            payload: head.payload,              -- normalised mutation
            clientTs: head.clientTs,            -- monotonic local ts at enqueue
            baseVersion: head.baseVersion       -- ServerTs the client believed was current
          }
     c. PHP handler:
          i.   Auth::isAuthenticated($userId) — else 401, halt drain.
          ii.  Lookup ProcessedMutations(clientMutationId).
               If found → return cached response (idempotent replay; AT-APP-98).
          iii. BEGIN TRANSACTION.
          iv.  Apply mutation per op kind:
                 - item.update:
                     UPDATE Item
                        SET <field> = $payload.<field>,
                            <field>UpdatedAt = serverNow,
                            <field>UpdatedBy = $userId
                      WHERE ItemId = $payload.itemId
                        AND <field>UpdatedAt < serverNow.   -- LWW guard, AT-APP-100
                     If 0 rows → mutation LOST LWW (newer concurrent write wins).
                     Response: { status: 'lww-lost', winnerTs: <current> }.
                 - item.create:
                     INSERT ... RETURNING ServerTs.
                 - item.delete:
                     UPDATE Item SET DeletedAt = serverNow ... (LWW guarded).
          v.   INSERT INTO ProcessedMutations (ClientMutationId, ResponseJson, ServerTs).
          vi.  COMMIT.
          vii. Emit SSE on workspace channel: `item-updated` | `item-created` | etc.
          viii. Return { status: 'accepted', serverTs }
                  OR  { status: 'lww-lost', winnerTs }
                  OR  { status: 'rejected', reason: <validation|410|409> }.
     d. Client handles response:
          - accepted:   queue.dequeue(); local mirror updates baseVersion = serverTs.
          - lww-lost:   queue.dequeue(); local mirror reverts to winnerTs payload (the SSE will arrive with full state).
          - rejected:   queue.dequeue(); local mirror reverts; client surfaces non-blocking toast (AT-APP-101).
          - 401/5xx:    DO NOT dequeue; release mutex; retry on next online tick.
4. After drain:
     - Reconnect SSE channel (if disconnected).
     - Process any SSE deltas that arrived during drain (these may include
       this session's own broadcasts, which the client de-dupes by clientMutationId).
     - Release drain mutex.
```

> **Why strict FIFO matters:** Reordering creates causality violations. Example: enqueued [create child C of P, rename P]. Replaying rename first would create P at a new title, then create C as a child of the wrong-titled P. AT-APP-99 mandates strict insertion order; the client mutex enforces this.

---

## Failure modes

| Failure | HTTP | Recovery |
|---------|------|----------|
| 401 — session expired during offline period | 401 | Client surfaces login modal; queue persists; resumes after re-auth. |
| 410 — referenced item hard-deleted by reaper | 410 | Client treats as `rejected`; mutation reverted; user sees toast "Item no longer exists". |
| 409 — referent constraint (e.g. cycle on mirror) | 409 | Client treats as `rejected`; mutation reverted; toast. |
| LWW lost (server has newer write) | 200 + `lww-lost` | Local mirror reverts to server payload; user sees their edit "snap back". |
| Network drops mid-drain | (n/a) | Mutex held; on next `online` event, the in-flight head is re-POSTed (idempotent via `ProcessedMutations`). |
| `ProcessedMutations` race (concurrent retry) | 200 + cached | Second POST returns the original response unchanged. |
| Browser restart with non-empty queue | (n/a) | IndexedDB persisted queue resumes drain on next `online` event (AT-APP-102). |
| SSE reconnect lag | (n/a) | Client polls every 5 s as fallback per `14-concurrency-and-sync.md` §14.1. |

---

## Idempotency

`EP-SYNC-REPLAY` is idempotent via `ClientMutationId`. The `ProcessedMutations` table caches the original response; replays return the cached response without re-executing the mutation. This is essential because network drops during the request/response cycle make double-delivery the norm, not the exception.

`ProcessedMutations` rows are pruned by a separate sweeper (out of scope here) at `INTERVAL '7 days'` to bound table growth — well past any realistic offline window.

---

## Forbidden in implementations

- ❌ Parallel drain (multiple concurrent `POST /sync/replay` from the same client). Breaks FIFO and corrupts cross-mutation causality. Use a client-side mutex.
- ❌ Dequeuing on 5xx or network error. The mutation MUST stay at the head until the server confirms acceptance OR rejection (per AT-APP-100 FIFO contract).
- ❌ Skipping the LWW guard (`<field>UpdatedAt < serverNow`). Older offline edits would clobber newer online edits.
- ❌ Emitting SSE before `ProcessedMutations` insert + COMMIT. The SSE may otherwise arrive at peers before the mutation is durable.
- ❌ Ignoring `lww-lost` responses. The local mirror MUST revert; otherwise the optimistic state diverges silently (per AT-APP-100 LWW reversion).
- ❌ Using wall-clock `clientTs` for LWW. `ServerTs` is canonical (AT-APP-100). `clientTs` is for diagnostic telemetry only.
- ❌ Storing the queue in `localStorage`. `localStorage` is synchronous and capped at 5 MB; a long offline period will overflow. Use IndexedDB (AT-APP-102).

---

## Acceptance Tests (canonical)

| ID | Canonical | Source | Scenario | Expected |
|----|-----------|--------|----------|----------|
| `AT-WF-REPLAY-01` | `AT-APP-97` | This flow | App loads with no network | Local mirror serves all CRUD reads; UI never shows blank state |
| `AT-WF-REPLAY-02` | `AT-APP-98` | This flow | Offline edit while disconnected | Mutation appended to queue; local mirror updated optimistically; UI never blocks |
| `AT-WF-REPLAY-03` | `AT-APP-99` | This flow | Reconnect with 3 queued mutations [A, B, C] | Server receives them in order A, B, C; SSE fans out in order |
| `AT-WF-REPLAY-04` | `AT-APP-100` | This flow | Offline edit collides with newer online edit on same field | LWW: server's newer `ServerTs` wins; client mutation marked `lww-lost`; mirror reverts |
| `AT-WF-REPLAY-05` | `AT-APP-101` | This flow | Server rejects mutation (validation 400) | Mirror reverts; user sees non-blocking toast |
| `AT-WF-REPLAY-06` | `AT-APP-102` | This flow | Browser restart with non-empty queue | IndexedDB-persisted queue resumes drain on next `online` event |

> ✅ **Canonical-mapped:** each `AT-WF-REPLAY-NN` maps 1:1 to an `AT-APP-NN` row in [`spec/31-app/97-acceptance-criteria.md`](../97-acceptance-criteria.md). Canonical column is authoritative.

---

## Related

- [`05-trash-reaper-flow.md`](./05-trash-reaper-flow.md) — reaper-deleted items return 410 to in-flight queued mutations
- [`06-search-query-flow.md`](./06-search-query-flow.md) — search served from local mirror while offline
- [`08-mirror-detach-flow.md`](./08-mirror-detach-flow.md) — detach mutations also drain through this flow
- [`09-mirror-create-flow.md`](./09-mirror-create-flow.md) — offline mirror-create mutations queue here and replay through the same FIFO drain on reconnect
- [`../01-features/14b-offline-queue.md`](../01-features/14b-offline-queue.md) — feature-level SSOT
- [`../01-features/14-concurrency-and-sync.md`](../01-features/14-concurrency-and-sync.md) — LWW formal model
- [`../06-endpoints/14b-sync-replay.md`](../06-endpoints/14b-sync-replay.md) — endpoint contract (EP-SYNC-REPLAY)
