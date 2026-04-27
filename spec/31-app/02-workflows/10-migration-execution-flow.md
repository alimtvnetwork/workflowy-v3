# Migration Execution Flow — v1 → v2 Mirror Peer-Group

> **Version:** 1.0.0
> **Created:** 2026-04-27 (UTC+8) — F17 (No-Questions Mode)
> **Status:** Canonical — operational runbook flow
> **Parent:** [`00-overview.md`](./00-overview.md)
> **SQL-detail SSOT:** [`../07-db-diagram/07-migrations.md`](../07-db-diagram/07-migrations.md) §"v1→v2 Mirror Peer-Group Migration — Execution Plan"
> **DDL files:** [`../07-db-diagram/sql/07-migration-v2-mirror-peer-groups.sql`](../07-db-diagram/sql/07-migration-v2-mirror-peer-groups.sql)
> **Related runtime flows:** [`08-mirror-detach-flow.md`](./08-mirror-detach-flow.md), [`09-mirror-create-flow.md`](./09-mirror-create-flow.md)
> **Feature SSOT:** [`../01-features/09b-mirror-peer-group-model.md`](../01-features/09b-mirror-peer-group-model.md)

---

## Why this file exists

`07-db-diagram/07-migrations.md` is the **SQL-detail SSOT**: it pins which `M-NN` slot owns which DDL change, what `PRAGMA`s set what state, and which file backs which step. That document treats the migration as one App DB at a time.

This workflow file is the **operational runbook**: the WP-plugin bootstrap fans out across **N workspaces** (one App DB each), must report progress per-workspace, must not block runtime requests on workspaces still on v1, and must surface partial-success states (3/N succeeded, 1/N failed pre-flight) to the admin without losing the per-DB rollback paths.

Without this flow, AI implementers either (a) serialize migrations and block first-request latency on the slowest DB, (b) parallelize without per-DB locking and corrupt mid-flight workspaces, or (c) emit `migration.complete` SSE before the cross-workspace `wp_options` audit row is written, leaving the audit log under-counting.

This file pins the orchestration sequence. SQL-step authority remains with `07-migrations.md`.

---

## Actors

| Actor | Role |
|-------|------|
| WP-plugin bootstrap | Detects activation/upgrade; iterates registered workspaces. |
| Per-DB migration worker | Runs the 10-step sequence from `07-migrations.md` against one App DB file. |
| Admin notifier | Surfaces aggregate success/failure to wp-admin. |
| Backup helper | Writes `.pre-v2.bak` files; verifies fsync. |
| App DB (workspace) | Target — owns `Mirror`, `MirrorOfItemId` pre-migration; `MirrorGroup`, `MirrorMember`, `Items.PeerGroupId` post. |
| Audit channel | `wp_options` row `workflowy_migration_v2_{WorkspaceId}` — survives DB file replacement. |
| Runtime REST handler | MUST refuse mirror writes on a v1 DB during migration (returns **HTTP 503 Retry-After**); MUST return **HTTP 410** on legacy `Mirrors`-table writes after migration completes (per `AT-APP-67`). |

---

## Preconditions

- WP-plugin runtime is **activated** (or freshly upgraded across the v1→v2 boundary).
- The plugin's `wp_options` row `workflowy_schema_version` is `< 2`, OR at least one registered workspace's App DB has `PRAGMA user_version < 2`.
- The hosting filesystem has **≥ 2× the largest App DB's size** free, for backup files (pre-flight check #4 in `07-migrations.md`).
- SQLite available to the runtime is **≥ 3.35.0** (required for `ALTER TABLE … DROP COLUMN` in M-117); otherwise the entire batch aborts before any backup is written.
- No long-running cron is mid-iteration (the trash reaper, per [`05-trash-reaper-flow.md`](./05-trash-reaper-flow.md), uses the same DB; the bootstrap MUST acquire the cron lock before starting).

---

## Sequence

```
1. WP-plugin bootstrap fires (activation or upgrade hook).
2. Bootstrap reads wp_options.workflowy_schema_version.
   IF >= 2 → skip (idempotent re-activation), exit.
3. Bootstrap performs pre-flight gate (single-shot, blocks all workspaces):
     a. Check SQLite version >= 3.35.0. If not → log + admin notice, exit.
     b. Acquire global "schema-migration" lock in wp_options
        (key: workflowy_migration_lock, value: {pid, ts}).
     c. Snapshot list of registered workspace IDs (frozen for this run).
4. Bootstrap iterates workspaces SERIALLY (one App DB at a time):
     For each WorkspaceId W:
       a. Acquire per-workspace cron lock (blocks the reaper for W).
       b. Open App DB file for W.
       c. Per-DB pre-flight (per 07-migrations.md §Pre-flight checks 1..4):
            - PRAGMA user_version → if >= 2, mark W as "already v2", continue.
            - Verify legacy Mirror table presence (or absence + new tables → mark v2).
            - Write file backup workflowy_app_{W}.db.pre-v2.bak; fsync.
              If backup fails → record W as FAILED_PREFLIGHT, release locks, continue.
       d. Per-DB execution (per 07-migrations.md §Execution sequence steps 1..10):
            - PRAGMA foreign_keys = OFF
            - BEGIN TRANSACTION
            - M-115: CREATE TABLE MirrorGroup, MirrorMember (IF NOT EXISTS)
            - M-116: backfill from Mirror (WHERE NOT EXISTS guards)
            - Detect singletons (per 07-migrations.md §Failure mode 2):
                SELECT MirrorGroupId FROM MirrorMember
                  GROUP BY MirrorGroupId HAVING COUNT(*) = 1;
                For each singleton g: DELETE FROM MirrorGroup WHERE MirrorGroupId = g;
                (matches the auto-dissolve trigger semantics from
                 08-mirror-detach-flow.md without invoking the trigger itself)
            - M-117: DROP INDEX legacy mirror indexes;
                     DROP TABLE Mirror;
                     ALTER TABLE Item DROP COLUMN MirrorOfItemId
            - M-118: CREATE TABLE ReaperRuns + IdxReaperRuns_RanAt (IF NOT EXISTS)
            - Recreate v2 indexes (IF NOT EXISTS)
            - PRAGMA user_version = 2
            - COMMIT
            - PRAGMA foreign_keys = ON
       e. Per-DB post-step:
            - Write wp_options row workflowy_migration_v2_{W} = ISO8601(now)
              (survives DB file replacement; cross-instance audit)
            - Release per-workspace cron lock.
            - Record W as SUCCEEDED.
       f. On any per-DB exception:
            - ROLLBACK (auto on transaction error)
            - Release locks
            - Record W as FAILED_EXECUTION with the exception message
            - Continue to next workspace (do NOT abort the whole batch)
5. Bootstrap aggregates results:
     - {SUCCEEDED: [...], ALREADY_V2: [...], FAILED_PREFLIGHT: [...], FAILED_EXECUTION: [...]}
6. IF FAILED_PREFLIGHT ∪ FAILED_EXECUTION is empty:
     - Write wp_options.workflowy_schema_version = 2.
     - Emit SSE workspace_admin event `migration.batch.complete` with the aggregate.
     ELSE:
     - Leave workflowy_schema_version unchanged (still < 2).
     - Surface a wp-admin notice listing failed workspaces.
     - Re-run is safe: SUCCEEDED workspaces skip immediately at step 4c;
       failed ones retry from step 4c with their existing backup intact.
7. Release the global schema-migration lock.
```

> **Single-batch principle:** One bootstrap invocation = one snapshotted workspace list = one aggregate report. New workspaces registered mid-batch are NOT migrated until the next bootstrap. This guarantees the aggregate count is meaningful and the global lock is bounded.

---

## Failure modes

| Failure | Detection | Response |
|---------|-----------|----------|
| SQLite < 3.35 | Step 3a | Abort entire batch before any backup; admin notice "SQLite upgrade required to ≥ 3.35.0 for v2 migration". |
| Global lock already held (concurrent activation) | Step 3b | Exit immediately; the holding process owns the run. |
| Backup write fails for a workspace | Step 4c | Mark `FAILED_PREFLIGHT`; do NOT proceed to step 4d for that workspace. The DB is untouched. |
| Per-workspace cron contention (reaper running) | Step 4a (lock acquire timeout) | Mark `FAILED_PREFLIGHT` with reason "cron busy"; retry in next bootstrap. |
| Orphan `Mirror` row references deleted `Item` | Step 4d M-116 (per `07-migrations.md` §Failure mode 1) | Log warning, continue — orphans dropped (matches v2 semantics; per `mem://features/mirroring`). |
| Singleton group post-backfill | Step 4d singleton sweep | Delete in same transaction (no-trigger version of [`08-mirror-detach-flow.md`](./08-mirror-detach-flow.md) §auto-dissolve). |
| `ALTER TABLE … DROP COLUMN` raises | Step 4d M-117 | ROLLBACK fires automatically; per-DB recovery is "stop runtime, restore `.pre-v2.bak`, fix root cause, re-run". |
| Crash between COMMIT (step 4d) and `wp_options` audit (step 4e) | Next bootstrap detects `user_version = 2` but no `workflowy_migration_v2_{W}` row | Step 4c short-circuits ("already v2"); audit row written then. The DB is correct; only the audit timestamp is the next bootstrap's `now()` instead of the original. Logged as `AUDIT_LATE`. |
| Crash mid-batch (worker process dies after some workspaces) | Global lock stays held until lock TTL expires (default 1h) OR manual clear | After lock clears, next bootstrap resumes from the remaining workspaces (snapshot regenerated; SUCCEEDED ones skip). |
| Runtime mirror write during a workspace's migration | Per-workspace cron lock is held → REST handler observes lock → returns **HTTP 503** with `Retry-After: 30`. | Client retries; by then the migration has finished or failed cleanly. |

---

## Idempotency

- **Whole batch**: Re-running the bootstrap with `workflowy_schema_version = 2` exits at step 2. No-op.
- **Per-DB**: Re-running against an App DB with `PRAGMA user_version = 2` exits at step 4c with "already v2". No-op.
- **Mid-flight crash recovery**: All Phase 1+2 inserts use `IF NOT EXISTS` / `WHERE NOT EXISTS`. Phase 3 (`DROP TABLE Mirror`) is naturally a no-op once the table is gone. The `PRAGMA user_version` bump is the *commit barrier* — anything before it can be safely replayed.
- **Audit-row recovery**: If the per-DB COMMIT succeeded but the `wp_options` audit row was not written (process killed between step 4d and 4e), the next bootstrap notices `user_version = 2` AND missing audit row, then writes the audit row with `now()` and tags it `AUDIT_LATE` so support can distinguish original-migration-time from recovery-time.

The key invariant: **the COMMIT in step 4d is the only irreversible boundary per workspace.** Anything before it is safely re-runnable; anything after it is auditable bookkeeping.

---

## Forbidden in implementations

- ❌ Parallelizing per-workspace migration without per-workspace cron locks. Two workers on the same DB file produce SQLite `database is locked` errors at best, corruption at worst.
- ❌ Aborting the whole batch on a single workspace's failure. Each workspace is independent — `FAILED_EXECUTION` for `W₁` MUST NOT prevent `W₂` from migrating.
- ❌ Skipping the global schema-migration lock (step 3b). Two concurrent activations would race on the snapshot and double-process workspaces.
- ❌ Bumping `wp_options.workflowy_schema_version = 2` (step 6) before all workspaces are accounted for. Premature marker would skip workspaces in the next bootstrap.
- ❌ Returning `HTTP 200` on legacy `Mirrors`-table writes after a workspace's migration completes. MUST be **HTTP 410** per `AT-APP-67`.
- ❌ Returning `HTTP 200` or proceeding with a mirror create on a v1 workspace while migration is mid-flight. MUST be **HTTP 503 + Retry-After** while the per-workspace cron lock is held by the migration worker.
- ❌ Writing the `.pre-v2.bak` to a different volume than the App DB. Filesystem-level atomic-rename rollback requires same-volume placement.
- ❌ Emitting `migration.complete` SSE per-workspace (would generate N events for one operational action). Emit only the aggregate `migration.batch.complete` at step 6.
- ❌ Re-using the runtime REST handler's PHP path for the migration's INSERTs. Migration MUST run as raw SQL — no `Auth::hasRole` checks, no SSE side-effects, no idempotency-key bookkeeping.

---

## Observability

The bootstrap MUST emit (at minimum) these structured log lines, each tagged with the global `MigrationBatchId` (a UUID generated at step 3):

| Event | When | Fields |
|-------|------|--------|
| `migration.batch.start` | Step 3 (after lock acquired) | `batchId, workspaceCount, sqliteVersion` |
| `migration.workspace.preflight` | Step 4c per workspace | `batchId, workspaceId, status` (`OK`/`FAILED_PREFLIGHT`), `reason?` |
| `migration.workspace.commit` | Step 4d after COMMIT | `batchId, workspaceId, durationMs, groupsCreated, membersCreated, singletonsDropped` |
| `migration.workspace.audit` | Step 4e | `batchId, workspaceId, late?` (`true` if recovery-time) |
| `migration.workspace.failed` | Step 4f | `batchId, workspaceId, phase` (`preflight`/`execution`), `error` |
| `migration.batch.complete` | Step 6 | `batchId, succeeded, alreadyV2, failedPreflight, failedExecution, totalDurationMs` |

These logs are the operator's primary tool for diagnosing partial-success states. They are out of scope for the SQL-detail SSOT (`07-migrations.md`) but mandatory for this workflow.

---

## Acceptance Tests (canonical)

| ID | Canonical | Source | Scenario | Expected |
|----|-----------|--------|----------|----------|
| `AT-WF-MIGRATE-01` | `AT-APP-66` | This flow | Bootstrap runs against an App DB with `PRAGMA user_version = 1` and 3 legacy `Mirror` pairs | Each pair becomes a 2-member `MirrorGroup` (3 groups, 6 members); `user_version → 2`; legacy table dropped; `workflowy_migration_v2_{W}` audit row written |
| `AT-WF-MIGRATE-02` | `AT-APP-66` | This flow | Re-run bootstrap against the same App DB (now v2) | Step 4c short-circuits with "already v2"; no DDL executed; no new audit row (audit row written once) |
| `AT-WF-MIGRATE-03` | `AT-APP-67` | This flow | Post-migration runtime POST writes to legacy `/api/mirrors-legacy` (or any path touching `Mirror` table) | HTTP 410; no row inserted |
| `AT-WF-MIGRATE-04` | `AT-APP-66` | This flow | Bootstrap iterates 3 workspaces; `W₂` fails pre-flight (backup write denied) | `W₁, W₃` migrate; `W₂` recorded `FAILED_PREFLIGHT`; `wp_options.workflowy_schema_version` stays `< 2`; admin notice surfaces `W₂`; next bootstrap retries `W₂` only |
| `AT-WF-MIGRATE-05` | `AT-APP-66` | This flow | Crash between per-DB COMMIT and audit-row write | Next bootstrap detects `user_version = 2` + missing audit row; writes audit row tagged `AUDIT_LATE`; logs `migration.workspace.audit` with `late: true` |
| `AT-WF-MIGRATE-06` | `AT-APP-66` | This flow | Backfill produces a singleton group (legacy `Mirror` referenced a deleted `Item`) | In-transaction singleton sweep deletes the singleton `MirrorGroup` row before COMMIT; surviving member's `Items.PeerGroupId` set NULL |

> ✅ **Canonical-mapped:** each `AT-WF-MIGRATE-NN` maps 1:1 to an `AT-APP-NN` row in [`spec/31-app/97-acceptance-criteria.md`](../97-acceptance-criteria.md). Canonical column is authoritative. `AT-APP-66` is the umbrella migration AT; `AT-APP-67` is the legacy-table-410 AT. F16's create-flow also cites these IDs (different scenario angles — both file's tests must pass).

---

## Related

- [`08-mirror-detach-flow.md`](./08-mirror-detach-flow.md) — runtime detach reuses the auto-dissolve semantics that this flow's singleton sweep mimics
- [`09-mirror-create-flow.md`](./09-mirror-create-flow.md) — runtime create that becomes available *after* this migration commits
- [`05-trash-reaper-flow.md`](./05-trash-reaper-flow.md) — competes for the per-workspace cron lock; bootstrap acquires first
- [`../07-db-diagram/07-migrations.md`](../07-db-diagram/07-migrations.md) — SQL-detail SSOT (M-115/M-116/M-117/M-118 step authority)
- [`../07-db-diagram/sql/07-migration-v2-mirror-peer-groups.sql`](../07-db-diagram/sql/07-migration-v2-mirror-peer-groups.sql) — concrete DDL
- [`../01-features/09b-mirror-peer-group-model.md`](../01-features/09b-mirror-peer-group-model.md) §8 — feature-level migration narrative
- [`mem://features/mirroring`](mem://features/mirroring) — peer-group memory note
- [`mem://constraints/backend-runtime-deferred`](mem://constraints/backend-runtime-deferred) — WP-plugin runtime context
