# 4. API Specification

> **Parent:** [Session-Based Logging overview](./00-overview.md)

## 4.1 List Sessions

```
GET /api/v1/request-sessions
```

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| limit | int | 50 | Results per page (max 500) |
| offset | int | 0 | Pagination offset |
| method | string | - | Filter by HTTP method |
| path | string | - | Filter by path substring |
| status | int | - | Filter by status code |
| errorsOnly | bool | false | Only error sessions |

**Response:**

```json
{
  "success": true,
  "data": {
    "sessions": [...],
    "total": 150,
    "limit": 50,
    "offset": 0
  }
}
```

## 4.2 Get Session

```
GET /api/v1/request-sessions/{id}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "...",
    "method": "POST",
    "DelegatedRequest": { ... }
  }
}
```

## 4.3 Get Session Diagnostics

```
GET /api/v1/sessions/{id}/diagnostics
```

Aggregates data from long-running operation sessions:

**Response:**

```json
{
  "success": true,
  "data": {
    "request": {
      "url": "http://localhost:8080/api/v1/sites/1/snapshots/settings",
      "method": "GET",
      "headers": { "content-type": "application/json" },
      "body": {}
    },
    "response": {
      "RequestUrl": "https://demoat.attoproperty.com.au/...",
      "ResponseUrl": "https://demoat.attoproperty.com.au/...",
      "StatusCode": 403,
      "headers": { "content-type": "application/json" },
      "body": { "code": "rest_forbidden", "message": "..." }
    },
    "StackTrace": {
      "golang": [
        { "function": "handlers.init.handleSiteActionById.func63", "file": "handler_factory.go", "line": 107 },
        { "function": "api.NewServer.SessionLogging.func3.1", "file": "session_logging.go", "line": 107 }
      ],
      "php": [
        { "function": "dispatch", "class": "WP_REST_Server", "file": "class-wp-rest-server.php", "line": 1063 }
      ]
    },
    "PhpStackTraceLog": "raw stacktrace.txt content...",
    "DelegatedRequest": {
      "DelegatedEndpoint": "https://demoat.attoproperty.com.au/...",
      "method": "GET",
      "StatusCode": 403,
      "StackTrace": ["..."],
      "AdditionalMessages": "..."
    }
  }
}
```

## 4.4 Get Session Logs

```
GET /api/v1/sessions/{id}/logs
```

Returns the raw `session.log` content:

```json
{
  "success": true,
  "data": {
    "logs": "[2026-02-11 16:53:30] STAGE: INIT\n[2026-02-11 16:53:30] Fetching snapshot settings...\n..."
  }
}
```

## 4.5 Delete Session

```
DELETE /api/v1/request-sessions/{id}
```

## 4.6 Clear All Sessions

```
DELETE /api/v1/request-sessions
```

## 4.7 List Error Sessions

```
GET /api/v1/request-sessions/errors
```

Shorthand for `?errorsOnly=true`

## 4.8 Export Session

```
GET /api/v1/request-sessions/{id}/export
```

Returns session as downloadable JSON file.
