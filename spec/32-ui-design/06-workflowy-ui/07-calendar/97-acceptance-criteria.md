# Phase 7 — Calendar / Today Acceptance Criteria

> **Version:** 2.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 14 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-WFCAL-01` … `AT-WFCAL-14`

---

## Criteria

### Today view (file 01)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-WFCAL-01 | The `/today` route MUST render all items where `date = today` OR `starred = true`; deviating from the union semantics is a Code-Red spec bug. | [`01-today-view.md`](./01-today-view.md) |
| AT-WFCAL-02 | "Today" MUST be calculated in the user's local timezone (NOT UTC); UTC-based "today" is a Code-Red correctness bug because it shifts items between days for users. | [`01-today-view.md`](./01-today-view.md) |
| AT-WFCAL-03 | Today items MUST be sortable by exactly three modes: manual order (default), time-of-day, alpha; additional sort modes require a separate spec amendment. | [`01-today-view.md`](./01-today-view.md) |
| AT-WFCAL-04 | The selected sort mode MUST persist across reloads via local preferences (per `08-app-shell` AT-WFSHELL-13). | [`01-today-view.md`](./01-today-view.md), [`../08-app-shell/97-acceptance-criteria.md`](../08-app-shell/97-acceptance-criteria.md) |
| AT-WFCAL-05 | An empty Today view MUST render the empty-state contract (illustration + one-line + CTA per `05-quality` AT-UIQA-15); blank screens are a Code-Red UX bug. | [`01-today-view.md`](./01-today-view.md), [`../../05-quality/97-acceptance-criteria.md`](../../05-quality/97-acceptance-criteria.md) |

### Quick Add modal (file 02)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-WFCAL-06 | `⌘⇧N` (Mac) / `Ctrl+Shift+N` (Win/Linux) MUST open the Quick Add modal from ANY context, including inside the editor; suppression in editors is a Code-Red UX bug. | [`02-quick-add-modal.md`](./02-quick-add-modal.md) |
| AT-WFCAL-07 | The modal MUST close on `Esc` (cancel), `Enter` (submit), OR click-outside (cancel); missing any path is a Code-Red UX bug. | [`02-quick-add-modal.md`](./02-quick-add-modal.md) |
| AT-WFCAL-08 | Submission MUST append a new node to Inbox AND show a confirmation toast within 100 ms; silent submission is a UX bug. | [`02-quick-add-modal.md`](./02-quick-add-modal.md) |
| AT-WFCAL-09 | The modal MUST trap focus AND auto-focus the input on open; missing auto-focus is a Code-Red accessibility bug. | [`02-quick-add-modal.md`](./02-quick-add-modal.md), [`../../05-quality/97-acceptance-criteria.md`](../../05-quality/97-acceptance-criteria.md) |
| AT-WFCAL-10 | Submission MUST be optimistic with rollback on failure (per `02-state-and-data` AT-UISTATE-08); silent failure is a Code-Red UX bug. | [`02-quick-add-modal.md`](./02-quick-add-modal.md), [`../../02-state-and-data/97-acceptance-criteria.md`](../../02-state-and-data/97-acceptance-criteria.md) |

### Found dates (file 03)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-WFCAL-11 | The calendar picker month grid MUST render exactly 7 columns × 6 rows (42 cells), even when month has 28 days — leading/trailing days from adjacent months MUST fill empty cells; variable-row grids are FORBIDDEN. | [`03-found-dates.md`](./03-found-dates.md) |
| AT-WFCAL-12 | Found Date markers MUST appear as dots beneath the date number (NOT replacing the number, NOT covering it); marker styling MUST come from semantic HSL tokens (per `03-design-system`). | [`03-found-dates.md`](./03-found-dates.md), [`../../03-design-system/97-acceptance-criteria.md`](../../03-design-system/97-acceptance-criteria.md) |
| AT-WFCAL-13 | Clicking a date in the calendar MUST open the date-filter search results AND update the URL (deep-linkable); missing URL update is a Code-Red routing bug. | [`03-found-dates.md`](./03-found-dates.md), [`../01-navbar/03-routing.md`](../01-navbar/03-routing.md) |

### Cross-cutting

| ID | Criterion | Source |
|----|-----------|--------|
| AT-WFCAL-14 | Calendar week-start (Sunday vs Monday) MUST follow the user's locale OR a documented Settings toggle; hardcoded week-start is a localization bug. | [`03-found-dates.md`](./03-found-dates.md), [`../08-app-shell/04-settings.md`](../08-app-shell/04-settings.md) |

---

## Verification

```bash
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../06-sidebar/97-acceptance-criteria.md`](../06-sidebar/97-acceptance-criteria.md) — Calendar sidebar entry (AT-WFSIDE-10)
- [`../08-app-shell/97-acceptance-criteria.md`](../08-app-shell/97-acceptance-criteria.md) — Settings persistence
- [`../../05-quality/97-acceptance-criteria.md`](../../05-quality/97-acceptance-criteria.md) — Empty + a11y states

---

*Curated 2026-04-25 — closes batch-20 item 2. Replaces v1.0.0 checklist.*


---

## Fixtures

Fixtures for every AT row in this file are covered by the global P2g sweep — see [`../../../97a-acceptance-criteria-fixtures.md`](../../../97a-acceptance-criteria-fixtures.md) (apply the matching pattern by section).
