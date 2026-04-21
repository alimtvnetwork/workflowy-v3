# §10 Hardcoded Date Formats & §11 snake_case Response Keys

## 10. Hardcoded Date Format Strings (`DateFormatType`)

> **Added:** 2026-02-25 — All date format strings must come from `DateFormatType` enum, not hardcoded in `gmdate()`, `date()`, or class constants.

### Forbidden Patterns

| # | ❌ Forbidden | ✅ Required | Why |
|---|-------------|------------|-----|
| 10.1 | `gmdate('c')` | `gmdate(DateFormatType::Iso8601->value)` | Hardcoded format string |
| 10.2 | `gmdate('Y-m-d H:i:s')` | `gmdate(DateFormatType::DateTime->value)` | Hardcoded format string |
| 10.3 | `gmdate('Y-m-d')` | `gmdate(DateFormatType::DateOnly->value)` | Hardcoded format string |
| 10.4 | `private const TIMESTAMP_FORMAT = 'Y-m-d\TH:i:s'` | Use `DateFormatType::LogTimestamp->value` | Class const duplicates enum |

### Exception

The `Autoloader` class is **exempt** — it loads before enums are available.

## 11. snake_case API Response Keys

> **Added:** 2026-02-25 — API response array keys must use PascalCase, matching the DB column key convention.

### Forbidden Patterns

| # | ❌ Forbidden | ✅ Required | Why |
|---|-------------|------------|-----|
| 11.1 | `$data['plugin_version']` | `$data['PluginVersion']` | snake_case in response |
| 11.2 | `$data['timestamp']` | `$data['Timestamp']` | lowercase in response |
| 11.3 | `$data['log_hint']` | `$data['LogHint']` | snake_case in response |
| 11.4 | `'success' => true` | `'Success' => true` | lowercase in response |
| 11.5 | `'error' => [...]` | `'Error' => [...]` | lowercase in response |

---

*Part of [PHP Forbidden Patterns](./00-overview.md) — §10, §11*
