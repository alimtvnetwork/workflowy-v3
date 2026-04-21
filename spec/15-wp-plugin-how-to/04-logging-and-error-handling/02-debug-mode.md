# 4.2 Debug Mode — The Master Gate

> **Parent:** [Phase 4 overview](./00-overview.md)

---

Every plugin defines a debug mode constant in its main plugin file:

```php
/** Enable debug mode — exposes stack traces in API responses. */
define('MY_PLUGIN_DEBUG', false);
```

## What debug mode controls

| Feature | Debug ON | Debug OFF |
|---------|----------|-----------|
| Stack traces in API error responses | ✅ Full frames included in `Errors.Backend` | ❌ `Errors.Backend` omitted entirely |
| Verbose log entries | ✅ `debug()` writes to `info.log` | ❌ `debug()` calls are silently skipped |
| Error response detail | ✅ Full exception message in `Errors.BackendMessage` | ⚠️ Generic message: `"An internal error occurred"` |
| Performance timing in logs | ✅ Included in context | ❌ Omitted |

## Checking debug mode

Use the `PluginConfigType` enum, not the raw constant:

```php
enum PluginConfigType: string
{
    case DebugConstant = 'MY_PLUGIN_DEBUG';

    /** Check if the plugin is running in debug mode. */
    public static function isDebugMode(): bool
    {
        $constantName = self::DebugConstant->value;
        $isDefined = defined($constantName);

        return $isDefined && constant($constantName) === true;
    }
}
```

**Usage:**
```php
$isDebug = PluginConfigType::isDebugMode();
```
