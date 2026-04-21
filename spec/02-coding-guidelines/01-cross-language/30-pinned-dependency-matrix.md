# Pinned Dependency Matrix

> **Updated:** 2026-04-19
> **Status:** Authoritative — overrides any conflicting reference elsewhere
> **Enforced by:** Manual review + `scripts/validate-axios-version.ts` (axios only, today)

## Rule

The runtime + tooling dependencies below are the **only versions** allowed in this project. Any change requires a separate spec PR updating this table.

## Production runtime

| Package | Pinned version | Why this version |
|---------|---------------|------------------|
| `react` | `^19.2.4` | React 19 stable; concurrent features baseline |
| `react-dom` | `^19.2.4` | Must match `react` major |
| `react-router-dom` | `^7.13.2` | v7 data-router API; v6 not allowed |
| `axios` | `1.14.0` **or** `0.30.3` (exact) | Security pin — see `scripts/validate-axios-version.ts` |
| `@tanstack/react-query` | `^5.95.2` | v5 query API |
| `lucide-react` | `^1.7.0` | Icon library — only icon source allowed |
| `framer-motion` | `^12.38.0` | Motion primitives |
| `class-variance-authority` | `^0.7.1` | Variant authoring for shadcn components |
| `clsx` | `^2.1.1` | Class composition |
| `tailwind-merge` | `^3.5.0` | Tailwind v4 class merge |
| `@radix-ui/react-slot` | `^1.2.4` | Radix slot primitive (used by shadcn) |

## Styling

| Package | Pinned version | Notes |
|---------|---------------|-------|
| `tailwindcss` | `^4.2.2` | **v4 only** — see [Tailwind SSOT](../../32-ui-design/03-design-system/03-tailwind-version-ssot.md) |
| `@tailwindcss/vite` | `^4.2.2` | Vite plugin (replaces PostCSS pipeline) |
| `autoprefixer` | `^10.4.27` | Build-time prefix pass |
| `postcss` | `^8.5.8` | Transitive — required by autoprefixer |

## Build / tooling

| Package | Pinned version | Notes |
|---------|---------------|-------|
| `vite` | `^8.0.3` | Build + dev server |
| `@vitejs/plugin-react-swc` | `^4.3.0` | SWC transform — Babel plugin not allowed |
| `typescript` | `^6.0.2` | Strict mode mandatory (see `13-strict-typing.md`) |
| `@types/react` | `^19.2.14` | Must match React major |
| `@types/react-dom` | `^19.2.3` | Must match React-DOM major |

## Forbidden categories

- ❌ `tailwindcss@^3.x` (v3) — see Tailwind SSOT
- ❌ `react-router-dom@^6.x` — v7 only
- ❌ `axios@^1.6.x..1.13.x` or `<0.30.3` — security advisory
- ❌ Any new icon library (e.g. `react-icons`, `heroicons`) — `lucide-react` only
- ❌ Any animation library beyond `framer-motion`
- ❌ Any state library beyond `@tanstack/react-query` + React built-ins
- ❌ Babel-based transforms (`@vitejs/plugin-react`) — SWC only

## Adding a new dependency

1. Open a spec PR adding a row to the matrix above with **why** justification.
2. Pin the version (caret OK for runtime, exact required for security-pinned packages).
3. Update `mem://architecture/tech-stack` with a one-line pointer to the new entry.
4. Only then run `npm install <pkg>@<version>`.

## Related

- [Tailwind SSOT](../../32-ui-design/03-design-system/03-tailwind-version-ssot.md)
- [13-strict-typing.md](./13-strict-typing.md) — TypeScript strict-mode requirements
- `mem://architecture/tech-stack` — Memory mirror
