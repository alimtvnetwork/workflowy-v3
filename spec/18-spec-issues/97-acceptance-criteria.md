# Spec Issues — Acceptance Criteria

> **Version:** 1.0.1
> **Created:** 2026-04-23 (UTC+8)
> **Status:** Scaffold — meta/tracking folder
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## Purpose

This folder tracks audit findings, hygiene rules, and gate definitions. Acceptance criteria for each item live inline in its respective markdown file.

This file exists to satisfy the spec-hygiene coverage gate (`scripts/spec-hygiene/08-check-acceptance-coverage.mjs`).

---

## Coverage Map

| # | Topic File | Acceptance Source |
|---|-----------|-------------------|
| 1 | [`01-audit-2026-04-18.md`](./01-audit-2026-04-18.md) | Inline findings + closure status |
| 2 | [`03-ai-readiness-audit-2026-04-19.md`](./03-ai-readiness-audit-2026-04-19.md) | Inline AI-readiness checklist |
| 3 | [`04-required-files-gate.md`](./04-required-files-gate.md) | Inline gate definition |
| 4 | [`05-audit-02a-column-rename.md`](./05-audit-02a-column-rename.md) | Inline acceptance criteria |
| 5 | [`06-app-folder-audit-2026-04-26.md`](./06-app-folder-audit-2026-04-26.md) | Inline findings F-01..F-15 + APP-FIX-01..14 atomic phase plan |

---

## Criteria

- [x] Every audit finding has a tracked status (open / resolved). — Inline in each audit file
- [x] Every CI gate has acceptance rules documented. — Inline in each gate file
- [x] Coverage gate (`08-check-acceptance-coverage.mjs`) passes for this folder.
