# Phase 1 — Navbar Acceptance Criteria

> **Version:** 2.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 14 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-WFNAV-01` … `AT-WFNAV-14`

---

## Criteria

### Layout (file 01)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-WFNAV-01 | The navbar MUST render without horizontal scroll at all viewport widths ≥ 320 px; horizontal scroll at any supported width is a Code-Red layout bug. | [`01-layout.md`](./01-layout.md) |
| AT-WFNAV-02 | The navbar MUST be a fixed 48 px-tall sticky bar at the top of the viewport; varying height across routes is forbidden because it causes content jump. | [`01-layout.md`](./01-layout.md) |
| AT-WFNAV-03 | At < 768 px the navbar MUST collapse the right-side action group into an overflow menu; below-collapse breakpoint with all actions visible is a layout bug. | [`01-layout.md`](./01-layout.md) |

### Breadcrumb (file 02)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-WFNAV-04 | When breadcrumb total width exceeds available space, truncation MUST drop **middle** segments AND preserve first + last; truncating the tail is FORBIDDEN because it loses the focused-node context. | [`02-breadcrumb.md`](./02-breadcrumb.md) |
| AT-WFNAV-05 | Clicking any breadcrumb segment MUST focus that node AND push a new history entry; missing the history push breaks back-button parity (Code-Red routing bug). | [`02-breadcrumb.md`](./02-breadcrumb.md), [`03-routing.md`](./03-routing.md) |
| AT-WFNAV-06 | The focused-node title in the breadcrumb MUST be inline-editable; rename MUST re-render the breadcrumb AND update the URL slug atomically — partial updates are a Code-Red consistency bug. | [`02-breadcrumb.md`](./02-breadcrumb.md) |
| AT-WFNAV-07 | Truncated middle segments MUST collapse into a single `…` chevron that, on click, opens a dropdown listing the hidden segments in path order; chevron without dropdown fails review. | [`02-breadcrumb.md`](./02-breadcrumb.md) |

### Routing (file 03)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-WFNAV-08 | Browser back/forward (`popstate`) MUST re-focus the previously focused node within 100 ms AND restore the scroll position; missing scroll restoration is a UX bug. | [`03-routing.md`](./03-routing.md) |
| AT-WFNAV-09 | The URL MUST encode the focused node ID (and slug for SEO) — relying on in-memory state alone is FORBIDDEN because deep-links break. | [`03-routing.md`](./03-routing.md) |
| AT-WFNAV-10 | Programmatic focus changes (e.g. drag-and-drop reveal) MUST also update the URL; silent focus changes are a Code-Red consistency bug. | [`03-routing.md`](./03-routing.md) |

### Keyboard shortcuts (file 04)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-WFNAV-11 | `Ctrl+L` (Win/Linux) / `⌘L` (Mac) MUST toggle the left sidebar offcanvas from anywhere; the shortcut MUST work even when an editor input has focus (per `mem://design/ui-components`). | [`04-keyboard-shortcuts.md`](./04-keyboard-shortcuts.md), [`mem://design/ui-components`](mem://design/ui-components) |
| AT-WFNAV-12 | `Ctrl+/` (Win/Linux) / `⌘/` (Mac) MUST toggle the right-side panel; collisions with browser-default shortcuts MUST be documented + overridden where allowed. | [`04-keyboard-shortcuts.md`](./04-keyboard-shortcuts.md) |
| AT-WFNAV-13 | All navbar keyboard shortcuts MUST match `spec/31-app/01-features/05-interactions.md` byte-for-byte; divergence is a Code-Red consistency bug. | [`04-keyboard-shortcuts.md`](./04-keyboard-shortcuts.md), [`../../../31-app/01-features/05-interactions.md`](../../../31-app/01-features/05-interactions.md) |

### Cross-cutting

| ID | Criterion | Source |
|----|-----------|--------|
| AT-WFNAV-14 | Every interactive element in the navbar MUST be ≥ 24 × 24 CSS px AND have a visible focus ring (per `05-quality` AT-UIQA-02 / 03); smaller targets or invisible focus rings fail review. | [`00-overview.md`](./00-overview.md), [`../../05-quality/97-acceptance-criteria.md`](../../05-quality/97-acceptance-criteria.md) |

---

## Verification

```bash
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../../../31-app/01-features/05-interactions.md`](../../../31-app/01-features/05-interactions.md) — Keyboard shortcut SSOT
- [`../../05-quality/97-acceptance-criteria.md`](../../05-quality/97-acceptance-criteria.md) — A11y baseline
- [`mem://design/ui-components`](mem://design/ui-components) — Navbar SSOT

---

*Curated 2026-04-25 — closes batch-19 item 1. Replaces v1.0.0 checklist.*
