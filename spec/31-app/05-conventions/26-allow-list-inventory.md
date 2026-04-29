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
| G-32 | G-32.2 | `REVERSE_EXEMPT` | 0 | 0 ✅ |
| G-32 | G-32.3 | `NONUNIQUE_EXEMPT` | 0 | 0 ✅ |
| G-32 | G-32.5 | `PARITY_EXEMPT` | 0 | 0 ✅ |
| **TOTAL** | — | **17 lists** | **0** | **0** |

## G-30 — AT Citation Validity

**Runner:** [`scripts/spec-hygiene/30-check-at-citation-validity.mjs`](../../../scripts/spec-hygiene/30-check-at-citation-validity.mjs)

### `REDUNDANCY_ALLOWLIST` (G-30.2)

*open-prefix declarations exempt from redundancy ERROR.*

Source: [`scripts/spec-hygiene/30-check-at-citation-validity.mjs:131`](../../../scripts/spec-hygiene/30-check-at-citation-validity.mjs#L131)

_(empty)_

## G-31 — Cross-Reference Reciprocity

**Runner:** [`scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs`](../../../scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs)

### `WORKFLOWS_EXEMPT` (G-31.1)

*asymmetric cross-flow links by design.*

Source: [`scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs:175`](../../../scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs#L175)

_(empty)_

### `FEATURES_EXEMPT` (G-31.2)

*asymmetric feature cross-refs by design.*

Source: [`scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs:179`](../../../scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs#L179)

_(empty)_

### `ENDPOINTS_EXEMPT` (G-31.3)

*asymmetric endpoint cross-refs by design.*

Source: [`scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs:183`](../../../scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs#L183)

_(empty)_

### `DB_DIAGRAM_EXEMPT` (G-31.4)

*asymmetric db-diagram cross-refs by design.*

Source: [`scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs:187`](../../../scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs#L187)

_(empty)_

### `WORKFLOWS_ISLAND_EXEMPT` (G-31.6)

*workflow files with no peer cross-refs (legitimate).*

Source: [`scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs:200`](../../../scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs#L200)

_(empty)_

### `FEATURES_ISLAND_EXEMPT` (G-31.6)

*feature files with no peer cross-refs (legitimate).*

Source: [`scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs:204`](../../../scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs#L204)

_(empty)_

### `ENDPOINTS_ISLAND_EXEMPT` (G-31.6)

*endpoint files with no peer cross-refs (legitimate).*

Source: [`scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs:214`](../../../scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs#L214)

_(empty)_

### `DB_DIAGRAM_ISLAND_EXEMPT` (G-31.6)

*db-diagram files with no peer cross-refs (legitimate).*

Source: [`scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs:218`](../../../scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs#L218)

_(empty)_

### `WORKFLOWS_HEAD_EXEMPT` (G-31.7)

*workflow files using non-canonical related-section heading.*

Source: [`scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs:229`](../../../scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs#L229)

_(empty)_

### `FEATURES_HEAD_EXEMPT` (G-31.7)

*feature files using non-canonical related-section heading.*

Source: [`scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs:233`](../../../scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs#L233)

_(empty)_

### `ENDPOINTS_HEAD_EXEMPT` (G-31.7)

*endpoint files using non-canonical related-section heading.*

Source: [`scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs:237`](../../../scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs#L237)

_(empty)_

### `DB_DIAGRAM_HEAD_EXEMPT` (G-31.7)

*db-diagram files using non-canonical related-section heading.*

Source: [`scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs:241`](../../../scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs#L241)

_(empty)_

## G-32 — DDL Unique Coverage

**Runner:** [`scripts/spec-hygiene/32-check-ddl-unique-coverage.mjs`](../../../scripts/spec-hygiene/32-check-ddl-unique-coverage.mjs)

### `COVERAGE_EXEMPT` (G-32.1)

*DDL CREATE INDEX statements exempt from doc-row coverage.*

Source: [`scripts/spec-hygiene/32-check-ddl-unique-coverage.mjs:84`](../../../scripts/spec-hygiene/32-check-ddl-unique-coverage.mjs#L84)

_(empty)_

### `REVERSE_EXEMPT` (G-32.2)

*doc rows allowed without a corresponding DDL CREATE INDEX.*

Source: [`scripts/spec-hygiene/32-check-ddl-unique-coverage.mjs:96`](../../../scripts/spec-hygiene/32-check-ddl-unique-coverage.mjs#L96)

_(empty)_

### `NONUNIQUE_EXEMPT` (G-32.3)

*indexes allowed to be non-UNIQUE despite UNIQUE-by-default policy.*

Source: [`scripts/spec-hygiene/32-check-ddl-unique-coverage.mjs:105`](../../../scripts/spec-hygiene/32-check-ddl-unique-coverage.mjs#L105)

_(empty)_

### `PARITY_EXEMPT` (G-32.5)

*doc rows whose columns/predicate intentionally diverge from DDL.*

Source: [`scripts/spec-hygiene/32-check-ddl-unique-coverage.mjs:113`](../../../scripts/spec-hygiene/32-check-ddl-unique-coverage.mjs#L113)

_(empty)_

---

**Regenerate:** `node scripts/spec-hygiene/35-allow-list-inventory.mjs`
