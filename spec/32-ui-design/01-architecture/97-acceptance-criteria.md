# UI Architecture — Acceptance Criteria

> **Version:** 1.0.1
> **Created:** 2026-04-23 (UTC+8)
> **Status:** Scaffold
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## Purpose

Aggregated acceptance criteria for the UI architecture domain. ID range: `AT-UIARC-NN`.

---

## Coverage Map

| # | Topic | Source File | ID Range |
|---|-------|-------------|----------|
| 1 | Tech stack | [`01-tech-stack.md`](./01-tech-stack.md) | AT-UIARC-01..05 |
| 2 | Routes | [`02-routes.md`](./02-routes.md) | AT-UIARC-06..10 |
| 3 | Component hierarchy | [`03-component-hierarchy.md`](./03-component-hierarchy.md) | AT-UIARC-11..15 |
| 4 | File organization | [`04-file-organization.md`](./04-file-organization.md) | AT-UIARC-16..20 |
| 5 | Component contract map | [`05-component-contract-map.md`](./05-component-contract-map.md) | Auto-generated |

---

## Criteria Summary

- [x] Tech stack matches `mem://architecture/tech-stack` (Vite + React 18 + TypeScript 5 + Tailwind v4).
- [x] All routes documented with URL pattern + focus behavior.
- [x] Component hierarchy depth ≤ 5 levels.
- [x] No file exceeds 300 lines.
- [x] Contract map auto-regenerates on every spec-hygiene run.
