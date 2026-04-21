# 20.3 Step 2 — Bootstrap File

> **Parent:** [Phase 20 overview](./00-overview.md)  
> **Phase 1, §1.3** + **Phase 7, §7.1** — Three tasks only: header, autoloader, singleton.

---

**File: `task-tracker.php`**

```php
<?php
/**
 * Plugin Name:       Task Tracker
 * Plugin URI:        https://example.com/task-tracker
 * Description:       A minimal task management plugin built with the Gold Standard architecture.
 * Version:           1.0.0
 * Requires at least: 5.6
 * Requires PHP:      8.1
 * Author:            Your Name
 * Author URI:        https://example.com
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       task-tracker
 */

if (!defined('ABSPATH')) {
    exit;
}

/** Enable debug mode — exposes stack traces in API responses. Set false in production. */
define('TASK_TRACKER_DEBUG', false);

// ── Load autoloader ──
$autoloaderPath = __DIR__ . '/includes/Autoloader.php';
$hasAutoloader = file_exists($autoloaderPath);

if (!$hasAutoloader) {
    error_log('[TaskTracker] FATAL: Autoloader.php not found at ' . $autoloaderPath);

    return;
}

require_once $autoloaderPath;

// ── Boot plugin ──
// Uses 'plugins_loaded' because we need admin UI + REST API
add_action('plugins_loaded', function (): void {
    try {
        \TaskTracker\Core\Plugin::getInstance();
    } catch (\Throwable $e) {
        error_log('[TaskTracker] Boot failed: ' . $e->getMessage() . "\n" . $e->getTraceAsString());
    }
});

// ── Activation hook ──
register_activation_hook(__FILE__, function (): void {
    try {
        \TaskTracker\Core\Activator::activate();
    } catch (\Throwable $e) {
        error_log('[TaskTracker] Activation failed: ' . $e->getMessage() . "\n" . $e->getTraceAsString());
    }
});

// ── Deactivation hook ──
register_deactivation_hook(__FILE__, function (): void {
    try {
        \TaskTracker\Core\Deactivator::deactivate();
    } catch (\Throwable $e) {
        error_log('[TaskTracker] Deactivation failed: ' . $e->getMessage() . "\n" . $e->getTraceAsString());
    }
});
```

## Checklist — What to verify

| ✅ Rule | Source |
|---------|--------|
| ABSPATH guard at top | Phase 1, §1.6 |
| `return` not `exit` on autoloader failure | Phase 7, §7.1 |
| Every hook body in try-catch `Throwable` | Phase 4, §4.8 Rule 1 |
| Stack trace appended in every catch | Phase 4, §4.8 Rule 2 |
| Debug constant uses `PLUGIN_NAME_DEBUG` pattern | Phase 4, §4.2 |
