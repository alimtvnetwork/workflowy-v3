# 04 — Right-Side Action Icons

> **Version:** 2.0.0 · **Created:** 2026-04-23 (UTC+8) · **Status:** ✅ Authored
> **Parent:** [`./00-overview.md`](./00-overview.md)
> **Screenshots:** img-44

---

## Purpose

Specify the three right-side header icons of the popover: **⚡ Quick Actions**, **⭐ Saved Searches**, **⊗ Clear/Close**. Each is a separate concern with its own dropdown / behavior.

---

## 1. Icon slot summary

| Slot | Lucide icon | Tooltip | Click behavior | Keyboard |
|------|-------------|---------|----------------|----------|
| R1 | `Zap` | "Quick actions" | Opens Quick Actions dropdown | `⌘J` while popover open |
| R2 | `Star` | "Saved searches" | Opens Saved Searches dropdown | `⌘S` while popover open |
| R3 | `X` (when input has content) / hidden when empty | "Clear" / "Close" | Empty input → close popover. Non-empty → clear input only | `Esc` (see file 08) |

`⌘` on Mac, `Ctrl` on other platforms.

---

## 2. ⚡ Quick Actions dropdown

A popover-anchored menu that exposes session-wide search-related toggles and actions. Items at launch:

| Item | Type | Action |
|------|------|--------|
| Include mirrors in results | Toggle | Default ON. Persists in user settings (storage TBD) |
| Show completed items | Toggle | Default OFF |
| Match case | Toggle | Default OFF |
| Whole-word match | Toggle | Default OFF |
| Pin search popover | Toggle | Mirrors `⌘.` pin state |
| Open results in new node | Action | Creates a transient node listing matched IDs |
| Copy query as link | Action | Copies a deep-link URL with query encoded |
| Reset all filters | Action | Clears input + resets all toggles to defaults |

ARIA: `role="menu"`, items `role="menuitemcheckbox"` (toggles) or `role="menuitem"` (actions).

Closing rules: Esc, outside click, or selecting an action item.

---

## 3. ⭐ Saved Searches dropdown

A popover-anchored menu listing user-saved queries. Two sections:

### 3.1 Section A — Saved
- List of saved searches: name + token preview chips + last-used timestamp.
- Hover row reveals: ▶ apply, ✎ rename, ⋯ menu (Duplicate, Delete).
- Click row → applies the query (input populated with the saved tokens, popover stays open).

### 3.2 Section B — Recent
- Last 10 queries this session (deduplicated). Click to re-apply.
- Has a "Clear recents" link at the bottom.

### 3.3 Save current query
- Bottom of dropdown: button **"Save current query"**.
- Disabled when input is empty.
- Click → inline rename input → Enter to save → row appears in Section A.

### 3.4 Storage

> **Storage adapter: TBD per backend choice.**
> The UI is fully specified; persistence is deferred per `mem://constraints/backend-runtime-deferred` (memory-only reference). Future implementer must choose a runtime (LocalStorage / WordPress meta / API endpoint / etc.) and wire the `SavedSearchStore` contract from [`13-data-contracts.md`](./13-data-contracts.md).

ARIA: `role="menu"` with `aria-label="Saved searches"`.

---

## 4. ⊗ Clear / Close behavior

State machine:

| Input state | Icon shown | Click result |
|-------------|------------|--------------|
| Empty | `X` (close) | Close popover |
| Has free text or chips | `X` (clear) | Clear all input content; popover stays open; focus returns to input |

Tooltip swaps between "Clear" and "Close" based on state.

`Esc` mirrors this: first press clears, second press closes (when input had content). When input is empty, single `Esc` closes immediately.

---

## 5. Visual & focus rules

- All three icons share consistent size and spacing per design system.
- Hover state: subtle background fill.
- Focus-visible: ring per system tokens.
- Disabled state for individual Quick-Actions toggles uses `aria-disabled="true"` and a dimmed fill.

---

## 6. Mobile

| Slot | Mobile rule |
|------|-------------|
| R1 ⚡ | Same — opens bottom sheet instead of popover |
| R2 ⭐ | Same — bottom sheet |
| R3 ⊗ | Same as desktop |

Bottom-sheet variant of dropdowns specified in [`09-states-and-edge-cases.md`](./09-states-and-edge-cases.md) § Mobile.

---

## 7. Cross-references

- [`01-popover-anatomy.md`](./01-popover-anatomy.md) § Header row
- [`08-keyboard-shortcuts.md`](./08-keyboard-shortcuts.md) — full shortcut matrix incl. `⌘J`, `⌘S`, `⌘.`
- [`13-data-contracts.md`](./13-data-contracts.md) — `SavedSearch`, `SavedSearchStore` shapes
- [`12-icon-map.md`](./12-icon-map.md) — Lucide names
- `mem://constraints/backend-runtime-deferred` — storage deferral (memory-only reference)
