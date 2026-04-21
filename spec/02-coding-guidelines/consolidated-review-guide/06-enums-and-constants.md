# 6. Enums & Constants

> **Parent:** [00-overview.md](./00-overview.md)

- **Groups of related strings → Enum** (language-appropriate pattern).
- **Standalone values → Named constant.**
- **Never use magic strings or magic numbers.**
- **Exceptions:** `0`, `1`, `-1`, `""`, `true`, `false`, `null`/`nil`.

```go
// ❌ Magic string
if status == "active" { ... }

// ✅ Enum constant
if status.Is(StatusActive) { ... }
```

```typescript
// ❌ Magic number
if (retries > 3) { ... }

// ✅ Named constant
const MAX_RETRIES = 3;
if (retries > MAX_RETRIES) { ... }
```
