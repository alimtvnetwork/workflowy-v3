# Template Application Flow

> **Version:** 1.2.0
> **Created:** 2026-04-26 (UTC+8) — APP-FIX-12 (closes audit F-10)
> **Updated:** 2026-04-30 — **F-AUD42-17 (HIGH)**: pinned cross-DB crash/idempotency contract (added §Crash Contract with C1–C5 crash points, idempotency-key write-ahead rule, AT-WF-TEMPLATE-05..08, gate `G-WF-TEMPLATE-IDEMPOTENCY-WAL`). Removed residual `5 s poll` reference in failure-modes table per ADR-0025 (SSE-only). Prior: 2026-04-30 — F-AUD42-09 PascalCase'd request body (`AsMirror?: boolean`). Prior: 2026-04-26 — v1.1.0 added canonical `AT-APP-NN` mapping column.
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
                body: { ParentItemId: P.ItemId, AsMirror?: boolean }   // PascalCase per ADR-0019; `boolean` per strict TS
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
| SSE broadcast fails (network drop between commit and `:hb`) | (n/a) | Per ADR-0025, peers reconnect to the SSE endpoint with `Last-Event-Id: {cursor}` and the server replays missed events (including the `items.bulkInserted` from this flow) — see [`14-concurrency-and-sync.md`](../01-features/14-concurrency-and-sync.md) §14.5.4. **Polling is forbidden** (`G-25-SSE-ONLY-NO-POLL`). |

---

## Idempotency

The client generates a UUIDv7 `ApplyToken` and sends it as `X-WorkFlowy-Idempotency-Key`. The server stores `(ApplyToken → first-success ItemId set + Status + ResponseBodyHash)` in App DB table `IdempotencyKey` for **24 h**. Replays return the **byte-identical** original 200 response without re-inserting (the response body is reconstructed from `ResponseBodyHash` → cached body blob; if the blob has been GC'd, the server recomputes from the `ItemId set` and verifies the hash matches before returning).

**Key uniqueness:** `(UserId, ApplyToken)` is the primary key on `IdempotencyKey`. A replay with a different `UserId` for the same `ApplyToken` is treated as a fresh request (different caller).

**Token format:** `ApplyToken` MUST be a UUIDv7 (timestamp-prefix); the server rejects non-v7 tokens with `ERR_INVALID_IDEMPOTENCY_KEY` to (a) make the 24 h GC sweep cheap (range delete by timestamp prefix) and (b) prevent collision with reserved/legacy tokens `[gate: G-WF-TEMPLATE-IDEMPOTENCY-V7]`.

---

## Crash Contract (added 2026-04-30 per F-AUD42-17)

> **Why this section:** the apply spans two SQLite databases (Root DB for the `Template` row, App DB for the materialized `Items`) plus an SSE emission and an idempotency-key row. SQLite has no XA/2PC — a process crash between any two of those steps must leave the system in a recoverable, observable state. This section enumerates every crash point, its blast radius, and the recovery action.

### Step labels (re-numbering §Sequence for crash analysis)

| Label | Spans | Operation |
|-------|-------|-----------|
| **R1** | 4a–4c | Auth check + Root DB read of `SnapshotJson` (read-only, no write) |
| **W0** | (new, between 4d and 4e) | **Write-ahead** insert of `IdempotencyKey` row with `Status='in_flight'`, `ItemIds=NULL`, `StartedAt=serverNow`, `ApplyToken`, `UserId`, `WorkspaceId`, `ParentItemId`, `TemplateId` — committed in its own short transaction on App DB |
| **A1** | 4e–4j | App DB `BEGIN; INSERT batch; COMMIT;` of materialized `Items` |
| **W1** | (new, immediately after 4j commit) | App DB `UPDATE IdempotencyKey SET Status='committed', ItemIds=…, ResponseBodyHash=…, CommittedAt=serverNow WHERE …` — committed in its own short transaction |
| **S1** | 5 | SSE emission of `items.bulkInserted` |
| **C1** | 6 | Client receives 200 + ItemId set |

### Crash points & recovery

| Crash | Location | State after crash | Recovery on retry (same `ApplyToken`) |
|-------|----------|-------------------|--------------------------------------|
| **C1** | During R1 (read of Root DB) | Nothing written. | Retry executes R1..C1 fresh. **Safe.** |
| **C2** | After W0, before A1 commit | `IdempotencyKey.Status='in_flight'` exists; no `Items` rows. | Server detects `Status='in_flight'` AND `StartedAt < serverNow - 60 s` AND no rows in `Items` matching `(WorkspaceId, ParentItemId, CreatedBy=UserId, CreatedAt > StartedAt - 5 s)` → marks key `Status='failed_recoverable'` and re-runs A1..W1..S1. The 60 s grace prevents two in-flight workers from racing. |
| **C3** | After A1 commit, before W1 commit | `Items` rows exist; `IdempotencyKey.Status='in_flight'`. **This is the load-bearing case.** | Server detects `Status='in_flight'` AND finds `Items` rows matching the deterministic fingerprint `(WorkspaceId, ParentItemId, CreatedBy=UserId, CreatedAt ∈ [StartedAt, StartedAt + 60 s])` AND row count matches the snapshot's `len(InsertRows)`. If all three match → server **adopts** the orphan rows: `UPDATE IdempotencyKey SET Status='committed', ItemIds=<the found IDs>, ResponseBodyHash=…, CommittedAt=serverNow`. Then proceeds to S1. **No duplicate insert.** If fingerprint is ambiguous (count mismatch, or rows exist but `CreatedBy≠UserId`) → server returns `ERR_APPLY_AMBIGUOUS_RECOVERY` (HTTP 409) and surfaces an admin alert — manual reconciliation required. `[gate: G-WF-TEMPLATE-IDEMPOTENCY-WAL]` |
| **C4** | After W1 commit, before S1 | `IdempotencyKey.Status='committed'`; `Items` rows exist; SSE not yet emitted. | Retry returns the cached 200 immediately (the user's optimistic state is already correct). The missed SSE event is replayed to peers via the `Last-Event-Id` resume path on their next reconnect (per ADR-0025 §14.5.4) — no separate redelivery hook is needed because the row write itself is already in the per-`(UserId, WorkspaceId)` event log that SSE replays from. |
| **C5** | After S1, before C1 | All server state correct; client never received the response. | Retry returns the cached 200. Idempotent. |

### Invariants enforced by the crash contract

1. **Write-ahead idempotency** `[gate: G-WF-TEMPLATE-IDEMPOTENCY-WAL]`: the `IdempotencyKey` row with `Status='in_flight'` MUST be committed BEFORE A1 begins. A handler that opens A1 without first committing W0 is a bug — the C3 recovery path depends on the row's existence as a tombstone.
2. **Deterministic row fingerprint** `[gate: G-WF-TEMPLATE-CREATEDBY-STAMP]`: every materialized row stamped at step 4h MUST set `CreatedBy = $userId` and `CreatedAt = serverNow` so the C3 fingerprint can find them. Forbidden: stamping `CreatedBy = 'system'` or omitting `CreatedAt`.
3. **No SSE before W1** `[gate: G-WF-TEMPLATE-NO-SSE-BEFORE-WAL-COMMITTED]`: S1 MUST run after W1 commits. Emitting SSE while `IdempotencyKey.Status='in_flight'` would broadcast a row whose canonical existence is not yet durable — peers could observe a phantom on a subsequent crash-recovery rollback (which cannot happen by §Sequence step 4j, but the gate is asserted defensively against future refactors).
4. **24 h GC** `[gate: G-WF-TEMPLATE-IDEMPOTENCY-GC]`: a daily WP-Cron sweep deletes `IdempotencyKey` rows where `CommittedAt < now() − 24 h` OR `Status='failed_recoverable' AND StartedAt < now() − 1 h`. Range-delete by `ApplyToken` UUIDv7 timestamp prefix keeps the sweep O(deleted), not O(table).

### Storage addendum — `IdempotencyKey` table (App DB)

```sql
CREATE TABLE IdempotencyKey (
  ApplyToken           TEXT    NOT NULL,             -- UUIDv7
  UserId               INTEGER NOT NULL,             -- logical FK to Root.User
  WorkspaceId          INTEGER NOT NULL,
  ParentItemId         TEXT    NOT NULL,             -- branded ItemId at the wire
  TemplateId           TEXT    NOT NULL,
  Status               TEXT    NOT NULL CHECK (Status IN ('in_flight','committed','failed_recoverable')),
  ItemIds              TEXT,                         -- JSON array of new ItemIds; NULL while in_flight
  ResponseBodyHash     TEXT,                         -- SHA-256 of canonical 200 body; NULL while in_flight
  StartedAt            TEXT    NOT NULL,             -- ISO-8601 UTC
  CommittedAt          TEXT,                         -- ISO-8601 UTC; NULL while in_flight
  PRIMARY KEY (UserId, ApplyToken)
);
CREATE INDEX IdxIdempotencyKey_StartedAt ON IdempotencyKey(StartedAt);
CREATE INDEX IdxIdempotencyKey_Status_StartedAt ON IdempotencyKey(Status, StartedAt);
```

> **Note:** the table lives in App DB (per-workspace), not Root DB, so the C3 fingerprint check is a single-DB query — no cross-DB join, consistent with §Cross-DB rule.

---

## Forbidden in implementations

- ❌ Reading `SnapshotJson` and the target App DB in the same SQL statement (no cross-DB joins — see `13-templates.md` §Storage).
- ❌ Hard-coding the cap from `OptionNameType::TEMPLATE_MAX_PER_WORKSPACE`.
- ❌ Skipping `Auth::hasRole()` — the client cannot be trusted to pre-filter.
- ❌ Emitting SSE before the COMMIT succeeds (could broadcast a phantom row).

---

## Acceptance Tests (canonical)

| ID | Canonical | Source | Scenario | Expected |
|----|-----------|--------|----------|----------|
| `AT-WF-TEMPLATE-01` | `AT-APP-43` | This flow | User with `View` only on parent applies template | 403; no Items inserted |
| `AT-WF-TEMPLATE-02` | `AT-APP-44` | This flow | Successful apply | New tree visible locally; SSE event reaches peers within 1 s on healthy SSE |
| `AT-WF-TEMPLATE-03` | `AT-APP-45` | This flow | Apply replayed with same `X-WorkFlowy-Idempotency-Key` within 24 h | 200 with original ItemId set; no duplicate rows |
| `AT-WF-TEMPLATE-04` | `AT-APP-46` | This flow | App-DB INSERT fails mid-batch | ROLLBACK; client receives 500; SSE NOT emitted |

> ✅ **Backfilled into canonical** (2026-04-26, polish #2): each `AT-WF-TEMPLATE-NN` now maps 1:1 to an `AT-APP-NN` row in [`spec/31-app/97-acceptance-criteria.md`](../97-acceptance-criteria.md). The `AT-WF-*` IDs remain as a flow-scoped alias for traceability inside this file; the canonical column is authoritative.

---

## Related

- [`01-keyboard-shortcuts.md`](./01-keyboard-shortcuts.md) — keyboard entry points to the picker
- [`03-share-invite-flow.md`](./03-share-invite-flow.md) — sister cross-feature flow
- [`04-trash-restore-flow.md`](./04-trash-restore-flow.md) — sister cross-feature flow
- [`../01-features/13-templates.md`](../01-features/13-templates.md) — feature-level SSOT
- [`../01-features/14-concurrency-and-sync.md`](../01-features/14-concurrency-and-sync.md) — LWW + SSE semantics
- [`../01-features/15-roles-and-permissions.md`](../01-features/15-roles-and-permissions.md) — `Auth::hasRole()` contract
