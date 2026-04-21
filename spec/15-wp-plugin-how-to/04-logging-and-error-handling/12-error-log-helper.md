# 4.12 ErrorLogHelper — Complete Specification

> **Parent:** [Phase 4 overview](./00-overview.md)

---

A minimal static class for Tier 1 logging when FileLogger is unavailable.

## Full implementation pattern

```php
class ErrorLogHelper
{
    /**
     * Log an exception with full context and stack trace to PHP's error_log.
     *
     * @param Throwable $exception The caught exception
     * @param string    $context   Human-readable context (e.g., 'Autoloader:')
     */
    public static function log(Throwable $exception, string $context): void
    {
        $message = sprintf(
            '%s %s in %s:%d\n%s',
            $context,
            $exception->getMessage(),
            $exception->getFile(),
            $exception->getLine(),
            $exception->getTraceAsString(),
        );

        error_log($message);
    }

    /**
     * Log an exception and re-throw it. Use in infrastructure code
     * where silent failure causes cascading breakage.
     *
     * @param Throwable $exception The caught exception
     * @param string    $context   Human-readable context
     *
     * @throws Throwable Always re-throws the original exception
     */
    public static function logAndThrow(Throwable $exception, string $context): never
    {
        self::log($exception, $context);

        throw $exception;
    }
}
```

## When to use ErrorLogHelper vs FileLogger

| Scenario | Use |
|----------|-----|
| Inside autoloader (`vendor/autoload.php`) | `ErrorLogHelper::log()` |
| Inside `Plugin::boot()` before FileLogger init | `ErrorLogHelper::logAndThrow()` |
| Inside route registration (FileLogger may fail) | `ErrorLogHelper::log()` as fallback |
| Inside any trait handler method | `$this->fileLogger->logException()` |
| Inside a static helper class | `ErrorLogHelper::log()` |
