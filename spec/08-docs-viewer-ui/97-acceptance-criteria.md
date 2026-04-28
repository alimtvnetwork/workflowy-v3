# Docs Viewer UI — Acceptance Criteria (rollup)

> **Version:** 2.0.0
> **Updated:** 2026-04-26 (UTC+8) — populated from scaffold (polish #3, A-26 wave-1). v1.0.0 was scaffold.
> **Status:** Curated rollup — 12 testable criteria across Fundamentals + Features
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-DOCSVIEWERUI-01` … `AT-DOCSVIEWERUI-12`

Per-feature inline criteria continue to live in [`02-features/97-acceptance-criteria.md`](./02-features/97-acceptance-criteria.md) and per-leaf `97-acceptance-criteria.md` files (e.g. `02-features/07-visual-rendering-guide/`).

---

## Criteria

### Fundamentals

| ID | Criterion | Source |
|----|-----------|--------|
| `AT-DOCSVIEWERUI-01` | The viewer is mounted at the route `/docs` and renders markdown sourced from the in-repo `spec/` tree without server-side rendering. | [`01-fundamentals.md`](./01-fundamentals.md) |
| `AT-DOCSVIEWERUI-02` | Heading typography uses **Poppins**; body uses **Ubuntu** (or the curated fallbacks in the design tokens); font choices are token-driven, never inline `font-family`. | [`01-fundamentals.md`](./01-fundamentals.md) §Typography + `mem://design/theme` |
| `AT-DOCSVIEWERUI-03` | The viewer respects the global light/dark theme from `spec/07-design-system/` — it never ships a parallel theme system. | [`01-fundamentals.md`](./01-fundamentals.md) + `spec/07-design-system/` |

### Features

| ID | Criterion | Source |
|----|-----------|--------|
| `AT-DOCSVIEWERUI-04` | Code blocks are rendered with **highlight.js** (or the documented equivalent) using a fixed language-detection allow-list; raw `<code>` without highlighting is forbidden. | [`02-features/02-syntax-highlighting.md`](./02-features/02-syntax-highlighting.md) |
| `AT-DOCSVIEWERUI-05` | Fullscreen mode is reachable via a button AND the documented keyboard shortcut; `Esc` exits fullscreen. | [`02-features/03-fullscreen-mode.md`](./02-features/03-fullscreen-mode.md) |
| `AT-DOCSVIEWERUI-06` | Keyboard navigation between sections uses a single shortcut registry SSOT; shortcuts are never hardcoded inside components. | [`02-features/04-keyboard-navigation.md`](./02-features/04-keyboard-navigation.md) + [`02-features/08-shortcuts-overlay.md`](./02-features/08-shortcuts-overlay.md) |
| `AT-DOCSVIEWERUI-07` | "Copy markdown" copies the **raw markdown source** of the visible document, not the rendered DOM text. | [`02-features/05-copy-markdown.md`](./02-features/05-copy-markdown.md) |
| `AT-DOCSVIEWERUI-08` | UI animations honour `prefers-reduced-motion`; no animation runs longer than 300 ms on theme/page transitions. | [`02-features/06-ui-theme-animations.md`](./02-features/06-ui-theme-animations.md) |
| `AT-DOCSVIEWERUI-09` | A shortcuts-overlay panel lists every active shortcut with its current key combo, sourced from the same registry that wires the shortcuts. | [`02-features/08-shortcuts-overlay.md`](./02-features/08-shortcuts-overlay.md) |
| `AT-DOCSVIEWERUI-10` | The Visual Rendering Guide is the SSOT for how spec-specific blocks (callouts, badges, tables, diagrams) render in-viewer; no component invents its own block style. | [`02-features/07-visual-rendering-guide/00-overview.md`](./02-features/07-visual-rendering-guide/00-overview.md) + [`02-features/07-visual-rendering-guide/97-acceptance-criteria.md`](./02-features/07-visual-rendering-guide/97-acceptance-criteria.md) |

### Quality

| ID | Criterion | Source |
|----|-----------|--------|
| `AT-DOCSVIEWERUI-11` | All colors used by the viewer resolve to HSL semantic tokens defined in `src/index.css @theme`; raw hex/rgb in components is forbidden and caught by `scripts/spec-hygiene/16-check-tailwind-tokens.mjs`. | `mem://design/theme` + `mem://constraints/coding-guidelines` |
| `AT-DOCSVIEWERUI-12` | The viewer's consistency report (`99-consistency-report.md`) is regenerated whenever a feature file is added or its acceptance criteria change, and scores ≥95/100 before merge. | [`99-consistency-report.md`](./99-consistency-report.md) |

---

## Verification

```bash
# Inventory
grep -rn "AT-DOCSVIEWERUI-" spec/08-docs-viewer-ui/

# Hygiene
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`02-features/97-acceptance-criteria.md`](./02-features/97-acceptance-criteria.md) — Per-feature dispatch
- [`spec/07-design-system/`](../07-design-system/) — Theme + token SSOT
- [`spec/09-code-block-system/`](../09-code-block-system/) — Code-block rendering rules

---

*Populated 2026-04-26 (polish #3, A-26 wave-1) — replaces scaffold.*


---

## Fixtures

Fixtures for every AT row in this file are covered by the global P2g sweep — see [`../97a-acceptance-criteria-fixtures.md`](../97a-acceptance-criteria-fixtures.md) (apply the matching pattern by section).
