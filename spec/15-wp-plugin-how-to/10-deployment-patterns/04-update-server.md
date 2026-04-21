# 10.4 Self-Hosted Update Server

> **Updated:** 2026-04-19

---

## Why self-hosted?

Plugins not listed on wordpress.org need a custom update mechanism. The pattern hooks into WordPress's native update system via two filters.

---

## Update JSON endpoint

The update server (or a static JSON file) must serve an update-info response:

```json
{
  "name": "Plugin Name",
  "slug": "plugin-slug",
  "version": "2.31.0",
  "download_url": "https://updates.example.com/plugin-slug/plugin-slug-v2.31.0.zip",
  "tested": "6.7",
  "requires": "5.6",
  "requires_php": "8.2",
  "last_updated": "2026-04-08",
  "sections": {
    "description": "Plugin description here.",
    "changelog": "<h4>2.31.0</h4><ul><li>New feature X</li></ul>"
  }
}
```

---

## UpdateResolver — Hook Registration

The plugin hooks into WordPress's update system using two filters:

```php
namespace PluginName\Update;

if (!defined('ABSPATH')) {
    exit;
}

use PluginName\Enums\HookType;
use PluginName\Enums\OptionNameType;
use PluginName\Enums\UpdateConfigType;
use PluginName\Logging\FileLogger;

class UpdateResolver
{
    use Traits\UpdateResolverUrlTrait;
    use Traits\UpdateResolverFetchTrait;
    use Traits\UpdateResolverWpHooksTrait;
    use Traits\UpdateResolverIntegrityTrait;
    use Traits\UpdateResolverBackupTrait;

    private FileLogger $fileLogger;
    private static ?self $instance = null;

    public static function getInstance(): static
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    private function __construct()
    {
        $this->fileLogger = FileLogger::getInstance();

        $settings = $this->getSettings();
        $isEnabled = !empty($settings['enabled']);

        if ($isEnabled) {
            add_filter(
                HookType::PreSetSiteTransientUpdatePlugins->value,
                [$this, 'checkForPluginUpdate'],
            );
            add_filter(
                HookType::PluginsApi->value,
                [$this, 'pluginInfo'],
                10,
                3,
            );
        }
    }
}
```

---

## Required HookType enum cases

```php
// In HookType enum — add these cases for update hooks
case PreSetSiteTransientUpdatePlugins = 'pre_set_site_transient_update_plugins';
case PluginsApi                       = 'plugins_api';
```

---

## UpdateResolverWpHooksTrait — Core Hooks

```php
namespace PluginName\Update\Traits;

if (!defined('ABSPATH')) {
    exit;
}

use PluginName\Enums\PluginConfigType;
use stdClass;

trait UpdateResolverWpHooksTrait
{
    /**
     * Hook into WordPress update check.
     * Called via pre_set_site_transient_update_plugins filter.
     */
    public function checkForPluginUpdate(mixed $transient): mixed
    {
        $hasChecked = is_object($transient) && property_exists($transient, 'checked');

        if (!$hasChecked) {
            return $transient;
        }

        $settings = $this->getSettings();
        $remoteVersion = $settings['new_version'] ?? '';
        $currentVersion = PluginConfigType::Version->value;
        $pluginBasename = PluginConfigType::Basename->value;
        $hasUpdate = (
            !empty($remoteVersion)
            && version_compare($remoteVersion, $currentVersion, '>')
        );

        if (!$hasUpdate) {
            return $transient;
        }

        $updateObj = new stdClass();
        $updateObj->slug        = PluginConfigType::Slug->value;
        $updateObj->plugin      = $pluginBasename;
        $updateObj->new_version = $remoteVersion;
        $updateObj->url         = PluginConfigType::PluginUri->value;
        $updateObj->package     = $settings['package_url'] ?? '';
        $updateObj->tested      = $settings['update_info']['tested'] ?? '';
        $updateObj->requires    = $settings['update_info']['requires'] ?? '';

        $transient->response[$pluginBasename] = $updateObj;

        return $transient;
    }

    /**
     * Provide plugin information for the WordPress "View Details" modal.
     * Called via plugins_api filter.
     */
    public function pluginInfo(mixed $result, string $action, object $args): mixed
    {
        $isQueryingThisPlugin = (
            $action === 'plugin_information'
            && isset($args->slug)
            && $args->slug === PluginConfigType::Slug->value
        );

        if (!$isQueryingThisPlugin) {
            return $result;
        }

        $settings = $this->getSettings();
        $info = $settings['update_info'] ?? [];
        $hasInfo = !empty($info);

        if (!$hasInfo) {
            return $result;
        }

        $pluginInfo = new stdClass();
        $pluginInfo->name          = $info['name'] ?? PluginConfigType::Name->value;
        $pluginInfo->slug          = PluginConfigType::Slug->value;
        $pluginInfo->version       = $info['version'] ?? '';
        $pluginInfo->author        = $info['author'] ?? '';
        $pluginInfo->download_link = $settings['package_url'] ?? '';
        $pluginInfo->tested        = $info['tested'] ?? '';
        $pluginInfo->requires      = $info['requires'] ?? '';
        $pluginInfo->requires_php  = $info['requires_php'] ?? '';
        $pluginInfo->last_updated  = $info['last_updated'] ?? '';
        $pluginInfo->sections      = $info['sections'] ?? [];

        return $pluginInfo;
    }
}
```

---

## Update settings storage

```php
// OptionNameType enum — add case for update settings
case UpdateSettings = 'plugin_slug_update_settings';
```

Settings structure stored in `wp_options`:

```php
$defaults = [
    'enabled'      => false,          // Master toggle
    'master_url'   => '',             // User-configured update URL
    'resolved_url' => '',             // After 301 redirect resolution
    'resolved_at'  => '',             // When URL was last resolved
    'cache_days'   => 7,              // Days to cache resolved URL
    'last_check'   => '',             // Last update check timestamp
    'last_error'   => '',             // Last error message
    'package_url'  => '',             // Direct ZIP download URL
    'new_version'  => '',             // Latest available version
    'update_info'  => [],             // Full update metadata
];
```

---

*Self-hosted update server — v3.2.0 — 2026-04-19*
