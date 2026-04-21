# 7. Implementation Files & Error Log Format

> **Parent:** [Session-Based Logging overview](./00-overview.md)

## 7.1 Implementation Files

| File | Purpose |
|------|---------|
| `backend/internal/api/middleware/session_logging.go` | Middleware implementation |
| `backend/internal/services/requestsession/store.go` | File-based storage |
| `backend/internal/api/handlers/request_session_handlers.go` | API handlers |
| `backend/internal/api/handlers/handler_factory.go` | Handler factory (delegated request capture) |
| `backend/internal/api/router.go` | Route registration |
| `backend/cmd/server/main.go` | Initialization |
| `backend/internal/apperror/respond.go` | `respondErrorWithSession` helper |

---

## 7.2 Error Log Format (`error.log.txt`)

When a session encounters an error, the backend writes a structured error log. This is the canonical format:

```
[2026-02-12 00:53:34] HTTP 500 GET FAILED
  Requested To: GET http://localhost:8080/api/v1/sites/1/snapshots/settings
  Duration: 4.1904552s
  Error Code: 500
  Error Message: [E3001] failed to fetch snapshot settings: get snapshot settings (GET https://demoat.attoproperty.com.au/wp-json/riseup-asia-uploader/v1/snapshots/settings): status 403
  Backend Error: [E3025] [E3001] failed to fetch snapshot settings: ...
  Go Backend Stack:
    D:/.../handler_factory.go:107 handlers.init.handleSiteActionById.func63
    D:/.../session_logging.go:107 api.NewServer.SessionLogging.func3.1
    D:/.../middleware.go:245 api.NewServer.Recovery.func2.1
    D:/.../middleware.go:66 api.NewServer.Logging.func1.1
    D:/.../middleware.go:45 middleware.CORS.func1
  Go Methods Stack:
    #0 handlers.init.handleSiteActionById.func63 at D:/.../handler_factory.go:107
    #1 api.NewServer.SessionLogging.func3.1 at D:/.../session_logging.go:107
    ...
  Delegated Server Info:
    Endpoint: "https://demoat.attoproperty.com.au/riseup-asia-uploader/v1/snapshots/settings"
    Method: "GET"
    Status: 403
    Stacktrace:
        WP_REST_Server::dispatch() at class-wp-rest-server.php:1063
        ...
    RequestBody:
        (empty)
    Additional Message:
        WordPress REST API returned 403 - check application password permissions
  Response Body:
    { "Status": { "IsSuccess": false, ... }, "Errors": { ... } }
```
