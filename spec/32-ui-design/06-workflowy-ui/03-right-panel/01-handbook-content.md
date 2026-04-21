# Handbook Content Structure

> **Parent:** [`00-overview.md`](./00-overview.md)

---

## Panel Layout

```
┌─────────────────────────────────────┐
│  [Handbook] [Hotkeys]     [⚙️] [✕] │  ← Tabs + Settings + Close
├─────────────────────────────────────┤
│  🔍 Search handbook...              │  ← Sticky search field
├─────────────────────────────────────┤
│  ▼ Getting Started                  │  ← Collapsible section
│    ○ Welcome to WorkFlowy             │
│    ○ Your first node                  │
│    ○ Nesting & hierarchy              │
│                                     │
│  ▶ Keyboard Shortcuts                 │  ← Collapsed section
│  ▶ Advanced Features                  │
│  ▶ WorkFlowy Pro                      │
│                                     │
│  ─────────────────────────────────  │
│  📰 What's New                        │  ← Section at bottom
│  ─────────────────────────────────  │
└─────────────────────────────────────┘
```

---

## Section Inventory (Default Collapse State)

| Section | Default State | Entries (count) |
|---------|---------------|-----------------|
| Getting Started | ▼ Expanded | 3 |
| Keyboard Shortcuts | ▶ Collapsed | 5 (high-level, not the full table) |
| Advanced Features | ▶ Collapsed | 4 |
| WorkFlowy Pro | ▶ Collapsed | 2 |
| What's New | ▶ Collapsed | chronological list |

---

## Entry Template

Each handbook entry follows a rigid template for consistency:

### Structure

```
[Entry Title — H4 style, bold]
[⚡ icon + keyboard shortcut chips, if applicable]
[Screenshot slot — 16:9 aspect, rounded corners, shadow]
[Body paragraph — max 3 lines, 14px, 1.5 line-height]
[Grey slash callout — syntax reminder or pro tip]
```

### Example Entry

> **Nesting & Moving Nodes**  
> ⌘⇧→ to indent · ⌘⇧← to outdent · ⌘⇧↑ to move up · ⌘⇧↓ to move down  
> [screenshot: drag-drop-nesting.png]  
> Use indentation to create parent-child relationships. Drag the bullet handle (⋮⋮) to reposition.  
> `/ Pro tip: Hold ⌥ while dragging to create a mirror instead of a move.`

---

## Search Field Behavior

| Input | Behavior |
|-------|----------|
| Empty | Show all sections with current collapse state preserved. |
| 1–2 chars | No-op (debounced, wait for 3rd char). |
| ≥3 chars | Expand ALL sections, highlight matching entries, scroll first match into view. |
| No matches | Show empty state: "No results for 'xyz'. Try: zoom, search, mirror" with suggested terms as tappable chips. |
| Clear (✕) | Collapse back to default state. |

**Fuzzy match scope:** Entry title (heavier weight) + body paragraph text (lighter weight).

---

## Language Picker

- Location: Top-right, next to close button (gear icon dropdown).
- Current: **English** (only option, disabled state).
- Future: i18n expansion — Spanish, French, German, Japanese (post-v1).
- Visual: Dropdown chevron, greyed until multiple options available.

---

## Content Source

All Handbook content is **static Markdown** shipped with the app bundle:

```
spec/32-ui-design/06-workflowy-ui/03-right-panel/handbook-content/
├── en/
│   ├── 01-getting-started/
│   │   ├── 01-welcome.md
│   │   ├── 02-first-node.md
│   │   └── 03-nesting.md
│   ├── 02-keyboard-shortcuts/
│   ├── 03-advanced-features/
│   └── 04-pro/
└── es/ (future)
```

Runtime-agnostic: no API calls, no WordPress backend, fully offline-capable.
