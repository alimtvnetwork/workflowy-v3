# Types Folder Convention — Acceptance Criteria

> **Version:** 2.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## Purpose

Testable acceptance criteria for the cross-language `types/` folder convention (Go, TypeScript, PHP, Rust, C#).

ID format: `AT-TYPESFOLDERCONVENTION-NN`.

---

## Criteria

### Structure (AT-TYPESFOLDERCONVENTION-01..03)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-TYPESFOLDERCONVENTION-01 | Every project has a single `types/` (or `src/types/`) folder; no parallel `models/`, `dto/`, `interfaces/` siblings holding type aliases. | [`01-principle-and-structure.md`](./01-principle-and-structure.md) |
| AT-TYPESFOLDERCONVENTION-02 | Each type definition lives in its own file (`one-definition-per-file` rule). | [`02-rules.md`](./02-rules.md) |
| AT-TYPESFOLDERCONVENTION-03 | Filename matches the type name converted to kebab-case (e.g. `ContentType` → `content-type.ts`). | [`02-rules.md`](./02-rules.md) |

### Rules (AT-TYPESFOLDERCONVENTION-04..06)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-TYPESFOLDERCONVENTION-04 | A type alias is created whenever the same generic instantiation (`Result<User, AppError>`, `Map<string, Item[]>`) is used in 2+ places. | [`02-rules.md`](./02-rules.md) |
| AT-TYPESFOLDERCONVENTION-05 | Enums are preferred over string-literal-union constants when the value set is closed and shared. | [`02-rules.md`](./02-rules.md) |
| AT-TYPESFOLDERCONVENTION-06 | Type values are immutable (`readonly`, `as const`, `Readonly<T>`); see [`../18-code-mutation-avoidance.md`](../18-code-mutation-avoidance.md). | [`02-rules.md`](./02-rules.md) + [`../18-code-mutation-avoidance.md`](../18-code-mutation-avoidance.md) |

### Common Types (AT-TYPESFOLDERCONVENTION-07..08)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-TYPESFOLDERCONVENTION-07 | The five common types (`ContentType`, `HttpMethod`, `HttpStatus`, `SortDirection`, `Environment`) are defined as enums in the documented locations. | [`03-common-type-definitions.md`](./03-common-type-definitions.md) |
| AT-TYPESFOLDERCONVENTION-08 | Each common type's filename and exported name match across Go, TypeScript, and PHP implementations. | [`03-common-type-definitions.md`](./03-common-type-definitions.md) |

### Anti-Patterns (AT-TYPESFOLDERCONVENTION-09..11)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-TYPESFOLDERCONVENTION-09 | No file declares more than one exported type. | [`04-anti-patterns-and-checklist.md`](./04-anti-patterns-and-checklist.md) |
| AT-TYPESFOLDERCONVENTION-10 | No `any`, `unknown`, or `interface{}` (Go) appears in any `types/` file. | [`04-anti-patterns-and-checklist.md`](./04-anti-patterns-and-checklist.md) + [`../13-strict-typing.md`](../13-strict-typing.md) |
| AT-TYPESFOLDERCONVENTION-11 | The reviewer checklist in `04-anti-patterns-and-checklist.md` is run on every PR that touches `types/`. | [`04-anti-patterns-and-checklist.md`](./04-anti-patterns-and-checklist.md) |

---

## Verification

```bash
grep -rn "AT-TYPESFOLDERCONVENTION-" spec/02-coding-guidelines/01-cross-language/27-types-folder-convention/
node scripts/spec-hygiene/00-run-all.mjs
ls src/types/
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Subsection overview
- [`../26-magic-values-and-immutability.md`](../26-magic-values-and-immutability.md) — No magic strings
- [`../13-strict-typing.md`](../13-strict-typing.md) — Strict typing rules
- [`../25-generic-return-types.md`](../25-generic-return-types.md) — Result[T] patterns
- [`spec/19-glossary.md`](../../../19-glossary.md) — Terminology SSOT
- [`spec/20-enums-index.md`](../../../20-enums-index.md) — Enum registry

*Curated v2.0.0 — 2026-04-25 (UTC+8). Replaced auto-generated H-2.1 scaffold.*
