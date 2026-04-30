# Data Model — Sub-Spec

> **Version:** 1.0.0 — authored 2026-04-30
> **Owner section:** `spec/33-feedback-report/`
> **Status:** Draft (P1 — load-bearing for `AT-FEEDBACKREPORT-01..04` and gates `G-33-DM-*`).
> **Parent:** [`./00-overview.md`](./00-overview.md)

---

## AI Contract

**Purpose** — Define the **`FeedbackReport` table schema**, the **closed `FeedbackType` and `FeedbackStatus` enums**, the **`Diagnostics` JSON sub-shape**, and the **PII-exclusion contract** for the in-app feedback feature. This sub-spec is the SSOT for any column, enum value, or column-level constraint referenced by the submission flow, admin review UI, or retention job.

**Audience** — Backend engineer authoring the `feedback.db` migration; frontend engineer authoring the Zod schema; reviewer auditing PII boundaries.

**Expected AI Output** —
- `wp-plugin/migrations/feedback/0001_create_feedback_report.sql` (PascalCase columns, check constraints)
- `wp-plugin/includes/Feedback/FeedbackTypeEnum.php` + `FeedbackStatusEnum.php` (closed enums)
- `src/features/feedback/feedback.schema.ts` (Zod, mirrors SQL constraints exactly)
- `src/features/feedback/feedback.types.ts` (branded `FeedbackReportId`, `FeedbackType`, `FeedbackStatus`)

**Out of Scope** —
- Form UX & optimistic submission → [`./02-submission-flow.md`](./02-submission-flow.md)
- Admin filters & status transitions → [`./03-admin-review-ui.md`](./03-admin-review-ui.md)
- Retention purge job → [`./04-retention-and-export.md`](./04-retention-and-export.md)

**Definition of Done** —
- `AT-FEEDBACKREPORT-01..04` (schema shape, enum closure, PII exclusion, branded ID) all pass.
- Zod schema and SQL CHECK constraints are byte-identical in their value sets (verified by hygiene gate).
- `node scripts/spec-hygiene/00-run-all.mjs` exits 0.

---

## Database — `FeedbackReport` Table

Lives in dedicated `feedback.db` per the [Split-DB pattern](../05-split-db-architecture/00-overview.md). Never co-located with `items.db`.

```sql
CREATE TABLE FeedbackReport (
  FeedbackReportId   INTEGER PRIMARY KEY AUTOINCREMENT,
  SubmittedByUserId  TEXT    NOT NULL,                  -- branded OwnerId on read
  FeedbackType       TEXT    NOT NULL
    CHECK (FeedbackType IN ('Bug','Idea','Praise','Question')),
  Title              TEXT    NOT NULL
    CHECK (length(Title)  BETWEEN 1 AND 120),
  Body               TEXT    NOT NULL
    CHECK (length(Body)   BETWEEN 1 AND 2000),
  DiagnosticsJson    TEXT    NOT NULL,                  -- JSON; shape enforced by Zod at boundary
  ScreenshotBlobRef  TEXT    NULL,                      -- opaque storage key (NEVER raw bytes inline)
  Status             TEXT    NOT NULL DEFAULT 'New'
    CHECK (Status IN ('New','Triaged','InProgress','Resolved','WontFix','Duplicate')),
  SubmittedAt        TEXT    NOT NULL,                  -- ISO-8601 UTC
  ResolvedAt         TEXT    NULL,                      -- ISO-8601 UTC; set on transition to Resolved/WontFix/Duplicate
  PurgeAfter         TEXT    NOT NULL                   -- = SubmittedAt + 90 days; computed at insert
);

CREATE INDEX IX_FeedbackReport_Status_SubmittedAt
  ON FeedbackReport(Status, SubmittedAt DESC);
CREATE INDEX IX_FeedbackReport_SubmittedByUserId
  ON FeedbackReport(SubmittedByUserId, SubmittedAt DESC);
CREATE INDEX IX_FeedbackReport_PurgeAfter
  ON FeedbackReport(PurgeAfter);
```

### Column-level invariants (gate-bound)

| Invariant | Gate |
|---|---|
| All column names are PascalCase per ADR-0004 | `G-04-PASCAL-COLUMNS` |
| Table name is **singular** `FeedbackReport`, never `Feedbacks`/`FeedbackReports` | `G-04-NO-DDL-PLURALS` |
| `FeedbackReportId` is `INTEGER PRIMARY KEY AUTOINCREMENT` (rowid alias forbidden) | `G-33-DM-PK-AUTOINCREMENT` |
| `SubmittedByUserId` MUST be branded `OwnerId` at the TS boundary (raw `string` forbidden per ADR-0020) | `G-33-DM-OWNERID-BRANDED` |
| `FeedbackType` & `Status` are **closed enums** — no free-text values | `G-33-DM-ENUM-CLOSED` |
| `Title`/`Body` length bounds enforced both server-side (CHECK) and client-side (Zod `.max()`) | `G-33-DM-LENGTH-MIRROR` |
| `PurgeAfter = SubmittedAt + 90 days` is computed at INSERT (never recomputed in WHERE) | `G-33-DM-PURGE-AFTER-COMPUTED` |
| `ScreenshotBlobRef` stores an opaque key; raw bytes/base64 in this column is forbidden | `G-33-DM-NO-INLINE-BLOB` |

> **Forbidden in this table:** any column referencing item `Content`, raw `localStorage` dumps, auth tokens, IP addresses, or email bodies. PII boundary is enforced by `G-33-NO-PII` and `G-33-NO-CONTENT-BODY` (defined in parent overview, applied here).

---

## Closed Enums

### `FeedbackType` (4 values)

| Value | Meaning | UI affordance |
|---|---|---|
| `Bug` | Something is broken / incorrect behavior | Red triangle icon |
| `Idea` | Feature request or enhancement | Lightbulb icon |
| `Praise` | Positive feedback | Heart icon |
| `Question` | Usage or support question | Question-mark icon |

Adding a value requires an ADR + migration + Zod-schema bump in the **same PR** (gate `G-33-DM-ENUM-COORDINATED-MIGRATION`).

### `FeedbackStatus` (6 values, with allowed transitions)

| From → To | `New` | `Triaged` | `InProgress` | `Resolved` | `WontFix` | `Duplicate` |
|---|---|---|---|---|---|---|
| `New` | — | ✅ | ✅ | ❌ | ✅ | ✅ |
| `Triaged` | ❌ | — | ✅ | ✅ | ✅ | ✅ |
| `InProgress` | ❌ | ❌ | — | ✅ | ✅ | ✅ |
| `Resolved` | ❌ | ❌ | ❌ | — | ❌ | ❌ |
| `WontFix` | ❌ | ❌ | ❌ | ❌ | — | ❌ |
| `Duplicate` | ❌ | ❌ | ❌ | ❌ | ❌ | — |

- Terminal states (`Resolved`, `WontFix`, `Duplicate`) are **immutable** — no transitions out (gate `G-33-DM-TERMINAL-IMMUTABLE`).
- Backwards transitions (e.g. `InProgress → New`) are forbidden — admins reopen by creating a linked new report instead.
- The transition matrix MUST be encoded as a TS `Record<FeedbackStatus, ReadonlyArray<FeedbackStatus>>` and consumed by the admin UI; a duplicate transition table in the UI layer is forbidden (gate `G-33-DM-TRANSITION-SSOT`).

---

## `Diagnostics` JSON Sub-Shape

Stored serialized in `DiagnosticsJson`. Validated by Zod at both **client write** and **server read** boundaries (no trust of stored JSON shape).

```ts
const DiagnosticsSchema = z.object({
  ClientBuildSha:    z.string().regex(/^[0-9a-f]{7,40}$/),
  CurrentItemId:     ItemIdSchema.nullable(),     // branded; nullable for non-item routes
  BreadcrumbPath:    z.array(ItemIdSchema).max(64),
  ViewportWidthPx:   z.number().int().min(0).max(16384),
  ViewportHeightPx:  z.number().int().min(0).max(16384),
  UserAgent:         z.string().max(512),
  RouteHref:         z.string().max(2048),        // origin-relative path only — NO query strings with PII
  LastErrorBoundary: z.string().nullable(),       // one of the 8 named boundaries, or null
  OfflineQueueDepth: z.number().int().min(0),
}).strict();
```

| Invariant | Gate |
|---|---|
| `.strict()` Zod — unknown keys rejected | `G-33-DM-DIAG-STRICT` |
| `BreadcrumbPath` capped at 64 (cannot exfiltrate deep trees) | `G-33-DM-BREADCRUMB-CAP` |
| `RouteHref` is origin-relative, query string stripped client-side before capture | `G-33-DM-ROUTE-NO-QUERY` |
| No fields named `Email`, `IpAddress`, `Token`, `Cookie`, `Content`, `Body` | `G-33-NO-PII` |
| Same Zod schema imported by server & client (single SSOT in `feedback.schema.ts`) | `G-33-DM-DIAG-SCHEMA-SSOT` |

---

## Branded TypeScript Types (per ADR-0020)

```ts
export type FeedbackReportId = string & { readonly __brand: 'FeedbackReportId' };
export type FeedbackType     = 'Bug' | 'Idea' | 'Praise' | 'Question';
export type FeedbackStatus   = 'New' | 'Triaged' | 'InProgress' | 'Resolved' | 'WontFix' | 'Duplicate';

export const ALLOWED_TRANSITIONS: Readonly<Record<FeedbackStatus, ReadonlyArray<FeedbackStatus>>> = {
  New:        ['Triaged', 'InProgress', 'WontFix', 'Duplicate'],
  Triaged:    ['InProgress', 'Resolved', 'WontFix', 'Duplicate'],
  InProgress: ['Resolved', 'WontFix', 'Duplicate'],
  Resolved:   [],
  WontFix:    [],
  Duplicate:  [],
} as const;
```

- Raw `string` IDs at any module boundary are **forbidden** (gate `G-CG-R-BRANDED-IDS`).
- Enum unions MUST be derived from a single Zod schema, not duplicated as TS literals (gate `G-33-DM-ENUM-DERIVED-FROM-ZOD`).

---

## Acceptance Criteria (Bound Here)

| AT id | Given | When | Then | Negative |
|---|---|---|---|---|
| `AT-FEEDBACKREPORT-01` | Migration applied to empty `feedback.db` | `PRAGMA table_info(FeedbackReport)` is run | All 11 columns present with PascalCase names and exact types | A column named `feedback_report_id` (snake_case) MUST cause migration to fail CI |
| `AT-FEEDBACKREPORT-02` | Valid row with `FeedbackType='Bug'` | INSERT executes | Row persisted, `FeedbackReportId` returned | INSERT with `FeedbackType='Spam'` MUST fail with CHECK constraint error |
| `AT-FEEDBACKREPORT-03` | A status transition request `Resolved → InProgress` arrives | Admin UI handler runs | Transition is rejected with code `INVALID_TRANSITION` | Server MUST NOT update the row even if SQL UPDATE would succeed (matrix is enforced in app layer) |
| `AT-FEEDBACKREPORT-04` | Diagnostics payload contains `{ Email: "x@y.z" }` | Zod validation runs at server boundary | Validation fails with `unknown_keys` error | Row MUST NOT be inserted; PII never reaches disk |

Fixtures live in [`./97a-acceptance-criteria-fixtures.md`](./97a-acceptance-criteria-fixtures.md) (rows `at-feedbackreport-01..04`). Test names: `at_feedback_report_01_schema_shape`, `at_feedback_report_02_type_enum_closed`, `at_feedback_report_03_transition_matrix`, `at_feedback_report_04_pii_rejected`.

---

## Gate Bindings (12 new gates, namespace `G-33-DM-*`)

| Gate id | MUST | Tier |
|---|---|---|
| `G-33-DM-PK-AUTOINCREMENT` | `FeedbackReportId` is `INTEGER PRIMARY KEY AUTOINCREMENT` | DOC |
| `G-33-DM-OWNERID-BRANDED` | `SubmittedByUserId` exposed as branded `OwnerId` at TS boundary | DOC |
| `G-33-DM-ENUM-CLOSED` | `FeedbackType` & `Status` are closed enums (no free text) | DOC |
| `G-33-DM-LENGTH-MIRROR` | Title/Body length bounds present in BOTH SQL CHECK and Zod | CI (hygiene cross-check) |
| `G-33-DM-PURGE-AFTER-COMPUTED` | `PurgeAfter = SubmittedAt + 90d` set at INSERT | DOC |
| `G-33-DM-NO-INLINE-BLOB` | `ScreenshotBlobRef` stores opaque key only | DOC |
| `G-33-DM-ENUM-COORDINATED-MIGRATION` | Enum value additions land with ADR + migration + Zod in one PR | DOC |
| `G-33-DM-TERMINAL-IMMUTABLE` | Terminal statuses have no outbound transitions | DOC |
| `G-33-DM-TRANSITION-SSOT` | `ALLOWED_TRANSITIONS` is the sole transition table | DOC |
| `G-33-DM-DIAG-STRICT` | Diagnostics Zod uses `.strict()` | DOC |
| `G-33-DM-BREADCRUMB-CAP` | `BreadcrumbPath` length ≤64 | DOC |
| `G-33-DM-DIAG-SCHEMA-SSOT` | Same Zod schema imported by client & server | CI (import-graph check) |

(Full 14-gate list incl. `G-33-DM-ROUTE-NO-QUERY` and `G-33-DM-ENUM-DERIVED-FROM-ZOD` registered in [`spec/_GATE-REGISTRY.md`](../_GATE-REGISTRY.md) under `G-33-DM-*`.)

---

## Anti-Pattern Table

| Anti-pattern | Why it fails | Gate violated |
|---|---|---|
| Storing screenshot bytes inline as base64 in `ScreenshotBlobRef` | Bloats SQLite; breaks 90-day purge perf | `G-33-DM-NO-INLINE-BLOB` |
| Diagnostics Zod uses `.passthrough()` | Allows future PII keys to slip through | `G-33-DM-DIAG-STRICT` |
| Admin UI keeps its own `STATUS_TRANSITIONS` constant | Diverges from data-model SSOT; matrix drift | `G-33-DM-TRANSITION-SSOT` |
| Recomputing `SubmittedAt + 90d` in retention job's WHERE clause | Disables `IX_FeedbackReport_PurgeAfter` index | `G-33-DM-PURGE-AFTER-COMPUTED` |
| Adding `Spam` to `FeedbackType` only in the SQL CHECK without bumping Zod | Server accepts, client crashes on read | `G-33-DM-ENUM-COORDINATED-MIGRATION` |
| Exposing `SubmittedByUserId` as `string` in API response types | Violates branded-ID invariant; allows ID-confusion bugs | `G-33-DM-OWNERID-BRANDED` |

---

## Cross-References

| Reference | Location |
|---|---|
| Parent overview | [`./00-overview.md`](./00-overview.md) |
| Submission flow (consumes this schema) | [`./02-submission-flow.md`](./02-submission-flow.md) *(pending)* |
| Admin review UI (consumes transition matrix) | [`./03-admin-review-ui.md`](./03-admin-review-ui.md) *(pending)* |
| Retention & purge (consumes `PurgeAfter`) | [`./04-retention-and-export.md`](./04-retention-and-export.md) *(pending)* |
| PascalCase column convention | ADR-0004 |
| Branded IDs | ADR-0020 |
| Split-DB pattern | [`../05-split-db-architecture/00-overview.md`](../05-split-db-architecture/00-overview.md) |

---

*Sub-spec v1.0.0 — first of 4 in `33-feedback-report/` cluster — 2026-04-30*
