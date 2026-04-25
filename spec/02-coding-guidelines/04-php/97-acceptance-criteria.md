# PHP Standards — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 14 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-PHP-01` … `AT-PHP-14`

---

## Criteria

### Enums (file 01)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-PHP-01 | All PHP enums MUST be PHP 8.1+ backed enums (`enum Foo: string`); class constants and `define()`-based enums are forbidden. | [`01-enums/00-overview.md`](./01-enums/00-overview.md) |
| AT-PHP-02 | Enum cases MUST be PascalCase with string values matching the case name (`case Foo = 'Foo'`); divergent value/case is forbidden because it breaks wire-format consistency with TS/Go. | [`01-enums/00-overview.md`](./01-enums/00-overview.md), [`../06-ai-optimization/05-enum-naming-quick-reference.md`](../06-ai-optimization/05-enum-naming-quick-reference.md) |
| AT-PHP-03 | Each enum MUST live in its own file under `src/Enums/` with the filename equal to the enum name; colocating multiple enums per file is forbidden. | [`01-enums/00-overview.md`](./01-enums/00-overview.md) |

### Forbidden patterns (file 02)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-PHP-04 | The forbidden-patterns checklist MUST be enforced via PHPStan/Psalm rules; any item lacking a static-analysis backing fails review (the checklist alone is unenforced). | [`02-forbidden-patterns/00-overview.md`](./02-forbidden-patterns/00-overview.md) |
| AT-PHP-05 | `extract()`, `eval()`, variable-variables (`$$x`), and dynamic property assignment in business code are FORBIDDEN as Code-Red security/maintainability bugs. | [`02-forbidden-patterns/00-overview.md`](./02-forbidden-patterns/00-overview.md) |

### Naming conventions (file 03)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-PHP-06 | Class names MUST be PascalCase, methods/properties camelCase, constants SCREAMING_SNAKE_CASE; deviations fail PHPCS. | [`03-naming-conventions/00-overview.md`](./03-naming-conventions/00-overview.md) |
| AT-PHP-07 | Database identifiers (table names, column names) MUST be PascalCase singular (per cross-language DB rule), even though PHP convention would normally favour snake_case — DB naming wins at the boundary. | [`../01-cross-language/07-database-naming.md`](../01-cross-language/07-database-naming.md), [`03-naming-conventions/00-overview.md`](./03-naming-conventions/00-overview.md) |

### Response array standard (files 05, 09)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-PHP-08 | All API response arrays MUST follow the documented envelope structure (`['ok' => bool, 'data' => …, 'error' => …]`); divergent shapes fail review because clients depend on the contract. | [`05-response-array-standard.md`](./05-response-array-standard.md) |
| AT-PHP-09 | All response keys MUST come from the `ResponseKeyType` enum (176 documented cases); inline string-literal keys are forbidden because they cause silent client breakage on rename. | [`09-response-key-type-inventory/00-overview.md`](./09-response-key-type-inventory/00-overview.md) |
| AT-PHP-10 | Adding a new response key MUST update `ResponseKeyType` enum + the inventory file in the same PR; PRs that diverge fail review. | [`09-response-key-type-inventory/00-overview.md`](./09-response-key-type-inventory/00-overview.md) |

### Spacing & imports (file 08)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-PHP-11 | `use` statements MUST be sorted alphabetically AND grouped (PSR-12-compatible); unordered imports fail PHPCS. | [`08-spacing-and-imports.md`](./08-spacing-and-imports.md) |
| AT-PHP-12 | Methods MUST be separated by exactly one blank line; double-blank or zero-blank fail PHPCS. | [`08-spacing-and-imports.md`](./08-spacing-and-imports.md) |

### Standards reference & cross-language consistency (files 07, 10)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-PHP-13 | The PHP standards-reference subfolder MUST be the SSOT; rules duplicated elsewhere MUST link back — drift is a Code-Red consistency bug. | [`07-php-standards-reference/00-overview.md`](./07-php-standards-reference/00-overview.md) |
| AT-PHP-14 | PHP–Go consistency audit MUST be re-run on every minor release AND any divergence MUST be either resolved OR documented with a rationale; un-resolved drift fails review. | [`10-php-go-consistency-audit.md`](./10-php-go-consistency-audit.md) |

---

## Verification

```bash
# Backed enums only
rg -nP "^\s*enum\s+\w+\s*:\s*string" src/Enums/

# Forbidden function scan
rg -nP "\b(extract|eval)\(" src/

# ResponseKeyType discipline
rg -nP "=>\s*'[A-Z]" src/ | grep -v 'ResponseKeyType::'

# Hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../01-cross-language/07-database-naming.md`](../01-cross-language/07-database-naming.md) — DB naming SSOT
- [`../06-ai-optimization/05-enum-naming-quick-reference.md`](../06-ai-optimization/05-enum-naming-quick-reference.md) — Cross-language enum rules
- [`../../15-wp-plugin-how-to/05-helpers-responses-and-integration/97-acceptance-criteria.md`](../../15-wp-plugin-how-to/05-helpers-responses-and-integration/97-acceptance-criteria.md) — WP envelope wrapper

---

*Curated 2026-04-25 — closes batch-17 item 3. Replaces v3.1.0 placeholder.*
