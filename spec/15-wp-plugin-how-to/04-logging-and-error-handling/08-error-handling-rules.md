# 4.8 Error Handling — Mandatory Rules

> **Parent:** [Phase 4 overview](./00-overview.md)

---

## Rule 1: Always catch Throwable

Every try-catch block catches `Throwable`, never `Exception`. This captures both standard exceptions and PHP fatal errors (TypeError, Error, etc.).

```php
try {
    // code
} catch (Throwable $e) {
    // handle
}
```

## Rule 2: Every catch block must log with stack trace

Every `error_log()` call inside a catch block that has access to `$e` **must** append the trace:

```php
error_log($context . ' ' . $e->getMessage() . "\n" . $e->getTraceAsString());
```

Logging only `$e->getMessage()` without the trace is a **critical defect**.

## Rule 3: Use ErrorLogHelper for native logging

When FileLogger is not available (autoloader, bootstrap), use the `ErrorLogHelper` static class:

| Method | Behaviour |
|--------|-----------|
| `ErrorLogHelper::log($e, 'Context:')` | Logs message + trace to `error_log()` |
| `ErrorLogHelper::logAndThrow($e, 'Context:')` | Logs and re-throws (return type `never`) |

## Rule 4: safeExecute wraps all endpoints

Every public REST handler method must be wrapped in `$this->safeExecute()`. Direct try-catch in endpoint handlers is not allowed — delegate to the ResponseTrait infrastructure.

## Rule 5: Stack trace frames are debug-mode gated

Error responses include structured stack trace frames **only when debug mode is enabled**. In production, the `Errors.Backend` field is omitted entirely to prevent information leakage.

## Rule 6: No error swallowed — Forbidden Patterns

The following patterns are **critical defects**. They MUST never appear in any plugin codebase.

```php
// ❌ NEVER: Empty catch — error is silently lost
catch (Throwable $e) {
}

// ❌ NEVER: Catch without logging — error is silently lost
catch (Throwable $e) {
    return false;
}

// ❌ NEVER: Log message without stack trace
catch (Throwable $e) {
    error_log($e->getMessage());  // Missing: "\n" . $e->getTraceAsString()
}

// ❌ NEVER: Catch Exception instead of Throwable
catch (Exception $e) {   // Misses TypeError, Error, ParseError
    // ...
}

// ❌ NEVER: Swallow error in boolean/null return without logging
catch (Throwable $e) {
    return null;
}

// ❌ NEVER: Generic error_log without context prefix
catch (Throwable $e) {
    error_log($e->getMessage() . "\n" . $e->getTraceAsString());
    // Missing: '[PluginName] Context:' prefix
}
```

## Correct patterns for every scenario

| Scenario | Pattern |
|----------|---------|
| REST endpoint handler | `$this->safeExecute(fn() => ..., 'endpoint-name')` |
| Non-endpoint method with FileLogger | `ErrorResponse::logAndReturn($this->fileLogger, $e, 'Context')` |
| Non-endpoint returning false | `ErrorResponse::logAndReturnFalse($this->fileLogger, $e, 'Context')` |
| Non-endpoint returning WP_Error | `ErrorResponse::logAndReturnWpError($this->fileLogger, $e, 'Context')` |
| Bootstrap / no FileLogger | `ErrorLogHelper::log($e, '[PluginName] Context:')` |
| Infrastructure (must re-throw) | `ErrorLogHelper::logAndThrow($e, '[PluginName] Context:')` |
