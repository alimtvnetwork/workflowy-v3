# Master Coding Guidelines — Acceptance Criteria

> **Version:** 2.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## Purpose

Testable acceptance criteria for the master cross-language coding guidelines. These are the umbrella rules every other coding-guideline subsection inherits from.

ID format: `AT-MASTERCODINGGUIDELINES-NN`.

---

## Criteria

### Naming & Database (AT-MASTERCODINGGUIDELINES-01..04)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-MASTERCODINGGUIDELINES-01 | Files use `kebab-case`, classes/types use `PascalCase`, functions/variables use `camelCase`; verified by ESLint + filename lint. | [`01-naming-and-database.md`](./01-naming-and-database.md) |
| AT-MASTERCODINGGUIDELINES-02 | Database table and column names use `PascalCase`. | [`01-naming-and-database.md`](./01-naming-and-database.md) + `mem://constraints/coding-guidelines` |
| AT-MASTERCODINGGUIDELINES-03 | Spec files follow `NN-kebab-case.md` (verified by `scripts/spec-hygiene/04-check-naming.mjs`). | `scripts/spec-hygiene/04-check-naming.mjs` |
| AT-MASTERCODINGGUIDELINES-04 | No file name uses snake_case, SCREAMING_CASE, or camelCase. | [`01-naming-and-database.md`](./01-naming-and-database.md) |

### Boolean & Enum (AT-MASTERCODINGGUIDELINES-05..06)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-MASTERCODINGGUIDELINES-05 | Every boolean follows P1..P8 (see `02-boolean-principles/97-acceptance-criteria.md`). | [`02-boolean-and-enum.md`](./02-boolean-and-enum.md) |
| AT-MASTERCODINGGUIDELINES-06 | Every enum is registered in `spec/20-enums-index.md` and stays in sync (verified by hygiene script 15). | [`02-boolean-and-enum.md`](./02-boolean-and-enum.md) + `scripts/spec-hygiene/15-check-enums-in-sync.mjs` |

### Code Style & Errors (AT-MASTERCODINGGUIDELINES-07..10)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-MASTERCODINGGUIDELINES-07 | No nested `if` statements — use early-return guard clauses. | [`03-code-style-and-errors.md`](./03-code-style-and-errors.md) + `mem://constraints/coding-guidelines` |
| AT-MASTERCODINGGUIDELINES-08 | Function bodies are limited to 15 lines of logic (excluding signature, braces, blank lines). | [`03-code-style-and-errors.md`](./03-code-style-and-errors.md) |
| AT-MASTERCODINGGUIDELINES-09 | Functions have at most 3 parameters; more requires an options object. | `mem://constraints/coding-guidelines` |
| AT-MASTERCODINGGUIDELINES-10 | Errors propagate via `Result<T, E>` or typed `throw`; no silent `catch (e) {}` blocks. | [`03-code-style-and-errors.md`](./03-code-style-and-errors.md) |

### Type Safety (AT-MASTERCODINGGUIDELINES-11..12)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-MASTERCODINGGUIDELINES-11 | Every function returns a single value (no out-params, no tuple-as-multi-return); use a typed object if multiple values are needed. | [`04-type-safety.md`](./04-type-safety.md) |
| AT-MASTERCODINGGUIDELINES-12 | No `as` casting except inside dedicated brand constructors and JSON parse boundaries. | [`04-type-safety.md`](./04-type-safety.md) |

### Magic Strings & Organization (AT-MASTERCODINGGUIDELINES-13..14)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-MASTERCODINGGUIDELINES-13 | No magic string or magic number appears in business logic — extract to a named constant or enum. | [`05-magic-strings-and-organization.md`](./05-magic-strings-and-organization.md) |
| AT-MASTERCODINGGUIDELINES-14 | Array keys / object keys used as identifiers are typed (string literal union or enum), never raw `string`. | [`05-magic-strings-and-organization.md`](./05-magic-strings-and-organization.md) |

### Advanced Patterns (AT-MASTERCODINGGUIDELINES-15..17)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-MASTERCODINGGUIDELINES-15 | All mutation is local (no shared mutable state); cross-component state lives in a documented store. | [`06-advanced-patterns.md`](./06-advanced-patterns.md) |
| AT-MASTERCODINGGUIDELINES-16 | Null-safety is enforced via `isDefined()` guards or non-null branded types — no `!` non-null assertion in business code. | [`06-advanced-patterns.md`](./06-advanced-patterns.md) |
| AT-MASTERCODINGGUIDELINES-17 | The 7-item checklist in `07-checklist.md` runs against every PR (manual or automated). | [`07-checklist.md`](./07-checklist.md) |

---

## Verification

```bash
grep -rn "AT-MASTERCODINGGUIDELINES-" spec/02-coding-guidelines/01-cross-language/15-master-coding-guidelines/
node scripts/spec-hygiene/00-run-all.mjs
bunx tsc --noEmit
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Subsection overview
- [`07-checklist.md`](./07-checklist.md) — Reviewer checklist
- [`../02-boolean-principles/97-acceptance-criteria.md`](../02-boolean-principles/97-acceptance-criteria.md) — Boolean specifics
- [`../04-code-style/97-acceptance-criteria.md`](../04-code-style/97-acceptance-criteria.md) — Code-style specifics
- [`../27-types-folder-convention/97-acceptance-criteria.md`](../27-types-folder-convention/97-acceptance-criteria.md) — Types folder rules
- [`spec/19-glossary.md`](../../../19-glossary.md) — Terminology SSOT
- [`spec/20-enums-index.md`](../../../20-enums-index.md) — Enum registry

*Curated v2.0.0 — 2026-04-25 (UTC+8). Replaced auto-generated H-2.1 scaffold.*
