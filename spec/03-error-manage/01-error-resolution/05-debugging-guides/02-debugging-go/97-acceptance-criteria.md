# Debugging Go — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 12 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-DEBUGGINGGO-01` … `AT-DEBUGGINGGO-12`

---

## Criteria

### Initialization & logging (files 01–02)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-DEBUGGINGGO-01 | Service boot follows the **strict 5-step initialization order** documented in §01 — config → logger → db → router → http server; reordering causes a documented failure mode. | [`01-initialization-order.md`](./01-initialization-order.md) |
| AT-DEBUGGINGGO-02 | Logging uses **zerolog** with the documented level set (`trace`, `debug`, `info`, `warn`, `error`, `fatal`); raw `log.Println` / `fmt.Println` for diagnostics is forbidden in service code. | [`02-structured-logging.md`](./02-structured-logging.md) |
| AT-DEBUGGINGGO-03 | Every log call carries the structured fields documented in §02 (`request_id`, `session_id`, `code`, `variation`); free-form messages without these fields fail review. | [`02-structured-logging.md`](./02-structured-logging.md) |

### Error handling & health (files 03–04)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-DEBUGGINGGO-04 | Error responses use the standard envelope helpers documented in §03 — bare `http.Error` calls are forbidden in domain handlers. | [`03-error-handling.md`](./03-error-handling.md), [`spec/03-error-manage/02-error-architecture/05-response-envelope/97-acceptance-criteria.md`](../../../02-error-architecture/05-response-envelope/97-acceptance-criteria.md) |
| AT-DEBUGGINGGO-05 | The health endpoint returns the canonical envelope shape with deterministic fields (status, version, uptime, dependencies); the verification flow in §04 is reproducible from a single curl command. | [`04-health-check.md`](./04-health-check.md) |

### HTTP middleware & common issues (files 05–06)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-DEBUGGINGGO-06 | The HTTP middleware logs **request-in / response-out** with method, path, status, duration, and request_id; the middleware order is fixed per §05 (recovery → logging → cors → auth → handler). | [`05-http-middleware.md`](./05-http-middleware.md) |
| AT-DEBUGGINGGO-07 | The common-issues catalogue (§06) covers at minimum: connection refused, 404 routing, CORS preflight, locked SQLite database — each with a documented detection signal AND fix. | [`06-common-issues.md`](./06-common-issues.md) |

### Profiling & tracing (file 07)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-DEBUGGINGGO-08 | The CLI exposes the documented debug commands in §07 (`pprof`, request tracing, log tail) behind a single `--debug` flag; debug commands are excluded from release builds via build tag. | [`07-debug-commands-and-profiling.md`](./07-debug-commands-and-profiling.md) |
| AT-DEBUGGINGGO-09 | `pprof` endpoints are mounted on a separate, loopback-only listener (NOT the public API port); binding to a public interface fails CI. | [`07-debug-commands-and-profiling.md`](./07-debug-commands-and-profiling.md) |

### Database stack traces (file 08)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-DEBUGGINGGO-10 | All DB calls go through the `DBOperation` wrapper; the wrapper attaches a stack trace + SQL summary to every returned `*AppError`. | [`08-database-stack-traces.md`](./08-database-stack-traces.md) |
| AT-DEBUGGINGGO-11 | **ORM-only policy** — raw `db.Exec` / `db.Query` with hand-built SQL is forbidden outside the migrations directory; lint enforces it. | [`08-database-stack-traces.md`](./08-database-stack-traces.md) |

### Cross-references

| ID | Criterion | Source |
|----|-----------|--------|
| AT-DEBUGGINGGO-12 | Every cross-reference listed in §00 (`../00-overview.md`, `../03-debugging-typescript/00-overview.md`, error-code registry, frontend-backend sync) resolves; broken links fail `scripts/spec-hygiene/03-check-links.mjs`. | [`00-overview.md`](./00-overview.md) |

---

## Verification

```bash
# Forbidden raw log + http.Error
rg -n 'fmt\.Println|log\.Println|http\.Error\(' --type go internal/

# Raw DB calls outside migrations
rg -n 'db\.(Exec|Query)\(' --type go internal/ | grep -v 'internal/db/migrations'

# Hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../03-debugging-typescript/97-acceptance-criteria.md`](../03-debugging-typescript/97-acceptance-criteria.md) — TS counterpart
- [`spec/03-error-manage/02-error-architecture/01-error-handling-reference/97-acceptance-criteria.md`](../../../02-error-architecture/01-error-handling-reference/97-acceptance-criteria.md) — Cross-stack handling
- [`spec/03-error-manage/02-error-architecture/07-logging-and-diagnostics/02-session-based-logging/97-acceptance-criteria.md`](../../../02-error-architecture/07-logging-and-diagnostics/02-session-based-logging/97-acceptance-criteria.md) — Session logging

---

*Curated 2026-04-25 — closes A-18 (batch 7).*
