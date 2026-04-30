# Retention & Export — Sub-Spec

> **Version:** 1.0.0 — authored 2026-04-30
> **Owner section:** `spec/33-feedback-report/`
> **Status:** Draft (P1 — load-bearing for `AT-FEEDBACKREPORT-13..14` and gates `G-33-RE-*`).
> **Parent:** [`./00-overview.md`](./00-overview.md)
> **Siblings (consumed):** [`./01-data-model.md`](./01-data-model.md) (`PurgeAfter` column, `FeedbackReportNote` table) · [`./03-admin-review-ui.md`](./03-admin-review-ui.md) (Admin role gating)

---

## AI Contract

**Purpose** — Define the **90-day retention policy**, the **deterministic purge job** that enforces it, the **GDPR `DeleteMyFeedback(userId)` one-shot operation**, and the **Admin-gated CSV export** for `FeedbackReport`. This sub-spec is the SSOT for any code path that deletes feedback rows or extracts them in bulk.

**Audience** — Backend engineer wiring the WP-Cron purge handler, the GDPR delete endpoint, and the CSV export endpoint.

**Expected AI Output** —
- `wp-plugin/includes/Feedback/PurgeJob.php` (WP-Cron handler)
- `wp-plugin/includes/Feedback/DeleteMyFeedback.php` (GDPR one-shot)
- `wp-plugin/includes/Rest/FeedbackExportController.php` — `GET /feedback/export.csv`
- PHPUnit tests covering 90-day boundary, idempotency, GDPR completeness, CSV escaping

**Out of Scope** —
- Schema, enums, `PurgeAfter` column definition → [`./01-data-model.md`](./01-data-model.md)
- Submission flow → [`./02-submission-flow.md`](./02-submission-flow.md)
- Admin inbox/transitions → [`./03-admin-review-ui.md`](./03-admin-review-ui.md)
- Activity-feed retention (separate 30-day policy) → [`../34-activity-feed/04-retention-and-purge.md`](../34-activity-feed/04-retention-and-purge.md)

**Definition of Done** —
- `AT-FEEDBACKREPORT-13` (90-day boundary purge) passes.
- `AT-FEEDBACKREPORT-14` (`DeleteMyFeedback(userId)` GDPR completeness) passes.
- `node scripts/spec-hygiene/00-run-all.mjs` exits 0.

---

## Retention Policy (Closed Constants)

| Constant | Value | Rationale | Gate |
|---|---|---|---|
| `RETENTION_DAYS` | **90** | Standard support-feedback retention; configurable per [`06-seedable-config-architecture/`](../06-seedable-config-architecture/00-overview.md) within `[30..365]` bounds | `G-33-RE-RETENTION-90D` |
| `RETENTION_BOUNDS` | `[30, 365]` days | Floor protects audit trail; ceiling prevents indefinite storage | `G-33-RE-RETENTION-BOUNDS` |
| `PURGE_INTERVAL` | **daily** (00:30 UTC) | Off-peak; offset 15 min from activity-feed purge to avoid lock contention | `G-33-RE-PURGE-DAILY` |
| `PURGE_BATCH_SIZE` | **2,000 rows / tx** | Lower than activity-feed (5,000) because each row may have a screenshot blob to dereference | `G-33-RE-BATCH-CAP` |
| `GDPR_DEADLINE_HOURS` | **72** | EU GDPR Art. 17 "without undue delay"; we commit to 72 h hard cap | `G-33-RE-GDPR-72H` |

> **Forbidden:** any code path that deletes `FeedbackReport` rows outside `PurgeJob` or `DeleteMyFeedback`; reading `RETENTION_DAYS` from a non-seedable runtime source; setting it outside `[30..365]`. Gate `G-33-RE-NO-AD-HOC-DELETE`.

---

## Server-Side Purge (WP-Cron)

### 1. Trigger

- WP-Cron schedule: `workflowy_feedback_purge_daily` registered with `wp_schedule_event(time(), 'daily', …)` at plugin activation; offset to **00:30 UTC** (15 min after activity-feed purge).
- Handler: `WorkFlowy\Feedback\PurgeJob::run()`.
- **MUST** also be invocable from CLI: `wp workflowy feedback purge --dry-run` (gate `G-33-RE-CLI-DRY-RUN`).

### 2. Algorithm

```
cutoffIso  = clock.nowIso() − RETENTION_DAYS days        # injected clock per ADR-0027
totalPurged = 0
loop:
  rows = SELECT FeedbackReportId, ScreenshotBlobRef
         FROM FeedbackReport
         WHERE PurgeAfter <= :cutoffIso
         ORDER BY FeedbackReportId ASC
         LIMIT 2000;
  if rows is empty: break
  BEGIN TRANSACTION
    -- 1. Dereference screenshots (storage layer handles GC)
    forEach row WHERE ScreenshotBlobRef IS NOT NULL:
      blobStorage.dereference(row.ScreenshotBlobRef);
    -- 2. Cascade delete admin notes
    DELETE FROM FeedbackReportNote
    WHERE FeedbackReportId IN (rows.ids);
    -- 3. Delete the feedback rows themselves
    DELETE FROM FeedbackReport
    WHERE FeedbackReportId IN (rows.ids);
  COMMIT
  totalPurged += count(rows)
emit Telemetry { Event: "FeedbackPurgeRun", Purged: totalPurged, CutoffIso: cutoffIso }
```

| Invariant | Gate |
|---|---|
| Filter uses the pre-computed `PurgeAfter` column from `./01-data-model.md` (never recomputes `SubmittedAt + 90d` in WHERE) — keeps `IX_FeedbackReport_PurgeAfter` covering | `G-33-RE-USE-PURGE-AFTER-COL` |
| Each batch runs inside a single SQLite tx with `PRAGMA locking_mode = EXCLUSIVE` to serialize against CLI invocations | `G-33-RE-EXCLUSIVE-LOCK` |
| Re-running the job within the same minute MUST be a no-op | `G-33-RE-IDEMPOTENT-RERUN` |
| A failed batch MUST NOT advance the cursor; next run picks up at the same `PurgeAfter` boundary | `G-33-RE-NO-PARTIAL-COMMIT` |
| **Cascade order is fixed**: dereference blobs → delete notes → delete reports — reverse order would leave orphan note rows or dangling blob refs | `G-33-RE-CASCADE-ORDER` |
| Telemetry emitted via the standard sink ([`../06-telemetry-and-logging/`](../06-telemetry-and-logging/00-overview.md)); `error_log()`/`var_dump()` forbidden | `G-33-RE-NO-DIRECT-LOG` |

### 3. Telemetry

| Field | Type | Purpose |
|---|---|---|
| `Event` | `"FeedbackPurgeRun"` | Closed constant |
| `Purged` | integer | Total rows deleted |
| `BlobsDereferenced` | integer | Screenshots whose refs were released |
| `NotesDeleted` | integer | `FeedbackReportNote` rows cascaded |
| `CutoffIso` | ISO-8601 UTC | Retention cutoff applied |
| `DurationMs` | integer | End-to-end wall time |

---

## GDPR — `DeleteMyFeedback(userId)`

A **one-shot** operation triggered by the user-management "Delete my account" flow OR by a direct GDPR Art. 17 request relayed by an Admin.

### Algorithm

```
deleteMyFeedback(userId: OwnerId, reason: 'AccountDeletion' | 'GdprRequest', requestedAt: Iso):
  BEGIN TRANSACTION
    -- 1. Snapshot for audit (without the actual content)
    auditRows = SELECT FeedbackReportId, SubmittedAt, FeedbackType, Status
                FROM FeedbackReport WHERE SubmittedByUserId = :userId;
    -- 2. Dereference screenshots
    forEach row WHERE ScreenshotBlobRef IS NOT NULL:
      blobStorage.dereference(row.ScreenshotBlobRef);
    -- 3. Cascade delete admin notes
    DELETE FROM FeedbackReportNote
    WHERE FeedbackReportId IN (SELECT FeedbackReportId FROM FeedbackReport WHERE SubmittedByUserId = :userId);
    -- 4. Hard-delete the feedback rows
    DELETE FROM FeedbackReport WHERE SubmittedByUserId = :userId;
    -- 5. Append a single audit row to GdprDeletionLog (NO content, only counts + reason)
    INSERT INTO GdprDeletionLog (UserId, DeletedAt, ReportCount, Reason, RequestedAt)
    VALUES (:userId, :now, count(auditRows), :reason, :requestedAt);
  COMMIT
  emit Telemetry { Event: "FeedbackGdprDelete", UserId: hash(:userId), ReportCount: …, Reason: … }
  return { ReportsDeleted: count(auditRows), CompletedAt: :now }
```

| Invariant | Gate |
|---|---|
| Operation MUST complete within `GDPR_DEADLINE_HOURS = 72` from request timestamp; if backlogged, an alert MUST fire at 48 h | `G-33-RE-GDPR-72H` |
| Operation is **atomic** — either all rows for `userId` are deleted, or none (single SQLite tx) | `G-33-RE-GDPR-ATOMIC` |
| Telemetry **MUST hash** `userId` before emission (no raw `OwnerId` in telemetry stream) | `G-33-RE-GDPR-HASH-USERID` |
| `GdprDeletionLog` row MUST NOT contain any `Title`/`Body`/`DiagnosticsJson` content — only counts, IDs, and reason code | `G-33-RE-GDPR-LOG-NO-CONTENT` |
| Operation is **idempotent**: re-invoking for a user with zero remaining rows returns `ReportsDeleted: 0` without error | `G-33-RE-GDPR-IDEMPOTENT` |
| Operation MUST be callable from: (a) user-management "Delete account" cascade, (b) Admin-only `POST /admin/users/{id}/forget` endpoint. No other callers permitted | `G-33-RE-GDPR-CALLERS-CLOSED` |

> **Forbidden:** soft-delete via a `DeletedAt` column (would still leave PII on disk); rate-limiting GDPR delete (legal obligation); requiring user confirmation a second time at the data layer (already confirmed at the user-management layer).

---

## CSV Export (Admin-Only)

Endpoint `GET /feedback/export.csv` — produces a streaming CSV download for offline review or migration.

### REST Contract

```
GET /feedback/export.csv?status=Resolved&from=2026-01-01&to=2026-04-30
Authorization: Bearer <admin-session>
Accept: text/csv

Response 200:
Content-Type: text/csv; charset=utf-8
Content-Disposition: attachment; filename="feedback-2026-04-30.csv"
Content-Encoding: identity         # NEVER gzip-on-the-fly (memory pressure)
X-Export-RowCount: 1234            # included as response trailer for client progress UI
```

### Column order (closed list, exact order)

| # | Column | Source |
|---|---|---|
| 1 | `FeedbackReportId` | row PK |
| 2 | `SubmittedAt` | ISO-8601 UTC |
| 3 | `FeedbackType` | enum value |
| 4 | `Status` | enum value |
| 5 | `Title` | row column (CSV-escaped) |
| 6 | `Body` | row column (CSV-escaped, newlines preserved as `\n` literal then quoted) |
| 7 | `SubmittedByUserId` | branded `OwnerId` rendered as opaque string |
| 8 | `ResolvedAt` | ISO-8601 UTC or empty |
| 9 | `DiagnosticsJson` | raw JSON string, double-quote-escaped |

| Invariant | Gate |
|---|---|
| Endpoint requires `Admin` role (server-side `hasRole` check); 403 otherwise | `G-33-RE-EXPORT-ROLE-GUARD` |
| Output is **streamed** row-by-row via PHP `fputcsv` to `php://output` — never buffered in memory (gate keeps export usable for 100k+ rows) | `G-33-RE-EXPORT-STREAMED` |
| CSV fields are escaped via `fputcsv` (handles quotes, commas, newlines per RFC 4180) — manual `str_replace` forbidden | `G-33-RE-EXPORT-RFC4180` |
| First cell of every row MUST be prefixed with a single `'` if its raw value starts with `=`, `+`, `-`, `@`, `\t`, `\r` (CSV-injection / formula-injection defense) | `G-33-RE-EXPORT-FORMULA-SAFE` |
| Filter params (`status`, `type`, `from`, `to`) reuse the same Zod schema as the inbox endpoint — no parallel validator | `G-33-RE-EXPORT-FILTER-SSOT` |
| Filename pattern: `feedback-YYYY-MM-DD.csv` (UTC date of export) — closed | `G-33-RE-EXPORT-FILENAME` |
| Export MUST be rate-limited to **1 export per Admin per minute** (HTTP 429 with `Retry-After`) | `G-33-RE-EXPORT-RATE-LIMIT` |

> **Forbidden:** Excel/`.xlsx` export (would require buffering the entire workbook in memory); JSON export for bulk download (use the REST list endpoint with pagination instead); inclusion of `ScreenshotBlobRef` URLs in the CSV (signed URLs would leak; reviewers must use the admin UI for screenshots).

---

## Acceptance Criteria (Bound Here)

| AT id | Given | When | Then | Negative |
|---|---|---|---|---|
| `AT-FEEDBACKREPORT-13` | A `FeedbackReport` with `SubmittedAt = now − 91d` and `RETENTION_DAYS = 90` | `PurgeJob::run()` is invoked | Row is deleted; its `FeedbackReportNote` cascades; its `ScreenshotBlobRef` is dereferenced; a row with `SubmittedAt = now − 89d` is NOT deleted | A row with `SubmittedAt = now − 90d − 1ms` MUST be deleted; a row with `SubmittedAt = now − 90d + 1ms` MUST be retained |
| `AT-FEEDBACKREPORT-14` | A user `userId-X` has 7 `FeedbackReport` rows + 3 `FeedbackReportNote` rows + 2 `ScreenshotBlobRef`s | `DeleteMyFeedback(userId-X, 'AccountDeletion', requestedAt)` is invoked | All 7 reports + 3 notes deleted in a single tx; both screenshots dereferenced; `GdprDeletionLog` gets one row `{ ReportCount: 7, Reason: 'AccountDeletion' }` with NO content fields; operation completes ≤72 h after `requestedAt` | A second invocation MUST return `ReportsDeleted: 0` without error; the `GdprDeletionLog` row MUST NOT contain `Title`/`Body`/`DiagnosticsJson` |

Fixtures live in [`./97a-acceptance-criteria-fixtures.md`](./97a-acceptance-criteria-fixtures.md) (rows `at-feedbackreport-13..14`). Test names: `at_feedback_report_13_purge_90d_boundary`, `at_feedback_report_14_gdpr_delete_complete`.

---

## Gate Bindings (12 new gates, namespace `G-33-RE-*`)

| Gate id | MUST | Tier |
|---|---|---|
| `G-33-RE-RETENTION-90D` | Default `RETENTION_DAYS = 90`, configurable within bounds | DOC |
| `G-33-RE-RETENTION-BOUNDS` | Configured value MUST be within `[30..365]` | CI (config-validation) |
| `G-33-RE-PURGE-DAILY` | Daily WP-Cron at 00:30 UTC | DOC |
| `G-33-RE-BATCH-CAP` | ≤2,000 rows per tx | DOC |
| `G-33-RE-NO-AD-HOC-DELETE` | Only `PurgeJob` or `DeleteMyFeedback` may DELETE from `FeedbackReport` | CI (grep) |
| `G-33-RE-CASCADE-ORDER` | Cascade order: blobs → notes → reports | DOC |
| `G-33-RE-USE-PURGE-AFTER-COL` | WHERE clause uses `PurgeAfter` column, not recomputed expression | CI (grep) |
| `G-33-RE-GDPR-72H` | Operation completes within 72 h of request | CI (perf SLO test) |
| `G-33-RE-GDPR-ATOMIC` | Single SQLite tx for all user's rows | DOC |
| `G-33-RE-GDPR-LOG-NO-CONTENT` | `GdprDeletionLog` row contains no PII / content | CI (schema check) |
| `G-33-RE-EXPORT-ROLE-GUARD` | Export endpoint requires `Admin` role server-side | DOC |
| `G-33-RE-EXPORT-FORMULA-SAFE` | First cell prefixed with `'` if starts with `= + - @ \t \r` | CI (test fixture) |

(Full 18-gate list incl. `G-33-RE-EXCLUSIVE-LOCK`, `G-33-RE-IDEMPOTENT-RERUN`, `G-33-RE-NO-PARTIAL-COMMIT`, `G-33-RE-NO-DIRECT-LOG`, `G-33-RE-CLI-DRY-RUN`, `G-33-RE-GDPR-HASH-USERID`, `G-33-RE-GDPR-IDEMPOTENT`, `G-33-RE-GDPR-CALLERS-CLOSED`, `G-33-RE-EXPORT-STREAMED`, `G-33-RE-EXPORT-RFC4180`, `G-33-RE-EXPORT-FILTER-SSOT`, `G-33-RE-EXPORT-FILENAME`, `G-33-RE-EXPORT-RATE-LIMIT` registered in [`spec/_GATE-REGISTRY.md`](../_GATE-REGISTRY.md) under `G-33-RE-*`.)

---

## Anti-Pattern Table

| Anti-pattern | Why it fails | Gate violated |
|---|---|---|
| `DELETE FROM FeedbackReport WHERE SubmittedAt < datetime('now','-90 days')` outside `PurgeJob` | Bypasses cascade (orphan notes/blobs); skips telemetry | `G-33-RE-NO-AD-HOC-DELETE` + `G-33-RE-CASCADE-ORDER` |
| Deleting feedback rows BEFORE notes (FK orphan) | Either DB error or orphan rows depending on FK config | `G-33-RE-CASCADE-ORDER` |
| Recomputing `SubmittedAt + 90d` in WHERE | Disables `IX_FeedbackReport_PurgeAfter` index; full-scan | `G-33-RE-USE-PURGE-AFTER-COL` |
| GDPR delete via soft-delete column (`DeletedAt`) | PII still on disk; violates Art. 17 "erasure" | (DOC: `G-33-RE-GDPR-ATOMIC` implies hard-delete) |
| `GdprDeletionLog` includes `Title` / `Body` for "audit traceability" | Defeats the point of the deletion | `G-33-RE-GDPR-LOG-NO-CONTENT` |
| CSV first cell starts with `=SUM(A1:A9999)` un-prefixed | Excel/Sheets executes as formula on open (CSV-injection) | `G-33-RE-EXPORT-FORMULA-SAFE` |
| Buffering full export in PHP memory before sending | OOM on 100k+ row exports | `G-33-RE-EXPORT-STREAMED` |
| Manual `str_replace(',', '\\,')` for CSV escaping | Breaks on quotes & embedded newlines | `G-33-RE-EXPORT-RFC4180` |
| Allowing GDPR delete to be called from arbitrary code paths | Audit-trail gap; unverifiable deletion | `G-33-RE-GDPR-CALLERS-CLOSED` |

---

## Cross-References

| Reference | Location |
|---|---|
| Data model (`PurgeAfter`, `FeedbackReportNote`) | [`./01-data-model.md`](./01-data-model.md) |
| Submission flow | [`./02-submission-flow.md`](./02-submission-flow.md) |
| Admin review UI (consumer of unpurged rows) | [`./03-admin-review-ui.md`](./03-admin-review-ui.md) |
| Activity-feed retention (sibling 30-day policy) | [`../34-activity-feed/04-retention-and-purge.md`](../34-activity-feed/04-retention-and-purge.md) |
| Telemetry sink | [`../06-telemetry-and-logging/00-overview.md`](../06-telemetry-and-logging/00-overview.md) |
| Seedable config | [`../06-seedable-config-architecture/00-overview.md`](../06-seedable-config-architecture/00-overview.md) |
| User management ("Delete my account" cascade) | [`../36-user-management/00-overview.md`](../36-user-management/00-overview.md) |
| Clock injection | ADR-0027 |

---

*Sub-spec v1.0.0 — closes the `33-feedback-report/` cluster — 2026-04-30*
