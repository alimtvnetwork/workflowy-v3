# apperrtype Enums — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 13 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-APPERRTYPEENUMS-01` … `AT-APPERRTYPEENUMS-13`

---

## Criteria

### Variation enum (file 01)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-APPERRTYPEENUMS-01 | `Variation` is declared as `type Variation uint16` — never `byte`, `int`, or string-backed; this is a breaking-change marker tracked at the package level. | [`01-variation-enum.md`](./01-variation-enum.md) |
| AT-APPERRTYPEENUMS-02 | All variants are organized into the documented domain ranges **E1xxx–E18xxx** (18 ranges); a variant outside its declared range fails the registry-bounds check. | [`01-variation-enum.md`](./01-variation-enum.md), [`03-registry-and-bounds.md`](./03-registry-and-bounds.md) |

### Variant structure & interface (file 02)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-APPERRTYPEENUMS-03 | `VariantStructure` carries exactly `Name`, `Code`, `Message` (typed strings); no additional fields are added without a spec bump. | [`02-variant-structure.md`](./02-variant-structure.md) |
| AT-APPERRTYPEENUMS-04 | `ErrorType` interface exposes `Variation()`, `Code()`, `Message()`, `Name()`; every variant satisfies the interface implicitly via `Variation` methods. | [`02-variant-structure.md`](./02-variant-structure.md) |
| AT-APPERRTYPEENUMS-05 | `Variation` type has `String()`, `Code()`, `Message()`, `Name()`, `IsValid()`, and `MarshalJSON`/`UnmarshalJSON` methods; JSON serialization uses the `Code` string (e.g., `"E2010"`), NOT the numeric value. | [`02-variant-structure.md`](./02-variant-structure.md) |

### Registry & bounds (file 03)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-APPERRTYPEENUMS-06 | `variantRegistry` is a single package-level `map[Variation]VariantStructure`; the package exposes only read methods on `Variation`, never the map directly. | [`03-registry-and-bounds.md`](./03-registry-and-bounds.md) |
| AT-APPERRTYPEENUMS-07 | `minValue` / `maxValue` consts bound the legal range; `IsValid()` returns `false` for any value outside `[minValue, maxValue]` OR not present in the registry. | [`03-registry-and-bounds.md`](./03-registry-and-bounds.md) |
| AT-APPERRTYPEENUMS-08 | A package-init test verifies that every declared variant constant is present in the registry and falls inside its documented domain range. | [`03-registry-and-bounds.md`](./03-registry-and-bounds.md) |

### Reverse-lookup maps (file 04)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-APPERRTYPEENUMS-09 | `StringToVariantMap` and `CodeToVariantMap` are derived from the registry at init; both are bijections (every `Variation` appears in exactly one entry of each map). | [`04-reverse-lookup-maps.md`](./04-reverse-lookup-maps.md) |
| AT-APPERRTYPEENUMS-10 | Reverse lookup of an unknown name/code returns the zero value AND a `false` ok-bool; callers MUST check the bool before use. | [`04-reverse-lookup-maps.md`](./04-reverse-lookup-maps.md) |

### Usage & display (file 05)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-APPERRTYPEENUMS-11 | Display format strings live in `format_consts.go` (per §00 package layout); changing a format string is a spec change. | [`05-usage-and-display.md`](./05-usage-and-display.md), [`00-overview.md`](./00-overview.md) |

### Rules & migration (file 06)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-APPERRTYPEENUMS-12 | Adding a new variant requires: (a) declaring the constant in the correct domain range, (b) registering its `VariantStructure`, (c) adding a registry test, (d) bumping the package version per the spec's version policy. | [`06-rules-and-migration.md`](./06-rules-and-migration.md) |
| AT-APPERRTYPEENUMS-13 | The v1.x → v2.0 migration (per-domain `byte` → unified `uint16` `Variation`) is documented with a before/after example and a one-time codemod note; legacy `byte` enums are removed, not aliased. | [`06-rules-and-migration.md`](./06-rules-and-migration.md) |

---

## Verification

```bash
# Variation must be uint16
rg -n 'type Variation \w+' types/apperrtype/

# Direct registry access from outside package
rg -n 'apperrtype\.variantRegistry' --type go .

# Hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../97-acceptance-criteria.md`](../97-acceptance-criteria.md) — apperror reference rollup
- [`../02-apperror-struct/97-acceptance-criteria.md`](../02-apperror-struct/97-acceptance-criteria.md) — `AppError` struct & methods
- [`spec/03-error-manage/03-error-code-registry/97-acceptance-criteria.md`](../../../../03-error-code-registry/97-acceptance-criteria.md) — Cross-project code registry

---

*Curated 2026-04-25 — closes A-18 (batch 7).*
