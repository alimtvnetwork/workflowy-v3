# Endpoints — 03 Layout Structure

> **Version:** 1.1.0
> **Updated:** 2026-04-27 (UTC+8)
> **Parent:** [`./00-overview.md`](./00-overview.md)
> **Mirrors feature:** [`../01-features/03-layout-structure.md`](../01-features/03-layout-structure.md)

---

## Summary

**No server endpoints — UI-only feature.**

The NavBar + Sidebar + Page shell is rendered entirely from React state seeded by `EP-ME` (current user) and `EP-ITEMS-ROOT` (root item). Sidebar contents are derived client-side from `EP-ITEMS-LIST` calls scoped to the user's root.

---

## Why no shell-specific endpoints

- The shell itself owns no server state — NavBar, Sidebar, and Page chrome are pure React composition over data fetched by sibling features.
- Sidebar collapse state, panel widths, and other ephemeral chrome preferences are stored in `localStorage` keyed by `UserId`, per [`mem://design/ui-components`](mem://design/ui-components).
- The ⭐ Favorite toggle on the page header **does** persist server-side, but it reuses `EP-ITEMS-UPDATE` (writing to the `favorites` table per [`../01-features/01-information-model.md`](../01-features/01-information-model.md) §relationships and [`../07-db-diagram/04-feature-slices.md`](../07-db-diagram/04-feature-slices.md) §4.12) rather than introducing an endpoint family of its own.
- Sidebar tree contents are derived from `EP-ITEMS-LIST` scoped to the user's root — see [`./04-information-model.md`](./04-information-model.md) for the items endpoint family.

---

## Cross-References

| Topic | Link |
|-------|------|
| Layout SSOT | [`../../32-ui-design/`](../../32-ui-design/00-overview.md) |
| NavBar / Sidebar component contract | `mem://design/ui-components` |
