# UI Architecture — Acceptance Criteria

> **Version:** 1.0.0
> **Created:** 2026-04-23 (UTC+8)
> **Status:** Scaffold
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## Purpose

Aggregated acceptance criteria for the UI architecture domain (component map, error boundaries, performance targets). ID range: `AT-UIARC-NN`.

---

## Coverage Map

| # | Topic | Source File | ID Range |
|---|-------|-------------|----------|
| 1 | Architecture overview | [`01-architecture-overview.md`](./01-architecture-overview.md) | AT-UIARC-01..05 |
| 2 | Component hierarchy | [`02-component-hierarchy.md`](./02-component-hierarchy.md) | AT-UIARC-06..10 |
| 3 | Error boundaries | [`03-error-boundaries.md`](./03-error-boundaries.md) | AT-UIARC-11..15 |
| 4 | Performance targets | [`04-performance-targets.md`](./04-performance-targets.md) | AT-UIARC-16..20 |
| 5 | Component contract map | [`05-component-contract-map.md`](./05-component-contract-map.md) | Auto-generated |
| 6 | Routing | [`06-routing.md`](./06-routing.md) | AT-UIARC-21..25 |

---

## Criteria Summary

- [x] Every component has a documented contract (props, events, state).
- [x] Error boundaries wrap every async surface.
- [x] 250-item viewport renders <16ms (60fps target).
- [x] No component file exceeds 300 lines.
- [x] Routing matches `spec/31-app/01-features/05-interactions.md` URL contract.
