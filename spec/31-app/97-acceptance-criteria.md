# App — Acceptance Criteria

> **Version:** 2.3.0
> **Updated:** 2026-04-26 (UTC+8) — v2.3.0 backfilled `AT-WF-*` workflows into canonical (`AT-APP-43..57`: Templates flow, Share-invite flow, Trash-restore flow). v2.2.0 added Today/Templates/Concurrency/SSE (`AT-APP-26..42`). v2.1.0 declared canonical over `AT-APPF-NN`. v2.0.0 closed F-01.
> **Status:** ✅ Canonical AT index for the App domain
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## Purpose

Testable acceptance criteria for the App domain. Each criterion is independently verifiable, traceable to a source spec file, and references load-bearing rules in [`00-overview.md §🔒 Load-Bearing Rules`](./00-overview.md).

**ID format:** `AT-APP-NN` (stable; never renumber). This is the **canonical** scheme.

> **Naming-scheme reconciliation (APP-FIX-14, 2026-04-26):** The legacy `AT-APPF-NN` IDs in [`01-features/97-acceptance-criteria.md`](./01-features/97-acceptance-criteria.md) are now a **frozen dispatch index** — they map onto AT-APP ranges and per-feature inline prefixes (`AT-LAYOUT`, `AT-INTERACT`, `AT-CONCURRENCY`, etc.). New criteria MUST be added here as the next `AT-APP-NN`; never invent a new `AT-APPF-NN`. See the Coverage Map in `01-features/97-acceptance-criteria.md` for the full mapping.

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

### Today view

| ID | Criterion | Source |
|----|-----------|--------|
| `AT-APP-26` | Today view aggregates items where `itemType = todo` AND `dueDate ≤ today` AND `completedAt IS NULL`, scoped to the current user's accessible items (own + shared-with-edit). | `01-features/10-today-view.md` §9.1 |
| `AT-APP-27` | Completing a todo from Today view persists `completedAt = now()` and removes it from the Today list within the same render cycle (no full reload). | `01-features/10-today-view.md` §9.1 + Outputs |
| `AT-APP-28` | Today view honours the `today.includeOverdue` and `today.startOfDay` settings keys; defaults are `true` and `00:00 user-local` respectively. | `01-features/10-today-view.md` §Settings Keys |

### Templates

| ID | Criterion | Source |
|----|-----------|--------|
| `AT-APP-29` | A Template is a **serialized snapshot** of an item subtree (root + descendants + types + content), stored independently of the source — later edits to the source do **not** mutate the template. | `01-features/13-templates.md` §13.1 + Storage |
| `AT-APP-30` | Applying a template inserts a deep copy under the target parent: every node receives a **new** `Item.id`, parent pointers are rewritten, and fractional indices are regenerated to slot at the requested position. | `01-features/13-templates.md` §13.2 |
| `AT-APP-31` | Mirror references inside a template snapshot are **not** preserved as live mirrors on apply — they materialize as plain copies of the referenced content at snapshot time, preventing cross-workspace mirror leaks. | `01-features/13-templates.md` §13.4 |
| `AT-APP-32` | Deleting a template never affects items that were previously instantiated from it. | `01-features/13-templates.md` §13.3 |

### Concurrency & sync — core resolution

| ID | Criterion | Source |
|----|-----------|--------|
| `AT-APP-33` | Conflict resolution is **field-level Last-Writer-Wins** keyed on `(ServerTs, UserId)` per field — never whole-row LWW. Ties on `ServerTs` are broken deterministically by lexicographic `UserId`. | `01-features/14-concurrency-and-sync.md` §14.2 |
| `AT-APP-34` | `Mirrors.BrokenAt` follows extended LWW: once set to a non-null timestamp it MAY be moved earlier by a smaller `ServerTs`, but a later non-null write MUST NOT clear it back to `NULL` (broken is sticky against re-link races). | `01-features/14-concurrency-and-sync.md` §14.4 |
| `AT-APP-35` | Cascading delete of a source item sets `Mirrors.BrokenAt = source.DeletedAt` for every dependent mirror in the same transaction; no orphan mirrors may remain referencing a trashed/purged source. | `01-features/14-concurrency-and-sync.md` §14.4 Cascade |

### Concurrency & sync — SSE transport (Round-3 AUDIT-06)

| ID | Criterion | Source |
|----|-----------|--------|
| `AT-APP-36` | Realtime updates use **Server-Sent Events** at `GET /wp-json/workflowy/v1/sync/stream?workspaceId={WorkspaceId}` with `X-WP-Nonce` auth and `Content-Type: text/event-stream`. WebSockets, Pusher, Ably, and long-polling chat protocols are forbidden. | `01-features/14-concurrency-and-sync.md` §14.5.1 + §14.5.7 |
| `AT-APP-37` | The event vocabulary is a **closed set of 9 names** — `item-created`, `item-updated`, `item-deleted`, `item-restored`, `mirror-created`, `mirror-broken`, `share-granted`, `share-revoked`, `cursor-overflow` — every event MUST carry a JSON `data:` payload conforming to the schema in §14.5.2. | `01-features/14-concurrency-and-sync.md` §14.5.2 |
| `AT-APP-38` | Each SSE message MUST emit `id: {ServerTs}` so clients can resume via the `Last-Event-Id` request header on reconnect. | `01-features/14-concurrency-and-sync.md` §14.5.3 |
| `AT-APP-39` | When SSE is unavailable (corp proxies, offline → online), clients fall back to `GET /wp-json/workflowy/v1/sync/poll?workspaceId={WorkspaceId}&since={LastServerTs}` returning `{ Events, Cursor, HasMore }`. Poll cadence MUST NOT exceed 1 request / 5 s per workspace. | `01-features/14-concurrency-and-sync.md` §14.5.4 |
| `AT-APP-40` | On reconnect the client replays missed events in `ServerTs` order, deduplicates against its local `LastServerTs`, and only then resumes live SSE — no event may be applied twice. | `01-features/14-concurrency-and-sync.md` §14.5.5 |
| `AT-APP-41` | Server emits a heartbeat comment (`: ping\n\n`) every **15 s**; clients treat absence of any frame for **30 s** as a dropped connection and trigger the reconnect+replay algorithm. | `01-features/14-concurrency-and-sync.md` §14.5.6 |
| `AT-APP-42` | If the server cannot replay (cursor older than retention window) it emits a single `cursor-overflow` event; clients MUST respond by issuing a full re-sync of the workspace rather than continuing incremental playback. | `01-features/14-concurrency-and-sync.md` §14.5.2 + §14.5.5 |

### Workflows — Template application (mirrors `AT-WF-TEMPLATE-*`)

| ID | Criterion | Source |
|----|-----------|--------|
| `AT-APP-43` | Applying a template requires `Edit` or `Admin` on the target parent; `View`-only callers receive **HTTP 403** and no `Items` rows are inserted. | `02-workflows/02-template-application-flow.md` (was `AT-WF-TEMPLATE-01`) |
| `AT-APP-44` | A successful apply makes the new subtree visible to the local client immediately and propagates an SSE `item-created` event to peers within **1 s** under healthy SSE. | `02-workflows/02-template-application-flow.md` (was `AT-WF-TEMPLATE-02`) |
| `AT-APP-45` | Replaying the apply with the same `X-WorkFlowy-Idempotency-Key` within **24 h** returns **HTTP 200** with the original root `ItemId` and inserts no duplicate rows. | `02-workflows/02-template-application-flow.md` (was `AT-WF-TEMPLATE-03`) |
| `AT-APP-46` | If the App-DB INSERT batch fails partway, the entire transaction ROLLBACKs, the client receives **HTTP 500**, and **no SSE event is emitted**. | `02-workflows/02-template-application-flow.md` (was `AT-WF-TEMPLATE-04`) |

### Workflows — Share invite (mirrors `AT-WF-SHARE-*`)

| ID | Criterion | Source |
|----|-----------|--------|
| `AT-APP-47` | An inviter without `Admin` on the target item attempting to grant access receives **HTTP 403** and no rows are written to `ItemGrants` or `PendingInvites`. | `02-workflows/03-share-invite-flow.md` (was `AT-WF-SHARE-01`) |
| `AT-APP-48` | Sharing with an existing account at role `Edit` returns **HTTP 201**, inserts an `ItemGrants` row with `AcceptedAt = NULL`, and delivers an SSE `share-granted` event to the inviter within **1 s**. | `02-workflows/03-share-invite-flow.md` (was `AT-WF-SHARE-02`) |
| `AT-APP-49` | Sharing with a non-existent email returns **HTTP 201** and inserts a `PendingInvites` row in the Root DB with `ExpiresAt = serverNow + 14 days`. | `02-workflows/03-share-invite-flow.md` (was `AT-WF-SHARE-03`) |
| `AT-APP-50` | When an invitee clicks the accept link the server returns **HTTP 200**, sets `AcceptedAt = serverNow`, emits SSE `share-granted` (accepted variant) to both parties, and `Auth::hasRole($invitee, 'Edit')` on any descendant of the shared item returns true. | `02-workflows/03-share-invite-flow.md` (was `AT-WF-SHARE-04`) |
| `AT-APP-51` | Replayed POST with the same `X-WorkFlowy-Idempotency-Key` returns **HTTP 201** with the original `GrantId` and inserts no duplicate row. | `02-workflows/03-share-invite-flow.md` (was `AT-WF-SHARE-05`) |

### Workflows — Trash restore (mirrors `AT-WF-RESTORE-*`)

| ID | Criterion | Source |
|----|-----------|--------|
| `AT-APP-52` | Restoring an item whose parent is also trashed returns **HTTP 422** with `blockingAncestorId` populated and writes nothing to the DB. | `02-workflows/04-trash-restore-flow.md` (was `AT-WF-RESTORE-01`) |
| `AT-APP-53` | Restoring a healthy ancestor first and then a descendant succeeds for both, emitting an SSE `item-restored` event for each. | `02-workflows/04-trash-restore-flow.md` (was `AT-WF-RESTORE-02`) |
| `AT-APP-54` | Restoring an item that has already been **hard-deleted** (purged after the 30-day window) returns **HTTP 410** and the UI removes the row from the Trash list. | `02-workflows/04-trash-restore-flow.md` (was `AT-WF-RESTORE-03`) + AT-APP-19 |
| `AT-APP-55` | A restore racing with a concurrent re-delete carrying a newer `ServerTs` returns **HTTP 409**; the item stays trashed and the field-level LWW rule (AT-APP-33) is respected. | `02-workflows/04-trash-restore-flow.md` (was `AT-WF-RESTORE-04`) |
| `AT-APP-56` | Restoring an item heals its broken mirrors by clearing `Mirrors.BrokenAt` via LWW (subject to AT-APP-34 stickiness) and emits an SSE `mirror-created` (heal variant) event. | `02-workflows/04-trash-restore-flow.md` (was `AT-WF-RESTORE-05`) |
| `AT-APP-57` | A stale restore racing with the reaper's hard-delete loses LWW: the reaper's newer `ServerTs` wins and the broken-mirror state is preserved. | `02-workflows/04-trash-restore-flow.md` (was `AT-WF-RESTORE-06`) + AT-APP-34 |


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

*Populated 2026-04-25 to close audit finding F-01. Extended v2.2.0 with Today / Templates / Concurrency / SSE coverage (`AT-APP-26..42`); v2.3.0 backfilled workflow flows (`AT-APP-43..57`).*
