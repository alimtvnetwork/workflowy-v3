# Phase 3 — Right-Side Panel Acceptance Criteria

> **Version:** 2.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 14 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-WFPANEL-01` … `AT-WFPANEL-14`

---

## Criteria

### Open / close & layout

| ID | Criterion | Source |
|----|-----------|--------|
| AT-WFPANEL-01 | The panel MUST open AND close via `⌘/` (Mac) / `Ctrl+/` (Win/Linux) from anywhere; the binding MUST match the navbar shortcut SSOT byte-for-byte. | [`../01-navbar/04-keyboard-shortcuts.md`](../01-navbar/04-keyboard-shortcuts.md), [`00-overview.md`](./00-overview.md) |
| AT-WFPANEL-02 | The panel MUST be a right-anchored offcanvas exactly 360 px wide on desktop AND full-width on mobile (< 768 px); intermediate widths are FORBIDDEN. | [`00-overview.md`](./00-overview.md) |
| AT-WFPANEL-03 | The panel MUST trap focus while open AND restore focus to the trigger on close (per ARIA dialog pattern); missing focus restoration is a Code-Red accessibility bug. | [`00-overview.md`](./00-overview.md), [`../../05-quality/97-acceptance-criteria.md`](../../05-quality/97-acceptance-criteria.md) |
| AT-WFPANEL-04 | The panel MUST be visually distinct from the bullet-comment thread overlay (per `04-bullet/04-comment-icon.md`); collapsing the two surfaces into one is FORBIDDEN. | [`00-overview.md`](./00-overview.md), [`../04-bullet/04-comment-icon.md`](../04-bullet/04-comment-icon.md) |

### Tabs (file 01 + 02 + 03)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-WFPANEL-05 | Exactly three tabs MUST render in fixed order: Handbook, Hotkeys, What's New; reordering is FORBIDDEN because it breaks muscle memory. | [`01-handbook-content.md`](./01-handbook-content.md), [`02-hotkeys.md`](./02-hotkeys.md), [`03-whats-new.md`](./03-whats-new.md) |
| AT-WFPANEL-06 | Tab switching MUST preserve scroll position per tab (each tab keeps its own scroll); shared scroll state across tabs is a Code-Red UX bug. | [`00-overview.md`](./00-overview.md) |

### Handbook (file 01)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-WFPANEL-07 | A language picker MUST be present; English MUST be the only supported value at launch — selecting any other locale MUST gracefully fall back to English with a documented toast. | [`01-handbook-content.md`](./01-handbook-content.md) |
| AT-WFPANEL-08 | Every Handbook entry MUST follow the documented template: heading + shortcut chip + ⚡ icon + screenshot slot + paragraph + grey slash-command callout; entries missing any of the 6 elements fail review. | [`01-handbook-content.md`](./01-handbook-content.md) |

### Hotkeys (file 02)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-WFPANEL-09 | The Hotkeys table MUST contain ~30 entries matching img-65 byte-for-byte AND every shortcut MUST display BOTH `⌘` (Mac) and `Ctrl` (Win/Linux) variants; single-platform entries fail review. | [`02-hotkeys.md`](./02-hotkeys.md) |
| AT-WFPANEL-10 | The Hotkeys table MUST agree with `spec/31-app/01-features/05-interactions.md` byte-for-byte; divergence is a Code-Red consistency bug. | [`02-hotkeys.md`](./02-hotkeys.md), [`../../../31-app/01-features/05-interactions.md`](../../../31-app/01-features/05-interactions.md) |

### What's New (file 03)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-WFPANEL-11 | What's New entries MUST be dated AND show 👍 / 👎 reaction buttons per entry; missing date or reactions is a spec gap. | [`03-whats-new.md`](./03-whats-new.md) |
| AT-WFPANEL-12 | A Pro upsell banner MUST be present at the top of What's New AND MUST be dismissable for the session (NOT permanently); permanent dismiss is a product-decision bug. | [`03-whats-new.md`](./03-whats-new.md) |
| AT-WFPANEL-13 | Reaction submission MUST be optimistic with rollback on failure (per `02-state-and-data` AT-UISTATE-08); silent failure is a Code-Red UX bug. | [`03-whats-new.md`](./03-whats-new.md), [`../../02-state-and-data/97-acceptance-criteria.md`](../../02-state-and-data/97-acceptance-criteria.md) |

### Cross-cutting

| ID | Criterion | Source |
|----|-----------|--------|
| AT-WFPANEL-14 | Panel state (open/closed + active tab) MUST persist across reloads via local preferences while staying backend-agnostic per `mem://constraints/backend-runtime-deferred`. | [`00-overview.md`](./00-overview.md), [`mem://constraints/backend-runtime-deferred`](mem://constraints/backend-runtime-deferred) |

---

## Verification

```bash
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../01-navbar/97-acceptance-criteria.md`](../01-navbar/97-acceptance-criteria.md) — Navbar trigger SSOT
- [`../04-bullet/97-acceptance-criteria.md`](../04-bullet/97-acceptance-criteria.md) — Comment thread distinction
- [`../../../31-app/01-features/05-interactions.md`](../../../31-app/01-features/05-interactions.md) — Hotkey SSOT
- [`mem://constraints/backend-runtime-deferred`](mem://constraints/backend-runtime-deferred) — Persistence agnostic

---

*Curated 2026-04-25 — closes batch-20 item 1. Replaces v1.0.0 checklist.*


---

## Fixtures

Fixtures for every AT row in this file are covered by the global P2g sweep — see [`../../../97a-acceptance-criteria-fixtures.md`](../../../97a-acceptance-criteria-fixtures.md) (apply the matching pattern by section).
