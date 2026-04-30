# ADR-0021: Undo/redo capacity (100 actions, in-memory) + offline queue is unbounded (per ADR-0010 SSOT)

## Status

`Accepted` — 2026-04-28

## Context

Two capacity rules sit in `mem://features/editor-core` line 7 as
"100-action undo/redo stack" and "500-action offline local queue
(localStorage)". Neither is ratified by ADR, and the second
**directly contradicts** the authoritative SSOT
(`spec/31-app/01-features/14b-offline-queue.md` line 40 + AT-OQ-05)
and ADR-0010 in three ways:

1. The SSOT mandates a **full local mirror** (entire account cached
   locally, FIFO queue drained sequentially); the 500-action cap
   would silently drop user mutations after the 501st offline edit
   — exactly the data-loss failure mode ADR-0010 exists to prevent.
2. The SSOT pins durable storage; ADR-0010 names IndexedDB as the
   FIFO queue substrate. `localStorage` (per the stale memory line)
   is a 5–10 MB synchronous store unsuitable for the durability +
   capacity contract.
3. AT-APP-97..102 (offline queue ATs registered in
   `00-overview-condensed.md`) test unbounded behaviour; a 500-cap
   would fail those ATs on day one.

Without an ADR, an AI implementer reading the memory rule will ship
a `localStorage`-backed 500-entry ring buffer that violates
ADR-0010, the SSOT, and seven ATs. The undo cap has no such
contradiction — it is purely an in-memory editor concern — but it
also lacks ratification.

## Decision

**D1 — Undo / redo stack: 100 actions, in-memory, per-tab.**
- Maximum stack depth: **100 actions** for both undo and redo
  legs (200 entries total at peak).
- Storage: in-memory only (React/Zustand state); MUST NOT persist (gate G-25-UNDO-CAP-100)
  across reloads.
- Granularity: one entry per atomic user action (text edit
  debounced at 500ms idle, structural move, completion toggle,
  bulk operation, etc.); see `mem://features/editor-core` for
  the action-classification rules.
- Overflow policy: FIFO eviction — when a 101st action is
  pushed, the oldest entry is dropped silently.
- Scope: per-browser-tab. Two tabs of the same account MUST NOT (gate G-25-UNDO-CAP-100)
  share an undo stack (avoids cross-tab undo of edits the user
  cannot see).
- Redo invalidation: any new action MUST clear the redo stack (gate G-25-UNDO-CAP-100)
  (standard editor semantics).

**D2 — Offline mutation queue: unbounded; full-mirror, durable.**
The "500-action offline local queue" rule in
`mem://features/editor-core` is **superseded** and MUST be (gate G-25-UNDO-CAP-100)
removed.
- Capacity: **unbounded** in spec; bounded only by the IndexedDB
  storage quota of the user's browser (typically hundreds of MB).
- Storage substrate: **IndexedDB** per ADR-0010, with a single
  ordered store keyed by client-generated monotonic
  `LocalSeq: number` (FIFO ordering invariant).
- Persistence: MUST survive tab close, OS crash, and browser (gate G-25-UNDO-CAP-100)
  process restart (IndexedDB durability default).
- `localStorage` MUST NOT be used as the queue substrate (gate G-25-UNDO-CAP-100)
  (5–10 MB synchronous limit, no transactional semantics).
- Eviction: there is no eviction. If IndexedDB quota is exceeded
  (`QuotaExceededError`), the client MUST surface a hard error (gate G-25-UNDO-CAP-100)
  banner ("Local storage full — reconnect to sync, or free space")
  and pause further mutations until either reconnect drains the
  queue or the user clears storage. Silent drop is forbidden.

**D3 — Undo ↔ queue relationship.** The undo stack and the offline
queue are **independent layers**:
- Undo represents user intent ("revert my last action"); it
  composes / decomposes actions for editor ergonomics.
- The offline queue represents server intent ("apply this
  mutation when reconnected"); it is purely additive and is
  drained by reconnect, not by undo.
- An undo MUST enqueue a new compensating mutation onto the (gate G-25-UNDO-CAP-100)
  offline queue (not pop the original). This guarantees the
  server sees the same operational sequence the user
  performed locally.

**D4 — Redo across reload.** Because D1 mandates in-memory undo,
reloading the tab clears both undo and redo stacks. The user's
data is preserved (queue + server) but the action history is
not. This is intentional — persisting undo across reloads opens
a stale-redo class of bugs (redoing a mutation against state
the server has since modified) that field-level LWW
(per ADR-0010) cannot cleanly resolve.

**D5 — Quota guidance.** Implementations SHOULD track IndexedDB
usage via the `navigator.storage.estimate()` API and surface a
soft-warning banner at **80%** quota usage so users have
runway to reconnect before hitting D2's hard error. The 80%
threshold is implementation guidance, not a gate.

**D6 — Memory rule correction.** `mem://features/editor-core`
line 7 currently reads "100-action undo/redo stack. 500-action
offline local queue (localStorage) with automatic replay and
conflict resolution." This MUST be rewritten to reflect D1 + D2 (gate G-25-UNDO-CAP-100):
undo cap 100 (in-memory, per-tab); offline queue unbounded
(IndexedDB per ADR-0010, no `localStorage`).

## Algorithms (Normative Pseudocode)

> Gate `G-25-UNDO-PSEUDOCODE-PARITY` — every TS implementation (and any
> future port) MUST produce byte-identical observable behaviour for the
> canonical fixture vectors below. Tested against
> `spec/31-app/97a-acceptance-criteria-fixtures.md` §Undo.

**Type contract.**
- `UndoEntry = { Id: string, Op: string, Inverse: object, EnqueuedClientMutationId?: string, Ts: string }`
- `UndoState = { undo: UndoEntry[], redo: UndoEntry[] }` — both stacks held in tab-scoped React/Zustand state. No persistence (D1).
- `UNDO_CAP = 100` — hard constant; gate `G-25-UNDO-CAP-100` regex-fails any local override.
- All operations are synchronous in-memory mutations; no I/O.

### U1 — `pushAction(state, entry) -> state`  (D1 + D3 redo invalidation)

```
# Called after every atomic user action — text edit (debounced 500ms),
# structural move, completion toggle, bulk op, etc.

# Step 1: redo invalidation (D1 last bullet — "any new action MUST clear redo").
state.redo = []                               # gate G-25-UNDO-CAP-100

# Step 2: append to undo head.
state.undo.push(entry)

# Step 3: FIFO eviction at cap (D1: "101st action drops the oldest").
while len(state.undo) > UNDO_CAP:
    state.undo.shift()                        # drop OLDEST (head); silent per D1

return state
```

### U2 — `undo(state) -> { state, compensating: Mutation | None }`  (D3)

```
# User pressed Ctrl/Cmd+Z. Pops undo head, pushes onto redo, emits compensating mutation.
if len(state.undo) == 0:
    return { state, compensating: None }      # nothing to undo; UI no-op

entry = state.undo.pop()
state.redo.push(entry)                        # redo grows from undo's pop

# D3: undo MUST enqueue a compensating mutation onto the offline queue
# — it does NOT mutate or pop the original from the queue.
compensating = buildMutationFromInverse(entry.Inverse)
return { state, compensating }
```

### U3 — `redo(state) -> { state, replay: Mutation | None }`  (D1, D4)

```
# User pressed Ctrl/Cmd+Shift+Z. Pops redo head, pushes back onto undo.
if len(state.redo) == 0:
    return { state, replay: None }            # nothing to redo

entry = state.redo.pop()
state.undo.push(entry)
# Cap re-applies on undo growth; redo never grows past UNDO_CAP either
# because it can only ever hold what was previously in undo (≤ UNDO_CAP).
while len(state.undo) > UNDO_CAP:
    state.undo.shift()

replay = buildMutationFromOp(entry.Op)        # re-emit the original mutation
return { state, replay }
```

### U4 — `onTabReload() -> UndoState`  (D1, D4)

```
# Reload kills all history per D1 ("MUST NOT persist across reloads") and
# D4 (stale-redo bug class). Data is preserved (queue + server); history is not.
return { undo: [], redo: [] }
# Implementation: do NOT subscribe to localStorage / IndexedDB / sessionStorage
# for any 'undo' or 'redo' key. Gate G-25-UNDO-IN-MEMORY-ONLY enforces.
```

### U5 — `enqueueOfflineMutation(queueDb, mutation)`  (D2 — quota-aware, no silent drop)

```
# Bridges D2 (unbounded queue + hard-error on quota) with D5 (80% soft warning).
# This procedure is called by every action layer write (per ADR-0023 same-tx contract)
# and by U2's compensating mutation emission.

try:
    BEGIN IDB TX (readwrite, ['mutationQueue'])
        queueDb.mutationQueue.add(mutation)   # autoIncrement assigns LocalSeq (ADR-0010 C1)
    COMMIT
except QuotaExceededError as err:
    # D2: silent drop FORBIDDEN. Surface hard error banner; pause further mutations.
    showHardErrorBanner('Local storage full — reconnect to sync, or free space')
    pauseFurtherMutations()                   # gate G-25-QUEUE-NO-SILENT-DROP
    raise                                     # propagate so the action-layer rolls back
    # NOTE: do NOT shrink the queue, do NOT drop oldest, do NOT switch to localStorage.

# D5 soft warning (implementation guidance, not a gate).
estimate = await navigator.storage.estimate()
if estimate.usage / estimate.quota >= 0.80:
    showSoftWarningBanner('Local storage 80% full — reconnect soon')
```

### U6 — Cross-tab isolation (D1 — per-tab scope)

```
# Forbidden wiring (gate G-25-UNDO-PER-TAB):
#   ✗ new BroadcastChannel('undo')
#   ✗ new SharedWorker(...) for undo state
#   ✗ window.addEventListener('storage', ...) coupling undo across tabs
#
# Required wiring: undo state lives ONLY in the per-tab Zustand store.
# Two tabs of the same account hold two independent UndoState instances.
```

### Canonical fixture vectors (parity test)

Each row exercises one D1–D5 invariant. Failure of any row fails
`G-25-UNDO-PSEUDOCODE-PARITY`.

| # | Scenario | Initial state | Action | Expected post-state |
|---|---|---|---|---|
| 1 | **Cap at 100 — FIFO eviction** | `undo=[a1..a100]`, `redo=[]` | `pushAction(a101)` | `undo=[a2..a101]` (a1 evicted), `redo=[]`. Length stays 100. |
| 2 | **Redo invalidation on new action** | `undo=[a1,a2]`, `redo=[r1,r2]` | `pushAction(a3)` | `undo=[a1,a2,a3]`, `redo=[]` (cleared per D1). |
| 3 | **Undo emits compensating mutation** | `undo=[a1]`, `redo=[]` | `undo()` | `undo=[]`, `redo=[a1]`, returns `compensating=mutationFrom(a1.Inverse)`. Original queue entry NOT popped (D3). |
| 4 | **Redo re-emits original op** | `undo=[]`, `redo=[a1]` | `redo()` | `undo=[a1]`, `redo=[]`, returns `replay=mutationFrom(a1.Op)`. |
| 5 | **Reload clears both stacks** | `undo=[a1..a50]`, `redo=[r1..r10]` | `onTabReload()` | `undo=[]`, `redo=[]`. Queue + server data unchanged (D4). |
| 6 | **Per-tab isolation** | Tab-A `undo=[a1]`; Tab-B `undo=[b1]` | Tab-A `pushAction(a2)` | Tab-A `undo=[a1,a2]`; Tab-B `undo=[b1]` (no cross-tab propagation per D1). |
| 7 | **Quota exceeded → hard error** | IDB at quota | `enqueueOfflineMutation(m)` | `QuotaExceededError` propagated; banner shown; `pauseFurtherMutations()` invoked; queue NOT shrunk (D2). |
| 8 | **Empty stack no-ops** | `undo=[]`, `redo=[]` | `undo()` then `redo()` | Both return `{compensating:None}` / `{replay:None}`; state unchanged; UI no-op. |

**Negative-test obligations (gate `G-25-UNDO-NEGATIVE-TESTS`).**
Implementations MUST also assert: (a) `localStorage.setItem(/undo|redo/, ...)`
appears nowhere in client source (regex CI fail per
`G-25-UNDO-IN-MEMORY-ONLY`); (b) no `BroadcastChannel('undo'…)` /
`new SharedWorker` / `'storage'` event listener wires undo state across
tabs (per `G-25-UNDO-PER-TAB`); (c) no constant named `MAX_QUEUE_SIZE`
/ `QUEUE_CAP` / `OFFLINE_LIMIT` exists in the queue module (per
`G-25-QUEUE-UNBOUNDED`); (d) no `try { ... } catch (QuotaExceededError)
{ /* silent */ }` pattern (per `G-25-QUEUE-NO-SILENT-DROP`); (e) every
`undo()` call site MUST be paired with a downstream
`enqueueOfflineMutation(compensating)` invocation (per
`G-25-UNDO-COMPENSATING-ENQUEUE`).

## Consequences

**Positive**

- Closes the contradiction between memory (500-cap, localStorage)
  and SSOT (unbounded, IndexedDB) — eliminates a live data-loss
  trap for AI implementers reading the memory rule.
- Pins the undo cap so reordering tools (history palette, redo
  preview) can size their UI around a known maximum.
- Per-tab undo isolation prevents the cross-tab undo confusion
  that plagues outliner clones.
- Hard error on quota overflow (D2) honours the SSOT's
  no-silent-drop guarantee while giving users actionable
  feedback.

**Negative**

- 100-action undo cap is conservative — power users performing
  rapid bulk edits may hit it during a single session.
  Increasing it requires a superseding ADR.
- Unbounded queue means a permanently-offline user can fill
  IndexedDB; D5's 80% warning is the only mitigation.
- In-memory undo means a refresh kills the history — users who
  refresh by mistake lose redo-ability for their session.
- Memory file `mem://features/editor-core` is now stale on this
  line and must be rewritten as a follow-up.


**Spec impact** — Downstream sections affected by this decision: [`spec/31-app/ (undo + offline queue)`](../31-app/).

## Alternatives Considered

1. **Persist undo to IndexedDB across reloads** — rejected:
   field-level LWW (ADR-0010) makes reload-redo against
   server-mutated state semantically undefined. The bug class
   "I redid an edit but it landed on a different document"
   outweighs the convenience.
2. **500-action queue cap with FIFO drop (the stale memory rule)** —
   rejected: violates SSOT AT-OQ-05 ("Local mirror size is
   unbounded"), violates ADR-0010's full-mirror contract,
   and silently loses user data — exactly the failure mode the
   queue exists to prevent.
3. **`localStorage` queue substrate** — rejected: 5–10 MB hard
   limit, synchronous (blocks main thread), no transactional
   semantics, and no quota event. IndexedDB is the only
   browser-native option that meets ADR-0010's durability
   contract.
4. **Cross-tab shared undo via `BroadcastChannel`** — rejected:
   the editor cursor and selection state are inherently per-tab;
   shared undo would let tab A revert an edit tab B's user
   cannot see, breaking the basic undo mental model.
5. **No undo cap (unbounded in-memory stack)** — rejected:
   memory growth is unbounded for a long-lived tab, and
   100-deep undo is already past the practical threshold for
   any realistic recovery.

## Gates Touched

- **New gates:**
  - `G-25-UNDO-CAP-100` — enforces D1 (undo + redo stacks each
    cap at 100; CI greps for hard-coded smaller limits or
    overrides).
  - `G-25-UNDO-IN-MEMORY-ONLY` — enforces D1/D4 (no
    `localStorage.setItem('undo*', ...)` or IndexedDB store
    named `undo`/`redo`).
  - `G-25-UNDO-PER-TAB` — enforces D1 (no `BroadcastChannel`,
    `SharedWorker`, or storage-event listener wiring undo
    state across tabs).
  - `G-25-QUEUE-UNBOUNDED` — enforces D2 (no constant named
    `MAX_QUEUE_SIZE`, `QUEUE_CAP`, or equivalent ring-buffer
    eviction logic in the offline queue path).
  - `G-25-QUEUE-INDEXEDDB-ONLY` — enforces D2 (no
    `localStorage` writes from the offline queue module;
    cross-references ADR-0010).
  - `G-25-QUEUE-NO-SILENT-DROP` — enforces D2 (quota errors
    MUST trigger the hard error banner; silent catch +
    discard is a CI error).
  - `G-25-UNDO-COMPENSATING-ENQUEUE` — enforces D3 (every
    undo action MUST emit a corresponding queue entry, not
    mutate or pop a prior one).
- **Modified gates:** `(none)` — the SSOT
  (`14b-offline-queue.md` AT-OQ-05) already mandates unbounded
  behaviour; this ADR ratifies and gates it.
- **Endpoints locked:** `(none)` — client-side state ADR.
- **DDL identifiers locked:** `(none)` — IndexedDB store, not
  SQLite.

## Supersedes / Superseded-By

- **Supersedes:** `(none)` formally; **deprecates** the
  "500-action offline local queue (localStorage)" claim in
  `mem://features/editor-core` line 7, which contradicted
  ADR-0010 + SSOT AT-OQ-05.
- **Superseded-By:** `(none)`
