# ADR-0018: React Router v7 (data-router API) + `lucide-react` as the sole icon source

## Status

`Accepted` — 2026-04-28

## Context

Two frontend dependencies sit in the pinned-deps matrix
(`spec/02-coding-guidelines/01-cross-language/30-pinned-dependency-matrix.md`)
and `mem://architecture/tech-stack` lines 12–13 with explicit forbid-lists,
but neither is ratified by an ADR — meaning the prohibitions are advisory
prose, not load-bearing decisions:

- `react-router-dom@^7.13.2` (v7 data-router API). v6 explicitly forbidden,
  yet v6 is the version most AI implementers reach for first because
  v6 docs dominate search and most older Lovable templates use v6.
- `lucide-react@^0.460.0` as the **only** icon library. `react-icons`,
  `@heroicons/react`, `@tabler/icons-react`, FontAwesome, and emoji-as-icon
  patterns are all forbidden.

The v6→v7 distinction is not cosmetic: v7 introduces the data-router
API (`createBrowserRouter` + loaders/actions + `<RouterProvider>`),
which materially changes how route-level errors propagate (relevant to
ADR-0017's `RouterErrorBoundary`), how loaders interact with the offline
FIFO queue (ADR-0010), and how route-level data fits the PascalCase
envelope (ADR-0004). Without an ADR pin, an AI implementer can ship
v6's `<BrowserRouter>` + `useNavigate` patterns that compile and run
but silently bypass the data-router contract every other ADR assumes.

The icon library lock matters less for runtime correctness but more for
visual consistency, bundle size (each library brings ~30–80 KB of
duplicated stroke styles), and the design-token contract in ADR-0012
(every icon must accept `currentColor` so semantic tokens flow through).

## Decision

**D1 — Router: react-router-dom v7 data-router API only.**
- Pinned version: `react-router-dom@^7.13.2` (per pinned-deps matrix).
- v6 (`^6.x`) is **forbidden**, including via transitive resolution.
- The app MUST use the **data-router API**:
  `createBrowserRouter(routes)` + `<RouterProvider router={...} />`.
- Legacy declarative routing (`<BrowserRouter><Routes><Route/></Routes></BrowserRouter>`)
  is forbidden even though v7 still exports it for migration.
- Route loaders MUST return PascalCase-shaped data compatible with the
  ADR-0004 envelope when the loader fetches from the backend.
- The `RouterErrorBoundary` named in ADR-0017 D1 #2 MUST be implemented
  via v7's `errorElement` prop on the root route, not as a wrapping
  React error-boundary class.

**D2 — Navigation hooks.**
- `useNavigate`, `useLoaderData`, `useRouteError`, `useNavigation`,
  `useFetcher` — all v7 hooks are permitted.
- v6-shaped hook usage (e.g. `useNavigate()(path, { replace })` with
  v6's options object shape) MUST be migrated to v7 signatures; CI
  MUST flag any import that originates from a `react-router-dom@6`
  shape via type-check failure.

**D3 — Icons: `lucide-react` only.**
- Pinned version: `lucide-react@^0.460.0`.
- The following icon sources are **forbidden**:
  `react-icons`, `@heroicons/react`, `@tabler/icons-react`,
  `@fortawesome/*`, `material-icons`, hand-rolled `<svg>` icons in
  components, and emoji characters used as icons in JSX.
- Decorative inline SVGs that are NOT icons (logos, illustrations,
  empty-state art) are permitted but MUST live under `src/assets/`,
  not be co-located in component files.

**D4 — Icon usage contract.**
- Every Lucide icon MUST be imported by named export
  (`import { Search } from 'lucide-react'`), never as
  `import * as Icons from 'lucide-react'` (defeats tree-shaking).
- Icons MUST size via Tailwind utilities (`h-4 w-4`, `h-5 w-5`),
  never via inline `style={{ width: ... }}`.
- Icon colour MUST come from semantic design tokens via Tailwind
  text utilities (`text-muted-foreground`, `text-primary`) so
  ADR-0012's HSL-token contract flows through `currentColor`.
  Hard-coded `color="#..."` props are forbidden.
- The icon-name SSOT for each feature is its `12-icon-map.md` (or
  equivalent) file under `spec/32-ui-design/`; deviation requires
  a spec PR, not a component-level override.

**D5 — Emoji-as-icon ban.**
- Emoji characters (`🔍`, `📋`, `⚙️`, etc.) MUST NOT be used as
  functional icons in JSX. Existing spec lines that show emojis
  alongside Lucide names (e.g.
  `spec/32-ui-design/06-workflowy-ui/01-navbar/01-layout.md` line 45
  `🔍 (Lucide Search)`) are documentation aids only — the rendered
  UI MUST use the Lucide component, never the emoji.
- Emojis remain permitted in **user content** (item Content,
  comments) and in **non-functional documentation**.

**D6 — Migration & detection.**
- A CI step MUST scan `package.json` and `package-lock.json` /
  `bun.lockb` for `react-router-dom@^6` and any forbidden icon
  package; presence is a build break.
- A CI step MUST scan `src/**/*.{ts,tsx}` for forbidden imports
  (`react-icons/*`, `@heroicons/react/*`, etc.).
- A CI step MUST verify the app's root component uses
  `<RouterProvider>`, not `<BrowserRouter>`.

## Consequences

**Positive**

- Closes the prose-only forbid-list in pinned-deps and Core memory
  with a load-bearing ADR.
- ADR-0017's `RouterErrorBoundary` now has a defined implementation
  vehicle (v7 `errorElement`), removing ambiguity about whether to
  use a class boundary or a route-level error element.
- Single icon source eliminates the visual stroke-style drift that
  multi-library codebases accumulate.
- Tree-shaken named imports + `currentColor`-driven theming keep the
  icon bundle small and ADR-0012-compliant.
- v7 loaders give the offline queue (ADR-0010) a clean injection
  point for cached data on cold start.

**Negative**

- v7 data-router is a learning-curve step for contributors familiar
  with v6 declarative routing; migration prose lives in v7 docs, not
  in this ADR.
- `lucide-react` does not have every icon; rare missing icons must
  be requested upstream or replaced with a close visual equivalent —
  hand-rolled SVG fallback is forbidden under D3.
- Stale spec lines that show emoji-as-icon (e.g. navbar layout `🔍`)
  remain ambiguous until a follow-up sweep replaces them with
  Lucide-only callouts.
- Pinning a single icon library means a future shadcn/ui or Radix
  update that ships with `@radix-ui/react-icons` would create
  tension; D3's allow-list would need a supersede.

## Alternatives Considered

1. **Allow react-router v6 indefinitely** — rejected: v6's lack of
   `errorElement` forces the `RouterErrorBoundary` to be a class
   boundary that cannot intercept loader errors, breaking ADR-0017
   D1 #2's contract. v6 is also in maintenance-only mode.
2. **Pin v7 but keep declarative `<BrowserRouter>` for simplicity** —
   rejected: declarative mode disables loaders, actions, and
   `errorElement`. Half the value of pinning v7 disappears.
3. **Allow `@radix-ui/react-icons` alongside `lucide-react`** —
   rejected: Radix icons use a different stroke weight (1.5px vs
   Lucide's 2px), creating visible drift in any UI that mixes them.
4. **Allow `react-icons` as a meta-aggregator** — rejected:
   `react-icons` ships every icon library's full stroke set, blowing
   the bundle, defeating tree-shaking on legacy entries, and reintroducing
   the multi-stroke-style problem.
5. **No pinned router/icon library; let each feature choose** —
   rejected: this is what pinned-deps already forbids in prose;
   without an ADR, prose cannot be cited by gates.

## Gates Touched

- **New gates:**
  - `G-23-ROUTER-V7-ONLY` — enforces D1 (no `react-router-dom@^6`
    in dep tree; CI fails on detection).
  - `G-23-DATA-ROUTER-API` — enforces D1 (root must use
    `createBrowserRouter` + `<RouterProvider>`, not `<BrowserRouter>`).
  - `G-23-ROUTER-ERRORELEMENT` — enforces D1 + ADR-0017
    interaction (`RouterErrorBoundary` implemented as `errorElement`,
    not a wrapping class).
  - `G-23-ICONS-LUCIDE-ONLY` — enforces D3 (no other icon library
    imports; no hand-rolled `<svg>` in component files).
  - `G-23-ICONS-NAMED-IMPORTS` — enforces D4 (`import { X } from
    'lucide-react'`; no `import *`).
  - `G-23-ICONS-CURRENTCOLOR` — enforces D4 (no `color="#..."`
    on icon components; colour via Tailwind text utilities).
  - `G-23-NO-EMOJI-AS-ICON` — enforces D5 (no emoji codepoints in
    JSX functional positions; user content is exempt).
- **Modified gates:** `(none)` — but spec sweeps required:
  - `spec/32-ui-design/06-workflowy-ui/01-navbar/01-layout.md` line 45
    and any other line showing `emoji (Lucide Name)` should drop
    the emoji to remove ambiguity.
- **Endpoints locked:** `(none)`.
- **DDL identifiers locked:** `(none)`.

## Supersedes / Superseded-By

- **Supersedes:** `(none)` formally; **promotes** the
  `pinned-deps@^7.13.2` and `lucide-react@^0.460.0` rows from
  prose-only forbid-lists to load-bearing ADR-pinned decisions.
- **Superseded-By:** `(none)`
