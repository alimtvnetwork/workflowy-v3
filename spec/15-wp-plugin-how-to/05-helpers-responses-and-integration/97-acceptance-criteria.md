# Helpers Responses And Integration — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 14 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-HELPERSRESPONSESANDINTEGRATION-01` … `AT-HELPERSRESPONSESANDINTEGRATION-14`

---

## Criteria

### Helper classes (file 01)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-HELPERSRESPONSESANDINTEGRATION-01 | All helper classes live under `includes/Helpers/<Name>.php`; ad-hoc `functions.php`-style global helpers are forbidden. | [`01-helper-classes.md`](./01-helper-classes.md) |
| AT-HELPERSRESPONSESANDINTEGRATION-02 | Helper methods are **`static`** and **stateless** (no instance properties); a helper that reads/writes shared state fails review. | [`01-helper-classes.md`](./01-helper-classes.md) |

### Boolean helpers (file 02)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-HELPERSRESPONSESANDINTEGRATION-03 | Boolean coercion goes through `BooleanHelpers::fromMixed($value)` returning a strict `bool` (NOT `(bool)` cast); the truthy set is documented in §02 and is the SSOT. | [`02-boolean-helpers.md`](./02-boolean-helpers.md), [`../../02-coding-guidelines/01-cross-language/02-boolean-principles/97-acceptance-criteria.md`](../../02-coding-guidelines/01-cross-language/02-boolean-principles/97-acceptance-criteria.md) |

### Init helpers & HttpConfigType (files 03, 04)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-HELPERSRESPONSESANDINTEGRATION-04 | Plugin init runs through `InitHelpers::register($container)` exactly once per request; double-registration MUST throw a typed exception. | [`03-init-helpers.md`](./03-init-helpers.md) |
| AT-HELPERSRESPONSESANDINTEGRATION-05 | Outbound HTTP requests build their config via `HttpConfigType` (timeout, retries, headers, baseUrl); raw `wp_remote_*` calls bypassing `HttpConfigType` are forbidden. | [`04-http-config-type.md`](./04-http-config-type.md) |
| AT-HELPERSRESPONSESANDINTEGRATION-06 | `HttpConfigType` declares an explicit timeout (default 10s) and max-retries (default 2); requests with `timeout = 0` (infinite) are forbidden in production. | [`04-http-config-type.md`](./04-http-config-type.md) |

### Response envelope (file 05)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-HELPERSRESPONSESANDINTEGRATION-07 | Every API response uses the canonical envelope `{ Success, Data, Error, Meta }` (PascalCase keys); top-level keys outside this set are forbidden. | [`05-response-envelope.md`](./05-response-envelope.md), [`../../02-coding-guidelines/04-php/09-response-key-type-inventory/97-acceptance-criteria.md`](../../02-coding-guidelines/04-php/09-response-key-type-inventory/97-acceptance-criteria.md) |
| AT-HELPERSRESPONSESANDINTEGRATION-08 | `Success: true` MUST imply `Error: null`; `Success: false` MUST imply `Data: null`; mixed states fail review. | [`05-response-envelope.md`](./05-response-envelope.md) |
| AT-HELPERSRESPONSESANDINTEGRATION-09 | `Meta` includes `requestId` (matches log entries) and `timestamp` (ISO 8601 UTC); missing either field is a Code-Red bug for traceability. | [`05-response-envelope.md`](./05-response-envelope.md), [`../04-logging-and-error-handling/97-acceptance-criteria.md`](../04-logging-and-error-handling/97-acceptance-criteria.md) |

### Integration checklist (file 06)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-HELPERSRESPONSESANDINTEGRATION-10 | A new plugin is integration-complete when ALL items in §06 pass: bootstrap registered, autoloader wired, helpers loaded, response envelope adopted, REST routes registered via `endpoints.json`, settings registry initialised, logging+error-handling enabled. | [`06-integration-checklist.md`](./06-integration-checklist.md) |

### Database & split-DB (file 07)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-HELPERSRESPONSESANDINTEGRATION-11 | DB access goes through the project micro-ORM / `DbManager` (NOT raw `$wpdb`); raw `$wpdb->query` outside `Helpers/Db/` is forbidden. | [`07-database-and-split-db.md`](./07-database-and-split-db.md), [`../../05-split-db-architecture/01-fundamentals/97-acceptance-criteria.md`](../../05-split-db-architecture/01-fundamentals/97-acceptance-criteria.md) |
| AT-HELPERSRESPONSESANDINTEGRATION-12 | Cross-DB joins are forbidden — query each DB independently and compose results in PHP; a SQL JOIN spanning two `*.sqlite` files fails review. | [`07-database-and-split-db.md`](./07-database-and-split-db.md) |

### Security & summary (file 08)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-HELPERSRESPONSESANDINTEGRATION-13 | Every state-changing endpoint MUST verify a nonce (`wp_verify_nonce`) AND a capability (`current_user_can`) before mutating; missing either is a Code-Red OWASP risk. | [`08-security-and-summary.md`](./08-security-and-summary.md), [`../../02-coding-guidelines/consolidated-review-guide/97-acceptance-criteria.md`](../../02-coding-guidelines/consolidated-review-guide/97-acceptance-criteria.md) |
| AT-HELPERSRESPONSESANDINTEGRATION-14 | All user-supplied input is sanitized at the boundary (controller) using the `RequestFieldType`-driven sanitizer; sanitization in the service/repository layer is forbidden (defense-in-depth happens via parameterized SQL). | [`08-security-and-summary.md`](./08-security-and-summary.md) |

---

## Verification

```bash
# Raw $wpdb usage outside Helpers/Db
rg -n '\$wpdb->' includes/ | grep -v 'Helpers/Db/\|tests/'

# Top-level non-canonical envelope keys
rg -nP "wp_send_json\w*\(\s*\[\s*'(?!Success|Data|Error|Meta)" includes/

# Hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../04-logging-and-error-handling/97-acceptance-criteria.md`](../04-logging-and-error-handling/97-acceptance-criteria.md) — Logging & error handling
- [`../14-rest-api-conventions/97-acceptance-criteria.md`](../14-rest-api-conventions/97-acceptance-criteria.md) — REST API
- [`../../05-split-db-architecture/01-fundamentals/97-acceptance-criteria.md`](../../05-split-db-architecture/01-fundamentals/97-acceptance-criteria.md) — Split DB

---

*Curated 2026-04-25 — closes A-23 (batch 12). Replaces v0.1.0 stub.*
