# 4. Centralized Safe-Cast Utility (`CastOrFail[T]`)

> **Parent:** [00-overview.md](./00-overview.md)

---

## 9. Centralized Safe-Cast Utility (`CastOrFail[T]`)

All casting/conversion operations **must** go through a centralized utility function that returns `*apperror.AppError` on failure. This ensures every failed cast is traceable, loggable, and propagatable — never silently swallowed.

**Error Code Mapping** (see Error Code Registry — GEN-600):

| Go Constant | Registry Code | Name | Emitted By |
|-------------|---------------|------|------------|
| `ECast001` | `GEN-600-01` | `CAST_TYPE_ASSERTION_FAILED` | `typecast.CastOrFail[T]()` |
| `ECast002` | `GEN-600-02` | `CAST_SLICE_ELEMENT_FAILED` | `typecast.CastSliceOrFail[T]()` |

### 9.1 Canonical Implementation

```go
// In pkg/typecast/cast.go

package typecast

import (
    "fmt"
    "runtime"

    "myapp/pkg/apperror"
)

// CastOrFail attempts a type assertion and returns an AppError on failure.
// The extra stack skip ensures the error points to the CALLER's call site,
// not to this utility function itself.
func CastOrFail[T any](value any) apperror.Result[T] {
    result, ok := value.(T)

    if !ok {
        var zero T

        return apperror.Fail[T](
            apperror.New(
                "ECast001",  // Registry: GEN-600-01 (CAST_TYPE_ASSERTION_FAILED)
                fmt.Sprintf(
                    "type assertion failed: expected %T, got %T",
                    zero,
                    value,
                ),
            ).WithSkip(1),  // Skip this frame — error points to caller
        )
    }

    return apperror.Ok(result)
}

// CastSliceOrFail casts []interface{} elements to []T.
func CastSliceOrFail[T any](slice []interface{}) apperror.Result[[]T] {
    out := make([]T, 0, len(slice))

    for i, item := range slice {
        result := CastOrFail[T](item)

        if result.HasError() {
            return apperror.Fail[[]T](
                result.AppError().
                    WithContext("SliceIndex", fmt.Sprintf("%d", i)).
                    WithSkip(1),
            )
        }

        out = append(out, result.Value())
    }

    return apperror.Ok(out)
}
```

### 9.2 Usage in Business Logic

```go
// ✅ CORRECT: Safe cast via utility — error is never swallowed
result := typecast.CastOrFail[[]SearchResult](resp.Results)

if result.HasError() {
    return apperror.Fail[MyOutput](result.AppError())
}

results := result.Value()
```

```go
// ✅ CORRECT: Slice casting with full error context
sliceResult := typecast.CastSliceOrFail[SearchResult](rawSlice)

if sliceResult.HasError() {
    return apperror.Fail[MyOutput](sliceResult.AppError())
}
```

### 9.3 Usage in Tests

```go
// ✅ CORRECT: Tests also use CastOrFail — never bare assertions
result := typecast.CastOrFail[[]interface{}](resp.Results)

if result.HasError() {
    t.Fatalf("cast failed: %s", result.AppError().Message)
}

results := result.Value()

if len(results) != 1 {
    t.Errorf("expected 1 result, got %d", len(results))
}
```

### 9.4 Stack Skip Requirement

When writing wrapper functions that call `CastOrFail` internally, each wrapper layer **must** add `.WithSkip(1)` so the reported error location points to the **original caller**, not the intermediate wrapper.

```go
// Wrapper adds +1 skip
func CastResponseField[T any](resp *Response, field string) apperror.Result[T] {
    raw, exists := resp.Fields[field]

    if !exists {
        return apperror.Fail[T](
            apperror.New("ECast002", fmt.Sprintf("field %q not found", field)).  // Registry: GEN-600-02 (CAST_SLICE_ELEMENT_FAILED)
                WithSkip(1),
        )
    }

    result := CastOrFail[T](raw)

    if result.HasError() {
        return apperror.Fail[T](
            result.AppError().
                WithContext("Field", field).
                WithSkip(1),  // +1 for this wrapper layer
        )
    }

    return result
}
```
