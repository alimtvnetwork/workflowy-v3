# 1. Context Values & Error Types

> **Parent:** [00-overview.md](./00-overview.md)

---

## 3. Context Values

### ❌ Prohibited — Raw `ctx.Value` Cast in Business Logic

```go
func HandleRequest(ctx context.Context) {
    userId := ctx.Value("user_id").(string)  // §7.2 violation
    // ...
}
```

### ✅ Required — Typed Accessor Function

```go
// In pkg/ctxutil/context.go

type contextKey string

const userIdKey contextKey = "UserId"

func WithUserId(ctx context.Context, userId string) context.Context {
    return context.WithValue(ctx, userIdKey, userId)
}

// EXEMPTED: typed context accessor internal — this IS the centralized cast location (§7.2)
func GetUserId(ctx context.Context) string {
    if v := ctx.Value(userIdKey); v != nil {
        return v.(string)
    }

    return ""
}
```

### ✅ Business Logic Consumption

```go
func HandleRequest(ctx context.Context) {
    userId := ctxutil.GetUserId(ctx)  // No cast visible
    // ...
}
```

---

## 4. Error Types

### ❌ Prohibited — Raw Type Assertion

```go
if appErr, ok := err.(*apperror.AppError); ok {
    log.Error("failed", "Code", appErr.Code)
}
```

### ✅ Required — `errors.As()` Pattern

```go
var appErr *apperror.AppError

if errors.As(err, &appErr) {
    log.Error("failed", "Code", appErr.Code)
}
```

### ✅ Required — Helper Functions for Common Checks

```go
// In pkg/apperror/helpers.go

func IsRetryable(err error) bool {
    var appErr *AppError

    if !errors.As(err, &appErr) {
        return false
    }

    return appErr.Retryable
}

func GetExitCode(err error) int {
    var appErr *AppError

    if !errors.As(err, &appErr) {
        return 1
    }

    return appErr.ExitCode
}
```

### ✅ Stdlib Boundary — Exempt with Annotation

```go
// EXEMPTED: stdlib boundary — exec.ExitError (§7.2)
var exitErr *exec.ExitError

if errors.As(err, &exitErr) {
    return exitErr.ExitCode()
}
```
