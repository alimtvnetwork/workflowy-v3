# Design System — Acceptance Criteria

> **Version:** 2.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 16 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-UIDS-01` … `AT-UIDS-16`

---

## Criteria

### Tokens & themes (file 01)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-UIDS-01 | All colors MUST be HSL semantic tokens defined in `src/index.css` inside the `@theme` block; raw hex / RGB / OKLCH values in components or CSS files are FORBIDDEN as a Code-Red design-system bug. | [`01-tokens-and-themes.md`](./01-tokens-and-themes.md), [`mem://design/theme`](mem://design/theme) |
| AT-UIDS-02 | Components MUST consume tokens via semantic class names (`bg-background`, `text-foreground`, `border-border`); hardcoded utility classes (`text-white`, `bg-black`, `bg-blue-500`) are FORBIDDEN. | [`01-tokens-and-themes.md`](./01-tokens-and-themes.md) |
| AT-UIDS-03 | Every semantic token MUST have a documented role (background / foreground / accent / muted / destructive); orphan tokens (defined but unused or undocumented) fail review. | [`01-tokens-and-themes.md`](./01-tokens-and-themes.md) |
| AT-UIDS-04 | Light AND dark themes MUST both compile AND pass WCAG 2.1 AA contrast checks (4.5:1 normal text, 3:1 large text); failing either is a Code-Red accessibility bug. | [`01-tokens-and-themes.md`](./01-tokens-and-themes.md), [`../05-quality/97-acceptance-criteria.md`](../05-quality/97-acceptance-criteria.md) |
| AT-UIDS-05 | Theme switching MUST be CSS-class-based (`html.dark` toggle), NOT JS-recompiled tokens; runtime token recomputation is a Code-Red perf bug. | [`01-tokens-and-themes.md`](./01-tokens-and-themes.md) |
| AT-UIDS-06 | Tokens MUST cover surfaces (background, card, popover), text (foreground, muted-foreground), borders, AND interactive states (hover, active, focus); missing any category fails review. | [`01-tokens-and-themes.md`](./01-tokens-and-themes.md) |

### Low-severity clarifications (file 02)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-UIDS-07 | Border radius MUST come from a single `--radius` token + Tailwind's `rounded-{sm,md,lg,xl}` derived scale; arbitrary `rounded-[7px]` values fail review. | [`02-low-severity-clarifications.md`](./02-low-severity-clarifications.md) |
| AT-UIDS-08 | Spacing MUST use Tailwind's default 4px scale (`p-2`, `gap-4`, etc.); arbitrary `p-[13px]` values are FORBIDDEN except behind a documented one-off rationale comment. | [`02-low-severity-clarifications.md`](./02-low-severity-clarifications.md) |
| AT-UIDS-09 | Shadow tokens MUST be HSL-based (use `--shadow-color` as alpha-applied HSL); RGBA-baked shadows fail review because they break dark-mode adaptation. | [`02-low-severity-clarifications.md`](./02-low-severity-clarifications.md) |
| AT-UIDS-10 | Animation durations MUST come from documented tokens (`--duration-fast`, `--duration-normal`); inline arbitrary `duration-[237ms]` values fail review. | [`02-low-severity-clarifications.md`](./02-low-severity-clarifications.md) |

### Tailwind v4 SSOT (file 03)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-UIDS-11 | Tailwind MUST be v4 (`@tailwindcss/vite` plugin) with the `@theme` block in `src/index.css` as the SINGLE source of truth; Tailwind v3 (`tailwind.config.ts` colors) is FORBIDDEN. | [`03-tailwind-version-ssot.md`](./03-tailwind-version-ssot.md), [`mem://design/theme`](mem://design/theme) |
| AT-UIDS-12 | `tailwind.config.ts` MUST contain ZERO color values (v4 reads colors from `@theme`); any `colors: {…}` entry in the config is a Code-Red SSOT-violation bug. | [`03-tailwind-version-ssot.md`](./03-tailwind-version-ssot.md) |
| AT-UIDS-13 | The Tailwind PostCSS pipeline (v3-style) MUST NOT be used in parallel with the Vite plugin; dual pipelines cause CSS-order drift and are a Code-Red build bug. | [`03-tailwind-version-ssot.md`](./03-tailwind-version-ssot.md) |

### Typography & cross-cutting

| ID | Criterion | Source |
|----|-----------|--------|
| AT-UIDS-14 | Code blocks MUST use Geist Mono (or documented monospace fallback); UI text MUST use Inter (or documented system fallback). Other webfonts require a documented loading-budget rationale. | [`00-overview.md`](./00-overview.md), [`mem://design/theme`](mem://design/theme) |
| AT-UIDS-15 | Webfont loading MUST use `font-display: swap` (NOT `block`); blocking webfonts are a Code-Red perf bug because they delay LCP. | [`00-overview.md`](./00-overview.md) |
| AT-UIDS-16 | shadcn-ui components MUST be customised via the design system (variants/`cva`), NOT by editing the component's source unless via documented patch in `components/ui/`; un-tracked shadcn edits fail review. | [`00-overview.md`](./00-overview.md) |

---

## Verification

```bash
# Hardcoded hex/rgb scan
rg -nP "#[0-9a-fA-F]{3,8}\b|rgb\(|rgba\(" src/components/ src/pages/ | grep -v '\.svg'

# Forbidden utility colors
rg -nP "\b(text|bg)-(white|black|red|blue|green|yellow|purple|pink|gray|slate|zinc)-\d+" src/components/ src/pages/

# Tailwind v4 config check (must be empty colors)
rg -nP "colors\s*:\s*{" tailwind.config.ts

# Hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../05-quality/97-acceptance-criteria.md`](../05-quality/97-acceptance-criteria.md) — A11y contrast rules
- [`mem://design/theme`](mem://design/theme) — Theme & token SSOT

---

*Curated 2026-04-25 — closes batch-18 item 3. Replaces v1.0.1 scaffold.*


---

## Fixtures

Fixtures for every AT row in this file are covered by the global P2g sweep — see [`../../97a-acceptance-criteria-fixtures.md`](../../97a-acceptance-criteria-fixtures.md) (apply the matching pattern by section).
