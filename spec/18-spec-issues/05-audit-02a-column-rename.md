# AUDIT-02a — Downstream Column-Name Rename (snake_case → PascalCase)

> **Version:** 1.0.0
> **Created:** 2026-04-26 (UTC+8)
> **Status:** Open — tracked
> **Parent:** [`00-overview.md`](./00-overview.md)
> **SSOT:** [`spec/19-glossary.md`](../19-glossary.md) §Database Vocabulary
> **Closes (partially):** AUDIT-02

---

## Background

AUDIT-02 originally flagged a contradiction in `spec/19-glossary.md`: the glossary required PascalCase for every DB table & column, but downstream feature specs still referenced snake_case columns (`items.item_type`, `items.parent_id`, `completed_at`, etc.).

**Glossary v1.1.0 (2026-04-26)** made the PascalCase rule **normative** and declared every snake_case identifier in feature specs **stale**. This file tracks the remaining mechanical rename across feature specs.

---

## Affected Files (8)

| # | File | snake_case occurrences |
|---|------|------------------------|
| 1 | `spec/31-app/01-features/01-information-model.md` | 4 |
| 2 | `spec/31-app/01-features/04-page-content-area.md` | 4 |
| 3 | `spec/31-app/01-features/05-interactions.md` | 3 |
| 4 | `spec/31-app/01-features/06-item-context-menu.md` | 11 |
| 5 | `spec/31-app/01-features/07-board-view.md` | 5 |
| 6 | `spec/31-app/01-features/08-share-dialog.md` | 1 |
| 7 | `spec/31-app/01-features/09-mirrors.md` | 1 |
| 8 | `spec/31-app/01-features/14-concurrency-and-sync.md` | 2 |

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

- [ ] All 8 files above contain zero snake_case DB identifiers (verified via `rg -n "items\\.[a-z_]+|_id|_at|_order|_slug|_type" spec/31-app/01-features/`).
- [ ] Glossary §Database Vocabulary remains the SSOT — no inline contradictions reintroduced.
- [ ] Each rename PR bumps the file's version (per `.lovable/strictly-avoid.md`).
- [ ] On completion, this file is marked **Closed** in `spec/18-spec-issues/97-acceptance-criteria.md`.

---

## Out of Scope

- WordPress core tables (`wp_posts`, `wp_options`) remain snake_case — they are explicitly EXEMPT per the glossary.
- HTTP headers, content-type strings, and URL slugs remain kebab/snake per protocol convention.
