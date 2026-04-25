# App — Acceptance Criteria

> **Version:** 2.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** ✅ Populated (F-01 closed)
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## Purpose

Testable acceptance criteria for the App domain. Each criterion is independently verifiable, traceable to a source spec file, and references load-bearing rules in [`00-overview.md §🔒 Load-Bearing Rules`](./00-overview.md).

**ID format:** `AT-APP-NN` (stable; never renumber).

---

## Criteria

### Information model (foundation)

| ID | Criterion | Source |
|----|-----------|--------|
| `AT-APP-01` | Every user has exactly one root `Item`, auto-created on signup, with no parent and undeletable. | `01-features/01-information-model.md` §1.1 |
| `AT-APP-02` | `Item.id` is immutable across move, mirror, share, and trash-restore operations. | §1.2 |
| `AT-APP-03` | Every `Item` is a single unified type discriminated by `itemType` (no separate `Project`/`Note`/`Task` tables). | `mem://architecture/data-model` |
| `AT-APP-04` | Children are ordered by **fractional-index string keys**, not integer positions. | `mem://features/editor-core` |
| `AT-APP-05` | A view rendering ≥250 items must virtualize or paginate. | `mem://architecture/data-model` |

### Layout shell

| ID | Criterion | Source |
|----|-----------|--------|
| `AT-APP-06` | Top-level layout has exactly two zones: fixed `NavBar` (top) and scrollable `Page` (below). | `01-features/03-layout-structure.md` §2.1 |
| `AT-APP-07` | Sidebar slides in from the left on Menu click; Esc and outside-click close it. | §2.2 |
| `AT-APP-08` | Back/Forward arrows are disabled (faded) when zoom history is empty/at-end. | §2.2 |
| `AT-APP-09` | Breadcrumb collapses middle segments to "…" when path > 3 segments; hover reveals dropdown. | §2.2 |
| `AT-APP-10` | NavBar Layout Toggle switches the current item between list view and board view. | §2.3 |

### Page content + interactions

| ID | Criterion | Source |
|----|-----------|--------|
| `AT-APP-11` | The Page renders items recursively: `<ItemRow>` contains `<ItemList>` contains `<ItemRow>`. Indentation is visual (margin × depth). | `01-features/04-page-content-area.md` |
| `AT-APP-12` | Pressing **Enter** on an item creates a new sibling **after** it; Enter at start with empty content creates a sibling **before**. | `01-features/05-interactions.md` |
| `AT-APP-13` | **Tab** indents the current item under its previous sibling; **Shift+Tab** outdents. Both must update the fractional index, not re-number siblings. | `01-features/05-interactions.md` |
| `AT-APP-14` | Drag-and-drop shows the **entire subtree** as the drag preview, not only the dragged row. | `01-features/05-interactions.md` |

### Per-item ⋮ context menu

| ID | Criterion | Source |
|----|-----------|--------|
| `AT-APP-15` | Each row exposes a ⋮ button that opens a context menu containing at minimum: Move, Delete, Share, Mirror, Duplicate. | `01-features/06-item-context-menu.md` |
| `AT-APP-16` | Delete from the menu sends the item to Trash (soft delete) — never hard delete. | `01-features/11-trash-view.md` |

### Multi-select

| ID | Criterion | Source |
|----|-----------|--------|
| `AT-APP-17` | Shift+Click extends a contiguous selection range; Cmd/Ctrl+Click toggles individual items. | `01-features/12-multi-select.md` |
| `AT-APP-18` | Bulk operations (move, delete, mirror) act atomically on the selection or roll back on partial failure. | `01-features/12-multi-select.md` |

### Trash

| ID | Criterion | Source |
|----|-----------|--------|
| `AT-APP-19` | Items in Trash auto-purge **30 days** after deletion. | `01-features/11-trash-view.md` |
| `AT-APP-20` | Restoring a trashed item preserves its original `id`, `parentId`, and child subtree intact. | `01-features/11-trash-view.md` + AT-APP-02 |

### Roles & permissions (security)

| ID | Criterion | Source |
|----|-----------|--------|
| `AT-APP-21` | Roles are stored in a **separate** `user_roles` table — never on the user/profile row. | `01-features/15-roles-and-permissions.md` |
| `AT-APP-22` | Authorization checks call a single PHP helper `Auth::hasRole($userId, $role)` (server-side); SQLite queries scope rows by `OwnerId`/share grants in WHERE clauses. No Postgres-style RLS, no `SECURITY DEFINER` — those are not portable to SQLite under WordPress. | `01-features/15-roles-and-permissions.md` |
| `AT-APP-23` | Client-side `localStorage`/`sessionStorage` is **never** trusted for admin checks. | `01-features/15-roles-and-permissions.md` |

### Mirrors & sharing (Phase 2 contracts already locked)

| ID | Criterion | Source |
|----|-----------|--------|
| `AT-APP-24` | A Mirror references the **canonical source** `Item.id` only — never another mirror. Deleting source marks all mirrors broken. | `01-features/09-mirrors.md` + `01-features/01-information-model.md` §1.3 |
| `AT-APP-25` | Sharing an item cascades **view** access to all descendants by default. | `01-features/01-information-model.md` §1.3 |

---

## Verification

```bash
# Inventory
grep -rn "AT-APP-" spec/31-app/

# Run hygiene
node scripts/spec-hygiene/00-run-all.mjs
```

Each AT is "done" when (a) it has a stable ID, (b) its source file exists and contains the rule, (c) it is verifiable by reading the source or running an automated check against an implementation.

---

## Related

- [`00-overview.md`](./00-overview.md) — Mission, Load-Bearing Rules, MVP scope
- [`spec/19-glossary.md`](../19-glossary.md) — Terminology SSOT
- [`spec/20-enums-index.md`](../20-enums-index.md) — Enum registry

*Populated 2026-04-25 to close audit finding F-01.*
