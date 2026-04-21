# Idiomatic Go Exemptions

> **Parent:** [00-overview.md](./00-overview.md)

The following patterns are **exempt** from negation elimination.

## 3.1 — Comma-ok Pattern

The comma-ok return value **must** be renamed to a semantically meaningful positive boolean. The bare `ok` variable name is **prohibited** — always name it to describe what "ok" means in context (e.g., `isExists`, `isFound`, `isLoaded`).

If the negative case is needed, create a positive counterpart on the next line:

```go
// ❌ PROHIBITED — bare `ok` hides meaning
value, ok := someMap[key]
if !ok {
    return ErrNotFound
}

// ✅ REQUIRED — semantic name describes the positive case
value, isExists := someMap[key]
isMissing := !isExists

if isMissing {
    return ErrNotFound
}

// ✅ Also acceptable — positive guard when you only need the positive path
value, isExists := someMap[key]

if isExists {
    process(value)
}
```

More examples:

```go
// ❌ PROHIBITED
conn, ok := connections[id]
if !ok { ... }

// ✅ REQUIRED
conn, isFound := connections[id]
isNotFound := !isFound

if isNotFound {
    return apperror.FailNew[ConnResult](
        errors.ErrConnNotFound,
        "connection missing",
    )
}

// ❌ PROHIBITED
cached, ok := cache.Load(key)
if !ok { ... }

// ✅ REQUIRED
cached, isLoaded := cache.Load(key)
isCacheMiss := !isLoaded

if isCacheMiss {
    cached = fetchFromSource(key)
}
```

> **Note:** The inline comma-ok in `if` conditions (`if v, isExists := m[k]; isExists {`) remains exempt from Rule P7 but **must** still use a semantic name instead of `ok`.

## 3.2 — Handler Guard Returns

Early-return guards in HTTP handlers that return false on failure:

```go
// ✅ Exempt — handler guard pattern
if !requireService(w, Services.SyncService, "Sync service") {
    return
}

if !decodeJSON(w, r, &input) {
    return
}
```

## 3.3 — Error-nil Check

A **single** `err != nil` is exempt for idiomatic Go error propagation. However, compound error conditions are **prohibited** (see Rule P9 in [05-filesystem-and-errors.md](./05-filesystem-and-errors.md)).

```go
// ✅ Exempt — single err != nil for propagation
if err != nil {
    return err
}

// ✅ PREFERRED in application code — use appError methods
if appErr.HasError() {
    return appErr
}

// ❌ PROHIBITED — compound error condition (Rule P9)
if err != nil && !os.IsNotExist(err) {
    return err
}

// ❌ PROHIBITED — double error check (Rule P9)
if err1 != nil && err2 != nil {
    return errors.Join(err1, err2)
}
```

## 3.4 — Standard Library Returns

Direct `!` on stdlib function returns where no wrapper exists:

```go
// ✅ Exempt — stdlib call
if !strings.HasPrefix(path, "/api/") {
    return
}
```

However, if the same stdlib negation appears 3+ times, extract a named boolean or helper:

```go
// When repeated, extract:
isNonApiRoute := !strings.HasPrefix(r.URL.Path, "/api/")

if isNonApiRoute {
    next.ServeHTTP(w, r)

    return
}
```

## Related

- [05-filesystem-and-errors.md](./05-filesystem-and-errors.md) — Rule P9 compound error conditions
- [07-summary-and-enforcement.md](./07-summary-and-enforcement.md) — Full rule summary
