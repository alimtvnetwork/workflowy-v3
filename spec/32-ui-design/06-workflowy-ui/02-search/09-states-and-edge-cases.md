# 09 — States & Edge Cases

> **Version:** 2.0.0 · **Created:** 2026-04-23 (UTC+8) · **Status:** ✅ Authored
> **Parent:** [`./00-overview.md`](./00-overview.md)

---

## Purpose

Enumerate the **8 popover states**, then exhaustively cover edge cases (zero results, invalid tokens, long values, duplicates, pinned, mobile, RTL, reduced-motion, offline). This is the file an implementer reaches for "what should happen when …".

---

## 1. State machine

| # | State | Entry condition | Exit condition |
|---|-------|-----------------|----------------|
| S1 | **Closed** | App start, or close action | `⌘K`, navbar click, or pinned + previously open |
| S2 | **Open-empty** | Just opened, no input | User types, picks chip, or closes |
| S3 | **Open-typing-free** | Input has free text only | Token committed → S4, or input cleared → S2 |
| S4 | **Open-with-tokens** | ≥1 chip committed | All chips removed → S2 or S3 |
| S5 | **Open-picker** | Value picker open (Region 4) | Value selected, Esc, or click-outside picker |
| S6 | **Open-error** | Invalid pre-commit fragment | Fragment fixed or removed |
| S7 | **Closed-active-query** | Popover closed but query active (pinned OFF) | Re-open popover or clear via footer pill |
| S8 | **Pinned-open** | Pinned = true | Pin toggled OFF + close action |

Transitions outside this matrix are bugs.

---

## 2. Edge cases

### 2.1 Zero results
- Footer pill renders `0 matches` (file 07).
- Region 3 hint copy: *"No items match. Try removing a filter or relaxing your query."*
- Suggestion: show a "Remove last filter" inline action when ≥1 chip exists.

### 2.2 Invalid token (pre-commit)
- Input red underline on the failing fragment.
- Region 3 inline error: *"Unknown filter `<key>`. Try `is`, `has`, `date`, `in`, `text`, `link`."*
- Commit is blocked; user can keep typing or `Backspace`.

### 2.3 Conflicting tokens (e.g. `is:complete -is:complete`)
- Allowed; results will be empty. Use § 2.1 zero-results UX.

### 2.4 Duplicate tokens
- Allowed (no-op semantically). No de-duplication on commit.

### 2.5 Very long values
- Quoted text values capped at 200 characters (soft) — typing beyond shows a soft warning hint.
- URL values in `link:` show ellipsis truncation in the chip; full value visible on hover/focus tooltip.
- Mention handles longer than 40 chars: ellipsis at chip width.

### 2.6 Many tokens
- Soft cap warning at 20 chips (perf hint only). No hard block.
- Input remains horizontally scrollable.

### 2.7 Pinned state
- Outside-click does nothing.
- Esc still works (clears then closes).
- Closing while pinned preserves the pinned flag for the session via `sessionStorage["workflowy.search.pinned"] = "1"` (UI-only; cleared on tab close — no server round-trip).
- Visual: pin icon variant on the popover (or in Quick Actions toggle).

### 2.8 Mobile (< md viewport)
- Popover renders as **bottom sheet**: full width, anchored to bottom, rounded only at top corners.
- Tab rail becomes a horizontally scrollable strip; labels hidden, icons + tooltips only.
- Quick Actions and Saved Searches each open as a sub-sheet stacked above.
- Footer pill repositions above the sheet rather than overlapping.

### 2.9 RTL
- Header row mirrors: search icon right, action icons left.
- Chips flow right-to-left.
- `←` / `→` keyboard semantics swap to follow the visual reading order.

### 2.10 Reduced motion (`prefers-reduced-motion: reduce`)
- Popover open/close: no Y-translate; instant opacity swap (or 50ms fade).
- Footer pill cycling: no smooth scroll; jump scroll instead.
- Suggestion picker animations disabled.

### 2.11 Offline / engine unavailable
- If filter engine cannot run (e.g. backend offline, future runtime issue):
  - Popover still opens; input still accepts text and tokens.
  - Region 3 banner: *"Search is offline — results will appear when reconnected."*
  - Footer pill hidden.
- This is a forward-spec for future runtime; current launch can ignore.

### 2.12 Multiple matches per node
- A single node containing several substring matches counts as ONE node-match for the count, but cycles through individual `<mark>` spans within Region 5 cycling controls.
- Implementer may toggle node-level vs span-level cycling — spec accepts either; default = span-level.

### 2.13 Mention of deleted user
- Token chip renders with a "deleted user" affordance (greyed text, tooltip *"User no longer in workspace"*).
- Query still resolves; results may be empty.

### 2.14 `in:` scope deleted
- Silent drop at resolution; Region 3 hint *"Some scopes are no longer available and were ignored."*

### 2.15 Sharing disabled
- Mentions and People tabs disabled (file 02 § 7).
- `@user`, `me`, `others` tokens still parseable but yield zero results.

### 2.16 Very large outline (> 50k items)
- Footer pill shows `N+` notation (e.g. `500+ matches`) past the budget.
- Cycling iterates only the first 500 by default; "Show more" button reveals additional batches.

---

## 3. Cross-references

- [`07-results-and-highlighting.md`](./07-results-and-highlighting.md) — cycling and footer pill
- [`05-token-system.md`](./05-token-system.md) — chip behavior
- [`10-accessibility.md`](./10-accessibility.md) — reduced-motion + ARIA states
- `mem://constraints/backend-runtime-deferred` — offline behavior is forward-spec (memory-only reference)
