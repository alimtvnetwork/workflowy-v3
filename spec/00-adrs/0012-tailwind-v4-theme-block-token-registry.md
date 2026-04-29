# ADR-0012: Tailwind v4 `@theme` block is the sole design-token registry; HSL-only; no raw colors

## Status

`Accepted` — 2026-04-28 (**Amended 2026-04-28**: added D7 — logical properties mandate, anchoring the rule introduced by ADR-0028 D6 at its rightful authority. Three new gates: `G-12-LOGICAL-MARGINS-PADDING`, `G-12-LOGICAL-TEXT-ALIGN`, `G-12-LOGICAL-INSET`.)

## Context

WorkFlowy ships exactly one styling system. Every color, spacing
scale, radius, shadow, font, and breakpoint MUST be authored as a
**design token** so that:

1. Light / dark / future high-contrast modes can be switched by
   swapping a single `@theme` scope rather than auditing every
   component.
2. shadcn-style component variants compose against semantic names
   (`bg-primary`, `text-muted-foreground`) instead of raw values.
3. The token registry is a single auditable file — drift between
   components is a structural impossibility, not a discipline problem.

Today the policy is split:

- **Memory** — `mem://design/theme` (Tailwind v4 only, `@theme` block,
  HSL-only, no `tailwind.config.ts`).
- **ADR-0003** — under "Styling": *"Tailwind CSS v4 via
  `@tailwindcss/vite`. All design tokens MUST live inside the
  `@theme { … }` block in `src/index.css`. No second styling system."*
- **Tailwind SSOT** — `spec/32-ui-design/03-design-system/03-tailwind-version-ssot.md`.
- **System prompt** — *"Never write custom color classes (text-white,
  bg-black, etc.) in components. Always use semantic design tokens."*

Without a dedicated ADR, an AI generating a new component could
legitimately:

- Add a `tailwind.config.ts` (Tailwind v3 muscle memory) and silently
  shadow the v4 CSS-first config.
- Inline `text-white`, `bg-[#0F172A]`, or `style={{ color: "red" }}`
  for "just one component".
- Author a token in `rgb(...)`, `hex`, or `oklch(...)` instead of HSL,
  breaking the `hsl(var(--token) / <alpha>)` opacity model the rest of
  the system depends on.
- Co-locate a token in a feature CSS file or a CSS module, splitting
  the registry across N files.

P59 closes this gap.

## Decision

### D1 — Tailwind CSS v4 via `@tailwindcss/vite`, no `tailwind.config.ts`

The project MUST (gate G-32-NO-TAILWIND-CONFIG) use **Tailwind CSS v4** via the
`@tailwindcss/vite` plugin. The pinned versions are
`tailwindcss@^4.2.2` and `@tailwindcss/vite@^4.2.2`, governed by
`spec/02-coding-guidelines/01-cross-language/30-pinned-dependency-matrix.md`.

A `tailwind.config.ts` (or `.js` / `.cjs` / `.mjs`) file MUST NOT (gate G-32-NO-TAILWIND-CONFIG)
exist in the repository. v4 is **CSS-first**; configuration lives in
the `@theme` block (D2). Reintroducing a JS/TS config file is a hard
violation of `G-32-NO-TAILWIND-CONFIG`.

A second styling system MUST NOT (gate G-32-NO-SECOND-STYLING-SYSTEM) be added: SCSS modules,
`styled-components`, Emotion, `vanilla-extract`, plain CSS modules,
and inline `style={{ ... }}` for tokenisable properties (color,
spacing, radius, shadow, font, breakpoint) are all **forbidden**.

Inline `style={{ ... }}` MAY be used for **dynamic non-tokenisable**
values only (e.g. computed `transform: translateX(${pixels}px)` for
drag positioning, `width: ${percent}%` for a progress bar). Static
values MUST (gate G-32-NO-SECOND-STYLING-SYSTEM) go through Tailwind utilities.

### D2 — `@theme` block in `src/index.css` is the sole token registry

Every design token MUST (gate G-32-TOKEN-REGISTRY) be declared inside the **single** `@theme { … }`
block in `src/index.css`. No other file may declare design tokens.
Tokens MUST (gate G-32-TOKEN-REGISTRY) cover:

- Colors (semantic: `--background`, `--foreground`, `--primary`,
  `--primary-foreground`, `--secondary`, `--muted`, `--accent`,
  `--destructive`, `--border`, `--input`, `--ring`).
- Project-specific colors (`--bullet`, `--highlight`, `--completed`,
  `--drag-indicator` per memory `theme`).
- Spacing scale, border-radius scale, shadow scale, font families.
- Breakpoints (`sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`,
  per memory `theme`; a 5th tier requires an ADR amendment).

Light / dark theme switching MUST (gate G-32-DARK-MODE-PARITY) be implemented by re-declaring the
**same token names** under a `:root[data-theme="dark"]` (or `.dark`)
scope inside the same `src/index.css`. Adding a parallel
`src/themes/dark.css` or similar is forbidden.

### D3 — All color tokens MUST be authored as HSL, no exceptions

Color tokens MUST (gate G-32-HSL-ONLY-TOKENS) use HSL component values without the `hsl()`
wrapper, e.g.:

```css
--primary: 222 47% 11%;
--primary-foreground: 210 40% 98%;
```

NOT:

```css
--primary: hsl(222, 47%, 11%);   /* ❌ wrapper */
--primary: #0f172a;              /* ❌ hex */
--primary: rgb(15, 23, 42);      /* ❌ rgb */
--primary: oklch(0.21 0.04 270); /* ❌ oklch */
```

Consumers MUST (gate G-32-HSL-ONLY-TOKENS) wrap with `hsl(var(--token))` or
`hsl(var(--token) / <alpha-value>)` at the use site (Tailwind v4 emits
this automatically for `bg-primary`, `text-primary`, etc.). The
no-wrapper authoring rule is what makes the alpha-channel form work.

### D4 — No raw colors in components

Component code MUST NOT (gate G-32-NO-RAW-COLORS) contain raw color values. Forbidden, with
examples:

| Forbidden | Replace with |
|---|---|
| `className="text-white bg-black"` | `className="text-background bg-foreground"` (or the appropriate semantic) |
| `className="bg-[#0F172A]"` | semantic class backed by a `@theme` token |
| `className="text-[hsl(222,47%,11%)]"` | semantic class backed by a `@theme` token |
| `style={{ color: "red" }}` for static color | semantic class backed by a `--destructive` token |

**Out of scope** (NOT a violation): generated `src/components/ui/*`
files (shadcn) that the user has explicitly configured to use
specific Tailwind utility names — these are regenerable and follow
the shadcn upstream conventions; they MUST (gate G-32-NO-RAW-COLORS) already resolve to
semantic tokens in their template.

### D5 — Component variants compose against semantic tokens, never raw

shadcn-style variants (e.g. `cva(...)`) MUST (gate G-32-VARIANT-SEMANTIC-ONLY) reference semantic
classes (`bg-primary`, `text-primary-foreground`,
`border-input`, `ring-ring`) and MUST NOT (gate G-32-VARIANT-SEMANTIC-ONLY) inline raw colors or
arbitrary-value classes. A variant whose only difference is a raw
color is a hard violation of `G-32-VARIANT-SEMANTIC-ONLY`.

### D6 — Dark-mode parity is mandatory for every new token

Every new token added under `:root` MUST (gate G-32-DARK-MODE-PARITY) also be declared under the
dark-theme scope in the same change (or explicitly documented as
intentionally identical, e.g. `--bullet`). A token that exists in
light but not in dark fails `G-32-DARK-MODE-PARITY` (already cited by
ADR-0003).

### D7 — Logical properties are mandatory; physical directional utilities are forbidden

WorkFlowy supports RTL locales (`ar` initially per ADR-0028 D4). Every directional spacing, alignment, or inset utility in component code MUST (gate G-12-LOGICAL-MARGINS-PADDING) use the **logical** Tailwind v4 form so that the UI flips automatically with `<html dir="rtl">`:

| Forbidden (physical) | Required (logical) | Rationale |
|---|---|---|
| `pl-*`, `pr-*` | `ps-*`, `pe-*` | Padding inline-start / inline-end |
| `ml-*`, `mr-*` | `ms-*`, `me-*` | Margin inline-start / inline-end |
| `left-*`, `right-*` | `start-*`, `end-*` | Absolute / fixed inset on the inline axis |
| `text-left`, `text-right` | `text-start`, `text-end` | Text alignment along reading direction |
| `border-l-*`, `border-r-*` | `border-s-*`, `border-e-*` | Inline-axis borders |
| `rounded-l-*`, `rounded-r-*` | `rounded-s-*`, `rounded-e-*` | Inline-axis corner radii |

**Exceptions** (physical utilities allowed):
1. **Block-axis** utilities (`pt-*`/`pb-*`/`mt-*`/`mb-*`/`top-*`/`bottom-*`/`text-center`) are direction-agnostic and remain physical.
2. **Icons that imply direction** (chevrons, undo arrows) MUST (gate G-12-LOGICAL-INSET) stay physical and use `rtl:rotate-180` to mirror — they encode semantic direction, not text-flow direction. (Anchored by ADR-0028 D6 §4.)
3. **shadcn-vendored components** under `src/components/ui/` are grandfathered until each is touched; PRs touching such a file MUST (gate G-12-LOGICAL-MARGINS-PADDING) migrate any physical utilities in the same change (`G-12-LOGICAL-*` gates fire on the diff, not on legacy lines).
4. **Third-party CSS** (TipTap default styles, lucide-react SVGs) is out of scope — wrap in WorkFlowy components that apply logical utilities.

**Authoring rule:** when a component genuinely depends on a hard left/right (e.g. a left-side gutter that must NOT flip in RTL because it visually encodes elapsed time on a left-anchored timeline), the component MUST (gate G-12-LOGICAL-MARGINS-PADDING) add the comment `/* a11y-rtl-exempt: <reason> */` immediately above the offending utility. ESLint reads the comment to suppress the gate; missing comment = build fail.

This rule lives in ADR-0012 (not ADR-0028) because it is a **styling-system invariant** — every component author needs it regardless of whether they touch i18n code. ADR-0028 D6 cites this section as the authority.

## Consequences

### Positive

- **Single source of design truth.** `src/index.css` `@theme` block
  is the one file to read to know every token in the system.
- **Theme swap is one scope.** Light → dark → high-contrast is a
  declarative scope swap, not a component refactor.
- **No drift.** D4 + D5 make raw colors structurally impossible
  (lint-enforceable via `G-32-NO-RAW-COLORS`).
- **Alpha works everywhere.** D3's no-wrapper authoring is what makes
  `hsl(var(--token) / 0.5)` valid in every Tailwind utility.
- **ADR-0003 styling anchor closed.** What ADR-0003 stated as a
  one-liner is now ratified with enforcement gates.

### Negative

- **shadcn updates require care.** A future shadcn template that
  emits raw colors would need a one-time post-processing pass to
  rewrite into semantic tokens. Acceptable cost — the alternative
  is a permanent escape hatch.
- **Dynamic colors require token plumbing.** A "user-picked accent
  color" feature must either (a) override the `--primary` token at
  runtime via inline style on the root element, or (b) ship as a new
  ADR-amended token. No `style={{ color: pickedHex }}` shortcut.


**Spec impact** — Downstream sections affected by this decision: [`spec/32-ui-design/`](../32-ui-design/), [`spec/07-design-system/`](../07-design-system/).

## Alternatives Considered

1. **Tailwind v3 + `tailwind.config.ts`** — rejected: v4's CSS-first
   config eliminates the JS/TS config drift problem entirely (one
   file, one syntax, no `extend` vs override gotchas) and is
   strictly co-located with the tokens it configures. Pinned-deps
   SSOT already commits to v4.
2. **CSS Modules + design-tokens-as-JS-objects** — rejected: splits
   the registry across N files, breaks the Tailwind utility surface
   that the entire shadcn ecosystem depends on, and provides no
   ergonomic dark-mode swap.
3. **`oklch()` color authoring (modern, perceptually uniform)** —
   rejected for v1: incompatible with the existing
   `hsl(var(--token) / <alpha>)` consumer pattern and with
   shadcn's HSL-assumed templates. Reconsider in a superseding ADR
   when shadcn upstream moves.

## Gates Touched

- `G-32-NO-TAILWIND-CONFIG` — enforces D1 (no `tailwind.config.{ts,js,cjs,mjs}` file).
- `G-32-NO-SECOND-STYLING-SYSTEM` — enforces D1 (no SCSS modules /
  styled-components / Emotion / vanilla-extract / CSS modules; no
  inline-style for tokenisable properties).
- `G-32-TOKEN-REGISTRY` — enforces D2 (single `@theme` block in
  `src/index.css`; no parallel theme file).
- `G-32-HSL-ONLY-TOKENS` — enforces D3 (no `hsl()` wrapper, no hex,
  no rgb, no oklch in token authoring).
- `G-32-NO-RAW-COLORS` — enforces D4 (no raw color classes / hex /
  arbitrary-value color in components).
- `G-32-VARIANT-SEMANTIC-ONLY` — enforces D5 (variants reference
  semantic classes only).
- `G-32-DARK-MODE-PARITY` — enforces D6 (every new light-mode token
  has a dark-mode counterpart in the same change). **Strengthened**
  from ADR-0003.
- `G-12-LOGICAL-MARGINS-PADDING` — **CI** — enforces D7. ESLint rule (custom or `eslint-plugin-tailwindcss` `classnames-order` extension) bans `pl-*`, `pr-*`, `ml-*`, `mr-*`, `border-l-*`, `border-r-*`, `rounded-l-*`, `rounded-r-*` in `src/**/*.{ts,tsx}` outside `src/components/ui/` (grandfathered) unless the line is preceded by `/* a11y-rtl-exempt: <reason> */`.
- `G-12-LOGICAL-TEXT-ALIGN` — **CI** — enforces D7. ESLint bans `text-left` and `text-right`; require `text-start` / `text-end`. Same exemption-comment escape hatch.
- `G-12-LOGICAL-INSET` — **CI** — enforces D7. ESLint bans `left-*` and `right-*` positional utilities; require `start-*` / `end-*`. Same exemption-comment escape hatch.

All ten gates (`G-32-*` × 7 + `G-12-LOGICAL-*` × 3) are formally **anchored** by this ADR. Their enforcement contracts live in
`spec/32-ui-design/03-design-system/`,
`spec/02-coding-guidelines/01-cross-language/30-pinned-dependency-matrix.md`,
and `spec/35-enforcement-rules/`.


## Supersedes / Superseded-By

- **Supersedes:** (none — refines ADR-0003's "Styling" anchor by
  ratifying it as a standalone enforceable contract).
- **Superseded-By:** (none).
