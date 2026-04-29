# ADR-0023: Route loaders ↔ offline FIFO queue interaction contract

## Status

`Accepted` — 2026-04-28

## Context

Three load-bearing decisions intersect at every navigation, but their
interaction is only inferable from prose:

- **ADR-0010** — Offline FIFO replay queue (IndexedDB) + server-stamped LWW.
- **ADR-0018** — React Router v7 data-router API (`loader`/`action`).
- **ADR-0021** — Offline queue UNBOUNDED + undo cap 100 in-memory per tab.

Without an explicit contract, an AI implementer can legitimately reach for
any of: (a) blocking loaders on network round-trips, (b) reading directly
from server bypassing the local mirror, (c) issuing `action()` mutations
that race the FIFO queue, (d) showing blank routes on cold offline starts,
or (e) flushing the queue from inside a `loader`. All five break the
"local-mirror-first, eventual consistency" contract.

This ADR locks the interaction surface so loaders, actions, and the queue
compose deterministically across cold start, warm start, online, offline,
and reconnect transitions.

## Decision

**D1 — Local-mirror-first reads (MUST).** Every `loader` MUST read from the
local IndexedDB mirror first and resolve synchronously off that read. A
loader MUST NOT block on a network call before resolving. Background
refresh (revalidation) MAY be triggered after resolve, but its result MUST
be applied via the same LWW reconciliation path as queue replay (ADR-0010).

**D2 — Actions enqueue, never bypass (MUST).** Every route `action` MUST
write the mutation to (i) the local mirror (optimistic) and (ii) the FIFO
queue, in that order, inside a single IndexedDB transaction. An action
MUST NOT issue a direct `fetch`/`axios` call to the server. The queue
worker is the **sole** egress path.

**D3 — Cold start (MUST).** On first paint with no warm cache, the root
loader MUST hydrate the local mirror from IndexedDB before any child
loader runs. If IndexedDB is empty AND the network is offline, the root
loader MUST resolve with an `OfflineColdStartShell` sentinel — the route
tree MUST render the empty-state shell, never a spinner-forever or a
thrown error.

**D4 — Warm start (MUST).** On warm start (mirror present), loaders MUST
resolve from the mirror in ≤ 16 ms p95 (one frame). Background
revalidation MUST be debounced per route key (300 ms) to coalesce rapid
navigation.

**D5 — Reconnect ordering (MUST).** When the network transitions
offline → online, the queue worker MUST drain the FIFO queue **before**
any loader's background revalidation fires for the same `parentId`
scope. Implementation: revalidation requests acquire a shared lock that
the queue worker holds exclusively while draining.

**D6 — Loaders MUST NOT mutate (MUST NOT).** A `loader` MUST NOT enqueue
to the FIFO queue, MUST NOT trigger compensating actions, and MUST NOT
write to the mirror except via the read-through cache populated by
revalidation. All mutations flow through `action`.

**D7 — Error surface (MUST).** Loader failures MUST be caught by the
nearest of the eight error boundaries (ADR-0017). Action failures MUST
NOT throw — they resolve with `{ Status: 'queued' | 'rejected', Errors? }`
and the UI reads `useActionData()` to render the pending/error chip.
`QuotaExceededError` from D2's IndexedDB transaction MUST surface a hard
banner per ADR-0021 D5.

**D8 — `useFetcher` parity (MUST).** Inline mutations issued via
`useFetcher().submit()` MUST follow the same D2 path (mirror + queue,
single transaction). No code path may call the queue API directly from a
component — all writes go through a route `action` or fetcher `action`.

## Consequences

**Positive**
- Deterministic offline UX: every route renders something on every
  network state, including cold offline.
- Single egress path (queue worker) makes reconnect ordering provable.
- Loaders stay pure reads → trivially cacheable, trivially testable.
- Compensating undo mutations (ADR-0021 D3) reuse the same D2 path with
  zero special-casing.

**Negative**
- Adds a shared lock between queue worker and revalidation — must be
  benchmarked against the 300 ms debounce to avoid stall.
- Forbids the React Router idiom of `loader` doing a `fetch` directly,
  which contradicts most v7 tutorials. New contributors will need the
  ADR-0023 callout in `spec/02-coding-guidelines/`.
- Cold-offline `OfflineColdStartShell` requires a dedicated shell
  component per top-level route (~6 components).


**Spec impact** — Downstream sections affected by this decision: [`spec/31-app/ (loaders ↔ queue)`](../31-app/).

## Alternatives Considered

1. **Loaders fetch directly from server, queue handles writes only.**
   Rejected — breaks local-mirror-first, makes offline navigation render
   error boundaries, and creates two reconciliation paths (loader cache
   vs queue LWW).
2. **Actions write to server first, queue only on failure.**
   Rejected — splits the egress path, makes reconnect ordering
   non-deterministic, and defeats the FIFO guarantee in ADR-0010.
3. **Drain queue inside loader before resolving.**
   Rejected — turns every navigation into a network round-trip,
   violating D4's 16 ms p95 budget and re-introducing offline blank
   screens.
4. **Skip the shared lock; rely on LWW to fix any reorder.**
   Rejected — LWW resolves data conflicts, not ordering of dependent
   mutations (e.g., create-then-rename arriving as rename-then-create
   is unrecoverable).

## Gates Touched

- `G-23-LOADER-MIRROR-FIRST` — every `loader` reads IndexedDB mirror
  before resolving; no `fetch`/`axios` in loader bodies.
- `G-23-ACTION-ENQUEUE-ONLY` — every `action` writes mirror + queue in
  one IDB transaction; no direct server calls.
- `G-23-COLD-OFFLINE-SHELL` — root loader returns
  `OfflineColdStartShell` sentinel when mirror empty + offline.
- `G-23-WARM-LOADER-16MS` — warm-start loader p95 ≤ 16 ms (one frame).
- `G-23-RECONNECT-LOCK` — queue worker holds exclusive lock during
  drain; revalidation acquires shared lock.
- `G-23-LOADER-NO-MUTATE` — loaders MUST NOT call queue API or write
  mirror outside revalidation cache.
- `G-23-ACTION-NO-THROW` — actions resolve with Status envelope; never
  throw to error boundary.
- `G-23-FETCHER-SAME-PATH` — `useFetcher().submit()` routes through the
  same mirror+queue transaction as route actions.

## Supersedes / Superseded-By

- Supersedes: (none)
- Superseded-By: (none)
- Composes with: ADR-0010 (FIFO queue), ADR-0017 (error boundaries),
  ADR-0018 (data-router), ADR-0021 (queue capacity + undo).
