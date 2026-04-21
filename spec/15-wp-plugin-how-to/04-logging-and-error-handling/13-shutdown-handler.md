# 4.13 Shutdown Handler (Fatal Errors)

> **Parent:** [Phase 4 overview](./00-overview.md)

---

Register a global shutdown handler to catch fatal errors that bypass try-catch:

1. Check `error_get_last()` for fatal error types
2. Log to a dedicated `fatal-errors.log` file (not through FileLogger, which may be compromised)
3. Include memory usage statistics (helps diagnose OOM kills)
4. Attempt JSON output if the response has not been sent

## Implementation pattern

```php
register_shutdown_function(function (): void {
    $lastError = error_get_last();
    $hasError = ($lastError !== null);

    if (!$hasError) {
        return;
    }

    $fatalTypes = [E_ERROR, E_CORE_ERROR, E_COMPILE_ERROR, E_PARSE];
    $isFatal = in_array($lastError['type'], $fatalTypes, true);

    if (!$isFatal) {
        return;
    }

    $memoryUsage = memory_get_peak_usage(true);
    $memoryMb = round($memoryUsage / 1048576, 2);

    $logEntry = sprintf(
        "[FATAL] %s in %s:%d | Memory: %sMB | %s\n",
        $lastError['message'],
        $lastError['file'],
        $lastError['line'],
        $memoryMb,
        DateHelper::nowLogDisplay(),
    );

    // Write directly to file — FileLogger may be compromised
    $logPath = PathHelper::getLogsDir() . '/fatal-errors.log';
    file_put_contents($logPath, $logEntry, FILE_APPEND | LOCK_EX);
});
```
