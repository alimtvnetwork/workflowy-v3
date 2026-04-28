# Master Coding Guidelines — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 15 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-MASTERCODINGGUIDELINES-01` … `AT-MASTERCODINGGUIDELINES-15`

> **Role:** Cross-language SSOT that mirrors the per-language specs (Go / TS / PHP / Rust). Each criterion below must hold uniformly across ALL supported languages OR document its language scope explicitly.

---

## Criteria

### Naming & database (file 01)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-MASTERCODINGGUIDELINES-01 | Database tables, columns, and keys use **PascalCase**; primary keys are `{TableName}Id` with `INTEGER AUTOINCREMENT` (SQLite) or matching dialect equivalent. | [`01-naming-and-database.md`](./01-naming-and-database.md), [`mem://constraints/coding-guidelines`](mem://constraints/coding-guidelines) |
| AT-MASTERCODINGGUIDELINES-02 | All SQL is parameterized — string concatenation into SQL is forbidden; joins use views, not inline JOIN statements in business code. | [`01-naming-and-database.md`](./01-naming-and-database.md), [`../../consolidated-review-guide/99-quick-checklist.md`](../../consolidated-review-guide/99-quick-checklist.md) |

### Boolean & enum (file 02)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-MASTERCODINGGUIDELINES-03 | Booleans use positive `is`/`has`/`can`/`should` prefixes; negative prefixes (`not`, `disable`, `block`, `prevent`) are forbidden. | [`02-boolean-and-enum.md`](./02-boolean-and-enum.md), [`../02-boolean-principles/97-acceptance-criteria.md`](../02-boolean-principles/97-acceptance-criteria.md) |
| AT-MASTERCODINGGUIDELINES-04 | Enums replace magic strings/numbers in business logic; raw string literals representing a finite set are a review failure. | [`02-boolean-and-enum.md`](./02-boolean-and-enum.md), [`spec/20-enums-index.md`](../../../20-enums-index.md) |

### Code style & errors (file 03)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-MASTERCODINGGUIDELINES-05 | Functions ≤ **15 logical lines**, files ≤ 300 (hard max 400), parameters ≤ **3**; nested `if` is forbidden. | [`03-code-style-and-errors.md`](./03-code-style-and-errors.md), [`../04-code-style/97-acceptance-criteria.md`](../04-code-style/97-acceptance-criteria.md) |
| AT-MASTERCODINGGUIDELINES-06 | **Errors are never swallowed** (Code Red): every catch/recover MUST log + return OR re-throw with context; empty catches fail review. | [`03-code-style-and-errors.md`](./03-code-style-and-errors.md), [`../../consolidated-review-guide/99-quick-checklist.md`](../../consolidated-review-guide/99-quick-checklist.md) |
| AT-MASTERCODINGGUIDELINES-07 | Go errors use the `apperror` package with stack trace; raw `errors.New` / `fmt.Errorf` in business code is forbidden. | [`03-code-style-and-errors.md`](./03-code-style-and-errors.md), [`spec/03-error-manage/02-error-architecture/06-apperror-package/01-apperror-reference/02-apperror-struct/97-acceptance-criteria.md`](../../../03-error-manage/02-error-architecture/06-apperror-package/01-apperror-reference/02-apperror-struct/97-acceptance-criteria.md) |

### Type safety (file 04)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-MASTERCODINGGUIDELINES-08 | `any` (TS), `interface{}`/`any` (Go), and untyped arrays/maps are forbidden in business logic; type assertions require a runtime guard. | [`04-type-safety.md`](./04-type-safety.md), [`../../02-typescript/08-typescript-standards-reference/97-acceptance-criteria.md`](../../02-typescript/08-typescript-standards-reference/97-acceptance-criteria.md) |
| AT-MASTERCODINGGUIDELINES-09 | Discriminated unions use **named** interfaces — inline variant types in function signatures are forbidden. | [`04-type-safety.md`](./04-type-safety.md) |

### Magic strings & organization (file 05)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-MASTERCODINGGUIDELINES-10 | Magic numbers are forbidden — every numeric literal in business logic MUST come from a named constant or enum (exemptions: 0, 1, -1 in arithmetic). | [`05-magic-strings-and-organization.md`](./05-magic-strings-and-organization.md) |
| AT-MASTERCODINGGUIDELINES-11 | Code is organized by domain (feature folder), not by technical layer (no top-level `controllers/`, `services/`, `repositories/` for the whole app). | [`05-magic-strings-and-organization.md`](./05-magic-strings-and-organization.md) |

### Advanced patterns (file 06)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-MASTERCODINGGUIDELINES-12 | Independent async work uses `Promise.all` (TS) / goroutines + errgroup (Go) — sequential awaits over independent calls fail review. | [`06-advanced-patterns.md`](./06-advanced-patterns.md), [`../../consolidated-review-guide/99-quick-checklist.md`](../../consolidated-review-guide/99-quick-checklist.md) |
| AT-MASTERCODINGGUIDELINES-13 | Caches require a TTL; unbounded caches are forbidden. Cache invalidation on mutation is mandatory; never cache an error response as a success. | [`06-advanced-patterns.md`](./06-advanced-patterns.md), [`../../consolidated-review-guide/14-caching.md`](../../consolidated-review-guide/14-caching.md) |

### Checklist (file 07)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-MASTERCODINGGUIDELINES-14 | Every item in `07-checklist.md` maps to one of `AT-MASTERCODINGGUIDELINES-01..13` OR to a more specific per-topic AT (boolean-principles, code-style, etc.); orphan items fail review. | [`07-checklist.md`](./07-checklist.md) |
| AT-MASTERCODINGGUIDELINES-15 | The master file is consistent with the consolidated review guide quick-checklist — divergence between this folder and `consolidated-review-guide/99-quick-checklist.md` is a doc bug. | [`../../consolidated-review-guide/99-quick-checklist.md`](../../consolidated-review-guide/99-quick-checklist.md) |

---

## Verification

```bash
# Hygiene suite (cross-spec consistency)
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../04-code-style/97-acceptance-criteria.md`](../04-code-style/97-acceptance-criteria.md) — Code style rollup
- [`../02-boolean-principles/97-acceptance-criteria.md`](../02-boolean-principles/97-acceptance-criteria.md) — Boolean principles
- [`../../consolidated-review-guide/99-quick-checklist.md`](../../consolidated-review-guide/99-quick-checklist.md) — Pre-merge checklist
- [`spec/19-glossary.md`](../../../19-glossary.md) — Terminology SSOT
- [`spec/20-enums-index.md`](../../../20-enums-index.md) — Enum registry

---

*Curated 2026-04-25 — closes A-20 (batch 9). Replaces v0.1.0 stub.*


---

## Fixtures

Fixtures for every AT row in this file are covered by the global P2g sweep — see [`../../../97a-acceptance-criteria-fixtures.md`](../../../97a-acceptance-criteria-fixtures.md) (apply the matching pattern by section).
