# Retention & Purge — Sub-Spec

> **Version:** 1.0.0 — authored 2026-04-30
> **Owner section:** `spec/34-activity-feed/`
> **Status:** Draft (P1 — load-bearing for `AT-ACTIVITYFEED-14..16` and gates `G-34-RP-*`).
> **Parent:** [`./00-overview.md`](./00-overview.md)
> **Siblings:** [`./01-event-schema.md`](./01-event-schema.md) · [`./02-capture-pipeline.md`](./02-capture-pipeline.md) · [`./03-feed-ui.md`](./03-feed-ui.md)

---

## AI Contract

**Purpose** — Define the **30-day retention policy** for `ActivityEvent` rows and the deterministic **purge job** that enforces it on both the WordPress-plugin SQLite store and the per-tab IndexedDB mirror.

**Audience** — Backend engineers wiring the WP-Cron purge handler; frontend engineers wiring the IDB-mirror compaction worker.

**Expected AI Output** —
- `wp-plugin/includes/Activity/PurgeJob.php` (WP-Cron handler)
- `wp-plugin/includes/Activity/PurgeJob.test.php` (PHPUnit, retention boundary cases)
- `src/lib/activity/purgeMirror.ts` (IDB-mirror compactor)
- `src/lib/activity/purgeMirror.test.ts` (Vitest, cursor-stability cases)

**Out of Scope** —
- Trash retention (covered by [`mem://features/trash-logic`](mem://features/trash-logic) and `spec/31-app/01-features/19-trash-logic/`)
- Long-term audit-log export — see [`spec/15-wp-plugin-how-to/23-operator-runbooks/`](../15-wp-plugin-how-to/23-operator-runbooks/)
- Per-user retention overrides (deferred — not in P1 scope)

**Definition of Done** —
- `AT-ACTIVITYFEED-14` (purge deletes events with `OccurredAt < now − 30d`) passes.
- `AT-ACTIVITYFEED-15` (purge is idempotent and replay-safe) passes.
- `AT-ACTIVITYFEED-16` (mirror compaction never deletes an event still referenced by an open feed cursor) passes.
- `node scripts/spec-hygiene/00-run-all.mjs` exits 0.

---

## Retention Policy (Closed Constants)

| Constant | Value | Rationale | Gate |
|---|---|---|---|
| `RETENTION_DAYS` | **30** | Mirrors trash-retention parity ([`mem://features/trash-logic`](mem://features/trash-logic)) | `G-34-RP-RETENTION-30D` |
| `PURGE_INTERVAL` | **daily** (00:15 UTC) | Off-peak; aligns with WP-Cron defaults | `G-34-RP-PURGE-DAILY` |
| `PURGE_BATCH_SIZE` | **5,000 rows / tx** | Keeps SQLite write-lock <250 ms p95 | `G-34-RP-BATCH-CAP` |
| `MIRROR_COMPACT_INTERVAL` | **on each new SSE batch** | Piggybacks an already-open IDB tx (no extra wakeups) | `G-34-RP-MIRROR-PIGGYBACK` |

> **Forbidden:** any code path that deletes `ActivityEvent` rows outside the purge job, or that reads `RETENTION_DAYS` from a runtime config (must be a build-time constant) — gate `G-34-RP-NO-AD-HOC-DELETE`.

---

## Server-Side Purge (WP-Plugin)

### 1. Trigger

- WP-Cron schedule: `workflowy_activity_purge_daily` registered with `wp_schedule_event(time(), 'daily', …)` at plugin activation.
- Handler: `WorkFlowy\Activity\PurgeJob::run()`.
- **MUST** also be invocable from CLI: `wp workflowy activity purge --dry-run` (gate `G-34-RP-CLI-DRY-RUN`).

### 2. Algorithm

```
cutoffIso  = clock.nowIso() − 30 days        # injected clock per ADR-0027
totalPurged = 0
loop:
  rows = SELECT ActivityEventId
         FROM ActivityEvent
         WHERE PurgeAfter <= :cutoffIso
         ORDER BY ActivityEventId ASC
         LIMIT 5000;
  if rows is empty: break
  BEGIN TRANSACTION
    DELETE FROM ActivityEvent
    WHERE ActivityEventId IN (rows);
  COMMIT
  totalPurged += count(rows)
emit Telemetry { Event: "ActivityPurgeRun", Purged: totalPurged, CutoffIso: cutoffIso }
```

**MUST** filter by the pre-computed `PurgeAfter` column (defined in [`./01-event-schema.md` §`G-34-ES-PURGE-AFTER-COMPUTED`](./01-event-schema.md)) — never recompute `OccurredAt + 30d` in the WHERE clause (gate `G-34-RP-USE-PURGE-AFTER-COL`). This keeps the index `IX_ActivityEvent_PurgeAfter` covering.

### 3. Idempotency & Re-Entrancy

- The job **MUST** acquire a SQLite advisory lock (`PRAGMA locking_mode = EXCLUSIVE` inside the tx) — concurrent invocations from CLI + Cron MUST serialize, never interleave (gate `G-34-RP-EXCLUSIVE-LOCK`).
- Re-running the job within the same minute **MUST** be a no-op (cutoff unchanged, no rows match) — verified by `AT-ACTIVITYFEED-15`.
- A failed batch **MUST NOT** advance the cursor; the next run picks up from the same `PurgeAfter` boundary (gate `G-34-RP-NO-PARTIAL-COMMIT`).

### 4. Telemetry & Observability

| Field | Type | Purpose |
|---|---|---|
| `Event` | `"ActivityPurgeRun"` | Closed constant |
| `Purged` | integer | Total rows deleted this run |
| `CutoffIso` | ISO-8601 UTC | The retention cutoff applied |
| `DurationMs` | integer | End-to-end wall time |
| `BatchCount` | integer | Number of 5k batches processed |

Emitted via the standard telemetry sink defined in [`spec/06-telemetry-and-logging/`](../06-telemetry-and-logging/). Forbidden: `error_log()`, `var_dump()`, or any direct PHP write to stderr (gate `G-34-RP-NO-DIRECT-LOG`).

---

## Client-Side Mirror Compaction

### 1. Trigger

- Runs piggy-backed on every successful SSE batch apply (the IDB tx is already open per ADR-0023).
- Standalone trigger only on cold-start of the activity-feed route (one-shot).

### 2. Algorithm

```
cutoffIso = clock.nowIso() − 30 days
openCursors = ActivityFeedStore.getOpenCursors()  # see ./03-feed-ui.md
oldestPinnedIso = openCursors.minBy(c => c.cursorIso) ?? cutoffIso
effectiveCutoff = min(cutoffIso, oldestPinnedIso)

idb.tx('ActivityEventMirror', 'readwrite', tx => {
  const idx = tx.objectStore('ActivityEventMirror').index('PurgeAfter');
  const range = IDBKeyRange.upperBound(effectiveCutoff);
  for await (const cursor of idx.iterate(range)) {
    cursor.delete();
  }
});
```

- **MUST** clamp the cutoff to the oldest open feed cursor — deleting an event still referenced by a paginated cursor would invalidate the cursor and break the "stable descending sort" invariant from [`./03-feed-ui.md`](./03-feed-ui.md) (gate `G-34-RP-CURSOR-PIN`).
- **MUST** use the `PurgeAfter` IDB index — never scan the full object store (gate `G-34-RP-MIRROR-INDEX-ONLY`).
- **MUST NOT** enqueue any FIFO sync entries — purge is local-mirror cleanup only; the server purge is authoritative (gate `G-34-RP-MIRROR-NO-FIFO`).

### 3. Cold-Start Bound

On route mount, mirror compaction **MUST** complete in ≤50 ms p95 for a mirror of ≤10,000 rows; otherwise it MUST yield to the next idle tick (`requestIdleCallback`) and resume (gate `G-34-RP-COMPACT-BUDGET`).

---

## Acceptance Criteria (Bound Here)

| AT id | Given | When | Then | Negative |
|---|---|---|---|---|
| `AT-ACTIVITYFEED-14` | A row with `OccurredAt = now − 31d` exists | `PurgeJob::run()` is invoked | The row is deleted; a row with `OccurredAt = now − 29d` is NOT deleted | A row with `OccurredAt = now − 30d − 1ms` MUST be deleted; a row with `OccurredAt = now − 30d + 1ms` MUST be retained |
| `AT-ACTIVITYFEED-15` | The purge job has just completed | `PurgeJob::run()` is invoked again within the same minute | Zero rows deleted; telemetry emitted with `Purged: 0` | A second invocation MUST NOT raise an error or advance any cursor |
| `AT-ACTIVITYFEED-16` | A feed cursor is open at `cursorIso = now − 25d` | Mirror compaction runs with `cutoffIso = now − 30d` and a row at `OccurredAt = now − 28d` exists | The row is retained (clamped by cursor pin); compaction returns successfully | The row MUST NOT be deleted while the cursor remains open |

Fixtures live in [`./97a-acceptance-criteria-fixtures.md`](./97a-acceptance-criteria-fixtures.md) (rows `at-activityfeed-14..16`). Test names: `at_activity_feed_14_purge_30d_boundary`, `at_activity_feed_15_purge_idempotent`, `at_activity_feed_16_mirror_cursor_pin`.

---

## Gate Bindings (10 new gates, namespace `G-34-RP-*`)

| Gate id | MUST | Tier | Enforced by |
|---|---|---|---|
| `G-34-RP-RETENTION-30D` | Retention constant is exactly 30 days, build-time | DOC | Code review + grep for `RETENTION_DAYS = 30` |
| `G-34-RP-PURGE-DAILY` | Purge runs daily at 00:15 UTC via WP-Cron | DOC | `scripts/spec-hygiene/` cron-schedule check |
| `G-34-RP-BATCH-CAP` | Each tx deletes ≤5,000 rows | DOC | PHPUnit perf assertion |
| `G-34-RP-MIRROR-PIGGYBACK` | Mirror compaction shares the SSE-apply IDB tx | DOC | Code review |
| `G-34-RP-NO-AD-HOC-DELETE` | Only `PurgeJob` may DELETE from `ActivityEvent` | DOC | grep: no `DELETE FROM ActivityEvent` outside `PurgeJob.php` |
| `G-34-RP-CLI-DRY-RUN` | `wp workflowy activity purge --dry-run` is supported | DOC | PHPUnit smoke test |
| `G-34-RP-USE-PURGE-AFTER-COL` | WHERE clause uses `PurgeAfter` column, not recomputed expression | DOC | grep: forbid `OccurredAt.*\\+.*INTERVAL` in `PurgeJob.php` |
| `G-34-RP-EXCLUSIVE-LOCK` | Purge tx uses `PRAGMA locking_mode = EXCLUSIVE` | DOC | Code review |
| `G-34-RP-NO-PARTIAL-COMMIT` | A failed batch leaves the cutoff cursor unchanged | DOC | PHPUnit fault-injection test |
| `G-34-RP-CURSOR-PIN` | Mirror compaction clamps cutoff to oldest open feed cursor | DOC | Vitest cursor-pin test |

(Sub-set above is the load-bearing 10; full 14-gate list including `G-34-RP-MIRROR-INDEX-ONLY`, `G-34-RP-MIRROR-NO-FIFO`, `G-34-RP-COMPACT-BUDGET`, `G-34-RP-NO-DIRECT-LOG` is registered in [`spec/_GATE-REGISTRY.md`](../_GATE-REGISTRY.md) under namespace `G-34-RP-*`.)

---

## Anti-Pattern Table

| Anti-pattern | Why it fails | Gate violated |
|---|---|---|
| `DELETE FROM ActivityEvent WHERE OccurredAt < datetime('now', '-30 days')` outside `PurgeJob` | Bypasses idempotency, telemetry, and lock; breaks audit invariants | `G-34-RP-NO-AD-HOC-DELETE` |
| Recomputing `OccurredAt + INTERVAL 30 DAY` in the WHERE clause | Disables index `IX_ActivityEvent_PurgeAfter`; full-scan kills SQLite | `G-34-RP-USE-PURGE-AFTER-COL` |
| Mirror compaction deletes a row referenced by an open cursor | Next page-fetch returns hole; pagination breaks | `G-34-RP-CURSOR-PIN` |
| Purge job uses `Date.now()` directly | Untestable; flakes on retention boundary | ADR-0027 (clock injection) |
| Logging via `error_log("purged $n")` | Bypasses telemetry sink; no observability | `G-34-RP-NO-DIRECT-LOG` |
| Mirror compaction enqueues a FIFO entry to "delete on server too" | Double-delete; server purge is authoritative | `G-34-RP-MIRROR-NO-FIFO` |

---

## Cross-References

| Reference | Location |
|---|---|
| Event schema (`PurgeAfter` column) | [`./01-event-schema.md`](./01-event-schema.md) |
| Capture pipeline (sets `PurgeAfter` at insert) | [`./02-capture-pipeline.md`](./02-capture-pipeline.md) |
| Feed UI (cursor pinning) | [`./03-feed-ui.md`](./03-feed-ui.md) |
| Trash 30-day parity | [`mem://features/trash-logic`](mem://features/trash-logic) |
| Telemetry sink | [`../06-telemetry-and-logging/00-overview.md`](../06-telemetry-and-logging/00-overview.md) |
| Loader↔queue contract | ADR-0023 |
| Clock injection | ADR-0027 |

---

*Sub-spec v1.0.0 — closes the `34-activity-feed/` cluster — 2026-04-30*
