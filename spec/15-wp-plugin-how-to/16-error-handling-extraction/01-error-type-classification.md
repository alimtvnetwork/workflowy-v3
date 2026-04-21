# 16.1 Error Type Classification

> **Parent:** [Phase 16 overview](./00-overview.md)

---

PHP errors are classified into three severity groups using a dedicated `ErrorType` class (NOT a backed enum — it holds arrays of constants):

```php
final class ErrorType
{
    public const FATAL_TYPES = [
        E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR, E_USER_ERROR,
    ];

    public const WARNING_TYPES = [
        E_WARNING, E_CORE_WARNING, E_USER_WARNING,
        E_NOTICE, E_USER_NOTICE, E_DEPRECATED, E_USER_DEPRECATED,
    ];

    public const RECOVERABLE_TYPES = [
        E_RECOVERABLE_ERROR, E_STRICT,
    ];

    public const TYPE_LABELS = [
        E_ERROR => 'E_ERROR',
        // ... one entry per constant
    ];
}
```

## Why a final class instead of an enum

- Each case would need to hold an **array** of PHP `E_*` constants — backed enums only support `string|int`.
- The class groups related constants; individual error codes are not discrete enum cases.
- `TYPE_LABELS` provides human-readable names for display in admin UI tables.

## Rules

| Rule | Detail |
|------|--------|
| Fatal detection | `in_array($errno, ErrorType::FATAL_TYPES, true)` |
| Label lookup | `ErrorType::TYPE_LABELS[$errno] ?? 'UNKNOWN'` |
| No instantiation | Class is `final` with only `public const` members |
| Namespace | `RiseupAsia\Enums` (lives alongside real enums for discoverability) |
