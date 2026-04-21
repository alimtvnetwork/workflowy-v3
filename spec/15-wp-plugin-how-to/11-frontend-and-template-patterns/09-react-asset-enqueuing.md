# 11.9 Enqueuing React Assets

> **Parent:** [00-overview.md](./00-overview.md)

```php
namespace PluginName\Traits\Admin;

if (!defined('ABSPATH')) {
    exit;
}

use PluginName\Enums\PluginConfigType;

trait AdminReactAssetsTrait
{
    /**
     * Enqueue the React application bundle.
     * Only loads on plugin admin pages.
     */
    public function enqueueReactAssets(string $hook): void
    {
        $isPluginPage = $this->isPluginAdminPage($hook);

        if (!$isPluginPage) {
            return;
        }

        $pluginSlug = PluginConfigType::Slug->value;
        $version = PluginConfigType::Version->value;
        $baseUrl = plugin_dir_url(dirname(__DIR__, 2));
        $distPath = plugin_dir_path(dirname(__DIR__, 2)) . 'assets/dist/';

        // CSS bundle
        $hasCss = file_exists($distPath . 'admin.css');

        if ($hasCss) {
            wp_enqueue_style(
                $pluginSlug . '-react',
                $baseUrl . 'assets/dist/admin.css',
                [],
                $version,
            );
        }

        // JS bundle — depends on wp-element (React provided by WordPress)
        $hasJs = file_exists($distPath . 'admin.js');

        if ($hasJs) {
            wp_enqueue_script(
                $pluginSlug . '-react',
                $baseUrl . 'assets/dist/admin.js',
                ['wp-element'],
                $version,
                true,
            );

            // Inject runtime config for the React app
            wp_localize_script($pluginSlug . '-react', 'PluginNameConfig', [
                'restUrl'  => rest_url(PluginConfigType::apiFullNamespace() . '/'),
                'nonce'    => wp_create_nonce('wp_rest'),
                'version'  => $version,
                'isDebug'  => PluginConfigType::isDebugMode(),
            ]);
        }
    }
}
```
