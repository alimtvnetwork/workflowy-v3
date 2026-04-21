# Filter Bar

> **Updated:** 2026-04-19

---

## Anatomy

```
┌─ .riseup-filters ────────────────────────────────────────┐
│  ┌─ .filter-row (primary) ─────────────────────────────┐ │
│  │ ACTION ▾  STATUS ▾  TRIGGER ▾  USER [___]  PLUGIN   │ │
│  └─────────────────────────────────────────────────────┘ │
│  ┌─ .filter-row-secondary ─────────────────────────────┐ │
│  │ FROM [date]  TO [date]  [🔵 Filter] [Reset]         │ │
│  └─────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

---

## Structure

```php
<div class="riseup-filters">
    <form method="get">
        <input type="hidden" name="page" value="<?php echo esc_attr(AdminPageType::Logs->value); ?>">
        
        <div class="filter-row">
            <label>
                <span><?php esc_html_e('Action:', $pluginSlug); ?></span>
                <select name="filter_action">
                    <option value=""><?php esc_html_e('All Actions', $pluginSlug); ?></option>
                    <?php foreach ($actionLabels as $key => $label): ?>
                        <option value="<?php echo esc_attr($key); ?>" <?php selected($filters['action'], $key); ?>>
                            <?php echo esc_html($label); ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </label>
            <!-- More filters... -->
        </div>
        
        <div class="filter-row filter-row-secondary">
            <label>
                <span><?php esc_html_e('From:', $pluginSlug); ?></span>
                <input type="date" name="filter_from" value="<?php echo esc_attr($filters['from']); ?>">
            </label>
            <button type="submit" class="button button-primary"><?php esc_html_e('Filter', $pluginSlug); ?></button>
            <a href="<?php echo esc_url($resetUrl); ?>" class="button"><?php esc_html_e('Reset', $pluginSlug); ?></a>
        </div>
    </form>
</div>
```

---

## Rules

1. Each filter label has an uppercase `<span>` label above the input
2. `<select>` options always start with an "All" option (empty value)
3. Enum-driven filters iterate over label arrays built from enum values
4. Date filters use native `<input type="date">`
5. Primary row holds category filters, secondary row holds date range + submit
6. Filter form submits via GET with `page` parameter preserved
7. Reset link navigates to the page URL without query params
8. Focus-within state highlights the entire filter container

---

*Filter bar — v3.2.0 — 2026-04-19*
