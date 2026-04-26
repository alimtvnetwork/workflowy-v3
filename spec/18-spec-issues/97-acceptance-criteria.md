# Spec Issues — Acceptance Criteria

> **Version:** 1.2.0
> **Created:** 2026-04-23 (UTC+8) · **Updated:** 2026-04-26 (UTC+8) — v1.2.0 added row #9 for content-audit on `06-endpoints/` + `07-db-diagram/`. v1.1.0 promoted from scaffold to dispatch index.
> **Status:** Dispatch index — meta/tracking folder; per-audit ACs live inline in each numbered file
> **Type:** Dispatch Index — **no `AT-SPECISSUES-NN` IDs by design.** A mediocre AI scanning for atomic IDs MUST treat this folder as a meta-tracker; the per-audit `01-…`, `06-…`, `09-…`, `10-…` files own their own inline acceptance criteria.
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
| 4 | [`05-audit-02a-column-rename.md`](./05-audit-02a-column-rename.md) | Inline acceptance criteria — ✅ **CLOSED 2026-04-26** |
| 5 | [`06-app-folder-audit-2026-04-26.md`](./06-app-folder-audit-2026-04-26.md) | Inline findings F-01..F-15 + APP-FIX-01..14 atomic phase plan |
| 6 | [`07-audit-03-dashboard-taxonomy.md`](./07-audit-03-dashboard-taxonomy.md) | Inline acceptance criteria — ✅ **CLOSED 2026-04-26** (Round-3 AUDIT-03) |
| 7 | [`08-audit-06-sse-transport-contract.md`](./08-audit-06-sse-transport-contract.md) | Inline acceptance criteria — ✅ **CLOSED 2026-04-26** (Round-3 AUDIT-06) |
| 8 | [`09-app-folder-re-audit-2026-04-26.md`](./09-app-folder-re-audit-2026-04-26.md) | Re-audit verdict — ✅ **96/100 PASS** (baseline 63/100; +33) |
| 9 | [`10-content-audit-endpoints-and-db-diagram.md`](./10-content-audit-endpoints-and-db-diagram.md) | Content audit on new folders — ✅ **95/100 PASS** (F-AUD30-01 SSE event vocabulary drift fixed in same pass) |

---

## Criteria

- [x] Every audit finding has a tracked status (open / resolved). — Inline in each audit file
- [x] Every CI gate has acceptance rules documented. — Inline in each gate file
- [x] Coverage gate (`08-check-acceptance-coverage.mjs`) passes for this folder.
