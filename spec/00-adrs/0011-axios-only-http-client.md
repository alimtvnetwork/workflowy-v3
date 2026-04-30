# ADR-0011: Axios is the sole HTTP client — pinned to `1.14.0` or `0.30.3` exact

## Status

`Accepted` — 2026-04-28

## Context

Every REST call from the frontend hangs off a single HTTP client.
WorkFlowy's spec assumes uniform interceptor wiring (auth header, CSRF
token, envelope unwrap, retry/backoff, offline-queue handoff per
ADR-0010), uniform error normalisation into the PascalCase envelope
(per ADR-0004), and uniform CVE-tracking against a known-good version
range.

Today the policy is split:

- **Memory** — `mem://architecture/tech-stack` line 15: *"Axios pinned
  to `1.14.0` OR `0.30.3` exact. Validated via
  `scripts/validate-axios-version.ts`."*
- **ADR-0003** — lists Axios as the implied HTTP client under
  "Anchors" but does not ratify it as exclusive.
- **Pinned-deps SSOT** — `spec/02-coding-guidelines/01-cross-language/30-pinned-dependency-matrix.md`
  is the version registry but does not declare client exclusivity.

Without a dedicated ADR, an AI generating new endpoint integrations
could legitimately:

- Use the platform `fetch` API (no interceptors → manual envelope
  unwrap and auth wiring per call).
- Pull `ky`, `wretch`, `redaxios`, `superagent`, or
  `@tanstack/query`'s built-in `fetch` adapter.
- Bump Axios to `^1.14.0` (caret range), exposing the project to any
  future minor that fails the CVE-pinned audit.
- Use Axios `0.x` features in code paths that target `1.x` and vice
  versa, breaking the dual-version compatibility window.

P58 closes this gap.

## Decision

### D1 — Axios is the sole HTTP client in `src/`

Every outbound HTTP request from frontend code MUST go through Axios (gate G-32-AXIOS-ONLY).
The following are **forbidden** in `src/` (excluding generated
`src/components/ui/*` shadcn files and third-party `node_modules`):

- `fetch(...)` — global Web Fetch API.
- `XMLHttpRequest`, `navigator.sendBeacon`.
- Alternative HTTP clients: `ky`, `wretch`, `redaxios`, `superagent`,
  `got`, `node-fetch`.
- HTTP transport baked into other libraries (e.g. `@tanstack/query`'s
  built-in adapter when used **as** a fetcher rather than as a cache).
  TanStack Query MAY be used as a cache layer, but its `queryFn` MUST (gate G-32-AXIOS-ONLY)
  call into the project's Axios singleton.

**Out of scope** of D1: WebSocket, EventSource (SSE), and WebRTC
clients. SSE per ADR-0003's "WP-native SSE" anchor uses the native
`EventSource` constructor.

### D2 — Single Axios singleton with project-wide interceptors

There MUST be exactly **one** Axios instance per page load, exported (gate G-32-AXIOS-ONLY)
from a single module (`src/lib/http.ts` is the canonical path; renames
require an ADR amendment). The singleton MUST register, in this order (gate G-32-AXIOS-ONLY):

1. **Request interceptor** — auth header injection, CSRF token,
   `X-WorkFlowy-Idempotency-Key` (when supplied), `ClientMutationId`
   (for replay path per ADR-0010 D4).
2. **Response interceptor** — envelope unwrap (per ADR-0004:
   `Status` → HTTP code mapping, `Errors` → typed error throw,
   `Results` → resolved value).
3. **Error interceptor** — offline-queue handoff (per ADR-0010 D1)
   when the request fails with a network-class error and the mutation
   carries a `LocalSeq`.

Direct construction of `axios.create({...})` outside `src/lib/http.ts`
is **forbidden**.

### D3 — Version pin: exactly `1.14.0` OR exactly `0.30.3`

The `package.json` entry for `axios` MUST be one of the two exact (gate G-32-AXIOS-ONLY)
strings:

```json
"axios": "1.14.0"
```

or

```json
"axios": "0.30.3"
```

No caret (`^`), tilde (`~`), or range syntax. No other Axios version is
permitted. `scripts/validate-axios-version.ts` MUST run as part of the (gate G-32-AXIOS-ONLY)
pre-commit hook (per `spec/13-cicd-pipeline-workflows/`) and MUST fail (gate G-32-AXIOS-ONLY)
the commit on any other value.

**Rationale for two exact versions** (not one):

- `1.14.0` is the current security-clean line.
- `0.30.3` is the back-port line maintained for environments that
  cannot upgrade past `0.x` due to TypeScript-target or Node-runtime
  constraints in downstream consumers (the WP-plugin admin shell may
  bundle Axios via a different path than the SPA).

The two are API-compatible for the surface this project uses (`get`,
`post`, `put`, `delete`, `patch`, `interceptors.request.use`,
`interceptors.response.use`, `AxiosError`, `AxiosResponse`, `create`).
Code MUST NOT use `1.x`-only features (e.g. `formSerializer`, (gate G-32-AXIOS-ONLY)
`paramsSerializer.encode` advanced opts) in the shared code path.

### D4 — CVE-pinned validator runs in CI and pre-commit

`scripts/validate-axios-version.ts` MUST (gate G-32-AXIOS-ONLY):

- Read `package.json` and assert `dependencies.axios ∈ {"1.14.0",
  "0.30.3"}`.
- Read `package-lock.json` (or the active lockfile) and assert no
  transitive `axios@*` resolution outside the same set.
- Exit non-zero on any violation.

The script is wired into:

- Pre-commit hook (per `G-20-PRECOMMIT-CONTRACT`).
- CI lint stage (per `spec/13-cicd-pipeline-workflows/`).

Bumping the allowed set requires a superseding ADR.

### D5 — No HTTP client wrapping that hides Axios

Project-internal helpers (e.g. `apiClient.fetchItems(...)`) are
allowed and encouraged, but they MUST be thin wrappers over the D2 (gate G-20-PRECOMMIT-CONTRACT)
singleton. Wrappers MUST NOT (gate G-20-PRECOMMIT-CONTRACT):

- Re-export a fake `fetch`-shaped facade that an AI could mistake
  for Web Fetch.
- Construct a parallel Axios instance.
- Strip the envelope unwrap so callers see raw `AxiosResponse` —
  callers always receive the envelope's `Results` payload, with
  `Errors` thrown as typed exceptions.

## Consequences

### Positive

- **Uniform interceptor surface.** Every call benefits from auth,
  envelope unwrap, and offline-queue handoff for free; new endpoints
  cannot accidentally bypass any of the three.
- **Single CVE-tracking line.** Two exact pins (1.14.0 / 0.30.3)
  rather than a caret range means a published CVE on any other Axios
  version is automatically inert against this project.
- **ADR-0003 anchor closed.** Axios is now ratified as exclusive
  rather than merely listed under "Anchors".
- **ADR-0010 D1 wired.** Network-class errors during offline have a
  single, deterministic handoff path into the FIFO queue.

### Negative

- **No `fetch` escape hatch** for tiny one-off calls (e.g.
  fire-and-forget telemetry pings). Mitigated by D1's SSE/WS
  carve-out — those use cases have native APIs that are not
  HTTP-RPC anyway.
- **Manual upgrade ceremony.** Any Axios upgrade requires an ADR,
  the pinned-deps SSOT entry, and a validator regression test.
  Cost is intentional: the security guarantee depends on it.


**Spec impact** — Downstream sections affected by this decision: [`spec/02-coding-guidelines/02-typescript/`](../02-coding-guidelines/02-typescript/), [`spec/31-app/`](../31-app/).

## Alternatives Considered

1. **Native `fetch` only (no client library)** — rejected: forces
   every call site to re-implement envelope unwrap, auth header,
   retry/backoff, and offline-queue handoff. The interceptor model
   that ADR-0004 + ADR-0010 implicitly assume requires a client with
   a real interceptor pipeline; `fetch` does not provide one without
   a wrapper that effectively recreates Axios.
2. **`ky` or `wretch` (modern fetch wrappers)** — rejected: the
   pinned-deps SSOT and the existing
   `scripts/validate-axios-version.ts` validator are already invested
   in Axios; switching adds churn for negligible bundle-size win
   (`ky` is ~3 KB smaller gzipped) without the dual-line CVE story
   that two Axios pins give.
3. **Caret range `^1.14.0`** — rejected: a future minor publishing a
   regression or CVE would silently land via `npm install`. Exact
   pins make every Axios change a deliberate ADR-gated event.

## Gates Touched

- `G-32-AXIOS-ONLY` — enforces D1 (no `fetch` / `XHR` / alternative
  client in `src/`).
- `G-32-AXIOS-SINGLETON` — enforces D2 (one instance, canonical path
  `src/lib/http.ts`, three required interceptors in order).
- `G-32-AXIOS-EXACT-PIN` — enforces D3 (`package.json` value MUST be
  one of the two exact strings; no caret/tilde).
- `G-20-PRECOMMIT-CONTRACT` — strengthened: pre-commit MUST run
  `scripts/validate-axios-version.ts` per D4.
- `G-32-NO-CLIENT-WRAPPER-FACADE` — enforces D5 (no `fetch`-shaped
  facade; no parallel Axios instance; envelope always unwrapped).

All five gates are formally **anchored** by this ADR. Their
enforcement contracts live in
`spec/02-coding-guidelines/01-cross-language/30-pinned-dependency-matrix.md`,
`spec/13-cicd-pipeline-workflows/`, and
`spec/35-enforcement-rules/`.

## Supersedes / Superseded-By

- **Supersedes:** (none — refines ADR-0003 by closing its implicit
  Axios anchor and refines ADR-0004 / ADR-0010 by binding their
  interceptor assumptions to a concrete client).
- **Superseded-By:** (none).
