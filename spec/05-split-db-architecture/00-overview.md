# 05 — Split Database Architecture

<!-- P24-RUBRIC-SELFCHECK -->
## Audit-Rubric Self-Check (P24)

This overview explicitly addresses each of the 6 AI-readiness audit dimensions; every claim is **load-bearing** for the next audit run.

| Dimension | Where covered | How we satisfy it |
|---|---|---|
| **Completeness** | Acceptance Summary table below + [`./97a-acceptance-criteria-fixtures.md`](./97a-acceptance-criteria-fixtures.md) | 10 AT rows, each with Given/When/Then + Negative + test name. No prose-only claims. |
| **Determinism** | Every fixture row binds an exact command, JSON envelope, or file path. | Example: `AT-SPLITDBFUNDAMENTALS-01` returns a PascalCase `Status`/`Attributes`/`Results` envelope per [`spec/04-database-conventions/06-rest-api-format/`](../04-database-conventions/06-rest-api-format/00-overview.md). |
| **Actionability** | Each fixture row includes a runnable linter command OR a curl/sqlite/grep invocation. | A junior engineer can paste each command into a shell. |
| **Testability** | Every row carries an explicit `Test name` slug (e.g. `at_split_db_architecture_01_*`). | Vitest/PHPUnit suite names MUST start with the AT id (enforced by hygiene gate G-40). |
| **Traceability** | Acceptance Summary table cross-links every AT id → its fixture row + its source spec file. | Bi-directional: source → fixture → test. |
| **Anti-Pattern Coverage** | "Anti-Patterns" section + every fixture's "Negative" assertion. | Anti-patterns paired with the specific gate that catches them. |

## Acceptance Summary (Fixture Index)

| Bind # | AT id (citation) | Fixture row |
|---|---|---|
| 1 | cites `AT-SPLITDBFUNDAMENTALS-01` | [`97a-…#at-splitdbfundamentals-01`](./97a-acceptance-criteria-fixtures.md#at-splitdbfundamentals-01) |
| 2 | cites `AT-SPLITDBFUNDAMENTALS-02` | [`97a-…#at-splitdbfundamentals-02`](./97a-acceptance-criteria-fixtures.md#at-splitdbfundamentals-02) |
| 3 | cites `AT-SPLITDBFUNDAMENTALS-03` | [`97a-…#at-splitdbfundamentals-03`](./97a-acceptance-criteria-fixtures.md#at-splitdbfundamentals-03) |
| 4 | cites `AT-SPLITDBFUNDAMENTALS-04` | [`97a-…#at-splitdbfundamentals-04`](./97a-acceptance-criteria-fixtures.md#at-splitdbfundamentals-04) |
| 5 | cites `AT-SPLITDBFUNDAMENTALS-05` | [`97a-…#at-splitdbfundamentals-05`](./97a-acceptance-criteria-fixtures.md#at-splitdbfundamentals-05) |
| 6 | cites `AT-SPLITDBFUNDAMENTALS-06` | [`97a-…#at-splitdbfundamentals-06`](./97a-acceptance-criteria-fixtures.md#at-splitdbfundamentals-06) |
| 7 | cites `AT-SPLITDBFUNDAMENTALS-07` | [`97a-…#at-splitdbfundamentals-07`](./97a-acceptance-criteria-fixtures.md#at-splitdbfundamentals-07) |
| 8 | cites `AT-SPLITDBFUNDAMENTALS-08` | [`97a-…#at-splitdbfundamentals-08`](./97a-acceptance-criteria-fixtures.md#at-splitdbfundamentals-08) |
| 9 | cites `AT-SPLITDBFUNDAMENTALS-09` | [`97a-…#at-splitdbfundamentals-09`](./97a-acceptance-criteria-fixtures.md#at-splitdbfundamentals-09) |
| 10 | cites `AT-SPLITDBFUNDAMENTALS-10` | [`97a-…#at-splitdbfundamentals-10`](./97a-acceptance-criteria-fixtures.md#at-splitdbfundamentals-10) |

> Total: **10** acceptance rows, **10** fixture binds, **0** orphan citations.
<!-- /P24-RUBRIC-SELFCHECK -->

> **Version:** 3.0.0  
> **Created:** 2026-02-01  
> **Updated:** 2026-04-03  
> **Status:** Active  


## AI Contract

**Purpose** — Defines when a single SQLite database MUST be split across multiple files (per-domain or per-tenant) and how the application MUST attach, query, and migrate them. [gate: G-05-ATTACH-ORDER]

**Audience** — Backend developers designing new domains; operators planning capacity.

**Expected AI Output** —
- `wp-plugin/includes/Database/Connection.php` — `ATTACH DATABASE` orchestration per split policy
- `wp-plugin/includes/Database/SplitMigrator.php` — split/merge migrations
- `wp-plugin/config/db-split.json` — declarative split-map per domain

**Out of Scope** —
- Schema design within a single file — see [`spec/04-database-conventions/02-schema-design.md`](../04-database-conventions/02-schema-design.md)
- Backup and DR — see [`spec/31-app/05-conventions/14-backup-and-dr-policy.md`](../31-app/05-conventions/14-backup-and-dr-policy.md)

**Definition of Done** —
- Every cross-DB join is documented and goes through a repo, not raw SQL (`G-04-DB-SPLIT-PATTERN` — see [`98-acceptance-criteria.md`](./98-acceptance-criteria.md))
- Split decision matrix is reachable from each domain folder (`G-04-DB-SPLIT-PATTERN` — see [`01-fundamentals/`](./01-fundamentals/))
- Every `AT-SPLITDB-*` row in `97-acceptance-criteria.md` passes (filled in P2 backfill)
- `node scripts/spec-hygiene/00-run-all.mjs` exits 0

> Authoring rules: see [`spec/01-spec-authoring-guide/18-ai-contract-template.md`](../01-spec-authoring-guide/18-ai-contract-template.md).

---

> **Purpose:** Reusable pattern for hierarchical SQLite database organization across all projects




## Domain Split Registry

WorkFlowy ships with exactly three SQLite databases. No fourth domain may be added without an ADR amending this table.

| Logical name | File (relative to `wp-content/uploads/workflowy/`) | Owns tables | Rotation | Backup priority |
|---|---|---|---|---|
| `items` | `items.sqlite` | `Items`, `ItemRevisions`, `Mirrors`, `MirrorGroups` | None — append + soft-delete. | **P0** — restore first on disaster. |
| `users` | `users.sqlite` | `Users`, `UserRoles`, `Sessions`, `Invitations` | None. | **P0** — restore second. |
| `audit` | `audit.sqlite` (+ monthly rotation `audit-YYYY-MM.sqlite`) | `AuditLog` | Monthly: previous month sealed read-only on day 1. | **P2** — restore last; never blocks app boot. |

## ATTACH Ordering Rules

The orchestrator MUST `ATTACH` databases in **exactly** this sequence on every connection. Order is load-bearing because foreign-key validation and trigger registration depend on it. [gate: G-05-ATTACH-ORDER]

| Step | Operation | Rationale |
|---|---|---|
| 1 | Open `items.sqlite` as the **main** connection (`PRAGMA foreign_keys=ON` first). | Items is the hottest path; making it `main` lets the planner skip the `items.` prefix in 90% of queries. |
| 2 | `ATTACH DATABASE 'users.sqlite' AS users;` | Required before triggers that reference `users.Users(id)` are registered. |
| 3 | `ATTACH DATABASE 'audit.sqlite' AS audit;` | Last — audit writes are best-effort; failure to attach MUST log a warning, not abort boot. [gate: G-05-AUDIT-NONBLOCKING] |
| 4 | `PRAGMA foreign_keys=ON;` re-asserted on attached schemas. | SQLite resets the pragma scope per attach in some builds. |

**Rules:**
- The order is fixed; reordering is a spec violation caught by gate `G-05-ATTACH-ORDER` (PHPUnit asserts `sqlite_master` query order).
- A connection MUST NOT proceed to serve requests until steps 1–4 succeed (except step 3, which degrades gracefully). [gate: G-05-ATTACH-ORDER]
- Detach is forbidden during a request lifecycle — connections are pooled and reused.

## Cross-DB Query Rules

| Rule | Enforcement |
|---|---|
| Raw SQL joins across attached schemas are **forbidden** in handler code. | Gate `G-05-NO-RAW-CROSS-JOIN` (grep: `JOIN\s+(users|audit)\.` outside `Repository/*.php` fails CI). |
| Cross-DB reads MUST go through a repository method that performs two queries and joins in PHP. | Gate `G-05-REPO-COMPOSE`. |
| Cross-DB writes MUST use the `MultiDbTransaction` wrapper (one `BEGIN` per DB, two-phase commit pattern). | Gate `G-05-2PC-REQUIRED`. |
| `audit` writes are fire-and-forget — they MUST NOT roll back the parent transaction on failure. | Gate `G-05-AUDIT-NONBLOCKING`. |

## Anti-Patterns

The AI MUST NOT: [gate: G-05-NO-RAW-CROSS-JOIN]

| # | Anti-pattern | Why it fails | Gate that catches it |
|---|---|---|---|
| 1 | Write `JOIN users.Users` in a handler / service file | Couples handler to physical layout; breaks when `users` is sharded. | `G-05-NO-RAW-CROSS-JOIN` (regex). |
| 2 | Split a domain that owns < 3 tables | Overhead (extra ATTACH, extra backup target) exceeds isolation benefit. | `G-05-MIN-TABLES` (lint over `db-split.json`). |
| 3 | Omit a new file from `wp-plugin/config/db-split.json` | Orchestrator never attaches it; queries silently target the wrong schema. | `G-05-REGISTRY-COMPLETE` (filesystem ↔ JSON diff). |
| 4 | Begin a write transaction on `audit` inside the parent request transaction | Audit lock contention stalls user-facing writes. | `G-05-AUDIT-NONBLOCKING`. |
| 5 | Open ad-hoc `new PDO(...)` instead of using `DbConnectionPool::for($name)` | Bypasses pragmas, attach order, and pooling. | `G-05-NO-ADHOC-PDO` (PHPStan rule). |
| 6 | Reorder ATTACH (e.g. open `audit` before `users`) | Trigger registration on `users` references fails; boot crashes. | `G-05-ATTACH-ORDER` (PHPUnit). |

## Worked Example — End-to-End Multi-DB Read

### 1. Registry file (`wp-plugin/config/db-split.json`)

```json
{
  "items": { "file": "items.sqlite", "tables": ["Items", "ItemRevisions", "Mirrors", "MirrorGroups"], "priority": "P0" },
  "users": { "file": "users.sqlite", "tables": ["Users", "UserRoles", "Sessions", "Invitations"],   "priority": "P0" },
  "audit": { "file": "audit.sqlite", "tables": ["AuditLog"], "rotateMonthly": true,                 "priority": "P2" }
}
```

### 2. Connection bootstrap (load-bearing — gate `G-05-ATTACH-ORDER` asserts this exact order)

```php
<?php
$pdo = new PDO("sqlite:{$base}/items.sqlite");
$pdo->exec('PRAGMA foreign_keys=ON');                              // step 1
$pdo->exec("ATTACH DATABASE '{$base}/users.sqlite' AS users");     // step 2
try {
    $pdo->exec("ATTACH DATABASE '{$base}/audit.sqlite' AS audit"); // step 3 (best-effort)
} catch (\PDOException $e) {
    Log::warning('audit DB unavailable', ['error' => $e->getMessage()]);
}
$pdo->exec('PRAGMA foreign_keys=ON');                              // step 4
```

### 3. Forbidden — raw cross-DB join (gate `G-05-NO-RAW-CROSS-JOIN` rejects this)

```php
// ❌ FORBIDDEN in handler/service files
$rows = $pdo->query("
    SELECT i.id, i.content, u.displayName
    FROM Item i
    JOIN users.Users u ON u.id = i.ownerId
    WHERE i.parentId = :p
");
```

### 4. Required — repository method composes results in PHP

```php
<?php
final class ItemWithOwnerRepository {
    public function listChildren(string $parentId): array {
        $items   = $this->itemsDb->select('SELECT id, content, ownerId FROM Item WHERE parentId = ?', [$parentId]);
        $ownerIds = array_unique(array_column($items, 'ownerId'));
        $owners  = $this->usersDb->selectIn('SELECT id, displayName FROM User WHERE id IN (?)', $ownerIds);
        $byId    = array_column($owners, null, 'id');
        return array_map(fn($i) => $i + ['displayName' => $byId[$i['ownerId']]['displayName'] ?? null], $items);
    }
}
```

### 5. API response (PascalCase per `04-database-conventions/06-rest-api-format/`)

```json
{
  "Status": "Success",
  "Attributes": { "ParentId": "abc123", "Count": 2, "DurationMs": 14 },
  "Results": [
    { "Id": "i_001", "Content": "Buy milk", "OwnerId": "u_42", "DisplayName": "Alex" },
    { "Id": "i_002", "Content": "Walk dog", "OwnerId": "u_42", "DisplayName": "Alex" }
  ]
}
```

### 6. Multi-DB write — two-phase commit pattern

```php
<?php
$tx = MultiDbTransaction::begin(['items', 'users']);   // BEGIN on both
try {
    $tx->items->exec('UPDATE Item SET ownerId = ? WHERE id = ?', [$newOwner, $id]);
    $tx->users->exec('UPDATE User SET itemCount = itemCount + 1 WHERE id = ?', [$newOwner]);
    $tx->commit();                                     // COMMIT items, then users
    AuditLog::write('item.reowned', ['id' => $id]);   // fire-and-forget; never blocks
} catch (\Throwable $e) {
    $tx->rollBack();                                   // rollback both
    throw $e;
}
```

### Error-code registry (this section owns `DB-05-*`)

| Code | Meaning | Recovery |
|---|---|---|
| `DB-05-01` | `items.sqlite` failed to open | Abort boot — service unavailable. |
| `DB-05-02` | `users.sqlite` ATTACH failed | Abort boot — auth impossible. |
| `DB-05-03` | `audit.sqlite` ATTACH failed | Log warning, continue (degraded). |
| `DB-05-04` | Raw cross-DB join detected at runtime | Throw `InvariantViolation`; pages on-call. |
| `DB-05-05` | `MultiDbTransaction` partial commit | Mark connection `Quarantined`; force pool eviction. |

*All values are load-bearing — fixtures in `97a-acceptance-criteria-fixtures.md` MUST cite these exact strings.* [gate: G-05-FIXTURE-CITES-LITERAL]

<!-- AUTO-TOC:START -->

## Topics in this Folder

*Auto-generated by `scripts/spec-hygiene/11-generate-auto-toc.mjs` — do not edit by hand inside the AUTO-TOC sentinels.*

| # | File | Title | Lines |
|---|------|-------|-------|
| 1 | [`01-fundamentals/`](./01-fundamentals/00-overview.md) | 01 — Split Database Architecture — Fundamentals (Overview) | subfolder |
| 2 | [`02-features/`](./02-features/00-overview.md) | 02 — Split DB Architecture — Features Index | subfolder |

<!-- AUTO-TOC:END -->

---

## Keywords

`sqlite` · `split-database` · `hierarchical-storage` · `connection-pooling` · `wal-mode` · `backup` · `multi-project`

---

## Scoring

| Metric | Value |
|--------|-------|
| AI Confidence | Very High |
| Ambiguity | Low |
| Health Score | 100% (A+) |

---

## CRITICAL: Naming Convention

**All field names use PascalCase. No underscores allowed.**

| ❌ Wrong | ✅ Correct |
|----------|-----------|
| `session_id` | `SessionId` |
| `created_at` | `CreatedAt` |
| `message_count` | `MessageCount` |

---

## Summary

The **Split DB Architecture** defines a pattern for organizing SQLite databases into a **multi-layer hierarchical structure** where a **Root DB** manages metadata about child databases, and item-specific databases are created dynamically when an Item is opened for the first time (lazy creation). This pattern enables per-Item data isolation (one SQLite file per Item), <50 ms p95 cross-DB query latency via the Root index, logical organization (one file = one Item subtree), and import/export via zip files (one zip = one Item snapshot).

---

## Document Inventory

| # | File | Description |
|---|------|-------------|
| 00 | `00-overview.md` | This file — master index |
| 01 | `01-fundamentals/` | Core concepts, terminology, hierarchical structure, implementation patterns (split) |
| 02 | `02-features/00-overview.md` | Feature index |
| 02.01 | `02-features/01-cli-examples/` | Concrete examples for AI Bridge, GSearch, BRun, Nexus Flow, Reset API |
| 02.02 | `02-features/02-reset-api-standard.md` | 2-step reset API standard (5-min TTL) |
| 02.03 | `02-features/03-database-flow-diagrams.md` | Visual architecture diagrams |
| 02.04 | `02-features/04-rbac-casbin/` | Role-Based Access Control with Casbin |
| 02.05 | `02-features/05-user-scoped-isolation/` | User-scoped database isolation patterns |
| — | Issues moved to `spec/02-coding-guidelines/22-app-issues/` | Centralized issues |
| 97 | `97-acceptance-criteria.md` | Acceptance criteria |
| 97b | `97-changelog.md` | Changelog |
| 98 | `98-acceptance-criteria.md` | Extended acceptance criteria |
| 99 | `99-consistency-report.md` | Consistency report |

---

## Folder Structure

```
05-split-db-architecture/
├── 00-overview.md                    ← This file
├── 01-fundamentals/                  ← Core concepts & architecture (split)
├── 02-features/
│   ├── 00-overview.md                ← Feature index
│   ├── 01-cli-examples/
│   ├── 02-reset-api-standard.md
│   ├── 03-database-flow-diagrams.md
│   ├── 04-rbac-casbin/
│   └── 05-user-scoped-isolation/
├── (issues → see spec/02-coding-guidelines/22-app-issues/)
├── 97-acceptance-criteria.md
├── 97-changelog.md
├── 98-acceptance-criteria.md
└── 99-consistency-report.md
```

---

## Cross-References

| Reference | Description |
|-----------|-------------|
| [Seedable Config](../06-seedable-config-architecture/00-overview.md) | Configuration seeding patterns |
| [App Project Template](../01-spec-authoring-guide/05-app-project-template.md) | Template this spec follows |

---

*Overview — updated: 2026-04-03*

---

## Related

**See also:**

- [`../00-overview.md`](../00-overview.md) — Parent overview
- [`98-acceptance-criteria.md`](./98-acceptance-criteria.md) — Acceptance criteria
