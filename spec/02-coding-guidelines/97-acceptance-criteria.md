# Coding Guidelines — Acceptance Criteria

> **Version:** 3.2.0  
> **Updated:** 2026-04-29 — renamed 5 section headers `AC-01..05` → `AT-CG-G01..G05` and 22 row IDs `AC-001..022` → `AT-CG-001..022` (audit task #20, P2 hot-spot closed). Cascading rename applied to `00-overview-condensed.md` (same 27 IDs duplicated). New `AT-CG-` namespace registered. **27 active legacy IDs migrated.**

---

## Overview

30 testable criteria across 5 guideline categories, consolidating subfolder-level acceptance criteria.

---

## AT-CG-G01: Cross-Language Standards

| # | Criterion | Source |
|---|-----------|--------|
| AT-CG-001 | Boolean principles define naming (`isX`, `hasX`, `canX`) and evaluation patterns | `01-cross-language/02-boolean-principles/00-overview.md` |
| AT-CG-002 | Casting elimination patterns cover type-safe alternatives to type assertions | `01-cross-language/03-casting-elimination-patterns/00-overview.md` |
| AT-CG-003 | Code style defines formatting, naming, and structural conventions | `01-cross-language/04-code-style/00-overview.md` |
| AT-CG-004 | All guidelines include ❌ (forbidden) and ✅ (compliant) code examples | `01-cross-language/15-master-coding-guidelines/00-overview.md` |
| AT-CG-005 | DRY principles documented with refactoring patterns | `01-cross-language/08-dry-principles.md` |
| AT-CG-006 | Cyclomatic complexity limits defined with enforcement rules | `01-cross-language/06-cyclomatic-complexity.md` |

---

## AT-CG-G02: TypeScript Standards

| # | Criterion | Source |
|---|-----------|--------|
| AT-CG-007 | Connection status enums define all valid states with TypeScript string literals | `02-typescript/` |
| AT-CG-008 | Type definitions avoid `any` and use proper generic constraints | `02-typescript/` |
| AT-CG-009 | React component patterns follow functional component with hooks style | `02-typescript/` |
| AT-CG-010 | State management patterns use Zustand stores with typed selectors | `02-typescript/` |

---

## AT-CG-G03: Golang Standards

| # | Criterion | Source |
|---|-----------|--------|
| AT-CG-011 | Boolean standards define naming and evaluation patterns per Go idioms | `03-golang/02-boolean-standards.md` |
| AT-CG-012 | Error handling uses `apperror.Result[T]` pattern consistently | `03-golang/` |
| AT-CG-013 | HTTP method enum defines typed constants | `03-golang/03-httpmethod-enum.md` |
| AT-CG-014 | Service layer follows interface-based dependency injection | `03-golang/` |

---

## AT-CG-G04: PHP Standards

| # | Criterion | Source |
|---|-----------|--------|
| AT-CG-015 | Class naming follows WordPress PSR-4 autoloading conventions | `04-php/` |
| AT-CG-016 | Database queries use $wpdb prepared statements exclusively | `04-php/` |
| AT-CG-017 | Type declarations (parameter + return types) required on all functions | `04-php/` |
| AT-CG-018 | Input sanitization and output escaping follow WordPress security standards | `04-php/` |

---

## AT-CG-G05: Rust Standards

| # | Criterion | Source |
|---|-----------|--------|
| AT-CG-019 | Naming conventions follow Rust idioms (snake_case for functions, PascalCase for types) | `05-rust/` |
| AT-CG-020 | Error handling uses `Result<T, E>` pattern with custom error types | `05-rust/` |
| AT-CG-021 | Async patterns use tokio runtime with proper cancellation handling | `05-rust/` |
| AT-CG-022 | Memory safety patterns documented for FFI boundaries | `05-rust/` |

---

## Cross-References

- [Overview](./00-overview.md)
- [Cross-Language Standards](./01-cross-language/00-overview.md)
- [TypeScript Standards](./02-typescript/00-overview.md)
- [Golang Standards](./03-golang/00-overview.md)
- [PHP Standards](./04-php/00-overview.md)
- [Rust Standards](./05-rust/00-overview.md)

---

## Fixtures

All `AT-*` rows in this rollup AND in every sub-rollup under `spec/02-coding-guidelines/**/97-acceptance-criteria.md` are lint-shape ATs covered by a single canonical template:

→ [`97a-acceptance-criteria-fixtures.md`](./97a-acceptance-criteria-fixtures.md)

The template + nine per-rollup verification recipes subsume all 363 coding-guideline ATs per the lint-shape opt-out in [`spec/01-spec-authoring-guide/19-acceptance-criteria-io-table.md`](../01-spec-authoring-guide/19-acceptance-criteria-io-table.md) § "Two AT shapes that opt out of the JSON rows".
