# AppError Convenience Constructors

> **Parent:** [02-apperror-struct overview](./00-overview.md)  
> **Version:** 3.0.0  
> **Updated:** 2026-04-20

---

## 2.2.1 Path Convenience Constructors

Shorthand constructors for file system errors — automatically set the `path` diagnostic and accept the caller-supplied `Variation` (typically one of `VariationFsNotFound`, `VariationFsPermDenied`, `VariationFsIoError`):

```go
// PathError creates a path-related AppError with the given Variation.
// Automatically sets WithPath(path) diagnostic.
func PathError(errType apperrtype.ErrorType, path string) *AppError

// WrapPathError wraps a cause with a path-related Variation.
// Automatically sets WithPath(path) diagnostic.
func WrapPathError(cause error, errType apperrtype.ErrorType, path string) *AppError
```

**Usage with path variants:**

```go
// Path validation — no underlying error
if path == "" {
    return apperror.FailBool(apperror.PathError(apperrtype.EmptyFilePath, path))
}

if !isValidPath(path) {
    return apperror.FailBool(apperror.PathError(apperrtype.PathInvalid, path))
}

// Wrapping an OS error with path context
data, err := os.ReadFile(path)
if err != nil {
    return apperror.FailBytes(apperror.WrapPathError(err, apperrtype.PathFailedToRead, path))
}

// Creating a directory
if err := os.MkdirAll(dir, 0755); err != nil {
    return apperror.FailBool(apperror.WrapPathError(err, apperrtype.PathFailedToCreate, dir))
}
```

**Available path variants:**

| Variant | Code | Default Message |
|---------|------|-----------------|
| `PathNotFound` | E4012 | path not found |
| `PathInvalid` | E4013 | invalid path |
| `PathStatFailed` | E4014 | failed to stat path |
| `PathMissing` | E4016 | required path is missing |
| `PathFailedToCreate` | E4017 | failed to create path |
| `PathFailedToRead` | E4018 | failed to read path |
| `PathFailedToWrite` | E4019 | failed to write to path |
| `PathFailedToDelete` | E4020 | failed to delete path |
| `EmptyFilePath` | E4011 | file path is empty |

---

## 2.2.2 URL Convenience Constructors

Shorthand for network/API errors — automatically sets the `url` diagnostic:

```go
// UrlError creates a URL-related AppError. Auto-sets WithUrl(url).
func UrlError(errType apperrtype.ErrorType, url string) *AppError

// WrapUrlError wraps a cause with a URL-related Variation. Auto-sets WithUrl(url).
func WrapUrlError(cause error, errType apperrtype.ErrorType, url string) *AppError
```

**Usage:**

```go
// WordPress API connection failure
return apperror.FailSettings(
    apperror.WrapUrlError(err, apperrtype.WPConnectionFailed, siteURL),
)

// Invalid URL — no underlying error
return apperror.FailBool(
    apperror.UrlError(apperrtype.RequestFailed, endpoint),
)
```

---

## 2.2.3 Slug Convenience Constructors

Shorthand for plugin/resource slug errors — automatically sets the `slug` diagnostic:

```go
// SlugError creates a slug-related AppError. Auto-sets WithSlug(slug).
func SlugError(errType apperrtype.ErrorType, slug string) *AppError

// WrapSlugError wraps a cause with a slug-related Variation. Auto-sets WithSlug(slug).
func WrapSlugError(cause error, errType apperrtype.ErrorType, slug string) *AppError
```

**Usage:**

```go
// Plugin not found by slug
return apperror.FailBool(
    apperror.SlugError(apperrtype.PluginNotFound, pluginSlug),
)

// Plugin activation failure with underlying error
return apperror.FailBool(
    apperror.WrapSlugError(err, apperrtype.PluginAlreadyActive, pluginSlug),
)
```

---

## 2.2.4 Site Convenience Constructors

Shorthand for site-scoped errors — automatically sets the `siteId` diagnostic:

```go
// SiteError creates a site-related AppError. Auto-sets WithSiteId(siteId).
func SiteError(errType apperrtype.ErrorType, siteId int64) *AppError

// WrapSiteError wraps a cause with a site-related Variation. Auto-sets WithSiteId(siteId).
func WrapSiteError(cause error, errType apperrtype.ErrorType, siteId int64) *AppError
```

**Usage:**

```go
// Site not found
return apperror.FailBool(
    apperror.SiteError(apperrtype.SiteNotFound, siteId),
)

// Sync failure on a specific site
return apperror.FailBool(
    apperror.WrapSiteError(err, apperrtype.SyncTimeout, siteId),
)
```

---

## 2.2.5 Endpoint Convenience Constructors

Shorthand for HTTP request errors — automatically sets `endpoint`, `method`, and `statusCode` diagnostics:

```go
// EndpointError creates an HTTP-related AppError.
// Auto-sets WithEndpoint(ep), WithMethod(method), WithStatusCode(statusCode).
func EndpointError(errType apperrtype.ErrorType, method, endpoint string, statusCode int) *AppError

// WrapEndpointError wraps a cause with HTTP diagnostics.
// Auto-sets WithEndpoint(ep), WithMethod(method), WithStatusCode(statusCode).
func WrapEndpointError(cause error, errType apperrtype.ErrorType, method, endpoint string, statusCode int) *AppError
```

**Usage:**

```go
// API returned unexpected status
return apperror.FailSettings(
    apperror.EndpointError(apperrtype.WPResponseInvalid, "GET", "/wp-json/wp/v2/plugins", resp.StatusCode),
)

// Wrapping a network error with full HTTP context
return apperror.FailSettings(
    apperror.WrapEndpointError(err, apperrtype.WPConnectionFailed, "POST", endpoint, 0).
        WithValue("payload", truncatedBody),
)
```

---

## 2.2.6 Convenience Constructor Summary

| Constructor | Auto-sets | Typical Variants |
|-------------|-----------|------------------|
| `PathError` / `WrapPathError` | `WithPath(path)` | `PathInvalid`, `PathFailedToRead`, `PathMissing` |
| `UrlError` / `WrapUrlError` | `WithUrl(url)` | `WPConnectionFailed`, `RequestFailed`, `ConnectionFailed` |
| `SlugError` / `WrapSlugError` | `WithSlug(slug)` | `PluginNotFound`, `PluginAlreadyActive`, `PluginSlugMissing` |
| `SiteError` / `WrapSiteError` | `WithSiteId(id)` | `SiteNotFound`, `SiteBlocked`, `SyncTimeout` |
| `EndpointError` / `WrapEndpointError` | `WithEndpoint` + `WithMethod` + `WithStatusCode` | `WPEndpointNotFound`, `WPResponseInvalid`, `WPRateLimited` |

> **Rule:** If a diagnostic field is relevant, always use the convenience constructor instead of manual `.WithXxx()` chaining — it ensures no context is accidentally omitted.

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`02-basic-constructors.md`](./02-basic-constructors.md) — Basic constructors
- [`04-merge.md`](./04-merge.md) — Error merging

---

*Convenience constructors v3.0.0 — 2026-04-20*
