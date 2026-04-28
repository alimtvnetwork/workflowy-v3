# App — Acceptance Criteria

> **Version:** 2.6.0
> **Updated:** 2026-04-27 (UTC+8) — v2.6.0 registered 50 new ATs from B1–B4 product-clarification batches: `AT-APP-58..67` (mirror peer-group, B1), `AT-APP-68..75` (dashboard view, B2), `AT-APP-76..80` (sharing×mirror, B4), `AT-APP-81..85` (trash reaper, B4), `AT-APP-86..91` (multi-select zoom, B4), `AT-APP-92..96` (templates snapshot, B4), `AT-APP-97..102` (offline queue, B3), `AT-APP-103..107` (search ranking, B3). v2.5.0 corrected `AT-APP-37` event vocabulary drift; v2.4.0 added cross-references; v2.3.0 backfilled workflows; v2.2.0 added Today/Templates/Concurrency/SSE; v2.1.0 declared canonical over `AT-APPF-NN`; v2.0.0 closed F-01.
> **Status:** ✅ Canonical AT index for the App domain
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## Purpose

Testable acceptance criteria for the App domain. Each criterion is independently verifiable, traceable to a source spec file, and references load-bearing rules in [`00-overview.md §🔒 Load-Bearing Rules`](./00-overview.md).

**ID format:** `AT-APP-NN` (stable; never renumber). This is the **canonical** scheme.

> **P2 — I/O fixtures companion:** Concrete Given/When/Then + JSON request/response fixtures live in [`97-acceptance-criteria-fixtures.md`](./97-acceptance-criteria-fixtures.md) (per format [`spec/01-spec-authoring-guide/19-acceptance-criteria-io-table.md`](../01-spec-authoring-guide/19-acceptance-criteria-io-table.md)). `AT-APP-01..14` landed; `AT-APP-15..107` queued in subsequent `next` calls.

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
| `AT-APP-37` | The event vocabulary is a **closed set of 9 names** — `item-updated` (covers create + field changes; new IDs surface as `item-updated` on the new row), `item-deleted`, `item-restored`, `mirror-broken`, `mirror-healed`, `share-granted`, `share-revoked`, `presence` (non-authoritative, droppable), `cursor-overflow` — every event MUST carry a JSON `data:` payload conforming to the schema in §14.5.2. The `:hb` heartbeat comment per AT-APP-41 is **not** an event. | `01-features/14-concurrency-and-sync.md` §14.5.2 |
| `AT-APP-38` | Each SSE message MUST emit `id: {ServerTs}` so clients can resume via the `Last-Event-Id` request header on reconnect. | `01-features/14-concurrency-and-sync.md` §14.5.3 |
| `AT-APP-39` | When SSE is unavailable (corp proxies, offline → online), clients fall back to `GET /wp-json/workflowy/v1/sync/poll?workspaceId={WorkspaceId}&since={LastServerTs}` returning `{ Events, Cursor, HasMore }`. Poll cadence MUST NOT exceed 1 request / 5 s per workspace. | `01-features/14-concurrency-and-sync.md` §14.5.4 |
| `AT-APP-40` | On reconnect the client replays missed events in `ServerTs` order, deduplicates against its local `LastServerTs`, and only then resumes live SSE — no event may be applied twice. | `01-features/14-concurrency-and-sync.md` §14.5.5 |
| `AT-APP-41` | Server emits a heartbeat comment (`: ping\n\n`) every **15 s**; clients treat absence of any frame for **30 s** as a dropped connection and trigger the reconnect+replay algorithm. | `01-features/14-concurrency-and-sync.md` §14.5.6 |
| `AT-APP-42` | If the server cannot replay (cursor older than retention window) it emits a single `cursor-overflow` event; clients MUST respond by issuing a full re-sync of the workspace rather than continuing incremental playback. | `01-features/14-concurrency-and-sync.md` §14.5.2 + §14.5.5 |

### Workflows — Template application (mirrors `AT-WF-TEMPLATE-*`)

| ID | Criterion | Source |
|----|-----------|--------|
| `AT-APP-43` | Applying a template requires `Edit` or `Admin` on the target parent; `View`-only callers receive **HTTP 403** and no `Items` rows are inserted. | `02-workflows/02-template-application-flow.md` (was `AT-WF-TEMPLATE-01`) |
| `AT-APP-44` | A successful apply makes the new subtree visible to the local client immediately and propagates an SSE `item-updated` (new ID) event to peers within **1 s** under healthy SSE. | `02-workflows/02-template-application-flow.md` (was `AT-WF-TEMPLATE-02`) |
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
| `AT-APP-56` | Restoring an item heals its broken mirrors by clearing `Mirrors.BrokenAt` via LWW (subject to AT-APP-34 stickiness) and emits an SSE `mirror-healed` event. | `02-workflows/04-trash-restore-flow.md` (was `AT-WF-RESTORE-05`) |
| `AT-APP-57` | A stale restore racing with the reaper's hard-delete loses LWW: the reaper's newer `ServerTs` wins and the broken-mirror state is preserved. | `02-workflows/04-trash-restore-flow.md` (was `AT-WF-RESTORE-06`) + AT-APP-34 |

### Mirror peer-group model (B1 addendum, mirrors `AT-MPG-*`)

| ID | Criterion | Source |
|----|-----------|--------|
| `AT-APP-58` | Mirroring item X under parent P creates a peer-group `G` and inserts P-scoped peer P₂ such that `MirrorPeerGroupMembers` contains both X and P₂ with the same `PeerGroupId`. | `01-features/09b-mirror-peer-group-model.md` (was `AT-MPG-01`) |
| `AT-APP-59` | Editing the title of any peer in `G` updates `Items.Title` of the canonical content row, and an SSE `item-updated` event fans out to all peers within **1 s**. | `01-features/09b-mirror-peer-group-model.md` (was `AT-MPG-02`) |
| `AT-APP-60` | `ParentId`, `SortOrder`, and `Permissions` are stored per peer (not per group) and are independent across peers. | `01-features/09b-mirror-peer-group-model.md` (was `AT-MPG-03`) |
| `AT-APP-61` | Detaching peer P₁ removes it from `MirrorPeerGroupMembers`; if the group's surviving member count drops to **1**, the group is auto-dissolved (group row deleted, last member's PeerGroupId nulled). | `01-features/09b-mirror-peer-group-model.md` (was `AT-MPG-04`) |
| `AT-APP-62` | Cycle-prevention algorithm rejects a mirror operation that would create a peer of an ancestor of itself, returning **HTTP 409**. | `01-features/09b-mirror-peer-group-model.md` (was `AT-MPG-05`) + `09a-mirror-cycle-detection.md` |
| `AT-APP-63` | Soft-deleting one peer does NOT delete other peers; the group survives at size ≥2. | `01-features/09b-mirror-peer-group-model.md` (was `AT-MPG-06`) |
| `AT-APP-64` | Hard-deleting (reaper) a peer that drops the group to size 1 triggers auto-dissolve via DB trigger within the same transaction. | `01-features/09b-mirror-peer-group-model.md` (was `AT-MPG-07`) + `11b-trash-reaper.md` |
| `AT-APP-65` | LWW conflicts on shared content fields use server `ServerTs` with `OwnerId` ASC tiebreak. | `01-features/09b-mirror-peer-group-model.md` (was `AT-MPG-08`) + AT-APP-33 |
| `AT-APP-66` | Mirror peer-group migration script v1→v2 converts every legacy `Mirrors(SourceId, MirrorId)` pair into a peer-group with both rows as members; idempotent re-runs are no-ops. | `01-features/09b-mirror-peer-group-model.md` (was `AT-MPG-09`) + `07-db-diagram/sql/07-migration-v2-mirror-peer-groups.sql` |
| `AT-APP-67` | The legacy `Mirrors` table is read-only after v2 migration; writes return **HTTP 410**. | `01-features/09b-mirror-peer-group-model.md` (was `AT-MPG-10`) |

### Dashboard view (B2 addendum, mirrors `AT-DV-*`)

| ID | Criterion | Source |
|----|-----------|--------|
| `AT-APP-68` | Dashboard view renders **only** direct children of the zoomed item (depth = 1); grandchildren are not displayed. | `01-features/07b-dashboard-view.md` (was `AT-DV-01`) |
| `AT-APP-69` | Each card displays the child's title and completion checkbox; both are inline-editable. | `01-features/07b-dashboard-view.md` (was `AT-DV-02`) |
| `AT-APP-70` | Toggling between List, Board, and Dashboard never mutates the tree structure — only `Items.ItemType` of the parent changes. | `01-features/07b-dashboard-view.md` (was `AT-DV-03`) |
| `AT-APP-71` | Editing a card title persists to `Items.Title` of the underlying child within **150 ms** debounce. | `01-features/07b-dashboard-view.md` (was `AT-DV-04`) |
| `AT-APP-72` | Toggling a card's checkbox persists to `Items.CompletedAt` of the underlying child. | `01-features/07b-dashboard-view.md` (was `AT-DV-05`) |
| `AT-APP-73` | Clicking into a card zooms to that child; back navigation returns to the dashboard with state preserved. | `01-features/07b-dashboard-view.md` (was `AT-DV-06`) |
| `AT-APP-74` | A dashboard with ≥250 direct children virtualizes per AT-APP-05. | `01-features/07b-dashboard-view.md` (was `AT-DV-07`) |
| `AT-APP-75` | Switching back to List view restores the original child ordering by `SortOrder`. | `01-features/07b-dashboard-view.md` (was `AT-DV-08`) |

### Sharing × Mirror (B4 addendum, mirrors `AT-SM-*`)

| ID | Criterion | Source |
|----|-----------|--------|
| `AT-APP-76` | `Permissions` rows are keyed by `ItemId`, never by `PeerGroupId`. Sharing peer P₁ inserts a Permissions row only for P₁'s `ItemId`. | `01-features/08b-sharing-mirror-interaction.md` (was `AT-SM-01`) |
| `AT-APP-77` | Recipient of a shared peer P₁ sees content edits from peer P₂ propagated to P₁ within **1 s** via peer-group sync. | `01-features/08b-sharing-mirror-interaction.md` (was `AT-SM-02`) |
| `AT-APP-78` | Recipient editing P₁'s `ParentId` or `SortOrder` does NOT change P₂'s `ParentId` or `SortOrder`. | `01-features/08b-sharing-mirror-interaction.md` (was `AT-SM-03`) |
| `AT-APP-79` | Revoking access to peer P₁ does NOT revoke access to peer Pₖ that the same user was independently granted. | `01-features/08b-sharing-mirror-interaction.md` (was `AT-SM-04`) |
| `AT-APP-80` | When sharing a subtree R that contains peer P₁, the recipient cannot navigate to peer P₂ that lives outside R, even though P₁'s content updates reflect P₂'s edits. | `01-features/08b-sharing-mirror-interaction.md` (was `AT-SM-05`) |

### Trash reaper (B4 addendum, mirrors `AT-TR-*`)

| ID | Criterion | Source |
|----|-----------|--------|
| `AT-APP-81` | Reaper runs daily at 03:00 UTC and hard-deletes every `Items` row where `DeletedAt < now() - INTERVAL '30 days'`, in batches of 1,000. | `01-features/11b-trash-reaper.md` (was `AT-TR-01`) |
| `AT-APP-82` | Items with `DeletedAt = now() - 29d` survive a reaper pass and remain restorable. | `01-features/11b-trash-reaper.md` (was `AT-TR-02`) |
| `AT-APP-83` | Hard-deleting an item cascades to its children, mirror peer-group memberships, and permissions via FK `ON DELETE CASCADE`. | `01-features/11b-trash-reaper.md` (was `AT-TR-03`) |
| `AT-APP-84` | If a reap drops a peer-group to size 1, the group auto-dissolves in the same transaction (per AT-APP-61/64). | `01-features/11b-trash-reaper.md` (was `AT-TR-04`) |
| `AT-APP-85` | Each reaper run inserts one row into `ReaperRuns(Id, RanAt, RowsDeleted, DurationMs)`. | `01-features/11b-trash-reaper.md` (was `AT-TR-05`) |

### Multi-select zoom (B4 addendum, mirrors `AT-MZ-*`)

| ID | Criterion | Source |
|----|-----------|--------|
| `AT-APP-86` | Triggering zoom while N>1 items are selected opens an ephemeral virtual scope with synthetic parent `virtual:<sessionId>` titled "N items". | `01-features/12b-multi-select-zoom.md` (was `AT-MZ-01`) |
| `AT-APP-87` | Edits inside the virtual scope persist to the **real** `Items` rows (titles, completion). | `01-features/12b-multi-select-zoom.md` (was `AT-MZ-02`) |
| `AT-APP-88` | Pressing `Esc` or breadcrumb-up exits the virtual scope and restores the original selection in the real tree. | `01-features/12b-multi-select-zoom.md` (was `AT-MZ-03`) |
| `AT-APP-89` | If the virtual-scope membership drops to 1 (item deleted), the scope auto-collapses to a normal zoom on the surviving item. | `01-features/12b-multi-select-zoom.md` (was `AT-MZ-04`) |
| `AT-APP-90` | Drag operations are locked to within-scope reordering; drag out-of-scope is rejected with a no-drop cursor. | `01-features/12b-multi-select-zoom.md` (was `AT-MZ-05`) |
| `AT-APP-91` | Page refresh discards the virtual scope (ephemeral, client-only state); user lands on the last persisted scope. | `01-features/12b-multi-select-zoom.md` (was `AT-MZ-06`) |

### Templates — snapshot semantics (B4 addendum, mirrors `AT-TPL-*`)

| ID | Criterion | Source |
|----|-----------|--------|
| `AT-APP-92` | Instantiating template T under parent P creates N new `Items` rows with **fresh UUIDs**; no `TemplateId` FK is set. | `01-features/13b-templates-snapshot-semantics.md` (was `AT-TPL-01`) |
| `AT-APP-93` | Editing T's `PayloadJson` does NOT modify any previously instantiated `Items` rows. | `01-features/13b-templates-snapshot-semantics.md` (was `AT-TPL-02`) |
| `AT-APP-94` | Editing an instantiated `Items` row does NOT modify T's `PayloadJson`. | `01-features/13b-templates-snapshot-semantics.md` (was `AT-TPL-03`) |
| `AT-APP-95` | Mirror peer-groups inside T's payload collapse to plain items on instantiation (no `MirrorPeerGroupMembers` rows created from a template apply). | `01-features/13b-templates-snapshot-semantics.md` (was `AT-TPL-04`) |
| `AT-APP-96` | The `OwnerId` of every instantiated row equals `auth.uid()` of the instantiating user, regardless of T's author. | `01-features/13b-templates-snapshot-semantics.md` (was `AT-TPL-05`) |

### Offline queue (B3 addendum, mirrors `AT-OQ-*`)

| ID | Criterion | Source |
|----|-----------|--------|
| `AT-APP-97` | The full account tree is mirrored locally (IndexedDB) so all CRUD operations work while offline. | `01-features/14b-offline-queue.md` (was `AT-OQ-01`) |
| `AT-APP-98` | Local mutations are appended to a FIFO queue and optimistically applied to the local mirror; UI never blocks on network. | `01-features/14b-offline-queue.md` (was `AT-OQ-02`) |
| `AT-APP-99` | On reconnect, the queue is drained in **strict insertion order**; the server timestamps each accepted mutation and broadcasts via SSE. | `01-features/14b-offline-queue.md` (was `AT-OQ-03`) |
| `AT-APP-100` | Field-level conflicts resolve via Last-Write-Wins keyed on server `ServerTs`, with `OwnerId` ASC as tiebreak (per AT-APP-33). | `01-features/14b-offline-queue.md` (was `AT-OQ-04`) |
| `AT-APP-101` | A mutation rejected by the server (validation, 410, etc.) is reverted in the local mirror and surfaced to the user as a non-blocking toast. | `01-features/14b-offline-queue.md` (was `AT-OQ-05`) |
| `AT-APP-102` | Queue persistence survives browser restart; the queue resumes drain from the head on next online event. | `01-features/14b-offline-queue.md` (was `AT-OQ-06`) |

### Search ranking (B3 addendum, mirrors `AT-SR-*`)

| ID | Criterion | Source |
|----|-----------|--------|
| `AT-APP-103` | Search results are scored into 5 tiers (exact-whole-field=100, prefix=90, substring=80, token=70, fuzzy=60) × field weight. | `01-features/16-search-ranking.md` (was `AT-SR-01`) |
| `AT-APP-104` | Within the same tier, results are ordered by `Items.UpdatedAt DESC`. | `01-features/16-search-ranking.md` (was `AT-SR-02`) |
| `AT-APP-105` | A query matching both Title (weight 1.0) and Note (weight 0.4) of different items ranks the Title-match higher. | `01-features/16-search-ranking.md` (was `AT-SR-03`) |
| `AT-APP-106` | Soft-deleted items (`DeletedAt IS NOT NULL`) are excluded from search results. | `01-features/16-search-ranking.md` (was `AT-SR-04`) |
| `AT-APP-107` | Search respects sharing: a user only sees results they have at least `View` permission on (per AT-APP-23). | `01-features/16-search-ranking.md` (was `AT-SR-05`) |


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
- [`06-endpoints/00-overview.md`](./06-endpoints/00-overview.md) — REST endpoint wire contracts (mirrors every feature)
- [`07-db-diagram/00-overview.md`](./07-db-diagram/00-overview.md) — Visual database design (ERDs, lifecycles, indexes)

*Populated 2026-04-25 to close audit finding F-01. Extended v2.2.0 with Today / Templates / Concurrency / SSE coverage (`AT-APP-26..42`); v2.3.0 backfilled workflow flows (`AT-APP-43..57`). v2.4.0 added cross-references to `06-endpoints/` and `07-db-diagram/` (2026-04-26).*

