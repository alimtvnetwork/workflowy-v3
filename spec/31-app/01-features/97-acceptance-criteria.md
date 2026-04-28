# App Features — Acceptance Criteria

> **Version:** 2.3.0
> **Created:** 2026-04-23 (UTC+8)
> **Updated:** 2026-04-27 — v2.4.0 (F20) closed 12 more open prefixes via §"Inline-Prefix Closure (12 prefixes, 67 IDs)" — 11 identity registrations (`AT-BOARD/CONCURRENCY/CTXMENU/INTERACT/LAYOUT/PAGE/ROLES/SHARE/TEMPLATES/TODAY/TRASH-NN`) + 1 alias closure (`AT-MULTI-NN` → `AT-MULTISELECT-NN`). G-30 closed IDs 901→968. v2.3.0 (F15) closed two open prefixes: enumerated `AT-INFO-01..07` and `AT-MIRROR-01..06` as explicit alias rows mapping to source-file IDs (`AT-INFOMODEL-NN`, `AT-MIRRORS-NN`). Cited by 8 endpoint matrix rows. Prior: v2.2.0 added 8 dispatch rows for B1–B4 addendums (`07b`, `08b`, `09b`, `11b`, `12b`, `13b`, `14b`, `16`) covering `AT-APP-58..107` and inline prefixes `AT-MPG/DV/SM/TR/MZ/TPL/OQ/SR-NN`. v2.1.0 backfilled canonical AT for Today/Templates/Concurrency/SSE (`AT-APP-26..42`). v2.0.0 declared `AT-APP-NN` canonical (APP-FIX-14, closes F-12).
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
| 9b | Mirror peer-group (B1) | [`09b-mirror-peer-group-model.md`](./09b-mirror-peer-group-model.md) | `AT-APP-58..67` | `AT-MPG-NN` | — |
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

## Inline-Prefix Closure (identity + alias, 12 prefixes, 67 IDs)

> **F20 — 2026-04-27.** This section closes the open-prefix license for 12 inline prefixes that were previously satisfied only by the open-prefix `NN` placeholder. Each cited ID is now an explicit closed registration. The open-prefix declarations in the Coverage Map above remain (they continue to document the naming convention), but G-30 resolves these 67 specific citations via the rows here — meaning a citation to e.g. `AT-LAYOUT-99` will now be **rejected** unless added below.
>
> **Mostly identity** — 11 of 12 prefixes (`AT-BOARD/CONCURRENCY/CTXMENU/INTERACT/LAYOUT/PAGE/ROLES/SHARE/TEMPLATES/TODAY/TRASH`) match their source-file ID 1:1; the row exists to close the open-prefix license, not to translate names. **One alias** — `AT-MULTI-NN` resolves to `AT-MULTISELECT-NN` (source file `12-multi-select.md` uses the longer form; consumers shortened it).
>
> When the source file gains a new inline AT row that consumers want to cite, **add the corresponding row here in the same PR** (or remove the citation if the open prefix should remain placeholder-only).

| Closed ID (cited) | Source ID (in feature file) | Source file | Used by (consumer scope) |
|-------------------|------------------------------|-------------|---------------------------|
| `AT-BOARD-01` | `AT-BOARD-01` | [`07-board-view.md`](./07-board-view.md) | endpoint matrix, board endpoints |
| `AT-BOARD-02` | `AT-BOARD-02` | [`07-board-view.md`](./07-board-view.md) | endpoint matrix |
| `AT-BOARD-03` | `AT-BOARD-03` | [`07-board-view.md`](./07-board-view.md) | endpoint matrix |
| `AT-BOARD-04` | `AT-BOARD-04` | [`07-board-view.md`](./07-board-view.md) | endpoint matrix |
| `AT-CONCURRENCY-01` | `AT-CONCURRENCY-01` | [`14-concurrency-and-sync.md`](./14-concurrency-and-sync.md) | sync endpoints, replay workflow |
| `AT-CONCURRENCY-02` | `AT-CONCURRENCY-02` | [`14-concurrency-and-sync.md`](./14-concurrency-and-sync.md) | sync endpoints |
| `AT-CONCURRENCY-03` | `AT-CONCURRENCY-03` | [`14-concurrency-and-sync.md`](./14-concurrency-and-sync.md) | sync endpoints |
| `AT-CONCURRENCY-04` | `AT-CONCURRENCY-04` | [`14-concurrency-and-sync.md`](./14-concurrency-and-sync.md) | sync endpoints |
| `AT-CONCURRENCY-05` | `AT-CONCURRENCY-05` | [`14-concurrency-and-sync.md`](./14-concurrency-and-sync.md) | sync endpoints |
| `AT-CONCURRENCY-17` | `AT-CONCURRENCY-17` | [`14-concurrency-and-sync.md`](./14-concurrency-and-sync.md) | SSE event-frame contract |
| `AT-CTXMENU-01` | `AT-CTXMENU-01` | [`06-item-context-menu.md`](./06-item-context-menu.md) | endpoint matrix |
| `AT-CTXMENU-02` | `AT-CTXMENU-02` | [`06-item-context-menu.md`](./06-item-context-menu.md) | endpoint matrix |
| `AT-CTXMENU-03` | `AT-CTXMENU-03` | [`06-item-context-menu.md`](./06-item-context-menu.md) | endpoint matrix |
| `AT-CTXMENU-04` | `AT-CTXMENU-04` | [`06-item-context-menu.md`](./06-item-context-menu.md) | endpoint matrix |
| `AT-INTERACT-01` | `AT-INTERACT-01` | [`05-interactions.md`](./05-interactions.md) | item endpoints |
| `AT-INTERACT-02` | `AT-INTERACT-02` | [`05-interactions.md`](./05-interactions.md) | item endpoints |
| `AT-INTERACT-03` | `AT-INTERACT-03` | [`05-interactions.md`](./05-interactions.md) | item endpoints |
| `AT-INTERACT-04` | `AT-INTERACT-04` | [`05-interactions.md`](./05-interactions.md) | item endpoints |
| `AT-INTERACT-05` | `AT-INTERACT-05` | [`05-interactions.md`](./05-interactions.md) | item endpoints |
| `AT-INTERACT-06` | `AT-INTERACT-06` | [`05-interactions.md`](./05-interactions.md) | item endpoints |
| `AT-LAYOUT-01` | `AT-LAYOUT-01` | [`03-layout-structure.md`](./03-layout-structure.md) | layout shell |
| `AT-LAYOUT-02` | `AT-LAYOUT-02` | [`03-layout-structure.md`](./03-layout-structure.md) | layout shell |
| `AT-LAYOUT-12` | `AT-LAYOUT-12` | [`03-layout-structure.md`](./03-layout-structure.md) | favorite toggle (`EP-ITEMS-UPDATE`), feature-slices §4.12 |
| `AT-MULTI-01` | `AT-MULTISELECT-01` | [`12-multi-select.md`](./12-multi-select.md) | endpoint matrix (alias) |
| `AT-MULTI-02` | `AT-MULTISELECT-02` | [`12-multi-select.md`](./12-multi-select.md) | endpoint matrix (alias) |
| `AT-MULTI-03` | `AT-MULTISELECT-03` | [`12-multi-select.md`](./12-multi-select.md) | endpoint matrix (alias) |
| `AT-MULTI-04` | `AT-MULTISELECT-04` | [`12-multi-select.md`](./12-multi-select.md) | endpoint matrix (alias) |
| `AT-MULTI-05` | `AT-MULTISELECT-05` | [`12-multi-select.md`](./12-multi-select.md) | endpoint matrix (alias) |
| `AT-MULTI-06` | `AT-MULTISELECT-06` | [`12-multi-select.md`](./12-multi-select.md) | endpoint matrix (alias) |
| `AT-MULTI-07` | `AT-MULTISELECT-07` | [`12-multi-select.md`](./12-multi-select.md) | endpoint matrix (alias) |
| `AT-PAGE-01` | `AT-PAGE-01` | [`04-page-content-area.md`](./04-page-content-area.md) | endpoint matrix |
| `AT-ROLES-01` | `AT-ROLES-01` | [`15-roles-and-permissions.md`](./15-roles-and-permissions.md) | role endpoints |
| `AT-ROLES-02` | `AT-ROLES-02` | [`15-roles-and-permissions.md`](./15-roles-and-permissions.md) | role endpoints |
| `AT-ROLES-03` | `AT-ROLES-03` | [`15-roles-and-permissions.md`](./15-roles-and-permissions.md) | role endpoints |
| `AT-ROLES-04` | `AT-ROLES-04` | [`15-roles-and-permissions.md`](./15-roles-and-permissions.md) | role endpoints |
| `AT-ROLES-05` | `AT-ROLES-05` | [`15-roles-and-permissions.md`](./15-roles-and-permissions.md) | role endpoints |
| `AT-ROLES-06` | `AT-ROLES-06` | [`15-roles-and-permissions.md`](./15-roles-and-permissions.md) | role endpoints |
| `AT-ROLES-07` | `AT-ROLES-07` | [`15-roles-and-permissions.md`](./15-roles-and-permissions.md) | role endpoints |
| `AT-ROLES-08` | `AT-ROLES-08` | [`15-roles-and-permissions.md`](./15-roles-and-permissions.md) | role endpoints |
| `AT-ROLES-09` | `AT-ROLES-09` | [`15-roles-and-permissions.md`](./15-roles-and-permissions.md) | role endpoints |
| `AT-ROLES-10` | `AT-ROLES-10` | [`15-roles-and-permissions.md`](./15-roles-and-permissions.md) | role endpoints |
| `AT-SHARE-01` | `AT-SHARE-01` | [`08-share-dialog.md`](./08-share-dialog.md) | share endpoints |
| `AT-SHARE-02` | `AT-SHARE-02` | [`08-share-dialog.md`](./08-share-dialog.md) | share endpoints |
| `AT-SHARE-03` | `AT-SHARE-03` | [`08-share-dialog.md`](./08-share-dialog.md) | share endpoints |
| `AT-SHARE-04` | `AT-SHARE-04` | [`08-share-dialog.md`](./08-share-dialog.md) | share endpoints |
| `AT-SHARE-05` | `AT-SHARE-05` | [`08-share-dialog.md`](./08-share-dialog.md) | share endpoints |
| `AT-SHARE-06` | `AT-SHARE-06` | [`08-share-dialog.md`](./08-share-dialog.md) | share endpoints |
| `AT-SHARE-07` | `AT-SHARE-07` | [`08-share-dialog.md`](./08-share-dialog.md) | share endpoints |
| `AT-SHARE-08` | `AT-SHARE-08` | [`08-share-dialog.md`](./08-share-dialog.md) | share endpoints |
| `AT-TEMPLATES-01` | `AT-TEMPLATES-01` | [`13-templates.md`](./13-templates.md) | template endpoints |
| `AT-TEMPLATES-02` | `AT-TEMPLATES-02` | [`13-templates.md`](./13-templates.md) | template endpoints |
| `AT-TEMPLATES-03` | `AT-TEMPLATES-03` | [`13-templates.md`](./13-templates.md) | template endpoints |
| `AT-TEMPLATES-04` | `AT-TEMPLATES-04` | [`13-templates.md`](./13-templates.md) | template endpoints |
| `AT-TEMPLATES-05` | `AT-TEMPLATES-05` | [`13-templates.md`](./13-templates.md) | template endpoints |
| `AT-TEMPLATES-06` | `AT-TEMPLATES-06` | [`13-templates.md`](./13-templates.md) | template endpoints |
| `AT-TEMPLATES-07` | `AT-TEMPLATES-07` | [`13-templates.md`](./13-templates.md) | template endpoints |
| `AT-TEMPLATES-08` | `AT-TEMPLATES-08` | [`13-templates.md`](./13-templates.md) | template endpoints |
| `AT-TODAY-01` | `AT-TODAY-01` | [`10-today-view.md`](./10-today-view.md) | today endpoints |
| `AT-TODAY-02` | `AT-TODAY-02` | [`10-today-view.md`](./10-today-view.md) | today endpoints |
| `AT-TRASH-01` | `AT-TRASH-01` | [`11-trash-view.md`](./11-trash-view.md) | trash endpoints |
| `AT-TRASH-02` | `AT-TRASH-02` | [`11-trash-view.md`](./11-trash-view.md) | trash endpoints |
| `AT-TRASH-03` | `AT-TRASH-03` | [`11-trash-view.md`](./11-trash-view.md) | trash endpoints |
| `AT-TRASH-04` | `AT-TRASH-04` | [`11-trash-view.md`](./11-trash-view.md) | trash endpoints |
| `AT-TRASH-05` | `AT-TRASH-05` | [`11-trash-view.md`](./11-trash-view.md) | trash endpoints |
| `AT-TRASH-06` | `AT-TRASH-06` | [`11-trash-view.md`](./11-trash-view.md) | trash endpoints |
| `AT-TRASH-08` | `AT-TRASH-08` | [`11-trash-view.md`](./11-trash-view.md) | `EP-TRASH-PURGE-ALL` |
| `AT-TRASH-09` | `AT-TRASH-09` | [`11-trash-view.md`](./11-trash-view.md) | `EP-TRASH-PURGE-ALL` |

**Closure totals**: 67 closed registrations. New citations to any of these 12 prefixes outside the enumerated IDs (e.g. `AT-BOARD-99`, `AT-LAYOUT-13`) will be **rejected by G-30** until added to the table above.

**Why keep the open-prefix declarations in the Coverage Map?** The Coverage Map documents the *naming convention* (which inline prefix a feature file uses) and is used by humans for orientation. The closure table here is what G-30 actually consumes. Coexistence is intentional — see [`.lovable/question-and-ambiguity/13-alias-vs-open-prefix-coexistence.md`](../../../.lovable/question-and-ambiguity/13-alias-vs-open-prefix-coexistence.md).

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
| 2026-04-27 | 2.4.0 | **F20.** Closed 12 more open prefixes via §"Inline-Prefix Closure" — 11 identity registrations (`AT-BOARD/CONCURRENCY/CTXMENU/INTERACT/LAYOUT/PAGE/ROLES/SHARE/TEMPLATES/TODAY/TRASH-NN`) + 1 alias closure (`AT-MULTI-NN` → `AT-MULTISELECT-NN`). 67 closed registrations total; G-30 closed IDs 901→968. Open-prefix declarations in Coverage Map retained for naming-convention documentation only. |


---

## Fixtures

Fixtures for every AT row in this file are covered by the global P2g sweep — see [`../../97a-acceptance-criteria-fixtures.md`](../../97a-acceptance-criteria-fixtures.md) (apply the matching pattern by section).


---

## P13 stub rows

> Auto-appended by [`scripts/spec-hygiene/45-append-p13-orphan-stubs.mjs`](../../../scripts/spec-hygiene/45-append-p13-orphan-stubs.mjs) on 2026-04-28 to close orphan AT citations surfaced by [`40-generate-contract-json.mjs`](../../../scripts/spec-hygiene/40-generate-contract-json.mjs). Each row is a **placeholder definition** — replace the body with concrete Given/When/Then + JSON fixture during P2 (I/O table conversion). Do **not** delete a row without first removing every citation of its ID elsewhere in spec/.

### AT-INFO-08 — Information-model edge case (P13-stub)

📝 **P13-stub.** Definition pending. Replace this block with:
- Given/When/Then prose
- JSON request + envelope-shaped response (PascalCase `Status`/`Attributes`/`Results`) per [`spec/04-database-conventions/06-rest-api-format/`](../../04-database-conventions/06-rest-api-format/).
- A pointer to the test that enforces it (Vitest or PHPUnit), test name **MUST** start with this AT id.

### AT-LAYOUT-13 — Layout-structure edge case (P13-stub)

📝 **P13-stub.** Definition pending. Replace this block with:
- Given/When/Then prose
- JSON request + envelope-shaped response (PascalCase `Status`/`Attributes`/`Results`) per [`spec/04-database-conventions/06-rest-api-format/`](../../04-database-conventions/06-rest-api-format/).
- A pointer to the test that enforces it (Vitest or PHPUnit), test name **MUST** start with this AT id.

### AT-LAYOUT-99 — Layout-structure placeholder (P13-stub)

📝 **P13-stub.** Definition pending. Replace this block with:
- Given/When/Then prose
- JSON request + envelope-shaped response (PascalCase `Status`/`Attributes`/`Results`) per [`spec/04-database-conventions/06-rest-api-format/`](../../04-database-conventions/06-rest-api-format/).
- A pointer to the test that enforces it (Vitest or PHPUnit), test name **MUST** start with this AT id.

### AT-MIRROR-07 — Mirror peer-group edge case (P13-stub)

📝 **P13-stub.** Definition pending. Replace this block with:
- Given/When/Then prose
- JSON request + envelope-shaped response (PascalCase `Status`/`Attributes`/`Results`) per [`spec/04-database-conventions/06-rest-api-format/`](../../04-database-conventions/06-rest-api-format/).
- A pointer to the test that enforces it (Vitest or PHPUnit), test name **MUST** start with this AT id.

### AT-BOARD-99 — Board view placeholder (P13-stub)

📝 **P13-stub.** Definition pending. Replace this block with:
- Given/When/Then prose
- JSON request + envelope-shaped response (PascalCase `Status`/`Attributes`/`Results`) per [`spec/04-database-conventions/06-rest-api-format/`](../../04-database-conventions/06-rest-api-format/).
- A pointer to the test that enforces it (Vitest or PHPUnit), test name **MUST** start with this AT id.
