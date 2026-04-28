# Activity Feed — Acceptance Criteria I/O Fixtures

> **Version:** 1.0.0
> **Created:** 2026-04-28 (UTC+8)
> **Status:** Normative companion to [`97-acceptance-criteria.md`](./97-acceptance-criteria.md).
> **Format spec:** [`spec/01-spec-authoring-guide/19-acceptance-criteria-io-table.md`](../01-spec-authoring-guide/19-acceptance-criteria-io-table.md)
> **Spawned by:** `.lovable/plans/00-active.md` § P2e.

---

## `AT-ACTIVITYFEED-01` — Exactly one event per mutation

| Slot | Value |
|------|-------|
| **Given** | Empty `ActivityEvent` table; user updates `itm_01.Content`. |
| **When** | Single mutation request. |
| **Then** | Exactly one row inserted with `EventType="ItemUpdated"`. |
| **Side effects** | `INSERT INTO ActivityEvent` executes once; idempotency key prevents duplicates on retry. |
| **Negative assertion** | Two rows MUST NOT appear; zero rows MUST NOT appear. |

## `AT-ACTIVITYFEED-02` — Event payload schema

| When | `GET /wp-json/workflowy/v1/activity?Limit=1`. |
|---|---|
| **Response envelope** | ```json
{ "Status":"OK", "Attributes":{"Count":1}, "Results":{ "Events":[ { "EventId":"evt_01HXYZ", "UserId":"usr_01", "ItemId":"itm_01", "EventType":"ItemUpdated", "Before":{"Content":"a"}, "After":{"Content":"b"}, "CreatedAt":"2026-04-28T03:00:00Z" } ] } }
``` |
| **Then** | All seven fields present, types match; `CreatedAt` matches `/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/`. |
| **Negative assertion** | Missing any field → server schema fails with `E_EVENT_INCOMPLETE`. |

## `AT-ACTIVITYFEED-03` — `EventType` enum

| Linter command | `rg -nP "EventType\s*[:=]\s*['\"]" src/ \| rg -vP "EventType\.(ItemCreated\|ItemUpdated\|ItemMoved\|ItemDeleted\|ItemRestored\|ItemMirrored\|BoardColumnReordered\|TemplateApplied)"` |
|---|---|
| **Expected exit code** | `1` |
| **Negative assertion** | A magic-string event type outside the documented set MUST fail. |

## `AT-ACTIVITYFEED-04` — Dedicated `activity.db`

| Linter command | `rg -nP "activity\.db" src/server/` |
|---|---|
| **Expected exit code** | `0` |
| **Negative assertion** | Opening `ActivityEvent` table on user-data DB MUST throw `E_ACTIVITY_WRONG_DB`. |

## `AT-ACTIVITYFEED-05` — Indexing

| When | `pragma index_list('ActivityEvent')`. |
|---|---|
| **Then** | Index `IX_ActivityEvent_UserId_CreatedAt` exists with columns `(UserId ASC, CreatedAt DESC)`. |

## `AT-ACTIVITYFEED-06` — `Before`/`After` as JSON columns

| When | `pragma table_info('ActivityEvent')`. |
|---|---|
| **Then** | `Before` and `After` columns have `TEXT` affinity AND a CHECK that `json_valid(Before)=1`; raw blobs without JSON validation fail. |

## `AT-ACTIVITYFEED-07` — Default page size 50

| When | `GET /wp-json/workflowy/v1/activity` (no `Limit` param). |
|---|---|
| **Response envelope** | ```json
{ "Status":"OK", "Attributes":{"Count":50,"Limit":50}, "Results":{ "Events":[ /* 50 items */ ] } }
``` |
| **Then** | `Results.Events.length === 50`; `Limit > 250` rejected with `E_LIMIT_OVERFLOW`. |

## `AT-ACTIVITYFEED-08` — Server-side filters

| When | `GET /activity?EventType=ItemMoved&UserId=usr_42&From=2026-04-01&To=2026-04-30&ItemSubtree=itm_root`. |
|---|---|
| **Then** | SQL `WHERE` includes all four filters; rows outside the filter are never serialized. |

## `AT-ACTIVITYFEED-09` — Per-item history from context menu

| Given | Item context menu open on `itm_01`. |
|---|---|
| **Then** | Menu contains entry `data-action="view-history"`; activating it routes to `/items/itm_01/history`. |

## `AT-ACTIVITYFEED-10` — "Restore to this state" reapplies inverse

| Given | Event `evt_99` of type `ItemUpdated`, `Before={Content:"a"}`, `After={Content:"b"}`. Current `Item.Content = "b"`. |
|---|---|
| **When** | `POST /wp-json/workflowy/v1/activity/evt_99:restore`. |
| **Then** | `Item.Content` becomes `"a"` (the `Before` snapshot); response includes `Results.Restored.Fields = ["Content"]`. |
| **Negative assertion** | Fields not present in `Before` MUST NOT be silently dropped. |

## `AT-ACTIVITYFEED-11` — TemplateApplied is partial; UI warns

| Given | Event `evt_77` of type `TemplateApplied`. |
|---|---|
| **When** | User clicks Restore in UI. |
| **Then** | A confirmation dialog appears with copy `"Partial restore — only structural fields will revert. Continue?"`; cancel aborts; confirm proceeds. |
| **Negative assertion** | Other event types MUST NOT show this dialog. |

## `AT-ACTIVITYFEED-12` — Restore itself emits an event

| Given | Restore of `evt_99` succeeds. |
|---|---|
| **Then** | A new row `evt_100` is inserted with `EventType="ItemRestored"` and `Before/After` snapshots reflecting the restore. |
| **Negative assertion** | Restore MUST NOT bypass the audit emitter. |

## `AT-ACTIVITYFEED-13` — 30-day default retention

| Linter command | `rg -nP "activityRetentionDays" src/config/ && rg -nP "default:\s*30" src/config/activity*` |
|---|---|
| **Expected exit code** | `0` |

## `AT-ACTIVITYFEED-14` — Weekly purge logs + protects in-flight restores

| Given | 100 events older than retention; one of them is mid-restore (lock held). |
|---|---|
| **When** | Purge job runs. |
| **Then** | INFO log `activity.purge deleted=99 skipped=1 reason=in-flight-restore`; the locked event remains. |

## `AT-ACTIVITYFEED-15` — Per-user / per-share visibility

| Given | `usr_A` owns `itm_X`; `usr_B` is shared (Editor); `usr_C` is uninvolved. |
|---|---|
| **When** | Each user calls `GET /activity?ItemId=itm_X`. |
| **Then** | `usr_A`/`usr_B` → events visible. `usr_C` → empty `Results.Events` (`Status:"OK"`, `Attributes.Count=0`); never `403` to avoid existence leak. |

## `AT-ACTIVITYFEED-16` — Admin cross-user access via `hasRole`

| Given | `usr_admin` requests `GET /activity?UserId=usr_C`. |
|---|---|
| **Then** | Server-side stack frame calls `hasRole(usr_admin,'Admin')` before authorizing; if helper returns false → `E_FORBIDDEN`; if true → events returned. |
| **Negative assertion** | No inline `=== 'Admin'` comparison in the route. |

---

## Verification

```bash
grep -rn "AT-ACTIVITYFEED-" spec/34-activity-feed/97a-acceptance-criteria-fixtures.md | wc -l   # → 16
node scripts/spec-hygiene/00-run-all.mjs
```

## Related

- [`97-acceptance-criteria.md`](./97-acceptance-criteria.md) — Prose rollup
- [`spec/36-user-management/97a-acceptance-criteria-fixtures.md`](../36-user-management/97a-acceptance-criteria-fixtures.md) — `hasRole` fixtures

*P2e/B — created 2026-04-28 (UTC+8). Covers 16/16 activity-feed ATs.*
