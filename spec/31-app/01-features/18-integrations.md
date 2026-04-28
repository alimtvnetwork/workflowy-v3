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

Zapier polls every 5 minutes by default (Zapier-controlled). The `since` query parameter is an ISO-8601 timestamp; the server MUST return only rows with `updated_at > since` and MUST sort ascending by `updated_at` to give Zapier a stable cursor.

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

## Acceptance-Criteria Stub

Concrete `AT-INT-*` rows land in this section's `97-acceptance-criteria.md` during P2. Reserved range:

| Surface | Planned AT-INT-* range |
|---|---|
| PAT issuance / revocation | AT-INT-01..03 |
| Zapier triggers (5) | AT-INT-04..08 |
| Zapier actions (5) | AT-INT-09..13 |
| Apple Shortcuts gallery (5) | AT-INT-14..18 |
| Rate-limiting + idempotency + audit | AT-INT-19..21 |

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
