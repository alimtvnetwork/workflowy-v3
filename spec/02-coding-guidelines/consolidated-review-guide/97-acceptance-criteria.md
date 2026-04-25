# Consolidated Review Guide — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 15 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-CONSOLIDATEDREVIEWGUIDE-01` … `AT-CONSOLIDATEDREVIEWGUIDE-15`

> The consolidated review guide is the **rollup checklist** used during code review to enforce all cross-language coding guidelines in one pass.

---

## Criteria

### Workflow & process (file 01)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-CONSOLIDATEDREVIEWGUIDE-01 | Every PR MUST run through the §01 workflow: (1) self-review against `99-quick-checklist.md`, (2) automated hygiene checks, (3) reviewer pass with this AT file as scorecard. | [`01-workflow-and-process.md`](./01-workflow-and-process.md), [`99-quick-checklist.md`](./99-quick-checklist.md) |
| AT-CONSOLIDATEDREVIEWGUIDE-02 | A retro entry is filed in `03-error-manage/01-error-resolution/03-retrospectives/` for every Code-Red rule violated in a merged PR. | [`01-workflow-and-process.md`](./01-workflow-and-process.md), [`../../03-error-manage/01-error-resolution/97-acceptance-criteria.md`](../../03-error-manage/01-error-resolution/97-acceptance-criteria.md) |

### Function & file size (file 02)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-CONSOLIDATEDREVIEWGUIDE-03 | Functions ≤ **15 logical lines** (error handling exempt); files ≤ **200 lines** (test files exempt up to 400). | [`02-function-and-file-size.md`](./02-function-and-file-size.md), [`../01-cross-language/04-code-style/97-acceptance-criteria.md`](../01-cross-language/04-code-style/97-acceptance-criteria.md) |

### Parameters & returns (file 03)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-CONSOLIDATEDREVIEWGUIDE-04 | Functions accept ≤ **3 positional params**; 4+ requires an options struct/object. | [`03-parameters-and-returns.md`](./03-parameters-and-returns.md) |
| AT-CONSOLIDATEDREVIEWGUIDE-05 | Functions return at most **`(value, error)`** (Go) or `Result<T, E>` (TS/PHP); 3-tuple returns are forbidden. | [`03-parameters-and-returns.md`](./03-parameters-and-returns.md), [`../01-cross-language/25-generic-return-types.md`](../01-cross-language/25-generic-return-types.md) |

### Naming, booleans, conditionals (files 04, 05)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-CONSOLIDATEDREVIEWGUIDE-06 | Naming follows the matrix in §04 (PascalCase types, camelCase locals, snake_case Go files, PascalCase DB keys); divergence is a doc bug. | [`04-naming-conventions.md`](./04-naming-conventions.md) |
| AT-CONSOLIDATEDREVIEWGUIDE-07 | Booleans use positive prefixes (`is`, `has`, `can`, `should`, `was`); plurals (`isAdmins`) and negatives (`isNotReady`) are forbidden. | [`05-boolean-and-conditionals.md`](./05-boolean-and-conditionals.md), [`../01-cross-language/02-boolean-principles/97-acceptance-criteria.md`](../01-cross-language/02-boolean-principles/97-acceptance-criteria.md) |
| AT-CONSOLIDATEDREVIEWGUIDE-08 | **Zero nested `if` statements** — flatten with guard clauses, early returns, or extract to a helper; nested `if` in business code is a Code-Red rule. | [`05-boolean-and-conditionals.md`](./05-boolean-and-conditionals.md) |

### Enums, constants, type safety (files 06, 08)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-CONSOLIDATEDREVIEWGUIDE-09 | Magic numbers/strings in business code are forbidden — use enums (finite sets) or named constants (single values). | [`06-enums-and-constants.md`](./06-enums-and-constants.md), [`../01-cross-language/26-magic-values-and-immutability.md`](../01-cross-language/26-magic-values-and-immutability.md) |
| AT-CONSOLIDATEDREVIEWGUIDE-10 | `any`/`interface{}`/`mixed` is forbidden in business code (test mocks exempt); migration to a typed equivalent is mandatory before merge. | [`08-type-safety.md`](./08-type-safety.md), [`../01-cross-language/13-strict-typing.md`](../01-cross-language/13-strict-typing.md) |

### Error handling & parallel execution (files 07, 09)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-CONSOLIDATEDREVIEWGUIDE-11 | Errors use the `apperror`/`AppError` envelope (NOT `fmt.Errorf` / `new Error` / `WP_Error::add` directly); swallowed errors (catch + return null/false without log) is Code Red. | [`07-error-handling.md`](./07-error-handling.md), [`../../03-error-manage/02-error-architecture/06-apperror-package/`](../../03-error-manage/02-error-architecture/06-apperror-package/) |
| AT-CONSOLIDATEDREVIEWGUIDE-12 | Independent async calls run in parallel via `Promise.all` (TS) / `errgroup.Group` (Go) / `Guzzle\Pool` (PHP); sequential `await` of independent calls is a perf bug. | [`09-parallel-execution.md`](./09-parallel-execution.md) |

### Database, SQL safety, logging (files 10, 11, 12)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-CONSOLIDATEDREVIEWGUIDE-13 | DB column/table identifiers use **PascalCase**; queries with reserved words MUST quote identifiers. SQL is parameterized — string concatenation of user input is a Code-Red SQLi risk. | [`10-database-conventions.md`](./10-database-conventions.md), [`11-sql-safety.md`](./11-sql-safety.md) |
| AT-CONSOLIDATEDREVIEWGUIDE-14 | Logs are structured (key/value, NOT printf); every error log includes a stacktrace; PII fields are redacted per the documented allow-list. | [`12-logging.md`](./12-logging.md), [`../../03-error-manage/02-error-architecture/07-logging-and-diagnostics/`](../../03-error-manage/02-error-architecture/07-logging-and-diagnostics/) |

### Security & caching (files 13, 14)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-CONSOLIDATEDREVIEWGUIDE-15 | Reviewer verifies the OWASP-Top-10 checklist in §13 AND the cache-invalidation rules in §14 (TTL ≤ 24h for mutable resources, mutation MUST invalidate the cache key). | [`13-security-owasp.md`](./13-security-owasp.md), [`14-caching.md`](./14-caching.md) |

---

## Verification

```bash
# Run quick checklist via hygiene
node scripts/spec-hygiene/00-run-all.mjs

# Confirm 99-quick-checklist.md mirrors AT IDs
rg -c '^- \[ \] ' spec/02-coding-guidelines/consolidated-review-guide/99-quick-checklist.md
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`99-quick-checklist.md`](./99-quick-checklist.md) — One-page reviewer checklist
- [`../01-cross-language/15-master-coding-guidelines/97-acceptance-criteria.md`](../01-cross-language/15-master-coding-guidelines/97-acceptance-criteria.md) — Master cross-language SSOT
- [`../../03-error-manage/01-error-resolution/97-acceptance-criteria.md`](../../03-error-manage/01-error-resolution/97-acceptance-criteria.md) — Error resolution rollup

---

*Curated 2026-04-25 — closes A-22 (batch 11). Replaces v0.1.0 stub.*
