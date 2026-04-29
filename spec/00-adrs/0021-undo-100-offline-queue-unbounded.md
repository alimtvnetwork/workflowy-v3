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
- Storage: in-memory only (React/Zustand state); MUST NOT persist
  across reloads.
- Granularity: one entry per atomic user action (text edit
  debounced at 500ms idle, structural move, completion toggle,
  bulk operation, etc.); see `mem://features/editor-core` for
  the action-classification rules.
- Overflow policy: FIFO eviction — when a 101st action is
  pushed, the oldest entry is dropped silently.
- Scope: per-browser-tab. Two tabs of the same account MUST NOT
  share an undo stack (avoids cross-tab undo of edits the user
  cannot see).
- Redo invalidation: any new action MUST clear the redo stack
  (standard editor semantics).

**D2 — Offline mutation queue: unbounded; full-mirror, durable.**
The "500-action offline local queue" rule in
`mem://features/editor-core` is **superseded** and MUST be
removed.
- Capacity: **unbounded** in spec; bounded only by the IndexedDB
  storage quota of the user's browser (typically hundreds of MB).
- Storage substrate: **IndexedDB** per ADR-0010, with a single
  ordered store keyed by client-generated monotonic
  `LocalSeq: number` (FIFO ordering invariant).
- Persistence: MUST survive tab close, OS crash, and browser
  process restart (IndexedDB durability default).
- `localStorage` MUST NOT be used as the queue substrate
  (5–10 MB synchronous limit, no transactional semantics).
- Eviction: there is no eviction. If IndexedDB quota is exceeded
  (`QuotaExceededError`), the client MUST surface a hard error
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
- An undo MUST enqueue a new compensating mutation onto the
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
conflict resolution." This MUST be rewritten to reflect D1 + D2:
undo cap 100 (in-memory, per-tab); offline queue unbounded
(IndexedDB per ADR-0010, no `localStorage`).

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
