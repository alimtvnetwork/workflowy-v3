# 8.8 Integration into Plugin.php

> **Parent:** [Phase 8 overview](./00-overview.md)

---

When using admin pages, cron, and AJAX alongside REST endpoints, the Plugin constructor changes:

```php
private function __construct()
{
    $startTime = microtime(true);
    $this->fileLogger = FileLogger::getInstance();

    // ── REST routes (only on REST requests) ──
    $this->registerRoutes();

    // ── Admin pages (only in admin context) ──
    $isAdmin = is_admin();

    if ($isAdmin) {
        add_action('admin_menu', [$this, 'registerAdminPages']);
        add_action('admin_init', [$this, 'registerSettings']);
        add_action('admin_init', [$this, 'registerAjaxHandlers']);
    }

    // ── Cron hooks (always — cron runs outside admin) ──
    $this->registerCronHooks();

    // ── Shutdown handler ──
    $this->registerShutdownHandler();

    // ── Boot log ──
    $elapsedMs = round((microtime(true) - $startTime) * 1000, 2);
    $this->fileLogger->info('Plugin initialized', [
        'version' => PluginConfigType::Version->value,
        'timeMs'  => $elapsedMs,
        'isAdmin' => $isAdmin,
    ]);
}
```

## Bootstrap file change

When the plugin needs admin features, change the hook from `rest_api_init` to `plugins_loaded`:

```php
// In plugin-name.php — use 'plugins_loaded' for full-featured plugins
add_action('plugins_loaded', function (): void {
    try {
        \PluginName\Core\Plugin::getInstance();
    } catch (\Throwable $e) {
        error_log('[PluginName] Boot failed: ' . $e->getMessage() . "\n" . $e->getTraceAsString());
    }
});
```

## Why `plugins_loaded` instead of `rest_api_init`

| Hook | When it fires | Use for |
|------|--------------|---------|
| `rest_api_init` | Only on REST API requests | REST-only plugins (no admin UI) |
| `plugins_loaded` | Every WordPress request | Plugins with admin pages, cron, AJAX, and REST |
| `init` | After `plugins_loaded` | Only if you need custom post types or taxonomies registered |
