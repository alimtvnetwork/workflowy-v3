# 10.9 Uninstall Cleanup

> **Updated:** 2026-04-19

---

## uninstall.php

Every plugin must include `uninstall.php` for clean removal:

```php
<?php
/**
 * Uninstall handler — runs when the plugin is deleted via WP admin.
 *
 * @package PluginName
 */

if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

// Remove plugin options
$optionKeys = [
    'plugin_slug_update_settings',
    'plugin_slug_settings',
    'plugin_slug_version',
];

foreach ($optionKeys as $key) {
    delete_option($key);
}

// Remove transients
delete_transient('plugin_slug_cache');

// Remove uploaded files (SQLite databases, logs, backups)
$uploadDir = wp_upload_dir();
$pluginDataDir = $uploadDir['basedir'] . '/plugin-slug';
$hasDataDir = is_dir($pluginDataDir);

if ($hasDataDir) {
    // Recursive delete of plugin data directory
    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($pluginDataDir, RecursiveDirectoryIterator::SKIP_DOTS),
        RecursiveIteratorIterator::CHILD_FIRST,
    );

    foreach ($iterator as $file) {
        $isDir = $file->isDir();

        if ($isDir) {
            rmdir($file->getPathname());
        } else {
            unlink($file->getPathname());
        }
    }

    rmdir($pluginDataDir);
}
```

---

## What to clean

| Data type | Location | Clean on uninstall? |
|-----------|----------|-------------------|
| Plugin options | `wp_options` table | ✅ Always |
| Transients | `wp_options` table | ✅ Always |
| SQLite databases | `wp-content/uploads/plugin-slug/` | ✅ Always |
| Log files | `wp-content/uploads/plugin-slug/logs/` | ✅ Always |
| Backups | `wp-content/uploads/plugin-slug/backups/` | ✅ Always |
| Cron events | WordPress cron | ✅ Always |
| User meta | `wp_usermeta` table | ⚠️ Only if plugin added it |
| Custom tables (MySQL) | WordPress database | ⚠️ Only if plugin created them |

---

*Uninstall cleanup — v3.2.0 — 2026-04-19*
