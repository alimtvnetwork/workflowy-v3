# TypeScript Standards — Acceptance Criteria

> **Version:** 2.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 16 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-TYPESCRIPT-01` … `AT-TYPESCRIPT-16`

---

## Criteria

### Enum syntax (files 01–06, 10)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-TYPESCRIPT-01 | All enums MUST use TypeScript `enum` syntax with PascalCase values AND a `Type` suffix on the enum name (e.g., `enum HttpMethodType { Get = 'Get' }`); string-union types as a substitute are forbidden. | [`00-overview.md`](./00-overview.md), [`05-http-method-enum.md`](./05-http-method-enum.md) |
| AT-TYPESCRIPT-02 | Each enum MUST live in its own `src/lib/enums/<name>.ts` file (one enum per file); colocating multiple enums in a single file is forbidden because it harms grep-ability. | [`01-connection-status-enum.md`](./01-connection-status-enum.md), [`02-entity-status-enum.md`](./02-entity-status-enum.md) |
| AT-TYPESCRIPT-03 | Enum values MUST be string literals matching the enum-key name (`Foo = 'Foo'`); numeric enums and divergent value/key are forbidden because they break wire-format stability. | [`03-execution-status-enum.md`](./03-execution-status-enum.md) |
| AT-TYPESCRIPT-04 | Each enum file MUST export the enum AND a typed parser (`parseHttpMethodType(raw: string): HttpMethodType`); inline `as` casts in callers are forbidden. | [`05-http-method-enum.md`](./05-http-method-enum.md), [`10-log-level-enum.md`](./10-log-level-enum.md) |

### Type safety (files 07, 11)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-TYPESCRIPT-05 | The codebase MUST contain ZERO `any` annotations; the type-safety remediation plan MUST track every legacy occurrence with a removal target date — open items past target fail review. | [`07-type-safety-remediation-plan.md`](./07-type-safety-remediation-plan.md) |
| AT-TYPESCRIPT-06 | `unknown` MUST be confined to boundary parsing (Zod inputs, `JSON.parse` results); business code MUST narrow `unknown` to a typed shape via a schema before use — propagating `unknown` is forbidden. | [`07-type-safety-remediation-plan.md`](./07-type-safety-remediation-plan.md) |
| AT-TYPESCRIPT-07 | `Record<string, unknown>` MUST NOT appear in public APIs — generic-first signatures (`<T extends Record<string, …>>`) are mandatory. | [`07-type-safety-remediation-plan.md`](./07-type-safety-remediation-plan.md), [`../01-cross-language/25-generic-return-types.md`](../01-cross-language/25-generic-return-types.md) |
| AT-TYPESCRIPT-08 | ESLint enforcement MUST cover every TS rule listed in `11-eslint-enforcement.md`; missing rule wiring fails CI — drift between docs and `.eslintrc` is a Code-Red enforcement bug. | [`11-eslint-enforcement.md`](./11-eslint-enforcement.md) |

### Standards reference (file 08)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-TYPESCRIPT-09 | Every standards-reference rule MUST cite its enforcement mechanism (compile / lint / runtime / test); rules without an enforcement column fail review because they're un-auditable. | [`08-typescript-standards-reference/00-overview.md`](./08-typescript-standards-reference/00-overview.md) |
| AT-TYPESCRIPT-10 | Every reference rule MUST include a positive (`✅`) AND negative (`❌`) code example; rule docs without both fail review. | [`08-typescript-standards-reference/00-overview.md`](./08-typescript-standards-reference/00-overview.md) |

### Promise/async (file 09)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-TYPESCRIPT-11 | `await` MUST be paired with explicit `try/catch` OR a dedicated `safeAwait` helper; bare `await` in business code that propagates rejection is a Code-Red error-handling bug. | [`09-promise-await-patterns.md`](./09-promise-await-patterns.md) |
| AT-TYPESCRIPT-12 | `Promise.all` MUST be used for independent parallel ops; sequential `await` chains where parallel is possible fail review (perf bug). | [`09-promise-await-patterns.md`](./09-promise-await-patterns.md) |
| AT-TYPESCRIPT-13 | Floating promises (un-awaited, no `.catch`) are forbidden; `no-floating-promises` ESLint rule MUST be set to `error`. | [`09-promise-await-patterns.md`](./09-promise-await-patterns.md), [`11-eslint-enforcement.md`](./11-eslint-enforcement.md) |

### Discriminated unions (file 12)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-TYPESCRIPT-14 | Action / message / state shapes MUST use discriminated unions with a `kind` (or `type`) string-literal tag; bag-of-optionals shapes are forbidden because they break exhaustiveness checks. | [`12-discriminated-union-patterns.md`](./12-discriminated-union-patterns.md) |
| AT-TYPESCRIPT-15 | Every union switch MUST have an exhaustiveness `assertNever(x)` default arm; missing the default is a Code-Red maintainability bug because new variants silently slip through. | [`12-discriminated-union-patterns.md`](./12-discriminated-union-patterns.md) |
| AT-TYPESCRIPT-16 | Discriminated union variants MUST NOT share the same `kind` value; collisions are a Code-Red type-safety bug. | [`12-discriminated-union-patterns.md`](./12-discriminated-union-patterns.md) |

---

## Verification

```bash
# any/unknown scan
rg -nP ":\s*any\b" src/ | grep -v '\.d\.ts'
rg -nP "Record<string,\s*unknown>" src/

# Enum-per-file
ls src/lib/enums/ | wc -l

# Floating promise guard
grep -rE "no-floating-promises.*error" .eslintrc*

# Hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../01-cross-language/13-strict-typing.md`](../01-cross-language/13-strict-typing.md) — Strict typing rules
- [`../01-cross-language/25-generic-return-types.md`](../01-cross-language/25-generic-return-types.md) — Generic return types
- [`../../35-enforcement-rules/97-acceptance-criteria.md`](../../35-enforcement-rules/97-acceptance-criteria.md) — Cross-cutting enforcement

---

*Curated 2026-04-25 — closes batch-17 item 1. Replaces v3.1.0 placeholder.*


---

## Fixtures

Fixtures for every AT row in this file are covered by the global P2g sweep — see [`../../97a-acceptance-criteria-fixtures.md`](../../97a-acceptance-criteria-fixtures.md) (apply the matching pattern by section).
