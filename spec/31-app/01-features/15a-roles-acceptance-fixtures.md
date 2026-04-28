# Roles & Permissions — Acceptance-Criteria I/O Fixtures (`AT-ROLES-01..10`)

> **Companion to:** [`15-roles-and-permissions.md`](./15-roles-and-permissions.md) §Acceptance Tests
> **Format:** [`spec/01-spec-authoring-guide/19-acceptance-criteria-io-table.md`](../../01-spec-authoring-guide/19-acceptance-criteria-io-table.md)
> **Elaborates canonical:** `AT-APP-21`, `AT-APP-22`, `AT-APP-23` (see [`spec/31-app/97c-acceptance-criteria-fixtures.md`](../97c-acceptance-criteria-fixtures.md) — actually canonical fixtures are in [`97b`](../97b-acceptance-criteria-fixtures.md)).

---

## `AT-ROLES-01` — `View` recipient sees content but no edit affordances

> | Slot | Value |
> |------|-------|
> | **Given** | `itm_X` owned by `usr_alice`; `Permissions(itm_X, usr_bob, View)` row exists. |
> | **When** | `usr_bob` issues `GET /wp-json/workflowy/v1/items/itm_X` and renders. |
> | **Response envelope** | `{ "Status":200, "Attributes":{ "ResolvedRole":"View" }, "Results":[ { "Id":"itm_X", "Title":"…", "Content":"…" } ] }` |
> | **Then** | UI renders content; `data-testid="row-edit-affordances"` is absent; `data-testid="share-dialog-trigger"` is hidden. |
> | **Side effects** | none (read-only). |
> | **Negative assertion** | `usr_bob` issuing `PATCH /items/itm_X {Title:"hack"}` MUST receive `Status:403` with `Errors:[{"Code":"E_INSUFFICIENT_ROLE","Required":"Edit"}]`. |

## `AT-ROLES-02` — `Edit` recipient cannot delete the share root

> | Slot | Value |
> |------|-------|
> | **Given** | `Permissions(itm_R, usr_bob, Edit)`; `itm_R` is the granted root. `itm_R/itm_C` (descendant) inherits `Edit`. |
> | **When** | `usr_bob` issues `DELETE /items/itm_R`. |
> | **Then** | `Status:403`; toast `permission-denied-toast` rendered. |
> | **Response envelope** | `{ "Status":403, "Attributes":{}, "Errors":[{"Code":"E_DELETE_SHARE_ROOT_DENIED","RequiredOnRoot":"Admin"}], "Results":[] }` |
> | **Side effects** | `itm_R.DeletedAt` MUST remain NULL. |
> | **Negative assertion** | The same user issuing `DELETE /items/itm_C` MUST succeed (descendant deletion is allowed at `Edit`). |

## `AT-ROLES-03` — `Admin` recipient can revoke another user's grant

> | Slot | Value |
> |------|-------|
> | **Given** | `Permissions(itm_X, usr_bob, Admin)` and `Permissions(itm_X, usr_carol, Edit)` both exist. |
> | **When** | `usr_bob` issues `DELETE /items/itm_X/grants/grt_carol`. |
> | **Then** | `Status:200`; `Permissions(itm_X, usr_carol, *)` row deleted; SSE `share-revoked` to `usr_carol`. |
> | **Response envelope** | `{ "Status":200, "Attributes":{}, "Results":[ { "GrantId":"grt_carol", "RevokedAt":"…" } ] }` |
> | **Side effects** | One DELETE row; one SSE frame; `Auth::hasRole(usr_carol, 'View')` on `itm_X` returns false immediately. |
> | **Negative assertion** | `usr_carol`'s next `GET /items/itm_X` MUST return `Status:403`. |

## `AT-ROLES-04` — `Admin` cannot toggle public link (Owner-only)

> | Slot | Value |
> |------|-------|
> | **Given** | `Permissions(itm_X, usr_bob, Admin)`; `itm_X.OwnerId = usr_alice`. |
> | **When** | `usr_bob` opens Share dialog. |
> | **Then** | `data-testid="share-public-toggle"` rendered with `disabled` attribute and tooltip `"Owner-only"`. Server `POST /items/itm_X/public-link` as `usr_bob` returns `Status:403`. |
> | **Response envelope** | `{ "Status":403, "Attributes":{}, "Errors":[{"Code":"E_OWNER_ONLY","Action":"public-link"}], "Results":[] }` |
> | **Side effects** | None. |
> | **Negative assertion** | `usr_alice` (Owner) MUST be able to toggle the same control successfully. |

## `AT-ROLES-05` — Inheritance: child grant overrides parent (most-permissive wins)

> | Slot | Value |
> |------|-------|
> | **Given** | `Permissions(itm_P, usr_bob, View)` AND `Permissions(itm_P/itm_C, usr_bob, Edit)` (explicit child grant). |
> | **When** | `usr_bob` issues `GET /items/itm_C` and reads resolved role. |
> | **Response envelope** | `{ "Status":200, "Attributes":{ "ResolvedRole":"Edit" }, "Results":[ { "Id":"itm_C" } ] }` |
> | **Then** | Resolved role = `Edit` per §Inheritance rule 2 (most-permissive); UI renders edit affordances + permission badge `Edit`. |
> | **Side effects** | none |
> | **Negative assertion** | Resolution MUST NOT pick the parent's `View` (no "nearest-ancestor wins" semantics). |

## `AT-ROLES-06` — Public link → anonymous read-only render

> | Slot | Value |
> |------|-------|
> | **Given** | `itm_X.PublicSlug = "abc123"`; `itm_X.PublicEnabled = true`. |
> | **When** | Anonymous browser visits `/p/abc123`. |
> | **Response envelope** | `{ "Status":200, "Attributes":{ "Public":true, "ResolvedRole":"PublicView" }, "Results":[ { "Id":"itm_X", "Title":"…", "Content":"…" } ] }` |
> | **Then** | `data-testid="public-view-banner"` rendered; no comment, share, or edit affordances; no auth cookie required. |
> | **Side effects** | One read-only audit log row `event="public.view"`. |
> | **Negative assertion** | Anonymous `PATCH /items/itm_X` MUST return `Status:401` (not 403 — auth required to even attempt edit). |

## `AT-ROLES-07` — Owner transfer reassigns OwnerId + removes original from grants

> | Slot | Value |
> |------|-------|
> | **Given** | `itm_X.OwnerId = usr_alice`; no row in `Permissions(itm_X, usr_bob, *)`. |
> | **When** | `usr_alice` issues `POST /items/itm_X/transfer-ownership {NewOwnerId:"usr_bob"}`. |
> | **Then** | `Status:200`; `itm_X.OwnerId = usr_bob`; original `Permissions(itm_X, usr_alice, Owner)` row deleted; no implicit grant added back for `usr_alice`. |
> | **Response envelope** | `{ "Status":200, "Attributes":{}, "Results":[ { "Id":"itm_X", "OwnerId":"usr_bob", "PreviousOwnerId":"usr_alice" } ] }` |
> | **Side effects** | One UPDATE on `Items.OwnerId`; one DELETE on `Permissions`; SSE `share-revoked` to `usr_alice`. |
> | **Negative assertion** | `Auth::hasRole(usr_alice, 'View')` on `itm_X` MUST return false post-transfer. |

## `AT-ROLES-08` — Workspace member cannot invite another member

> | Slot | Value |
> |------|-------|
> | **Given** | `usr_carol.WorkspaceRole = Member` (not Owner/Admin) on `ws_01`. |
> | **When** | `usr_carol` issues `POST /workspaces/ws_01/invitations {Email:"x@y", Role:"Member"}`. |
> | **Then** | `Status:403`; no row inserted in `WorkspaceInvitations`. |
> | **Response envelope** | `{ "Status":403, "Attributes":{}, "Errors":[{"Code":"E_WORKSPACE_INVITE_DENIED","RequiredRole":"Owner|Admin"}], "Results":[] }` |
> | **Side effects** | None. |
> | **Negative assertion** | The same call by a `WorkspaceRole=Owner` user MUST succeed with `Status:201`. |

## `AT-ROLES-09` — Workspace removal cascades grants + orphan-tags authored items

> | Slot | Value |
> |------|-------|
> | **Given** | `usr_dave` is a member of `ws_01` with 5 `Permissions` rows and 3 owned `Items` rows. |
> | **When** | Workspace owner issues `DELETE /workspaces/ws_01/members/usr_dave`. |
> | **Then** | All 5 `Permissions` rows where `UserId=usr_dave` deleted (cascade); the 3 owned items get `OwnerStatus="Orphan"` flag (or transferred to workspace owner per fallback policy). |
> | **Response envelope** | `{ "Status":200, "Attributes":{ "GrantsRemoved":5, "ItemsOrphaned":3 }, "Results":[ { "UserId":"usr_dave", "RemovedAt":"…" } ] }` |
> | **Side effects** | One transaction; SSE `share-revoked` per affected item; UI badge `removed-user-badge` on orphaned items. |
> | **Negative assertion** | The 3 owned items MUST NOT be hard-deleted (orphan ≠ delete). |

## `AT-ROLES-10` — `Auth::hasRole()` exception → deny + Warn log

> | Slot | Value |
> |------|-------|
> | **Given** | A REST controller calls `Auth::hasRole($userId, 'Edit')` and the helper throws (e.g. transient SQLite I/O error). |
> | **When** | The exception propagates to the controller's permission middleware. |
> | **Then** | Middleware catches the exception, returns `Status:403` (fail-closed), and emits a `Warn`-level log line `auth.has_role.exception {userId, itemId, exception}`. |
> | **Response envelope** | `{ "Status":403, "Attributes":{}, "Errors":[{"Code":"E_PERMISSION_CHECK_FAILED"}], "Results":[] }` |
> | **Side effects** | One log line (Warn level); zero state mutations; toast `permission-denied-toast` rendered client-side. |
> | **Negative assertion** | Middleware MUST NOT fail-open (return `Status:200` or skip the check on exception); MUST NOT swallow the log line. |
