# Variable Naming, Enforcement & Rule Summary

> **Parent:** [00-overview.md](./00-overview.md)

## 4. Variable Naming Rules

| Pattern | Example | Status |
|---------|---------|--------|
| `is` + PositiveAdjective | `isValid`, `isActive`, `isReady` | ✅ Required |
| `has` + PositiveNoun | `hasPermission`, `hasRows`, `hasError` | ✅ Required |
| `is` + NegativeResult | `isDirMissing`, `isMkdirFailed` | ✅ Permitted |
| `isDefined` | Positive nil/existence check | ✅ Required on nullable structs |
| `isDefinedAndValid` | Existence + validation combined | ✅ Required when validation exists |
| `not` prefix | `notFound`, `notReady` | ❌ Prohibited |
| `no` prefix | `noResults`, `noPermission` | ❌ Prohibited |
| Bare `ok` | `value, ok := map[key]` | ❌ Prohibited — use semantic name |

## 5. Enforcement

- **Automated**: `linter-scripts/lint-negative.sh` flags `IsNot*`, `HasNo*` function declarations
- **Manual review**: Inline `!` negation in compound boolean expressions
- **Enum exemption**: Variant checkers matching their constant name (e.g., `IsNotFound` for `NotFound` variant) are auto-excluded
- **Compound error check**: Any `err != nil &&` or `err != nil ||` pattern is flagged

## 6. Rule Summary

| Rule | ID | Summary |
|------|----|---------|
| Positive Naming | P1 | All booleans use `is`/`has` positive prefixes |
| Negation Elimination | P2 | Replace `!` with named positive variables |
| Positive Counterpart Variables | P3 | Negated booleans must be assigned to a positive-named variable before use in compounds |
| Dual Boolean Fields | P3b | Both positive and negative named forms declared together upfront; structs provide dual accessor methods |
| Named Numeric Comparisons | P5 | Raw numeric comparisons → named booleans |
| No Mixed Polarity | P6 | `!isX` only alone; never combined with `&&`/`||` |
| No Inline Statements | P7 | No semicolon assignments in `if`; exemptions for comma-ok, type assertions, error propagation |
| No Raw Filesystem | P8 | Use `pathutil` wrappers, not raw `os` calls |
| No Compound Errors | P9 | `err != nil` never combined with other conditions; use `appError.HasError()` |
| Semantic Comma-ok | — | Rename `ok` to meaningful name (`isExists`, `isFound`, etc.) |

## 7. Cross-Language Alignment

This standard mirrors the cross-language [Boolean Principles](../../01-cross-language/02-boolean-principles/00-overview.md) (P1–P6) and [No-Negatives](../../01-cross-language/12-no-negatives.md) with Go-specific exemptions for idiomatic patterns (comma-ok, handler guards, error-nil checks) and Go-specific additions (P3b, P5, P7–P9). See [PHP Standards](../../04-php/03-naming-conventions/00-overview.md) for the PHP counterpart.

## Related

- [00-overview.md](./00-overview.md) — Folder index
- All rule files: [01-positive-naming.md](./01-positive-naming.md) · [02-negation-elimination.md](./02-negation-elimination.md) · [03-positive-counterparts.md](./03-positive-counterparts.md) · [04-mixed-polarity-and-inline.md](./04-mixed-polarity-and-inline.md) · [05-filesystem-and-errors.md](./05-filesystem-and-errors.md) · [06-idiomatic-exemptions.md](./06-idiomatic-exemptions.md)
