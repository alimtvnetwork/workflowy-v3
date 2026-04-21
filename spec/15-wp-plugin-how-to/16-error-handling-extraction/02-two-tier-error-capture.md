# 16.2 Two-Tier Error Capture

> **Parent:** [Phase 16 overview](./00-overview.md)

---

## Tier 1 — Bootstrap Errors (before autoloader)

```php
// In InitHelpers (available from the main plugin file)
public static function errorLogWithPrefix(string $message): void {
    error_log(PluginConfigType::LogPrefix->value . ' ' . $message);
}

public static function errorLog(Throwable $e, string $context): void {
    error_log($context . ' ' . $e->getMessage() . "\n" . $e->getTraceAsString());
}
```

**When to use:** Only during bootstrap, activation hooks, or when `FileLogger` is not yet available.

## Tier 2 — FileLogger Errors (after initialization)

All post-bootstrap errors go through `FileLogger` which writes to structured log files with rotation and deduplication (see Phase 4).
