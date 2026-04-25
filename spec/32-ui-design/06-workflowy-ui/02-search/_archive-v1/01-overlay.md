# Phase 2 — Search Overlay (Layout & Interaction)

> **Version:** 1.0.0
> **Created:** 2026-04-21 (UTC+8)
> **Status:** ✅ Authored
> **Parent:** [`../00-overview.md`](../00-overview.md) (archived — see `_archive-v1/README.md`)
> **Screenshots:** img-40, img-41, img-42, img-43, img-44, img-58
> **Sibling:** [`./02-filter-syntax.md`](./02-filter-syntax.md)

---

## 1. Purpose

Defines the visual structure, states, and keyboard/pointer interactions of the **full-screen Search Overlay** that opens when the user clicks the navbar search field or presses the global search shortcut.

This file describes **what the overlay looks like and how it behaves**. The grammar of what the user types into it lives in [`02-filter-syntax.md`](./02-filter-syntax.md).

---

## 2. Activation & Dismissal

| Action | Trigger |
|--------|---------|
| **Open** | Click the search input in the navbar (see `../01-navbar/01-layout.md` § Right cluster). |
| **Open (keyboard)** | Global shortcut — final binding deferred to Phase 8 (`../08-app-shell/`). Provisional intent: Cmd/Ctrl + K. |
| **Close** | Press `Esc`, click the overlay background outside the panel, or click the explicit ✕ in the panel top-right. |
| **Submit** | Press `Enter` to commit the current query — focus moves to first result and overlay stays open. |
| **Re-focus query** | Press `/` while results have focus to return caret to the query input. |

When the overlay closes without a committed search, the navbar search input returns to its empty resting state. When the overlay closes after a committed search, the navbar shows the query as a chip (forward-reference: chip behavior detailed in Phase 3 right-panel cross-spec, not here).

---

## 3. Layout (Desktop ≥ 768 px)

The overlay is a centered modal panel rendered above a full-viewport scrim.

### 3.1 Scrim (backdrop)

| Property | Value |
|----------|-------|
| Coverage | 100 vw × 100 vh, `position: fixed`, z-index above all app chrome. |
| Color | Foreground color at low opacity (token-driven; ≈ 40–50% of `--foreground`). |
| Blur | Subtle backdrop blur (≈ 8 px) so background content remains hinted but unreadable. |
| Click | Closes overlay. |

### 3.2 Panel

| Property | Value |
|----------|-------|
| Width | `min(720px, 92vw)` |
| Max height | `min(640px, 80vh)` — internal scroll for results region only. |
| Position | Horizontally centered; vertically anchored ≈ 12% from viewport top. |
| Background | `--popover` token. |
| Border | 1 px `--border` token. |
| Radius | Large (≈ 12 px). |
| Shadow | Elevated shadow token (level 3 / largest preset). |

### 3.3 Internal regions (top → bottom)

```
┌────────────────────────────────────────────────────┐
│  [🔍] [ query input ........................ ] [✕]│  ← Query row
├────────────────────────────────────────────────────┤
│  [🌐] [@] [📅] [🕐] [👥] [⋯]                      │  ← Filter tab strip
├────────────────────────────────────────────────────┤
│  ☐ Include mirrors in results                      │  ← Toggle row (img-58)
├────────────────────────────────────────────────────┤
│                                                    │
│  Results (scrollable)                              │
│                                                    │
├────────────────────────────────────────────────────┤
│  N results · ↵ open · ⌘↵ open in new pane · Esc    │  ← Footer hint bar
└────────────────────────────────────────────────────┘
```

---

## 4. Query Row

| Element | Spec |
|---------|------|
| Search icon (left) | Decorative, color `--muted-foreground`. |
| Input | Single-line text. Placeholder: `"Search WorkFlowy"`. Auto-focuses on open. Caret-blink on. |
| Clear (✕, right) | Visible only when input has content. Click clears query, keeps overlay open, refocuses input. |
| Typography | Same body font as app, font-size one step larger than default body (≈ 16 px). |
| Behavior | Query updates results live (debounce ≈ 120 ms). No "Search" button — typing IS searching. |

---

## 5. Filter Tab Strip (img-41, img-42, img-43, img-44)

A horizontal row of **6 tabs** sitting directly under the query row. Each tab acts as a quick-injection shortcut: clicking a tab inserts the corresponding filter prefix into the query (with caret positioned ready for value entry).

| # | Tab icon | Label (tooltip) | Action — inserts | Source spec |
|---|---------|-----------------|------------------|-------------|
| 1 | 🌐 globe | All / Anywhere | clears scope filters | [`./02-filter-syntax.md`](./02-filter-syntax.md) § Scope |
| 2 | @ at | Mentions | `@` token at caret | § Mentions |
| 3 | 📅 calendar | Dated items | `date:` prefix | § Date filters |
| 4 | 🕐 clock | Recent activity | `changed:` prefix | § Activity filters |
| 5 | 👥 people | By person | `created:` prefix | § People filters |
| 6 | ⋯ more | Advanced | opens inline submenu of remaining filters (`is:`, `has:`, `in:`, `text:`, `link:`, `highlight:`) | § Structural & content filters |

**Tab visual states:**

| State | Treatment |
|-------|-----------|
| Default | Icon `--muted-foreground`, no background. |
| Hover | Background = muted surface (≈ 60% opacity of `--muted`). |
| Active (filter present in query) | Icon `--foreground`, background `--accent`, small dot indicator below icon. |
| Focused (keyboard) | 2 px outline `--ring`. |

**Keyboard:** `Tab` from query input cycles through the strip. `Enter` on a focused tab triggers its insertion action and returns focus to the query input.

---

## 6. Mirror Inclusion Toggle (img-58)

A single labeled checkbox row directly below the filter tabs.

| Property | Value |
|----------|-------|
| Label | "Include mirrors in results" |
| Default | **Off** — search returns only original nodes; mirror clones are suppressed. |
| When On | Each mirror clone appears as its own result with a small `↪ mirror` badge next to its breadcrumb. |
| Persistence | The toggle state persists across overlay open/close within a session. Reset to Off on app reload. |
| Forward-ref | Mirror semantics defined in mirroring spec (cross-reference; not duplicated here). |

---

## 7. Results Region

### 7.1 Empty states

| Condition | Display |
|-----------|---------|
| Query empty + no filters | Recent searches list (max 5) + "Tip: type `is:todo` to find unfinished items" hint. |
| Query non-empty, zero matches | Centered message: `"No results for «query»"` plus "Check your filter syntax" link → opens [`./02-filter-syntax.md`](./02-filter-syntax.md) reference card inline. |

### 7.2 Result row anatomy

```
●  Node content with <mark>matched</mark> term highlighted
   Home › Projects › Q2 Roadmap › …   · changed 2d ago
```

| Element | Spec |
|---------|------|
| Bullet dot | Same `●` token used in editor (forward-ref: bullet anatomy in Phase 4). |
| Content | Single line, truncated with `…`. Matched substrings wrapped in `<mark>` using `--accent` background. |
| Breadcrumb | Full ancestor path, separator `›`, truncated middle with `…` if > 60 chars. Color `--muted-foreground`, smaller font. |
| Meta tail | One of: `changed Xd ago`, `created Xd ago`, or date if filter was a date filter. |
| Mirror badge | `↪ mirror` chip (only when mirror toggle is On AND row is a mirror clone). |

### 7.3 Result row states

| State | Treatment |
|-------|-----------|
| Default | Transparent background. |
| Hover / keyboard-focused | Background `--accent`, cursor pointer. |
| Selected (committed via Enter) | Background `--accent`, left border 2 px `--primary`. |

### 7.4 Pagination / virtualization

- First 50 results render eagerly. Remainder is lazy-loaded on scroll.
- Hard cap: 250 visible results (matches Core memory rule). Beyond that, footer shows `"250+ results — refine your query"`.

---

## 8. Footer Hint Bar

Single-line hint row anchored to the panel bottom, font-size one step smaller than body, color `--muted-foreground`.

```
N results  ·  ↵ open  ·  ⌘↵ open in side pane  ·  Esc to close
```

`N` updates live with the result count. The `⌘` glyph swaps to `Ctrl` on non-Mac platforms (per global hotkey rule from Phase 1).

---

## 9. Interaction Matrix

| Action | Result |
|--------|--------|
| `↑` / `↓` while overlay open | Move keyboard focus through result rows. |
| `Enter` on focused row | Open node (navigate to it; overlay closes). |
| `Cmd/Ctrl + Enter` on focused row | Open node in side pane (forward-ref: side-pane behavior in Phase 3). |
| `Tab` from query input | Move focus to filter tab strip. |
| `Shift + Tab` from filter strip | Return focus to query input. |
| Click result | Same as `Enter` on it. |
| Type while results focused | Caret returns to query input and character is appended. |

---

## 10. States (overlay-level)

| State | Trigger | Visual |
|-------|---------|--------|
| Loading | Query changed, results computing | Subtle 1 px progress bar at top of results region using `--primary`. |
| Error | Query parser failed (e.g. malformed `date:` value) | Inline red helper text under query row: `"Couldn't parse «token» — see filter syntax"` (link). Results region shows last valid result set greyed at 60%. |
| Offline | App is offline | Footer left side prefixed with `⚠ Offline — searching local cache only`. |

---

## 11. Mobile (< 480 px)

> **Forward-reference only — final mobile behavior is deferred to Phase 10 (`../10-mobile/`).**
> Provisional intent: overlay becomes full-screen (no scrim margin), filter tab strip becomes horizontally scrollable, footer hint bar collapses to single icon row.

---

## 12. Open Items

None — overlay structure is fully specified. Filter grammar details deferred to sibling [`./02-filter-syntax.md`](./02-filter-syntax.md).
