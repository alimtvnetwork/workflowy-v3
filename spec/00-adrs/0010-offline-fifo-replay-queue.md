# ADR-0010: Offline FIFO replay queue + server-stamped LWW reconciliation

## Status

`Accepted` — 2026-04-28

## Context

WorkFlowy guarantees full CRUD offline against a complete local mirror
of the user's account. The bridge between offline mutation and
canonical server state is a **single client-side queue** that drains on
reconnect. Three load-bearing properties of this queue determine
whether the local mirror can converge with the server without data
loss or causality violations:

1. **Ordering** — strict FIFO by client-assigned `LocalSeq`.
2. **Durability** — survives tab close, OS crash, and long offline
   windows.
3. **Conflict resolution** — server-stamped `ServerTs` field-level LWW
   on replay, with a deterministic tiebreak (per ADR-0005:
   `OwnerId` ASC on identical `ServerTs`).

These properties are currently anchored only in:

- **Memory** — `mem://features/offline-resilience` (single source for
  the AI agent).
- **Feature SSOT** — `spec/31-app/01-features/14b-offline-queue.md`,
  `spec/31-app/01-features/14-concurrency-and-sync.md`.
- **Workflow** — `spec/31-app/02-workflows/07-sync-replay-flow.md`
  (end-to-end reconnect sequence with the client mutex,
  `ProcessedMutation` idempotency table, and `<field>UpdatedAt <
  serverNow` LWW guard).
- **ADR-0005** — cites the queue as load-bearing for mirror peer-group
  LWW but does not define it.

Without an ADR anchor, an AI generating offline code could legitimately:

- Drain the queue in parallel (`Promise.all` over pending mutations),
  destroying causality.
- Use LIFO, last-write-wins by `clientTs`, or "freshest first"
  ordering.
- Store the queue in `localStorage` (5 MB cap, synchronous) instead of
  IndexedDB.
- Skip the LWW guard and let stale offline edits clobber newer online
  edits.
- Re-execute mutations on retry instead of returning the cached
  `ProcessedMutation` response (breaking idempotency under the
  unavoidable double-delivery condition of mobile networks).

P57 closes this gap and discharges the forward-reference from ADR-0005.

## Decision

### D1 — Single client-side FIFO queue keyed by `LocalSeq`

There MUST be exactly **one** offline mutation queue per client (gate G-14-QUEUE-FIFO-LOCALSEQ)
session. Every mutation produced while offline (or while online but
before the previous mutation has been acknowledged) MUST be appended (gate G-14-QUEUE-FIFO-LOCALSEQ)
with a monotonically increasing `LocalSeq` integer assigned client-side.

Replay MUST drain the queue **strictly in `LocalSeq` order**. Parallel (gate G-14-QUEUE-FIFO-LOCALSEQ)
drain (concurrent `POST /sync/replay` requests from the same client)
is **forbidden** — a client-side mutex MUST serialise drains (gate G-14-QUEUE-FIFO-LOCALSEQ).

### D2 — IndexedDB durability, never `localStorage`

The queue MUST be persisted in **IndexedDB**. `localStorage`, (gate G-14-QUEUE-FIFO-LOCALSEQ)
`sessionStorage`, in-memory state, and cookies are forbidden as the
queue's primary store. Rationale: `localStorage` is synchronous and
capped at ~5 MB; a long offline window or a bulk paste will overflow
silently and lose mutations.

The queue MUST survive (gate G-14-QUEUE-FIFO-LOCALSEQ):

- Tab close and reopen.
- Browser process crash and OS reboot.
- Auth-session expiry (per D5, the queue persists across re-auth).

### D3 — Server-stamped `ServerTs` is the only LWW clock

Field-level LWW comparisons MUST use **`ServerTs`** (the server's (gate G-14-QUEUE-FIFO-LOCALSEQ)
clock at the moment the mutation is applied), never the client's
wall-clock `clientTs`. The server applies the LWW guard:

```sql
UPDATE Item
   SET <field> = $value,
       <field>UpdatedAt = serverNow,
       <field>UpdatedBy = $userId
 WHERE ItemId = $id
   AND <field>UpdatedAt < serverNow;
```

If the `UPDATE` affects 0 rows, the mutation **lost LWW** (a newer
concurrent write exists). The server returns HTTP 200 with
`lww-lost` in the per-mutation result; the client reverts the
optimistic local state to the server payload.

Tiebreak on identical `ServerTs` is governed by **ADR-0026** (canonical 3-tier comparator: `ServerTs DESC, OwnerId ASC, ItemId ASC`). The earlier prose "`OwnerId` ASC, per ADR-0005" is preserved here for historical context but the load-bearing rule now lives in ADR-0026 D1 with gate `G-26-LWW-CANONICAL-COMPARATOR`.

`clientTs` MAY be carried in mutation payloads for diagnostic
telemetry only; it MUST NOT participate in any LWW decision.

### D4 — Idempotent replay via `ClientMutationId` + `ProcessedMutation`

Every mutation MUST carry a client-generated `ClientMutationId` (gate G-26-LWW-CANONICAL-COMPARATOR)
(globally unique within the client session). The server MUST persist (gate G-26-LWW-CANONICAL-COMPARATOR)
the original response in `ProcessedMutation(ClientMutationId, Response,
ProcessedAt)`. On replay of the same `ClientMutationId`, the server
MUST return the cached `Response` **without re-executing** the (gate G-26-LWW-CANONICAL-COMPARATOR)
mutation.

`ProcessedMutation` rows MUST be pruned by a separate sweeper at (gate G-26-LWW-CANONICAL-COMPARATOR)
`INTERVAL '7 days'` (well past any realistic offline window).

Rationale: network drops during the request/response cycle make
double-delivery the norm, not the exception. Without idempotency, every
flaky-network mutation risks duplicate side effects.

### D5 — Conflict UX is silent; no rejection of stale ops

The user MUST NOT be prompted to resolve conflicts. A mutation that (gate G-26-LWW-CANONICAL-COMPARATOR)
loses LWW triggers the standard *"Restored remote change"* banner
(per `14-concurrency-and-sync.md` §14.2) and the local mirror reverts
to the server payload. Stale ops are NEVER rejected outright at the
queue level — they are accepted, applied under the LWW guard, and
silently lose if a newer write exists.

### D6 — Queue is decoupled from the 250-item view cap

The 250-item view cap from ADR-0008 D4 is a **render-time** budget. It
MUST NOT constrain the local mirror's size, the queue's depth, or any (gate G-26-LWW-CANONICAL-COMPARATOR)
offline operation. The local mirror holds the user's entire account;
the queue holds every pending mutation regardless of which view it
targets.

### D7 — Out of scope (v1)

Deferred (require a superseding ADR before introduction):

- Multi-device queue merging (today the queue is per-session; logging
  in on a second device opens an independent queue).
- User-visible "pending mutation" inspector / replay-pause control.
- CRDT or operational-transform conflict resolution (LWW is the only
  resolver in v1).
- Encrypted-at-rest queue payloads in IndexedDB.

## Algorithms (Normative Pseudocode)

> Gate `G-14-REPLAY-PSEUDOCODE-PARITY` — every client implementation
> (TS frontend, future ports) MUST produce byte-identical observable
> behaviour for the canonical fixture vectors below. Server-side replay
> handlers MUST honour the matching contracts (idempotency cache,
> LWW guard, FIFO acknowledgement order). Tested against
> `spec/31-app/97a-acceptance-criteria-fixtures.md` §FIFO-Replay.

**Type contract.**
- `Mutation = { LocalSeq: int, ClientMutationId: string, Op: string, Payload: object, ClientTs: string, EnqueuedAt: string }`
- `ReplayResult = { ClientMutationId: string, Status: 'applied'|'lww-lost'|'conflict'|'idempotent-replay', ServerTs?: string, ServerPayload?: object }`
- `IDB store: 'mutationQueue'` keyed by `LocalSeq` (autoIncrement); secondary index on `ClientMutationId` for dedup-on-enqueue.
- `clientMutex: Mutex` — process-wide singleton; `tryDrain` is the only acquirer.

### C1 — `enqueue(op: string, payload: object) -> Mutation`  (D1, D2)

```
# Called from every action layer write. Single IDB tx; never throws on success.
mutation = {
    LocalSeq: <auto-assigned by IDB autoIncrement>,
    ClientMutationId: uuidv7(),               # globally unique within session
    Op: op,
    Payload: payload,
    ClientTs: ISO8601(now()),                 # diagnostic only — D3 forbids LWW use
    EnqueuedAt: ISO8601(now()),
}
BEGIN IDB TX (readwrite, ['mutationQueue', 'localMirror'])
    # Optimistic local apply MUST happen in the SAME tx as queue append (ADR-0023).
    applyToLocalMirror(op, payload)
    queueStore.add(mutation)                  # autoIncrement assigns LocalSeq
COMMIT
schedule(tryDrain)                            # async; mutex-guarded
return mutation
```

### C2 — `tryDrain() -> void`  (D1: serialised by client mutex)

```
if not clientMutex.tryAcquire():
    return                                    # another drain in flight; D1 forbids parallel
try:
    while online():
        head = queueStore.getFirst()          # ORDER BY LocalSeq ASC LIMIT 1
        if head is None:
            return                            # queue drained
        result = drainOne(head)               # see C3
        if result == 'retry-later':
            scheduleRetry(backoff)            # network blip; do NOT pop
            return
        # result in {'acked', 'lww-lost', 'idempotent-replay'} → pop and continue
        queueStore.delete(head.LocalSeq)
finally:
    clientMutex.release()
```

### C3 — `drainOne(m: Mutation) -> 'acked'|'retry-later'|'lww-lost'|'idempotent-replay'`

```
# One-mutation HTTP round-trip. Server-side contract per D3+D4.
try:
    response = POST('/sync/replay', body={
        ClientMutationId: m.ClientMutationId,
        Op: m.Op,
        Payload: m.Payload,
    }, timeout=30s)
except NetworkError:
    return 'retry-later'                      # D2: durability — mutation stays in IDB

# HTTP 200 always; per-mutation Status drives client behaviour.
if response.Status == 'idempotent-replay':
    # D4: server returned cached ProcessedMutation.Response.
    reconcileLocalMirror(response.ServerPayload)
    return 'idempotent-replay'
if response.Status == 'lww-lost':
    # D5: silent revert + "Restored remote change" banner.
    revertOptimisticApply(m)
    reconcileLocalMirror(response.ServerPayload)
    showBanner('restored-remote-change')
    return 'lww-lost'
if response.Status == 'applied':
    reconcileLocalMirror(response.ServerPayload)   # ServerTs now authoritative
    return 'acked'
raise UnknownReplayStatus(response.Status)    # routed to AppErrorBoundary (ADR-0017)
```

### C4 — Server `/sync/replay` handler (D3, D4)  — PHP/SQL pseudocode

```
# Step 1: idempotency cache lookup (D4).
cached = SELECT Response FROM ProcessedMutation WHERE ClientMutationId = :cmid
if cached is not None:
    return { Status: 'idempotent-replay', ...cached.Response }

# Step 2: LWW guard apply (D3). Field-level UPDATE with `<field>UpdatedAt < serverNow`.
serverNow = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
BEGIN TRANSACTION
    affected = UPDATE Item
                  SET <field> = :value,
                      <field>UpdatedAt = :serverNow,
                      <field>UpdatedBy = :userId
                WHERE ItemId = :id
                  AND (<field>UpdatedAt IS NULL OR <field>UpdatedAt < :serverNow)
    if affected == 0:
        # Lost LWW. Re-read the winning row; cache the lost-result for idempotency.
        winning = SELECT * FROM Item WHERE ItemId = :id
        response = { Status: 'lww-lost', ServerPayload: winning, ServerTs: serverNow }
    else:
        winning = SELECT * FROM Item WHERE ItemId = :id
        response = { Status: 'applied',  ServerPayload: winning, ServerTs: serverNow }
    INSERT INTO ProcessedMutation (ClientMutationId, Response, ProcessedAt)
        VALUES (:cmid, :response_json, :serverNow)
COMMIT
return response
```

### C5 — `ProcessedMutation` sweeper (D4 retention)

```
# Cron / WP-cron; runs every 6h. Bounded write volume.
DELETE FROM ProcessedMutation
 WHERE ProcessedAt < datetime('now', '-7 days')
```

### Canonical fixture vectors (parity test)

Each scenario lists the queued `LocalSeq` order, the server response per
mutation, and the asserted post-drain state. Failure of any row fails
`G-14-REPLAY-PSEUDOCODE-PARITY`.

| # | Scenario | Inputs | Expected drain order & results |
|---|---|---|---|
| 1 | **Strict FIFO under causality** | LocalSeq=1 `createChild(P, C)`, LocalSeq=2 `rename(P, "P2")` | Drain in 1→2 order; both `Status='applied'`; final `Item(C).ParentId=P`, `Item(P).Title='P2'`. Reordering forbidden. |
| 2 | **Network blip mid-drain** | LocalSeq=1 succeeds; LocalSeq=2 throws `NetworkError` | C2 returns; LocalSeq=2 stays in IDB; `tryDrain` retried after backoff replays from LocalSeq=2 only. |
| 3 | **Double-delivery (idempotency)** | LocalSeq=1 sent twice with same `ClientMutationId` | First call: `Status='applied'`. Second call: `Status='idempotent-replay'` with cached `ServerPayload`; no second `UPDATE` fires. |
| 4 | **LWW loss** | Offline edit `Title="A"` at ClientTs=T0; concurrent online edit `Title="B"` at ServerTs=T1>T0 already applied | Replay: `Status='lww-lost'`, banner shown, local mirror reverts to `Title="B"`. `affected=0` in SQL. |
| 5 | **Triple-tie raise (with ADR-0026)** | Two mutations with identical `ServerTs`, `OwnerId`, and `ItemId` reach the comparator | Server raises `LwwTripleTieError` → routed to AppErrorBoundary; mutation NOT marked applied; sweeper does NOT cache the raise. |
| 6 | **Crash mid-tx (durability)** | `enqueue()` IDB tx commits; tab killed before `tryDrain` runs | On reopen, `mutationQueue` still contains LocalSeq=N; `tryDrain` resumes from head. No mutation lost. |
| 7 | **Stale op accepted, not rejected** | LocalSeq=1 carries a 7-day-old `ClientTs`; server's row is fresher | Server still applies LWW guard; result is `lww-lost` (D5: stale ops never rejected at queue level). |

**Negative-test obligations (gate `G-14-REPLAY-NEGATIVE-TESTS`).**
Implementations MUST also assert: (a) `clientTs` field on the wire is
ignored by the LWW guard — server-side comparator MUST reject any code
path that compares `clientTs` (D3 enforcement, mirrors
`G-26-LWW-NO-CLIENT-TS`); (b) parallel `POST /sync/replay` from the same
session MUST be rejected by the client mutex BEFORE hitting the network
(D1 enforcement); (c) `localStorage.setItem('mutationQueue', ...)`
appears nowhere in client source (D2 enforcement, regex CI fail).

## Consequences

### Positive

- **Causality preserved.** Strict FIFO + client mutex guarantees the
  example in `07-sync-replay-flow.md` §"Why strict FIFO matters"
  (`[create C of P, rename P]` cannot reorder into `[rename P,
  create C of wrong-titled P]`).
- **No data loss across crashes.** IndexedDB persistence + server-side
  `ProcessedMutation` idempotency together guarantee at-least-once
  delivery on the wire and exactly-once application at the canonical
  store.
- **ADR-0005 LWW deferral closed.** The mirror peer-group LWW rule
  now has a concrete, ratified queue + clock contract underneath it.
- **Predictable conflict UX.** Silent LWW + "restored remote change"
  banner removes the prompt-fatigue failure mode of multi-device
  editing.

### Negative

- **No multi-device merge.** A user editing on phone + laptop while
  both are offline will have two independent queues; whichever drains
  second wins per-field via LWW. D7 leaves the door open for a future
  ADR to merge them.
- **`ProcessedMutation` table grows.** Bounded at 7 days by the
  sweeper (D4), but adds steady write volume. Acceptable cost for
  exactly-once semantics.


**Spec impact** — Downstream sections affected by this decision: [`spec/31-app/ (offline queue)`](../31-app/).

## Alternatives Considered

1. **CRDT (e.g. Yjs / Automerge) instead of LWW** — rejected:
   adds a 30–80 KB runtime to every page, requires every server
   handler to merge structured CRDT deltas instead of plain field
   updates, and breaks the simple `<field>UpdatedAt < serverNow`
   guard that the entire spec is built around. LWW is sufficient
   because mutations are field-grained and the silent "restored
   remote change" banner mitigates the rare lossy case.
2. **Per-mutation independent retry (no FIFO mutex)** — rejected:
   destroys causality (see the `[create C of P, rename P]` example).
   The cost of a mutex is one extra await per drain; the cost of
   reordered causality is unrecoverable structural corruption.
3. **`localStorage` queue with manual chunking** — rejected: the
   5 MB hard cap is reachable in a single bulk paste of a large
   outline; chunking adds complexity without removing the cap.
   IndexedDB is the only browser primitive sized for the workload.

## Gates Touched

- `G-14-QUEUE-FIFO-LOCALSEQ` — enforces D1 (strict `LocalSeq` order,
  client-side mutex, no parallel drain).
- `G-14-QUEUE-INDEXEDDB-ONLY` — enforces D2 (no `localStorage` /
  `sessionStorage` / in-memory queue).
- `G-14-LWW-SERVERTS-CANONICAL` — enforces D3 (`ServerTs` is the only
  LWW clock; `<field>UpdatedAt < serverNow` guard mandatory).
- `G-14-REPLAY-IDEMPOTENT-CMID` — enforces D4 (`ClientMutationId` +
  `ProcessedMutation` cache; 7-day sweeper).
- `G-14-CONFLICT-UX-SILENT` — enforces D5 (no prompts; "restored
  remote change" banner only).
- `G-14-QUEUE-INDEPENDENT-OF-VIEW-CAP` — enforces D6 (queue + local
  mirror MUST NOT be bounded by the 250-item render cap).

All six gates are formally **anchored** by this ADR. Their enforcement
contracts live in `spec/31-app/01-features/14b-offline-queue.md`,
`spec/31-app/01-features/14-concurrency-and-sync.md`,
`spec/31-app/02-workflows/07-sync-replay-flow.md`, and
`spec/35-enforcement-rules/`.

## Supersedes / Superseded-By

- **Supersedes:** (none — closes the queue/LWW deferral implicit in
  ADR-0005's "load-bearing for mirror peer-group LWW" reference).
- **Superseded-By:** (none).
