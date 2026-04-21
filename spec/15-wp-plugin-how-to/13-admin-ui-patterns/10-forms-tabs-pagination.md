# Forms, Tabs & Pagination

> **Updated:** 2026-04-19

---

## Settings Form (form-table)

WordPress settings forms use the `.form-table` pattern:

```php
<form id="settings-form">
    <table class="form-table">
        <tr>
            <th scope="row">
                <label for="field_id">
                    <?php esc_html_e('Field Label', $pluginSlug); ?>
                    <span class="required">*</span>
                </label>
            </th>
            <td>
                <input type="text" id="field_id" class="regular-text" required>
                <p class="description"><?php esc_html_e('Help text.', $pluginSlug); ?></p>
            </td>
        </tr>
    </table>
    <p class="submit">
        <button type="submit" class="button button-primary">
            <span class="dashicons dashicons-yes"></span>
            <?php esc_html_e('Save', $pluginSlug); ?>
        </button>
        <span id="form-status" class="riseup-inline-status"></span>
    </p>
</form>
```

---

## Selection Cards (Radio Alternative)

For mutually exclusive options, use visual selection cards instead of radio buttons:

```php
<div class="riseup-storage-cards">
    <label class="riseup-storage-card" data-mode="option_a">
        <input type="radio" name="setting" value="option_a">
        <div class="riseup-storage-card-inner">
            <span class="dashicons dashicons-media-archive"></span>
            <strong>Option A</strong>
            <span class="description">Short description</span>
        </div>
    </label>
    <label class="riseup-storage-card active" data-mode="option_b">
        <input type="radio" name="setting" value="option_b" checked>
        <div class="riseup-storage-card-inner">
            <span class="dashicons dashicons-grid-view"></span>
            <strong>Option B</strong>
            <span class="description">Short description</span>
        </div>
    </label>
</div>
```

**Rules:**
1. Radio inputs are hidden (`display: none`)
2. The `.active` class is toggled via JavaScript on selection
3. Active card shows primary border + primary background tint
4. Cards use `flex: 1; min-width: 160px; max-width: 220px`

---

## Slider Input

```php
<div class="riseup-slider-row">
    <input type="range" id="setting_value" min="1" max="10" value="5" class="riseup-range-slider">
    <span id="value_display" class="riseup-slider-value">5</span>
</div>
```

---

## Conditional Fields

Fields that depend on other field values use `display: none` toggled by JavaScript:

```php
<tr id="conditional_row" style="display: none;">
    <th scope="row"><label>Conditional Field</label></th>
    <td><!-- content --></td>
</tr>
```

---

## Form Section Dividers

When a form has multiple logical sections, use an `<h3>` with border-top:

```php
<h3 style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #eee;">
    <span class="dashicons dashicons-performance"></span>
    <?php esc_html_e('Section Title', $pluginSlug); ?>
</h3>
```

---

## Page-Level Tabs

```php
<div class="riseup-tabs">
    <a href="#tab-errors" class="nav-tab nav-tab-active" data-tab="errors">
        <span class="dashicons dashicons-warning"></span>
        <?php esc_html_e('Errors', $pluginSlug); ?>
        <span class="tab-badge"><?php echo esc_html($errorCount); ?></span>
    </a>
    <a href="#tab-file" class="nav-tab" data-tab="file">
        <span class="dashicons dashicons-media-text"></span>
        <?php esc_html_e('File Viewer', $pluginSlug); ?>
    </a>
</div>

<div id="tab-errors" class="riseup-tab-content"><!-- content --></div>
<div id="tab-file" class="riseup-tab-content" style="display: none;"><!-- content --></div>
```

---

## Modal Tabs

```php
<div class="modal-tabs">
    <button class="modal-tab active" data-tab="context">
        <span class="dashicons dashicons-info"></span>
        Context
    </button>
    <button class="modal-tab" data-tab="stack">
        <span class="dashicons dashicons-editor-code"></span>
        Stack Trace
    </button>
</div>
<div class="modal-tab-pane" id="pane-context"><!-- content --></div>
<div class="modal-tab-pane" id="pane-stack" style="display: none;"><!-- content --></div>
```

---

## Pagination Partial

Use the shared pagination partial for all paginated content:

```php
<?php
$totalPages = $totalPages;
$page = $currentPage;
include __DIR__ . '/partials/shared/pagination.php';
?>
```

The partial uses WordPress `paginate_links()` and renders nothing if `$totalPages <= 1`.

---

## JavaScript Pagination

For AJAX-loaded tables, pagination links are rendered into a container:

```php
<div id="section_pagination" class="tablenav bottom" style="display: none;">
    <div class="tablenav-pages">
        <span class="displaying-num" id="section_count"></span>
        <span class="pagination-links" id="section_pages"></span>
    </div>
</div>
```

---

*Forms, tabs & pagination — v3.2.0 — 2026-04-19*
