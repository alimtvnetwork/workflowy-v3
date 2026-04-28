# App — Acceptance-Criteria I/O Fixtures (Part D: AT-APP-68..107)

> **Companion to:** [`97-acceptance-criteria.md`](./97-acceptance-criteria.md), [`97a-acceptance-criteria-fixtures.md`](./97a-acceptance-criteria-fixtures.md)
> **Format:** [`spec/01-spec-authoring-guide/19-acceptance-criteria-io-table.md`](../01-spec-authoring-guide/19-acceptance-criteria-io-table.md)
> **Coverage:** Dashboard view (B2), Sharing × Mirror (B4), Trash reaper (B4), Multi-select zoom (B4), Templates snapshot (B4), Offline queue (B3), Search ranking (B3).

---

## Dashboard view (`AT-APP-68..75`)

### `AT-APP-68` — depth=1 only

> | Slot | Value |
> |------|-------|
> | **Given** | `itm_P` has children `[itm_C1, itm_C2]`; `itm_C1` has grandchild `itm_GC1`. |
> | **When** | Render `<DashboardView parentId="itm_P">`. |
> | **Then** | Two cards visible: `itm_C1`, `itm_C2`. `itm_GC1` is NOT rendered as a separate card. |
> | **Side effects** | none |
> | **Negative assertion** | Dashboard MUST NOT recurse beyond depth 1; total card count = direct child count. |

### `AT-APP-69` — Card has title + checkbox, both inline-editable

> | Slot | Value |
> |------|-------|
> | **Given** | Card for `itm_C1`. |
> | **When** | Click on title text → enters contenteditable; click on checkbox → toggles `CompletedAt`. |
> | **Then** | Both interactions persist via PATCH (see AT-APP-71/72). |
> | **Side effects** | Two PATCH endpoints reachable from card. |
> | **Negative assertion** | Title edit MUST NOT navigate / zoom — that requires distinct card-body click (AT-APP-73). |

### `AT-APP-70` — View toggle never mutates tree structure

> | Slot | Value |
> |------|-------|
> | **Given** | `itm_P` rendered as Board. |
> | **When** | Toggle to Dashboard then to List. |
> | **Then** | Only `itm_P.ItemType` (or its `View` preference) updates; `Items.ParentId` / `SortOrder` of children remain unchanged. |
> | **Side effects** | One PATCH per toggle; zero structural row updates. |
> | **Negative assertion** | Children counts and IDs are identical across all three views. |

### `AT-APP-71` — Title edit debounce 150 ms

> | Slot | Value |
> |------|-------|
> | **Given** | User types `"hello"` into card title (5 keystrokes within 100 ms). |
> | **When** | Wait 150 ms after last keystroke. |
> | **Then** | Single `PATCH /items/itm_C1 {Title:"hello"}` fires (debounced). |
> | **Side effects** | One network request, not five. |
> | **Negative assertion** | If user keeps typing, debounce MUST reset; no PATCH fires until 150 ms idle. |

### `AT-APP-72` — Checkbox toggle persists `CompletedAt`

> | Slot | Value |
> |------|-------|
> | **Given** | Card with unchecked checkbox. |
> | **When** | Click checkbox. |
> | **Request body** | `{ "CompletedAt":"2026-04-28T12:34:56Z" }` |
> | **Then** | `Items.CompletedAt` set; subsequent click clears it (`null`). |
> | **Response envelope** | `{ "Status":200, "Attributes":{}, "Results":[{"Id":"itm_C1","CompletedAt":"2026-04-28T12:34:56Z"}] }` |
> | **Side effects** | One PATCH; SSE `item-updated`. |
> | **Negative assertion** | Toggle MUST NOT delete or move the underlying item. |

### `AT-APP-73` — Card body click zooms; back navigation preserves dashboard state

> | Slot | Value |
> |------|-------|
> | **Given** | On Dashboard of `itm_P`; scroll position = 200 px. |
> | **When** | Click body of card `itm_C1` → zoom to `itm_C1`. Then back. |
> | **Then** | Zoom history pushed; back returns to Dashboard of `itm_P` with scroll position 200 px restored. |
> | **Side effects** | Two route transitions. |
> | **Negative assertion** | Dashboard scroll position MUST NOT reset on back. |

### `AT-APP-74` — Virtualization at ≥250 children

> | Slot | Value |
> |------|-------|
> | **Given** | `itm_P` has 300 direct children. |
> | **When** | Render Dashboard. |
> | **Then** | DOM contains ≤ ~50 card elements at a time (per AT-APP-05). |
> | **Side effects** | none |
> | **Negative assertion** | All 300 cards in DOM simultaneously is a regression. |

### `AT-APP-75` — Switch back to List restores SortOrder

> | Slot | Value |
> |------|-------|
> | **Given** | Dashboard cards rendered. |
> | **When** | Toggle to List view. |
> | **Then** | List renders children sorted by `Items.SortOrder` (fractional index). |
> | **Side effects** | none |
> | **Negative assertion** | Dashboard re-ordering (if any) MUST NOT have mutated `SortOrder`. |

---

## Sharing × Mirror (`AT-APP-76..80`)

### `AT-APP-76` — Permissions keyed by ItemId, not PeerGroupId

> | Slot | Value |
> |------|-------|
> | **Given** | Peer-group with `itm_P1` (Alice's) and `itm_P2` (Bob's). |
> | **When** | Alice shares `itm_P1` with Carol at `View`. |
> | **Then** | One `Permissions` row inserted with `ItemId='itm_P1'`. |
> | **Side effects** | None on `itm_P2` permissions. |
> | **Negative assertion** | No `Permissions` row references `PeerGroupId`. |

### `AT-APP-77` — Recipient sees content edits from other peer within 1 s

> | Slot | Value |
> |------|-------|
> | **Given** | Carol has View on `itm_P1`. Bob (owner of `itm_P2`) edits content. |
> | **When** | Bob `PATCH /items/itm_P2 {Title:"new"}`. |
> | **Then** | Carol's subscribed SSE stream receives `item-updated` for `itm_P1` within 1 s. |
> | **Side effects** | SSE fan-out across peer-group membership. |
> | **Negative assertion** | Carol MUST NOT see `itm_P2`'s ID directly; the event must reference `itm_P1`. |

### `AT-APP-78` — Per-peer structural edits don't leak

> | Slot | Value |
> |------|-------|
> | **Given** | Carol Edits on `itm_P1`. |
> | **When** | Carol `PATCH /items/itm_P1 {ParentId:"itm_carol_root"}`. |
> | **Then** | Only `itm_P1.ParentId` changes; `itm_P2.ParentId` unchanged. |
> | **Side effects** | One UPDATE row. |
> | **Negative assertion** | Bob MUST NOT see his `itm_P2` move. |

### `AT-APP-79` — Revoke on one peer doesn't revoke independent grant on another

> | Slot | Value |
> |------|-------|
> | **Given** | Carol has independent grants on `itm_P1` (from Alice) and `itm_Pk` (from Dave). |
> | **When** | Alice revokes `itm_P1` access. |
> | **Then** | `Permissions(itm_P1, Carol)` deleted; `Permissions(itm_Pk, Carol)` retained. |
> | **Side effects** | One DELETE row; one SSE `share-revoked`. |
> | **Negative assertion** | `Auth::hasRole(Carol, 'View')` on `itm_Pk` STILL returns true. |

### `AT-APP-80` — Sharing subtree exposes peer content but not other peer location

> | Slot | Value |
> |------|-------|
> | **Given** | Subtree `R` contains peer `itm_P1`. Sister peer `itm_P2` lives outside `R`. Carol gets View on `R`. |
> | **When** | Carol attempts `GET /items/itm_P2`. |
> | **Then** | `Status:404` (or 403). Content edits from `itm_P2` reflect in `itm_P1` (per AT-APP-77). |
> | **Side effects** | None on read attempt. |
> | **Negative assertion** | Carol's UI MUST NOT expose `itm_P2.Id` in any breadcrumb, link, or tooltip. |

---

## Trash reaper (`AT-APP-81..85`)

### `AT-APP-81` — Daily 03:00 UTC reaper, 30-day cutoff, batch 1000

> | Slot | Value |
> |------|-------|
> | **Given** | `wp_schedule_event` registered for `workflowy_reaper` at `03:00:00 UTC`. |
> | **When** | Scheduled run fires. |
> | **Then** | Server runs `DELETE FROM Item WHERE DeletedAt < NOW() - INTERVAL 30 DAY` in batches of 1000. |
> | **Side effects** | One `ReaperRuns` row inserted; FK cascades trigger. |
> | **Negative assertion** | Job MUST NOT run at any other time without admin trigger. |

### `AT-APP-82` — 29-day-old item survives

> | Slot | Value |
> |------|-------|
> | **Given** | `itm_x` with `DeletedAt = now - 29 days`. |
> | **When** | Reaper runs. |
> | **Then** | `itm_x` row remains; restorable. |
> | **Side effects** | None on `itm_x`. |
> | **Negative assertion** | Boundary calculation MUST use server UTC, not user local time. |

### `AT-APP-83` — Hard-delete cascades

> | Slot | Value |
> |------|-------|
> | **Given** | `itm_old` (purged) had children, mirror peer-membership rows, and permission rows. |
> | **When** | Reaper hard-deletes `itm_old`. |
> | **Then** | All FK-referencing rows cascade-deleted via `ON DELETE CASCADE`. |
> | **Side effects** | One transaction wraps all cascades. |
> | **Negative assertion** | No orphan rows: `SELECT COUNT(*) FROM Permission WHERE ItemId NOT IN (SELECT Id FROM Item)` → 0. |

### `AT-APP-84` — Reap dropping group to size 1 → auto-dissolve

> | Slot | Value |
> |------|-------|
> | **Given** | Peer-group with 2 members; one member is purgeable. |
> | **When** | Reaper hard-deletes the purgeable member. |
> | **Then** | Trigger fires within same txn (per AT-APP-64); group dissolves. |
> | **Side effects** | One trigger fire. |
> | **Negative assertion** | No singleton peer-group exists post-reap. |

### `AT-APP-85` — Each run logs to `ReaperRuns`

> | Slot | Value |
> |------|-------|
> | **Given** | Reaper completed a pass. |
> | **When** | `SELECT * FROM ReaperRuns ORDER BY RanAt DESC LIMIT 1`. |
> | **Then** | Row contains `RanAt`, `RowsDeleted`, `DurationMs`. |
> | **Side effects** | One INSERT per run. |
> | **Negative assertion** | A run with `RowsDeleted=0` MUST still log a row. |

---

## Multi-select zoom (`AT-APP-86..91`)

### `AT-APP-86` — Virtual scope opens with synthetic parent

> | Slot | Value |
> |------|-------|
> | **Given** | Selection of 3 items: `itm_A`, `itm_B`, `itm_C`. |
> | **When** | UI gesture: trigger zoom. |
> | **Then** | App routes to `virtual:<sessionId>` scope; breadcrumb shows "3 items"; the 3 items render as virtual children. |
> | **Side effects** | Zero DB writes (client-only state). |
> | **Negative assertion** | No new `Items` row inserted for the synthetic parent. |

### `AT-APP-87` — Edits inside virtual scope persist to real rows

> | Slot | Value |
> |------|-------|
> | **Given** | Inside virtual scope. |
> | **When** | Edit title of `itm_A` to `"new"`. |
> | **Then** | `PATCH /items/itm_A {Title:"new"}` fires; real row updated. |
> | **Side effects** | One PATCH; one SSE. |
> | **Negative assertion** | Edit MUST NOT route to a synthetic-parent endpoint. |

### `AT-APP-88` — Esc / breadcrumb-up exits and restores selection

> | Slot | Value |
> |------|-------|
> | **Given** | Inside virtual scope; original selection `{itm_A, itm_B, itm_C}` under `itm_real_parent`. |
> | **When** | Press `Esc`. |
> | **Then** | Route returns to `itm_real_parent`; selection restored. |
> | **Side effects** | Zero DB writes. |
> | **Negative assertion** | Selection MUST NOT be cleared on exit. |

### `AT-APP-89` — Drop to 1 collapses to normal zoom

> | Slot | Value |
> |------|-------|
> | **Given** | Virtual scope with `{itm_A, itm_B}`. User deletes `itm_B`. |
> | **When** | Membership recomputes. |
> | **Then** | Scope auto-collapses; route changes to plain zoom on `itm_A`. |
> | **Side effects** | One DELETE on `itm_B` (real). |
> | **Negative assertion** | Empty virtual scope MUST NEVER persist. |

### `AT-APP-90` — Drag locked within scope

> | Slot | Value |
> |------|-------|
> | **Given** | Virtual scope with 3 items. |
> | **When** | User drags `itm_A` toward an external drop target. |
> | **Then** | Drop indicator shows no-drop cursor; on drop, no PATCH fires. |
> | **Side effects** | none on rejected drop. |
> | **Negative assertion** | A real-tree `PATCH /items/itm_A/move` MUST NOT fire from a virtual-scope drag. |

### `AT-APP-91` — Page refresh discards virtual scope

> | Slot | Value |
> |------|-------|
> | **Given** | User in virtual scope. |
> | **When** | Browser refresh. |
> | **Then** | App lands on the last persisted (real) scope; no virtual route reconstructed. |
> | **Side effects** | none |
> | **Negative assertion** | Virtual session ID MUST NOT be persisted to localStorage / URL. |

---

## Templates — snapshot semantics (`AT-APP-92..96`)

### `AT-APP-92` — Apply mints fresh UUIDs; no TemplateId FK

> | Slot | Value |
> |------|-------|
> | **Given** | Template `tpl_T` payload of N nodes. |
> | **When** | `POST /templates/tpl_T/apply {TargetParentId:"itm_P"}`. |
> | **Then** | N new `Items` rows; each `Id` is a fresh UUID; no `TemplateId` column populated (column does NOT exist). |
> | **Side effects** | N INSERTs in one txn. |
> | **Negative assertion** | Schema MUST NOT have `Items.TemplateId`. |

### `AT-APP-93` — Template payload edit doesn't mutate instances

> | Slot | Value |
> |------|-------|
> | **Given** | Template `tpl_T` instantiated yesterday → `itm_INST`. Today, `tpl_T.PayloadJson` updated. |
> | **When** | Verify `itm_INST` content. |
> | **Then** | Unchanged. |
> | **Side effects** | Zero `UPDATE Item` rows from the template edit. |
> | **Negative assertion** | No back-link/sync mechanism MUST exist between template payload and instances. |

### `AT-APP-94` — Instance edit doesn't mutate template payload

> | Slot | Value |
> |------|-------|
> | **Given** | `itm_INST` was instantiated from `tpl_T`. |
> | **When** | `PATCH /items/itm_INST {Title:"changed"}`. |
> | **Then** | `tpl_T.PayloadJson` unchanged. |
> | **Side effects** | One UPDATE on Items; zero on Templates. |
> | **Negative assertion** | No reverse-sync to template payload. |

### `AT-APP-95` — Mirror peer-groups in template collapse to plain items on apply

> | Slot | Value |
> |------|-------|
> | **Given** | `tpl_T.PayloadJson` includes a node that was a peer-group member at snapshot time. |
> | **When** | Apply. |
> | **Then** | Inserted rows are plain `Items` with no `MirrorPeerGroupMembers` rows. |
> | **Side effects** | Zero rows in `MirrorPeerGroupMembers` from this apply. |
> | **Negative assertion** | The new items MUST NOT join any existing peer-group nor create a new one. |

### `AT-APP-96` — Instance OwnerId = applying user's auth.uid()

> | Slot | Value |
> |------|-------|
> | **Given** | Template `tpl_T` was authored by `usr_alice`. `usr_bob` applies it. |
> | **When** | Apply runs. |
> | **Then** | Every inserted `Items` row has `OwnerId = usr_bob`. |
> | **Side effects** | None (just OwnerId assignment). |
> | **Negative assertion** | `OwnerId` MUST NOT equal `usr_alice` for any inserted row. |

---

## Offline queue (`AT-APP-97..102`)

### `AT-APP-97` — Full local mirror enables offline CRUD

> | Slot | Value |
> |------|-------|
> | **Given** | First-load completed sync; full account tree mirrored to IndexedDB store `WorkflowyMirror`. Network disabled. |
> | **When** | User performs create / update / delete operations. |
> | **Then** | All operations succeed in UI; mirror DB receives the writes. |
> | **Side effects** | Operations enqueued. |
> | **Negative assertion** | UI MUST NOT show offline-blocking modal; CRUD MUST NOT throw network errors. |

### `AT-APP-98` — FIFO queue + optimistic local apply

> | Slot | Value |
> |------|-------|
> | **Given** | Offline. |
> | **When** | User performs 3 updates in sequence. |
> | **Then** | All 3 appended to FIFO queue (`PendingMutations` IndexedDB store); local mirror reflects them immediately. |
> | **Side effects** | 3 IndexedDB inserts. |
> | **Negative assertion** | Queue order MUST be preserved. |

### `AT-APP-99` — Drain in strict insertion order on reconnect

> | Slot | Value |
> |------|-------|
> | **Given** | Queue has 3 mutations `[m1, m2, m3]`; network restored. |
> | **When** | Drainer runs. |
> | **Then** | Mutations sent to server in order m1 → m2 → m3; server timestamps each. |
> | **Side effects** | 3 sequential POSTs. |
> | **Negative assertion** | Parallel send (Promise.all) is FORBIDDEN. |

### `AT-APP-100` — Field-level LWW on conflict (per AT-APP-33)

> | Slot | Value |
> |------|-------|
> | **Given** | Offline mutation on `itm_X.Title` at client time T0; server received conflicting update at `ServerTs > T0` while offline. |
> | **When** | Drain reaches conflicting mutation. |
> | **Then** | Server `ServerTs` wins (newer); local mutation discarded; mirror reverted. |
> | **Side effects** | One `UPDATE` reverted in mirror. |
> | **Negative assertion** | Local timestamp MUST NOT win over server `ServerTs`. |

### `AT-APP-101` — Server rejection → revert + non-blocking toast

> | Slot | Value |
> |------|-------|
> | **Given** | Queued mutation references `itm_purged` (hard-deleted while offline). |
> | **When** | Drain attempts mutation. |
> | **Then** | Server returns 410; client reverts the mirror change; toast shown. |
> | **Side effects** | One revert in mirror; one toast. |
> | **Negative assertion** | App MUST NOT show a blocking modal or halt the drain on rejection. |

### `AT-APP-102` — Queue survives browser restart

> | Slot | Value |
> |------|-------|
> | **Given** | Queue has 5 pending mutations; user closes browser before drain. |
> | **When** | User reopens browser; online event fires. |
> | **Then** | Drainer reads queue from IndexedDB and resumes from head. |
> | **Side effects** | Queue items are persistent (IndexedDB). |
> | **Negative assertion** | Queue MUST NOT be stored in `sessionStorage` or in-memory only. |

---

## Search ranking (`AT-APP-103..107`)

### `AT-APP-103` — 5-tier scoring × field weight

> | Slot | Value |
> |------|-------|
> | **Given** | Items: `i_exact` (Title="hello"), `i_prefix` (Title="hello world"), `i_substr` (Title="say hello there"), `i_token` (Title="hi", Note="hello"), `i_fuzzy` (Title="helo"). Query: "hello". |
> | **When** | `GET /search?q=hello`. |
> | **Then** | Score order: exact (100×1.0) > prefix (90×1.0) > substr (80×1.0) > token (70×1.0) > fuzzy (60×1.0). |
> | **Response envelope** | `{ "Status":200, "Attributes":{ "Query":"hello" }, "Results":[ { "Id":"i_exact", "Score":100 }, { "Id":"i_prefix", "Score":90 } ] }` |
> | **Side effects** | none |
> | **Negative assertion** | Ranking MUST be deterministic given fixed input + index state. |

### `AT-APP-104` — Same-tier ordered by `UpdatedAt DESC`

> | Slot | Value |
> |------|-------|
> | **Given** | Two items both score 90: `i_old.UpdatedAt=100`, `i_new.UpdatedAt=200`. |
> | **When** | Search query. |
> | **Then** | `i_new` ranks above `i_old`. |
> | **Side effects** | none |
> | **Negative assertion** | Tie-break MUST NOT be alphabetical or random. |

### `AT-APP-105` — Title (1.0) beats Note (0.4)

> | Slot | Value |
> |------|-------|
> | **Given** | `i_title` matches in Title; `i_note` matches in Note only; both at exact-match tier. |
> | **When** | Search. |
> | **Then** | `i_title` (100×1.0=100) ranks above `i_note` (100×0.4=40). |
> | **Side effects** | none |
> | **Negative assertion** | Field weights MUST be: Title=1.0, Note=0.4. |

### `AT-APP-106` — Soft-deleted items excluded

> | Slot | Value |
> |------|-------|
> | **Given** | `i_trashed.DeletedAt != NULL` matches query. |
> | **When** | Search. |
> | **Then** | `i_trashed` NOT in results. |
> | **Side effects** | none |
> | **Negative assertion** | Regular `/search` MUST exclude soft-deleted rows. |

### `AT-APP-107` — Search respects sharing (View+ only)

> | Slot | Value |
> |------|-------|
> | **Given** | `usr_bob` has no permission on `i_private` (matches query); has View on `i_shared` (matches). |
> | **When** | `GET /search?q=…` as `usr_bob`. |
> | **Then** | Results contain `i_shared` only. |
> | **Side effects** | Server applies permission filter at SQL level. |
> | **Negative assertion** | `i_private` MUST NOT appear; results gated at the SQL layer per AT-APP-23. |
