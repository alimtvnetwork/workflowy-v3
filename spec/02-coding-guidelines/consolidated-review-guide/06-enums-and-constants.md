# 6. Enums & Constants

> **Parent:** [00-overview.md](./00-overview.md)

- **Groups of related strings → Enum** using the language's idiomatic pattern: Go = typed `string` const block + `Stringer`/`MarshalJSON`/`UnmarshalJSON` (per `spec/02-coding-guidelines/03-golang/01-enum-specification/`); TypeScript = `as const` literal-union (no `enum` keyword — see `spec/02-coding-guidelines/02-typescript/`); PHP = native `enum` (PHP 8.1+); Rust = `#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]` `enum`.
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
