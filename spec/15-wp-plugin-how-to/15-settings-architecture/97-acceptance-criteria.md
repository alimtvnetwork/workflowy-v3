# Settings Architecture — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 14 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-SETTINGSARCHITECTURE-01` … `AT-SETTINGSARCHITECTURE-14`

---

## Criteria

### Data model & groups (files 01, 02)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-SETTINGSARCHITECTURE-01 | Settings are stored in a single options row per group (NOT one `wp_options` row per setting); the row uses `riseup_settings_<group_slug>` naming. | [`01-data-model.md`](./01-data-model.md) |
| AT-SETTINGSARCHITECTURE-02 | Setting groups are declared in a SSOT registry (PHP factory or JSON); ad-hoc `add_settings_section()` calls outside the registry are forbidden. | [`02-settings-groups.md`](./02-settings-groups.md) |
| AT-SETTINGSARCHITECTURE-03 | Group slugs use **kebab-case** (`site-snapshot`, `api-keys`); snake_case slugs are forbidden in URLs. | [`02-settings-groups.md`](./02-settings-groups.md) |

### Defaults & validation (files 03, 04)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-SETTINGSARCHITECTURE-04 | Every field declares a default value at registry time; reading a setting that returns `null` because no default was set fails review. | [`03-default-values.md`](./03-default-values.md), [`../../06-seedable-config-architecture/01-fundamentals/97-acceptance-criteria.md`](../../06-seedable-config-architecture/01-fundamentals/97-acceptance-criteria.md) |
| AT-SETTINGSARCHITECTURE-05 | Validation runs through a typed sanitizer matching the field's `RequestFieldType`; `sanitize_text_field()` as a catch-all is forbidden for non-text fields. | [`04-validation-and-sanitization.md`](./04-validation-and-sanitization.md), [`../14-rest-api-conventions/97-acceptance-criteria.md`](../14-rest-api-conventions/97-acceptance-criteria.md) |
| AT-SETTINGSARCHITECTURE-06 | Validation failures return a typed `WP_Error` with a field-level error map; silently dropping invalid values is a Code-Red bug. | [`04-validation-and-sanitization.md`](./04-validation-and-sanitization.md) |

### Page layout & field types (files 05, 06)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-SETTINGSARCHITECTURE-07 | Settings pages use the documented 3-column layout (sidebar nav, main fields, right-rail context); custom layouts per plugin are forbidden. | [`05-page-layout.md`](./05-page-layout.md) |
| AT-SETTINGSARCHITECTURE-08 | Field types are restricted to the documented set in §06 (text, number, boolean toggle, enum select, multi-enum, slider, color, JSON-textarea, file upload, action button); custom field types require a §06 update first. | [`06-field-types.md`](./06-field-types.md) |

### Toggle, conditional display, selection cards (files 07, 08, 09)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-SETTINGSARCHITECTURE-09 | Boolean fields render as toggle switches (NOT raw checkboxes) on the settings page. | [`07-toggle-switch.md`](./07-toggle-switch.md), [`../12-design-system/`](../12-design-system/) |
| AT-SETTINGSARCHITECTURE-10 | Conditional display (`show this field when X==Y`) is declared in the field metadata (`visibleWhen: {field, equals}`); JS-only show/hide that bypasses the metadata is forbidden. | [`08-conditional-display.md`](./08-conditional-display.md) |
| AT-SETTINGSARCHITECTURE-11 | Selection cards (radio cards) and sliders are the canonical UI for finite-enum and bounded-numeric fields; raw `<select>` for ≤4 enum cases is discouraged. | [`09-selection-cards-and-sliders.md`](./09-selection-cards-and-sliders.md) |

### Action buttons, warnings, partials (files 10, 11, 12)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-SETTINGSARCHITECTURE-12 | Action buttons (e.g., "Test connection", "Clear cache") are declared in the registry with an explicit endpoint reference; inline `onclick` JS in the partial is forbidden. | [`10-action-buttons.md`](./10-action-buttons.md) |
| AT-SETTINGSARCHITECTURE-13 | Dual-save (settings + nested partial) commits in one atomic POST; if either side fails, both roll back; partial-only-saved-but-settings-failed is a Code-Red bug. | [`12-partials-and-dual-save.md`](./12-partials-and-dual-save.md) |

### Anti-patterns (file 13)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-SETTINGSARCHITECTURE-14 | Anti-patterns listed in §13 (god-options-row, raw `update_option` outside the registry, hidden fields used as state, JS-driven validation as the only validation tier) MUST NOT appear in the codebase. | [`13-anti-patterns.md`](./13-anti-patterns.md) |

---

## Verification

```bash
# Raw update_option outside the registry
rg -n 'update_option\(' includes/ | grep -v 'Settings/Registry\|tests/'

# Inline onclick in settings partials
rg -n 'onclick=' includes/Settings/

# Hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../14-rest-api-conventions/97-acceptance-criteria.md`](../14-rest-api-conventions/97-acceptance-criteria.md) — REST API
- [`../../06-seedable-config-architecture/01-fundamentals/97-acceptance-criteria.md`](../../06-seedable-config-architecture/01-fundamentals/97-acceptance-criteria.md) — Seedable config
- [`../12-design-system/`](../12-design-system/) — Design system primitives

---

*Curated 2026-04-25 — closes A-22 (batch 11). Replaces v0.1.0 stub.*


---

## Fixtures

Fixtures for every AT row in this file are covered by the global P2g sweep — see [`../../97a-acceptance-criteria-fixtures.md`](../../97a-acceptance-criteria-fixtures.md) (apply the matching pattern by section).
