# Per-Endpoint Universal-Envelope JSON Fixtures

> **Version:** 1.0.0
> **Updated:** 2026-04-28 (UTC+8)
> **Status:** ✅ P3 — REST envelope JSON fixtures per endpoint
> **Parent:** [`./00-overview.md`](./00-overview.md)
> **Matrix:** [`./16-endpoint-at-matrix.md`](./16-endpoint-at-matrix.md)
> **Envelope SSOT:** [`../../04-database-conventions/06-rest-api-format/02-rest-samples.md`](../../04-database-conventions/06-rest-api-format/02-rest-samples.md)

---

## What this file is

For every one of the **47 endpoints** in [`16-endpoint-at-matrix.md`](./16-endpoint-at-matrix.md), this file provides a canonical JSON request/response **envelope fixture** that satisfies `AT-ENV-01`, `AT-ENV-02`, and the per-endpoint AT row.

> **Reading rule:** every fixture below is a *Then* clause for the matching matrix row. The shared envelope shape (`Status`, `Attributes`, `Results`, `Navigation?`, `Errors?`, `MethodsStack?`) is defined once in the SSOT — only fixture-specific fields are commented inline. Omitted optional sections (`Navigation`, `Errors`, `MethodsStack`) MUST be `null` or absent.

---

## Conventions used in every fixture

- **Casing:** PascalCase end-to-end (DB → ORM → JSON → frontend).
- **`Results` is ALWAYS an array** — singletons return `[{...}]`, deletes return `[]`.
- **Timestamps** are ISO-8601 UTC.
- **`Attributes.HasAnyErrors`** is `false` on success, `true` when `Errors` is present.
- **Error fixtures** follow `2.6` in the SSOT (sample reproduced once below; per-endpoint variants only differ in `Status.Code`, `Status.Message`, and `Errors.Backend`).

### Canonical error-shape fixture (applies to every endpoint)

```json
{
  "Status": { "IsSuccess": false, "IsFailed": true, "Code": 4xx_or_5xx, "Message": "<human message>", "Timestamp": "2026-04-28T00:00:00Z" },
  "Attributes": { "RequestedAt": "<url>", "RequestDelegatedAt": "", "HasAnyErrors": true, "IsSingle": false, "IsMultiple": false, "IsEmpty": true, "TotalRecords": 0, "PerPage": 0, "TotalPages": 0, "CurrentPage": 0 },
  "Results": [],
  "Errors": { "BackendMessage": "<...>", "DelegatedServiceErrorStack": [], "Backend": ["file.php:LL Class::method"], "Frontend": [] }
}
```

---

## Items domain (rows 1–11)

### EP-ITEMS-LIST — `GET /items?parent={id}`
**Response (paginated list):**
```json
{
  "Status": { "IsSuccess": true, "IsFailed": false, "Code": 200, "Message": "OK", "Timestamp": "2026-04-28T10:00:00Z" },
  "Attributes": { "RequestedAt": "/items?parent=root&page=1&perPage=50", "RequestDelegatedAt": "", "HasAnyErrors": false, "IsSingle": false, "IsMultiple": true, "IsEmpty": false, "TotalRecords": 12, "PerPage": 50, "TotalPages": 1, "CurrentPage": 1 },
  "Results": [
    { "Id": "01H...", "ParentId": "root", "Content": "Inbox", "ItemType": "Bullet", "Sort": "a0", "IsCompleted": false, "CreatedAt": "2026-04-01T08:00:00Z" },
    { "Id": "01J...", "ParentId": "root", "Content": "Today", "ItemType": "Bullet", "Sort": "a1", "IsCompleted": false, "CreatedAt": "2026-04-02T08:00:00Z" }
  ],
  "Navigation": null
}
```

### EP-ITEMS-GET — `GET /items/{id}`
```json
{
  "Status": { "IsSuccess": true, "IsFailed": false, "Code": 200, "Message": "OK", "Timestamp": "2026-04-28T10:01:00Z" },
  "Attributes": { "RequestedAt": "/items/01H...", "RequestDelegatedAt": "", "HasAnyErrors": false, "IsSingle": true, "IsMultiple": false, "IsEmpty": false, "TotalRecords": 1, "PerPage": 0, "TotalPages": 0, "CurrentPage": 0 },
  "Results": [ { "Id": "01H...", "ParentId": "root", "Content": "Inbox", "ItemType": "Bullet", "Sort": "a0", "IsCompleted": false, "Note": null, "Tags": [], "CreatedAt": "2026-04-01T08:00:00Z", "UpdatedAt": "2026-04-28T10:01:00Z" } ]
}
```

### EP-ITEMS-ROOT — `GET /items/root`
Same as `EP-ITEMS-GET` with `Id: "root"`, `ParentId: null`, `ItemType: "Root"`.

### EP-ITEMS-CREATE — `POST /items`
**Request:** `{ "ParentId": "01H...", "Content": "New task", "ItemType": "Bullet", "AfterSort": "a3" }`
**Response:** `Status.Code: 201`, `Results: [{ "Id": "<new-ulid>", "ParentId": "01H...", "Content": "New task", "ItemType": "Bullet", "Sort": "a4", "IsCompleted": false, "CreatedAt": "2026-04-28T10:02:00Z" }]`, `Attributes.IsSingle: true`.

### EP-ITEMS-UPDATE — `PATCH /items/{id}`
**Request:** `{ "Content": "Renamed", "Note": "extra info" }`
**Response:** `Status.Code: 200`, `Results: [{ "Id": "01H...", "Content": "Renamed", "Note": "extra info", "UpdatedAt": "2026-04-28T10:03:00Z" }]`.

### EP-ITEMS-DELETE — `DELETE /items/{id}` (soft → trash)
**Response:** `Status.Code: 200`, `Status.Message: "Item moved to trash"`, `Results: []`, `Attributes.IsEmpty: true`, `Attributes.TrashedAt: "2026-04-28T10:04:00Z"` (extension field).

### EP-ITEMS-MOVE — `POST /items/{id}/move`
**Request:** `{ "NewParentId": "01J...", "AfterSort": "b2" }`
**Response:** `Results: [{ "Id": "01H...", "ParentId": "01J...", "Sort": "b3", "UpdatedAt": "..." }]`.

### EP-ITEMS-DUPLICATE — `POST /items/{id}/duplicate`
**Response:** `Status.Code: 201`, `Results: [{ "Id": "<new>", "DuplicatedFromId": "01H...", "Content": "Renamed (copy)", ... }]`.

### EP-ITEMS-COMPLETE — `POST /items/{id}/complete`
**Request:** `{ "IsCompleted": true }`
**Response:** `Results: [{ "Id": "01H...", "IsCompleted": true, "CompletedAt": "2026-04-28T10:05:00Z" }]`.

### EP-ITEMS-TURN-INTO — `POST /items/{id}/turn-into`
**Request:** `{ "NewItemType": "Board" }`
**Response:** `Results: [{ "Id": "01H...", "ItemType": "Board", "UpdatedAt": "..." }]`. Error `400` if the type transition is forbidden by the `ItemType` matrix.

### EP-ITEMS-TAGS — `PUT /items/{id}/tags`
**Request:** `{ "Tags": ["#work", "#urgent"] }`
**Response:** `Results: [{ "Id": "01H...", "Tags": ["#work", "#urgent"], "UpdatedAt": "..." }]`.

---

## Views & Trash (rows 12–15b)

### EP-VIEWS-TODAY — `GET /views/today`
List shape (≤ 250 items per `mem://core`); each result row carries `DueDate` and `IsOverdue`.

### EP-TRASH-LIST — `GET /trash`
Each `Results` row has `TrashedAt`, `OriginalParentId`, `DaysUntilPurge` (≤ 30 per `mem://features/trash-logic`).

### EP-TRASH-RESTORE — `POST /trash/{id}/restore`
**Response:** `Results: [{ "Id": "01H...", "ParentId": "<restored-parent>", "RestoredAt": "..." }]`.

### EP-TRASH-PURGE-ONE — `DELETE /trash/{id}` (hard delete)
**Response:** `Results: []`, `Status.Message: "Item permanently deleted"`.

### EP-TRASH-PURGE-ALL — `DELETE /trash`
**Response:** `Results: []`, `Attributes.PurgedCount: <int>`.

---

## Mirrors (rows 16–18, 46–47)

### EP-MIRRORS-CREATE — `POST /mirrors`
**Request:** `{ "SourceId": "01H...", "TargetParentId": "01J..." }`
**Response (per `mem://features/mirroring` peer-group model):** `Results: [{ "MirrorId": "01M...", "GroupId": "G01...", "PeerIds": ["01H...","01M..."], "CreatedAt": "..." }]`.

### EP-MIRRORS-LIST — `GET /mirrors?source={id}`
`Results` is an array of mirror rows in the same group as `source`.

### EP-MIRRORS-DELETE — `DELETE /mirrors/{id}`
**Response:** `Results: []`. If the deletion leaves a singleton group, the group is dissolved (per `mem://features/mirroring`); fixture includes `Attributes.GroupDissolved: true`.

### EP-MIRRORS-GROUP-GET — `GET /items/{id}/mirror-group`
**Response:** `Results: [{ "GroupId": "G01...", "PeerIds": ["01H...","01M..."], "PeerCount": 2 }]`.

### EP-MIRRORS-DETACH — `POST /items/{id}/mirror-detach`
**Response:** `Results: [{ "Id": "01H...", "GroupId": null, "DetachedAt": "..." }]`, `Attributes.GroupDissolved: true|false`.

---

## Shares & Roles (rows 19–23, 38–41)

### EP-SHARES-LIST — `GET /shares?item={id}`
`Results` rows: `{ "ShareId", "ItemId", "PrincipalType": "User"|"Public", "PrincipalId", "Role": "Viewer"|"Editor"|"Owner", "CreatedAt" }`.

### EP-SHARES-INVITE — `POST /shares/invite`
**Request:** `{ "ItemId": "01H...", "Email": "alice@example.com", "Role": "Editor" }`
**Response:** `Status.Code: 201`, `Results: [{ "ShareId": "S01...", "ItemId": "01H...", "PrincipalId": "U02...", "Role": "Editor" }]`.

### EP-SHARES-PUBLIC — `POST /shares/{id}/public`
**Request:** `{ "IsPublic": true, "Role": "Viewer" }`
**Response:** `Results: [{ "ShareId": "S01...", "PublicUrl": "https://.../p/<token>", "Role": "Viewer" }]`.

### EP-SHARES-UPDATE — `PATCH /shares/{id}`
**Request:** `{ "Role": "Viewer" }` → `Results: [{ "ShareId": "S01...", "Role": "Viewer", "UpdatedAt": "..." }]`.

### EP-SHARES-REVOKE — `DELETE /shares/{id}`
`Results: []`.

### EP-ME — `GET /me`
**Response:** `Results: [{ "UserId": "U01...", "Email": "...", "DisplayName": "...", "Roles": ["Owner","Editor"], "WorkspaceIds": ["W01..."] }]`.

### EP-ROLES-LIST — `GET /workspaces/{id}/roles`
`Results` rows: `{ "UserId", "Role": "Owner"|"Editor"|"Viewer", "AssignedAt" }`.

### EP-ROLES-ASSIGN — `POST /workspaces/{id}/roles`
**Request:** `{ "UserId": "U02...", "Role": "Editor" }`
**Response:** `Status.Code: 201`, `Results: [{ "UserId": "U02...", "Role": "Editor", "AssignedAt": "..." }]`. Error `403 ROLE_ESCALATION_DENIED` if caller is not Owner.

### EP-ROLES-REVOKE — `DELETE /workspaces/{id}/roles/{userId}`
`Results: []`.

---

## Board & Bulk (rows 24–29)

### EP-BOARD-GET — `GET /boards/{id}`
**Response:** `Results: [{ "BoardId": "01H...", "Columns": [ { "Id": "c1", "Name": "Todo", "Sort": "a0", "Cards": [ { "Id": "01K...", "Content": "..." } ] } ] }]`.

### EP-BOARD-MOVE — `POST /boards/{id}/cards/move`
**Request:** `{ "CardId": "01K...", "NewColumnId": "c2", "AfterSort": "b1" }` → `Results: [{ "CardId": "01K...", "ColumnId": "c2", "Sort": "b2" }]`.

### EP-BULK-MOVE — `POST /bulk/move`
**Request:** `{ "ItemIds": ["01A...","01B..."], "NewParentId": "01J..." }`
**Response:** `Results: [{ "Id":"01A...","ParentId":"01J..." }, { "Id":"01B...","ParentId":"01J..." }]`, `Attributes.IsMultiple: true`, `Attributes.TotalRecords: 2`.

### EP-BULK-DELETE / EP-BULK-COMPLETE / EP-BULK-TAGS
Same multi-result shape; `Attributes.PartialFailureCount` set when some items fail (still `Status.Code: 207` multi-status, `Errors.Backend` populated per failed id).

---

## Templates (rows 30–34)

### EP-TEMPLATES-LIST — `GET /templates`
Rows: `{ "TemplateId", "Name", "Description", "ItemCount", "CreatedAt" }`.

### EP-TEMPLATES-GET — `GET /templates/{id}`
Single result; includes serialized tree under `Snapshot` (per `mem://features/templates`).

### EP-TEMPLATES-CREATE — `POST /templates`
**Request:** `{ "SourceItemId": "01H...", "Name": "Sprint", "Description": "..." }` → `Status.Code: 201`.

### EP-TEMPLATES-APPLY — `POST /templates/{id}/apply`
**Request:** `{ "TargetParentId": "01J..." }`
**Response:** `Results: [{ "RootItemId": "<new>", "CreatedItemIds": ["...","..."], "ItemCount": N }]`.

### EP-TEMPLATES-DELETE — `DELETE /templates/{id}`
`Results: []`.

---

## Sync & SSE (rows 35–37, 45)

### EP-SYNC-POLL — `GET /sync/poll?cursor={c}`
**Response:** `Results` is an array of mutation events (`{ "EventId", "Type": "ItemUpdated"|"ItemCreated"|..., "ItemId", "Payload": {...}, "OccurredAt" }`); `Attributes.NextCursor` advances.

### EP-SYNC-ACK — `POST /sync/ack`
**Request:** `{ "Cursor": "...", "AckedEventIds": ["E01...","E02..."] }` → `Results: [{ "AckedCount": 2, "ServerCursor": "..." }]`.

### EP-SYNC-STREAM — `GET /sync/stream` (SSE)
Per `AT-SSE-PHP-*`: `Content-Type: text/event-stream`. Each event is the same envelope serialized as one SSE message:
```
event: mutation
data: { "Status": {...}, "Attributes": {...}, "Results": [ { "EventId":"E01...", "Type":"ItemUpdated", ... } ] }
```

### EP-SYNC-REPLAY — `POST /sync/replay`
**Request:** `{ "Operations": [ { "OpId":"O01...", "Type":"create", "Payload":{...}, "OccurredAt":"..." } ] }`
**Response (LWW per `mem://features/offline-resilience`):** `Results: [ { "OpId":"O01...", "Outcome":"applied"|"conflict"|"rejected", "ServerEventId":"E0X..." } ]`, `Attributes.AppliedCount`, `Attributes.ConflictCount`.

---

## Reaper, Search (rows 42–44)

### EP-REAPER-RUN — `POST /admin/trash/reaper/run`
**Request:** `{ "DryRun": false }`
**Response:** `Results: [{ "RunId": "R01...", "PurgedCount": 17, "StartedAt":"...", "FinishedAt":"..." }]`.

### EP-REAPER-RUNS-LIST — `GET /admin/trash/reaper/runs`
Rows: `{ "RunId", "PurgedCount", "StartedAt", "FinishedAt", "TriggeredBy" }`.

### EP-SEARCH-QUERY — `GET /search?q=...`
**Response (relevance-then-recency per `mem://features/search-functionality`):** `Results` is a ranked array with `{ "Id", "Content", "ItemType", "MatchTier": "exact"|"prefix"|"fuzzy", "FieldWeight": <number>, "Score": <number>, "UpdatedAt" }`. `Attributes.TotalRecords` is capped at the 250-item view limit.

---

## Cross-cutting universal-envelope ATs (every fixture above)

Each fixture in this file simultaneously satisfies:

- `AT-ENV-01` — universal envelope with PascalCase keys.
- `AT-ENV-02` — `Status.IsSuccess` / `Status.IsFailed` are mutually exclusive booleans.
- `AT-G19-01` — endpoint identifier comes from the `EndpointType` enum (verified by `scripts/spec-hygiene/29-check-endpoint-matrix-coverage.mjs`).
- `AT-G22-01` — every error fixture's `Status.Code`/`Errors.BackendMessage` pair is in the canonical error-code catalogue.
- `AT-WPROOT-07` — `Attributes.RequestedAt` resolves through `endpoints.json`, never a hardcoded `/wp-json/...`.
- `AT-AUTH-01` — server handler calls `Auth::hasRole($userId, $role)` before producing the success fixture.
- `AT-RATE-01` — the canonical error fixture above is the response when per-tier rate limits are exceeded (`Status.Code: 429`, `Errors.BackendMessage: "Rate limit exceeded"`).

---

## Verification

```bash
# Every endpoint in the matrix is referenced in this file
node scripts/spec-hygiene/29-check-endpoint-matrix-coverage.mjs

# JSON snippets parse
rg -nU '```json([\s\S]*?)```' spec/31-app/06-endpoints/97b-endpoint-envelope-fixtures.md \
  | node -e "const fs=require('fs');const t=fs.readFileSync(0,'utf8');const re=/```json\n([\s\S]*?)```/g;let m,n=0,b=0;while((m=re.exec(t))){n++;try{JSON.parse(m[1])}catch(e){b++;console.error('bad block',n,e.message)}}console.log(n+' blocks, '+b+' invalid')"

# Hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## PHP Serializer Egress Test — `G-26-WIRE-OWNERID-ONLY` enforcement

> **Spec status:** TEST-tier contract (authored 2026-04-28). Closes the runtime half of `G-26-WIRE-OWNERID-ONLY`; the regex half is enforced by the CI grep gate documented in ADR-0026 §D6 + Gate Registry v1.1.1.

### Purpose

ADR-0026 §D6 mandates that every REST/SSE wire payload emit the canonical key `OwnerId` and **never** the DDL spelling `OwnerUserId`. The static gate (regex grep over `spec/31-app/06-endpoints/**`) prevents *spec drift*; this test prevents *runtime drift* — i.e. a future PHP change that bypasses the alias-bridge serializer and emits raw column names.

### Test ID

`AT-WIRE-EGRESS-01` — bound to gate `G-26-WIRE-OWNERID-ONLY` (CI tier).

### Setup contract

| Item | Specification |
|---|---|
| Test runner | PHPUnit 10+ (matches WP-plugin tooling already specified in the backend stack). |
| Fixture DB | An in-memory SQLite database seeded by `spec/31-app/04a-fixtures/generate.py` (the 217-item DDL-mirror artifact). The seed MUST include at least one `Items` row, one `Templates` row, and one `Tags` row — every table whose DDL contains an `OwnerUserId` column. |
| HTTP layer | `WP_REST_Request` instances dispatched through `rest_do_request()`; no live HTTP server required. |
| Auth context | A test user with `wp_set_current_user()`; role grants read on every fixture row. |

### Endpoints exercised (MUST cover all)

The test MUST issue one request per endpoint whose response payload, per the corresponding section above, contains an owner-bearing object. As of v1.0.0 this set is exhaustively:

| Endpoint | Response field carrying owner identity |
|---|---|
| `EP-ITEMS-LIST` | `Results[].OwnerId` (when populated) |
| `EP-ITEMS-GET` | `Results[0].OwnerId` |
| `EP-ITEMS-CREATE` | `Results[0].OwnerId` |
| `EP-ITEMS-UPDATE` | `Results[0].OwnerId` |
| `EP-TEMPLATES-LIST` | `Results.Templates[].OwnerId` |
| `EP-TEMPLATES-GET` | `Results.Template.OwnerId` |
| `EP-TEMPLATES-CREATE` | `Results.Template.OwnerId` |
| `EP-TAGS-LIST` | `Results[].OwnerId` (when scope=mine) |
| `EP-SHARES-LIST` | `Results[].OwnerId` of the shared root |
| `EP-MIRRORS-LIST` | `Results[].OwnerId` of each peer |

The full enumeration MUST be derived programmatically from `16-endpoint-at-matrix.md` so adding a new endpoint does not silently bypass the test (see "Drift guard" below).

### Assertion contract (MUST all hold)

For each endpoint response `R`:

1. **A1 — Canonical key present.** Every object in `R` that originated from a DB row with an `OwnerUserId` column MUST contain a string field named exactly `OwnerId`. JSON path traversal — recursion required because `Results.Templates[]` is two levels deep.
2. **A2 — DDL spelling absent.** A recursive scan of the entire JSON-decoded response (`Status`, `Attributes`, `Results`, `Navigation`, `Errors`, `MethodsStack`) MUST find **zero** keys named `OwnerUserId` — case-sensitive exact match. Any hit fails the test with the JSON path of the offending key.
3. **A3 — Brand shape.** Every emitted `OwnerId` MUST satisfy the ADR-0020 wire regex `^[A-Za-z0-9_-]{8,64}$`. Numeric primary keys (e.g. integer `1` from the DDL-mirror fixture) MUST be rejected — the serializer MUST translate to the opaque-string brand.
4. **A4 — Round-trip stability.** Re-encoding the response JSON and decoding it MUST yield byte-identical key sets (no PHP `stdClass` → `array` rename surprises that swallow the casing check).
5. **A5 — Error envelope.** Trigger one `403`/`404` response per endpoint. Assert A1–A4 still hold on the error envelope (the `Errors.Backend[]` stack trace MAY contain the DDL spelling `OwnerUserId` since stack frames quote raw SQL — the assertion MUST scope the recursive scan to *keys only*, not string values).

### Drift guard

A2 alone is insufficient if a future endpoint forgets to expose owner identity. The test MUST therefore **also** assert:

- **A6 — Coverage parity.** The list of endpoints exercised by this test MUST equal `endpoints_with_owner_column(16-endpoint-at-matrix.md)`. The matrix file is the SSOT; the test reads it at boot and fails if any matrix row marked `Owner: yes` lacks a corresponding test case.

### Failure messages (specified)

When an assertion fails, the test MUST emit:

```
[G-26-WIRE-OWNERID-ONLY] {EndpointId}: forbidden key `OwnerUserId` at JSON path `{path}`.
Fix: route the {Table}.OwnerUserId column through the alias-bridge serializer
     (see ADR-0026 §D2 + §D6, Spec↔DDL Alias Bridge in
     spec/04-database-conventions/00-overview.md).
```

The literal substring `[G-26-WIRE-OWNERID-ONLY]` is mandatory so CI log scrapers can attribute failures to the gate without parsing test names.

### Why this is TEST-tier, not CI-tier

The static regex check (`rg "\bOwnerUserId\s*[:?,}]" spec/31-app/06-endpoints`) is the CI half — it runs in milliseconds in pre-commit and catches *spec* drift. The PHPUnit suite is the TEST half — it catches *runtime* drift where the serializer produces output the spec doesn't predict. Both halves are required because the two failure modes are independent.

### Cross-references

- ADR-0026 §D6 — wire-boundary canonicalisation rule.
- Gate Registry v1.1.1 entry `G-26-WIRE-OWNERID-ONLY` (`spec/_GATE-REGISTRY.md`).
- Spec↔DDL Alias Bridge — `spec/04-database-conventions/00-overview.md`.
- Endpoint AT matrix (drift-guard SSOT) — `./16-endpoint-at-matrix.md`.

---

## Related

- [`./16-endpoint-at-matrix.md`](./16-endpoint-at-matrix.md) — Endpoint → AT matrix (SSOT)
- [`./97-acceptance-criteria.md`](./97-acceptance-criteria.md) — Endpoint-level ATs
- [`../../04-database-conventions/06-rest-api-format/02-rest-samples.md`](../../04-database-conventions/06-rest-api-format/02-rest-samples.md) — Canonical envelope samples (SSOT)
- [`../../04-database-conventions/06-rest-api-format/03-envelope-and-flow.md`](../../04-database-conventions/06-rest-api-format/03-envelope-and-flow.md) — Envelope quick reference
- [`../../04-database-conventions/97a-acceptance-criteria-fixtures.md`](../../04-database-conventions/97a-acceptance-criteria-fixtures.md) — DB-conventions fixtures (P2c)
- [`../../00-adrs/0026-lww-canonical-tiebreak.md`](../../00-adrs/0026-lww-canonical-tiebreak.md) — D6 wire-boundary rule (this section's authority)

---

*Created 2026-04-28 — closes P3 (REST envelope JSON fixtures per endpoint).*
*Amended 2026-04-28 — added PHP serializer egress test spec `AT-WIRE-EGRESS-01` for `G-26-WIRE-OWNERID-ONLY`.*
