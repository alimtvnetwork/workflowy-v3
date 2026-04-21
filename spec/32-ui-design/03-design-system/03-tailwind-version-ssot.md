# Tailwind CSS — Single Source of Truth

> **Updated:** 2026-04-19
> **Status:** Authoritative — overrides any conflicting reference elsewhere

## Decision

**Tailwind CSS v4** is the only supported version for this project.

| Item | Value |
|------|-------|
| Package | `tailwindcss@^4.2.2` |
| Vite plugin | `@tailwindcss/vite@^4.2.2` |
| Config location | `src/index.css` `@theme` block (NOT `tailwind.config.ts`) |
| Merge helper | `tailwind-merge@^3.5.0` |

## Why v4 (not v3)

- v4 ships a first-class Vite plugin (`@tailwindcss/vite`) — zero PostCSS pipeline.
- All custom tokens live in CSS via `@theme { … }` — keeps design tokens colocated with the global stylesheet.
- v4's CSS-first config eliminates the dual-source problem (TS config vs. CSS variables) that plagued v3 setups.

## Forbidden

- ❌ Do NOT add `tailwind.config.ts` / `tailwind.config.js` — v4 reads `@theme` directly from `src/index.css`.
- ❌ Do NOT install `tailwindcss@^3.x` or `postcss` Tailwind variants.
- ❌ Do NOT reference v3-era directives (`@tailwind base; @tailwind components; @tailwind utilities;`) — v4 uses `@import "tailwindcss";`.

## Where tokens live

```css
/* src/index.css */
@import "tailwindcss";

@theme {
  --color-bullet: hsl(var(--bullet));
  --color-highlight: hsl(var(--highlight));
  /* ... */
}
```

All custom color tokens MUST be declared as HSL (per project memory core rule).

## Conflict-resolution rule

If any other spec file, memory entry, or external doc claims Tailwind v3, **this file wins**. Open a PR to fix the contradicting source.

## Related

- [01-tokens-and-themes.md](01-tokens-and-themes.md) — Token definitions
- `mem://design/theme` — Memory mirror of breakpoints + tokens
- `mem://architecture/tech-stack` — Pinned dependency matrix (see C-4)
