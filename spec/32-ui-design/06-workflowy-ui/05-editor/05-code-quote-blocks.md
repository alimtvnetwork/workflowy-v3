# Code & Quote Blocks

> **Parent:** [`00-overview.md`](./00-overview.md)
> **Screenshots:** img-56, 67

---

## Code Block

### Visual

```
┌──────────────────────────────────┐
│ [lang ▾]                    [⎘]  │  ← Header (top-right copy + lang dropdown)
│                                  │
│  const x = 42;                   │  ← Monospace, syntax-highlighted
│  console.log(x);                 │
│  if (x > 0) doThing();           │
│                                  │
└──────────────────────────────────┘
```

### Spec

| Property | Value |
|----------|-------|
| Font | Geist Mono (Phase 8) |
| Font size | 13px |
| Line height | 1.6 |
| Background | `--muted` |
| Padding | 12px |
| Border radius | 6px |
| Border | 1px `--border` |
| Max width | content width (no horizontal expansion) |
| Overflow | Horizontal scroll, no wrap |
| Tab character | 2 spaces (visual; storage = `\t`) |

### Internal Newlines

A code block is **a SINGLE node** with internal `\n` characters in its content. `Enter` inside a code block creates a newline, NOT a new sibling node.

| Key | Behavior |
|-----|----------|
| Enter | Insert `\n` |
| Shift+Enter | Same as Enter |
| Tab | Insert 2 spaces |
| Shift+Tab | Outdent (remove leading 2 spaces from current line) |
| ⌘↵ | Exit code block (creates new sibling bullet below) |

### Language Dropdown

Top-right corner, 11 options:
`none`, `js`, `ts`, `jsx`, `tsx`, `py`, `sh`, `json`, `md`, `html`, `css`

Selecting a language enables syntax highlighting (Phase 8 implementation detail; spec just declares the option set).

### Copy Button

Top-right ⎘ button copies entire code block content to clipboard. Toast: "Code copied".

---

## Forward Conversion: N Siblings → ONE Code Block

**LOCKED RULE:** When user selects N sibling bullets and converts to Code Block:
1. The N bullets merge into **ONE** new code-block node.
2. Each bullet's content becomes one line, separated by `\n`.
3. Children of the original bullets are **discarded** with confirmation:
   > "Converting N items to a code block will remove their child items. Continue?"
4. Cursor placed at end of new code block.

### Example

Before (3 siblings):
```
• const x = 42;
• console.log(x);
• if (x > 0) doThing();
```

After (1 code block node):
```
[CODE BLOCK]
const x = 42;
console.log(x);
if (x > 0) doThing();
```

---

## Reverse Conversion: Code Block → N Bullets

When user converts a code block back to bullets:
1. Split content on `\n`.
2. Create N sibling bullets, one per line.
3. Empty lines become empty bullets ("Untitled").
4. No confirmation needed (lossless).

---

## Quote Block

### Visual

```
┃  This is a quoted line.
┃  Spans multiple lines if needed.
┃  Children indent normally below.
```

### Spec

| Property | Value |
|----------|-------|
| Left border | 4px solid `--accent` |
| Padding-left | 16px (after border) |
| Font style | Italic |
| Color | `--muted-foreground` |
| Background | None (transparent) |
| Children | Allowed; render normally below quote text |

### Behavior

| Key | Behavior |
|-----|----------|
| Enter | Creates new sibling **bullet** (exits quote unless inside selection) |
| Shift+Enter | Soft line break within quote |
| Tab | Indents (creates child) |

Unlike Code Block, Quote Block uses standard sibling/child structure — only the visual treatment differs.

### Markdown Trigger

Type `> ` at start of empty bullet → converts to Quote Block (see `06-markdown-shortcuts.md`).

---

## Differences Summary

| Aspect | Code Block | Quote Block |
|--------|-----------|-------------|
| Storage | 1 node, internal `\n` | Standard tree with children |
| Font | Monospace | Inherit (italic) |
| Background | `--muted` | None |
| Border | Full 1px box | Left bar only |
| Enter behavior | `\n` inside | New sibling bullet |
| Children | None | Yes |
| Sibling-merge on conversion | YES (N → 1) | NO (1:1) |
