# Capture Pipeline — Sub-Spec

> **Version:** 1.0.0 — authored 2026-04-30
> **Owner section:** `spec/34-activity-feed/`
> **Status:** Draft (P1 — load-bearing for `AT-ACTIVITYFEED-06..09` and gates `G-34-CP-*`).
> **Parent:** [`./00-overview.md`](./00-overview.md) §"Pending Sub-Specs" row 02
> **Sibling (depended-on):** [`./01-event-schema.md`](./01-event-schema.md)

---

## Purpose

Define the **single deterministic path** from a user action in the editor to a persisted `ActivityEvent` row + an emitted SSE frame. Every event MUST flow through one capture pipeline; ad-hoc emitters anywhere else in the codebase are forbidden.

---

## Pipeline Stages (closed list — exactly 5)

| # | Stage | Module | Output |
|---|---|---|---|
| 1 | **Intent** | Action handler in `src/features/<feature>/actions/*.ts` (per ADR-0023) | A typed `ActivityIntent` object |
| 2 | **Capture** | `src/features/activity/captureEvent.ts` (the chokepoint) | `ActivityEvent` draft (no `ActivityEventId`) |
| 3 | **Persist** | IDB queue worker (per ADR-0023 — sole egress) | Row written to local mirror + queued for server |
| 4 | **Replay** | Server REST handler `POST /activity/event` | Row written to SQLite `ActivityEvent` table |
| 5 | **Broadcast** | SSE emitter on `/stream/page/{id}` (per ADR-0025) | `event: activity` frame fanned out to subscribers |

> **MUST** every `ActivityEvent` originate from exactly one call to `captureEvent(intent: ActivityIntent)` — direct INSERTs into `ActivityEvent` and direct SSE emits with `event: activity` are forbidden outside this chokepoint `[gate: G-34-CP-CHOKEPOINT]`.

> **MUST** stages 3–5 be triggered only by stage 2 (the capture chokepoint) — skipping `captureEvent` and writing straight to the queue or REST endpoint is forbidden `[gate: G-34-CP-NO-SKIP-CHOKEPOINT]`.

---

## Stage 1 — Intent (action handler)

Per the loader↔queue contract (ADR-0023), every mutation lives in an action handler under `src/features/<feature>/actions/`. The handler MUST construct an `ActivityIntent` *before* writing to the local mirror — the intent is the input to the chokepoint.

```ts
// src/features/activity/intent.ts
import type { EventType } from './eventType';
import type { ItemId, OwnerId } from '@/lib/schemas/branded.schema';

export type ActivityIntent = {
  EventType:    EventType;
  ActorUserId:  number;
  TargetItemId: ItemId;
  ParentItemId: ItemId | null;
  PageItemId:   ItemId;
  OccurredAt:   string;     // ISO 8601 UTC, set by caller (clock injected — never `new Date()` directly)
  Payload:      unknown;    // validated by chokepoint against PayloadSchemaForType[EventType]
};
```

```ts
// Example: src/features/editor/actions/moveItem.ts
import { captureEvent } from '@/features/activity/captureEvent';

export async function moveItem(args: { itemId: ItemId; toParent: ItemId | null; toSortOrder: string; }): Promise<void> {
  const prev = await idb.get('Item', args.itemId, ItemSchema);
  if (!prev) throw new DomainError({ code: 'ITM-NOT-FOUND' });
  await captureEvent({
    EventType:    'ItemMoved',
    ActorUserId:  session.userId,
    TargetItemId: args.itemId,
    ParentItemId: args.toParent,
    PageItemId:   resolvePageRoot(args.itemId),
    OccurredAt:   clock.nowIso(),
    Payload: {
      PrevParentItemId: prev.ParentItemId,
      NextParentItemId: args.toParent,
      PrevSortOrder:    prev.SortOrder,
      NextSortOrder:    args.toSortOrder,
    },
  });
}
```

> **MUST** `ActivityIntent.OccurredAt` come from an injected `clock.nowIso()` (testable, mockable) — direct `new Date().toISOString()` calls inside action handlers are forbidden `[gate: G-34-CP-INJECTED-CLOCK]`.

---

## Stage 2 — Capture (the chokepoint)

```ts
// src/features/activity/captureEvent.ts
import { z } from 'zod';
import { idb } from '@/lib/idb/client';
import { queue } from '@/lib/queue';
import { PayloadSchemaForType } from './eventPayloads.schema';
import type { ActivityIntent } from './intent';

export async function captureEvent(intent: ActivityIntent): Promise<void> {
  // 1. Validate payload against EventType-specific schema (per 01-event-schema.md R3)
  const payloadSchema = PayloadSchemaForType[intent.EventType];
  const payload = payloadSchema.parse(intent.Payload);

  // 2. Compute PurgeAfter at capture time (per 01-event-schema.md G-34-ES-PURGE-AFTER-COMPUTED)
  const purgeAfter = isoPlusDays(intent.OccurredAt, 30);

  // 3. Write mirror + queue in ONE IDB transaction (ADR-0023)
  await idb.transaction(['ActivityEventMirror', 'Queue'], 'readwrite', async (tx) => {
    const draft = { ...intent, Payload: payload, PurgeAfter: purgeAfter, Reversible: isReversible(intent.EventType) };
    await tx.objectStore('ActivityEventMirror').add(draft);
    await tx.objectStore('Queue').add({ Endpoint: 'POST /activity/event', Body: draft });
  });
}
```

> **MUST** `captureEvent` write the mirror row AND the queue entry inside a single IDB `readwrite` transaction (atomic per ADR-0023) — split writes are forbidden because a crash between them would create a phantom local event with no server replica `[gate: G-34-CP-ATOMIC-WRITE]`.

> **MUST** `captureEvent` validate `intent.Payload` via `PayloadSchemaForType[intent.EventType].parse(...)` BEFORE the IDB write — unvalidated drafts MUST NOT reach the mirror `[gate: G-34-CP-VALIDATE-BEFORE-WRITE]`.

---

## Stage 3 — Persist (queue worker, sole egress)

The queue worker (single instance per tab, per ADR-0023) drains the FIFO queue. For activity events, it issues `POST /activity/event` with the canonical PascalCase envelope. Successful replies stamp the local mirror row with the server-issued `ActivityEventId`.

> **MUST** the activity-feed queue items reuse the existing FIFO queue defined by ADR-0023 — a parallel "activity queue" is forbidden because it would break ordering guarantees `[gate: G-34-CP-SINGLE-QUEUE]`.

The queue worker is unbounded in IDB per ADR-0021 (offline resilience); local UI may render the draft event optimistically before the server stamp arrives.

---

## Stage 4 — Replay (server REST handler)

`POST /activity/event` is the only server endpoint that writes to `ActivityEvent`. It re-validates the payload, computes `PurgeAfter` server-side (re-computing matches the local value because both use the same `OccurredAt`), inserts, and returns the row in the canonical envelope.

> **MUST** the server handler re-validate `Payload` against `PayloadSchemaForType` (PHP equivalent: Symfony Validator schema) — trusting the client-supplied payload shape is forbidden because the client is not a trust boundary `[gate: G-34-CP-SERVER-REVALIDATE]`.

---

## Stage 5 — Broadcast (SSE)

After insert, the handler publishes one `event: activity` frame to `/stream/page/{PageItemId}` per ADR-0025. The frame's `id:` line is the `ActivityEventId` (used for `Last-Event-ID` replay, per `01-event-schema.md` §SSE Frame).

SSE is read-signal only (per ADR-0025) — clients receiving a frame MUST refetch via `editorLoader` if they need the full row, never enqueue further mutations from the SSE callback.

> **MUST** SSE consumers treat `event: activity` frames as read-signals only — enqueuing a mutation in response to a frame (creating a feedback loop) is forbidden by ADR-0025 `[gate: G-34-CP-SSE-READ-ONLY]`.

---

## Idempotency & Deduplication

Each `ActivityIntent` carries an implicit idempotency key: `(ActorUserId, EventType, TargetItemId, OccurredAt)`. The server's `INSERT` uses `ON CONFLICT(...) DO NOTHING` against a unique index on this tuple to absorb retries (queue worker may replay after offline reconnect).

```sql
CREATE UNIQUE INDEX UX_ActivityEvent_Idempotency
  ON ActivityEvent (ActorUserId, EventType, TargetItemId, OccurredAt);
```

> **MUST** the server insert use `ON CONFLICT (ActorUserId, EventType, TargetItemId, OccurredAt) DO NOTHING` — duplicate-row insertion on retry is forbidden `[gate: G-34-CP-IDEMPOTENT-INSERT]`.

---

## Anti-Patterns

| # | Anti-pattern | Why it fails | Gate |
|---|---|---|---|
| 1 | Calling `idb.put('ActivityEventMirror', …)` outside `captureEvent` | Bypasses payload validation; phantom events. | `G-34-CP-CHOKEPOINT` |
| 2 | Calling `POST /activity/event` from a non-queue caller | Skips offline buffering; lost on reconnect. | `G-34-CP-NO-SKIP-CHOKEPOINT` |
| 3 | `new Date().toISOString()` inside an action handler | Untestable; clock skew across replays. | `G-34-CP-INJECTED-CLOCK` |
| 4 | Writing mirror first, queue second (separate transactions) | Crash window creates phantom local event. | `G-34-CP-ATOMIC-WRITE` |
| 5 | Skipping payload validation in capture (deferring to server) | Client-side bugs corrupt local mirror; UI breaks. | `G-34-CP-VALIDATE-BEFORE-WRITE` |
| 6 | Spawning a separate queue for activity events | Breaks FIFO ordering across mutations. | `G-34-CP-SINGLE-QUEUE` |
| 7 | Server trusting client-supplied `Payload` without re-validation | Client compromise → DB corruption. | `G-34-CP-SERVER-REVALIDATE` |
| 8 | Enqueuing a mutation from an SSE `event: activity` callback | Feedback loop; doubles-counts events. | `G-34-CP-SSE-READ-ONLY` |
| 9 | Server `INSERT` without `ON CONFLICT` clause | Retry from queue worker creates duplicate rows. | `G-34-CP-IDEMPOTENT-INSERT` |

---

## Acceptance-Criteria Binds

| AT id | Stage covered | Assertion summary |
|---|---|---|
| `AT-ACTIVITYFEED-06` | Stage 2 — atomic write | Crash injected between mirror write and queue enqueue → IDB transaction rolls back; no phantom row. |
| `AT-ACTIVITYFEED-07` | Stage 2 — payload validation | `captureEvent` with malformed payload throws `BoundaryParseError(USR-34-PAYLOAD)`; mirror untouched. |
| `AT-ACTIVITYFEED-08` | Stage 4 — server revalidation | `POST /activity/event` with malformed payload returns `Status: 'Error', Errors[0].Code: 'USR-34-PAYLOAD'`. |
| `AT-ACTIVITYFEED-09` | Idempotency | Replaying the same intent 3× produces exactly 1 row in `ActivityEvent`. |

Fixtures live in [`./97a-acceptance-criteria-fixtures.md`](./97a-acceptance-criteria-fixtures.md).

---

## Cross-References

| Reference | Location |
|---|---|
| Event schema (depended-on sibling) | [`./01-event-schema.md`](./01-event-schema.md) |
| Feed UI (sibling) | `./03-feed-ui.md` (pending) |
| Retention & purge (sibling) | `./04-retention-and-purge.md` (pending) |
| Loader↔queue contract | ADR-0023 |
| SSE realtime contract | ADR-0025 |
| Offline queue (unbounded IDB) | ADR-0021 |
| Boundary chokepoint principle | [`../35-enforcement-rules/04-boundary-enforcement.md`](../35-enforcement-rules/04-boundary-enforcement.md) |

---

## Related

- [`./00-overview.md`](./00-overview.md) — Parent overview (§"Pending Sub-Specs" row 02)
- [`./97-acceptance-criteria.md`](./97-acceptance-criteria.md) — AT registry
