# App — Acceptance-Criteria I/O Fixtures (Part C: AT-APP-33..67)

> **Companion to:** [`97-acceptance-criteria.md`](./97-acceptance-criteria.md), [`97a-acceptance-criteria-fixtures.md`](./97a-acceptance-criteria-fixtures.md)
> **Format:** [`spec/01-spec-authoring-guide/19-acceptance-criteria-io-table.md`](../01-spec-authoring-guide/19-acceptance-criteria-io-table.md)
> **Coverage:** Concurrency core + SSE transport, Workflows (template-apply / share / restore), Mirror peer-group (B1).

---

## Concurrency & sync — core resolution

### `AT-APP-33` — Field-level LWW with `(ServerTs, UserId)` tiebreak

> | Slot | Value |
> |------|-------|
> | **Given** | `itm_X` has `Title="A"`, `Note="N1"`. Two concurrent updates arrive: U1 from `usr_alice` `{Title:"B"}` at `ServerTs=100`, U2 from `usr_bob` `{Note:"N2"}` at `ServerTs=100`. |
> | **When** | Server applies both. |
> | **Then** | Final state: `Title="B"`, `Note="N2"` (different fields don't conflict). On a real conflict (same field, same `ServerTs`), tiebreak is lexicographic `UserId` ASC: `usr_alice` wins over `usr_bob`. |
> | **Side effects** | Two SSE `item-updated` frames, one per applied write. |
> | **Negative assertion** | Whole-row LWW MUST NOT happen — `Note="N2"` MUST NOT be overwritten by U1's snapshot of `Note="N1"`. |

### `AT-APP-34` — `Mirrors.BrokenAt` sticky non-null

> | Slot | Value |
> |------|-------|
> | **Given** | Mirror peer-membership row has `BrokenAt = 200` (non-null). |
> | **When** | A later write at `ServerTs=300` attempts to set `BrokenAt = NULL`. |
> | **Then** | Write is rejected at the data layer; `BrokenAt` remains `200`. A subsequent write at `ServerTs=150` setting `BrokenAt=150` IS accepted (moves the broken-marker earlier). |
> | **Side effects** | none on rejection (no audit-log row, no SSE frame). |
> | **Negative assertion** | `BrokenAt` MUST NEVER transition non-null → null via normal sync; only `mirror-healed` (AT-APP-56) can clear it via the explicit restore path. |

### `AT-APP-35` — Source delete cascades `BrokenAt` in same txn

> | Slot | Value |
> |------|-------|
> | **Given** | Source `itm_X` has 3 dependent mirror-peer rows. |
> | **When** | `DELETE /items/itm_X` (soft-delete sets `DeletedAt=ts`). |
> | **Then** | In the SAME transaction, all 3 dependent rows have `BrokenAt = ts`; one `item-deleted` SSE + 3 `mirror-broken` SSE frames emitted. |
> | **Side effects** | Single DB transaction. |
> | **Negative assertion** | Zero orphan rows: `SELECT COUNT(*) FROM MirrorPeerGroupMembers WHERE SourceId='itm_X' AND BrokenAt IS NULL` → 0 after the delete. |

---

## Concurrency & sync — SSE transport

### `AT-APP-36` — SSE endpoint shape

> | Slot | Value |
> |------|-------|
> | **Given** | Authenticated user, valid `X-WP-Nonce`. |
> | **When** | `GET /wp-json/workflowy/v1/sync/stream?workspaceId=ws_01` with header `Accept: text/event-stream` and `X-WP-Nonce: <nonce>`. |
> | **Then** | Response status 200; headers include `Content-Type: text/event-stream`, `Cache-Control: no-cache`, `Connection: keep-alive`. Connection stays open. |
> | **Side effects** | none on subscription; subsequent server events are flushed as they occur. |
> | **Negative assertion** | No code path uses WebSocket, Pusher, Ably, or long-poll-as-chat protocols. |

### `AT-APP-37` — Closed event vocabulary (9 names)

> | Slot | Value |
> |------|-------|
> | **Given** | Live SSE stream. |
> | **When** | Capture all `event: …` lines emitted over a 60-s window of activity. |
> | **Then** | Every captured event name MUST be one of: `item-updated`, `item-deleted`, `item-restored`, `mirror-broken`, `mirror-healed`, `share-granted`, `share-revoked`, `presence`, `cursor-overflow`. Each MUST carry a `data:` JSON payload conforming to §14.5.2. |
> | **Side effects** | none |
> | **Negative assertion** | Names like `item-created`, `item-changed`, `update`, `notification` are forbidden; the `:hb` heartbeat (AT-APP-41) is a comment, NOT an event. |

### `AT-APP-38` — Each message has `id: {ServerTs}`

> | Slot | Value |
> |------|-------|
> | **Given** | SSE stream emitting events. |
> | **When** | Inspect each frame. |
> | **Then** | Every frame contains `id: <integer>` matching the server's `ServerTs` for that event. On reconnect, client sends `Last-Event-Id: <ts>` and the server resumes from `ts+1`. |
> | **Side effects** | none |
> | **Negative assertion** | A frame missing the `id:` line MUST be rejected by the server's own SSE-emit helper. |

### `AT-APP-39` — Polling fallback

> | Slot | Value |
> |------|-------|
> | **Given** | Client cannot maintain SSE (corp proxy strips `text/event-stream`). |
> | **When** | `GET /wp-json/workflowy/v1/sync/poll?workspaceId=ws_01&since=12345` |
> | **Response envelope** | `{ "Status":200, "Attributes":{ "HasMore":false }, "Results":[ { "ServerTs":12346, "Event":"item-updated", "Data":{} } ], "Navigation":{ "Cursor":12346 } }` |
> | **Then** | Client polls no more than once per 5 seconds per workspace. |
> | **Side effects** | none |
> | **Negative assertion** | Client code MUST NOT issue more than 12 poll requests/minute/workspace. |

### `AT-APP-40` — Reconnect replay deduplication

> | Slot | Value |
> |------|-------|
> | **Given** | Client `LastServerTs=100`. SSE drops; on reconnect server replays events `[101, 102, 103]`. While replaying, a new live event at `ts=104` arrives. |
> | **When** | Client processes replay then resumes live. |
> | **Then** | Each event applied exactly once; `LastServerTs` advances `100 → 101 → 102 → 103 → 104`. |
> | **Side effects** | UI re-renders once per applied event. |
> | **Negative assertion** | If event `ts=102` is delivered twice (replay + live race), the second application MUST be a no-op. |

### `AT-APP-41` — Heartbeat 15s, drop after 30s

> | Slot | Value |
> |------|-------|
> | **Given** | Open SSE connection with no activity. |
> | **When** | Wait. |
> | **Then** | Server emits comment frame `: ping\n\n` every 15 ± 1 seconds. Client treats absence of any frame for 30 s as a dropped connection. |
> | **Side effects** | none |
> | **Negative assertion** | The `:ping` comment MUST NOT appear in the `event: …` event vocabulary. |

### `AT-APP-42` — Cursor overflow → full re-sync

> | Slot | Value |
> |------|-------|
> | **Given** | Client offline 14+ days; `Last-Event-Id` older than retention window. |
> | **When** | Reconnect with stale `Last-Event-Id`. |
> | **Then** | Server emits exactly one `event: cursor-overflow` frame with `data: { "Reason":"retention_exceeded", "OldestAvailableTs":<n> }`. Client responds by issuing `GET /workspaces/ws_01/full-resync` and discarding its local mirror. |
> | **Side effects** | Client local IndexedDB mirror cleared and rebuilt. |
> | **Negative assertion** | Server MUST NOT continue sending incremental events after `cursor-overflow` until the client confirms full re-sync. |

---

## Workflows — Template application (`AT-APP-43..46`)

### `AT-APP-43` — Apply requires Edit on target parent

> | Slot | Value |
> |------|-------|
> | **Given** | `usr_bob` has `View` (not Edit) on `itm_P`. |
> | **When** | `POST /templates/tpl_T1/apply {TargetParentId:"itm_P"}` as `usr_bob`. |
> | **Then** | Response `Status:403`. |
> | **Response envelope** | `{ "Status":403, "Attributes":{}, "Results":[], "Errors":[ { "Code":"E_INSUFFICIENT_ROLE", "Required":"Edit" } ] }` |
> | **Side effects** | Zero `Items` rows inserted; zero SSE frames. |
> | **Negative assertion** | `SELECT COUNT(*) FROM Items WHERE ParentId='itm_P' AND CreatedAt >= <test_start>` → 0. |

### `AT-APP-44` — Successful apply visible immediately + SSE within 1 s

> | Slot | Value |
> |------|-------|
> | **Given** | `usr_alice` has `Edit` on `itm_P`; peer client subscribed to SSE on `ws_01`. |
> | **When** | `POST /templates/tpl_T1/apply {TargetParentId:"itm_P"}` returns `Status:201`. |
> | **Then** | Client A's local cache shows the new subtree before the SSE round-trip (optimistic). Peer client receives `item-updated` frame for the new root within 1 s under healthy SSE. |
> | **Side effects** | One transaction; one or more SSE frames. |
> | **Negative assertion** | Baseline SLI = 1 s p99; missed → perf regression. |

### `AT-APP-45` — Idempotency-Key replay returns 200 with original root

> | Slot | Value |
> |------|-------|
> | **Given** | First apply succeeded with `X-WorkFlowy-Idempotency-Key: idem_42`, returned `RootItemId="itm_NEW_ROOT"`. |
> | **When** | Replay `POST /templates/tpl_T1/apply` with the SAME `X-WorkFlowy-Idempotency-Key: idem_42` within 24 h. |
> | **Then** | `Status:200` (not 201), `Results:[{Id:"itm_NEW_ROOT"}]`. |
> | **Response envelope** | `{ "Status":200, "Attributes":{ "Replayed":true }, "Results":[ { "Id":"itm_NEW_ROOT" } ] }` |
> | **Side effects** | Zero new `Items` rows inserted. |
> | **Negative assertion** | After 24 h the idempotency cache expires; same key would then create a NEW subtree. |

### `AT-APP-46` — Partial INSERT failure rolls back, no SSE

> | Slot | Value |
> |------|-------|
> | **Given** | Template apply attempts to insert 5 rows; row #3 violates a CHECK constraint. |
> | **When** | Server runs the apply transaction. |
> | **Then** | Transaction ROLLBACKs; response `Status:500`. |
> | **Response envelope** | `{ "Status":500, "Attributes":{}, "Results":[], "Errors":[ { "Code":"E_TEMPLATE_APPLY_FAILED" } ] }` |
> | **Side effects** | Zero `Items` rows inserted; ZERO SSE frames emitted. |
> | **Negative assertion** | No partial subtree visible; not even the first 2 successfully-inserted rows persist. |

---

## Workflows — Share invite (`AT-APP-47..51`)

### `AT-APP-47` — Inviter without Admin → 403, no writes

> | Slot | Value |
> |------|-------|
> | **Given** | `usr_carol` has `Edit` (not Admin) on `itm_R`. |
> | **When** | `POST /items/itm_R/share {InviteeEmail:"x@y", Role:"View"}` as `usr_carol`. |
> | **Then** | `Status:403`; zero rows in `ItemGrants` or `PendingInvites`. |
> | **Response envelope** | `{ "Status":403, "Attributes":{}, "Errors":[{"Code":"E_INSUFFICIENT_ROLE","Required":"Admin"}], "Results":[] }` |
> | **Side effects** | None. |
> | **Negative assertion** | No SSE `share-granted` frame emitted. |

### `AT-APP-48` — Share existing user at Edit → 201 + SSE within 1 s

> | Slot | Value |
> |------|-------|
> | **Given** | `usr_alice` Admin on `itm_R`; `usr_bob` is an existing account. |
> | **When** | `POST /items/itm_R/share {InviteeId:"usr_bob", Role:"Edit"}`. |
> | **Then** | `Status:201`; `ItemGrants` row inserted with `AcceptedAt=NULL`; SSE `share-granted` frame within 1 s. |
> | **Response envelope** | `{ "Status":201, "Attributes":{}, "Results":[{"GrantId":"grt_…","ItemId":"itm_R","InviteeId":"usr_bob","Role":"Edit","AcceptedAt":null}] }` |
> | **Side effects** | One row inserted; one SSE frame. |
> | **Negative assertion** | `usr_bob`'s permission MUST NOT be active until `AcceptedAt` is set. |

### `AT-APP-49` — Share non-existent email → PendingInvite + 14-day expiry

> | Slot | Value |
> |------|-------|
> | **Given** | `usr_alice` Admin on `itm_R`; email `new@user.com` has no account. |
> | **When** | `POST /items/itm_R/share {InviteeEmail:"new@user.com", Role:"Edit"}`. |
> | **Then** | `Status:201`; `PendingInvites` row in Root DB with `ExpiresAt = serverNow + 14 days`; invite email queued. |
> | **Response envelope** | `{ "Status":201, "Attributes":{ "Pending":true }, "Results":[{"InviteId":"inv_…","Email":"new@user.com","ExpiresAt":"…"}] }` |
> | **Side effects** | One `PendingInvites` row; one outbound email job enqueued. |
> | **Negative assertion** | No `ItemGrants` row inserted. |

### `AT-APP-50` — Accept link → AcceptedAt + SSE both parties + role active

> | Slot | Value |
> |------|-------|
> | **Given** | `PendingInvites` row exists; invitee creates account and clicks accept link. |
> | **When** | `POST /invites/inv_42/accept` as the new account. |
> | **Then** | `Status:200`; `ItemGrants.AcceptedAt = serverNow`; `Auth::hasRole($invitee, 'Edit')` returns true on every descendant. |
> | **Response envelope** | `{ "Status":200, "Attributes":{}, "Results":[{"GrantId":"grt_…","AcceptedAt":"…"}] }` |
> | **Side effects** | SSE `share-granted` (accepted variant) emitted to BOTH parties. |
> | **Negative assertion** | Second click on the same accept link MUST NOT create a duplicate grant. |

### `AT-APP-51` — Idempotency replay on share returns same GrantId

> | Slot | Value |
> |------|-------|
> | **Given** | First share returned `GrantId="grt_77"` with `X-WorkFlowy-Idempotency-Key: idem_share_1`. |
> | **When** | Replay with same key. |
> | **Then** | `Status:201`; `Results:[{GrantId:"grt_77"}]`; zero new rows. |
> | **Side effects** | Zero new SSE frames. |
> | **Negative assertion** | `SELECT COUNT(*) FROM ItemGrants WHERE ItemId='itm_R' AND InviteeId='usr_bob'` → 1 (not 2). |

---

## Workflows — Trash restore (`AT-APP-52..57`)

### `AT-APP-52` — Restore with trashed parent → 422 + blockingAncestorId

> | Slot | Value |
> |------|-------|
> | **Given** | Both `itm_P` and its child `itm_C` are soft-deleted. |
> | **When** | `POST /trash/itm_C/restore`. |
> | **Then** | `Status:422`; nothing written to DB. |
> | **Response envelope** | `{ "Status":422, "Attributes":{ "BlockingAncestorId":"itm_P" }, "Errors":[{"Code":"E_BLOCKED_BY_ANCESTOR"}], "Results":[] }` |
> | **Side effects** | None. |
> | **Negative assertion** | `itm_C.DeletedAt` MUST remain non-null. |

### `AT-APP-53` — Restore ancestor then descendant → both succeed + SSE each

> | Slot | Value |
> |------|-------|
> | **Given** | Both `itm_P` and child `itm_C` trashed. |
> | **When** | `POST /trash/itm_P/restore`, then `POST /trash/itm_C/restore`. |
> | **Then** | Both `Status:200`; both `DeletedAt` cleared; one `item-restored` SSE per restore. |
> | **Side effects** | Two transactions, two SSE frames. |
> | **Negative assertion** | The descendant restore's transaction MUST be independent. |

### `AT-APP-54` — Restore hard-deleted item → 410 + UI cleanup

> | Slot | Value |
> |------|-------|
> | **Given** | `itm_old` was purged by reaper 5 minutes ago. |
> | **When** | `POST /trash/itm_old/restore`. |
> | **Then** | `Status:410`; client removes the row from Trash list. |
> | **Response envelope** | `{ "Status":410, "Attributes":{}, "Errors":[{"Code":"E_HARD_DELETED"}], "Results":[] }` |
> | **Side effects** | None server-side. |
> | **Negative assertion** | No INSERT attempted. |

### `AT-APP-55` — Restore racing concurrent re-delete → 409, item stays trashed

> | Slot | Value |
> |------|-------|
> | **Given** | Restore arrives at `ServerTs=200`; concurrent re-delete at `ServerTs=210` won the LWW race. |
> | **When** | Restore handler attempts to clear `DeletedAt`. |
> | **Then** | `Status:409`; `DeletedAt` retains the newer non-null timestamp. |
> | **Response envelope** | `{ "Status":409, "Attributes":{ "WinnerTs":210 }, "Errors":[{"Code":"E_LWW_LOST"}], "Results":[] }` |
> | **Side effects** | None. |
> | **Negative assertion** | Field-level LWW (AT-APP-33) is respected; whole-row replacement MUST NOT occur. |

### `AT-APP-56` — Restore heals broken mirrors via LWW + SSE `mirror-healed`

> | Slot | Value |
> |------|-------|
> | **Given** | `itm_X` was deleted, breaking 2 mirror-peer rows (`BrokenAt=100`). Restore runs at `ServerTs=200`. |
> | **When** | `POST /trash/itm_X/restore`. |
> | **Then** | An explicit healing path (NOT a normal write) clears `BrokenAt` to NULL on the 2 dependent rows. |
> | **Side effects** | Two `mirror-healed` SSE frames. |
> | **Negative assertion** | Stickiness (AT-APP-34) only blocks NORMAL writes; explicit restore path is the ONLY allowed clearer. |

### `AT-APP-57` — Stale restore vs reaper hard-delete → reaper wins

> | Slot | Value |
> |------|-------|
> | **Given** | Reaper hard-deleted `itm_old` at `ServerTs=300`; a stale restore arrives carrying `ClientTs=250`. |
> | **When** | Server processes restore. |
> | **Then** | Restore loses LWW; `Status:410`; broken-mirror rows retain their `BrokenAt`. |
> | **Side effects** | None. |
> | **Negative assertion** | Stale restore MUST NOT resurrect the row from a backup. |

---

## Mirror peer-group (`AT-APP-58..67`)

### `AT-APP-58` — Mirroring creates peer-group + 2 members

> | Slot | Value |
> |------|-------|
> | **Given** | `itm_X` exists; no peer-group yet. |
> | **When** | `POST /mirrors {SourceId:"itm_X", TargetParentId:"itm_P"}`. |
> | **Then** | One `MirrorPeerGroups` row created with `PeerGroupId=g_01`; two `MirrorPeerGroupMembers` rows: `(g_01, itm_X)` and `(g_01, itm_P2_NEW)`. |
> | **Response envelope** | `{ "Status":201, "Attributes":{ "PeerGroupId":"g_01" }, "Results":[ { "Id":"itm_P2_NEW", "ParentId":"itm_P", "PeerGroupId":"g_01" } ] }` |
> | **Side effects** | SSE `item-updated` on `itm_P2_NEW`. |
> | **Negative assertion** | `ItemType` of `itm_P2_NEW` MUST equal `itm_X.ItemType` — `Mirror` is NOT an ItemType. |

### `AT-APP-59` — Title edit on any peer fans out within 1 s

> | Slot | Value |
> |------|-------|
> | **Given** | Peer-group `g_01` has 3 members `{itm_X, itm_P2, itm_P3}`. |
> | **When** | `PATCH /items/itm_P2 {Title:"updated"}`. |
> | **Then** | Canonical content row updated; SSE `item-updated` fans out to subscribers of all 3 peers within 1 s. |
> | **Side effects** | One `UPDATE Items` row; ≥2 SSE frames. |
> | **Negative assertion** | Title is NOT duplicated per peer — single canonical content row. |

### `AT-APP-60` — Per-peer ParentId, SortOrder, Permissions

> | Slot | Value |
> |------|-------|
> | **Given** | Peer-group with `itm_X` (under `itm_root`) and `itm_P2` (under `itm_workspace2`). |
> | **When** | `PATCH /items/itm_P2 {ParentId:"itm_other"}`. |
> | **Then** | `itm_P2.ParentId` updated; `itm_X.ParentId` unchanged. |
> | **Side effects** | One UPDATE on `itm_P2` row only. |
> | **Negative assertion** | Zero UPDATE on `itm_X.ParentId`. |

### `AT-APP-61` — Detach drops singleton group

> | Slot | Value |
> |------|-------|
> | **Given** | Peer-group `g_01` has exactly 2 members `{itm_X, itm_P2}`. |
> | **When** | `DELETE /mirrors/itm_P2/peer-membership`. |
> | **Then** | `itm_P2`'s membership removed; surviving count = 1; group `g_01` auto-dissolved; `itm_X.PeerGroupId` set to NULL. |
> | **Side effects** | One DELETE on member row, one DELETE on group row, one UPDATE on `itm_X`. |
> | **Negative assertion** | No singleton peer-group MUST exist post-commit. |

### `AT-APP-62` — Cycle prevention → 409

> | Slot | Value |
> |------|-------|
> | **Given** | `itm_A` is an ancestor of `itm_B`. |
> | **When** | `POST /mirrors {SourceId:"itm_A", TargetParentId:"itm_B"}`. |
> | **Then** | `Status:409`. |
> | **Response envelope** | `{ "Status":409, "Attributes":{}, "Errors":[{"Code":"E_MIRROR_CYCLE","CycleVia":"itm_B"}], "Results":[] }` |
> | **Side effects** | Zero rows inserted. |
> | **Negative assertion** | Algorithm MUST NOT rely on bounded recursion depth. |

### `AT-APP-63` — Soft-delete one peer keeps group ≥2

> | Slot | Value |
> |------|-------|
> | **Given** | Peer-group with members `{itm_X, itm_P2, itm_P3}`. |
> | **When** | `DELETE /items/itm_P2` (soft delete). |
> | **Then** | `itm_P2.DeletedAt` set; group still has 2 active members; group NOT dissolved. |
> | **Side effects** | SSE `item-deleted` for `itm_P2`. |
> | **Negative assertion** | `itm_X` and `itm_P3` content MUST NOT be affected. |

### `AT-APP-64` — Hard-delete that drops group to 1 → auto-dissolve via trigger

> | Slot | Value |
> |------|-------|
> | **Given** | Peer-group `g_02` has 2 members; reaper hard-deletes one. |
> | **When** | Reaper transaction commits the DELETE on the 2nd member. |
> | **Then** | DB trigger fires inside the SAME transaction: removes the group row, NULLs the survivor's `PeerGroupId`. |
> | **Side effects** | One trigger fire per drop-to-1 event. |
> | **Negative assertion** | No window where a singleton peer-group exists post-commit. |

### `AT-APP-65` — Peer LWW with `OwnerId` ASC tiebreak

> | Slot | Value |
> |------|-------|
> | **Given** | Two concurrent updates on shared content field at same `ServerTs=500` from owners of different peers. |
> | **When** | Server applies. |
> | **Then** | Lexicographic `OwnerId` ASC wins. |
> | **Side effects** | Single `UPDATE Items` row; one SSE fan-out. |
> | **Negative assertion** | Random / non-deterministic tiebreak MUST NOT be used. |

### `AT-APP-66` — v1→v2 migration is idempotent

> | Slot | Value |
> |------|-------|
> | **Given** | Legacy `Mirrors(SourceId, MirrorId)` table populated. |
> | **When** | Run `wp-cli workflowy migrate v2-mirror-peer-groups`. |
> | **Then** | Each legacy pair becomes a peer-group with both rows as members; re-running is a no-op. |
> | **Side effects** | One row in `MigrationsRun`. |
> | **Negative assertion** | No duplicate peer-groups created on second run. |

### `AT-APP-67` — Legacy `Mirrors` table is read-only after migration

> | Slot | Value |
> |------|-------|
> | **Given** | v2 migration complete. |
> | **When** | Any `INSERT`/`UPDATE`/`DELETE` against `Mirrors` table via REST. |
> | **Then** | `Status:410`. |
> | **Response envelope** | `{ "Status":410, "Attributes":{}, "Errors":[{"Code":"E_LEGACY_TABLE_READONLY"}], "Results":[] }` |
> | **Side effects** | Zero row mutations. |
> | **Negative assertion** | Direct SQL access to `Mirrors` is allowed for SELECT (back-compat reads); writes blocked at REST + DB-trigger layer. |
