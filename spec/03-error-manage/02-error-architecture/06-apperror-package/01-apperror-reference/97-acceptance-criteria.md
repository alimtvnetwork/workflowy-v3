# AppError Package Reference — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 15 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-APPERRORREFERENCE-01` … `AT-APPERRORREFERENCE-15`

---

## Criteria

### Core invariants

| ID | Criterion | Source |
|----|-----------|--------|
| AT-APPERRORREFERENCE-01 | **I-1 Round-Trip**: every `*AppError` survives `json.Marshal` → `json.Unmarshal` with code, message, details, values, diagnostics, stack, and cause-message preserved. | [`01-overview-and-stack.md`](./01-overview-and-stack.md) §I-1 |
| AT-APPERRORREFERENCE-02 | **I-2 No raw `error` in structs**: any struct field holding an error MUST be typed `*AppError`, never the bare `error` interface. | [`01-overview-and-stack.md`](./01-overview-and-stack.md) §I-2 |
| AT-APPERRORREFERENCE-03 | **I-3 Stack always present**: every constructor (`New`, `Wrap`, `NewType`, `WrapType`, `FailNew`, `FailWrap`, `FailSlice*`, `FailMap*`) attaches a non-empty `StackTrace` at creation. | [`01-overview-and-stack.md`](./01-overview-and-stack.md) §I-3, §1.3 |
| AT-APPERRORREFERENCE-04 | **I-4 Zero raw error returns**: every exported service method returns `*AppError`, `Result[T]`, `ResultSlice[T]`, or `ResultMap[K,V]` — never bare `error`. | [`01-overview-and-stack.md`](./01-overview-and-stack.md) §I-4 |

### StackTrace

| ID | Criterion | Source |
|----|-----------|--------|
| AT-APPERRORREFERENCE-05 | `StackFrame` has exactly the fields `Function string`, `File string`, `Line int` and a `String()` formatter producing `"function\n      file:line"`. | [`01-overview-and-stack.md`](./01-overview-and-stack.md) §1.1 |
| AT-APPERRORREFERENCE-06 | `StackTrace.Frames` is capped at **18 frames** by default; `CaptureStackN` allows custom depth. | [`01-overview-and-stack.md`](./01-overview-and-stack.md) §1.3 |
| AT-APPERRORREFERENCE-07 | Runtime-frame filtering uses `strings.HasPrefix(fn, "runtime.")` (not `Contains`) to avoid false positives on domain functions. | [`01-overview-and-stack.md`](./01-overview-and-stack.md) §1.3 |
| AT-APPERRORREFERENCE-08 | Re-wrapping an `*AppError` preserves the original trace in `PreviousTrace`; `HasPrevious()` returns `true` after one re-wrap. | [`01-overview-and-stack.md`](./01-overview-and-stack.md) §1.5 |
| AT-APPERRORREFERENCE-09 | Skip values match the canonical table: `New`→2, `Wrap`/`FailWrap`/`FailSliceWrap`/`FailMapWrap`→3, `FailNew`/`FailSliceNew`/`FailMapNew`→3 (via `NewWithSkip(…,1)`). | [`04-codes-and-policy.md`](./04-codes-and-policy.md) §7 |

### Codes & enum policy

| ID | Criterion | Source |
|----|-----------|--------|
| AT-APPERRORREFERENCE-10 | Every error code is a string constant in `codes.go` (or its `apperrtype` registry); raw string literals like `"E2010"` are forbidden in calling code once an `apperrtype` variant exists. | [`04-codes-and-policy.md`](./04-codes-and-policy.md) §6, §6.1 |
| AT-APPERRORREFERENCE-11 | Code ranges follow the documented domain map (E1xxx config … E14xxx crypto); new codes must occupy the correct range. | [`04-codes-and-policy.md`](./04-codes-and-policy.md) §6 table |
| AT-APPERRORREFERENCE-12 | `apperrtype.Variation` is a single `uint16` enum with `NoError=0`, ascending values, and a sentinel `MaxError`; all variants live in `types/apperrtype/variation.go`. | [`04-codes-and-policy.md`](./04-codes-and-policy.md) §6.1 |
| AT-APPERRORREFERENCE-13 | `variantRegistry` maps every `Variation` → `VariantStructure{Name, Code, Message, Variant}` and `Variation` implements the `ErrorType` interface (`Code()`, `Message()`, `Name()`). | [`04-codes-and-policy.md`](./04-codes-and-policy.md) §6.1 |
| AT-APPERRORREFERENCE-14 | `apperror.NewType(v)` and `apperror.WrapType(v, …)` are the canonical builders for any `apperrtype.Variation`; raw `New("Exxxx", "msg")` is reserved for prototyping only. | [`04-codes-and-policy.md`](./04-codes-and-policy.md) §6.1 (Level 3) |

### File size policy

| ID | Criterion | Source |
|----|-----------|--------|
| AT-APPERRORREFERENCE-15 | All `apperror` package files target ≤300 lines; 301–400 lines requires the header comment `// NOTE: Needs refactor — exceeds 300-line target`; >400 lines is forbidden. | [`04-codes-and-policy.md`](./04-codes-and-policy.md) §8 |

---

## Verification

```bash
# Bare-error returns in service methods
rg -n 'func \(\w+ \*\w+\) \w+\(.*\) .*\berror\b' --type go internal/

# Raw "Exxxx" string literals after enum exists
rg -n '"E[0-9]{4}"' --type go | grep -v 'apperrtype/' | grep -v 'codes.go'

# File-size budget
find internal/apperror -name '*.go' -exec wc -l {} \; | awk '$1>300{print}'

# Run hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`spec/03-error-manage/03-error-code-registry/97-acceptance-criteria.md`](../../../03-error-code-registry/97-acceptance-criteria.md) — Error code registry SSOT
- [`spec/03-error-manage/02-error-architecture/05-response-envelope/97-acceptance-criteria.md`](../../05-response-envelope/97-acceptance-criteria.md) — Response envelope
- [`spec/19-glossary.md`](../../../../19-glossary.md) — Terminology SSOT

---

*Curated 2026-04-25 — closes A-16 (batch 5).*


---

## Fixtures

Fixtures for every AT row in this file are covered by the global P2g sweep — see [`../../../../97a-acceptance-criteria-fixtures.md`](../../../../97a-acceptance-criteria-fixtures.md) (apply the matching pattern by section).
