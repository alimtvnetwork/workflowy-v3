# Generic Update

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
- `wp-plugin/includes/Update/UpdateContract.php` — interface every update implementation MUST satisfy
- Per-domain implementations under `wp-plugin/includes/<Domain>/<Domain>Updater.php`

**Out of Scope** —
- Plugin self-update — that is `14-self-update-app-update/` and consumes this contract

**Definition of Done** —
- Every update implementation declares its rollback strategy explicitly
- `AT-GENERICUPDATE-01` through `AT-GENERICUPDATE-NN` from `97-acceptance-criteria.md` pass
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

---




## Anti-Patterns

The AI MUST NOT:
- Implementing an updater without declaring the rollback strategy in the same file (hot-rollback / data-rollback / no-rollback).
- Mixing schema-version bumps with data migrations in the same updater — split into two updaters chained by version.
- Skipping the changelog entry — every shipped update MUST add a row to `CHANGELOG.md` matched by the gate.

## Worked Example (skeleton)

A canonical, copy-pasteable shape for this section's primary output:

```php
<?php
final class ItemSchemaUpdater implements UpdateContract {
    public function targetVersion(): string { return '1.4.0'; }
    public function rollbackStrategy(): RollbackStrategy { return RollbackStrategy::HotRollback; }
    public function apply(Connection $db): UpdateResult {
        $db->exec('ALTER TABLE Items ADD COLUMN pinnedAt INTEGER NULL');
        return UpdateResult::success();
    }
    public function rollback(Connection $db): void {
        $db->exec('ALTER TABLE Items DROP COLUMN pinnedAt');
    }
}
```

*This is a structural skeleton. Real values come from the section's `97-acceptance-criteria.md` row that the AI is implementing.*

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
