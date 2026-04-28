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
- The ⭐ Favorite toggle on the page header **does** persist server-side, but it reuses `EP-ITEMS-UPDATE` (writing the `Item.IsFavorite` column on the canonical singular `Item` table per [`../01-features/01-information-model.md`](../01-features/01-information-model.md) §relationships) rather than introducing an endpoint family of its own.
- **Favorites canonical placement (resolves ambiguity-triage #17, ruling 2026-04-27; ratified by [ADR-0001](../../00-adrs/0001-singular-ddl-vs-plural-prose.md) on 2026-04-28 and double-locked by [ADR-0024](../../00-adrs/0024-ratify-soft-confirm-triage-rulings.md) §D3 on 2026-04-28 — gate `G-24-FAVORITES-TABLE-ONLY`):** Favorites is the **`Item.IsFavorite` column** on the singular `Item` table — **there is no `Favorite` / `Favorites` table**. **No shell endpoint owns Favorites.** Reads piggyback on `EP-ITEMS-LIST` (`?includeFavorites=1`); writes piggyback on `EP-ITEMS-UPDATE` (`{ "IsFavorite": true|false }`). Adding an `EP-FAVORITES-*` family or promoting Favorites to its own table **MUST** first supersede ADR-0001 **and** ADR-0024 with a new ADR.
- Sidebar tree contents are derived from `EP-ITEMS-LIST` scoped to the user's root — see [`./01-information-model.md`](./01-information-model.md) for the items endpoint family.

---

## Cross-References

| Topic | Link |
|-------|------|
| Layout SSOT | [`../../32-ui-design/`](../../32-ui-design/00-overview.md) |
| NavBar / Sidebar component contract | `mem://design/ui-components` |
