# Template Application Flow

> **Version:** 1.0.0
> **Created:** 2026-04-26 (UTC+8) — APP-FIX-12 (closes audit F-10)
> **Status:** Canonical — cross-feature flow
> **Parent:** [`00-overview.md`](./00-overview.md)
> **SSOT for the underlying feature:** [`spec/31-app/01-features/13-templates.md`](../01-features/13-templates.md)

---

## Why this file exists

`01-features/13-templates.md` describes *what* a template is and *what* the apply UI looks like. It does NOT describe the **end-to-end sequence** of "user picks a template → snapshot resolves → items materialize → realtime broadcasts to peers". Without an explicit flow, AI implementers reconstruct the order from feature files and frequently get the Root-DB → App-DB hand-off wrong (cross-DB joins are forbidden — see `13-templates.md` §Storage).

This file pins the sequence. Each step cites the SSOT that governs its rule.

---

## Actors

| Actor | Role |
|-------|------|
| User | Triggers apply via the picker (`Settings → Templates → Apply`) or context menu. |
| Client (React) | Validates selection, sends `POST /api/templates/{TemplateId}/apply`. |
| WP REST handler (PHP) | Authorizes, opens both DBs, performs the materialization. |
| Root DB | Owns `Template` (catalog metadata + `SnapshotJson`). |
| App DB (target workspace) | Receives the materialized `Items` rows. |
| SSE channel | Broadcasts the new items to peers in `(UserId, WorkspaceId)`. |

---

## Preconditions

- User holds at least `Edit` on the target parent item (`Auth::hasRole($userId, 'Edit', 'Item', $parentItemId)` returns `true` — see [`15-roles-and-permissions.md`](../01-features/15-roles-and-permissions.md) §PHP Authorization Helper Contract).
- The template's `WorkspaceId` matches the target workspace (catalog is workspace-scoped per `13-templates.md` §Storage).
- `OptionNameType::TEMPLATE_MAX_PER_WORKSPACE` cap is not exceeded for the resulting children count (read via Settings facade; see `13-templates.md` §Settings Keys).

---

## Sequence

```
1. User clicks "Apply template" on Template T at Item P (parent).
2. If OptionNameType::TEMPLATE_CONFIRM_APPLY is true → show confirm modal.
3. Client → POST /api/templates/{T.TemplateId}/apply
                body: { parentItemId: P.ItemId, asMirror?: bool }
4. PHP handler:
     a. Auth::hasRole($userId, 'Edit', 'Item', P.ItemId) → must be true (else 403).
     b. Open Root DB → SELECT SnapshotJson, WorkspaceId FROM Template WHERE TemplateId = T.
     c. Validate T.WorkspaceId == P.WorkspaceId (else 422).
     d. Close Root DB read; open App DB for that workspace.
     e. BEGIN TRANSACTION on App DB.
     f. Decode SnapshotJson → tree walker emits N InsertRow operations.
     g. For each row: assign new ItemId (UUIDv7); set ParentId per the snapshot's relative tree;
        compute SortOrder via fractional-index strategy below the existing siblings of P.
     h. Stamp every row with CreatedAt = serverNow, CreatedBy = $userId,
        plus per-field LWW columns (<Field>UpdatedAt = serverNow, <Field>UpdatedBy = $userId).
     i. INSERT batch.
     j. COMMIT.
5. Server emits SSE event `items.bulkInserted` on (UserId, WorkspaceId) with
   the list of new ItemIds + ParentId. Peers reconcile per 14-concurrency §14.2.
6. Client receives 200 → optimistic shadow rows replaced with server rows;
   focus moves to the first new item.
```

> **Cross-DB rule:** Steps 4b and 4d are TWO separate transactions. There is NEVER a JOIN across Root DB and App DB. The snapshot is read into PHP memory then expanded into the App DB.

---

## Failure modes

| Failure | HTTP | Recovery |
|---------|------|----------|
| 403 — caller lacks `Edit` on parent | 403 | Client shows toast "You don't have permission to add items here." No DB write attempted. |
| 422 — template's workspace ≠ parent's workspace | 422 | Client refuses; user must pick a template from the same workspace. |
| 409 — `TEMPLATE_MAX_PER_WORKSPACE` would be exceeded | 409 | Modal explains the cap and links to settings. |
| 5xx — App-DB transaction fails mid-insert | 500 | ROLLBACK — no partial tree. SSE event NOT emitted. Client retains optimistic state, shows "Apply failed — retry?" with the same idempotency key. |
| SSE broadcast fails | (n/a) | Peers fall back to 5 s poll of `/api/sync?since={ServerTs}` — see [`14-concurrency-and-sync.md`](../01-features/14-concurrency-and-sync.md) §14.1. |

---

## Idempotency

The client generates a UUIDv7 `ApplyToken` and sends it as `X-WorkFlowy-Idempotency-Key`. The server stores `(ApplyToken → first-success ItemId set)` in App DB for 24 h. Replays return the original 200 + ItemId set without re-inserting.

---

## Forbidden in implementations

- ❌ Reading `SnapshotJson` and the target App DB in the same SQL statement (no cross-DB joins — see `13-templates.md` §Storage).
- ❌ Hard-coding the cap from `OptionNameType::TEMPLATE_MAX_PER_WORKSPACE`.
- ❌ Skipping `Auth::hasRole()` — the client cannot be trusted to pre-filter.
- ❌ Emitting SSE before the COMMIT succeeds (could broadcast a phantom row).

---

## Acceptance Tests (canonical)

| ID | Source | Scenario | Expected |
|----|--------|----------|----------|
| `AT-WF-TEMPLATE-01` | This flow | User with `View` only on parent applies template | 403; no Items inserted |
| `AT-WF-TEMPLATE-02` | This flow | Successful apply | New tree visible locally; SSE event reaches peers within 1 s on healthy SSE |
| `AT-WF-TEMPLATE-03` | This flow | Apply replayed with same `X-WorkFlowy-Idempotency-Key` within 24 h | 200 with original ItemId set; no duplicate rows |
| `AT-WF-TEMPLATE-04` | This flow | App-DB INSERT fails mid-batch | ROLLBACK; client receives 500; SSE NOT emitted |

> These IDs are tracked in [`spec/31-app/97-acceptance-criteria.md`](../97-acceptance-criteria.md) under the `AT-WF-*` namespace (new sub-prefix introduced by APP-FIX-12; backfill into AT-APP canonical pending Phase-2).

---

## Related

- [`01-keyboard-shortcuts.md`](./01-keyboard-shortcuts.md) — keyboard entry points to the picker
- [`03-share-invite-flow.md`](./03-share-invite-flow.md) — sister cross-feature flow
- [`04-trash-restore-flow.md`](./04-trash-restore-flow.md) — sister cross-feature flow
- [`../01-features/13-templates.md`](../01-features/13-templates.md) — feature-level SSOT
- [`../01-features/14-concurrency-and-sync.md`](../01-features/14-concurrency-and-sync.md) — LWW + SSE semantics
- [`../01-features/15-roles-and-permissions.md`](../01-features/15-roles-and-permissions.md) — `Auth::hasRole()` contract
