# Trash View Specification

> **API Contract:** See [`spec/31-app/06-endpoints/11-trash-view.md`](../06-endpoints/11-trash-view.md) for the endpoint surface that backs this feature (request/response envelopes, status codes, error shapes). Bidirectional cross-link added 2026-04-30 to close **F-AUD42-04** (App-folder audit Phase 5).


> **Version:** 2.5.0
> **Updated:** 2026-04-27 — Linked addendum `11b-trash-reaper.md` (daily 03:00 UTC cron, hard-delete cascade rules, `ReaperRuns` log). Prior: 2026-04-26 — APP-FIX-08: aspirational-paths disclaimer added to Component Contract (closes audit F-07 for this file). Prior: 2026-04-26 — APP-FIX-05: Settings Keys (Seedable Config) section added (closes audit F-04 for this file). v2.2.0 added Realtime Transport callout.
> **Parent:** [00-overview.md](./00-overview.md)
> **Template:** [13-feature-file-template.md](../../01-spec-authoring-guide/13-feature-file-template.md)
> **Addendum:** [`11b-trash-reaper.md`](./11b-trash-reaper.md) — 30-day hard-delete cron, cascade matrix, AT-TR-01..05.

---

## Overview

The Trash view is the safety net for deletions. Every soft-deleted item lives here for 30 days, sorted newest-first, with restore and permanent-delete affordances. After 30 days the server reaps the row irreversibly. This is the only surface where permanent deletion is allowed.

## User Story

As a user who occasionally deletes the wrong item, I want a 30-day grace period to restore anything I removed, so that I never lose work to a misclick — and when I do want it gone, I can purge it explicitly.

---

### 10.1 Behavior

| Element | Behavior |
|---------|----------|
| Trash list | Shows all soft-deleted items, newest first. Each item displays: content preview, date deleted, and "Expires in X days". |
| Restore button | Per item — restores the item to its original parent location (or to the root if the original parent was also deleted). Toast: "Item restored". |
| Delete permanently button | Per item — permanently and irreversibly deletes the item. Requires a confirmation dialog: "This cannot be undone. Are you sure?" |
| Empty trash button | Permanently deletes ALL trash items. Requires confirmation. |
| Auto-cleanup | Items in trash expire automatically after 30 days (handled server-side). |

---

## Storage

| Layer | Tables | Notes |
|-------|--------|-------|
| **Root DB** | — | Trash is workspace-local. |
| **App DB** (per workspace) | `Items` (filtered `WHERE DeletedAt IS NOT NULL`), `Mirrors` (cascade-broken on parent deletion) | No separate `Trash` table — soft-delete via `Items.DeletedAt`. 30-day purge job runs against App DB. |
| **Cross-DB joins** | **Forbidden.** | |

---

## Realtime Transport

| Channel | Mechanism | Fallback |
|---------|-----------|----------|
| Peer deletion / restore / 30-day reaper updates | **WP-native SSE** keyed by `(UserId, WorkspaceId)` | **5 s poll** of `/api/sync?since={ServerTs}` when SSE drops |

> Per [`14-concurrency-and-sync.md`](./14-concurrency-and-sync.md) §14.1 and `00-overview.md` L9. WebSockets / Pusher / Supabase Realtime are **forbidden**. The 30-day reaper runs server-side and emits the same SSE events as a manual permanent-delete.

---

## Settings Keys (Seedable Config)

(gate **G-22-BOUNDARY-NAMES-CLOSED**) > **Why this section:** Trash View is reachable from the sidebar entry and exposes the 30-day retention window — both surfaces (sidebar visibility, retention days) MUST be enum-backed per [`spec/06-seedable-config-architecture/`](../../06-seedable-config-architecture/00-overview.md) + [`spec/15-wp-plugin-how-to/15-settings-architecture/`](../../15-wp-plugin-how-to/15-settings-architecture/00-overview.md).

| Setting | `OptionNameType` enum case | Default | Sanitizer | Group | Storage |
|---------|---------------------------|---------|-----------|-------|---------|
| Show Trash in sidebar | `OptionNameType::SIDEBAR_SHOW_TRASH` → `'workflowy_sidebar_show_trash'` | `true` | `Sanitizer::bool()` | `wf_navigation` | Root DB (per-user) |
| Trash retention days | `OptionNameType::TRASH_RETENTION_DAYS` → `'workflowy_trash_retention_days'` | `30` | `Sanitizer::intRange(7, 365)` | `wf_retention` | App DB (per-workspace; reaper reads this) |
| Confirm before permanent delete | `OptionNameType::TRASH_CONFIRM_PERMANENT_DELETE` → `'workflowy_trash_confirm_permanent'` | `true` | `Sanitizer::bool()` | `wf_safety` | Root DB (per-user) |

**Forbidden:**
- ❌ Hard-coding `30` in the reaper — must read `OptionNameType::TRASH_RETENTION_DAYS`.
- ❌ Skipping the confirm-permanent-delete check when the setting is `true`.
- ❌ Bare `get_option('workflowy_trash_retention_days')` — go through the Settings facade.

---

## Inputs

| Field | Type | Source | Required | Notes |
|-------|------|--------|----------|-------|
| `currentUser` | `User` | Auth session | Yes | Trash is per-user; only owner sees their items |
| `trashedItems` | `Item[]` | API: `GET /trash` | Yes | Sorted by `deletedAt` DESC |
| `nowLocal` | `Date` | Browser clock | Yes | Drives "Expires in X days" countdown |
| `viewportSize` | `{ w: number; h: number }` | Window | Yes | 250-per-view virtualization |

## Outputs

| Output | Persisted? | Channel | Notes |
|--------|-----------|---------|-------|
| Trash list render | ❌ | React state | Newest-first |
| Restore action | ✅ SQLite | `Item.deletedAt` cleared, `Item.parentId` reset | Toast "Item restored" |
| Permanent delete (single) | ✅ SQLite | Hard DELETE row + cascade children | Irreversible — confirm dialog required |
| Empty trash | ✅ SQLite | Hard DELETE all rows where `userId = ? AND deletedAt IS NOT NULL` | Confirm dialog required |
| Auto-cleanup | ✅ SQLite | Server cron — DELETE where `deletedAt < now() - 30 days` | Background job |
| `item:restored` / `item:purged` events | ❌ | Event bus | Drives sidebar/list refresh |

## Edge Cases

1. Trash is empty — show empty state "Trash is empty. Deleted items appear here for 30 days."
2. Item's original parent was also deleted — restore places item at the root with toast "Original parent was deleted; restored to root".
3. Item's original parent was deleted then permanently purged — same: restore to root.
4. User restores an item that has 200 deleted children — children restore alongside as a single atomic operation.
5. Item is a mirror — restoring a mirror restores only the mirror reference; the source must already exist (or restore is blocked with "Original source no longer exists").
6. User clicks "Empty trash" with 1000+ items — show progress toast; operation runs in batches; UI updates as rows clear.
7. Item is at day 29 of 30 — show "Expires in 1 day" in destructive color.
8. Item has already expired but server cron hasn't run yet — hide from trash list (filter `deletedAt < now() - 30 days` client-side).
9. User permanently deletes from trash — confirm dialog, on confirm hard-delete; no undo possible.
10. User cancels the confirm dialog — no operation runs; row stays in trash.
11. Network drops during restore — queue per offline-resilience; row shows "Restoring…" badge until reconnect.
12. User restores an item that belongs to a shared workspace where access was revoked — block with toast "Workspace access removed; cannot restore here".
13. Two users (admin + owner) empty trash simultaneously — last write wins; both clients reach the same empty state.

## Acceptance Tests

| ID | Given | When | Then | testid |
|----|-------|------|------|--------|
| AT-TRASH-01 | User has 3 deleted items | User opens Trash view | List renders newest-first; each row shows preview, deleted date, "Expires in X days" | `trash-view-root` |
| AT-TRASH-02 | Trash is empty | View renders | Empty state "Trash is empty. Deleted items appear here for 30 days." appears | `trash-empty-state` |
| AT-TRASH-03 | Trash row is visible | User clicks Restore | `Item.deletedAt` cleared; row leaves Trash; toast "Item restored" | `trash-restore-button` |
| AT-TRASH-04 | Item's original parent is also deleted | User clicks Restore | Item restored to root; toast "Original parent was deleted; restored to root" | `trash-restore-toast` |
| AT-TRASH-05 | Trash row is visible | User clicks Delete permanently | Confirmation dialog "This cannot be undone. Are you sure?" appears | `trash-delete-confirm` |
| AT-TRASH-06 | Confirm dialog is open | User clicks Confirm | Row hard-deleted from DB; row removed from list | `trash-delete-confirm-yes` |
| AT-TRASH-07 | Confirm dialog is open | User clicks Cancel | Dialog closes; row remains in trash | `trash-delete-confirm-no` |
| AT-TRASH-08 | Trash has 5 items | User clicks Empty trash | Confirmation dialog appears | `trash-empty-confirm` |
| AT-TRASH-09 | Empty-trash confirm is open | User confirms | All rows hard-deleted; list shows empty state | `trash-empty-confirm-yes` |
| AT-TRASH-10 | Item is at day 29 | View renders | "Expires in 1 day" rendered in destructive color | `trash-expiry-label` |
| AT-TRASH-11 | Item has expired but cron hasn't run | View renders | Row hidden client-side (filter `deletedAt < now() - 30 days`) | `trash-view-root` |
| AT-TRASH-12 | Item has 200 deleted children | User restores parent | All 200 children restore in one atomic operation | `trash-restore-button` |
| AT-TRASH-13 | Item is a mirror; source no longer exists | User clicks Restore | Block with toast "Original source no longer exists" | `trash-restore-error` |
| AT-TRASH-14 | Network is offline | User clicks Restore | Row shows "Restoring…" badge; on reconnect operation completes | `trash-pending-state` |
| AT-TRASH-15 | 1000+ items in trash | User clicks Empty trash | Progress toast appears; batches run; list clears as rows process | `trash-empty-progress` |

## Component Contract

> **Note:** None of these components exist yet — paths are the planned implementation order (aspirational, not normative). The disclaimer mirrors `01-information-model.md` L149 and feeds the global component-contract map (M-3). AI implementers MUST NOT treat the paths as binding imports.

| Surface | Component path | `data-testid` | Acceptance tests |
|---------|---------------|---------------|------------------|
| Trash view root | `src/pages/Trash.tsx` | `trash-view-root` | AT-TRASH-01, 11 |
| Empty state | `src/components/trash/TrashEmptyState.tsx` | `trash-empty-state` | AT-TRASH-02 |
| Trash row | `src/components/trash/TrashRow.tsx` | `trash-row`, `trash-expiry-label` | AT-TRASH-01, 10 |
| Restore button | `src/components/trash/RestoreButton.tsx` | `trash-restore-button` | AT-TRASH-03, 12, 14 |
| Restore toast | `src/components/feedback/RestoreToast.tsx` | `trash-restore-toast`, `trash-restore-error` | AT-TRASH-04, 13 |
| Delete-permanently confirm dialog | `src/components/trash/DeletePermanentlyDialog.tsx` | `trash-delete-confirm`, `trash-delete-confirm-yes`, `trash-delete-confirm-no` | AT-TRASH-05..07 |
| Empty-trash button | `src/components/trash/EmptyTrashButton.tsx` | `trash-empty-button` | AT-TRASH-08 |
| Empty-trash confirm dialog | `src/components/trash/EmptyTrashDialog.tsx` | `trash-empty-confirm`, `trash-empty-confirm-yes` | AT-TRASH-08, 09 |
| Empty-trash progress toast | `src/components/feedback/ProgressToast.tsx` | `trash-empty-progress` | AT-TRASH-15 |
| Pending-restore badge | `src/components/trash/PendingBadge.tsx` | `trash-pending-state` | AT-TRASH-14 |

> **Note:** Components are planned paths — none exist yet. Feeds the global component-contract map (M-3).

---

## Workflowy Feature Reference (F4) — Delete & Trash UX

> **Source:** Workflowy product feature list, merged 2026-04-28 (lossless, additive). Reproduced verbatim; cross-linked to existing AT-TRASH-* rows above and to the 30-day retention policy in `mem://features/trash-logic`.

- **Delete** — Soft-delete an item and its entire subtree. Items move to Trash; nothing is permanently removed at this step. `⌘⌫`
- **Bulk Delete** — Multi-select equivalent. Single batch confirmation toast covers the whole selection with one Undo. → [`./12-multi-select.md`](./12-multi-select.md) F3 appendix.
- **Trash View** — Sidebar entry rendering every soft-deleted item the user owns, grouped by deletion date. Each entry shows breadcrumb of original location and time-until-purge. (component: `trash-list`)
- **Restore** — Per-item *Restore* action returns the item (and its subtree) to its original parent. If the original parent itself is in Trash, restore re-parents to the user's root with a toast explaining the move. (component: `trash-restore-button`, AT-INFOMODEL-06)
- **Empty Trash** — Bulk action that hard-deletes every item currently in Trash, regardless of age. Confirmation modal lists item count and total subtree size. (component: `trash-empty-button`)
- **30-Day Auto-Purge** — A daily server cron hard-deletes any Trash item older than 30 days (per `mem://features/trash-logic`). There is no archive tier and no per-account retention override.
- **Restore Pre-empts Purge** — Restoring an item resets its deletion clock; the next cron run will not consider it.

> **Reconciliation note (F7 candidate):** confirm the WP-plugin cron handler is registered with WordPress's scheduler (`wp_schedule_event` daily) rather than relying on an external cron, per `mem://constraints/backend-runtime-deferred`. Tracked under `.lovable/question-and-ambiguity/`.

---

## Related

- [01-information-model.md](./01-information-model.md) — `Item.deletedAt` soft-delete column
- [03-layout-structure.md](./03-layout-structure.md) — Trash entry point in sidebar/settings
- [06-item-context-menu.md](./06-item-context-menu.md) — Delete action that puts items here
- [09-mirrors.md](./09-mirrors.md) — restoring a mirror requires the source still exists
- [03-edge-cases/01-edge-cases.md](../03-edge-cases/01-edge-cases.md) — orphaned-parent restore cases
- `mem://features/trash-logic` — 30-day retention policy
- [`./12-multi-select.md`](./12-multi-select.md) — ← Multi-select bulk ops (forward link from)
- [`./13-templates.md`](./13-templates.md) — ← Templates (forward link from)
- [`./16-search-ranking.md`](./16-search-ranking.md) — ← Search ranking (forward link from)
- [11b-trash-reaper.md](./11b-trash-reaper.md) — addendum: reaper cron + 30-day hard-delete sweep detail

---

## Database Scope

- **Anchor:** [`07-db-diagram/00b-split-db-anchor.md`](../07-db-diagram/00b-split-db-anchor.md)
- **Scope:** `[db-scope: app]`
- **Tables:** trash, nodes
- **Cross-DB JOINs:** forbidden (split-DB invariant). Cross-DB orchestration, if any, follows ADR-0019.

---

## Architecture Anchors (load-bearing ADRs)

- **ADR-0023 — Loader↔Queue Contract:** Loaders MUST read the local IndexedDB mirror first (≤16 ms p95, never fetch). Mutations MUST write `{mirror, queue_ledger}` in a **single IDB transaction**; the queue worker is the **sole egress** to the WordPress REST surface. SSE frames are read-signals only and MUST NOT enqueue to the FIFO (gates **G-23-LOADER-MIRROR-FIRST**, **G-23-LOADER-NO-MUTATE**, **G-23-ACTION-ENQUEUE-ONLY**). See `spec/30-architecture/adr/0023-loader-queue-contract.md`.
- **ADR-0017 — Named Error Boundaries:** This feature renders inside **`RouteErrorBoundary`**. A single top-level boundary is **forbidden**. Loader/action errors surface via the matching named boundary; uncaught render errors escalate to `AppErrorBoundary` (gates **G-22-ERROR-BOUNDARIES-EXACTLY-8**, **G-22-BOUNDARY-NAMES-CLOSED**, **G-22-BOUNDARY-ISOLATION**). See `spec/30-architecture/adr/0017-error-boundaries.md`.
- **ADR-0025 — Realtime is SSE-only:** Cross-tab/cross-client signals arrive via `/stream/page/{id}` and `/stream/user/{id}` (PascalCase frames, `Last-Event-ID` replay). WebSocket / long-poll / 3rd-party push are **forbidden**. (gates **G-25-SSE-ENDPOINT-CLOSED**, **G-25-SSE-CURSOR-WORKSPACE-SCOPED**)

---

## Backend Write Surface

> Enumerated per F-AUD42-25 (API axis closure). Routes follow the **PascalCase API envelope** (ADR-0004/0019). Mutations egress via the **queue worker** (ADR-0023) — never direct fetch.

### REST Routes (write)

| Method | Path | Operation | Idempotency / Concurrency |
|--------|------|-----------|---------------------------|
| `POST` | `/wp-json/workflowy/v1/trash/{ItemId}/restore` | `RestoreFromTrash` | IdempotencyKey |
| `DELETE` | `/wp-json/workflowy/v1/trash/{ItemId}` | `PurgePermanently` | IdempotencyKey |
| `POST` | `/wp-json/workflowy/v1/trash/empty` | `EmptyTrash (workspace-scoped)` | IdempotencyKey |

### SSE Frames Emitted (read-signal only, ADR-0025)

(gate **G-25-SSE-ENDPOINT-CLOSED**) `ItemRestored`, `ItemPurged`, `TrashEmptied` on `/stream/page/{id}` and/or `/stream/user/{id}`. SSE MUST NOT enqueue to the FIFO.

### Storage

- **Tables touched:** trash, nodes
- **Error boundary on failure:** `RouteErrorBoundary`
- **Cross-DB JOINs:** forbidden (see Database Scope stanza above).

### Endpoint SSOTs

Detailed request/response fixtures live under [`spec/31-app/06-endpoints/`](../06-endpoints/) and [`97b-endpoint-envelope-fixtures.md`](../06-endpoints/97b-endpoint-envelope-fixtures.md).
