# Item Types

> **Parent:** [`00-overview.md`](./00-overview.md)
> **Screenshots:** img-56, 64, 67

---

## The 12 Item Types

| # | Type | itemType value | Visual Cue | Children Allowed |
|---|------|----------------|-----------|------------------|
| 1 | Bullet | `bullet` | • dot (default) | ✅ |
| 2 | To-do | `todo` | ☐ checkbox (toggle ☑) | ✅ |
| 3 | Heading (H1–H5) | `h1` … `h5` | Larger, bolder text; no dot | ✅ |
| 4 | Paragraph | `paragraph` | No dot, indented prose | ✅ |
| 5 | Board | `board` | Renders children as Kanban columns | ✅ (cards) |
| 6 | Quote | `quote` | Left border bar, italic, indented | ✅ |
| 7 | Code Block | `code` | Monospace font, grey bg, scroll | ❌ (single node, internal newlines) |
| 8 | Divider | `divider` | Horizontal rule, no content | ❌ |
| 9 | Numbered List | `numbered` | Children show 1. 2. 3. prefixes | ✅ (auto-numbered) |
| 10 | Shortcut | `shortcut` | → arrow icon, links to another node | ❌ |
| 11 | Mirror | `mirror` | ⇄ icon, dashed dot ring | ✅ (synced to source) |
| 12 | Template | `template` | 📋 icon, expand inserts subtree | ❌ (insert action only) |

> **Note:** "Heading" counts as ONE type with 5 sub-levels (`h1`–`h5`) for data model purposes; UI shows them as 5 separate slash menu entries.

---

## Item Type → Lucide Icon Map

Canonical icon mapping for all 12 item types. Used by:

- Slash menu (Phase 5 [`01-slash-menu.md`](./01-slash-menu.md))
- "Convert to" submenu in bullet ⋯ menu (Phase 4 [`02-three-dot-menu.md`](../04-bullet/02-three-dot-menu.md))
- Search Popover `is:` value picker (Phase 2 [`12-icon-map.md`](../02-search/12-icon-map.md) § 5)

Icons are from `lucide-react`. Stroke width 1.75. Size 16px (menus) or 14px (suggestion chips). Inherit `currentColor`.

| # | Item type | `is:` value | Lucide component | Notes |
|---|-----------|-------------|------------------|-------|
| 1 | Bullet | `bullet` | `Circle` (filled at 6px) | Default; the dot itself, not an icon button |
| 2 | To-do | `todo` | `Square` / `CheckSquare` | `CheckSquare` when complete |
| 3 | Heading H1 | `h1` | `Heading1` | — |
| 3 | Heading H2 | `h2` | `Heading2` | — |
| 3 | Heading H3 | `h3` | `Heading3` | — |
| 3 | Heading H4 | `h4` | `Heading4` | — |
| 3 | Heading H5 | `h5` | `Heading5` | — |
| 4 | Paragraph | `paragraph` | `Pilcrow` | ¶ symbol |
| 5 | Board | `board` | `LayoutGrid` | Kanban-like grid |
| 6 | Quote | `quote` | `Quote` | — |
| 7 | Code Block | `code` | `Code2` | Prefer `Code2` over `Code` |
| 8 | Divider | `divider` | `Minus` | Horizontal line |
| 9 | Numbered List | `numbered` | `ListOrdered` | — |
| 10 | Shortcut | `shortcut` | `ArrowRightFromLine` | One-way pointer |
| 11 | Mirror | `mirror` | `Repeat2` | Two-way sync indicator |
| 12 | Template | `template` | `LayoutTemplate` | — |

Additional related icons (used in bullet rows, not item types proper):

| Role | Lucide component | Used by |
|------|------------------|---------|
| Comment affordance (empty) | `MessagePlus` | Phase 4 [`04-comment-icon.md`](../04-bullet/04-comment-icon.md) |
| Comment affordance (has thread) | `MessageCircle` | Phase 4 [`04-comment-icon.md`](../04-bullet/04-comment-icon.md) |
| Row ⋯ menu trigger | `MoreVertical` | Phase 4 [`02-three-dot-menu.md`](../04-bullet/02-three-dot-menu.md) |
| Drag handle | `GripVertical` | Phase 4 [`01-anatomy.md`](../04-bullet/01-anatomy.md) |
| Expand/collapse | `ChevronRight` / `ChevronDown` | Phase 4 [`01-anatomy.md`](../04-bullet/01-anatomy.md) |

> **Implementation rule:** No emoji glyphs in production JSX. Emojis in spec docs are illustrative only (matches Phase 2 [`12-icon-map.md`](../02-search/12-icon-map.md) § 9).



## Headings (H1–H5)

Visual hierarchy:

| Level | Font Size | Weight | Line Height |
|-------|-----------|--------|-------------|
| H1 | 32px | 700 | 1.2 |
| H2 | 24px | 700 | 1.25 |
| H3 | 20px | 600 | 1.3 |
| H4 | 17px | 600 | 1.4 |
| H5 | 15px | 600 | 1.5 |

- All headings inherit `--foreground` color unless user-applied.
- No bullet dot; row indentation preserved.
- Focused-root node renders as H1 regardless of stored type (Phase 1 navbar spec).

---

## Conversion Matrix

Convert via per-row ⋯ menu → "Convert to" or via slash menu re-application.

| From → To | Notes |
|-----------|-------|
| Bullet → To-do | Adds `complete: false` field |
| To-do → Bullet | Drops `complete` field |
| Bullet → Heading | Strips inline formatting if heading enforces plain |
| Bullet → Code Block | If has children: **siblings merge into ONE code node with internal newlines** (see `05-code-quote-blocks.md`) |
| Code Block → Bullet | Splits internal newlines into N sibling bullets |
| Bullet → Board | Children re-render as columns; columns' children = cards |
| Board → Bullet | Columns become children, cards become grandchildren |
| Anything → Divider | ⚠️ Confirmation required (content discarded) |
| Divider → Anything | Inserts placeholder "Untitled" content |
| Anything → Mirror | Cannot convert; mirror is a creation action only |

---

## Type-Specific Behaviors

### To-do
- Click dot toggles complete state.
- Completed: strikethrough text, dot becomes ☑, `--muted-foreground` color.
- "Hide completed" view setting filters them.

### Board
- Children render as horizontal columns (min-width 280px each).
- Drag cards between columns.
- Add column = + button at right edge.

### Code Block
- Monospace font (Geist Mono, see Phase 8).
- Background `--muted`, padding 12px, 6px radius.
- Optional language indicator (top-right dropdown): `none`, `js`, `ts`, `py`, `sh`, `json`, `md`, `html`, `css`.
- Internal newlines preserved (Enter key creates `\n`, not new node).

### Divider
- Renders `<hr>` with `--border` color.
- Cannot be focused/zoomed.
- Has dot for selection but no content slot.

### Numbered List
- Parent itemType = `numbered`; children render with auto-numbers.
- Re-numbers on add/remove/reorder.
- Nested numbered = a.b.c style (max 3 levels).

### Shortcut
- itemType = `shortcut`, stores `targetId`.
- Click navigates (zooms) to target.
- Distinct from Mirror: shortcut is one-way pointer, mirror is bidirectional sync.

### Mirror
- Created via `⌘⇧M` or paste-as-mirror (⌘⇧V).
- Edits to ANY mirror instance propagate to all.
- Visual: dashed ring around dot, `--accent` color.

### Template
- Stored serialized subtree.
- "Use template" inserts a deep copy at cursor location.
- Templates listed under special node "Templates" (Phase 6).
