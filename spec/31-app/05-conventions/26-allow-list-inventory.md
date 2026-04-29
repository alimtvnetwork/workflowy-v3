---
slug: allow-list-inventory
version: 1.0.0
updated: 2026-04-29
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
| G-30 | G-30.2 | `REDUNDANCY_ALLOWLIST` | 0 | 0 ✅ |
| G-31 | G-31.1 | `WORKFLOWS_EXEMPT` | 0 | 0 ✅ |
| G-31 | G-31.2 | `FEATURES_EXEMPT` | 0 | 0 ✅ |
| G-31 | G-31.3 | `ENDPOINTS_EXEMPT` | 0 | 0 ✅ |
| G-31 | G-31.4 | `DB_DIAGRAM_EXEMPT` | 0 | 0 ✅ |
| G-31 | G-31.6 | `WORKFLOWS_ISLAND_EXEMPT` | 0 | 0 ✅ |
| G-31 | G-31.6 | `FEATURES_ISLAND_EXEMPT` | 0 | 0 ✅ |
| G-31 | G-31.6 | `ENDPOINTS_ISLAND_EXEMPT` | 0 | 0 ✅ |
| G-31 | G-31.6 | `DB_DIAGRAM_ISLAND_EXEMPT` | 0 | 0 ✅ |
| G-31 | G-31.7 | `WORKFLOWS_HEAD_EXEMPT` | 0 | 0 ✅ |
| G-31 | G-31.7 | `FEATURES_HEAD_EXEMPT` | 0 | 0 ✅ |
| G-31 | G-31.7 | `ENDPOINTS_HEAD_EXEMPT` | 0 | 0 ✅ |
| G-31 | G-31.7 | `DB_DIAGRAM_HEAD_EXEMPT` | 0 | 0 ✅ |
| G-32 | G-32.1 | `COVERAGE_EXEMPT` | 0 | 0 ✅ |
| G-32 | G-32.2 | `REVERSE_EXEMPT` | 8 | 0 ✅ |
| G-32 | G-32.3 | `NONUNIQUE_EXEMPT` | 0 | 0 ✅ |
| G-32 | G-32.5 | `PARITY_EXEMPT` | 0 | 0 ✅ |
| **TOTAL** | — | **17 lists** | **8** | **0** |

## G-30 — AT Citation Validity

**Runner:** [`scripts/spec-hygiene/30-check-at-citation-validity.mjs`](../../../scripts/spec-hygiene/30-check-at-citation-validity.mjs)

### `REDUNDANCY_ALLOWLIST` (G-30.2)

*open-prefix declarations exempt from redundancy ERROR.*

Source: [`scripts/spec-hygiene/30-check-at-citation-validity.mjs:124`](../../../scripts/spec-hygiene/30-check-at-citation-validity.mjs#L124)

_(empty)_

## G-31 — Cross-Reference Reciprocity

**Runner:** [`scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs`](../../../scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs)

### `WORKFLOWS_EXEMPT` (G-31.1)

*asymmetric cross-flow links by design.*

Source: [`scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs:174`](../../../scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs#L174)

_(empty)_

### `FEATURES_EXEMPT` (G-31.2)

*asymmetric feature cross-refs by design.*

Source: [`scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs:178`](../../../scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs#L178)

_(empty)_

### `ENDPOINTS_EXEMPT` (G-31.3)

*asymmetric endpoint cross-refs by design.*

Source: [`scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs:182`](../../../scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs#L182)

_(empty)_

### `DB_DIAGRAM_EXEMPT` (G-31.4)

*asymmetric db-diagram cross-refs by design.*

Source: [`scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs:186`](../../../scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs#L186)

_(empty)_

### `WORKFLOWS_ISLAND_EXEMPT` (G-31.6)

*workflow files with no peer cross-refs (legitimate).*

Source: [`scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs:199`](../../../scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs#L199)

_(empty)_

### `FEATURES_ISLAND_EXEMPT` (G-31.6)

*feature files with no peer cross-refs (legitimate).*

Source: [`scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs:203`](../../../scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs#L203)

_(empty)_

### `ENDPOINTS_ISLAND_EXEMPT` (G-31.6)

*endpoint files with no peer cross-refs (legitimate).*

Source: [`scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs:213`](../../../scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs#L213)

_(empty)_

### `DB_DIAGRAM_ISLAND_EXEMPT` (G-31.6)

*db-diagram files with no peer cross-refs (legitimate).*

Source: [`scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs:217`](../../../scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs#L217)

_(empty)_

### `WORKFLOWS_HEAD_EXEMPT` (G-31.7)

*workflow files using non-canonical related-section heading.*

Source: [`scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs:228`](../../../scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs#L228)

_(empty)_

### `FEATURES_HEAD_EXEMPT` (G-31.7)

*feature files using non-canonical related-section heading.*

Source: [`scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs:232`](../../../scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs#L232)

_(empty)_

### `ENDPOINTS_HEAD_EXEMPT` (G-31.7)

*endpoint files using non-canonical related-section heading.*

Source: [`scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs:236`](../../../scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs#L236)

_(empty)_

### `DB_DIAGRAM_HEAD_EXEMPT` (G-31.7)

*db-diagram files using non-canonical related-section heading.*

Source: [`scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs:240`](../../../scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs#L240)

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
