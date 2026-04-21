# isEqual() — Universal Enum Comparison

> **Parent:** [00-overview.md](00-overview.md)

## Rule: Every backed enum MUST have `isEqual(self $other): bool`

This method provides a clean, fluent API for comparing enum cases. It replaces raw `===` comparisons at call sites and inside helper methods, making conditionals more readable and eliminating bare operator usage.

## Implementation (identical in every enum)

```php
/** Check if this enum case equals the given case. */
public function isEqual(self $other): bool
{
    return $this === $other;
}
```

## Why isEqual() Instead of Raw `===`

| Aspect | `===` (forbidden) | `isEqual()` (required) |
|--------|-------------------|----------------------|
| Readability | `$status === StatusType::Success` | `$status->isEqual(StatusType::Success)` |
| Fluency | Operator-based, breaks chain | Method-based, reads like English |
| Internal helpers | `$this === self::X` | `$this->isEqual(self::X)` |
| Consistency | Mixed styles across codebase | Single pattern everywhere |

## Usage — Call Sites

```php
use RiseupAsia\Enums\StatusType;
use RiseupAsia\Enums\LogLevelType;

// ❌ FORBIDDEN: Raw === comparison
if ($status === StatusType::Success) { ... }

if ($level === LogLevelType::Error || $level === LogLevelType::Warn) { ... }

// ✅ REQUIRED: isEqual() method
if ($status->isEqual(StatusType::Success)) { ... }

if ($level->isEqual(LogLevelType::Error) || $level->isEqual(LogLevelType::Warn)) { ... }
```

## Usage — Internal Helper Methods

Existing domain-specific helpers (e.g., `isSuccess()`, `isError()`) MUST delegate to `isEqual()` internally:

```php
enum StatusType: string
{
    case Success = 'success';
    case Failed  = 'failed';

    public function isEqual(self $other): bool
    {
        return $this === $other;
    }

    // ❌ FORBIDDEN: Direct === in helpers
    public function isSuccess(): bool
    {
        return $this === self::Success;
    }

    // ✅ REQUIRED: Delegate to isEqual()
    public function isSuccess(): bool
    {
        return $this->isEqual(self::Success);
    }
}
```

## Usage — Compound Checks

For helpers that check multiple cases, each comparison uses `isEqual()`:

```php
// ✅ Compound check with isEqual()
public function isLifecycle(): bool
{
    return $this->isEqual(self::Enable)
        || $this->isEqual(self::Disable)
        || $this->isEqual(self::Delete);
}

public function isErrorOrWarn(): bool
{
    return $this->isEqual(self::Error) || $this->isEqual(self::Warn);
}
```

## When NOT to Use isEqual()

- **Domain checks using `str_starts_with()`** — These are prefix-based, not case-based. Keep as-is:
  ```php
  // ✅ Correct: prefix check, not enum comparison
  public function isSnapshot(): bool
  {
      return str_starts_with($this->value, 'snapshot_');
  }
  ```
- **Static validation** — `tryFrom()` and `validValues()` are not comparisons.
