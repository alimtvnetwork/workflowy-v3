# 16.8 safeExecute Wrapper

> **Parent:** [Phase 16 overview](./00-overview.md)

---

All REST endpoint handlers MUST use the `safeExecute` wrapper to catch exceptions and return standardized error envelopes:

```php
public function handleErrorLogs(WP_REST_Request $request): WP_REST_Response {
    return $this->safeExecute(function() use ($request) {
        // ... handler logic
        return EnvelopeBuilder::success()
            ->autoDetectRequestedAt()
            ->setSingleResult($result)
            ->toResponse();
    }, 'error_logs');  // Context label for logging
}
```

## What safeExecute provides

| Feature | Detail |
|---------|--------|
| Exception catch | Wraps callback in try/catch, returns error envelope on failure |
| Context label | Second argument used in log messages for traceability |
| Debug gating | Stack traces included in response only when debug mode is ON |
| Consistent shape | All responses use `EnvelopeBuilder` regardless of success/failure |
