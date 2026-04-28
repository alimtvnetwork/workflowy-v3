# App — Acceptance-Criteria I/O Fixtures (Part B: AT-APP-15..32)

> **Companion to:** [`97-acceptance-criteria.md`](./97-acceptance-criteria.md), [`97a-acceptance-criteria-fixtures.md`](./97a-acceptance-criteria-fixtures.md)
> **Format:** [`spec/01-spec-authoring-guide/19-acceptance-criteria-io-table.md`](../01-spec-authoring-guide/19-acceptance-criteria-io-table.md)
> **Coverage:** Per-item context menu, Multi-select, Trash, Roles & permissions, Mirrors & sharing, Today, Templates.

---

## Per-item ⋮ context menu

### `AT-APP-15` — ⋮ menu items present

> | Slot | Value |
> |------|-------|
> | **Given** | Authenticated user; row `<ItemRow id="itm_A">` rendered. |
> | **When** | UI gesture: click `[data-testid="row-menu-button"][data-itemid="itm_A"]`. |
> | **Then** | Menu opens; visible items include at minimum `Move`, `Delete`, `Share`, `Mirror`, `Duplicate` (each with `data-action` attribute matching). |
> | **Side effects** | none |
> | **Negative assertion** | Menu MUST NOT contain a `Hard Delete` action; `Delete` action's handler MUST resolve to soft-delete (see AT-APP-16). |

### `AT-APP-16` — Delete sends to Trash (soft)

> | Slot | Value |
> |------|-------|
> | **Given** | `itm_A` exists, not in trash. |
> | **When** | UI gesture: open ⋮ menu → click `Delete` → confirm. |
> | **Request body** | `{}` to `DELETE /wp-json/workflowy/v1/items/itm_A` |
> | **Then** | `Items.DeletedAt` set to server now; row hidden from tree view; visible in Trash view. |
> | **Response envelope** | `{ "Status":200, "Attributes":{ "Soft":true }, "Results":[ { "Id":"itm_A", "DeletedAt":"2026-04-28T12:00:00Z" } ] }` |
> | **Side effects** | SSE `item-deleted` frame `{ "Id":"itm_A" }`; `AuditLog` row `event="item.deleted"`. |
> | **Negative assertion** | Row `itm_A` MUST still exist in `Items` table (`SELECT COUNT(*) FROM Items WHERE Id='itm_A'` → 1); no `DROP` / hard `DELETE FROM Items` issued. |

---

## Multi-select

### `AT-APP-17` — Shift+Click range, Cmd/Ctrl+Click toggle

> | Slot | Value |
> |------|-------|
> | **Given** | Visible rows in order: `itm_A`, `itm_B`, `itm_C`, `itm_D`. Selection initially empty. |
> | **When** | Click `itm_A` (selects it); then `Shift+Click itm_C`. |
> | **Then** | Selection = `{itm_A, itm_B, itm_C}` (contiguous range). Subsequent `Cmd+Click itm_D` → selection = `{itm_A, itm_B, itm_C, itm_D}`; `Cmd+Click itm_B` → `{itm_A, itm_C, itm_D}` (toggled off). |
> | **Side effects** | none (UI-local state). |
> | **Negative assertion** | Plain `Click itm_X` (no modifier) MUST clear selection to `{itm_X}` only. |

### `AT-APP-18` — Bulk operations atomic

> | Slot | Value |
> |------|-------|
> | **Given** | Selection `{itm_A, itm_B, itm_C}`. The server is configured to reject the second item (e.g. permission failure on `itm_B`). |
> | **When** | `POST /wp-json/workflowy/v1/items/bulk-move` body `{ "Ids":["itm_A","itm_B","itm_C"], "NewParentId":"itm_P" }`. |
> | **Request body** | `{ "Ids":["itm_A","itm_B","itm_C"], "NewParentId":"itm_P" }` |
> | **Then** | Transaction ROLLBACKs; no row's `ParentId` is updated. |
> | **Response envelope** | `{ "Status":409, "Attributes":{}, "Results":[], "Errors":[ { "Code":"E_BULK_PARTIAL_FAILURE", "FailedId":"itm_B" } ] }` |
> | **Side effects** | Zero SSE `item-updated` frames emitted; zero `AuditLog` rows for this operation. |
> | **Negative assertion** | `itm_A` and `itm_C` MUST NOT be moved even though their individual operations would have succeeded. |

---

## Trash

### `AT-APP-19` — 30-day auto-purge

> | Slot | Value |
> |------|-------|
> | **Given** | `itm_old` has `DeletedAt = now - 30 days - 1 minute`; `itm_recent` has `DeletedAt = now - 29 days`. |
> | **When** | Reaper job runs (`POST /wp-json/workflowy/v1/admin/reaper/run` or scheduled `wp_schedule_event`). |
> | **Then** | `itm_old` row hard-deleted from `Items`; `itm_recent` row remains (still in Trash view). |
> | **Side effects** | `ReaperRuns` row inserted with `RowsDeleted ≥ 1`; FK `ON DELETE CASCADE` removes child / mirror-membership / permission rows for purged items. |
> | **Negative assertion** | `itm_recent` MUST NOT be hard-deleted; subsequent restore call on `itm_recent` MUST succeed. |

### `AT-APP-20` — Restore preserves id, parent, subtree

> | Slot | Value |
> |------|-------|
> | **Given** | `itm_A` (with children `itm_A1`, `itm_A2`) was soft-deleted 5 days ago; original `ParentId="itm_P"`. |
> | **When** | `POST /wp-json/workflowy/v1/trash/itm_A/restore` |
> | **Then** | `itm_A.DeletedAt` cleared; `itm_A.Id` unchanged; `itm_A.ParentId="itm_P"`; children `itm_A1`, `itm_A2` reappear with their original IDs and parent pointers. |
> | **Response envelope** | `{ "Status":200, "Attributes":{ "RestoredCount":3 }, "Results":[ { "Id":"itm_A", "ParentId":"itm_P", "DeletedAt":null } ] }` |
> | **Side effects** | SSE `item-restored` per restored row; `AuditLog` rows `event="item.restored"`. |
> | **Negative assertion** | No new IDs minted; `itm_A1.Id` and `itm_A2.Id` MUST equal their pre-delete values. |

---

## Roles & permissions

### `AT-APP-21` — Roles in separate table

> | Slot | Value |
> |------|-------|
> | **Given** | Schema migrated. |
> | **Linter command** | `grep -E '"(role|roles|isAdmin)"' wp-plugin/migrations/*.sql wp-plugin/src/Models/User*.php` |
> | **Then** | Zero matches inside the `Users` (or `User`) model/migration; roles live exclusively in `UserRole(UserId, Role)` table. |
> | **Side effects** | none |
> | **Negative assertion** | Adding a `Role` column to the `Users` table MUST fail hygiene check (P5 enforcement-rules linter). |

### `AT-APP-22` — Server-side `Auth::hasRole` only; no Postgres RLS

> | Slot | Value |
> |------|-------|
> | **Given** | A REST controller method that performs a privileged action. |
> | **Linter command** | `rg -n "if \\(.*->role\\b\|->isAdmin\\b" wp-plugin/src/` |
> | **Then** | Zero matches; every authorization check goes through `Auth::hasRole($userId, $role)`. |
> | **Side effects** | none |
> | **Negative assertion** | No SQL containing `CREATE POLICY`, `ENABLE ROW LEVEL SECURITY`, or `SECURITY DEFINER` exists under `wp-plugin/migrations/` (SQLite has no such constructs). |

### `AT-APP-23` — Client storage never trusted for admin

> | Slot | Value |
> |------|-------|
> | **Linter command** | `rg -nE "(localStorage\|sessionStorage)\\.(get\|set)Item.*['\"](role\|isAdmin\|admin)['\"]" src/` |
> | **Given** | Frontend codebase. |
> | **Then** | Zero matches. Client may cache role for UI hints but every server action MUST re-validate via `Auth::hasRole`. |
> | **Side effects** | none |
> | **Negative assertion** | Even if a malicious client sets `localStorage.role = 'Admin'`, the server response for an admin-gated endpoint MUST be `Status:403`. |

---

## Mirrors & sharing (locked Phase-2 contracts)

### `AT-APP-24` — Mirror references canonical source only

> | Slot | Value |
> |------|-------|
> | **Given** | Item `itm_X` has 3 mirrors `itm_M1`, `itm_M2`, `itm_M3` (all peer-group members per AT-APP-58). |
> | **When** | `DELETE /items/itm_X` (soft-delete the source). |
> | **Then** | All 3 mirror peer-membership rows have `BrokenAt = itm_X.DeletedAt`; UI renders them with broken-link affordance. |
> | **Side effects** | SSE `mirror-broken` frame per mirror; `AuditLog` `event="mirror.broken"`. |
> | **Negative assertion** | No mirror row references another mirror's `Id` as its source — only `itm_X` (the canonical source). |

### `AT-APP-25` — Share cascades View to descendants

> | Slot | Value |
> |------|-------|
> | **Given** | `itm_R` (with subtree `itm_R/itm_C1/itm_GC1`) owned by `usr_alice`. `usr_bob` has no permissions. |
> | **When** | `POST /wp-json/workflowy/v1/items/itm_R/share` body `{ "InviteeId":"usr_bob", "Role":"View" }`. |
> | **Request body** | `{ "InviteeId":"usr_bob", "Role":"View" }` |
> | **Then** | `Permissions` row inserted for `(itm_R, usr_bob, View)`; `Auth::hasRole(usr_bob, 'View')` returns true for `itm_R`, `itm_C1`, AND `itm_GC1`. |
> | **Response envelope** | `{ "Status":201, "Attributes":{}, "Results":[ { "GrantId":"grt_01HX…", "ItemId":"itm_R", "InviteeId":"usr_bob", "Role":"View" } ] }` |
> | **Side effects** | SSE `share-granted` frame to both users; one `Permissions` row only (cascade is computed at read time, NOT materialized). |
> | **Negative assertion** | No `Permissions` rows are inserted for `itm_C1` or `itm_GC1` (cascade is logical, not physical). |

---

## Today view

### `AT-APP-26` — Today aggregation predicate

> | Slot | Value |
> |------|-------|
> | **Given** | User has 5 todos: `t1` due yesterday (incomplete), `t2` due today (incomplete), `t3` due today (completed), `t4` due tomorrow, `t5` not a todo (Bullet itemType). |
> | **When** | `GET /wp-json/workflowy/v1/today` |
> | **Then** | Results contain `t1` and `t2` only (overdue + due-today, both incomplete, both `itemType=Todo`). |
> | **Response envelope** | `{ "Status":200, "Attributes":{ "Date":"2026-04-28" }, "Results":[ { "Id":"t1", "DueDate":"2026-04-27" }, { "Id":"t2", "DueDate":"2026-04-28" } ] }` |
> | **Side effects** | none (read-only). |
> | **Negative assertion** | `t3` (completed), `t4` (future), `t5` (non-todo) MUST NOT appear; items shared with `View` only also excluded (only own + Edit-shared). |

### `AT-APP-27` — Complete from Today removes within same render

> | Slot | Value |
> |------|-------|
> | **Given** | Today view showing `t2` (incomplete due today). |
> | **When** | UI gesture: click `t2`'s checkbox. |
> | **Request body** | `{ "CompletedAt":"2026-04-28T10:30:00Z" }` to `PATCH /items/t2` |
> | **Then** | `Items.CompletedAt` persisted; `t2` removed from Today list within same React render cycle (no `GET /today` refetch required). |
> | **Response envelope** | `{ "Status":200, "Attributes":{}, "Results":[ { "Id":"t2", "CompletedAt":"2026-04-28T10:30:00Z" } ] }` |
> | **Side effects** | SSE `item-updated` frame; optimistic UI update before network round-trip. |
> | **Negative assertion** | Page MUST NOT show a loading spinner on the Today list during this transition. |

### `AT-APP-28` — Today settings keys

> | Slot | Value |
> |------|-------|
> | **Given** | User has not customized settings. |
> | **When** | `GET /wp-json/workflowy/v1/me/settings` |
> | **Then** | Response includes `today.includeOverdue: true` and `today.startOfDay: "00:00"` (in user's local timezone). |
> | **Response envelope** | `{ "Status":200, "Attributes":{}, "Results":[ { "Key":"today.includeOverdue", "Value":true }, { "Key":"today.startOfDay", "Value":"00:00" } ] }` |
> | **Side effects** | none |
> | **Negative assertion** | Setting `today.includeOverdue:false` MUST cause AT-APP-26's `t1` (overdue) to disappear from the Today list. |

---

## Templates

### `AT-APP-29` — Template is independent snapshot

> | Slot | Value |
> |------|-------|
> | **Given** | Subtree `itm_A` (with descendant `itm_A1` content `"original"`) saved as template `tpl_T1` via `POST /templates {RootId:"itm_A"}`. |
> | **When** | Edit `itm_A1.Content = "modified"` via `PATCH /items/itm_A1`. |
> | **Then** | `Templates.PayloadJson` for `tpl_T1` still contains the descendant snapshot with `"Content":"original"`. |
> | **Side effects** | One `UPDATE Items` row; zero `UPDATE Templates` rows. |
> | **Negative assertion** | `tpl_T1.PayloadJson` MUST NOT mutate when source items mutate. |

### `AT-APP-30` — Apply mints fresh IDs and recomputes fractional indices

> | Slot | Value |
> |------|-------|
> | **Given** | Template `tpl_T1` with payload of 3 nodes. Target parent `itm_P` has 2 existing children. |
> | **When** | `POST /wp-json/workflowy/v1/templates/tpl_T1/apply` body `{ "TargetParentId":"itm_P", "AfterSiblingId":"itm_C1" }`. |
> | **Request body** | `{ "TargetParentId":"itm_P", "AfterSiblingId":"itm_C1" }` |
> | **Then** | 3 new `Items` rows inserted with brand-new `Id` values; `ParentId` of the new root = `itm_P`; descendants' `ParentId` rewritten to point at the corresponding NEW IDs (not the snapshot's IDs); `FractionalIndex` of the new root slots between `itm_C1` and the next sibling. |
> | **Response envelope** | `{ "Status":201, "Attributes":{ "InsertedCount":3 }, "Results":[ { "Id":"itm_NEW1", "ParentId":"itm_P" } ] }` |
> | **Side effects** | One transaction; SSE `item-updated` per inserted row. |
> | **Negative assertion** | Zero rows inserted with `Id` equal to any value present in `tpl_T1.PayloadJson`. |

### `AT-APP-31` — Mirror refs in template materialize as plain copies

> | Slot | Value |
> |------|-------|
> | **Given** | Template `tpl_T2` whose payload includes a node that was a mirror peer at snapshot time. |
> | **When** | `POST /templates/tpl_T2/apply {TargetParentId:"itm_Q"}` |
> | **Then** | Inserted rows include the mirrored content as plain `Items` rows; ZERO rows inserted into `MirrorPeerGroupMembers` for this apply. |
> | **Side effects** | none beyond plain `Items` inserts. |
> | **Negative assertion** | The new items MUST NOT be members of any peer-group; subsequent edits to them MUST NOT propagate to the original peer-group. |

### `AT-APP-32` — Deleting template never affects instances

> | Slot | Value |
> |------|-------|
> | **Given** | Template `tpl_T3` was applied yesterday → produced subtree `itm_INST`. |
> | **When** | `DELETE /wp-json/workflowy/v1/templates/tpl_T3`. |
> | **Then** | `Templates` row removed; `itm_INST` and all descendants are unchanged. |
> | **Response envelope** | `{ "Status":200, "Attributes":{}, "Results":[ { "Id":"tpl_T3", "DeletedAt":"…" } ] }` |
> | **Side effects** | Zero changes to `Items`. |
> | **Negative assertion** | No `TemplateId` FK exists on `Items`. |
