# AUDIT-02a — Downstream Column-Name Rename (snake_case → PascalCase)

> **Version:** 1.1.0
> **Created:** 2026-04-26 (UTC+8)
> **Updated:** 2026-04-26 (UTC+8) — APP-FIX-01 widens scope from 8 → 12 files
> **Status:** Open — tracked
> **Parent:** [`00-overview.md`](./00-overview.md)
> **SSOT:** [`spec/19-glossary.md`](../19-glossary.md) §Database Vocabulary
> **Closes (partially):** AUDIT-02
> **Widened by:** [`06-app-folder-audit-2026-04-26.md`](./06-app-folder-audit-2026-04-26.md) §F-01 / APP-FIX-01

---

## Background

AUDIT-02 originally flagged a contradiction in `spec/19-glossary.md`: the glossary required PascalCase for every DB table & column, but downstream feature specs still referenced snake_case columns (`items.item_type`, `items.parent_id`, `completed_at`, etc.).

**Glossary v1.1.0 (2026-04-26)** made the PascalCase rule **normative** and declared every snake_case identifier in feature specs **stale**. This file tracks the remaining mechanical rename across feature specs.

---

## Affected Files (12)

> Counts re-measured 2026-04-26 by APP-FIX-01 audit. The 4 files added in v1.1.0 are marked **NEW**.

| # | File | snake_case occurrences | Added |
|---|------|------------------------|-------|
| 1 | `spec/31-app/01-features/06-item-context-menu.md` | 14 | v1.0.0 |
| 2 | `spec/31-app/01-features/07-board-view.md` | 13 | v1.0.0 |
| 3 | `spec/31-app/01-features/01-information-model.md` | 10 | v1.0.0 |
| 4 | `spec/31-app/01-features/05-interactions.md` | 7 | v1.0.0 |
| 5 | `spec/31-app/01-features/04-page-content-area.md` | 6 | v1.0.0 |
| 6 | `spec/31-app/01-features/08-share-dialog.md` | 6 | v1.0.0 |
| 7 | `spec/31-app/01-features/14-concurrency-and-sync.md` | 5 | v1.0.0 |
| 8 | `spec/31-app/01-features/15-roles-and-permissions.md` | 4 | **NEW v1.1.0** |
| 9 | `spec/31-app/01-features/09-mirrors.md` | 2 | v1.0.0 |
| 10 | `spec/31-app/01-features/12-multi-select.md` | 1 | **NEW v1.1.0** |
| 11 | `spec/31-app/01-features/03-layout-structure.md` | 1 | **NEW v1.1.0** |
| 12 | `spec/31-app/01-features/00-overview.md` | 1 | **NEW v1.1.0** |

**Total snake_case hits across 12 files:** 70

---

## Canonical Rename Map

| ❌ Stale (snake_case) | ✅ Canonical (PascalCase) |
|----------------------|---------------------------|
| `items.item_type` | `Items.ItemType` |
| `items.parent_id` | `Items.ParentId` |
| `items.sort_order` | `Items.SortOrder` |
| `items.completed_at` | `Items.CompletedAt` |
| `items.due_date` | `Items.DueDate` |
| `items.archived_at` | `Items.ArchivedAt` |
| `items.created_at` | `Items.CreatedAt` |
| `items.updated_at` | `Items.UpdatedAt` |
| `items.deleted_at` | `Items.DeletedAt` |
| `items.content` | `Items.Content` |
| `items.note` | `Items.Note` |
| `user_id` | `UserId` |
| `plugin_slug` | `PluginSlug` |
| `source_id` | `SourceId` |
| `item_tags` (table) | `ItemTags` |
| `comments` (table) | `Comments` |
| `mirrors` (table) | `Mirrors` |
| `templates` (table) | `Templates` |
| `tags` (table) | `Tags` |
| `attachments` (table) | `Attachments` |
| `mentions` (table) | `Mentions` |

---

## Acceptance Criteria

- [ ] All **12** files above contain zero snake_case DB identifiers (verified via `rg -nP "[a-z]+_[a-z]+" spec/31-app/01-features/` returning zero DB-identifier matches; protocol/URL/HTTP-header exemptions still allowed).
- [ ] Glossary §Database Vocabulary remains the SSOT — no inline contradictions reintroduced.
- [ ] Each rename PR bumps the file's version (per `.lovable/strictly-avoid.md`).
- [ ] On completion, this file is marked **Closed** in `spec/18-spec-issues/97-acceptance-criteria.md` AND APP-FIX-01 is marked done in `06-app-folder-audit-2026-04-26.md` §4.

---

## Out of Scope

- WordPress core tables (`wp_posts`, `wp_options`) remain snake_case — they are explicitly EXEMPT per the glossary.
- HTTP headers, content-type strings, and URL slugs remain kebab/snake per protocol convention.
