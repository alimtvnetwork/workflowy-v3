# Mirror Cycle Detection — Algorithm Spec

> **Version:** 1.0.0
> **Updated:** 2026-04-26 (UTC+8)
> **Parent:** [09-mirrors.md](./09-mirrors.md)
> **Template:** [13-feature-file-template.md](../../01-spec-authoring-guide/13-feature-file-template.md)
> **Closes:** A-38 (cycle-detection algorithmic SSOT — gap identified during A-28 mirror-drift sweep)

---

## Overview

This spec is the **algorithmic SSOT** for detecting mirror cycles. The behavioral rules already live in [`09-mirrors.md`](./09-mirrors.md) (AT-MIRRORS-08, edge case #1) and [`../06-endpoints/01-information-model.md`](../06-endpoints/01-information-model.md) (`ERR_CYCLE` on `EP-ITEMS-MOVE`). This file defines the **traversal contract**, **SQL recipe**, **complexity bound**, and **fixtures** so the WordPress-plugin backend, the React client (optimistic check), and the hygiene tests all agree on a single algorithm.

## User Story

As a user attempting to mirror or move an item, I want the system to instantly reject operations that would create an impossible loop (item is its own ancestor through any chain of `ParentId` or `MirrorOf` edges), so that the tree never enters an unrenderable state.

---

## Definitions

| Term | Meaning |
|------|---------|
| **Containment edge** | `Items.ParentId` — the structural tree edge. |
| **Mirror edge** | `Mirrors.SourceId → Mirrors.ParentId` — a virtual containment edge: the source appears under that parent. |
| **Effective parent set** of node `X` | `{Items[X].ParentId} ∪ {Mirrors.ParentId WHERE Mirrors.SourceId = X}`. |
| **Cycle** | A path from node `X` back to `X` following any combination of containment + mirror edges. |

A cycle is forbidden because the renderer would recurse forever.

---

## Inputs

| Input | Type | Source | Notes |
|-------|------|--------|-------|
| `SourceId` | `string` | request body | The item being mirrored or moved |
| `TargetParentId` | `string` | request body | The proposed new parent |
| `Items` table | read-only | SQLite | `(Id, ParentId)` columns only |
| `Mirrors` table | read-only | SQLite | `(SourceId, ParentId)` columns only |

## Outputs

| Output | Persisted? | Channel | Notes |
|--------|-----------|---------|-------|
| `IsCycle: boolean` | ❌ | function return | `true` ⇒ reject operation |
| `CyclePath: string[]` | ❌ | function return (debug only) | Ordered list of node IDs forming the loop, empty when `IsCycle=false` |
| `ERR_CYCLE` | ❌ | HTTP error envelope | Returned when the operation is `EP-ITEMS-MOVE` |
| `mirror-cycle-error` toast | ❌ | toast bus | Returned when the operation is mirror-create |

---

## Algorithm

```text
function HasCycle(SourceId, TargetParentId, Items, Mirrors) -> boolean:
    if SourceId == TargetParentId:
        return true                              # self-parent shortcut

    Visited := empty set
    Stack   := [TargetParentId]                  # DFS up the effective-parent chain

    while Stack is not empty:
        Current := Stack.pop()
        if Current == SourceId:
            return true                          # SourceId reached as an ancestor
        if Current in Visited:
            continue                             # already explored
        Visited.add(Current)

        # Containment edge
        ContainmentParent := Items[Current].ParentId
        if ContainmentParent is not null:
            Stack.push(ContainmentParent)

        # Mirror edges — every place where Current is mirrored
        for each row in Mirrors where SourceId = Current:
            Stack.push(row.ParentId)

    return false
```

### Rules

1. **Direction.** Walk *upward* from `TargetParentId` toward roots, expanding both edge kinds. The check passes iff `SourceId` is **not** reachable.
2. **Bounded.** `Visited` guarantees each node is expanded at most once → terminates even on data-corrupted graphs.
3. **Self-parent.** `SourceId == TargetParentId` is a cycle (mirror under itself).
4. **Subtree cycle.** Mirroring a parent under any of its own descendants is also a cycle — captured by walking mirror edges of the descendants up to `SourceId`.
5. **Mirror chains do not nest.** A mirror's `MirrorOf` always points at the canonical source per `mem://features/mirroring`; mirror edges never form chains of length > 1, so the DFS depth on mirror edges alone is ≤ 1 per node.

---

## SQL Recipe (SQLite, WordPress plugin)

The plugin runs this recursive CTE inside the same transaction as the write:

```sql
WITH RECURSIVE Ancestors(NodeId) AS (
    SELECT :TargetParentId
    UNION
    SELECT i.ParentId
      FROM Items i
      JOIN Ancestors a ON a.NodeId = i.Id
     WHERE i.ParentId IS NOT NULL
    UNION
    SELECT m.ParentId
      FROM Mirrors m
      JOIN Ancestors a ON a.NodeId = m.SourceId
)
SELECT 1
  FROM Ancestors
 WHERE NodeId = :SourceId
 LIMIT 1;
```

If the query returns a row → reject with `ERR_CYCLE`.

---

## Complexity

| Metric | Bound | Justification |
|--------|-------|---------------|
| Time | `O(N + M)` | Each Item row visited ≤ 1×; each Mirror row visited ≤ 1× |
| Space | `O(D + K)` | `D` = depth of containment chain, `K` = number of mirrors of visited nodes |
| Worst-case latency | < 25 ms for trees ≤ 10 000 nodes (per `mem://features/editor-core` perf budget) |

---

## Edge Cases

1. `TargetParentId` is `SourceId` itself → return `true` (line 3 of algorithm).
2. `TargetParentId` is a descendant of `SourceId` via containment only → DFS climbs to `SourceId`, returns `true`.
3. `TargetParentId` is a descendant of `SourceId` via a mirror chain → DFS expands the mirror edge, returns `true`.
4. `SourceId` is the root item → mirror creation already blocked by `AT-MIRRORS-15` (toast `mirror-root-error`); algorithm still safe to run.
5. `Mirrors` table has a stale row pointing at a deleted parent → row is skipped (the join sees no descendant); does not falsely report a cycle.
6. Two concurrent move operations race → each runs the CTE inside its own transaction; SQLite serializes writes per `mem://features/editor-core`, so at most one succeeds.
7. Network drops mid-check → client-side optimistic check repeated server-side; no client-only enforcement.
8. Corrupted graph (pre-existing cycle from older bug) → `Visited` guard makes the algorithm terminate; result will be `true` (false positive that protects users from worsening the state).

---

## Acceptance Tests

| ID | Given | When | Then | testid |
|----|-------|------|------|--------|
| AT-CYCLE-01 | `SourceId == TargetParentId` | Algorithm runs | Returns `IsCycle=true` in <1 ms | `cycle-self-parent` |
| AT-CYCLE-02 | Target is direct child of Source via containment | Algorithm runs | Returns `IsCycle=true`; `CyclePath=[Target, Source]` | `cycle-direct-child` |
| AT-CYCLE-03 | Target is grandchild of Source via containment | Algorithm runs | Returns `IsCycle=true`; `CyclePath` length = 3 | `cycle-grandchild` |
| AT-CYCLE-04 | Target is mirrored under a descendant of Source | Algorithm runs | Returns `IsCycle=true` (mirror edge expanded) | `cycle-via-mirror` |
| AT-CYCLE-05 | Target lives in an unrelated subtree | Algorithm runs | Returns `IsCycle=false` in O(D) hops | `cycle-clean-target` |
| AT-CYCLE-06 | Tree contains 10 000 items, 500 mirrors | Algorithm runs | Returns answer in <25 ms p95 | `cycle-perf-budget` |
| AT-CYCLE-07 | EP-ITEMS-MOVE called with cycle-creating params | Server runs CTE | Responds `400 ERR_CYCLE`; no row mutated | `cycle-move-rejected` |
| AT-CYCLE-08 | Mirror-create called with cycle-creating params | Server runs CTE | Responds `400 ERR_CYCLE`; toast `mirror-cycle-error` shown | `cycle-mirror-rejected` |
| AT-CYCLE-09 | Pre-existing corrupt cycle in DB | Algorithm runs against any node in the cycle | Terminates (no infinite loop); returns `true` | `cycle-corrupt-graph-safe` |
| AT-CYCLE-10 | Hygiene script `scripts/spec-hygiene/18-check-cycle-algo.mjs` runs | Compares this spec's CTE to `wp-plugin/Repository/CycleCheck.php` | Exits 0 only when the CTE strings are byte-identical (whitespace-normalized) | `cycle-hygiene-drift` |

---

## Component Contract

> **Aspirational paths** — files below are the agreed implementation targets, not yet present.

| Concern | Path | Function |
|---------|------|----------|
| Server algorithm | `wp-plugin/Repository/CycleCheck.php` | `public static function hasCycle(string $SourceId, string $TargetParentId): bool` |
| Recursive CTE constant | `wp-plugin/Repository/sql/cycle-check.sql` | Verbatim copy of the SQL above |
| Client optimistic check | `src/lib/mirror-cycle.ts` | `hasCycle(sourceId, targetParentId, store): boolean` (in-memory mirror of the SQL) |
| Cycle toast | `src/components/feedback/MirrorErrorToast.tsx` | Reads `mirror-cycle-error` testid (already exists per 09-mirrors.md L191) |
| Hygiene drift check | `scripts/spec-hygiene/18-check-cycle-algo.mjs` | Asserts byte-equality between SQL block here and `cycle-check.sql` |

---

## Cross-References

| Topic | Link |
|-------|------|
| Behavioral mirror rules | [09-mirrors.md](./09-mirrors.md) |
| Move endpoint that returns `ERR_CYCLE` | [`../06-endpoints/01-information-model.md`](../06-endpoints/01-information-model.md) — EP-ITEMS-MOVE |
| Mirror data semantics | `mem://features/mirroring` |
| Concurrency rules | [14-concurrency-and-sync.md](./14-concurrency-and-sync.md) |
| Edge-case catalog | [`../03-edge-cases/01-edge-cases.md`](../03-edge-cases/01-edge-cases.md) |
