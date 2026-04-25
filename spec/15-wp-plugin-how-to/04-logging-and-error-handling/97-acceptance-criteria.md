# Logging And Error Handling — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 16 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-LOGGINGANDERRORHANDLING-01` … `AT-LOGGINGANDERRORHANDLING-16`

---

## Criteria

### Two-tier logging & debug mode (files 01, 02)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-LOGGINGANDERRORHANDLING-01 | Two log tiers exist: **operational log** (always-on, INFO+) and **debug log** (gated by debug-mode constant); merging them into one tier is forbidden. | [`01-two-tier-logging.md`](./01-two-tier-logging.md) |
| AT-LOGGINGANDERRORHANDLING-02 | Debug mode is toggled by a single constant (e.g., `RISEUP_DEBUG`) defined in `wp-config.php`; runtime toggling via DB is forbidden. | [`02-debug-mode.md`](./02-debug-mode.md) |

### File logger & log entry format (files 03, 04)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-LOGGINGANDERRORHANDLING-03 | The file logger writes to `wp-content/uploads/<plugin>/logs/<YYYY-MM-DD>.log`; logging to `wp-content/debug.log` directly is forbidden. | [`03-file-logger.md`](./03-file-logger.md) |
| AT-LOGGINGANDERRORHANDLING-04 | Every log entry uses the canonical 5-field format: `[timestamp] [level] [requestId] [source] message`; printf-style entries that skip fields fail review. | [`04-log-entry-format.md`](./04-log-entry-format.md) |
| AT-LOGGINGANDERRORHANDLING-05 | `requestId` is generated once per HTTP request (UUIDv4 or 16-hex) and propagated through the request lifecycle; missing `requestId` on any entry is a bug. | [`04-log-entry-format.md`](./04-log-entry-format.md) |

### Stacktrace files & rotation (files 05, 06, 10)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-LOGGINGANDERRORHANDLING-06 | Stacktraces are written to a sibling `<YYYY-MM-DD>.stacktrace.log` (NOT inlined into the operational log); inlining stacktraces in operational entries is forbidden. | [`05-stacktrace-file-format.md`](./05-stacktrace-file-format.md) |
| AT-LOGGINGANDERRORHANDLING-07 | Log rotation triggers on size (default 10 MiB) AND age (default 14 days); both thresholds are configurable via the seedable-config layer. | [`06-log-rotation.md`](./06-log-rotation.md), [`../../06-seedable-config-architecture/01-fundamentals/97-acceptance-criteria.md`](../../06-seedable-config-architecture/01-fundamentals/97-acceptance-criteria.md) |
| AT-LOGGINGANDERRORHANDLING-08 | The transport format for stacktraces sent to the client uses the documented JSON envelope in §10 (NOT the on-disk format). | [`10-stacktrace-transport-format.md`](./10-stacktrace-transport-format.md) |

### Deduplication (file 07)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-LOGGINGANDERRORHANDLING-09 | Identical log entries within a configured window (default 60 s) are deduplicated with a `(seen N times)` suffix; the dedup key is `(level, source, message)` (NOT including timestamp). | [`07-deduplication.md`](./07-deduplication.md) |

### Error handling rules & SafeExecute (files 08, 09)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-LOGGINGANDERRORHANDLING-10 | Bare `catch (\Throwable)` that returns `null`/`false` without logging is **Code Red**; every catch logs at ERROR level with a stacktrace. | [`08-error-handling-rules.md`](./08-error-handling-rules.md), [`../../03-error-manage/01-error-resolution/97-acceptance-criteria.md`](../../03-error-manage/01-error-resolution/97-acceptance-criteria.md) |
| AT-LOGGINGANDERRORHANDLING-11 | `SafeExecute::run(callable, $context)` is the only sanctioned wrapper for "log-and-return-default" semantics; ad-hoc try/catch+log helpers in business code are forbidden. | [`09-safe-execute.md`](./09-safe-execute.md) |
| AT-LOGGINGANDERRORHANDLING-12 | `SafeExecute` MUST attach `$context` to the log entry (operation name, key inputs); calls that pass no context fail review. | [`09-safe-execute.md`](./09-safe-execute.md) |

### API error examples & helpers (files 11, 12, 14)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-LOGGINGANDERRORHANDLING-13 | API error responses use `WP_Error` wrapped by `Helpers\Responses::error($code, $message, $statusCode)`; `wp_send_json_error()` with raw arrays is forbidden. | [`11-api-error-examples.md`](./11-api-error-examples.md) |
| AT-LOGGINGANDERRORHANDLING-14 | The `ErrorLogHelper` class is the only sanctioned entry to file-logging from production code; `error_log()`, `var_dump()`, `echo` for debugging are forbidden. | [`12-error-log-helper.md`](./12-error-log-helper.md) |
| AT-LOGGINGANDERRORHANDLING-15 | Date helpers use `wp_date()` (timezone-aware) — `date()` (server-tz) is forbidden in log entries. | [`14-date-helper.md`](./14-date-helper.md) |

### Shutdown handler & end-to-end flow (files 13, 15)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-LOGGINGANDERRORHANDLING-16 | A shutdown handler captures fatal errors via `error_get_last()` and writes them to the operational log + stacktrace file; absence of the shutdown handler is a Code-Red bug. End-to-end flow §15 is the integration SSOT. | [`13-shutdown-handler.md`](./13-shutdown-handler.md), [`15-end-to-end-flow.md`](./15-end-to-end-flow.md) |

---

## Verification

```bash
# Forbidden raw error helpers
rg -nP '\b(error_log|var_dump|print_r)\s*\(' includes/ | grep -v 'ErrorLogHelper\|tests/'

# Bare swallowing catches
rg -nB1 -A4 'catch\s*\(\\?Throwable' includes/ | rg -B5 'return\s+(null|false)'

# Hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../../03-error-manage/01-error-resolution/97-acceptance-criteria.md`](../../03-error-manage/01-error-resolution/97-acceptance-criteria.md) — Error resolution rollup
- [`../../06-seedable-config-architecture/01-fundamentals/97-acceptance-criteria.md`](../../06-seedable-config-architecture/01-fundamentals/97-acceptance-criteria.md) — Config-driven thresholds
- [`../14-rest-api-conventions/97-acceptance-criteria.md`](../14-rest-api-conventions/97-acceptance-criteria.md) — REST API conventions

---

*Curated 2026-04-25 — closes A-22 (batch 11). Replaces v0.1.0 stub.*
