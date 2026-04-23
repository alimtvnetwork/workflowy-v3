# State & Data — Acceptance Criteria

> **Version:** 1.0.0
> **Created:** 2026-04-23 (UTC+8)
> **Status:** Scaffold
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## Purpose

Aggregated acceptance criteria for state management, data contracts, and persistence boundaries. ID range: `AT-UISTATE-NN`.

---

## Coverage Map

| # | Topic | Source File | ID Range |
|---|-------|-------------|----------|
| 1 | State architecture | [`01-state-architecture.md`](./01-state-architecture.md) | AT-UISTATE-01..05 |
| 2 | Data fetching | [`02-data-fetching.md`](./02-data-fetching.md) | AT-UISTATE-06..10 |
| 3 | Optimistic updates | [`03-optimistic-updates.md`](./03-optimistic-updates.md) | AT-UISTATE-11..15 |
| 4 | Cache invalidation | [`04-cache-invalidation.md`](./04-cache-invalidation.md) | AT-UISTATE-16..20 |

---

## Criteria Summary

- [x] State store uses Zustand (per `mem://architecture/tech-stack`).
- [x] Optimistic updates roll back on failure with user-visible toast.
- [x] No backend runtime is named in any state file (deferred).
- [x] Cache invalidation strategy defined per resource type.
