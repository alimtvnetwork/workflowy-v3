# 02 — Filter Tab Rail

> **Version:** 2.0.0 · **Created:** 2026-04-23 (UTC+8) · **Status:** ✅ Authored
> **Parent:** [`./00-overview.md`](./00-overview.md)
> **Screenshots:** img-41, img-42, img-43, img-44

---

## Purpose

Define the 6-tab horizontal rail under the header row. Each tab is a **scope filter** that pre-loads a set of suggestion chips (file 03) and biases the query grammar toward a keyword family. Tabs do NOT inject tokens by themselves — they only switch what the suggestions panel shows.

---

## 1. Tab inventory (left to right, fixed order)

| # | Tab name | Icon (Lucide) | Default suggestions |
|---|----------|---------------|---------------------|
| 1 | **Scope** *(default on open)* | `Globe` | None — shows the default hint copy from file 03 |
| 2 | **Mentions** | `AtSign` | Recent `@user` tokens, then alphabetical `@user` list |
| 3 | **Dates** | `Calendar` | `date:`, `date-before:`, `date-after:`, `day-of-week:` + quick chips: `today`, `tomorrow`, `yesterday`, `this-week`, `next-week`, `last-week`, `this-month`, `next-month`, `last-month` |
| 4 | **History** | `History` | `changed:`, `created:` |
| 5 | **People** | `Users` | `me`, `others` |
| 6 | **More** | `MoreHorizontal` | `is:`, `has:`, `in:`, `text:`, `link:`, `highlight:` |

Order is fixed; do NOT re-order across breakpoints.

---

## 2. Tab states

| State | Visual rule |
|-------|-------------|
| Default | Icon only OR icon + label per breakpoint (see § 5) |
| Hover | Subtle background fill |
| Active (selected) | Filled pill background, accent foreground |
| Focus-visible | Outline ring per design system |
| Disabled | Greyed; tooltip explains why (e.g. People tab when sharing is off) |

Only one tab is **active** at a time. Default active tab on open is **Scope**.

---

## 3. Switching behavior

- Click a tab → activates it. Region 3 swaps to that tab's suggestion set.
- Switching tabs **does NOT clear** the input. Free text and committed tokens persist across tab switches.
- Switching tabs **does NOT inject** any token. Tabs are purely a suggestion-source switch.
- After switching, focus stays where it was (input keeps focus if it had it).

---

## 4. Keyboard

| Key | Action |
|-----|--------|
| `Tab` (when input focused) | Move focus into the tab rail at the active tab |
| `←` / `→` (when tab rail focused) | Cycle through tabs (wraps at ends) |
| `Enter` / `Space` (tab focused) | Activate the focused tab |
| `Tab` (tab focused) | Move focus forward into Region 3 (first suggestion chip) |
| `Esc` (tab focused) | Return focus to input |

Full shortcut matrix lives in [`08-keyboard-shortcuts.md`](./08-keyboard-shortcuts.md).

---

## 5. Responsive

| Viewport | Layout |
|----------|--------|
| ≥ md | Icon + label horizontally |
| < md | Icon-only with `aria-label`; labels appear in tooltip on focus/long-press |
| RTL | Order reverses visually; logical tab order preserved |

---

## 6. ARIA contract

- Container: `role="tablist"`, `aria-label="Search filters"`.
- Each tab: `role="tab"`, `aria-selected` reflects active state, `aria-controls` points to the suggestion panel `id` in Region 3.
- Region 3 carries `role="tabpanel"` with matching `aria-labelledby`.
- Disabled tabs use `aria-disabled="true"` (NOT the `disabled` attribute, so they remain focusable for tooltip discovery).

Full a11y rules in [`10-accessibility.md`](./10-accessibility.md).

---

## 7. Edge cases

| Case | Behavior |
|------|----------|
| User typed `is:todo` then switches to Mentions tab | Token remains; Mentions suggestions display below |
| All tabs disabled (e.g. shared workspace, no people) | Scope remains active, others greyed |
| Sharing disabled in workspace | Mentions + People tabs are disabled with tooltip "Sharing is off" |
| Long workspace name in disabled tooltip | Tooltip wraps at sensible width |

---

## 8. Cross-references

- [`01-popover-anatomy.md`](./01-popover-anatomy.md) § Region 2
- [`03-hint-and-suggestions.md`](./03-hint-and-suggestions.md) — what each tab shows
- [`06-query-grammar.md`](./06-query-grammar.md) — keywords behind each tab
- [`12-icon-map.md`](./12-icon-map.md) — Lucide component names
