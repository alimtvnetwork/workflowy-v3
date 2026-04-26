# App Features — Acceptance Criteria

> **Version:** 2.1.0
> **Created:** 2026-04-23 (UTC+8)
> **Updated:** 2026-04-26 — v2.1.0 backfilled canonical AT for Today/Templates/Concurrency/SSE (`AT-APP-26..42`). v2.0.0 declared `AT-APP-NN` canonical (APP-FIX-14, closes F-12).
> **Status:** Active — dispatch index for `AT-APP-*` (canonical) and per-feature inline `AT-*-*` IDs
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## 🛑 Naming-Scheme Reconciliation (normative)

> **Single source of truth:** `AT-APP-NN` lives in [`spec/31-app/97-acceptance-criteria.md`](../97-acceptance-criteria.md). That file is the **canonical** acceptance-criteria index for the App domain. The `AT-APP-NN` IDs are **stable** and **never renumbered**.
>
> **What this file is now:** a **dispatch index** mapping each feature file to its inline AT IDs and to the corresponding `AT-APP-NN` range in the canonical file. The legacy `AT-APPF-NN` prefix is **deprecated for new criteria** but kept as a column for back-references already present in this folder.
>
> **AI implementer rule:** When generating tests, read **`spec/31-app/97-acceptance-criteria.md`** first. Use this file only to find which feature spec backs a given AT-APP ID, or to discover per-feature inline AT IDs (`AT-LAYOUT-NN`, `AT-CONCURRENCY-NN`, `AT-TEMPLATES-NN`, etc.) that elaborate the canonical AT-APP rule.

---

## Coverage Map (canonical-first)

> Each row gives the canonical `AT-APP-NN` range, the feature file's inline AT prefix (used in that file's own `## Acceptance Tests` table), and the legacy `AT-APPF-NN` dispatch range that earlier tooling references.

| # | Topic | Source file | Canonical (`AT-APP-NN`) | Inline prefix in source | Legacy dispatch (`AT-APPF-NN`) |
|---|-------|-------------|-------------------------|-------------------------|--------------------------------|
| 1 | Information model | [`01-information-model.md`](./01-information-model.md) | `AT-APP-01..05` | `AT-INFO-NN` | `AT-APPF-01..05` |
| 2 | Personas | [`02-personas.md`](./02-personas.md) | (none — narrative file) | — | `AT-APPF-06..10` (placeholder; do not author tests) |
| 3 | Layout structure | [`03-layout-structure.md`](./03-layout-structure.md) | `AT-APP-06..10` | `AT-LAYOUT-NN` | `AT-APPF-11..15` |
| 4 | Page content area | [`04-page-content-area.md`](./04-page-content-area.md) | `AT-APP-11` | `AT-PAGE-NN` | `AT-APPF-16..20` |
| 5 | Interactions | [`05-interactions.md`](./05-interactions.md) | `AT-APP-12..14` | `AT-INTERACT-NN` | `AT-APPF-21..30` |
| 6 | Item context menu | [`06-item-context-menu.md`](./06-item-context-menu.md) | `AT-APP-15..16` | `AT-CTXMENU-NN` | `AT-APPF-31..35` |
| 7 | Board view | [`07-board-view.md`](./07-board-view.md) | (covered indirectly via AT-APP-10) | `AT-BOARD-NN` | `AT-APPF-36..40` |
| 8 | Share dialog | [`08-share-dialog.md`](./08-share-dialog.md) | `AT-APP-25` | `AT-SHARE-NN` | `AT-APPF-41..45` |
| 9 | Mirrors | [`09-mirrors.md`](./09-mirrors.md) | `AT-APP-24` | `AT-MIRROR-NN` | `AT-APPF-46..50` |
| 10 | Today view | [`10-today-view.md`](./10-today-view.md) | (no canonical AT yet — Phase-2 candidate) | `AT-TODAY-NN` | `AT-APPF-51..55` |
| 11 | Trash view | [`11-trash-view.md`](./11-trash-view.md) | `AT-APP-16, 19, 20` | `AT-TRASH-NN` | `AT-APPF-56..60` |
| 12 | Multi-select | [`12-multi-select.md`](./12-multi-select.md) | `AT-APP-17..18` | `AT-MULTI-NN` | `AT-APPF-61..65` |
| 13 | Templates | [`13-templates.md`](./13-templates.md) | (no canonical AT yet — Phase-2 candidate) | `AT-TEMPLATES-NN` | `AT-APPF-66..70` |
| 14 | Concurrency & sync | [`14-concurrency-and-sync.md`](./14-concurrency-and-sync.md) | (no canonical AT yet — Phase-2 candidate; AT-APP additions pending) | `AT-CONCURRENCY-NN` | `AT-APPF-71..75` |
| 15 | Roles & permissions | [`15-roles-and-permissions.md`](./15-roles-and-permissions.md) | `AT-APP-21..23` | `AT-ROLES-NN` | `AT-APPF-76..85` |

> **Cells marked "(no canonical AT yet)"** are tracked in [`spec/18-spec-issues/06-app-folder-audit-2026-04-26.md`](../../18-spec-issues/06-app-folder-audit-2026-04-26.md) and will be backfilled into the canonical file when the corresponding feature graduates from Phase-2 backlog.

---

## How to add a new acceptance criterion

1. **Default to canonical** — add the new criterion to [`spec/31-app/97-acceptance-criteria.md`](../97-acceptance-criteria.md) with the next `AT-APP-NN` (continue from the highest existing ID; never renumber).
2. **Mirror inline** — also add a corresponding row in the source feature file's own `## Acceptance Tests` table using that file's inline prefix (e.g. `AT-CONCURRENCY-17`). Cross-reference both IDs.
3. **Update this dispatch index** — bump the file's range in the Coverage Map above and bump this file's version.
4. **Never** invent a new `AT-APPF-NN` ID. The legacy column is frozen — it exists only so older references in `spec/18-spec-issues/` and the consistency report continue to resolve.

---

## Criteria Summary

- [x] All 15 feature files contain a `## Acceptance Tests` section using their inline prefix.
- [x] Each criterion is independently verifiable.
- [x] No criterion references runtime/backend specifics (deferred per `mem://constraints/backend-runtime-deferred`).
- [x] 250-item viewport limit enforced across all features (`AT-APP-05`).
- [x] All features respect the unified `Item` interface (`mem://architecture/data-model`).
- [x] Naming-scheme reconciliation complete — `AT-APP-NN` is canonical; `AT-APPF-NN` is frozen dispatch (APP-FIX-14, 2026-04-26).

---

## Validation History

| Date | Version | Action |
|------|---------|--------|
| 2026-04-23 | 1.0.0 | Initial scaffold; introduced `AT-APPF-NN` |
| 2026-04-23 | 1.0.1 | Marked checkboxes complete |
| 2026-04-26 | 2.0.0 | **APP-FIX-14.** Demoted `AT-APPF-NN` to frozen dispatch; declared `AT-APP-NN` canonical; added Coverage Map with three columns (canonical / inline / legacy); added "How to add a new criterion" rule. Closes audit F-12. |
