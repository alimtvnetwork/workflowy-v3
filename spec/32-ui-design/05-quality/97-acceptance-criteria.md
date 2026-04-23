# Quality — Acceptance Criteria

> **Version:** 1.0.1
> **Created:** 2026-04-23 (UTC+8)
> **Status:** Scaffold
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## Purpose

Aggregated acceptance criteria for accessibility, performance, and UI state coverage. ID range: `AT-UIQA-NN`.

---

## Coverage Map

| # | Topic | Source File | ID Range |
|---|-------|-------------|----------|
| 1 | Accessibility | [`01-accessibility.md`](./01-accessibility.md) | AT-UIQA-01..05 |
| 2 | Performance | [`02-performance.md`](./02-performance.md) | AT-UIQA-06..10 |
| 3 | Loading / empty / error states | [`03-loading-empty-error-states.md`](./03-loading-empty-error-states.md) | AT-UIQA-11..15 |

---

## Criteria Summary

- [x] WCAG 2.1 AA contrast ratios on all themes.
- [x] All interactive targets ≥ 24×24 px.
- [x] 250-item viewport renders <16ms (60fps target).
- [x] Bundle size budget defined and enforced.
- [x] Every async surface has loading + error + empty states specified.
