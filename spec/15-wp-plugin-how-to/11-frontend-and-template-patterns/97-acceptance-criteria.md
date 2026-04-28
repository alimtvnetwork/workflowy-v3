# Frontend And Template Patterns — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 14 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-FRONTENDANDTEMPLATEPATTERNS-01` … `AT-FRONTENDANDTEMPLATEPATTERNS-14`

---

## Criteria

### File size limits (file 01)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-FRONTENDANDTEMPLATEPATTERNS-01 | Page templates ≤ **200 lines**; partial templates ≤ **120 lines**; React component files ≤ **200 lines** (test files exempt up to 400). | [`01-file-size-limits.md`](./01-file-size-limits.md), [`../../02-coding-guidelines/consolidated-review-guide/97-acceptance-criteria.md`](../../02-coding-guidelines/consolidated-review-guide/97-acceptance-criteria.md) |
| AT-FRONTENDANDTEMPLATEPATTERNS-02 | A template exceeding the limit MUST be split via the partial-extraction rules in §05; a single oversized file is a Code-Red review block. | [`01-file-size-limits.md`](./01-file-size-limits.md), [`05-when-to-extract-a-partial.md`](./05-when-to-extract-a-partial.md) |

### Template architecture & orchestrator (files 02, 03)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-FRONTENDANDTEMPLATEPATTERNS-03 | Templates live under `templates/<page>/{index,partials/}`; template files outside this layout are forbidden. | [`02-template-architecture.md`](./02-template-architecture.md) |
| AT-FRONTENDANDTEMPLATEPATTERNS-04 | Page templates are **orchestrators only** — they declare layout + render partials; business logic, DB calls, or HTTP calls inside a page template are forbidden. | [`03-page-templates-orchestrator.md`](./03-page-templates-orchestrator.md) |

### Partials (files 04, 05)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-FRONTENDANDTEMPLATEPATTERNS-05 | Partials receive data via an explicit `$context` array (NOT global state); reading `$_GET`/`$_POST`/`global $foo` inside a partial is forbidden. | [`04-partial-templates.md`](./04-partial-templates.md) |
| AT-FRONTENDANDTEMPLATEPATTERNS-06 | A partial MUST be extracted when ANY of: (a) >50 lines of markup, (b) reused in 2+ pages, (c) has its own conditional-display logic; the §05 decision matrix is the SSOT. | [`05-when-to-extract-a-partial.md`](./05-when-to-extract-a-partial.md) |

### Traditional JS/CSS (file 06)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-FRONTENDANDTEMPLATEPATTERNS-07 | Traditional (non-React) JS files use **vanilla ES2020+** (no jQuery in new code); jQuery is permitted ONLY for legacy WP-admin integration touchpoints documented in §06. | [`06-traditional-js-css.md`](./06-traditional-js-css.md) |
| AT-FRONTENDANDTEMPLATEPATTERNS-08 | All inline event handlers (`onclick=`, `onchange=`) in templates are forbidden; bind via `addEventListener` in the enqueued JS. | [`06-traditional-js-css.md`](./06-traditional-js-css.md) |

### React integration (files 07, 08, 09)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-FRONTENDANDTEMPLATEPATTERNS-09 | React apps mount into a single `<div id="riseup-react-root">` per page; multiple parallel React roots on one page are forbidden. | [`07-react-integration.md`](./07-react-integration.md) |
| AT-FRONTENDANDTEMPLATEPATTERNS-10 | React state communicates with PHP via the canonical envelope (`Success`/`Data`/`Error`/`Meta`); ad-hoc JSON shapes break logging traceability. | [`07-react-integration.md`](./07-react-integration.md), [`../05-helpers-responses-and-integration/97-acceptance-criteria.md`](../05-helpers-responses-and-integration/97-acceptance-criteria.md) |
| AT-FRONTENDANDTEMPLATEPATTERNS-11 | Source maps are emitted for all production builds (`sourcemap: true` in vite config); shipping minified JS without source maps is a Code-Red debuggability bug. | [`08-source-maps-and-build.md`](./08-source-maps-and-build.md) |
| AT-FRONTENDANDTEMPLATEPATTERNS-12 | React assets are enqueued via `wp_enqueue_script` with version pinned to the build hash (NOT plugin version); cache busting is automatic. | [`09-react-asset-enqueuing.md`](./09-react-asset-enqueuing.md) |

### Decision matrix (file 10)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-FRONTENDANDTEMPLATEPATTERNS-13 | The §10 decision matrix is the SSOT for choosing **traditional template** vs **React component** per surface; bypassing the matrix (e.g., React for a 50-line static report) requires a §10 update first. | [`10-decision-matrix-and-summary.md`](./10-decision-matrix-and-summary.md) |
| AT-FRONTENDANDTEMPLATEPATTERNS-14 | The summary table in §10 is the canonical reference cited by the consolidated review guide; reviewers MUST verify every new frontend surface against the matrix. | [`10-decision-matrix-and-summary.md`](./10-decision-matrix-and-summary.md), [`../../02-coding-guidelines/consolidated-review-guide/97-acceptance-criteria.md`](../../02-coding-guidelines/consolidated-review-guide/97-acceptance-criteria.md) |

---

## Verification

```bash
# Inline event handlers in templates
rg -nP 'on(click|change|submit|input|focus|blur)=' templates/

# Multiple React roots
rg -n 'id="riseup-react-root"' templates/ | sort -u | wc -l

# Hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../05-helpers-responses-and-integration/97-acceptance-criteria.md`](../05-helpers-responses-and-integration/97-acceptance-criteria.md) — Response envelope
- [`../12-design-system/97-acceptance-criteria.md`](../12-design-system/97-acceptance-criteria.md) — Design system
- [`../../02-coding-guidelines/consolidated-review-guide/97-acceptance-criteria.md`](../../02-coding-guidelines/consolidated-review-guide/97-acceptance-criteria.md) — Master review

---

*Curated 2026-04-25 — closes A-23 (batch 12). Replaces v0.1.0 stub.*


---

## Fixtures

Fixtures for every AT row in this file are covered by the global P2g sweep — see [`../../97a-acceptance-criteria-fixtures.md`](../../97a-acceptance-criteria-fixtures.md) (apply the matching pattern by section).
