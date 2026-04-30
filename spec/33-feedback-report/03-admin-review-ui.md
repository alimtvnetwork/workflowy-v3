# Admin Review UI — Sub-Spec

> **Version:** 1.0.0 — authored 2026-04-30
> **Owner section:** `spec/33-feedback-report/`
> **Status:** Draft (P1 — load-bearing for `AT-FEEDBACKREPORT-09..12` and gates `G-33-AR-*`).
> **Parent:** [`./00-overview.md`](./00-overview.md)
> **Siblings (consumed):** [`./01-data-model.md`](./01-data-model.md) (schema, transition matrix), [`./02-submission-flow.md`](./02-submission-flow.md) (envelope shape)

---

## AI Contract

**Purpose** — Define the **Admin-role-gated review UI**: route mounting, role gating, inbox list with filters/search/pagination, detail drawer, status-transition controls, and the read-side REST endpoints. The transition matrix is **consumed** from `./01-data-model.md` — no duplicate definition is permitted here.

**Audience** — Frontend engineer building the admin route + components; backend engineer authoring `EP-FEEDBACK-LIST` and `EP-FEEDBACK-TRANSITION`.

**Expected AI Output** —
- `src/features/feedback/admin/FeedbackInbox.tsx` (list + filters + pagination)
- `src/features/feedback/admin/FeedbackDetailDrawer.tsx` (read-only detail + transition control)
- `src/features/feedback/admin/transitionFeedback.ts` (sole writer for status transitions)
- `src/features/feedback/admin/loaders.ts` (mirror-first loaders per ADR-0023)
- `wp-plugin/includes/Rest/FeedbackController.php` — `GET /feedback`, `POST /feedback/{id}/transition`

**Out of Scope** —
- Schema, enums, transition matrix → [`./01-data-model.md`](./01-data-model.md)
- Submission flow / form / diagnostics capture → [`./02-submission-flow.md`](./02-submission-flow.md)
- Retention purge → [`./04-retention-and-export.md`](./04-retention-and-export.md)

**Definition of Done** —
- `AT-FEEDBACKREPORT-09..12` (role gating, inbox filters, detail rendering, transition enforcement) all pass.
- Non-Admin users receive 403 from `GET /feedback` and a route-level redirect on the client.
- `node scripts/spec-hygiene/00-run-all.mjs` exits 0.

---

## Route Mounting

| Invariant | Gate |
|---|---|
| Route path: `/admin/feedback` (list) and `/admin/feedback/:feedbackReportId` (detail drawer) — both mounted as siblings in the React Router v7 data-router config | `G-33-AR-ROUTE-PATH` |
| Both routes are wrapped in **`<AdminBoundary>`** (one of the 8 named error boundaries per ADR-0017) — a crash MUST NOT take down the parent app shell | `G-33-AR-BOUNDARY-NAMED` |
| The route loader MUST call `requireRole('Admin')` synchronously before any data read; non-Admin sessions get a `redirect('/forbidden')` response from the loader (server-side gating mirror) | `G-33-AR-LOADER-ROLE-GUARD` |
| The Navbar entry to `/admin/feedback` is **conditionally rendered** based on the same `hasRole(userId, 'Admin')` check used by the loader — no parallel role check anywhere | `G-33-AR-ROLE-SSOT` |
| Route param `:feedbackReportId` is parsed as **branded `FeedbackReportId`** at the loader boundary; raw `string` IDs forbidden per ADR-0020 | `G-33-AR-BRANDED-PARAM` |

> **Forbidden:** client-only role gating (e.g. `if (user.role === 'Admin') return <Inbox/>`); reading `localStorage.role`; trusting any client-provided role claim. The server is the sole authority for role membership (mirrors `mem://features/sharing-model` and the user-roles SSOT).

---

## Inbox — Filters, Search, Pagination

The inbox is a virtualized list of `FeedbackReport` rows (per the 250-item view limit and 1000-item virtualization rule from ADR-0017 — virtualization activates beyond 250 visible rows).

### Filter controls (URL-synchronized state)

| Control | Type | URL param | Source-of-truth |
|---|---|---|---|
| Status filter | Multi-select (6 values from `FeedbackStatus` enum) | `?status=New,Triaged` | Imported from `feedback.types.ts` (gate `G-33-AR-FILTER-FROM-ENUM`) |
| Type filter | Multi-select (4 values from `FeedbackType` enum) | `?type=Bug,Idea` | Imported from `feedback.types.ts` (same gate) |
| Date range | `<DateRangePicker>` | `?from=YYYY-MM-DD&to=YYYY-MM-DD` | Inclusive bounds, ISO-8601 dates only |
| Free-text search | `<Input>` (debounced 250 ms) | `?q=…` | Searches `Title` only (NEVER `Body` — `Body` is full-text and ranking would require FTS5 not yet in scope) |
| Sort | `<Select>` | `?sort=submittedAtDesc\|submittedAtAsc\|statusAsc` | Default `submittedAtDesc` |

| Invariant | Gate |
|---|---|
| All filter state lives in the URL — refresh restores the exact view (deep-linkable) | `G-33-AR-URL-STATE` |
| Filter values come from the imported enum types — hardcoded string lists in JSX forbidden | `G-33-AR-FILTER-FROM-ENUM` |
| Free-text search debounces 250 ms before triggering a loader revalidation | `G-33-AR-SEARCH-DEBOUNCE` |
| Search MUST scope to `Title` only (not `Body` or `DiagnosticsJson`) — privacy + perf reason | `G-33-AR-SEARCH-TITLE-ONLY` |

### Pagination

| Invariant | Gate |
|---|---|
| Cursor-based pagination (`?cursor=<SubmittedAtMillis>_<FeedbackReportId>`) — same shape as activity-feed cursor | `G-33-AR-CURSOR-SHAPE` |
| Page size: **50** rows (well under the 250-view limit) | `G-33-AR-PAGE-50` |
| The list itself is rendered with `@tanstack/react-virtual` when more than 250 rows have been accumulated client-side via "Load more" | `G-33-AR-VIRTUALIZE-250` |
| Loader reads from the local `FeedbackReportMirror` first (≤16 ms p95 per ADR-0023); only falls through to network if the cursor window is uncached | `G-33-AR-MIRROR-FIRST` |

---

## Detail Drawer

Mounted at `/admin/feedback/:feedbackReportId` as a Radix `<Sheet>` (right side, 480 px wide on `md+`, full-screen on `sm`).

| Section | Content | Gate |
|---|---|---|
| Header | `Title`, `FeedbackType` badge, `FeedbackStatus` badge | `G-33-AR-HEADER-COMPLETE` |
| Body | Rendered as **plain text** with `<pre>`-like wrapping — never as Markdown / HTML / `dangerouslySetInnerHTML` | `G-33-AR-BODY-PLAIN-TEXT` |
| Diagnostics | Collapsed by default; expands to a `<dl>` of the 9 `Diagnostics` keys | `G-33-AR-DIAG-COLLAPSED` |
| Screenshot | Lazy-loaded `<img>` with `loading="lazy"` and explicit width/height; only rendered if `ScreenshotBlobRef !== null` | `G-33-AR-SCREENSHOT-LAZY` |
| Submitter | `SubmittedByUserId` resolved to display name via the user-management lookup; never rendered as raw ID | `G-33-AR-SUBMITTER-RESOLVED` |
| Timeline | `SubmittedAt`, `ResolvedAt` (if set) — relative time + tooltip with absolute UTC ISO | `G-33-AR-TIMELINE` |
| Transition control | `<Select>` populated from `ALLOWED_TRANSITIONS[currentStatus]` (the SSOT from `./01-data-model.md`) | `G-33-AR-TRANSITION-FROM-SSOT` |

> **Forbidden in the detail drawer:** rendering `Body` through any rich-text/Markdown component (XSS surface; submitter is untrusted); auto-fetching the screenshot before the drawer is open (privacy + bandwidth); showing any diagnostics field not declared in `./01-data-model.md`'s strict Zod schema.

---

## Status Transition — Sole Writer

`transitionFeedback({ feedbackReportId, fromStatus, toStatus, note })` is the **sole** action-tier function that mutates `FeedbackReport.Status`. Per ADR-0023, it writes mirror + queue in **one IDB transaction**.

| Invariant | Gate |
|---|---|
| `transitionFeedback` is the sole writer of the `Status` column on `FeedbackReportMirror` rows (CI import-graph check) | `G-33-AR-SOLE-TRANSITION-WRITER` |
| Validates the transition against `ALLOWED_TRANSITIONS[fromStatus]` from `./01-data-model.md` **before** writing — no duplicate matrix here | `G-33-AR-TRANSITION-FROM-SSOT` |
| `fromStatus` parameter is required (optimistic-concurrency token); if it doesn't match the current mirror row, the function rejects with `STALE_STATUS` | `G-33-AR-OPTIMISTIC-CONCURRENCY` |
| Writes mirror+queue atomically in one IDB tx (loader↔queue contract per ADR-0023) | `G-33-AR-ATOMIC-MIRROR-QUEUE` |
| When transitioning to a terminal state (`Resolved`/`WontFix`/`Duplicate`), MUST also set `ResolvedAt = clock.nowIso()` in the same write | `G-33-AR-RESOLVED-AT-ON-TERMINAL` |
| Server re-validates the transition with the same matrix (no client trust) | `G-33-AR-SERVER-REVALIDATE-TRANSITION` |

---

## REST Endpoints

### `EP-FEEDBACK-LIST` — `GET /feedback`

```
GET /feedback?status=New,Triaged&type=Bug&from=2026-04-01&to=2026-04-30&q=mirror&cursor=…&limit=50
Authorization: Bearer <session>

Response:
{
  "Status": "Ok",
  "Attributes": { "TotalMatching": 1234 },
  "Results":    [ { FeedbackReport row }, … ],
  "Navigation": { "NextCursor": "1714485000000_1234" | null }
}
```

| Invariant | Gate |
|---|---|
| Returns 403 if caller does not have role `Admin` (server-side check via `hasRole`) | `G-33-AR-SERVER-ROLE-GUARD` |
| `Results[*].DiagnosticsJson` is returned as a parsed object (never as a JSON string blob) | `G-33-AR-DIAG-PARSED-IN-RESPONSE` |
| `Results[*].Body` is returned **redacted to first 280 chars + ellipsis** in the list endpoint; full body only in `GET /feedback/{id}` | `G-33-AR-LIST-BODY-TRUNCATED` |

### `EP-FEEDBACK-TRANSITION` — `POST /feedback/{id}/transition`

```
POST /feedback/1234/transition
{
  "Status": "Request",
  "Attributes": { "FromStatus": "Triaged", "ToStatus": "InProgress", "Note": "Picked up by alice" }
}

Response (200 Ok):
{
  "Status": "Ok",
  "Attributes": { "FeedbackReportId": 1234, "Status": "InProgress" },
  "Results":    { "FeedbackReportId": 1234, "Status": "InProgress", "ResolvedAt": null }
}
```

| Invariant | Gate |
|---|---|
| Server re-validates `(FromStatus → ToStatus)` against `ALLOWED_TRANSITIONS`; returns 409 `INVALID_TRANSITION` on mismatch | `G-33-AR-SERVER-REVALIDATE-TRANSITION` |
| Returns 409 `STALE_STATUS` if the row's current `Status !== FromStatus` (optimistic concurrency) | `G-33-AR-OPTIMISTIC-CONCURRENCY` |
| Sets `ResolvedAt = NOW()` server-side when `ToStatus IN ('Resolved','WontFix','Duplicate')` | `G-33-AR-RESOLVED-AT-ON-TERMINAL` |
| Note (if present) is appended to a separate `FeedbackReportNote` table — **never** mutated into `Body` (preserves submitter's original report verbatim) | `G-33-AR-NOTE-SEPARATE-TABLE` |

---

## Acceptance Criteria (Bound Here)

| AT id | Given | When | Then | Negative |
|---|---|---|---|---|
| `AT-FEEDBACKREPORT-09` | A user with role `Member` (not `Admin`) | They navigate to `/admin/feedback` | Loader returns `redirect('/forbidden')`; UI shows the forbidden page; no inbox data is fetched | `GET /feedback` invoked directly with the same session MUST return 403 |
| `AT-FEEDBACKREPORT-10` | Inbox is mounted; URL is `/admin/feedback?status=New&type=Bug` | The page renders | Only rows where `Status === 'New' AND FeedbackType === 'Bug'` are visible; pagination cursor is correct for the filtered set | A row with `Status='Triaged'` MUST NOT appear |
| `AT-FEEDBACKREPORT-11` | A `FeedbackReport` with `Body` containing `<script>alert(1)</script>` | Detail drawer renders | The text is shown verbatim with angle-brackets escaped; no script executes; no `dangerouslySetInnerHTML` is used in the render path | DOM inspection MUST show `&lt;script&gt;` not `<script>` |
| `AT-FEEDBACKREPORT-12` | A row currently `Status='Resolved'` | An admin tries to transition it back to `InProgress` via the UI | The transition `<Select>` does not list `InProgress` as an option (matrix says terminal); a forced API call returns 409 `INVALID_TRANSITION` | Mirror row MUST NOT change; UI MUST NOT show success toast |

Fixtures live in [`./97a-acceptance-criteria-fixtures.md`](./97a-acceptance-criteria-fixtures.md) (rows `at-feedbackreport-09..12`). Test names: `at_feedback_report_09_role_gating`, `at_feedback_report_10_filter_combo`, `at_feedback_report_11_body_xss_safe`, `at_feedback_report_12_terminal_no_reopen`.

---

## Gate Bindings (12 new gates, namespace `G-33-AR-*`)

| Gate id | MUST | Tier |
|---|---|---|
| `G-33-AR-ROUTE-PATH` | Routes mounted at `/admin/feedback` and `/admin/feedback/:feedbackReportId` | DOC |
| `G-33-AR-BOUNDARY-NAMED` | Routes wrapped in `<AdminBoundary>` (one of 8 per ADR-0017) | DOC |
| `G-33-AR-LOADER-ROLE-GUARD` | Loader calls `requireRole('Admin')` before any data read | CI (loader-graph check) |
| `G-33-AR-ROLE-SSOT` | Single `hasRole(userId, 'Admin')` source; no parallel role checks | CI (grep) |
| `G-33-AR-BRANDED-PARAM` | `:feedbackReportId` is branded `FeedbackReportId` at loader boundary | DOC |
| `G-33-AR-URL-STATE` | All filter state lives in URL params | DOC |
| `G-33-AR-FILTER-FROM-ENUM` | Filter option lists imported from `feedback.types.ts` enums | CI (import-graph check) |
| `G-33-AR-MIRROR-FIRST` | Loader reads `FeedbackReportMirror` first; network is fall-through only | DOC |
| `G-33-AR-BODY-PLAIN-TEXT` | Body rendered as plain text; no Markdown/HTML/`dangerouslySetInnerHTML` | CI (grep) |
| `G-33-AR-SOLE-TRANSITION-WRITER` | Only `transitionFeedback` writes `Status` column on mirror | CI (import-graph check) |
| `G-33-AR-TRANSITION-FROM-SSOT` | Transition matrix imported from `./01-data-model.md` SSOT; no duplicates | CI (grep for duplicate `ALLOWED_TRANSITIONS`) |
| `G-33-AR-OPTIMISTIC-CONCURRENCY` | `fromStatus` required; rejects with `STALE_STATUS` on mismatch | DOC |

(Full 18-gate list incl. `G-33-AR-SEARCH-DEBOUNCE`, `G-33-AR-SEARCH-TITLE-ONLY`, `G-33-AR-CURSOR-SHAPE`, `G-33-AR-PAGE-50`, `G-33-AR-VIRTUALIZE-250`, `G-33-AR-DIAG-COLLAPSED`, `G-33-AR-SCREENSHOT-LAZY`, `G-33-AR-SUBMITTER-RESOLVED`, `G-33-AR-TIMELINE`, `G-33-AR-LIST-BODY-TRUNCATED`, `G-33-AR-NOTE-SEPARATE-TABLE`, `G-33-AR-SERVER-ROLE-GUARD`, `G-33-AR-SERVER-REVALIDATE-TRANSITION`, `G-33-AR-DIAG-PARSED-IN-RESPONSE`, `G-33-AR-RESOLVED-AT-ON-TERMINAL`, `G-33-AR-HEADER-COMPLETE`, `G-33-AR-ATOMIC-MIRROR-QUEUE` registered in [`spec/_GATE-REGISTRY.md`](../_GATE-REGISTRY.md) under `G-33-AR-*`.)

---

## Anti-Pattern Table

| Anti-pattern | Why it fails | Gate violated |
|---|---|---|
| Client-only role gating: `{user.role === 'Admin' && <Inbox/>}` | Bypassable by tampering with client state; server is the only authority | `G-33-AR-LOADER-ROLE-GUARD` + `G-33-AR-SERVER-ROLE-GUARD` |
| Hardcoded `<option value="Bug">` lists in JSX | Diverges from enum on next migration; type-safety hole | `G-33-AR-FILTER-FROM-ENUM` |
| Rendering `Body` with `<ReactMarkdown>` or `dangerouslySetInnerHTML` | XSS vector; submitter content is fully untrusted | `G-33-AR-BODY-PLAIN-TEXT` |
| Admin UI defines its own `STATUS_TRANSITIONS` constant | Diverges from data-model SSOT; matrix drift | `G-33-AR-TRANSITION-FROM-SSOT` (and `G-33-DM-TRANSITION-SSOT`) |
| Transition without `fromStatus` (last-write-wins) | Two admins can race; later loses without warning | `G-33-AR-OPTIMISTIC-CONCURRENCY` |
| Inbox loader does `await fetch('/feedback')` before checking mirror | Violates loader↔queue contract; defeats offline-first | `G-33-AR-MIRROR-FIRST` |
| List endpoint returns full `Body` and full `DiagnosticsJson` for 1000 rows | Bandwidth; potential PII over-exposure in list view | `G-33-AR-LIST-BODY-TRUNCATED` |
| Admin notes appended to the `Body` column | Destroys submitter's verbatim report; audit trail broken | `G-33-AR-NOTE-SEPARATE-TABLE` |

---

## Cross-References

| Reference | Location |
|---|---|
| Data model (schema + transition matrix SSOT) | [`./01-data-model.md`](./01-data-model.md) |
| Submission flow (envelope shape) | [`./02-submission-flow.md`](./02-submission-flow.md) |
| Retention purge | [`./04-retention-and-export.md`](./04-retention-and-export.md) *(pending)* |
| Named error boundaries (8) | ADR-0017 |
| Loader↔queue contract | ADR-0023 |
| Branded IDs | ADR-0020 |
| User roles SSOT | [`../36-user-management/00-overview.md`](../36-user-management/00-overview.md) |
| API envelope | ADR-0004 / ADR-0019 |

---

*Sub-spec v1.0.0 — third of 4 in `33-feedback-report/` cluster — 2026-04-30*
