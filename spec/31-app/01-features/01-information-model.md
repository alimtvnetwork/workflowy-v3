# Information Model Foundations

> **API Contract:** See [`spec/31-app/06-endpoints/01-information-model.md`](../06-endpoints/01-information-model.md) for the endpoint surface that backs this feature (request/response envelopes, status codes, error shapes). Bidirectional cross-link added 2026-04-30 to close **F-AUD42-04** (App-folder audit Phase 5).


> **Version:** 2.3.0
> **Updated:** 2026-04-26 — AUDIT-02a: snake_case → PascalCase rename of DB identifiers in code spans (closes audit F-01 for this file). Prior: 2026-04-26 — APP-FIX-02: Storage section added (closes audit F-03 for this file)
> **Parent:** [00-overview.md](./00-overview.md)
> **Template:** [13-feature-file-template.md](../../01-spec-authoring-guide/13-feature-file-template.md)


## Database Routing

| Database | Tables read/written | Notes |
|---|---|---|
| **Root DB** | `Workspace`, `User`, `WorkspaceMember`, `RoleType`, `Share`, `PendingInvites`, `Template` (catalog) | Membership + workspace-level metadata. |
| **App DB** (per workspace) | `Items`, `MirrorGroup`, `MirrorMember`, `Comment`, `ItemTags`, `Favorite` | All item-tree content lives here. |
| **Cross-DB joins** | **Forbidden.** | Item ID copies (no FKs across DBs); see [`spec/31-app/07-db-diagram/`](../07-db-diagram/) for full ERD. |

> **Audit cite:** Section added 2026-04-30 to close **F-AUD42-02** (App-folder audit Phase 4). Mirrors the Root-DB / App-DB split per ADR-0019.

---

## Overview

The information model is the foundational data contract for every item the user creates. It defines the root, identity, and entity relationships that every other feature (mirrors, shares, board view, trash, templates, search) builds on top of. If this model breaks, every downstream feature breaks.

## User Story

As a user, I want every item I create to live in a single coherent tree under my account, so that I can move, mirror, share, and recover items without losing references or breaking deep links.

---

## Enum Sources (normative)

| Enum mentioned in this file | Canonical SSOT | Strategy |
|------------------------------|----------------|----------|
| `ItemType` | [`spec/20-enums-index.md`](../../20-enums-index.md) §2 | TS Strategy B (`as const` + derived union) — see [`spec/02-coding-guidelines/02-typescript/00-overview.md`](../../02-coding-guidelines/02-typescript/00-overview.md) |

> **Forbidden:** TS `enum` keyword and bare literal unions. Always import the canonical `as const` object.

---

## 1.1 Root Rules

- Root always exists. Every user has exactly one root item created on signup.
- Root cannot be deleted.
- Root is the destination for the Home button.
- Root renders the top-level item list.

## 1.2 Identity Rule

Item IDs never change, even if an item is moved, mirrored, shared, or restored from trash. This preserves deep links, mirrors, shares, and history references across all operations.

## 1.3 Entity-Relationship Summary

This table describes how every core data entity relates to others in the system. No entity exists in isolation.

| Entity A | Relationship | Entity B | Cardinality | Notes |
|----------|-------------|----------|-------------|-------|
| User | owns | Profile | 1 : 1 | Auto-created on signup |
| User | owns | Items | 1 : many | All items belong to exactly one user |
| Item | has parent | Item | many : 1 | Self-referencing. Null parent = root-level item |
| Item | has children | Items | 1 : many | Recursive nesting, unlimited depth |
| Item | is mirrored by | Mirror | 1 : many | One source item can have many mirror placements |
| Mirror | placed under | Item (target parent) | many : 1 | A mirror appears as a child of its target parent |
| Item | tagged with | Tags | many : many | Via a junction/linking table (item_tags) |
| Tag | owned by | User | many : 1 | Tags are per-user |
| Item | shared via | Share | 1 : many | One item can be shared with multiple users |
| Share | grants access to | User | many : 1 | Via email or user ID |
| Item | has | Comments | 1 : many | Comments belong to source items (mirrors inherit) |
| Comment | authored by | User | many : 1 | |
| Item | has | File Attachments | 1 : many | Files attached to items |
| Item | bookmarked as | Favorite | 1 : many | Per-user favorites |
| Item | saved as | Template | 1 : 1 | Serialized tree snapshot |
| Item | soft-deleted to | Trash | 1 : 1 | Serialized tree with 30-day expiry |
| User | has | Roles | 1 : many | Stored separately for security |
| User | generates | Activity Log | 1 : many | Audit trail of all actions |

**Key integrity rules:**
- Deleting a parent item cascades deletion to all children.
- Deleting a source item marks all its mirrors as broken.
- Sharing an item cascades view access to all descendants.
- Mirrors always reference the canonical source — never another mirror.

---

## Storage

| Layer | Tables | Notes |
|-------|--------|-------|
| **Root DB** | `User`, `Workspace`, `WorkspaceMember` | Per [`spec/05-split-db-architecture/00-overview.md`](../../05-split-db-architecture/00-overview.md): identity + workspace registry only. |
| **App DB** (per workspace) | `Items`, `ItemTags`, `Tags`, `Comments`, `Attachments`, `Mentions` | All item content lives here. One App DB file per workspace. |
| **Cross-DB joins** | **Forbidden.** | Workspace lookup happens via Root DB → switch connection → query App DB. |

---

## Inputs

| Field | Type | Source | Required | Notes |
|-------|------|--------|----------|-------|
| `ownerId` | `OwnerId` (branded — ADR-0020) | Auth session | Yes | Owner of every created item; constructed via `asOwnerId()` at trust boundary |
| `parentId` | `ItemId \| null` (branded — ADR-0020) | UI tree position | No | `null` = direct child of root |
| `content` | `string` (rich text) | User typing | Yes | Empty allowed at creation |
| `itemType` | `ItemType` enum | Toolbar / shortcut | Yes | One of 12 types per ADR-0015 (see `spec/20-enums-index.md` §3.5) |
| `sortOrder` | `string` (lexicographic base-62 fractional — ADR-0016) | Drop position | Yes | Generated via fractional-indexing library; never numeric `(A+B)/2` |
| `tags` | `string[]` | Inline `#tag` syntax | No | Resolved against per-user `Tag` table |

## Outputs

| Output | Persisted? | Channel | Notes |
|--------|-----------|---------|-------|
| New `Item` row | ✅ SQLite | `items` table | `id` is generated once and never mutated |
| Parent-child link | ✅ SQLite | `Items.ParentId` FK | Null for root-level |
| `item:created` event | ❌ | Event bus | Drives mirror sync, search index, activity log |
| Optimistic UI render | ❌ | React state | Rolls back on save failure |
| Activity log entry | ✅ SQLite | `ActivityLog` table | One row per create/move/delete/restore |

## Edge Cases

1. User signs up — root item must be created atomically with the profile (no orphan accounts).
2. User deletes the root item via API — must reject with `409 Conflict`.
(gate **G-24-IDS-MUST-BE-BRANDED**) 3. Item is moved to a new parent — `id` MUST remain stable; only `ParentId` and `SortOrder` change.
4. Item is mirrored into another branch — `id` of source remains stable; mirror gets its own `id` but references source.
5. Item is shared — `id` remains stable; share grants do not rewrite the item.
6. Item is soft-deleted to trash and later restored — `id` remains stable so deep links survive.
7. Parent is deleted — all descendants cascade-delete; mirrors of any descendant become broken (per `09-Mirrors.md`).
8. Tag references a tag the user has not created yet — auto-create the tag in the same transaction.
9. Concurrent create from two tabs with same `parentId` — both succeed; sort order separates them per LWW (M-4).
10. Bulk import (paste 100+ lines) — every created item must get a unique stable `id` in a single transaction.

## Acceptance Tests

| ID | Given | When | Then | testid |
|----|-------|------|------|--------|
| AT-INFOMODEL-01 | A new user signs up | Signup transaction commits | Exactly one root item exists with `ParentId = null` and `UserId = newUser.id` | `root-item` |
| AT-INFOMODEL-02 | The root item exists | API `DELETE /items/{rootId}` is called | Response is `409 Conflict`; root row remains | `root-delete-error` |
| AT-INFOMODEL-03 | An item with `id = X` is at parent A | User drags it to parent B | Item row still has `id = X`; only `ParentId` changed to B | `item-row` |
| AT-INFOMODEL-04 | An item with `id = X` exists | User mirrors it under another parent | Source row still has `id = X`; new mirror row references `SourceId = X` | `mirror-badge` |
| AT-INFOMODEL-05 | An item with `id = X` is shared with another user | Share grant is created | Item row still has `id = X`; share row references `ItemId = X` | `share-status-pill` |
| AT-INFOMODEL-06 | An item with `id = X` is soft-deleted | User restores it from trash within 30 days | Restored row still has `id = X` and the original deep link `/items/X` resolves | `trash-restore-button` |
| AT-INFOMODEL-07 | A parent item with 3 children exists | User deletes the parent | All 4 rows are removed; any mirrors of the children flip to `broken = true` | `delete-confirm-dialog` |
| AT-INFOMODEL-08 | An item is created with `content = "buy milk #shopping"` and the user has no `shopping` tag yet | Save commits | Item row exists; `tags` row `shopping` exists for that user; junction row links them | `tag-chip` |
| AT-INFOMODEL-09 | Two browser tabs both POST a child under the same parent within 50 ms | Both requests resolve | Both items persist with distinct `id`s and distinct `SortOrder` values; UI shows both in deterministic order | `item-row` |
| AT-INFOMODEL-10 | User pastes 100 lines into the editor | Bulk-create transaction commits | 100 item rows exist with 100 distinct `id`s, all with the same `ParentId` and monotonically increasing `SortOrder` | `bulk-create-progress` |

> **Identity-rule coverage:** AT-INFOMODEL-03 through AT-INFOMODEL-06 collectively prove §1.2 — IDs survive move, mirror, share, and restore. This satisfies audit row **H-3**.

## Component Contract

| Surface | Component path | `data-testid` | Acceptance tests |
|---------|---------------|---------------|------------------|
| Root item container | `src/components/tree/RootContainer.tsx` | `root-item` | AT-INFOMODEL-01 |
| Root delete error toast | `src/components/feedback/ErrorToast.tsx` | `root-delete-error` | AT-INFOMODEL-02 |
| Item row | `src/components/tree/ItemRow.tsx` | `item-row` | AT-INFOMODEL-03, AT-INFOMODEL-09 |
| Mirror badge | `src/components/items/MirrorBadge.tsx` | `mirror-badge` | AT-INFOMODEL-04 |
| Share status pill | `src/components/items/ShareStatusPill.tsx` | `share-status-pill` | AT-INFOMODEL-05 |
| Trash restore button | `src/components/trash/TrashRestoreButton.tsx` | `trash-restore-button` | AT-INFOMODEL-06 |
| Delete confirm dialog | `src/components/items/DeleteConfirmDialog.tsx` | `delete-confirm-dialog` | AT-INFOMODEL-07 |
| Tag chip | `src/components/tags/TagChip.tsx` | `tag-chip` | AT-INFOMODEL-08 |
| Bulk create progress | `src/components/feedback/BulkCreateProgress.tsx` | `bulk-create-progress` | AT-INFOMODEL-10 |

> **Note:** None of these components exist yet — paths are the planned implementation order. This table feeds the global component-contract map (M-3).

---

## Workflowy Feature Reference (F1) — Item Types & Item Affordances

> **Source:** Workflowy product feature list, merged 2026-04-28 (lossless, additive). Format: **Feature Title** — Description (slash command + shortcut where applicable).
> **Reconciliation:** Workflowy ships "Mirror" as an item-level feature; in WorkFlowy it is a peer-group **relation**, not an `ItemType`. See `mem://features/mirroring` and [`./09b-mirror-peer-group-model.md`](./09b-mirror-peer-group-model.md). The reference text below is reproduced verbatim from the Workflowy spec; the model-level interpretation lives in §2 of this file.

### Item Types

- **Item Types** — Choose how an item should look or behave. Item types include: Bullet, To-do, Heading H1/H2, Paragraph, Numbered List, Mirror, Code Block, Quote, Divider, Board, and Dashboard. Convert via slash command or item menu. (slash: `/<type>`)
- **Bullet** — Default item type. Renders as a round bullet. (slash: `/bullet`)
- **To-do** — Item with a leading checkbox; toggling marks the item complete and applies completion styling. (slash: `/todo`, shortcut: ⌘↵ on macOS / Ctrl+↵ on Windows)
- **Heading H1** — Larger emphasised title used to break a list into sections. (slash: `/h1`)
- **Heading H2** — Secondary section title, smaller than H1. (slash: `/h2`)
- **Paragraph** — Item rendered as flowing prose without a leading bullet. (slash: `/paragraph`)
- **Numbered List** — Item that auto-numbers among its sibling group. (slash: `/numbered`)
- **Complete** — Mark a To-do item as done. Completed items can be hidden via *Show/Hide Completed*. (shortcut: ⌘↵)
- **Add Note** — Attach a secondary text block ("note") under any item. Renders smaller and dimmer than the parent. (shortcut: Shift+↵)
- **Add Date** — Insert a date chip into the item content; powers Today view and date search. (slash: `/date`, shortcut: ⌘+Shift+. on macOS)
- **Tags** — Inline `#tag` or `@tag` tokens. Click a tag to filter; tags also drive search operators. See `12-tags-and-mentions.md` if present.
- **File Upload** — Upload a file (image, PDF, etc.) attached to an item. Files render inline where supported. (slash: `/upload`)
- **Image Resize** — Drag image corners to resize attached images inline.
- **Image Menu** — Per-image overlay menu: replace, download, copy link, delete.
- **Mirror (item-level reference)** — In Workflowy this is presented as an item action that creates an additional reference to the same content elsewhere in the tree. **WorkFlowy interpretation:** modelled as a peer-group relation, not an `ItemType`; see [`./09-mirrors.md`](./09-mirrors.md), [`./09b-mirror-peer-group-model.md`](./09b-mirror-peer-group-model.md), and `mem://features/mirroring`.

### Item Affordances (per-item UI)

- **Item Menu** — The `⋮` button on each item row. Exposes Duplicate, Move To, Mirror, Share, Delete, etc. See [`./06-item-context-menu.md`](./06-item-context-menu.md) for the full menu inventory.
- **Expand/Collapse** — Toggle children visibility. (shortcut: ⌘↑ / ⌘↓)
- **Auto Save** — Every edit is persisted automatically; no manual save action exists. The autosave indicator surfaces transient sync state — see [`./05-interactions.md`](./05-interactions.md) §autosave.
- **Undo** — Reverse the last mutation. (shortcut: ⌘Z)
- **Redo** — Replay the last undone mutation. (shortcut: ⌘+Shift+Z on macOS / Ctrl+Y on Windows)

> Cross-link: keyboard reference is consolidated in [`./05a-hotkey-table.md`](./05a-hotkey-table.md). Slash-command reference is consolidated in [`./06-item-context-menu.md`](./06-item-context-menu.md).

---

## Related

- [02-personas.md](./02-personas.md) — who the model serves
- [03-layout-structure.md](./03-layout-structure.md) — how the tree renders
- [09-mirrors.md](./09-mirrors.md) — how mirrors reference source `id`
- [11-trash-view.md](./11-trash-view.md) — soft-delete + restore flow
- [03-edge-cases/01-edge-cases.md](../03-edge-cases/01-edge-cases.md) — global edge-case index
- [`./04-page-content-area.md`](./04-page-content-area.md) — ← Page content-area renderer (forward link from)
- [`./05-interactions.md`](./05-interactions.md) — ← Keyboard / pointer interactions (forward link from)
- [`./07-board-view.md`](./07-board-view.md) — ← Board view (forward link from)
- [`./08-share-dialog.md`](./08-share-dialog.md) — ← Share dialog (forward link from)
- [`./09a-mirror-cycle-detection.md`](./09a-mirror-cycle-detection.md) — ← Mirror cycle-detection algorithm (forward link from)
- [`./14-concurrency-and-sync.md`](./14-concurrency-and-sync.md) — ← Concurrency + sync rules (forward link from)

---

## Database Scope

- **Anchor:** [`07-db-diagram/00b-split-db-anchor.md`](../07-db-diagram/00b-split-db-anchor.md)
- **Scope:** `[db-scope: app]`
- **Tables:** nodes, mirror_groups, item_types
- **Cross-DB JOINs:** forbidden (split-DB invariant). Cross-DB orchestration, if any, follows ADR-0019.

---

## Architecture Anchors (load-bearing ADRs)

- **ADR-0023 — Loader↔Queue Contract:** Loaders MUST read the local IndexedDB mirror first (≤16 ms p95, never fetch). Mutations MUST write `{mirror, queue_ledger}` in a **single IDB transaction**; the queue worker is the **sole egress** to the WordPress REST surface. SSE frames are read-signals only and MUST NOT enqueue to the FIFO (gates **G-23-LOADER-MIRROR-FIRST**, **G-23-LOADER-NO-MUTATE**, **G-23-ACTION-ENQUEUE-ONLY**). See `spec/30-architecture/adr/0023-loader-queue-contract.md`.
- **ADR-0017 — Named Error Boundaries:** This feature renders inside **`AppErrorBoundary`**. A single top-level boundary is **forbidden**. Loader/action errors surface via the matching named boundary; uncaught render errors escalate to `AppErrorBoundary` (gates **G-22-ERROR-BOUNDARIES-EXACTLY-8**, **G-22-BOUNDARY-NAMES-CLOSED**, **G-22-BOUNDARY-ISOLATION**). See `spec/30-architecture/adr/0017-error-boundaries.md`.
- **ADR-0025 — Realtime is SSE-only:** Cross-tab/cross-client signals arrive via `/stream/page/{id}` and `/stream/user/{id}` (PascalCase frames, `Last-Event-ID` replay). WebSocket / long-poll / 3rd-party push are **forbidden**. (gates **G-25-SSE-ENDPOINT-CLOSED**, **G-25-SSE-CURSOR-WORKSPACE-SCOPED**)

---

## Settings Surface

- **Persisted booleans introduced by this feature:** None.
- **N/A justification:** Pure data-model SSOT — no user-facing toggles; all enums are closed at compile time (ItemType, NodeKind), not user-configurable.
- **Compliance:** Satisfies the MUST in [`00-overview.md:140`](./00-overview.md) by explicit declaration. Any future boolean added here MUST route through `Sanitizer::bool()` and be enumerated in an `OptionNameType` case (see APP-FIX-05).

---

## Backend Write Surface

> Enumerated per F-AUD42-22 (BE:0 closure). All routes follow the **PascalCase API envelope** (ADR-0004/0019: `Status, Attributes, Results` mandatory). Mutations go through the **queue worker** (ADR-0023) — never direct fetch from React.

### REST Routes (write)

| Method | Path | Operation | Idempotency / Concurrency |
|--------|------|-----------|---------------------------|
| `POST` | `/wp-json/workflowy/v1/items` | `CreateItem` | IdempotencyKey |
| `PATCH` | `/wp-json/workflowy/v1/items/{ItemId}` | `UpdateItem` | IdempotencyKey + IfMatch (LWW) |
| `DELETE` | `/wp-json/workflowy/v1/items/{ItemId}` | `SoftDeleteItem` | IdempotencyKey |

### SSE Frames Emitted (read-signal only, ADR-0025)

(gate **G-25-SSE-ENDPOINT-CLOSED**) `ItemCreated`, `ItemUpdated`, `ItemSoftDeleted` on `/stream/page/{id}` and/or `/stream/user/{id}`. SSE MUST NOT enqueue to the FIFO (read-signal only).

### Storage

- **Tables touched:** nodes, lww_meta
- **Error boundary on failure:** `AppErrorBoundary`
- **Cross-DB JOINs:** forbidden (see Database Scope stanza above).

### Endpoint SSOTs

Detailed request/response fixtures live under [`spec/31-app/06-endpoints/`](../06-endpoints/) and [`97b-endpoint-envelope-fixtures.md`](../06-endpoints/97b-endpoint-envelope-fixtures.md).
