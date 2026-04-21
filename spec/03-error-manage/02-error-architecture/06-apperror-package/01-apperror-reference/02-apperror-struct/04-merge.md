# AppError Merge — Batch Error Aggregation

> **Parent:** [02-apperror-struct overview](./00-overview.md)  
> **Version:** 3.0.0  
> **Updated:** 2026-04-20

---

## 2.2.7 Error Merge

Combine multiple `AppError` instances into a single error when an operation collects several failures (e.g., batch validation, multi-step processing):

```go
// Merge combines multiple AppErrors into a single AppError.
// The first error's code is used as the merged error's code.
// All errors are preserved in the Values map and cause chain.
func Merge(errors []*AppError) *AppError

// MergeWithCode combines multiple AppErrors under a specific error code.
func MergeWithCode(code string, message string, errors []*AppError) *AppError
```

**Usage:**

```go
// Batch validation — collect all failures, then merge
var errs []*apperror.AppError

if site == nil {
    errs = append(errs, apperror.NewType(apperrtype.SiteNotFound))
}
if pluginSlug == "" {
    errs = append(errs, apperror.NewType(apperrtype.PluginSlugMissing))
}
if configPath == "" {
    errs = append(errs, apperror.PathError(apperrtype.EmptyFilePath, configPath))
}

if len(errs) > 0 {
    return apperror.FailBool(
        apperror.MergeWithCode(apperrtype.ValidationFailed.Code(), "multiple validation errors", errs),
    )
}

// Multi-step processing — accumulate errors
var errs []*apperror.AppError
for _, site := range sites {
    if err := syncSite(site); err != nil {
        errs = append(errs, apperror.WrapSiteError(err, apperrtype.SyncConflict, site.Id))
    }
}
if len(errs) > 0 {
    merged := apperror.Merge(errs)
    log.Error(merged.FullString())
    return apperror.FailBool(merged)
}
```

**Merge output format (in `FullString()`):**

```
[E9002] multiple validation errors (3 errors merged)
  1. [E2010] site not found
  2. [E2012] plugin slug required
  3. [E4011] file path is empty — path: ""
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`03-convenience-constructors.md`](./03-convenience-constructors.md) — Convenience constructors
- [`05-display-methods.md`](./05-display-methods.md) — `FullString()` formatting

---

*Merge v3.0.0 — 2026-04-20*
