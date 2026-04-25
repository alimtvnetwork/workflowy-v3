# TypeScript Standards — Acceptance Criteria

> **Version:** 2.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## Purpose

Testable acceptance criteria for the TypeScript Standards subsection. Each criterion is verifiable by reading the cited source spec or — once implemented — by an automated check (ESLint, `tsc --noEmit`, Vitest).

ID format: `AT-TYPESCRIPT-NN`.

---

## Criteria

### Type Safety (AT-TYPESCRIPT-01..05)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-TYPESCRIPT-01 | Zero `any` types appear in `src/`; verified by ESLint `@typescript-eslint/no-explicit-any: error`. | [`07-type-safety-remediation-plan.md`](./07-type-safety-remediation-plan.md) + [`11-eslint-enforcement.md`](./11-eslint-enforcement.md) |
| AT-TYPESCRIPT-02 | Zero `unknown` and `Record<string, unknown>` appear outside narrow type-guard helpers; banned at the type-system level. | [`08-typescript-standards-reference/`](./08-typescript-standards-reference/00-overview.md) |
| AT-TYPESCRIPT-03 | Generic functions declare concrete type parameters (no implicit `T = any`); inference must succeed at every call site. | [`08-typescript-standards-reference/`](./08-typescript-standards-reference/00-overview.md) |
| AT-TYPESCRIPT-04 | All branded types (`ItemId`, `OwnerId`, etc.) are constructed via dedicated `as*()` helpers — no raw `string` cast is accepted. | `src/types/index.ts` + [`08-typescript-standards-reference/`](./08-typescript-standards-reference/00-overview.md) |
| AT-TYPESCRIPT-05 | `tsc --noEmit` passes with `strict: true` in `tsconfig.json`. | [`11-eslint-enforcement.md`](./11-eslint-enforcement.md) |

### Enums (AT-TYPESCRIPT-06..09)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-TYPESCRIPT-06 | Every enum uses TypeScript `enum` syntax with PascalCase values and a `Type` suffix on the enum name; string union types are prohibited as a substitute. | [`00-overview.md`](./00-overview.md) |
| AT-TYPESCRIPT-07 | Each documented enum (`ConnectionStatus`, `EntityStatus`, `ExecutionStatus`, `ExportStatus`, `HttpMethod`, `MessageStatus`, `LogLevel`) lives in its own file under `src/lib/enums/` with the path stated in the spec. | [`01-connection-status-enum.md`](./01-connection-status-enum.md) … [`10-log-level-enum.md`](./10-log-level-enum.md) |
| AT-TYPESCRIPT-08 | The `ItemType` enum in `src/types/index.ts` matches `spec/20-enums-index.md` (verified by `scripts/spec-hygiene/15-check-enums-in-sync.mjs`). | `scripts/spec-hygiene/15-check-enums-in-sync.mjs` |
| AT-TYPESCRIPT-09 | Adding a new tracked enum requires one row in the hygiene script's `ENUMS` table; failure to register triggers a CI gate. | `scripts/spec-hygiene/15-check-enums-in-sync.mjs` |

### Patterns (AT-TYPESCRIPT-10..13)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-TYPESCRIPT-10 | Every `Promise` is either `await`ed or explicitly handled with `.catch()`; floating promises are forbidden (ESLint `@typescript-eslint/no-floating-promises: error`). | [`09-promise-await-patterns.md`](./09-promise-await-patterns.md) + [`11-eslint-enforcement.md`](./11-eslint-enforcement.md) |
| AT-TYPESCRIPT-11 | Async functions never mix `await` with `.then()` chaining for the same promise. | [`09-promise-await-patterns.md`](./09-promise-await-patterns.md) |
| AT-TYPESCRIPT-12 | Discriminated unions use a literal-string `kind` / `type` field; consumers exhaustively switch via `assertNever()` to enforce coverage at compile time. | [`12-discriminated-union-patterns.md`](./12-discriminated-union-patterns.md) |
| AT-TYPESCRIPT-13 | Every ESLint rule listed in `11-eslint-enforcement.md` is wired in `eslint.config.*` and runs in CI. | [`11-eslint-enforcement.md`](./11-eslint-enforcement.md) |

---

## Verification

```bash
grep -rn "AT-TYPESCRIPT-" spec/02-coding-guidelines/02-typescript/
node scripts/spec-hygiene/00-run-all.mjs
bunx tsc --noEmit
bun test
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Subsection overview
- [`spec/20-enums-index.md`](../../20-enums-index.md) — Enum SSOT
- [`spec/02-coding-guidelines/01-cross-language/02-boolean-principles/97-acceptance-criteria.md`](../01-cross-language/02-boolean-principles/97-acceptance-criteria.md) — Cross-language boolean rules

*Curated v2.0.0 — 2026-04-25 (UTC+8). Replaced legacy AC-01/AC-02 placeholder.*
