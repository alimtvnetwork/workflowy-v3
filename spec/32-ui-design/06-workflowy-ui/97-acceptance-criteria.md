# WorkFlowy UI — Acceptance Criteria (Roll-up)

> **Version:** 1.0.0
> **Created:** 2026-04-25 (UTC+8)
> **Status:** Curated — 10 cross-phase criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## Purpose

Cross-phase acceptance criteria that the 10 WorkFlowy-UI phase folders inherit. Per-phase IDs live in each phase's `97-acceptance-criteria.md`.

---

## ID Range

`AT-WFROOT-01` … `AT-WFROOT-10`

---

## Coverage Map

| Phase | Folder | ID Range |
|-------|--------|----------|
| 1 — Navbar | [`01-navbar/`](./01-navbar/97-acceptance-criteria.md) | AT-WFNAV-01..14 |
| 2 — Search | [`02-search/`](./02-search/97-acceptance-criteria.md) | AT-WFSEARCH-* |
| 3 — Right panel | [`03-right-panel/`](./03-right-panel/97-acceptance-criteria.md) | AT-WFPANEL-01..14 |
| 4 — Bullet | [`04-bullet/`](./04-bullet/97-acceptance-criteria.md) | AT-WFBULLET-01..16 |
| 5 — Editor | [`05-editor/`](./05-editor/97-acceptance-criteria.md) | AT-WFEDIT-01..18 |
| 6 — Sidebar | [`06-sidebar/`](./06-sidebar/97-acceptance-criteria.md) | AT-WFSIDE-01..14 |
| 7 — Calendar | [`07-calendar/`](./07-calendar/97-acceptance-criteria.md) | AT-WFCAL-01..14 |
| 8 — App shell | [`08-app-shell/`](./08-app-shell/97-acceptance-criteria.md) | AT-WFSHELL-01..14 |
| 9 — Integrations (deferred) | [`09-integrations/`](./09-integrations/97-acceptance-criteria.md) | AT-WF09-* |
| 10 — Mobile / PWA (deferred) | [`10-mobile/`](./10-mobile/97-acceptance-criteria.md) | AT-WF10-* |

---

## Cross-Phase Criteria

### Backend agnosticism

| ID | Criterion | Source |
|----|-----------|--------|
| AT-WFROOT-01 | NO phase spec MAY name a backend runtime (Supabase, sql.js, IndexedDB, WordPress); all persistence MUST be described as an injected `Persistence` interface per `mem://constraints/backend-runtime-deferred`. Any leak is a Code-Red SPEC-ONLY bug. | [`mem://constraints/backend-runtime-deferred`](mem://constraints/backend-runtime-deferred), [`../02-state-and-data/97-acceptance-criteria.md`](../02-state-and-data/97-acceptance-criteria.md) |

### Design system inheritance

| ID | Criterion | Source |
|----|-----------|--------|
| AT-WFROOT-02 | Every phase MUST consume colors via semantic HSL tokens from `src/index.css` `@theme` block; raw hex / RGB / OKLCH values in phase docs OR phase-implementing components fail review (per `03-design-system` AT-UIDS-01). | [`../03-design-system/97-acceptance-criteria.md`](../03-design-system/97-acceptance-criteria.md) |
| AT-WFROOT-03 | Every phase MUST inherit typography rules: Inter for UI, Geist Mono for code (per `03-design-system` AT-UIDS-14 / `08-app-shell` AT-WFSHELL-08); other webfonts in any phase fail review. | [`../03-design-system/97-acceptance-criteria.md`](../03-design-system/97-acceptance-criteria.md), [`./08-app-shell/97-acceptance-criteria.md`](./08-app-shell/97-acceptance-criteria.md) |

### Accessibility floor

| ID | Criterion | Source |
|----|-----------|--------|
| AT-WFROOT-04 | Every interactive element across all phases MUST be ≥ 24 × 24 CSS px (desktop) / ≥ 44 × 44 pt (mobile, per `10-mobile` AT-WF10-GES-05); breaches are a Code-Red accessibility bug. | [`../05-quality/97-acceptance-criteria.md`](../05-quality/97-acceptance-criteria.md), [`./10-mobile/97-acceptance-criteria.md`](./10-mobile/97-acceptance-criteria.md) |
| AT-WFROOT-05 | Every overlay surface (sidebar, right-panel, modals) MUST trap focus while open AND restore focus to trigger on close; missing focus restoration is a Code-Red accessibility bug. | [`../05-quality/97-acceptance-criteria.md`](../05-quality/97-acceptance-criteria.md) |

### Keyboard SSOT

| ID | Criterion | Source |
|----|-----------|--------|
| AT-WFROOT-06 | Every keyboard shortcut named in any phase spec MUST appear in `spec/31-app/01-features/05-interactions.md` byte-for-byte; the 31-app file is the SSOT — phase-spec drift is a Code-Red consistency bug. | [`../../31-app/01-features/05-interactions.md`](../../31-app/01-features/05-interactions.md) |

### Item-type universality

| ID | Criterion | Source |
|----|-----------|--------|
| AT-WFROOT-07 | The 12-item-type set (per `mem://features/core-mechanics`) MUST be respected across every phase; phases that special-case a subset (e.g. "todos can't be mirrored") MUST explicitly document the exception with rationale. | [`../04-editor/97-acceptance-criteria.md`](../04-editor/97-acceptance-criteria.md), [`mem://features/core-mechanics`](mem://features/core-mechanics) |
| AT-WFROOT-08 | Every interactive node operation (move, mirror, delete, multi-select, drag, type-convert) MUST be available via BOTH keyboard AND pointer; keyboard-only OR pointer-only operations are a Code-Red accessibility bug. | [`../05-quality/97-acceptance-criteria.md`](../05-quality/97-acceptance-criteria.md), [`mem://features/multi-select`](mem://features/multi-select) |

### Persistence model

| ID | Criterion | Source |
|----|-----------|--------|
| AT-WFROOT-09 | Local UI state (open panels, sort modes, theme) MUST persist via local preferences AND survive reload (per `08-app-shell` AT-WFSHELL-13); ephemeral-only state is a Code-Red UX bug. | [`./08-app-shell/97-acceptance-criteria.md`](./08-app-shell/97-acceptance-criteria.md) |

### 250-item viewport floor

| ID | Criterion | Source |
|----|-----------|--------|
| AT-WFROOT-10 | Every phase that renders a list MUST honour the 250-item viewport cap with virtualization beyond 50 items (per `02-state-and-data` AT-UISTATE-13 / `05-quality` AT-UIQA-10); breaches are a Code-Red perf bug. | [`../02-state-and-data/97-acceptance-criteria.md`](../02-state-and-data/97-acceptance-criteria.md), [`../05-quality/97-acceptance-criteria.md`](../05-quality/97-acceptance-criteria.md) |

---

## Verification

```bash
# Backend-leak scan across the entire workflowy-ui tree
rg -nP "supabase|sql\.js|IndexedDB|wordpress\b" spec/32-ui-design/06-workflowy-ui/

# Hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../01-architecture/97-acceptance-criteria.md`](../01-architecture/97-acceptance-criteria.md) — Architecture roll-up
- [`../02-state-and-data/97-acceptance-criteria.md`](../02-state-and-data/97-acceptance-criteria.md) — State + data SSOT
- [`../03-design-system/97-acceptance-criteria.md`](../03-design-system/97-acceptance-criteria.md) — Design system SSOT
- [`../04-editor/97-acceptance-criteria.md`](../04-editor/97-acceptance-criteria.md) — Editor SSOT
- [`../05-quality/97-acceptance-criteria.md`](../05-quality/97-acceptance-criteria.md) — A11y / perf SSOT

---

*Created 2026-04-25 — closes batch-20 item 3 (folder roll-up). Aggregates 10 phase folders.*
