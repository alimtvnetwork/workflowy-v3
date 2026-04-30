# ADR-0034: `framer-motion` is the sole animation library; durations & easings sourced from `@theme`-block tokens

## Status

`Accepted` — 2026-04-30 (closes F-AUDIT-52; matches the `lucide-react` sole-icons precedent and the `axios` sole-HTTP-client precedent of ADR-0011).

## Context

`package.json` pins `framer-motion@^12.38.0` as a dependency, but the
spec corpus has 42 ADRs covering frontend stack (ADR-0003), design
tokens (ADR-0012), component base (`G-26-*` per ADR-0022), icons
(`lucide-react` sole per Core memory), and HTTP client (ADR-0011) —
yet **animation is unspecified**. Without an ADR, contributors will
mix `framer-motion` + raw CSS keyframes + Web Animations API (WAAPI)
+ Tailwind `animate-*` utilities + inline `style={{ transition }}`
ad-hoc.

The same drift class that ADR-0011 (axios sole), ADR-0012 (Tailwind
v4 sole, `@theme` sole), and the Core `lucide-react` rule prevent for
HTTP, styling, and iconography respectively MUST be prevented for
motion. Otherwise:

1. Every component author picks a different animation primitive,
   making timing/easing audit impossible.
2. Durations and easings get hard-coded as numbers (`200`, `0.3s`)
   inside components, defeating the `@theme`-block sole-token-registry
   guarantee from ADR-0012.
3. Future motion-reduction (`prefers-reduced-motion`) compliance
   becomes a per-component refactor instead of a single token swap.
4. Bundle size grows (multiple animation runtimes coexisting).
5. Strict-TS / 15-line-logic-limit rules (per coding-guidelines) are
   violated by the verbose imperative WAAPI / `requestAnimationFrame`
   patterns that contributors reach for when no library is mandated.

F-AUDIT-52 (2026-04-30, audit-vs-impl AU-25 finding A-20) surfaced
this load-bearing-dep gap and prescribed an ADR matching the existing
icon-policy precedent.

## Decision

**D1 — Sole animation library.** `framer-motion` is the **sole**
animation library for the frontend. No other animation runtime may
be added to `package.json` dependencies or devDependencies.
Prohibited alternatives: `@react-spring/*`, `gsap`, `popmotion`
(non-`framer-motion` distributions), `lottie-web`, `auto-animate`,
`motion-one`, `react-transition-group`, `react-move`. Tailwind's
built-in `animate-*` utility classes that ship with the framework
(`animate-spin`, `animate-pulse`, `animate-bounce`, `animate-ping`)
remain ALLOWED for trivial decorative loops where no JS state is
involved; anything stateful, gesture-driven, layout-aware, or
exit-animated MUST use `framer-motion`.

**D2 — No raw CSS keyframes for stateful motion.** Authoring `@keyframes`
in `src/index.css` (or any other CSS file) for any motion that
responds to React state, route changes, mount/unmount, gestures, or
scroll position is FORBIDDEN. Static decorative keyframes that exist
purely as a `@theme`-bound utility (the four Tailwind built-ins
above) are the only exception.

**D3 — No Web Animations API (WAAPI).** Direct `element.animate(...)`
calls, `KeyframeEffect` construction, and `Animation` instance
manipulation are FORBIDDEN in application code. The only permitted
imperative animation surface is `framer-motion`'s `useAnimate` /
`animate()` / `animationControls` API.

**D4 — No `requestAnimationFrame` for animation.** `requestAnimationFrame`
is RESERVED for non-animation polling (e.g. layout measurement
batching). Using it to drive animation values is FORBIDDEN —
`framer-motion`'s `useMotionValue` + `useTransform` is the canonical
substitute.

**D5 — Durations & easings sourced from `@theme` tokens.** Every
duration and easing passed to a `framer-motion` `transition` prop
MUST resolve to a `@theme`-block CSS custom property defined in
`src/index.css` per ADR-0012. The token vocabulary is:

  - **Durations:** `--duration-instant` (0ms — accessibility/`prefers-reduced-motion`),
    `--duration-fast` (120ms), `--duration-base` (200ms),
    `--duration-slow` (320ms), `--duration-deliberate` (480ms).
  - **Easings:** `--ease-out` (`cubic-bezier(0.16, 1, 0.3, 1)`),
    `--ease-in-out` (`cubic-bezier(0.65, 0, 0.35, 1)`),
    `--ease-spring` (framer-motion `spring` preset reference).

Inline numeric literals (`duration: 0.2`, `ease: [0.16, 1, 0.3, 1]`)
are FORBIDDEN. Components MUST read the token via a typed accessor
helper (deferred; tracked under F-IMPL-ANIMATION-TOKEN-ACCESSOR).

**D6 — `prefers-reduced-motion` is a single token swap.** When the
user-agent reports `prefers-reduced-motion: reduce`, every duration
token MUST resolve to `--duration-instant` (0ms) via a single
`@theme` scope override. No component-level conditional logic is
permitted — the swap is structural per ADR-0012 D7 (logical-property
mandate, applied here to motion-property mandate).

**D7 — Exit animations use `AnimatePresence` exclusively.** Mount/unmount
transitions MUST be authored via `framer-motion`'s `<AnimatePresence>`
+ `<motion.*>` `exit` prop. Hand-rolled mount-delay / unmount-delay
patterns (e.g. `setTimeout` before `setState(false)`) are FORBIDDEN.

## Consequences

- **Single auditable motion surface.** A grep for `from "framer-motion"`
  enumerates every animated component in the codebase.
- **Token-bound timing.** Audit "is the app's motion grammar
  consistent?" reduces to "are the 5 duration tokens consistent?" —
  a single-file question per ADR-0012.
- **Reduced-motion compliance is structural.** No per-component opt-in
  required.
- **Bundle ceiling.** `framer-motion@^12` is ~50KB gzipped; no second
  animation runtime can creep in.
- **Onboarding clarity.** A new contributor reads this ADR + ADR-0011
  + ADR-0012 + the Core `lucide-react` rule and has the full
  "external runtime surface" picture.
- **Cost:** the `framer-motion` API has a learning curve; the 15-line
  logic limit interacts with `useAnimate` hook bodies (mitigated by
  small dedicated motion components).

## Alternatives Considered

1. **No ADR; let the team pick per-component.** Rejected — exactly
   the drift class ADR-0011/0012 and the icon-policy rule prevent.
2. **CSS-only animations via Tailwind utilities + `@theme` keyframes.**
   Rejected for stateful motion (gestures, layout, exit animations,
   scroll-driven) — Tailwind alone cannot express these without
   verbose JS glue, defeating the 15-line logic limit.
3. **`@react-spring/web`.** Rejected — physics-based API is heavier
   per-import and the maintenance posture of `framer-motion` (now
   `motion`) is stronger as of 2026-04.
4. **`motion-one` (lighter framer-motion sibling).** Rejected for now
   — `framer-motion` already pinned; adding a second runtime to save
   bytes contradicts D1. Revisitable if `framer-motion` v13 splits
   the package and the lighter half maps cleanly.
5. **Native CSS `@scroll-timeline` / View Transitions API.** Deferred —
   browser support not yet at the implementation gate; revisit when
   F-IMPL-ANIMATION-TOKEN-ACCESSOR lands.

## Gates Touched

- **New gates (umbrella + 4 leaves):**
  - `G-ADR-0034` **(Umbrella, family=adr-animation)** — composes the
    four leaves below; cited from this ADR's §Decision.
  - `G-ADR-0034-ANIMATION-LIB-PIN` — D1 enforcement: only
    `framer-motion` may appear in `package.json` animation-runtime
    slot; deny-list of 8 forbidden packages.
  - `G-ADR-0034-NO-CSS-KEYFRAMES` — D2 enforcement: no
    `@keyframes` declarations in `src/**/*.css` outside the four
    Tailwind built-ins enumerated in D1.
  - `G-ADR-0034-NO-WAAPI` — D3 enforcement: no `.animate(`
    method-call sites on DOM `Element` references in `src/**/*.{ts,tsx}`.
  - `G-ADR-0034-THEME-TOKEN-SOURCING` — D5 enforcement: every
    `transition: { duration, ease }` literal in `src/**/*.{ts,tsx}`
    MUST source from a `--duration-*` / `--ease-*` token.
- **Modified gates:** `(none)` — `G-32-NO-SECOND-STYLING-SYSTEM`
  remains unchanged; this ADR adds an orthogonal motion-system rule.
- **Endpoints locked:** `(none)`.
- **DDL identifiers locked:** `(none)`.

All five gates ship at **DOC-NORM** tier per the SPEC-ONLY mode
posture; CI runners are deferred to the first F-IMPL cycle that
lands `src/` content (per the F-AUDIT-46 vertical-slice trigger).
Graduation predicate per ADR-0031: warn-only until first animated
component lands; flips HARD on `targetDate` per the gate-graduation
ledger.

## Supersedes / Superseded-By

- **Supersedes:** `(none)` — first ADR on motion policy.
- **Superseded-By:** `(none)`.

## Related

- [`spec/00-adrs/0011-axios-only-http-client.md`](./0011-axios-only-http-client.md) —
  sole-runtime-per-concern precedent (HTTP).
- [`spec/00-adrs/0012-tailwind-v4-theme-block-token-registry.md`](./0012-tailwind-v4-theme-block-token-registry.md) —
  `@theme`-block sole token registry; D5 above binds animation
  tokens into this same registry.
- [`spec/00-adrs/0003-react-19-ts-strict-frontend.md`](./0003-react-19-ts-strict-frontend.md) —
  frontend stack ADR; this ADR slots into its "external runtime
  surface" enumeration.
- [`spec/00-adrs/0033-umbrella-composes-orphan-sub-rules.md`](./0033-umbrella-composes-orphan-sub-rules.md) —
  umbrella-composes-leaves pattern this ADR's gate cluster follows.
- [`spec/AUDIT-FINDINGS-LEDGER.md`](../AUDIT-FINDINGS-LEDGER.md) —
  F-AUDIT-52 (the finding this ADR closes).
- `mem://design/theme` — Core memory pinning Tailwind v4 + `@theme`
  block; will receive a one-line addendum: *"Animation:
  framer-motion sole; durations & easings via @theme tokens
  (`--duration-*` / `--ease-*`) per ADR-0034."*
