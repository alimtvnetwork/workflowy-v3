# 1. Error Flow Architecture

> **Parent:** [00-overview.md](./00-overview.md)

---

## Cross-Stack Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Frontend (React/TypeScript)                   │
│  ┌─────────────────┐    ┌──────────────────┐    ┌───────────────┐   │
│  │ API Client       │───▸│ Error Store       │───▸│ Global Error  │   │
│  │ (parseEnvelope)  │    │ (captureError)    │    │ Modal (tabs)  │   │
│  └─────────────────┘    └──────────────────┘    └───────────────┘   │
│         │                       │                                    │
│         │ Envelope.Errors       │ executionChain                    │
│         │ Envelope.MethodsStack │ clickPath                         │
│         │ Envelope.SessionId    │ componentContext                  │
│         │ Envelope.Errors       │                                    │
│         │  .DelegatedRequest    │                                    │
│         │   Server ◀────────── NEW (v2.0.0)                         │
└─────────────────────────────────────────────────────────────────────┘
                              ▲
                              │ Universal Response Envelope
┌─────────────────────────────────────────────────────────────────────┐
│                        Backend (Go)                                  │
│  ┌─────────────────┐    ┌──────────────────┐    ┌───────────────┐   │
│  │ apperror.Wrap() │───▸│ Session Logger    │───▸│ error.log.txt │   │
│  │ + .WithContext() │    │ (per-request ID)  │    │ (deduped)     │   │
│  └─────────────────┘    └──────────────────┘    └───────────────┘   │
│         │                       │                                    │
│         │ stack trace           │ buildDelegatedRequestServer()      │
│         │ error code            │ fetchAndAttachRemotePHPErrors      │
│         │                       │                                    │
│         │ ┌─────────────────────────────────────────────────────┐    │
│         │ │ DelegatedRequestServer Builder (NEW v2.0.0)         │    │
│         │ │  • Captures: endpoint, method, statusCode           │    │
│         │ │  • Captures: requestBody, response, stackTrace      │    │
│         │ │  • Injects into Envelope.Errors block               │    │
│         │ │  • Writes to error.log.txt "Delegated Server Info"  │    │
│         │ └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                              ▲
                              │ REST API (JSON) — any downstream server
┌─────────────────────────────────────────────────────────────────────┐
│              Delegated Server (PHP / Chrome Extension / Other)       │
│  ┌─────────────────┐    ┌──────────────────┐    ┌───────────────┐   │
│  │ safe_execute()  │───▸│ FileLogger        │───▸│ stacktrace.txt│   │
│  │ catch Throwable │    │ (6-frame backtrace)│   │ fatal-errors  │   │
│  │                 │    │                    │    │ error.txt     │   │
│  │ OR any 3rd-party│    │ OR structured     │    │               │   │
│  │ error format    │    │ error response     │    │               │   │
│  └─────────────────┘    └──────────────────┘    └───────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Request Chain (3-Hop)

```
  React Frontend          Go Backend           Delegated Server
       │                      │                      │
       │  GET /api/v1/sites   │                      │
       │  /1/snapshots/       │                      │
       │  settings            │                      │
       │─────────────────────▸│                      │
       │                      │  GET /wp-json/       │
       │                      │  riseup.../v1/       │
       │                      │  snapshots/settings  │
       │                      │─────────────────────▸│
       │                      │                      │
       │                      │  HTTP 403            │
       │                      │  { code, message,    │
       │                      │    stackTrace,       │
       │                      │    plugin_version }  │
       │                      │◀─────────────────────│
       │                      │                      │
       │                      │ Build envelope:      │
       │                      │ • Errors.Backend[]   │
       │                      │ • Errors.Delegated   │
       │                      │   RequestServer{}    │
       │                      │ • MethodsStack       │
       │                      │                      │
       │  HTTP 500            │                      │
       │  Universal Envelope  │                      │
       │◀─────────────────────│                      │
       │                      │                      │
       │ parseEnvelope()      │                      │
       │ captureError()       │                      │
       │ openErrorModal()     │                      │
```
