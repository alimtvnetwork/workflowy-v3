# 6. Type Safety Violations

> **Parent:** [00-overview.md](./00-overview.md)

---

## Issue #18 — Go `interface{}` / `any` in Business Logic

**Scope:** Multiple Go service files  
**Root Cause:** Using type erasure (`map[string]any`, `interface{}`) instead of concrete structs.

**Before (❌):**
```go
func ProcessData(data interface{}) interface{} { ... }
func FetchResults() (any, error) { ... }
```

**After (✅):**
```go
func ProcessData(data PluginDetails) apperror.Result[PluginSummary] { ... }
func FetchResults[T any]() apperror.Result[T] { ... }
```

**Prevention:** Zero `any`/`interface{}` in exported APIs. Only permitted in SQL args, logger fields, and third-party library boundaries.

---

## Issue #19 — Go Raw `(T, error)` Returns from Services

**Scope:** All Go service methods  
**Root Cause:** Service methods returned raw tuples instead of typed result wrappers.

**Before (❌):**
```go
func (s *PluginService) GetById(ctx context.Context, id int64) (*Plugin, error) { ... }
```

**After (✅):**
```go
func (s *PluginService) GetById(ctx context.Context, id int64) apperror.Result[Plugin] { ... }
```

**Prevention:** All service methods must return `apperror.Result[T]`, `apperror.ResultSlice[T]`, or `apperror.ResultMap[K,V]`.
