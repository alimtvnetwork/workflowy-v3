# Checklist Summary (Copy for PRs)

```
[ ] No `catch (Exception $e)` — all use `catch (Throwable $e)`
[ ] Every `catch (Throwable $e)` passes `$e` to the logger — stack trace must never be dropped
[ ] No inline `in_array($error['type'], [...])` — use `ErrorChecker`
[ ] No inline E_* → string maps — use `ErrorChecker::getTypeLabel()`
[ ] No `wp_die()` in REST handlers
[ ] No `error_log()` — use structured logger
[ ] No `error_log('...' . $e->getMessage() . ...)` — use `ErrorLog($e, 'context')` for pre-FileLogger exception logging
[ ] No string literals in add_action/add_filter — use `HookType::*->value`
[ ] No inline concatenation at call sites — compose named constants first
[ ] No manual path concatenation — use `PathHelper` accessors
[ ] No `BooleanHelpers` trivial wrappers — use semantic methods
[ ] No `!$obj->isActive()` — use `$obj->isDisabled()`
[ ] No `!file_exists()` — use `PathHelper::isFileMissing()`
[ ] No `!is_dir()` — use `PathHelper::isDirMissing()`
[ ] No `!class_exists()` — use `BooleanHelpers::isClassMissing()`
[ ] No `!function_exists()` — use `BooleanHelpers::isFuncMissing()`
[ ] No `!extension_loaded()` — use `BooleanHelpers::isExtensionMissing()`
[ ] No raw `!` on any function call — use positive guard function
[ ] No boolean vars without `$is*` / `$has*` prefix
[ ] No WordPress calls in constructors
[ ] No inline `!class_exists('PDO')` — use `ErrorChecker::isInvalidPdoExtension()`
[ ] Blank line before `return` or `throw` when preceded by other statements
[ ] No single-line `if (...) return;` — always use braces
[ ] Blank line after closing `}` when followed by more code
[ ] No nested `if` — ZERO TOLERANCE — absolute ban
[ ] No inline multi-part `if` (2+ operators) — extract to `$is*` variable or method
[ ] Functions max 15 lines — extract helpers for longer logic
[ ] No leading backslash on `Throwable` — use `catch (Throwable $e)`
[ ] Functions with >2 params — one param per line with trailing comma
[ ] Every trait `use` in class/trait body has matching file-level `use` import
[ ] Every cross-namespace enum/class/interface has file-level `use` import
[ ] No file relies on ambient loading — each file is self-sufficient
[ ] Cold activation tested after adding new trait compositions
[ ] No magic string array keys matching ResponseKeyType cases — use enum->value
[ ] Every new repeated key (3+ files) added to ResponseKeyType enum
[ ] No hardcoded date format strings — use `DateFormatType::*->value`
[ ] No snake_case API response keys — use PascalCase
```

---

*Part of [PHP Forbidden Patterns](./00-overview.md) — PR checklist*
