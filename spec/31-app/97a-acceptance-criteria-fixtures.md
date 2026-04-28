# App — Acceptance-Criteria I/O Fixtures

> **Version:** 1.0.0
> **Created:** 2026-04-28 (UTC+8)
> **Status:** Active — companion to [`97-acceptance-criteria.md`](./97-acceptance-criteria.md)
> **Format:** [`spec/01-spec-authoring-guide/19-acceptance-criteria-io-table.md`](../01-spec-authoring-guide/19-acceptance-criteria-io-table.md)
> **Coverage:** P2a sub-task — `AT-APP-01..14` (Information model, Layout shell, Page content + interactions). `AT-APP-15..107` land in subsequent `next` calls (P2a continuation).

---

## How to use

For every `AT-APP-NN` row in the canonical file, find the matching block below to get the literal Given / When / Then + JSON request/response fixture an implementer or AI test-author can run verbatim. Conventions:

- **Item IDs** use the prefix `itm_` followed by 26 chars (ULID-shaped), example: `itm_01HXYZ0000000000000000A1`. Treat as opaque.
- **User IDs** use prefix `usr_`. Default test user `usr_alice`.
- **REST namespace** is `/wp-json/workflowy/v1` (per `mem://constraints/backend-runtime-deferred`).
- **Envelope** keys are PascalCase; mandatory `Status` / `Attributes` / `Results` per `spec/04-database-conventions/06-rest-api-format/`.

---

## Information model

### `AT-APP-01` — Root item is auto-created and undeletable

> | Slot | Value |
> |------|-------|
> | **Given** | New signup `usr_alice` just completed `POST /auth/signup` (`Status:201`); no items exist for that user. |
> | **When** | `GET /wp-json/workflowy/v1/items/root` |
> | **Then** | Response carries exactly one `Item` whose `ParentId` is `null` and `IsRoot:true`; that row exists in `Item` table with `UserId=usr_alice`. |
> | **Response envelope** | `{ "Status":200, "Attributes":{ "ItemKind":"root" }, "Results":[ { "Id":"itm_01HX…ROOT", "ParentId":null, "ItemType":"Bullet", "Content":"", "IsRoot":true, "FractionalIndex":"a0" } ] }` |
> | **Side effects** | `Item` row inserted with `UserId=usr_alice`, `IsRoot=1`; `AuditLog` row `event="root.created"`. |
> | **Negative assertion** | `DELETE /items/itm_01HX…ROOT` MUST return `Status:409` with `Errors:[{Code:"E_ROOT_UNDELETABLE"}]`; no Trash row created. |

### `AT-APP-02` — Item.id is immutable across mutations

> | Slot | Value |
> |------|-------|
> | **Given** | Item `itm_X` exists under root. |
> | **When** | Run, in order: `PATCH /items/itm_X/move` (new parent), `POST /mirrors {SourceId:itm_X,…}`, `POST /share/itm_X`, `DELETE /items/itm_X`, `POST /trash/itm_X/restore`. |
> | **Then** | After every step, `GET /items/itm_X` returns the same `Id:"itm_X"`; `Mirror` rows reference `SourceId:"itm_X"` unchanged. |
> | **Side effects** | Each step writes its own `AuditLog` row but `Item.Id` column is never updated (verify via `SELECT COUNT(*) FROM AuditLog WHERE event LIKE 'item.id_%'` → 0). |
> | **Negative assertion** | No row in any table contains a foreign-key reference to a *different* `itm_*` value for this item. |

### `AT-APP-03` — Single unified Item type discriminated by ItemType

> | Slot | Value |
> |------|-------|
> | **Given** | Schema migrations applied. |
> | **When** | `SELECT name FROM sqlite_master WHERE type='table' AND name IN ('Project','Note','Task','Bookmark')` |
> | **Then** | Zero rows returned; only `Item` table exists for tree storage. |
> | **Side effects** | none |
> | **Negative assertion** | Any new migration that creates `Project` / `Note` / `Task` / `Bookmark` MUST fail the hygiene script (`scripts/spec-hygiene/`); no PHP class under `wp-plugin/src/Models/` named `Project`, `Note`, `Task`, `Bookmark`. |

### `AT-APP-04` — Children ordered by fractional-index strings

> | Slot | Value |
> |------|-------|
> | **Given** | Parent `itm_P` has children `itm_A (FractionalIndex="a0")`, `itm_C (FractionalIndex="a2")`. |
> | **When** | `POST /items` body `{ "ParentId":"itm_P", "AfterSiblingId":"itm_A", "BeforeSiblingId":"itm_C", "Content":"middle" }` |
> | **Request body** | `{ "ParentId":"itm_P", "AfterSiblingId":"itm_A", "BeforeSiblingId":"itm_C", "Content":"middle" }` |
> | **Then** | New item `itm_B` created with `FractionalIndex="a1"` (or any string strictly between `"a0"` and `"a2"` per the project's fractional-index algo). |
> | **Response envelope** | `{ "Status":201, "Attributes":{}, "Results":[ { "Id":"itm_B", "ParentId":"itm_P", "FractionalIndex":"a1", "Content":"middle" } ] }` |
> | **Side effects** | `Item` row inserted; sibling rows `itm_A` / `itm_C` have `FractionalIndex` UNCHANGED. |
> | **Negative assertion** | No `UPDATE` issued against `itm_A` or `itm_C`; insertion does NOT renumber existing siblings. |

### `AT-APP-05` — Virtualization above 250 items

> | Slot | Value |
> |------|-------|
> | **Given** | Parent `itm_P` has 251 children. |
> | **When** | UI renders `<ItemList parentId="itm_P">`. |
> | **Then** | The DOM contains ≤ ~50 `<ItemRow>` elements (the virtual window) at any time, not 251. |
> | **Side effects** | The list registers an `IntersectionObserver` (or equivalent) and the network layer issues `GET /items?parentId=itm_P&offset=0&limit=100` paginated calls. |
> | **Negative assertion** | `document.querySelectorAll('[data-itemrow]').length` MUST NOT exceed 100 even after scrolling to the bottom (window slides; old rows are unmounted). |

---

## Layout shell

### `AT-APP-06` — Two-zone layout

> | Slot | Value |
> |------|-------|
> | **Given** | Authenticated user lands on `/`. |
> | **When** | `document.querySelector('[data-shell]').children` |
> | **Then** | Exactly two children with `data-zone="navbar"` (position:fixed, top:0) and `data-zone="page"` (overflow-y:auto). |
> | **Side effects** | none |
> | **Negative assertion** | No third sibling zone (no global footer, no global toolbar) at the shell level — those, if present, MUST live INSIDE `[data-zone="page"]`. |

### `AT-APP-07` — Sidebar open/close

> | Slot | Value |
> |------|-------|
> | **Given** | Sidebar is closed (`[data-sidebar-state="closed"]`). |
> | **When** | UI gesture: click `[data-testid="navbar-menu-button"]`. |
> | **Then** | `[data-sidebar-state="open"]`; sidebar transform is `translateX(0)`. Subsequently pressing `Escape` OR clicking outside the sidebar bounding box returns it to `closed`. |
> | **Side effects** | none (UI-local state; no network call). |
> | **Negative assertion** | Clicking *inside* the sidebar bounding box MUST NOT close it. |

### `AT-APP-08` — Back/Forward disabled when history empty

> | Slot | Value |
> |------|-------|
> | **Given** | Fresh session, zoom history = `[]`. |
> | **When** | Inspect `[data-testid="navbar-back"]` and `[data-testid="navbar-forward"]`. |
> | **Then** | Both have `aria-disabled="true"` and visible `opacity ≤ 0.5` (faded). After zooming into one item, **back** becomes enabled, **forward** stays disabled. |
> | **Side effects** | none |
> | **Negative assertion** | A click on a faded button MUST NOT push to / pop from the zoom history (no state change). |

### `AT-APP-09` — Breadcrumb middle collapse

> | Slot | Value |
> |------|-------|
> | **Given** | Current zoom path has 5 segments: `Root › A › B › C › D`. |
> | **When** | Render `[data-testid="breadcrumb"]`. |
> | **Then** | Visible segments are `Root › … › C › D` (4 visible); the `…` element has `data-collapsed-count="2"`. Hover/focus reveals a dropdown listing `A`, `B` in path order. |
> | **Side effects** | none |
> | **Negative assertion** | When path ≤ 3 segments, no `…` element exists in the DOM. |

### `AT-APP-10` — Layout toggle switches list ↔ board

> | Slot | Value |
> |------|-------|
> | **Given** | Current page item `itm_P` rendered as `<ItemList>` (`[data-view="list"]`). |
> | **When** | UI gesture: click `[data-testid="navbar-layout-toggle"]`. |
> | **Then** | The same `itm_P` re-renders as `<Board>` (`[data-view="board"]`); URL search param `?view=board` is appended; subsequent click toggles back to `list`. |
> | **Side effects** | `PATCH /items/itm_P/preferences` body `{ "View":"board" }` (or list, on toggle back). |
> | **Request body** | `{ "View":"board" }` |
> | **Response envelope** | `{ "Status":200, "Attributes":{}, "Results":[ { "Id":"itm_P", "View":"board" } ] }` |
> | **Negative assertion** | The toggle MUST NOT navigate away from `itm_P`; zoom history is unchanged. |

---

## Page content + interactions

### `AT-APP-11` — Recursive render

> | Slot | Value |
> |------|-------|
> | **Given** | `itm_P` has children `itm_A` (with sub-children `itm_A1`, `itm_A2`) and `itm_B` (leaf). |
> | **When** | Render `<ItemList parentId="itm_P">`. |
> | **Then** | DOM tree: `<ItemList>` → `<ItemRow id="itm_A">` (containing `<ItemList>` → `<ItemRow id="itm_A1">`, `<ItemRow id="itm_A2">`), `<ItemRow id="itm_B">`. Indentation is `margin-left: depth × 24px` (visual only, no extra DOM nesting beyond the recursion). |
> | **Side effects** | none |
> | **Negative assertion** | No flat-table render (`<table>` siblings only) — recursion is structural, not visual-only. |

### `AT-APP-12` — Enter key creates sibling

> | Slot | Value |
> |------|-------|
> | **Given** | `itm_A` content `"hello"`, caret at offset 5 (end). |
> | **When** | UI gesture: focus `<ItemRow id="itm_A">`, dispatch `keydown {key:"Enter"}`. |
> | **Then** | New sibling `itm_B` appears immediately after `itm_A` with `Content:""`; caret moves into `itm_B`. Variant: when `itm_A` has empty content AND caret offset 0, the new sibling is inserted **before** `itm_A` instead. |
> | **Side effects** | `POST /wp-json/workflowy/v1/items` body `{ "ParentId":"<root>", "AfterSiblingId":"itm_A", "Content":"" }`; SSE frame `{ "Event":"item.created", "Id":"itm_B" }` on the page channel. |
> | **Request body** | `{ "ParentId":"itm_root", "AfterSiblingId":"itm_A", "Content":"" }` |
> | **Response envelope** | `{ "Status":201, "Attributes":{}, "Results":[ { "Id":"itm_B", "ParentId":"itm_root", "Content":"", "FractionalIndex":"a1" } ] }` |
> | **Negative assertion** | `itm_A` content unchanged; no row inserted at the END of the parent's child list (insertion is positionally adjacent). |

### `AT-APP-13` — Tab indent / Shift+Tab outdent

> | Slot | Value |
> |------|-------|
> | **Given** | Parent `itm_P` has children `itm_A (FractionalIndex="a0")`, `itm_B (FractionalIndex="a1")` (both at depth 1). |
> | **When** | Focus `itm_B`, dispatch `keydown {key:"Tab"}`. |
> | **Then** | `itm_B.ParentId` becomes `itm_A`; `itm_B.FractionalIndex` is recomputed (e.g. `"a0"`) under the new parent; `itm_A` and remaining siblings are NOT renumbered. Subsequent `keydown {key:"Tab", shiftKey:true}` outdents `itm_B` back under `itm_P`. |
> | **Side effects** | `PATCH /items/itm_B/move` body `{ "NewParentId":"itm_A" }`; SSE frame `{ "Event":"item.moved", "Id":"itm_B", "NewParentId":"itm_A" }`. |
> | **Request body** | `{ "NewParentId":"itm_A" }` |
> | **Response envelope** | `{ "Status":200, "Attributes":{}, "Results":[ { "Id":"itm_B", "ParentId":"itm_A", "FractionalIndex":"a0" } ] }` |
> | **Negative assertion** | No bulk re-numbering: zero `UPDATE Item SET FractionalIndex` rows fired for any sibling other than `itm_B`. |

### `AT-APP-14` — Drag preview shows entire subtree

> | Slot | Value |
> |------|-------|
> | **Given** | `itm_A` has 3 descendants (`itm_A1`, `itm_A1a`, `itm_A2`). |
> | **When** | UI gesture: `pointerdown` on `<ItemRow id="itm_A">` drag handle, then `pointermove` to start the drag. |
> | **Then** | The drag-image element (`[data-drag-preview]`) contains a rendered snapshot of `itm_A` AND all 3 descendants (visible `<ItemRow>` count inside the preview = 4). |
> | **Side effects** | none until drop; on drop, a single `PATCH /items/itm_A/move` is fired (the subtree moves atomically because the children reference `ParentId:itm_A`). |
> | **Negative assertion** | The drag preview MUST NOT contain only the `itm_A` row — the descendants must be visible (verifies the user-perceived "you are moving a whole branch" affordance). |

---

## Continuation

`AT-APP-15..107` (per-item ⋮ menu, multi-select, trash, mirrors, today, templates, concurrency, roles, share, dashboard, B-batch addendums, search ranking) are queued for the next `next` call (still inside P2a).
