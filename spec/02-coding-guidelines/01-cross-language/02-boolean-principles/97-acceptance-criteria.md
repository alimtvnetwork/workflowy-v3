# Boolean Principles — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 13 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-BOOLEANPRINCIPLES-01` … `AT-BOOLEANPRINCIPLES-13`

> Applies to **PHP, TypeScript, Go** uniformly. Per-language enforcement details live in the language-specific boolean specs.

---

## Criteria

### Naming prefixes (file 01)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-BOOLEANPRINCIPLES-01 | Boolean variables, fields, and methods use a **positive `is`/`has`/`can`/`should`** prefix; `not`, `disable`, `block`, `prevent` prefixes are forbidden. | [`01-naming-prefixes.md`](./01-naming-prefixes.md) |
| AT-BOOLEANPRINCIPLES-02 | The prefix MUST match the underlying truth value — `isReady` returns `true` when ready, NEVER `true` when "not ready"; inverted-meaning names fail review. | [`01-naming-prefixes.md`](./01-naming-prefixes.md) |
| AT-BOOLEANPRINCIPLES-03 | Pluralized boolean fields (`areReady`) are forbidden; an array semantic uses `hasAny<X>()` or `count` instead of a plural boolean. | [`01-naming-prefixes.md`](./01-naming-prefixes.md) |

### Guards & extraction (file 02)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-BOOLEANPRINCIPLES-04 | The canonical guard set is `isDefined(x)`, `isDefinedAndValid(x)`, `isEmpty(x)` (and their language-specific equivalents); `if (!x)` and bare truthiness checks in business logic are forbidden. | [`02-guards-and-extraction.md`](./02-guards-and-extraction.md) |
| AT-BOOLEANPRINCIPLES-05 | Compound conditions (≥3 sub-expressions OR mixed AND/OR) MUST be extracted into a **positively-named local boolean** before the `if` statement. | [`02-guards-and-extraction.md`](./02-guards-and-extraction.md) |
| AT-BOOLEANPRINCIPLES-06 | Negation in compound conditions (`!isX && isY`) is forbidden — assign the negation to a positive-named local first (e.g., `isXAbsent := !isX; if isXAbsent && isY`). | [`02-guards-and-extraction.md`](./02-guards-and-extraction.md) |

### Parameters & conditions (file 03)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-BOOLEANPRINCIPLES-07 | **Boolean flag parameters** are forbidden — split into two named methods (`processSync()` / `processAsync()`) or accept a typed enum/options object. | [`03-parameters-and-conditions.md`](./03-parameters-and-conditions.md), [`spec/02-coding-guidelines/01-cross-language/24-boolean-flag-methods.md`](../24-boolean-flag-methods.md) |
| AT-BOOLEANPRINCIPLES-08 | A function returning `bool` does NOT take a `bool` parameter that controls its return polarity (no `getStatus(invert: true)` patterns). | [`03-parameters-and-conditions.md`](./03-parameters-and-conditions.md) |
| AT-BOOLEANPRINCIPLES-09 | Ternary `cond ? true : false` (or its negation) is forbidden — return `cond` (or `!cond`) directly. | [`03-parameters-and-conditions.md`](./03-parameters-and-conditions.md) |

### Quick reference (file 04)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-BOOLEANPRINCIPLES-10 | The quick-reference table in §04 lists the canonical "DO / DON'T" for every rule above; each row links back to the rule file. | [`04-quick-reference.md`](./04-quick-reference.md) |

### Exemptions & API boundaries (file 05)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-BOOLEANPRINCIPLES-11 | Documented exemptions (e.g., third-party API boundaries that require `disabled: true`, framework lifecycle props with negative names) are listed by name in §05; undocumented use of a forbidden pattern fails review. | [`05-exemptions-and-api.md`](./05-exemptions-and-api.md) |
| AT-BOOLEANPRINCIPLES-12 | At an external API boundary, the negative form is converted to a positive form **inside** the adapter — e.g., `disabled: true` from props becomes `isDisabled: true` then `isEnabled := !isDisabled` for internal use. | [`05-exemptions-and-api.md`](./05-exemptions-and-api.md) |

### Cross-language enforcement

| ID | Criterion | Source |
|----|-----------|--------|
| AT-BOOLEANPRINCIPLES-13 | The principles are mirrored in the language-specific specs — Go (`02-coding-guidelines/03-golang/02-boolean-standards`), PHP (`02-coding-guidelines/04-php/`), TS (`02-coding-guidelines/02-typescript/08-typescript-standards-reference`); divergence between the cross-language SSOT and a language spec is a doc bug. | [`spec/02-coding-guidelines/03-golang/02-boolean-standards/97-acceptance-criteria.md`](../../03-golang/02-boolean-standards/97-acceptance-criteria.md), [`spec/02-coding-guidelines/02-typescript/08-typescript-standards-reference/97-acceptance-criteria.md`](../../02-typescript/08-typescript-standards-reference/97-acceptance-criteria.md) |

---

## Verification

```bash
# Forbidden negative prefixes in identifiers
rg -n '\b(not|disable|block|prevent)[A-Z]\w+' --type php --type ts --type go src/

# Bare truthiness `if (!x)` in business logic
rg -nP 'if\s*\(\s*!\s*\w+\s*\)' --type ts --type tsx src/ | grep -v 'src/test\|node_modules'

# Hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../12-no-negatives.md`](../12-no-negatives.md) — No-negatives SSOT
- [`../24-boolean-flag-methods.md`](../24-boolean-flag-methods.md) — Boolean flag methods
- [`../04-code-style/97-acceptance-criteria.md`](../04-code-style/97-acceptance-criteria.md) — Code-style rollup (condition extraction)

---

*Curated 2026-04-25 — closes A-19 (batch 8).*


---

## Fixtures

Fixtures for every AT row in this file are covered by the global P2g sweep — see [`../../../97a-acceptance-criteria-fixtures.md`](../../../97a-acceptance-criteria-fixtures.md) (apply the matching pattern by section).
