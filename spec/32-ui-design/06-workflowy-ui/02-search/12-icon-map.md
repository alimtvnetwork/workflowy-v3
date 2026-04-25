# 12 — Icon Map

> **Version:** 1.0.0 · **Created:** 2026-04-25 (UTC+8) · **Status:** ✅ Authored
> **Parent:** [`00-overview.md`](./00-overview.md)
> **Library:** [`lucide-react`](https://lucide.dev) (already in project deps)

---

## Scope

Canonical mapping from semantic icon role → Lucide React component. **No emojis appear in production code**; emojis in spec docs are illustrative only. Icon size is `16px` (chip/inline) or `18px` (header/action) unless noted.

---

## 1. Tab Rail Icons

| Tab | Lucide component | Size | Notes |
|-----|------------------|------|-------|
| Scope | `Globe` | 16 | Default tab |
| Mentions | `AtSign` | 16 | — |
| Dates | `CalendarDays` | 16 | Prefer `CalendarDays` over plain `Calendar` for visual weight |
| History | `History` | 16 | — |
| People | `Users` | 16 | — |
| More | `MoreHorizontal` | 16 | Three-dot horizontal |

---

## 2. Header Icons

| Role | Lucide component | Size | Notes |
|------|------------------|------|-------|
| Search input prefix | `Search` | 18 | Left of input, `--muted-foreground` |
| Loading spinner (debounce active) | `Loader2` | 16 | `animate-spin`, replaces Search prefix during pending state |

---

## 3. Right Action Icons

| Role | Lucide component | Size | Notes |
|------|------------------|------|-------|
| Quick Actions trigger | `Zap` | 18 | Lightning bolt; tooltip "Quick actions (⌘J)" |
| Saved Searches trigger | `Star` | 18 | Filled when current query matches a saved entry |
| Clear input | `X` | 18 | Visible only when input has content |
| Close popover | `XCircle` | 18 | Visible when input is empty (replaces Clear) |
| Pin popover open | `Pin` | 16 | Shown in Quick Actions menu |

> The single rightmost slot toggles between `X` (clear) and `XCircle` (close) based on input state. See [`04-right-action-icons.md`](./04-right-action-icons.md) § Clear/Close state machine.

---

## 4. Token Chip Icons

| Role | Lucide component | Size | Notes |
|------|------------------|------|-------|
| Negation indicator | `Minus` | 12 | Prefix on negated chips (`-is:completed`) |
| Chip delete affordance | `X` | 12 | Hover-revealed on chip; full chip is also clickable |
| Edit indicator | `Pencil` | 12 | Shown on hover when chip is editable |

---

## 5. Picker / Suggestion Icons

| Role | Lucide component | Size | Notes |
|------|------------------|------|-------|
| Date suggestion | `CalendarDays` | 14 | Inline with text |
| User suggestion | `User` | 14 | Singular `User`, not `Users` |
| Tag suggestion | `Hash` | 14 | — |
| Link suggestion | `Link` | 14 | — |
| Highlight color suggestion | `Highlighter` | 14 | — |
| Item type suggestion (`is:`) | varies | 14 | Per item type — see [`../05-editor/03-item-types.md`](../05-editor/03-item-types.md) § Item Type → Lucide Icon Map |
| Saved search row | `Star` | 14 | — |
| Recent search row | `Clock` | 14 | — |

---

## 6. Footer Icons

| Role | Lucide component | Size | Notes |
|------|------------------|------|-------|
| Previous match | `ChevronUp` | 16 | `↑` / `Shift+F3` |
| Next match | `ChevronDown` | 16 | `↓` / `F3` |
| Match count separator | — | — | Use bullet character `•` (text, no icon) |

---

## 7. Quick Actions Menu Icons

| Action | Lucide component | Size | Notes |
|--------|------------------|------|-------|
| Toggle "include completed" | `CheckCircle2` | 16 | — |
| Toggle "include mirrors" | `Copy` | 16 | — |
| Toggle "expand all matches" | `Expand` | 16 | — |
| Pin popover | `Pin` | 16 | — |
| Save current query | `Bookmark` | 16 | — |

---

## 8. Empty / Error State Icons

| State | Lucide component | Size | Notes |
|-------|------------------|------|-------|
| Zero results | `SearchX` | 32 | Centered in popover body |
| Parse error | `AlertCircle` | 16 | Inline beside offending token |
| Truncated query (>200 chars) | `AlertTriangle` | 16 | Footer warning |

---

## 9. Implementation rules

- Always import named components: `import { Search, X, Globe } from "lucide-react"`.
- Never use `<i className="icon-...">` or emoji glyphs in JSX.
- Apply `aria-hidden="true"` to all decorative icons; provide `aria-label` on the parent button instead.
- Stroke width default: `1.75` (Lucide default `2` is too heavy at 14–16px).
- Color: inherit `currentColor` so the icon follows the parent's text color token.

---

## 10. Cross-references (resolved)

- ✅ Phase 5 [`../05-editor/03-item-types.md`](../05-editor/03-item-types.md) § Item Type → Lucide Icon Map — canonical icon map for `is:` suggestions.
- ✅ Phase 5 [`../05-editor/04-color-palettes.md`](../05-editor/04-color-palettes.md) — 11 highlight color swatches (hex enumerated) for `highlight:` suggestions.
- ✅ Phase 8 [`../08-app-shell/00-overview.md`](../08-app-shell/00-overview.md) § Global Hotkey Registration — owns global hotkey registry incl. `⌘K`.
