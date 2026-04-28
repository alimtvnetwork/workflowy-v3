# ADR-0009: Trash — 30-day retention, soft-delete, daily reaper batch policy

## Status

`Accepted` — 2026-04-28

## Context

Item deletion in WorkFlowy is **soft** — `Item.DeletedAt = now()` —
followed by an automatic, time-bounded hard delete. Three load-bearing
parameters govern the lifecycle:

1. **Retention window** — how long a soft-deleted row remains
   restorable.
2. **Reaper schedule** — when and how often the hard-delete pass runs.
3. **Batch boundary** — how many rows the reaper processes per
   transaction.

These parameters are currently split across three locations:

- **Memory** — `mem://features/trash-logic` (single source for the
  AI agent: 30 days, 03:00 UTC daily, cascade rules).
- **Feature spec** — `spec/31-app/01-features/11b-trash-reaper.md`
  (SSOT for the feature).
- **Workflow spec** — `spec/31-app/02-workflows/05-trash-reaper-flow.md`
  (end-to-end batch sequence with `batch=1000`, advisory lock,
  `FOR UPDATE SKIP LOCKED`).

Without an ADR anchor, an AI generating new code or a future feature
PR could legitimately:

- Pick a different retention window (7 days, 90 days, "configurable").
- Run the reaper hourly or weekly.
- Use a different batch size, drop the per-batch COMMIT, or omit the
  advisory lock.

Each of these silently changes the durability contract the UI surfaces
to the user ("Restore available for 30 days") and the lock-duration
budget the database is sized against. P56 closes this gap.

It also closes the implicit forward-reference from ADR-0008 D1, which
introduced `Node.deletedAt` without anchoring its lifecycle.

## Decision

### D1 — Soft-delete is the only delete operation surfaced to users

User-initiated delete (single, multi-select, cascade-from-parent) MUST
set `Item.DeletedAt = serverNow` and MUST NOT issue a SQL `DELETE`.
The row remains queryable via the Trash view and restorable via the
restore endpoint until the reaper hard-deletes it.

Hard `DELETE FROM Item` is reserved for **two** code paths only:

1. The daily reaper (D3 below).
2. The user-triggered "Empty Trash" action, which performs the same
   hard-delete logic as the reaper but ignores the 30-day cutoff.

### D2 — 30-day retention window

A soft-deleted `Item` MUST remain restorable for **exactly 30 days**
after `DeletedAt`. The cutoff is computed server-side as
`cutoff = serverNow - INTERVAL '30 days'`. Rows with
`DeletedAt < cutoff` are eligible for hard delete.

- The window is **non-configurable** in v1 (no per-account or
  per-workspace override).
- "Empty Trash" hard-deletes regardless of age (D1 §2).
- Bumping the window requires a superseding ADR.

### D3 — Daily reaper at 03:00 UTC

The reaper MUST run on a single deterministic schedule:
**daily at 03:00 UTC**, triggered by the platform scheduler hitting
the admin reaper endpoint. It MUST NOT run hourly, weekly, or on a
client-driven trigger.

Concurrency control:

- A single advisory lock MUST guard the run. Overlapping ticks return
  HTTP 409 (per `05-trash-reaper-flow.md`) and MUST NOT double-process.
- Each batch MUST acquire row locks via `FOR UPDATE SKIP LOCKED` so
  concurrent restore operations on adjacent rows are non-blocking.

### D4 — Batch size = 1000, per-batch COMMIT

Each reaper pass MUST process eligible rows in batches of **1000**,
each batch in its **own transaction** that COMMITs before the next
batch is selected. The 1000-row ceiling bounds:

- Lock-hold duration (so the daily window cannot grow into outage).
- Crash-recovery cost (a crash mid-pass loses at most one batch, never
  the whole run).

Batch size is **non-configurable** in v1; changing it requires a
superseding ADR with a documented benchmark.

### D5 — Cascade scope

A reaper hard-delete MUST cascade via foreign key to:

- All descendants of the deleted `Item` (transitive `ParentItemId`
  closure).
- All `Mirror` peer-group memberships referencing the deleted `Item`.
- All `Permission` rows referencing the deleted `Item`.

If a peer-group's membership drops to **size 1** as a result of the
reap, the singleton MUST be dissolved per ADR-0005 (mirror peer-group
auto-dissolution).

`Template` rows are **independent snapshots** and MUST NOT cascade —
they are unaffected by the reaper.

### D6 — Reaper audit trail

Every reaper run MUST append exactly one row to
`ReaperRun(Id, RanAt, RowsDeleted, DurationMs)`. The audit row is
written **after** the final batch COMMITs (so a crashed run produces no
audit row, matching the "at most one batch lost" guarantee in D4).

### D7 — Out of scope (v1)

The following are **explicitly deferred** and require a superseding
ADR before any spec edit may introduce them:

- Configurable retention (per-account, per-workspace, per-item).
- Archive tier (cold storage of hard-deleted rows).
- T-3 warning email or in-app notification before reap.
- Legal-hold freeze that exempts specific rows from the reaper.

## Consequences

### Positive

- **One durability promise.** "Restore available for 30 days" is now
  a load-bearing contract anchored in ADR, not a memory-only claim.
- **Bounded blast radius.** Per-batch COMMIT + advisory lock + 1000-row
  ceiling cap the worst-case lock-hold and recovery cost; the daily
  pass cannot silently degrade into an outage as data grows.
- **Cascade rules unified.** D5 makes the children / peer-group /
  permission cascade explicit and ties the singleton-dissolve case
  directly to ADR-0005, removing a known cross-spec ambiguity.
- **`Node.deletedAt` lifecycle closed.** ADR-0008 D1 introduced the
  field; ADR-0009 anchors its full lifecycle (soft → reap or restore).

### Negative

- **No grace period for power users.** A user who realises they
  needed a 31-day-old item has no recovery path. Mitigated by D7
  leaving the door open via a superseding ADR.
- **Batch size + schedule frozen.** Future scaling that needs a larger
  batch (e.g. 10 000) or a lower-traffic schedule requires a new ADR;
  no operator-runtime tuning.

## Alternatives Considered

1. **Hard-delete on user click (no soft-delete)** — rejected: removes
   the restore feature entirely and breaks the LWW reconciliation
   path in ADR-0005 (mirror peers need a soft-deleted state to detect
   broken-mirror healing during restore).
2. **Hourly reaper, batch=100** — rejected: 24× more advisory-lock
   churn for no user-visible benefit; batch=100 would require ~10×
   more transactions to clear a typical daily backlog without
   reducing peak lock-hold (which is what the operator actually
   cares about).
3. **Configurable per-workspace retention from v1** — rejected:
   adds a free parameter to every restore-window UI string, every
   reaper SQL filter, and every "is this row reapable?" check. Punted
   to D7 until product evidence demands it.

## Gates Touched

- `G-11-TRASH-SOFT-DELETE-ONLY` — enforces D1 (no user path issues
  hard `DELETE` except via Empty Trash / reaper).
- `G-11-TRASH-30-DAY-WINDOW` — enforces D2 (cutoff is exactly
  `serverNow - 30 days`, non-configurable).
- `G-11-REAPER-DAILY-03-UTC` — enforces D3 (single deterministic
  schedule, advisory-lock guarded).
- `G-11-REAPER-BATCH-1000` — enforces D4 (batch size 1000,
  per-batch COMMIT).
- `G-11-REAPER-CASCADE-SCOPE` — enforces D5 (descendants +
  peer-group + permissions cascade; templates excluded; singleton
  dissolution per ADR-0005).
- `G-11-REAPER-AUDIT-ROW` — enforces D6 (`ReaperRun` row written
  post-final-COMMIT).

All six gates are formally **anchored** by this ADR. Their enforcement
contracts live in `spec/31-app/01-features/11b-trash-reaper.md`,
`spec/31-app/02-workflows/05-trash-reaper-flow.md`, and
`spec/35-enforcement-rules/`.

## Supersedes / Superseded-By

- **Supersedes:** (none — closes the lifecycle deferral implicit in
  ADR-0008 D1).
- **Superseded-By:** (none).
