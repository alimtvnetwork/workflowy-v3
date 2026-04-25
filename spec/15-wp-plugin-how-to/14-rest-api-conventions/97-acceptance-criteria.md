# Rest Api Conventions — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 16 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-RESTAPICONVENTIONS-01` … `AT-RESTAPICONVENTIONS-16`

---

## Criteria

### Namespace & route naming (files 01, 02)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-RESTAPICONVENTIONS-01 | All routes register under one canonical namespace (e.g., `riseup/v1`); cross-namespace registrations from the same plugin are forbidden. | [`01-namespace.md`](./01-namespace.md) |
| AT-RESTAPICONVENTIONS-02 | The namespace version segment uses `v<integer>` (`v1`, `v2`); semver-style version strings (`v1.2`) are forbidden. | [`01-namespace.md`](./01-namespace.md) |
| AT-RESTAPICONVENTIONS-03 | Route paths use **kebab-case nouns** (`/site-snapshots`, `/api-keys`); camelCase or snake_case route paths are forbidden. | [`02-route-naming.md`](./02-route-naming.md) |

### HTTP methods & EndpointType enum (files 03, 04)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-RESTAPICONVENTIONS-04 | HTTP methods follow the documented mapping: GET=read, POST=create, PATCH=partial-update, PUT=replace, DELETE=remove; PUT-as-create is forbidden. | [`03-http-methods.md`](./03-http-methods.md) |
| AT-RESTAPICONVENTIONS-05 | The `EndpointType` enum is the SSOT for endpoint categories (Public, Authenticated, AdminOnly, Internal); each route MUST declare its `EndpointType`. | [`04-endpoint-type-enum.md`](./04-endpoint-type-enum.md), [`../02-enums-and-coding-style/97-acceptance-criteria.md`](../02-enums-and-coding-style/97-acceptance-criteria.md) |

### Route registration & pagination (files 05, 06)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-RESTAPICONVENTIONS-06 | Routes register inside a single `register_rest_route()`-loop driven by `endpoints.json`; per-controller `register_rest_route()` scattering is forbidden. | [`05-route-registration.md`](./05-route-registration.md), [`11-endpoints-json.md`](./11-endpoints-json.md) |
| AT-RESTAPICONVENTIONS-07 | Pagination uses **offset+limit** with `limit` capped at 100 and default 25; cursor pagination is reserved for documented streaming endpoints only. | [`06-pagination.md`](./06-pagination.md) |
| AT-RESTAPICONVENTIONS-08 | Paginated responses include `total`, `page`, `perPage`, `totalPages` in the envelope; clients computing pagination from raw counts is a sign of missing fields. | [`06-pagination.md`](./06-pagination.md) |

### Filtering & request fields (files 07, 08)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-RESTAPICONVENTIONS-09 | Filter parameters use the `filter[<field>]=<value>` syntax; ad-hoc top-level filter params are forbidden. | [`07-filtering.md`](./07-filtering.md) |
| AT-RESTAPICONVENTIONS-10 | The `RequestFieldType` enum is the SSOT for argument validation (string, int, bool, enum, json, slug); a route arg using a custom `validate_callback` instead of the enum fails review. | [`08-request-field-type.md`](./08-request-field-type.md) |

### Response keys & controller organisation (files 09, 10)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-RESTAPICONVENTIONS-11 | Response keys come exclusively from `ResponseKeyType` enum; string-literal keys in any response payload are a Code-Red bug. | [`09-response-keys.md`](./09-response-keys.md), [`../../02-coding-guidelines/04-php/09-response-key-type-inventory/97-acceptance-criteria.md`](../../02-coding-guidelines/04-php/09-response-key-type-inventory/97-acceptance-criteria.md) |
| AT-RESTAPICONVENTIONS-12 | One controller per resource (`SiteSnapshotsController`, `ApiKeysController`); god-controllers handling 3+ unrelated resources are forbidden. | [`10-controller-organisation.md`](./10-controller-organisation.md) |

### endpoints.json & standard endpoints (files 11, 12, 13)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-RESTAPICONVENTIONS-13 | `endpoints.json` is the SSOT for route metadata (path, method, callback, EndpointType, args); editing route registration without updating `endpoints.json` is a doc bug. | [`11-endpoints-json.md`](./11-endpoints-json.md) |
| AT-RESTAPICONVENTIONS-14 | The 5 standard endpoints (Ping, Whoami, Health, Version, Diagnostics) ship in every plugin; absence is a setup bug. | [`12-standard-endpoints.md`](./12-standard-endpoints.md) |
| AT-RESTAPICONVENTIONS-15 | Dynamic segments use `(?P<name>[a-zA-Z0-9_-]+)` regex (NOT bare `(?P<id>\\d+)` unless the id is strictly numeric); pattern divergence fails review. | [`13-dynamic-segments.md`](./13-dynamic-segments.md) |

### OpenAPI & summary table (files 14, 15)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-RESTAPICONVENTIONS-16 | An OpenAPI 3.1 spec is auto-generated from `endpoints.json`; manual edits to the OpenAPI file are forbidden. The summary table in §15 is auto-regenerated and must stay in sync. | [`14-openapi.md`](./14-openapi.md), [`15-summary-table.md`](./15-summary-table.md) |

---

## Verification

```bash
# String-literal response keys
rg -nP "wp_send_json\w*\(\s*\[\s*'\w" includes/

# Per-controller register_rest_route scattering
rg -l 'register_rest_route' includes/ | wc -l   # expected: 1 (single registrar)

# Hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../02-enums-and-coding-style/97-acceptance-criteria.md`](../02-enums-and-coding-style/97-acceptance-criteria.md) — WP enums
- [`../../02-coding-guidelines/04-php/09-response-key-type-inventory/97-acceptance-criteria.md`](../../02-coding-guidelines/04-php/09-response-key-type-inventory/97-acceptance-criteria.md) — Response key inventory
- [`../15-settings-architecture/97-acceptance-criteria.md`](../15-settings-architecture/97-acceptance-criteria.md) — Settings architecture (consumer)

---

*Curated 2026-04-25 — closes A-22 (batch 11). Replaces v0.1.0 stub.*
