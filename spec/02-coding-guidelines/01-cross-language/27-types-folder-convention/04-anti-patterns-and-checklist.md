# Anti-Patterns & Summary Checklist

> **Parent:** [27-types-folder-convention overview](./00-overview.md)

---

## 5. Anti-Patterns

### ❌ Dumping All Types in One File

```go
// types/types.go — FORBIDDEN
type ContentType byte
type HttpMethod byte
type LogLevel byte
type SortDirection byte
type Environment byte
// ... 200 more lines
```

### ❌ Defining Types Inline Where Used

```go
// handlers/plugin.go — FORBIDDEN
type PluginStatus byte  // Should be in types/PluginStatus.go
```

### ❌ Using Raw Strings Instead of Type Enum

```go
// ❌ FORBIDDEN
req.Header.Set("Content-Type", "application/json")

// ✅ CORRECT
req.Header.Set("Content-Type", ContentTypeJson.String())
```

### ❌ Repeating Generic Specializations

```go
// ❌ FORBIDDEN — Result[bool] repeated 15 times across codebase
func Enable() apperror.Result[bool] { ... }
func Disable() apperror.Result[bool] { ... }
func Toggle() apperror.Result[bool] { ... }

// ✅ CORRECT — alias defined once
func Enable() apperror.BoolResult { ... }
func Disable() apperror.BoolResult { ... }
func Toggle() apperror.BoolResult { ... }
```

---

## 6. Summary Checklist

```
□ types/ folder exists at the language-idiomatic root: Go → `types/` next to `main.go`; TypeScript → `src/types/`; PHP → `src/Types/` (PSR-4 namespace `App\Types`); Rust → `src/types/mod.rs`
□ One type/enum/alias group per file — filename matches type name
□ Common enums defined: ContentType, HttpMethod, HttpStatus, Environment
□ Result[T] aliases created for any specialization used 3+ times
□ No raw string literals for content types, HTTP methods, or status codes
□ No inline type definitions in handler/service files
□ All enum files follow the language's naming convention (PascalCase.go, PascalCase.ts)
```

---

## Related

- [`03-common-type-definitions.md`](./03-common-type-definitions.md) — Common types
- [`00-overview.md`](./00-overview.md) — Parent overview

---

*Anti-patterns & checklist v3.2.0 — 2026-04-20*
