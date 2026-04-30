# Runtime Validation — Sub-Spec

> **Version:** 1.0.0 — authored 2026-04-30
> **Owner section:** `spec/35-enforcement-rules/`
> **Status:** Draft (P1 — load-bearing for `AT-ENFORCEMENTRULES-05..08` and gates `G-35-RV-*`).
> **Parent:** [`./00-overview.md`](./00-overview.md) §"Pending Sub-Specs" row 02
> **Sibling:** [`./01-generic-return-types.md`](./01-generic-return-types.md)

---

## Purpose

Define **where, when, and how** to add runtime validation (Zod schemas) so that every value crossing a trust boundary is parsed — never trusted as-typed. Compile-time generic rules (sibling `01-…`) only protect in-process types; everything that comes from the network, user input, persistent storage, or another process is `unknown` until a Zod schema parses it.

---

## Trust Boundaries (closed list)

A "trust boundary" is any point where data flows from a source the TS compiler cannot prove. Exactly five exist in this codebase:

| # | Boundary | Owner | Schema location |
|---|---|---|---|
| B1 | HTTP response (Axios) | `src/api/**` client | `<feature>/<feature>.schema.ts` co-located with consumer |
| B2 | HTTP request body (PHP REST handler) | `wp-plugin/src/Rest/**` | `wp-plugin/src/Validation/<Endpoint>Schema.php` (Symfony Validator) |
| B3 | IndexedDB read | Loader (per ADR-0023) | `src/lib/idb/<store>.schema.ts` |
| B4 | SSE frame (`/stream/page/{id}`, `/stream/user/{id}`) | `src/realtime/sseClient.ts` | `src/realtime/frames.schema.ts` |
| B5 | URL params / search params (React Router loader) | `src/routes/**.loader.ts` | inline `z.object({…}).parse(params)` |

> **MUST** every value sourced from B1–B5 pass through a Zod (TS) or Symfony Validator (PHP) parse before any field access — direct `as` casts at boundaries are forbidden `[gate: G-35-RV-PARSE-AT-BOUNDARY]`.

`localStorage` is **not** in the list because it is forbidden corpus-wide (ADR-0021 — IndexedDB only).

---

## Rules

### R1 — Schema co-location

Each consumer feature owns its boundary schema. Shared sub-shapes (e.g. `EnvelopeSchema`, `NodeSchema`, `ItemIdSchema`) live in `src/lib/schemas/`. Cross-feature import of a feature-owned schema is forbidden.

```
src/
  features/
    editor/
      editor.api.ts
      editor.schema.ts        ← ✅ co-located
      editor.loader.ts
  lib/
    schemas/
      envelope.schema.ts      ← ✅ shared
      node.schema.ts          ← ✅ shared
      branded.schema.ts       ← ✅ shared (ItemId, OwnerId)
```

> **MUST** every boundary schema live either co-located with its sole consumer (`<feature>/<feature>.schema.ts`) or in `src/lib/schemas/` when shared across ≥2 features `[gate: G-35-RV-SCHEMA-COLOCATION]`.

### R2 — Envelope schema is load-bearing

Every B1 response MUST be parsed through `EnvelopeSchema(rowSchema)` — never row-by-row directly. The envelope enforces ADR-0004/0019 PascalCase keys (`Status`, `Attributes`, `Results`). `[gate: G-35-RV-USE-ENVELOPE · AT: AT-RV-02]`

```ts
// src/lib/schemas/envelope.schema.ts
import { z } from 'zod';

export const EnvelopeSchema = <TRow extends z.ZodTypeAny>(rowSchema: TRow) =>
  z.discriminatedUnion('Status', [
    z.object({
      Status:     z.literal('Success'),
      Attributes: z.object({ RequestId: z.string() }).passthrough(),
      Results:    z.array(rowSchema),
    }),
    z.object({
      Status:     z.literal('Error'),
      Attributes: z.object({ RequestId: z.string() }).passthrough(),
      Errors:     z.array(z.object({ Code: z.string(), Message: z.string() })),
    }),
  ]);
```

> **MUST** every B1 response parse through `EnvelopeSchema(rowSchema)` — direct `rowSchema.parse(json.Results[0])` without envelope validation is forbidden `[gate: G-35-RV-USE-ENVELOPE]`.

### R3 — Branded IDs are Zod-branded

The Zod schema MUST mint the brand at the parse boundary, so downstream code receives an already-branded value. `[gate: G-35-RV-BRAND-IDS · AT: AT-RV-03]`

```ts
// src/lib/schemas/branded.schema.ts
export const ItemIdSchema  = z.string().min(1).brand<'ItemId'>();
export const OwnerIdSchema = z.string().min(1).brand<'OwnerId'>();
```

> **MUST** every branded-ID field in any boundary schema use `.brand<'ItemId'>()` (or the matching brand) — raw `z.string()` for an ID field is forbidden `[gate: G-35-RV-BRAND-IDS]`.

### R4 — `passthrough()` only on `Attributes` and `Detail`

Most schemas MUST be `.strict()` so unknown keys raise — this catches API drift early. Only `Attributes` (envelope-level metadata) and `Detail` (audit-row JSON) may use `.passthrough()`. `[gate: G-35-RV-STRICT-DEFAULT · AT: AT-RV-04]`

```ts
// ❌ Forbidden — silent drift
const NodeSchema = z.object({ Id: ItemIdSchema, Content: z.string() });

// ✅ Required — strict by default
const NodeSchema = z.object({ Id: ItemIdSchema, Content: z.string() }).strict();
```

> **MUST** every boundary schema except `Attributes` and `Detail` sub-schemas use `.strict()` `[gate: G-35-RV-STRICT-DEFAULT]`.

### R5 — Failure handling is enum-typed

A parse failure at a boundary MUST throw a `BoundaryParseError` that maps to one of the canonical error codes (`USR-35-PARSE`, `USR-35-ENVELOPE`, `USR-35-BRAND`). Silent recovery (try/catch returning `null`) is forbidden.

```ts
import { BoundaryParseError, ErrorCode } from '@/lib/errors';

export function parseResponse<T>(
  raw: unknown,
  schema: z.ZodType<T>,
): T {
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new BoundaryParseError({
      code:   ErrorCode.USR_35_PARSE,
      issues: result.error.issues,
    });
  }
  return result.data;
}
```

> **MUST** every boundary parse failure throw a typed `BoundaryParseError` with one of the `USR-35-*` codes — silent `try { … } catch { return null }` is forbidden `[gate: G-35-RV-NO-SILENT-CATCH]`.

---

## Anti-Patterns

| # | Anti-pattern | Why it fails | Gate |
|---|---|---|---|
| 1 | `JSON.parse(raw) as MyType` at any boundary | Lies to the type system; runtime shape may differ. | `G-35-RV-PARSE-AT-BOUNDARY` |
| 2 | Calling `rowSchema.parse(json.Results[0])` without envelope validation | `Status` may be `Error` and `Results` undefined. | `G-35-RV-USE-ENVELOPE` |
| 3 | `z.string()` for an ID field | Strips the brand; downstream loses type safety. | `G-35-RV-BRAND-IDS` |
| 4 | Cross-feature import of a feature-owned schema | Couples features; violates ownership. | `G-35-RV-SCHEMA-COLOCATION` |
| 5 | `.passthrough()` on a non-`Attributes`/`Detail` schema | Hides API drift; silent bugs survive deploys. | `G-35-RV-STRICT-DEFAULT` |
| 6 | `try { schema.parse(x) } catch { return null }` | Hides parse failures; downstream sees `null` of unknown origin. | `G-35-RV-NO-SILENT-CATCH` |
| 7 | Validating with `typeof` checks instead of Zod | Re-implements partial validation; misses nested fields. | `G-35-RV-USE-ZOD` |

---

## Acceptance-Criteria Binds

| AT id | Rule covered | Assertion summary |
|---|---|---|
| `AT-ENFORCEMENTRULES-05` | R1 | `rg -l "from.*\.schema'" src/features/` shows every feature with API access has a co-located `.schema.ts`. |
| `AT-ENFORCEMENTRULES-06` | R2 | Mock B1 response with `Status: 'Error'` causes consumer to surface `Errors[0].Code` via discriminated union — never reads `Results`. |
| `AT-ENFORCEMENTRULES-07` | R3 | `expectTypeOf(ItemIdSchema.parse('x')).toEqualTypeOf<ItemId>()` passes. |
| `AT-ENFORCEMENTRULES-08` | R5 | Boundary parse failure produces `BoundaryParseError` with `code = 'USR-35-PARSE'` (caught by AppErrorBoundary). |

Fixtures live in [`./97a-acceptance-criteria-fixtures.md`](./97a-acceptance-criteria-fixtures.md).

---

## Worked Example — Loader for editor view

```ts
// src/features/editor/editor.schema.ts
import { z } from 'zod';
import { ItemIdSchema, OwnerIdSchema } from '@/lib/schemas/branded.schema';

export const NodeSchema = z.object({
  Id:        ItemIdSchema,
  ParentId:  ItemIdSchema.nullable(),
  OwnerId:   OwnerIdSchema,
  Content:   z.string(),
  ItemType:  z.enum([/* 12 closed types from ADR-0015 */]),
  SortOrder: z.string().min(1), // base-62 fractional index — ADR-0016
}).strict();

export type Node = z.infer<typeof NodeSchema>;
```

```ts
// src/features/editor/editor.loader.ts
import { EnvelopeSchema } from '@/lib/schemas/envelope.schema';
import { NodeSchema }     from './editor.schema';
import { parseResponse }  from '@/lib/parseResponse';

export async function editorLoader({ params }: LoaderArgs): Promise<Node[]> {
  const pageId = z.string().brand<'ItemId'>().parse(params.pageId); // B5
  const local  = await idb.getPage(pageId);                          // B3
  if (local) return parseResponse(local, z.array(NodeSchema));       // mirror-first per ADR-0023
  const json   = await api.get(`/page/${pageId}`);                   // B1
  const env    = parseResponse(json, EnvelopeSchema(NodeSchema));
  if (env.Status !== 'Success') throw new BoundaryParseError({ code: 'USR-35-ENVELOPE', issues: [] });
  return env.Results;
}
```

This loader exercises **3 of the 5 trust boundaries** (B1, B3, B5) and satisfies all 5 rules.

---

## Cross-References

| Reference | Location |
|---|---|
| Generic return types (sibling) | [`./01-generic-return-types.md`](./01-generic-return-types.md) |
| ESLint rule authoring (sibling) | `./03-eslint-rule-authoring.md` (pending) |
| Boundary enforcement (sibling) | `./04-boundary-enforcement.md` (pending) |
| API envelope shape | ADR-0004 / ADR-0019 |
| Loader↔queue contract | ADR-0023 |
| `localStorage` ban | ADR-0021 |

---

## Related

- [`./00-overview.md`](./00-overview.md) — Parent overview (§"Pending Sub-Specs" row 02)
- [`./97-acceptance-criteria.md`](./97-acceptance-criteria.md) — AT registry
