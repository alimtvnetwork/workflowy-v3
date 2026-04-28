# Types Folder Convention — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 14 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-TYPESFOLDERCONVENTION-01` … `AT-TYPESFOLDERCONVENTION-14`

> Applies uniformly to **Go**, **TypeScript**, and **PHP**. Per-language specifics live in each language folder.

---

## Criteria

### Principle & structure (file 01)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-TYPESFOLDERCONVENTION-01 | Every package/module that defines shared types has a dedicated **`types/`** subfolder (Go: `internal/<domain>/types/`, TS: `src/<domain>/types/`, PHP: `includes/<Domain>/Types/`); types declared inline in service/handler files fail review. | [`01-principle-and-structure.md`](./01-principle-and-structure.md) |
| AT-TYPESFOLDERCONVENTION-02 | Folder structure is **flat or 1-level deep**; nesting beyond `types/<sub>/<file>` is forbidden — split into a sibling `types/` instead. | [`01-principle-and-structure.md`](./01-principle-and-structure.md) |
| AT-TYPESFOLDERCONVENTION-03 | The `types/` folder MUST NOT import from `services/`, `handlers/`, or `repositories/`; reverse dependency arrow only (types is the lowest layer). | [`01-principle-and-structure.md`](./01-principle-and-structure.md) |

### Rules (file 02)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-TYPESFOLDERCONVENTION-04 | **One definition per file** — each `.go`/`.ts`/`.php` file in `types/` defines exactly ONE primary type (plus its directly-related helper aliases); files with multiple unrelated structs fail review. | [`02-rules.md`](./02-rules.md) |
| AT-TYPESFOLDERCONVENTION-05 | Repeated generic instantiations (e.g., `Result[User]` used 5+ times) MUST be promoted to a named type alias (`type UserResult = Result[User]`); inline repetition is forbidden. | [`02-rules.md`](./02-rules.md), [`../25-generic-return-types.md`](../25-generic-return-types.md) |
| AT-TYPESFOLDERCONVENTION-06 | Enums replace constants for any finite, exhaustive set; an `enum`-shaped type defined as a bag of `const` strings/ints is forbidden. | [`02-rules.md`](./02-rules.md), [`../26-magic-values-and-immutability.md`](../26-magic-values-and-immutability.md), [`spec/20-enums-index.md`](../../../20-enums-index.md) |
| AT-TYPESFOLDERCONVENTION-07 | Type values are **immutable** — fields are read-only after construction (TS `readonly`, Go unexported + getter, PHP `readonly` properties); mutator methods on type structs are forbidden. | [`02-rules.md`](./02-rules.md), [`../18-code-mutation-avoidance.md`](../18-code-mutation-avoidance.md) |

### Common type definitions (file 03)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-TYPESFOLDERCONVENTION-08 | The cross-language SSOT for shared types is `03-common-type-definitions.md` and includes at minimum: `ContentType`, `HttpMethod`, `HttpStatus`, `SortDirection`, `Environment`. | [`03-common-type-definitions.md`](./03-common-type-definitions.md) |
| AT-TYPESFOLDERCONVENTION-09 | Each common type has identical semantic values across Go/TS/PHP (e.g., `HttpMethod.Get` is the same string in all 3 languages); divergence is a doc/code bug. | [`03-common-type-definitions.md`](./03-common-type-definitions.md) |
| AT-TYPESFOLDERCONVENTION-10 | `ContentType` and `HttpStatus` use the canonical IANA/HTTP names; project-specific aliases (e.g., `JsonResponse` for `application/json`) are forbidden in the shared type. | [`03-common-type-definitions.md`](./03-common-type-definitions.md) |
| AT-TYPESFOLDERCONVENTION-11 | `SortDirection` is a 2-value enum (`Asc`/`Desc`) — string literal `"asc"`/`"desc"` in business logic is forbidden. | [`03-common-type-definitions.md`](./03-common-type-definitions.md) |

### Anti-patterns & checklist (file 04)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-TYPESFOLDERCONVENTION-12 | Anti-patterns listed in §04 (god-types files, circular type dependencies, runtime-only types in `types/`, `any`/`interface{}` in shared types) MUST NOT appear in the codebase. | [`04-anti-patterns-and-checklist.md`](./04-anti-patterns-and-checklist.md), [`../13-strict-typing.md`](../13-strict-typing.md) |
| AT-TYPESFOLDERCONVENTION-13 | The summary checklist in §04 maps 1:1 to `AT-TYPESFOLDERCONVENTION-01..12`; orphan checklist items fail review. | [`04-anti-patterns-and-checklist.md`](./04-anti-patterns-and-checklist.md) |

### Cross-language consistency

| ID | Criterion | Source |
|----|-----------|--------|
| AT-TYPESFOLDERCONVENTION-14 | The convention is mirrored in language-specific specs (Go `02-coding-guidelines/03-golang/`, TS `02-coding-guidelines/02-typescript/`, PHP `02-coding-guidelines/04-php/`); divergence between this SSOT and a language spec is a doc bug. | [`../../03-golang/04-golang-standards-reference/97-acceptance-criteria.md`](../../03-golang/04-golang-standards-reference/97-acceptance-criteria.md), [`../../02-typescript/08-typescript-standards-reference/97-acceptance-criteria.md`](../../02-typescript/08-typescript-standards-reference/97-acceptance-criteria.md), [`../../04-php/07-php-standards-reference/97-acceptance-criteria.md`](../../04-php/07-php-standards-reference/97-acceptance-criteria.md) |

---

## Verification

```bash
# Inline type definitions in service/handler files (heuristic)
rg -nP '^(type|interface|class)\s+\w+\s*[={]' --type go --type ts --type php src/ server/ includes/ | grep -v '/types/'

# Hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../13-strict-typing.md`](../13-strict-typing.md) — Strict typing rules
- [`../25-generic-return-types.md`](../25-generic-return-types.md) — `Result[T]` patterns
- [`../26-magic-values-and-immutability.md`](../26-magic-values-and-immutability.md) — No magic values
- [`../15-master-coding-guidelines/97-acceptance-criteria.md`](../15-master-coding-guidelines/97-acceptance-criteria.md) — Master cross-language SSOT

---

*Curated 2026-04-25 — closes A-21 (batch 10). Replaces v0.1.0 stub.*


---

## Fixtures

Fixtures for every AT row in this file are covered by the global P2g sweep — see [`../../../97a-acceptance-criteria-fixtures.md`](../../../97a-acceptance-criteria-fixtures.md) (apply the matching pattern by section).
