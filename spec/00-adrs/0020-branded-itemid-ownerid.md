# ADR-0020: Branded `ItemId` / `OwnerId` types — opaque-string brands with constructor guards

## Status

`Accepted` — 2026-04-28

## Context

`src/types/index.ts` lines 15–22 already define
`ItemId = Brand<string, "ItemId">` and
`OwnerId = Brand<string, "OwnerId">` using the standard unique-symbol
brand pattern, plus `asItemId()` / `asOwnerId()` constructor guards
(lines 115–131). The pattern is referenced by `mem://architecture/data-model`
as F-06 (2026-04-25 deferral note). However:

1. The pattern is **never spec-ratified**. No file under `spec/`
   mandates branded IDs; the guide at
   `spec/02-coding-guidelines/00-overview.md` line 96 still shows
   `parentId: string, ownerId: string` as the canonical example,
   directly contradicting the implementation.
2. Without an ADR, an AI implementer reading the spec sees `string`
   and has no signal to import the brand. Three days into a feature
   they discover they've passed `OwnerId` where `ItemId` was
   expected (the type system catches it now, but the *spec*
   doesn't tell them to use the type system this way).
3. The runtime shape (UUID v7? ULID? `itm_01HX…`?) was deferred per
   F-06 pending backend choice. ADR-0002 resolved the backend
   (WordPress + SQLite, 2026-04-25) — long enough ago that the
   deferral can now close.

## Decision

**D1 — Branded opaque-string types are mandatory.** Every entity ID
in the TypeScript codebase MUST be a branded string, never a raw (gate G-24-IDS-MUST-BE-BRANDED)
`string`. The two ratified brands are:

```ts
declare const __brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [__brand]: B };

export type ItemId  = Brand<string, "ItemId">;
export type OwnerId = Brand<string, "OwnerId">;
```

Additional brands (e.g. `MirrorId`, `ShareId`, `RoleId`) MUST follow (gate G-24-IDS-MUST-BE-BRANDED)
the same pattern and MUST be added to `src/types/index.ts` (single (gate G-24-IDS-MUST-BE-BRANDED)
SSOT for branded ID types).

**D2 — Construction only at trust boundaries.** Branded values MUST (gate G-24-IDS-MUST-BE-BRANDED)
be constructed exclusively via the `as<Brand>()` helper functions
(`asItemId`, `asOwnerId`, …) at three trust boundaries:

1. **REST envelope deserialisation** (per ADR-0019) — the response
   parser is the single conversion point for ID strings arriving
   from the backend.
2. **URL / route parameter parsing** (per ADR-0018 v7 loaders) —
   route loaders convert path/query string IDs at the loader entry
   point, never inside components.
3. **Local storage / IndexedDB rehydration** (per ADR-0010 offline
   queue) — replay code and local-mirror reads convert at load.

`as Foo` cast syntax (`raw as ItemId`) outside the helper functions
is **forbidden** — CI MUST flag it. Helper bodies are the only (gate G-24-IDS-MUST-BE-BRANDED)
place a cast appears, and they MUST validate (currently: non-empty (gate G-24-IDS-MUST-BE-BRANDED)
length; D4 below extends this).

**D3 — Runtime shape closes deferral.** `ItemId` and `OwnerId` runtime
values are **opaque ASCII strings** matching `^[A-Za-z0-9_-]{8,64}$`
on the wire and in storage. The exact generator is implementation
choice (UUID v4, UUID v7, ULID, `itm_<ulid>` prefix, etc.) but MUST (gate G-24-IDS-MUST-BE-BRANDED)
satisfy:
- ASCII-safe (no Unicode, no path-unsafe characters);
- length 8–64 bytes inclusive;
- collision-resistant at scale (≥ 2^64 entropy);
- lexicographically sortable is **preferred** but not required.

Constructor helpers (D2) MUST validate the regex on construction and (gate G-24-IDS-MUST-BE-BRANDED)
throw a typed error on violation (current implementation only checks
non-empty — this is the extension point).

**D4 — Helper contract.** The `as<Brand>()` functions MUST (gate G-24-IDS-MUST-BE-BRANDED):
- accept `string` (not `unknown`);
- validate per D3 (regex match + length 8–64);
- throw a tagged error (`InvalidIdError`) on violation, never
  silently coerce;
- be the **only** export shape for constructing the brand
  (no class, no factory object).

**D5 — Spec / wire contract.** On the wire (REST envelope per
ADR-0019), IDs serialise as plain JSON strings. Branding is a
**TypeScript-only** discipline; PHP/SQLite have no branded-string
construct, so the WP plugin treats IDs as `string` with a
runtime regex check matching D3.

**D6 — Spec consistency sweep.** All spec lines that type ID fields
as plain `string` MUST be corrected as a follow-up (gate G-24-IDS-MUST-BE-BRANDED):
- `spec/02-coding-guidelines/00-overview.md` line 96/100
  (`parentId: string, ownerId: string` → branded).
- `spec/01-spec-authoring-guide/13-feature-file-template.md` line 45
  (`itemId | string` → `itemId | ItemId`).
- Any other field whose name ends in `Id` or `id` and types it
  `string` instead of a brand. (Folded into P69 stale-typing sweep.)

## Consequences

**Positive**

- Closes the F-06 deferral; runtime shape now decided and
  validatable.
- Prevents the entire class of "I passed an `OwnerId` where an
  `ItemId` was expected" bugs at compile time.
- Single SSOT for ID types (`src/types/index.ts`) means new
  entity types added later inherit the discipline by following
  one file.
- Constructor guards centralise validation — invalid IDs from
  the backend, URL, or storage are caught at the boundary, not
  three layers deep in business logic.
- Wire format stays plain string, so the WP/PHP/SQLite layer is
  unaffected.

**Negative**

- Existing spec snippets typing IDs as `string` are now stale
  (D6 sweep required).
- Adding a new branded ID type requires a code edit in
  `src/types/index.ts` rather than ad-hoc inline branding —
  marginal friction for the type-safety win.
- Validation regex `^[A-Za-z0-9_-]{8,64}$` rules out some otherwise-
  reasonable formats (e.g. `urn:uuid:...`); migrating to such a
  format later requires a superseding ADR.
- Tagged error class (`InvalidIdError`) is a new export the team
  must remember to import in catch blocks.


**Spec impact** — Downstream sections affected by this decision: [`spec/31-app/`](../31-app/), [`spec/02-coding-guidelines/02-typescript/`](../02-coding-guidelines/02-typescript/).

## Alternatives Considered

1. **Plain `string` everywhere (status quo of the spec)** —
   rejected: defeats the type system; identical-shape primitive
   IDs are the canonical example of why branded types exist.
2. **Class-based ID types (`class ItemId { constructor(raw) {} }`)** —
   rejected: ergonomic cost (every ID becomes an object,
   `===` comparison breaks, JSON serialisation needs custom logic),
   plus the brand pattern is the idiomatic TS approach.
3. **Validate at the type level only (no runtime regex check)** —
   rejected: branded types catch *misuse* but not *bad data*. A
   malformed ID from a corrupted local-storage replay would silently
   propagate without D3/D4's runtime regex.
4. **Defer runtime shape further** — rejected: backend chosen
   2026-04-25 (ADR-0002); deferral has had 3+ days to close. Any
   further wait blocks the constructor's validation logic.
5. **Use `nominal` libraries (`ts-brand`, `type-fest` `Opaque`)** —
   rejected: the in-house 7-line pattern in `src/types/index.ts`
   has zero dependencies, zero runtime cost, and is already shipped.

## Gates Touched

- **New gates:**
  - `G-24-IDS-MUST-BE-BRANDED` — enforces D1 (CI scans for
    function parameters / object fields named `id`, `*Id`, `*ID`
    typed as `string`; flag as error).
  - `G-24-NO-INLINE-AS-BRAND` — enforces D2 (`as ItemId`,
    `as OwnerId` outside `src/types/index.ts` is a CI error;
    use the helper).
  - `G-24-ID-CONSTRUCTORS-VALIDATE` — enforces D4 (helper
    bodies must call the regex check + throw `InvalidIdError`
    on failure; non-validating helpers are an error).
  - `G-24-ID-WIRE-REGEX` — enforces D3 (REST handlers and the
    WP-plugin PHP layer apply the same `^[A-Za-z0-9_-]{8,64}$`
    regex on inbound IDs).
- **Modified gates:** `(none)` — but D6 sweep is folded into
  P69 stale-typing audit.
- **Endpoints locked:** `(none)` — wire format is unchanged
  (plain string).
- **DDL identifiers locked:** `Item.Id`, `Item.ParentId`,
  `Item.OwnerId`, `Mirror.SourceItemId`, `Mirror.TargetItemId`,
  `Permission.ItemId`, `Permission.OwnerId` (and any other
  `*Id` columns under singular DDL per ADR-0001) are confirmed
  as `TEXT NOT NULL` matching the D3 regex on insert.

## Supersedes / Superseded-By

- **Supersedes:** `(none)` formally; **closes F-06 deferral**
  (2026-04-25 from `mem://architecture/data-model`); **deprecates**
  `string`-typed ID examples in
  `spec/02-coding-guidelines/00-overview.md` lines 96 / 100 and
  `spec/01-spec-authoring-guide/13-feature-file-template.md` line 45.
- **Superseded-By:** `(none)`
