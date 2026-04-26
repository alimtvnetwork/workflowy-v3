# Endpoints — 14 Concurrency & Sync (Realtime Transport)

> **Version:** 1.0.0
> **Updated:** 2026-04-26 (UTC+8)
> **Parent:** [`./00-overview.md`](./00-overview.md)
> **Mirrors feature:** [`../01-features/14-concurrency-and-sync.md`](../01-features/14-concurrency-and-sync.md) §14.5

---

## Summary

| ID | M | Path | Auth | Purpose |
|----|---|------|------|---------|
| EP-SYNC-STREAM | GET (SSE) | `sync/stream?Topics=...` | user | Long-lived `text/event-stream` channel |
| EP-SYNC-POLL | GET | `sync/poll?Since={cursor}&Topics=...` | user | 5 s polling fallback |
| EP-SYNC-ACK | POST | `sync/ack` | user | Advance LWW cursor on processed events |

> **Forbidden transports** (per L9 + audit AUDIT-06): WebSockets, Pusher/Pusher-compatible, Postgres `LISTEN/NOTIFY`, MQTT, long-poll. Any new endpoint adopting these is a Code-Red violation.

---

## EP-SYNC-STREAM — GET `sync/stream`

- **Auth**: `user`. Server validates topic ACLs on subscribe AND on every emitted event.
- **Query**:
  - `Topics` (string, comma-separated, required) — e.g. `item:abc,item:def,workspace:42`.
  - `Last-Event-Id` (header, optional) — resume cursor; server replays buffered events ≥ cursor.
- **Response**: `Content-Type: text/event-stream`; long-lived; server emits `event:` + `data:` + `id:` triples.
- **Event vocabulary** (matches §14.5):
  - `item-created`, `item-updated`, `item-updated`, `item-deleted`, `item-restored`
  - `item-updated` (mirror parent), `item-updated` (mirror parent), `mirror-broken`
  - `share-granted`, `share-granted` (re-grant), `share-revoked`, `share-granted` (public variant)
  - `presence`, `presence`
  - `keepalive` (every 25 s, no payload)
- **Errors**: `ERR_UNAUTHENTICATED` (close immediately), `ERR_FORBIDDEN_TOPIC` (per-topic, sent as `event:error` on the stream rather than HTTP error).
- **Side effects**: server records the connection, subscribes to topic queues. Disconnect releases subscriptions.
- **AC refs**: `AT-APP-27`.

---

## EP-SYNC-POLL — GET `sync/poll`

- **Auth**: `user`.
- **Query**: `Since` (cursor, required), `Topics` (required), `Limit` (≤ 100, default 100).
- **Success (200)** `Results`: `{ Events: Event[], Cursor: string, HasMore: boolean }`.
- **Rule**: server MUST return within 5 s with whatever events are buffered. **No long-poll** (immediate response, even if `Events` is empty). Per AUDIT-06.
- **Errors**: `ERR_INVALID_CURSOR`, `ERR_FORBIDDEN_TOPIC`.
- **Side effects**: none (read-only buffer drain).

---

## EP-SYNC-ACK — POST `sync/ack`

- **Auth**: `user`.
- **Request body**: `{ Cursor: string }` — last fully processed event ID.
- **Success (204)**: empty.
- **Errors**: `ERR_INVALID_CURSOR`.
- **Side effects**: advances the user's LWW cursor; events older than `Cursor` may be garbage-collected from the per-user replay buffer.

---

## Cross-References

| Topic | Link |
|-------|------|
| Full transport contract | [`../01-features/14-concurrency-and-sync.md`](../01-features/14-concurrency-and-sync.md) §14.5 |
| LWW conflict rules | [`../01-features/14-concurrency-and-sync.md`](../01-features/14-concurrency-and-sync.md) §14.4 |
| Forbidden transports rationale | [`../../18-spec-issues/08-audit-06-sse-transport-contract.md`](../../18-spec-issues/08-audit-06-sse-transport-contract.md) |
