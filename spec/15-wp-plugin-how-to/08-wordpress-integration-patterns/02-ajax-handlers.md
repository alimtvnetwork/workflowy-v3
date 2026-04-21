# 8.2 AJAX Handlers (Non-REST)

> **Parent:** [Phase 8 overview](./00-overview.md)

---

## When to use

WordPress admin AJAX calls via `wp_ajax_{action}` — typically for admin UI interactions that don't need REST API formality.

## Pattern

```php
namespace PluginName\Traits\Admin;

if (!defined('ABSPATH')) {
    exit;
}

use PluginName\Enums\AjaxActionType;
use PluginName\Enums\CapabilityType;

trait AdminAjaxTrait
{
    /**
     * Register AJAX handlers. Call from Plugin::__construct() via
     * add_action('admin_init', [$this, 'registerAjaxHandlers']);
     */
    public function registerAjaxHandlers(): void
    {
        // Authenticated admin AJAX only — no wp_ajax_nopriv_ (never allow public AJAX)
        add_action(
            'wp_ajax_' . AjaxActionType::ClearCache->value,
            [$this, 'handleClearCache'],
        );
    }

    /**
     * Handle the clear-cache AJAX request.
     */
    public function handleClearCache(): void
    {
        try {
            // ── 1. Verify nonce ──
            $nonce = $_POST['nonce'] ?? '';
            $isValidNonce = wp_verify_nonce($nonce, AjaxActionType::ClearCache->value);

            if (!$isValidNonce) {
                wp_send_json_error(['message' => 'Invalid security token'], 403);

                return;
            }

            // ── 2. Verify capability ──
            $isAuthorized = current_user_can(CapabilityType::ManageOptions->value);

            if (!$isAuthorized) {
                wp_send_json_error(['message' => 'Unauthorized'], 403);

                return;
            }

            // ── 3. Business logic ──
            delete_transient('plugin_name_cache');

            // ── 4. Success response ──
            wp_send_json_success(['message' => 'Cache cleared']);
        } catch (\Throwable $e) {
            $this->fileLogger->logException($e, 'AJAX:clear-cache');

            wp_send_json_error(['message' => 'An error occurred'], 500);
        }
    }
}
```

## AjaxActionType enum

```php
enum AjaxActionType: string
{
    case ClearCache    = 'plugin_name_clear_cache';
    case ExportData    = 'plugin_name_export_data';
    case RunDiagnostic = 'plugin_name_run_diagnostic';

    /** Build the nonce action string. */
    public function nonceAction(): string
    {
        return $this->value;
    }

    public function isEqual(self $other): bool { return $this === $other; }
    public function isOtherThan(self $other): bool { return $this !== $other; }
    public function isAnyOf(self ...$others): bool { return in_array($this, $others, true); }
}
```

## JavaScript side (enqueue in admin page)

```javascript
jQuery.post(ajaxurl, {
    action: 'plugin_name_clear_cache',
    nonce: pluginNameData.nonce,   // Localized via wp_localize_script()
}, function(response) {
    if (response.success) {
        alert(response.data.message);
    }
});
```

## Edge cases

| Scenario | Handling |
|----------|----------|
| Missing `ajaxurl` in JS | Always use `wp_localize_script()` to pass URL and nonce |
| Expired nonce (user left tab open) | Return 403 with "Security token expired. Please refresh the page." |
| AJAX called without login | Don't register `wp_ajax_nopriv_` for admin actions — WordPress returns 0 automatically |
