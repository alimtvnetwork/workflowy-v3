# ADR-0002: WordPress plugin + PHP 8.1+ + SQLite as the sole backend runtime

## Status

`Accepted` — 2026-04-28

## Context

WorkFlowy is an outliner with strict offline-first, single-user-deploy
ergonomics. Between project inception and 2026-04-25 we evaluated many
backend runtimes. The decision was reached on **2026-04-25** and recorded
in `mem://constraints/backend-runtime-deferred`, but it was never lifted
into the spec itself. That gap means:

1. Any future contributor reading only `spec/` could re-introduce a
   forbidden runtime (Supabase, Postgres, IndexedDB-as-primary, Cloudflare
   D1, Go, …) without violating any **spec** rule.
2. Gates that already assume the WP-plugin shape — `G-13-CACHE-KEY` (CI),
   `G-04-NO-DDL-PLURALS` (SQLite-flavoured DDL), `G-19-WORKFLOW-CONTRACT`
   (`spec/05-conventions/04-…`), the `wp-plugin-folder-skeleton.md`
   convention, and the SSE-PHP implementation page — have no anchoring ADR
   to point at.
3. The `mem://` core rule (`Backend RESOLVED 2026-04-25`) is binding for
   the AI agent but not for human contributors who do not see memory.

This ADR lifts the memory rule into the spec and locks it.

## Decision

(gate **G-10-FORBIDDEN-RUNTIMES**) The WorkFlowy backend **MUST** be implemented as a single **WordPress
plugin** running on **PHP 8.1+**, persisting to a **SQLite** database
file inside the plugin directory, and exposing a **REST** surface using
the canonical envelope (`Status`, `Attributes`, `Results`, optional
`Navigation`, `Errors`, `MethodsStack`).

**Allowed (load-bearing):**

- **Runtime:** PHP 8.1 or newer, executed by the WordPress request lifecycle.
- **Distribution:** a single WordPress plugin (folder skeleton per
  `spec/31-app/05-conventions/31-wp-plugin-folder-skeleton.md`).
- **Database:** SQLite, file located inside the plugin's data directory,
  schema generated from the singular-PascalCase DDL ratified by ADR-0001.
- **Transport:** REST over HTTP using WordPress's REST API
  infrastructure; SSE streams via the PHP implementation described in
  `spec/31-app/05-conventions/32-sse-php-implementation.md`.
- **Auth:** WordPress's session/nonce model, extended by the role tables
  defined by ADR-0001 (`Role`, `UserRole`).

**Forbidden without superseding ADR:**

- **Lovable Cloud** (any managed-backend abstraction).
- **Supabase** (managed Postgres + auth + realtime).
- **Postgres** as the primary store (any host/managed/self-run variant).
- **MySQL / MariaDB** as the primary store.
- **sql.js** (in-browser SQLite via WASM) as the primary store.
- **IndexedDB as the primary store** (offline mirror is fine; "source of
  truth in the browser" is not).
- **Standalone Node.js servers** (Express, Fastify, NestJS, Next.js
  server routes acting as a backend, etc.).
- **Cloudflare D1**, Cloudflare Workers acting as a backend, or any other
  edge-runtime database.
- **Go** in any backend role (also forbidden in frontend per Core memory).
- Any second runtime placed "alongside" the WP plugin (microservice,
  sidecar, BFF). One runtime, one process model, one deploy.

**Migration constraint:** changing any item in either list above
(gate **G-00-ADR-NUMBERING**) **MUST** be done by a new ADR that supersedes this one. The new ADR must
also enumerate every gate, convention page, and endpoint that needs
re-anchoring (mirroring the explicit "Gates Touched" section below).

## Consequences

**Positive**

- A single, testable deploy target: copy the plugin folder into
  `wp-content/plugins/`, activate, done. Matches WorkFlowy's
  single-user-deploy ergonomic.
- SQLite + plugin-folder data directory means **no external service
  dependency**, no per-user provisioning step, no managed-cloud bill.
- The forbidden list closes the loop on years of "could we use X?"
  drift. New contributors get a binding answer with reasoning.
- Lifts a `mem://`-only rule into spec, closing the
  human-vs-AI-contributor information gap.
- Anchors gates `G-13-CACHE-KEY`, `G-19-WORKFLOW-CONTRACT`,
  `G-04-NO-DDL-PLURALS`, and the SSE-PHP convention to a real ADR.

**Negative**

- SQLite write concurrency caps single-process throughput; high-write
  multi-user deployments will hit the WAL ceiling before the runtime
  ceiling. (Mitigation: WorkFlowy's load profile is read-heavy
  outlining, not OLTP.)
- WordPress's REST infrastructure is opinionated; aligning the canonical
  envelope (`Status`/`Attributes`/`Results`) with `WP_REST_Response`
  requires a thin adapter — documented in
  `spec/04-database-conventions/06-rest-api-format/`.
- PHP 8.1+ floor excludes shared hosts still on PHP 7.x (a deliberate
  cost; modern type hints + readonly properties are load-bearing for the
  strict-typing posture the project takes elsewhere).
- Some realtime patterns (true bidirectional WebSocket fan-out) are not
  natural in PHP-FPM; we accept SSE-only as the streaming primitive.


**Spec impact** — Downstream sections affected by this decision: [`spec/15-wp-plugin-how-to/`](../15-wp-plugin-how-to/).

## Alternatives Considered

1. **Lovable Cloud / Supabase managed backend** — rejected. Forces a
   per-deploy account, a managed-cloud bill, and a network round-trip
   for every read. Conflicts with "drop-in WordPress plugin" deploy
   ergonomic. Adds a second auth model on top of WordPress's existing
   one. Rejected on 2026-04-25 explicitly.
2. **Postgres (self-hosted or managed) + thin PHP/Node API** — rejected.
   Two services to deploy, two backup strategies, two failure modes.
   Postgres's strengths (concurrent OLTP, advanced indexing) are not
   load-bearing for an outliner's read-heavy profile. SQLite + WAL is
   sufficient and ship-in-a-folder.
3. **IndexedDB / sql.js as the primary store (browser-resident
   backend)** — rejected. Multi-device sync becomes the entire problem;
   share/permissions become "implement an entire backend in the
   browser". Offline mirror in IndexedDB is still allowed (and used),
   but it is a **mirror**, not the source of truth.
4. **Standalone Node.js server (Express / Fastify / Next.js routes)** —
   rejected. Adds a second runtime users must install, manage, and
   keep running alongside (or instead of) WordPress. Defeats the
   single-deploy goal. Also conflicts with WorkFlowy's stated
   PHP/WordPress hosting profile.
5. **Cloudflare D1 + Workers** — rejected. Edge-runtime constraints
   (request-scoped CPU, no long-lived connections) are hostile to SSE
   streaming and to the WordPress request lifecycle. Vendor lock-in to
   a single edge provider.
6. **Go backend (any topology)** — rejected. Adds a compiled-language
   build step to a project whose contributors are PHP/TypeScript first.
   No runtime gain that justifies the contributor-onboarding tax. Already
   forbidden in the Core memory rule.

## Gates Touched

- **New gates:** `(none — this ADR ratifies pre-existing gates)`
- **Modified gates (now load-bearing via this ADR):**
  - `G-13-CACHE-KEY` (CI cache keys assume PHP/Composer + WP plugin)
  - `G-19-WORKFLOW-CONTRACT` (workflow shape assumes WP plugin folder)
  - `G-20-PRECOMMIT-CONTRACT` (pre-commit assumes PHP/SQLite tooling)
  - `G-04-NO-DDL-PLURALS` (DDL is SQLite-flavoured)
- **Endpoints locked:** all `EP-*` endpoints listed in
  `spec/31-app/06-endpoints/00-overview.md` are implemented as
  `register_rest_route()` handlers under the plugin's REST namespace.
- **DDL identifiers locked:** SQLite as the storage engine for every
  identifier ratified by ADR-0001.
- **Convention pages anchored:**
  `spec/31-app/05-conventions/31-wp-plugin-folder-skeleton.md`,
  `spec/31-app/05-conventions/32-sse-php-implementation.md`,
  `spec/04-database-conventions/06-rest-api-format/`.

## Supersedes / Superseded-By

- **Supersedes:** `(none)` — this is the first formal record of the
  backend runtime decision; the prior `mem://constraints/backend-runtime-deferred`
  memory note is now subordinate to this ADR.
- **Superseded-By:** `(none)`
