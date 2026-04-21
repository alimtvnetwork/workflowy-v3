# Markdown Shortcuts

> **Parent:** [`00-overview.md`](./00-overview.md)
> **Screenshots:** img-58

---

## Activation Rule

Markdown shortcuts trigger ONLY when:
- Cursor is in **editing mode** (not navigation).
- Trigger pattern is typed at the **start of an empty node** (no prior content).
- User has not pressed `Esc` to dismiss the most recent suggestion.

When triggered, the literal trigger characters are **consumed** (removed) and the node is converted to the target type.

---

## Block-Level Shortcuts

| Trigger | Result | Notes |
|---------|--------|-------|
| `# ` | Heading 1 | Space confirms |
| `## ` | Heading 2 | |
| `### ` | Heading 3 | |
| `#### ` | Heading 4 | Extension |
| `##### ` | Heading 5 | Extension |
| `> ` | Quote Block | |
| `[] ` or `[ ] ` | To-do (unchecked) | |
| `[x] ` | To-do (checked) | |
| `1. ` | Numbered List child | Parent becomes `numbered` type |
| `- ` | Bullet (no-op if already bullet) | Useful when pasting MD |
| `* ` | Bullet (alias) | |
| `--- ` | Divider | Triggers on third `-` + Enter |
| ` ``` ` | Code Block | 3 backticks + Enter |

---

## Inline Shortcuts (within content)

These trigger on the **closing** character and convert wrapped text to formatted text. The trigger characters are consumed.

| Pattern | Result | Example |
|---------|--------|---------|
| `**text**` | **Bold** | `**hi**` → **hi** |
| `*text*` | *Italic* | `*hi*` → *hi* |
| `_text_` | *Italic* (alt) | |
| `__text__` | **Bold** (alt) | |
| `~~text~~` | ~~Strike~~ | |
| `` `text` `` | `Inline code` | |
| `[label](url)` | [label](url) link | |
| `==text==` | Highlight (default yellow) | Workflowy extension |

---

## Non-Triggering Cases (Important)

The shortcut does NOT fire when:

| Case | Reason |
|------|--------|
| Node already has content before trigger | E.g., typing `# ` mid-sentence |
| Inside Code Block | All markdown is literal in code |
| Inside Quote Block (block-level triggers) | Avoids accidental conversion |
| User typed `\` before trigger | Escape character |
| Text contains `:`, indicating URL or namespaced syntax | E.g., `>: ` |

---

## Undo

A markdown shortcut conversion is a **single undo step**:
- ⌘Z reverts the conversion AND restores the literal trigger characters.
- Second ⌘Z reverts the typing prior to the trigger.

This makes shortcuts safe — accidental triggers are one keypress away from correction.

---

## Templates Insertion

Beyond markdown, two slash-equivalents:

| Trigger | Result |
|---------|--------|
| `/template` | Opens template picker (same as `/Add from template`) |
| `@today` | Inserts today's date as chip |
| `@tomorrow` | Inserts tomorrow's date chip |
| `@<date>` | Inserts parsed date chip (uses date-fns natural language) |
| `@<person>` | Opens people picker |
| `#<tag>` | Creates inline tag chip |

---

## Discoverability

The Handbook (Phase 3) `01-handbook-content.md` includes a "Markdown Shortcuts" entry under the "Keyboard Shortcuts" section listing all triggers above with examples.

A first-time user who types `# ` will see a one-time tooltip:
```
✨ Markdown shortcut detected — heading created.
Press ⌘Z to undo, or keep typing.
```
Tooltip auto-dismisses after 4s; suppressed permanently after 3 successful uses.

---

## Cross-References

- `01-slash-menu.md` — alternative discovery via `/`
- `03-item-types.md` — target types for each conversion
- Phase 3 [`03-right-panel/01-handbook-content.md`](../03-right-panel/01-handbook-content.md) — shortcut documentation
