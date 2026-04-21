# 4.9 safeExecute() — Complete Specification

> **Parent:** [Phase 4 overview](./00-overview.md)

---

This is the most critical error-handling function in the plugin. It is defined in `ResponseTrait` and serves as the universal error boundary for all REST endpoints.

## Full implementation pattern

```php
/**
 * Execute a callback with comprehensive error handling.
 *
 * @param callable $callback     The business logic to execute (must return WP_REST_Response)
 * @param string   $endpointName A human-readable name for logging (e.g., 'activate-plugin')
 *
 * @return WP_REST_Response Always returns a valid response, even on failure
 */
protected function safeExecute(
    callable $callback,
    string $endpointName,
): WP_REST_Response {
    try {
        return $callback();
    } catch (Throwable $e) {
        // Tier 1: Always log to PHP error_log (available even if FileLogger fails)
        error_log(
            "[{$this->getPluginSlug()}] safeExecute error in '{$endpointName}': "
            . $e->getMessage() . "\n"
            . $e->getTraceAsString()
        );

        // Tier 2: Log via FileLogger if available
        $hasLogger = ($this->fileLogger !== null);

        if ($hasLogger) {
            $this->fileLogger->logException($e, "safeExecute:{$endpointName}");
        }

        // Build error response with debug-mode gating
        return $this->buildErrorResponse($e, $endpointName);
    }
}
```

## buildErrorResponse — Debug-Mode Gating

```php
/**
 * Build an error response with stack trace conditionally included.
 *
 * @param Throwable $e            The caught exception
 * @param string    $endpointName The endpoint name for context
 *
 * @return WP_REST_Response Formatted error envelope
 */
private function buildErrorResponse(
    Throwable $e,
    string $endpointName,
): WP_REST_Response {
    $isDebug = PluginConfigType::isDebugMode();

    // In debug mode: real message + stack trace
    // In production: generic message, no trace
    $errorMessage = $isDebug
        ? $e->getMessage()
        : 'An internal error occurred';

    $builder = EnvelopeBuilder::error($errorMessage, 500);

    if ($isDebug) {
        $builder->setStackTrace($this->formatStackFrames($e));
    }

    return $builder
        ->setRequestedAt($endpointName)
        ->toResponse();
}
```

## formatStackFrames — Structured Trace Extraction

```php
/**
 * Extract structured stack trace frames from an exception.
 *
 * @param Throwable $e The exception to extract frames from
 *
 * @return array<int, string> Formatted trace lines
 */
private function formatStackFrames(Throwable $e): array
{
    $rawTrace = $e->getTraceAsString();
    $lines = explode("\n", $rawTrace);
    $frames = [];

    foreach ($lines as $line) {
        $trimmedLine = trim($line);
        $hasContent = ($trimmedLine !== '');

        if ($hasContent) {
            $frames[] = $trimmedLine;
        }
    }

    return $frames;
}
```
