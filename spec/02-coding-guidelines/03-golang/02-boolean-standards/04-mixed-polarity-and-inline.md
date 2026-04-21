# Rules P6, P7 — Mixed Polarity & Inline `if` Statements

> **Parent:** [00-overview.md](./00-overview.md)

## 2.7 — No Mixed-Polarity Conditions (Rule P6)

Never combine a positive boolean with a negated boolean in the same `if` condition. A negated boolean (`!isX`) may only appear **alone** in a condition — never combined with other terms via `&&` or `||`.

```go
// ❌ FORBIDDEN — mixed polarity in condition
if s.isCacheEnabled && !isForceRefresh {
    return cachedResult
}

// ❌ FORBIDDEN — negation directly in compound expression
if !isDryRun && totalDeleted > 0 {
    commitDeletions()
}

// ✅ REQUIRED — extract negation to positive counterpart, then compose
isNormalRefresh := !isForceRefresh
isCacheHit := s.isCacheEnabled && isNormalRefresh

if isCacheHit {
    return cachedResult
}

// ✅ REQUIRED — negation used ALONE is permitted
if !isValid {
    return ErrInvalid
}
```

**Rule summary:**
- `!isX` alone in a condition → ✅ Permitted
- `!isX && isY` or `isY && !isX` → ❌ Prohibited — extract `!isX` to a named positive counterpart first
- `!isX && !isY` → ❌ Prohibited — two negations is never acceptable

See [Boolean Principles P6](../../01-cross-language/02-boolean-principles/03-parameters-and-conditions.md#principle-6-never-mix-positive-and-negative-booleans-in-a-single-condition) for the cross-language rule.

## 2.8 — No Inline Statements in `if` Conditions (Rule P7)

Go allows semicolon-separated inline statements in `if` conditions (e.g., `if x := compute(); x > 0 {`). This pattern is **prohibited** in application code because it:
- Hides variable assignment inside control flow
- Makes the condition harder to read and debug
- Encourages coupling unrelated operations (filesystem check + boolean logic)

The **only exemption** is the idiomatic comma-ok pattern (`if v, ok := m[k]; ok {`) and type assertions (`if v, ok := x.(T); ok {`).

```go
// ❌ FORBIDDEN — inline os.Stat inside if condition
if _, err := os.Stat(projectDir); err == nil && !isOverwrite {
    return fmt.Errorf("project exists, use isOverwrite=true to replace")
}

// ❌ FORBIDDEN — inline statement with pre-computed boolean
isProjectConflict := err == nil && !isOverwrite
if _, err := os.Stat(projectDir); isProjectConflict {
    return fmt.Errorf("project exists, use isOverwrite=true to replace")
}

// ✅ REQUIRED — separate computation from condition
isProjectExists := pathutil.IsDir(projectDir)
isReadOnly := !isOverwrite
isProjectConflict := isProjectExists && isReadOnly

if isProjectConflict {
    return apperror.FailNew[ProjectResult](
        errors.ErrFsConflict,
        "project already exists; use isOverwrite=true to replace",
    )
}
```

### Exemptions

```go
// ✅ Exempt — idiomatic error propagation
if err := validateUpload(req); err != nil {
    return err
}

// ✅ Exempt — idiomatic comma-ok
if v, ok := myMap[key]; ok {
    process(v)
}

// ✅ Exempt — idiomatic type assertion
if concrete, ok := iface.(MyType); ok {
    concrete.DoWork()
}

// ✅ Exempt — recover in deferred panic handler
defer func() {
    if r := recover(); r != nil {
        handlePanic(r)
    }

}()
```

> **Note:** The `if err := fn(); err != nil` pattern is exempt because it is idiomatic Go error propagation where the variable is only used within the error check. The prohibition targets non-error value extraction patterns like `if cached := getFromCache(url); cached != nil`.

## Related

- [02-negation-elimination.md](./02-negation-elimination.md) — Rule P3 positive counterpart variables
- [05-filesystem-and-errors.md](./05-filesystem-and-errors.md) — Rules P8, P9
