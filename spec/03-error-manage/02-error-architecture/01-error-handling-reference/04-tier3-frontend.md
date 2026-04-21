# 4. Tier 3 — Frontend Error Handling

> **Parent:** [00-overview.md](./00-overview.md)

---

## Error Store (`errorStore.ts`)

Centralized Zustand store that captures:

```typescript
interface CapturedError {
  // Identity
  id: string;
  code: string;
  level: 'error' | 'warn' | 'info';
  message: string;
  details?: string;
  createdAt: string;
  
  // API request context
  endpoint?: string;
  method?: string;
  requestBody?: unknown;
  responseStatus?: number;
  
  // Trigger context
  triggerComponent?: string;
  triggerAction?: string;
  invocationChain?: string[];
  
  // Session-based logging
  sessionId?: string;
  sessionType?: string;
  
  // Universal Envelope diagnostic fields
  requestedAt?: string;
  requestDelegatedAt?: string;
  envelopeErrors?: EnvelopeErrors;       // Contains DelegatedRequestServer (v2.0.0)
  envelopeMethodsStack?: EnvelopeMethodsStack;
  
  // Frontend diagnostics
  parsedFrames?: StackFrame[];
  uiClickPath?: ClickEvent[];
  executionLogs?: ExecutionLogEntry[];
  executionLogsFormatted?: string;
}

// EnvelopeErrors contains DelegatedRequestServer (NEW v2.0.0)
interface EnvelopeErrors {
  BackendMessage: string;
  DelegatedServiceErrorStack?: string[];  // Legacy delegated server stack lines
  Backend?: string[];
  Frontend?: string[];
  DelegatedRequestServer?: {              // NEW v2.0.0 — structured delegated error
    DelegatedEndpoint: string;
    Method: string;
    StatusCode: number;
    RequestBody?: unknown;
    Response?: unknown;
    StackTrace?: string[];
    AdditionalMessages?: string;
  };
}
```

> **Note:** `DelegatedRequestServer` is accessed via `error.envelopeErrors?.DelegatedRequestServer`, not as a top-level field on `CapturedError`. See `../04-error-modal/07-error-modal-reference-legacy.md` for the full interface.

---

## Envelope Parsing

The API client's `parseEnvelope` detects failed responses and extracts:
- `Errors.BackendMessage` — Primary error text
- `Errors.DelegatedServiceErrorStack` — Delegated server stack trace lines (legacy)
- `Errors.DelegatedRequestServer` — Full delegated server error details (NEW v2.0.0)
- `Errors.Backend` — Go stack trace lines
- `MethodsStack.Backend` — Go call chain with file:line
- `Attributes.SessionId` — Links to session-level diagnostics

---

## DelegatedRequestServer Frontend Extraction (NEW v2.0.0)

```typescript
// In parseEnvelope() or buildCapturedError()
if (envelope.Errors) {
  captured.envelopeErrors = {
    BackendMessage: envelope.Errors.BackendMessage,
    DelegatedServiceErrorStack: envelope.Errors.DelegatedServiceErrorStack,
    Backend: envelope.Errors.Backend,
    Frontend: envelope.Errors.Frontend,
    DelegatedRequestServer: envelope.Errors.DelegatedRequestServer,
  };
}
```

---

## Global Error Modal Tabs

| Tab | Content |
|-----|---------|
| **Overview** | Error message, component context, suggested fixes |
| **Log** | error.log.txt content |
| **Execution** | Go call chain table + session logs |
| **Stack** | Backend (Go) + Delegated Server stack traces + delegated language frames |
| **Session** | Session diagnostics: logs, request, response, stack trace |
| **Request** | HTTP request/response chain (3-hop: React → Go → Delegated) |
| **Traversal** | Endpoint flow + methods stack + delegated error stack |

---

## DelegatedRequestServer in Modal Tabs (NEW v2.0.0)

| Tab | What's Shown |
|-----|-------------|
| **Stack** | New "Delegated Server Stack" section (purple-themed) with StackTrace lines + Response JSON |
| **Request** | 3rd node in chain: Go → Delegated (with endpoint, method, status, request body, response) |
| **Traversal** | Endpoint flow extended to 3 hops; DelegatedRequestServer details below methods stack |
| **Overview** | AdditionalMessages shown as info banner below the error banner |

---

## Session Diagnostics Auto-Fetch

When `sessionId` is present, the modal automatically fetches session-level diagnostics from `GET /api/v1/sessions/{id}/diagnostics`, merging deep Go and delegated server stack traces into the Stack and Execution tabs.

---

## Error Reporting Bundle

The "Download Bundle" button exports:
- All diagnostic data as JSON
- Syntax-highlighted error report
- Execution chain and click path
- Full request/response data (including DelegatedRequestServer)
