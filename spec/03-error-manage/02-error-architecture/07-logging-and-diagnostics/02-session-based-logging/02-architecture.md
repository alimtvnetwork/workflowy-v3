# 2. Architecture

> **Parent:** [Session-Based Logging overview](./00-overview.md)

## 2.1 Component Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        HTTP Request                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Session Logging Middleware                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ Generate ID │──│ Capture Req │──│ Wrap ResponseWriter     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Request Handler                             │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  If delegated request → Capture DelegatedRequestServer   │    │
│  │  (endpoint, method, status, stacktrace, request body,    │    │
│  │   response body, additional messages)                    │    │
│  └──────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Session Logging Middleware                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ Capture Response│──│ Extract Errors  │──│ Save to Store   │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Request Session Store                         │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ data/request-sessions/{date}/{hour}/{uuid}.json             ││
│  └─────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Long-running: data/sessions/{uuid}/                         ││
│  │   session.log | error.log | request.json | response.json    ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

## 2.2 3-Hop Request Chain

```
┌──────────┐     ┌──────────────┐     ┌─────────────────────────┐
│  React   │────▶│  Go Backend  │────▶│  Delegated Server       │
│ Frontend │     │  (Session    │     │  (WordPress PHP /       │
│          │◀────│   Middleware) │◀────│   Chrome Extension /    │
│          │     │              │     │   3rd-party API)        │
└──────────┘     └──────────────┘     └─────────────────────────┘
     ①                  ②                       ③
  Frontend          Go Session              Delegated
  Error Store       Logs + Error            Request Server
  (sessionId)       Log + Envelope          (captured in
                    + DelegatedReq          response.json)
```

**Session-Error Linkage Flow:**
1. Go middleware creates session UUID → stored in `context.Value("SessionId")`
2. Handler proxies to delegated server → captures `DelegatedRequestServer` data
3. On error (status ≥ 400): `respondErrorWithSession` extracts `sessionId` from `apperror.AppError.Context` and attaches it to the envelope response as `Attributes.SessionId`
4. Frontend receives envelope → extracts `Attributes.SessionId` → stores in `CapturedError.sessionId`
5. Error modal auto-fetches diagnostics via `GET /api/v1/sessions/{id}/diagnostics`

## 2.3 Data Flow

1. **Request Arrives** → Middleware intercepts
2. **Generate Session** → UUID created, stored in context
3. **Capture Request** → Headers (redacted), body (truncated), metadata
4. **Execute Handler** → Normal request processing
5. **Delegated Request** → If handler proxies to external service, capture `DelegatedRequestServer` block
6. **Capture Response** → Status, body (truncated), timing
7. **Extract Errors** → Parse error message if status >= 400
8. **Persist Session** → Write JSON to file store
