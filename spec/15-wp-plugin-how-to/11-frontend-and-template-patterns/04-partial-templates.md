# 11.4 Partial Templates — The Component Pattern

> **Parent:** [00-overview.md](./00-overview.md)

Each partial is a **self-contained UI component** that receives data via PHP variables set in the parent scope.

## Partial anatomy

```php
<?php
/**
 * Partial: Section Name
 *
 * Renders the [description of what this partial renders].
 *
 * Required variables (from parent scope):
 *   $pluginSlug — Plugin text domain for i18n
 *
 * Optional variables:
 *   $sectionTitle — Override default title
 *
 * @package PluginName
 * @since   1.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}
?>
<div class="plugin-card">
    <h2>
        <span class="dashicons dashicons-admin-tools"></span>
        <?php echo esc_html($sectionTitle ?? __('Default Title', $pluginSlug)); ?>
    </h2>

    <table class="form-table">
        <tr>
            <th scope="row">
                <label for="setting_name">
                    <?php esc_html_e('Setting Label', $pluginSlug); ?>
                </label>
            </th>
            <td>
                <input type="text"
                       id="setting_name"
                       name="setting_name"
                       class="regular-text"
                       value="<?php echo esc_attr($settingValue ?? ''); ?>">
            </td>
        </tr>
    </table>
</div>
```

## Partial rules

| Rule | Detail |
|------|--------|
| **Document required variables** | Every partial must list which `$variables` it expects from parent scope |
| **ABSPATH guard** | Every partial starts with `if (!defined('ABSPATH')) { exit; }` |
| **Escape all output** | Use `esc_html()`, `esc_attr()`, `esc_url()`, `wp_kses()` — never raw `echo` |
| **No business logic** | Partials render data — they don't fetch, compute, or mutate |
| **No direct DB queries** | Data must be passed in via variables, not queried inside the partial |
| **i18n all strings** | Use `__()`, `_e()`, `esc_html_e()`, `esc_attr_e()` for all user-facing text |
| **Max 100 lines** | If a partial exceeds 100 lines, split it further |

## Shared partial reuse

When the same UI element appears on 2+ pages, extract it to `partials/shared/`:

```php
// In any page template — reuse the shared page header
$pageIcon = 'dashicons-database';
$pageTitle = $pluginName . ' - ' . __('Logs', $pluginSlug);
$pageDescription = __('View transaction logs.', $pluginSlug);
include __DIR__ . '/partials/shared/page-header.php';
```

## Complete Partial Example — Data Flow from Orchestrator to Partial

This example shows the full lifecycle: orchestrator prepares data, partial receives and renders it.

**Orchestrator:** `templates/admin-agents.php`

```php
<?php
/**
 * Admin Agents Page — Manages remote site agents.
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

// ── Prepare data for partials ──────────────────────────────
$agents = $this->agentService->getAllAgents();
$agentCount = count($agents);
$hasAgents = ($agentCount > 0);
$statusSummary = $this->agentService->getStatusSummary();
?>
<div class="wrap pluginname-admin pluginname-agents">
    <?php
    // ── Shared header partial ───────────────────────────────
    $pageIcon = 'dashicons-networking';
    $pageTitle = $pluginName . ' - ' . __('Agents', $pluginSlug);
    $pageDescription = sprintf(
        __('%d agent(s) registered.', $pluginSlug),
        $agentCount
    );
    include __DIR__ . '/partials/shared/page-header.php';
    ?>

    <!-- Agent List (receives $agents, $hasAgents from parent scope) -->
    <?php include __DIR__ . '/partials/agents/agent-list.php'; ?>

    <!-- Add Agent Form -->
    <?php include __DIR__ . '/partials/agents/agent-form.php'; ?>
</div>
```

**Partial:** `templates/partials/agents/agent-list.php`

```php
<?php
/**
 * Partial: Agent List Table
 *
 * Renders a table of registered remote site agents.
 *
 * Required variables (from parent scope):
 *   $pluginSlug  — Plugin text domain for i18n
 *   $agents      — array<int, array{id: int, url: string, label: string, status: string}>
 *   $hasAgents   — bool — whether any agents exist
 *
 * @package PluginName
 * @since   1.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}
?>
<div class="pluginname-card">
    <h2>
        <span class="dashicons dashicons-admin-site-alt3"></span>
        <?php esc_html_e('Registered Agents', $pluginSlug); ?>
    </h2>

    <?php if (!$hasAgents) : ?>
        <?php
        $emptyIcon = 'dashicons-networking';
        $emptyMessage = __('No agents registered yet. Add one below.', $pluginSlug);
        include __DIR__ . '/../shared/empty-state.php';
        ?>
    <?php else : ?>
        <table class="wp-list-table widefat fixed striped">
            <thead>
                <tr>
                    <th><?php esc_html_e('Label', $pluginSlug); ?></th>
                    <th><?php esc_html_e('URL', $pluginSlug); ?></th>
                    <th><?php esc_html_e('Status', $pluginSlug); ?></th>
                    <th><?php esc_html_e('Actions', $pluginSlug); ?></th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($agents as $agent) : ?>
                    <tr>
                        <td><?php echo esc_html($agent['label']); ?></td>
                        <td><code><?php echo esc_url($agent['url']); ?></code></td>
                        <td>
                            <span class="pluginname-status-badge pluginname-status-<?php echo esc_attr($agent['status']); ?>">
                                <?php echo esc_html(ucfirst($agent['status'])); ?>
                            </span>
                        </td>
                        <td>
                            <button class="button button-small btn-test-agent"
                                    data-agent-id="<?php echo esc_attr($agent['id']); ?>">
                                <?php esc_html_e('Test', $pluginSlug); ?>
                            </button>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    <?php endif; ?>
</div>
```

## Key takeaways from this example

| Pattern | Demonstrated |
|---------|-------------|
| **Data preparation in orchestrator** | `$agents`, `$hasAgents`, `$agentCount` computed before includes |
| **Variable documentation** | Partial header lists all required `$variables` with types |
| **Empty state delegation** | Empty state uses another shared partial (`empty-state.php`) |
| **Output escaping** | Every dynamic value uses `esc_html()`, `esc_attr()`, `esc_url()` |
| **No business logic in partial** | No DB queries, no service calls — pure rendering |
| **Nested partial reuse** | `agent-list.php` includes `shared/empty-state.php` when needed |
