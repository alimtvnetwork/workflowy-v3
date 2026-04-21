# 7.1 Bootstrap File — `plugin-name.php`

> **Parent:** [Phase 7 overview](./00-overview.md)

This is the only file WordPress loads directly. It must be non-namespaced.

```php
<?php
/**
 * Plugin Name:       Plugin Name
 * Plugin URI:        https://example.com/plugin-name
 * Description:       One-line description of what this plugin does.
 * Version:           1.0.0
 * Requires at least: 5.6
 * Requires PHP:      8.1
 * Author:            Your Name
 * Author URI:        https://example.com
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       plugin-name
 */

if (!defined('ABSPATH')) {
    exit;
}

/** Enable debug mode — exposes stack traces in API responses. Set to true only in development. */
define('PLUGIN_NAME_DEBUG', false);

// ── Load autoloader ──
$autoloaderPath = __DIR__ . '/includes/Autoloader.php';
$hasAutoloader = file_exists($autoloaderPath);

if (!$hasAutoloader) {
    error_log('[PluginName] FATAL: Autoloader.php not found at ' . $autoloaderPath);

    return;
}

require_once $autoloaderPath;

// ── Boot plugin on rest_api_init (for REST-only plugins) ──
// For plugins that also need admin UI, use 'plugins_loaded' instead
add_action('rest_api_init', function (): void {
    try {
        \PluginName\Core\Plugin::getInstance();
    } catch (\Throwable $e) {
        error_log('[PluginName] Boot failed: ' . $e->getMessage() . "\n" . $e->getTraceAsString());
    }
});

// ── Register activation hook ──
register_activation_hook(__FILE__, function (): void {
    try {
        \PluginName\Core\Activator::activate();
    } catch (\Throwable $e) {
        error_log('[PluginName] Activation failed: ' . $e->getMessage() . "\n" . $e->getTraceAsString());
    }
});

// ── Register deactivation hook ──
register_deactivation_hook(__FILE__, function (): void {
    try {
        \PluginName\Core\Deactivator::deactivate();
    } catch (\Throwable $e) {
        error_log('[PluginName] Deactivation failed: ' . $e->getMessage() . "\n" . $e->getTraceAsString());
    }
});
```

## Key observations

| Pattern | Reason |
|---------|--------|
| `define('PLUGIN_NAME_DEBUG', false)` | Gates stack traces in API responses (see Phase 4, §4.2) |
| Anonymous closures for hooks | Prevents global function name collisions |
| Every hook body wrapped in try-catch | Bootstrap errors must never crash WordPress |
| Autoloader existence check before `require_once` | Graceful failure instead of PHP fatal |
| `return` (not `exit`) on autoloader failure | Allows WordPress to continue loading other plugins |
