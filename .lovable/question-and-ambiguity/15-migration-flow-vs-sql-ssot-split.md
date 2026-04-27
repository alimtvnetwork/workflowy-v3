# Ambiguity 15 — Migration flow vs SQL-detail SSOT split

**Date:** 2026-04-27
**Task:** F17 — pin migration-execution flow
**Status:** Resolved by decision

## Question

`07-db-diagram/07-migrations.md` already has a "v1→v2 Mirror Peer-Group
Migration — Execution Plan" section with pre-flight checks, 10-step
sequence, failure modes, and rollback. Why add a workflow file? Won't
this duplicate the SSOT?

## Decision

**Two files, two angles, no content overlap:**

- `07-migrations.md` is the **SQL-detail SSOT** — one App DB, which DDL
  files own which `M-NN` slot, which `PRAGMA`s set what state. Authority
  for SQL steps and DDL ownership.
- `10-migration-execution-flow.md` is the **operational runbook** — N
  workspaces, global lock orchestration, per-workspace cron-lock
  contention, partial-success aggregation, runtime 503/410 contracts,
  observability log events, audit-row late-write recovery.

The workflow file **explicitly defers SQL-step authority** to
`07-migrations.md` ("SQL-step authority remains with `07-migrations.md`")
and only enumerates per-workspace flow at the orchestration level
(steps 4d in this file points to "per `07-migrations.md` §Execution
sequence steps 1..10").

## Why duplication is OK here

The 10-step DDL sequence appears in summary form in this workflow file
purely for sequence comprehension — the table cell explicitly cites
`07-migrations.md` as the authority. If the DDL changes, only
`07-migrations.md` needs editing; this file's reference still resolves.

Same pattern as `08-mirror-detach-flow.md` referencing
`09b-mirror-peer-group-model.md` for the underlying model — flow files
sequence what features specify.

## Future: extracting AT-APP-66 from F16

The create-flow (F16) cites `AT-APP-66, 67` for idempotency-replay and
legacy-410 scenarios. The migration-flow (F17) cites the same canonical
IDs for migration-itself scenarios. Both files' tests must pass; they
exercise different code paths under the same canonical AT umbrella. If
the team prefers strict 1:1 file-to-AT mapping, F16 could drop
`AT-APP-66, 67` and rely on this file. Deferred to a future polish task.
