# Health Check Implementation

> **Parent:** [00-overview.md](./00-overview.md)

## Correct Health Endpoint

```go
func (h *Handler) Health(w http.ResponseWriter, r *http.Request) {
    // Check database connection
    if err := h.db.Ping(); err != nil {
        respondError(w, http.StatusServiceUnavailable, 5001, "Database unavailable", err)

        return
    }

    // HealthStatus is a typed response for the health endpoint.
    type HealthStatus struct {
        Status    string `json:"status"`
        Timestamp string `json:"timestamp"`
        Version   string `json:"version"`
    }

    respondSuccess(w, HealthStatus{
        Status:    "ok",
        Timestamp: time.Now().UTC().Format(time.RFC3339),
        Version:   h.version,
    })
}
```

## Health Check Verification

```bash
# Test health endpoint
curl -s http://localhost:8080/api/v1/health | jq .

# Expected response:
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2026-02-04T12:00:00Z",
    "version": "1.0.0"
  }
}
```

## Related

- [03-error-handling.md](./03-error-handling.md) — `respondSuccess`/`respondError` helpers
- [06-common-issues.md](./06-common-issues.md) — Connection refused diagnosis
