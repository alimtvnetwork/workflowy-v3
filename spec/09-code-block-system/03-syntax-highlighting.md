# Syntax Highlighting — Code Block System

> **Version:** 3.2.0
> **Updated:** 2026-04-25 (UTC+8)
> **Dependency SSOT:** [`11-highlighter-dependency-pin.md`](./11-highlighter-dependency-pin.md) — pins library, version, import paths, theme strategy, and bundle budget. This file describes the **resolution flow + token map only**; for "what to install / what to import / what theme to use", consult the pin file.

---

## Library

- **highlight.js** — pinned at `^11.10.0` core import (see [`11-highlighter-dependency-pin.md`](./11-highlighter-dependency-pin.md))
(gate **G-32-NO-SECOND-STYLING-SYSTEM**) - Theme: **project HSL tokens only** — vendor stylesheets (`highlight.js/styles/*.css`) are FORBIDDEN per the dependency pin. The token-color map below documents which CSS variable each `.hljs-*` class MUST resolve to.

---

## Registered Languages

Languages are registered individually for bundle efficiency:

| Registration Name(s) | highlight.js Module | Notes |
|-----------------------|---------------------|-------|
| `typescript`, `ts`, `tsx`, `javascript`, `js` | `typescript` | JS uses TS grammar (superset) |
| `go`, `golang` | `go` | |
| `php` | `php` | |
| `css` | `css` | |
| `json` | `json` | |
| `bash`, `sh`, `shell` | `bash` | |
| `sql` | `sql` | |
| `rust` | `rust` | |
| `html`, `xml` | `xml` | HTML uses XML grammar |
| `yaml`, `yml` | `yaml` | |
| `markdown`, `md` | `markdown` | |

---

## Language Resolution Flow

```
Input: (code, lang) from markdown fence

1. normalizeLang(lang)
   - Trim, lowercase
   - Check against known groups: TS, JS, Go, all supported, plaintext
   - Return normalized or empty string

2. resolveDisplayLang(code, lang)
   - If no lang AND code looks like tree → return "tree"
   - Otherwise return normalized lang

3. highlightCode(code, lang)
   - If no lang AND tree-like → highlightAsTree()
   - If lang is registered → hljs.highlight(code, { language })
   - Otherwise → hljs.highlightAuto(code)
     - If auto returns plaintext AND tree-like → highlightAsTree()
   - All paths have try/catch → fallback to escapeHtml()
```

---

## Tree Structure Detection

A code block is detected as a "tree" (folder/file structure) when ANY of these match:

| Pattern | Regex | Example |
|---------|-------|---------|
| Box-drawing characters | `/[├└│─]/` | `├── src/` |
| Directory line | `/^\s*[A-Za-z0-9{}._-]+\/$/m` | `components/` |
| File line | `/^\s*[A-Za-z0-9{}._-]+\.[A-Za-z0-9_-]+\s*$/m` | `index.ts` |

---

## Tree Rendering

Each line is processed individually by `highlightTreeLine()`:

1. **Split comments**: anything after `#` is extracted as a comment
2. **Escape HTML** on the content portion
3. **Apply spans** in order:
   - Box-drawing chars → `<span class="tree-guide">` (50% opacity muted)
   - Ellipsis `...` → `<span class="tree-ellipsis">` (accent/pink color)
   - Directory names (ending `/`) → `<span class="tree-dir">📁 {name}</span>` (bold white)
   - File names (with extension) → `<span class="tree-file">📄 {name}</span>` (85% opacity)
4. **Comment** (if present) → `<span class="tree-comment">` (italic muted)

---

## HTML Escaping

`escapeHtml()` converts: `&` → `&amp;`, `<` → `&lt;`, `>` → `&gt;`

Used for:
- Raw code before tree highlighting
- Data attributes (`data-code`) for copy/download
- Checklist markdown encoding

---

## Syntax Token Colors

(gate **G-32-NO-SECOND-STYLING-SYSTEM**) All `.hljs-*` and `.tree-*` token colors are mapped to project HSL CSS variables. The **complete CSS ruleset is the single responsibility of [`05-styling.md`](./05-styling.md)** — that file is the SSOT for selectors, exact variables, opacities, and font-style. This file only documents that colors MUST come from project tokens (never vendor stylesheets — see [`11-highlighter-dependency-pin.md`](./11-highlighter-dependency-pin.md)).

---

*Syntax Highlighting — v3.2.0 — updated 2026-04-25 (UTC+8) — token map consolidated into `05-styling.md`.*
