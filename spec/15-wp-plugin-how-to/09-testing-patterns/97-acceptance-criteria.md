# Testing Patterns — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 16 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-TESTINGPATTERNS-01` … `AT-TESTINGPATTERNS-16`

---

## Criteria

### Philosophy & directory structure (files 01, 02)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-TESTINGPATTERNS-01 | Tests follow the **AAA pattern** (Arrange / Act / Assert); test methods that mix setup with assertions inline fail review. | [`01-philosophy.md`](./01-philosophy.md) |
| AT-TESTINGPATTERNS-02 | Test classes are **isolated** — no shared mutable state across test methods; static caches MUST be cleared in `setUp()`. | [`01-philosophy.md`](./01-philosophy.md) |
| AT-TESTINGPATTERNS-03 | Test directory mirrors source: `tests/Unit/<Subpath>/<Class>Test.php` matches `includes/<Subpath>/<Class>.php`; orphan tests or untested classes are flagged. | [`02-directory-structure.md`](./02-directory-structure.md) |

### Bootstrap & PHPUnit config (files 03, 04)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-TESTINGPATTERNS-04 | `tests/bootstrap.php` loads the plugin via the production autoloader (NOT a parallel test autoloader); divergence causes false-positive passes. | [`03-bootstrap.md`](./03-bootstrap.md) |
| AT-TESTINGPATTERNS-05 | `phpunit.xml` declares testsuites for `Unit`, `Integration`, `EndToEnd`; mixing levels in one suite is forbidden. | [`04-phpunit-config.md`](./04-phpunit-config.md) |
| AT-TESTINGPATTERNS-06 | Coverage is configured to include `includes/` and exclude `vendor/`, `tests/`, `templates/`; coverage report MUST be generated in CI. | [`04-phpunit-config.md`](./04-phpunit-config.md), [`11-conventions-coverage-ci.md`](./11-conventions-coverage-ci.md) |

### Testing enums & traits (files 05, 06)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-TESTINGPATTERNS-07 | Every enum has a test class verifying: all cases parse via `from()`, unknown input throws on `from()` and returns `null` on `tryFrom()`, `values()` returns the expected case-count, every metadata method has at least one assertion per case. | [`05-testing-enums.md`](./05-testing-enums.md), [`../02-enums-and-coding-style/97-acceptance-criteria.md`](../02-enums-and-coding-style/97-acceptance-criteria.md) |
| AT-TESTINGPATTERNS-08 | The `TypeCheckerTrait` is the only sanctioned helper for asserting envelope/structure shape in tests; bespoke `assertHasKeys()` helpers in test classes are forbidden. | [`06-testing-typechecker-trait.md`](./06-testing-typechecker-trait.md) |

### Envelope builder & REST endpoints (files 07, 08)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-TESTINGPATTERNS-09 | `EnvelopeBuilder` tests cover: success-only-Data, error-only-Error, Meta always present with `requestId`+`timestamp`, all `ResponseKeyType` cases produce parseable envelopes. | [`07-testing-envelope-builder.md`](./07-testing-envelope-builder.md) |
| AT-TESTINGPATTERNS-10 | REST endpoint tests assert (a) HTTP status, (b) envelope shape, (c) ResponseKey, (d) at least one nonce-failure and one capability-failure path per state-changing endpoint. | [`08-testing-rest-endpoints.md`](./08-testing-rest-endpoints.md), [`../14-rest-api-conventions/97-acceptance-criteria.md`](../14-rest-api-conventions/97-acceptance-criteria.md) |

### Validation, data providers, conventions (files 09, 10, 11)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-TESTINGPATTERNS-11 | Validation tests use `@dataProvider` with at least one valid + one invalid case per `RequestFieldType` variant; missing variants fail review. | [`09-testing-validation.md`](./09-testing-validation.md), [`10-data-providers.md`](./10-data-providers.md) |
| AT-TESTINGPATTERNS-12 | Data providers are **named** (string-keyed array) — numeric-indexed providers obscure failure messages and are forbidden. | [`10-data-providers.md`](./10-data-providers.md) |
| AT-TESTINGPATTERNS-13 | Coverage thresholds: line ≥ **80%**, method ≥ **85%**, class ≥ **90%**; CI fails on regression. | [`11-conventions-coverage-ci.md`](./11-conventions-coverage-ci.md) |

### Database seeding & feature checklist (files 12, 13)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-TESTINGPATTERNS-14 | Database tests use **transactions with rollback** in `tearDown()`; tests that leak DB state across runs are a Code-Red bug. | [`12-testing-database-seeding.md`](./12-testing-database-seeding.md) |
| AT-TESTINGPATTERNS-15 | Seed factories are reusable across tests (`UserFactory::createAdmin()`, `SnapshotFactory::createPending()`); inline `$wpdb->insert()` in test methods is forbidden. | [`12-testing-database-seeding.md`](./12-testing-database-seeding.md) |
| AT-TESTINGPATTERNS-16 | Every new feature MUST close out the §13 checklist before merge: unit tests, integration tests, REST tests, validation tests, coverage met, CI green. | [`13-feature-checklist.md`](./13-feature-checklist.md) |

---

## Verification

```bash
# Numeric-indexed data providers
rg -nP 'public\s+(static\s+)?function\s+\w+Provider\s*\(\s*\)\s*:\s*array' tests/ -A 5 | rg -B1 'return\s*\[\s*\['

# Hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../02-enums-and-coding-style/97-acceptance-criteria.md`](../02-enums-and-coding-style/97-acceptance-criteria.md) — Enum testing context
- [`../14-rest-api-conventions/97-acceptance-criteria.md`](../14-rest-api-conventions/97-acceptance-criteria.md) — REST endpoint contract
- [`../../02-coding-guidelines/consolidated-review-guide/97-acceptance-criteria.md`](../../02-coding-guidelines/consolidated-review-guide/97-acceptance-criteria.md) — Master review SSOT

---

*Curated 2026-04-25 — closes A-23 (batch 12). Replaces v0.1.0 stub.*
