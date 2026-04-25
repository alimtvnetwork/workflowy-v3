# 10 — Accessibility

> **Version:** 1.0.0 · **Created:** 2026-04-25 (UTC+8) · **Status:** ✅ Authored
> **Parent:** [`00-overview.md`](./00-overview.md)
> **Related:** [`01-popover-anatomy.md`](./01-popover-anatomy.md) · [`02-filter-tab-rail.md`](./02-filter-tab-rail.md) · [`07-results-and-highlighting.md`](./07-results-and-highlighting.md) · [`08-keyboard-shortcuts.md`](./08-keyboard-shortcuts.md)

---

## Scope

Normative accessibility contract for the Search Popover. Covers ARIA roles, focus management, live regions, contrast, motion, and assistive-tech expectations. WCAG 2.2 **Level AA** is the minimum bar; AAA for text contrast where feasible.

---

## 1. Landmark & Role Map

| Region | Element | ARIA role | Notes |
|--------|---------|-----------|-------|
| Popover container | `<div>` | `dialog` | `aria-modal="false"` (non-blocking), `aria-label="Search"` |
| Header input | `<input type="text">` | `combobox` | `aria-expanded`, `aria-controls="wf-search-listbox"`, `aria-autocomplete="list"` |
| Tab rail | `<div>` | `tablist` | `aria-orientation="horizontal"`, `aria-label="Search filters"` |
| Tab buttons | `<button>` | `tab` | `aria-selected`, `aria-controls="wf-search-panel-{id}"`, `tabindex="-1"` for inactive |
| Hint area | `<div>` | `region` | `aria-label="Search hints"` |
| Suggestion chips | `<button>` | `option` inside `listbox` | `aria-selected` reflects keyboard focus |
| Value picker | `<ul>` | `listbox` | `id="wf-search-listbox"`, single-select |
| Footer match pill | `<output>` | (implicit `status`) | `aria-live="polite"`, `aria-atomic="true"` |
| Right action icons | `<button>` | `button` | `aria-label` required (icon-only) |
| Tokens | `<span>` | `button` | Each chip is keyboard-focusable; `aria-label="<keyword> filter, value <value>, press Backspace to remove"` |

---

## 2. Focus Management

| Event | Behavior |
|-------|----------|
| `⌘K` open | Focus moves to header input. Page scroll position preserved. Body retains `aria-hidden="false"` (non-modal). |
| Tab key inside popover | Cycles through: input → tabs (one stop, arrow keys cycle internally) → action icons → footer. Wraps. |
| `Escape` | Closes popover. Focus returns to the **trigger element** (or last-focused outline node if opened via hotkey). |
| Click outside | Closes; focus returns to last-focused outline node. |
| Token edit mode | Focus enters mini-input; `Escape` exits to chip; `Enter`/blur commits. |
| Result cycling (`↑`/`↓` in footer) | Focus stays in popover; visual selection moves in outline; screen reader announces match index. |

**Focus trap:** SOFT trap — Tab cycles within popover, but `Escape` and outside-click both release. No hard trap (popover is non-modal).

**Focus ring:** Visible 2px outline using `--ring` token on every focusable element. Never suppressed.

---

## 3. Live Regions

| Region | Politeness | Trigger | Announcement template |
|--------|-----------|---------|----------------------|
| Match count pill | `polite` | After 80ms debounce settles | `"{N} matches"` or `"No matches"` |
| Tab change | `polite` | After tab activation | `"{TabName} filters active"` |
| Token added | `polite` | On commit | `"{keyword} filter added: {value}"` |
| Token removed | `polite` | On delete | `"{keyword} filter removed"` |
| Picker open | `polite` | When listbox renders | `"{N} options available, use arrow keys"` |
| Saved search loaded | `assertive` | On click | `"Loaded saved search: {name}"` |

All live regions use `aria-atomic="true"` to read full message, not deltas.

---

## 4. Keyboard Equivalents

Every mouse interaction has a keyboard equivalent. See [`08-keyboard-shortcuts.md`](./08-keyboard-shortcuts.md) for full matrix. Critical ones:

- Open: `⌘K` / `Ctrl+K` (no mouse path required)
- Token delete: `Backspace` twice (select → confirm)
- Picker selection: `Enter` (mouse: click)
- Result cycling: `↑`/`↓` in footer or `F3`/`Shift+F3` (mouse: click chevrons)

---

## 5. Contrast Targets

| Surface | Foreground | Min ratio | Target |
|---------|-----------|-----------|--------|
| Popover body | `--foreground` on `--popover` | 4.5:1 | AA |
| Placeholder text | `--muted-foreground` on `--popover` | 4.5:1 | AA |
| Token chip text | `--accent-foreground` on `--accent` | 4.5:1 | AA |
| Active tab | `--accent-active-foreground` on `--accent-active` | 7:1 | AAA preferred |
| Highlighted match `<mark>` | `--highlight-foreground` on `--highlight` | 4.5:1 | AA |
| Focus ring | `--ring` on any surface | 3:1 (non-text) | AA |
| Footer pill | `--foreground` on `--muted` | 4.5:1 | AA |

Tokens marked with `*` in [`11-design-tokens.md`](./11-design-tokens.md) must meet these ratios in **both** light and dark themes.

---

## 6. Reduced Motion

When `prefers-reduced-motion: reduce`:

- Popover open/close: instant (no scale/fade transition)
- Token commit: no slide-in animation
- Tab change: no underline slide; instant swap
- Match count pill: no count-up animation
- Highlight pulse on result navigation: replaced with single static frame

See [`09-states-and-edge-cases.md`](./09-states-and-edge-cases.md) § Reduced Motion for full edge-case behavior.

---

## 7. Screen Reader Walkthroughs

### 7.1 First open (NVDA / VoiceOver)
1. `"Search dialog"` (role + label)
2. `"Search, combobox, expanded, blank"` (input + state)
3. `"Search filters, tab list, Scope tab selected, 1 of 6"` (rail context)
4. Default hint text read on demand (cursor down)

### 7.2 Adding a token
1. User types `is:`, picker opens.
2. Announce: `"4 options available, use arrow keys"`
3. Arrow down: `"completed, option 1 of 4"`
4. Enter: `"is: completed filter added"` + `"3 matches"` (after debounce)

### 7.3 Zero results
1. Input changes, debounce settles.
2. Announce: `"No matches"`
3. Outline region: `"No items match current query"` (separate live region in outline, not popover)

---

## 8. Touch & Pointer

- All interactive targets ≥ **44×44 CSS px** on mobile sheet variant.
- Token chip delete affordance ≥ **24×24** with extended hit area to 32×32.
- No hover-only affordances; every hover state has an equivalent focus state.

---

## 9. Internationalization

- Tab labels and hint copy localized; ARIA labels follow active locale.
- RTL: tab rail mirrors; tokens flow right-to-left; picker anchors right (see [`09-states-and-edge-cases.md`](./09-states-and-edge-cases.md) § RTL).
- Numbers in match pill use locale-aware formatting (`Intl.NumberFormat`).

---

## 10. Testing Checklist (normative)

- [ ] NVDA + Firefox: all 7.x walkthroughs pass
- [ ] VoiceOver + Safari: all 7.x walkthroughs pass
- [ ] Keyboard-only: complete a search, add 3 tokens, navigate matches, save, close — without mouse
- [ ] `prefers-reduced-motion`: all animations suppressed
- [ ] 200% browser zoom: layout intact, no clipping
- [ ] axe-core: zero violations on default + filled states
- [ ] Contrast: automated (axe) + manual sampling for `<mark>` overlays

---

## Acceptance Criteria refs

`AT-WF02-A11Y-17`, `AT-WF02-A11Y-18` — see [`97-acceptance-criteria.md`](./97-acceptance-criteria.md).
