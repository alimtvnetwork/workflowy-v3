# 4.1 Two-Tier Logging Architecture

> **Parent:** [Phase 4 overview](./00-overview.md)

---

The plugin uses two independent logging tiers:

| Tier | Class | When available | Purpose |
|------|-------|---------------|---------|
| Tier 1 — PHP native | `error_log()` / `ErrorLogHelper` | Always | Fallback when FileLogger is not ready; also emits to WP_DEBUG log |
| Tier 2 — FileLogger | `FileLogger` (singleton) | After autoloader loads | Primary structured log with rotation, dedup, and stack trace separation |

## Why two tiers

The autoloader and bootstrap run before any plugin classes are available. If they fail, Tier 1 (native `error_log()`) captures the failure. Once the plugin initialises, Tier 2 (FileLogger) handles all logging with structured output and file management.
