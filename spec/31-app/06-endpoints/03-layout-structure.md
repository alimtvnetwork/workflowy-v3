# Endpoints — 03 Layout Structure

> **Version:** 1.1.0
> **Updated:** 2026-04-27 (UTC+8)
> **Parent:** [`./00-overview.md`](./00-overview.md)
> **Mirrors feature:** [`../01-features/03-layout-structure.md`](../01-features/03-layout-structure.md)

---

## Summary

**No shell-specific endpoints — UI-only feature; persistence reuses items endpoints.**

The NavBar + Sidebar + Page shell is rendered entirely from React state seeded by `EP-ME` (current user) and `EP-ITEMS-ROOT` (root item). Sidebar contents are derived client-side from `EP-ITEMS-LIST` calls scoped to the user's root. The header's ⭐ Favorite toggle persists via `EP-ITEMS-UPDATE` (see Why-section).

---

## Why no shell-specific endpoints

- The shell itself owns no server state — NavBar, Sidebar, and Page chrome are pure React composition over data fetched by sibling features.
- Sidebar collapse state, panel widths, and other ephemeral chrome preferences are stored in `localStorage` keyed by `UserId`, per [`mem://design/ui-components`](mem://design/ui-components).
- The ⭐ Favorite toggle on the page header **does** persist server-side, but it reuses `EP-ITEMS-UPDATE` (writing to the `favorites` table per [`../01-features/01-information-model.md`](../01-features/01-information-model.md) §relationships and [`../07-db-diagram/04-feature-slices.md`](../07-db-diagram/04-feature-slices.md) §4.12) rather than introducing an endpoint family of its own.
- **Favorites canonical placement (resolves ambiguity-triage #17, ruling 2026-04-27):** Favorites lives at the **table layer only** (`Favorite` per the Spec↔DDL Alias Bridge in `04-database-conventions/00-overview.md`). **No shell endpoint owns Favorites.** Reads piggyback on `EP-ITEMS-LIST` (`?includeFavorites=1`); writes piggyback on `EP-ITEMS-UPDATE` (`{ "IsFavorite": true|false }`). Any future request to add `EP-FAVORITES-*` MUST first amend this section via ADR.
- Sidebar tree contents are derived from `EP-ITEMS-LIST` scoped to the user's root — see [`./01-information-model.md`](./01-information-model.md) for the items endpoint family.

---

## Cross-References

| Topic | Link |
|-------|------|
| Layout SSOT | [`../../32-ui-design/`](../../32-ui-design/00-overview.md) |
| NavBar / Sidebar component contract | `mem://design/ui-components` |
