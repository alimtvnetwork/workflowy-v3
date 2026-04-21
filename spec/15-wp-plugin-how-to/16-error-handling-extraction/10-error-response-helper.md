# 16.10 ErrorResponse — Consolidated Error Return Helper

> **Parent:** [Phase 16 overview](./00-overview.md)

---

Non-endpoint catch blocks (helpers, services, traits that don't use `safeExecute`) need a consistent way to log + return an error value. The `ErrorResponse` class provides static methods for every return-type scenario.

## Location

`includes/ErrorHandling/ErrorResponse.php` — namespace `PluginName\ErrorHandling`.

## Full implementation pattern

```php
namespace PluginName\ErrorHandling;

use Throwable;
use WP_Error;
use WP_REST_Response;

use PluginName\Enums\HttpStatusType;
use PluginName\Helpers\ResultHelper;
use PluginName\Logging\FileLogger;

class ErrorResponse
{
    /** Log exception and return standardized error array. */
    public static function logAndReturn(
        FileLogger $logger,
        Throwable $e,
        string $context = '',
    ): array {
        $logger->logException($e, $context);

        return ResultHelper::errorFromException($e);
    }

    /** Log exception and return a WP_REST_Response error envelope. */
    public static function logAndReturnEnvelope(
        FileLogger $logger,
        Throwable $e,
        string $context = '',
        int $status = HttpStatusType::ServerError->value,
    ): WP_REST_Response {
        $logger->logException($e, $context);

        return new WP_REST_Response(
            ResultHelper::errorFromException($e),
            $status,
        );
    }

    /** Log exception and return a WP_Error object. */
    public static function logAndReturnWpError(
        FileLogger $logger,
        Throwable $e,
        string $context = '',
        string $code = 'InternalError',
        int $status = HttpStatusType::ServerError->value,
    ): WP_Error {
        $logger->logException($e, $context);

        return new WP_Error(
            $code,
            $e->getMessage(),
            ['status' => $status],
        );
    }

    /** Log exception and return false. */
    public static function logAndReturnFalse(
        FileLogger $logger,
        Throwable $e,
        string $context = '',
    ): false {
        $logger->logException($e, $context);

        return false;
    }
}
```

## When to use each method

| Method | Return type | Use case |
|--------|------------|----------|
| `logAndReturn()` | `array` | Internal service methods returning result arrays |
| `logAndReturnEnvelope()` | `WP_REST_Response` | Non-safeExecute REST responses (rare) |
| `logAndReturnWpError()` | `WP_Error` | WordPress hooks that expect WP_Error (e.g., `pre_update_option`) |
| `logAndReturnFalse()` | `false` | Boolean-return methods (e.g., `isValid()`, `canProceed()`) |

## Rules

1. **Every** non-endpoint catch block MUST use an `ErrorResponse` method — no bare `return false` after catch
2. The `$context` parameter should identify the method: `'MyService::processItem'`
3. `logAndReturn` always calls `$logger->logException()` which writes to all three log files (info, error, stacktrace)
4. For catch blocks where FileLogger is unavailable, use `ErrorLogHelper::log()` instead (see Phase 4, §4.11)
