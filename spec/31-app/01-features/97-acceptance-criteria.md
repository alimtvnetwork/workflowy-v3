# App Features — Acceptance Criteria

> **Version:** 1.0.1
> **Created:** 2026-04-23 (UTC+8)
> **Status:** Scaffold — consolidates per-feature criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## Purpose

Aggregated acceptance criteria for the 14 feature topics in this folder. Each feature file contains its own inline `## Acceptance Criteria` section. ID range: `AT-APPF-NN`.

---

## Coverage Map

| # | Topic | Source File | ID Range |
|---|-------|-------------|----------|
| 1 | Information model | [`01-information-model.md`](./01-information-model.md) | AT-APPF-01..05 |
| 2 | Personas | [`02-personas.md`](./02-personas.md) | AT-APPF-06..10 |
| 3 | Layout structure | [`03-layout-structure.md`](./03-layout-structure.md) | AT-APPF-11..15 |
| 4 | Page content area | [`04-page-content-area.md`](./04-page-content-area.md) | AT-APPF-16..20 |
| 5 | Interactions | [`05-interactions.md`](./05-interactions.md) | AT-APPF-21..30 |
| 6 | Item context menu | [`06-item-context-menu.md`](./06-item-context-menu.md) | AT-APPF-31..35 |
| 7 | Board view | [`07-board-view.md`](./07-board-view.md) | AT-APPF-36..40 |
| 8 | Share dialog | [`08-share-dialog.md`](./08-share-dialog.md) | AT-APPF-41..45 |
| 9 | Mirrors | [`09-mirrors.md`](./09-mirrors.md) | AT-APPF-46..50 |
| 10 | Today view | [`10-today-view.md`](./10-today-view.md) | AT-APPF-51..55 |
| 11 | Trash view | [`11-trash-view.md`](./11-trash-view.md) | AT-APPF-56..60 |
| 12 | Multi-select | [`12-multi-select.md`](./12-multi-select.md) | AT-APPF-61..65 |
| 13 | Templates | [`13-templates.md`](./13-templates.md) | AT-APPF-66..70 |
| 14 | Concurrency & sync | [`14-concurrency-and-sync.md`](./14-concurrency-and-sync.md) | AT-APPF-71..75 |
| 15 | Roles & permissions | [`15-roles-and-permissions.md`](./15-roles-and-permissions.md) | AT-APPF-76..85 |

---

## Criteria Summary

- [x] All 14 feature files contain a `## Acceptance Criteria` section.
- [x] Each criterion is independently verifiable.
- [x] No criterion references runtime/backend specifics (deferred per `mem://constraints/backend-runtime-deferred`).
- [x] 250-item viewport limit enforced across all features.
- [x] All features respect the unified `Item` interface (`mem://architecture/data-model`).
