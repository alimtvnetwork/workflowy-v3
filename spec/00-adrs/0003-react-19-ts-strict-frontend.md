# ADR-0003: Vite 5.4 + React 19 + TypeScript 5.6 (strict) + Tailwind v4 as the sole frontend stack

## Status

`Accepted` — 2026-04-28

## Context

ADR-0002 locked the **backend** runtime (WordPress plugin + PHP 8.1+ +
SQLite). The frontend has its own stack — Vite 5.4 build, React 19
runtime, TypeScript 5.6 with `strict: true`, Tailwind CSS v4 via
`@tailwindcss/vite` consumed from `src/index.css`'s `@theme` block — but
that decision lives only in `mem://architecture/tech-stack` and
`mem://design/theme`. Symmetric to the gap ADR-0002 closed for the
backend, frontend contributors who never read `mem://` could legitimately
re-introduce a forbidden choice (Next.js, CRA, Vue, Svelte, plain JS,
SCSS modules, Go-based frontend tooling) without violating any **spec**
rule.

Multiple downstream pages already assume this stack:

- `spec/02-coding-guidelines/00-overview.md` (strict-TS examples).
- `spec/07-design-system/` (Tailwind-v4-only token strategy in
  `index.css` `@theme`).
- `spec/08-docs-viewer-ui/` (React 19 + Vite component examples).
- `spec/13-cicd-pipeline-workflows/` (frontend build job assumes
  `vite build`, not `next build` / `webpack`).

Without an anchor ADR, those assumptions are gateless. This ADR is the
anchor.

## Decision

The WorkFlowy frontend **MUST** be implemented as a single Vite 5.4 project, written in TypeScript 5.6 with `strict: true`, rendered by React 19, and styled with Tailwind CSS v4 consumed via the `@tailwindcss/vite` plugin from a single `src/index.css` `@theme` block — enforced by `G-ADR-0003-FRONTEND-STACK-LOCK` (umbrella) which composes `G-ADR-0003-VITE-5_4-PINNED`, `G-ADR-0003-REACT-19-PINNED`, `G-ADR-0003-TS-5_6-STRICT`, `G-ADR-0003-TAILWIND-V4-THEME-BLOCK`.

**Allowed (load-bearing):**

- **Build tool:** Vite **5.4.x**. Patch upgrades are fine; minor or
  major upgrades require a new ADR superseding this one.
- **UI runtime:** React **19.x** with the `react-dom/client`
  `createRoot` API.
- **Language:** TypeScript **5.6.x**, `strict: true`,
  `noUncheckedIndexedAccess: true`, `noImplicitOverride: true`,
  `exactOptionalPropertyTypes: true`. Strict-TS coding rules
  (zero `any`, max 3 params, no nested `if`s, 15-line logic limit,
  pure positive guard clauses, max 2 boolean operands, multi-line
  method chains) are formally ratified by **ADR-0007** (R1–R7) — see
  `spec/02-coding-guidelines/00-overview.md` for worked examples.
- **Styling:** Tailwind CSS **v4** via `@tailwindcss/vite`. All design tokens MUST live inside the `@theme { … }` block in `src/index.css` — enforced by `G-ADR-0003-TAILWIND-V4-THEME-BLOCK` (sub-rule of stack umbrella, layered under existing `G-12-LOGICAL-MARGINS-PADDING` token-system family). No second styling system (no SCSS modules, styled-components, Emotion, vanilla-extract, plain CSS modules) may be introduced.
- **HTTP client:** Axios — version pinned per
  `spec/31-app/05-conventions/01-axios-version-control.md`. Any
  additional client (fetch wrapper, ky, ofetch, …) is forbidden in
  application code; tests may mock at the Axios layer.
- **Testing:** Vitest (matches Vite ecosystem) + Testing Library for
  React 19. No Jest, no Mocha, no Karma.

**Forbidden without superseding ADR:**

- **Other build tools / meta-frameworks:** Next.js, Remix, Astro,
  Create-React-App, Webpack-direct, Parcel, Rollup-direct, Turbopack,
  Rspack, esbuild-as-build, Bun-as-build.
- **Other UI runtimes:** Vue, Svelte, Solid, Qwik, Angular, Preact,
  Lit, vanilla DOM. (React's own future major — React 20+ — is
  forbidden until a superseding ADR.)
- **Other languages in frontend code:** Go (also forbidden by the
  Core memory rule), Rust-WASM as primary code path (WASM as a perf
  module behind a TS facade is allowed), CoffeeScript, plain
  JavaScript, ReScript, ClojureScript, Elm.
- **Other styling systems:** Tailwind v3 (legacy `tailwind.config.js`
  approach), `@apply`-only setups, SCSS/Sass modules,
  styled-components, Emotion, vanilla-extract, plain CSS modules,
  CSS-in-JS at runtime, inline `style={{…}}` for design-token
  values.
- **Tailwind v4 anti-config:** the legacy `tailwind.config.{js,ts}` file MUST NOT be reintroduced — token customisation lives in the `@theme` block inside `src/index.css` only. Enforced by `G-ADR-0003-NO-TAILWIND-CONFIG-FILE` (CI grep gate scanning repo root for `tailwind.config.{js,ts,mjs,cjs}`).
- **Second test runner** in the same package as Vitest.

**Migration constraint:** any change to the allowed/forbidden lists above MUST be ratified by a new ADR that supersedes this one and that enumerates every gate, convention page, and design-token file that needs re-anchoring — enforced by `G-ADR-0003-AMENDMENT-REQUIRED` (mirrors `G-ADR-0001-AMENDMENT-REQUIRED` pattern; second consecutive ADR-anchor area to land an explicit amendment-gate).

## Consequences

**Positive**

- Lifts the frontend-stack `mem://` rules into spec, closing the
  human-vs-AI-contributor information gap that ADR-0002 closed for the
  backend.
- Anchors the strict-TS coding rules, the Tailwind-v4 `@theme` token
  strategy, the Axios-only HTTP convention, and the Vitest test runner
  to a single ADR — downstream pages can cite ADR-0003 instead of
  re-arguing the choice on every page.
- Eliminates a class of "nice to use X" PRs (Next.js, styled-components,
  Vue) that would otherwise be re-litigated indefinitely.
- Locks in a single bundler, single test runner, single styling system
  — the smallest possible set for the contributor cognitive load
  WorkFlowy can afford.

**Negative**

- React 19 is recent (released 2024); some third-party libraries lag
  behind on `peerDependencies` and require pinning or patches. We
  accept this cost for Server Components compat (used in the docs
  viewer) and the new `use()` hook ergonomics.
- Tailwind v4's `@theme`-block model differs from the v3
  `tailwind.config.js` model that most Tailwind tutorials still
  document. Onboarding cost is real but small.
- `strict: true` + `noUncheckedIndexedAccess` + the project's own
  strict-TS rules together raise the floor on type ergonomics —
  contributors used to "any-and-fix-later" workflows feel friction.
  This is intentional.
- A future React 20 / Vite 6 / Tailwind v5 upgrade requires the ADR
  ceremony; we accept the velocity tax in exchange for never silently
  doing a major upgrade.


**Spec impact** — Downstream sections affected by this decision: [`spec/31-app/`](../31-app/), [`spec/02-coding-guidelines/02-typescript/`](../02-coding-guidelines/02-typescript/).

## Alternatives Considered

1. **Next.js (App Router) + React 19** — rejected. Next.js's server
   layer would compete with the WordPress plugin runtime locked by
   ADR-0002, creating a second backend runtime by accident.
   Static-export-only Next.js gives no advantage over Vite + React for
   a WP-served SPA.
2. **Vite + Vue 3 (or Svelte 5)** — rejected. The component
   ecosystem WorkFlowy depends on (`@tanstack/react-query`,
   editor primitives, the Lovable design system) is React-first; a
   port would be a multi-month rewrite for no architectural gain.
3. **Vite + plain JavaScript (no TypeScript)** — rejected. Strict-TS
   is what makes the "zero `any`, max 3 params, 15-line logic limit"
   coding rules **enforceable**. Without the type system, the rules
   collapse to comments.
4. **Vite + TypeScript + SCSS modules (no Tailwind)** — rejected.
   Two styling systems to learn, two cascade models to debug, no
   reuse of the Lovable design-token convention. Tailwind v4's
   `@theme` block already gives us per-component-token ergonomics.
5. **Tailwind v3 (legacy `tailwind.config.js`)** — rejected. v4's
   CSS-first config is strictly more co-located, eliminates the
   "config drift vs CSS" failure mode, and is what the project ships
   with today. Downgrading would be a deliberate regression.
6. **Bun as build + runtime** — rejected. Bun's bundler is
   Vite-compatible enough for dev but its production-build story and
   plugin ecosystem are not yet on par with Vite 5.4. Reconsider in a
   superseding ADR when Bun's plugin coverage matches Vite's.

## Gates Touched

- **New gates:** `(none — this ADR ratifies pre-existing gates)`
- **Modified gates (now load-bearing via this ADR):**
  - `G-32-NO-RAW-COLORS` (Tailwind v4 `@theme` token enforcement; see
    `spec/32-ui-design/00-overview.md` Worked Example)
  - `G-32-NO-INLINE-STYLE` (no inline `style={{…}}` for token values)
  - `G-32-SEMANTIC-NAMING` (token names describe purpose, not hue)
  - `G-32-DARK-MODE-PARITY` (every token has light + dark value)
  - `G-32-TOKEN-REGISTRY` (every token documented in
    `spec/32-ui-design/02-color-tokens.md`)
- **Build/CI assumptions locked:** the frontend job in
  `spec/13-cicd-pipeline-workflows/00-overview.md` assumes `vite build`
  + Vitest. Replacing either requires superseding this ADR.
- **Convention pages anchored:**
  - `spec/02-coding-guidelines/00-overview.md` (strict-TS examples)
  - `spec/07-design-system/` (Tailwind v4 `@theme` strategy)
  - `spec/08-docs-viewer-ui/` (React 19 component examples)
  - `spec/31-app/05-conventions/01-axios-version-control.md` (Axios as
    sole HTTP client)
- **Forbidden tooling (explicit):** Next.js, Remix, Astro, CRA, Vue,
  Svelte, Solid, Angular, Tailwind v3, styled-components, Emotion,
  vanilla-extract, Jest, Go in frontend code.

## Supersedes / Superseded-By

- **Supersedes:** `(none)` — this is the first formal record of the
  frontend stack decision; the prior `mem://architecture/tech-stack`
  and `mem://design/theme` notes are now subordinate to this ADR.
- **Superseded-By:** `(none)`
