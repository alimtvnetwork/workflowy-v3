# 5.2–5.3 Response Envelope & EnvelopeBuilder

> **Parent:** [00-overview.md](./00-overview.md)

## 5.2 The Standard API Format

Every REST endpoint returns responses in this exact envelope structure:

```json
{
  "Status": {
    "IsSuccess": true,
    "IsFailed": false,
    "Code": 200,
    "Message": "OK",
    "Timestamp": "2026-04-07T14:30:00Z"
  },
  "Attributes": {
    "RequestedAt": "/api-namespace/v1/endpoint",
    "TotalRecords": 1
  },
  "Results": [
    { "key": "value" }
  ]
}
```

### Error envelope — Debug mode ON (stack trace included)

```json
{
  "Status": { "IsSuccess": false, "IsFailed": true, "Code": 500, "Message": "Connection refused", "Timestamp": "2026-04-07T14:30:00Z" },
  "Attributes": { "RequestedAt": "/my-plugin-api/v1/activate", "TotalRecords": 0 },
  "Results": [],
  "Errors": {
    "BackendMessage": "Connection refused",
    "ExceptionType": "RuntimeException",
    "Backend": [
      "#0 ActivateHandlerTrait.php(78): PluginName\\Traits\\Activate\\ActivateHandlerTrait->executeActivation()",
      "#1 ResponseTrait.php(35): PluginName\\Traits\\Core\\ResponseTrait->safeExecute()",
      "#2 WP_REST_Server.php(1181): WP_REST_Server->dispatch()"
    ]
  }
}
```

### Error envelope — Debug mode OFF (production-safe)

```json
{
  "Status": { "IsSuccess": false, "IsFailed": true, "Code": 500, "Message": "An internal error occurred", "Timestamp": "2026-04-07T14:30:00Z" },
  "Attributes": { "RequestedAt": "/my-plugin-api/v1/activate", "TotalRecords": 0 },
  "Results": []
}
```

> **Note:** The `Errors` key is completely omitted in production to prevent leaking internal file paths, class names, or PHP version details. See Phase 4, §4.10 for full examples.

### Envelope rules

| Rule | Detail |
|------|--------|
| `IsSuccess` and `IsFailed` are always both present | They are logical inverses |
| `Timestamp` is always UTC ISO 8601 | From `DateHelper::nowUtc()` |
| `Results` is always an array | Even for single results, wrap in array |
| `Errors` key only present on failure **and** debug mode | Never include in production or on success |
| All keys are PascalCase | Defined in `ResponseKeyType` enum |
| 400-level errors always include descriptive message | Validation errors are not sensitive — always show real message |
| 500-level errors are gated by debug mode | Generic message in production, real message in debug |

---

## 5.3 EnvelopeBuilder — Fluent API

The EnvelopeBuilder uses the builder pattern with static factory methods.

### Success flow

```
EnvelopeBuilder::success('OK', 200)
    ->setRequestedAt('/namespace/v1/endpoint')
    ->setSingleResult(['key' => 'value'])
    ->toResponse();
```

### Error flow — with debug-mode gating

```
// The builder handles debug-mode gating internally
EnvelopeBuilder::error('Something failed', 500, $exception)
    ->setRequestedAt('/namespace/v1/endpoint')
    ->toResponse();
// If debug mode ON:  includes Errors.Backend with trace frames
// If debug mode OFF: omits Errors entirely, uses generic message for 500s
```

### Full method signatures

```
class EnvelopeBuilder
{
    /**
     * Create a success envelope.
     *
     * @param string $message  Status message (e.g., 'OK', 'Plugin activated')
     * @param int    $code     HTTP status code (200, 201, etc.)
     *
     * @return self Fluent builder instance
     */
    public static function success(string $message, int $code = 200): self;

    /**
     * Create an error envelope. Automatically gates stack trace by debug mode.
     *
     * @param string         $message    Error message (used as-is in debug, genericised in production for 5xx)
     * @param int            $code       HTTP status code (400, 401, 403, 404, 500)
     * @param Throwable|null $exception  Optional exception for stack trace extraction
     *
     * @return self Fluent builder instance
     */
    public static function error(string $message, int $code, ?Throwable $exception = null): self;

    /**
     * Set the requested endpoint path in Attributes.
     *
     * @param string $path  The REST route path (e.g., '/my-plugin-api/v1/status')
     *
     * @return self
     */
    public function setRequestedAt(string $path): self;

    /**
     * Wrap a single associative array in Results: [$item].
     *
     * @param array<string, mixed> $item  The single result item
     *
     * @return self
     */
    public function setSingleResult(array $item): self;

    /**
     * Set Results to the provided array directly (for list endpoints).
     *
     * @param array<int, array<string, mixed>> $items  The result items
     *
     * @return self
     */
    public function setListResult(array $items): self;

    /**
     * Manually set stack trace frames (used by safeExecute).
     * Only included in the response if debug mode is enabled.
     *
     * @param array<int, string> $frames  Formatted trace lines
     *
     * @return self
     */
    public function setStackTrace(array $frames): self;

    /**
     * Build and return the final WP_REST_Response.
     *
     * @return WP_REST_Response
     */
    public function toResponse(): WP_REST_Response;
}
```

### Fallback safety

If `EnvelopeBuilder` cannot be loaded (autoloader failure), `ResponseTrait` has an inline fallback that builds the same envelope structure manually. This ensures the plugin never returns a bare PHP error.

## Related

- [06-integration-checklist.md](./06-integration-checklist.md) — Adding a new endpoint
- [08-security-and-summary.md](./08-security-and-summary.md) — Complete request flow
