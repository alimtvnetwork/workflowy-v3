# Rules P8, P9 — Filesystem Wrappers & Compound Error Conditions

> **Parent:** [00-overview.md](./00-overview.md)

## 2.9 — No Raw Filesystem Calls in Application Code (Rule P8)

Application code **must not** call raw `os.Stat`, `os.MkdirAll`, `os.Remove`, `os.ReadFile`, or any `os` package filesystem function directly. Instead, use `pathutil` wrapper functions that:

1. Return `*apperror.AppError` with proper error codes (not raw `error`)
2. Provide positive-named boolean helpers (`IsDir`, `IsDirMissing`, `IsFile`, `IsFileMissing`)
3. Handle edge cases (permissions, symlinks) consistently

```go
// ❌ FORBIDDEN — raw os.Stat in application code
if _, err := os.Stat(projectDir); err == nil {
    // exists...
}

// ❌ FORBIDDEN — raw os.MkdirAll
if err := os.MkdirAll(outputDir, 0755); err != nil {
    return fmt.Errorf("failed to create dir: %w", err)
}

// ✅ REQUIRED — use pathutil wrappers
isProjectExists := pathutil.IsDir(projectDir)

// ✅ REQUIRED — use pathutil with apperror
if err := pathutil.EnsureDir(outputDir); err != nil {
    return apperror.Fail[OutputResult](err)
}
```

### Required `pathutil` Inventory

| Function | Returns | Description |
|----------|---------|-------------|
| `IsDir(path)` | `bool` | True if path exists and is a directory |
| `IsDirMissing(path)` | `bool` | True if path does not exist as directory |
| `IsFile(path)` | `bool` | True if path exists and is a regular file |
| `IsFileMissing(path)` | `bool` | True if path does not exist as file |
| `EnsureDir(path)` | `*apperror.AppError` | Creates directory if missing; returns structured error |
| `Remove(path)` | `*apperror.AppError` | Removes file/dir; returns structured error |
| `Stat(path)` | `(os.FileInfo, *apperror.AppError)` | Wraps `os.Stat` with `apperror` |

### Comprehensive Example — All Rules Combined

This example demonstrates violations of **P6** (mixed polarity), **P7** (inline statement), and **P8** (raw `os.Stat`) — and the correct fix:

```go
// ❌ FORBIDDEN — 4 violations in 3 lines:
//   1. P8: raw os.Stat (must use pathutil)
//   2. P7: inline statement in if (semicolon)
//   3. P6: mixed polarity (err == nil && !isOverwrite)
//   4. Raw fmt.Errorf instead of apperror
isProjectConflict := err == nil && !isOverwrite
if _, err := os.Stat(projectDir); isProjectConflict {
    return fmt.Errorf("project exists, use isOverwrite=true to replace")
}

// ✅ REQUIRED — clean, readable, all rules applied:
//   1. P8: pathutil.IsDir() wraps os.Stat
//   2. P7: no inline statement; all variables computed before if
//   3. P6: mixed polarity extracted to single-intent boolean
//   4. apperror.FailNew returns structured *apperror.AppError
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

## 2.10 — No Compound Error Conditions (Rule P9)

**Combining `err != nil` with any other condition using `&&` or `||` is PROHIBITED.** Error checking must be a single, isolated guard. If you need to check an error alongside another condition, use `*apperror.AppError` methods which handle nil-safety through pointer receivers.

### Prohibited: Double or Compound `err != nil`

```go
// ❌ FORBIDDEN — two err != nil checks combined
if err != nil && otherErr != nil {
    return fmt.Errorf("both failed")
}

// ❌ FORBIDDEN — err != nil combined with domain condition
if err != nil && !os.IsNotExist(err) {
    return err
}

// ❌ FORBIDDEN — err != nil mixed with positive condition
if err != nil && mood.IsDefined() {
    return handleMoodError(err, mood)
}

// ❌ FORBIDDEN — error == nil combined with other condition (mixed polarity)
if err == nil && isReady {
    proceed()
}
```

### Required: Use `*apperror.AppError` Methods

`*apperror.AppError` pointer receiver methods are **nil-safe** — calling `HasError()`, `IsDefined()`, or any method on a nil `*AppError` returns the appropriate zero value without panicking. This eliminates the need for raw `err != nil` checks entirely in application code.

```go
// ✅ REQUIRED — single error guard, no compound condition
if appErr.HasError() {
    return appErr
}

// ✅ REQUIRED — check errors separately, never combine
if firstErr.HasError() {
    return firstErr
}

if secondErr.HasError() {
    return secondErr
}

// ✅ REQUIRED — combine errors using AppError methods, not && operators
combinedErr := apperror.Combine(firstErr, secondErr)

if combinedErr.HasError() {
    return combinedErr
}
```

### Error + Domain Condition — Separate Guards

When you need to check both an error and a domain condition, they **must** be separate `if` blocks:

```go
// ❌ FORBIDDEN — compound error + domain check
if appErr.HasError() || mood.IsUndefined() {
    return apperror.FailNew[MoodResult](
        errors.ErrInvalidMood,
        "mood check failed",
    )
}

// ✅ REQUIRED — separate guards, each with clear intent
if appErr.HasError() {
    return apperror.Fail[MoodResult](appErr)
}

if mood.IsUndefined() {
    return apperror.FailNew[MoodResult](
        errors.ErrInvalidMood,
        "mood is undefined",
    )
}
```

### Single `err != nil` Exemption

A **single** `err != nil` check (not combined with anything) remains exempt for raw error propagation at library boundaries:

```go
// ✅ Exempt — single err != nil for raw error wrapping at boundary
if err != nil {
    return apperror.WrapNew[T](err, errors.ErrCodeHere, "context message")
}
```

> **Note:** In application code, prefer `appError.HasError()` even for single checks. The `err != nil` exemption exists only for library boundary wrapping where you receive a raw `error` from external packages.

## Related

- [04-mixed-polarity-and-inline.md](./04-mixed-polarity-and-inline.md) — Rules P6, P7
- [06-idiomatic-exemptions.md](./06-idiomatic-exemptions.md) — Comma-ok and other exemptions
