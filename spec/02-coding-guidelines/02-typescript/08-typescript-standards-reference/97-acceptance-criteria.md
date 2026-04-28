# TypeScript Standards Reference — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 14 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)
> **Priority:** CRITICAL — overrides all other TS conventions

---

## ID Range

`AT-TYPESCRIPTSTANDARDSREFERENCE-01` … `AT-TYPESCRIPTSTANDARDSREFERENCE-14`

---

## Criteria

| ID | Criterion | Source |
|----|-----------|--------|
| AT-TYPESCRIPTSTANDARDSREFERENCE-01 | **Generics first** — every reusable function, hook, and component that operates on a value type accepts a generic parameter; concrete-typed copies for each shape are forbidden. | [`01-generics-first.md`](./01-generics-first.md) |
| AT-TYPESCRIPTSTANDARDSREFERENCE-02 | **Zero `any`** — `any` and untyped `Function`/`Object` are banned; `unknown` is the only acceptable escape hatch and must be narrowed before use. | [`02-zero-any-policy.md`](./02-zero-any-policy.md) |
| AT-TYPESCRIPTSTANDARDSREFERENCE-03 | **No magic strings/numbers** — every literal that is reused or carries domain meaning lives in a `const`, enum, or `as const` map; raw literals in business logic are flagged. | [`03-no-magic-values.md`](./03-no-magic-values.md) |
| AT-TYPESCRIPTSTANDARDSREFERENCE-04 | **catch blocks** type the caught value as `unknown` (or rely on TS `useUnknownInCatchVariables`) and use a typed narrowing helper (`isAppError`, `isError`) before access. | [`04-common-pattern-rules.md`](./04-common-pattern-rules.md) |
| AT-TYPESCRIPTSTANDARDSREFERENCE-05 | **React Query** keys are typed arrays `[domain, id, …filters]` and the query/mutation generics declare both data and error shapes (`useQuery<TData, TError>`). | [`04-common-pattern-rules.md`](./04-common-pattern-rules.md) |
| AT-TYPESCRIPTSTANDARDSREFERENCE-06 | **Prop drilling** beyond 2 levels is replaced with a typed React Context or Zustand slice; raw `any` props are not allowed to pass through intermediate components. | [`04-common-pattern-rules.md`](./04-common-pattern-rules.md) |
| AT-TYPESCRIPTSTANDARDSREFERENCE-07 | **Function size** ≤ 15 logical lines (excluding signature, braces, blank lines, comments). | [`05-function-size-and-nesting.md`](./05-function-size-and-nesting.md), [`mem://constraints/coding-guidelines`](mem://constraints/coding-guidelines) |
| AT-TYPESCRIPTSTANDARDSREFERENCE-08 | **Zero nested `if`** — nested `if` statements are forbidden; use early-return guard clauses, `switch`, or extracted helpers. | [`05-function-size-and-nesting.md`](./05-function-size-and-nesting.md), [`mem://constraints/coding-guidelines`](mem://constraints/coding-guidelines) |
| AT-TYPESCRIPTSTANDARDSREFERENCE-09 | **Enforcement** — `tsconfig.json` enables `strict`, `noImplicitAny`, `noUncheckedIndexedAccess`, `useUnknownInCatchVariables`, `exactOptionalPropertyTypes`; ESLint enables `@typescript-eslint/no-explicit-any` and `no-magic-numbers`. | [`06-enforcement.md`](./06-enforcement.md) |
| AT-TYPESCRIPTSTANDARDSREFERENCE-10 | **Positive guards** — `isDefined(x)`, `isDefinedAndValid(x)`, `isEmpty(x)` are the canonical guards; `if (!x)` and `if (x == null)` are forbidden in business logic. | [`07-positive-guards.md`](./07-positive-guards.md), [`02-coding-guidelines/01-cross-language/12-no-negatives.md`](../../01-cross-language/12-no-negatives.md) |
| AT-TYPESCRIPTSTANDARDSREFERENCE-11 | **Discriminated unions** are declared with named interfaces and an enum-typed discriminator field; inline shape literals inside a union are not allowed. | [`08-discriminated-unions.md`](./08-discriminated-unions.md) |
| AT-TYPESCRIPTSTANDARDSREFERENCE-12 | **Generics reference table** in `09-generics-reference.md` is the SSOT for "when to use what generic"; new generic helpers must be added to this table before use. | [`09-generics-reference.md`](./09-generics-reference.md) |
| AT-TYPESCRIPTSTANDARDSREFERENCE-13 | **Frontend enum inventory** — every TS enum/literal-union listed in `10-enum-inventory.md` has Go parity (case names + values); drift is caught by `scripts/spec-hygiene/15-check-enums-in-sync.mjs`. | [`10-enum-inventory.md`](./10-enum-inventory.md), [`spec/20-enums-index.md`](../../../20-enums-index.md) |
| AT-TYPESCRIPTSTANDARDSREFERENCE-14 | **Response envelope** — every fetch/axios call validates the response against the universal envelope schema (`Success`, `Code`, `Message`, `Data`) before returning to the caller. | [`spec/03-error-manage/02-error-architecture/05-response-envelope/97-acceptance-criteria.md`](../../../03-error-manage/02-error-architecture/05-response-envelope/97-acceptance-criteria.md) |

---

## Verification

```bash
# any-usage hunt
rg -n ': any\b|<any>|as any\b' --type ts --type tsx src/

# Magic numbers in business logic (excludes tests/configs)
rg -n '\b(?<![\w.])\d{2,}\b' --type ts src/ | grep -v 'src/test\|\.config\.'

# Nested if (depth >1)
rg -nU 'if\s*\([^)]*\)\s*\{[^}]*if\s*\(' --type ts src/

# Hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`spec/20-enums-index.md`](../../../20-enums-index.md) — Enum registry
- [`spec/02-coding-guidelines/01-cross-language/12-no-negatives.md`](../../01-cross-language/12-no-negatives.md) — Positive guards SSOT
- [`spec/02-coding-guidelines/03-golang/04-golang-standards-reference/00-overview.md`](../../03-golang/04-golang-standards-reference/00-overview.md) — Go counterpart

---

*Curated 2026-04-25 — closes A-17 (batch 6).*


---

## Fixtures

Fixtures for every AT row in this file are covered by the global P2g sweep — see [`../../../97a-acceptance-criteria-fixtures.md`](../../../97a-acceptance-criteria-fixtures.md) (apply the matching pattern by section).
