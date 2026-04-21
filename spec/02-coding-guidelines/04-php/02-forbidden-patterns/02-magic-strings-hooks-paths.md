# §2 Magic Strings — Hooks & §3 File Paths

## 2. Magic Strings — Hooks

| # | ❌ Forbidden | ✅ Required | Source |
|---|-------------|------------|--------|
| 2.1 | `add_action('init', ...)` | `add_action(HookType::Init->value, ...)` | `HookType::Init` |
| 2.2 | `add_action('plugins_loaded', ...)` | `add_action(HookType::PluginsLoaded->value, ...)` | `HookType::PluginsLoaded` |
| 2.3 | `add_action('rest_api_init', ...)` | `add_action(HookType::RestApiInit->value, ...)` | `HookType::RestApiInit` |
| 2.4 | `add_action('admin_init', ...)` | `add_action(HookType::AdminInit->value, ...)` | `HookType::AdminInit` |
| 2.5 | `add_action('admin_menu', ...)` | `add_action(HookType::AdminMenu->value, ...)` | `HookType::AdminMenu` |
| 2.6 | `add_action('admin_notices', ...)` | `add_action(HookType::AdminNotices->value, ...)` | `HookType::AdminNotices` |
| 2.7 | `add_action('admin_enqueue_scripts', ...)` | `add_action(HookType::AdminEnqueue->value, ...)` | `HookType::AdminEnqueue` |
| 2.8 | `add_action('activated_plugin', ...)` | `add_action(HookType::ActivatedPlugin->value, ...)` | `HookType::ActivatedPlugin` |
| 2.9 | `add_action('deactivated_plugin', ...)` | `add_action(HookType::DeactivatedPlugin->value, ...)` | `HookType::DeactivatedPlugin` |
| 2.10 | `add_action('deleted_plugin', ...)` | `add_action(HookType::DeletedPlugin->value, ...)` | `HookType::DeletedPlugin` |
| 2.11 | `add_filter('rest_post_dispatch', ...)` | `add_filter(HookType::RestPostDispatch->value, ...)` | `HookType::RestPostDispatch` |
| 2.12 | `add_filter('cron_schedules', ...)` | `add_filter(HookType::CronSchedules->value, ...)` | `HookType::CronSchedules` |
| 2.13 | `add_action('wp_ajax_my_action', ...)` | `define('HOOK_AJAX_MY_ACTION', HookType::ajax(ACTION_MY_ACTION));` then `add_action(HOOK_AJAX_MY_ACTION, ...)` | Named composed constant |
| 2.14 | `add_action(HookType::ajax(ACTION_X), ...)` inline | Compose a named constant first, then use it | No inline concatenation at call site |
| 2.15 | `rest_url(REST_NAMESPACE . '/' . ACTION_X)` | `define('REST_URL_X', REST_NAMESPACE . '/' . ACTION_X);` then `rest_url(REST_URL_X)` | No inline concatenation at call site |
| 2.16 | `current_user_can('manage_options')` | `current_user_can(CapabilityType::ManageOptions->value)` | `CapabilityType` enum |
| 2.17 | `'POST'` or `WP_REST_Server::CREATABLE` in routes | `HttpMethodType::Post->value` | `HttpMethodType` enum |

## 3. Magic Strings — File Paths

| # | ❌ Forbidden | ✅ Required | Why |
|---|-------------|------------|-----|
| 3.1 | `WP_CONTENT_DIR . '/uploads/.../file.db'` | `PathHelper::getRootDb()` | Manual concatenation; magic string |
| 3.2 | `PathHelper::getDataDir() . '/file.db'` | `PathHelper::getRootDb()` | Partial accessor; magic filename at call site |
| 3.3 | `PathHelper::getDataDir() . PathDatabaseType::Root->value` | `PathHelper::getRootDb()` | Leaks internal composition to caller |
| 3.4 | Any path without a typed accessor | Create accessor in `PathHelper` first | Every path must have a single-call accessor |

---

*Part of [PHP Forbidden Patterns](./00-overview.md) — §2, §3*
