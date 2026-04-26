# Docs Viewer UI — Features — Acceptance Criteria (dispatch)

> **Version:** 1.0.0
> **Updated:** 2026-04-26 (UTC+8) — populated from scaffold (polish #3, A-26 wave-1). v0.1.0 was auto-generated stub.
> **Status:** Dispatch index — 8 per-feature ID ranges
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## Purpose

Acceptance criteria for individual features live in each feature file's own `## Acceptance Tests` section. This dispatch index maps the canonical `AT-DOCSVIEWERUI-NN` rollup IDs (in [`../97-acceptance-criteria.md`](../97-acceptance-criteria.md)) to their backing feature files, and reserves a per-feature inline prefix for fine-grained tests.

---

## Coverage Map

| # | Feature | Source File | Canonical (rollup) | Per-feature inline prefix |
|---|---------|-------------|--------------------|---------------------------|
| 1 | Typography | [`01-typography.md`](./01-typography.md) | `AT-DOCSVIEWERUI-02` | `AT-TYPOGRAPHY-NN` |
| 2 | Syntax highlighting | [`02-syntax-highlighting.md`](./02-syntax-highlighting.md) | `AT-DOCSVIEWERUI-04` | `AT-SYNTAXHL-NN` |
| 3 | Fullscreen mode | [`03-fullscreen-mode.md`](./03-fullscreen-mode.md) | `AT-DOCSVIEWERUI-05` | `AT-FULLSCREEN-NN` |
| 4 | Keyboard navigation | [`04-keyboard-navigation.md`](./04-keyboard-navigation.md) | `AT-DOCSVIEWERUI-06` | `AT-KBDNAV-NN` |
| 5 | Copy markdown | [`05-copy-markdown.md`](./05-copy-markdown.md) | `AT-DOCSVIEWERUI-07` | `AT-COPYMD-NN` |
| 6 | UI theme animations | [`06-ui-theme-animations.md`](./06-ui-theme-animations.md) | `AT-DOCSVIEWERUI-08` | `AT-UITHEMEANIM-NN` |
| 7 | Visual rendering guide | [`07-visual-rendering-guide/`](./07-visual-rendering-guide/00-overview.md) | `AT-DOCSVIEWERUI-10` | `AT-VISUALRENDER-NN` (see leaf [`97-acceptance-criteria.md`](./07-visual-rendering-guide/97-acceptance-criteria.md)) |
| 8 | Shortcuts overlay | [`08-shortcuts-overlay.md`](./08-shortcuts-overlay.md) | `AT-DOCSVIEWERUI-06`, `AT-DOCSVIEWERUI-09` | `AT-SHORTCUTSOVERLAY-NN` |

---

## How to add a new acceptance criterion

1. **Decide scope.** Is the criterion a viewer-wide invariant (e.g., "all colors are HSL tokens")? → add to canonical `AT-DOCSVIEWERUI-NN` in [`../97-acceptance-criteria.md`](../97-acceptance-criteria.md). Is it feature-local? → add to that feature's `## Acceptance Tests` section using its inline prefix.
2. **Never invent a parallel `AT-FEATURES-NN` namespace** — the canonical and per-feature inline prefixes are sufficient. (The legacy `AT-FEATURES-NN` IDs from the auto-generated stub are deprecated; do not reintroduce.)
3. **Update this dispatch index** if a new feature file is added, and bump this file's version.

---

## Criteria Summary

- [x] All 8 feature files referenced from this dispatch index exist on disk.
- [x] No criterion is duplicated between the canonical rollup and a per-feature inline prefix (each rule appears in exactly one normative location).
- [x] Per-feature inline prefixes are unique within this folder.

---

## Related

- [`../97-acceptance-criteria.md`](../97-acceptance-criteria.md) — Canonical rollup
- [`./07-visual-rendering-guide/97-acceptance-criteria.md`](./07-visual-rendering-guide/97-acceptance-criteria.md) — Curated leaf (already populated)

---

*Populated 2026-04-26 (polish #3, A-26 wave-1) — replaces scaffold.*
