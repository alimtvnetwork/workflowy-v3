# 16.3 Error Log Retrieval API

> **Parent:** [Phase 16 overview](./00-overview.md)

---

The plugin exposes two diagnostic endpoints for error management:

## Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `error-logs` | GET | Query PHP error log entries with configurable inclusion |
| `error-sessions` | GET | Query grouped error sessions |

## Configurable Settings

Error log retrieval is controlled by `OptionNameType::LogRetrieval` settings:

```php
$defaults = [
    'include_error_log'  => true,   // Include error.log content
    'include_full_log'   => false,  // Include info.log content
    'include_stacktrace' => true,   // Include stack trace data
    'max_lines'          => 200,    // Maximum log lines to return
];
```

## Resolution Order

Settings are resolved in this priority:

1. **Request parameters** — Query params override stored settings per-request
2. **Stored settings** — `OptionNameType::LogRetrieval` from `wp_options`
3. **Defaults** — Hardcoded fallbacks above

```php
private function resolveSettings(WP_REST_Request $request): array {
    $logSettings = get_option(OptionNameType::LogRetrieval->value, []);

    $resolved = [
        'include_error_log'  => isset($logSettings['include_error_log'])
            ? (bool) $logSettings['include_error_log'] : true,
        // ... repeat for each key
    ];

    // Per-request overrides
    foreach (['include_error_log', 'include_full_log', 'include_stacktrace'] as $key) {
        if ($request->get_param($key) !== null) {
            $resolved[$key] = (bool) $request->get_param($key);
        }
    }

    return $resolved;
}
```
