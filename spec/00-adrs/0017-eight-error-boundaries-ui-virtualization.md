# ADR-0017: Eight independent UI error boundaries + 1000-item virtualization threshold

## Status

`Accepted` — 2026-04-28

## Context

`mem://design/theme` Core rules state two non-negotiable frontend
stability constraints — **8 independent UI error boundaries with
dedicated fallbacks** and **UI virtualization required for 1000+
visible items** — but neither is ratified in the spec tree. The
existing spec material covers only a single top-level `AppErrorBoundary`
(`spec/03-error-manage/.../05-error-history-persistence.md` §6) and
never enumerates the eight boundary regions or names the
virtualization threshold. AT-DEBUGGINGTYPESCRIPT-10 explicitly tests
"a top-level `<ErrorBoundary>`" — singular — directly contradicting
the memory rule.

Without an ADR, an AI implementer reading the spec will legitimately
ship a single root-level boundary and an un-virtualized list, both of
which violate the agreed UX contract. ADR-0008 capped a *default
view* at 250 items, but mirrors, search results, dashboard children,
and trash views can all exceed 1000 — hence the virtualization rule
is independent of the 250-item view cap.

## Decision

**D1 — Eight error boundary regions (closed enumeration).** The app
MUST mount exactly eight independent React error boundaries, each
with a region-specific fallback. A single root boundary is forbidden;
nested boundaries beyond these eight are forbidden unless added by a
superseding ADR. The eight boundaries:

| # | Boundary | Wraps | Fallback intent |
|---|----------|-------|-----------------|
| 1 | `AppErrorBoundary` | The entire `<App>` tree (last-resort) | Full-screen reload prompt + error code |
| 2 | `RouterErrorBoundary` | The router data layer (per ADR-0018) | Route-level "Page failed to load" + Home link |
| 3 | `NavbarBoundary` | Top navbar region | Navbar disappears; rest of app keeps working |
| 4 | `SidebarBoundary` | Left sidebar / outline tree | Sidebar collapses to "Reload sidebar" button |
| 5 | `ContentAreaBoundary` | Main content area (page/list/board/dashboard render) | Inline "This view crashed" card; other panels unaffected |
| 6 | `EditorBoundary` | The active item editor (rich-text + slash menu) | Read-only fallback view; user can navigate away |
| 7 | `PanelBoundary` | Right-side panels (mirrors, comments, share dialog host) | Panel closes; inline error toast |
| 8 | `ModalBoundary` | All `Dialog`/`Sheet`/`Popover` modal portals | Modal force-closes; inline error toast |

D1 also obsoletes AT-DEBUGGINGTYPESCRIPT-10's singular phrasing —
that AT MUST be rewritten to assert eight boundaries.

**D2 — Boundary independence.** Each boundary MUST catch errors
isolated to its subtree without unmounting siblings. `componentDidCatch`
in any boundary MUST NOT call `window.location.reload()` or otherwise
take down peer regions. Only `AppErrorBoundary` (#1) may offer a
full reload action.

**D3 — Fallback contract.** Every fallback MUST:
- render a region-appropriate message (no generic "Something went wrong"
  in regions #2–#8);
- expose the error code (per `spec/03-error-manage/02-error-architecture`)
  when present;
- log to the structured logger via `componentDidCatch`;
- offer at least one recovery action (retry, close, navigate-away);
- use semantic design tokens only (per ADR-0012).

**D4 — Virtualization threshold.** Any rendered list, tree level, or
grid that *can* exceed **1,000 visible items** in a single scrollable
container MUST be virtualized. Concretely:
- Sidebar outline tree (when expanded subtree > 1000 nodes).
- Search results.
- Trash view (`mem://features/trash-logic`, up to 30 days of
  soft-deleted items).
- Mirror peer-group lists in panels.
- Bulk multi-select clipboards beyond 1000 entries.

The 250-item per-view limit (ADR-0008) is the **default view cap**;
the 1000-item rule is the **virtualization-required cap** for views
where the 250 cap does not apply (search, trash, mirrors, dashboard
children of unbounded parents).

**D5 — Virtualization library and behaviour.** Virtualization MUST
use `@tanstack/react-virtual` (sole permitted virtualizer; pin
version in `package.json` per the same convention as ADR-0011's
Axios pin). Virtualized containers MUST:
- preserve keyboard focus through scroll (item focus survives
  virtualization recycling);
- maintain stable scroll position on item insert/delete (no jump);
- support drag-and-drop across the virtualized boundary (per
  `mem://features/editor-core` DnD rules);
- expose data-test attributes on rendered rows for E2E reach.

Manual `IntersectionObserver` rolls or `react-window` are forbidden.

**D6 — Forbidden patterns.**
- Single root error boundary as the only boundary.
- `try/catch` around `render()` as a substitute for an error boundary.
- Rendering > 1000 DOM rows in a non-virtualized container, even
  briefly during a transition.
- Silent fallback (rendering `null` on error).

## Consequences

**Positive**

- Closes the spec ↔ memory contradiction (1 boundary in AT vs 8 in
  Core memory).
- Names the eight boundaries so an AI can scaffold them directly
  from the ADR without inferring intent.
- Pins the virtualizer to a single library — eliminates
  `react-window` vs `react-virtuoso` vs `@tanstack/react-virtual`
  drift.
- Makes the 250 (view cap) vs 1000 (virtualization cap) distinction
  explicit so future AI sessions stop conflating them.

**Negative**

- AT-DEBUGGINGTYPESCRIPT-10 must be rewritten (one-line spec
  follow-up).
- Eight boundaries means eight fallback designs to commission —
  more design work upfront than a single root fallback.
- Pinning `@tanstack/react-virtual` adds a dependency; teams that
  preferred `react-window`'s smaller footprint lose that option.
- Drag-and-drop across virtualized rows is non-trivial (D5 makes
  this an explicit requirement, not a bug to be discovered later).

## Alternatives Considered

1. **Single root `AppErrorBoundary` only** — rejected: any crash in
   the editor takes down navbar, sidebar, and panels with it.
   Eliminates the user's escape route from a buggy editor render.
2. **Per-component boundaries (one per component)** — rejected:
   noise, unclear ownership of fallbacks, hides systemic failures
   behind a thousand local fallbacks. Eight regional boundaries is
   the smallest set that maps cleanly to the UI taxonomy in
   `mem://design/ui-components`.
3. **Render-then-replace virtualization (only kick in after
   measuring overflow)** — rejected: the first render of 5000 DOM
   rows already costs 200–500ms on mid-tier hardware and breaks
   the sub-300ms search SLA from ADR-0013.
4. **`react-window` instead of `@tanstack/react-virtual`** —
   rejected: weaker TypeScript story, no built-in dynamic-size
   measurement, smaller maintenance velocity. The bundle-size
   delta (~6 KB) does not justify the DX hit for a feature this
   load-bearing.

## Gates Touched

- **New gates:**
  - `G-22-ERROR-BOUNDARIES-EXACTLY-8` — enforces D1 (CI counts
    `extends React.Component<*, { hasError }>` boundary classes;
    fails if ≠ 8).
  - `G-22-BOUNDARY-NAMES-CLOSED` — enforces D1's name list
    (the eight class names above are the only permitted boundary
    names).
  - `G-22-BOUNDARY-ISOLATION` — enforces D2 (no
    `window.location.reload()` outside `AppErrorBoundary`).
  - `G-22-FALLBACK-CONTRACT` — enforces D3 (every fallback must
    log + show error code + offer recovery action).
  - `G-22-VIRTUALIZATION-1000` — enforces D4 (any list/tree/grid
    that may exceed 1000 rendered items MUST use the pinned
    virtualizer).
  - `G-22-VIRTUALIZER-TANSTACK-ONLY` — enforces D5 (only
    `@tanstack/react-virtual` import permitted; `react-window`,
    `react-virtuoso`, hand-rolled `IntersectionObserver` lists
    are CI errors).
  - `G-22-NO-SILENT-FALLBACK` — enforces D6 (boundary fallbacks
    MUST NOT render `null`).
- **Modified gates:** `(none)` — but **AT-DEBUGGINGTYPESCRIPT-10**
  in `spec/03-error-manage/01-error-resolution/05-debugging-guides/03-debugging-typescript/97-acceptance-criteria.md`
  MUST be rewritten from "a top-level `<ErrorBoundary>`" to "the
  eight boundaries enumerated in ADR-0017 D1" as a follow-up.
- **Endpoints locked:** `(none)` — frontend stability ADR.
- **DDL identifiers locked:** `(none)`.

## Supersedes / Superseded-By

- **Supersedes:** `(none)` formally; **clarifies and constrains**
  AT-DEBUGGINGTYPESCRIPT-10 (single boundary → eight boundaries)
  and the implicit `react-window` allowance in `package.json`
  defaults.
- **Superseded-By:** `(none)`
