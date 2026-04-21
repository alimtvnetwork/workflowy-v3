# Rule P1 — Positive Boolean Naming

> **Parent:** [00-overview.md](./00-overview.md)

All boolean-returning functions and variables **must** use positive semantic names with `Is` or `Has` prefixes. Boolean fields, local variables, and struct properties follow the same rule — bare adjectives without `is`/`has` are **prohibited**.

```go
// ✅ Positive naming
func IsValid() bool
func HasPermission() bool
func IsActive() bool

// ✅ Variables and fields
isCacheEnabled := true
isForceRefresh := false

type Config struct {
    IsCacheEnabled bool
    IsForceRefresh bool
}

// ❌ Negative naming — PROHIBITED
func IsNotValid() bool
func HasNoPermission() bool
func IsDisabled() bool

// ❌ Missing is/has prefix — PROHIBITED
cacheEnabled := true     // → isCacheEnabled
forceRefresh := false    // → isForceRefresh

type Config struct {
    CacheEnabled bool     // → IsCacheEnabled
    ForceRefresh bool     // → IsForceRefresh
}
```

**Exception**: Enum variant checkers where the variant itself has a negative-sounding name are permitted (e.g., `IsNotFound()` for the `NotFound` variant, `IsUnknown()` for the `Unknown` variant).

## Related

- [02-negation-elimination.md](./02-negation-elimination.md) — Replacing `!` with named positives
- [07-summary-and-enforcement.md](./07-summary-and-enforcement.md) — Full naming table
