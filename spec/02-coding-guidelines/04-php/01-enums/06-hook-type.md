# HookType — WordPress Hook Names

> **Parent:** [00-overview.md](00-overview.md)

```php
enum HookType: string
{
    // ── Core Lifecycle ──────────────────────────────────────────
    case Init           = 'init';
    case PluginsLoaded  = 'plugins_loaded';
    case RestApiInit    = 'rest_api_init';
    case AdminInit      = 'admin_init';
    case Shutdown       = 'shutdown';

    // ── Plugin Lifecycle ────────────────────────────────────────
    case ActivatedPlugin   = 'activated_plugin';
    case DeactivatedPlugin = 'deactivated_plugin';
    case DeletedPlugin     = 'deleted_plugin';

    // ── Admin UI ────────────────────────────────────────────────
    case AdminNotices   = 'admin_notices';
    case AdminEnqueue   = 'admin_enqueue_scripts';
    case AdminMenu      = 'admin_menu';

    // ── Filters ─────────────────────────────────────────────────
    case RestPostDispatch                  = 'rest_post_dispatch';
    case PluginActionLinks                 = 'plugin_action_links';
    case PreSetSiteTransientUpdatePlugins  = 'pre_set_site_transient_update_plugins';
    case PluginsApi                        = 'plugins_api';
    case CronSchedules                     = 'cron_schedules';

    public function isEqual(self $other): bool { return $this === $other; }

    public static function ajax(string $action): string
    {
        return 'wp_ajax_' . $action;
    }

    public static function ajaxNopriv(string $action): string
    {
        return 'wp_ajax_nopriv_' . $action;
    }
}
```

## Usage

```php
use RiseupAsia\\Enums\\HookType;

// ❌ FORBIDDEN
add_action('rest_api_init', [$this, 'registerRoutes']);

// ✅ REQUIRED
add_action(HookType::RestApiInit->value, [$this, 'registerRoutes']);
add_action(HookType::ajax('riseup_test'), [$this, 'ajaxTest']);
```
