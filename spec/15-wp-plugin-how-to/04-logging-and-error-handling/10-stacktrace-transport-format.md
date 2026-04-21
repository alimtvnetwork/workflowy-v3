# 4.10 Structured Stack Trace Transport Format

> **Parent:** [Phase 4 overview](./00-overview.md)

---

When the Go backend or any REST consumer parses error responses, stack trace frames MUST use a structured array format — not just the raw string from `getTraceAsString()`. This enables structured display in error modals and log viewers.

## Frame Structure (PascalCase keys)

Each frame in the `StackTraceFrames` array contains:

```json
{
  "File": "/var/www/html/wp-content/plugins/my-plugin/includes/Traits/ActivateHandlerTrait.php",
  "FileBase": "ActivateHandlerTrait.php",
  "Line": 78,
  "Function": "executeActivation",
  "Class": "PluginName\\Traits\\Activate\\ActivateHandlerTrait"
}
```

| Field | Type | Source | Description |
|-------|------|--------|-------------|
| `File` | string | `$frame['file']` | Full absolute path |
| `FileBase` | string | `basename($frame['file'])` | Filename only — for compact display |
| `Line` | int | `$frame['line']` | Line number in source file |
| `Function` | string | `$frame['function']` | Method or function name |
| `Class` | string\|null | `$frame['class']` | Fully-qualified class name (null for global functions) |

## Debug mode ON — response with structured frames

```json
{
  "Status": {
    "IsSuccess": false,
    "IsFailed": true,
    "Code": 500,
    "Message": "Cannot connect to remote endpoint: Connection refused",
    "Timestamp": "2026-04-07T14:30:00Z"
  },
  "Attributes": {
    "RequestedAt": "/my-plugin-api/v1/activate",
    "TotalRecords": 0
  },
  "Results": [],
  "Errors": {
    "BackendMessage": "Cannot connect to remote endpoint: Connection refused",
    "ExceptionType": "RuntimeException",
    "Backend": [
      "#0 ActivateHandlerTrait.php(78): PluginName\\Traits\\Activate\\ActivateHandlerTrait->executeActivation()",
      "#1 ResponseTrait.php(35): PluginName\\Traits\\Core\\ResponseTrait->safeExecute()"
    ],
    "StackTraceFrames": [
      {
        "File": "/var/www/html/wp-content/plugins/my-plugin/includes/Traits/Activate/ActivateHandlerTrait.php",
        "FileBase": "ActivateHandlerTrait.php",
        "Line": 78,
        "Function": "executeActivation",
        "Class": "PluginName\\Traits\\Activate\\ActivateHandlerTrait"
      },
      {
        "File": "/var/www/html/wp-content/plugins/my-plugin/includes/Traits/Core/ResponseTrait.php",
        "FileBase": "ResponseTrait.php",
        "Line": 35,
        "Function": "safeExecute",
        "Class": "PluginName\\Traits\\Core\\ResponseTrait"
      }
    ]
  }
}
```

## Debug mode OFF — no Errors key at all

```json
{
  "Status": {
    "IsSuccess": false,
    "IsFailed": true,
    "Code": 500,
    "Message": "An internal error occurred",
    "Timestamp": "2026-04-07T14:30:00Z"
  },
  "Attributes": {
    "RequestedAt": "/my-plugin-api/v1/activate",
    "TotalRecords": 0
  },
  "Results": []
}
```

## Frame extraction implementation

```php
/**
 * Extract structured stack trace frames from an exception.
 *
 * @return array<int, array{File: string, FileBase: string, Line: int, Function: string, Class: string|null}>
 */
private function extractStructuredFrames(Throwable $e): array
{
    $trace = $e->getTrace();
    $frames = [];

    foreach ($trace as $frame) {
        $hasFile = isset($frame['file']);

        $frames[] = [
            'File'     => $hasFile ? $frame['file'] : '[internal]',
            'FileBase' => $hasFile ? basename($frame['file']) : '[internal]',
            'Line'     => $frame['line'] ?? 0,
            'Function' => $frame['function'] ?? '',
            'Class'    => $frame['class'] ?? null,
        ];
    }

    return $frames;
}
```

## Rules

1. `Errors.Backend` (string array) is ALWAYS included for backward compatibility when debug mode is ON
2. `Errors.StackTraceFrames` (object array) is the **preferred** format for structured consumers
3. Both fields are omitted entirely when debug mode is OFF
4. Frame extraction uses `$e->getTrace()` (structured), not `$e->getTraceAsString()` (string)
5. `FileBase` is always computed — never trust the consumer to parse paths
