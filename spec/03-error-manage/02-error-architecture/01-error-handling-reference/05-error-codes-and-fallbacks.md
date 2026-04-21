# 5. Error Codes & Fallbacks

> **Parent:** [00-overview.md](./00-overview.md)

---

## Error Code Ranges

| Range | Category | Example |
|-------|----------|---------|
| E1000–E1999 | Connection/network errors | E1001: Backend unreachable |
| E2000–E2999 | Remote site errors | E2001: Invalid credentials |
| E3000–E3999 | Resource/data errors | E3001: Failed to fetch resource |
| E4000–E4999 | Client/validation errors | E4001: Invalid plugin slug |
| E5000–E5999 | Server/infrastructure errors | E5001: Upload failed |
| E6000–E6999 | Remote site (WordPress) errors | E6001: Plugin not found on site |
| E7000–E7999 | Scheduler/background job errors | E7001: Scheduled publish timeout |
| E8000–E8999 | Delegated server errors | E8001: Delegated server returned 5xx |
| E9000–E9999 | Frontend/UI errors | E9003: Unhandled API error, E9005: HTML instead of JSON |

---

## Fallback Visibility

The Errors page implements a 3-tier fallback:

1. **Live Backend API** — Primary source
2. **Global Error Store** — Session-captured errors
3. **Error-level Notifications** — Local errors with Eye icon for modal access

---

## Cross-References

- [Error Resolution Retrospectives](../../01-error-resolution/03-retrospectives/)
- [Session-Based Logging](../07-logging-and-diagnostics/02-session-based-logging/00-overview.md)
- [React Execution Logger](../07-logging-and-diagnostics/01-react-execution-logger.md)
- [Error Modal Spec](../04-error-modal/07-error-modal-reference-legacy.md)
- [Copy Format Samples](../04-error-modal/01-copy-formats/00-overview.md)
- [Response Envelope Schema](../05-response-envelope/envelope.schema.json)
- [Envelope Configurability](../05-response-envelope/01-adr.md)
- [PHP Standards](../../../02-coding-guidelines/04-php/07-php-standards-reference/00-overview.md)
- [Golang Standards](../../../02-coding-guidelines/03-golang/04-golang-standards-reference/00-overview.md)

---

*Error handling specification v2.0.0 — updated: 2026-04-20*
