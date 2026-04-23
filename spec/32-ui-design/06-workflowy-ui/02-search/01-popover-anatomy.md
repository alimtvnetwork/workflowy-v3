# 01 — Popover Anatomy

> **Version:** 2.0.0 · **Created:** 2026-04-23 (UTC+8) · **Status:** ✅ Authored
> **Parent:** [`./00-overview.md`](./00-overview.md)
> **Screenshots:** img-40 (overlay framing), img-41 (header layout), img-44 (chips + actions)

---

## Purpose

Define the **structural regions** of the search popover surface and the rules that govern its container, header row, focus ring, and region map. This file is structure-only — behaviors live in sibling files (tab rail → 02, hints → 03, icons → 04, tokens → 05).

---

## 1. Surface model

| Aspect | Rule |
|--------|------|
| Surface kind | Floating popover, NOT a full-screen overlay (v1 archived) |
| Backdrop | None. Outline behind remains visible and live-filtered |
| Width | Wide command-palette feel — exact px deferred to implementer; must match Workflowy reference (img-41) |
| Height | Auto. Grows with hint/suggestion/listbox content |
| Corner radius | Large rounded — semantic token TBD by implementer |
| Elevation | Single soft shadow, no border, sits above outline |
| Anchor | Centered horizontally; vertical offset from top of viewport (not full-screen) |
| Z-index | Above outline + sidebars; below modals/dialogs |
| Pinning | When pinned (see file 04 / `⌘.`), popover persists on outside-click |

---

## 2. Region map

The popover is composed of **5 stacked regions**, top to bottom:

1. **Header row** — input + right-side action icons (always visible)
2. **Filter tab rail** — 6 horizontally-arranged tabs (always visible; see [`02-filter-tab-rail.md`](./02-filter-tab-rail.md))
3. **Hint / suggestions area** — context-sensitive content (see [`03-hint-and-suggestions.md`](./03-hint-and-suggestions.md))
4. **Value-picker listbox** — appears inline when a `key:` token expects an enum value (e.g. `has:`, `is:`)
5. **Footer pill** (rendered OUTSIDE the popover, anchored to viewport bottom-center) — match count + cycling controls (see [`07-results-and-highlighting.md`](./07-results-and-highlighting.md))

> Region 5 is logically part of the search experience but is NOT a child of the popover DOM.

---

## 3. Header row composition

Left-to-right, the header row contains:

| Slot | Element | Notes |
|------|---------|-------|
| L1 | Search icon (Lucide `Search`) | Decorative; non-interactive |
| L2 | **Input field** — flexible width | Single-line; holds free text + inline token chips (see [`05-token-system.md`](./05-token-system.md)) |
| R1 | ⚡ Quick Actions trigger | See [`04-right-action-icons.md`](./04-right-action-icons.md) |
| R2 | ⭐ Saved Searches trigger | Same |
| R3 | ⊗ Clear / Close | Same |

Spacing between left icon and input is small; right icons are grouped tightly with consistent gap.

---

## 4. Focus ring & focus order

- The popover container does **not** show a focus ring; only the input and individual interactive elements do.
- Initial focus on open: **input field**.
- Tab order: input → tab rail (cycles through 6 tabs) → suggestion chips (if any) → right-side icons (R1 → R2 → R3) → loops back to input.
- Shift+Tab reverses.
- Focus must remain trapped inside the popover until close (Esc / outside-click while unpinned). Trap rules detailed in [`10-accessibility.md`](./10-accessibility.md).

---

## 5. Open / close geometry

| Trigger | Result |
|---------|--------|
| `⌘K` / `Ctrl+K` (global) | Opens popover, focuses input, restores last query if `pinned` flag was set in the same session |
| Navbar Search icon click | Same as above |
| Outside click | Closes (unpinned) / no-op (pinned) |
| `Esc` | Closes; if input has content, first press clears query, second press closes |
| Cmd/Ctrl + . | Toggles `pinned` flag |

Animation: short fade + small Y translate. Respect `prefers-reduced-motion` — see [`09-states-and-edge-cases.md`](./09-states-and-edge-cases.md).

---

## 6. Empty / loaded states (visual only)

| State | Region 3 content |
|-------|------------------|
| Just opened, empty input | Default hint text (see file 03) |
| Tab selected, empty input | Tab-specific suggestion chips |
| Input has free text only | Live-filter outline; hint shows "Press space then a keyword to add a filter" |
| Token committed | Show grammar legend or remaining suggestions for the current key |
| Invalid token | Inline error chip variant (red border) — see [`09-states-and-edge-cases.md`](./09-states-and-edge-cases.md) |

State transitions and full state matrix live in file 09.

---

## 7. Responsive behavior (overview)

| Viewport | Behavior |
|----------|----------|
| ≥ md | Popover anchored top-center as described above |
| < md | Becomes a bottom sheet — full-width, rounded only at top corners. Detail in [`09-states-and-edge-cases.md`](./09-states-and-edge-cases.md) § Mobile |
| RTL | Left ↔ right slot mirroring; chips flow right-to-left. Detail in file 09 |

---

## 8. Cross-references

- [`02-filter-tab-rail.md`](./02-filter-tab-rail.md) — Region 2 details
- [`03-hint-and-suggestions.md`](./03-hint-and-suggestions.md) — Region 3 + 4 details
- [`04-right-action-icons.md`](./04-right-action-icons.md) — Header right slots
- [`07-results-and-highlighting.md`](./07-results-and-highlighting.md) — Region 5 (footer pill)
- [`10-accessibility.md`](./10-accessibility.md) — Focus trap, ARIA roles
- [`12-icon-map.md`](./12-icon-map.md) — Lucide component names
