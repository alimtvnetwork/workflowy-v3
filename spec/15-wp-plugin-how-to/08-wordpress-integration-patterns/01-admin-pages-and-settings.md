# 8.1 Admin Pages & Settings

> **Parent:** [Phase 8 overview](./00-overview.md)

---

## When to use

Any plugin that needs a settings screen visible in the WordPress admin sidebar.

## Registration pattern

Create a trait: `Traits/Admin/AdminPageTrait.php`

```php
namespace PluginName\Traits\Admin;

if (!defined('ABSPATH')) {
    exit;
}

use PluginName\Enums\PluginConfigType;
use PluginName\Enums\CapabilityType;

trait AdminPageTrait
{
    /**
     * Register admin menu pages. Call from Plugin::__construct() via
     * add_action('admin_menu', [$this, 'registerAdminPages']);
     */
    public function registerAdminPages(): void
    {
        add_menu_page(
            PluginConfigType::Name->value,                       // Page title
            PluginConfigType::ShortName->value,                  // Menu title
            CapabilityType::ManageOptions->value,                // Capability
            PluginConfigType::Slug->value,                       // Menu slug
            [$this, 'renderSettingsPage'],                       // Callback
            'dashicons-admin-generic',                           // Icon
            80,                                                  // Position
        );
    }

    /**
     * Render the main settings page.
     */
    public function renderSettingsPage(): void
    {
        $isAuthorized = current_user_can(CapabilityType::ManageOptions->value);

        if (!$isAuthorized) {
            wp_die('Unauthorized access');
        }

        // Use a template file instead of inline HTML
        $templatePath = plugin_dir_path(dirname(__DIR__, 2)) . 'templates/settings.php';
        $hasTemplate = file_exists($templatePath);

        if ($hasTemplate) {
            include $templatePath;
        }
    }
}
```

## Settings API pattern

```php
/**
 * Register settings fields. Call from Plugin::__construct() via
 * add_action('admin_init', [$this, 'registerSettings']);
 */
public function registerSettings(): void
{
    register_setting(
        PluginConfigType::SettingsGroup->value,
        'plugin_name_settings',
        [
            'type'              => 'object',
            'sanitize_callback' => [$this, 'sanitizeSettings'],
        ],
    );

    add_settings_section(
        'plugin_name_general',
        'General Settings',
        null,
        PluginConfigType::Slug->value,
    );

    add_settings_field(
        'plugin_name_api_key',
        'API Key',
        [$this, 'renderApiKeyField'],
        PluginConfigType::Slug->value,
        'plugin_name_general',
    );
}

/**
 * Sanitize settings before saving.
 *
 * @param array<string, mixed> $input Raw form input
 *
 * @return array<string, mixed> Sanitized settings
 */
public function sanitizeSettings(array $input): array
{
    $sanitized = [];

    $apiKey = $input['api_key'] ?? '';
    $hasApiKey = ($apiKey !== '');

    if ($hasApiKey) {
        $sanitized['api_key'] = sanitize_text_field($apiKey);
    }

    return $sanitized;
}
```

## Nonce verification for admin forms

```php
// In the form template:
wp_nonce_field('plugin_name_save_settings', 'plugin_name_nonce');

// In the handler:
$nonce = $_POST['plugin_name_nonce'] ?? '';
$isValidNonce = wp_verify_nonce($nonce, 'plugin_name_save_settings');

if (!$isValidNonce) {
    wp_die('Security check failed');
}
```

## Edge cases

| Scenario | Handling |
|----------|----------|
| Plugin activated on multisite | Use `is_multisite()` check; register network admin pages with `network_admin_menu` |
| User lacks capability | `wp_die()` with friendly message — never show partial page |
| Settings page renders with PHP warnings | Wrap all rendering in try-catch, log errors, show fallback message |

## Admin Menu Error Count Badge

When the plugin has unseen errors, display a count badge on the admin menu item. This uses WordPress's built-in `<span class="update-plugins">` pattern.

```php
trait AdminPageTrait
{
    public function registerAdminPages(): void
    {
        // Get unseen error count for badge
        $unseenCount = $this->getUnseenErrorCount();
        $menuTitle = PluginConfigType::ShortName->value;

        $hasBadge = ($unseenCount > 0);

        if ($hasBadge) {
            $menuTitle .= sprintf(
                ' <span class="update-plugins count-%d"><span class="plugin-count">%d</span></span>',
                $unseenCount,
                $unseenCount,
            );
        }

        add_menu_page(
            PluginConfigType::Name->value,
            $menuTitle,                                            // Menu title with badge
            CapabilityType::ManageOptions->value,
            PluginConfigType::Slug->value,
            [$this, 'renderSettingsPage'],
            'dashicons-admin-generic',
            80,
        );
    }

    /**
     * Get count of unseen error sessions.
     * Uses wp_options for fast retrieval without DB query on every admin page load.
     */
    private function getUnseenErrorCount(): int
    {
        $optionKey = PluginConfigType::Slug->value . '_unseen_error_count';
        $count = get_option($optionKey, 0);

        return (int) $count;
    }
}
```

### Badge update flow

| Event | Action |
|-------|--------|
| New error logged | `update_option($optionKey, $currentCount + 1)` in error handler |
| Admin views error page | `update_option($optionKey, 0)` — clears badge |
| Flash banner dismissed | `update_option($optionKey, 0)` — clears badge via AJAX |
| Plugin deactivated | `delete_option($optionKey)` in `Deactivator` |

### Rules

1. Badge count stored in `wp_options` — NOT computed via DB query on every page load
2. The `update-plugins` class is a WordPress convention that styles the red bubble automatically
3. Badge is cleared when admin navigates to the error page OR dismisses the flash banner
4. The `count-{N}` class is required for WordPress core CSS to render correctly
