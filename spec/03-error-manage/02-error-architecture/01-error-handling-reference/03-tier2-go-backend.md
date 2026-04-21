# 3. Tier 2 — Go Backend Error Handling

> **Parent:** [00-overview.md](./00-overview.md)

---

## `apperror` Package

All errors crossing service boundaries must use `apperror`:

```go
// Wrap existing errors with code and context
return apperror.Wrap(err, apperror.ErrSyncCheck, "failed to upload plugin").
    WithPluginContext(pluginId, pluginSlug).
    WithEndpoint(requestUrl)

// Create new errors
return apperror.New(
    apperror.ErrFileRead, "invalid plugin slug",
)
```

**Forbidden:** `fmt.Errorf` for errors leaving a service (no stack trace).

---

## DelegatedRequestServer Injection (NEW v2.0.0)

When the Go backend proxies a request to any downstream server and the request fails (status ≥ 400), it builds a `DelegatedRequestServer` object and injects it into the envelope's `Errors` block.

### Construction Flow

```go
// In the HTTP client wrapper (e.g., wordpress.(*Client).doRequest)
func (c *Client) doRequest(
	context stdctx.Context,
	method string,
	url string,
	body any,
) apperror.Result[*http.Response] {
    // ... execute request ...
    
    if resp.StatusCode >= 400 {
        // Build DelegatedRequestServer from the failed response
        delegated := &DelegatedRequestServer{
            DelegatedEndpoint:  url,
            Method:             method,
            StatusCode:         resp.StatusCode,
            RequestBody:        body,        // what we sent
            Response:           respBody,    // what they returned (parsed JSON)
            StackTrace:         extractStackTrace(respBody),  // from response if available
            AdditionalMessages: extractMessage(respBody),
        }
        
        // Attach to the request context for envelope builder to pick up
        context = stdctx.WithValue(context, delegatedServerKey, delegated)
        
        return resp, apperror.Wrap(err, apperror.ErrWpConnect, "delegated request failed").
            WithEndpoint(url).
            WithStatusCode(resp.StatusCode)
    }
}
```

### Envelope Builder Integration

```go
func (b *EnvelopeBuilder) BuildErrorResponse(context stdctx.Context, err error) *Response {
    resp := &Response{
        Status: Status{IsFailed: true, Code: getStatusCode(err), ...},
        Errors: &Errors{
            BackendMessage: err.Error(),
            Backend:        getGoStackTrace(err),
        },
    }

    b.injectDelegatedServer(context, resp)

    return resp
}

func (b *EnvelopeBuilder) injectDelegatedServer(context stdctx.Context, resp *Response) {
    delegated, ok := context.Value(delegatedServerKey).(*DelegatedRequestServer)

    if !ok {
        return
    }

    resp.Errors.DelegatedRequestServer = delegated

    // Populate legacy field for backward compatibility
    if len(delegated.StackTrace) > 0 {
        resp.Errors.DelegatedServiceErrorStack = delegated.StackTrace
    }
}
```

### Go Struct Definition

```go
type DelegatedRequestServer struct {
    DelegatedEndpoint  string
    Method             string
    StatusCode         int
    RequestBody        json.RawMessage `json:",omitempty"`
    Response           json.RawMessage `json:",omitempty"`
    StackTrace         []string        `json:",omitempty"`
    AdditionalMessages string          `json:",omitempty"`
}
```

### error.log.txt Format

When `DelegatedRequestServer` is present, the error log includes a `Delegated Server Info:` section:

```
[2026-02-12 00:53:34] HTTP 500 GET FAILED
  Requested To: GET http://localhost:8080/api/v1/sites/1/snapshots/settings
  Duration: 4.1904552s
  Error Code: 500
  Error Message: [E3001] failed to fetch snapshot settings...
  Backend Error: [E3025] [E3001] ...
  Go Backend Stack:
    handler_factory.go:107 handlers.init.handleSiteActionById.func63
    ...
  Delegated Server Info:
    Endpoint: "https://example.com/wp-json/riseup.../v1/snapshots/settings"
    Method: "GET"
    Status: 403
    Stacktrace:
        #0 riseup-asia-uploader.php(1098): FileLogger->error()
        #1 class-wp-hook.php(341): Plugin->enrichErrorResponse()
        ...
    RequestBody:
        (none — GET request)
    Additional Message:
        Endpoint 'snapshots' is not enabled in plugin settings.
  Response Body:
    { "Status": { ... }, "Errors": { ..., "DelegatedRequestServer": { ... } } }
```

---

## Remote PHP Error Injection (Legacy)

When a remote WordPress operation fails, the Go backend automatically:

1. Calls `fetchAndAttachRemotePHPErrors` on the target site
2. Retrieves the 10 most recent PHP errors from remote SQLite database
3. Retrieves `stacktrace.txt` content
4. Injects this data into Go session logs and the envelope's `Errors` block

> **Note:** `DelegatedRequestServer` (v2.0.0) supersedes the legacy `fetchAndAttachRemotePHPErrors` approach for inline error data. The legacy system remains for retrieving historical PHP errors not present in the immediate response.

---

## Error Log Deduplication

The backend uses MD5 hashing to suppress identical error log entries:

```
Hash = MD5(action + siteId + plugin + endpoint + statusCode + responseBody)
```

A "Clear Dedup Hashes" button in Settings resets the in-memory hash map.

---

## Redefined Log Format

Every failure log entry follows this structure:

1. **Site Request URL** — Full compiled endpoint on the target WordPress site
2. **Site Identification** — Site name and URL
3. **Backend Endpoint** — The Go endpoint hit by the frontend
4. **Delegated Request** — Method, delegated server endpoint, full JSON request body
5. **Delegated Response** — Status code and body
6. **Delegated Server Info** — Endpoint, method, status, stack trace, request body, additional messages (NEW v2.0.0)
7. **Error Summary** — Concise error description
8. **Guard Rail** — Blocks unauthorized direct mutations to `/wp/v2/plugins/*`

---

## Session-Based Logging

Every HTTP request gets a unique session ID. Full request/response data is captured:
- Headers (with Authorization redacted)
- Bodies (truncated at 50KB)
- Timing
- Error extraction for status ≥ 400
- DelegatedRequestServer data (if delegated request failed)

Storage: `backend/data/request-sessions/{date}/{hour}/{uuid}.json`
