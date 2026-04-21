# 11.3 Page Templates — The Orchestrator Pattern

> **Parent:** [00-overview.md](./00-overview.md)

A page template is an **orchestrator**: it sets variables and includes partials. It should contain **minimal HTML** itself.

## ✅ Correct — Orchestrator pattern (under 100 lines)

```php
<?php
/**
 * Admin Settings Page Template
 *
 * Orchestrates settings sections via partials.
 * Each section is a self-contained partial under partials/settings/.
 *
 * @package PluginName
 * @since   1.0.0
 */

use PluginName\Enums\PluginConfigType;

if (!defined('ABSPATH')) {
    exit;
}

$pluginName = PluginConfigType::Name->value;
$pluginSlug = PluginConfigType::Slug->value;
?>
<div class="wrap plugin-admin">
    <?php
    // ── Page Header (shared partial) ────────────────────────
    $pageIcon = 'dashicons-admin-generic';
    $pageTitle = $pluginName . ' - ' . __('Settings', $pluginSlug);
    $pageDescription = __('Configure plugin behaviour.', $pluginSlug);
    include __DIR__ . '/partials/shared/page-header.php';
    ?>

    <!-- General Settings Section -->
    <?php include __DIR__ . '/partials/settings/section-general.php'; ?>

    <!-- Advanced Settings Section -->
    <?php include __DIR__ . '/partials/settings/section-advanced.php'; ?>

    <!-- Update Settings Section -->
    <?php include __DIR__ . '/partials/settings/section-update.php'; ?>
</div>
```

## ❌ Wrong — Monolithic template (400+ lines)

```php
<!-- DO NOT do this — everything inline in one file -->
<div class="wrap">
    <h1>Settings</h1>
    <!-- 400 lines of mixed HTML, PHP logic, and inline styles -->
</div>
```
