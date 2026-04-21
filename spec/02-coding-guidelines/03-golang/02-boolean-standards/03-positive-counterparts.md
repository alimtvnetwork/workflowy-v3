# Positive Counterparts, Enum Comparisons & Named Numerics

> **Parent:** [00-overview.md](./00-overview.md)

## 2.4 — Positive Counterpart Methods

When a type has an `IsX()` method and code frequently uses `!IsX()`, add a positive counterpart method:

```go
// pathutil package
func IsDirMissing(path string) bool { return !IsDir(path) }

// dbutil.Result[T]
func (r Result[T]) IsEmpty() bool { return !r.defined }  // already exists ✅
```

## 2.5 — Enum Comparisons

Use `IsOther(val)` or `IsInvalid()` instead of `!=` or `!IsValid()`:

```go
// ❌ Negated comparison
if !v.IsValid() {
    return variantLabels[Invalid]
}

// ✅ Positive counterpart
if v.IsInvalid() {
    return variantLabels[Invalid]
}
```

## 2.6 — Named Numeric Comparisons (Rule P5)

Raw numeric comparisons in `if` conditions are **prohibited** when they represent a domain concept. Extract to a named boolean that describes the intent.

```go
// ❌ FORBIDDEN — raw numeric comparison hides intent
if statusCode < 400 {
    return response
}

// ✅ REQUIRED — named boolean explains the domain meaning
isSuccessResponse := statusCode < 400

if isSuccessResponse {
    return response
}
```

```go
// ❌ FORBIDDEN — what does > 0 mean in this context?
if retryCount > 0 && isTransientError {
    retry()
}

// ✅ REQUIRED — name the intent
hasRetriesRemaining := retryCount > 0
isRetryable := hasRetriesRemaining && isTransientError

if isRetryable {
    retry()
}
```

**Exemptions:** Simple loop bounds (`i < len(items)`) and trivial guards (`if count == 0 { return }`) are exempt.

## Related

- [02-negation-elimination.md](./02-negation-elimination.md) — Rules P2, P3, P3b
- [04-mixed-polarity-and-inline.md](./04-mixed-polarity-and-inline.md) — Rules P6, P7
