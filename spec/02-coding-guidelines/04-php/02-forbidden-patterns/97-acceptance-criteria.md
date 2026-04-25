# PHP Forbidden Patterns — Acceptance Criteria

> **Version:** 2.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## Purpose

Testable acceptance criteria for PHP forbidden patterns (WordPress companion plugins, PHP 8.1+). Each criterion maps to a section in the consolidated PHP standards.

ID format: `AT-FORBIDDENPATTERNS-NN`.

---

## Criteria

### Error Handling (AT-FORBIDDENPATTERNS-01..02)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-FORBIDDENPATTERNS-01 | (§1) `try/catch` swallowing without re-throwing or logging is forbidden; every catch records to the documented logger. | [`01-error-handling.md`](./01-error-handling.md) |
| AT-FORBIDDENPATTERNS-02 | (§7) Error type identifiers come from the `ErrorType` constants class — no string literals for error codes. | [`01-error-handling.md`](./01-error-handling.md) |

### Magic Strings (AT-FORBIDDENPATTERNS-03..04)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-FORBIDDENPATTERNS-03 | (§2) WordPress hook names come from the `HookType` enum — no raw `add_action('init', …)` strings. | [`02-magic-strings-hooks-paths.md`](./02-magic-strings-hooks-paths.md) |
| AT-FORBIDDENPATTERNS-04 | (§3) File paths come from the documented Path enums — no raw `__DIR__ . '/...'` concatenation in business logic. | [`02-magic-strings-hooks-paths.md`](./02-magic-strings-hooks-paths.md) |

### Boolean & Architecture (AT-FORBIDDENPATTERNS-05..07)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-FORBIDDENPATTERNS-05 | (§4) Boolean logic follows the cross-language P1..P8 boolean principles. | [`03-boolean-and-architecture.md`](./03-boolean-and-architecture.md) + [`../../01-cross-language/02-boolean-principles/97-acceptance-criteria.md`](../../01-cross-language/02-boolean-principles/97-acceptance-criteria.md) |
| AT-FORBIDDENPATTERNS-06 | (§5) Initialization runs once in a documented bootstrap class; no work in global scope or constructors with side effects. | [`03-boolean-and-architecture.md`](./03-boolean-and-architecture.md) |
| AT-FORBIDDENPATTERNS-07 | (§6) Conditions with 2+ logical operators are extracted into named guard methods. | [`03-boolean-and-architecture.md`](./03-boolean-and-architecture.md) |

### Namespace Imports — CRITICAL (AT-FORBIDDENPATTERNS-08)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-FORBIDDENPATTERNS-08 | (§5A) Every trait and class imports its dependencies via `use` statements; no fully-qualified inline names in method bodies. Postmortem-driven hard rule. | [`04-namespace-imports-critical.md`](./04-namespace-imports-critical.md) |

### Response Keys & Plugin Config (AT-FORBIDDENPATTERNS-09..10)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-FORBIDDENPATTERNS-09 | (§8) Every REST response key is a `ResponseKeyType` enum value — no string literals. | [`05-response-key-and-plugin-config.md`](./05-response-key-and-plugin-config.md) |
| AT-FORBIDDENPATTERNS-10 | (§9) Plugin configuration keys are typed via `PluginConfigType` enum; no untyped `get_option('key')` calls. | [`05-response-key-and-plugin-config.md`](./05-response-key-and-plugin-config.md) |

### Date Formats & Casing (AT-FORBIDDENPATTERNS-11..12)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-FORBIDDENPATTERNS-11 | (§10) Date format strings come from `DateFormatType` enum; no inline `date('Y-m-d H:i:s')` literals. | [`06-date-formats-and-response-casing.md`](./06-date-formats-and-response-casing.md) |
| AT-FORBIDDENPATTERNS-12 | (§11) REST response JSON keys are PascalCase — no snake_case or camelCase keys cross the API boundary. | [`06-date-formats-and-response-casing.md`](./06-date-formats-and-response-casing.md) + [`../../../04-database-conventions/06-rest-api-format/01-key-format.md`](../../../04-database-conventions/06-rest-api-format/01-key-format.md) |

### Reviewer Checklist (AT-FORBIDDENPATTERNS-13)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-FORBIDDENPATTERNS-13 | The 7-section copy-paste checklist in `07-checklist.md` runs against every PHP PR. | [`07-checklist.md`](./07-checklist.md) |

---

## Verification

```bash
grep -rn "AT-FORBIDDENPATTERNS-" spec/02-coding-guidelines/04-php/02-forbidden-patterns/
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Subsection overview
- [`../07-php-standards-reference/00-overview.md`](../07-php-standards-reference/00-overview.md) — Full PHP standards
- [`../01-enums/97-acceptance-criteria.md`](../01-enums/97-acceptance-criteria.md) — PHP enums criteria
- [`../../01-cross-language/02-boolean-principles/97-acceptance-criteria.md`](../../01-cross-language/02-boolean-principles/97-acceptance-criteria.md) — Boolean principles
- [`spec/20-enums-index.md`](../../../20-enums-index.md) — Enum registry

*Curated v2.0.0 — 2026-04-25 (UTC+8). Replaced auto-generated H-2.1 scaffold.*
