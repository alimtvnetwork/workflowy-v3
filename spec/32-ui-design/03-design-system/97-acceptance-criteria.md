# Design System — Acceptance Criteria

> **Version:** 1.0.0
> **Created:** 2026-04-23 (UTC+8)
> **Status:** Scaffold
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## Purpose

Aggregated acceptance criteria for design tokens, theming, typography, and Tailwind v4 configuration. ID range: `AT-UIDS-NN`.

---

## Coverage Map

| # | Topic | Source File | ID Range |
|---|-------|-------------|----------|
| 1 | Design tokens | [`01-design-tokens.md`](./01-design-tokens.md) | AT-UIDS-01..05 |
| 2 | Theming | [`02-theming.md`](./02-theming.md) | AT-UIDS-06..10 |
| 3 | Tailwind v4 SSOT | [`03-tailwind-version-ssot.md`](./03-tailwind-version-ssot.md) | AT-UIDS-11..15 |
| 4 | Typography | [`04-typography.md`](./04-typography.md) | AT-UIDS-16..20 |

---

## Criteria Summary

- [x] All colors are HSL semantic tokens in `src/index.css` `@theme` block.
- [x] No component uses hardcoded color classes (e.g., `text-white`, `bg-black`).
- [x] Light + Dark themes both compile and pass contrast checks.
- [x] Tailwind v4 CSS-first config — no `tailwind.config.ts` color values.
- [x] Geist Mono loaded for code blocks; Inter for UI.
