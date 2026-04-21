# Slash Command Menu

> **Parent:** [`00-overview.md`](./00-overview.md)
> **Screenshots:** img-53, 58

---

## Trigger

| Trigger | Behavior |
|---------|----------|
| Type `/` at start of empty node OR after whitespace | Opens menu inline below cursor |
| Type characters after `/` | Filters menu (fuzzy match on label) |
| `Esc` or click outside | Closes menu, leaves `/` literal |
| `Enter` or click item | Inserts item type, removes `/` query |

---

## Menu Order (LOCKED — from img-53, extended)

Items in **bold** are Workflowy native (img-53). Items in *italic* are our extensions (H4, H5).

| # | Label | Icon | Description | Shortcut |
|---|-------|------|-------------|----------|
| 1 | **Bullet** | • | Standard nested bullet (default) | — |
| 2 | **To-do** | ☐ | Checkbox item with completion state | — |
| 3 | **Board** | ⊞ | Kanban-style child layout | — |
| 4 | — divider — | | | |
| 5 | **Heading 1** | H₁ | Largest heading | `# ` |
| 6 | **Heading 2** | H₂ | Section heading | `## ` |
| 7 | **Heading 3** | H₃ | Subsection heading | `### ` |
| 8 | *Heading 4* | H₄ | Extension — minor heading | `#### ` |
| 9 | *Heading 5* | H₅ | Extension — smallest heading | `##### ` |
| 10 | **Paragraph** | ¶ | Plain prose (no bullet shown) | — |
| 11 | — divider — | | | |
| 12 | **Quote** | ❝ | Indented quote block | `> ` |
| 13 | **Code Block** | ⌗ | Monospace code block | `` ``` `` |
| 14 | **Numbered List** | 1. | Auto-numbered children | `1. ` |
| 15 | **Divider** | — | Horizontal rule | `---` |
| 16 | — divider — | | | |
| 17 | **Shortcut** | 🔗 | Link to another node (mirror creation alt) | — |
| 18 | **Add from template** | 📋 | Insert serialized snapshot | `/template` |
| 19 | — divider — | | | |
| 20 | **Date** | 📅 | Insert date chip (today, tomorrow, picker) | `@date` |
| 21 | **Mention** | @ | Insert person mention | `@` |

---

## Filter Behavior

- Empty filter (`/`): show all items in canonical order.
- Filter (`/he`): fuzzy-match labels, sort by match score.
- No matches: show "No item type matches '<query>'" with [Cancel] button.
- Highlight matched characters in bold.

---

## Visual Treatment

| Element | Token / Style |
|---------|---------------|
| Menu container | `--popover` bg, `--border` 1px, 8px radius, shadow-lg |
| Item row | 36px height, 12px horizontal padding |
| Icon column | 24px wide, `--muted-foreground` |
| Label | 14px, `--foreground` |
| Description | 12px, `--muted-foreground`, right-aligned |
| Shortcut | 11px, monospace, `--muted` background pill |
| Hover | `--accent` bg, `--accent-foreground` text |
| Width | min 320px, max 420px |
| Max height | 60vh, scrollable |

---

## Keyboard Navigation

| Key | Action |
|-----|--------|
| ↑ / ↓ | Move selection |
| Tab | Same as ↓ |
| Shift+Tab | Same as ↑ |
| Enter | Confirm selection |
| Esc | Close menu, keep `/` literal |
| Type | Filter |
| Backspace (empty filter) | Close menu, delete `/` |
