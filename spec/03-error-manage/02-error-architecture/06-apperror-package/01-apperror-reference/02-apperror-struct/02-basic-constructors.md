# AppError Basic Constructors

> **Parent:** [02-apperror-struct overview](./00-overview.md)  
> **Version:** 3.0.0  
> **Updated:** 2026-04-20

---

## 2.2 Constructors

Every constructor captures a stack trace automatically. **Three things are always required: cause (or nil), code, and message.**

```go
// New creates a new AppError with code + message. Stack captured at caller.
func New(code, message string) *AppError

// NewWithSkip creates a new AppError with explicit skip for stack capture.
func NewWithSkip(code, message string, skip int) *AppError

// Wrap wraps an existing error with code + message. Stack captured at caller.
// If cause is an *AppError, its stack is preserved in PreviousTrace.
func Wrap(cause error, code, message string) *AppError

// WrapWithSkip wraps with explicit skip for stack capture.
func WrapWithSkip(cause error, code, message string, skip int) *AppError

// NewType creates a new AppError from an apperrtype.Variation enum.
// Code, message, and name are pulled from the global variantRegistry.
func NewType(errType apperrtype.ErrorType) *AppError

// WrapType wraps an existing error using an apperrtype.Variation enum.
// Uses the registry's default message. cause's stack is preserved.
func WrapType(cause error, errType apperrtype.ErrorType) *AppError

// WrapTypeMsg wraps an existing error with a Variation enum + custom message.
// Overrides the registry's default message with the provided one.
func WrapTypeMsg(cause error, errType apperrtype.ErrorType, message string) *AppError
```

**`NewType` / `WrapType` / `WrapTypeMsg` examples:**

```go
// NewType — new error from enum (no cause)
return apperror.NewType(apperrtype.SiteNotFound)

// WrapType — wrap with enum's default message (2 args: cause + errType)
return apperror.WrapType(err, apperrtype.WPConnectionFailed).
    WithValue("url", siteURL)

// WrapTypeMsg — wrap with custom message (3 args: cause + errType + msg)
return apperror.WrapTypeMsg(err, apperrtype.WPConnectionFailed, "failed during health check").
    WithValue("url", siteURL).
    WithStatusCode(resp.StatusCode)
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`03-convenience-constructors.md`](./03-convenience-constructors.md) — Path/URL/Slug/Site/Endpoint shortcuts

---

*Basic constructors v3.0.0 — 2026-04-20*
