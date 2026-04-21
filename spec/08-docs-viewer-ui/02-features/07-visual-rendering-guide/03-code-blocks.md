# Code Block Rendering

> **Version:** 3.2.0  
> **Updated:** 2026-04-19

---

## Anatomy of a Code Block

Every fenced code block is rendered as a `.code-block-wrapper` with this structure:

```
┌─────────────────────────────────────────────────────┐
│ HEADER                                              │
│ ┌──────────────┐  ┌─────────────────────────────┐   │
│ │ ● TypeScript │  │ 12 lines  A- A A+  📋 ⬇ ⛶  │   │
│ └──────────────┘  └─────────────────────────────┘   │
├─────────────────────────────────────────────────────┤
│ BODY                                                │
│ ┌────┬──────────────────────────────────────────┐   │
│ │  1 │ import { useState } from "react";        │   │
│ │  2 │                                          │   │
│ │  3 │ export function App() {                  │   │
│ │  4 │   const [count, setCount] = useState(0); │   │
│ └────┴──────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────┤
│ SELECTION BAR (hidden until lines are pinned)       │
│ Lines 3–7       [Copy selected] [✕]                 │
└─────────────────────────────────────────────────────┘
```

---

## Header Components

| Component | CSS Class | Description |
|-----------|-----------|-------------|
| Language badge | `.code-lang-badge` | Colored dot + uppercase label (e.g., "TYPESCRIPT") |
| Language dot | `.code-lang-dot` | 7px circle with glow, color from `--badge-color` |
| Line count | `.code-line-count` | Gray text, e.g., "12 lines" |
| Selection label | `.code-selection-label` | Shows "Lines 4–9" when lines are pinned |
| Font controls | `.code-font-controls` | Three buttons: A- (decrease), A (reset), A+ (increase) |
| Copy button | `.copy-code-btn` | Copies full code, shows ✓ check on success |
| Download button | `.download-code-btn` | Downloads as file with correct extension |
| Fullscreen button | `.fullscreen-code-btn` | Expands to fixed overlay (`inset: 2rem`, z-index 999) |

---

## Language Badge Colors

Each language gets a unique HSL accent stored in `--lang-accent`:

| Language | Badge Label | HSL Accent | Visual |
|----------|-------------|-----------|--------|
| TypeScript | `TYPESCRIPT` | `99 83% 62%` | 🟢 Green |
| JavaScript | `JAVASCRIPT` | `53 93% 54%` | 🟡 Yellow |
| Go | `GO` | `194 66% 55%` | 🔵 Cyan |
| PHP | `PHP` | `234 45% 60%` | 🟣 Indigo |
| CSS | `CSS` | `264 55% 58%` | 🟣 Purple |
| JSON | `JSON` | `38 92% 50%` | 🟠 Orange |
| Bash/Shell | `BASH` | `120 40% 55%` | 🟢 Olive |
| SQL | `SQL` | `200 70% 55%` | 🔵 Blue |
| Rust | `RUST` | `25 85% 55%` | 🟠 Burnt orange |
| HTML/XML | `HTML` | `12 80% 55%` | 🔴 Red-orange |
| YAML | `YAML` | `0 75% 55%` | 🔴 Red |
| Markdown | `MARKDOWN` | `252 85% 60%` | 🟣 Purple |
| Plain Text | `PLAIN TEXT` | `220 10% 50%` | ⚪ Gray (default) |

The accent color is used for:
1. Badge dot color + glow (`box-shadow: 0 0 6px`)
2. Badge text color
3. Hover glow on the entire block wrapper
4. Fullscreen box-shadow

---

## Code Block Background

The code block always uses a **fixed dark theme** regardless of light/dark mode:

```css
.code-block-wrapper {
  background: hsl(220, 14%, 11%);        /* Deep dark background */
  border: 1px solid hsl(220, 13%, 22%);  /* Subtle border */
  border-radius: 0.75rem;
  font-family: 'Ubuntu Mono', 'JetBrains Mono', ui-monospace, monospace;
}

.code-block-header {
  background: hsl(220, 14%, 14%);        /* Slightly lighter header */
  border-bottom: 1px solid hsl(220, 13%, 20%);
}

.code-line-numbers {
  background: hsl(220, 14%, 9%);         /* Darkest: line number gutter */
  border-right: 1px solid hsl(220, 13%, 18%);
}
```

---

## Syntax Highlighting Token Colors

Highlight.js `github-dark` theme is used, overridden with design system tokens:

| Token Type | CSS Selector | Color Token |
|------------|-------------|-------------|
| Keywords, types, built-ins | `.hljs-keyword`, `.hljs-type`, `.hljs-built_in` | `hsl(var(--primary))` — purple |
| Strings, attributes | `.hljs-string`, `.hljs-attr`, `.hljs-property` | `hsl(var(--accent))` — pink |
| Numbers, variables | `.hljs-number`, `.hljs-variable`, `.hljs-regexp` | `hsl(var(--warning))` — amber |
| Comments | `.hljs-comment`, `.hljs-quote` | `hsl(var(--muted-foreground))` italic |
| Functions, classes, tags | `.hljs-title`, `.hljs-section`, `.hljs-tag` | `hsl(var(--foreground) / 0.85)` |
| Default text | `code` | `hsl(var(--foreground))` |

---

## Font Size Controls

Code blocks support dynamic font sizing via CSS custom property:

```
Default: --code-font-size: 18px
Min: 12px | Max: 32px | Step: 2px
Line height: var(--code-line-height): 1.6
Line number height: calc(var(--code-font-size) * var(--code-line-height))
```

Font size and line height are synchronized between line numbers and code content to maintain perfect vertical alignment.

---

## Line Interaction States

| State | Trigger | Code Line Style | Line Number Style |
|-------|---------|-----------------|-------------------|
| Default | — | transparent background | `hsl(220 10% 35%)` text |
| Hover | Mouse over | `hsl(220 15% 16%)` background | Primary color text |
| Pinned | Click / Shift+Click | `hsl(var(--primary) / 0.12)` | Primary color + 2px left border |

---

## Hover Effect on Code Blocks

```css
.code-block-wrapper:hover {
  box-shadow: 0 8px 32px hsl(var(--lang-accent) / 0.1),
              0 0 0 1px hsl(var(--lang-accent) / 0.15);
  transform: translateY(-2px);
  transition: box-shadow 0.3s ease, transform 0.2s ease;
}
```

---

## Fullscreen Mode

```css
.code-block-wrapper.code-fullscreen {
  position: fixed !important;
  inset: 2rem;
  z-index: 999;
  border-radius: 1rem;
  max-height: calc(100vh - 4rem);
  box-shadow: 0 25px 80px hsl(var(--lang-accent) / 0.25),
              0 0 0 1px hsl(var(--lang-accent) / 0.3);
}

/* Overlay behind fullscreen block */
.code-fullscreen-overlay {
  position: fixed;
  inset: 0;
  background: hsl(0 0% 0% / 0.7);
  backdrop-filter: blur(4px);
  z-index: 998;
}
```

---

*Code blocks — v3.2.0 — 2026-04-19*
