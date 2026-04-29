# ADR-0025: Server-Sent Events (SSE) as the sole realtime transport

## Status

`Accepted` — 2026-04-28

## Context

Spec acceptance criteria (e.g., `spec/01-spec-authoring-guide/19-…`) already
cite SSE frames (`item.created`, page channels) as the negative/side-effect
assertion vehicle, but no ADR locks the transport choice. Without
ratification, an AI implementer can legitimately reach for:

- **WebSocket** (full-duplex, but requires upgrade handshake, sticky
  sessions, and a non-PHP worker — incompatible with the WordPress-plugin
  backend in ADR-0002).
- **Long-polling** (works on PHP-FPM, but burns a worker per connected
  client — fatal at scale on shared WP hosts).
- **Polling-only** (simple, but breaks the offline-queue reconcile UX
  that depends on push notifications for cross-tab/cross-device LWW).
- **Third-party push (Pusher, Ably, Firebase RTDB)** — adds an external
  dependency forbidden by the self-hosted-WP constraint.

This ADR locks **Server-Sent Events** as the single realtime transport,
defines the channel namespace, frame envelope, reconnect contract, and
its interaction with the offline FIFO queue (ADR-0010, ADR-0023).

## Decision

**D1 — SSE is the sole realtime transport (MUST).** All server→client [gate: G-25-TRANSPORT-SSE-ONLY]
push notifications MUST flow over `text/event-stream` connections served [gate: G-25-TRANSPORT-SSE-ONLY]
by the WordPress plugin REST surface. WebSocket, long-polling, raw HTTP
streaming, and third-party push services are **forbidden**.

**D2 — Endpoint shape (MUST).** Exactly one SSE endpoint per channel [gate: G-25-SSE-ENDPOINT-CLOSED]
scope, mounted under the existing REST namespace:

```
GET /wp-json/workflowy/v1/stream/page/{pageId}    → page-scoped channel
GET /wp-json/workflowy/v1/stream/user/{ownerId}   → user-scoped channel (cross-tab)
```

No other SSE endpoints may be added without superseding this ADR.

**D3 — Frame envelope (MUST).** Every SSE `data:` payload MUST be a [gate: G-25-SSE-FRAME-ENVELOPE]
single-line JSON object matching the REST envelope's PascalCase rule
(ADR-0004), with `Event` + `Id` mandatory:

```
event: item.created
id: <monotonic-server-seq>
data: {"Event":"item.created","Id":"itm_B","ParentId":"itm_A","ServerSeq":4711}
```

Event names MUST be lowercase dot-namespaced (`item.created`, [gate: G-25-SSE-EVENT-NAMES-CLOSED]
`item.updated`, `item.moved`, `item.trashed`, `mirror.linked`,
`mirror.detached`). The closed set is owned by this ADR.

**D4 — Reconnect contract (MUST).** Clients MUST honour the SSE [gate: G-25-SSE-LAST-EVENT-ID]
`Last-Event-ID` header on reconnect. The server MUST replay all frames [gate: G-25-SSE-LAST-EVENT-ID]
with `ServerSeq > Last-Event-ID` from a 5-minute ring buffer. If the
buffer doesn't contain `Last-Event-ID + 1` (cold gap), the server MUST [gate: G-25-SSE-LAST-EVENT-ID]
emit a single `event: resync` frame; the client MUST then trigger a full [gate: G-25-SSE-LAST-EVENT-ID]
loader revalidation per ADR-0023 D5.

**D5 — Interaction with offline queue (MUST).** SSE frames are **read [gate: G-25-SSE-READ-ONLY-SIGNAL]
signals only** — they MUST NOT bypass the local-mirror-first contract [gate: G-25-SSE-READ-ONLY-SIGNAL]
(ADR-0023 D1). On receiving a frame, the client MUST: (i) write to the [gate: G-25-SSE-READ-ONLY-SIGNAL]
mirror via the same LWW path as queue replay, (ii) trigger the
debounced revalidation per ADR-0023 D4. Frames MUST NOT trigger writes [gate: G-25-SSE-READ-ONLY-SIGNAL]
to the FIFO queue (no echo loops).

**D6 — Heartbeat & timeout (MUST).** The server MUST emit a `: ping` [gate: G-25-SSE-HEARTBEAT-15S]
comment frame every 15 s. Clients MUST treat 30 s of silence as a [gate: G-25-SSE-HEARTBEAT-15S]
disconnect and reconnect with exponential backoff (1 s, 2 s, 4 s, …,
capped at 30 s).

**D7 — Auth (MUST).** SSE endpoints MUST require the same WordPress
nonce/cookie auth as REST. Cross-origin SSE is **forbidden** (no `*`
CORS on the stream namespace).

**D8 — Worker budget (MUST).** Per-host concurrent SSE connections MUST [gate: G-25-SSE-WORKER-CAP]
be capped at **N = max(50, php-fpm.max_children − 10)**. Excess
connections receive `503` with `Retry-After: 30`. Clients receiving 503
MUST fall back to **30 s polling** of the affected scope until SSE [gate: G-25-SSE-WORKER-CAP]
reconnects succeed.

## Consequences

**Positive**
- Native PHP-FPM support (no upgrade handshake, no sticky sessions);
  composes cleanly with the WP plugin runtime (ADR-0002).
- Reuses existing REST envelope rules (ADR-0004, ADR-0019).
- Reconnect semantics (`Last-Event-ID` + ring buffer) are HTTP-native
  and survive proxies/CDNs that terminate WebSockets.
- Read-only signal model means SSE failure degrades to polling, never
  to data loss (offline queue still flushes via D5).

**Negative**
- One PHP-FPM worker per connected client → strict cap (D8) required;
  hard ceiling on concurrent users per host.
- No client→server push (must use REST `action`); fine because
  ADR-0023 D2 already mandates action-only egress.
- 5-minute ring buffer is in-memory per worker pool → multi-worker
  deployments need a shared store. **Resolved 2026-04-28 by
  [ADR-0027](./0027-sse-multiworker-shared-ring-buffer.md)** (SQLite WAL
  `SseRing` table); no longer a known gap. Redis is forbidden by ADR-0002.
- Some corporate proxies buffer `text/event-stream` → mitigated by
  the heartbeat (D6) and 503-fallback polling (D8).


**Spec impact** — Downstream sections affected by this decision: [`spec/31-app/06-endpoints/ (SSE)`](../31-app/06-endpoints/).

## Alternatives Considered

1. **WebSocket via Ratchet/ReactPHP sidecar.** Rejected — requires a
   long-running PHP process outside FPM, violating ADR-0002's
   "WordPress plugin only" constraint.
2. **Long-polling (30 s hold).** Rejected — same worker-burn cost as
   SSE without reconnect/replay semantics; worse latency on event
   arrival.
3. **Polling-only at 5 s interval.** Rejected — 12 RPS per active tab
   per user; load test shows fatal at >50 concurrent users on shared
   hosts.
4. **Pusher / Ably / Firebase.** Rejected — external dependency,
   contradicts self-hosted-WP guarantee, adds per-message billing.
5. **WebTransport / HTTP/3 server push.** Rejected — runtime support
   not guaranteed on WP hosting tier; revisit post-2027.

## Gates Touched

- `G-25-TRANSPORT-SSE-ONLY` — no WebSocket / long-poll / 3rd-party
  push code paths permitted.
- `G-25-SSE-ENDPOINT-CLOSED` — only `/stream/page/{id}` and
  `/stream/user/{id}` may exist.
- `G-25-SSE-FRAME-ENVELOPE` — every `data:` payload matches PascalCase
  envelope with `Event` + `Id` + `ServerSeq`.
- `G-25-SSE-EVENT-NAMES-CLOSED` — event names ∈ {item.created,
  item.updated, item.moved, item.trashed, mirror.linked,
  mirror.detached, resync}.
- `G-25-SSE-LAST-EVENT-ID` — server honours `Last-Event-ID` with
  5-minute ring buffer; cold gap → `resync` frame.
- `G-25-SSE-READ-ONLY-SIGNAL` — SSE frames MUST NOT enqueue to FIFO
  queue (no echo loops).
- `G-25-SSE-HEARTBEAT-15S` — server emits `: ping` every 15 s.
- `G-25-SSE-WORKER-CAP` — concurrent SSE connections capped per D8;
  503 → 30 s polling fallback.

> Note: the `G-25-*` gate prefix is shared with ADR-0021
> (undo/queue caps). Both ADRs were authored same-day; the prefix
> overlap is acknowledged and gate IDs are unique within the prefix.

## Supersedes / Superseded-By

- Supersedes: (none)
- Superseded-By: (none)
- Composes with: ADR-0002 (WP plugin backend), ADR-0004 (PascalCase
  envelope), ADR-0010 (offline FIFO queue), ADR-0023 (loader↔queue
  contract).
