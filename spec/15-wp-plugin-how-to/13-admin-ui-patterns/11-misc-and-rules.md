# Misc Components, Composition, Accessibility & Anti-Patterns

> **Updated:** 2026-04-19

Covers chart/calendar components, auto-refresh toggle, template composition rules, accessibility rules, and anti-patterns.

---

## Bar Chart

```
┌─ Chart Container ──────────────────────────────┐
│  Y-axis │ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██    │
│  labels │ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██    │
│         └──────────────────────────────────     │
│           x-axis labels (rotated -45°)          │
│                                                  │
│  ● Full  ● Incremental                          │
└──────────────────────────────────────────────────┘
```

---

## Calendar View

```
┌─ Calendar Card ───────────────────────────────┐
│  [◀]     April 2026     [▶]                   │
│  Sun Mon Tue Wed Thu Fri Sat                   │
│  ... ... ... 1   2   3   4                     │
│  5   6   7   8•  9   10  11                    │
│  ...                                           │
│  ● Full  ● Incremental  ● Scheduled            │
└───────────────────────────────────────────────┘
```

---

## Legend

```php
<div class="riseup-chart-legend">
    <span class="riseup-legend-item">
        <span class="riseup-legend-dot" style="background:#2271b1;"></span>
        <?php esc_html_e('Full', $pluginSlug); ?>
    </span>
</div>
```

---

## Auto-Refresh Toggle

For real-time monitoring pages:

```php
<label class="auto-refresh-toggle">
    <input type="checkbox" id="auto_refresh_toggle">
    <span class="auto-refresh-label">
        <span class="live-dot" id="live_indicator"></span>
        <?php esc_html_e('Auto-refresh', $pluginSlug); ?>
    </span>
</label>
```

The live dot pulses green when active, stays gray when inactive.

---

## Template Composition Rules

### Partial Directory Structure

```
templates/
├── admin-{page}.php              # Page orchestrator
├── partials/
│   ├── shared/                   # Cross-page partials
│   │   ├── page-header.php
│   │   ├── modal-wrapper.php
│   │   └── pagination.php
│   ├── {page}/                   # Page-specific partials
│   │   └── modals.php
│   └── settings/                 # Settings section partials
│       ├── section-log-retrieval.php
│       └── section-snapshot-settings.php
└── unused/                       # Archived templates
```

### When to Extract a Partial

Extract a partial when:
1. The same HTML block appears on 2+ pages
2. A single template file exceeds ~300 lines
3. A logical section (modals, settings group) is self-contained
4. A component needs consistent rendering (page header, pagination)

### Partial Variable Contract

Every partial MUST document its required and optional variables in a docblock (gate `G-AUI-PARTIAL-DOCBLOCK`):

```php
/**
 * Required variables (from parent scope):
 *   $pageIcon   — Dashicons class
 *   $pageTitle  — Translated title
 *   $pluginSlug — Text domain
 *
 * Optional variables:
 *   $pageDescription — Translated description
 *   $headerExtra     — Raw HTML after badge
 */
```

### Variable Cleanup

Partials that define temporary variables MUST `unset()` them after rendering to prevent scope bleed into subsequent includes (gate `G-AUI-PARTIAL-UNSET`).

---

## Accessibility Rules

1. All `<th>` cells MUST have `scope="row"` or `scope="col"` (gate `G-AUI-A11Y-TH-SCOPE`)
2. All `<label>` elements MUST have a `for` attribute matching an input `id` (gate `G-AUI-A11Y-LABEL-FOR`)
3. All `<input>` elements MUST have a `type` attribute (gate `G-AUI-A11Y-INPUT-TYPE`)
4. Required fields MUST show `<span class="required">*</span>` in the label (gate `G-AUI-A11Y-REQUIRED-MARK`)
5. All dashicons used as icons MUST be inside a `<span>` (not standalone) (gate `G-AUI-A11Y-DASHICON-WRAP`)
6. Interactive elements MUST be `<button>` or `<a>`, never `<div>` or `<span>` (gate `G-AUI-A11Y-INTERACTIVE-TAG`)
7. Modal close buttons use `&times;` character, not an icon font

---

## Anti-Patterns (NEVER DO)

1. ❌ Use `<table>` for non-tabular layout
2. ❌ Place modals inside scrollable containers
3. ❌ Use inline `onclick` handlers — always use event delegation
4. ❌ Hardcode column counts in empty state `colspan` — use a variable
5. ❌ Skip the three-state pattern (loading/content/empty) for async sections
6. ❌ Use `display: block` to show elements — use `display: ''` (restores original)
7. ❌ Render user input without `esc_html()` or `esc_attr()`
8. ❌ Duplicate modal HTML across pages — use the shared partial
9. ❌ Create templates > 400 lines without extracting partials
10. ❌ Use `echo` for translatable strings — always use `esc_html_e()` or `esc_html(__(...))`

---

*Misc components & rules — v3.2.0 — 2026-04-19*
