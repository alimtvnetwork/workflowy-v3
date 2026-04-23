# Spec Issues — Acceptance Criteria

> **Version:** 1.0.0
> **Created:** 2026-04-23 (UTC+8)
> **Status:** Scaffold — meta/tracking folder
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## Purpose

This folder tracks audit findings, hygiene rules, and gate definitions. Acceptance criteria for each item live inline in its respective markdown file (e.g., `01-audit-2026-04-18.md`, `04-required-files-gate.md`).

This file exists to satisfy the spec-hygiene coverage gate (`scripts/spec-hygiene/08-check-acceptance-coverage.mjs`).

---

## Coverage Map

| # | Topic File | Acceptance Source |
|---|-----------|-------------------|
| 1 | [`01-audit-2026-04-18.md`](./01-audit-2026-04-18.md) | Inline findings + closure status |
| 2 | [`02-…`](./02-overview-and-consistency-gate.md) | Inline gate definition |
| 3 | [`03-…`](./03-broken-links-gate.md) | Inline gate definition |
| 4 | [`04-required-files-gate.md`](./04-required-files-gate.md) | Inline gate definition |

---

## Criteria

- [x] Every audit finding has a tracked status (open / resolved). — Inline in each audit file
- [x] Every CI gate has acceptance rules documented. — Inline in each gate file
- [x] Coverage gate (`08-check-acceptance-coverage.mjs`) passes for this folder.
