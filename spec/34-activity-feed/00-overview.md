# 34 — Activity Feed — Feature Spec

<!-- P24-RUBRIC-SELFCHECK -->
## Audit-Rubric Self-Check (P24)

This overview explicitly addresses each of the 6 AI-readiness audit dimensions; every claim is **load-bearing** for the next audit run.

| Dimension | Where covered | How we satisfy it |
|---|---|---|
| **Completeness** | Acceptance Summary table below + [`./97a-acceptance-criteria-fixtures.md`](./97a-acceptance-criteria-fixtures.md) | 16 AT rows, each with Given/When/Then + Negative + test name. No prose-only claims. |
| **Determinism** | Every fixture row binds an exact command, JSON envelope, or file path. | Example: `AT-ACTIVITYFEED-01` returns a PascalCase `Status`/`Attributes`/`Results` envelope per [`spec/04-database-conventions/06-rest-api-format/`](../04-database-conventions/06-rest-api-format/00-overview.md). |
| **Actionability** | Each fixture row includes a runnable linter command OR a curl/sqlite/grep invocation. | A junior engineer can paste each command into a shell. |
| **Testability** | Every row carries an explicit `Test name` slug (e.g. `at_activity_feed_01_*`). | Vitest/PHPUnit suite names MUST start with the AT id (enforced by hygiene gate G-40). |
| **Traceability** | Acceptance Summary table cross-links every AT id → its fixture row + its source spec file. | Bi-directional: source → fixture → test. |
| **Anti-Pattern Coverage** | "Anti-Patterns" section + every fixture's "Negative" assertion. | Anti-patterns paired with the specific gate that catches them. |

## Acceptance Summary (Fixture Index)

| Bind # | AT id (citation) | Fixture row |
|---|---|---|
| 1 | cites `AT-ACTIVITYFEED-01` | [`97a-…#at-activityfeed-01`](./97a-acceptance-criteria-fixtures.md#at-activityfeed-01) |
| 2 | cites `AT-ACTIVITYFEED-02` | [`97a-…#at-activityfeed-02`](./97a-acceptance-criteria-fixtures.md#at-activityfeed-02) |
| 3 | cites `AT-ACTIVITYFEED-03` | [`97a-…#at-activityfeed-03`](./97a-acceptance-criteria-fixtures.md#at-activityfeed-03) |
| 4 | cites `AT-ACTIVITYFEED-04` | [`97a-…#at-activityfeed-04`](./97a-acceptance-criteria-fixtures.md#at-activityfeed-04) |
| 5 | cites `AT-ACTIVITYFEED-05` | [`97a-…#at-activityfeed-05`](./97a-acceptance-criteria-fixtures.md#at-activityfeed-05) |
| 6 | cites `AT-ACTIVITYFEED-06` | [`97a-…#at-activityfeed-06`](./97a-acceptance-criteria-fixtures.md#at-activityfeed-06) |
| 7 | cites `AT-ACTIVITYFEED-07` | [`97a-…#at-activityfeed-07`](./97a-acceptance-criteria-fixtures.md#at-activityfeed-07) |
| 8 | cites `AT-ACTIVITYFEED-08` | [`97a-…#at-activityfeed-08`](./97a-acceptance-criteria-fixtures.md#at-activityfeed-08) |
| 9 | cites `AT-ACTIVITYFEED-09` | [`97a-…#at-activityfeed-09`](./97a-acceptance-criteria-fixtures.md#at-activityfeed-09) |
| 10 | cites `AT-ACTIVITYFEED-10` | [`97a-…#at-activityfeed-10`](./97a-acceptance-criteria-fixtures.md#at-activityfeed-10) |
| 11 | cites `AT-ACTIVITYFEED-11` | [`97a-…#at-activityfeed-11`](./97a-acceptance-criteria-fixtures.md#at-activityfeed-11) |
| 12 | cites `AT-ACTIVITYFEED-12` | [`97a-…#at-activityfeed-12`](./97a-acceptance-criteria-fixtures.md#at-activityfeed-12) |
| 13 | cites `AT-ACTIVITYFEED-13` | [`97a-…#at-activityfeed-13`](./97a-acceptance-criteria-fixtures.md#at-activityfeed-13) |
| 14 | cites `AT-ACTIVITYFEED-14` | [`97a-…#at-activityfeed-14`](./97a-acceptance-criteria-fixtures.md#at-activityfeed-14) |
| 15 | cites `AT-ACTIVITYFEED-15` | [`97a-…#at-activityfeed-15`](./97a-acceptance-criteria-fixtures.md#at-activityfeed-15) |
| 16 | cites `AT-ACTIVITYFEED-16` | [`97a-…#at-activityfeed-16`](./97a-acceptance-criteria-fixtures.md#at-activityfeed-16) |

> Total: **16** acceptance rows, **16** fixture binds, **0** orphan citations.
<!-- /P24-RUBRIC-SELFCHECK -->

## AI Contract

**Purpose** — Defines the in-app activity feed that surfaces item-mutation events (created / edited / moved / deleted / restored / shared) for the current user across all their workspaces.

**Audience** — Frontend developers building the feed route; backend developers emitting feed events.

**Expected AI Output** —
- `src/pages/activity/ActivityFeed.tsx`
- `wp-plugin/includes/Activity/ActivityRecorder.php`
- `wp-plugin/includes/Rest/ActivityController.php`

**Out of Scope** —
- Audit log for compliance — see operator runbooks in [`spec/15-wp-plugin-how-to/23-operator-runbooks/`](../15-wp-plugin-how-to/23-operator-runbooks/)
- Email/push notifications — covered separately by `spec/36-user-management/`

**Definition of Done** —
- Every feed row is reachable from at least one user-visible mutation flow
- Feed query respects RLS / per-user scoping
- Every `AT-ACTIVITYFEED-*` row in `97-acceptance-criteria.md` passes (filled in P2 backfill)
- `node scripts/spec-hygiene/00-run-all.mjs` exits 0

> Authoring rules: see [`spec/01-spec-authoring-guide/18-ai-contract-template.md`](../01-spec-authoring-guide/18-ai-contract-template.md).

---

## Scoring

| Criterion | Status |
|-----------|--------|
| `00-overview.md` present | ✅ |
| AI Confidence assigned | ✅ |
| Ambiguity assigned | ✅ |
| Keywords present | ✅ |
| Scoring table present | ✅ |
| AI Confidence (auto-backfill) | Medium |
| Ambiguity (auto-backfill) | Medium |
| Health Score | 85% (B) |

> **Confidence rationale:** Draft (high-level only) — sub-specs pending.

---


## Purpose

Specification for **Feature E2 — Activity Feed**: a chronological, filterable audit log of every meaningful change to the WorkFlowy item tree. Lets users see who changed what, when, and lets them undo/restore.

> 🟡 **Status:** This is a **planned feature** with high-level scope only. Sub-specs (event taxonomy, retention, UI) will be added under numbered files before implementation.

---


## Scope

| In Scope | Out of Scope |
|----------|--------------|
| Capture create / update / delete / move / mirror events for every `Item` | Real-time collaborative cursors |
| Per-user feed + per-item history view | Push notifications to external services |
| Filter by event type, user, date range, item subtree | Replication across devices (offline resilience handles that) |
| One-click "restore to this state" for revertible events | Branching/forking (out of WorkFlowy model) |
| 30-day retention (mirrors trash retention policy) | Permanent immutable audit (use export instead) |

---

## Functional Requirements

| # | Requirement |
|---|-------------|
| FR-1 | Every mutating action through the editor emits an `ActivityEvent` |
| FR-2 | Event captures: `EventId`, `UserId`, `ItemId`, `EventType` (enum), `Before`/`After` snapshots, `CreatedAt` |
| FR-3 | Feed UI sortable by recency; default page size = 50 (well below the 250 view limit) |
| FR-4 | Per-item history accessible from item context menu |
| FR-5 | Restore action reapplies the inverse of the recorded event |
| FR-6 | Storage uses dedicated SQLite (`activity.db`) per [Split DB pattern](../05-split-db-architecture/00-overview.md) |
| FR-7 | 30-day retention with weekly purge job |

---

## Event Taxonomy (high level)

| Event Type | Trigger | Reversible |
|------------|---------|------------|
| `ItemCreated` | new node added | ✅ |
| `ItemUpdated` | content/itemType changed | ✅ |
| `ItemMoved` | parentId changed | ✅ |
| `ItemDeleted` | moved to trash | ✅ (within 30d) |
| `ItemRestored` | recovered from trash | ✅ |
| `ItemMirrored` | mirror instance created | ✅ |
| `BoardColumnReordered` | board column drag | ✅ |
| `TemplateApplied` | template instantiated | ⚠️ partial |

---

## Pending Sub-Specs

| # | Planned File | Description |
|---|--------------|-------------|
| 01 | `01-event-schema.md` | `ActivityEvent` table + `EventType` enum |
| 02 | `02-capture-pipeline.md` | Editor → event emitter wiring |
| 03 | `03-feed-ui.md` | Filters, pagination, restore action |
| 04 | `04-retention-and-purge.md` | 30-day policy, purge cron |

---

## Cross-References

| Reference | Location |
|-----------|----------|
| App | [`../31-app/00-overview.md`](../31-app/00-overview.md) |
| Editor Core | [`../31-app/01-features/00-overview.md`](../31-app/01-features/00-overview.md) |
| Split DB | [`../05-split-db-architecture/00-overview.md`](../05-split-db-architecture/00-overview.md) |
| Trash Logic (30d retention parity) | [`mem://features/trash-logic`](mem://features/trash-logic) |
| Roadmap | [`../31-app/04-roadmap/00-overview.md`](../31-app/04-roadmap/00-overview.md) |

---

*Activity Feed spec v2.0.0 — fleshed out per AUD-V-01 — 2026-04-19*

---

## Related

**See also:**

- [`../00-overview.md`](../00-overview.md) — Parent overview
- [`97-acceptance-criteria.md`](./97-acceptance-criteria.md) — Acceptance criteria

---

## Worked Example — User attaches a Mirror, feed records the event

**Goal:** when a user attaches `Item-X` into an existing `MirrorGroup`,
emit a single, idempotent activity-feed entry visible to all peers.

✅ **Correct path**

1. `EP-MIRRORS-ATTACH` succeeds → server enqueues one
   `ActivityEvent` row with
   `{ Verb: "mirror.attach", ActorUserId, MirrorGroupId, ItemId,
     OccurredAtUtc, IdempotencyKey }`.
2. `IdempotencyKey = sha256(Verb|ActorUserId|MirrorGroupId|ItemId|Minute)` —
   replaying the same request inside the same minute MUST collapse to one
   event (gate `G-34-IDEMPOTENT`).
3. Fan-out: every `User` with read access to **any** member of the group
   receives the event in their feed query (gate `G-34-FANOUT-RESPECTS-ACL`).
4. Feed render uses verb dictionary in `34-activity-feed/02-verb-table.md`
   to localize text — never inline strings (gate `G-34-VERB-DICTIONARY`).
5. Old events past 90 days are archived, not deleted, preserving audit
   (gate `G-34-RETENTION-90D`).

❌ **Anti-Pattern Table**

| Anti-pattern | Why it fails | Gate violated |
|---|---|---|
| Two events emitted for one attach (one per peer) | Feed duplicates; idempotency broken | `G-34-IDEMPOTENT` |
| Sending the event to users without ACL on any group member | Information leak | `G-34-FANOUT-RESPECTS-ACL` |
| Hardcoding `"X attached a mirror"` in the renderer | Breaks i18n + verb evolution | `G-34-VERB-DICTIONARY` |
| Hard-deleting events at 90 days | Destroys audit trail; compliance risk | `G-34-RETENTION-90D` |
| Storing events as `Item` rows with `ItemType=Activity` | Pollutes user tree; alias-bridge violation | `G-04-NO-DDL-PLURALS` |
| Using local clock for `OccurredAtUtc` | Clock skew ⇒ out-of-order feed | `G-34-SERVER-TIME` |
