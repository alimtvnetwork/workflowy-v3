# Stats Bar & Progress Panel

> **Updated:** 2026-04-19

---

## Inline Stats

Simple stats shown between filter bar and table:

```php
<div class="riseup-stats">
    <span class="stat-item">
        <strong><?php echo esc_html($total); ?></strong>
        <?php esc_html_e('total records', $pluginSlug); ?>
    </span>
    <span class="stat-item">
        <?php esc_html_e('Page', $pluginSlug); ?> <?php echo esc_html($page); ?> 
        <?php esc_html_e('of', $pluginSlug); ?> <?php echo esc_html($totalPages); ?>
    </span>
</div>
```

---

## Stat Cards

Rich stat displays with hero numbers:

```php
<div class="riseup-analytics-summary">
    <div class="riseup-stat-card">
        <span class="riseup-stat-value" id="stat_total">—</span>
        <span class="riseup-stat-label"><?php esc_html_e('Total Size', $pluginSlug); ?></span>
    </div>
    <!-- More stat cards -->
</div>
```

**Rules:**
1. Stat cards use `display: flex; gap: 14px; flex-wrap: wrap`
2. Each card has `flex: 1; min-width: 90px`
3. Value is monospace, 20px, bold, primary color
4. Label is uppercase, 11px, 0.5px letter-spacing, muted color
5. Default value is `—` (em dash) before data loads
6. Cards elevate on hover with `translateY(-1px)` and value scales `1.08`

---

## Progress Panel

For long-running operations, show a progress panel:

```
┌─ .riseup-card ────────────────────────────────────────┐
│  ⚡ Snapshot In Progress  [0%]                        │
│  ┌─ progress bar ────────────────────────────────┐    │
│  │ ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │    │
│  └───────────────────────────────────────────────┘    │
│  Processing table wp_posts... (4 of 12)               │
│                                                        │
│  Table Progress:                                       │
│  ✓ wp_options  ✓ wp_users  ⟳ wp_posts  ○ wp_comments  │
└────────────────────────────────────────────────────────┘
```

**Structure:**

```php
<div id="progress_panel" class="riseup-card" style="display: none;">
    <h2>
        <span class="dashicons dashicons-performance"></span>
        <?php esc_html_e('Operation In Progress', $pluginSlug); ?>
        <span id="progress_percent_badge" class="riseup-badge">0%</span>
    </h2>
    <div class="riseup-progress-bar-wrap">
        <div id="progress_bar" class="riseup-progress-bar" style="width: 0%;"></div>
    </div>
    <div id="progress_meta" class="riseup-progress-meta"></div>
    <div id="progress_tables" class="riseup-progress-tables" style="display: none;">
        <h4>Table Progress</h4>
        <div id="progress_tables_list"></div>
    </div>
</div>
```

---

*Stats & progress — v3.2.0 — 2026-04-19*
