# 2. Tier 1 — Delegated Server Error Handling

> **Parent:** [00-overview.md](./00-overview.md)

> The delegated server can be **any downstream service** the Go backend proxies to — a WordPress/PHP plugin, a Node.js microservice, a Chrome extension, a Python API, etc. For the sake of example, this spec uses **PHP (WordPress plugin)** as the delegated language. When implementing in another language, follow that language's best practices for structured error responses, stack traces, and naming conventions.

---

## Safe Execution Pattern (PHP Example)

Every REST endpoint handler is wrapped in `safeExecute`:

```php
public function handleRequest(WP_REST_Request $request): WP_REST_Response {
    return $this->safeExecute(function() use ($request) {
        // Business logic

        return $this->envelope->success($result);
    });
}
```

The wrapper catches `Throwable` (not just `Exception`) to capture PHP 7+ Errors like missing classes.

---

## Structured Error Response

```json
{
  "message": "Class 'PDO' not found",
  "StackTrace": "#0 /path/file.php(42): PluginManager->connect()\n#1 {main}",
  "StackTraceFrames": [
    { "file": "/path/file.php", "line": 42, "function": "connect", "class": "PluginManager" }
  ]
}
```

---

## REST API Error Enrichment (PHP Example)

The plugin uses a `rest_post_dispatch` filter to inject metadata into all error responses. Other delegated languages should implement equivalent response enrichment using their framework's middleware or interceptor pattern.

```php
add_filter('rest_post_dispatch', function($response, $server, $request) {
    if ($response->is_error()) {
        $data = $response->get_data();
        $data['plugin_version'] = PluginConfigType::Version->value;
        $data['timestamp'] = gmdate('c');
        $data['log_hint'] = $this->getLogHint($response->get_status());
        $response->set_data($data);
    }

    return $response;
}, 10, 3);
```

This ensures the Go backend always receives structured metadata when a delegated request fails. **Any delegated language** should return equivalent structured JSON on failure.

---

## Logging Outputs

| File | Content | Depth |
|------|---------|-------|
| `error.txt` | Structured error entries with context metadata | Last N entries |
| `log.txt` | General diagnostic log | All operations |
| `stacktrace.txt` | Raw PHP backtraces (`debug_backtrace(0, 0)`) | Unlimited |
| `fatal-errors.log` | Fatal errors caught by shutdown handler | With memory usage |

---

## Global Shutdown Handler (PHP Example)

Use `ErrorChecker::isFatalError()` to centralize fatal error detection. `ErrorChecker` delegates to `ErrorTypeEnum::FATAL_TYPES` (see [PHP Enum Spec](../../../02-coding-guidelines/04-php/01-enums/00-overview.md) for full implementation). Other delegated languages should implement equivalent uncaught-exception handlers (e.g., Node.js `process.on('uncaughtException')`, Python `sys.excepthook`).

```php
register_shutdown_function(function() {
    $error = error_get_last();

    if (ErrorChecker::isFatalError($error)) {
        // Log to fatal-errors.log via PathHelper::getFatalErrorLog()
        // Include memory_get_peak_usage() for diagnostics
        // Send JSON response before process terminates (if REST_REQUEST)
    }

});
```

---

## Context Enrichment

Every `error()` and `logException()` call automatically captures:
- 6-frame backtrace
- HTTP method and endpoint
- User-agent and IP
- Memory usage
- Request body (truncated)
