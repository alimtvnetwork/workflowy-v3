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

## Inputs

| Field | Type | Source | Required | Notes |
|-------|------|--------|----------|-------|
| `keyEvent` | `KeyboardEvent` | Global key listener | Yes | `key`, `ctrlKey`, `metaKey`, `shiftKey`, `altKey` consumed |
| `platform` | `'mac' \| 'win' \| 'linux'` | `navigator.platform` parse | Yes | Drives `mod` resolution (⌘ vs Ctrl) |
| `activeScope` | `'global' \| 'editor' \| 'search-overlay' \| 'tree'` | Focus tracker | Yes | Highest-priority match per Conflict Rules §2–4 |
| `registry` | `Map<ActionId, Handler>` | `src/lib/hotkeys.ts` | Yes | Built once at boot from this table |

## Outputs

| Output | Persisted? | Channel | Notes |
|--------|-----------|---------|-------|
| Action dispatch | ❌ | In-process call to handler | Handler decides DB / toast / nav side effects |
| `event.preventDefault()` | ❌ | DOM | Fired for every matched binding |
| Hygiene report row | ❌ | CI stdout | `17-check-hotkeys.mjs` diff vs registry |

## Edge Cases

1. User holds Mod+Key inside an `<input>` outside the editor (e.g. share-dialog text box) — global bindings (⌘S, ⌘F, ⌘Z, ⌘⇧Z, ⌘\\) STILL fire; others suppressed by browser default.
2. Two scopes match the same combo simultaneously (e.g. editor focused while search overlay opening) — the scope listed later in `['global','tree','editor','search-overlay']` wins.
3. Platform detection fails (rare; non-standard `navigator.platform`) — fallback to `'win'` semantics (Ctrl as Mod).
4. Combo registered in `lib/hotkeys.ts` but absent from this table — hygiene check fails CI.
5. Combo present in this table but no registry handler — hygiene check fails CI.
6. `Escape` pressed with both editor and search overlay active — overlay closes, editor retains focus (per Conflict Rule §4).

## Acceptance Tests

| ID | Given | When | Then | testid |
|----|-------|------|------|--------|
| AT-HK-01 | Registry built at boot | Hygiene check runs | Every row maps to exactly one registered handler | — |
| AT-HK-02 | Component mounts on macOS | `useGlobalKeys` initializes | `platform === 'mac'`; `mod` resolves to `metaKey` | — |
| AT-HK-03 | Unit test enumerates all 20 rows | For each row | Action ID resolves to non-undefined handler | — |
| AT-HK-04 | Combo missing from registry | CI runs | `17-check-hotkeys.mjs` exits non-zero | — |
| AT-HK-05 | Editor focused | User presses ⌘S | `autosave.flush-now` fires; no literal `s` typed | `save-indicator` |
| AT-HK-06 | Search overlay open over editor | User presses Escape | Overlay closes; editor retains focus | `search-overlay` |
| AT-HK-07 | Item row focused | User presses Tab on first sibling | No mutation; no API call | `item-row` |
| AT-HK-08 | Search overlay open | User presses ↓ then Enter | Selected result is zoomed; overlay closes | `search-result-row` |

## Component Contract

> **Note:** None of these components exist yet — paths are aspirational. The disclaimer mirrors `05-interactions.md` L145; AI implementers MUST NOT treat the paths as binding imports.

| Surface | Component path | `data-testid` | Acceptance tests |
|---------|---------------|---------------|------------------|
| Hotkey registry map | `src/lib/hotkeys.ts` | — (module) | AT-HK-01, AT-HK-03, AT-HK-04 |
| Global key dispatcher | `src/lib/interactions/useGlobalKeys.ts` | — (hook) | AT-HK-02, AT-HK-05, AT-HK-06 |
| Hygiene check | `scripts/spec-hygiene/17-check-hotkeys.mjs` | — (script) | AT-HK-04 |
| Save indicator | `src/components/feedback/SaveIndicator.tsx` | `save-indicator` | AT-HK-05 |
| Search overlay shell | `src/components/search/SearchOverlay.tsx` | `search-overlay` | AT-HK-06, AT-HK-08 |
| Item row | `src/components/tree/ItemRow.tsx` | `item-row` | AT-HK-07 |
| Search result row | `src/components/search/SearchResults.tsx` | `search-result-row` | AT-HK-08 |


---

## Cross-References

- Prose source → [`05-interactions.md`](./05-interactions.md) §4.1–4.4
- Planned implementation → `src/lib/interactions/useGlobalKeys.ts`, `src/lib/hotkeys.ts` (do not exist yet)
- Hygiene check (planned) → `scripts/spec-hygiene/17-check-hotkeys.mjs`
- Audit closure → `spec/18-spec-issues/12-audit-50-issues-2026-04-26.md` row A-19

---

## Workflowy Feature Reference (F1) — Hotkeys for Editor & Item Affordances

> **Source:** Workflowy product feature list, merged 2026-04-28 (lossless, additive). The canonical AT-HK-* table above is the SSOT for AT-* IDs; this appendix is a human-friendly grouping of the F1 (editor / item-type) shortcuts only. F2 (search/navigation) and F3 (structural ops & mirrors) appendices will be added by their respective steps.

| Action | macOS | Windows / Linux | Notes |
|---|---|---|---|
| Toggle To-do completion | ⌘↵ | Ctrl+↵ | Focused `todo` row only. |
| Add note to current item | Shift+↵ | Shift+↵ | Creates `note` child block. |
| Insert date chip | ⌘+Shift+. | Ctrl+Shift+. | Powers Today view + date search. |
| Bold / Italic / Underline | ⌘B / ⌘I / ⌘U | Ctrl+B / Ctrl+I / Ctrl+U | On selected text. |
| Inline code | ⌘E | Ctrl+E | Toggles `code` inline mark. |
| Insert / edit link | ⌘K | Ctrl+K | Opens link prompt. |
| Strike-through | ⌘+Shift+S | Ctrl+Shift+S | Toggles `strike` inline mark. |
| Create sibling bullet | ↵ | ↵ | At end of item content. |
| Indent / outdent | ↹ / Shift+↹ | ↹ / Shift+↹ | Re-parents the focused row. |
| Expand / collapse children | ⌘↓ / ⌘↑ | Ctrl+↓ / Ctrl+↑ | Focused row only. |
| Zoom in / zoom out | ⌘. / ⌘, | Ctrl+. / Ctrl+, | Page-root navigation. |
| Undo / Redo | ⌘Z / ⌘+Shift+Z | Ctrl+Z / Ctrl+Y | Global mutation stack. |

> **Reconciliation note (F7 candidate):** every row above MUST appear in the canonical AT-HK-* table at the top of this file. Any drift is a hygiene violation and should be flagged in the F7 reconciliation pass.

---

## Related

**In this section:**

- [`05-interactions.md`](./05-interactions.md) — Prose Interactions spec (parent)
- [`06-item-context-menu.md`](./06-item-context-menu.md) — Pointer alternative
- [`04-page-content-area.md`](./04-page-content-area.md) — DOM surface

**See also:**

- [`../00-overview.md`](../00-overview.md) — Features overview

---

## Backend Write Surface

- **Routes introduced by this feature:** None.
- **N/A justification:** Closed enum table — no write surface; hotkeys dispatch to other features' routes.
- **Compliance:** Satisfies F-AUD42-25 (API axis) by explicit declaration. Any future write route added here MUST follow the PascalCase envelope (ADR-0004/0019), egress via queue worker (ADR-0023), and bind to a named error boundary (ADR-0017).
