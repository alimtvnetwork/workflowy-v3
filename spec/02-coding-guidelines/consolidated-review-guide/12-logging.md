# 12. Logging

> **Parent:** [00-overview.md](./00-overview.md)

- **Add logger calls generously** — at function entry, before/after external calls, on errors.
- Include context: function name, relevant IDs, operation being performed.
- Use structured logging (key-value pairs), not string concatenation.

```go
// ✅ Structured logging with context
logger.Info("processing order", "OrderId", order.OrderId, "UserId", order.UserId)
```
