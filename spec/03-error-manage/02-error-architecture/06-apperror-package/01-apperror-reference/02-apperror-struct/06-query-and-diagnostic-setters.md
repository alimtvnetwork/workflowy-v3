# AppError Query Methods & Diagnostic Setters

> **Parent:** [02-apperror-struct overview](./00-overview.md)  
> **Version:** 3.0.0  
> **Updated:** 2026-04-20

---

## 2.4 Values — Variable Injection

Anytime an error occurs while working with a variable (path, ID, name, URL), that variable **must** be injected into the error's `Values` map so no context is lost.

```go
// WithValue adds a single key-value pair.
func (e *AppError) WithValue(key, value string) *AppError

// WithValues merges multiple key-value pairs.
func (e *AppError) WithValues(values map[string]string) *AppError
```

**Usage:**
```go
return apperror.Wrap(err, ErrFSRead, "failed to read plugin file").
    WithValue("path", filePath).
    WithValue("plugin", pluginSlug)
```

The `Values` map is included in `FullString()`, `String()`, and `ToClipboard()` output, compiling into a readable error message.

---

## 2.5 Flow Control Methods

```go
// Panic logs the full error and panics with the formatted message.
// Use ONLY for unrecoverable initialization failures.
func (e *AppError) Panic(message string)

// Throw panics with the AppError itself (recoverable via recover).
// The AppError can be extracted from the panic value.
func (e *AppError) Throw()
```

**Rules:**
- `Panic()` is reserved for startup/initialization failures only
- `Throw()` enables structured panic/recover patterns where the `AppError` is preserved
- Neither should be used in request handlers — return errors instead

---

## 2.6 Query Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `Unwrap()` | `error` | Returns cause for `errors.Is/As` |
| `Is(target)` | `bool` | True if error codes match |
| `HasCause()` | `bool` | True if a wrapped cause exists |
| `HasValues()` | `bool` | True if Values map is populated |
| `HasDiagnostic()` | `bool` | True if any diagnostic field is set |

---

## 2.7 Diagnostic Setters (Fluent)

All typed diagnostic setters return `*AppError` for chaining:

```go
err.WithPath(p string)
err.WithFile(f string)
err.WithFilePath(p string)
err.WithUrl(u string)
err.WithSlug(s string)
err.WithSiteId(id int64)
err.WithPluginId(id int64)
err.WithStatusCode(code int)
err.WithMethod(m string)
err.WithEndpoint(ep string)
err.WithUsername(u string)
// ... etc (see error_diagnostic.go for full list)
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`05-display-methods.md`](./05-display-methods.md) — Display methods

---

*Query & diagnostic setters v3.0.0 — 2026-04-20*
