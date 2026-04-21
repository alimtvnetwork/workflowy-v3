# 3. Boolean & Negation Violations

> **Parent:** [00-overview.md](./00-overview.md)

---

## Issue #09 — `!file_exists()` / `!is_dir()` Raw Negation

**Scope:** ~30 PHP call sites  
**Root Cause:** Code used raw `!` operator on PHP filesystem functions.

**Before (❌):**
```php
if (!file_exists($path)) { return false; }
if (!is_dir($dir)) { mkdir($dir, 0755, true); }
if (!self::makeDirectory($dir)) { throw new Exception('...'); }
```

**After (✅):**
```php
if (PathHelper::isFileMissing($path)) { return false; }

if (PathHelper::isDirMissing($dir)) { mkdir($dir, 0755, true); }
$isBaseDirFailed = !self::makeDirectory($dir);

if ($isBaseDirFailed) { throw new Exception('...'); }
```

**Prevention:** Use `PathHelper` and `BooleanHelpers` guard functions. See [no-negatives.md](../12-no-negatives.md).

---

## Issue #10 — Go Enum `String()` Using `!v.IsValid()`

**Scope:** 21 Go enum packages  
**Root Cause:** Every enum's `String()` method used `if !v.IsValid()` instead of the positive `if v.IsInvalid()`.

**Before (❌):**
```go
func (v Variant) String() string {
    if !v.IsValid() {
        return variantLabels[Invalid]
    }

    return variantLabels[v]
}
```

**After (✅):**
```go
func (v Variant) String() string {
    if v.IsInvalid() {
        return variantLabels[Invalid]
    }

    return variantLabels[v]
}
```

**Prevention:** Use `IsInvalid()` (already defined on all enums) instead of `!IsValid()`.

---

## Issue #11 — Go `!pathutil.IsDir()` Negation

**Scope:** 4 call sites in `git/service.go`  
**Root Cause:** No `IsDirMissing()` counterpart existed in `pathutil` package.

**Before (❌):**
```go
if !pathutil.IsDir(gitDir) {
    return apperror.FailNew[StatusResult](apperror.ErrGitNotRepo, "directory is not a git repository")
}
```

**After (✅):**
```go
// Added to pathutil package:
func IsDirMissing(path string) bool { return !IsDir(path) }

// Usage:
if pathutil.IsDirMissing(gitDir) {
    return apperror.FailNew[StatusResult](apperror.ErrGitNotRepo, "directory is not a git repository")
}
```

**Prevention:** Every boolean function must have a positive counterpart. When `IsX()` exists and `!IsX()` is used 2+ times, add `IsXMissing()` or `IsXAbsent()`.
