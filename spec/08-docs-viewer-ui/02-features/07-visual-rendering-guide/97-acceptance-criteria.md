# Visual Rendering Guide — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 18 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-VISUALRENDERINGGUIDE-01` … `AT-VISUALRENDERINGGUIDE-18`

---

## Criteria

### Gallery & global rules (file 01)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-VISUALRENDERINGGUIDE-01 | Every screenshot in the gallery MUST exist in BOTH light and dark variants under `public/images/guide/`; missing either variant fails review. | [`01-visual-gallery.md`](./01-visual-gallery.md), [`00-overview.md`](./00-overview.md) |
| AT-VISUALRENDERINGGUIDE-02 | All colors in rendered components MUST come from CSS custom properties (HSL); inline hex/rgb literals in component files are a Code-Red design-system bug. | [`00-overview.md`](./00-overview.md) |

### Tree, code, headings (files 02–04)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-VISUALRENDERINGGUIDE-03 | Folder/tree blocks MUST be auto-detected from a fenced code block tagged `tree` OR `folder`; manual class-based opt-in is forbidden because authors will forget. | [`02-tree-rendering.md`](./02-tree-rendering.md) |
| AT-VISUALRENDERINGGUIDE-04 | Code blocks MUST always render in a dark theme regardless of the app theme; switching code-block theme with the app theme is forbidden because it harms syntax-highlight contrast. | [`03-code-blocks.md`](./03-code-blocks.md), [`00-overview.md`](./00-overview.md) |
| AT-VISUALRENDERINGGUIDE-05 | Each code block MUST display a language badge derived from the fence info-string (`” ```ts ”` → `TS`); missing badge fails review. | [`03-code-blocks.md`](./03-code-blocks.md) |
| AT-VISUALRENDERINGGUIDE-06 | Heading animations MUST honour `prefers-reduced-motion: reduce` and disable transforms/opacity transitions; ignoring the media query is a Code-Red accessibility bug. | [`04-heading-animations.md`](./04-heading-animations.md) |

### Inline & block elements (files 05–07)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-VISUALRENDERINGGUIDE-07 | External links MUST render with an outbound icon AND `rel="noopener noreferrer"`; missing `rel` is a Code-Red security bug (tab-nabbing). | [`05-inline-elements.md`](./05-inline-elements.md) |
| AT-VISUALRENDERINGGUIDE-08 | Tables MUST be horizontally scrollable on viewports < 768 px (NOT clipped, NOT wrapped); clipped tables fail review. | [`06-paragraphs-tables-lists.md`](./06-paragraphs-tables-lists.md) |
| AT-VISUALRENDERINGGUIDE-09 | Checklists MUST render `- [ ]` / `- [x]` as semantic checkboxes (read-only in preview, interactive in edit mode); plain-text rendering fails review. | [`07-blockquotes-checklists.md`](./07-blockquotes-checklists.md) |

### TOC & misc (files 08–09)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-VISUALRENDERINGGUIDE-10 | TOC MUST use `IntersectionObserver` (NOT scroll-event throttling) to highlight the active heading; scroll-event polling is forbidden because of perf cost. | [`08-toc-scroll-spy.md`](./08-toc-scroll-spy.md) |
| AT-VISUALRENDERINGGUIDE-11 | TOC MUST be sticky on viewports ≥ 1024 px and collapse to a top-bar dropdown below that breakpoint. | [`08-toc-scroll-spy.md`](./08-toc-scroll-spy.md) |
| AT-VISUALRENDERINGGUIDE-12 | Animation timing MUST come from a shared timing-tokens module (`--motion-fast: 120ms`, etc.); inline `transition: 230ms` literals fail review. | [`09-misc-elements.md`](./09-misc-elements.md) |

### View modes & landing (files 10–11)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-VISUALRENDERINGGUIDE-13 | View modes MUST be one of `preview / edit / split`; adding a new mode requires updating the typed enum + this AT — string-only modes are forbidden. | [`10-view-modes-split-editor.md`](./10-view-modes-split-editor.md) |
| AT-VISUALRENDERINGGUIDE-14 | Split-view editor MUST sync scroll position between panes within 16 ms (one frame); scroll desync > 1 frame fails review. | [`10-view-modes-split-editor.md`](./10-view-modes-split-editor.md) |
| AT-VISUALRENDERINGGUIDE-15 | Welcome/landing page MUST be reachable via a deep-link (`/welcome`) AND MUST be the default view when no document is open; missing either path fails review. | [`11-welcome-and-landing.md`](./11-welcome-and-landing.md) |

### Sidebar & search (file 12)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-VISUALRENDERINGGUIDE-16 | Sidebar tree MUST persist expand/collapse state per-user across reloads (via `localStorage` keyed by user-id-hash); resetting state on reload fails review. | [`12-sidebar-and-search.md`](./12-sidebar-and-search.md) |
| AT-VISUALRENDERINGGUIDE-17 | Sidebar search MUST filter as-you-type with ≤ 100 ms keystroke→render latency on a 1k-node tree; slower filtering fails the perf budget. | [`12-sidebar-and-search.md`](./12-sidebar-and-search.md) |

### Implementation checklist (file 13)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-VISUALRENDERINGGUIDE-18 | Every new visual feature MUST tick all checklist items in `13-checklist-and-references.md` (component, story, screenshot light, screenshot dark, AT updated); merging without all five fails review. | [`13-checklist-and-references.md`](./13-checklist-and-references.md) |

---

## Verification

```bash
# Hex-color literals in components
rg -nP '#[0-9a-fA-F]{3,8}\b' src/components/ | grep -v '\.test\.'

# Light/dark screenshot pairing
diff <(ls public/images/guide/*-light.png | sed 's/-light//') \
     <(ls public/images/guide/*-dark.png  | sed 's/-dark//')

# Hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../00-overview.md`](../00-overview.md) — Docs viewer features index
- [`../../../32-ui-design/03-design-system/97-acceptance-criteria.md`](../../../32-ui-design/03-design-system/97-acceptance-criteria.md) — Design-system tokens

---

*Curated 2026-04-25 — closes batch-15 item 5. Replaces v0.1.0 stub.*
