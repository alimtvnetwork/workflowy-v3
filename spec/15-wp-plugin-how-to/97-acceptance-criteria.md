# WP Plugin How-To — Acceptance Criteria (Roll-up)

> **Version:** 2.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 12 cross-section criteria (227 inherited IDs across 15 sub-leaves)
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## Purpose

Cross-section acceptance criteria that every WP-plugin sub-leaf inherits. Per-section IDs live in each sub-folder's `97-acceptance-criteria.md`.

This roll-up applies BOTH to the canonical reference plugin AND to any future plugin that claims conformance with this how-to.

---

## ID Range

`AT-WPROOT-01` … `AT-WPROOT-12`

---

## Coverage Map

| § | Sub-section | ID Range | Count |
|---|-------------|----------|-------|
| 02 | [`02-enums-and-coding-style/`](./02-enums-and-coding-style/97-acceptance-criteria.md) | `AT-ENUMSANDCODINGSTYLE-01..13` | 13 |
| 04 | [`04-logging-and-error-handling/`](./04-logging-and-error-handling/97-acceptance-criteria.md) | `AT-LOGGINGANDERRORHANDLING-01..16` | 16 |
| 05 | [`05-helpers-responses-and-integration/`](./05-helpers-responses-and-integration/97-acceptance-criteria.md) | `AT-HELPERSRESPONSESANDINTEGRATION-01..14` | 14 |
| 07 | [`07-reference-implementations/`](./07-reference-implementations/97-acceptance-criteria.md) | `AT-REFERENCEIMPLEMENTATIONS-01..13` | 13 |
| 08 | [`08-wordpress-integration-patterns/`](./08-wordpress-integration-patterns/97-acceptance-criteria.md) | `AT-WORDPRESSINTEGRATIONPATTERNS-01..16` | 16 |
| 09 | [`09-testing-patterns/`](./09-testing-patterns/97-acceptance-criteria.md) | `AT-TESTINGPATTERNS-01..16` | 16 |
| 10 | [`10-deployment-patterns/`](./10-deployment-patterns/97-acceptance-criteria.md) | `AT-DEPLOYMENTPATTERNS-01..16` | 16 |
| 11 | [`11-frontend-and-template-patterns/`](./11-frontend-and-template-patterns/97-acceptance-criteria.md) | `AT-FRONTENDANDTEMPLATEPATTERNS-01..14` | 14 |
| 12 | [`12-design-system/`](./12-design-system/97-acceptance-criteria.md) | `AT-DESIGNSYSTEM-01..16` | 16 |
| 13 | [`13-admin-ui-patterns/`](./13-admin-ui-patterns/97-acceptance-criteria.md) | `AT-ADMINUIPATTERNS-01..15` | 15 |
| 14 | [`14-rest-api-conventions/`](./14-rest-api-conventions/97-acceptance-criteria.md) | `AT-RESTAPICONVENTIONS-01..16` | 16 |
| 15 | [`15-settings-architecture/`](./15-settings-architecture/97-acceptance-criteria.md) | `AT-SETTINGSARCHITECTURE-01..14` | 14 |
| 16 | [`16-error-handling-extraction/`](./16-error-handling-extraction/97-acceptance-criteria.md) | `AT-ERRORHANDLINGEXTRACTION-01..16` | 16 |
| 19 | [`19-micro-orm-and-root-db/`](./19-micro-orm-and-root-db/97-acceptance-criteria.md) | `AT-MICROORMANDROOTDB-01..14` | 14 |
| 20 | [`20-end-to-end-walkthrough/`](./20-end-to-end-walkthrough/97-acceptance-criteria.md) | `AT-ENDTOENDWALKTHROUGH-01..18` | 18 |
| **Total** | | | **227** |

---

## Cross-Section Criteria

### Backend-runtime agnosticism (frontend-side)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-WPROOT-01 | NO sub-section spec MAY assume the WordPress runtime is the chosen frontend backend; per `mem://constraints/backend-runtime-deferred`, the WP-plugin how-to MUST stay describable as one possible delegated server (Tier 1) — frontend-coupling references in any sub-leaf fail review. | [`mem://constraints/backend-runtime-deferred`](mem://constraints/backend-runtime-deferred), [`../03-error-manage/02-error-architecture/01-error-handling-reference/02-tier1-delegated-server.md`](../03-error-manage/02-error-architecture/01-error-handling-reference/02-tier1-delegated-server.md) |

### Enum & response-key SSOT

| ID | Criterion | Source |
|----|-----------|--------|
| AT-WPROOT-02 | Every PHP enum referenced anywhere in this how-to MUST appear in `spec/20-enums-index.md`; missing registration is a Code-Red consistency bug. | [`./02-enums-and-coding-style/97-acceptance-criteria.md`](./02-enums-and-coding-style/97-acceptance-criteria.md), [`../20-enums-index.md`](../20-enums-index.md) |
| AT-WPROOT-03 | Every response-payload key across §05 / §13 / §14 / §15 MUST come from the `ResponseKeyType` enum; string-literal keys ANYWHERE in PHP response builders are Code-Red. | [`./14-rest-api-conventions/97-acceptance-criteria.md`](./14-rest-api-conventions/97-acceptance-criteria.md), [`../02-coding-guidelines/04-php/09-response-key-type-inventory/97-acceptance-criteria.md`](../02-coding-guidelines/04-php/09-response-key-type-inventory/97-acceptance-criteria.md) |

### Error-handling spine

| ID | Criterion | Source |
|----|-----------|--------|
| AT-WPROOT-04 | Every code path that calls into WordPress core, the DB layer, or the network MUST be wrapped by `SafeExecute::run(...)` (per §04 AT-LOGGINGANDERRORHANDLING-11) OR explicitly justify-and-link a §16 extraction reason; bare try/catch+log is forbidden. | [`./04-logging-and-error-handling/97-acceptance-criteria.md`](./04-logging-and-error-handling/97-acceptance-criteria.md), [`./16-error-handling-extraction/97-acceptance-criteria.md`](./16-error-handling-extraction/97-acceptance-criteria.md) |
| AT-WPROOT-05 | The Tier-1 delegated-server contract from `03-error-manage` MUST be honoured by every API error path: error envelope includes `code`, `message`, `statusCode`, `requestId`, `stacktraceId` (when debug-mode on); divergence is a Code-Red cross-stack bug. | [`../03-error-manage/02-error-architecture/01-error-handling-reference/02-tier1-delegated-server.md`](../03-error-manage/02-error-architecture/01-error-handling-reference/02-tier1-delegated-server.md), [`./04-logging-and-error-handling/97-acceptance-criteria.md`](./04-logging-and-error-handling/97-acceptance-criteria.md) |

### Settings & seedable config alignment

| ID | Criterion | Source |
|----|-----------|--------|
| AT-WPROOT-06 | Every plugin setting whose default appears in §15 MUST also appear in the seedable-config layer with the same default; the two SSOTs MUST agree byte-for-byte (per `06-seedable-config-architecture/01-fundamentals`). | [`./15-settings-architecture/97-acceptance-criteria.md`](./15-settings-architecture/97-acceptance-criteria.md), [`../06-seedable-config-architecture/01-fundamentals/97-acceptance-criteria.md`](../06-seedable-config-architecture/01-fundamentals/97-acceptance-criteria.md) |

### REST + admin-UI consistency

| ID | Criterion | Source |
|----|-----------|--------|
| AT-WPROOT-07 | Every admin-UI action button (§13) that calls a REST endpoint MUST reference the route via `endpoints.json` (NOT a hardcoded path); hardcoded paths in admin JS are Code-Red. | [`./13-admin-ui-patterns/97-acceptance-criteria.md`](./13-admin-ui-patterns/97-acceptance-criteria.md), [`./14-rest-api-conventions/97-acceptance-criteria.md`](./14-rest-api-conventions/97-acceptance-criteria.md) |
| AT-WPROOT-08 | The admin-UI design system (§12) MUST consume the same color, spacing, and typography tokens as the front-end design system (`32-ui-design/03-design-system`); divergence is a brand-consistency bug. | [`./12-design-system/97-acceptance-criteria.md`](./12-design-system/97-acceptance-criteria.md), [`../32-ui-design/03-design-system/97-acceptance-criteria.md`](../32-ui-design/03-design-system/97-acceptance-criteria.md) |

### Testing & deployment gates

| ID | Criterion | Source |
|----|-----------|--------|
| AT-WPROOT-09 | Every public PHP class added under §07 / §08 / §11 / §13 / §14 / §15 / §19 MUST have at least one unit OR integration test in §09; uncovered public classes fail the §09 coverage gate. | [`./09-testing-patterns/97-acceptance-criteria.md`](./09-testing-patterns/97-acceptance-criteria.md) |
| AT-WPROOT-10 | The §10 deployment pipeline MUST run the §09 test suite + the spec-hygiene suite + a static analysis pass before producing a release artefact; skipping any gate is a Code-Red CI bug. | [`./10-deployment-patterns/97-acceptance-criteria.md`](./10-deployment-patterns/97-acceptance-criteria.md), [`../13-cicd-pipeline-workflows/00-overview.md`](../13-cicd-pipeline-workflows/00-overview.md) |

### Walkthrough & glossary alignment

| ID | Criterion | Source |
|----|-----------|--------|
| AT-WPROOT-11 | The §20 end-to-end walkthrough MUST exercise at least one criterion from EACH of §02, §04, §05, §08, §13, §14, §15; gaps fail the §20 coverage gate. | [`./20-end-to-end-walkthrough/97-acceptance-criteria.md`](./20-end-to-end-walkthrough/97-acceptance-criteria.md) |
| AT-WPROOT-12 | Every domain term used across these 15 sub-sections MUST resolve to an entry in `spec/19-glossary.md`; undefined jargon fails the glossary cross-ref check. | [`../19-glossary.md`](../19-glossary.md) |

---

## Verification

```bash
# String-literal response keys anywhere under the plugin tree (should be 0)
rg -nP "wp_send_json\w*\(\s*\[\s*'\w" includes/

# Hardcoded REST paths in admin JS (should be 0)
rg -nP "/wp-json/[a-z0-9_/-]+" assets/admin/

# Bare swallowing catches (should be 0)
rg -nB1 -A4 'catch\s*\(\\?Throwable' includes/ | rg -B5 'return\s+(null|false)'

# Hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../03-error-manage/02-error-architecture/01-error-handling-reference/02-tier1-delegated-server.md`](../03-error-manage/02-error-architecture/01-error-handling-reference/02-tier1-delegated-server.md) — Tier-1 contract
- [`../06-seedable-config-architecture/01-fundamentals/97-acceptance-criteria.md`](../06-seedable-config-architecture/01-fundamentals/97-acceptance-criteria.md) — Seedable config defaults
- [`../19-glossary.md`](../19-glossary.md) — Terminology SSOT
- [`../20-enums-index.md`](../20-enums-index.md) — Enum registry
- [`mem://constraints/backend-runtime-deferred`](mem://constraints/backend-runtime-deferred) — Frontend-runtime decoupling

---

*Curated 2026-04-25 — closes batch-21 roll-up. Replaces v1.0.0 scaffold. Aggregates 15 sub-leaves with 227 inherited acceptance IDs.*
