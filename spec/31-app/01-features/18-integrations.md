# Integrations — Zapier & Apple Shortcuts (F6)

> **Version:** 1.0.0
> **Created:** 2026-04-28 (UTC+8)
> **Status:** Active — Workflowy product feature list, merged lossless
> **Parent:** [`./00-overview.md`](./00-overview.md)

---

## Keywords

`integrations` · `zapier` · `apple-shortcuts` · `automation` · `webhook` · `personal-access-token` · `pat` · `oauth` · `triggers` · `actions`

---

## Scoring

| Criterion | Status |
|-----------|--------|
| `00-overview.md` present | ✅ (parent) |
| AI Confidence assigned | ✅ |
| Ambiguity assigned | ✅ |
| Keywords present | ✅ |
| Scoring table present | ✅ |
| AI Confidence (auto-backfill) | Medium |
| Ambiguity (auto-backfill) | Medium |

---

## Workflowy Feature Reference (F6) — Integrations

> **Source:** Workflowy product feature list, merged 2026-04-28 (lossless, additive). Reproduced verbatim. All integration endpoints follow the canonical PascalCase envelope (`Status`, `Attributes`, `Results`; optional `Navigation`, `Errors`, `MethodsStack`) per [`spec/04-database-conventions/06-rest-api-format/`](../../04-database-conventions/06-rest-api-format/00-overview.md). Backend hosting follows `mem://constraints/backend-runtime-deferred` (WordPress plugin + PHP 8.1 + SQLite + REST).

### 1. Authentication for integrations

Both integrations below authenticate via a **Personal Access Token (PAT)** issued from *Settings → Integrations → Personal Access Tokens*. PATs are passed in the `Authorization: Bearer <token>` header.

- **Personal Access Token** — A scoped, revocable bearer token. Each token has: a user-supplied label, a scope set (subset of `read:items`, `write:items`, `read:comments`, `write:comments`), an optional expiry timestamp, and a one-time display of the secret at creation. Stored hashed in `UserPersonalAccessToken` (PK `TokenId`, FK `UserId`, columns `Label`, `Scopes`, `ExpiresAt`, `LastUsedAt`, `RevokedAt`). (component: `pat-list-panel`, `pat-create-dialog`)
- **PAT Revocation** — One-click *Revoke* in the PAT list. Sets `RevokedAt`; subsequent requests carrying the token return `401 Unauthorized` with `Errors[0].Code = "AB-AUTH-PAT-REVOKED"`.

> **Why PAT and not OAuth (v1):** OAuth provider flow is explicitly out of scope (see [`spec/36-user-management/00-overview.md`](../../36-user-management/00-overview.md) §Out of Scope). PATs satisfy both Zapier (custom-app PAT field) and Apple Shortcuts (header injection) without an OAuth dance. F7 candidate: revisit when an external OAuth surface is added.

### 2. Zapier Integration

- **Zapier Integration** — Workflowy publishes a Zapier app exposing the triggers and actions listed below. Users connect a Zap by pasting a PAT created in §1. (component: documented in Zapier's app directory; nothing to render in-app beyond the *Get Zapier App* button under *Settings → Integrations*)

#### Triggers (Zapier-side: "When …")

| Trigger | Fires when … | REST polling endpoint |
|---|---|---|
| **New Item Created** | An item is added anywhere in the user's tree. | `GET /wp-json/workflowy/v1/integrations/items?since={iso8601}` |
| **Item Completed** | A `todo` item transitions to `completed=true`. | `GET /wp-json/workflowy/v1/integrations/items/completed?since={iso8601}` |
| **Item Tagged** | A `#tag` is added to any item; can be filtered to a specific tag literal. | `GET /wp-json/workflowy/v1/integrations/items/tagged?tag={literal}&since={iso8601}` |
| **New Comment** | A comment (or reply) is posted on any item the user owns. | `GET /wp-json/workflowy/v1/integrations/comments?since={iso8601}` |
| **Date Reached** | An item's date chip resolves to "today" in the user's TZ. | `GET /wp-json/workflowy/v1/integrations/items/dated-today` |

#### Actions (Zapier-side: "Then …")

| Action | Effect | REST endpoint |
|---|---|---|
| **Create Item** | Insert a new item under a chosen parent (default: user's root). | `POST /wp-json/workflowy/v1/integrations/items` |
| **Append to Item** | Add the action input as a new child of a specified item id. | `POST /wp-json/workflowy/v1/integrations/items/{ParentId}/children` |
| **Complete To-Do** | Set `completed=true` on a `todo` item. | `PATCH /wp-json/workflowy/v1/integrations/items/{ItemId}` |
| **Add Tag** | Append a `#tag` literal to an item's content. | `PATCH /wp-json/workflowy/v1/integrations/items/{ItemId}/tags` |
| **Add Comment** | Post a top-level comment on an item. | `POST /wp-json/workflowy/v1/integrations/items/{ItemId}/comments` |

#### Polling cadence

(gate **G-23-DATA-ROUTER-API**) Zapier polls every 5 minutes by default (Zapier-controlled). The `since` query parameter is an ISO-8601 timestamp; the server MUST return only rows with `updated_at > since` and MUST sort ascending by `updated_at` to give Zapier a stable cursor.

### 3. Apple Shortcuts Integration

- **Apple Shortcuts Integration** — Workflowy ships a public Shortcuts gallery containing pre-built shortcuts that call the same `/wp-json/workflowy/v1/integrations/*` endpoints from §2. Each gallery shortcut prompts the user once for their PAT and stores it in the iOS Keychain. (component: link surface only — *Settings → Integrations → Open Apple Shortcuts Gallery*)

#### Bundled gallery shortcuts (v1)

| Shortcut | What it does |
|---|---|
| **Add to WorkFlowy** | iOS share-sheet target; appends the shared text/URL/photo as a new child of a user-chosen parent item. |
| **Quick Capture** | Voice / text quick-capture; creates a new bullet under a configured "Inbox" parent item. |
| **Today's WorkFlowy To-Dos** | Returns the list of today-dated `todo` items as a Shortcuts result, suitable for Siri / lock-screen widgets. |
| **Complete Last Captured** | Marks the most recently created item as complete. |
| **Append to "Daily Log"** | Appends a timestamped child to a user-configured daily-log item. |

> Each gallery entry calls one of the §2 REST endpoints — the shortcut is essentially a Shortcuts-formatted HTTP request with the user's PAT in the `Authorization` header.

### 4. Common contracts

- **Rate limiting** — Integration endpoints share a per-PAT bucket: 60 requests/minute (burst 120). Exceeding the bucket returns `429 Too Many Requests` with `Errors[0].Code = "AB-RATE-LIMIT"` and `Retry-After` header.
- **Idempotency** — Action endpoints accept an optional `Idempotency-Key` header (UUID). Repeats with the same key within 24 h return the original response without side-effects.
- **Audit** — Every integration request is logged to the activity feed (see [`../../34-activity-feed/`](../../34-activity-feed/00-overview.md)) with `Source = "Integration"` and the PAT label.

---

## Inputs

| Field | Type | Source | Required | Notes |
|-------|------|--------|----------|-------|
| `Authorization` header | `string` (`Bearer <PAT>`) | HTTP request | Yes | PAT issued in Settings → Integrations. |
| `Idempotency-Key` header | `string` (UUID) | HTTP request | No | Repeats within 24 h return cached response. |
| `since` query param | ISO-8601 timestamp | Zapier polling cursor | Yes (triggers) | Server filters `updated_at > since`. |
| `tag` query param | `string` (literal `#tag`) | Zapier "Item Tagged" config | Yes (that trigger) | Exact-match filter. |
| `ParentId` path param | `int` (Item PK) | "Append to Item", "Add Comment" | Yes | Must be owned by the PAT's user. |
| `ItemId` path param | `int` (Item PK) | "Complete To-Do", "Add Tag" | Yes | Same ownership check. |
| Request body (Create/Append) | JSON `{ Content, ItemType?, ParentId? }` | Zapier action / Shortcut | Yes | Defaults: `ItemType=bullet`, `ParentId=user root`. |
| PAT scope set | `Scopes` enum subset | `UserPersonalAccessToken.Scopes` | Yes | Endpoint enforces `read:items` / `write:items` / `read:comments` / `write:comments`. |

## Outputs

| Output | Persisted? | Channel | Notes |
|--------|-----------|---------|-------|
| New `Item` row | ✅ DB | SQLite `Item` table | Fires `item:created` event into the activity feed. |
| Updated `Item.completed` / `Item.content` | ✅ DB | SQLite `Item` table | Fires `item:updated`; LWW per `mem://features/offline-resilience`. |
| New `Comment` row | ✅ DB | SQLite `Comment` table | Fires `comment:created`; surfaces in `Trigger: New Comment` next poll. |
| `UserPersonalAccessToken.LastUsedAt` bump | ✅ DB | SQLite | Updated on every authenticated request. |
| Activity-feed entry | ✅ DB | `ActivityEvent` table | `Source = "Integration"`, `PatLabel = <label>`. |
| HTTP response envelope | ❌ | REST | PascalCase: `Status`, `Attributes`, `Results`, optional `Errors` / `Navigation`. |
| `429` response on rate-limit breach | ❌ | REST | `Errors[0].Code = "AB-RATE-LIMIT"`, `Retry-After` header. |
| `401` response on revoked PAT | ❌ | REST | `Errors[0].Code = "AB-AUTH-PAT-REVOKED"`. |

## Edge Cases

1. PAT revoked between polling cycles — first request after revocation returns `401 AB-AUTH-PAT-REVOKED`; Zapier disables the Zap automatically.
2. PAT scope insufficient for the endpoint — server returns `403 AB-AUTH-SCOPE-MISSING`, listing the missing scope.
3. PAT expired (past `ExpiresAt`) — server returns `401 AB-AUTH-PAT-EXPIRED`; user must re-issue.
4. Idempotency-Key replay — second request with the same key + same body returns cached `Status` and `Results` without re-running side-effects; same key + different body returns `409 AB-IDEMP-CONFLICT`.
5. Rate-limit breach — server returns `429 AB-RATE-LIMIT` with `Retry-After`; Zapier honours the header before next poll.
6. `ParentId` references an item the PAT's user does not own — `404 AB-ITEM-NOT-FOUND` (never `403`, to avoid leaking existence).
7. `ParentId` references an item in Trash — `409 AB-ITEM-TRASHED`; integration must restore first.
8. `ItemId` for "Complete To-Do" is not of type `todo` — `409 AB-ITEM-WRONG-TYPE`.
9. Date-Reached trigger fires on a date chip in a user TZ that has not yet rolled over for the server clock — server uses the user's stored TZ, not server-local.
10. New-Comment trigger on an item shared **with** the user (not owned) — included only if PAT scope contains `read:comments` AND the share grants `view` on the item.
11. Apple Shortcut gallery entry runs offline — the shortcut surfaces an iOS error; no client-side queue (offline write queue is browser-only per `mem://features/offline-resilience`).
12. Tag filter on "Item Tagged" trigger uses leading `#` inconsistently — server normalises (strip leading `#`) before comparison.

## Acceptance Tests

| ID | Given | When | Then | testid |
|----|-------|------|------|--------|
| AT-INT-01 | A user has zero PATs | They open *Settings → Integrations → PATs* and submit Label `"Zapier"` with scopes `read:items, write:items` | A new row appears with the secret displayed exactly once; `UserPersonalAccessToken.RevokedAt IS NULL` | `pat-create-dialog` |
| AT-INT-02 | An active PAT exists | The user clicks *Revoke* | `RevokedAt` is set; the next request carrying the token returns `401 AB-AUTH-PAT-REVOKED` | `pat-revoke-button` |
| AT-INT-03 | A PAT was created with `ExpiresAt = now + 1 day` | 25 h later, an integration calls any endpoint | Response is `401 AB-AUTH-PAT-EXPIRED` | — |
| AT-INT-04 | Two new items were created at `t0` and `t1` (`t0 < t1`) | Zapier polls `GET /integrations/items?since=t0-1s` | Response `Results` contains both items, sorted ascending by `updated_at` | — |
| AT-INT-05 | A `todo` item flips to `completed=true` at `t2` | Zapier polls `/integrations/items/completed?since=t2-1s` | Response `Results` contains exactly that item | — |
| AT-INT-06 | An item gains tag `#ops` | Zapier polls `/integrations/items/tagged?tag=ops&since=…` | Response `Results` includes the item; same poll with `tag=marketing` does not | — |
| AT-INT-07 | A new comment is posted on an owned item | Zapier polls `/integrations/comments?since=…` | Response `Results` contains the comment with author + body | — |
| AT-INT-08 | An item has a date chip resolving to today in the user's TZ | Zapier polls `/integrations/items/dated-today` | Response `Results` includes that item; items with tomorrow's chip are excluded | — |
| AT-INT-09 | A valid PAT with `write:items` scope | `POST /integrations/items` with `{ Content: "X" }` | New `Item` row created under user root; response `Results.ItemId` returned | — |
| AT-INT-10 | An item with id `42` exists | `POST /integrations/items/42/children` with `{ Content: "child" }` | New child created under item 42; sort key placed at end | — |
| AT-INT-11 | `todo` item id `7` with `completed=false` | `PATCH /integrations/items/7` with `{ Completed: true }` | Item flips; `Trigger: Item Completed` fires on next Zapier poll | — |
| AT-INT-12 | Item id `9` with content `"plan"` | `PATCH /integrations/items/9/tags` with `{ Add: ["#ops"] }` | Item content becomes `"plan #ops"` (idempotent if tag already present) | — |
| AT-INT-13 | Item id `5` exists | `POST /integrations/items/5/comments` with `{ Body: "hi" }` | New `Comment` row anchored to item 5 | — |
| AT-INT-14 | iOS share-sheet | User invokes "Add to WorkFlowy" with text "buy milk" | A new bullet "buy milk" appears under the user-configured parent | — |
| AT-INT-15 | Configured Inbox parent | "Quick Capture" is invoked with voice input "call mom" | New child created under Inbox parent | — |
| AT-INT-16 | 3 `todo` items dated today | "Today's WorkFlowy To-Dos" runs | Returns exactly those 3 items as Shortcuts result list | — |
| AT-INT-17 | A bullet was just created via "Quick Capture" | "Complete Last Captured" runs | The most-recent item (by `created_at`) is set `completed=true` | — |
| AT-INT-18 | Configured Daily Log item | "Append to Daily Log" runs at 14:05 with "lunch with X" | New child appears with content prefixed `[14:05] lunch with X` | — |
| AT-INT-19 | A PAT has used 60/60 of its bucket within 60 s | The 61st request arrives | Response `429 AB-RATE-LIMIT` with `Retry-After` header ≥ 1 s | — |
| AT-INT-20 | A request with `Idempotency-Key=K` succeeds | A second request with the same key + same body arrives within 24 h | Response is byte-identical to the first; no second `Item` row | — |
| AT-INT-21 | Any integration request succeeds | Activity feed is read | An `ActivityEvent` row with `Source = "Integration"` and `PatLabel = <label>` exists | — |

> See the planned `97-acceptance-criteria.md` (P2 work) for the canonical AT-INT-* index.

## Component Contract

> No browser components — this feature lives entirely in PHP REST controllers + the iOS Shortcuts app. The "components" below are the planned PHP controller classes and the in-app PAT manager UI from F5.

| Surface | Component path | `data-testid` | Acceptance tests |
|---------|------------------------|---------------|------------------|
| PAT manager (list) | `src/components/settings/PatListPanel.tsx` | `pat-list-panel` | AT-INT-02 |
| PAT create dialog | `src/components/settings/PatCreateDialog.tsx` | `pat-create-dialog` | AT-INT-01 |
| PAT revoke button | `src/components/settings/PatRevokeButton.tsx` | `pat-revoke-button` | AT-INT-02 |
| Zapier integrations REST controller | `wp-plugin/src/Rest/Integrations/ItemsController.php` | — | AT-INT-04..06, AT-INT-08..12 |
| Zapier comments controller | `wp-plugin/src/Rest/Integrations/CommentsController.php` | — | AT-INT-07, AT-INT-13 |
| PAT auth middleware | `wp-plugin/src/Auth/PersonalAccessTokenAuth.php` | — | AT-INT-01..03 |
| Rate-limit middleware | `wp-plugin/src/Middleware/RateLimitPerPat.php` | — | AT-INT-19 |
| Idempotency middleware | `wp-plugin/src/Middleware/IdempotencyKey.php` | — | AT-INT-20 |
| Activity-feed sink | `wp-plugin/src/ActivityFeed/IntegrationSink.php` | — | AT-INT-21 |
| Apple Shortcuts gallery (link surface only) | `src/components/settings/ShortcutsGalleryLink.tsx` | `shortcuts-gallery-link` | AT-INT-14..18 |

> Components and PHP classes do not exist yet — paths are the planned implementation order. This table feeds the global component-contract map (M-3).

---

## Acceptance-Criteria Stub (P2 mirror)

The Acceptance Tests above ship inline per the F-template; the canonical AT-INT-* index also lands in [`./97-acceptance-criteria.md`](./97-acceptance-criteria.md) during P2 (one row per AT, with full Given/When/Then narration and source-link). Reserved range is **AT-INT-01..21** (matches the table above).

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Parent overview | [`./00-overview.md`](./00-overview.md) |
| REST envelope | [`../../04-database-conventions/06-rest-api-format/00-overview.md`](../../04-database-conventions/06-rest-api-format/00-overview.md) |
| Endpoint matrix | [`../06-endpoints/00-overview.md`](../06-endpoints/00-overview.md) |
| Backend runtime constraint | [`mem://constraints/backend-runtime-deferred`](mem://constraints/backend-runtime-deferred) |
| User management (PAT storage, OAuth scope) | [`../../36-user-management/00-overview.md`](../../36-user-management/00-overview.md) |
| Account & Settings (Settings → Integrations entry point) | [`../../36-user-management/01-account-and-settings.md`](../../36-user-management/01-account-and-settings.md) |
| Activity feed (audit sink) | [`../../34-activity-feed/00-overview.md`](../../34-activity-feed/00-overview.md) |
| Comments (Fractal Comments triggers) | [`./13-templates.md`](./13-templates.md) F4 appendix |
| Tags / dates (trigger filters) | [`./01-information-model.md`](./01-information-model.md) F1 appendix, [`./10-today-view.md`](./10-today-view.md) F2 appendix |

---

## Related

**In this section:**

- [`./00-overview.md`](./00-overview.md) — Features overview (sidebar inventory + topic index)
- [`./97-acceptance-criteria.md`](./97-acceptance-criteria.md) — `AT-INT-*` IDs (filled in P2)

**See also:**

- [`../../36-user-management/01-account-and-settings.md`](../../36-user-management/01-account-and-settings.md) — Settings panel hosts the *Integrations* entry point and PAT manager (F5)

---

## Settings Surface

- **Persisted booleans introduced by this feature:** None.
- **N/A justification:** Cross-cutting integration index — defers settings to each integration's own surface.
- **Compliance:** Satisfies the MUST in [`00-overview.md:140`](./00-overview.md) by explicit declaration. Any future boo (gate **G-DBNAME-BOOL-POSITIVE-ONLY**)lean added here MUST route through `Sanitizer::bool()` and be enumerated in an `OptionNameType` case (see APP-FIX-05).

---

## Backend Write Surface

- **Routes introduced by this feature:** None.
- **N/A justification:** Cross-cutting index — write surface deferred to each integration's own page.
- **Compliance:** Satisfies F-AUD42-25 (API axis) by explicit declaration. Any future write route added here MUST follow (gate **G-23-DATA-ROUTER-API**) the PascalCase envelope (ADR-0004/0019), egress via queue worker (ADR-0023), and bind to a named error boundary (ADR-0017).
