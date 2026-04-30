# Boundary Enforcement — Sub-Spec

> **Version:** 1.0.0 — authored 2026-04-30
> **Owner section:** `spec/35-enforcement-rules/`
> **Status:** Draft (P1 — load-bearing for `AT-ENFORCEMENTRULES-12..14` and gates `G-35-BE-*`).
> **Parent:** [`./00-overview.md`](./00-overview.md) §"Pending Sub-Specs" row 04
> **Siblings:** [`./01-generic-return-types.md`](./01-generic-return-types.md) · [`./02-runtime-validation.md`](./02-runtime-validation.md) · [`./03-eslint-rule-authoring.md`](./03-eslint-rule-authoring.md)

---

## Purpose

Define the **single chokepoint** through which every value crossing a trust boundary MUST pass, and the gates that prove no caller bypassed it. Where `02-runtime-validation.md` defines *what* a schema looks like and `03-eslint-rule-authoring.md` defines *how* a rule is authored, this sub-spec defines the **architectural funnel**: every B1–B5 boundary has exactly one allowed chokepoint module, and every other module is forbidden from importing the underlying primitive (`axios`, `idb`, `EventSource`, `localStorage`).

---

## The Chokepoint Principle

Per the trust-boundary table in [`02-runtime-validation.md`](./02-runtime-validation.md) §Trust Boundaries, the project has 5 boundaries. Each has exactly one chokepoint module — the only file in `src/` allowed to import the underlying primitive.

| Boundary | Underlying primitive | Sole chokepoint module | Forbidden everywhere else |
|---|---|---|---|
| B1 — HTTP | `axios` | `src/api/client.ts` | `import axios` outside the chokepoint |
| B2 — REST handlers | (PHP, out of TS scope) | `wp-plugin/src/Rest/Kernel.php` | n/a |
| B3 — IndexedDB | `idb` | `src/lib/idb/client.ts` | `import { openDB } from 'idb'` outside the chokepoint |
| B4 — SSE | `EventSource` (global) | `src/realtime/sseClient.ts` | `new EventSource(…)` outside the chokepoint |
| B5 — URL params | React Router (allowed import) | inline in `*.loader.ts` files | route loaders MUST `.parse()` params |

> **MUST** every primitive listed above be imported by exactly ONE module in `src/` (its chokepoint), enforced by the ESLint rule `coding-guidelines/no-direct-boundary-import` `[gate: G-35-BE-CHOKEPOINT-IMPORT]`.

> **MUST** every chokepoint module own its boundary's parse step and re-export only typed, branded, schema-validated values — re-exporting `axios.AxiosResponse<unknown>` or raw `IDBValidKey` is forbidden `[gate: G-35-BE-EXPORT-NARROW]`.

---

## Why Chokepoints (vs. "just remember to validate")

Without chokepoints, runtime validation depends on every developer remembering to call `parseResponse(…)` at every call site. Chokepoints make this mechanical:

| Without chokepoint | With chokepoint |
|---|---|
| 100+ call sites; each must remember to validate | 1 module; impossible to forget |
| New devs grep for `axios.get` and copy patterns | New devs grep for `api.get` (the typed wrapper) |
| Forgetting validation = silent runtime crash | Forgetting validation = compile error (no narrow type exported) |
| Lint rule must inspect every call site | Lint rule inspects 1 import path |

This is the "single chokepoint" pattern — a load-bearing decision that pre-empts an entire class of bugs.

---

## Chokepoint Specifications

### B1 — `src/api/client.ts`

```ts
// src/api/client.ts — sole module allowed to import axios
import axios from 'axios';
import { z } from 'zod';
import { EnvelopeSchema } from '@/lib/schemas/envelope.schema';
import { parseResponse } from '@/lib/parseResponse';

const instance = axios.create({ baseURL: '/api', timeout: 10_000 });

export const api = {
  async get<TRow>(path: string, rowSchema: z.ZodType<TRow>): Promise<TRow[]> {
    const { data } = await instance.get<unknown>(path);
    const env = parseResponse(data, EnvelopeSchema(rowSchema));
    if (env.Status !== 'Success') throw new EnvelopeError(env);
    return env.Results;
  },
  // post, patch, delete — same shape
};
```

> **MUST** `src/api/client.ts` be the only file in the repository that imports `axios` directly; every other module MUST `import { api } from '@/api/client'` `[gate: G-35-BE-AXIOS-CHOKEPOINT]`.

### B3 — `src/lib/idb/client.ts`

```ts
// src/lib/idb/client.ts — sole module allowed to import 'idb'
import { openDB, type IDBPDatabase } from 'idb';
import { z } from 'zod';
import { parseResponse } from '@/lib/parseResponse';

let db: IDBPDatabase | null = null;
async function getDb(): Promise<IDBPDatabase> {
  if (db) return db;
  db = await openDB('workflowy', 1, { upgrade(d) { /* schema */ } });
  return db;
}

export const idb = {
  async get<T>(store: string, key: string, schema: z.ZodType<T>): Promise<T | null> {
    const raw = await (await getDb()).get(store, key);
    if (raw === undefined) return null;
    return parseResponse(raw, schema);
  },
  // put, delete, transaction — same shape
};
```

> **MUST** `src/lib/idb/client.ts` be the only file allowed to import from the `idb` package; every other module MUST `import { idb } from '@/lib/idb/client'` `[gate: G-35-BE-IDB-CHOKEPOINT]`.

### B4 — `src/realtime/sseClient.ts`

```ts
// src/realtime/sseClient.ts — sole module allowed to instantiate EventSource
import { z } from 'zod';
import { FrameSchema } from './frames.schema';
import { parseResponse } from '@/lib/parseResponse';

export function openStream(path: '/stream/page/{id}' | '/stream/user/{id}', onFrame: (f: Frame) => void) {
  const es = new EventSource(path);
  es.onmessage = (e) => onFrame(parseResponse(JSON.parse(e.data), FrameSchema));
  return () => es.close();
}
```

> **MUST** `src/realtime/sseClient.ts` be the only file allowed to instantiate `new EventSource(…)`; every consumer MUST `import { openStream } from '@/realtime/sseClient'` `[gate: G-35-BE-SSE-CHOKEPOINT]`.

### B5 — Loader inline parse

```ts
// src/routes/page.$pageId.loader.ts
import { z } from 'zod';
import { ItemIdSchema } from '@/lib/schemas/branded.schema';

const ParamsSchema = z.object({ pageId: ItemIdSchema });

export async function loader({ params }: LoaderArgs) {
  const { pageId } = ParamsSchema.parse(params); // B5 chokepoint = this line
  // …
}
```

> **MUST** every React Router loader/action that reads `params` or `request.url` parse them through a Zod schema before any field access — `params.pageId` accessed without a prior `.parse()` is forbidden `[gate: G-35-BE-LOADER-PARSE]`.

---

## Migration Path (existing direct imports)

When introducing chokepoint enforcement to a codebase with N existing direct imports:

1. **Inventory** — `rg -lnP "^import .* from ['\"](axios|idb|EventSource)['\"]" src/` produces the full list.
2. **Per-import migration** — replace each direct call with the chokepoint wrapper; verify the schema.
3. **Graduation** — add the rule at `warn` first; register in `_GATE-GRADUATION-LEDGER.md` per ADR-0031 with target promotion date ≤14 days.
4. **Promote** — flip to `error`; rule now blocks CI.

> **MUST** every chokepoint rule be promoted from `warn` to `error` within 14 days of introduction OR be removed; permanent `warn` is forbidden by sibling `03-eslint-rule-authoring.md` §Severity Policy `[gate: G-35-BE-PROMOTE-OR-REMOVE]`.

---

## Anti-Patterns

| # | Anti-pattern | Why it fails | Gate |
|---|---|---|---|
| 1 | `import axios from 'axios'` outside `src/api/client.ts` | Bypasses envelope validation; raw `unknown` enters the app. | `G-35-BE-AXIOS-CHOKEPOINT` |
| 2 | `import { openDB } from 'idb'` outside `src/lib/idb/client.ts` | Bypasses schema validation on IDB reads. | `G-35-BE-IDB-CHOKEPOINT` |
| 3 | `new EventSource(…)` outside `src/realtime/sseClient.ts` | Bypasses SSE frame validation. | `G-35-BE-SSE-CHOKEPOINT` |
| 4 | Loader accessing `params.id` without `.parse(params)` | URL params are user-controlled; raw access is XSS / injection vector. | `G-35-BE-LOADER-PARSE` |
| 5 | Chokepoint exporting `AxiosResponse<unknown>` | Forces every caller to re-narrow; defeats the chokepoint. | `G-35-BE-EXPORT-NARROW` |
| 6 | Permanent `warn` for a chokepoint rule | Functionally equivalent to `off`; defeats enforcement. | `G-35-BE-PROMOTE-OR-REMOVE` |
| 7 | Wrapping the chokepoint with another wrapper that re-exports the primitive | Defeats the architectural funnel. | `G-35-BE-NO-RE-WRAP` |
| 8 | Using `localStorage` (any path) | Forbidden corpus-wide per ADR-0021. | `G-35-EL-NO-LOCALSTORAGE` (sibling 03) |

---

## Acceptance-Criteria Binds

| AT id | Rule covered | Assertion summary |
|---|---|---|
| `AT-ENFORCEMENTRULES-12` | Chokepoint imports | `rg -lnP "^import .* from 'axios'" src/` returns exactly `src/api/client.ts`. |
| `AT-ENFORCEMENTRULES-13` | IDB chokepoint | `rg -lnP "from 'idb'" src/` returns exactly `src/lib/idb/client.ts`. |
| `AT-ENFORCEMENTRULES-14` | Four-layer enforcement runs in CI | `.github/workflows/ci.yml` job names include `compile`, `lint`, `runtime-test`, `type-test`; each step exits 0. |

Fixtures live in [`./97a-acceptance-criteria-fixtures.md`](./97a-acceptance-criteria-fixtures.md).

---

## Worked Example — Adding a new boundary

Suppose v2 introduces a Web Worker boundary (B6). The migration path:

1. Add B6 row to the trust-boundary table in `02-runtime-validation.md`.
2. Define `src/workers/workerClient.ts` as the sole chokepoint that calls `new Worker(…)` and parses `MessageEvent` payloads via a Zod `WorkerMessageSchema`.
3. Author ESLint rule `coding-guidelines/no-direct-worker-import` per `03-eslint-rule-authoring.md` (RuleTester ≥3+≥3).
4. Register the rule per the 3-step process in `03-…` §Registering a Rule.
5. Add this sub-spec a B6 chokepoint MUST: "MUST `src/workers/workerClient.ts` be the only file allowed to instantiate `new Worker(…)` `[gate: G-35-BE-WORKER-CHOKEPOINT]`."
6. Add a new `AT-ENFORCEMENTRULES-15` row to `97-acceptance-criteria.md` and `97a-…-fixtures.md`.

The 6-step recipe above is mechanical — no design judgement required at any step.

---

## Cross-References

| Reference | Location |
|---|---|
| Generic return types (sibling) | [`./01-generic-return-types.md`](./01-generic-return-types.md) |
| Runtime validation (sibling) — owns the trust-boundary table | [`./02-runtime-validation.md`](./02-runtime-validation.md) |
| ESLint rule authoring (sibling) | [`./03-eslint-rule-authoring.md`](./03-eslint-rule-authoring.md) |
| Loader↔queue contract | ADR-0023 |
| `localStorage` ban | ADR-0021 |
| SSE-only realtime | ADR-0025 |
| Strict Axios versioning | `mem://architecture/tech-stack` |

---

## Related

- [`./00-overview.md`](./00-overview.md) — Parent overview (§"Pending Sub-Specs" row 04 — closes the cluster)
- [`./97-acceptance-criteria.md`](./97-acceptance-criteria.md) — AT registry
