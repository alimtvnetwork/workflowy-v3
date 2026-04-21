# 4.11 API Error Response Format — Additional Examples

> **Parent:** [Phase 4 overview](./00-overview.md)

---

## Debug mode ON — full details

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
      "#1 ResponseTrait.php(35): PluginName\\Traits\\Core\\ResponseTrait->PluginName\\Traits\\Core\\{closure}()",
      "#2 ResponseTrait.php(42): PluginName\\Traits\\Core\\ResponseTrait->safeExecute()",
      "#3 WP_REST_Server.php(1181): WP_REST_Server->dispatch()",
      "#4 rest-api.php(407): rest_do_request()"
    ]
  }
}
```

## Debug mode OFF — safe for production

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

Note: No `Errors` key at all in production. The error is fully logged server-side (both Tier 1 and Tier 2), but the API consumer only sees a generic message. This prevents:
- Exposing internal file paths
- Leaking class/method names
- Revealing PHP version or WordPress internals

## 400-level errors — always include message (not sensitive)

Validation errors (400, 401, 403, 404) always include a descriptive message regardless of debug mode, because they contain no internal implementation details:

```json
{
  "Status": {
    "IsSuccess": false,
    "IsFailed": true,
    "Code": 400,
    "Message": "Missing required field: plugin_slug",
    "Timestamp": "2026-04-07T14:30:00Z"
  },
  "Attributes": {
    "RequestedAt": "/my-plugin-api/v1/activate",
    "TotalRecords": 0
  },
  "Results": []
}
```
