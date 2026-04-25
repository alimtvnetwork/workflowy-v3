# Admin UI Patterns — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 15 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-ADMINUIPATTERNS-01` … `AT-ADMINUIPATTERNS-15`

---

## Criteria

### Page layout & actions bar (files 01, 02)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ADMINUIPATTERNS-01 | Admin pages use the canonical 3-region layout: **header bar** (title + primary action), **filters/actions strip**, **content region**; deviating layouts require a §01 update first. | [`01-page-layout.md`](./01-page-layout.md) |
| AT-ADMINUIPATTERNS-02 | The actions bar holds AT MOST one Primary button + N Secondary/Ghost buttons; multiple Primary buttons in one bar are forbidden (visual hierarchy violation). | [`02-actions-bar.md`](./02-actions-bar.md), [`../12-design-system/97-acceptance-criteria.md`](../12-design-system/97-acceptance-criteria.md) |

### Filter bar (file 03)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ADMINUIPATTERNS-03 | Filter state MUST round-trip through the URL query-string (sharable links, browser history); filters held only in JS state are forbidden. | [`03-filter-bar.md`](./03-filter-bar.md) |
| AT-ADMINUIPATTERNS-04 | Active filters render as removable chips with a single "Clear all" affordance; missing the clear-all is a UX bug. | [`03-filter-bar.md`](./03-filter-bar.md) |

### Tables (file 04)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ADMINUIPATTERNS-05 | All admin tables use the documented `<Table>` primitive (sticky header, zebra rows, sort affordance, row-action menu); rolling your own `<table>` markup is forbidden. | [`04-table-patterns.md`](./04-table-patterns.md), [`../11-frontend-and-template-patterns/97-acceptance-criteria.md`](../11-frontend-and-template-patterns/97-acceptance-criteria.md) |
| AT-ADMINUIPATTERNS-06 | Tables MUST handle 4 states: loading, empty (zero results), filtered-empty (filter excludes everything), error; missing any state is a UX bug. | [`04-table-patterns.md`](./04-table-patterns.md), [`08-empty-and-loading-states.md`](./08-empty-and-loading-states.md) |

### Badges & modals (files 05, 06)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ADMINUIPATTERNS-07 | Badge variants MUST match the documented semantic mapping (Success=green, Warning=amber, Error=red, Info=blue, Neutral=grey); off-spec colour use is a Code-Red theming bug. | [`05-badge-usage.md`](./05-badge-usage.md), [`../12-design-system/97-acceptance-criteria.md`](../12-design-system/97-acceptance-criteria.md) |
| AT-ADMINUIPATTERNS-08 | Modals follow the §06 anatomy: header with title + close X, scrollable body, footer with Primary on right + Cancel on left; reversed button order or missing close X fails review. | [`06-modal-anatomy.md`](./06-modal-anatomy.md) |

### Notices (file 07)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ADMINUIPATTERNS-09 | WP admin notices use the documented `<Notice>` primitive with type ∈ {success, warning, error, info} and dismissibility flag; raw `<div class="notice notice-error">` markup outside the primitive is forbidden. | [`07-notices.md`](./07-notices.md) |
| AT-ADMINUIPATTERNS-10 | Persistent (non-dismissible) notices MUST link to a remediation action; standalone "something is broken" notices without a CTA are a UX bug. | [`07-notices.md`](./07-notices.md) |

### Empty/loading states & stats (files 08, 09)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ADMINUIPATTERNS-11 | Loading skeletons MUST match the final content shape (NOT generic spinners) for surfaces with predictable structure (tables, cards); generic spinners on table loads fail review. | [`08-empty-and-loading-states.md`](./08-empty-and-loading-states.md) |
| AT-ADMINUIPATTERNS-12 | Empty states MUST include: illustration/icon, headline, supporting text, single primary CTA; bare "No results" text is forbidden. | [`08-empty-and-loading-states.md`](./08-empty-and-loading-states.md) |
| AT-ADMINUIPATTERNS-13 | Progress indicators differentiate determinate (known %) vs indeterminate (unknown duration) — using a determinate bar with `value=null` is forbidden. | [`09-stats-and-progress.md`](./09-stats-and-progress.md) |

### Forms/tabs/pagination & misc (files 10, 11)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ADMINUIPATTERNS-14 | Pagination controls show: current page, total pages, prev/next, jump-to-first/last (when total > 5 pages); missing jump controls on long pagers fails review. | [`10-forms-tabs-pagination.md`](./10-forms-tabs-pagination.md) |
| AT-ADMINUIPATTERNS-15 | Misc rules in §11 (focus rings, tab order, keyboard shortcuts on tables/modals) are mandatory accessibility requirements; failing any is a Code-Red a11y bug. | [`11-misc-and-rules.md`](./11-misc-and-rules.md) |

---

## Verification

```bash
# Raw <table> markup outside <Table> primitive
rg -nP '<table\b' templates/admin/ src/components/admin/ | grep -v '<Table\b'

# Raw notice div markup
rg -nP "<div\\s+class=['\"]notice notice-" templates/

# Hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../12-design-system/97-acceptance-criteria.md`](../12-design-system/97-acceptance-criteria.md) — Tokens, badges, modals
- [`../11-frontend-and-template-patterns/97-acceptance-criteria.md`](../11-frontend-and-template-patterns/97-acceptance-criteria.md) — Template/React composition
- [`../15-settings-architecture/97-acceptance-criteria.md`](../15-settings-architecture/97-acceptance-criteria.md) — Settings page layout

---

*Curated 2026-04-25 — closes A-24 (batch 13). Replaces v0.1.0 stub.*
