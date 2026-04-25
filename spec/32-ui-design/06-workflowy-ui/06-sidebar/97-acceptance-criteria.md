# Phase 6 — Left Sidebar Acceptance Criteria

> **Version:** 2.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 14 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-WFSIDE-01` … `AT-WFSIDE-14`

---

## Criteria

### Offcanvas (file 01)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-WFSIDE-01 | The sidebar MUST open via the ≡ button OR `⌘L` / `Ctrl+L`; both bindings MUST work AND match `04-keyboard-shortcuts.md` in `01-navbar/`. | [`01-offcanvas.md`](./01-offcanvas.md), [`../01-navbar/04-keyboard-shortcuts.md`](../01-navbar/04-keyboard-shortcuts.md) |
| AT-WFSIDE-02 | The sidebar MUST close on outside click, `Esc`, OR re-toggle of the same shortcut; bubble-trapping that prevents outside-click close is a Code-Red UX bug. | [`01-offcanvas.md`](./01-offcanvas.md) |
| AT-WFSIDE-03 | When the sidebar is closed, hovering ≡ MUST show a tooltip card preview within 500 ms; missing tooltip is a discoverability bug. | [`01-offcanvas.md`](./01-offcanvas.md) |
| AT-WFSIDE-04 | The sidebar MUST trap focus while open AND restore focus to the trigger on close (per ARIA dialog pattern); missing focus restoration is a Code-Red accessibility bug. | [`01-offcanvas.md`](./01-offcanvas.md), [`../../05-quality/97-acceptance-criteria.md`](../../05-quality/97-acceptance-criteria.md) |
| AT-WFSIDE-05 | The sidebar MUST be exactly 280 px wide on desktop AND full-width on mobile (< 768 px); intermediate widths are FORBIDDEN. | [`01-offcanvas.md`](./01-offcanvas.md) |

### Special nodes (file 02)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-WFSIDE-06 | Exactly 8 default special nodes MUST render in fixed order: Today, Home, Inbox, Drafts, Mentions, Calendar, Trash, + New; reordering is FORBIDDEN because it breaks muscle memory. | [`02-special-nodes.md`](./02-special-nodes.md) |
| AT-WFSIDE-07 | Each special node MUST have an icon, label, AND optional badge slot (e.g. unread count); missing any of the three is a layout bug. | [`02-special-nodes.md`](./02-special-nodes.md) |
| AT-WFSIDE-08 | Trash retention MUST be 30 days (per `mem://features/trash-logic`); after 30 days items MUST be hard-deleted; longer retention is a privacy bug. | [`02-special-nodes.md`](./02-special-nodes.md), [`mem://features/trash-logic`](mem://features/trash-logic) |
| AT-WFSIDE-09 | When the "Fractal Conversations" Phase-8 toggle is OFF, Mentions AND Drafts MUST be hidden from the sidebar; partial hiding is a Code-Red feature-flag bug. | [`02-special-nodes.md`](./02-special-nodes.md), [`../08-app-shell/04-settings.md`](../08-app-shell/04-settings.md) |
| AT-WFSIDE-10 | Calendar MUST link to the dedicated Calendar route (per `07-calendar`), not an inline panel; inline calendar is a Code-Red routing bug. | [`02-special-nodes.md`](./02-special-nodes.md) |

### Drag and drop (file 03)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-WFSIDE-11 | Dragging a node onto a sidebar item MUST move it (default); `⌥`/`Alt`-drag MUST mirror it (per `mem://features/mirroring`); other modifiers MUST be no-ops. | [`03-drag-drop.md`](./03-drag-drop.md), [`mem://features/mirroring`](mem://features/mirroring) |
| AT-WFSIDE-12 | Drop targets MUST show a visible highlight on hover during drag; silent drops (no visual feedback) are a Code-Red UX bug. | [`03-drag-drop.md`](./03-drag-drop.md) |
| AT-WFSIDE-13 | Dropping onto Trash MUST move (NOT hard-delete); dropping onto Inbox MUST move to inbox root; dropping onto Calendar MUST schedule for today; behavior MUST be enumerated per target. | [`03-drag-drop.md`](./03-drag-drop.md) |

### Cross-cutting

| ID | Criterion | Source |
|----|-----------|--------|
| AT-WFSIDE-14 | Sidebar state (open/closed) MUST persist across reloads via local preferences (per `mem://features/offline-resilience` autosave queue pattern); ephemeral-only state is a UX bug. | [`00-overview.md`](./00-overview.md), [`../08-app-shell/04-settings.md`](../08-app-shell/04-settings.md) |

---

## Verification

```bash
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../01-navbar/97-acceptance-criteria.md`](../01-navbar/97-acceptance-criteria.md) — Sidebar trigger shortcuts
- [`../08-app-shell/97-acceptance-criteria.md`](../08-app-shell/97-acceptance-criteria.md) — Fractal Conversations toggle
- [`../../05-quality/97-acceptance-criteria.md`](../../05-quality/97-acceptance-criteria.md) — Focus trap a11y
- [`mem://features/trash-logic`](mem://features/trash-logic) — 30-day retention SSOT
- [`mem://features/mirroring`](mem://features/mirroring) — Mirror semantics

---

*Curated 2026-04-25 — closes batch-19 item 4. Replaces v1.0.0 checklist.*
