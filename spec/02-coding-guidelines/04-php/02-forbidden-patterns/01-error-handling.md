# §1 Error Handling & §7 Error Type Constants

## 1. Error Handling

| # | ❌ Forbidden | ✅ Required | Why |
|---|-------------|------------|-----|
| 1.1 | `catch (Exception $e)` | `catch (Throwable $e)` | Misses PHP 7+ `Error`, `TypeError`, `ParseError` |
| 1.2 | `$error && in_array($error['type'], [E_ERROR, ...])` | `ErrorChecker::isFatalError($error)` | Duplicated logic; central list in `ErrorType::FATAL_TYPES` |
| 1.3 | Inline `E_*` → string mapping arrays | `ErrorChecker::getTypeLabel($type)` | Uses `ErrorType::TYPE_LABELS`; one place to update |
| 1.4 | `wp_die()` in REST handlers | `wp_send_json_error()` or `$this->envelope->error()` | `wp_die()` breaks JSON response format |
| 1.5 | `error_log()` for diagnostics | `FileLogger` / `$this->fileLogger` | No structure, no stack trace, no audit trail |
| 1.6 | `!class_exists('PDO') \|\| !extension_loaded(...)` inline | `ErrorChecker::isInvalidPdoExtension()` | Centralized; self-documenting |
| 1.7 | Unchecked `new PDO()` without any guard | `ErrorChecker::isInvalidPdoExtension()` check first | Fatal error if extension missing |
| 1.7 | REST handler without `safeExecute` wrapper | Wrap in `$this->safeExecute(fn() => ...)` | Unhandled exceptions crash the endpoint |
| 1.8 | `->error($e->getMessage(), __FILE__, __LINE__)` — message as first param | `->error($e, __FILE__, __LINE__)` — Throwable as first param | Stack trace lost; `error()` requires `Throwable` as first parameter |
| 1.9 | `error_log('Context: ' . $e->getMessage() . "\n" . $e->getTraceAsString())` | `ErrorLog($e, 'Context:')` | Manual concatenation is error-prone; `ErrorLog()` enforces Throwable-first and consistent formatting |

## 7. Error Type Constants

| # | ❌ Forbidden | ✅ Required | Why |
|---|-------------|------------|-----|
| 7.1 | `[E_ERROR, E_PARSE, E_CORE_ERROR, ...]` inline | `ErrorType::FATAL_TYPES` | Centralized; update one place for new PHP versions |
| 7.2 | `[E_WARNING, E_NOTICE, ...]` inline | `ErrorType::WARNING_TYPES` | Same principle |
| 7.3 | Custom `errorTypeToString()` functions | `ErrorChecker::getTypeLabel($type)` | Uses `ErrorType::TYPE_LABELS` map |

---

*Part of [PHP Forbidden Patterns](./00-overview.md) — §1, §7*
