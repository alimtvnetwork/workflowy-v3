# PHP Enums — Acceptance Criteria

> **Version:** 2.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## Purpose

Testable acceptance criteria for PHP 8.1+ native backed enums used in WordPress companion plugins. Covers conventions, the universal `isEqual()` method, and each documented enum case.

ID format: `AT-ENUMS-NN`.

---

## Criteria

### Conventions (AT-ENUMS-01..03)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ENUMS-01 | Every enum-like constant uses PHP 8.1+ native backed enums; legacy `class FooEnum { public const … }` and `define()` constants are migrated. | [`00-overview.md`](./00-overview.md) + [`01-rules-and-conventions.md`](./01-rules-and-conventions.md) |
| AT-ENUMS-02 | Enum class names are PascalCase ending in `Type` (e.g. `HttpMethodType`); cases are PascalCase. | [`01-rules-and-conventions.md`](./01-rules-and-conventions.md) + [`../03-naming-conventions/`](../03-naming-conventions/00-overview.md) |
| AT-ENUMS-03 | Every enum lives in its own file under the documented namespace; one enum per file. | [`01-rules-and-conventions.md`](./01-rules-and-conventions.md) |

### Universal Comparison (AT-ENUMS-04)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ENUMS-04 | Every enum implements `isEqual()` with the documented signature; identity comparisons (`===`) on enum cases are forbidden in business logic. | [`02-isequal-method.md`](./02-isequal-method.md) |

### Domain Enums (AT-ENUMS-05..15)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ENUMS-05 | `UploadSourceType` lists every valid upload origin and is the only source for upload-origin strings. | [`03-upload-source-type.md`](./03-upload-source-type.md) |
| AT-ENUMS-06 | `CapabilityType` lists every WordPress capability the plugin uses; `current_user_can()` is called only with values from this enum. | [`04-capability-type.md`](./04-capability-type.md) |
| AT-ENUMS-07 | `HttpMethodType` enumerates all HTTP verbs the REST API accepts (GET / POST / PUT / DELETE / PATCH); raw method strings are forbidden. | [`05-http-method-type.md`](./05-http-method-type.md) |
| AT-ENUMS-08 | `HookType` enumerates every WordPress hook the plugin registers; `add_action` / `add_filter` calls reference enum values only. | [`06-hook-type.md`](./06-hook-type.md) |
| AT-ENUMS-09 | `LogLevelType` matches the cross-language `LogLevel` enum (debug / info / warn / error / fatal). | [`07-log-level-type.md`](./07-log-level-type.md) + [`../../02-typescript/10-log-level-enum.md`](../../02-typescript/10-log-level-enum.md) |
| AT-ENUMS-10 | `StatusType` enumerates all transaction-result statuses; raw `'success'` / `'failure'` strings are forbidden. | [`08-status-type.md`](./08-status-type.md) |
| AT-ENUMS-11 | `PostStatusType` mirrors WordPress's post statuses (publish / draft / pending / private / trash / auto-draft / inherit). | [`09-post-status-type.md`](./09-post-status-type.md) |
| AT-ENUMS-12 | `ActionType` enumerates every transaction-logging action; the logger accepts only enum values. | [`10-action-type.md`](./10-action-type.md) |
| AT-ENUMS-13 | `TableType` and `LogColumnType` provide PascalCase SQLite table & column names — no string-literal table/column references in queries. | [`11-table-type.md`](./11-table-type.md) |
| AT-ENUMS-14 | `EndpointType` enumerates every REST endpoint path; route registration references enum values only. | [`12-endpoint-type.md`](./12-endpoint-type.md) |
| AT-ENUMS-15 | The 4 Path enums (in `13-path-enums.md`) replace the legacy `PathConst` class; no path concatenation outside these enums. | [`13-path-enums.md`](./13-path-enums.md) |

### Error Enums (AT-ENUMS-16..17)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ENUMS-16 | `WpErrorCodeType` enumerates every WordPress REST API error code returned to clients. | [`14-wp-error-code-type.md`](./14-wp-error-code-type.md) |
| AT-ENUMS-17 | `ErrorType` (non-enum class of constants) provides the canonical PHP error-type identifiers; documented and intentionally not a backed enum. | [`15-error-type-class.md`](./15-error-type-class.md) |

### Process & Logging (AT-ENUMS-18..19)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ENUMS-18 | Every new enum case passes the documented "Add New Case" checklist before merge. | [`16-classification-and-checklist.md`](./16-classification-and-checklist.md) |
| AT-ENUMS-19 | Log-context array keys are camelCase (the one documented exemption from PascalCase) and come from the canonical key list. | [`17-log-context-keys.md`](./17-log-context-keys.md) |

---

## Verification

```bash
grep -rn "AT-ENUMS-" spec/02-coding-guidelines/04-php/01-enums/
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Subsection overview
- [`../02-forbidden-patterns/97-acceptance-criteria.md`](../02-forbidden-patterns/97-acceptance-criteria.md) — PHP forbidden patterns (depends on these enums)
- [`../07-php-standards-reference/00-overview.md`](../07-php-standards-reference/00-overview.md) — Master PHP standards
- [`../../03-golang/01-enum-specification/97-acceptance-criteria.md`](../../03-golang/01-enum-specification/97-acceptance-criteria.md) — Go-side enum criteria
- [`spec/20-enums-index.md`](../../../20-enums-index.md) — Cross-language enum registry

*Curated v2.0.0 — 2026-04-25 (UTC+8). Replaced auto-generated H-2.1 scaffold.*
