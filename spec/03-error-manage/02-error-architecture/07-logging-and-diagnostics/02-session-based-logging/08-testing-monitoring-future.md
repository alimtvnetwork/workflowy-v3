# 8. Testing, Monitoring & Future Enhancements

> **Parent:** [Session-Based Logging overview](./00-overview.md)

## 8.1 Unit Tests

- Middleware captures all request fields
- Response writer wrapper works correctly
- Header redaction functions properly
- Body truncation at limit
- Error extraction from JSON response
- DelegatedRequestInfo is captured when proxying
- Session ID is attached to error envelope

## 8.2 Integration Tests

- Session persisted to disk
- Session retrievable via API
- Filters work correctly
- Pagination works correctly
- Cleanup runs on schedule
- Diagnostics endpoint aggregates delegated request data
- Session-error linkage via `Attributes.SessionId`

---

## 8.3 Metrics

- `request_sessions_total` — Total sessions created
- `request_sessions_errors` — Sessions with errors
- `request_sessions_duration_ms` — Capture overhead
- `request_sessions_disk_bytes` — Storage used
- `request_sessions_delegated_total` — Sessions with delegated requests

## 8.4 Alerts

- Disk usage > 1GB
- Error rate > 10%
- Capture overhead > 10ms

---

## 8.5 Future Enhancements

1. **Search** — Full-text search of request/response bodies
2. **Compression** — Gzip session files for storage efficiency
3. **Streaming** — Real-time session streaming via WebSocket
4. **Correlation** — Link related sessions (e.g., retry chains)
5. **Export** — Bulk export for external analysis
6. **Delegated Server Replay** — Re-execute delegated requests for debugging
