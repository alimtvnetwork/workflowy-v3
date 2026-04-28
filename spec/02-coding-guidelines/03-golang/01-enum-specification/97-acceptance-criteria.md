# Go Enum Specification — Acceptance Criteria

> **Version:** 2.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## Purpose

Testable acceptance criteria for the universal Go enum pattern. Covers the enum pattern itself, required methods, folder structure, validation, and the Info-Object pattern.

ID format: `AT-ENUMSPECIFICATION-NN`.

---

## Criteria

### Enum Pattern (AT-ENUMSPECIFICATION-01..04)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ENUMSPECIFICATION-01 | Every Go enum is a named type backed by `string` (or `int` only when persisted as such); raw `string` constants without a named type are forbidden. | [`01-enum-pattern.md`](./01-enum-pattern.md) |
| AT-ENUMSPECIFICATION-02 | Each enum value is declared with `const` in PascalCase, prefixed by the enum-type name (e.g. `StatusActive`, `StatusInactive`). | [`01-enum-pattern.md`](./01-enum-pattern.md) |
| AT-ENUMSPECIFICATION-03 | Each enum has a private `_all<EnumName>s()` slice (or equivalent registry) listing every valid value — single source of truth for iteration. | [`01-enum-pattern.md`](./01-enum-pattern.md) |
| AT-ENUMSPECIFICATION-04 | Zero-value of the enum's underlying type is either explicitly declared as a named "Unknown" / "None" case or rejected by `Parse()` and `IsValid()`. | [`01-enum-pattern.md`](./01-enum-pattern.md) |

### Required Methods (AT-ENUMSPECIFICATION-05..07)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ENUMSPECIFICATION-05 | Every enum implements the documented required-methods set (e.g. `String()`, `IsValid()`, `Parse()`, `MarshalJSON`, `UnmarshalJSON`). | [`02-required-methods/`](./02-required-methods/00-overview.md) |
| AT-ENUMSPECIFICATION-06 | `Parse()` returns a typed error for unknown values; never panics. | [`02-required-methods/`](./02-required-methods/00-overview.md) |
| AT-ENUMSPECIFICATION-07 | `MarshalJSON` / `UnmarshalJSON` round-trip every valid value losslessly (covered by an automated unit test per enum). | [`02-required-methods/`](./02-required-methods/00-overview.md) |

### Folder Structure (AT-ENUMSPECIFICATION-08..09)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ENUMSPECIFICATION-08 | Each enum lives in its own file (`<enumname>.go`) under the documented `enums/` package; one enum type per file. | [`03-folder-structure.md`](./03-folder-structure.md) |
| AT-ENUMSPECIFICATION-09 | Test files (`<enumname>_test.go`) sit beside the source and cover `String()`, `Parse()`, `IsValid()`, and JSON round-trip. | [`03-folder-structure.md`](./03-folder-structure.md) |

### Validation (AT-ENUMSPECIFICATION-10..11)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ENUMSPECIFICATION-10 | Every enum passes the documented validation checklist before merge. | [`04-validation-checklist.md`](./04-validation-checklist.md) |
| AT-ENUMSPECIFICATION-11 | A linter / CI check rejects any enum that lacks the required methods or registry. | [`04-validation-checklist.md`](./04-validation-checklist.md) |

### Info-Object Pattern (AT-ENUMSPECIFICATION-12..13)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ENUMSPECIFICATION-12 | Enums with extra metadata (label, color, severity) use the Info-Object pattern: a private `<EnumName>Info` struct keyed by the enum value. | [`05-info-object-pattern.md`](./05-info-object-pattern.md) |
| AT-ENUMSPECIFICATION-13 | Info-Object lookups go through a documented `Info()` method that returns a typed struct — no global maps exposed publicly. | [`05-info-object-pattern.md`](./05-info-object-pattern.md) |

---

## Verification

```bash
grep -rn "AT-ENUMSPECIFICATION-" spec/02-coding-guidelines/03-golang/01-enum-specification/
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Subsection overview
- [`../04-golang-standards-reference/00-overview.md`](../04-golang-standards-reference/00-overview.md) — Master Go standards
- [`../../04-php/01-enums/97-acceptance-criteria.md`](../../04-php/01-enums/97-acceptance-criteria.md) — PHP-side enum criteria
- [`../../02-typescript/97-acceptance-criteria.md`](../../02-typescript/97-acceptance-criteria.md) — TypeScript enum criteria
- [`spec/20-enums-index.md`](../../../20-enums-index.md) — Enum registry

*Curated v2.0.0 — 2026-04-25 (UTC+8). Replaced auto-generated H-2.1 scaffold.*


---

## Fixtures

Fixtures for every AT row in this file are covered by the global P2g sweep — see [`../../../97a-acceptance-criteria-fixtures.md`](../../../97a-acceptance-criteria-fixtures.md) (apply the matching pattern by section).
