# Page Layout Architecture

> **Updated:** 2026-04-19

---

## Root Wrapper

Every admin page MUST be wrapped in a standard structure:

```php
<div class="wrap riseup-admin">
    <?php
    $pageIcon = 'dashicons-database';
    $pageTitle = __('Page Title', $pluginSlug);
    $pageDescription = __('Optional description text.', $pluginSlug);
    include __DIR__ . '/partials/shared/page-header.php';
    ?>

    <!-- Page content as .riseup-card sections -->
</div>
```

- `wrap` — WordPress admin wrapper class (required for the WP-admin-default 20 px top + 10 px right page margins)
- `riseup-admin` — Plugin namespace for CSS scoping
- Page-specific class (e.g., `riseup-agents`, `riseup-snapshots`) added when page-level CSS overrides are needed

---

## Page Header Partial

The `page-header.php` partial renders a consistent header across all pages:

```
┌──────────────────────────────────────────────────────────┐
│ 🔧 Plugin Name — Page Title  v2.10.0  [optional badge]  │
│ Optional description paragraph                           │
└──────────────────────────────────────────────────────────┘
```

**Required variables:**
| Variable | Type | Description |
|----------|------|-------------|
| `$pageIcon` | string | Dashicons class (e.g., `dashicons-database`) |
| `$pageTitle` | string | Translated page title |
| `$pluginSlug` | string | Plugin text domain |

**Optional variables:**
| Variable | Type | Description |
|----------|------|-------------|
| `$pageDescription` | string | Translated description paragraph |
| `$headerExtra` | string | Raw HTML after version badge (e.g., error count badge) |

**Implementation:**

```php
<h1>
    <span class="dashicons <?php echo esc_attr($pageIcon); ?>"></span>
    <?php echo esc_html($pageTitle); ?>
    <span class="riseup-version-badge">v<?php echo esc_html(PluginConfigType::Version->value); ?></span>
    <?php if (!empty($headerExtra)) { echo $headerExtra; } ?>
</h1>
<?php if (!empty($pageDescription)): ?>
<p class="description"><?php echo esc_html($pageDescription); ?></p>
<?php endif; ?>
```

---

## Content Sections (Cards)

All page content is organized into `.riseup-card` sections. Each card is a logical unit:

```
┌─ .riseup-card ──────────────────────────────────┐
│  <h2>                                            │
│    <dashicon> Section Title                      │
│    [optional: action buttons, badges]            │
│  </h2>                                           │
│                                                  │
│  [content: form, table, stats, etc.]             │
└──────────────────────────────────────────────────┘
```

**Rules:**
1. Each card has exactly one `<h2>` heading with a dashicon
2. Cards are stacked vertically with consistent spacing
3. Cards MAY contain nested `.form-table`, `.wp-list-table`, or custom content
4. Action buttons that affect card content go inside the `<h2>` or immediately below it

---

## Grid Layouts

For side-by-side content (e.g., chart + calendar), use a grid row:

```php
<div class="riseup-analytics-row">
    <div class="riseup-card"><!-- Primary content (flexible) --></div>
    <div class="riseup-card"><!-- Secondary content (fixed width) --></div>
</div>
```

```css
.riseup-analytics-row {
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: 20px;
}
@media (max-width: 1100px) {
    .riseup-analytics-row { grid-template-columns: 1fr; }
}
```

---

*Page layout — v3.2.0 — 2026-04-19*
