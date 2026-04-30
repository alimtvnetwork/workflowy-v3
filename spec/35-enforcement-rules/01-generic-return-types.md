# Generic Return Types — Sub-Spec

> **Version:** 1.0.0 — authored 2026-04-30
> **Owner section:** `spec/35-enforcement-rules/`
> **Status:** Draft (P1 — load-bearing for `AT-ENFORCEMENTRULES-01..04` and gates `G-35-RT-*`).
> **Parent:** [`./00-overview.md`](./00-overview.md) §"Pending Sub-Specs" row 01

---

## Purpose

Define the **generic-first signature rules** that every public function, hook, and helper MUST follow. The rules below mechanically forbid `any`/`unknown` from leaking out of any callable surface, force callers to pin a concrete type at the call-site, and make every return value structurally inferable without runtime probing.

These rules are the compile-time half of the four-layer enforcement model in [`./00-overview.md`](./00-overview.md) §Enforcement Layers — runtime validation is covered by `02-runtime-validation.md`.

---

## Scope

**In scope** — every TypeScript function declared at module top-level, every exported hook (`use*`), every utility under `src/lib/**`, every loader/action under `src/routes/**`, every PHP controller method that crosses the JSON boundary (PHP is out-of-scope for the generic rules but in-scope for the JSON-shape rule).

**Out of scope** — internal closures, IIFEs, callbacks passed inline to array methods (their return type is inferred from context), test-only helpers under `src/**/*.test.ts`.

---

## Rules

### R1 — No bare `any` in any signature

```ts
// ❌ Forbidden
export function load(id: any): any { … }

// ✅ Required
export function load<TItem extends Node>(id: ItemId): TItem { … }
```

> **MUST** every public function signature use a branded or generic parameter type and a concrete or generic return type — never `any` `[gate: G-35-RT-NO-ANY]`.

### R2 — No `unknown` returns from public surfaces

`unknown` is acceptable as a parameter for parsers (`schema.parse(input: unknown)`), but never as a return type from a public surface. Forces the parser owner to narrow before exposing.

```ts
// ❌ Forbidden — caller has to re-narrow
export function readSetting(key: string): unknown { … }

// ✅ Required — narrow inside, expose typed
export function readSetting<K extends SettingKey>(key: K): SettingValue<K> { … }
```

> **MUST** no exported function or hook return `unknown` — narrow at the boundary, expose the narrow type `[gate: G-35-RT-NO-UNKNOWN]`.

### R3 — Generics MUST be inferable from arguments OR explicitly required

A generic that the caller has no way to supply (no parameter constrains it, no default) is a "phantom generic" — it silently widens to `unknown`. Forbidden.

```ts
// ❌ Phantom generic — T is unconstrained
export function fetch<T>(): Promise<T> { … }

// ✅ Inferable from arg
export function fetch<T>(schema: ZodSchema<T>): Promise<T> { … }

// ✅ Explicit-only with default
export function fetch<T = never>(url: string): Promise<T> {
  // T = never forces caller to specify: fetch<UserDto>('/me')
}
```

> **MUST** every generic parameter be either inferable from an argument or default to `never` (forcing explicit annotation) — phantom generics that silently widen are forbidden `[gate: G-35-RT-NO-PHANTOM]`.

### R4 — Branded IDs cross every boundary

Per ADR-0020, raw `string` IDs are forbidden. Generic helpers MUST preserve the brand through the return type.

```ts
// ❌ Forbidden — strips the brand
export function parentOf(id: string): string { … }

// ✅ Required — preserves the brand
export function parentOf(id: ItemId): ItemId { … }

// ✅ Required for cross-brand helpers — generic preserves whichever brand was passed
export function withTimestamp<TId extends ItemId | OwnerId>(id: TId): { Id: TId; At: string } { … }
```

> **MUST** any helper that accepts a branded ID return the same brand (or a generic that preserves it) — never widen to bare `string` `[gate: G-35-RT-PRESERVE-BRAND]`.

### R5 — Discriminated unions over `&` intersections for return types

When a function may return one of several shapes, model with a discriminated union — never an intersection of optional fields.

```ts
// ❌ Forbidden
export function loadView(): { ok: boolean; data?: Items; error?: string } { … }

// ✅ Required
export type ViewResult =
  | { Status: 'Success'; Results: Items }
  | { Status: 'Error';   Errors:  ErrorEnvelope[] };

export function loadView(): ViewResult { … }
```

The discriminator MUST be `Status` (PascalCase) when the value crosses an HTTP boundary (per ADR-0004/0019 envelope rule); for in-process unions any literal-string discriminator is fine.

> **MUST** every multi-shape return type be a discriminated union with a single literal-string discriminator field — never an intersection of optional fields `[gate: G-35-RT-DISCRIMINATED-UNION]`.

---

## Anti-Patterns

| # | Anti-pattern | Why it fails | Gate |
|---|---|---|---|
| 1 | `: any` anywhere in a public signature | Disables all type-checking downstream of the call. | `G-35-RT-NO-ANY` |
| 2 | `: unknown` as a return type | Forces every caller to re-narrow; defeats generics. | `G-35-RT-NO-UNKNOWN` |
| 3 | Phantom generic (`<T>` with no argument referencing `T`) | Silently widens to `unknown`; appears safe but isn't. | `G-35-RT-NO-PHANTOM` |
| 4 | `as` cast on a return value to satisfy the signature | Lies to the type system; runtime shape may differ. | `G-35-RT-NO-RETURN-CAST` |
| 5 | `// @ts-ignore` / `// @ts-expect-error` on an exported declaration | Hides errors at the call site; spreads to every caller. | `G-35-RT-NO-TS-IGNORE` |
| 6 | Function that takes `ItemId` and returns bare `string` | Strips the brand; downstream callers may pass it where `OwnerId` is required. | `G-35-RT-PRESERVE-BRAND` |

---

## Acceptance-Criteria Binds

| AT id | Rule covered | Assertion summary |
|---|---|---|
| `AT-ENFORCEMENTRULES-01` | R1 | `rg -nP ":\s*any\b" src/` returns 0 hits. |
| `AT-ENFORCEMENTRULES-02` | R1 + Anti-pattern #5 | `rg -nP "@ts-ignore\|@ts-expect-error" src/` returns 0 hits in non-test files. |
| `AT-ENFORCEMENTRULES-03` | R3 | Type-test fixture for a phantom generic helper triggers ESLint rule `coding-guidelines/no-phantom-generic`. |
| `AT-ENFORCEMENTRULES-04` | R4 | `expectTypeOf(parentOf(itemId)).toEqualTypeOf<ItemId>()` passes. |

Fixtures live in [`./97a-acceptance-criteria-fixtures.md`](./97a-acceptance-criteria-fixtures.md).

---

## Worked Example — Replacing `any` with a generic

```ts
// Before — disabled type-checking
export function readEnvelope(raw: any): any {
  return raw.Results;
}

// After — pinned at call site, brand preserved, narrow exposed
import { z } from 'zod';

export function readEnvelope<TRow>(
  raw: unknown,
  rowSchema: z.ZodType<TRow>,
): TRow[] {
  const env = EnvelopeSchema(rowSchema).parse(raw);
  if (env.Status !== 'Success') return [];
  return env.Results;
}

// Call site
const items = readEnvelope(json, ItemSchema);
//    ^? Item[]
```

The before-form violates R1, R2, and Anti-pattern #4 simultaneously. The after-form satisfies R2 (`unknown` parameter, narrow return), R3 (`TRow` inferable from `rowSchema`), and R5 (discriminated `Status` check before access).

---

## Cross-References

| Reference | Location |
|---|---|
| Strict typing rules | [`../02-coding-guidelines/01-cross-language/13-strict-typing.md`](../02-coding-guidelines/01-cross-language/13-strict-typing.md) |
| ESLint enforcement mapping | [`../02-coding-guidelines/02-typescript/11-eslint-enforcement.md`](../02-coding-guidelines/02-typescript/11-eslint-enforcement.md) |
| Branded IDs | ADR-0020 |
| API envelope (`Status` discriminator) | ADR-0004 / ADR-0019 |
| Runtime validation (sibling sub-spec) | `./02-runtime-validation.md` (pending) |
| ESLint rule authoring (sibling sub-spec) | `./03-eslint-rule-authoring.md` (pending) |

---

## Related

- [`./00-overview.md`](./00-overview.md) — Parent overview (§"Pending Sub-Specs" row 01)
- [`./97-acceptance-criteria.md`](./97-acceptance-criteria.md) — AT registry
