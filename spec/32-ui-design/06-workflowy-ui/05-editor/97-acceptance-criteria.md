# Phase 5 — Editor Acceptance Criteria

> **Version:** 2.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 18 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-WFEDIT-01` … `AT-WFEDIT-18`

---

## Criteria

### Slash menu (file 01)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-WFEDIT-01 | The slash menu MUST open on `/` keypress at start-of-line OR after whitespace (NOT mid-word); mid-word `/` MUST insert a literal slash. | [`01-slash-menu.md`](./01-slash-menu.md) |
| AT-WFEDIT-02 | The menu order MUST match the documented visual reference (img-53) byte-for-byte; reordering items between releases is FORBIDDEN. | [`01-slash-menu.md`](./01-slash-menu.md) |
| AT-WFEDIT-03 | Typing after `/` MUST filter the list with case-insensitive substring match; the first match MUST be auto-highlighted; `Enter` MUST commit it. | [`01-slash-menu.md`](./01-slash-menu.md) |
| AT-WFEDIT-04 | `Esc` MUST close the menu AND restore the caret to its pre-slash position; `Backspace` past the `/` MUST also close the menu. | [`01-slash-menu.md`](./01-slash-menu.md) |

### Selection toolbar (file 02)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-WFEDIT-05 | The toolbar MUST appear within 100 ms of selection AND be positioned above the selection (or below if it would clip the viewport top); fixed positioning is a UX bug. | [`02-selection-toolbar.md`](./02-selection-toolbar.md) |
| AT-WFEDIT-06 | The toolbar MUST disappear on selection collapse (single click), Esc, OR scroll; persistent toolbars after collapse are a Code-Red UX bug. | [`02-selection-toolbar.md`](./02-selection-toolbar.md) |
| AT-WFEDIT-07 | Toolbar buttons MUST reflect the current format state (e.g. Bold pressed when selection is bold); unsynchronised state is a Code-Red consistency bug. | [`02-selection-toolbar.md`](./02-selection-toolbar.md) |

### Item types (file 03)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-WFEDIT-08 | All 12 item types MUST be enumerated with: glyph, name, conversion-from matrix, conversion-to matrix; missing any column fails review (per `mem://features/core-mechanics`). | [`03-item-types.md`](./03-item-types.md), [`mem://features/core-mechanics`](mem://features/core-mechanics) |
| AT-WFEDIT-09 | Headings H1–H5 MUST have a documented visual hierarchy (size, weight, top-margin); H6 is FORBIDDEN because it overlaps body text and breaks the hierarchy. | [`03-item-types.md`](./03-item-types.md) |
| AT-WFEDIT-10 | Type conversion MUST preserve content + children; conversions that drop children are a Code-Red data-loss bug. | [`03-item-types.md`](./03-item-types.md) |

### Color palettes (file 04)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-WFEDIT-11 | Exactly 11 text colors AND 11 highlight colors MUST be documented with hex values; counts deviating from 11 are a Code-Red spec bug. | [`04-color-palettes.md`](./04-color-palettes.md) |
| AT-WFEDIT-12 | Each color MUST have a light-mode hex AND a dark-mode hex (auto-mapped via design tokens); single-mode hex values are FORBIDDEN. | [`04-color-palettes.md`](./04-color-palettes.md), [`../../03-design-system/97-acceptance-criteria.md`](../../03-design-system/97-acceptance-criteria.md) |
| AT-WFEDIT-13 | Color combinations (text-on-highlight) MUST pass WCAG AA contrast in BOTH themes; failing combinations are a Code-Red accessibility bug. | [`04-color-palettes.md`](./04-color-palettes.md), [`../../05-quality/97-acceptance-criteria.md`](../../05-quality/97-acceptance-criteria.md) |

### Code & quote blocks (file 05)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-WFEDIT-14 | A Code Block created from N consecutive sibling text nodes MUST merge them into ONE node with N internal line-breaks; preserving siblings is FORBIDDEN because it breaks copy-paste. | [`05-code-quote-blocks.md`](./05-code-quote-blocks.md) |
| AT-WFEDIT-15 | Code blocks MUST use Geist Mono and a `pre`-style container with horizontal scroll on overflow; word-wrap inside code blocks is FORBIDDEN. | [`05-code-quote-blocks.md`](./05-code-quote-blocks.md), [`../../03-design-system/97-acceptance-criteria.md`](../../03-design-system/97-acceptance-criteria.md) |
| AT-WFEDIT-16 | Quote blocks MUST be visually distinguished by a left border + indented padding (NOT italic-only); italic-only quote blocks are forbidden because they collide with inline emphasis. | [`05-code-quote-blocks.md`](./05-code-quote-blocks.md) |

### Markdown shortcuts (file 06)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-WFEDIT-17 | The complete shortcut set MUST cover: `#`/`##`/…/`#####` (headings), `>` (quote), `[]` (todo), `` ` `` (inline code), ``` ``` ``` (code block), `1.`/`-` (lists), `---` (divider); any missing entry is a spec gap. | [`06-markdown-shortcuts.md`](./06-markdown-shortcuts.md) |
| AT-WFEDIT-18 | Shortcuts MUST trigger ONLY on `Space` after the trigger character at start-of-line (not mid-line, not without space); mid-line conversion is a Code-Red UX bug because users lose typed content. Conversion MUST be undoable with one `Cmd+Z`. | [`06-markdown-shortcuts.md`](./06-markdown-shortcuts.md) |

---

## Verification

```bash
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../../03-design-system/97-acceptance-criteria.md`](../../03-design-system/97-acceptance-criteria.md) — Token SSOT (palettes)
- [`../../04-editor/97-acceptance-criteria.md`](../../04-editor/97-acceptance-criteria.md) — Editor architecture
- [`../../05-quality/97-acceptance-criteria.md`](../../05-quality/97-acceptance-criteria.md) — A11y contrast
- [`mem://features/core-mechanics`](mem://features/core-mechanics) — 12 item-type SSOT

---

*Curated 2026-04-25 — closes batch-19 item 3. Replaces v1.0.0 checklist.*
