# Coding Rules Summary — Quick Reference

> **Source:** `spec/04-coding-guidelines/` (10 files)
> **Updated:** 2026-03-30

## TypeScript-Specific Rules (this project)

| Rule | Source File |
|------|------------|
| PascalCase file names (`BulletItem.tsx`) | `00-master` §1.1 |
| camelCase variables and methods | `00-master` §1.1 |
| PascalCase classes, types, enums | `00-master` §1.1 |
| Abbreviations: `Id` not `ID`, `Url` not `URL` | `00-master` §1.2 |
| Zero underscores in identifiers | `00-master` §1.3 |
| PascalCase DB tables/columns (quoted in SQLite) | `05-database-naming` |
| PascalCase JSON/API keys | `00-master` §1.1 |
| `is`/`has` prefix on all booleans | `02-boolean-principles` P1 |
| No negative words in boolean names | `02-boolean-principles` P2 |
| No raw `!` on function calls — use named guards | `02-boolean-principles` P3 |
| Extract complex boolean expressions to named vars | `02-boolean-principles` P4 |
| No boolean flag parameters — split into named methods | `07-function-naming` |
| No mixed polarity (`isX && !isY`) — extract | `02-boolean-principles` P6 |
| No inline statements in conditions | `02-boolean-principles` P7 |
| Use `isDefined()`/`isDefinedAndValid()` guards | `02-boolean-principles` P8 |
| No raw filesystem calls — use wrapper utilities | `08-no-negatives` |
| Always use braces — no single-line `if` | `03-code-style` R1 |
| Zero nested `if` — absolute ban | `03-code-style` R2 |
| Max 15 lines per function body (error lines exempt) | `03-code-style` R6 |
| Blank line before `return`/`throw` | `03-code-style` R4 |
| `>2` params → one per line with trailing comma | `03-code-style` R9a |
| Method chaining — each call on its own line (>2) | `03-code-style` R11 |
| No empty line after opening brace | `03-code-style` R12 |
| No empty line at start of file | `03-code-style` R13 |
| `strict: true` in tsconfig, zero `any` | `09-strict-typing` |
| No file > 300 lines | `06-dry-principles` §5 |
| DRY: extract at 3+ duplicate lines | `06-dry-principles` §2 |
| Guard clauses / early returns for flat code | `04-cyclomatic-complexity` |
| Result guard: always check errors before accessing values | `00-master` §6 |
| Static factory constructors exempt from `is`/`has` | `02-boolean-principles` |
