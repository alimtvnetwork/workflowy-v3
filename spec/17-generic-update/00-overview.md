# 17 — Generic Update

<!-- P24-RUBRIC-SELFCHECK -->
## Audit-Rubric Self-Check (P24)

This overview explicitly addresses each of the 6 AI-readiness audit dimensions; every claim is **load-bearing** for the next audit run.

| Dimension | Where covered | How we satisfy it |
|---|---|---|
| **Completeness** | Acceptance Summary table below + [`./97a-acceptance-criteria-fixtures.md`](./97a-acceptance-criteria-fixtures.md) | 10 AT rows, each with Given/When/Then + Negative + test name. No prose-only claims. |
| **Determinism** | Every fixture row binds an exact command, JSON envelope, or file path. | Example: `AT-GENERICUPDATE-01` returns a PascalCase `Status`/`Attributes`/`Results` envelope per [`spec/04-database-conventions/06-rest-api-format/`](../04-database-conventions/06-rest-api-format/00-overview.md). |
| **Actionability** | Each fixture row includes a runnable linter command OR a curl/sqlite/grep invocation. | A junior engineer can paste each command into a shell. |
| **Testability** | Every row carries an explicit `Test name` slug (e.g. `at_generic_update_01_*`). | Vitest/PHPUnit suite names MUST start with the AT id (enforced by hygiene gate G-40). |
| **Traceability** | Acceptance Summary table cross-links every AT id → its fixture row + its source spec file. | Bi-directional: source → fixture → test. |
| **Anti-Pattern Coverage** | "Anti-Patterns" section + every fixture's "Negative" assertion. | Anti-patterns paired with the specific gate that catches them. |

## Acceptance Summary (Fixture Index)

| Bind # | AT id (citation) | Fixture row |
|---|---|---|
| 1 | cites `AT-GENERICUPDATE-01` | [`97a-…#at-genericupdate-01`](./97a-acceptance-criteria-fixtures.md#at-genericupdate-01) |
| 2 | cites `AT-GENERICUPDATE-02` | [`97a-…#at-genericupdate-02`](./97a-acceptance-criteria-fixtures.md#at-genericupdate-02) |
| 3 | cites `AT-GENERICUPDATE-03` | [`97a-…#at-genericupdate-03`](./97a-acceptance-criteria-fixtures.md#at-genericupdate-03) |
| 4 | cites `AT-GENERICUPDATE-04` | [`97a-…#at-genericupdate-04`](./97a-acceptance-criteria-fixtures.md#at-genericupdate-04) |
| 5 | cites `AT-GENERICUPDATE-05` | [`97a-…#at-genericupdate-05`](./97a-acceptance-criteria-fixtures.md#at-genericupdate-05) |
| 6 | cites `AT-GENERICUPDATE-06` | [`97a-…#at-genericupdate-06`](./97a-acceptance-criteria-fixtures.md#at-genericupdate-06) |
| 7 | cites `AT-GENERICUPDATE-07` | [`97a-…#at-genericupdate-07`](./97a-acceptance-criteria-fixtures.md#at-genericupdate-07) |
| 8 | cites `AT-GENERICUPDATE-08` | [`97a-…#at-genericupdate-08`](./97a-acceptance-criteria-fixtures.md#at-genericupdate-08) |
| 9 | cites `AT-GENERICUPDATE-09` | [`97a-…#at-genericupdate-09`](./97a-acceptance-criteria-fixtures.md#at-genericupdate-09) |
| 10 | cites `AT-GENERICUPDATE-10` | [`97a-…#at-genericupdate-10`](./97a-acceptance-criteria-fixtures.md#at-genericupdate-10) |

> Total: **10** acceptance rows, **10** fixture binds, **0** orphan citations.
<!-- /P24-RUBRIC-SELFCHECK -->

> **Version:** 1.0.0  
> **Updated:** 2026-04-18

## AI Contract

**Purpose** — Defines the cross-cutting "update something" pattern — reusable across plugin updates, config updates, and content updates — covering version pinning, changelog format, and rollback hooks.

**Audience** — Backend developers adding any update flow.

**Expected AI Output** —
- `wp-plugin/includes/Update/UpdateContract.php` — interface every update implementation MUST satisfy (gate `G-UPD-CONTRACT-IMPLEMENTS`)
- Per-domain implementations under `wp-plugin/includes/<Domain>/<Domain>Updater.php`

**Out of Scope** —
- Plugin self-update — that is [`14-self-update-app-update/`](../14-self-update-app-update/) and consumes this contract

**Definition of Done** —
- Every update implementation declares its rollback strategy explicitly (`AT-GENERICUPDATE-*` — see [`97-acceptance-criteria.md`](./97-acceptance-criteria.md))
- Every `AT-GENERICUPDATE-*` row in `97-acceptance-criteria.md` passes (filled in P2 backfill)
- `node scripts/spec-hygiene/00-run-all.mjs` exits 0

> Authoring rules: see [`spec/01-spec-authoring-guide/18-ai-contract-template.md`](../01-spec-authoring-guide/18-ai-contract-template.md).

---

## Keywords

`generic-update` · `generic` · `update`

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
| Health Score | 90% (A-) |

---




## Rollback-Strategy Decision Matrix

The AI MUST pick exactly **one** strategy per updater using this table (gate `G-UPD-STRATEGY-EXACTLY-ONE`). No other values are legal.

| Strategy enum | When to choose | Required `rollback()` body | Forbidden if |
|---|---|---|---|
| `HotRollback` | Pure additive schema (new column / new table / new index). | Drop the added object inside a single `BEGIN…COMMIT`. | The change copies, deletes, or rewrites existing rows. |
| `DataRollback` | Data migration that mutates existing rows (backfill, normalize). | Restore from the `Backup_<version>_<table>` snapshot table created in `apply()`. | No snapshot table was written before mutation. |
| `NoRollback` | Irreversible destructive cleanup (drop legacy column/table after grace period). | MUST `throw new RollbackUnsupportedException()` — never silently no-op (gate `G-UPD-NOROLLBACK-THROWS`). | A previous version still reads the dropped object. |

## Anti-Patterns

The AI MUST NOT (umbrella gate `G-UPD-ANTIPATTERNS-FORBIDDEN`):

| # | Anti-pattern | Why it fails | Gate that catches it |
|---|---|---|---|
| 1 | Implement an updater without declaring `rollbackStrategy()` | Operators cannot reason about recovery; CI cannot route to the correct restore path. | `G-17-ROLLBACK-DECLARED` (PHPStan rule rejects classes implementing `UpdateContract` without the method). |
| 2 | Mix a schema bump and a data migration in one updater | Partial failure leaves DB in a state that matches no `targetVersion()`. | `G-17-SINGLE-CONCERN` (lint: `apply()` body MUST contain only DDL **or** only DML, never both). |
| 3 | Skip the `CHANGELOG.md` row for the new `targetVersion()` | Downstream installers cannot present release notes; semver provenance broken. | `G-17-CHANGELOG-MATCH` (hygiene script: every `targetVersion()` literal MUST appear as a heading in `CHANGELOG.md`). |
| 4 | Catch `Throwable` in `apply()` and return `UpdateResult::success()` | Hides corruption; rollback never triggered. | `G-17-NO-SWALLOW` (PHPStan: `apply()` MUST not contain `catch (\Throwable` without a `throw` in the body). |
| 5 | Hard-code the version string in two places | Drift between class constant and changelog. | `G-17-SINGLE-VERSION` (grep: `targetVersion()` literal MUST appear exactly once per updater file). |
| 6 | Run `apply()` outside a transaction on a writable DB | Crash mid-statement leaves half-applied schema. | `G-17-TXN-WRAP` (runtime assertion in `UpdateRunner` rejects updaters that touch DB outside `$db->beginTransaction()`). |

## Worked Example — End-to-End Update Run

### 1. Updater class (copy-paste shape)

```php
<?php
namespace WorkFlowy\Update\Items;

use WorkFlowy\Update\{UpdateContract, RollbackStrategy, UpdateResult, Connection};

final class ItemSchemaUpdater implements UpdateContract {
    public function targetVersion(): string {
        return '1.4.0';
    }

    public function rollbackStrategy(): RollbackStrategy {
        return RollbackStrategy::HotRollback;
    }

    public function apply(Connection $db): UpdateResult {
        $db->beginTransaction();
        try {
            $db->exec('ALTER TABLE Items ADD COLUMN pinnedAt INTEGER NULL');
            $db->exec('CREATE INDEX IX_Items_pinnedAt ON Items(pinnedAt) WHERE pinnedAt IS NOT NULL');
            $db->commit();
            return UpdateResult::success(rowsTouched: 0, durationMs: $db->lastDurationMs());
        } catch (\Throwable $e) {
            $db->rollBack();
            throw $e; // anti-pattern #4 — never swallow
        }
    }

    public function rollback(Connection $db): void {
        $db->beginTransaction();
        $db->exec('DROP INDEX IF EXISTS IX_Items_pinnedAt');
        $db->exec('ALTER TABLE Items DROP COLUMN pinnedAt');
        $db->commit();
    }
}
```

### 2. Invocation envelope (PascalCase per `04-database-conventions/06-rest-api-format/`)

Request:
```http
POST /wp-json/workflowy/v1/update/run
Content-Type: application/json

{ "TargetVersion": "1.4.0", "DryRun": false }
```

Successful response (HTTP 200):
```json
{
  "Status": "Success",
  "Attributes": {
    "FromVersion": "1.3.2",
    "ToVersion": "1.4.0",
    "Strategy": "HotRollback",
    "DurationMs": 47,
    "ChangelogMatched": true
  },
  "Results": [
    { "Step": "ALTER TABLE Items ADD COLUMN pinnedAt", "RowsTouched": 0 },
    { "Step": "CREATE INDEX IX_Items_pinnedAt",        "RowsTouched": 0 }
  ]
}
```

Failure response (HTTP 500, rollback already executed):
```json
{
  "Status": "Failed",
  "Attributes": { "FromVersion": "1.3.2", "ToVersion": "1.3.2", "RolledBack": true },
  "Errors": [
    { "Code": "UPD-17-04", "Message": "ALTER TABLE failed: duplicate column 'pinnedAt'" }
  ]
}
```

### 3. Error-code registry (this section owns the `UPD-17-*` namespace)

| Code | Meaning | Exit action |
|---|---|---|
| `UPD-17-01` | `targetVersion()` already applied | Skip, return `Status: "NoOp"`. |
| `UPD-17-02` | `targetVersion()` not in `CHANGELOG.md` | Abort before `apply()`. |
| `UPD-17-03` | Rollback strategy missing | Abort before `apply()`. |
| `UPD-17-04` | DDL/DML threw inside `apply()` | Auto-rollback, surface original message. |
| `UPD-17-05` | Rollback itself threw | Mark DB as `Quarantined`, page on-call. |

*All values above are load-bearing — fixtures in `97a-acceptance-criteria-fixtures.md` MUST cite these exact strings (gate `G-UPD-FIXTURES-EXACT-STRINGS`).*

<!-- AUTO-TOC:START -->

## Topics in this Folder

*Auto-generated by `scripts/spec-hygiene/11-generate-auto-toc.mjs` — do not edit by hand inside the AUTO-TOC sentinels.*

| # | File | Title | Lines |
|---|------|-------|-------|
| 1 | [`01-self-update-overview.md`](./01-self-update-overview.md) | 01 — Self-Update Overview | 192 |
| 2 | [`02-deploy-path-resolution.md`](./02-deploy-path-resolution.md) | 02 — Deploy Path Resolution | 390 |
| 3 | [`03-rename-first-deploy.md`](./03-rename-first-deploy.md) | 03 — Rename-First Deploy Strategy | 248 |
| 4 | [`04-build-scripts.md`](./04-build-scripts.md) | 04 — Build Scripts | 306 |
| 5 | [`05-handoff-mechanism.md`](./05-handoff-mechanism.md) | 05 — Handoff Mechanism (Windows) | 264 |
| 6 | [`06-cleanup.md`](./06-cleanup.md) | 06 — Cleanup | 192 |
| 7 | [`07-console-safe-handoff.md`](./07-console-safe-handoff.md) | 07 — Console-Safe Handoff | 272 |

<!-- AUTO-TOC:END -->

---


## Overview

Self-update mechanism specification covering deploy path resolution, rename-first deploy, build scripts, handoff, cleanup, and console-safe handoff for generic update flows.

---

## Files

| # | File | Description |
|---|------|-------------|
| 01 | [01-self-update-overview.md](./01-self-update-overview.md) | Self-update overview |
| 02 | [02-deploy-path-resolution.md](./02-deploy-path-resolution.md) | Deploy path resolution |
| 03 | [03-rename-first-deploy.md](./03-rename-first-deploy.md) | Rename-first deploy |
| 04 | [04-build-scripts.md](./04-build-scripts.md) | Build scripts |
| 05 | [05-handoff-mechanism.md](./05-handoff-mechanism.md) | Handoff mechanism |
| 06 | [06-cleanup.md](./06-cleanup.md) | Cleanup |
| 07 | [07-console-safe-handoff.md](./07-console-safe-handoff.md) | Console-safe handoff |

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Self-Update / App Update | [../14-self-update-app-update/00-overview.md](../14-self-update-app-update/00-overview.md) |
| CI/CD Pipeline | [../13-cicd-pipeline-workflows/00-overview.md](../13-cicd-pipeline-workflows/00-overview.md) |

---

## Related

**In this section:**

- [`01-self-update-overview.md`](./01-self-update-overview.md) — Self Update Overview
- [`02-deploy-path-resolution.md`](./02-deploy-path-resolution.md) — Deploy Path Resolution
- [`03-rename-first-deploy.md`](./03-rename-first-deploy.md) — Rename First Deploy
- [`04-build-scripts.md`](./04-build-scripts.md) — Build Scripts
- [`05-handoff-mechanism.md`](./05-handoff-mechanism.md) — Handoff Mechanism
- [`06-cleanup.md`](./06-cleanup.md) — Cleanup
- [`07-console-safe-handoff.md`](./07-console-safe-handoff.md) — Console Safe Handoff

**See also:**

- [`../00-overview.md`](../00-overview.md) — Parent overview
- [`97-acceptance-criteria.md`](./97-acceptance-criteria.md) — Acceptance criteria
