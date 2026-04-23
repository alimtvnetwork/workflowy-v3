# State & Data — Acceptance Criteria

> **Version:** 1.0.1
> **Created:** 2026-04-23 (UTC+8)
> **Status:** Scaffold
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## Purpose

Aggregated acceptance criteria for state management, data flow, and type contracts. ID range: `AT-UISTATE-NN`.

---

## Coverage Map

| # | Topic | Source File | ID Range |
|---|-------|-------------|----------|
| 1 | State management | [`01-state-management.md`](./01-state-management.md) | AT-UISTATE-01..05 |
| 2 | Data flow | [`02-data-flow.md`](./02-data-flow.md) | AT-UISTATE-06..10 |
| 3 | Data types | [`03-data-types.md`](./03-data-types.md) | AT-UISTATE-11..15 |

---

## Criteria Summary

- [x] State store uses Zustand (per `mem://architecture/tech-stack`).
- [x] Data flow is unidirectional; no two-way bindings.
- [x] All data types extend the unified `Item` interface (`mem://architecture/data-model`).
- [x] No backend runtime is named in any state file (deferred).
- [x] PascalCase used for all type names, JSON keys, and DB columns.
