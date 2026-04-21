# Folder / Tree Structure Rendering

> **Version:** 3.2.0  
> **Updated:** 2026-04-19

---

## Detection Logic

Code blocks are auto-detected as "tree" structures when the content matches ANY of:

```typescript
// Pattern 1: Unicode box-drawing characters
/[├└│─]/

// Pattern 2: Lines ending with "/" (directories)
/^\s*[A-Za-z0-9{}._-]+\/$/m

// Pattern 3: Lines with file extensions
/^\s*[A-Za-z0-9{}._-]+\.[A-Za-z0-9_-]+\s*$/m
```

Explicit ` ```tree ` or ` ```structure ` fence labels also trigger tree mode.

---

## Tree Line Rendering Rules

Each line is processed through `highlightTreeLine()`:

| Pattern | Replacement | CSS Class | Visual |
|---------|-------------|-----------|--------|
| Box-drawing chars (`├ └ │ ─`) | Wrapped in `<span>` | `.tree-guide` | Muted at 50% opacity: `hsl(var(--muted-foreground) / 0.5)` |
| `...` (ellipsis) | Wrapped in `<span>` | `.tree-ellipsis` | Accent pink: `hsl(var(--accent))` |
| `name/` (directory) | Prefixed with 📁 emoji | `.tree-dir` | Bold white: `hsl(var(--foreground))`, `font-weight: 600` |
| `name.ext` (file) | Prefixed with 📄 emoji | `.tree-file` | Slightly muted: `hsl(var(--foreground) / 0.85)` |
| `# comment` | Extracted and wrapped separately | `.tree-comment` | Italic, muted: `hsl(var(--muted-foreground))` |

---

## Example Input → Output

**Markdown input:**
````markdown
```
src/
├── components/
│   ├── App.tsx
│   ├── Header.tsx
│   └── ...
├── utils/
│   └── helpers.ts    # Utility functions
└── index.ts
```
````

**Rendered visual (dark mode):**
- `src/` → 📁 **src/** (white, bold)
- `├──` → dim gray connection lines (50% opacity)
- `components/` → 📁 **components/** (white, bold)
- `App.tsx` → 📄 App.tsx (85% white)
- `...` → pink ellipsis (accent color)
- `# Utility functions` → *italic gray comment*

---

## Tree Color Token Map

| Element | CSS Property | Token | Light Mode | Dark Mode |
|---------|-------------|-------|------------|-----------|
| Guides | `color` | `--muted-foreground / 0.5` | `hsl(220 10% 46% / 0.5)` | `hsl(220 10% 60% / 0.5)` |
| Directories | `color` | `--foreground` | `hsl(230 25% 15%)` | `hsl(220 20% 92%)` |
| Files | `color` | `--foreground / 0.85` | `hsl(230 25% 15% / 0.85)` | `hsl(220 20% 92% / 0.85)` |
| Ellipsis | `color` | `--accent` | `hsl(330 85% 60%)` | `hsl(330 85% 65%)` |
| Comments | `color` | `--muted-foreground` | `hsl(220 10% 46%)` | `hsl(220 10% 60%)` |

---

## Key Design Decision

Tree blocks use a **neutral/white color scheme**, deliberately avoiding red/pink syntax highlighting colors that conflict with the directory/file readability.

---

*Tree rendering — v3.2.0 — 2026-04-19*
