# §4 Boolean Logic, §5 Initialization, §6 Condition Complexity

## 4. Boolean Logic & No Raw Negations

> **Canonical source:** [No Raw Negations](../../01-cross-language/12-no-negatives.md)

| # | ❌ Forbidden | ✅ Required | Why |
|---|-------------|------------|-----|
| 4.1 | `BooleanHelpers::isFalsy(...)` | `$plugin->isDisabled()` | Generic helper obscures intent |
| 4.2 | `BooleanHelpers::isTruthy(...)` | `$isValue` | Unnecessary indirection |
| 4.3 | `!$plugin->isActive()` | `$plugin->isDisabled()` | Negation is easy to miss; use semantic inverse |
| 4.4 | `$value` for boolean variables | `$isValue`, `$hasPermission` | Ambiguous naming; must use `$is*` / `$has*` prefix |
| 4.5 | `!file_exists($path)` | `PathHelper::isFileMissing($path)` | Raw negation; use positive guard |
| 4.6 | `!is_dir($path)` | `PathHelper::isDirMissing($path)` | Raw negation; use positive guard |
| 4.7 | `!class_exists('X')` | `BooleanHelpers::isClassMissing('X')` | Raw negation; use positive guard |
| 4.8 | `!function_exists('f')` | `BooleanHelpers::isFuncMissing('f')` | Raw negation; use positive guard |
| 4.9 | `!extension_loaded('e')` | `BooleanHelpers::isExtensionMissing('e')` | Raw negation; use positive guard |
| 4.10 | `$isX && !$isY` in `if` | `$isConflict = $isX && !$isY` (extracted) | Mixed polarity; extract to named boolean |

## 5. Initialization & Architecture

| # | ❌ Forbidden | ✅ Required | Why |
|---|-------------|------------|-----|
| 5.1 | WordPress calls in `__construct()` | Lazy `initialize()` method with guard | Load order issues; WP may not be ready |
| 5.2 | Raw `require_once` for non-foundation files | `OnboardIncludeFiles` loader utility | Loader logs failures with stack trace |
| 5.3 | `define()` for categorized constants | Native backed enum (`HookType`, `CapabilityType`, `HttpMethodType`, etc.) | Enums group related constants with PHPDoc |

> **Exception for 5.3:** Plugin-specific custom hooks (e.g., `CRON_SNAPSHOT_*`) may use `define()` in `constants.php` when they are plugin-scoped and not WordPress core hooks.

## 6. Condition Complexity & Function Size (All Languages)

| # | ❌ Forbidden | ✅ Required | Why |
|---|-------------|------------|-----|
| 6.1 | Inline `if` with 2+ operators (`&&`, `\|\|`, `!`) | Extract to named `$is*`/`$has*` variable or method | Reads as intent, not implementation |
| 6.2 | `$error && in_array($error['type'], [...])` | `ErrorChecker::isFatalError($error)` | Reusable, self-documenting |
| 6.3 | `!class_exists('PDO') \|\| !extension_loaded(...)` | `ErrorChecker::isInvalidPdoExtension()` | Centralized check |
| 6.4 | Nested `if` (any depth) | **Zero tolerance** — flatten with early returns or combined conditions | Absolute ban |
| 6.5 | Functions > 15 lines | Extract helpers; each function does one thing | Max 15 lines per function body |

---

*Part of [PHP Forbidden Patterns](./00-overview.md) — §4, §5, §6*
