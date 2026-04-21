# 11.6 JavaScript and CSS — Traditional (Non-React) Pattern

> **Parent:** [00-overview.md](./00-overview.md)

## File structure

```
plugin-slug/
├── assets/
│   ├── css/
│   │   ├── admin-shared.css          ← Shared styles (loaded on all admin pages)
│   │   ├── admin-settings.css        ← Settings-page-specific styles
│   │   └── admin-logs.css            ← Logs-page-specific styles
│   └── js/
│       ├── admin-settings.js         ← Settings-page-specific behaviour
│       └── admin-logs.js             ← Logs-page-specific behaviour
```

## Enqueuing pattern (in AdminPageTrait)

```php
public function enqueueAdminAssets(string $hook): void
{
    $isPluginPage = $this->isPluginAdminPage($hook);

    if (!$isPluginPage) {
        return;
    }

    $pluginSlug = PluginConfigType::Slug->value;
    $version = PluginConfigType::Version->value;
    $baseUrl = plugin_dir_url(dirname(__DIR__));

    // Shared styles — all plugin admin pages
    wp_enqueue_style(
        $pluginSlug . '-admin-shared',
        $baseUrl . 'assets/css/admin-shared.css',
        [],
        $version,
    );

    // Page-specific assets
    $page = $this->getCurrentAdminPage($hook);
    $cssFile = 'assets/css/admin-' . $page . '.css';
    $jsFile = 'assets/js/admin-' . $page . '.js';

    $hasCss = file_exists(plugin_dir_path(dirname(__DIR__)) . $cssFile);

    if ($hasCss) {
        wp_enqueue_style(
            $pluginSlug . '-admin-' . $page,
            $baseUrl . $cssFile,
            [$pluginSlug . '-admin-shared'],
            $version,
        );
    }

    $hasJs = file_exists(plugin_dir_path(dirname(__DIR__)) . $jsFile);

    if ($hasJs) {
        wp_enqueue_script(
            $pluginSlug . '-admin-' . $page,
            $baseUrl . $jsFile,
            ['jquery'],
            $version,
            true,  // Load in footer
        );

        // Pass data to JS
        wp_localize_script($pluginSlug . '-admin-' . $page, 'PluginNameAdmin', [
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'restUrl' => rest_url(PluginConfigType::apiFullNamespace() . '/'),
            'nonce'   => wp_create_nonce('wp_rest'),
            'slug'    => $pluginSlug,
        ]);
    }
}
```
