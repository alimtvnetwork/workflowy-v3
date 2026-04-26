# App


> **Version:** 2.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** ✅ Implementation-grade rollup (F-01 closed)

---

## Keywords

`app`

---

## Scoring

| Criterion | Status |
|-----------|--------|
| `00-overview.md` present | ✅ |
| AI Confidence assigned | ✅ |
| Ambiguity assigned | ✅ |
| Keywords present | ✅ |
| Scoring table present | ✅ |
| AI Confidence (auto-backfill) | Medium — TODO re-grade |
| Ambiguity (auto-backfill) | Medium — TODO re-grade |

---


## 🎯 Mission (read first)

WorkFlowy is a **recursive outliner**: every entity the user creates is a single unified `Item` node that can contain itself indefinitely. This app spec defines **what the application does** (features, workflows, edge cases). The companion folder [`../32-ui-design/`](../32-ui-design/00-overview.md) defines **how it looks and behaves on screen**.

**If you are an AI implementing this app, read in this exact order:**

1. [`mem://architecture/data-model`](#) — the unified `Item` node contract.
2. [`01-features/01-information-model.md`](./01-features/01-information-model.md) — entity-relationship rules.
3. [`01-features/03-layout-structure.md`](./01-features/03-layout-structure.md) — NavBar + Sidebar + Page shell.
4. [`01-features/04-page-content-area.md`](./01-features/04-page-content-area.md) — recursive item rendering.
5. [`01-features/05-interactions.md`](./01-features/05-interactions.md) — keyboard + mouse contract.
6. [`97-acceptance-criteria.md`](./97-acceptance-criteria.md) — `AT-APP-01..25` testable criteria.

Everything else under `01-features/` is a deeper view on a single feature; do not read it until you implement that feature.

---

## 🔒 Load-Bearing Rules (must not be violated)

| # | Rule | Source |
|---|------|--------|
| L1 | Every entity is a single `Item` interface — no separate `Project`, `Note`, `Task` types. Type is a discriminator field `itemType`. | `01-features/01-information-model.md` |
| L2 | `Item.id` never changes (move, mirror, share, restore from trash). Deep links and mirror references depend on this. | §1.2 |
| L3 | Each user has exactly one **root** Item, auto-created on signup, undeletable. | §1.1 |
| L4 | A view never renders more than **250 items at once** (virtualize / paginate beyond). | `mem://architecture/data-model` |
| L5 | Children are ordered by **fractional index** (string keys), not integer position. | `mem://features/editor-core` |
| L6 | Mirrors reference the canonical source only — never a mirror of a mirror. | §1.3 |
| L7 | Deleted items live in **Trash for 30 days** before hard delete. | `01-features/11-trash-view.md` |
| L8 | Roles live in a **separate table** (never on profile/users). All authorization checks go through a single PHP helper `Auth::hasRole($userId, $role)` (server-side, never client-trusted). | `01-features/15-roles-and-permissions.md` |
| L9 | Backend runtime is **WordPress plugin (PHP 8.1+ + SQLite via PDO)**. No Node, Postgres, Supabase. Realtime is delivered via WP-native **Server-Sent Events (SSE)** with a 5 s poll fallback — never WebSockets, never Postgres LISTEN/NOTIFY. | `mem://constraints/backend-runtime-deferred` |

Violating any load-bearing rule is a **rejected implementation**.

---

## 🎒 MVP Scope (what to build first)

| Phase | Feature | File | MVP? |
|-------|---------|------|------|
| 1 | Information model + root | `01-features/01-information-model.md` | ✅ MVP |
| 2 | Layout shell (NavBar + Sidebar + Page) | `01-features/03-layout-structure.md` | ✅ MVP |
| 3 | Recursive item rendering | `01-features/04-page-content-area.md` | ✅ MVP |
| 4 | Interactions (Enter, Tab, Shift+Tab, drag) | `01-features/05-interactions.md` | ✅ MVP |
| 5 | Per-item context menu (⋮) | `01-features/06-item-context-menu.md` | ✅ MVP |
| 6 | Multi-select (Shift/Cmd click) | `01-features/12-multi-select.md` | ✅ MVP |
| 7 | Trash view + 30-day retention | `01-features/11-trash-view.md` | ✅ MVP |
| 8 | Today view | `01-features/10-today-view.md` | ⚠️ Phase 2 |
| 9 | Board view (Kanban) | `01-features/07-board-view.md` | ⚠️ Phase 2 |
| 10 | Mirrors | `01-features/09-mirrors.md` | ⚠️ Phase 2 |
| 11 | Share dialog | `01-features/08-share-dialog.md` | ⚠️ Phase 2 |
| 12 | Templates | `01-features/13-templates.md` | ⚠️ Phase 2 |
| 13 | Concurrency & sync | `01-features/14-concurrency-and-sync.md` | ⚠️ Phase 2 |
| 14 | Roles & permissions | `01-features/15-roles-and-permissions.md` | ✅ MVP (auth) |

Phases 1–7 + 14 = the smallest shippable WorkFlowy clone.

---

## 🧭 Implementation Ground Truth

Every file in `01-features/` follows the same structure:
- `Overview` → what the feature is.
- `User Story` → why it exists.
- Numbered behavior rules → **the contract**.
- Cross-refs to glossary, enums, and shared types.

**An AI may not invent behavior not stated in a feature file.** If an interaction is missing, surface it as an open question, do not fabricate.

For UI rendering decisions (colors, fonts, spacing, animations), the SSOT is [`../32-ui-design/`](../32-ui-design/00-overview.md), not this folder. This folder is **behavior-only**.

---


<!-- AUTO-TOC:START -->

## Topics in this Folder

*Auto-generated by `scripts/spec-hygiene/11-generate-auto-toc.mjs` — do not edit by hand inside the AUTO-TOC sentinels.*

| # | File | Title | Lines |
|---|------|-------|-------|
| 1 | [`01-features/`](./01-features/00-overview.md) | Features | subfolder |
| 2 | [`02-workflows/`](./02-workflows/00-overview.md) | Workflows | subfolder |
| 3 | [`03-edge-cases/`](./03-edge-cases/00-overview.md) | Edge Cases | subfolder |
| 4 | [`04-roadmap/`](./04-roadmap/00-overview.md) | Roadmap | subfolder |
| 5 | [`05-conventions/`](./05-conventions/00-overview.md) | Conventions | subfolder |

<!-- AUTO-TOC:END -->

---

## Folders

| # | Folder | Purpose |
|---|--------|---------|
| 01 | [`01-features/`](./01-features/00-overview.md) | Per-feature behavior contracts (15 features) |
| 02 | [`02-workflows/`](./02-workflows/00-overview.md) | Cross-feature flows (keyboard shortcuts, template application) |
| 03 | [`03-edge-cases/`](./03-edge-cases/00-overview.md) | Boundary behaviors and out-of-scope decisions |
| 04 | [`04-roadmap/`](./04-roadmap/00-overview.md) | Phasing and resolved product decisions |
| 05 | [`05-conventions/`](./05-conventions/00-overview.md) | App-scoped tooling (e.g., Axios pinning) |

---

## Cross-References

| Reference | Location |
|-----------|----------|
| UI Design (visual SSOT) | [`../32-ui-design/00-overview.md`](../32-ui-design/00-overview.md) |
| Coding guidelines | [`../02-coding-guidelines/00-overview.md`](../02-coding-guidelines/00-overview.md) |
| Glossary | [`../19-glossary.md`](../19-glossary.md) |
| Enums | [`../20-enums-index.md`](../20-enums-index.md) |
| Spec authoring | [`../01-spec-authoring-guide/00-overview.md`](../01-spec-authoring-guide/00-overview.md) |

---

## Related

- [`../00-overview.md`](../00-overview.md) — Spec root
- [`97-acceptance-criteria.md`](./97-acceptance-criteria.md) — Testable AT-APP-* criteria
- [`99-consistency-report.md`](./99-consistency-report.md) — Module health (100/100)
