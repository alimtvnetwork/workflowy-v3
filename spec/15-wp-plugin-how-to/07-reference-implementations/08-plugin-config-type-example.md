# 7.8 Complete PluginConfigType Example

> **Parent:** [Phase 7 overview](./00-overview.md)

```php
<?php
/**
 * PluginConfigType — The identity enum. Single source of truth for all plugin metadata.
 *
 * @package PluginName\Enums
 * @since   1.0.0
 */

namespace PluginName\Enums;

if (!defined('ABSPATH')) {
    exit;
}

enum PluginConfigType: string
{
    case Slug          = 'plugin-name';
    case ShortName     = 'PluginName';
    case Name          = 'Plugin Name';
    case Version       = '1.0.0';
    case MinWpVersion  = '5.6';
    case MinPhpVersion = '8.1';
    case ApiNamespace  = 'plugin-name-api';
    case ApiVersion    = 'v1';
    case LogPrefix     = '[PluginName]';
    case SettingsGroup = 'plugin_name_settings';
    case DebugConstant = 'PLUGIN_NAME_DEBUG';

    /** Build the full REST API namespace: 'plugin-name-api/v1' */
    public static function apiFullNamespace(): string
    {
        return self::ApiNamespace->value . '/' . self::ApiVersion->value;
    }

    /** Check if the plugin is running in debug mode. */
    public static function isDebugMode(): bool
    {
        $constantName = self::DebugConstant->value;
        $isDefined = defined($constantName);

        return $isDefined && constant($constantName) === true;
    }

    public function isEqual(self $other): bool { return $this === $other; }
    public function isOtherThan(self $other): bool { return $this !== $other; }
    public function isAnyOf(self ...$others): bool { return in_array($this, $others, true); }
}
```
