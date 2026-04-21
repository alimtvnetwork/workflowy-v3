# 3. Data Model

> **Parent:** [Session-Based Logging overview](./00-overview.md)

## 3.1 RequestSession

```go
type RequestSession struct {
    // Identity
    Id string // UUID v4

    // Request Data
    Method         string
    Path           string
    QueryString    string            `json:",omitempty"`
    RequestHeaders map[string]string
    RequestBody    string            `json:",omitempty"`

    // Response Data
    ResponseStatus int
    ResponseBody   string `json:",omitempty"`

    // Timing
    StartTime  time.Time
    EndTime    time.Time
    DurationMs int64

    // Error (extracted from response if status >= 400)
    Error string `json:",omitempty"`

    // Delegated Request (v2.0.0) — captured when Go proxies to external service
    DelegatedRequest *DelegatedRequestInfo `json:",omitempty"`
}

// DelegatedRequestInfo captures the full context of a proxied request
// to an external service (WordPress PHP, Chrome extension, etc.)
type DelegatedRequestInfo struct {
    DelegatedEndpoint  string                            // Full URL of the delegated server endpoint
    Method             string                            // HTTP method used (GET, POST, etc.)
    StatusCode         int                               // HTTP status code from delegated server
    RequestBody        json.RawMessage `json:",omitempty"` // Request body sent to delegated server
    Response           json.RawMessage `json:",omitempty"` // Response body from delegated server
    StackTrace         []string        `json:",omitempty"` // Delegated server stack trace (if error)
    AdditionalMessages string          `json:",omitempty"` // Extra context/messages
    DurationMs         int64           `json:",omitempty"` // Time spent on delegated request
}
```

## 3.2 Storage Format — Standard Request Session

```json
{
  "Id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "Method": "GET",
  "Path": "http://localhost:8080/api/v1/sites/1/snapshots/settings",
  "RequestHeaders": {
    "content-type": "application/json",
    "authorization": "[REDACTED]"
  },
  "ResponseStatus": 500,
  "ResponseBody": "{\"Status\":{\"IsSuccess\":false,...}}",
  "StartTime": "2026-02-11T16:53:30.000Z",
  "EndTime": "2026-02-11T16:53:34.190Z",
  "DurationMs": 4190,
  "Error": "[E3001] failed to fetch snapshot settings",
  "DelegatedRequest": {
    "DelegatedEndpoint": "https://demoat.attoproperty.com.au/riseup-asia-uploader/v1/snapshots/settings",
    "Method": "GET",
    "StatusCode": 403,
    "Response": {
      "code": "rest_forbidden",
      "message": "Sorry, you are not allowed to do that.",
      "data": { "status": 403 }
    },
    "StackTrace": [
      "WP_REST_Server::dispatch() at /wp-includes/rest-api/class-wp-rest-server.php:1063",
      "WP_REST_Server::respond_to_request() at /wp-includes/rest-api/class-wp-rest-server.php:420"
    ],
    "AdditionalMessages": "WordPress REST API returned 403 - check application password permissions",
    "DurationMs": 3800
  }
}
```

## 3.3 Storage Format — Long-Running Operation Session

Long-running operations (publish, sync, remote plugin actions) use UUID-named folders:

```
data/sessions/{uuid}/
├── session.log          # Real-time execution log (streamed via WebSocket)
├── error.log            # Error-specific log entries
├── request.json         # Original request payload
└── response.json        # Final response (includes DelegatedRequestServer if applicable)
```

**response.json sample (with DelegatedRequestServer):**

```json
{
  "RequestUrl": "https://demoat.attoproperty.com.au/riseup-asia-uploader/v1/snapshots/settings",
  "ResponseUrl": "https://demoat.attoproperty.com.au/riseup-asia-uploader/v1/snapshots/settings",
  "StatusCode": 403,
  "Headers": {
    "content-type": "application/json; charset=UTF-8"
  },
  "Body": {
    "code": "rest_forbidden",
    "message": "Sorry, you are not allowed to do that."
  },
  "DelegatedRequest": {
    "DelegatedEndpoint": "https://demoat.attoproperty.com.au/riseup-asia-uploader/v1/snapshots/settings",
    "Method": "GET",
    "StatusCode": 403,
    "StackTrace": ["..."],
    "AdditionalMessages": "Permission denied"
  }
}
```

## 3.4 Session-Error Linkage

The `SessionId` field connects session logs to the error envelope:

```go
// In respondErrorWithSession helper:
func respondErrorWithSession(
	w http.ResponseWriter,
	r *http.Request,
	appErr *apperror.AppError,
) {
    sessionId := extractSessionId(appErr, r)
    envelope := buildErrorEnvelope(appErr)

    if sessionId != "" {
        envelope.Attributes.SessionId = sessionId
    }
    // ... write response
}

func extractSessionId(appErr *apperror.AppError, r *http.Request) string {
    if sid, ok := appErr.Context["SessionId"]; ok {
        return sid.(string)
    }

    if sid := r.Context().Value("SessionId"); sid != nil {
        return sid.(string)
    }

    return ""
}
```

**Frontend extraction:**

```typescript
// In the API response handler:
const sessionId = envelope?.Attributes?.SessionId;

if (sessionId) {
  capturedError.sessionId = sessionId;
}
```
