# UI Reference Skeletons (P7)

> **Generated:** 2026-04-30
> **Generator:** [`scripts/spec-hygiene/41-generate-skeletons.mjs`](../../../scripts/spec-hygiene/41-generate-skeletons.mjs)
> **Source:** [`spec/contract.json`](../../contract.json)
> **Status:** Active reference (auto-regenerated; do NOT hand-edit `*.generated.ts`)

---

## AI Contract

(gate **G-13-FIXTURE-AS-SPEC-SHAPE**) **Purpose** — Provide ready-to-copy TypeScript 5.6+ skeletons (`as const` enum objects + typed Axios API client) derived from the canonical contract. While spec-only mode is active, these files are normative samples that demonstrate the exact shape a frontend implementer MUST follow.

**Audience** — Frontend implementer (when spec-only mode exits) + reviewer.

**Expected AI Output** —
- [`ts/enums.generated.ts`](./ts/enums.generated.ts) — one `as const` object + derived union per contract enum (22 enums); the `enum` keyword is forbidden per coding-guidelines/02-typescript
- [`ts/api-client.generated.ts`](./ts/api-client.generated.ts) — `WorkFlowyApi` interface + `createWorkFlowyApi(http)` factory with one typed method per endpoint (48 endpoints)

**Out of Scope** —
- Request/response payload schemas (Zod schemas live next to consumers per coding-guidelines)
- React hooks — implementer wraps the API client per [`32-ui-design/02-state-and-data/`](../02-state-and-data/00-overview.md)
- Auth headers / session — covered by [`36-user-management/`](../../36-user-management/00-overview.md)

**Definition of Done** —
- Every enum in `spec/contract.json` MUST have a matching `as const` object + derived type (gate **G-13-FIXTURE-AS-SPEC-SHAPE**)
- Every endpoint MUST have a matching method on `WorkFlowyApi` and an entry in `createWorkFlowyApi` (gate **G-13-FIXTURE-AS-SPEC-SHAPE**)
- `node scripts/spec-hygiene/41-generate-skeletons.mjs` exits 0
- Output files type-check under `tsc --strict` once dropped into `src/` (after spec-only mode exits)

---

## Generated files

| File | Contents | Lines (approx.) |
|------|----------|-----------------|
| `ts/enums.generated.ts` | 22 `as const` enum objects + derived unions | ~179 |
| `ts/api-client.generated.ts` | `WorkFlowyApi` interface + factory with 48 typed methods | ~222 |

---

## Verification

```bash
node scripts/spec-hygiene/41-generate-skeletons.mjs
```

---

## Related

- [`../../22-contract-json.md`](../../22-contract-json.md) — Source contract schema
- [`../../15-wp-plugin-how-to/skeletons/00-overview.md`](../../15-wp-plugin-how-to/skeletons/00-overview.md) — Sibling PHP skeletons
- [`../../02-coding-guidelines/02-typescript/00-overview.md`](../../02-coding-guidelines/02-typescript/00-overview.md) — TypeScript style rules

---

*Created 2026-04-28 — closes P7 for the TS side.*
