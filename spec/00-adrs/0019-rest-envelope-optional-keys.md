# ADR-0019: REST envelope optional keys — `Navigation`, `Errors`, `MethodsStack` presence rules + shapes

## Status

`Accepted` — 2026-04-28

## Context

ADR-0004 ratified the three **mandatory** envelope keys (`Status`,
`Attributes`, `Results`) but explicitly deferred the three **optional**
keys (`Navigation`, `Errors`, `MethodsStack`) to
`spec/04-database-conventions/06-rest-api-format/`. That spec defines
each key's *shape* in concrete JSON samples and types
(`02-rest-samples.md`, `03-envelope-and-flow.md`,
`04-language-implementation.md`), but two contracts remain unratified
and inconsistently applied:

1. **Presence rule** — when a key MUST be omitted vs. present-but-`null`
   vs. present-with-content. The TypeScript type uses `object | null`
   ("present-but-null is legal") while the JSON samples just **omit**
   the key (single-resource GET has no `Navigation`/`Errors`/`MethodsStack`
   fields at all). Both shapes parse, but they produce different
   client code.
2. **Pagination model** — `Navigation` ships `NextPage` / `PrevPage` /
   `CloserLinks` (full-URL, page-based) in samples while
   `Attributes.CurrentPage` / `PerPage` / `TotalPages` carry the
   numeric counterpart. Cursor-based, offset-based, and link-based
   pagination would all type-check; the sample's URL shape is the
   only signal of intent.

Without an ADR pin, an AI implementer has three legitimate but
incompatible defaults to choose from per response, fragmenting
client code across endpoints.

## Decision

**D1 — Omit, never null.** Optional envelope keys (`Navigation`,
`Errors`, `MethodsStack`) MUST be **omitted entirely** from the
response body when their content does not apply. Emitting
`"Navigation": null` is forbidden. Clients MUST treat key
presence as the truth signal:

```ts
type Envelope<T> = {
  Status: StatusBlock;
  Attributes: AttributesBlock;
  Results: T[];
  Navigation?: NavigationBlock;   // present iff paginated
  Errors?: ErrorsBlock;           // present iff Attributes.HasAnyErrors === true
  MethodsStack?: MethodsStackBlock; // present iff debug enabled in config
};
```

The `object | null` typing in
`spec/04-database-conventions/06-rest-api-format/04-language-implementation.md`
line 69 is hereby **superseded** by the optional-property typing
above and MUST be corrected as a follow-up.

**D2 — `Navigation` presence rule.** Present **iff** the endpoint is
list-shaped AND `Attributes.IsMultiple === true` AND
`Attributes.TotalRecords > Attributes.PerPage`. Single-resource
GETs, deletes (`Results: []`), and exhausted last-page list responses
(no further page) MUST omit `Navigation` entirely.

**D3 — `Navigation` shape (page-based, full URLs).** The pagination
model is **page-based** with full absolute URLs:

```ts
type NavigationBlock = {
  NextPage: string | null;     // null only on last page; key still present iff Navigation block present
  PrevPage: string | null;     // null only on first page
  CloserLinks: string[];       // 0..5 nearby pages, ordered, ALWAYS includes current ± up to 2
};
```

- Cursor-based pagination is **forbidden** at the envelope level.
- Offset-based query strings (`?offset=N&limit=M`) are forbidden;
  use `?page=N&perPage=M`.
- `NextPage` / `PrevPage` MUST be absolute URLs (scheme + host),
  not relative paths, so a captured response can be replayed
  without context. Inside `NavigationBlock`, `null` IS permitted on
  `NextPage`/`PrevPage` (this is the only legal `null` in the
  envelope's optional layer).

**D4 — `Errors` presence rule.** Present **iff**
`Attributes.HasAnyErrors === true`. The two MUST stay in lockstep —
a `true` flag with omitted `Errors`, or an `Errors` block with
`HasAnyErrors: false`, are both protocol violations.

**D5 — `Errors` shape.** Per the sample at `02-rest-samples.md` lines
295–303:

```ts
type ErrorsBlock = {
  BackendMessage: string;             // human-readable, never empty
  DelegatedServiceErrorStack: string[]; // upstream service errors, may be []
  Backend: string[];                  // PHP/SQLite stack frames (file:line method)
  Frontend: string[];                 // client-reported frames, populated by error-modal upload only
};
```

- All four sub-keys MUST be present when `Errors` is present
  (no nested optional-key cascade).
- `Backend` / `Frontend` arrays MAY be empty `[]` but MUST NOT be
  omitted.
- Frame strings follow `"<file>:<line> <method>"` format
  (e.g. `"handlers.go:92 handleGetTransaction"`).
- Error codes flow through `Status.Code` per ADR-0004; `Errors`
  carries diagnostic context, not the canonical code.

**D6 — `MethodsStack` presence rule.** Present **iff** the WP plugin
config flag `debug.methods_stack` (or equivalent runtime toggle) is
enabled for the responding request. Production responses MUST omit
this key. The toggle MUST default to `false`.

**D7 — `MethodsStack` shape.** Debug call-chain trace; structure
deferred to `spec/04-database-conventions/06-rest-api-format/`
implementation, but MUST be a JSON object (not an array) with at
minimum:

```ts
type MethodsStackBlock = {
  Frames: Array<{ Method: string; File: string; Line: number }>;
  StartedAt: string;        // ISO-8601 UTC
  ElapsedMs: number;
};
```

Production builds MUST strip the toggle path entirely (D6 + tree-shake)
so the shape cannot leak.

**D8 — Attributes ↔ optional-key invariants.** The following
invariants MUST hold in every response and SHOULD be enforced by a
shared envelope validator:

| `Attributes` field | Optional key linkage |
|---|---|
| `HasAnyErrors === true` | `Errors` present |
| `HasAnyErrors === false` | `Errors` omitted |
| `IsMultiple === true` AND `TotalPages > 1` | `Navigation` present |
| `IsSingle === true` OR `IsEmpty === true` | `Navigation` omitted |
| `debug.methods_stack === true` (config) | `MethodsStack` present |
| (default / production) | `MethodsStack` omitted |

## Consequences

**Positive**

- Closes ADR-0004's deferred contract; clients can rely on key
  presence instead of running null-checks on three optional fields.
- Single canonical pagination model (page-based + full URLs) eliminates
  cursor-vs-offset-vs-page drift across endpoints.
- `HasAnyErrors` ↔ `Errors` lockstep makes error-handling client code
  type-safe via discriminated unions.
- Production responses are guaranteed never to leak debug stack
  traces (D6 + D7).

**Negative**

- The TypeScript type at
  `04-language-implementation.md:69` (`Navigation?: { ... } | null`)
  is now stale and must be rewritten to drop the `| null`.
- Page-based pagination cannot represent "live" feeds where
  total-count is unknown; if a future endpoint needs cursor
  pagination, it requires a superseding ADR.
- `Frontend` / `Backend` arrays mandated even when empty wastes
  ~30 bytes per error response, which adds up only for chatty
  clients.
- Two layers of "null vs omit" rules (omit at envelope level,
  null permitted inside `Navigation.NextPage`/`PrevPage`) can
  surprise readers — D3 calls this out explicitly to mitigate.

## Alternatives Considered

1. **Always-present, `null` when empty** — rejected: forces every
   client to write `if (env.Navigation) { ... }` despite the type
   being `object`, which TypeScript's strict mode rightly flags as
   noise. Omit-or-present matches the existing JSON samples and
   matches REST envelope conventions (Stripe, GitHub, Linear).
2. **Cursor-based pagination** — rejected: WP-plugin SQLite backend
   (ADR-0002) trivially computes `TotalRecords` / `TotalPages`;
   cursor pagination's value (stable pagination during inserts)
   doesn't justify the API surface change here.
3. **Relative-URL `NextPage` / `PrevPage`** — rejected: breaks
   capture/replay testing and forces clients to know the host
   prefix. Absolute URLs cost ~30 bytes/page and remove an
   entire class of "wrong base URL" bugs.
4. **Merge `Errors` into `Status`** — rejected: `Status.Code` and
   `Status.Message` are user-facing; `Errors.Backend` /
   `Errors.Frontend` are diagnostic. Mixing them couples
   user-presented copy to internal stack traces and complicates
   ADR-0004's PascalCase mandatory shape.

## Gates Touched

- **New gates:**
  - `G-04-OPTIONAL-OMIT-NEVER-NULL` — enforces D1 (no
    `"Navigation": null`, `"Errors": null`, `"MethodsStack": null`
    in any response body; CI greps fixtures + integration tests).
  - `G-04-NAVIGATION-PRESENCE` — enforces D2 (presence iff
    `IsMultiple && TotalPages > 1`).
  - `G-04-NAVIGATION-PAGE-BASED` — enforces D3 (no `?cursor=`,
    no `?offset=` query strings; `NextPage` / `PrevPage` must
    be absolute URLs).
  - `G-04-ERRORS-LOCKSTEP` — enforces D4 (`HasAnyErrors` ↔
    `Errors` presence in every response fixture).
  - `G-04-ERRORS-FOUR-KEYS-REQUIRED` — enforces D5 (when present,
    all four sub-keys exist; arrays may be empty but not absent).
  - `G-04-METHODSSTACK-DEBUG-ONLY` — enforces D6/D7 (omitted in
    production builds; `debug.methods_stack` defaults to `false`;
    no `MethodsStack` in any production fixture).
  - `G-04-ENVELOPE-VALIDATOR` — enforces D8 invariants centrally
    (single validator function shared by REST handler middleware
    and client-side response parser).
- **Modified gates:** `G-04-WIRE-PASCALCASE` (ADR-0004) clarified
  to additionally require omit-not-null for optional keys.
- **Endpoints locked:** all endpoints under
  `spec/04-database-conventions/06-rest-api-format/` SSOT
  (no specific `EP-…` lock; this is a cross-cutting envelope rule).
- **DDL identifiers locked:** `(none)` — wire format only.

## Supersedes / Superseded-By

- **Supersedes:** `(none)` formally; **closes ADR-0004's deferred
  contract** for the three optional keys; **deprecates** the
  `object | null` typing at
  `spec/04-database-conventions/06-rest-api-format/04-language-implementation.md:69`.
- **Superseded-By:** `(none)`
