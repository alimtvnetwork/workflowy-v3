# 7. Error Handling

> **Parent:** [00-overview.md](./00-overview.md)

## Code-Red Rules

> 🔴 **CODE RED — ZERO TOLERANCE: Never swallow an error.**
> An empty `catch {}`, a bare `return nil`, or an ignored result is an **automatic rejection**.
> Every error — without exception — must be **logged, returned, or rethrown**.
> Silent failures are the #1 cause of production incidents that take hours to debug.

1. **Never swallow an error.** Every error must be logged or returned to the caller. Empty `catch` blocks, bare `return nil` after an error check, and ignored `Result` values are all **Code Red violations**.
2. **Always include full context:** message, stack trace, source location.
3. **Go: Always capture stack trace** via `apperror.New()` / `apperror.Wrap()`. Without a stack trace, debugging is impossible.
4. **No `fmt.Errorf()`** in Go — use `apperror.Wrap()`.
5. **PHP: Catch `Throwable`**, not just `Exception`.
6. **Structured error responses:** message + stack trace + frames.
7. **Cache errors appropriately.** Failed lookups that are cached without error state cause **cascading silent failures** — always cache the error alongside the result or invalidate the cache entry on error.

```go
// ❌ CODE RED — Silent swallow (error disappears)
result, err := service.Process()
if err != nil {
    return nil
}

// ❌ CODE RED — No stack trace, useless in production
return fmt.Errorf("process failed: %w", err)

// ❌ CODE RED — errors.New has no stack trace
return errors.New("something failed")

// ✅ REQUIRED — Wrap at first contact with full stack trace
return apperror.Wrap(err, "E5001", "service.Process failed")
```

```typescript
// ❌ Silent catch — CODE RED
try { await fetchData(); } catch (e) { /* nothing */ }

// ✅ Always log or rethrow
try {
    await fetchData();
} catch (error) {
    logger.error("fetchData failed", { error, context: "UserService" });
    throw error;
}
```

## Go Stack Trace — The Wrap-Immediately Pattern

Every error from stdlib or third-party **must be wrapped immediately** into `apperror`. After wrapping, propagate as `AppError` — never re-wrap.

```go
// ✅ REQUIRED — Wrap stdlib error at first contact
func (s *PluginService) Upload(ctx context.Context, req UploadRequest) apperror.Result[UploadResult] {
    // Framework boundary — raw error, wrap immediately
    file, err := os.Open(req.Path)

    if err != nil {
        return apperror.FailWrap[UploadResult](err, "E4001", "failed to open plugin file")
    }

    defer file.Close()

    // Application boundary — already AppError, propagate via .AppError()
    meta := s.metaService.GetById(ctx, req.PluginId)

    if meta.HasError() {
        return apperror.Fail[UploadResult](meta.AppError())
    }

    return apperror.Ok(UploadResult{Plugin: meta.Value(), File: file})
}
```

**Stack trace gives you:**
- `err.FullString()` → code + message + full stack + cause chain
- `err.ToClipboard()` → markdown-formatted for AI paste
- `err.CallerLine()` → `"Upload.go:42"` compact reference

**Result pattern:** Always `apperror.Result[T]` — check `HasError()` before `.Value()`.
