# Quick Checklist (Pre-Merge)

> **Parent:** [00-overview.md](./00-overview.md)

Tick every box before opening a PR. If any item fails, open the matching numbered file (01–14) for the rule + examples.

- [ ] Functions ≤ 15 lines — see [02-function-and-file-size.md](./02-function-and-file-size.md)
- [ ] Files ≤ 300 lines (hard max 400)
- [ ] Max 3 parameters per function — see [03-parameters-and-returns.md](./03-parameters-and-returns.md)
- [ ] Single return value (Result/wrapper)
- [ ] No nested `if` — flat guards only — see [05-boolean-and-conditionals.md](./05-boolean-and-conditionals.md)
- [ ] No `!` on function calls — semantic inverse
- [ ] No magic strings/numbers — enums or constants — see [06-enums-and-constants.md](./06-enums-and-constants.md)
- [ ] Booleans start with `is`/`has` (99%) or `should` (rare) — see [04-naming-conventions.md](./04-naming-conventions.md)
- [ ] No mixed `&&`/`||` in one expression
- [ ] 🔴 All errors logged or returned — **never swallowed** (Code Red) — see [07-error-handling.md](./07-error-handling.md)
- [ ] Go errors use `apperror` with stack trace
- [ ] Independent async calls use `Promise.all` / goroutines — see [09-parallel-execution.md](./09-parallel-execution.md)
- [ ] No `any`/`interface{}`/`unknown` in business logic — see [08-type-safety.md](./08-type-safety.md)
- [ ] Discriminated unions use named interfaces — no inline variants
- [ ] DB tables/columns/keys in PascalCase — see [10-database-conventions.md](./10-database-conventions.md)
- [ ] Primary keys: `{TableName}Id` + `INTEGER AUTOINCREMENT`
- [ ] SQL parameterized — no string concatenation — see [11-sql-safety.md](./11-sql-safety.md)
- [ ] Joins use views
- [ ] Cache entries have TTL — no unbounded caches — see [14-caching.md](./14-caching.md)
- [ ] Cache invalidated on mutation — no stale reads after writes
- [ ] Never cache errors as success — invalidate or skip
- [ ] OWASP checklist reviewed — see [13-security-owasp.md](./13-security-owasp.md)
- [ ] Spec/issue file written before code — see [01-workflow-and-process.md](./01-workflow-and-process.md)
- [ ] Logger calls at key points — see [12-logging.md](./12-logging.md)
