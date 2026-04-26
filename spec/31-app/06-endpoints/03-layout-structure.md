# Endpoints — 03 Layout Structure

> **Version:** 1.0.0
> **Updated:** 2026-04-26 (UTC+8)
> **Parent:** [`./00-overview.md`](./00-overview.md)
> **Mirrors feature:** [`../01-features/03-layout-structure.md`](../01-features/03-layout-structure.md)

---

## Summary

**No server endpoints — UI-only feature.**

The NavBar + Sidebar + Page shell is rendered entirely from React state seeded by `EP-ME` (current user) and `EP-ITEMS-ROOT` (root item). Sidebar contents are derived client-side from `EP-ITEMS-LIST` calls scoped to the user's root.

---

## Why no endpoints

- The shell has no persistent server state of its own (no "favorites" table in MVP).
- Sidebar pinning, collapse state, and panel widths are stored in `localStorage` keyed by `UserId`, per [`mem://design/ui-components`](mem://design/ui-components).
- Any future "pin to sidebar" feature would extend `01-information-model.md` with a `Pinned` flag rather than introduce a new endpoint family.

---

## Cross-References

| Topic | Link |
|-------|------|
| Layout SSOT | [`../../32-ui-design/`](../../32-ui-design/00-overview.md) |
| NavBar / Sidebar component contract | `mem://design/ui-components` |
