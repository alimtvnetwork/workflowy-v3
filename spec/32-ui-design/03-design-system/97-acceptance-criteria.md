# Design System — Acceptance Criteria

> **Version:** 1.0.1
> **Created:** 2026-04-23 (UTC+8)
> **Status:** Scaffold
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## Purpose

Aggregated acceptance criteria for design tokens, theming, and Tailwind v4 configuration. ID range: `AT-UIDS-NN`.

---

## Coverage Map

| # | Topic | Source File | ID Range |
|---|-------|-------------|----------|
| 1 | Tokens & themes | [`01-tokens-and-themes.md`](./01-tokens-and-themes.md) | AT-UIDS-01..10 |
| 2 | Low-severity clarifications | [`02-low-severity-clarifications.md`](./02-low-severity-clarifications.md) | AT-UIDS-11..15 |
| 3 | Tailwind v4 SSOT | [`03-tailwind-version-ssot.md`](./03-tailwind-version-ssot.md) | AT-UIDS-16..20 |

---

## Criteria Summary

- [x] All colors are HSL semantic tokens in `src/index.css` `@theme` block.
- [x] No component uses hardcoded color classes (e.g., `text-white`, `bg-black`).
- [x] Light + Dark themes both compile and pass contrast checks.
- [x] Tailwind v4 CSS-first config — no color values in `tailwind.config.ts`.
- [x] Geist Mono loaded for code blocks; Inter for UI.
