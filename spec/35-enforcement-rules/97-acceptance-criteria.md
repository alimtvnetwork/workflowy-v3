# Enforcement Rules — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 14 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-ENFORCEMENTRULES-01` … `AT-ENFORCEMENTRULES-14`

---

## Criteria

### Compile-time layer

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ENFORCEMENTRULES-01 | `tsconfig.json` MUST set `strict: true`, `noImplicitAny: true`, `noUncheckedIndexedAccess: true`; relaxing any of these is a Code-Red type-safety regression. | [`00-overview.md`](./00-overview.md) |
| AT-ENFORCEMENTRULES-02 | The codebase MUST contain ZERO `any` annotations and ZERO `// @ts-ignore` directives; exceptions require an inline `// @ts-expect-error: <reason>` with a tracking ID and PR review. | [`00-overview.md`](./00-overview.md), [`../02-coding-guidelines/01-cross-language/13-strict-typing.md`](../02-coding-guidelines/01-cross-language/13-strict-typing.md) |

### Lint-time layer

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ENFORCEMENTRULES-03 | All custom enforcement rules MUST live under `eslint-plugins/coding-guidelines/`; scattering rules across `.eslintrc` overrides is forbidden because it harms discoverability. | [`00-overview.md`](./00-overview.md) |
| AT-ENFORCEMENTRULES-04 | The plugin MUST enforce: boolean-naming (`is*`/`has*`/`should*`), no-nested-`if`, max-3-params, max-15-line-logic, positive guard clauses (NO `else`); each rule MUST cite the source guideline file. | [`00-overview.md`](./00-overview.md), [`../02-coding-guidelines/01-cross-language/02-boolean-principles/00-overview.md`](../02-coding-guidelines/01-cross-language/02-boolean-principles/00-overview.md), [`../02-coding-guidelines/01-cross-language/04-code-style/00-overview.md`](../02-coding-guidelines/01-cross-language/04-code-style/00-overview.md) |
| AT-ENFORCEMENTRULES-05 | Every custom rule MUST ship with: meta (docs URL), positive examples (`valid:`), negative examples (`invalid:`), AND auto-fixer where mechanically safe; rules without examples fail review. | [`00-overview.md`](./00-overview.md) |

### Runtime (boundary) layer

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ENFORCEMENTRULES-06 | All boundary inputs (API responses, form submissions, `localStorage` reads, URL query params, `postMessage` payloads) MUST be parsed through a Zod (or Valibot) schema; raw `JSON.parse` followed by type assertion is a Code-Red trust bug. | [`00-overview.md`](./00-overview.md) |
| AT-ENFORCEMENTRULES-07 | Schema parse failures MUST surface a typed error (NOT `throw new Error("invalid")`); schemas MUST live in a co-located `*.schema.ts` file next to the consumer. | [`00-overview.md`](./00-overview.md) |
| AT-ENFORCEMENTRULES-08 | Schemas MUST be the SOLE source of truth — derived TypeScript types via `z.infer<…>` are mandatory; manually maintained twin types are forbidden because they drift. | [`00-overview.md`](./00-overview.md) |

### Generic-first APIs

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ENFORCEMENTRULES-09 | Public function signatures MUST return generic `T` (NOT `unknown` / `any`); returning `unknown` from non-boundary code is forbidden because it pushes assertions onto callers. | [`00-overview.md`](./00-overview.md) |
| AT-ENFORCEMENTRULES-10 | Helpers that accept user-defined data MUST be generic over the data shape (`function pick<T, K extends keyof T>(…)`); accepting `Record<string, unknown>` is forbidden. | [`00-overview.md`](./00-overview.md) |

### Test-time layer

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ENFORCEMENTRULES-11 | Critical generic helpers MUST have type-tests (e.g., `expectTypeOf` from `expect-type` or vitest's built-in); missing type-tests on generics fail review because runtime tests can't catch type regressions. | [`00-overview.md`](./00-overview.md) |
| AT-ENFORCEMENTRULES-12 | Critical helpers MUST have property-based tests (e.g., fast-check) covering at least: identity, idempotence (where applicable), and inverse properties; example-only coverage fails review. | [`00-overview.md`](./00-overview.md) |

### Cross-cutting

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ENFORCEMENTRULES-13 | This folder MUST cite its authoritative source files (currently in `02-coding-guidelines/`); when sub-specs `01-04` are authored, the authoritative-source list MUST be updated to point to them — orphan citations fail review. | [`00-overview.md`](./00-overview.md) |
| AT-ENFORCEMENTRULES-14 | All four enforcement layers (compile / lint / runtime / test) MUST run in CI; skipping any layer is a Code-Red regression-window bug because rules silently rot. | [`00-overview.md`](./00-overview.md), [`../13-cicd-pipeline-workflows/00-overview.md`](../13-cicd-pipeline-workflows/00-overview.md) |

---

## Fixtures

I/O fixtures for `AT-ENFORCEMENTRULES-01..14` live in [`97a-acceptance-criteria-fixtures.md`](./97a-acceptance-criteria-fixtures.md).

---

## Verification

```bash
# Strict TS settings
node -e "const c=require('./tsconfig.json');console.assert(c.compilerOptions.strict&&c.compilerOptions.noImplicitAny&&c.compilerOptions.noUncheckedIndexedAccess)"

# any/ts-ignore scan
rg -nP ":\s*any\b|@ts-ignore" src/

# Schema co-location
ls src/**/*.schema.ts | wc -l

# Hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../02-coding-guidelines/02-typescript/11-eslint-enforcement.md`](../02-coding-guidelines/02-typescript/11-eslint-enforcement.md) — ESLint rule mapping
- [`../02-coding-guidelines/01-cross-language/13-strict-typing.md`](../02-coding-guidelines/01-cross-language/13-strict-typing.md) — Strict typing rules
- [`../13-cicd-pipeline-workflows/00-overview.md`](../13-cicd-pipeline-workflows/00-overview.md) — CI integration

---

*Curated 2026-04-25 — closes batch-16 item 4. Replaces v1.0.0 scaffold.*
