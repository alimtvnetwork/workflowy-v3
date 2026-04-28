# Activity Feed — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 16 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-ACTIVITYFEED-01` … `AT-ACTIVITYFEED-16`

---

## Criteria

### Event capture

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ACTIVITYFEED-01 | Every mutating action through the editor MUST emit exactly ONE `ActivityEvent` (FR-1); double-emits or missing emits are Code-Red audit-integrity bugs. | [`00-overview.md`](./00-overview.md) |
| AT-ACTIVITYFEED-02 | `ActivityEvent` MUST carry: `EventId`, `UserId`, `ItemId`, `EventType` (typed enum), `Before` snapshot, `After` snapshot, `CreatedAt` (UTC, ISO-8601). Missing any field fails review. | [`00-overview.md`](./00-overview.md) |
| AT-ACTIVITYFEED-03 | `EventType` MUST be the documented enum (`ItemCreated`, `ItemUpdated`, `ItemMoved`, `ItemDeleted`, `ItemRestored`, `ItemMirrored`, `BoardColumnReordered`, `TemplateApplied`); adding a new type MUST update the enum + this AT — magic-string types are forbidden. | [`00-overview.md`](./00-overview.md) |

### Storage

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ACTIVITYFEED-04 | Events MUST persist in a dedicated `activity.db` SQLite (Split-DB pattern, FR-6); sharing user-data DB is forbidden because it slows read paths. | [`00-overview.md`](./00-overview.md), [`../05-split-db-architecture/01-fundamentals/97-acceptance-criteria.md`](../05-split-db-architecture/01-fundamentals/97-acceptance-criteria.md) |
| AT-ACTIVITYFEED-05 | The `ActivityEvent` table MUST follow naming conventions: singular PascalCase, `EventId` PK, indexed on `(UserId, CreatedAt DESC)` for the default feed query. | [`00-overview.md`](./00-overview.md) |
| AT-ACTIVITYFEED-06 | `Before`/`After` snapshots MUST be stored as JSON columns (NOT serialized as opaque blobs) so future tooling can diff them; opaque blobs fail review. | [`00-overview.md`](./00-overview.md) |

### Feed UI

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ACTIVITYFEED-07 | Default feed page size MUST be 50 (FR-3) — well below the 250-item view limit; uncapped pagination is a Code-Red perf bug. | [`00-overview.md`](./00-overview.md) |
| AT-ACTIVITYFEED-08 | Feed MUST support filters: `eventType`, `userId`, `dateRange`, `itemSubtree`; filter combination MUST be server-side (client-side filtering on the full table is forbidden). | [`00-overview.md`](./00-overview.md) |
| AT-ACTIVITYFEED-09 | Per-item history MUST be reachable from the item context menu (FR-4); hiding it under a hidden flag fails review. | [`00-overview.md`](./00-overview.md) |

### Restore semantics

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ACTIVITYFEED-10 | "Restore to this state" MUST reapply the inverse of the recorded event (FR-5); silent best-effort restore that drops fields is a Code-Red data-loss bug. | [`00-overview.md`](./00-overview.md) |
| AT-ACTIVITYFEED-11 | Reversibility MUST match the table: `Created/Updated/Moved/Deleted/Restored/Mirrored/BoardColumnReordered` are fully reversible; `TemplateApplied` is partial — UI MUST show a clear warning before partial restores. | [`00-overview.md`](./00-overview.md) |
| AT-ACTIVITYFEED-12 | Every restore MUST itself emit an `ActivityEvent` (audit of the audit) so the chain stays inspectable; silent restores are forbidden. | [`00-overview.md`](./00-overview.md) |

### Retention & purge

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ACTIVITYFEED-13 | Retention MUST be 30 days by default (FR-7), mirroring trash retention; silent extension beyond 30 d is forbidden — config must be explicit and audited. | [`00-overview.md`](./00-overview.md) |
| AT-ACTIVITYFEED-14 | Weekly purge job MUST log per-purge counts at INFO and MUST NOT delete events that are referenced by an in-flight restore operation. | [`00-overview.md`](./00-overview.md) |

### Authorization

| ID | Criterion | Source |
|----|-----------|--------|
| AT-ACTIVITYFEED-15 | A user MUST only see events for items they own OR are shared with (Editor/Admin); cross-user visibility for non-Admins is a Code-Red privacy bug. | [`00-overview.md`](./00-overview.md), [`../36-user-management/97-acceptance-criteria.md`](../36-user-management/97-acceptance-criteria.md) |
| AT-ACTIVITYFEED-16 | Admin "view audit for other users" capability MUST go through the central `hasRole(userId, 'Admin')` helper; bypassing it is forbidden. | [`00-overview.md`](./00-overview.md), [`../36-user-management/97-acceptance-criteria.md`](../36-user-management/97-acceptance-criteria.md) |

---

## Fixtures

I/O fixtures for `AT-ACTIVITYFEED-01..16` live in [`97a-acceptance-criteria-fixtures.md`](./97a-acceptance-criteria-fixtures.md).

---

## Verification

```bash
# Event-emit hooks present on every mutator
rg -nP "emitActivity\(" src/store/

# Default page size honoured
rg -nP "DEFAULT_FEED_PAGE_SIZE\s*=\s*50" src/

# Hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../05-split-db-architecture/01-fundamentals/97-acceptance-criteria.md`](../05-split-db-architecture/01-fundamentals/97-acceptance-criteria.md) — Dedicated SQLite placement
- [`../36-user-management/97-acceptance-criteria.md`](../36-user-management/97-acceptance-criteria.md) — Role gating
- [`../31-app/01-features/15-roles-and-permissions.md`](../31-app/01-features/15-roles-and-permissions.md) — Capability matrix SSOT

---

*Curated 2026-04-25 — closes batch-16 item 3. Replaces v1.0.0 scaffold.*
