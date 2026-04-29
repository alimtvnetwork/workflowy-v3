# 03 — Mobile Gestures

> **Version:** 1.0.0
> **Status:** DEFERRED (post-v1; spec authored, not implemented)
> **Parent:** [`00-overview.md`](./00-overview.md)
> **Screenshots:** img-57

---

## Goal

Touch-first interaction model that maps every desktop hotkey or context menu to a single-handed gesture without sacrificing the outliner's keyboard-driven feel.

---

## Gesture Map

| Gesture | Action | Equivalent desktop |
|---------|--------|--------------------|
| Tap bullet | Zoom into node | Click bullet |
| Long-press bullet (300ms) | Open bullet context menu | Right-click bullet |
| Swipe right on row | Indent | `Tab` |
| Swipe left on row | Outdent | `Shift+Tab` |
| Two-finger swipe down on row | Move down | `Cmd+Shift+↓` |
| Two-finger swipe up on row | Move up | `Cmd+Shift+↑` |
| Pinch to zoom out | Zoom to parent | `Cmd+←` (Phase 3 [`02-hotkeys.md`](../03-right-panel/02-hotkeys.md) § Navigation) |
| Spread to zoom in | Zoom into focused node | `Cmd+→` (Phase 3 [`02-hotkeys.md`](../03-right-panel/02-hotkeys.md) § Navigation) |
| Pull down at top of view | Refresh / sync now | (no desktop equivalent) |
| Long-press chevron | Expand / collapse all descendants | `Alt+Click` chevron |

---

## Tap Targets

| Element | Min size | Padding |
|---------|----------|---------|
| Bullet | 44 × 44 pt | 12 pt around 8 pt visual |
| Chevron | 36 × 36 pt | 10 pt around 6 pt visual |
| Inline link | 32 pt height | 6 pt vertical |
| Toolbar button | 44 × 44 pt | — |

All sizes meet WCAG 2.5.5 target-size minimum.

---

## Floating Action Bar

A bottom-anchored toolbar replaces the slash menu on touch devices:

| Button | Action |
|--------|--------|
| `+` | New child node under focus |
| `↹` / `⇤` | Indent / outdent current row |
| `B` `I` `U` | Bold / italic / underline |
| `≡` | Open formatting sheet (full slash menu) |
| `🎨` | Color picker (text + highlight) |
| `↩` / `↪` | Undo / redo |

The bar slides up with the keyboard and remains pinned above it.

---

## Selection Mode

Long-press on a row enters multi-select mode:

- All rows show selection chips on the left.
- Tap row → toggle selection.
- Top bar shows count + actions: Move, Delete, Color, Cancel.
- Tap blank area or Cancel → exit selection mode.

This replaces Shift/Cmd-click which has no touch equivalent.

---

## Edge Cases

- **Accidental swipe vs. scroll** — Horizontal swipe must exceed 40 pt before being treated as indent/outdent; vertical scroll always wins for shorter movements.
- **Long-press during text edit** — Suppressed to allow native iOS/Android text-selection handles.
- **Pinch on read-only view** — Pinch gesture used for browser zoom instead.
- **Landscape on phone** — Sidebar always offcanvas; never auto-pinned.

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Time-to-interactive (3G) | ≤ 3.5s |
| Gesture recognition latency | ≤ 50ms |
| Frame rate during drag-reorder | ≥ 55fps on mid-tier Android |
| Cold app start (PWA) | ≤ 1.5s |

---

## Related

- [`00-overview.md`](./00-overview.md) — Phase 10 parent
- [`01-pwa.md`](./01-pwa.md) — Install + offline foundations
- [`../04-bullet/00-overview.md`](../04-bullet/00-overview.md) — Bullet anatomy (desktop equivalents)
- [`../05-editor/00-overview.md`](../05-editor/00-overview.md) — Editor toolbar parity
