# App Features — Acceptance Criteria

> **Version:** 2.3.0
> **Created:** 2026-04-23 (UTC+8)
> **Updated:** 2026-04-27 — v2.3.0 (F15) closed two open prefixes: enumerated `AT-INFO-01..07` and `AT-MIRROR-01..06` as explicit alias rows mapping to source-file IDs (`AT-INFOMODEL-NN`, `AT-MIRRORS-NN`). Cited by 8 endpoint matrix rows. Prior: v2.2.0 added 8 dispatch rows for B1–B4 addendums (`07b`, `08b`, `09b`, `11b`, `12b`, `13b`, `14b`, `16`) covering `AT-APP-58..107` and inline prefixes `AT-MGP/DV/SM/TR/MZ/TPL/OQ/SR-NN`. v2.1.0 backfilled canonical AT for Today/Templates/Concurrency/SSE (`AT-APP-26..42`). v2.0.0 declared `AT-APP-NN` canonical (APP-FIX-14, closes F-12).
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
| 7b | Dashboard view (B2) | [`07b-dashboard-view.md`](./07b-dashboard-view.md) | `AT-APP-68..75` | `AT-DV-NN` | — |
| 8 | Share dialog | [`08-share-dialog.md`](./08-share-dialog.md) | `AT-APP-25` | `AT-SHARE-NN` | `AT-APPF-41..45` |
| 8b | Sharing × Mirror (B4) | [`08b-sharing-mirror-interaction.md`](./08b-sharing-mirror-interaction.md) | `AT-APP-76..80` | `AT-SM-NN` | — |
| 9 | Mirrors | [`09-mirrors.md`](./09-mirrors.md) | `AT-APP-24` | `AT-MIRROR-NN` | `AT-APPF-46..50` |
| 9b | Mirror peer-group (B1) | [`09b-mirror-peer-group-model.md`](./09b-mirror-peer-group-model.md) | `AT-APP-58..67` | `AT-MGP-NN` | — |
| 10 | Today view | [`10-today-view.md`](./10-today-view.md) | `AT-APP-26..28` | `AT-TODAY-NN` | `AT-APPF-51..55` |
| 11 | Trash view | [`11-trash-view.md`](./11-trash-view.md) | `AT-APP-16, 19, 20` | `AT-TRASH-NN` | `AT-APPF-56..60` |
| 11b | Trash reaper (B4) | [`11b-trash-reaper.md`](./11b-trash-reaper.md) | `AT-APP-81..85` | `AT-TR-NN` | — |
| 12 | Multi-select | [`12-multi-select.md`](./12-multi-select.md) | `AT-APP-17..18` | `AT-MULTI-NN` | `AT-APPF-61..65` |
| 12b | Multi-select zoom (B4) | [`12b-multi-select-zoom.md`](./12b-multi-select-zoom.md) | `AT-APP-86..91` | `AT-MZ-NN` | — |
| 13 | Templates | [`13-templates.md`](./13-templates.md) | `AT-APP-29..32` | `AT-TEMPLATES-NN` | `AT-APPF-66..70` |
| 13b | Templates — snapshot (B4) | [`13b-templates-snapshot-semantics.md`](./13b-templates-snapshot-semantics.md) | `AT-APP-92..96` | `AT-TPL-NN` | — |
| 14 | Concurrency & sync | [`14-concurrency-and-sync.md`](./14-concurrency-and-sync.md) | `AT-APP-33..42` (core §14.2/§14.4 + SSE §14.5) | `AT-CONCURRENCY-NN` | `AT-APPF-71..75` |
| 14b | Offline queue (B3) | [`14b-offline-queue.md`](./14b-offline-queue.md) | `AT-APP-97..102` | `AT-OQ-NN` | — |
| 15 | Roles & permissions | [`15-roles-and-permissions.md`](./15-roles-and-permissions.md) | `AT-APP-21..23` | `AT-ROLES-NN` | `AT-APPF-76..85` |
| 16 | Search ranking (B3) | [`16-search-ranking.md`](./16-search-ranking.md) | `AT-APP-103..107` | `AT-SR-NN` | — |

> **Cells marked "(no canonical AT yet)"** are tracked in [`spec/18-spec-issues/06-app-folder-audit-2026-04-26.md`](../../18-spec-issues/06-app-folder-audit-2026-04-26.md) and will be backfilled into the canonical file when the corresponding feature graduates from Phase-2 backlog.

---

## Inline-Prefix Alias Enumeration (closed)

> Some inline prefixes have **shorter aliases** used by consumer files (matrix, endpoint contracts) that differ from the source file's actual `AT-*` IDs. To prevent G-30 from relying on the open-prefix `NN` license forever, the alias→source mappings below are **explicitly enumerated**, turning each citation into a closed table-row registration.
>
> When the source feature file gains a new `AT-INFOMODEL-NN` or `AT-MIRRORS-NN` row that consumers want to cite under the short alias, **add the corresponding alias row here in the same PR**.

### `AT-INFO-NN` ↔ `AT-INFOMODEL-NN` (source: [`01-information-model.md`](./01-information-model.md))

| Alias | Source ID | Used by |
|-------|-----------|---------|
| `AT-INFO-01` | `AT-INFOMODEL-01` | `EP-ITEMS-LIST` |
| `AT-INFO-02` | `AT-INFOMODEL-02` | `EP-ITEMS-LIST` |
| `AT-INFO-03` | `AT-INFOMODEL-03` | `EP-ITEMS-GET` |
| `AT-INFO-04` | `AT-INFOMODEL-04` | `EP-ITEMS-ROOT` |
| `AT-INFO-05` | `AT-INFOMODEL-05` | `EP-ITEMS-CREATE` |
| `AT-INFO-06` | `AT-INFOMODEL-06` | `EP-ITEMS-UPDATE` |
| `AT-INFO-07` | `AT-INFOMODEL-07` | `EP-ITEMS-TURN-INTO` |

### `AT-MIRROR-NN` ↔ `AT-MIRRORS-NN` (source: [`09-mirrors.md`](./09-mirrors.md))

| Alias | Source ID | Used by |
|-------|-----------|---------|
| `AT-MIRROR-01` | `AT-MIRRORS-01` | `EP-MIRRORS-CREATE` |
| `AT-MIRROR-02` | `AT-MIRRORS-02` | `EP-MIRRORS-CREATE` |
| `AT-MIRROR-03` | `AT-MIRRORS-03` | `EP-MIRRORS-LIST` |
| `AT-MIRROR-04` | `AT-MIRRORS-04` | `EP-MIRRORS-LIST` |
| `AT-MIRROR-05` | `AT-MIRRORS-05` | `EP-MIRRORS-DELETE` |
| `AT-MIRROR-06` | `AT-MIRRORS-06` | `EP-MIRRORS-DELETE` |

> The open-prefix declarations `` `AT-INFO-NN` `` and `` `AT-MIRROR-NN` `` in the Coverage Map above remain (they document the *naming convention*) — but G-30 now resolves these specific 13 citations via the closed rows here. If a citation appears for `AT-INFO-08` or `AT-MIRROR-07`, the gate will reject it until the alias is added to the table above.

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
| 2026-04-26 | 2.1.0 | **Polish #1.** Backfilled canonical AT for the four "no canonical AT yet" rows: Today (`AT-APP-26..28`), Templates (`AT-APP-29..32`), Concurrency core (`AT-APP-33..35`), SSE transport (`AT-APP-36..42`). Coverage Map now fully canonical. |
| 2026-04-27 | 2.2.0 | **B1–B4 batch.** Added 8 dispatch rows (7b, 8b, 9b, 11b, 12b, 13b, 14b, 16) covering 50 new ATs (`AT-APP-58..107`) with inline prefixes `AT-DV/SM/MGP/TR/MZ/TPL/OQ/SR-NN`. |
| 2026-04-27 | 2.3.0 | **F15.** Added "Inline-Prefix Alias Enumeration (closed)" section enumerating `AT-INFO-01..07` ↔ `AT-INFOMODEL-01..07` (7 rows) and `AT-MIRROR-01..06` ↔ `AT-MIRRORS-01..06` (6 rows). G-30 now resolves these 13 specific citations from closed rows; open prefixes retained for documenting the naming convention but no longer the *only* declaration source. |
