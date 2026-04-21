# 15.12 Settings Section Partials & Dual Save Patterns

> **Parent:** [Phase 15 overview](./00-overview.md)

---

## 12.1 Extraction Criteria

Extract a settings section into a partial when:
1. The section has ≥5 form fields
2. The section has its own save/action button (AJAX-based)
3. The section is logically independent (snapshot settings, log settings)
4. The section is reused across multiple pages

---

## 12.2 Partial Structure

```php
<?php
/**
 * Settings Partial — Database Snapshot Settings card.
 *
 * Variables expected: $pluginSlug, $snapshotSettings, $snapshotProviders.
 *
 * @package RiseupAsiaUploader
 * @since   1.64.0
 */

if (!defined('ABSPATH')) {
    exit;
}

use RiseupAsia\Enums\SettingsKeyType;
// ... more use statements

// Extract values with defaults
$preferredProvider = $snapshotSettings[SettingsKeyType::PreferredProvider->value]
    ?? SnapshotProviderType::Auto->value;
// ... more extractions
?>
<!-- HTML card -->
<div class="riseup-card">
    <h2><span class="dashicons dashicons-database"></span> Title</h2>
    <!-- Sub-sections with <h3> dividers -->
    <h3>Provider</h3>
    <table class="form-table"><!-- fields --></table>

    <h3>Scheduling</h3>
    <table class="form-table"><!-- fields --></table>

    <!-- Actions -->
    <table class="form-table">
        <tr>
            <th>Actions</th>
            <td>
                <button type="button" class="button button-primary">Save</button>
                <button type="button" class="button button-secondary">Run Cleanup</button>
                <span class="riseup-inline-status"></span>
            </td>
        </tr>
    </table>
</div>
```

---

## 12.3 Sub-Section Dividers

Within a card, logical groups are separated by `<h3>` headings:

```php
<h3>
    <span class="dashicons dashicons-performance"></span>
    <?php esc_html_e('Worker Pool & Storage', $pluginSlug); ?>
</h3>
```

---

## 12.4 WordPress Form Save (Global)

The main settings form uses WordPress Options API with `submit_button()`:
- Saves via `POST` to `options.php`
- Redirects back with `?settings-updated=true`
- Success notice rendered from query param

---

## 12.5 AJAX Save (Section-Level)

Individual sections may have their own save buttons that use AJAX:
- Uses `type="button"` to prevent form submission
- Calls REST API or AJAX endpoint
- Shows inline status feedback
- Does NOT redirect

---

## 12.6 When to Use Each

| Pattern | Use Case |
|---------|----------|
| WordPress form save | Main settings page with `register_setting()` |
| AJAX save | Section-level settings managed by custom code (e.g., snapshot settings stored in SQLite) |
