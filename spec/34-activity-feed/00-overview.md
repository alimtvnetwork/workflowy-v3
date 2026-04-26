# Activity Feed — Feature Spec
## Scoring

| Criterion | Status |
|-----------|--------|
| `00-overview.md` present | ✅ |
| AI Confidence assigned | ✅ |
| Ambiguity assigned | ✅ |
| Keywords present | ✅ |
| Scoring table present | ✅ |

**AI Confidence:** Medium <!-- TODO: re-grade after manual review (auto-backfilled 2026-04-26) -->  
**Ambiguity:** Medium <!-- TODO: re-grade after manual review (auto-backfilled 2026-04-26) -->

---


> **Version:** 2.0.0  
> **Updated:** 2026-04-19  
> **Status:** Planned (not yet implemented)

---

## Keywords

`activity-feed` · `audit-log` · `event-stream` · `e2` · `notifications`

---

## Scoring

| Criterion | Status |
|-----------|--------|
| Overview present | ✅ |
| Confidence rated | ✅ |
| Ambiguity rated | ✅ |
| Keywords present | ✅ |
| Scoring table present | ✅ |

## Confidence

Draft (high-level only) · Ambiguity: Medium (sub-specs pending)

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
