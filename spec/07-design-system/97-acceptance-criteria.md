# Acceptance Criteria

> **Version:** 3.2.0  
> **Updated:** 2026-04-29

---

## Overview

Testable criteria for validating design system compliance across all components and pages.

---

## Theme & Variables

| # | Criterion | Source |
|---|-----------|--------|
| AT-DESIGNSYS-001 | No component uses hardcoded hex, rgb, or literal Tailwind color classes | `01-design-principles.md` |
| AT-DESIGNSYS-002 | All colors reference CSS custom properties via `hsl(var(--token))` | `02-theme-variable-architecture.md` |
| AT-DESIGNSYS-003 | Changing `--primary` in `:root` updates all primary-colored elements | `02-theme-variable-architecture.md` |
| AT-DESIGNSYS-004 | Both `:root` and `.dark` blocks define all tokens | `02-theme-variable-architecture.md` |
| AT-DESIGNSYS-005 | Dark mode toggle changes all surfaces, text, and borders correctly | `02-theme-variable-architecture.md` |
| AT-DESIGNSYS-006 | Text on colored backgrounds meets WCAG AA contrast ratio (4.5:1) | `01-design-principles.md` |

## Typography

| # | Criterion | Source |
|---|-----------|--------|
| AT-DESIGNSYS-007 | Headings use Ubuntu font family | `03-typography.md` |
| AT-DESIGNSYS-008 | Body text uses Poppins font family | `03-typography.md` |
| AT-DESIGNSYS-009 | Code blocks use Ubuntu Mono / JetBrains Mono | `03-typography.md` |
| AT-DESIGNSYS-010 | H1 and H2 use gradient text effect | `03-typography.md` |
| AT-DESIGNSYS-011 | No heading level is skipped (H1 → H2 → H3) | `12-page-creation-rules.md` |

## Motion & Transitions

| # | Criterion | Source |
|---|-----------|--------|
| AT-DESIGNSYS-012 | All hover transitions complete within 300ms | `06-motion-transitions.md` |
| AT-DESIGNSYS-013 | No JavaScript animation libraries used for visual effects | `06-motion-transitions.md` |
| AT-DESIGNSYS-014 | `prefers-reduced-motion` media query disables animations | `06-motion-transitions.md` |
| AT-DESIGNSYS-015 | Link underline sweeps right-to-left on hover | `06-motion-transitions.md` |
| AT-DESIGNSYS-016 | CTA buttons use slide text animation, not single-property `color` change | `09-button-system.md` |

## Code Blocks

| # | Criterion | Source |
|---|-----------|--------|
| AT-DESIGNSYS-017 | Code blocks maintain dark background in both themes | `07-code-blocks.md` |
| AT-DESIGNSYS-018 | Language badge shows correct color dot per language | `07-code-blocks.md` |
| AT-DESIGNSYS-019 | Font size controls adjust between 12px and 32px | `07-code-blocks.md` |
| AT-DESIGNSYS-020 | Line click pins/unpins with primary-colored background | `07-code-blocks.md` |
| AT-DESIGNSYS-021 | Shift-click selects line range | `07-code-blocks.md` |
| AT-DESIGNSYS-022 | Fullscreen mode fills viewport with 2rem inset | `07-code-blocks.md` |
| AT-DESIGNSYS-023 | Escape key exits fullscreen | `07-code-blocks.md` |
| AT-DESIGNSYS-024 | Copy button shows "Copied ✓" state for 2 seconds | `07-code-blocks.md` |
| AT-DESIGNSYS-025 | Tree/structure blocks show 📁/📄 prefixes | `07-code-blocks.md` |

## Navigation

| # | Criterion | Source |
|---|-----------|--------|
| AT-DESIGNSYS-026 | Header icon hover shows scale(1.05) effect | `08-header-navigation.md` |
| AT-DESIGNSYS-027 | Menu item hover shows gradient underline sweep | `08-header-navigation.md` |
| AT-DESIGNSYS-028 | Dropdown items show primary-tinted hover background | `08-header-navigation.md` |
| AT-DESIGNSYS-029 | Sidebar collapses to sheet on mobile (< 768px) | `10-sidebar-system.md` |
| AT-DESIGNSYS-030 | Ctrl+B toggles sidebar visibility | `10-sidebar-system.md` |

## Page Consistency

| # | Criterion | Source |
|---|-----------|--------|
| AT-DESIGNSYS-031 | New pages follow section pattern templates | `12-page-creation-rules.md` |
| AT-DESIGNSYS-032 | No page introduces fonts not in the design system | `12-page-creation-rules.md` |
| AT-DESIGNSYS-033 | All interactive elements follow the state language | `12-page-creation-rules.md` |
| AT-DESIGNSYS-034 | Responsive at mobile/tablet/desktop breakpoints | `12-page-creation-rules.md` |

---

## Fixtures

I/O fixtures (linter commands + DOM snapshots) for every `AC-NNN` row above live in [`97a-acceptance-criteria-fixtures.md`](./97a-acceptance-criteria-fixtures.md) per [`spec/01-spec-authoring-guide/19-acceptance-criteria-io-table.md`](../01-spec-authoring-guide/19-acceptance-criteria-io-table.md).

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Full Design System | [00-overview.md](./00-overview.md) |
| I/O Fixtures | [97a-acceptance-criteria-fixtures.md](./97a-acceptance-criteria-fixtures.md) |
