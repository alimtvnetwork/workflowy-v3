# Design System — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 16 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-DESIGNSYSTEM-01` … `AT-DESIGNSYSTEM-16`

---

## Criteria

### Design tokens (file 01)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-DESIGNSYSTEM-01 | All visual values (color, spacing, font-size, radius, shadow, animation duration) come from CSS custom properties (`--token-name`); raw hex/rem/px in components is a Code-Red theming bug. | [`01-design-tokens.md`](./01-design-tokens.md), [`mem://design/theme`](mem://design/theme) |
| AT-DESIGNSYSTEM-02 | Tokens are namespaced by domain (`--color-*`, `--space-*`, `--font-size-*`, `--radius-*`, `--shadow-*`, `--motion-*`); flat token names without prefix are forbidden. | [`01-design-tokens.md`](./01-design-tokens.md) |

### Color system (file 02)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-DESIGNSYSTEM-03 | All color values are stored in **HSL** (NOT hex/rgb); a non-HSL color value in `:root` or `[data-theme]` blocks is a Code-Red theming bug. | [`02-color-system.md`](./02-color-system.md), [`mem://design/theme`](mem://design/theme) |
| AT-DESIGNSYSTEM-04 | Light + dark themes MUST exist for every semantic color token; missing a dark variant for any token fails review. | [`02-color-system.md`](./02-color-system.md) |
| AT-DESIGNSYSTEM-05 | WCAG AA contrast (≥ 4.5:1 body text, ≥ 3:1 large text/UI) MUST be verified for every foreground/background token pair documented as such; failures fail CI. | [`02-color-system.md`](./02-color-system.md) |

### Typography & elevation (files 03, 04)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-DESIGNSYSTEM-06 | The font-size scale is restricted to the documented set in §03 (e.g., xs/sm/base/lg/xl/2xl/3xl); inline `font-size: 13px` in components is forbidden. | [`03-typography.md`](./03-typography.md) |
| AT-DESIGNSYSTEM-07 | Elevation uses the documented 4-level shadow ladder (`--shadow-1`…`--shadow-4`); ad-hoc `box-shadow:` values in components are forbidden. | [`04-shadows-elevation.md`](./04-shadows-elevation.md) |

### Animation library (file 05)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-DESIGNSYSTEM-08 | Animations use the named tokens in §05 (`--motion-fast`, `--motion-base`, `--motion-slow`); raw `transition: 234ms` is forbidden. | [`05-animation-library.md`](./05-animation-library.md) |
| AT-DESIGNSYSTEM-09 | All animations respect `prefers-reduced-motion: reduce` — durations collapse to 0ms when set; missing the media-query block is an a11y bug. | [`05-animation-library.md`](./05-animation-library.md) |

### Badges, cards, buttons (files 06, 07, 08)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-DESIGNSYSTEM-10 | Badges have **5 documented variants** (Neutral, Info, Success, Warning, Error); custom badge variants require a §06 update first. | [`06-badge-system.md`](./06-badge-system.md) |
| AT-DESIGNSYSTEM-11 | Cards have **3 documented patterns** (Standard, Interactive, Highlighted); a custom card pattern requires a §07 update first. | [`07-card-patterns.md`](./07-card-patterns.md) |
| AT-DESIGNSYSTEM-12 | Buttons have a fixed variant set (Primary, Secondary, Tertiary, Ghost, Destructive) and a fixed size set (sm/md/lg); inline color overrides on buttons are forbidden. | [`08-buttons.md`](./08-buttons.md) |

### Form inputs, modals, tabs/tables/filters (files 09, 10, 11)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-DESIGNSYSTEM-13 | Form inputs MUST display field-level error state via the documented error-token pair (`--color-error-bg`, `--color-error-text`); missing visual error feedback is an a11y/UX bug. | [`09-form-inputs.md`](./09-form-inputs.md) |
| AT-DESIGNSYSTEM-14 | Modals trap focus, restore focus on close, support `Esc` to close, and lock body scroll; missing any of the four behaviours is a Code-Red a11y bug. | [`10-modals.md`](./10-modals.md) |
| AT-DESIGNSYSTEM-15 | Tabs/Tables/Filters use the documented composition primitives (`<Tabs>`, `<Table>`, `<Filter>`); ad-hoc rolling-your-own table/tabs markup is forbidden. | [`11-tabs-tables-filters.md`](./11-tabs-tables-filters.md) |

### Misc & organization (file 12)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-DESIGNSYSTEM-16 | The design system is organised as documented in §12 (one file per primitive, tokens central, no cross-primitive imports); a primitive importing another primitive's stylesheet is forbidden. | [`12-misc-and-organization.md`](./12-misc-and-organization.md) |

---

## Verification

```bash
# Raw hex/rgb in component CSS
rg -nP '#[0-9a-fA-F]{3,8}\b|\brgb\(|\brgba\(' src/components/ assets/styles/components/

# Inline font-size/box-shadow/transition in components
rg -nP '\b(font-size|box-shadow|transition)\s*:\s*\d' src/components/ assets/styles/components/

# Hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../11-frontend-and-template-patterns/97-acceptance-criteria.md`](../11-frontend-and-template-patterns/97-acceptance-criteria.md) — Frontend templates
- [`../15-settings-architecture/97-acceptance-criteria.md`](../15-settings-architecture/97-acceptance-criteria.md) — Settings UI consumer
- [`mem://design/theme`](mem://design/theme) — Theme memory

---

*Curated 2026-04-25 — closes A-23 (batch 12). Replaces v0.1.0 stub.*


---

## Fixtures

Fixtures for every AT row in this file are covered by the global P2g sweep — see [`../../97a-acceptance-criteria-fixtures.md`](../../97a-acceptance-criteria-fixtures.md) (apply the matching pattern by section).
