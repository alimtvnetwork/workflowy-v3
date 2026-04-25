# Error Modal Color Themes — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 11 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-COLORTHEMES-01` … `AT-COLORTHEMES-11`

---

## Criteria

### Token system (file 01)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-COLORTHEMES-01 | Every error-modal color is defined as a CSS custom property in the design-tokens file; raw hex literals in modal components are forbidden. | [`01-design-tokens.md`](./01-design-tokens.md), [`mem://design/theme`](mem://design/theme) |
| AT-COLORTHEMES-02 | Each token has BOTH a light-mode and dark-mode value; missing one variant fails review. | [`01-design-tokens.md`](./01-design-tokens.md) |
| AT-COLORTHEMES-03 | All color values are HSL (matching the project design-system rule); RGB/hex are forbidden in token definitions. | [`01-design-tokens.md`](./01-design-tokens.md), [`mem://design/theme`](mem://design/theme) |
| AT-COLORTHEMES-04 | Error-level color mapping is bijective: each `LogLevel` enum value maps to exactly one token; reused tokens across levels are forbidden. | [`01-design-tokens.md`](./01-design-tokens.md), [`../../../../02-coding-guidelines/02-typescript/10-log-level-enum.md`](../../../../02-coding-guidelines/02-typescript/10-log-level-enum.md) |

### Two-tier (Go vs PHP/Delegated) system

| ID | Criterion | Source |
|----|-----------|--------|
| AT-COLORTHEMES-05 | The Go-backend tier uses `bg-muted` + blue session frames (NO icon color); the PHP/Delegated tier uses orange (`text-orange-500`, `bg-orange-500/5`). | [`00-overview.md`](./00-overview.md) "Two-Tier Color System" |
| AT-COLORTHEMES-06 | **No purple theme** exists in the codebase — any purple token in delegated/PHP UI is a regression. | [`00-overview.md`](./00-overview.md) ⚠ note |

### Backend tab colors (file 02)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-COLORTHEMES-07 | Each Backend tab (Overview, Stack, Session, Request, Traversal, Execution) has a documented accent token; the accent is used for tab indicator AND active-state header only. | [`02-backend-tab-colors.md`](./02-backend-tab-colors.md) |
| AT-COLORTHEMES-08 | Tab content panels use neutral surface tokens (NOT the tab accent); the accent is for navigation chrome only. | [`02-backend-tab-colors.md`](./02-backend-tab-colors.md) |

### Frontend & UI element colors (file 03)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-COLORTHEMES-09 | Section toggle (Backend/Frontend), error history drawer, queue badge, and error boundary each have a dedicated documented token set. | [`03-frontend-and-ui-colors.md`](./03-frontend-and-ui-colors.md) |
| AT-COLORTHEMES-10 | The queue badge color reflects the highest-severity unseen error (Fatal > Error > Warning > Info); a static color is forbidden. | [`03-frontend-and-ui-colors.md`](./03-frontend-and-ui-colors.md) |

### Consistency

| ID | Criterion | Source |
|----|-----------|--------|
| AT-COLORTHEMES-11 | The folder's `99-consistency-report.md` reconciles every documented token against the actual modal component code; an unresolved drift blocks "stable" status. | [`99-consistency-report.md`](./99-consistency-report.md) |

---

## Verification

```bash
rg -nP '#[0-9a-fA-F]{3,8}\b|rgb\(' --type tsx src/components/error-modal/
rg -ni 'purple|violet' src/components/error-modal/
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../03-error-modal-reference/97-acceptance-criteria.md`](../03-error-modal-reference/97-acceptance-criteria.md) — Modal reference
- [`../02-react-components/97-acceptance-criteria.md`](../02-react-components/97-acceptance-criteria.md) — React components
- [`mem://design/theme`](mem://design/theme) — Project design tokens

---

*Curated 2026-04-25 — closes A-20 (batch 9). Replaces v0.1.0 stub.*
