# AUDIT-06 — SSE Transport Contract Gaps

> **Version:** 1.0.0
> **Created:** 2026-04-26 (UTC+8)
> **Status:** ✅ **CLOSED 2026-04-26**
> **Parent:** [`00-overview.md`](./00-overview.md)
> **Round:** Round-3 spec audit (AUDIT-01..06 series)
> **SSOT updates:** [`spec/31-app/01-features/14-concurrency-and-sync.md`](../31-app/01-features/14-concurrency-and-sync.md) §14.5

---

## 1. Problem Statement

Pre-fix, the spec set the SSE/poll transport **policy** in two places:
- `spec/31-app/01-features/00-overview.md` L9 — *"Realtime via WP-native SSE + 5 s poll fallback"*
- `spec/31-app/01-features/14-concurrency-and-sync.md` v1.5.0 — *"the WP plugin's SSE multiplexer pushes a JSON event over the open SSE connection scoped to that item, OR the next 5 s poll surfaces it"*

But it never specified the **wire contract**:
- What is the SSE endpoint URL?
- What event names exist? (`item-updated`? `change`? `update`?)
- What is the JSON payload shape per event?
- How does resume-after-reconnect work? (`Last-Event-Id`? cursor query param?)
- What is the poll-fallback URL, query params, and response shape?
- What is the heartbeat interval?
- What headers must the server set to defeat proxy buffering?

### AI risk (without the contract)

An implementer faced with these gaps would:
1. Invent event names → server emits `change`, client listens for `update`, nothing renders.
2. Invent a payload shape → server sends `{ id, ts }`, client expects `{ ItemId, ServerTs }` → silent breakage.
3. Skip `Last-Event-Id` → reconnect loses events between drop and recovery.
4. Default to long-poll for "fallback" → blows the 5 s SLA, breaks proxy timeouts.
5. Reach for WebSockets / Pusher / Supabase Realtime when SSE seems hard to spec — **explicitly banned** by `00-overview.md` L9.

This is exactly the class of contract gap that produces multi-day debug sessions in distributed systems.

---

## 2. Resolution (normative)

Added a new section **§14.5 SSE Transport Contract** to `14-concurrency-and-sync.md` with seven sub-sections:

| § | Topic | Pinned values |
|---|-------|---------------|
| 14.5.1 | SSE endpoint | URL, auth, response headers (`text/event-stream`, `X-Accel-Buffering: no`), 15 s heartbeat, `retry: 5000`, backpressure handling |
| 14.5.2 | Event vocabulary (closed set) | 9 events: `item-updated`, `item-deleted`, `item-restored`, `mirror-broken`, `mirror-healed`, `share-granted`, `share-revoked`, `presence`, `cursor-overflow` — each with full JSON payload schema |
| 14.5.3 | `id:` field | Always `id: {ServerTs}`; cursor scoped per `(UserId, WorkspaceId)`; stored in Root DB `SyncCursor` |
| 14.5.4 | Poll fallback | URL `GET /wp-json/workflowy/v1/sync/poll?since=...`, response shape `{ Events, Cursor, HasMore }`, idempotency rule, **no long-poll** |
| 14.5.5 | Reconnect & replay algorithm | 5-step procedure: read cursor → open SSE with `Last-Event-Id` → apply events → switch to poll on overflow / 30 s no-heartbeat / 3-fails-in-60 s → probe SSE every 60 s |
| 14.5.6 | Server emission rules | Single event per LWW commit; failed writes emit nothing; `ChangedFields` lists only advanced fields; `ActorUserId='system'` for cascades |
| 14.5.7 | Forbidden transports | Reaffirmed ban: WebSockets, Pusher, Ably, Supabase Realtime, Postgres LISTEN/NOTIFY, Redis pub/sub, server-managed long-poll, binary protocols, multiple SSE connections per workspace |

---

## 3. Files Patched

| # | File | Change | Version bump |
|---|------|--------|--------------|
| 1 | `spec/31-app/01-features/14-concurrency-and-sync.md` | Added §14.5 (7 sub-sections, ~80 lines of normative contract) | v1.5.0 → v1.6.0 |
| 2 | `spec/31-app/01-features/99-consistency-report.md` | AUDIT-06 row → ✅ CLOSED | (next pass) |
| 3 | `spec/18-spec-issues/97-acceptance-criteria.md` | Coverage map row added | minor |
| 4 | `.lovable/plans/00-active.md` | Status updated — all Round-3 blockers closed | n/a |

---

## 4. Acceptance Criteria

- [x] §14.5.1 names a single SSE endpoint URL with required headers; heartbeat interval is fixed (15 s).
- [x] §14.5.2 closes the event vocabulary at 9 names; each has a full JSON payload schema; ad-hoc names forbidden.
- [x] §14.5.3 binds the resume cursor to `(UserId, WorkspaceId)` and locates it in `SyncCursor` (Root DB).
- [x] §14.5.4 specifies the poll-fallback URL, query params, response shape, and forbids long-poll.
- [x] §14.5.5 gives a deterministic reconnect algorithm with measurable thresholds (30 s, 3-fails-in-60 s, 60 s probe).
- [x] §14.5.6 forbids drift between LWW commit and SSE emission (single transaction).
- [x] §14.5.7 reaffirms the transport ban list (WebSockets/Pusher/Ably/Supabase/etc.).
- [x] No feature file outside `14-concurrency-and-sync.md` re-defines transport — they all delegate to §14.5.

---

## 5. Out of Scope

- Implementation of the WP plugin's SSE multiplexer — handled in the WP-plugin-how-to folder when implementation begins (per `mem://constraints/spec-only-mode`).
- AT (acceptance test) rows for §14.5 — to be added in a later polish pass alongside the broader `AT-APP-NN` backfill.
- HTTP/2 push, gRPC streams, or any non-SSE delivery — explicitly out of scope per §14.5.7.

---

## 6. Validation History

| Date | Version | Action |
|------|---------|--------|
| 2026-04-26 | 1.0.0 | Created + closed in same pass. Resolves Round-3 AUDIT-06. **All 6 Round-3 audits (AUDIT-01..06 + AUDIT-02a) now closed.** |
