# 4.14 DateHelper — Timestamp Specification

> **Parent:** [Phase 4 overview](./00-overview.md)

---

All timestamps flow through a centralised `DateHelper` class:

| Method | Returns | Used for |
|--------|---------|----------|
| `nowUtc()` | `2026-04-07T14:30:00Z` | API responses, database storage |
| `nowIso()` | ISO 8601 with timezone | API metadata |
| `nowLogDisplay()` | `07-Apr-26 2:30 PM` | Log file entries |
| `formatInWpTimezone($format, $timestamp)` | Formatted string in WP timezone | All display timestamps |

## Timezone handling

- All storage is UTC
- All display converts to the WordPress-configured timezone (`Settings > General > Timezone`)
- The timezone is resolved once and cached for the request lifetime
- Supports both named timezones (`Asia/Kuala_Lumpur`) and GMT offset fallback
