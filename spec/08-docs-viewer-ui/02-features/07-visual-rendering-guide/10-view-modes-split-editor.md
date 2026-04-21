# View Modes & Split-View Editor

> **Version:** 3.2.0  
> **Updated:** 2026-04-19

---

## View Modes

The docs viewer supports three view modes, toggled via toolbar or keyboard shortcuts:

| Mode | Shortcut | Description |
|------|----------|-------------|
| Preview | `P` | Read-only rendered markdown (default) |
| Edit | `E` | Full-width Monaco editor |
| Split | `S` | Side-by-side editor + live preview |

---

## Monaco Editor Configuration

The editor uses `@monaco-editor/react` with these settings:

```typescript
const EDITOR_OPTIONS = {
  fontSize: 14,
  fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
  lineNumbers: "on",
  minimap: { enabled: true, scale: 1 },
  wordWrap: "on",
  scrollBeyondLastLine: false,
  padding: { top: 16, bottom: 16 },
  smoothScrolling: true,
  cursorBlinking: "smooth",
  cursorSmoothCaretAnimation: "on",
  renderLineHighlight: "all",
  bracketPairColorization: { enabled: true },
  guides: { indentation: true, bracketPairs: true },
  scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
  renderWhitespace: "selection",
  tabSize: 2,
};
```

**Theme integration:** The editor theme follows the app theme — `"vs-dark"` in dark mode, `"vs"` in light mode.

**Container styling:**
```css
/* Editor wrapper */
border-radius: 0.5rem;      /* rounded-lg */
border: 1px solid hsl(var(--border));
background: hsl(var(--card));
overflow: hidden;
```

---

## Split View Layout

```
┌──────────────────────────────────────────────────────┐
│ HEADER: breadcrumb + [P] [E] [S] + toolbar           │
├──────────────────────────────────────────────────────┤
│ PROGRESS BAR (gradient: primary → accent)             │
├──────────────────┬───┬───────────────────────────────┤
│                  │   │                               │
│  Monaco Editor   │ ║ │   Live Markdown Preview       │
│  (markdown)      │ ║ │   (MarkdownRenderer)          │
│                  │ ║ │                               │
│   width: {R}%    │DIV│   width: {100-R}%             │
│                  │ ║ │                               │
│                  │ ║ │   + TOC (in preview-only mode) │
│                  │   │                               │
├──────────────────┴───┴───────────────────────────────┤
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## Draggable Divider

The divider between editor and preview panels is a drag handle that resizes both panes:

**HTML structure:**
```html
<div class="split-divider" onMouseDown={handleDividerMouseDown} />
```

**Behavior:**
1. `mousedown` on divider → sets `isDragging = true`, cursor to `col-resize`, disables text selection
2. `mousemove` → calculates ratio: `((clientX - containerLeft) / containerWidth) * 100`
3. `mouseup` → resets dragging state, restores cursor and selection
4. Ratio is clamped to **20%–80%** to prevent either pane from collapsing

**Constants:**
```typescript
const SPLIT_MIN_RATIO = 20;  // Minimum editor width %
const SPLIT_MAX_RATIO = 80;  // Maximum editor width %
```

**Default split:** `50%` (centered)

**Divider CSS:**
```css
.split-divider {
  width: 6px;
  cursor: col-resize;
  background: hsl(var(--border));
  position: relative;
  flex-shrink: 0;
  transition: background 0.2s ease;
  z-index: 10;
}

/* Center grip indicator */
.split-divider::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 2px;
  height: 32px;
  border-radius: 1px;
  background: hsl(var(--muted-foreground) / 0.4);
  transition: background 0.2s ease, height 0.2s ease;
}

/* Hover: highlight + extend grip */
.split-divider:hover {
  background: hsl(var(--primary) / 0.2);
}
.split-divider:hover::after {
  background: hsl(var(--primary) / 0.6);
  height: 48px;  /* Grows from 32px to 48px */
}
```

---

## Live Preview Behavior

In split mode, the preview pane renders in real-time as the user types:

- Editor content state (`editContent`) is shared between both panes
- Every keystroke re-renders the `MarkdownRenderer` component
- The preview uses the same `prose-spec` styling as the full preview mode
- Fullscreen scaling (`prose-fullscreen`) applies to the preview pane in split mode
- **No TOC sidebar** in split mode (space constraint) — TOC only appears in preview-only mode

---

## Edit Mode

Full-width Monaco editor with no preview:

```
┌──────────────────────────────────────────────────────┐
│ HEADER                                               │
├──────────────────────────────────────────────────────┤
│                                                      │
│               Monaco Editor                          │
│               (full width, full height)              │
│               padding: 1rem (p-4)                    │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## Reading Progress Bar

A gradient progress bar sits between the header and content area:

```css
/* Container */
height: 4px;          /* h-1 */
background: hsl(var(--muted) / 0.3);

/* Fill bar */
background: linear-gradient(90deg,
  hsl(var(--primary)),    /* Purple start */
  hsl(var(--accent))      /* Pink end */
);
border-radius: 0 9999px 9999px 0;  /* rounded-r-full */
transition: width 150ms ease-out;
```

Progress is calculated from scroll position: `scrollTop / (scrollHeight - clientHeight)`.

---

*View modes & split editor — v3.2.0 — 2026-04-19*
