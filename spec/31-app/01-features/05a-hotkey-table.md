# Hotkey Table — Machine-Readable SSOT

> **Version:** 1.0.0  
> **Created:** 2026-04-26 (UTC+8)  
> **Status:** Active  
> **Parent:** [`05-interactions.md`](./05-interactions.md)
> **Closes:** Audit A-19 (no SSOT for keyboard shortcuts vs `lib/hotkeys.ts`)

## Keywords

`hotkey` · `shortcut` · `keyboard` · `interaction` · `ssot`

---

## Scoring

| Criterion | Status |
|-----------|--------|
| `00-overview.md` present | ✅ (parent: `05-interactions.md`) |
| AI Confidence assigned | ✅ |
| Ambiguity assigned | ✅ |
| Keywords present | ✅ |
| Scoring table present | ✅ |
| AI Confidence (auto-backfill) | High |
| Ambiguity (auto-backfill) | Low |

---

## Purpose

A flat, machine-parseable table of every keyboard shortcut. The implementation file `src/lib/interactions/useGlobalKeys.ts` (planned) and the future `src/lib/hotkeys.ts` MUST register exactly these bindings — drift is detected by a hygiene check (`scripts/spec-hygiene/17-check-hotkeys.mjs`, see A-20-extension).

The prose context for each shortcut lives in [`05-interactions.md`](./05-interactions.md) §4.1–4.4. This file is the **canonical machine source**; if the two disagree, this table wins.

---

## Notation

- **Mod** = `⌘` on macOS, `Ctrl` on Windows/Linux. Implementation MUST detect `navigator.platform`.
- **Shift** = `⇧`. **Alt** = `⌥` (macOS) / `Alt` (other).
- Key codes follow the W3C UI Events `KeyboardEvent.key` spec (e.g. `Enter`, `Backspace`, `Tab`, `ArrowUp`, `s`).
- **Scope** values: `global` (anywhere), `editor` (focused inside an item row), `search-overlay` (search modal open), `tree` (tree view focused, no item editing).

---

## Canonical Hotkey Table

| ID | Combo (mac) | Combo (win) | Key | Modifiers | Scope | Action ID | Description | Edge Case |
|----|-------------|-------------|-----|-----------|-------|-----------|-------------|-----------|
| HK-01 | `Enter` | `Enter` | `Enter` | — | editor | `item.split-or-new` | Split text at caret OR create empty sibling | Caret at 0 → empty sibling above |
| HK-02 | `Backspace` | `Backspace` | `Backspace` | — | editor | `item.delete-empty` | Delete empty item; reparent children | First item → no-op |
| HK-03 | `Tab` | `Tab` | `Tab` | — | editor | `item.indent` | Indent under sibling above | First sibling → no-op |
| HK-04 | `⇧Tab` | `Shift+Tab` | `Tab` | `shift` | editor | `item.outdent` | Outdent to parent's level | Root level → no-op |
| HK-05 | `⌘↑` | `Ctrl+↑` | `ArrowUp` | `mod` | editor | `item.move-up` | Reorder item up | First sibling → no-op |
| HK-06 | `⌘↓` | `Ctrl+↓` | `ArrowDown` | `mod` | editor | `item.move-down` | Reorder item down | Last sibling → no-op |
| HK-07 | `↑` | `↑` | `ArrowUp` | — | editor | `nav.prev-item` | Move focus to previous visible item | First item → no-op |
| HK-08 | `↓` | `↓` | `ArrowDown` | — | editor | `nav.next-item` | Move focus to next visible item | Last item → no-op |
| HK-09 | `⌘↵` | `Ctrl+Enter` | `Enter` | `mod` | editor | `item.toggle-complete` | Toggle completion state | Children unaffected |
| HK-10 | `⌘F` | `Ctrl+F` | `f` | `mod` | global | `search.open` | Open search overlay | — |
| HK-11 | `Escape` | `Escape` | `Escape` | — | search-overlay | `search.close` | Close search overlay | — |
| HK-12 | `↵` | `Enter` | `Enter` | — | search-overlay | `search.select-result` | Zoom into selected result | — |
| HK-13 | `↑` | `↑` | `ArrowUp` | — | search-overlay | `search.prev-result` | Move selection up | At first → no-op |
| HK-14 | `↓` | `↓` | `ArrowDown` | — | search-overlay | `search.next-result` | Move selection down | At last → no-op |
| HK-15 | `⌘S` | `Ctrl+S` | `s` | `mod` | global | `autosave.flush-now` | Force-flush pending mutations | Toast "✓ Saved" |
| HK-16 | `⌘Z` | `Ctrl+Z` | `z` | `mod` | global | `undo` | Undo last mutation | Empty stack → no-op |
| HK-17 | `⌘⇧Z` | `Ctrl+Shift+Z` | `z` | `mod,shift` | global | `redo` | Redo last undone mutation | Empty stack → no-op |
| HK-18 | `⌘\\` | `Ctrl+\\` | `\\` | `mod` | global | `sidebar.toggle` | Toggle left sidebar | — |
| HK-19 | `⌘.` | `Ctrl+.` | `.` | `mod` | editor | `item.context-menu` | Open item context menu | — |
| HK-20 | `Escape` | `Escape` | `Escape` | — | editor | `editor.blur` | Blur editor, focus tree row | — |

**Total: 20 bindings.** Implementation MUST register all 20. Adding an unlisted combo is a hygiene violation; removing one is a regression.

---

## Action ID Convention

`<surface>.<verb>[-<qualifier>]`

- `surface` ∈ {`item`, `nav`, `search`, `autosave`, `editor`, `sidebar`, `undo`, `redo`}
- `verb` is imperative (`split`, `move`, `toggle`, `flush`, `open`)
- `qualifier` disambiguates (`up`, `down`, `now`, `complete`, `empty`)

The Action ID is the registry key in the planned `src/lib/hotkeys.ts` map; multiple combos may map to the same action (none currently do).

---

## Conflict Rules

1. Within one scope, no two HK rows may share the same `(key, modifiers)` tuple.
2. A `global` binding takes precedence over a `tree` binding only when no editor is focused.
3. An `editor`-scope binding shadows `global` when the editor has focus, EXCEPT `⌘S`, `⌘Z`, `⌘⇧Z`, `⌘F`, `⌘\\`, which always reach `global`.
4. `Escape` is overloaded by scope: `search-overlay` wins over `editor` when both are active.

---

## Acceptance Criteria

- [ ] **AT-HK-01** — Every row in the table maps to exactly one registered handler in `src/lib/hotkeys.ts`.
- [ ] **AT-HK-02** — `useGlobalKeys.ts` parses `navigator.platform` once at mount and dispatches by Action ID.
- [ ] **AT-HK-03** — A unit test enumerates all 20 rows and asserts each Action ID resolves to a non-undefined handler.
- [ ] **AT-HK-04** — Hygiene script `17-check-hotkeys.mjs` parses this table and the registry; CI fails on any mismatch (count, ID, or combo).
- [ ] **AT-HK-05** — Conflict-rule §3 verified by integration test: typing `⌘S` inside an editor still flushes (does not produce literal `s`).
- [ ] **AT-HK-06** — Conflict-rule §4 verified: `Escape` while search overlay is open closes the overlay without blurring the underlying editor.

---

## Cross-References

- Prose source → [`05-interactions.md`](./05-interactions.md) §4.1–4.4
- Planned implementation → `src/lib/interactions/useGlobalKeys.ts`, `src/lib/hotkeys.ts` (do not exist yet)
- Hygiene check (planned) → `scripts/spec-hygiene/17-check-hotkeys.mjs`
- Audit closure → `spec/18-spec-issues/12-audit-50-issues-2026-04-26.md` row A-19

---

## Related

**In this section:**

- [`05-interactions.md`](./05-interactions.md) — Prose Interactions spec (parent)
- [`06-item-context-menu.md`](./06-item-context-menu.md) — Pointer alternative
- [`04-page-content-area.md`](./04-page-content-area.md) — DOM surface

**See also:**

- [`../00-overview.md`](../00-overview.md) — Features overview
