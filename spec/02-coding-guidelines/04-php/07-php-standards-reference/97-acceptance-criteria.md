# PHP Coding Standards — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 13 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-PHPSTANDARDSREFERENCE-01` … `AT-PHPSTANDARDSREFERENCE-13`

---

## Criteria

### Naming & errors (file 01)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-PHPSTANDARDSREFERENCE-01 | Class names are PascalCase, methods camelCase, constants UPPER_SNAKE_CASE; project-specific naming overrides documented in `02-coding-guidelines/04-php/03-naming-conventions/` win over PSR-12 baseline. | [`01-naming-and-errors.md`](./01-naming-and-errors.md), [`spec/02-coding-guidelines/04-php/03-naming-conventions/97-acceptance-criteria.md`](../03-naming-conventions/97-acceptance-criteria.md) |
| AT-PHPSTANDARDSREFERENCE-02 | All errors flow through structured response builders that produce the universal envelope (`Success`, `Code`, `Message`, `Data`); raw `wp_die()` / `echo` of error strings is forbidden in API paths. | [`01-naming-and-errors.md`](./01-naming-and-errors.md), [`spec/03-error-manage/02-error-architecture/05-response-envelope/97-acceptance-criteria.md`](../../../03-error-manage/02-error-architecture/05-response-envelope/97-acceptance-criteria.md) |
| AT-PHPSTANDARDSREFERENCE-03 | `try { … } catch (\Throwable $e) { /* swallow */ }` (empty/swallowing catch) is forbidden — exceptions must be re-thrown, logged via the structured logger, OR converted into a typed error response. | [`01-naming-and-errors.md`](./01-naming-and-errors.md), [`spec/02-coding-guidelines/04-php/02-forbidden-patterns/97-acceptance-criteria.md`](../02-forbidden-patterns/97-acceptance-criteria.md) |

### Constants & dependencies (file 02)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-PHPSTANDARDSREFERENCE-04 | Magic strings/numbers in business logic are replaced with class constants or backed enums; the only allowed literals are 0, 1, -1, "", and the empty array `[]`. | [`02-constants-and-deps.md`](./02-constants-and-deps.md) |
| AT-PHPSTANDARDSREFERENCE-05 | Required PHP extensions and Composer packages are checked at bootstrap with a typed dependency-check function that returns the universal envelope on failure. | [`02-constants-and-deps.md`](./02-constants-and-deps.md) |
| AT-PHPSTANDARDSREFERENCE-06 | Filesystem paths are constructed via `path_join()` / `DIRECTORY_SEPARATOR` helpers — never via raw string concatenation with `/` or `\`. | [`02-constants-and-deps.md`](./02-constants-and-deps.md) |

### Initialization & booleans (file 03)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-PHPSTANDARDSREFERENCE-07 | Constructors perform argument validation and assignment ONLY; no I/O, no global lookups, no side effects allowed in `__construct`. | [`03-initialization-and-booleans.md`](./03-initialization-and-booleans.md) |
| AT-PHPSTANDARDSREFERENCE-08 | Boolean variables and methods use `$is`/`$has` positive prefixes; negation in compound conditions (`!$isX && $isY`) is forbidden — assign to a positive-named local first. | [`03-initialization-and-booleans.md`](./03-initialization-and-booleans.md), [`spec/02-coding-guidelines/01-cross-language/02-boolean-principles/97-acceptance-criteria.md`](../../01-cross-language/02-boolean-principles/97-acceptance-criteria.md) |
| AT-PHPSTANDARDSREFERENCE-09 | `isDefined($x)` / `isDefinedAndValid($x)` / `isEmpty($x)` guards are the canonical nil/empty checks; `is_null($x)` and `!$x` truthiness checks are forbidden in business logic. | [`03-initialization-and-booleans.md`](./03-initialization-and-booleans.md) |

### Code style (file 04)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-PHPSTANDARDSREFERENCE-10 | Braces, indentation, and blank-line rules follow the cross-language code-style canonical spec; PHP-specific overrides are documented inline in §04. | [`04-code-style.md`](./04-code-style.md), [`spec/02-coding-guidelines/01-cross-language/04-code-style/97-acceptance-criteria.md`](../../01-cross-language/04-code-style/97-acceptance-criteria.md) |
| AT-PHPSTANDARDSREFERENCE-11 | Functions/methods target ≤ 15 logical lines and zero nested `if`; longer functions must be extracted into named helpers. | [`04-code-style.md`](./04-code-style.md), [`mem://constraints/coding-guidelines`](mem://constraints/coding-guidelines) |

### Forbidden & database (file 05)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-PHPSTANDARDSREFERENCE-12 | Forbidden constructs include `extract()`, `eval()`, `goto`, variable variables (`$$var`), and direct `$_GET`/`$_POST` access outside the input-sanitization layer. | [`05-forbidden-and-database.md`](./05-forbidden-and-database.md), [`spec/02-coding-guidelines/04-php/02-forbidden-patterns/97-acceptance-criteria.md`](../02-forbidden-patterns/97-acceptance-criteria.md) |
| AT-PHPSTANDARDSREFERENCE-13 | All database access goes through the project's typed wrapper (prepared statements only); raw `$wpdb->query()` with interpolated input is forbidden, and column array keys use **PascalCase** per the Golden Rule. | [`05-forbidden-and-database.md`](./05-forbidden-and-database.md), [`spec/04-database-conventions/06-rest-api-format/97-acceptance-criteria.md`](../../../04-database-conventions/06-rest-api-format/97-acceptance-criteria.md) |

---

## Verification

```bash
# Empty/swallow catch
rg -nU 'catch\s*\([^)]+\)\s*\{\s*\}' --type php

# Variable variables / extract / eval
rg -n '\$\$\w+|\bextract\s*\(|\beval\s*\(' --type php

# Direct super-globals outside input layer
rg -n '\$_(GET|POST|REQUEST|COOKIE)\[' --type php src/ | grep -v 'src/Input/'

# Hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`spec/02-coding-guidelines/04-php/02-forbidden-patterns/97-acceptance-criteria.md`](../02-forbidden-patterns/97-acceptance-criteria.md) — Forbidden patterns
- [`spec/04-database-conventions/06-rest-api-format/97-acceptance-criteria.md`](../../../04-database-conventions/06-rest-api-format/97-acceptance-criteria.md) — PascalCase Golden Rule
- [`spec/03-error-manage/02-error-architecture/01-error-handling-reference/97-acceptance-criteria.md`](../../../03-error-manage/02-error-architecture/01-error-handling-reference/97-acceptance-criteria.md) — Cross-stack error handling

---

*Curated 2026-04-25 — closes A-17 (batch 6).*


---

## Fixtures

Fixtures for every AT row in this file are covered by the global P2g sweep — see [`../../../97a-acceptance-criteria-fixtures.md`](../../../97a-acceptance-criteria-fixtures.md) (apply the matching pattern by section).
