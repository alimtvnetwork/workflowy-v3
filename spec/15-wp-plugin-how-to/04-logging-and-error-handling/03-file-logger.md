# 4.3 FileLogger — Complete Specification

> **Parent:** [Phase 4 overview](./00-overview.md)

---

## Singleton access

```php
$logger = FileLogger::getInstance();
```

## Log files

The logger writes to three separate files, all under `wp-content/uploads/{plugin-slug}/logs/`:

| File | Contains | Written by |
|------|----------|-----------|
| `info.log` | All log entries (debug, info, warn, error) | Every log call |
| `error.log` | Only warn and error entries | `warn()` and `error()` calls |
| `stacktrace.log` | Full stack traces for errors | `logException()` and error-level calls |

## Public API — Full Signatures

```php
class FileLogger
{
    /**
     * Log a debug-level message. Only writes if debug mode is enabled.
     *
     * @param string               $message  Human-readable description
     * @param array<string, mixed> $context  Structured key-value context data
     */
    public function debug(string $message, array $context = []): void;

    /**
     * Log an informational message.
     *
     * @param string               $message  Human-readable description
     * @param array<string, mixed> $context  Key-value pairs (e.g., ['version' => '2.31.0', 'timeMs' => 1.23])
     */
    public function info(string $message, array $context = []): void;

    /**
     * Log a warning. Writes to both info.log and error.log.
     * Also writes a stack trace entry for diagnostic context.
     *
     * @param string               $message  Warning description
     * @param array<string, mixed> $context  Key-value pairs with diagnostic data
     */
    public function warn(string $message, array $context = []): void;

    /**
     * Log an error. Writes to info.log, error.log, and stacktrace.log.
     *
     * @param string               $message  Error description
     * @param array<string, mixed> $context  Key-value pairs (e.g., ['endpoint' => '/status', 'userId' => 1])
     */
    public function error(string $message, array $context = []): void;

    /**
     * Log an exception with full stack trace extraction.
     *
     * @param Throwable            $exception  The caught exception
     * @param string               $context    Human-readable context string (e.g., 'Route registration')
     */
    public function logException(Throwable $exception, string $context = ''): void;

    /**
     * Log a critical exception and re-throw it. Return type is `never`.
     * Use in infrastructure code where silent failure causes cascading breakage.
     *
     * @param Throwable $exception  The caught exception
     * @param string    $context    Human-readable context string
     *
     * @throws Throwable Always re-throws the original exception
     */
    public function logCriticalException(Throwable $exception, string $context = ''): never;
}
```

## Method behaviour matrix

| Method | Level | Writes to info.log | Writes to error.log | Writes stacktrace | Dedup enabled | Skipped in non-debug |
|--------|-------|--------------------|---------------------|--------------------|---------------|---------------------|
| `debug()` | Debug | Yes (if debug) | No | No | Yes (persistent) | ✅ Yes |
| `info()` | Info | Yes | No | No | Yes (persistent) | No |
| `warn()` | Warn | Yes | Yes | Yes | No | No |
| `error()` | Error | Yes | Yes | Yes | No | No |
| `logException()` | Error | Yes | Yes | Yes (from exception) | No | No |
| `logCriticalException()` | Error | Yes | Yes | Yes | No — re-throws | No |
