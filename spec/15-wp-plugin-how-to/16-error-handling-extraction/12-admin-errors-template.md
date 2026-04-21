# 16.12 Admin Errors Page — Complete Template

> **Parent:** [Phase 16 overview](./00-overview.md)

---

Every plugin MUST include an error management admin page. This template orchestrates the error viewing UI from partials.

## Orchestrator Template: `templates/admin-errors.php`

```php
<?php
/**
 * Admin Errors Page — Error log viewer and session manager.
 *
 * Orchestrates error management UI via partials.
 *
 * @package PluginName
 * @since   1.0.0
 */

use PluginName\Enums\PluginConfigType;
use PluginName\Enums\AdminPageType;

if (!defined('ABSPATH')) {
    exit;
}

$pluginName = PluginConfigType::Name->value;
$pluginSlug = PluginConfigType::Slug->value;
?>
<div class="wrap pluginname-admin pluginname-errors">
    <?php
    // ── Page Header ──────────────────────────────────
    $pageIcon = 'dashicons-warning';
    $pageTitle = __('Error Management', $pluginSlug);
    $pageDescription = __('View, inspect, and clear plugin error logs.', $pluginSlug);
    include __DIR__ . '/partials/shared/page-header.php';

    // ── Flash Banner (unseen errors) ─────────────────
    include __DIR__ . '/partials/errors/flash-banner.php';
    ?>

    <!-- ── Actions Bar ──────────────────────────────── -->
    <div class="pluginname-card">
        <div class="pluginname-actions-row">
            <select id="log-file-selector">
                <option value="error.log"><?php esc_html_e('Error Log', $pluginSlug); ?></option>
                <option value="info.log"><?php esc_html_e('Info Log', $pluginSlug); ?></option>
                <option value="stacktrace.log"><?php esc_html_e('Stack Trace Log', $pluginSlug); ?></option>
                <option value="fatal-errors.log"><?php esc_html_e('Fatal Errors', $pluginSlug); ?></option>
            </select>
            <button id="btn-read-log" class="button button-primary">
                <span class="dashicons dashicons-visibility"></span>
                <?php esc_html_e('View Log', $pluginSlug); ?>
            </button>
            <button id="btn-clear-log" class="button button-secondary">
                <span class="dashicons dashicons-trash"></span>
                <?php esc_html_e('Clear File', $pluginSlug); ?>
            </button>
            <button id="btn-clear-all" class="button button-secondary">
                <span class="dashicons dashicons-dismiss"></span>
                <?php esc_html_e('Clear All Logs', $pluginSlug); ?>
            </button>
            <span id="log-action-status" class="pluginname-inline-status"></span>
        </div>
    </div>

    <!-- ── Log Content Viewer ───────────────────────── -->
    <?php include __DIR__ . '/partials/errors/log-file-viewer.php'; ?>

    <!-- ── Error Sessions Table ─────────────────────── -->
    <?php include __DIR__ . '/partials/errors/error-session-table.php'; ?>

    <!-- ── Error Detail Modal ───────────────────────── -->
    <?php include __DIR__ . '/partials/errors/error-detail-modal.php'; ?>
</div>
```

## Partial: `partials/errors/flash-banner.php`

```php
<?php
/**
 * Flash Banner — Shows unseen error count.
 * Receives: $pluginSlug (from parent template)
 */

if (!defined('ABSPATH')) { exit; }

$unseenCount = get_option(PluginConfigType::Slug->value . '_unseen_error_count', 0);
$hasUnseen = ($unseenCount > 0);

if (!$hasUnseen) { return; }
?>
<div id="pluginname-flash-banner" class="pluginname-flash-banner">
    <span class="flash-icon">⚠️</span>
    <div class="flash-content">
        <strong>
            <?php printf(
                esc_html__('%d new error(s) since your last visit.', $pluginSlug),
                $unseenCount
            ); ?>
        </strong>
    </div>
    <button id="btn-dismiss-flash" class="button flash-dismiss">
        <?php esc_html_e('Mark as Seen', $pluginSlug); ?>
    </button>
</div>
```

## Partial: `partials/errors/log-file-viewer.php`

```php
<?php
/**
 * Log File Viewer — Dark terminal-style content display.
 * Receives: $pluginSlug (from parent template)
 */

if (!defined('ABSPATH')) { exit; }
?>
<div class="pluginname-card" id="log-viewer-card">
    <h2>
        <span class="dashicons dashicons-media-text"></span>
        <?php esc_html_e('Log File Content', $pluginSlug); ?>
        <span id="log-file-name" class="pluginname-version-badge">error.log</span>
        <span id="log-file-size" class="pluginname-version-badge"></span>
    </h2>
    <div id="log-content-wrapper">
        <div id="log-empty" class="file-empty" style="display: none;">
            <span class="dashicons dashicons-yes-alt"></span>
            <p><?php esc_html_e('No errors found — looking good!', $pluginSlug); ?></p>
        </div>
        <pre id="log-content" class="code-pre" style="display: none;"></pre>
    </div>
</div>
```

## Partial: `partials/errors/error-session-table.php`

```php
<?php
/**
 * Error Session Table — Groups errors by request session.
 * Receives: $pluginSlug, $sessions (from parent template or AJAX)
 */

if (!defined('ABSPATH')) { exit; }
?>
<div class="pluginname-card">
    <h2>
        <span class="dashicons dashicons-database"></span>
        <?php esc_html_e('Error Sessions', $pluginSlug); ?>
    </h2>
    <table class="wp-list-table widefat fixed striped">
        <thead>
            <tr>
                <th class="column-time"><?php esc_html_e('Time', $pluginSlug); ?></th>
                <th class="column-count"><?php esc_html_e('Errors', $pluginSlug); ?></th>
                <th class="column-level"><?php esc_html_e('Severity', $pluginSlug); ?></th>
                <th class="column-message"><?php esc_html_e('First Error', $pluginSlug); ?></th>
                <th class="column-status"><?php esc_html_e('Status', $pluginSlug); ?></th>
                <th class="column-actions"><?php esc_html_e('Actions', $pluginSlug); ?></th>
            </tr>
        </thead>
        <tbody id="error-sessions-body">
            <tr>
                <td colspan="6" class="no-items">
                    <?php esc_html_e('Loading sessions...', $pluginSlug); ?>
                </td>
            </tr>
        </tbody>
    </table>
</div>
```

## Partial: `partials/errors/error-detail-modal.php`

```php
<?php
/**
 * Error Detail Modal — Shows full error context with stack trace.
 * Receives: $pluginSlug (from parent template)
 */

if (!defined('ABSPATH')) { exit; }

$modalId = 'error-detail-modal';
$modalTitle = __('Error Details', $pluginSlug);
$modalIcon = 'dashicons-warning';
$modalIconColor = '#dc2626';
$modalMaxWidth = '1000px';
$modalBody = '
    <div class="error-detail-content">
        <div class="error-meta" id="error-meta"></div>
        <h4>' . esc_html__('Stack Trace', $pluginSlug) . '</h4>
        <pre class="stack-trace" id="error-stack-trace"></pre>
    </div>';
$modalFooter = '<button class="button" onclick="document.getElementById(\'' . $modalId . '\').style.display=\'none\'">'
    . esc_html__('Close', $pluginSlug) . '</button>';

include __DIR__ . '/../shared/modal-wrapper.php';
?>
```

## Required partials directory structure

```
templates/
├── admin-errors.php                    ← Orchestrator (under 80 lines)
└── partials/
    ├── shared/
    │   ├── page-header.php
    │   └── modal-wrapper.php
    └── errors/
        ├── flash-banner.php            ← Unseen error alert
        ├── log-file-viewer.php         ← Dark terminal log display
        ├── error-session-table.php     ← Session-grouped error table
        └── error-detail-modal.php      ← Full error context modal
```
