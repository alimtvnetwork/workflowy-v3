# 1. Navbar Layout

> **Parent:** [`./00-overview.md`](./00-overview.md)
> **Reference:** `40-navbar-breadcrumb.png`, `60-left-menu-button.png`

---

## Visual anatomy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ≡   ←  →  ⌂   Home › … › Project A › Current Node       🔍  ↗  ⋮  ⌘/      │
│  └─────────────┘ └────────────── breadcrumb ──────────────┘ └─── actions ──┘ │
│   left region              center region (flex-1)             right region   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Regions

| Region | Width | Contents | Notes |
|--------|-------|----------|-------|
| **Left** | content-width (auto) | `≡` toggle · `←` back · `→` forward · `⌂` home | Fixed order. Each control is a 32×32 px icon button. |
| **Center** | `flex: 1` | Breadcrumb path (or focused-node title at root) | Truncates middle when overflowing — see [`02-breadcrumb.md`](./02-breadcrumb.md). |
| **Right** | content-width (auto) | `🔍` search · `↗` share · `⋮` more · `⌘/` panel toggle | Fixed order. Share and panel-toggle icons are conditionally hidden — see below. |

---

## Control inventory

### Left region

| Control | Icon | Tooltip | Shortcut | Action |
|---------|------|---------|----------|--------|
| Left menu | `≡` (hamburger) | "Open sidebar" | `Ctrl+L` | Toggles left sidebar offcanvas. See [`../06-sidebar/`](../06-sidebar/00-overview.md). |
| Back | `←` | "Go back" | `Alt+←` | Pops one entry from focus history stack. Disabled when stack empty. |
| Forward | `→` | "Go forward" | `Alt+→` | Re-pushes a popped entry. Disabled when no forward stack. |
| Home | `⌂` | "Go to home" | `Ctrl+⇧+H` | Focuses the user's root node, clears forward stack. |

### Right region

| Control | Icon | Tooltip | Shortcut | Action |
|---------|------|---------|----------|--------|
| Search | `🔍` (magnifier) | "Search" | `Ctrl+K` | Opens full-screen search overlay. See [`../02-search/`](../02-search/00-overview.md). |
| Share | `↗` (up-right arrow) | "Share this node" | — | Opens share dialog for currently focused node. **Hidden at home root.** |
| More | `⋮` (vertical ellipsis) | "More actions" | — | Opens app menu. See [`../08-app-shell/`](../08-app-shell/00-overview.md). |
| Panel toggle | `⌘/` glyph | "Open Handbook & Hotkeys" | `Ctrl+/` (or `⌘/` on Mac) | Toggles right-side panel. See [`../03-right-panel/`](../03-right-panel/00-overview.md). |

---

## Dimensions

| Property | Value |
|----------|-------|
| Navbar height | 48 px (mobile + desktop, no responsive change) |
| Icon button size | 32 × 32 px |
| Icon glyph size | 16 × 16 px |
| Horizontal padding | 12 px (left edge + right edge) |
| Inter-button gap (left region) | 4 px |
| Inter-button gap (right region) | 4 px |
| Center region inset from edges | 16 px (gap between left region and breadcrumb start) |

---

## Behavior at breakpoints

| Viewport | Behavior |
|----------|----------|
| ≥ 768 px | All controls visible. Breadcrumb shows as much as fits. |
| 480–767 px | All controls visible. Breadcrumb truncates aggressively (may show only `Home › … › Current`). |
| < 480 px | `←` and `→` collapse into the left menu (≡). Share icon collapses into ⋮ menu. |

---

## States

| State | Visual treatment |
|-------|------------------|
| Default | All icons at full opacity. |
| Hover (icon button) | Background `bg-muted/60`, cursor `pointer`. |
| Active/pressed | Background `bg-muted`, slight scale-down (0.95). |
| Disabled (back/forward) | Opacity 0.4, no hover effect, cursor `not-allowed`. |
| Focused via keyboard | 2 px outline using `--ring` token. |

---

## Tokens (Tailwind v4 `@theme`)

| Token | Usage |
|-------|-------|
| `--background` | Navbar background |
| `--border` | Bottom border (1 px) |
| `--foreground` | Icon color (default) |
| `--muted-foreground` | Disabled icon color |
| `--muted` | Hover/active button background |
| `--ring` | Keyboard focus outline |

---

## Out of scope

- Breadcrumb internals → see [`02-breadcrumb.md`](./02-breadcrumb.md).
- Routing/URL structure → see [`03-routing.md`](./03-routing.md).
- Keyboard shortcut table → see [`04-keyboard-shortcuts.md`](./04-keyboard-shortcuts.md).
- Mobile gesture handling → deferred to Phase 10 (`../10-mobile/`).
