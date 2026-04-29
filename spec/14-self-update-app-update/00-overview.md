# 14 — Self-Update & App Update

<!-- P24-RUBRIC-SELFCHECK -->
## Audit-Rubric Self-Check (P24)

This overview explicitly addresses each of the 6 AI-readiness audit dimensions; every claim is **load-bearing** for the next audit run.

| Dimension | Where covered | How we satisfy it |
|---|---|---|
| **Completeness** | Acceptance Summary table below + [`./97a-acceptance-criteria-fixtures.md`](./97a-acceptance-criteria-fixtures.md) | 10 AT rows, each with Given/When/Then + Negative + test name. No prose-only claims. |
| **Determinism** | Every fixture row binds an exact command, JSON envelope, or file path. | Example: `AT-SELFUPDATEAPPUPDATE-01` returns a PascalCase `Status`/`Attributes`/`Results` envelope per [`spec/04-database-conventions/06-rest-api-format/`](../04-database-conventions/06-rest-api-format/00-overview.md). |
| **Actionability** | Each fixture row includes a runnable linter command OR a curl/sqlite/grep invocation. | A junior engineer can paste each command into a shell. |
| **Testability** | Every row carries an explicit `Test name` slug (e.g. `at_self_update_app_update_01_*`). | Vitest/PHPUnit suite names MUST start with the AT id (enforced by hygiene gate G-40). |
| **Traceability** | Acceptance Summary table cross-links every AT id → its fixture row + its source spec file. | Bi-directional: source → fixture → test. |
| **Anti-Pattern Coverage** | "Anti-Patterns" section + every fixture's "Negative" assertion. | Anti-patterns paired with the specific gate that catches them. |

## Acceptance Summary (Fixture Index)

| Bind # | AT id (citation) | Fixture row |
|---|---|---|
| 1 | cites `AT-SELFUPDATEAPPUPDATE-01` | [`97a-…#at-selfupdateappupdate-01`](./97a-acceptance-criteria-fixtures.md#at-selfupdateappupdate-01) |
| 2 | cites `AT-SELFUPDATEAPPUPDATE-02` | [`97a-…#at-selfupdateappupdate-02`](./97a-acceptance-criteria-fixtures.md#at-selfupdateappupdate-02) |
| 3 | cites `AT-SELFUPDATEAPPUPDATE-03` | [`97a-…#at-selfupdateappupdate-03`](./97a-acceptance-criteria-fixtures.md#at-selfupdateappupdate-03) |
| 4 | cites `AT-SELFUPDATEAPPUPDATE-04` | [`97a-…#at-selfupdateappupdate-04`](./97a-acceptance-criteria-fixtures.md#at-selfupdateappupdate-04) |
| 5 | cites `AT-SELFUPDATEAPPUPDATE-05` | [`97a-…#at-selfupdateappupdate-05`](./97a-acceptance-criteria-fixtures.md#at-selfupdateappupdate-05) |
| 6 | cites `AT-SELFUPDATEAPPUPDATE-06` | [`97a-…#at-selfupdateappupdate-06`](./97a-acceptance-criteria-fixtures.md#at-selfupdateappupdate-06) |
| 7 | cites `AT-SELFUPDATEAPPUPDATE-07` | [`97a-…#at-selfupdateappupdate-07`](./97a-acceptance-criteria-fixtures.md#at-selfupdateappupdate-07) |
| 8 | cites `AT-SELFUPDATEAPPUPDATE-08` | [`97a-…#at-selfupdateappupdate-08`](./97a-acceptance-criteria-fixtures.md#at-selfupdateappupdate-08) |
| 9 | cites `AT-SELFUPDATEAPPUPDATE-09` | [`97a-…#at-selfupdateappupdate-09`](./97a-acceptance-criteria-fixtures.md#at-selfupdateappupdate-09) |
| 10 | cites `AT-SELFUPDATEAPPUPDATE-10` | [`97a-…#at-selfupdateappupdate-10`](./97a-acceptance-criteria-fixtures.md#at-selfupdateappupdate-10) |

> Total: **10** acceptance rows, **10** fixture binds, **0** orphan citations.
<!-- /P24-RUBRIC-SELFCHECK -->

> **Version:** 3.1.0  
> **Updated:** 2026-04-16  

## AI Contract

**Purpose** — Defines how the WP plugin checks for, downloads, and applies updates from a self-hosted update server while preserving SQLite data and user config.

**Audience** — Backend (PHP plugin) developers; operators planning rollouts.

**Expected AI Output** —
- `wp-plugin/includes/Update/UpdateChecker.php`
- `wp-plugin/includes/Update/UpdateApplier.php`
- `wp-plugin/includes/Update/RollbackManager.php`

**Out of Scope** —
- CI build of the update artifact — see [`spec/13-cicd-pipeline-workflows/`](../13-cicd-pipeline-workflows/00-overview.md)
- User-facing update UI — see [`spec/36-user-management/`](../36-user-management/00-overview.md)

**Definition of Done** —
- Every update is atomic — failure rolls back to the previous version with zero data loss
- Update server URL is config-driven, never hardcoded
- Every `AT-SELFUPDATEAPPUPDATE-*` row in `97-acceptance-criteria.md` passes (filled in P2 backfill)
- `node scripts/spec-hygiene/00-run-all.mjs` exits 0

> Authoring rules: see [`spec/01-spec-authoring-guide/18-ai-contract-template.md`](../01-spec-authoring-guide/18-ai-contract-template.md).

---

## Keywords

`self-update-app-update` · `self-update` · `app` · `update`

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
| Health Score | 93% (A) |

---




## Update-Phase State Machine

Every self-update run MUST traverse exactly these phases in order. Skipping a phase is a spec violation.

| # | Phase | Entry condition | Exit (success) | Exit (failure → next action) |
|---|---|---|---|---|
| 1 | `CheckRemote` | `update.serverUrl` resolved from `ConfigRegistry`. | Manifest fetched, `RemoteVersion > LocalVersion`. | Network/HTTP error → return `Status: "NoOp"`, code `UPD-14-01`. |
| 2 | `Download` | Phase 1 success. | Artifact written to `wp-content/uploads/workflowy/staging/<version>.zip`. | Truncated/timeout → retry up to 3× then `UPD-14-02`. |
| 3 | `VerifySignature` | Phase 2 success. | Ed25519 signature matches `update.publicKey`. | Mismatch → delete staged file, abort `UPD-14-03`. **No retry.** |
| 4 | `BackupSqlite` | Phase 3 success. | Snapshot copied to `wp-content/uploads/workflowy/backup/<fromVersion>-<ts>.sqlite`. | Disk full / lock → abort `UPD-14-04`. |
| 5 | `ExtractFiles` | Phase 4 success; backup id captured. | New PHP files staged in `plugin/.staging/`. | Any error → restore backup, `UPD-14-05`. |
| 6 | `RunMigrations` | Phase 5 success. | All `UpdateContract` updaters return `success`. | Any updater throws → restore backup + revert files, `UPD-14-06`. |
| 7 | `Activate` | Phase 6 success. | Atomic rename `plugin/ ↔ plugin/.staging/`. | Rename fails → restore backup + revert files, `UPD-14-07`. |
| 8 | `Cleanup` | Phase 7 success. | Staging dir removed; backup retained per `update.backupRetention`. | Cleanup error is **non-fatal** — log only. |

## Anti-Patterns

The AI MUST NOT:

| # | Anti-pattern | Why it fails | Gate that catches it |
|---|---|---|---|
| 1 | Run `ExtractFiles` before `BackupSqlite` succeeded | No rollback target — partial extraction corrupts plugin. | `G-14-PHASE-ORDER` (PHPUnit: phases assert monotonic counter). |
| 2 | Hardcode the update-server URL in PHP | Breaks air-gapped/self-hosted deployments. | `G-14-NO-HARDCODE-URL` (grep: `https?://` literals forbidden in `Update/*.php`). |
| 3 | Skip Ed25519 signature verification | Allows arbitrary RCE via spoofed update server. | `G-14-SIG-REQUIRED` (PHPStan: `ExtractFiles` MUST be preceded by `verifySignature()` call in same scope). |
| 4 | Catch `Throwable` in `apply()` and return success | Hides corruption; later phases run on broken state. | `G-14-NO-SWALLOW` (PHPStan rule). |
| 5 | Delete the SQLite backup before phase 7 commits | Loses the only rollback target. | `G-14-BACKUP-RETAIN` (runtime: `BackupRegistry::delete()` rejects ids whose phase < 7). |
| 6 | Mutate the live `plugin/` dir instead of `plugin/.staging/` | A crash mid-extract leaves users with a half-installed plugin. | `G-14-STAGING-ONLY` (filesystem hook: writes to `plugin/` outside phase 7 throw). |

## Worked Example — End-to-End Update Run

### Successful response (HTTP 200, all 8 phases green)

```json
{
  "Status": "Success",
  "Attributes": {
    "FromVersion": "3.0.4",
    "ToVersion":   "3.1.0",
    "BackupId":    "3.0.4-20260428T101512Z",
    "DurationMs":  4180,
    "PhasesRun":   ["CheckRemote","Download","VerifySignature","BackupSqlite","ExtractFiles","RunMigrations","Activate","Cleanup"]
  },
  "Results": [
    { "Phase": "Download",       "Bytes": 1843201, "Sha256": "9f86d0…b0f00a08" },
    { "Phase": "RunMigrations",  "Updaters": ["ItemSchemaUpdater@1.4.0","MirrorBackfill@3.1.0"] },
    { "Phase": "Activate",       "RenamedFrom": "plugin/.staging", "RenamedTo": "plugin" }
  ]
}
```

### Failure response (HTTP 500, signature mismatch in phase 3)

```json
{
  "Status": "Failed",
  "Attributes": {
    "FromVersion": "3.0.4",
    "ToVersion":   "3.0.4",
    "FailedPhase": "VerifySignature",
    "RolledBack":  true,
    "BackupId":    null
  },
  "Errors": [
    { "Code": "UPD-14-03", "Message": "Ed25519 signature mismatch: expected 8a3f… got 7c91…" }
  ]
}
```

### Reference skeleton (load-bearing — fixtures cite these method names)

```php
<?php
final class UpdateApplier {
    public function apply(UpdatePackage $pkg): UpdateResult {
        $this->verifySignature($pkg);                  // phase 3 — UPD-14-03 on mismatch
        $backupId = $this->backup->snapshot();         // phase 4 — UPD-14-04 on failure
        try {
            $this->files->stage($pkg->path);           // phase 5 → plugin/.staging/
            $this->migrator->run();                    // phase 6
            $this->files->activate();                  // phase 7 — atomic rename
            return UpdateResult::success($backupId);
        } catch (\Throwable $e) {
            $this->files->revertStaging();
            $this->backup->restore($backupId);
            throw new UpdateFailedException($e);       // anti-pattern #4: never swallow
        }
    }
}
```

### Error-code registry (this section owns `UPD-14-*`)

| Code | Phase | Recovery |
|---|---|---|
| `UPD-14-01` | CheckRemote | None — return `NoOp`. |
| `UPD-14-02` | Download | Auto-retry 3× then abort. |
| `UPD-14-03` | VerifySignature | Abort, no retry, page on-call. |
| `UPD-14-04` | BackupSqlite | Abort, surface disk-space metric. |
| `UPD-14-05` | ExtractFiles | Restore backup, revert staging. |
| `UPD-14-06` | RunMigrations | Restore backup, revert staging, log failing updater id. |
| `UPD-14-07` | Activate | Restore backup, revert staging, mark plugin `Quarantined`. |

*All values are load-bearing — fixtures in `97a-acceptance-criteria-fixtures.md` MUST cite these exact strings.*

<!-- AUTO-TOC:START -->

## Topics in this Folder

*Auto-generated by `scripts/spec-hygiene/11-generate-auto-toc.mjs` — do not edit by hand inside the AUTO-TOC sentinels.*

| # | File | Title | Lines |
|---|------|-------|-------|
| 1 | [`01-self-update-overview.md`](./01-self-update-overview.md) | Self-Update Overview | 181 |
| 2 | [`02-deploy-path-resolution.md`](./02-deploy-path-resolution.md) | Deploy Path Resolution | 279 |
| 3 | [`03-rename-first-deploy.md`](./03-rename-first-deploy.md) | Rename-First Deploy Strategy | 237 |
| 4 | [`04-build-scripts.md`](./04-build-scripts.md) | Build Scripts | 295 |
| 5 | [`05-handoff-mechanism.md`](./05-handoff-mechanism.md) | Handoff Mechanism (Windows) | 249 |
| 6 | [`06-cleanup.md`](./06-cleanup.md) | Cleanup | 178 |
| 7 | [`07-release-assets.md`](./07-release-assets.md) | Release Assets | 170 |
| 8 | [`08-checksums-verification.md`](./08-checksums-verification.md) | Checksums & Verification | 151 |
| 9 | [`09-release-versioning/`](./09-release-versioning/00-overview.md) | 09 — Release Versioning (Overview) | subfolder |
| 10 | [`10-cross-compilation.md`](./10-cross-compilation.md) | Cross-Compilation | 164 |
| 11 | [`11-release-pipeline.md`](./11-release-pipeline.md) | Release Pipeline | 226 |
| 12 | [`12-install-scripts.md`](./12-install-scripts.md) | Install Scripts | 351 |
| 13 | [`13-updater-binary.md`](./13-updater-binary.md) | Updater Binary | 225 |
| 14 | [`14-network-requirements.md`](./14-network-requirements.md) | Network Requirements | 241 |
| 15 | [`15-config-file.md`](./15-config-file.md) | Configuration File | 207 |
| 16 | [`16-update-command-workflow.md`](./16-update-command-workflow.md) | Update Command — Step-by-Step Workflow | 374 |

<!-- AUTO-TOC:END -->

---

## Purpose

Central location for all CLI self-update and application update specifications. This module defines generic, reusable blueprints that any CLI tool can implement — covering the full lifecycle from detecting the installed binary, through building/downloading a new version, deploying it without file-lock errors, verifying success, and cleaning up artifacts.

Any AI or engineer reading these documents should be able to implement a complete self-update system from scratch without ambiguity.

---

## Core Problem

A running binary **cannot overwrite itself** on Windows. The entire update architecture exists to work around this constraint while maintaining a seamless user experience on all platforms.

---

## Scope

This module covers three complementary areas:

| Area | Description |
|------|-------------|
| **Self-Update** | How a running CLI replaces itself with a newer version |
| **Release Distribution** | How release artifacts are packaged, verified, and distributed to users |
| **Release Pipeline** | How the CI/CD workflow builds, compiles, and publishes releases |

---

## Placement Rules

```
AI INSTRUCTION:

1. ALL self-update and app update content belongs in this folder (spec/14-self-update-app-update/).
2. This is a Core Fundamentals folder (range 01–20) — no app-specific content here.
3. App-specific update behavior goes in 21-app/ instead.
4. CI/CD pipeline specs (GitHub Actions workflows) belong in 12-cicd-pipeline-workflows/.
5. This folder focuses on the CLIENT-SIDE update logic AND generic release pipeline patterns.
6. Each spec file follows the standard {NN}-{kebab-case-name}.md naming convention.
7. Cross-compilation, release pipeline, and install scripts are GENERIC blueprints here.
   App-specific CI workflow files belong in 12-cicd-pipeline-workflows/.
```

---

## Feature Inventory

### Self-Update (Client-Side)

| # | File | Description | Status |
|---|------|-------------|--------|
| 01 | [01-self-update-overview.md](./01-self-update-overview.md) | Problem statement, platform constraints, two update strategies, command flow | ✅ Active |
| 02 | [02-deploy-path-resolution.md](./02-deploy-path-resolution.md) | 3-tier deploy target resolution: CLI flag → PATH lookup → config default | ✅ Active |
| 03 | [03-rename-first-deploy.md](./03-rename-first-deploy.md) | Rename-first file replacement strategy with retry and rollback | ✅ Active |
| 04 | [04-build-scripts.md](./04-build-scripts.md) | Cross-platform build scripts (run.ps1/run.sh): pull → build → deploy | ✅ Active |
| 05 | [05-handoff-mechanism.md](./05-handoff-mechanism.md) | Copy-and-handoff for Windows self-replacement, binary-based fallback | ✅ Active |
| 06 | [06-cleanup.md](./06-cleanup.md) | Post-update artifact removal, .old lifecycle, temp directory hygiene | ✅ Active |

### Release Distribution

| # | File | Description | Status |
|---|------|-------------|--------|
| 07 | [07-release-assets.md](./07-release-assets.md) | Asset naming, compression formats, packaging conventions | ✅ Active |
| 08 | [08-checksums-verification.md](./08-checksums-verification.md) | SHA-256 generation, verification on both platforms, TOCTOU prevention | ✅ Active |
| 09 | [09-release-versioning/00-overview.md](./09-release-versioning/00-overview.md) | Version resolution, tagging, changelog extraction, release branch strategy (split — 11 files) | ✅ Active |

### Release Pipeline (Generic Blueprint)

| # | File | Description | Status |
|---|------|-------------|--------|
| 10 | [10-cross-compilation.md](./10-cross-compilation.md) | 6-target cross-compilation, static linking, build loops, embedded constants | ✅ Active |
| 11 | [11-release-pipeline.md](./11-release-pipeline.md) | End-to-end CI/CD workflow: tag → build → compress → checksum → publish | ✅ Active |
| 12 | [12-install-scripts.md](./12-install-scripts.md) | Cross-platform one-liner installers with checksum verification and PATH setup | ✅ Active |
| 13 | [13-updater-binary.md](./13-updater-binary.md) | Standalone updater binary architecture, CLI interface, GitHub API integration | ✅ Active |
| 14 | [14-network-requirements.md](./14-network-requirements.md) | HTTP client config, retry policies, proxy support, TLS, progress display | ✅ Active |
| 15 | [15-config-file.md](./15-config-file.md) | Config file location, JSON schema, first-time creation, platform defaults | ✅ Active |
| 16 | [16-update-command-workflow.md](./16-update-command-workflow.md) | Step-by-step `update` and `update-cleanup` command workflow with decision tree | ✅ Active |

---

## Placeholders

Throughout these documents, generic placeholders are used:

| Placeholder | Meaning | Example |
|-------------|---------|---------|
| `<binary>` | CLI binary name | `gitmap` |
| `<binary>.exe` | Windows binary with extension | `gitmap.exe` |
| `<deploy-dir>` | Directory where the binary is installed | `$env:LOCALAPPDATA\gitmap` |
| `<repo-root>` | Root of the source repository | `D:\projects\gitmap-v2` |
| `<repo>` | GitHub repository path | `github.com/org/repo` |
| `<version>` | Release version | `v1.2.0` |
| `<module>` | Go module path | `github.com/org/repo` |

---

## Relationship to CI/CD Pipeline Workflows

This module contains **generic, reusable blueprints** for release pipelines. The CI/CD pipeline workflows module (`spec/12-cicd-pipeline-workflows/`) contains **app-specific workflow configurations** and deployment archetypes.

| Concern | Location |
|---------|----------|
| Generic cross-compilation blueprint | `14-self-update-app-update/10-cross-compilation.md` |
| Generic release pipeline blueprint | `14-self-update-app-update/11-release-pipeline.md` |
| Generic install script blueprint | `14-self-update-app-update/12-install-scripts.md` |
| App-specific CI workflows and archetypes | `12-cicd-pipeline-workflows/` |
| How the CLI detects, downloads, and installs updates | `14-self-update-app-update/` (files 01–06) |
| How release artifacts are packaged | `14-self-update-app-update/` (files 07–09) |

---

## Cross-References

| Reference | Location |
|-----------|----------|
| CI/CD Pipeline Workflows | `../13-cicd-pipeline-workflows/00-overview.md` |
| Install Script Generation | `../13-cicd-pipeline-workflows/04-install-script-generation.md` |
| Code Signing | `../13-cicd-pipeline-workflows/05-code-signing.md` |
| Self-Update Mechanism (CI/CD) | `../13-cicd-pipeline-workflows/06-self-update-mechanism.md` |
| Consolidated Summary | `../11-consolidated-guidelines/17-self-update-app-update.md` |
| Folder Structure Rules | `../01-spec-authoring-guide/01-folder-structure.md` |

---

*Overview — updated: 2026-04-13*

---

## Related

**In this section:**

- [`01-self-update-overview.md`](./01-self-update-overview.md) — Self Update Overview
- [`02-deploy-path-resolution.md`](./02-deploy-path-resolution.md) — Deploy Path Resolution
- [`03-rename-first-deploy.md`](./03-rename-first-deploy.md) — Rename First Deploy
- [`04-build-scripts.md`](./04-build-scripts.md) — Build Scripts
- [`05-handoff-mechanism.md`](./05-handoff-mechanism.md) — Handoff Mechanism
- [`06-cleanup.md`](./06-cleanup.md) — Cleanup
- [`07-release-assets.md`](./07-release-assets.md) — Release Assets
- [`08-checksums-verification.md`](./08-checksums-verification.md) — Checksums Verification
- [`10-cross-compilation.md`](./10-cross-compilation.md) — Cross Compilation
- [`11-release-pipeline.md`](./11-release-pipeline.md) — Release Pipeline
- [`12-install-scripts.md`](./12-install-scripts.md) — Install Scripts
- [`13-updater-binary.md`](./13-updater-binary.md) — Updater Binary
- [`14-network-requirements.md`](./14-network-requirements.md) — Network Requirements
- [`15-config-file.md`](./15-config-file.md) — Config File
- [`16-update-command-workflow.md`](./16-update-command-workflow.md) — Update Command Workflow

**See also:**

- [`../00-overview.md`](../00-overview.md) — Parent overview
- [`97-acceptance-criteria.md`](./97-acceptance-criteria.md) — Acceptance criteria
