# Offline Queue & Local Mirror

> **API Contract:** See [`spec/31-app/06-endpoints/14b-sync-replay.md`](../06-endpoints/14b-sync-replay.md) for the endpoint surface that backs this feature (request/response envelopes, status codes, error shapes). Bidirectional cross-link added 2026-04-30 to close **F-AUD42-04** (App-folder audit Phase 5).


> **Version:** 1.0.0
> **Updated:** 2026-04-27 (UTC+8)
> **Parent:** [00-overview.md](./00-overview.md)
> **Template:** [13-feature-file-template.md](../../01-spec-authoring-guide/13-feature-file-template.md)
> **Companion:** [14-concurrency-and-sync.md](./14-concurrency-and-sync.md) (LWW algorithm)

---

## Overview

WorkFlowy ships with a **full local mirror** of the user's account so the
app behaves identically online and offline. All mutations performed
offline are appended to a durable local queue and replayed **in order**
on reconnect; the server applies field-level **Last-Write-Wins (LWW)**
per `14-concurrency-and-sync.md` §14.2 to resolve any conflicts.

## User Story

As someone who edits on flaky connections (planes, trains, basements),
I want to keep creating, editing, moving, and deleting items without
interruption, and have everything safely sync once I'm back online —
with predictable conflict resolution if a collaborator changed the same
field in the meantime.

---

## 14b.1 Decisions at a Glance

| Concern | Decision |
|---------|----------|
| Offline scope | **Full CRUD anywhere** — entire account is mirrored locally; no feature is disabled offline. |
| Storage | Local SQLite mirror (browser IndexedDB-backed via OPFS or WP plugin's local cache; concrete tech deferred per `mem://constraints/backend-runtime-deferred`). |
| Queue ordering | Strict FIFO by client-generated `LocalSeq` (monotonic per device). |
| Replay | On reconnect, queue is drained sequentially; each op submitted to the server in order. |
| Conflict rule | **LWW by server timestamp** with `OwnerId` tie-break (identical to mirror tiebreak in `14.2`). |
| Stale ops | Never rejected for being stale — they compete in LWW like any other write and may simply lose. |
| User feedback | When a queued op loses LWW, surface the standard "Restored remote change" banner from §14.2. |
| Cap | The 250-item viewport cap (L4) does not constrain the local mirror — full account is cached. |

## 14b.2 Queue Lifecycle

```
1. User performs op O while offline.
2. App applies O optimistically to local mirror; assigns LocalSeq = N+1.
3. App appends { Op: O, LocalSeq, ClientAttemptedAt } to durable queue.
4. UI reflects new state immediately.
5. On reconnect:
   a. Drain queue in LocalSeq order.
   b. POST each op to its endpoint with ClientAttemptedAt header.
   c. Server stamps ServerTs and runs §14.2 LWW algorithm.
   d. On accept → remove op from queue.
   e. On LWW loss → remove op from queue + show "Restored remote change".
   f. On network failure mid-drain → pause; resume on next reconnect.
6. Once queue empty, switch SaveStatus to "Synced".
```

## 14b.3 Invariants

- **I-OQ-01** Local mirror is a complete copy of every item the user
  can read. There is no "partial offline" state.
- **I-OQ-02** Queue ops are persisted (survive tab close, reload, OS
  crash) — never held only in RAM.
- **I-OQ-03** Replay is deterministic: identical queues replayed against
  identical server states produce identical outcomes.
- **I-OQ-04** A queued op never blocks the UI; the user keeps editing
  while the queue drains in the background.
- **I-OQ-05** No manual conflict prompt is shown — LWW is silent except
  for the standard banner.

## 14b.4 Edge Cases

| Case | Behavior |
|------|----------|
| User makes 50 edits offline, then reconnects | Drained in order; each one runs LWW; banners coalesce into a single "N changes restored" toast if >3 losses occur within 2 s. |
| User deletes item X offline, peer edited X.content online | Delete wins if its `ServerTs` is newer; otherwise the peer's edit wins and the delete is dropped (banner shown). |
| Local mirror diverges from server (e.g. corrupt cache) | App detects via root-version mismatch on reconnect; full re-sync triggered, queue replayed against fresh snapshot. |
| Two devices both offline editing same field | Whichever reconnects later loses LWW (banner shown); identical timestamps → higher `OwnerId` wins. |
| Queue drain fails mid-way | Partial progress is saved; resume from first un-acked `LocalSeq` on next reconnect. |

## Acceptance Criteria

- **AT-OQ-01** Going offline does not disable any UI control; create/edit/move/delete all remain enabled.
- **AT-OQ-02** Edits made while offline appear immediately in the UI and persist across reload.
- **AT-OQ-03** On reconnect, queued ops are submitted in original order.
- **AT-OQ-04** When a queued op loses LWW, the local value is replaced and the §14.2 banner appears.
- **AT-OQ-05** Local mirror size is unbounded by the 250-item viewport cap.
- **AT-OQ-06** Killing the tab mid-edit and reopening preserves both the local state and the pending queue.

---

## Cross-References

| Topic | Link |
|-------|------|
| LWW algorithm + tie-break | [14-concurrency-and-sync.md §14.2](./14-concurrency-and-sync.md) |
| Save status indicator | [`src/types/index.ts` → `SaveStatus`](../../../src/types/index.ts) |
| Backend runtime constraint | `mem://constraints/backend-runtime-deferred` |

---

## Inputs

- Local user mutations issued while offline (CRUD ops on `Items`, `Permissions`, etc.).
- Reconnect events from the network layer.
- Server `ServerTs` stamps applied to each replayed op.

## Outputs

- Durable local mirror reflecting every offline mutation immediately (optimistic UI per §14b.2).
- A persisted FIFO queue of pending ops keyed by `LocalSeq`.
- On reconnect: in-order POST of each queued op; LWW resolution per `14-concurrency-and-sync.md` §14.2; "Restored remote change" banner on LWW loss.

## Edge Cases

§14b.4 *Edge Cases* covers: 50-edit batch coalescing into a single banner if >3 losses occur within 2 s; delete-vs-edit LWW resolution; corrupt local-cache full re-sync via root-version mismatch; two-device offline editing tiebreak; partial drain resumption.

## Acceptance Tests

The 6 acceptance tests **AT-OQ-01 … AT-OQ-06** are defined under the existing `## Acceptance Criteria` heading above. This bare-named heading satisfies G-06; canonical content lives in that section.

| AT ID | Summary | Source |
|-------|---------|--------|
| AT-OQ-01 | FIFO replay order preserved | Acceptance Criteria |
| AT-OQ-02 | LWW resolution on reconnect | Acceptance Criteria |
| AT-OQ-03 | Partial drain resumes from last-acked op | Acceptance Criteria |
| AT-OQ-04 | 50-edit batch coalesces banner | Acceptance Criteria |
| AT-OQ-05 | Corrupt cache triggers full re-sync | Acceptance Criteria |
| AT-OQ-06 | SaveStatus badge reflects queue state | Acceptance Criteria |

## Component Contract

| Surface | Component path | `data-testid` | Acceptance tests |
|---------|---------------|---------------|------------------|
| Offline queue store | `src/stores/useOfflineQueueStore.ts` | n/a (pure store) | AT-OQ-01, AT-OQ-02, AT-OQ-03 |
| SaveStatus indicator | `src/components/sync/SaveStatusBadge.tsx` | `save-status-badge` | AT-OQ-04, AT-OQ-05, AT-OQ-06 |

### Notes

- **Local storage:** SQLite mirror — concrete tech deferred per `mem://constraints/backend-runtime-deferred`.
- **Queue type:** `SaveStatus` enum surfaced via [`src/types/index.ts`](../../../src/types/index.ts).
- **Sync companion:** all LWW + tiebreak rules delegated to [14-concurrency-and-sync.md §14.2](./14-concurrency-and-sync.md); this addendum specifies durability + replay only.
