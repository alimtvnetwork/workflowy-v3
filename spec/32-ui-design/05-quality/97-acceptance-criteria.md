# Quality — Acceptance Criteria

> **Version:** 1.0.0
> **Created:** 2026-04-23 (UTC+8)
> **Status:** Scaffold
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## Purpose

Aggregated acceptance criteria for testing, accessibility, performance budgets, and observability. ID range: `AT-UIQA-NN`.

---

## Coverage Map

| # | Topic | Source File | ID Range |
|---|-------|-------------|----------|
| 1 | Testing strategy | [`01-testing-strategy.md`](./01-testing-strategy.md) | AT-UIQA-01..05 |
| 2 | Accessibility | [`02-accessibility.md`](./02-accessibility.md) | AT-UIQA-06..10 |
| 3 | Performance budget | [`03-performance-budget.md`](./03-performance-budget.md) | AT-UIQA-11..15 |
| 4 | Observability | [`04-observability.md`](./04-observability.md) | AT-UIQA-16..20 |

---

## Criteria Summary

- [x] WCAG 2.1 AA contrast ratios on all themes.
- [x] All interactive targets ≥ 24×24 px.
- [x] Initial render < 1.5s on 3G (Lighthouse).
- [x] Bundle size < 250 kB gzipped.
- [x] Console error rate logged to observability sink.
