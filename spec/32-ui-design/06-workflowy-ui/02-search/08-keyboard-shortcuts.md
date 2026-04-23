# 08 — Keyboard Shortcuts

> **Version:** 2.0.0 · **Created:** 2026-04-23 (UTC+8) · **Status:** ✅ Authored
> **Parent:** [`./00-overview.md`](./00-overview.md)

---

## Purpose

Single normative source for every keyboard shortcut owned by the search popover and the related footer pill. Cross-references throughout the search spec point here. Cmd on macOS, Ctrl on Windows/Linux.

---

## 1. Global (any context)

| Shortcut | Action |
|----------|--------|
| `⌘K` / `Ctrl+K` | Open search popover (focus input, restore last query if pinned) |
| `⌘⇧K` / `Ctrl+Shift+K` | Open search popover and clear any restored query |

Registration of these global hotkeys is the responsibility of the **Phase 8 app shell** (forward ref). This spec only declares intent.

---

## 2. Popover open — input focused

| Shortcut | Action |
|----------|--------|
| `Esc` | If input has content → clear input; if already empty → close popover |
| `Enter` | If a value picker is open → accept highlighted value; else → re-run query (no-op if unchanged) |
| `Tab` | Move focus to filter tab rail at the active tab |
| `Shift+Tab` | Move focus to last interactive element (R3 close button) |
| `⌘.` / `Ctrl+.` | Toggle pinned state |
| `⌘J` / `Ctrl+J` | Open Quick Actions dropdown |
| `⌘S` / `Ctrl+S` | Open Saved Searches dropdown |
| `Backspace` (caret right after a chip) | Select that chip |
| `Backspace` (chip selected) | Delete chip |
| `!` (chip selected) | Toggle negation on chip |

---

## 3. Filter tab rail focused

| Shortcut | Action |
|----------|--------|
| `←` / `→` | Cycle through tabs (wrap at ends) |
| `Enter` / `Space` | Activate focused tab |
| `Tab` | Move focus into Region 3 (first suggestion chip) |
| `Shift+Tab` | Move focus back to input |
| `Esc` | Move focus back to input |

---

## 4. Region 3 / Region 4 focused

| Shortcut | Action |
|----------|--------|
| `↑` / `↓` | Navigate suggestion chips or listbox items |
| `←` / `→` | Within a chip row, navigate to siblings |
| `Enter` | Activate item (insert chip / commit value) |
| `Esc` | Close picker (if Region 4) or return focus to input |
| `Tab` | Move focus to next region (right-side icons) |

---

## 5. Quick Actions / Saved Searches dropdown focused

| Shortcut | Action |
|----------|--------|
| `↑` / `↓` | Navigate items |
| `Enter` / `Space` | Activate item / toggle |
| `Esc` | Close dropdown, return focus to its trigger icon |
| `Tab` | Close dropdown and move focus forward |

---

## 6. Footer pill (popover may be closed)

| Shortcut | Action |
|----------|--------|
| `Enter` / `↓` | Cycle to next match |
| `Shift+Enter` / `↑` | Cycle to previous match |
| `Esc` | Clear query and hide pill |
| `⌘K` / `Ctrl+K` | Re-open popover with current query |

---

## 7. Conflicts & precedence

- When the search popover is open, `⌘K` is a no-op (already open).
- When a value picker is open, `Esc` closes the picker first; a second `Esc` clears or closes the popover per § 2.
- `Enter` precedence: value-picker accept > query re-run > footer cycling (when popover closed).

---

## 8. Discoverability

- All shortcuts shown in this file are **also** registered in the global hotkeys panel (Phase 3 right-side panel — forward ref). This file remains the SSoT for the search-specific subset; the hotkeys panel mirrors them for discovery.

---

## 9. Cross-references

- [`01-popover-anatomy.md`](./01-popover-anatomy.md) § Open / close geometry
- [`05-token-system.md`](./05-token-system.md) § Edit & delete
- [`07-results-and-highlighting.md`](./07-results-and-highlighting.md) § Footer pill
- Phase 3 right-panel hotkeys (forward ref)
- Phase 8 app shell (forward ref) — global hotkey registration
