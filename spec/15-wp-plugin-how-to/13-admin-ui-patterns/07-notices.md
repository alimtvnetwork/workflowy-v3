# Notice Patterns

> **Updated:** 2026-04-19

---

## WordPress Admin Notices

Standard WordPress notices for page-level feedback:

```php
<div class="notice notice-success is-dismissible">
    <p><?php esc_html_e('Settings saved successfully.', $pluginSlug); ?></p>
</div>
```

---

## Flash Banner (Contextual Alert)

For important contextual alerts (e.g., "new errors detected since last visit"):

```php
<div class="riseup-flash-banner">
    <span class="flash-icon">⚠️</span>
    <div class="flash-content">
        <strong><?php esc_html_e('Alert message', $pluginSlug); ?></strong>
        <span class="flash-time"><?php echo esc_html($timeAgo); ?></span>
    </div>
    <button class="button flash-dismiss"><?php esc_html_e('Dismiss', $pluginSlug); ?></button>
</div>
```

---

## Warning Card

For persistent warnings that require user action:

```php
<div class="notice notice-warning riseup-feedback-warning-card">
    <div class="riseup-feedback-warning-inner">
        <span class="dashicons dashicons-warning"></span>
        <div class="riseup-feedback-warning-content">
            <strong><?php esc_html_e('Warning title', $pluginSlug); ?></strong>
            <p><?php esc_html_e('Warning explanation.', $pluginSlug); ?></p>
            <div class="riseup-feedback-warning-actions">
                <button class="button button-primary">Action</button>
            </div>
        </div>
    </div>
</div>
```

---

## Inline Status

For inline operation feedback next to buttons:

```php
<span id="status-id" class="riseup-inline-status"></span>
```

Set dynamically via JavaScript:
```javascript
statusEl.className = 'riseup-inline-status success';
statusEl.textContent = '✓ Saved';
// OR
statusEl.className = 'riseup-inline-status error';
statusEl.textContent = '✕ Failed';
```

---

*Notice patterns — v3.2.0 — 2026-04-19*
