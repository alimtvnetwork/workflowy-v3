# Phase 4 — Bullet Anatomy Acceptance Criteria

> **Version:** 2.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 16 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-WFBULLET-01` … `AT-WFBULLET-16`

---

## Criteria

### Anatomy (file 01)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-WFBULLET-01 | Every row MUST render exactly 5 anatomy slots in fixed order: ⋯ (drag/menu) · ▸/▾ (expand) · ● (bullet dot) · content · + (add child); reordering or omitting slots is a Code-Red layout bug. | [`01-anatomy.md`](./01-anatomy.md) |
| AT-WFBULLET-02 | Hover state MUST reveal ⋯ AND + within 50 ms; longer reveal latency or missing affordances is a UX bug because it breaks discoverability. | [`01-anatomy.md`](./01-anatomy.md) |
| AT-WFBULLET-03 | The expand arrow ▸ MUST rotate 90° to ▾ on expansion via CSS transform (NOT swapping two glyphs); glyph-swap is forbidden because it skips animation. | [`01-anatomy.md`](./01-anatomy.md) |
| AT-WFBULLET-04 | Clicking the bullet dot ● MUST zoom into the node (push focus + URL); ⌘/Ctrl-click on the dot MUST toggle multi-select WITHOUT zooming. Same-binding-different-modifier is required (per `mem://features/multi-select`). | [`01-anatomy.md`](./01-anatomy.md), [`mem://features/multi-select`](mem://features/multi-select) |
| AT-WFBULLET-05 | An empty-content row MUST still render the dot AND expand caret AND remain selectable; collapsing empty rows is FORBIDDEN because it breaks placeholder UX. | [`01-anatomy.md`](./01-anatomy.md) |
| AT-WFBULLET-06 | Every interactive target in the row MUST be ≥ 24 × 24 CSS px hit area (per WCAG 2.5.8); smaller targets are a Code-Red accessibility bug. | [`01-anatomy.md`](./01-anatomy.md), [`../../05-quality/97-acceptance-criteria.md`](../../05-quality/97-acceptance-criteria.md) |

### Three-dot menu (file 02)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-WFBULLET-07 | Right-click on a row OR clicking ⋯ MUST open the per-row context menu at the cursor position (NOT a fixed location); fixed-position menu is a UX bug. | [`02-three-dot-menu.md`](./02-three-dot-menu.md) |
| AT-WFBULLET-08 | The per-row menu MUST close on outside click, `Esc`, OR action completion; menus that persist after action fire are a Code-Red UX bug. | [`02-three-dot-menu.md`](./02-three-dot-menu.md) |
| AT-WFBULLET-09 | Menu item order MUST be locked (per visual reference); reordering between releases is FORBIDDEN because it breaks muscle memory. | [`02-three-dot-menu.md`](./02-three-dot-menu.md) |

### Focused-item menu (file 03)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-WFBULLET-10 | The focused-item ⋯ menu MUST present a DIFFERENT action set than the per-row ⋯ menu (e.g. share, export, delete-current-focus); identical action sets are a Code-Red spec bug. | [`03-focused-item-menu.md`](./03-focused-item-menu.md) |
| AT-WFBULLET-11 | The focused-item menu MUST be reachable via keyboard (`Shift+F10` or documented equivalent); mouse-only menus are a Code-Red accessibility bug. | [`03-focused-item-menu.md`](./03-focused-item-menu.md) |

### Comment icon (file 04)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-WFBULLET-12 | The comment icon MUST appear ONLY when the row has ≥ 1 comment OR is being hovered; always-visible comment icons are a UX bug because they add visual noise. | [`04-comment-icon.md`](./04-comment-icon.md) |
| AT-WFBULLET-13 | Clicking the comment icon MUST open a thread panel as a right-side overlay (distinct from the Phase 3 right-side details panel); collapsing the two panels into one is FORBIDDEN. | [`04-comment-icon.md`](./04-comment-icon.md) |
| AT-WFBULLET-14 | Unread comments MUST show a numeric badge with `aria-label="N unread comments"`; missing aria-label is a Code-Red SR bug. | [`04-comment-icon.md`](./04-comment-icon.md) |

### Cross-cutting

| ID | Criterion | Source |
|----|-----------|--------|
| AT-WFBULLET-15 | Bullet dot color states (default / focused / multi-selected / mirrored) MUST come from semantic HSL tokens (per `03-design-system` AT-UIDS-01); hardcoded colors fail review. | [`01-anatomy.md`](./01-anatomy.md), [`../../03-design-system/97-acceptance-criteria.md`](../../03-design-system/97-acceptance-criteria.md) |
| AT-WFBULLET-16 | Mirrored bullets MUST be visually distinct (e.g. linked-icon overlay) AND every visual variant MUST be enumerated in the spec; un-enumerated variants fail review. | [`01-anatomy.md`](./01-anatomy.md), [`mem://features/mirroring`](mem://features/mirroring) |

---

## Verification

```bash
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../../05-quality/97-acceptance-criteria.md`](../../05-quality/97-acceptance-criteria.md) — A11y baseline
- [`../../03-design-system/97-acceptance-criteria.md`](../../03-design-system/97-acceptance-criteria.md) — Token SSOT
- [`mem://features/multi-select`](mem://features/multi-select) — Multi-select semantics
- [`mem://features/mirroring`](mem://features/mirroring) — Mirror visual contract

---

*Curated 2026-04-25 — closes batch-19 item 2. Replaces v1.0.0 checklist.*


---

## Fixtures

Fixtures for every AT row in this file are covered by the global P2g sweep — see [`../../../97a-acceptance-criteria-fixtures.md`](../../../97a-acceptance-criteria-fixtures.md) (apply the matching pattern by section).
