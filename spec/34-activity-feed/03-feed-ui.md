# Feed UI — Sub-Spec

> **Version:** 1.0.0 — authored 2026-04-30
> **Owner section:** `spec/34-activity-feed/`
> **Status:** Draft (P1 — load-bearing for `AT-ACTIVITYFEED-10..13` and gates `G-34-UI-*`).
> **Parent:** [`./00-overview.md`](./00-overview.md) §"Pending Sub-Specs" row 03
> **Siblings (depended-on):** [`./01-event-schema.md`](./01-event-schema.md) · [`./02-capture-pipeline.md`](./02-capture-pipeline.md)

---

## Purpose

Define the **read-only React surfaces** that render the activity feed for a page or a user, plus the typed restore-action surface (the only *write* in this UI). The feed is a derivative view — it never mutates `ActivityEvent` rows; restoring a deleted item enqueues an `ItemRestored` mutation through the editor's normal action handlers (per `02-capture-pipeline.md` Stage 1).

---

## Routing & Mount Point

| Route | Component | Loader | Boundary |
|---|---|---|---|
| `/page/:pageId/activity` | `<PageActivityFeed>` | `pageActivityLoader` | `<ActivityBoundary>` |
| `/me/activity` | `<UserActivityFeed>` | `userActivityLoader` | `<ActivityBoundary>` |

`<ActivityBoundary>` is one of the 8 named error boundaries (ADR-0017) — a single top-level boundary is forbidden.

> **MUST** both feed routes mount inside `<ActivityBoundary>` (one of the 8 named boundaries from ADR-0017) — wrapping in `<AppErrorBoundary>` directly is forbidden because feed-specific errors (cursor-decode failures, payload-parse failures) need feed-scoped recovery `[gate: G-34-UI-NAMED-BOUNDARY]`.

---

## Loader Contract

Per ADR-0023 loader↔queue contract: loaders read the local mirror first (≤16ms p95, never fetch). The feed loader queries `ActivityEventMirror` for rows with matching `PageItemId` (or `ActorUserId`), ordered by `OccurredAt DESC`, limited to the cursor window.

```ts
// src/routes/page.$pageId.activity.loader.ts
export async function pageActivityLoader({ params, request }: LoaderArgs): Promise<FeedPage> {
  const { pageId } = z.object({ pageId: ItemIdSchema }).parse(params);
  const url = new URL(request.url);
  const cursor = url.searchParams.get('cursor');
  if (cursor !== null && !/^\d{13}_\d+$/.test(cursor)) {
    throw new BoundaryParseError({ code: 'USR-34-CURSOR' }); // G-34-ES-CURSOR-SHAPE
  }
  return idb.queryFeed({ pageId, cursor, limit: 50 });        // mirror-first per ADR-0023
}
```

> **MUST** the feed loader read from the local `ActivityEventMirror` (mirror-first, ≤16ms p95 per ADR-0023) — direct `api.get('/activity/…')` calls from a loader are forbidden because they violate the loader↔queue contract `[gate: G-34-UI-MIRROR-FIRST]`.

> **MUST** the loader reject malformed cursors with `BoundaryParseError(USR-34-CURSOR)` BEFORE issuing any query — passing a malformed cursor to IDB is forbidden because it bypasses the regex contract from `01-event-schema.md` `[gate: G-34-UI-CURSOR-VALIDATE]`.

---

## Components (3)

### C1 — `<PageActivityFeed>` (route `/page/:pageId/activity`)

| Element | Component | Behavior |
|---|---|---|
| Header | `<PageHeader title="Activity" />` (no action button — read-only) | n/a |
| Filter bar | `<EventTypeFilter>` (multi-select, 8 enum values from `01-event-schema.md`) + `<ActorFilter>` + `<DateRangeFilter>` | URL-driven via `?types=…&actor=…&from=…&to=…` |
| List | `<DataList virtualized={rows.length>=1000}>` rendering `<ActivityRow>` per row | Virtualization mandatory ≥1000 rows (ADR-0017) |
| Empty state | `<EmptyState icon={Activity} title="No activity yet">` | Lucide icon only — no emoji glyphs |
| Pagination | "Load more" button when `Cursor` present in last response | Cursor-based per `01-event-schema.md` |

Each `<ActivityRow>` renders the parsed `Payload` via an EventType-specific sub-component (closed dispatcher — one component per `EventType`, matching the closed enum):

```tsx
const RowByType: Record<EventType, FC<{ event: ActivityEvent }>> = {
  ItemCreated:          ItemCreatedRow,
  ItemUpdated:          ItemUpdatedRow,
  ItemMoved:            ItemMovedRow,
  ItemDeleted:          ItemDeletedRow,
  ItemRestored:         ItemRestoredRow,
  ItemMirrored:         ItemMirroredRow,
  BoardColumnReordered: BoardColumnReorderedRow,
  TemplateApplied:      TemplateAppliedRow,
};
```

> **MUST** the `RowByType` dispatcher cover exactly the 8 closed `EventType` values — TypeScript exhaustiveness check (`Record<EventType, …>`) MUST hold; partial coverage with a fallback `default` row is forbidden because new event types would silently render as "unknown" `[gate: G-34-UI-EXHAUSTIVE-DISPATCHER]`.

### C2 — `<UserActivityFeed>` (route `/me/activity`)

Identical layout, except the loader filters by `ActorUserId = currentUserId` (from session, NEVER from `localStorage` — see Anti-Pattern #2 of `36-user-management/00-overview.md`). No `<ActorFilter>` component in the filter bar (always self).

### C3 — `<RestoreItemButton>` (per-row action on `ItemDeleted` rows)

The feed surface is read-only EXCEPT for the restore action on rows where:
- `EventType === 'ItemDeleted'`
- `OccurredAt > now() - 30 days` (still within trash retention per `mem://features/trash-logic`)
- The row's `TargetItemId` is still present in the `Trash` table

```tsx
function ItemDeletedRow({ event }: { event: ActivityEvent }) {
  const canRestore = isWithin30Days(event.OccurredAt);
  return (
    <Row>
      <RowSummary>{event.ActorUserId} deleted {event.TargetItemId}</RowSummary>
      {canRestore && <RestoreItemButton itemId={event.TargetItemId} />}
    </Row>
  );
}
```

The restore button does NOT directly insert an `ActivityEvent`. It calls `restoreItem({ itemId })` which is a normal editor action (`src/features/editor/actions/restoreItem.ts`) that flows through the standard capture pipeline (`02-capture-pipeline.md` Stage 1) and naturally produces an `ItemRestored` event.

> **MUST** the restore button trigger an editor action (`restoreItem`) that flows through `captureEvent` per `02-capture-pipeline.md` — directly inserting an `ItemRestored` row from the feed UI is forbidden `[gate: G-34-UI-RESTORE-VIA-CAPTURE]`.

> **MUST** the restore button be hidden (not just disabled) when `OccurredAt ≤ now() - 30 days` — clicking a stale button MUST be impossible because the underlying trash row no longer exists `[gate: G-34-UI-RESTORE-WINDOW]`.

---

## Realtime Updates (SSE)

Both feed components subscribe to `/stream/page/{pageId}` (or `/stream/user/{userId}`) via `openStream` from the SSE chokepoint (`src/realtime/sseClient.ts` per `35-enforcement-rules/04-boundary-enforcement.md` B4).

When an `event: activity` frame arrives, the component invalidates the React Router loader for the current route. The loader re-runs, reads the now-updated mirror, and re-renders. The SSE callback NEVER mutates state directly.

> **MUST** SSE `event: activity` callbacks invalidate the route loader (`router.revalidate()`) and return — directly calling `setState` or mutating React-Query/SWR cache from the SSE callback is forbidden because it bypasses the mirror-first contract `[gate: G-34-UI-SSE-INVALIDATE-ONLY]`.

---

## Anti-Patterns

| # | Anti-pattern | Why it fails | Gate |
|---|---|---|---|
| 1 | Feed loader calls `api.get('/activity/…')` directly | Violates ADR-0023 mirror-first contract; ≥16ms p95 on every nav. | `G-34-UI-MIRROR-FIRST` |
| 2 | Loader passes raw `params.cursor` to IDB | Bypasses cursor-shape regex; IDB throws cryptic error. | `G-34-UI-CURSOR-VALIDATE` |
| 3 | `default:` case in `RowByType` dispatcher | Hides new EventTypes; silent rendering bug. | `G-34-UI-EXHAUSTIVE-DISPATCHER` |
| 4 | Restore button calls `captureEvent('ItemRestored', …)` directly | Bypasses editor's restoreItem action; trash row never deleted. | `G-34-UI-RESTORE-VIA-CAPTURE` |
| 5 | Restore button shown but disabled when stale | User can right-click → inspect → trigger; no defense. | `G-34-UI-RESTORE-WINDOW` |
| 6 | SSE callback calls `setState` or `queryClient.setQueryData` | Bypasses mirror-first; UI shows data not in mirror. | `G-34-UI-SSE-INVALIDATE-ONLY` |
| 7 | Feed mounted under top-level `<AppErrorBoundary>` | Cursor-decode error tears down entire app. | `G-34-UI-NAMED-BOUNDARY` |
| 8 | Reading current user from `localStorage` | Forbidden by ADR-0021 + `36-user-management/` Anti-Pattern #2. | `G-36-CLIENT-NO-ROLE` (inherited) |

---

## Acceptance-Criteria Binds

| AT id | Component | Assertion summary |
|---|---|---|
| `AT-ACTIVITYFEED-10` | C1 loader | Loader reads from `ActivityEventMirror` (assertion: spy on `api.get` returns 0 calls during loader execution). |
| `AT-ACTIVITYFEED-11` | C1 dispatcher | Adding a 9th EventType without updating `RowByType` causes TS compile error (exhaustiveness check). |
| `AT-ACTIVITYFEED-12` | C3 restore window | `<RestoreItemButton>` is not rendered when `OccurredAt + 30d < now()`. |
| `AT-ACTIVITYFEED-13` | SSE realtime | `event: activity` frame triggers `router.revalidate()` exactly once; `queryClient` is not touched. |

Fixtures live in [`./97a-acceptance-criteria-fixtures.md`](./97a-acceptance-criteria-fixtures.md).

---

## Cross-References

| Reference | Location |
|---|---|
| Event schema (depended-on) | [`./01-event-schema.md`](./01-event-schema.md) |
| Capture pipeline (depended-on) | [`./02-capture-pipeline.md`](./02-capture-pipeline.md) |
| Retention & purge (sibling) | `./04-retention-and-purge.md` (pending) |
| Loader↔queue contract | ADR-0023 |
| Error boundaries (8 named) | ADR-0017 |
| SSE realtime contract | ADR-0025 |
| SSE chokepoint module | [`../35-enforcement-rules/04-boundary-enforcement.md`](../35-enforcement-rules/04-boundary-enforcement.md) §B4 |
| Trash retention 30d | `mem://features/trash-logic` |

---

## Related

- [`./00-overview.md`](./00-overview.md) — Parent overview (§"Pending Sub-Specs" row 03)
- [`./97-acceptance-criteria.md`](./97-acceptance-criteria.md) — AT registry
