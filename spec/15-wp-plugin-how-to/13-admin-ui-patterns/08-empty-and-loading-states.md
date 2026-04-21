# Empty & Loading States

> **Updated:** 2026-04-19

---

## Empty States

### Table Empty State

When a table has no data, show a single-row message:

```php
<?php if (empty($items)): ?>
    <tr>
        <td colspan="<?php echo $columnCount; ?>" class="no-items">
            <?php esc_html_e('No items found.', $pluginSlug); ?>
        </td>
    </tr>
<?php endif; ?>
```

### Section Empty State

When an entire card/section has no data, show a descriptive empty state:

```php
<div id="snapshots_empty" style="display: none;">
    <p><em><?php esc_html_e('No snapshots found. Click "Snapshot Now" to create your first backup.', $pluginSlug); ?></em></p>
</div>
```

### File Empty State (Success)

When a file/log is empty (positive state — no errors):

```php
<div class="file-empty">
    <span class="dashicons dashicons-yes-alt"></span>
    <p><?php esc_html_e('No errors found — looking good!', $pluginSlug); ?></p>
</div>
```

The dashicon uses green color `#22c55e` with a pulse animation.

### Empty State Rules

1. Empty states MUST provide context about what would appear and how to create it
2. Table empty states use `class="no-items"` inside a full-colspan `<td>`
3. Section empty states use `<em>` for visual distinction
4. Positive empty states (no errors) celebrate with a green icon
5. Empty states are controlled via `style="display: none;"` and toggled by JavaScript

---

## Loading States

### Section Loading

Use the WordPress spinner for section-level loading:

```php
<div id="section_loading" style="display: none;">
    <span class="spinner is-active" style="float: none;"></span>
    <?php esc_html_e('Loading...', $pluginSlug); ?>
</div>
```

### Button Loading

Buttons show a spinning dashicon during async operations:

```php
<button id="my-btn" class="button button-primary">
    <span class="dashicons dashicons-update"></span>
    <?php esc_html_e('Save', $pluginSlug); ?>
</button>
```

JavaScript toggles the spin class:
```javascript
btn.querySelector('.dashicons').classList.add('spin');
btn.disabled = true;
// After completion:
btn.querySelector('.dashicons').classList.remove('spin');
btn.disabled = false;
```

### File Loading

For async-loaded content panels:

```php
<div class="file-loading">
    <?php esc_html_e('Loading file contents...', $pluginSlug); ?>
</div>
```

Uses `riseupPulse` animation for subtle breathing effect.

### Loading State Rules

1. Loading indicators are hidden by default (`display: none`)
2. JavaScript shows the loader and hides the content container
3. After data loads, hide the loader and show the content (or empty state)
4. Three-state pattern: `loading → content OR empty`
5. The WordPress spinner class `spinner is-active` with `float: none` is the standard

### Three-State Container Pattern

```php
<!-- State 1: Loading -->
<div id="section_loading">
    <span class="spinner is-active" style="float: none;"></span>
    Loading...
</div>

<!-- State 2: Content (hidden until loaded) -->
<div id="section_content" style="display: none;">
    <!-- actual content -->
</div>

<!-- State 3: Empty (hidden unless no data) -->
<div id="section_empty" style="display: none;">
    <p><em>No data available.</em></p>
</div>
```

JavaScript flow:
```javascript
// Show loading
show('section_loading'); hide('section_content'); hide('section_empty');

// After fetch:
hide('section_loading');
if (data.length > 0) {
    show('section_content');
} else {
    show('section_empty');
}
```

---

*Empty & loading states — v3.2.0 — 2026-04-19*
