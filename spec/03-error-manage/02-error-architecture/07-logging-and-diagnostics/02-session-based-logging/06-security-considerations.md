# 6. Security Considerations

> **Parent:** [Session-Based Logging overview](./00-overview.md)

## 6.1 Header Redaction

The following headers are automatically redacted:

- `Authorization`
- `Cookie`
- `X-API-Key`
- `X-Auth-Token`

## 6.2 Body Truncation

Request and response bodies are truncated at 50KB to prevent:

- Disk exhaustion from large payloads
- Memory pressure during capture
- Slow reads when listing sessions

## 6.3 Delegated Request Redaction

Delegated request bodies and responses are subject to the same truncation rules. Sensitive fields in delegated response bodies (e.g., `password`, `token`, `secret`) are redacted.

## 6.4 Retention

Sessions auto-expire after 7 days to:

- Limit disk usage
- Reduce exposure of sensitive data
- Keep queries performant
