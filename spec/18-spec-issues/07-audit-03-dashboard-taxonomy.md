# AUDIT-03 — Dashboard Taxonomy Contradiction

> **Version:** 1.0.0
> **Created:** 2026-04-26 (UTC+8)
> **Status:** ✅ **CLOSED 2026-04-26**
> **Parent:** [`00-overview.md`](./00-overview.md)
> **Round:** Round-3 spec audit (AUDIT-01..06 series)
> **SSOT updates:** [`spec/20-enums-index.md`](../20-enums-index.md) §3.5
> **Companion:** [`06-app-folder-audit-2026-04-26.md`](./06-app-folder-audit-2026-04-26.md) — references AUDIT-03 in §F-15 prose

---

## 1. Problem Statement

The string `dashboard` was used inconsistently across three SSOT-class files, producing a **taxonomy split-brain** where an AI implementer would not know whether `dashboard` is:

- (A) an **`ItemType`** value persisted on `Items.ItemType`, OR
- (B) a separate **VIEW MODE** persisted on `Items.ViewMode`, OR
- (C) a UI-only label with no DB representation.

### Conflicting evidence (pre-fix)

| File | Line | Evidence | Interpretation implied |
|------|------|----------|------------------------|
| `spec/20-enums-index.md` | 82 | `ItemType` enum lists: `bullet, h1, h2, h3, paragraph, todo, numbered, board, quote, code, divider, mirror` (12) — **dashboard absent** | Dashboard is NOT an `ItemType`. |
| `spec/32-ui-design/01-architecture/03-component-hierarchy.md` | 78 | "all 12 item types … Bullets, H1, H2, H3, Paragraph, To-do, Number, Board, **Dashboard**, Quote, Code Block, Divider" (12) — **mirror absent** | Dashboard IS an `ItemType`; mirror is NOT. |
| `spec/31-app/01-features/04-page-content-area.md` | 59 | "Dashboard \| Filled circle (•) \| Normal text \| Children render as a dashboard/overview layout" (in the Bullet Types table) | Dashboard IS an `ItemType` (table row peer of bullet, h1, todo). |
| `spec/31-app/01-features/06-item-context-menu.md` | 36, 184 | "Converts to dashboard **view**" + emits `turn-into-dashboard` test id alongside `turn-into-board`, `turn-into-h1`, etc. | Behaves as a turn-into target like other `ItemType`s, but is verbally labeled a "view" — ambiguous. |
| `spec/32-ui-design/01-architecture/05-component-contract-map.md` | 114, 334 | `turn-into-dashboard` listed alongside the 11 other `turn-into-*` test ids | Dashboard IS a turn-into target. |
| `spec/31-app/01-features/03-layout-structure.md` | 72 | Handbook: "Bullet Types (all 12 types …), Board view, Dashboard view" — names them as VIEWS | Dashboard is a VIEW. |

### Why this matters

If an AI implementer trusts `20-enums-index.md` (which is the canonical enum SSOT per `mem://constraints/coding-guidelines`), it will:
1. Build the `ItemType` `as const` object **without `dashboard`**.
2. The `turn-into-dashboard` action will then dispatch an unknown `ItemType`, failing TS strict checks.
3. The `Mirror` action UX (which is NOT a turn-into in the existing menu) will be incorrectly modeled as a type conversion because `mirror` *is* in the enum.

This is exactly the kind of foundational contradiction the spec audit is designed to catch.

---

## 2. Resolution (normative)

### 2.1 Canonical `ItemType` enum (12 values)

```
bullet, h1, h2, h3, paragraph, todo, numbered, board, dashboard, quote, code, divider
```

- **`mirror` is REMOVED** from `ItemType`.
- **`dashboard` is ADDED** to `ItemType`.
- Total stays at **12** (the canonical count cited in 6+ files).

### 2.2 Why `mirror` is not an `ItemType`

A mirror is a relationship, not a node-style. The `Mirrors` table holds `(SourceId, ParentId, SortKey)` rows that point at a source `Items` row. When rendered, the mirror borrows its `ItemType` from the source. There is no "Mirror" entry in the Turn-Into submenu (per `06-item-context-menu.md` §5.1) — the user creates a mirror via the **Mirror** action (§5.2, action row), which inserts a `Mirrors` row, not via a type conversion. Modeling `mirror` as an `ItemType` value would imply that a row could be turned-into a mirror in place — the spec explicitly forbids this (see `09-mirrors.md` §1).

### 2.3 Why `dashboard` IS an `ItemType` (and what "view" means here)

`board` and `dashboard` are the two `ItemType` values whose semantic effect is **child-rendering** rather than self-rendering:

| ItemType | Self renders as | Children render as |
|----------|-----------------|--------------------|
| `bullet`, `h1`..`h3`, `paragraph`, `todo`, `numbered`, `quote`, `code`, `divider` | Their own text style | Standard nested outline list |
| **`board`** | Bullet + text | **Kanban columns + cards** (per `07-board-view.md`) |
| **`dashboard`** | Bullet + text | **Dashboard / overview layout with metrics** (per `04-page-content-area.md` §3.3 row) |

When the context menu / handbook says "**Board view**" or "**Dashboard view**" it refers to **the child-rendering mode triggered by the parent's `ItemType`**, not to a separate `Items.ViewMode` column or any kind of view-state object. The word "view" in this context is UI vocabulary, not data vocabulary.

`Items.ViewMode` (introduced by AUDIT-02a in `03-layout-structure.md` L197) is a **separate field** that records a per-item user override of the *default* child layout (e.g. forcing list rendering on a `board` item temporarily without changing its `ItemType`). It is NOT what "Board view" / "Dashboard view" refer to in `06-item-context-menu.md`.

### 2.4 Forbidden interpretations (for AI implementers)

- ❌ Modeling `dashboard` as a separate `Items.ViewMode` value when its `ItemType` would otherwise be `bullet`. Use `ItemType = 'dashboard'` directly.
- ❌ Adding `mirror` back to the `ItemType` enum. Mirrors are rows in the `Mirrors` table.
- ❌ Treating "view" in "Board view" / "Dashboard view" as evidence for a separate VIEW enum. It is UI prose for the child-rendering effect of an `ItemType`.
- ❌ Counting item types as 13 (12 + dashboard added without removing mirror) or 11 (12 with mirror removed and nothing added). The canonical count is **12**.

---

## 3. Files Patched

| # | File | Change | Version bump |
|---|------|--------|--------------|
| 1 | `spec/20-enums-index.md` | `ItemType` enum: swap `mirror` → `dashboard`; add note pointing here | minor |
| 2 | `spec/31-app/01-features/04-page-content-area.md` | Add taxonomy callout above §3.3 Bullet Types table linking to this doc | minor |
| 3 | `spec/31-app/01-features/06-item-context-menu.md` | Reword "Converts to dashboard view" → "Converts to dashboard `ItemType` (child-rendering: dashboard layout)"; same fix for Board row | minor |
| 4 | `spec/31-app/01-features/03-layout-structure.md` | Footnote on the handbook line clarifying "Board view / Dashboard view" = child-rendering mode of the corresponding `ItemType` | (no bump — clarification only in prose) |
| 5 | `spec/31-app/01-features/99-consistency-report.md` | AUDIT-03 row → ✅ CLOSED |
| 6 | `spec/18-spec-issues/97-acceptance-criteria.md` | Coverage map row added |

---

## 4. Acceptance Criteria

- [x] `spec/20-enums-index.md` `ItemType` lists exactly 12 values: `bullet, h1, h2, h3, paragraph, todo, numbered, board, dashboard, quote, code, divider` — `mirror` absent.
- [x] No file in `spec/31-app/01-features/` or `spec/32-ui-design/` lists `mirror` as an `ItemType` turn-into target.
- [x] No file refers to "dashboard view" without either (a) the `ItemType` link or (b) an explicit footnote pointing at this doc.
- [x] The "12 item types" count cited in `spec/32-ui-design/01-architecture/03-component-hierarchy.md` L78 matches the enum.
- [x] `Items.ViewMode` is NOT conflated with the dashboard/board child-rendering modes anywhere.

---

## 5. Out of Scope

- Implementation of the `Mirrors` table schema — handled in `09-mirrors.md`.
- Adding a `Mirror` entry to the Turn-Into submenu — explicitly forbidden by `09-mirrors.md` §1.
- Renaming `Items.ViewMode` — the field is conceptually distinct and stays.
- Translating the prose "Board view / Dashboard view" everywhere — only the SSOT-class files in §3 are touched. Test/changelog/historical mentions are exempt.

---

## 6. Validation History

| Date | Version | Action |
|------|---------|--------|
| 2026-04-26 | 1.0.0 | Created + closed in same pass. Resolves Round-3 AUDIT-03. |
