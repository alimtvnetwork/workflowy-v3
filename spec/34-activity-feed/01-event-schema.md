# Activity Event Schema — Sub-Spec

> **Version:** 1.0.0 — authored 2026-04-30
> **Owner section:** `spec/34-activity-feed/`
> **Status:** Draft (P1 — load-bearing for `AT-ACTIVITYFEED-01..05` and gates `G-34-ES-*`).
> **Parent:** [`./00-overview.md`](./00-overview.md) §"Pending Sub-Specs" row 01

---

## Purpose

Define the canonical `ActivityEvent` table, the closed `EventType` enum, the JSON shape of every event, and the invariants every emitter and consumer MUST honour. Every other sub-spec in this section (`02-capture-pipeline.md`, `03-feed-ui.md`, `04-retention-and-purge.md`) depends on this shape.

---

## DDL — `ActivityEvent` table

PascalCase columns per `spec/04-database-conventions/`. INTEGER PK auto-increment per ADR for SQLite identity (no UUIDs in primary keys).

```sql
CREATE TABLE ActivityEvent (
  ActivityEventId INTEGER PRIMARY KEY AUTOINCREMENT,
  EventType       TEXT    NOT NULL CHECK (EventType IN (
                    'ItemCreated','ItemUpdated','ItemMoved','ItemDeleted',
                    'ItemRestored','ItemMirrored','BoardColumnReordered','TemplateApplied'
                  )),
  ActorUserId     INTEGER NOT NULL REFERENCES "User"(UserId),
  TargetItemId    TEXT    NOT NULL,                 -- branded ItemId at TS layer
  ParentItemId    TEXT,                             -- branded ItemId | NULL (for top-level)
  PageItemId      TEXT    NOT NULL,                 -- denormalised root for fast page-feed queries
  PayloadJson     TEXT    NOT NULL DEFAULT '{}',    -- per-EventType payload, schema-validated
  OccurredAt      TEXT    NOT NULL,                 -- ISO 8601 UTC, e.g. "2026-04-30T12:34:56.789Z"
  IngestedAt      TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  Reversible      INTEGER NOT NULL DEFAULT 1,       -- 0/1; 0 only for partial-irreversible (e.g. TemplateApplied)
  PurgeAfter      TEXT    NOT NULL                  -- OccurredAt + 30 days, computed at insert
);

CREATE INDEX IX_ActivityEvent_PageItemId_OccurredAt
  ON ActivityEvent (PageItemId, OccurredAt DESC);

CREATE INDEX IX_ActivityEvent_ActorUserId_OccurredAt
  ON ActivityEvent (ActorUserId, OccurredAt DESC);

CREATE INDEX IX_ActivityEvent_PurgeAfter
  ON ActivityEvent (PurgeAfter);
```

> **MUST** every `ActivityEvent` row carry `EventType`, `ActorUserId`, `TargetItemId`, `PageItemId`, `OccurredAt`, `PurgeAfter`, and `PayloadJson` — NULLs in any of these columns are forbidden by the DDL `CHECK`/`NOT NULL` constraints `[gate: G-34-ES-NOT-NULL]`.

> **MUST** `PurgeAfter` be computed as `OccurredAt + 30 days` at insert time and stored — clients MUST NOT compute it on-read; matches `mem://features/trash-logic` 30-day retention `[gate: G-34-ES-PURGE-AFTER-COMPUTED]`.

---

## EventType Enum (closed list — exactly 8)

```ts
// src/features/activity/eventType.ts
export const EventType = {
  ItemCreated:          'ItemCreated',
  ItemUpdated:          'ItemUpdated',
  ItemMoved:            'ItemMoved',
  ItemDeleted:          'ItemDeleted',
  ItemRestored:         'ItemRestored',
  ItemMirrored:         'ItemMirrored',
  BoardColumnReordered: 'BoardColumnReordered',
  TemplateApplied:      'TemplateApplied',
} as const;

export type EventType = typeof EventType[keyof typeof EventType];
```

> **MUST** the `EventType` enum match exactly the 8 values in the table above — adding a new event type requires (1) a new row in the parent overview's "Event Taxonomy", (2) a new payload schema below, (3) a new `AT-ACTIVITYFEED-NN` row, and (4) a migration adding it to the SQLite `CHECK` constraint `[gate: G-34-ES-CLOSED-ENUM]`.

---

## Per-EventType Payload Schemas (Zod)

Each `PayloadJson` value MUST validate against the schema for its `EventType`. Stored as TEXT (JSON string), parsed on read via `parseResponse(json, PayloadSchemaForType[type])`.

```ts
// src/features/activity/eventPayloads.schema.ts
import { z } from 'zod';
import { ItemIdSchema, OwnerIdSchema } from '@/lib/schemas/branded.schema';

export const ItemCreatedPayload = z.object({
  ItemType: z.enum([/* 12 closed types from ADR-0015 */]),
  Content:  z.string().max(10_000),
}).strict();

export const ItemUpdatedPayload = z.object({
  ChangedFields: z.array(z.enum(['Content','ItemType','Metadata'])).min(1),
  PrevContent:   z.string().max(10_000).optional(), // for undo (ADR-0023, undo cap 100)
  NextContent:   z.string().max(10_000).optional(),
}).strict();

export const ItemMovedPayload = z.object({
  PrevParentItemId: ItemIdSchema.nullable(),
  NextParentItemId: ItemIdSchema.nullable(),
  PrevSortOrder:    z.string().min(1), // base-62 fractional, ADR-0016
  NextSortOrder:    z.string().min(1),
}).strict();

export const ItemDeletedPayload  = z.object({ TrashedItemSnapshot: z.string() }).strict();
export const ItemRestoredPayload = z.object({ FromTrashAt: z.string() }).strict();

export const ItemMirroredPayload = z.object({
  PeerGroupId:    z.string().min(1),    // mirror peer-group, NOT an ItemType (mem://features/mirroring)
  PeerCountAfter: z.number().int().min(2),
}).strict();

export const BoardColumnReorderedPayload = z.object({
  PrevSortOrder: z.string().min(1),
  NextSortOrder: z.string().min(1),
}).strict();

export const TemplateAppliedPayload = z.object({
  TemplateId:    z.string().min(1),
  AppliedNodeIds: z.array(ItemIdSchema).min(1),
}).strict();

export const PayloadSchemaForType = {
  ItemCreated:          ItemCreatedPayload,
  ItemUpdated:          ItemUpdatedPayload,
  ItemMoved:            ItemMovedPayload,
  ItemDeleted:          ItemDeletedPayload,
  ItemRestored:         ItemRestoredPayload,
  ItemMirrored:         ItemMirroredPayload,
  BoardColumnReordered: BoardColumnReorderedPayload,
  TemplateApplied:      TemplateAppliedPayload,
} as const;
```

> **MUST** every `ActivityEvent.PayloadJson` validate against `PayloadSchemaForType[EventType]` at write time AND at read time — unvalidated payload reads are forbidden `[gate: G-34-ES-PAYLOAD-VALIDATED]`.

> **MUST** every payload schema use `.strict()` (no `passthrough`) — drift is caught at the boundary, per sibling `35-enforcement-rules/02-runtime-validation.md` R4 `[gate: G-34-ES-STRICT-PAYLOAD]`.

---

## REST Envelope Shape (read endpoints)

A feed read returns the canonical PascalCase envelope (ADR-0004/0019). Each `Results[i]` row is one `ActivityEvent` projected with branded IDs.

```json
{
  "Status": "Success",
  "Attributes": { "RequestId": "req_…", "PageItemId": "itm_root_alpha", "Cursor": "1714499696000_42" },
  "Results": [
    {
      "ActivityEventId": 12345,
      "EventType":       "ItemMoved",
      "ActorUserId":     7,
      "TargetItemId":    "itm_x9k…",
      "ParentItemId":    "itm_root_alpha",
      "PageItemId":      "itm_root_alpha",
      "OccurredAt":      "2026-04-30T12:34:56.789Z",
      "Reversible":      true,
      "Payload": {
        "PrevParentItemId": "itm_a1",
        "NextParentItemId": "itm_b2",
        "PrevSortOrder":    "a3",
        "NextSortOrder":    "a7"
      }
    }
  ]
}
```

`Payload` is the **parsed** object (not the raw `PayloadJson` TEXT) — the API layer parses + validates + re-keys to PascalCase before returning.

> **MUST** every read endpoint return `Payload` as a parsed object validated by `PayloadSchemaForType[EventType]` — returning the raw TEXT `PayloadJson` is forbidden `[gate: G-34-ES-PARSED-PAYLOAD]`.

---

## Cursor Format (pagination)

Cursor is `<OccurredAtMillis>_<ActivityEventId>`. Lexicographic descending sort. Stable across inserts because `(OccurredAt, ActivityEventId)` is a strict total order.

```
1714499696000_42        ← decode: OccurredAt=2024-04-30T18:34:56.000Z, EventId=42
```

> **MUST** every `Cursor` value be of the exact form `<OccurredAtMillis>_<ActivityEventId>` (regex `^\d{13}_\d+$`); arbitrary opaque cursors are forbidden because they break replay debugging `[gate: G-34-ES-CURSOR-SHAPE]`.

---

## SSE Frame (realtime feed updates)

Per ADR-0025, realtime is SSE-only via `/stream/page/{id}`. Every emitted event produces one SSE frame with the same `Results[0]` shape as the REST envelope.

```
event: activity
id: 12345
data: {"Status":"Success","Attributes":{"RequestId":"req_…","PageItemId":"itm_root_alpha"},"Results":[{ /* … as above … */ }]}
```

The `id:` line is the `ActivityEventId`, used for `Last-Event-ID` replay per ADR-0025.

---

## Anti-Patterns

| # | Anti-pattern | Why it fails | Gate |
|---|---|---|---|
| 1 | Storing `PayloadJson` without validating against `PayloadSchemaForType` | Future read crashes on malformed JSON. | `G-34-ES-PAYLOAD-VALIDATED` |
| 2 | Adding a new `EventType` without updating all 4 places (taxonomy, schema, AT, DDL) | Partial registration; silent drift. | `G-34-ES-CLOSED-ENUM` |
| 3 | Returning raw `PayloadJson` TEXT in REST response | Pushes parse cost to every client; defeats schema. | `G-34-ES-PARSED-PAYLOAD` |
| 4 | Computing `PurgeAfter` on read (`OccurredAt + 30d`) | Drift if retention policy changes; ledger inconsistency. | `G-34-ES-PURGE-AFTER-COMPUTED` |
| 5 | Opaque cursor (e.g. base64-encoded blob) | Breaks debugging; loses sort guarantee. | `G-34-ES-CURSOR-SHAPE` |
| 6 | Payload schema with `.passthrough()` | Hides drift; same anti-pattern as 35-enforcement-rules R4. | `G-34-ES-STRICT-PAYLOAD` |
| 7 | NULL in any required column | DDL allows it via missing constraint; data corruption. | `G-34-ES-NOT-NULL` |

---

## Acceptance-Criteria Binds

| AT id | Rule covered | Assertion summary |
|---|---|---|
| `AT-ACTIVITYFEED-01` | Closed enum | `rg -nP "EventType\b" wp-plugin/migrations/ \| wc -l` matches enum-add count; `CHECK` constraint includes exactly 8 values. |
| `AT-ACTIVITYFEED-02` | Payload validation | Inserting an event with a malformed payload (e.g. missing `NextSortOrder` for `ItemMoved`) throws `BoundaryParseError` with code `USR-34-PAYLOAD`. |
| `AT-ACTIVITYFEED-03` | PurgeAfter computed | Inserted row has `PurgeAfter = OccurredAt + 30d` (assertion via SQL). |
| `AT-ACTIVITYFEED-04` | Cursor shape | `Cursor` from any feed response matches `/^\d{13}_\d+$/`. |
| `AT-ACTIVITYFEED-05` | SSE replay | Reconnecting with `Last-Event-ID: 12345` replays events from `ActivityEventId > 12345` only. |

Fixtures live in [`./97a-acceptance-criteria-fixtures.md`](./97a-acceptance-criteria-fixtures.md).

---

## Cross-References

| Reference | Location |
|---|---|
| Capture pipeline (sibling) | `./02-capture-pipeline.md` (pending) |
| Feed UI (sibling) | `./03-feed-ui.md` (pending) |
| Retention & purge (sibling) | `./04-retention-and-purge.md` (pending) |
| API envelope shape | ADR-0004 / ADR-0019 |
| SSE realtime contract | ADR-0025 |
| SortOrder format | ADR-0016 |
| Branded IDs | ADR-0020 |
| Trash retention parity | `mem://features/trash-logic` |
| Strict payload schemas (sibling section) | [`../35-enforcement-rules/02-runtime-validation.md`](../35-enforcement-rules/02-runtime-validation.md) |

---

## Related

- [`./00-overview.md`](./00-overview.md) — Parent overview (§"Pending Sub-Specs" row 01)
- [`./97-acceptance-criteria.md`](./97-acceptance-criteria.md) — AT registry
