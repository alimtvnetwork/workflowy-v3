# Golang Standards Reference — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 14 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-GOLANGSTANDARDSREFERENCE-01` … `AT-GOLANGSTANDARDSREFERENCE-14`

---

## Criteria

### File & function rules (file 01)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-GOLANGSTANDARDSREFERENCE-01 | Files ≤ 300 lines (hard max 400), functions ≤ **15 logical lines**, parameters ≤ **3**; longer functions/files MUST be extracted/split. | [`01-file-and-function-rules.md`](./01-file-and-function-rules.md) |
| AT-GOLANGSTANDARDSREFERENCE-02 | **Nested `if` is forbidden** — use early-return guards or extracted helpers; documented exemptions only. | [`01-file-and-function-rules.md`](./01-file-and-function-rules.md), [`../../01-cross-language/04-code-style/97-acceptance-criteria.md`](../../01-cross-language/04-code-style/97-acceptance-criteria.md) |
| AT-GOLANGSTANDARDSREFERENCE-03 | File names use `snake_case.go` and group by domain (not by layer); test files MUST be `_test.go` siblings of the unit they test. | [`01-file-and-function-rules.md`](./01-file-and-function-rules.md) |

### Type safety & errors (file 02)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-GOLANGSTANDARDSREFERENCE-04 | `interface{}` / `any` are forbidden in business logic; type switches require an explicit `default` branch that returns a typed error. | [`02-type-safety-and-errors.md`](./02-type-safety-and-errors.md) |
| AT-GOLANGSTANDARDSREFERENCE-05 | Errors are constructed via the `apperror` package with stack trace; raw `errors.New` / `fmt.Errorf` in business code is forbidden. | [`02-type-safety-and-errors.md`](./02-type-safety-and-errors.md), [`../../../03-error-manage/02-error-architecture/06-apperror-package/01-apperror-reference/02-apperror-struct/97-acceptance-criteria.md`](../../../03-error-manage/02-error-architecture/06-apperror-package/01-apperror-reference/02-apperror-struct/97-acceptance-criteria.md) |
| AT-GOLANGSTANDARDSREFERENCE-06 | Functions return at most ONE result value plus error (`(T, error)` or `Result[T]`); 3+ return values fail review unless documented as a constructor exception. | [`02-type-safety-and-errors.md`](./02-type-safety-and-errors.md) |
| AT-GOLANGSTANDARDSREFERENCE-07 | Errors are NEVER swallowed — every `if err != nil` branch logs OR returns OR wraps; empty branches and `_ = err` are forbidden. | [`02-type-safety-and-errors.md`](./02-type-safety-and-errors.md), [`../../consolidated-review-guide/99-quick-checklist.md`](../../consolidated-review-guide/99-quick-checklist.md) |

### Database & structs (file 03)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-GOLANGSTANDARDSREFERENCE-08 | Database tables/columns/keys use **PascalCase**; primary keys are `{TableName}Id`. | [`03-database-and-structs.md`](./03-database-and-structs.md), [`mem://constraints/coding-guidelines`](mem://constraints/coding-guidelines) |
| AT-GOLANGSTANDARDSREFERENCE-09 | All DB calls go through the `dbutil` wrapper (parameterized, instrumented); raw `db.Exec` / `db.Query` in handlers is forbidden. | [`03-database-and-structs.md`](./03-database-and-structs.md) |
| AT-GOLANGSTANDARDSREFERENCE-10 | Structs separate domain (immutable value), DTO (transport), and persistence (DB row) — single struct serving all three roles is forbidden. | [`03-database-and-structs.md`](./03-database-and-structs.md) |

### Naming & organization (file 04)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-GOLANGSTANDARDSREFERENCE-11 | Booleans use positive `Is`/`Has`/`Can`/`Should` prefixes; negative prefixes are forbidden; guards are `isDefined`/`isEmpty` style. | [`04-naming-and-organization.md`](./04-naming-and-organization.md), [`../02-boolean-standards/97-acceptance-criteria.md`](../02-boolean-standards/97-acceptance-criteria.md) |

### Enums & DRY (file 05)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-GOLANGSTANDARDSREFERENCE-12 | Enums use typed `const` blocks with a base type alias (e.g., `type Status uint8`); raw string/int literals representing enum values are forbidden. | [`05-enums-and-dry.md`](./05-enums-and-dry.md), [`spec/20-enums-index.md`](../../../20-enums-index.md) |

### Concurrency & patterns (file 06)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-GOLANGSTANDARDSREFERENCE-13 | Independent goroutines use `errgroup` (or documented equivalent) — bare `go func()` without recover OR error reporting is forbidden in production code. | [`06-concurrency-and-patterns.md`](./06-concurrency-and-patterns.md) |
| AT-GOLANGSTANDARDSREFERENCE-14 | Forbidden patterns listed in §06 (e.g., naked `panic`, mutable globals, `init()` with side effects) MUST NOT appear in the codebase; each forbidden item names the safe replacement. | [`06-concurrency-and-patterns.md`](./06-concurrency-and-patterns.md) |

---

## Verification

```bash
rg -n 'errors\.New|fmt\.Errorf' --type go server/ | grep -v '_test.go\|/apperror/'
rg -nU 'go func\(\)\s*\{[^}]*\}\(\)' --type go server/
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../02-boolean-standards/97-acceptance-criteria.md`](../02-boolean-standards/97-acceptance-criteria.md) — Go boolean standards
- [`../../01-cross-language/04-code-style/97-acceptance-criteria.md`](../../01-cross-language/04-code-style/97-acceptance-criteria.md) — Code-style rollup
- [`../../01-cross-language/15-master-coding-guidelines/97-acceptance-criteria.md`](../../01-cross-language/15-master-coding-guidelines/97-acceptance-criteria.md) — Master cross-language SSOT
- [`../../../03-error-manage/02-error-architecture/06-apperror-package/01-apperror-reference/02-apperror-struct/97-acceptance-criteria.md`](../../../03-error-manage/02-error-architecture/06-apperror-package/01-apperror-reference/02-apperror-struct/97-acceptance-criteria.md) — apperror struct

---

*Curated 2026-04-25 — closes A-20 (batch 9). Replaces v0.1.0 stub.*


---

## Fixtures

Fixtures for every AT row in this file are covered by the global P2g sweep — see [`../../../97a-acceptance-criteria-fixtures.md`](../../../97a-acceptance-criteria-fixtures.md) (apply the matching pattern by section).
