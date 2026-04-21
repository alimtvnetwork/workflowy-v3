# 15.5 Settings Page Layout

> **Parent:** [Phase 15 overview](./00-overview.md)

---

## 5.1 Page Structure

```
┌─ .wrap .riseup-admin ──────────────────────────────────────┐
│  Page Header (via partial)                                  │
│                                                              │
│  [Success Notice — if settings-updated]                     │
│                                                              │
│  <form method="post" action="options.php">                  │
│    <?php settings_fields('group'); ?>                        │
│                                                              │
│    ┌─ Card: Plugin Information ────────────────────────────┐ │
│    │  Version, API Namespace, REST Base (read-only)        │ │
│    └───────────────────────────────────────────────────────┘ │
│                                                              │
│    ┌─ Card: REST API Endpoints ───────────────────────────┐ │
│    │  Endpoint table with toggle switches                  │ │
│    └───────────────────────────────────────────────────────┘ │
│                                                              │
│    ┌─ Card: Auto-Update Settings ─────────────────────────┐ │
│    │  Toggle, URL, cache, diagnostics, action buttons      │ │
│    └───────────────────────────────────────────────────────┘ │
│                                                              │
│    <?php include 'partials/settings/section-snapshots.php' ?>│
│    <?php include 'partials/settings/section-logs.php' ?>     │
│                                                              │
│    ┌─ Card: Support & Feedback ───────────────────────────┐ │
│    │  Email, fallback URL                                  │ │
│    └───────────────────────────────────────────────────────┘ │
│                                                              │
│    <?php submit_button('Save Settings'); ?>                  │
│  </form>                                                     │
└──────────────────────────────────────────────────────────────┘
```

---

## 5.2 Form Submission

Settings pages use the WordPress Options API flow:

```php
<form method="post" action="options.php">
    <?php settings_fields(PluginConfigType::SettingsGroup->value); ?>
    <!-- Settings cards -->
    <?php submit_button(__('Save Settings', $pluginSlug)); ?>
</form>
```

This uses WordPress's built-in `options.php` handler which:
1. Verifies the nonce (from `settings_fields()`)
2. Calls the registered sanitize callback
3. Saves to `wp_options`
4. Redirects back with `?settings-updated=true`

---

## 5.3 Save Feedback

Success notices appear after redirect:

```php
<?php if (isset($_GET['settings-updated']) && $_GET['settings-updated']): ?>
    <div class="notice notice-success is-dismissible">
        <p><?php esc_html_e('Settings saved successfully.', $pluginSlug); ?></p>
    </div>
<?php endif; ?>
```

---

## 5.4 Settings Partials

Large settings pages MUST delegate sections to partials:

```php
// In admin-settings.php (orchestrator)
<?php include __DIR__ . '/partials/settings/section-snapshot-settings.php'; ?>
<?php include __DIR__ . '/partials/settings/section-log-retrieval.php'; ?>
```

Each partial documents its required variables:

```php
/**
 * Variables expected: $pluginSlug, $snapshotSettings, $snapshotProviders.
 */
```
