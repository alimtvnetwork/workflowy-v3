# AppError Display Methods

> **Parent:** [02-apperror-struct overview](./00-overview.md)  
> **Version:** 3.0.0  
> **Updated:** 2026-04-20

---

## 2.3 Display Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `Error()` | `string` | `"[CODE] message"` — implements `error` interface |
| `FullString()` | `string` | Code + message + details + values + diagnostics + stack + cause chain |
| `String()` | `string` | Alias for `FullString()` — complete error representation |
| `ToClipboard()` | `string` | Markdown-formatted error report for AI paste |

---

## 2.3.1 Variation Display Methods

The `Variation` enum itself carries display and introspection methods — no `AppError` instance required:

```go
v := apperrtype.SiteNotFound

v.String()               // "SiteNotFound (Code - 10) : site not found"
v.CodeTypeName()         // "(#10 - SiteNotFound)"
v.CodeTypeNameWithReferences("example.com", "wp-admin")
                         // "(#10 - SiteNotFound) example.com, wp-admin"
v.Name()                 // "SiteNotFound"
v.Code()                 // "E2010"
v.Message()              // "site not found"
v.IsValid()              // true
```

| Method | Returns | Description |
|--------|---------|-------------|
| `String()` | `string` | Delegates to `TypeNameCodeMessage()` — `"Name (Code - N) : Message"` |
| `CodeTypeName()` | `string` | `"(#N - Name)"` — compact numeric identifier |
| `CodeTypeNameWithReferences(refs...)` | `string` | `"(#N - Name) ref1, ref2"` — with context |
| `Name()` | `string` | PascalCase variant name |
| `Code()` | `string` | String error code (e.g. `"E2010"`) |
| `Message()` | `string` | Human-readable default message |
| `IsValid()` | `bool` | True if between `NoError` and `MaxError` |

---

## 2.3.2 VariantStructure Lookup

Use `Structure()` to retrieve the full metadata from the global registry:

```go
vs := apperrtype.SiteNotFound.Structure()
// vs.Name    → "SiteNotFound"
// vs.Code    → "E2010"
// vs.Message → "site not found"
// vs.Variant → apperrtype.SiteNotFound
```

`Structure()` returns a `VariantStructure` with all fields populated from `variantRegistry`. If the variant is unregistered, it returns a zero-value struct.

`VariantStructure` has its own display methods:

| Method | Returns | Description |
|--------|---------|-------------|
| `String()` | `string` | Alias for `TypeNameCodeMessage()` |
| `TypeNameCodeMessage()` | `string` | `"Name (Code - N) : Message"` |
| `CodeTypeName()` | `string` | `"(#N - Name)"` |
| `CodeTypeNameWithMessage(msg)` | `string` | `"(#N - Name) msg"` |

---

## 2.3.3 Direct Error Creation from VariantStructure

`VariantStructure` (not `Variation`) can create stdlib errors and panics directly:

```go
// .Error() — returns a stdlib error with "[Code] Message: detail" format
err := apperrtype.SiteNotFound.Structure().Error("domain example.com")
// err.Error() → "[e2010] site not found: domain example.com"

// .ErrorNoRefs() — returns a stdlib error with no additional context
err := apperrtype.SiteNotFound.Structure().ErrorNoRefs()
// err.Error() → "[e2010] site not found"

// .Panic() — panics with the formatted error (startup failures only)
apperrtype.ConfigFileMissing.Structure().Panic("required key: db_host")
```

| Method | Receiver | Returns | Description |
|--------|----------|---------|-------------|
| `Error(detail)` | `VariantStructure` | `error` | `errors.New("[code] message: detail")` (lowercased) |
| `ErrorNoRefs()` | `VariantStructure` | `error` | `errors.New("[code] message")` (lowercased) |
| `Panic(detail)` | `VariantStructure` | — | Panics with `Error(detail)` |

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`06-query-and-diagnostic-setters.md`](./06-query-and-diagnostic-setters.md) — Query methods & setters

---

*Display methods v3.0.0 — 2026-04-20*
