# 97 — Acceptance Criteria

> **Version:** 1.0.0 · **Created:** 2026-04-25 (UTC+8) · **Status:** ✅ Authored
> **Parent:** [`00-overview.md`](./00-overview.md)
> **ID prefix:** `AT-WF02-*` (stable; do not renumber)

---

## How to read

Each criterion is **observable, testable, and binary** (pass/fail). "MUST" = normative requirement. Each row links to the spec section that defines the behavior.

| Status legend | Meaning |
|---------------|---------|
| ⏳ | Pending implementation (default for all rows) |
| ✅ | Verified |
| ❌ | Failing |

---

## Open / Close & Focus (4)

| ID | Criterion | Spec ref | Status |
|----|-----------|----------|--------|
| AT-WF02-OC-01 | Pressing `⌘K` (macOS) / `Ctrl+K` (others) anywhere in the app MUST open the popover and move focus to the header input within 100ms. | [`08-keyboard-shortcuts.md`](./08-keyboard-shortcuts.md) § 1 | ⏳ |
| AT-WF02-OC-02 | Pressing `Escape` MUST close the popover and return focus to the element that had focus before opening. | [`10-accessibility.md`](./10-accessibility.md) § 2 | ⏳ |
| AT-WF02-OC-03 | Clicking outside the popover bounds MUST close it; clicking inside MUST NOT. | [`01-popover-anatomy.md`](./01-popover-anatomy.md) § Container | ⏳ |
| AT-WF02-OC-04 | When `quickActions.pinned === true`, `Escape` and outside-click MUST NOT close; only the close button or `⌘K` toggle does. | [`04-right-action-icons.md`](./04-right-action-icons.md) § Quick Actions | ⏳ |

## Tab Rail (2)

| ID | Criterion | Spec ref | Status |
|----|-----------|----------|--------|
| AT-WF02-TAB-05 | `Tab` key inside the popover MUST cycle focus through tabs; arrow keys MUST move active tab. Wrap at ends. | [`02-filter-tab-rail.md`](./02-filter-tab-rail.md) § Keyboard | ⏳ |
| AT-WF02-TAB-06 | The active tab MUST render with `--accent-active` background and `--accent-active-foreground` text; inactive tabs MUST use `--muted-foreground`. | [`11-design-tokens.md`](./11-design-tokens.md) § 3 | ⏳ |

## Hint & Suggestions (2)

| ID | Criterion | Spec ref | Status |
|----|-----------|----------|--------|
| AT-WF02-HINT-07 | The default Scope tab MUST show the default hint copy when input is empty; switching tabs MUST swap to that tab's chip suggestions within one render. | [`03-hint-and-suggestions.md`](./03-hint-and-suggestions.md) § Default | ⏳ |
| AT-WF02-HINT-08 | Typing `is:`, `has:`, `in:`, or `date:` MUST open the value picker listbox with relevant options; arrow keys navigate, Enter commits. | [`03-hint-and-suggestions.md`](./03-hint-and-suggestions.md) § Value picker | ⏳ |

## Token System (4)

| ID | Criterion | Spec ref | Status |
|----|-----------|----------|--------|
| AT-WF02-TOK-09 | Typing `keyword:value` followed by space MUST commit a chip and clear the keyword text from the input. | [`05-token-system.md`](./05-token-system.md) § Commit | ⏳ |
| AT-WF02-TOK-10 | Double-clicking a chip MUST enter edit mode with the original raw text in a mini-input; Enter commits, Escape reverts. | [`05-token-system.md`](./05-token-system.md) § Edit | ⏳ |
| AT-WF02-TOK-11 | `Backspace` at input position 0 with no selection MUST select the rightmost chip; a second `Backspace` MUST delete it. | [`05-token-system.md`](./05-token-system.md) § Delete | ⏳ |
| AT-WF02-TOK-12 | Pasting text containing `keyword:value` segments MUST parse them into chips per [`06-query-grammar.md`](./06-query-grammar.md). | [`05-token-system.md`](./05-token-system.md) § Paste-parse | ⏳ |

## Results & Highlighting (4)

| ID | Criterion | Spec ref | Status |
|----|-----------|----------|--------|
| AT-WF02-RES-13 | Query changes MUST debounce 80ms before re-filtering the outline. | [`07-results-and-highlighting.md`](./07-results-and-highlighting.md) § Debounce | ⏳ |
| AT-WF02-RES-14 | Matching nodes' ancestors MUST be transiently expanded so matches are visible; collapsing on close MUST restore prior state. | [`07-results-and-highlighting.md`](./07-results-and-highlighting.md) § Expansion | ⏳ |
| AT-WF02-RES-15 | Match substrings MUST be wrapped in `<mark>` styled with `--highlight` / `--highlight-foreground`. | [`07-results-and-highlighting.md`](./07-results-and-highlighting.md) § Highlighting | ⏳ |
| AT-WF02-RES-16 | The footer pill MUST show `"{N} matches"` (or `"No matches"`); `↑`/`↓` MUST cycle through matches with wraparound. | [`07-results-and-highlighting.md`](./07-results-and-highlighting.md) § Cycling | ⏳ |

## Accessibility & Responsive (2)

| ID | Criterion | Spec ref | Status |
|----|-----------|----------|--------|
| AT-WF02-A11Y-17 | All interactive elements MUST meet WCAG 2.2 AA contrast and have visible focus rings using `--ring`. | [`10-accessibility.md`](./10-accessibility.md) § 5 | ⏳ |
| AT-WF02-A11Y-18 | On viewport widths < 640px, the popover MUST render as a bottom sheet covering ≥ 60vh; tab rail remains horizontal scrollable. | [`09-states-and-edge-cases.md`](./09-states-and-edge-cases.md) § Mobile | ⏳ |

## Saved & Motion (2)

| ID | Criterion | Spec ref | Status |
|----|-----------|----------|--------|
| AT-WF02-EXT-19 | Saved Searches list MUST render the contract shape from [`13-data-contracts.md`](./13-data-contracts.md) § 6; clicking a row MUST replace current query and re-run. | [`04-right-action-icons.md`](./04-right-action-icons.md) § Saved Searches | ⏳ |
| AT-WF02-EXT-20 | When `prefers-reduced-motion: reduce`, all popover/tab/token/picker animations MUST be suppressed (instant transitions). | [`10-accessibility.md`](./10-accessibility.md) § 6 | ⏳ |

---

## Coverage matrix

| Spec file | Criteria covering it |
|-----------|----------------------|
| `01-popover-anatomy.md` | OC-03 |
| `02-filter-tab-rail.md` | TAB-05, TAB-06 |
| `03-hint-and-suggestions.md` | HINT-07, HINT-08 |
| `04-right-action-icons.md` | OC-04, EXT-19 |
| `05-token-system.md` | TOK-09..12 |
| `06-query-grammar.md` | TOK-12 (parse) |
| `07-results-and-highlighting.md` | RES-13..16 |
| `08-keyboard-shortcuts.md` | OC-01, OC-02 |
| `09-states-and-edge-cases.md` | A11Y-18 |
| `10-accessibility.md` | A11Y-17, EXT-20 |
| `11-design-tokens.md` | TAB-06, RES-15 |
| `12-icon-map.md` | (visual; verified via TAB-06 + RES-16) |
| `13-data-contracts.md` | EXT-19, RES-13 |

All 13 sub-specs have at least one AC. Total: **20 criteria**.

---

## Verification methods

| Method | Used by |
|--------|---------|
| Manual keyboard walkthrough | OC-01..04, TAB-05, TOK-09..12 |
| Visual regression (Storybook + Chromatic) | TAB-06, RES-15, A11Y-18 |
| Automated a11y (axe-core) | A11Y-17 |
| Performance trace (Chrome DevTools) | RES-13 |
| Screen reader pass (NVDA + VoiceOver) | OC-02, A11Y-17, EXT-20 |
| Unit test (parser + reducers) | TOK-12, EXT-19 |


---

## Fixtures

Fixtures for every AT row in this file are covered by the global P2g sweep — see [`../../../97a-acceptance-criteria-fixtures.md`](../../../97a-acceptance-criteria-fixtures.md) (apply the matching pattern by section).
