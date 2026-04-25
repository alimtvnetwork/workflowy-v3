# Code Block System — Acceptance Criteria

> **Version:** 1.1.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 18 system criteria + 8 highlighter-pin criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

- `AT-CODEBLOCKSYSTEM-01` … `AT-CODEBLOCKSYSTEM-18` — system behaviour
- `AT-HLPIN-01` … `AT-HLPIN-08` — highlighter dependency pin (closes F-04)

---

## Criteria

### Architecture & pipeline (file 01)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-CODEBLOCKSYSTEM-01 | The pipeline MUST follow the documented order: `extractCodeBlocks → extractChecklistBlocks → extractInlineCodes → convertTables → convertInlineFormatting → convertLists → wrapParagraphs → restorePlaceholders`. Reordering steps is a Code-Red rendering bug because placeholder collisions become possible. | [`01-architecture.md`](./01-architecture.md) |
| AT-CODEBLOCKSYSTEM-02 | Each extractor MUST replace its match with a unique placeholder token (e.g., `␤CODEBLOCK_<id>␤`) that cannot occur in user content; reusing a token across extractors is forbidden. | [`01-architecture.md`](./01-architecture.md) |

### HTML structure (file 02)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-CODEBLOCKSYSTEM-03 | Code-block HTML MUST be `<pre><code class="hljs language-XX">…</code></pre>` with the language class derived from the fence info-string; missing the `language-XX` class breaks syntax highlighting and fails review. | [`02-html-structure.md`](./02-html-structure.md) |
| AT-CODEBLOCKSYSTEM-04 | All user-supplied code MUST be HTML-entity-escaped before insertion; passing raw user content into `dangerouslySetInnerHTML` without escaping is a Code-Red XSS bug. | [`02-html-structure.md`](./02-html-structure.md) |

### Syntax highlighting (file 03)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-CODEBLOCKSYSTEM-05 | Languages MUST be registered with highlight.js explicitly (NOT auto-loaded); a missing registration MUST fall back to plain-text rendering — silently throwing is forbidden. | [`03-syntax-highlighting.md`](./03-syntax-highlighting.md) |
| AT-CODEBLOCKSYSTEM-06 | Tree/folder fences (`” ```tree ”` or `” ```folder ”`) MUST bypass highlight.js and route to the tree-rendering path; double-processing them is a Code-Red rendering bug. | [`03-syntax-highlighting.md`](./03-syntax-highlighting.md), [`09-tree-structure-rendering.md`](./09-tree-structure-rendering.md) |

### Interactions (file 04)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-CODEBLOCKSYSTEM-07 | Copy/download/fullscreen/font-size buttons MUST be wired through `useCodeBlockEvents()`; per-component listeners are forbidden because they leak on unmount. | [`04-interactions.md`](./04-interactions.md) |
| AT-CODEBLOCKSYSTEM-08 | All keyboard shortcuts MUST be scoped to the focused code block (NOT global); a global `Cmd+C` hijack outside the block is a Code-Red UX bug. | [`04-interactions.md`](./04-interactions.md) |
| AT-CODEBLOCKSYSTEM-09 | Fullscreen mode MUST trap focus inside the modal AND restore focus to the trigger button on close; missing focus-trap is a Code-Red a11y bug. | [`04-interactions.md`](./04-interactions.md) |

### Styling (file 05)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-CODEBLOCKSYSTEM-10 | Code blocks MUST always render in a dark theme regardless of app theme; switching with the app theme is forbidden because it harms syntax-highlight contrast. | [`05-styling.md`](./05-styling.md) |
| AT-CODEBLOCKSYSTEM-11 | All colors MUST come from CSS custom properties (HSL); inline hex/rgb literals in CSS files fail review. | [`05-styling.md`](./05-styling.md), [`06-constants-and-maps.md`](./06-constants-and-maps.md) |

### Constants & maps (file 06)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-CODEBLOCKSYSTEM-12 | Language labels, accent colors, file extensions, and font-size presets MUST live in `06-constants-and-maps.md`-backed constant modules; inline literals in renderers/components fail review. | [`06-constants-and-maps.md`](./06-constants-and-maps.md) |
| AT-CODEBLOCKSYSTEM-13 | Adding a new language MUST require updating exactly three places: the highlight.js registration, the label map, and the accent-color map — drift between them is a Code-Red consistency bug. | [`06-constants-and-maps.md`](./06-constants-and-maps.md), [`03-syntax-highlighting.md`](./03-syntax-highlighting.md) |

### Clipboard (file 07)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-CODEBLOCKSYSTEM-14 | The clipboard helper MUST attempt the async Clipboard API first AND fall back to `execCommand('copy')` on failure; assuming Clipboard API is available is a Code-Red browser-compat bug. | [`07-clipboard.md`](./07-clipboard.md) |
| AT-CODEBLOCKSYSTEM-15 | Every copy operation MUST emit a toast (success OR failure); silent copies fail review because users can't tell if it worked. | [`07-clipboard.md`](./07-clipboard.md) |

### Checklist & tree blocks (files 08–09)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-CODEBLOCKSYSTEM-16 | Checklist blocks MUST extract `- [ ]` / `- [x]` runs into semantic checkbox elements with stable IDs so state can round-trip on re-render; treating them as plain text fails review. | [`08-checklist-blocks.md`](./08-checklist-blocks.md) |
| AT-CODEBLOCKSYSTEM-17 | Tree-structure rendering MUST use the documented Unicode set (`├── └── │`) AND MUST NOT corrupt them in copy operations (copy MUST preserve box-drawing characters). | [`09-tree-structure-rendering.md`](./09-tree-structure-rendering.md) |

### Selection bar (file 10)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-CODEBLOCKSYSTEM-18 | Line-pin / drag-select / keyboard-nav in the selection bar MUST be implemented as a single state machine (NOT three independent handlers); fragmented handlers are forbidden because they create unreachable states. | [`10-selection-bar.md`](./10-selection-bar.md) |

### Highlighter dependency pin (file 11) — closes F-04

| ID | Criterion | Source |
|----|-----------|--------|
| AT-HLPIN-01 | `highlight.js` MUST appear in `package.json` `dependencies`; absence fails review. | [`11-highlighter-dependency-pin.md`](./11-highlighter-dependency-pin.md) |
| AT-HLPIN-02 | Version range MUST start with `^11.`; no other major is permitted without a spec PR. | [`11-highlighter-dependency-pin.md`](./11-highlighter-dependency-pin.md) |
| AT-HLPIN-03 | Forbidden alternates (`shiki`, `prismjs`, `react-syntax-highlighter`, `@shikijs/core`) MUST be absent from dependencies; presence is a Code-Red bundle-bloat regression. | [`11-highlighter-dependency-pin.md`](./11-highlighter-dependency-pin.md) |
| AT-HLPIN-04 | No vendor `highlight.js/styles/*.css` import is allowed; project HSL tokens are the sole theme source. | [`11-highlighter-dependency-pin.md`](./11-highlighter-dependency-pin.md), [`05-styling.md`](./05-styling.md) |
| AT-HLPIN-05 | Code MUST import from `highlight.js/lib/core` (NOT the full bundle `highlight.js`); full-bundle imports inflate the build by ~5×. | [`11-highlighter-dependency-pin.md`](./11-highlighter-dependency-pin.md) |
| AT-HLPIN-06 | Exactly 11 `hljs.registerLanguage(...)` calls MUST exist (matching the frozen language set); drift is a Code-Red consistency bug per AT-CODEBLOCKSYSTEM-13. | [`11-highlighter-dependency-pin.md`](./11-highlighter-dependency-pin.md) |
| AT-HLPIN-07 | The release workflow MUST contain a "Verify highlighter bundle budget" step that fails when `dist/assets/highlighter-*.js` exceeds 100 KB minified. | [`11-highlighter-dependency-pin.md`](./11-highlighter-dependency-pin.md), [`../13-cicd-pipeline-workflows/18-wp-plugin-deploy/02-github-actions-workflow.md`](../13-cicd-pipeline-workflows/18-wp-plugin-deploy/02-github-actions-workflow.md) |
| AT-HLPIN-08 | No CDN-hosted highlight.js may be loaded (`cdn.jsdelivr`, `unpkg`, `cdnjs`); breaks offline use and CSP. | [`11-highlighter-dependency-pin.md`](./11-highlighter-dependency-pin.md) |

## Verification

```bash
# Highlight.js explicit registrations
rg -nP "hljs\.registerLanguage\(" src/ | wc -l

# Hex literal scan in code-block CSS
rg -nP "#[0-9a-fA-F]{3,8}\b" src/**/code-block*.css

# Hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../08-docs-viewer-ui/02-features/07-visual-rendering-guide/97-acceptance-criteria.md`](../08-docs-viewer-ui/02-features/07-visual-rendering-guide/97-acceptance-criteria.md) — Visual rendering rules
- [`../19-glossary.md`](../19-glossary.md) — Terminology SSOT

---

*Curated 2026-04-25 — closes batch-16 item 1. Replaces v1.0.0 scaffold.*
