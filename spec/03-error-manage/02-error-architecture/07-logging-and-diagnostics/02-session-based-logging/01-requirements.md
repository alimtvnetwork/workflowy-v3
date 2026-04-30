# 1. Requirements

> **Parent:** [Session-Based Logging overview](./00-overview.md)

## 1.1 Functional Requirements

> All F1..F13 rows below are bound by gate **`G-LOG-SESSION-FNREQS`** (umbrella, CI; family=`logging-coverage`). Each row is a leaf assertion under that umbrella; rows with `SHOULD` priority are advisory leaves under the same umbrella.

| ID | Requirement | Priority |
|----|-------------|----------|
| F1 | Every API request must be assigned a unique session ID | MUST |
| F2 | Request headers, body, and metadata must be captured | MUST |
| F3 | Response status, body, and timing must be captured | MUST |
| F4 | Sensitive headers must be redacted before storage | MUST |
| F5 | Sessions must be retrievable via API | MUST |
| F6 | Sessions must be filterable by method, path, status | SHOULD |
| F7 | Error sessions must be easily identifiable | MUST (gate `G-LOG-SESSION-FNREQS`) |
| F8 | Sessions must auto-expire after retention period | SHOULD |
| F9 | Session logging must be toggleable via config | MUST (gate `G-LOG-SESSION-FNREQS`) |
| F10 | Health check endpoints must be excluded | MUST |
| F11 | Delegated request metadata must be captured when proxying | MUST |
| F12 | Session ID must be linkable to error envelope `Attributes.SessionId` | MUST |
| F13 | Delegated server stack traces must be captured in session | SHOULD |

> ↑ All F1..F13 rows above are leaves of gate **`G-LOG-SESSION-FNREQS`** (umbrella, CI; family=`logging-coverage`). `SHOULD`-priority rows are advisory leaves.

## 1.2 Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NF1 | Logging overhead | < 5ms per request |
| NF2 | Storage efficiency | < 10KB per session average |
| NF3 | Retention period | 7 days (configurable) |
| NF4 | Max body capture | 50KB per request/response |
