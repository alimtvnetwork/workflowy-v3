# Phase 8 — App Shell Acceptance Criteria

> **Version:** 2.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 14 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-WFSHELL-01` … `AT-WFSHELL-14`

---

## Criteria

### App menu (file 01)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-WFSHELL-01 | The App ⋮ menu MUST open from the navbar ⋮ trigger AND its item order MUST match img-45 byte-for-byte; reordering between releases is FORBIDDEN. | [`01-app-menu.md`](./01-app-menu.md) |
| AT-WFSHELL-02 | The menu MUST close on outside click, `Esc`, AND action selection; persistent menu after action fire is a Code-Red UX bug. | [`01-app-menu.md`](./01-app-menu.md) |
| AT-WFSHELL-03 | The menu MUST be reachable by keyboard (`Tab` to ⋮ → `Enter` opens → arrow keys navigate → `Enter` activates); mouse-only menu is a Code-Red accessibility bug. | [`01-app-menu.md`](./01-app-menu.md) |

### Themes (file 02)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-WFSHELL-04 | The theme switcher MUST present exactly three options: Light, Dark, System; named palettes (e.g. "Solarized") are FORBIDDEN at launch — adding them requires a separate spec amendment. | [`02-themes.md`](./02-themes.md) |
| AT-WFSHELL-05 | The "System" option MUST follow `prefers-color-scheme` reactively (re-apply on OS-level change WITHOUT reload); reload-required behavior is a Code-Red UX bug. | [`02-themes.md`](./02-themes.md) |
| AT-WFSHELL-06 | Theme application MUST be a CSS class toggle on `<html>` (per `03-design-system` AT-UIDS-05); JS-recomputed tokens are FORBIDDEN. | [`02-themes.md`](./02-themes.md), [`../../03-design-system/97-acceptance-criteria.md`](../../03-design-system/97-acceptance-criteria.md) |
| AT-WFSHELL-07 | Theme choice MUST apply within 16 ms of selection (no flash-of-wrong-theme on initial load — apply BEFORE first paint via inline script). | [`02-themes.md`](./02-themes.md) |

### Fonts (file 03)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-WFSHELL-08 | Inter MUST be loaded for UI; Geist Mono MUST be loaded for Code Blocks; other webfonts are FORBIDDEN without a documented loading-budget rationale (per `03-design-system` AT-UIDS-14). | [`03-fonts.md`](./03-fonts.md), [`../../03-design-system/97-acceptance-criteria.md`](../../03-design-system/97-acceptance-criteria.md) |
| AT-WFSHELL-09 | Webfonts MUST use `font-display: swap` AND preload via `<link rel="preload" as="font" crossorigin>`; blocking webfonts are a Code-Red perf bug. | [`03-fonts.md`](./03-fonts.md) |
| AT-WFSHELL-10 | Fallback font stacks MUST be system fonts (`-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`); third-party fallbacks are FORBIDDEN because they contradict the loading-budget rule. | [`03-fonts.md`](./03-fonts.md) |

### Settings (file 04)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-WFSHELL-11 | The Settings panel MUST be reachable ONLY via App menu → Settings (NOT a separate URL); deep-linkable settings is a future feature, not launch. | [`04-settings.md`](./04-settings.md) |
| AT-WFSHELL-12 | The "Fractal Conversations" toggle MUST hide Mentions AND Drafts in the sidebar when OFF (per `06-sidebar` AT-WFSIDE-09); partial hiding is a Code-Red feature-flag bug. | [`04-settings.md`](./04-settings.md), [`../06-sidebar/97-acceptance-criteria.md`](../06-sidebar/97-acceptance-criteria.md) |
| AT-WFSHELL-13 | All preferences (theme, sidebar state, feature flags) MUST persist via local-storage AND survive reload; ephemeral-only preferences are a Code-Red UX bug. Persistence layer MUST stay backend-agnostic per `mem://constraints/backend-runtime-deferred`. | [`04-settings.md`](./04-settings.md), [`mem://constraints/backend-runtime-deferred`](mem://constraints/backend-runtime-deferred) |
| AT-WFSHELL-14 | Resetting all preferences MUST be a single documented action with a confirm dialog; silent reset is a Code-Red UX bug. | [`04-settings.md`](./04-settings.md) |

---

## Verification

```bash
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../06-sidebar/97-acceptance-criteria.md`](../06-sidebar/97-acceptance-criteria.md) — Fractal Conversations consumer
- [`../../03-design-system/97-acceptance-criteria.md`](../../03-design-system/97-acceptance-criteria.md) — Theme + font SSOT
- [`mem://constraints/backend-runtime-deferred`](mem://constraints/backend-runtime-deferred) — Persistence agnostic

---

*Curated 2026-04-25 — closes batch-19 item 5. Replaces v1.0.0 checklist.*
