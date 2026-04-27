---
slug: allow-list-inventory
version: 1.0.0
updated: 2026-04-27
parent: ./02-ci-quality-gates.md
status: generated
generator: scripts/spec-hygiene/35-allow-list-inventory.mjs
---

# Allow-List Inventory

> **Generated.** Do not hand-edit. Run
> `node scripts/spec-hygiene/35-allow-list-inventory.mjs` to regenerate.
> CI verifies freshness with `--check`.

Companion to the meta sub-checks **G-30.3 / G-31.5 / G-32.4** which assert
that every allow-list entry carries a rationale comment. This report makes
the *content* of those allow-lists visible at-a-glance so opt-out bloat
does not hide behind a green ✅.

**Parent:** [`02-ci-quality-gates.md`](./02-ci-quality-gates.md)

## Summary

| Gate | Sub-check | Allow-list | Entries | Unrationaled |
|------|-----------|------------|--------:|-------------:|
| G-30 | G-30.2 | `REDUNDANCY_ALLOWLIST` | 41 | 0 ✅ |
| G-31 | G-31.1 | `WORKFLOWS_EXEMPT` | 0 | 0 ✅ |
| G-31 | G-31.2 | `FEATURES_EXEMPT` | 0 | 0 ✅ |
| G-31 | G-31.3 | `ENDPOINTS_EXEMPT` | 0 | 0 ✅ |
| G-31 | G-31.4 | `DB_DIAGRAM_EXEMPT` | 0 | 0 ✅ |
| G-31 | G-31.6 | `WORKFLOWS_ISLAND_EXEMPT` | 0 | 0 ✅ |
| G-31 | G-31.6 | `FEATURES_ISLAND_EXEMPT` | 5 | 0 ✅ |
| G-31 | G-31.6 | `ENDPOINTS_ISLAND_EXEMPT` | 9 | 0 ✅ |
| G-31 | G-31.6 | `DB_DIAGRAM_ISLAND_EXEMPT` | 0 | 0 ✅ |
| G-31 | G-31.7 | `WORKFLOWS_HEAD_EXEMPT` | 0 | 0 ✅ |
| G-31 | G-31.7 | `FEATURES_HEAD_EXEMPT` | 2 | 0 ✅ |
| G-31 | G-31.7 | `ENDPOINTS_HEAD_EXEMPT` | 0 | 0 ✅ |
| G-31 | G-31.7 | `DB_DIAGRAM_HEAD_EXEMPT` | 0 | 0 ✅ |
| G-32 | G-32.1 | `COVERAGE_EXEMPT` | 0 | 0 ✅ |
| G-32 | G-32.2 | `REVERSE_EXEMPT` | 8 | 0 ✅ |
| G-32 | G-32.3 | `NONUNIQUE_EXEMPT` | 0 | 0 ✅ |
| G-32 | G-32.5 | `PARITY_EXEMPT` | 0 | 0 ✅ |
| **TOTAL** | — | **17 lists** | **65** | **0** |

## G-30 — AT Citation Validity

**Runner:** [`scripts/spec-hygiene/30-check-at-citation-validity.mjs`](../../../scripts/spec-hygiene/30-check-at-citation-validity.mjs)

### `REDUNDANCY_ALLOWLIST` (G-30.2)

*open-prefix declarations exempt from redundancy ERROR.*

Source: [`scripts/spec-hygiene/30-check-at-citation-validity.mjs:111`](../../../scripts/spec-hygiene/30-check-at-citation-validity.mjs#L111)

| # | Entry | Rationale |
|---|-------|-----------|
| 1 | `AT-FOO-` | Doc-example placeholder (02-ci-quality-gates.md) |
| 2 | `AT-WORKFLOWS-` | 02-workflows/97 future canonical index |
| 3 | `AT-ROADMAP-` | 04-roadmap/97 future canonical index |
| 4 | `AT-ENDPOINTS-` | 06-endpoints/97 future canonical index |
| 5 | `AT-DBDIAGRAM-` | 07-db-diagram/97 future canonical index |
| 6 | `AT-INFO-` | ↔ AT-INFOMODEL-NN (F15 alias closure) |
| 7 | `AT-MIRROR-` | ↔ AT-MIRRORS-NN (F15 alias closure) |
| 8 | `AT-MULTI-` | ↔ AT-MULTISELECT-NN (F20 alias closure) |
| 9 | `AT-BOARD-` | F20 identity closure |
| 10 | `AT-CONCURRENCY-` | F20 identity closure |
| 11 | `AT-CTXMENU-` | F20 identity closure |
| 12 | `AT-INTERACT-` | F20 identity closure |
| 13 | `AT-LAYOUT-` | F20 identity closure |
| 14 | `AT-PAGE-` | F20 identity closure |
| 15 | `AT-ROLES-` | F20 identity closure |
| 16 | `AT-SHARE-` | F20 identity closure |
| 17 | `AT-TEMPLATES-` | F20 identity closure |
| 18 | `AT-TODAY-` | F20 identity closure |
| 19 | `AT-TRASH-` | F20 identity closure |
| 20 | `AT-MULTISELECT-` | 12-multi-select source-file prefix (canonical: AT-APP-17..18) |
| 21 | `AT-INFOMODEL-` | 01-information-model source-file prefix (canonical: AT-APP-01..05) |
| 22 | `AT-MIRRORS-` | 09-mirrors source-file prefix (canonical: AT-APP-24) |
| 23 | `AT-DV-` | 07b-dashboard-view inline (canonical: AT-APP-68..75) |
| 24 | `AT-SM-` | 08b-sharing-mirror-interaction inline (canonical: AT-APP-76..80) |
| 25 | `AT-MGP-` | 09b-mirror-peer-group-model inline (canonical: AT-APP-58..67) |
| 26 | `AT-TR-` | 11b-trash-reaper inline (canonical: AT-APP-81..85) |
| 27 | `AT-MZ-` | 12b-multi-select-zoom inline (canonical: AT-APP-86..91) |
| 28 | `AT-TPL-` | 13b-templates-snapshot-semantics inline (canonical: AT-APP-92..96) |
| 29 | `AT-OQ-` | 14b-offline-queue inline (canonical: AT-APP-97..102) |
| 30 | `AT-SR-` | 16-search-ranking inline (canonical: AT-APP-103..107) |
| 31 | `AT-WF-MIGRATE-` | → AT-APP-66, 67 (10-migration-execution-flow) |
| 32 | `AT-WF-CREATE-` | → AT-APP-58, 59, 62, 66, 67 (09-mirror-create-flow) |
| 33 | `AT-WF-REAPER-` | → AT-APP-81..85 (05-trash-reaper-flow) |
| 34 | `AT-WF-SEARCH-` | → AT-APP-103..107 (06-search-query-flow) |
| 35 | `AT-WF-REPLAY-` | → AT-APP-97..102 (07-sync-replay-flow) |
| 36 | `AT-WF-DETACH-` | → AT-APP-60..65 subset (08-mirror-detach-flow) |
| 37 | `AT-WF-TEMPLATE-` | → AT-APP-43..46 (02-template-application-flow) |
| 38 | `AT-WF-SHARE-` | → AT-APP-47..51 (03-share-invite-flow) |
| 39 | `AT-WF-RESTORE-` | → AT-APP-52..57 (04-trash-restore-flow) |
| 40 | `AT-APP-` | CANONICAL AT family (97-acceptance-criteria.md) |
| 41 | `AT-APPF-` | FROZEN legacy dispatch column (APP-FIX-14) |

## G-31 — Cross-Reference Reciprocity

**Runner:** [`scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs`](../../../scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs)

### `WORKFLOWS_EXEMPT` (G-31.1)

*asymmetric cross-flow links by design.*

Source: [`scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs:166`](../../../scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs#L166)

_(empty)_

### `FEATURES_EXEMPT` (G-31.2)

*asymmetric feature cross-refs by design.*

Source: [`scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs:171`](../../../scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs#L171)

_(empty)_

### `ENDPOINTS_EXEMPT` (G-31.3)

*asymmetric endpoint cross-refs by design.*

Source: [`scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs:175`](../../../scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs#L175)

_(empty)_

### `DB_DIAGRAM_EXEMPT` (G-31.4)

*asymmetric db-diagram cross-refs by design.*

Source: [`scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs:179`](../../../scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs#L179)

_(empty)_

### `WORKFLOWS_ISLAND_EXEMPT` (G-31.6)

*workflow files with no peer cross-refs (legitimate).*

Source: [`scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs:192`](../../../scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs#L192)

_(empty)_

### `FEATURES_ISLAND_EXEMPT` (G-31.6)

*feature files with no peer cross-refs (legitimate).*

Source: [`scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs:196`](../../../scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs#L196)

| # | Entry | Rationale |
|---|-------|-----------|
| 1 | `07b-dashboard-view.md` | addendum to 07-board-view / 07a-dashboard-view |
| 2 | `08b-sharing-mirror-interaction.md` | addendum to 08-share-dialog / 09-mirrors |
| 3 | `11b-trash-reaper.md` | addendum to 11-trash-view (reaper cron detail) |
| 4 | `12b-multi-select-zoom.md` | addendum to 12-multi-select (zoom interaction) |
| 5 | `13b-templates-snapshot-semantics.md` | addendum to 13-templates (snapshot rules) |

### `ENDPOINTS_ISLAND_EXEMPT` (G-31.6)

*endpoint files with no peer cross-refs (legitimate).*

Source: [`scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs:207`](../../../scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs#L207)

| # | Entry | Rationale |
|---|-------|-----------|
| 1 | `03-layout-structure.md` | top-level shell; no sibling endpoint depends on it |
| 2 | `04-page-content-area.md` | main outliner surface; standalone |
| 3 | `05-interactions.md` | global interaction catalog; standalone |
| 4 | `06-item-context-menu.md` | context-menu surface; standalone |
| 5 | `07-board-view.md` | board surface; cross-refs go to features |
| 6 | `10-today-view.md` | today surface; cross-refs go to features |
| 7 | `12-multi-select.md` | multi-select surface; cross-refs go to features |
| 8 | `13-templates.md` | templates surface; cross-refs go to features |
| 9 | `15-search.md` | search surface; cross-refs go to features |

### `DB_DIAGRAM_ISLAND_EXEMPT` (G-31.6)

*db-diagram files with no peer cross-refs (legitimate).*

Source: [`scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs:223`](../../../scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs#L223)

_(empty)_

### `WORKFLOWS_HEAD_EXEMPT` (G-31.7)

*workflow files using non-canonical related-section heading.*

Source: [`scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs:234`](../../../scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs#L234)

_(empty)_

### `FEATURES_HEAD_EXEMPT` (G-31.7)

*feature files using non-canonical related-section heading.*

Source: [`scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs:238`](../../../scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs#L238)

| # | Entry | Rationale |
|---|-------|-----------|
| 1 | `09a-mirror-cycle-detection.md` | 09a citations are predominantly cross-domain (endpoints, edge-cases, mem://) rather than peer featu… |
| 2 | `14b-offline-queue.md` | 14b citations are predominantly cross-domain (src/types, mem://, infra constraint) rather than peer… |

### `ENDPOINTS_HEAD_EXEMPT` (G-31.7)

*endpoint files using non-canonical related-section heading.*

Source: [`scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs:245`](../../../scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs#L245)

_(empty)_

### `DB_DIAGRAM_HEAD_EXEMPT` (G-31.7)

*db-diagram files using non-canonical related-section heading.*

Source: [`scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs:249`](../../../scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs#L249)

_(empty)_

## G-32 — DDL Unique Coverage

**Runner:** [`scripts/spec-hygiene/32-check-ddl-unique-coverage.mjs`](../../../scripts/spec-hygiene/32-check-ddl-unique-coverage.mjs)

### `COVERAGE_EXEMPT` (G-32.1)

*DDL CREATE INDEX statements exempt from doc-row coverage.*

Source: [`scripts/spec-hygiene/32-check-ddl-unique-coverage.mjs:83`](../../../scripts/spec-hygiene/32-check-ddl-unique-coverage.mjs#L83)

_(empty)_

### `REVERSE_EXEMPT` (G-32.2)

*doc rows allowed without a corresponding DDL CREATE INDEX.*

Source: [`scripts/spec-hygiene/32-check-ddl-unique-coverage.mjs:92`](../../../scripts/spec-hygiene/32-check-ddl-unique-coverage.mjs#L92)

| # | Entry | Rationale |
|---|-------|-----------|
| 1 | `IdxUser_Email` | logical tag for sqlite_autoindex_User_* |
| 2 | `IdxWorkspace_AppDbPath` | logical tag for sqlite_autoindex_Workspace_* |
| 3 | `IdxItem_Content` | §"Indexes NOT created" — FTS5 ships in Phase 2 |
| 4 | `IdxItem_CreatedAt` | §"Indexes NOT created" — order is by FractionalIndex, not CreatedAt |
| 5 | `IdxComment_AuthorUserId` | §"Indexes NOT created" — "all my comments" is not an MVP view |
| 6 | `IdxItem_MirrorOfItemId` | dropped by M-117 (legacy Mirror table) |
| 7 | `IdxMirror_SourceItemId` | dropped by M-117 (legacy Mirror table) |
| 8 | `IdxMirror_MirrorItemId` | dropped by M-117 (legacy Mirror table) |

### `NONUNIQUE_EXEMPT` (G-32.3)

*indexes allowed to be non-UNIQUE despite UNIQUE-by-default policy.*

Source: [`scripts/spec-hygiene/32-check-ddl-unique-coverage.mjs:114`](../../../scripts/spec-hygiene/32-check-ddl-unique-coverage.mjs#L114)

_(empty)_

### `PARITY_EXEMPT` (G-32.5)

*doc rows whose columns/predicate intentionally diverge from DDL.*

Source: [`scripts/spec-hygiene/32-check-ddl-unique-coverage.mjs:122`](../../../scripts/spec-hygiene/32-check-ddl-unique-coverage.mjs#L122)

_(empty)_

---

**Regenerate:** `node scripts/spec-hygiene/35-allow-list-inventory.mjs`
