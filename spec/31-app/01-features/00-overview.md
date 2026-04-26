# Features

> **Version:** 2.1.0
> **Updated:** 2026-04-26 (UTC+8) — APP-FIX-07: Casing-Layers callout added (closes audit F-08)
> **Status:** ✅ Implementation-grade rollup (F-01 closed)

---

## 🎯 What this folder is

Behavior contracts for every feature in WorkFlowy. Each file is a **single feature**, follows the [feature-file template](../../01-spec-authoring-guide/13-feature-file-template.md), and is the SSOT for that feature's rules.

UI rendering (colors, layout, animations) lives in [`../../32-ui-design/`](../../32-ui-design/00-overview.md). **This folder is behavior-only.**

---

## 🧱 Feature Dependency Graph

Read this before picking a feature to implement. Arrows = "depends on, must exist first":

```
01-information-model        ← foundation; everything depends on it
        │
        ├──► 03-layout-structure (NavBar + Sidebar + Page shell)
        │           │
        │           ├──► 04-page-content-area (recursive item list)
        │           │           │
        │           │           ├──► 05-interactions (Enter/Tab/drag)
        │           │           │           │
        │           │           │           ├──► 06-item-context-menu
        │           │           │           ├──► 12-multi-select
        │           │           │           └──► 13-templates
        │           │           │
        │           │           ├──► 07-board-view (alt rendering)
        │           │           ├──► 09-mirrors (cross-tree refs)
        │           │           ├──► 10-today-view (filtered slice)
        │           │           └──► 11-trash-view (soft-deleted slice)
        │           │
        │           └──► 08-share-dialog (per-item)
        │
        ├──► 14-concurrency-and-sync (server-side rules)
        └──► 15-roles-and-permissions (auth contract)
```

**Implementation order = topological sort of the graph above.** Do not implement `05-interactions` before `04-page-content-area`; do not implement `09-mirrors` before `01-information-model`.

---

## 🎒 MVP vs Phase-2

| File | Feature | MVP? | Why |
|------|---------|:----:|-----|
| `01-information-model.md` | Item entity + root | ✅ | Foundation |
| `02-personas.md` | Target users | ✅ | Reference doc |
| `03-layout-structure.md` | App shell | ✅ | Container for everything |
| `04-page-content-area.md` | Recursive item list | ✅ | The actual outliner |
| `05-interactions.md` | Enter/Tab/Shift+Tab/drag | ✅ | Core editing |
| `06-item-context-menu.md` | Per-item ⋮ menu | ✅ | Move/delete/share entry |
| `11-trash-view.md` | Soft delete + 30d retention | ✅ | Data safety |
| `12-multi-select.md` | Bulk ops | ✅ | Productivity |
| `15-roles-and-permissions.md` | Auth + RLS via `has_role()` | ✅ | Security |
| `07-board-view.md` | Kanban-style alt view | ⚠️ P2 | Adds rendering mode |
| `08-share-dialog.md` | Public + invited shares | ⚠️ P2 | Needs roles first |
| `09-mirrors.md` | Cross-tree linked items | ⚠️ P2 | Complex sync semantics |
| `10-today-view.md` | Date-filtered slice | ⚠️ P2 | Needs scheduled-date field |
| `13-templates.md` | Serialized tree snapshots | ⚠️ P2 | Needs full tree first |
| `14-concurrency-and-sync.md` | Conflict resolution | ⚠️ P2 | WP-plugin-specific |

---

## 📖 Must-Read Sequence (for any AI starting cold)

1. `01-information-model.md` — what an `Item` is.
2. `03-layout-structure.md` — where things render.
3. `04-page-content-area.md` — how items render recursively.
4. `05-interactions.md` — keyboard contract.
5. `15-roles-and-permissions.md` — who can do what.
6. Stop here for MVP. For Phase-2, continue with the dependency graph above.

---

## 🔤 Casing Layers (normative)

> **Why this exists:** AI readers see camelCase, PascalCase, and snake_case in the same feature file and cannot tell which is the *wire* identifier vs the *DB* identifier vs *legacy pseudocode*. Pick the layer first, then the casing follows.

| Layer | Casing | Examples | SSOT |
|-------|--------|----------|------|
| **DB** — SQLite tables, columns, indexes | **PascalCase** | `Items.ParentId`, `Items.ItemType`, `Mirrors.BrokenAt` | [`../../19-glossary.md`](../../19-glossary.md) §Database Vocabulary |
| **Wire** — JSON request/response bodies, REST query params | **camelCase** | `{ "userId": 1, "parentId": "abc" }`, `?sortOrder=asc` | [`../../02-coding-guidelines/02-typescript/00-overview.md`](../../02-coding-guidelines/02-typescript/00-overview.md) |
| **TS code** — variables, props, function names | **camelCase** | `const parentId = …`, `function moveItem(...)` | TS guidelines |
| **TS types / enums** — interfaces, type aliases, `as const` consts | **PascalCase** | `interface Item`, `const ItemType = { … } as const` | TS Strategy B |
| **PHP code** — classes, methods, helpers | **PascalCase / camelCase** | `Auth::hasRole($userId, $role)` | [`../../15-wp-plugin-how-to/`](../../15-wp-plugin-how-to/00-overview.md) |
| **URL slugs / HTTP headers / route paths** | **kebab-case / snake_case** (per protocol) | `/api/items/move`, `X-WP-Nonce`, `wp_options` | Protocol convention — exempt from PascalCase rule |
| **Pseudocode** | **Match the layer being described** | If the snippet is DB-level, use PascalCase; if TS-level, camelCase | This document |

**Forbidden:** snake_case for *new* DB identifiers (e.g. `items.parent_id` is **stale** — see [`05-audit-02a-column-rename.md`](../../18-spec-issues/05-audit-02a-column-rename.md)). The only snake_case identifiers permitted in DB context are WordPress core tables (`wp_posts`, `wp_options`) which are explicitly exempt.

**Rule of thumb for spec authors:** before writing an identifier, ask *"which layer is this?"* and pick the casing from the table. Do not mix layers in the same code block — split into two blocks if needed.

---


<!-- AUTO-TOC:START -->

## Topics in this Folder

*Auto-generated by `scripts/spec-hygiene/11-generate-auto-toc.mjs` — do not edit by hand inside the AUTO-TOC sentinels.*

| # | File | Title | Lines |
|---|------|-------|-------|
| 1 | [`01-information-model.md`](./01-information-model.md) | Information Model Foundations | 140 |
| 2 | [`02-personas.md`](./02-personas.md) | Target User Personas | 119 |
| 3 | [`03-layout-structure.md`](./03-layout-structure.md) | Layout Structure | 232 |
| 4 | [`04-page-content-area.md`](./04-page-content-area.md) | Page / Content Area | 199 |
| 5 | [`05-interactions.md`](./05-interactions.md) | Interaction Behaviors | 170 |
| 6 | [`06-item-context-menu.md`](./06-item-context-menu.md) | Item Context Menu (⋮) | 188 |
| 7 | [`07-board-view.md`](./07-board-view.md) | Board View Specification | 178 |
| 8 | [`08-share-dialog.md`](./08-share-dialog.md) | Share Dialog Specification | 133 |
| 9 | [`09-mirrors.md`](./09-mirrors.md) | Mirror Specification | 188 |
| 10 | [`10-today-view.md`](./10-today-view.md) | Today View Specification | 109 |
| 11 | [`11-trash-view.md`](./11-trash-view.md) | Trash View Specification | 115 |
| 12 | [`12-multi-select.md`](./12-multi-select.md) | Multi-Select Behavior | 148 |
| 13 | [`13-templates.md`](./13-templates.md) | Template Application Flow | 150 |
| 14 | [`14-concurrency-and-sync.md`](./14-concurrency-and-sync.md) | Concurrency & Sync | 154 |
| 15 | [`15-roles-and-permissions.md`](./15-roles-and-permissions.md) | Roles & Permissions | 249 |

<!-- AUTO-TOC:END -->

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Parent (App) | [`../00-overview.md`](../00-overview.md) |
| UI Design SSOT | [`../../32-ui-design/00-overview.md`](../../32-ui-design/00-overview.md) |
| Workflowy UI phases (visual SSOT) | [`../../32-ui-design/06-workflowy-ui/00-overview.md`](../../32-ui-design/06-workflowy-ui/00-overview.md) |
| Glossary | [`../../19-glossary.md`](../../19-glossary.md) |
| Enums | [`../../20-enums-index.md`](../../20-enums-index.md) |

---

## Related

- [`../00-overview.md`](../00-overview.md) — Parent overview
- [`../97-acceptance-criteria.md`](../97-acceptance-criteria.md) — `AT-APP-*` criteria covering these features
