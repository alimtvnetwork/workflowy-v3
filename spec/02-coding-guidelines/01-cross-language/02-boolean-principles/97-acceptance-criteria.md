# Boolean Principles — Acceptance Criteria

> **Version:** 2.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## Purpose

Testable acceptance criteria for the 8 boolean principles (P1..P8). Each criterion is verifiable by reading the source spec or by an ESLint custom rule once implemented.

ID format: `AT-BOOLEANPRINCIPLES-NN`.

---

## Criteria

### Naming (P1, P2 → AT-BOOLEANPRINCIPLES-01..03)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-BOOLEANPRINCIPLES-01 | (P1) Every boolean variable, parameter, return value, and field uses an `is`, `has`, `can`, `should`, or `was` prefix. | [`01-naming-prefixes.md`](./01-naming-prefixes.md) |
| AT-BOOLEANPRINCIPLES-02 | (P2) No boolean uses a negative word (`isNotReady`, `hasNoChildren`, `cannotEdit`); use the positive form and negate at the call site. | [`01-naming-prefixes.md`](./01-naming-prefixes.md) |
| AT-BOOLEANPRINCIPLES-03 | A boolean named `xVerb` (e.g. `delete`, `submit`) is rejected — it must read as a yes/no question. | [`01-naming-prefixes.md`](./01-naming-prefixes.md) |

### Guards & Extraction (P3, P4 → AT-BOOLEANPRINCIPLES-04..05)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-BOOLEANPRINCIPLES-04 | (P3) Every multi-clause condition (`a && b && c` or `a || b`) is extracted into a named guard function with an `is*` / `has*` / `should*` name. | [`02-guards-and-extraction.md`](./02-guards-and-extraction.md) |
| AT-BOOLEANPRINCIPLES-05 | (P4) Inline boolean expressions inside `if`, `while`, ternary, and JSX conditions are limited to a single named guard call. | [`02-guards-and-extraction.md`](./02-guards-and-extraction.md) |

### Parameters & Conditions (P5..P8 → AT-BOOLEANPRINCIPLES-06..09)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-BOOLEANPRINCIPLES-06 | (P5) Boolean parameters are explicit — no positional `true` / `false` at the call site; pass `{ enabled: true }` instead. | [`03-parameters-and-conditions.md`](./03-parameters-and-conditions.md) |
| AT-BOOLEANPRINCIPLES-07 | (P6) Mixed boolean operators (`a && b || c`) are forbidden — group with parens or split into named guards. | [`03-parameters-and-conditions.md`](./03-parameters-and-conditions.md) |
| AT-BOOLEANPRINCIPLES-08 | (P7) Inline boolean statements like `flag = condition && action()` are forbidden — split into `if` + statement. | [`03-parameters-and-conditions.md`](./03-parameters-and-conditions.md) |
| AT-BOOLEANPRINCIPLES-09 | (P8) Booleans never come from a raw system call inline (`if (process.env.X === 'true')`); wrap in a guard helper. | [`03-parameters-and-conditions.md`](./03-parameters-and-conditions.md) |

### Exemptions (AT-BOOLEANPRINCIPLES-10..11)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-BOOLEANPRINCIPLES-10 | Static-factory methods (`User.fromAdmin()`, `User.fromGuest()`) are exempt from the boolean-parameter rule. | [`05-exemptions-and-api.md`](./05-exemptions-and-api.md) |
| AT-BOOLEANPRINCIPLES-11 | The `Result<T, E>` wrapper API uses `isOk()` / `isErr()` named guards (no raw `.ok` / `.err` field access). | [`05-exemptions-and-api.md`](./05-exemptions-and-api.md) |

---

## Verification

```bash
grep -rn "AT-BOOLEANPRINCIPLES-" spec/02-coding-guidelines/01-cross-language/02-boolean-principles/
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Subsection overview
- [`04-quick-reference.md`](./04-quick-reference.md) — Quick-reference table for reviewers
- [`../15-master-coding-guidelines/02-boolean-and-enum.md`](../15-master-coding-guidelines/02-boolean-and-enum.md) — Master rollup
- [`spec/19-glossary.md`](../../../19-glossary.md) — Terminology SSOT
- [`spec/20-enums-index.md`](../../../20-enums-index.md) — Enum registry

*Curated v2.0.0 — 2026-04-25 (UTC+8). Replaced auto-generated H-2.1 scaffold.*
