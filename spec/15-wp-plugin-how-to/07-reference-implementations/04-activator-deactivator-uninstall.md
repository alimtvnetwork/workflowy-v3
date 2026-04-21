# 7.4 Activator, Deactivator & Uninstall

> **Parent:** [Phase 7 overview](./00-overview.md)

## Activator — `includes/Core/Activator.php`

```php
<?php
/**
 * Activator — Runs on plugin activation.
 *
 * @package PluginName\Core
 * @since   1.0.0
 */

namespace PluginName\Core;

if (!defined('ABSPATH')) {
    exit;
}

use PluginName\Helpers\PathHelper;

final class Activator
{
    /**
     * Run activation tasks. Called from register_activation_hook().
     */
    public static function activate(): void
    {
        // ── 1. Create required directories ──
        PathHelper::ensureDirectory(PathHelper::getLogsDir());
        PathHelper::ensureDirectory(PathHelper::getTempDir());

        // ── 2. Create or migrate database (if using SQLite) ──
        // DatabaseMigrator::runPending();

        // ── 3. Set default options ──
        $hasExistingSettings = (get_option('plugin_name_settings') !== false);

        if (!$hasExistingSettings) {
            add_option('plugin_name_settings', [
                'version' => '1.0.0',
                'activated_at' => gmdate('c'),
            ]);
        }

        // ── 4. Schedule cron events (if needed) ──
        // See Phase 8, §8.3 for WP-Cron patterns

        // ── 5. Flush rewrite rules (if adding custom REST routes via rewrite) ──
        flush_rewrite_rules();

        error_log('[PluginName] Plugin activated successfully');
    }
}
```

## Deactivator — `includes/Core/Deactivator.php`

```php
<?php
/**
 * Deactivator — Runs on plugin deactivation.
 *
 * @package PluginName\Core
 * @since   1.0.0
 */

namespace PluginName\Core;

if (!defined('ABSPATH')) {
    exit;
}

final class Deactivator
{
    /**
     * Run deactivation tasks. Called from register_deactivation_hook().
     */
    public static function deactivate(): void
    {
        // ── 1. Unschedule cron events ──
        $nextRun = wp_next_scheduled('plugin_name_cron_hook');
        $hasScheduledEvent = ($nextRun !== false);

        if ($hasScheduledEvent) {
            wp_unschedule_event($nextRun, 'plugin_name_cron_hook');
        }

        // ── 2. Clean up transients ──
        delete_transient('plugin_name_cache');

        // ── 3. Flush rewrite rules ──
        flush_rewrite_rules();

        error_log('[PluginName] Plugin deactivated');
    }
}
```

## Uninstall — `uninstall.php` (plugin root)

```php
<?php
/**
 * Uninstall — Runs when the plugin is deleted via WordPress admin.
 *
 * This file is called by WordPress directly. It must not load the plugin.
 * It performs destructive cleanup: delete options, drop tables, remove files.
 */

if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

// ── 1. Delete options ──
delete_option('plugin_name_settings');

// ── 2. Delete upload directory and all contents ──
$uploadDir = wp_upload_dir();
$pluginDir = $uploadDir['basedir'] . '/plugin-name';
$hasDir = is_dir($pluginDir);

if ($hasDir) {
    // Recursive delete
    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($pluginDir, RecursiveDirectoryIterator::SKIP_DOTS),
        RecursiveIteratorIterator::CHILD_FIRST,
    );

    foreach ($iterator as $item) {
        $isDir = $item->isDir();

        if ($isDir) {
            rmdir($item->getRealPath());
        } else {
            unlink($item->getRealPath());
        }
    }

    rmdir($pluginDir);
}

// ── 3. Delete scheduled cron events ──
wp_clear_scheduled_hook('plugin_name_cron_hook');
```

## Activation vs Deactivation vs Uninstall — When to use what

| Hook | Fires when | Do | Don't |
|------|-----------|-----|-------|
| `register_activation_hook` | Plugin activated | Create dirs, set defaults, schedule cron | Delete data, show admin notices |
| `register_deactivation_hook` | Plugin deactivated | Unschedule cron, flush rewrite rules | Delete data (user may reactivate) |
| `uninstall.php` | Plugin deleted from admin | Delete ALL plugin data: options, files, tables | Reference plugin classes (not loaded) |
