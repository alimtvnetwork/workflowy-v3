# Trash Reaper Flow

> **Version:** 1.1.0
> **Created:** 2026-04-27 (UTC+8) — F11 (No-Questions Mode); v1.1.0 fixed cross-flow link asymmetries (F25)
> **Status:** Canonical — cross-feature flow
> **Parent:** [`00-overview.md`](./00-overview.md)
> **SSOT for the underlying feature:** [`spec/31-app/01-features/11b-trash-reaper.md`](../01-features/11b-trash-reaper.md)
> **Endpoint contract:** [`spec/31-app/06-endpoints/11b-trash-reaper.md`](../06-endpoints/11b-trash-reaper.md)

---

## Why this file exists

`01-features/11b-trash-reaper.md` describes the 30-day hard-delete policy and the `ReaperRuns` audit row. `01-features/09b-mirror-peer-group-model.md` §AT-APP-64 pins peer-group auto-dissolution on size→1. Neither file describes the **end-to-end batch sequence** of "scheduler ticks → batch select → cascade delete → group dissolve check → audit insert → SSE broadcast". Without this flow, AI implementers either (a) skip the per-batch transaction boundary and corrupt counts on partial failure, or (b) forget the post-cascade group-dissolve trigger and leave singleton peer-groups dangling.

This file pins the sequence. Each step cites the SSOT that governs its rule.

---

## Actors

| Actor | Role |
|-------|------|
| Cron scheduler | Triggers `EP-REAPER-RUN` daily at 03:00 UTC. |
| WP REST handler (PHP) | Authorizes (server-token only), batches, deletes, audits. |
| App DB (workspace) | Owns `Items`, `MirrorPeerGroupMembers`, `ItemGrants`, `ReaperRuns`. |
| FK constraints | Cascade-delete children, peer-group memberships, grants on `Items` row removal. |
| Group-dissolve trigger | DB trigger on `MirrorPeerGroupMembers` AFTER DELETE — auto-dissolves singletons. |
| SSE channel | Broadcasts `items.purged` and `mirrors.dissolved` to peers. |

---

## Preconditions

- Caller presents valid server-token header (`X-WorkFlowy-Reaper-Token`); user-tokens are rejected with 403.
- `OptionNameType::REAPER_RETENTION_DAYS` resolves to `30` (per `mem://features/trash-logic`; the policy is fixed, not per-account).
- `ReaperRuns` table exists (`02-app-schema.sql` v2.1.0).
- The previous run completed (advisory lock prevents overlap).

---

## Sequence

```
1. Cron fires at 03:00 UTC → POST /api/admin/reaper/run
2. PHP handler:
     a. Verify X-WorkFlowy-Reaper-Token equals env(REAPER_TOKEN). Else 403.
     b. Acquire pg_advisory_lock(REAPER_LOCK_KEY). If busy → 409 (skip this tick).
     c. cutoff = serverNow - INTERVAL '30 days'
     d. runId = uuid_generate_v4(); rowsDeleted = 0; t0 = monotonic_now().
     e. LOOP (batch size = 1000):
          BEGIN TRANSACTION.
            SELECT ItemId
              FROM Item
             WHERE DeletedAt IS NOT NULL
               AND DeletedAt < cutoff
             ORDER BY DeletedAt ASC
             LIMIT 1000
             FOR UPDATE SKIP LOCKED.
            If 0 rows → COMMIT and break out of loop.
            DELETE FROM Item WHERE ItemId = ANY($batch).
            (FK ON DELETE CASCADE removes:
               - child Items rows (recursive cascade per AT-APP-83)
               - MirrorPeerGroupMembers rows
               - ItemGrants rows)
            (AFTER-DELETE trigger on MirrorPeerGroupMembers checks each
              affected PeerGroupId; if surviving member count = 1, deletes
              the MirrorPeerGroup row and nulls the survivor's PeerGroupId
              per AT-APP-64.)
            rowsDeleted += $batch.size.
          COMMIT.
     f. durationMs = monotonic_now() - t0.
     g. INSERT INTO ReaperRuns (Id, RanAt, RowsDeleted, DurationMs)
          VALUES (runId, serverNow, rowsDeleted, durationMs).
     h. Release advisory lock.
3. Server emits SSE on the workspace channel:
     - `items.purged`        with { count: rowsDeleted }
     - `mirrors.dissolved`   with { groupIds: [...] }   (one event per dissolved group)
4. Client (if connected) refreshes Trash counts and any open mirror peer-group views.
```

> **Batch boundary rationale:** Per-batch COMMIT bounds lock duration and lets the reaper resume cleanly after a crash without holding a multi-hour transaction. The `FOR UPDATE SKIP LOCKED` clause makes concurrent restore operations on adjacent rows non-blocking.

---

## Failure modes

| Failure | HTTP | Recovery |
|---------|------|----------|
| 403 — bad/missing reaper token | 403 | Operator inspects `REAPER_TOKEN` env. No retry until fixed. |
| 409 — advisory lock held (overlap) | 409 | Skip; next cron tick (24 h later) tries again. |
| Batch DELETE fails mid-run | (n/a) | Per-batch ROLLBACK; partial progress preserved in prior batches; `ReaperRuns` row is NOT inserted; next run resumes from oldest still-trashed row. |
| FK-cascade orphan trigger error | 500 | ROLLBACK current batch only; manual investigation; `ReaperRuns` row not inserted. |
| Group-dissolve trigger raises | 500 | Same as above; the trigger MUST be deterministic (see `09a-mirror-cycle-detection.md`). |
| SSE broadcast fails | (n/a) | 5 s poll fallback per `14-concurrency-and-sync.md` §14.1. |

---

## Idempotency

The reaper is naturally idempotent at the **row level** — once a row is hard-deleted, it cannot be selected again. The advisory lock provides idempotency at the **run level** (overlapping cron fires return 409 instead of double-processing). No `X-WorkFlowy-Idempotency-Key` is required.

If the same `runId` were ever re-inserted into `ReaperRuns`, the PRIMARY KEY constraint would reject it — making the audit row insert atomically tied to a single physical run.

---

## Forbidden in implementations

- ❌ Running the reaper without `pg_advisory_lock` — produces double-counted `ReaperRuns` rows on overlapping ticks.
- ❌ Using a single transaction for all batches — holds locks for hours and blocks restores.
- ❌ Skipping `FOR UPDATE SKIP LOCKED` — concurrent restore operations would deadlock.
- ❌ Manually deleting `MirrorPeerGroupMembers` rows in PHP instead of relying on the FK + trigger — splits the dissolve guarantee across two code paths.
- ❌ Inserting `ReaperRuns` BEFORE the loop completes — fails AT-APP-85 (audit row reflects actual `RowsDeleted`).
- ❌ Reading `DeletedAt` with `empty($row->DeletedAt)` — use `$row->DeletedAt < $cutoff` per `00-overview.md` §Boolean Conventions.
- ❌ Emitting `items.purged` SSE before COMMIT of any batch (the SSE may arrive before the row count is final, but never before durability).

---

## Acceptance Tests (canonical)

| ID | Canonical | Source | Scenario | Expected |
|----|-----------|--------|----------|----------|
| `AT-WF-REAPER-01` | `AT-APP-81` | This flow | Reaper runs daily at 03:00 UTC, batch=1000 | Items with `DeletedAt < now - 30d` are hard-deleted in batches |
| `AT-WF-REAPER-02` | `AT-APP-82` | This flow | Items with `DeletedAt = now - 29d` survive a pass | Row remains restorable; not selected by cutoff filter |
| `AT-WF-REAPER-03` | `AT-APP-83` | This flow | Reaper deletes a parent Item with children + grants | FK CASCADE removes children, `MirrorPeerGroupMembers`, `ItemGrants` |
| `AT-WF-REAPER-04` | `AT-APP-84` | This flow | Reap drops a peer-group to size 1 | AFTER-DELETE trigger auto-dissolves group in same transaction |
| `AT-WF-REAPER-05` | `AT-APP-85` | This flow | Reaper run completes | One `ReaperRuns(Id, RanAt, RowsDeleted, DurationMs)` row inserted |

> ✅ **Canonical-mapped:** each `AT-WF-REAPER-NN` maps 1:1 to an `AT-APP-NN` row in [`spec/31-app/97-acceptance-criteria.md`](../97-acceptance-criteria.md). Canonical column is authoritative.

---

## Related

- [`04-trash-restore-flow.md`](./04-trash-restore-flow.md) — **inverse window**: restore re-surfaces a soft-deleted row before reaper claims it; reaper finalises rows that were never restored within 30 days
- [`06-search-query-flow.md`](./06-search-query-flow.md) — search excludes `DeletedAt IS NOT NULL` items, so reaper output is invisible to queries
- [`07-sync-replay-flow.md`](./07-sync-replay-flow.md) — replay returns HTTP 410 when an in-flight queued mutation targets a row this reaper has already hard-deleted
- [`08-mirror-detach-flow.md`](./08-mirror-detach-flow.md) — reaper-side hard-delete cascades into peer-group membership; auto-dissolve on size→1 reuses the detach-flow's trigger path
- [`10-migration-execution-flow.md`](./10-migration-execution-flow.md) — bootstrap-time singleton-sweep (M-117) is a one-shot mimic of this reaper's auto-dissolve cascade
- [`../01-features/11b-trash-reaper.md`](../01-features/11b-trash-reaper.md) — feature-level SSOT
- [`../01-features/09b-mirror-peer-group-model.md`](../01-features/09b-mirror-peer-group-model.md) §AT-APP-64 — peer-group auto-dissolve on size→1
- [`../06-endpoints/11b-trash-reaper.md`](../06-endpoints/11b-trash-reaper.md) — endpoint contract (EP-REAPER-RUN, EP-REAPER-RUNS-LIST)
- [`../07-db-diagram/sql/02-app-schema.sql`](../07-db-diagram/sql/02-app-schema.sql) — `ReaperRuns` DDL
