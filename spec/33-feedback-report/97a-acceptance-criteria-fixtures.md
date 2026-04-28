# Feedback Report — Acceptance Criteria I/O Fixtures

> **Version:** 1.0.0
> **Created:** 2026-04-28 (UTC+8)
> **Status:** Normative companion to [`97-acceptance-criteria.md`](./97-acceptance-criteria.md).
> **Format spec:** [`spec/01-spec-authoring-guide/19-acceptance-criteria-io-table.md`](../01-spec-authoring-guide/19-acceptance-criteria-io-table.md)
> **Spawned by:** `.lovable/plans/00-active.md` § P2e.

---

## `AT-FEEDBACKREPORT-01` — Feedback button reachable from Navbar

| Slot | Value |
|------|-------|
| **Given** | Any route rendered. |
| **When** | Test queries `document.querySelector('[data-testid="navbar-feedback-trigger"]')`. |
| **Then** | Element exists, `aria-label="Feedback"`, is keyboard-focusable in Tab order. |
| **Side effects** | none |
| **Negative assertion** | Trigger MUST NOT be nested inside a closed dropdown or behind a feature flag. |

## `AT-FEEDBACKREPORT-02` — Form schema + server re-validation

| Slot | Value |
|------|-------|
| **Given** | Authenticated user; feedback form open. |
| **When** | `POST /wp-json/workflowy/v1/feedback` body `{ "Type":"bug", "Title":"x".repeat(120), "Body":"y".repeat(2000) }`. |
| **Response envelope** | ```json
{ "Status":"OK", "Attributes":{"Count":1}, "Results":{ "Feedback":{ "FeedbackId":1 } } }
``` |
| **Then** | `Title` length=121 → `Errors[0].Code = "E_FEEDBACK_TITLE_TOO_LONG"`; `Body` length=2001 → `E_FEEDBACK_BODY_TOO_LONG`; unknown `Type` → `E_FEEDBACK_TYPE_INVALID`. |
| **Side effects** | One row in `Feedback` table on success only. |
| **Negative assertion** | Server MUST reject overlength even when client allowed. |

## `AT-FEEDBACKREPORT-03` — `Type` is typed enum

| Linter command | `rg -nP "['\"](bug\|idea\|praise\|question)['\"]" src/ \| rg -v "FeedbackType\."` |
|---|---|
| **Expected exit code** | `1` (no matches) |
| **Negative assertion** | Magic string literal `'bug'` outside the enum file MUST fail. |

## `AT-FEEDBACKREPORT-04` — Auto-attach context

| Given | User on item `itm_42`, breadcrumb `Home > Projects > Q3`, viewport 1280×800, UA `Mozilla/5.0 …`. |
|---|---|
| **When** | Submit feedback. |
| **Request body** | ```json
{ "Type":"bug", "Title":"crash", "Body":"…", "Context":{ "ItemId":"itm_42", "BreadcrumbPath":["Home","Projects","Q3"], "Viewport":{"W":1280,"H":800}, "UserAgent":"Mozilla/5.0 …" } }
``` |
| **Then** | Server-stored row contains all four context fields verbatim. |
| **Negative assertion** | Missing any field MUST fail server schema with `E_FEEDBACK_CONTEXT_INCOMPLETE`. |

## `AT-FEEDBACKREPORT-05` — Context excludes PII

| Linter command | `rg -nP "clipboard\|authToken\|sessionToken\|otherItems" src/feedback/` |
|---|---|
| **Expected exit code** | `1` |
| **Negative assertion** | Submission body MUST NOT contain `Clipboard`, `Sessions`, `AuthToken`, or any item content other than the target `ItemId`. |

## `AT-FEEDBACKREPORT-06` — Dedicated `feedback.db`

| Linter command | `rg -nP "feedback\.db" src/server/` |
|---|---|
| **Expected exit code** | `0` |
| **Then** | `Feedback` table opens against `feedback.db`; opening it on the user-data DB throws `E_FEEDBACK_WRONG_DB`. |

## `AT-FEEDBACKREPORT-07` — Non-blocking submit

| Given | Form open. |
|---|---|
| **When** | Click Submit; network is offline. |
| **Then** | Form closes within 100 ms (optimistic); request queued in IndexedDB `PendingFeedback`; on next online tick, replay; on permanent failure (HTTP 4xx) toast `"Failed to send feedback — Retry"` appears with action button. |
| **Negative assertion** | Form MUST NOT block on the network response; failure MUST NOT silently drop. |

## `AT-FEEDBACKREPORT-08` — Table naming + PK

| Given | `feedback.db` created. |
|---|---|
| **When** | `pragma table_info('Feedback')`. |
| **Then** | Table `Feedback` exists; column `FeedbackId INTEGER PRIMARY KEY AUTOINCREMENT`; passes hygiene check `01-naming-conventions`. |

## `AT-FEEDBACKREPORT-09` — Admin gate via `hasRole`

| Given | Two users: `usr_admin` (Admin role row), `usr_basic` (no Admin row). |
|---|---|
| **When** | `GET /wp-json/workflowy/v1/admin/feedback` with each session. |
| **Then** | `usr_admin` → `Status:"OK"`; `usr_basic` → `Status:"ERROR"`, `Errors[0].Code = "E_FORBIDDEN"`. |
| **Side effects** | Server-side stack frame goes through `hasRole(userId,'Admin')`. |
| **Negative assertion** | No inline `if (user.role === 'Admin')` in the route handler. |

## `AT-FEEDBACKREPORT-10` — Server-side filter

| When | `GET /wp-json/workflowy/v1/admin/feedback?Type=bug&Status=new&UserId=usr_42&CreatedFrom=2026-04-01&CreatedTo=2026-04-30`. |
|---|---|
| **Then** | SQL `WHERE` includes all four filters; response only returns matching rows; entire table is never sent over the wire. |
| **Negative assertion** | Server MUST NOT return all rows expecting client to filter. |

## `AT-FEEDBACKREPORT-11` — Status transitions

| Given | Feedback row `Status="new"`. |
|---|---|
| **When** | `PATCH /admin/feedback/1 { "Status":"resolved" }` (skips `triaged`). |
| **Then** | `Errors[0].Code = "E_FEEDBACK_INVALID_TRANSITION"`. Allowed: `new→triaged→resolved→archived`; reverse and skip arrows rejected. |

## `AT-FEEDBACKREPORT-12` — Retention configurable, default 90 d

| Linter command | `rg -nP "feedbackRetentionDays" src/config/ && rg -nP "default:\s*90" src/config/feedback*` |
|---|---|
| **Expected exit code** | `0` for both. |
| **Negative assertion** | Hardcoded `90` outside the seedable-config file MUST fail. |

## `AT-FEEDBACKREPORT-13` — Purge logs counts

| Given | 5 feedback rows older than retention. |
|---|---|
| **When** | Scheduled purge job runs. |
| **Then** | Log line at INFO: `feedback.purge complete deleted=5 retainedDays=90`; `Feedback` row count decreases by 5. |
| **Negative assertion** | Silent purge (no log line) MUST fail the integration test. |

## `AT-FEEDBACKREPORT-14` — `DeleteMyFeedback`

| Given | `usr_42` has 12 feedback rows + 3 screenshots. |
|---|---|
| **When** | `POST /wp-json/workflowy/v1/users/me/feedback:delete-all`. |
| **Then** | All 12 rows + 3 screenshot blobs removed within one transaction; response `Status:"OK"`, `Results.Deleted = { Rows:12, Screenshots:3 }`. |
| **Negative assertion** | Operation MUST NOT leave any row or blob owned by `usr_42`. |

---

## Verification

```bash
grep -rn "AT-FEEDBACKREPORT-" spec/33-feedback-report/97a-acceptance-criteria-fixtures.md | wc -l   # → 14
node scripts/spec-hygiene/00-run-all.mjs
```

## Related

- [`97-acceptance-criteria.md`](./97-acceptance-criteria.md) — Prose rollup
- [`spec/01-spec-authoring-guide/19-acceptance-criteria-io-table.md`](../01-spec-authoring-guide/19-acceptance-criteria-io-table.md) — Format SSOT

*P2e/A — created 2026-04-28 (UTC+8). Covers 14/14 feedback-report ATs.*
