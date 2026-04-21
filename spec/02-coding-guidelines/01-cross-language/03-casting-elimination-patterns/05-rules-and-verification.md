# 5. Rules, Decision Matrix & Verification

> **Parent:** [00-overview.md](./00-overview.md)

---

## 10. Rule: Never Swallow Cast Errors

**Cast/conversion failures must NEVER be silently discarded.** Every cast operation must produce an `*apperror.AppError` on failure that is either:

1. **Returned** — propagated to the caller via `apperror.Result[T]`
2. **Logged** — recorded via the structured logger before any fallback

### ❌ Prohibited — Swallowed Cast Error

```go
// FORBIDDEN: comma-ok with blank identifier discards the failure signal
results, _ := resp.Results.([]interface{})

// FORBIDDEN: unchecked assertion — panics at runtime
results := resp.Results.([]interface{})
```

### ✅ Required — All Casts Through Utility

```go
result := typecast.CastOrFail[[]interface{}](resp.Results)

if result.HasError() {
    return apperror.Fail[MyOutput](result.AppError())
}

results := result.Value()
```

### Rule Summary

| Pattern | Verdict |
|---------|---------|
| `x.(T)` bare assertion | ❌ Panic risk — prohibited |
| `x, _ := val.(T)` blank discard | ❌ Swallowed error — prohibited |
| `x, ok := val.(T); if !ok { ... }` in business logic | ❌ §7.2 violation — use `CastOrFail` |
| `x, ok := val.(T)` inside `EXEMPTED` accessor | ✅ Allowed at boundary only |
| `typecast.CastOrFail[T](val)` | ✅ Canonical pattern |

---

## 11. Decision Matrix

| Scenario | Action |
|----------|--------|
| Cast in business logic | **Use `typecast.CastOrFail[T]`** |
| Cast in accessor/wrapper function | **Add `// EXEMPTED:` annotation + `.WithSkip(1)`** |
| Cast on external API response | **Prefer concrete struct; annotate if dynamic** |
| Cast in `sql.Scanner` / stdlib interface | **Annotate as stdlib boundary** |
| Cast on `error` type | **Use `errors.As()`** |
| `.(type)` switch on JSON-decoded data | **Annotate as decoder boundary** |
| Cast in tests | **Use `typecast.CastOrFail[T]` + `t.Fatalf` on error** |

---

## 12. Verification

Search for unannotated violations:

```bash
# Find all type assertions missing EXEMPTED annotation
grep -rn '\.\(string\)\|\.\(float64\)\|\.\(int\)\|\.\(\[\]' spec/ --include="*.md" \
  | grep -v 'EXEMPTED\|FORBIDDEN\|WRONG\|❌\|PROHIBITED'

# Find all .(type) switches missing annotation
grep -rn '\.\(type\)' spec/ --include="*.md" \
  | grep -v 'EXEMPTED\|FORBIDDEN\|WRONG\|❌'

# Find raw ctx.Value casts outside accessor functions
grep -rn 'ctx\.Value\|context\.Value' spec/ --include="*.md" \
  | grep '\.\(string\)' \
  | grep -v 'EXEMPTED\|ctxutil\|accessor'
```
