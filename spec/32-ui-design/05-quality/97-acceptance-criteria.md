# Quality — Acceptance Criteria

> **Version:** 2.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 15 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-UIQA-01` … `AT-UIQA-15`

---

## Criteria

### Accessibility (file 01)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-UIQA-01 | All theme/component combinations MUST meet WCAG 2.1 AA contrast (4.5:1 normal text, 3:1 large text + UI elements); failing combinations are a Code-Red accessibility bug. | [`01-accessibility.md`](./01-accessibility.md) |
| AT-UIQA-02 | All interactive targets MUST be ≥ 24 × 24 CSS px (WCAG 2.5.8 Target Size Minimum); smaller targets are a Code-Red accessibility bug. | [`01-accessibility.md`](./01-accessibility.md) |
| AT-UIQA-03 | Every interactive element MUST have a visible focus ring with ≥ 3:1 contrast against its background; suppressing the focus ring (`outline: none` without replacement) is a Code-Red bug. | [`01-accessibility.md`](./01-accessibility.md) |
| AT-UIQA-04 | The full editor MUST be operable by keyboard alone (no mouse-only paths); any feature inaccessible by keyboard is a Code-Red accessibility bug. | [`01-accessibility.md`](./01-accessibility.md) |
| AT-UIQA-05 | All non-decorative images / icons MUST have `alt` text or `aria-label`; decorative SVGs MUST set `aria-hidden="true"`; missing either is a Code-Red bug. | [`01-accessibility.md`](./01-accessibility.md) |
| AT-UIQA-06 | Live regions (toasts, autosave indicators) MUST use `aria-live="polite"` (or `assertive` only for errors); missing live-region semantics is a Code-Red SR bug. | [`01-accessibility.md`](./01-accessibility.md) |

### Performance (file 02)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-UIQA-07 | A 250-item viewport MUST render in < 16 ms (sustained 60 fps target); breaching is a Code-Red perf bug per `mem://architecture/data-model` 250-item cap. | [`02-performance.md`](./02-performance.md), [`mem://architecture/data-model`](mem://architecture/data-model) |
| AT-UIQA-08 | Initial JS bundle (first load, gzipped) MUST be ≤ 250 KB; route-split chunks ≤ 100 KB; CI MUST fail on budget breach. | [`02-performance.md`](./02-performance.md) |
| AT-UIQA-09 | Lighthouse Performance score on the editor route MUST be ≥ 90 on a documented mid-tier mobile profile; < 90 fails review. | [`02-performance.md`](./02-performance.md) |
| AT-UIQA-10 | Lists with > 50 items MUST use virtualization (react-virtual or equivalent) OR a documented windowing strategy; un-virtualized > 50-item lists are a Code-Red perf bug. | [`02-performance.md`](./02-performance.md) |
| AT-UIQA-11 | Images MUST be lazy-loaded (`loading="lazy"`) below the fold; eager-loaded below-fold images are a perf bug. | [`02-performance.md`](./02-performance.md) |

### Loading / empty / error states (file 03)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-UIQA-12 | EVERY async surface MUST specify all four states: idle, loading, empty, error; missing any of the four fails review because users see blank screens. | [`03-loading-empty-error-states.md`](./03-loading-empty-error-states.md) |
| AT-UIQA-13 | Loading states MUST appear within 100 ms of fetch start (or use optimistic UI); silent > 100ms gaps are a Code-Red UX bug. | [`03-loading-empty-error-states.md`](./03-loading-empty-error-states.md) |
| AT-UIQA-14 | Error states MUST offer a documented recovery action (retry / undo / contact); dead-end error screens are a Code-Red UX bug. | [`03-loading-empty-error-states.md`](./03-loading-empty-error-states.md), [`../../03-error-manage/02-error-architecture/01-error-handling-reference/00-overview.md`](../../03-error-manage/02-error-architecture/01-error-handling-reference/00-overview.md) |
| AT-UIQA-15 | Empty states MUST include: an illustration/icon, a one-line explanation, AND a primary CTA (when an action is possible); 3-of-3-missing empty states fail review. | [`03-loading-empty-error-states.md`](./03-loading-empty-error-states.md) |

---

## Verification

```bash
# outline:none without replacement
rg -nP "outline\s*:\s*none" src/ | grep -v 'focus-visible:\|outline-'

# Lazy loading on below-fold imgs (manual check)
rg -nP "<img\b" src/ | grep -v 'loading=\|alt='

# Hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../03-design-system/97-acceptance-criteria.md`](../03-design-system/97-acceptance-criteria.md) — Contrast tokens SSOT
- [`../../03-error-manage/02-error-architecture/01-error-handling-reference/00-overview.md`](../../03-error-manage/02-error-architecture/01-error-handling-reference/00-overview.md) — Error UX
- [`mem://architecture/data-model`](mem://architecture/data-model) — 250-item cap

---

*Curated 2026-04-25 — closes batch-18 item 5. Replaces v1.0.1 scaffold.*
