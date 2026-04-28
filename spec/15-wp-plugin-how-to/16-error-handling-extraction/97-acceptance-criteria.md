# Error Handling Extraction — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 16 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-ERRORHANDLINGEXTRACTION-01` … `AT-ERRORHANDLINGEXTRACTION-16`

---

## Criteria

### Error type classification & two-tier capture (files 01, 02)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ERRORHANDLINGEXTRACTION-01 | Errors are classified into the documented `ErrorType` enum cases (Validation, Authorization, NotFound, Conflict, Internal, External); ad-hoc string codes are forbidden. | [`01-error-type-classification.md`](./01-error-type-classification.md), [`../02-enums-and-coding-style/97-acceptance-criteria.md`](../02-enums-and-coding-style/97-acceptance-criteria.md) |
| AT-ERRORHANDLINGEXTRACTION-02 | Two-tier capture: PHP exceptions caught at the boundary (controller/REST/AJAX) AND a global shutdown handler for fatal errors; missing either tier loses errors silently. | [`02-two-tier-error-capture.md`](./02-two-tier-error-capture.md), [`../04-logging-and-error-handling/97-acceptance-criteria.md`](../04-logging-and-error-handling/97-acceptance-criteria.md) |

### Error log retrieval API (file 03)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ERRORHANDLINGEXTRACTION-03 | The error-log retrieval endpoint paginates (offset+limit, capped at 100) and supports filters by `errorType`, `severity`, `dateRange`, `requestId`; unbounded result sets are a Code-Red performance bug. | [`03-error-log-retrieval-api.md`](./03-error-log-retrieval-api.md) |
| AT-ERRORHANDLINGEXTRACTION-04 | Error-log retrieval requires an admin capability check; exposing logs to non-admins is a Code-Red OWASP bug (information disclosure). | [`03-error-log-retrieval-api.md`](./03-error-log-retrieval-api.md) |

### Error session model (file 04)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ERRORHANDLINGEXTRACTION-05 | An error session groups related errors by `requestId` + `userId` + 5-minute window; sessions are the unit shown in the admin error UI. | [`04-error-session-model.md`](./04-error-session-model.md) |
| AT-ERRORHANDLINGEXTRACTION-06 | Each session stores: first/last seen timestamps, count, top error type, sample stacktrace path (NOT inline stacktrace); inlining stacktraces in the session row is forbidden. | [`04-error-session-model.md`](./04-error-session-model.md), [`13-error-sessions-table.md`](./13-error-sessions-table.md) |

### Admin page JS, flash banner, auto-refresh (files 05, 06, 07)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ERRORHANDLINGEXTRACTION-07 | Admin error page JS is vanilla ES2020+ (no jQuery in new code); event handlers bind via `addEventListener`. | [`05-admin-page-javascript.md`](./05-admin-page-javascript.md), [`../11-frontend-and-template-patterns/97-acceptance-criteria.md`](../11-frontend-and-template-patterns/97-acceptance-criteria.md) |
| AT-ERRORHANDLINGEXTRACTION-08 | Flash banners auto-dismiss after a documented timeout (5s success, 10s warning, sticky for error); reversed timing is a UX bug. | [`06-flash-banner.md`](./06-flash-banner.md) |
| AT-ERRORHANDLINGEXTRACTION-09 | Auto-refresh polls at MOST every 30s and pauses when the tab is hidden (`document.visibilityState === 'hidden'`); polling a hidden tab wastes battery and fails review. | [`07-auto-refresh.md`](./07-auto-refresh.md) |

### SafeExecute wrapper (file 08)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ERRORHANDLINGEXTRACTION-10 | `SafeExecute::run(callable, $context)` is the SOLE try/catch wrapper in business code; raw `try {} catch {}` outside `SafeExecute` is forbidden. | [`08-safe-execute-wrapper.md`](./08-safe-execute-wrapper.md), [`../04-logging-and-error-handling/97-acceptance-criteria.md`](../04-logging-and-error-handling/97-acceptance-criteria.md) |
| AT-ERRORHANDLINGEXTRACTION-11 | `SafeExecute` MUST log every caught exception with `requestId` + classified `ErrorType` + stacktrace path; swallowing without logging is a Code-Red bug. | [`08-safe-execute-wrapper.md`](./08-safe-execute-wrapper.md) |

### Notification settings & response helper (files 09, 10)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ERRORHANDLINGEXTRACTION-12 | Error-notification thresholds (notify after N occurrences in M minutes) are configurable via the seedable-config layer (NOT hardcoded); hardcoded thresholds fail review. | [`09-error-notification-settings.md`](./09-error-notification-settings.md), [`../../06-seedable-config-architecture/01-fundamentals/97-acceptance-criteria.md`](../../06-seedable-config-architecture/01-fundamentals/97-acceptance-criteria.md) |
| AT-ERRORHANDLINGEXTRACTION-13 | The error-response helper maps internal `ErrorType` → HTTP status + `ResponseKeyType` deterministically; the mapping table is the SSOT and lives in §10. | [`10-error-response-helper.md`](./10-error-response-helper.md), [`../../02-coding-guidelines/04-php/09-response-key-type-inventory/97-acceptance-criteria.md`](../../02-coding-guidelines/04-php/09-response-key-type-inventory/97-acceptance-criteria.md) |

### Admin AJAX trait & template (files 11, 12)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ERRORHANDLINGEXTRACTION-14 | The `AdminErrorAjaxTrait` is the only sanctioned source of AJAX endpoints for the error UI; bespoke `wp_ajax_*` registrations for the error page are forbidden. | [`11-admin-error-ajax-trait.md`](./11-admin-error-ajax-trait.md) |
| AT-ERRORHANDLINGEXTRACTION-15 | The admin errors template renders sessions (NOT raw rows), provides the documented filters, and links each session to a stacktrace-detail modal; rendering raw error rows fails review. | [`12-admin-errors-template.md`](./12-admin-errors-template.md) |

### Sessions table & checklist (files 13, 14)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ERRORHANDLINGEXTRACTION-16 | The `error_sessions` table schema MUST match §13 exactly (PascalCase columns, indexes on `RequestId` + `LastSeenAt`); divergence is a migration bug. The §14 checklist gates merge: log capture wired, session grouping live, retrieval API + admin UI tested, retention policy configured. | [`13-error-sessions-table.md`](./13-error-sessions-table.md), [`14-checklist.md`](./14-checklist.md) |

---

## Verification

```bash
# Raw try/catch outside SafeExecute
rg -nP '^\s*try\s*\{' includes/ | grep -v 'SafeExecute\|tests/'

# jQuery in new error-page JS
rg -nP '\bjQuery\b|\$\(' assets/js/admin/error*.js

# Hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../04-logging-and-error-handling/97-acceptance-criteria.md`](../04-logging-and-error-handling/97-acceptance-criteria.md) — Two-tier logging
- [`../02-enums-and-coding-style/97-acceptance-criteria.md`](../02-enums-and-coding-style/97-acceptance-criteria.md) — Enum standards
- [`../../02-coding-guidelines/04-php/09-response-key-type-inventory/97-acceptance-criteria.md`](../../02-coding-guidelines/04-php/09-response-key-type-inventory/97-acceptance-criteria.md) — Response key inventory

---

*Curated 2026-04-25 — closes A-24 (batch 13). Replaces v0.1.0 stub.*


---

## Fixtures

Fixtures for every AT row in this file are covered by the global P2g sweep — see [`../../97a-acceptance-criteria-fixtures.md`](../../97a-acceptance-criteria-fixtures.md) (apply the matching pattern by section).
