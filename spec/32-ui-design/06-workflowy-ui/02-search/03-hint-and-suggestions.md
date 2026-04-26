# 03 — Hint & Suggestions

> **Version:** 2.0.0 · **Created:** 2026-04-23 (UTC+8) · **Status:** ✅ Authored
> **Parent:** [`./00-overview.md`](./00-overview.md)
> **Screenshots:** img-42, img-43, img-44

---

## Purpose

Specify the contents and behavior of **Region 3** (suggestions) and **Region 4** (value-picker listbox) of the popover. These regions react to: active tab, current cursor context inside the input, and presence/absence of a partial `key:` token.

---

## 1. Hint copy (default state)

When popover just opened, no input typed, **Scope** tab active:

> *"Search anywhere. Type a keyword like `is:todo` or `@name`, or press space then `Tab` to cycle filters."*

Localization: English only at launch (per plan).

When the user types any free text without a token, hint changes to:

> *"Press `Space` then a keyword to add a filter, or press `Enter` to filter the outline."*

---

## 2. Suggestion chip lists per tab

Each tab populates Region 3 with a chip list. Chips are clickable AND keyboard-navigable (← → ↑ ↓). Activating a chip inserts the corresponding token (or quick-keyword) into the input at the caret position.

### 2.1 Scope (default tab)
- No chips. Hint copy only.

### 2.2 Mentions
- Section A: **Recent** — last **5** `@user` tokens used in queries this session (FIFO eviction; session-scoped, not persisted).
- Section B: **All people** — alphabetical list of workspace members rendered as `@name` chips.
- Empty workspace fallback: hint *"No collaborators yet. Share a node to mention people."*

### 2.3 Dates
- Section A: **Quick** — `today`, `tomorrow`, `yesterday`, `this-week`, `next-week`, `last-week`, `this-month`, `next-month`, `last-month`.
- Section B: **Filters** — `date:`, `date-before:`, `date-after:`, `day-of-week:`. Inserting any of these opens Region 4 (value picker).

### 2.4 History
- `changed:`, `created:`. Both open Region 4 (date value picker).

### 2.5 People
- `me`, `others`. Insert as standalone tokens.

### 2.6 More
- `is:`, `has:`, `in:`, `text:`, `link:`, `highlight:`. Each opens Region 4 with the appropriate value picker.

---

## 3. Region 4 — Value picker listbox

When a partial `key:` token is committed without a value (or the user opened a chip that requires a value), Region 4 appears **inline below** Region 3 as a listbox.

### 3.1 Pickers per keyword

| Key | Picker type | Values |
|-----|-------------|--------|
| `is:` | Enum listbox | `todo`, `complete`, `starred`, `shared`, `mirror`, `template`, `heading` |
| `has:` | Enum listbox | `note`, `date`, `file`, `image`, `video`, `tweet`, `link`, `comment`, `highlight` |
| `in:` | Node-picker tree | Workspace tree; multi-select. Each pick adds an `in:<nodeId>` token. Multiple `in:` = union (per grammar) |
| `date:`, `changed:`, `created:` | Calendar picker (single date) | Returns `YYYY-MM-DD` |
| `date-before:`, `date-after:` | Calendar picker (single date) | Same format |
| `day-of-week:` | Enum listbox | `mon`, `tue`, `wed`, `thu`, `fri`, `sat`, `sun`, `weekday`, `weekend` |
| `highlight:` | Color swatch grid | The 11 highlight colors (see Phase 5 § color palette — forward ref) |
| `link:` | Free-text input | URL or substring |
| `text:` | Free-text input | Phrase; whitespace allowed when wrapped in `"…"` |

### 3.2 Picker behaviors
- Listbox supports keyboard: ↑ ↓ navigate, `Enter` selects, `Esc` closes picker (returns focus to input).
- Selecting a value commits the full `key:value` token into the input as a chip and closes the picker.
- Multi-select pickers (`in:`, `highlight:` if multi enabled) keep the picker open until `Enter` outside an item or click "Done".

---

## 4. Token vs chip context detection

The component must determine "what to suggest" from the caret context inside the input:

| Caret context | Region 3 shows | Region 4 shows |
|---------------|----------------|----------------|
| Empty input | Active tab's default suggestions | Hidden |
| Mid-free-text | Hint only | Hidden |
| Right after typing `is` (no colon) | Mentions of all `key:` keywords starting with `is` | Hidden |
| Right after typing `is:` (colon present, no value) | Hint *"Pick a value"* | Listbox per § 3 |
| Inside an existing chip's value | Chip-specific suggestions | Listbox if applicable |

Detection is purely client-side string analysis on the input value + caret position.

---

## 5. Recent searches surface

When input is empty and Scope tab is active, **if** there are saved/recent searches, Region 3 shows a **second list** below the hint:

> *Recent searches*  
> · last 5 queries, each clickable to re-apply

Saved Searches dropdown (from ⭐ icon) is separate — see [`04-right-action-icons.md`](./04-right-action-icons.md).

---

## 6. Empty / loading / error

| Condition | Behavior |
|-----------|----------|
| Picker has no values (e.g. `in:` with empty workspace) | Show "Nothing to pick yet." |
| Picker is loading async data | Skeleton rows; never block user typing |
| Free-text input invalid for a key | Show inline error message under input; do not commit chip |

---

## 7. Cross-references

- [`02-filter-tab-rail.md`](./02-filter-tab-rail.md) — which tab triggers which suggestions
- [`05-token-system.md`](./05-token-system.md) — how chips commit and edit
- [`06-query-grammar.md`](./06-query-grammar.md) — value formats per keyword
- [`07-results-and-highlighting.md`](./07-results-and-highlighting.md) — what happens after Enter
- Phase 5 highlight palette (forward ref) — color swatch values for `highlight:`
