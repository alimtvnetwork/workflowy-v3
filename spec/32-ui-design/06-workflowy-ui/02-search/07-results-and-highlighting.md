# 07 — Results & Highlighting

> **Version:** 2.0.0 · **Created:** 2026-04-23 (UTC+8) · **Status:** ✅ Authored
> **Parent:** [`./00-overview.md`](./00-overview.md)
> **Screenshots:** img-44

---

## Purpose

Specify how the active query is **applied to the live outline**, how matches are visually marked, how ancestor expansion and result cycling work, and how the **footer match-count pill** behaves. Results are NOT rendered inside the popover — they live in the underlying outline behind it.

---

## 1. Live filtering pipeline

| Step | Rule |
|------|------|
| 1 | User types or commits a chip |
| 2 | Debounce input changes by **80 ms** before re-running the query |
| 3 | Parser converts current input to a `ParsedQuery` (file 06 / file 13) |
| 4 | Filter applies against the visible outline tree |
| 5 | Outline rows that DON'T match are dimmed (not removed); matching rows wrap their matched substrings in `<mark>` |
| 6 | Ancestors of matching rows are auto-expanded so the match is visible in context |
| 7 | Footer pill updates with new match count |

Empty input (no tokens, no free text) restores the outline to its pre-search collapsed/expanded state and removes all `<mark>` wrappers.

---

## 2. Match visualization

| Element | Visualization |
|---------|---------------|
| Matching node row | Standard appearance with `<mark>` wrapping matched substrings |
| Non-matching row | Dimmed (reduced opacity) but still present for context |
| Ancestor of a match | Auto-expanded; rendered standard (not dimmed) even if it does not itself match |
| Active match (cycle target) | Additional ring/border to indicate "current" item |

Highlight color for `<mark>` uses the **`--highlight` / `--highlight-foreground`** semantic tokens documented in [`11-design-tokens.md`](./11-design-tokens.md). The active-match indicator uses `--accent-active`.

---

## 3. Ancestor auto-expansion

- For each match, walk up the parent chain and expand any collapsed ancestors.
- Auto-expansion is **transient**: when the query clears, ancestors return to their previous collapsed/expanded state.
- Expansion does NOT persist as a user action and does NOT enter the undo history.

---

## 4. Footer match-count pill

A pill anchored to **viewport bottom-center**, OUTSIDE the popover DOM.

### 4.1 Contents
- Text: `N Matches` (where N = total matches across all visible outlines).
- Cycling controls: `↑` previous match · `↓` next match · current index (`3 of 17`).
- A "✕" button to clear the search query.

### 4.2 Visibility
| Condition | Visible? |
|-----------|----------|
| Query is empty | Hidden |
| Query active, ≥1 match | Visible |
| Query active, 0 matches | Visible with `0 matches` and a hint *"No items match. Try removing a filter."* |

### 4.3 Cycling
- `↓` (or `Enter` while popover is closed and query active) → scroll to next match, mark it active.
- `↑` (or `Shift+Enter`) → previous match.
- Cycling wraps at ends.
- Active match is centered in viewport with smooth scroll (respect `prefers-reduced-motion`).

---

## 5. Performance budget

| Outline size | Target debounced re-query time |
|--------------|--------------------------------|
| ≤ 1k items | ≤ 30 ms |
| ≤ 10k items | ≤ 120 ms |
| ≤ 50k items | ≤ 400 ms |

Implementer is free to use indexing strategies; spec only sets the budget. Engine choice deferred per `mem://constraints/backend-runtime-deferred` (memory-only reference).

---

## 6. Interaction with mirrors

- When **Include mirrors** is ON (Quick Action default), mirror instances of matched items are also shown as matches.
- When OFF, only the canonical instance is matched and others are dimmed.

---

## 7. Saved query application

When a saved/recent search is applied (file 04):
- The popover stays open.
- Tokens populate the input.
- Query runs immediately (skip debounce on first run).
- Footer pill updates.

---

## 8. Clearing

| Trigger | Effect on results |
|---------|-------------------|
| Empty input (manual delete or ⊗ clear) | Removes all `<mark>`, restores outline state, hides footer pill |
| Close popover with query active (and pinned OFF) | Query persists in outline; footer pill remains visible |
| Close popover with pinned ON | Same — popover hidden but query active |
| Re-open popover | Restores last query if pinned, else opens empty |

---

## 9. Cross-references

- [`05-token-system.md`](./05-token-system.md), [`06-query-grammar.md`](./06-query-grammar.md) — what produces the query
- [`08-keyboard-shortcuts.md`](./08-keyboard-shortcuts.md) — cycle / pin shortcuts
- [`11-design-tokens.md`](./11-design-tokens.md) — `--highlight`, `--accent-active` tokens
- [`13-data-contracts.md`](./13-data-contracts.md) — `MatchResult`
