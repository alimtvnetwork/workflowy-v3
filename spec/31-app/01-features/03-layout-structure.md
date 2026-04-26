# Layout Structure

> **Version:** 2.2.0
> **Updated:** 2026-04-26 — APP-FIX-05: Settings Keys (Seedable Config) section added (closes audit F-04 for this file). v2.1.0 added Enum Sources callout.
> **Parent:** [00-overview.md](./00-overview.md)
> **Template:** [13-feature-file-template.md](../../01-spec-authoring-guide/13-feature-file-template.md)

---

## Overview

The layout shell is the persistent chrome around every page: the **NavBar** at top, the optional **Sidebar** sliding from the left, and the scrollable **Page** content area. Every other feature renders inside this shell.

## User Story

As a user, I want a consistent navigation chrome that gives me one-click access to history, search, sharing, settings, and my outline tree, so that I never lose orientation as I zoom and switch views.

---

### 2.1 Overall Layout
- The app MUST consist of two main zones: **NavBar** (fixed top bar) and **Page** (scrollable content area below).
- A collapsible **Sidebar** MUST slide in from the left when the Menu button is clicked.
- The layout MUST be responsive: sidebar overlays on mobile, side-by-side on desktop.

### 2.2 NavBar — Left Side

| Element | Icon | Behavior | Visual State |
|---------|------|----------|--------------|
| Menu Toggle | ☰ hamburger | Click opens sidebar panel (slides from left, ~280px width). Click again or click outside closes it. `Esc` also closes the sidebar. When opened, tab order moves into the sidebar. | Open state: icon changes to ✕. Closed state: ☰. |
| Back Arrow | ← arrow | Click navigates to the previous item in zoom history. | Disabled (faded) when no history exists. Enabled: full opacity with hover highlight. |
| Forward Arrow | → arrow | Click navigates forward in zoom history. | Disabled (faded) when already at the latest. Enabled: full opacity with hover highlight. |
| Home Button | 🏠 house | Click returns to root/home list, clears zoom state, resets URL to root. | Always enabled. Filled icon when user is already at root. |
| Breadcrumb Path | Text links separated by › | Shows the absolute path of the current zoomed-in item (e.g. Home › Projects › Design). Each segment is clickable and zooms to that ancestor. | Current item: bold text. Ancestors: muted text, underline on hover. |
| Overflow Breadcrumbs | › … › collapsed middle | When path exceeds 3 segments, middle items collapse to "…". Hovering "…" reveals full ancestor list in a dropdown. | Each ancestor in the dropdown is clickable. |

### 2.3 NavBar — Right Side

| Element | Icon | Behavior | Visibility | Visual State |
|---------|------|----------|------------|--------------|
| Layout Toggle | List/Grid icon | Click toggles between list view and board view for the current item. | Always visible. | Active mode icon is highlighted. Inactive mode is muted. |
| Share Button | Share icon | Click opens the Share dialog (see §7). | Hidden on home/root page. | Muted by default. Highlighted on hover. |
| Search Button | 🔍 magnifier | Click opens full-screen search overlay (see §4.3). Keyboard shortcut: ⌘F. | Always visible. | Muted by default. Highlighted on hover. |
| Favorite Button | ⭐ star | Click toggles bookmark on the current zoomed item. | Hidden on home/root page. | Unfavorited: outline star, muted. Favorited: filled star, gold color. |
| Today Shortcut | 📅 calendar | Click navigates to today's dated items view (shows all items assigned to today). | Always visible. | Muted by default. Shows a small dot badge if there are items for today. |
| Settings Menu | ⋮ three dots | Click opens the settings dropdown menu (see §2.4). | Always visible. | Muted by default. Full color on hover. |

### 2.4 Settings Menu (⋮) — Full Dropdown

The dropdown MUST use visual dividers between logical groups.

**Group 1 — Resources**

| Action | Icon | Shortcut | Behavior |
|--------|------|----------|----------|
| What's New | Sparkle | — | Opens a modal or page showing changelog and release notes. |
| Learn WorkFlowy | Graduation cap | — | Opens tutorials and guides. |
| Integrations | Plug | — | Opens integrations management panel. |
| Handbook | Open book | Ctrl+/ | Opens the WorkFlowy handbook panel (see §2.6). |

### 2.6 Handbook Panel

The Handbook is an in-app reference panel accessible from the Settings menu or via **Ctrl+/**. It provides interactive documentation about all WorkFlowy features.

| Element | Content | Behavior |
|---------|---------|----------|
| Tab bar | "Handbook" and "Hotkeys" tabs | Switch between documentation sections and keyboard shortcut reference. |
| Sections dropdown | "◁ Sections" link | Navigate between handbook sections. |
| Search | Search input at top | Filter handbook content by keyword. |
| Language selector | "English ▾" dropdown | Switch handbook language (if supported). |
| Content area | Rich text with embedded screenshots, annotated UI examples, and interactive tooltips | Scrollable documentation. Hovering annotated elements shows tooltips explaining that feature. |

**Handbook covers:** Bullet Types (all 12 types with visual examples), Board view, Dashboard view, item type conversions, sidebar usage, keyboard shortcuts, and all major features.

**Close behavior:** Click the arrow icon on the side, press Ctrl+/, or press Escape.

**Group 2 — Edit Actions**

| Action | Icon | Shortcut | Behavior |
|--------|------|----------|----------|
| Undo | Undo arrow | ⌘Z | Undoes the last action. Disabled when undo stack is empty. |
| Redo | Redo arrow | ⇧⌘Z | Redoes the last undone action. Disabled when redo stack is empty. |
| Save | Floppy disk | ⌘S | Force-saves all pending changes. Shows a "Saved" confirmation. Below the label, display "Autosaved X minutes ago" in small muted text. |

**Group 3 — View Actions**

| Action | Icon | Shortcut | Behavior |
|--------|------|----------|----------|
| Expand all | Double chevron down | — | Recursively expands all collapsed items in the current view. |
| Collapse all | Double chevron up | — | Recursively collapses all expanded items in the current view. |
| Print | Printer | ⌘P | Opens the browser print dialog for the current view. |
| Export all | Download | — | Opens export dialog with format options: OPML, Plain Text, JSON. |
| Download Files | File download | — | Downloads all attached files as a ZIP archive. Disabled if no attachments exist. |

**Group 4 — System**

| Action | Icon | Shortcut | Behavior |
|--------|------|----------|----------|
| Settings | Gear | — | Opens the settings panel (theme, font size, default view, show completed items, auto-collapse depth). |
| Help | Question mark | — | Opens the help center or support page. |
| Report a problem | Bug | — | Opens a bug report form or modal. |
| Trash | Trash can | — | Opens the trash view showing soft-deleted items with options to restore or permanently delete. |
| Log out | Exit door | — | Signs the user out and redirects to the login page. Clears local state. |

**Group 5 — Account (bottom section)**

| Element | Behavior |
|---------|----------|
| Account display | Shows the user's avatar (small circle), display name, and email below it. Informational only — not clickable. |

---

### 2.5 Sidebar

#### 2.5.1 Structure

The sidebar MUST be a ~240px panel that slides in from the left. On mobile, it overlays the content with a dimmed backdrop. Keyboard shortcut: **^L** (Ctrl+L).

| Section | Content | Behavior |
|---------|---------|----------|
| Collapse/Expand arrow | ← arrow at top-left (when open) or ↗ arrow (when collapsed to mini) | Click toggles sidebar between expanded and collapsed states. |
| Today shortcut | 📅 "Today" label at top of sidebar | Click navigates to today's dated items view. Always visible at the top of the sidebar. |
| Home tree | Collapsible tree starting from "Home" as root. Shows the user's top-level nodes with expand/collapse triangles. Each node shows its title, truncated if needed. Special nodes (e.g. Calendar) show their respective icons. | Click on any node zooms to that item. Expand/collapse triangles reveal or hide children inline. The tree mirrors the actual item hierarchy. |
| + New node button | Rounded button at bottom of tree: "+ New node" | Click creates a new top-level item under root. The new item gets focus immediately. |

**Note:** The sidebar is a **tree browser** of the user's outline, NOT a static list of Favorites/Recent/Tags. It shows the actual hierarchy starting from "Home", allowing users to browse and navigate their entire outline from the sidebar. Items can be dragged into the sidebar to move them.

#### 2.5.2 Sidebar States

| State | Behavior |
|-------|----------|
| Open (desktop) | Content area shifts right to make room (~240px). Sidebar shows full tree with labels. |
| Open (mobile) | Sidebar overlays content with semi-transparent backdrop. Tapping the backdrop closes the sidebar. |
| Closed | Sidebar is hidden. Content area takes full width. |

#### 2.5.3 Usage Quota Indicator

When visible (free-tier users), a usage indicator appears at the top-right corner of the content area (not inside the sidebar):

| Element | Content | Behavior |
|---------|---------|----------|
| Progress bar | Thin horizontal bar (red when over limit, green when under) | Shows current usage vs. limit. |
| Usage text | "X/Y bullets this month" | Displays the current bullet count vs. monthly limit. |
| Upgrade link | "Upgrade to unlimited →" | Click navigates to the billing/upgrade page. |

This indicator is hidden for Pro/unlimited users.

---

## Enum Sources (normative)

| Enum mentioned in this file | Canonical SSOT | Strategy |
|------------------------------|----------------|----------|
| `ViewMode` (`List` / `Board`) | [`spec/20-enums-index.md`](../../20-enums-index.md) §3 | TS Strategy B (`as const` + derived union) — see [`spec/02-coding-guidelines/02-typescript/00-overview.md`](../../02-coding-guidelines/02-typescript/00-overview.md) |
| `Breakpoint` (`Mobile` / `Tablet` / `Desktop`) | [`spec/20-enums-index.md`](../../20-enums-index.md) §3 | TS Strategy B |

> **Forbidden:** TS `enum` keyword and bare literal unions. Always import the canonical `as const` object.

---

## Settings Keys (Seedable Config)

> **Why this section:** §2.4 Settings Menu and the §3 Settings gear surface five user preferences (theme, font size, default view, show completed, auto-collapse depth). Per [`spec/06-seedable-config-architecture/`](../../06-seedable-config-architecture/00-overview.md) + [`spec/15-wp-plugin-how-to/15-settings-architecture/`](../../15-wp-plugin-how-to/15-settings-architecture/00-overview.md), every settings touchpoint MUST declare its enum-backed key, default, sanitizer, and group. No bare strings.

| Setting | `OptionNameType` enum case | Default | Sanitizer | Group | Storage |
|---------|---------------------------|---------|-----------|-------|---------|
| Theme | `OptionNameType::THEME` → `'workflowy_theme'` | `'system'` | `Sanitizer::oneOf(['light','dark','system'])` | `wf_appearance` | Root DB (per-user) |
| Font size | `OptionNameType::FONT_SIZE` → `'workflowy_font_size'` | `'medium'` | `Sanitizer::oneOf(['small','medium','large'])` | `wf_appearance` | Root DB (per-user) |
| Default view | `OptionNameType::DEFAULT_VIEW` → `'workflowy_default_view'` | `'home'` | `Sanitizer::oneOf(['home','today','starred'])` | `wf_navigation` | Root DB (per-user) |
| Show completed items | `OptionNameType::SHOW_COMPLETED` → `'workflowy_show_completed'` | `true` | `Sanitizer::bool()` | `wf_display` | App DB (per-workspace) |
| Auto-collapse depth | `OptionNameType::AUTO_COLLAPSE_DEPTH` → `'workflowy_auto_collapse_depth'` | `0` (disabled) | `Sanitizer::intRange(0, 10)` | `wf_display` | App DB (per-workspace) |

**Forbidden:**
- ❌ Hard-coded string keys (`get_option('workflowy_theme')`) — anti-pattern #1 in [`13-anti-patterns.md`](../../15-wp-plugin-how-to/15-settings-architecture/13-anti-patterns.md).
- ❌ Reading these keys without going through the Settings facade.
- ❌ Mutating without the registered sanitizer.

---

## Inputs

| Field | Type | Source | Required | Notes |
|-------|------|--------|----------|-------|
| `currentItemId` | `string \| null` | URL / router state | Yes | `null` = root view |
| `breadcrumbPath` | `Item[]` | Derived from `currentItemId` ancestors | Yes | Truncated when length > 3 |
| `viewMode` | `ViewMode` enum | UI toggle / persisted per item | Yes | `List` or `Board` |
| `sidebarOpen` | `boolean` | Local UI state (persisted in `localStorage`) | Yes | Distinct value per breakpoint |
| `viewport` | `Breakpoint` enum | `matchMedia` listener | Yes | `Mobile` / `Tablet` / `Desktop` |
| `historyStack` | `string[]` | Router history | Yes | Drives Back/Forward enable state |
| `usageQuota` | `{ used: number; limit: number } \| null` | API: `GET /usage` | No | `null` = Pro user (indicator hidden) |
| `isFavorited` | `boolean` | API: per-item favorite flag | Yes | Drives star icon state |

## Outputs

| Output | Persisted? | Channel | Notes |
|--------|-----------|---------|-------|
| Sidebar open/close state | ✅ `localStorage` | `ui.sidebarOpen` | Restored on next session |
| Active view mode | ✅ SQLite | `Items.ViewMode` per item | Per-item preference |
| `nav:zoom` event | ❌ | Event bus | Fires on breadcrumb / Home / sidebar tree click |
| `nav:back` / `nav:forward` events | ❌ | Event bus | History traversal |
| Favorite toggle write | ✅ SQLite | `favorites` table | Optimistic UI |
| URL update | ✅ Browser history | `history.pushState` | Drives deep links |

## Edge Cases

1. User clicks Home while already at root — no navigation; Home icon shows filled state but no event fires.
2. Breadcrumb path exceeds 3 segments — middle segments collapse to "…" with hover dropdown.
3. Sidebar tree contains 1000+ top-level nodes — virtualize the list; do not render all rows.
4. User opens sidebar on mobile, then resizes to desktop — sidebar transitions from overlay to inline without flicker.
5. User presses `Esc` while sidebar is open and a search overlay is also open — search closes first, sidebar stays open (LIFO modal stack).
6. Back button pressed when history is empty — button is disabled; click is a no-op.
7. Settings dropdown is open when user clicks elsewhere — dropdown closes; click on the original target also fires.
8. Network is offline — quota indicator shows last cached value with a stale-data dot; favorite toggles queue locally per `mem://features/offline-resilience`.
9. User zooms into an item that was deleted in another tab — show "Item not found" empty state inside the layout shell; NavBar remains usable.
10. Free-tier user exceeds quota — progress bar turns red; "Upgrade to unlimited →" link gets emphasis styling but does not block navigation.

## Acceptance Tests

| ID | Given | When | Then | testid |
|----|-------|------|------|--------|
| AT-LAYOUT-01 | App is loaded with no zoom | NavBar renders | Home icon shows filled state; breadcrumb is empty | `navbar-home` |
| AT-LAYOUT-02 | User is zoomed 4 levels deep | Breadcrumb renders | First and last 2 segments visible; middle collapses to "…" | `breadcrumb-overflow` |
| AT-LAYOUT-03 | History stack has 2+ entries | User clicks Back | Router pops one entry; Forward becomes enabled | `navbar-back` |
| AT-LAYOUT-04 | Viewport ≥ 1024 px and `sidebarOpen = true` | Page renders | Content shifts right by sidebar width; no overlay backdrop | `sidebar-panel` |
| AT-LAYOUT-05 | Viewport < 768 px and user clicks ☰ | Sidebar opens | Sidebar overlays content with dimmed backdrop; tapping backdrop closes it | `sidebar-backdrop` |
| AT-LAYOUT-06 | Sidebar is open | User presses `Ctrl+L` | Sidebar closes; persisted state updates to `false` | `sidebar-toggle` |
| AT-LAYOUT-07 | User clicks ⋮ Settings menu | Dropdown opens | 5 groups render with dividers; Trash, Undo, Settings items visible | `settings-dropdown` |
| AT-LAYOUT-08 | Free-tier user used 240/250 items | Page renders | Quota bar visible at top-right of content area; bar is green | `usage-quota` |
| AT-LAYOUT-09 | Free-tier user used 251/250 items | Page renders | Quota bar visible and red; "Upgrade" link emphasised | `usage-quota-over` |
| AT-LAYOUT-10 | Pro user is signed in | Page renders | Quota indicator is not in the DOM | `usage-quota` |
| AT-LAYOUT-11 | User presses `Ctrl+/` | Handbook panel opens | Tabs "Handbook" and "Hotkeys" render; `Escape` closes the panel | `handbook-panel` |
| AT-LAYOUT-12 | User clicks ⭐ Favorite on a non-root item | API responds OK | Star fills with gold; per-item favorite row exists in DB | `favorite-button` |

## Component Contract

| Surface | Component path | `data-testid` | Acceptance tests |
|---------|---------------|---------------|------------------|
| NavBar shell | `src/components/layout/NavBar.tsx` | `navbar` | AT-LAYOUT-01..03 |
| Home button | `src/components/layout/NavBarHome.tsx` | `navbar-home` | AT-LAYOUT-01 |
| Back button | `src/components/layout/NavBarBack.tsx` | `navbar-back` | AT-LAYOUT-03 |
| Forward button | `src/components/layout/NavBarForward.tsx` | `navbar-forward` | AT-LAYOUT-03 |
| Breadcrumb | `src/components/layout/Breadcrumb.tsx` | `breadcrumb` | AT-LAYOUT-02 |
| Breadcrumb overflow dropdown | `src/components/layout/BreadcrumbOverflow.tsx` | `breadcrumb-overflow` | AT-LAYOUT-02 |
| Sidebar panel | `src/components/layout/Sidebar.tsx` | `sidebar-panel` | AT-LAYOUT-04..06 |
| Sidebar toggle | `src/components/layout/SidebarToggle.tsx` | `sidebar-toggle` | AT-LAYOUT-06 |
| Sidebar backdrop (mobile) | `src/components/layout/SidebarBackdrop.tsx` | `sidebar-backdrop` | AT-LAYOUT-05 |
| Settings dropdown | `src/components/layout/SettingsDropdown.tsx` | `settings-dropdown` | AT-LAYOUT-07 |
| Handbook panel | `src/components/layout/HandbookPanel.tsx` | `handbook-panel` | AT-LAYOUT-11 |
| Favorite button | `src/components/layout/FavoriteButton.tsx` | `favorite-button` | AT-LAYOUT-12 |
| Usage quota indicator | `src/components/layout/UsageQuota.tsx` | `usage-quota`, `usage-quota-over` | AT-LAYOUT-08..10 |

> **Note:** None of these components exist yet — paths are the planned implementation order. This table feeds the global component-contract map (M-3).

---

## Related

- [01-information-model.md](./01-information-model.md) — items the layout navigates
- [04-page-content-area.md](./04-page-content-area.md) — what renders inside Page
- [05-interactions.md](./05-interactions.md) — keyboard shortcuts referenced above
- [10-today-view.md](./10-today-view.md) — destination of Today shortcut
- [11-trash-view.md](./11-trash-view.md) — destination of Settings → Trash
