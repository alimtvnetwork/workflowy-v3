# ADR-0004: REST envelope — PascalCase keys, three mandatory + three optional

## Status

`Accepted` — 2026-04-28

## Context

Every REST response served by the WordPress plugin (ADR-0002) wraps its
payload in a fixed-shape envelope. The shape is referenced from
`spec/04-database-conventions/06-rest-api-format/`, from the `mem://`
core rule, and implicitly from every `EP-*` page under
`spec/31-app/06-endpoints/` — but the rule itself has never been
ratified by an ADR.

Symptoms of the missing anchor:

1. Several endpoint pages already use the envelope keys (`Status`,
   `Attributes`, `Results`) without citing a binding rule, so a future
   contributor could legitimately invent a different shape (e.g. a
   `data` / `error` two-key shape, or the `JSend` convention) and the
   spec has no gate to reject it.
2. The error-management spec (`spec/03-error-manage/`) assumes
   `Errors[]` lives under the envelope but does not anchor the
   contract.
3. AT fixtures (`spec/31-app/97a–97e-…`) hand-write JSON that follows
   the envelope by convention but not by rule — a regenerator script
   could drift silently.
4. The PascalCase-keys decision is symmetric to ADR-0001 (singular
   PascalCase DDL) and ADR-0002 (PHP/SQLite backend), but it stands
   alone in `mem://`.

This ADR closes that gap.

## Decision

Every REST response served by the WordPress plugin **MUST** be a (gate G-04-ENVELOPE-SHAPE)
single JSON object with **PascalCase top-level keys** in the shape
below — and **only** that shape.

```json
{
  "Status": "Ok",
  "Attributes": { /* request echo + scalar metadata */ },
  "Results":    { /* domain payload (objects, lists, etc.) */ },

  "Navigation":   { /* OPTIONAL — pagination, cursors, hrefs */ },
  "Errors":       [ /* OPTIONAL — see ADR-aligned error shape */ ],
  "MethodsStack": [ /* OPTIONAL — debug-only call/middleware chain */ ]
}
```

**Mandatory keys (every response, success or failure):**

- **`Status`** — string enum, PascalCase. Members: `Ok`, `Created`,
  `Accepted`, `NoContent`, `BadRequest`, `Unauthorized`, `Forbidden`,
  `NotFound`, `Conflict`, `Unprocessable`, `RateLimited`,
  `ServerError`, `ServiceUnavailable`. Maps 1:1 to the HTTP status
  code on the wire (`Status: "Ok"` ↔ HTTP 200, etc.). Adding a new
  member requires a new ADR superseding this one.
- **`Attributes`** — object. Echoes load-bearing request inputs (e.g.
  `{ "RequestId": "…", "ItemId": "…", "Cursor": "…" }`) plus
  scalar metadata (`"ServerTimeUtc"`, `"BuildSha"`). **MUST NOT** (gate G-04-ENVELOPE-SHAPE)
  contain domain payload — that goes under `Results`.
- **`Results`** — object **or** `null`. Carries the domain payload.
  `null` only when the operation has no return value (e.g.
  `Status: "NoContent"`). Lists go under named keys
  (`Results.Items`, `Results.Mirrors`); the **plural collection key
  is an alias** over the singular DDL identifier ratified by
  ADR-0001 — it does not imply a separate plural table.

**Optional keys (omit when not relevant; never include as `null`/`[]`
just to satisfy the schema):**

- **`Navigation`** — object. Pagination + cursor + `Self`/`Next`/
  `Prev` hrefs. Required whenever a `Results.*` key is a list that
  may exceed the 250-item view limit.
- **`Errors`** — array of error objects, each shaped
  `{ "Code": "ENF-VIEW-LIMIT-EXCEEDED", "Detail": { … },
  "Hint": "…", "Field": "ItemId" }`. **MUST** be present iff (gate G-04-ENVELOPE-SHAPE)
  `Status` indicates a failure (`BadRequest` and below). Codes are
  drawn from the registry under
  `spec/03-error-manage/` and `spec/35-enforcement-rules/`.
- **`MethodsStack`** — array of strings, debug-only. Lists the
  middleware/handler chain that produced the response. Emitted
  **only** when `WP_DEBUG === true`; **MUST NOT** appear in (gate G-04-ENVELOPE-SHAPE)
  production responses.

**Forbidden without superseding ADR:**

- camelCase, snake_case, or kebab-case top-level keys.
- Two-key envelopes (`{ data, error }`, `{ result, message }`,
  JSend's `{ status, data }`).
- Renaming any of the 6 keys above (e.g. `Payload` for `Results`).
- Adding a new top-level key without first superseding this ADR
  (custom keys go under `Attributes` or `Results`, not at the root).
- Returning a bare array, bare scalar, or bare string at the top
  level. Always an envelope object.
- Mixing PascalCase with non-PascalCase at the top level
  (e.g. `{ "Status": "Ok", "results": {…} }` is an immediate gate
  failure).
- Returning `Errors: []` on success — omit the key entirely.

**Inner-key casing:** keys **inside** `Attributes`, `Results`,
`Navigation`, `Errors[]`, `MethodsStack[]` also follow PascalCase
(`RequestId`, `ItemId`, `ServerTimeUtc`, `Code`, `Detail`, `Field`,
`Self`, `Next`, `Prev`). The rule is depth-uniform: PascalCase all
the way down. The only exception is verbatim user content held in a
string value (e.g. `Item.Content` body text) — values are not
governed by this ADR, only keys.

## Consequences

**Positive**

- Closes the envelope-shape ambiguity. AT fixtures, endpoint pages,
  the docs viewer, and the error-management spec can now all cite a
  single ADR.
- Symmetric with ADR-0001 (PascalCase DDL): readers learn one casing
  rule that holds from SQLite columns through HTTP keys to React
  prop names.
- Anchors gate `G-04-ENVELOPE-SHAPE` (already drafted in
  `spec/04-database-conventions/`) — promotes it from advisory to
  load-bearing.
- The optional/omit-when-unused rule keeps responses small and
  prevents schema drift from `Errors: []` noise.

**Negative**

- WordPress's native `WP_REST_Response` returns a bare body shape; we
  need a thin adapter (`workflowy_envelope( $status, $attributes,
  $results )`) and a request-finalisation filter that rejects any
  handler returning a non-envelope. Adapter cost is one file
  (~80 LOC PHP).
- PascalCase keys on the wire are unusual in the JS ecosystem; the
  TS client layer needs explicit type definitions rather than
  relying on the camelCase default that some codegen tools assume.
  This is a one-time setup, then transparent.
- The 13-member `Status` enum is more granular than the typical
  `success`/`error`. Granularity is intentional (each maps to a
  distinct HTTP code + UX path) but adds enum-maintenance cost.
- Rejecting `Errors: []` on success means the schema has two
  legal shapes for the `Errors` key (absent vs present). Static
  schema validators must encode both.


**Spec impact** — Downstream sections affected by this decision: [`spec/04-database-conventions/06-rest-api-format/`](../04-database-conventions/06-rest-api-format/).

## Alternatives Considered

1. **JSend** (`{ status: "success" | "fail" | "error", data }`) —
   rejected. Three statuses are too coarse for our 13 HTTP-mapped
   members; the camelCase keys clash with the project-wide
   PascalCase rule (ADR-0001). Adopting JSend would require a new
   casing exception just for the envelope.
2. **Bare payload with HTTP headers carrying metadata** — rejected.
   Loses request-id round-trip on offline replay; SSE frames cannot
   carry HTTP-style headers per-event; debugging across the WP
   request lifecycle becomes harder.
3. **GraphQL-style `{ data, errors }`** — rejected. Implies a
   schema-level union of payload + error per field; the WP plugin
   is REST-only (ADR-0002) and the offline replay queue is
   request/response-shaped, not field-shaped.
4. **Two top-level shapes (success vs failure)** — rejected. The
   client would need a discriminated union check before accessing
   `Status`; uniform envelope means one parse path on the client.
5. **camelCase keys (`status`, `attributes`, `results`)** —
   rejected. Breaks the project-wide PascalCase rule (ADR-0001),
   forces a casing-conversion layer on the boundary between the
   PHP backend (which has no native casing convention) and the TS
   client (which would need an automatic mapper). PascalCase
   end-to-end has zero conversion cost.

## Gates Touched

- **New gates:** `(none — this ADR ratifies pre-existing gates)`
- **Modified gates (now load-bearing via this ADR):**
  - `G-04-ENVELOPE-SHAPE` — every REST response has the 3 mandatory
    keys; optional keys present only when relevant; no other top-level
    keys; PascalCase throughout.
  - `G-04-ENVELOPE-STATUS-ENUM` — `Status` value drawn from the
    13-member enum; HTTP code matches.
  - `G-04-ENVELOPE-NO-EMPTY-ERRORS` — `Errors` key absent on success.
  - `G-04-ENVELOPE-DEBUG-FLAG` — `MethodsStack` present **iff**
    `WP_DEBUG === true`.
- **Endpoints locked:** every `EP-*` defined in
  `spec/31-app/06-endpoints/` returns this envelope. New endpoint
  pages that omit the envelope shape fail spec hygiene.
- **AT fixtures locked:** every JSON fixture under
  `spec/31-app/97a-` … `97e-` MUST conform to the envelope shape (gate G-04-ENVELOPE-DEBUG-FLAG)
  (or be marked as "wire-bytes-illustrative" with a leading
  comment).
- **Convention pages anchored:**
  - `spec/04-database-conventions/06-rest-api-format/` (the
    canonical envelope description)
  - `spec/03-error-manage/` (`Errors[]` shape lives there; this ADR
    locks **where** errors appear)
  - `spec/31-app/06-endpoints/00-overview.md` (envelope assumed by
    every endpoint family)

## Supersedes / Superseded-By

- **Supersedes:** `(none)` — first formal record of the envelope
  shape; the prior `mem://` core rule and the prose in
  `spec/04-database-conventions/06-rest-api-format/` are now
  subordinate to this ADR.
- **Superseded-By:** `(none)`
