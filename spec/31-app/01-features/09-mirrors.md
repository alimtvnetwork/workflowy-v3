# Mirror Specification

> **Version:** 2.5.0
> **Updated:** 2026-04-27 — Linked authoritative model `09b-mirror-peer-group-model.md` (Workflowy parity: peer-group, not source/copy). Prose below describes legacy source-of-truth model; `09b` overrides on conflict and is being folded into a future v3.0.0. Prior: 2026-04-26 — AUDIT-02a: snake_case → PascalCase rename of DB identifiers in code spans (closes audit F-01 for this file). Prior: 2026-04-26 — APP-FIX-08: aspirational-paths disclaimer added to Component Contract (closes audit F-07 for this file). Prior: 2026-04-26 — APP-FIX-03: Realtime Transport callout added (closes audit F-05 for this file)
> **Parent:** [00-overview.md](./00-overview.md)
> **Template:** [13-feature-file-template.md](../../01-spec-authoring-guide/13-feature-file-template.md)
> **Authoritative model (overrides on conflict):** [`09b-mirror-peer-group-model.md`](./09b-mirror-peer-group-model.md) — peer-group identity, detach dissolves singletons, per-peer position.
> **Algorithm spec:** [`09a-mirror-cycle-detection.md`](./09a-mirror-cycle-detection.md) — DFS cycle prevention.

---

## Overview

A Mirror is **NOT a duplicate**. A Mirror is another visible instance of the **same underlying item** — all mirrors reference one canonical source. Editing any mirror updates the source and every other mirror because they all point to the same object. This feature gives users one item visible in many contexts (e.g. a task that lives in a project AND in Today) without copy/paste drift.

## User Story

As a user organizing work across multiple contexts, I want to place the same item in several locations and have edits stay in sync everywhere, so that I never maintain duplicate to-dos that drift out of date.

---

### 8.1 Definition
A Mirror is **NOT a duplicate**. A Mirror is another visible instance of the **same underlying item**. All mirrors reference one **canonical source item**.

This means: same content, same notes, same children, same completion state, same metadata. If a mirrored item is edited anywhere, the original and all mirrors update because they all point to the same source object.

### 8.2 Data Model Concepts

| Concept | Definition |
|---------|------------|
| Source Item | The original canonical item that owns the content. |
| Mirror Instance | A reference record that places the source item visually under a different parent location. The mirror does NOT own separate content. |

### 8.3 What Syncs Across All Mirrors

These properties are shared via the canonical source — editing ANY mirror updates ALL:

| Property | Synced? |
|----------|---------|
| Item text / content | ✅ Yes |
| Formatted/rich content | ✅ Yes |
| Item type (heading, to-do, etc.) | ✅ Yes |
| Note | ✅ Yes |
| Date assigned | ✅ Yes |
| Completion state | ✅ Yes |
| Children (full subtree) | ✅ Yes |
| Child order | ✅ Yes |
| Attachments / files | ✅ Yes |
| Comments | ✅ Yes (comments belong to the source item) |
| Tags | ✅ Yes |
| Text color | ✅ Yes |

### 8.4 What Remains Local Per Mirror Instance

| Property | Local? | Why |
|----------|--------|-----|
| Placement (which parent it appears under) | ✅ Yes | Each mirror lives under a different parent location. |
| Expanded/collapsed UI state | ✅ Yes | The same mirrored item can be collapsed in one location and expanded in another. |
| Selection / highlight / focus state | ✅ Yes | Transient UI state only. |

### 8.5 Mirror UX Elements

| Element | Specification |
|---------|---------------|
| Mirror badge | Every mirrored item MUST show a small diamond (◇) icon next to its content. |
| Mirror hover tooltip | On hovering the diamond badge: "This is a mirror. Changes here update the original item and all other mirrors." |
| Mirror creation notice | One-time toast shown when creating a mirror: **"Mirrors stay synced. Duplicates do not."** This single sentence is critical for user understanding. |
| Mirror source indicator | In the item context menu's metadata section, mirrored items show: "Mirrored from: {source item title}" with a clickable link to zoom to the source. |
| Broken mirror | If the source item is deleted, mirrors show a warning: "⚠ Original item was deleted" in red/destructive color. The mirror becomes read-only. The user can choose: "Convert to independent item" (copies data to a real item) or "Delete this mirror". |

### 8.6 Mirror vs Duplicate — Clear User-Facing Distinction

| Action | What Happens | Data Relationship |
|--------|-------------|-------------------|
| **Mirror To…** | Creates a reference to the same source item in another location. | Shared content — editing one edits all. Same underlying item. |
| **Duplicate** | Creates a completely independent copy with new identifiers. | No relationship. Fully independent content going forward. |

### 8.7 "Mirror To…" Action Flow

For cleaner UX, use only **"Mirror To…"** in the context menu (one unified action). The keyboard shortcut ⇧⌘M opens the same dialog.

| Step | Behavior |
|------|----------|
| 1. User clicks "Mirror To…" or presses ⇧⌘M | A location picker dialog opens (same style as "Move To…" but labeled "Mirror To…"). |
| 2. User browses or searches for a target location | A tree browser shows all the user's items. |
| 3. User selects a target parent | A mirror reference is created under that parent. |
| 4. Confirmation | Toast: "Mirror created in {target name}". Subtitle: "Mirrors stay synced. Duplicates do not." |

### 8.8 Mirror Conflict Resolution (Multiplayer)

| Phase | Strategy |
|-------|----------|
| MVP (Phase 1) | **Last-write-wins at field level.** All mirror edits resolve against the same source item. If two users edit the same field simultaneously, the latest confirmed update wins. All mirror instances re-render from the canonical source state. |
| Phase 2 | Field-level merge — non-conflicting fields merge automatically. |
| Phase 3 | CRDT or OT-based text merge for real-time collaborative text editing per item. |

**Presence indicators**: The system MAY show that another user is currently editing the same source item (e.g. a small avatar dot on the item row).

---

## Storage

| Layer | Tables | Notes |
|-------|--------|-------|
| **Root DB** | — | Mirrors are workspace-local. |
| **App DB** (per workspace) | `Mirrors` (`MirrorId`, `SourceId`, `ParentId`, `SortOrder`, `BrokenAt`), `Items` (source rows mirrors point at) | `Mirrors.SourceId` references `Items.ItemId` *within the same App DB*. Cross-workspace mirrors are out of scope. |
| **Cross-DB joins** | **Forbidden.** | A mirror cannot point at an item in a different workspace's App DB. |

---

## Realtime Transport

| Channel | Mechanism | Fallback |
|---------|-----------|----------|
| `mirror:created` / source-edit propagation to all mirror locations | **WP-native SSE** keyed by `(UserId, WorkspaceId)` | **5 s poll** of `/api/sync?since={ServerTs}` when SSE drops |
| Presence dot on item being co-edited | Same SSE channel | None (presence is best-effort) |

> Per [`14-concurrency-and-sync.md`](./14-concurrency-and-sync.md) §14.1 and `00-overview.md` L9. WebSockets / Pusher / Supabase Realtime / CRDT-Yjs are **forbidden** in MVP. Phase-3 CRDT is tracked separately.

---

## Inputs

| Field | Type | Source | Required | Notes |
|-------|------|--------|----------|-------|
| `sourceItemId` | `string` | Selected item | Yes | The canonical item being mirrored |
| `targetParentId` | `string` | "Mirror To…" picker | Yes | New parent location for the mirror instance |
| `currentUser` | `User` | Auth session | Yes | Must have Edit on source AND target parent |
| `existingMirrorIds` | `string[]` | API: `GET /items/{id}/mirrors` | Yes | Drives diamond badge + sibling count |
| `triggerSource` | `'context-menu' \| 'shortcut'` | UI event | Yes | Both open same picker dialog |

## Outputs

| Output | Persisted? | Channel | Notes |
|--------|-----------|---------|-------|
| Mirror instance created | ✅ SQLite | `Mirrors` table — `(SourceId, ParentId, SortKey)` | No duplicated content |
| Mirror creation toast | ❌ | Toast bus | Subtitle: "Mirrors stay synced. Duplicates do not." |
| Diamond badge render | ❌ | React state | Visible on every mirror instance + source |
| `mirror:created` event | ❌ | Event bus | Drives real-time peer updates |
| Source edit → sync to all mirrors | ✅ SQLite | Source item UPDATE | All mirror rows re-render from canonical row |
| Broken-mirror warning | ❌ | React state | Shown when source `DeletedAt` is set |
| Convert-to-independent action | ✅ SQLite | New item INSERT + mirror DELETE | Copies content snapshot at conversion time |

## Edge Cases

1. User mirrors an item under its own subtree (cycle) — block with toast "Cannot mirror an item into itself or its descendants".
2. User mirrors an item under a parent where it already has a mirror — block; toast "Already mirrored in this location".
3. Source item is deleted while mirrors exist — mirrors flip to read-only with red ⚠ banner; user picks Convert or Delete.
4. User mirrors a heading with 500 descendants — picker shows "(500 descendants will appear)"; create succeeds; rendering respects 250-per-view cap.
5. Two users edit the same source field at the same time — last write wins per source row; all mirrors re-render from the new canonical state.
6. User attempts to mirror across workspaces they don't own — block; picker hides workspaces without Edit access.
7. Mirror's local parent is deleted — the mirror instance is removed; source item and other mirrors are unaffected.
8. User collapses mirror in location A — location B remains expanded (UI state is per-instance per `§8.4`).
9. User toggles to-do completion on a mirror — source row updates; every other mirror re-renders as completed within 100 ms.
10. Source item is converted from to-do to heading — every mirror re-renders as a heading; checkbox disappears everywhere.
11. User shares an item that is mirrored — share grant attaches to the source; all mirrors inherit access.
12. Network drops mid-mirror-create — operation queued per `mem://features/offline-resilience`; diamond badge appears on reconnect.
13. User uses ⇧⌘M while focus is on the root — block; toast "Cannot mirror the root item".
14. User clicks "Convert to independent item" on a broken mirror — new item inserted with content snapshot; subsequent edits no longer sync.

## Acceptance Tests

| ID | Given | When | Then | testid |
|----|-------|------|------|--------|
| AT-MIRRORS-01 | Item with 2 mirrors exists | User edits content in mirror A | Source + all mirrors reflect new content within 100 ms | `mirror-content` |
| AT-MIRRORS-02 | Source item is open | User clicks "Mirror To…" in context menu | Location picker dialog opens labeled "Mirror To…" | `mirror-picker-dialog` |
| AT-MIRRORS-03 | Source item is focused | User presses ⇧⌘M | Same picker dialog opens (single action surface) | `mirror-picker-dialog` |
| AT-MIRRORS-04 | Picker is open | User selects a target parent | New mirror row inserted; toast "Mirror created in {target}" with subtitle "Mirrors stay synced. Duplicates do not." | `mirror-create-toast` |
| AT-MIRRORS-05 | Item is mirrored | Page renders | Diamond (◇) badge appears next to content on EVERY instance (source + all mirrors) | `mirror-badge` |
| AT-MIRRORS-06 | Mirror badge is visible | User hovers it | Tooltip "This is a mirror. Changes here update the original item and all other mirrors." | `mirror-badge-tooltip` |
| AT-MIRRORS-07 | Mirror is open | User opens context menu | Metadata section shows "Mirrored from: {source title}" as a clickable zoom link | `mirror-source-link` |
| AT-MIRRORS-08 | User picks the source's own subtree as target | Picker submit | Block with toast "Cannot mirror an item into itself or its descendants" | `mirror-cycle-error` |
| AT-MIRRORS-09 | Item already mirrored under target parent | User picks same parent again | Block with toast "Already mirrored in this location" | `mirror-duplicate-error` |
| AT-MIRRORS-10 | Source item is deleted | Mirror is rendered | Red ⚠ banner "Original item was deleted"; mirror becomes read-only | `mirror-broken-banner` |
| AT-MIRRORS-11 | Broken mirror is shown | User clicks "Convert to independent item" | New independent item created with snapshot; mirror row deleted | `mirror-convert-button` |
| AT-MIRRORS-12 | Broken mirror is shown | User clicks "Delete this mirror" | Mirror row deleted; no other instances affected | `mirror-delete-button` |
| AT-MIRRORS-13 | Mirror is collapsed in location A | Location B is rendered | Location B remains expanded (UI state per-instance) | `mirror-expand-toggle` |
| AT-MIRRORS-14 | Mirror is a to-do | User checks completion on mirror B | Source + all other mirrors render as completed within 100 ms | `mirror-todo-checkbox` |
| AT-MIRRORS-15 | Focus is on root item | User presses ⇧⌘M | Block with toast "Cannot mirror the root item" | `mirror-root-error` |
| AT-MIRRORS-16 | Network is offline | User completes "Mirror To…" flow | Operation queued; diamond badge + mirror row appear on reconnect | `mirror-pending-state` |

## Component Contract

> **Note:** None of these components exist yet — paths are the planned implementation order (aspirational, not normative). The disclaimer mirrors `01-information-model.md` L149 and feeds the global component-contract map (M-3). AI implementers MUST NOT treat the paths as binding imports.

| Surface | Component path | `data-testid` | Acceptance tests |
|---------|---------------|---------------|------------------|
| Mirror badge | `src/components/items/MirrorBadge.tsx` | `mirror-badge`, `mirror-badge-tooltip` | AT-MIRRORS-05, 06 |
| Mirror picker dialog | `src/components/items/MirrorPickerDialog.tsx` | `mirror-picker-dialog` | AT-MIRRORS-02, 03 |
| Mirror creation toast | `src/components/feedback/MirrorCreateToast.tsx` | `mirror-create-toast` | AT-MIRRORS-04 |
| Mirror content renderer | `src/components/items/MirrorContent.tsx` | `mirror-content` | AT-MIRRORS-01 |
| Mirror source link (context menu) | `src/components/items/MirrorSourceLink.tsx` | `mirror-source-link` | AT-MIRRORS-07 |
| Cycle/duplicate error toast | `src/components/feedback/MirrorErrorToast.tsx` | `mirror-cycle-error`, `mirror-duplicate-error`, `mirror-root-error` | AT-MIRRORS-08, 09, 15 |
| Broken-mirror banner | `src/components/items/BrokenMirrorBanner.tsx` | `mirror-broken-banner` | AT-MIRRORS-10 |
| Convert-to-independent button | `src/components/items/MirrorConvertButton.tsx` | `mirror-convert-button` | AT-MIRRORS-11 |
| Mirror delete button | `src/components/items/MirrorDeleteButton.tsx` | `mirror-delete-button` | AT-MIRRORS-12 |
| Per-instance expand toggle | `src/components/items/ExpandToggle.tsx` | `mirror-expand-toggle` | AT-MIRRORS-13 |
| Mirror to-do checkbox | `src/components/items/TodoCheckbox.tsx` | `mirror-todo-checkbox` | AT-MIRRORS-14 |
| Pending mirror state | `src/components/items/MirrorPendingBadge.tsx` | `mirror-pending-state` | AT-MIRRORS-16 |

> **Note:** Components are planned paths — none exist yet. Feeds the global component-contract map (M-3).

---

## Related

- [01-information-model.md](./01-information-model.md) — `Mirror` table + source/instance identity
- [06-item-context-menu.md](./06-item-context-menu.md) — "Mirror To…" entry point
- [08-share-dialog.md](./08-share-dialog.md) — share grants attach to source, inherited by mirrors
- [10-today-view.md](./10-today-view.md) — Today is the most common mirror target
- [03-edge-cases/01-edge-cases.md](../03-edge-cases/01-edge-cases.md) — broken-mirror + cycle edge cases
- [09a-mirror-cycle-detection.md](./09a-mirror-cycle-detection.md) — algorithmic SSOT for `ERR_CYCLE` (SQL CTE + DFS + AT-CYCLE-01..10)
- `mem://features/mirroring` — linked-instance sync rules
- [`./04-page-content-area.md`](./04-page-content-area.md) — ← Page content-area renderer (forward link from)
- [`./07-board-view.md`](./07-board-view.md) — ← Board view (forward link from)
- [`./09b-mirror-peer-group-model.md`](./09b-mirror-peer-group-model.md) — ← Mirror peer-group data model (forward link from)
- [`./11-trash-view.md`](./11-trash-view.md) — ← Trash view (forward link from)
- [`./12-multi-select.md`](./12-multi-select.md) — ← Multi-select bulk ops (forward link from)
- [`./13-templates.md`](./13-templates.md) — ← Templates (forward link from)
- [`./14-concurrency-and-sync.md`](./14-concurrency-and-sync.md) — ← Concurrency + sync rules (forward link from)
