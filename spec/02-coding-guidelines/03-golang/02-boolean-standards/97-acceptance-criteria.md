# Go Boolean Standards — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 15 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-BOOLEANSTANDARDS-01` … `AT-BOOLEANSTANDARDS-15`

---

## Criteria

### P-rules (positive naming + negation elimination)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-BOOLEANSTANDARDS-01 | **P1** — every boolean identifier (variable, field, function return) starts with `is` or `has` and a positive adjective/noun (`isValid`, `hasPermission`). | [`01-positive-naming.md`](./01-positive-naming.md) |
| AT-BOOLEANSTANDARDS-02 | **P2** — the `!` operator is never applied directly inside compound boolean expressions; the negation must first be assigned to a positive-named local. | [`02-negation-elimination.md`](./02-negation-elimination.md) |
| AT-BOOLEANSTANDARDS-03 | **P3** — any negated boolean used in 2+ places is hoisted into a positive-counterpart variable declared once. | [`02-negation-elimination.md`](./02-negation-elimination.md) |
| AT-BOOLEANSTANDARDS-04 | **P3b** — structs that need both positive and negative views expose dual accessor methods (`IsActive()` / `IsInactive()`); the underlying field stores the positive form. | [`02-negation-elimination.md`](./02-negation-elimination.md), [`07-summary-and-enforcement.md`](./07-summary-and-enforcement.md) |
| AT-BOOLEANSTANDARDS-05 | **P5** — raw numeric comparisons (`len(x) > 0`, `n != 0`) are replaced with named booleans (`hasItems`, `isNonZero`) when reused or used inside a compound condition. | [`03-positive-counterparts.md`](./03-positive-counterparts.md) |
| AT-BOOLEANSTANDARDS-06 | **P6** — `!isX` is permitted only when standing alone; combining it with `&&`/`||` (mixed polarity) is forbidden. | [`04-mixed-polarity-and-inline.md`](./04-mixed-polarity-and-inline.md) |
| AT-BOOLEANSTANDARDS-07 | **P7** — `if` statements never carry inline assignments via semicolons, except the documented exemptions: comma-ok, type assertions, error propagation. | [`04-mixed-polarity-and-inline.md`](./04-mixed-polarity-and-inline.md) |
| AT-BOOLEANSTANDARDS-08 | **P8** — raw `os.Stat` / `os.Open` / `os.MkdirAll` calls are replaced with the project's `pathutil` wrappers, which return positive-named booleans. | [`05-filesystem-and-errors.md`](./05-filesystem-and-errors.md) |
| AT-BOOLEANSTANDARDS-09 | **P9** — `err != nil` is never combined with another condition via `&&`/`||`; use `appError.HasError()` and split the condition. | [`05-filesystem-and-errors.md`](./05-filesystem-and-errors.md) |

### Idiomatic exemptions

| ID | Criterion | Source |
|----|-----------|--------|
| AT-BOOLEANSTANDARDS-10 | Comma-ok returns rename `ok` to a semantic positive name (`isExists`, `isFound`); bare `ok` is forbidden in non-trivial scopes. | [`06-idiomatic-exemptions.md`](./06-idiomatic-exemptions.md), [`07-summary-and-enforcement.md`](./07-summary-and-enforcement.md) |
| AT-BOOLEANSTANDARDS-11 | HTTP handler guard clauses (`if err != nil { http.Error(…); return }`) are exempt from P9 because they are early-return guards, not compound conditions. | [`06-idiomatic-exemptions.md`](./06-idiomatic-exemptions.md) |
| AT-BOOLEANSTANDARDS-12 | Variant checkers whose name matches an enum constant (e.g., `IsNotFound` for variant `NotFound`) are exempt from the negative-prefix ban. | [`07-summary-and-enforcement.md`](./07-summary-and-enforcement.md) §5 |

### Enforcement & alignment

| ID | Criterion | Source |
|----|-----------|--------|
| AT-BOOLEANSTANDARDS-13 | `linter-scripts/lint-negative.sh` runs in CI and flags any `IsNot*` / `HasNo*` function declaration; CI fails on violation. | [`07-summary-and-enforcement.md`](./07-summary-and-enforcement.md) §5 |
| AT-BOOLEANSTANDARDS-14 | The Go boolean standard is referenced from cross-language `02-boolean-principles` so the rule sets stay aligned (Go-specific additions: P3b, P5, P7, P8, P9). | [`07-summary-and-enforcement.md`](./07-summary-and-enforcement.md) §7, [`02-coding-guidelines/01-cross-language/02-boolean-principles/97-acceptance-criteria.md`](../../01-cross-language/02-boolean-principles/97-acceptance-criteria.md) |
| AT-BOOLEANSTANDARDS-15 | `not*` and `no*` prefixes are categorically prohibited for variable names (table row in §4 Variable Naming Rules). | [`07-summary-and-enforcement.md`](./07-summary-and-enforcement.md) §4 |

---

## Verification

```bash
# Negative-prefixed Go booleans
rg -n '\b(not|no)[A-Z]\w+\s*(:=|bool)' --type go

# IsNot*/HasNo* function declarations
rg -n 'func \(?\w*\)?\s*(IsNot|HasNo)\w+\(' --type go

# Compound err != nil
rg -n 'err != nil\s*(&&|\|\|)' --type go

# Run hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`spec/02-coding-guidelines/01-cross-language/02-boolean-principles/97-acceptance-criteria.md`](../../01-cross-language/02-boolean-principles/97-acceptance-criteria.md) — Cross-language boolean principles
- [`spec/02-coding-guidelines/01-cross-language/12-no-negatives.md`](../../01-cross-language/12-no-negatives.md) — No-negatives rule
- [`spec/02-coding-guidelines/04-php/03-naming-conventions/97-acceptance-criteria.md`](../../04-php/03-naming-conventions/97-acceptance-criteria.md) — PHP counterpart

---

*Curated 2026-04-25 — closes A-16 (batch 5).*


---

## Fixtures

Fixtures for every AT row in this file are covered by the global P2g sweep — see [`../../../97a-acceptance-criteria-fixtures.md`](../../../97a-acceptance-criteria-fixtures.md) (apply the matching pattern by section).
