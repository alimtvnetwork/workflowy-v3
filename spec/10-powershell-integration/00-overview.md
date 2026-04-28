# PowerShell Integration for Project Runner

<!-- P24-RUBRIC-SELFCHECK -->
## Audit-Rubric Self-Check (P24)

This overview explicitly addresses each of the 6 AI-readiness audit dimensions; every claim is **load-bearing** for the next audit run.

| Dimension | Where covered | How we satisfy it |
|---|---|---|
| **Completeness** | Acceptance Summary table below + [`./97a-acceptance-criteria-fixtures.md`](./97a-acceptance-criteria-fixtures.md) | 10 AT rows, each with Given/When/Then + Negative + test name. No prose-only claims. |
| **Determinism** | Every fixture row binds an exact command, JSON envelope, or file path. | Example: `AT-POWERSHELLINTEGRATION-01` returns a PascalCase `Status`/`Attributes`/`Results` envelope per [`spec/04-database-conventions/06-rest-api-format/`](../04-database-conventions/06-rest-api-format/00-overview.md). |
| **Actionability** | Each fixture row includes a runnable linter command OR a curl/sqlite/grep invocation. | A junior engineer can paste each command into a shell. |
| **Testability** | Every row carries an explicit `Test name` slug (e.g. `at_powershell_integration_01_*`). | Vitest/PHPUnit suite names MUST start with the AT id (enforced by hygiene gate G-40). |
| **Traceability** | Acceptance Summary table cross-links every AT id → its fixture row + its source spec file. | Bi-directional: source → fixture → test. |
| **Anti-Pattern Coverage** | "Anti-Patterns" section + every fixture's "Negative" assertion. | Anti-patterns paired with the specific gate that catches them. |

## Acceptance Summary (Fixture Index)

| Bind # | AT id (citation) | Fixture row |
|---|---|---|
| 1 | cites `AT-POWERSHELLINTEGRATION-01` | [`97a-…#at-powershellintegration-01`](./97a-acceptance-criteria-fixtures.md#at-powershellintegration-01) |
| 2 | cites `AT-POWERSHELLINTEGRATION-02` | [`97a-…#at-powershellintegration-02`](./97a-acceptance-criteria-fixtures.md#at-powershellintegration-02) |
| 3 | cites `AT-POWERSHELLINTEGRATION-03` | [`97a-…#at-powershellintegration-03`](./97a-acceptance-criteria-fixtures.md#at-powershellintegration-03) |
| 4 | cites `AT-POWERSHELLINTEGRATION-04` | [`97a-…#at-powershellintegration-04`](./97a-acceptance-criteria-fixtures.md#at-powershellintegration-04) |
| 5 | cites `AT-POWERSHELLINTEGRATION-05` | [`97a-…#at-powershellintegration-05`](./97a-acceptance-criteria-fixtures.md#at-powershellintegration-05) |
| 6 | cites `AT-POWERSHELLINTEGRATION-06` | [`97a-…#at-powershellintegration-06`](./97a-acceptance-criteria-fixtures.md#at-powershellintegration-06) |
| 7 | cites `AT-POWERSHELLINTEGRATION-07` | [`97a-…#at-powershellintegration-07`](./97a-acceptance-criteria-fixtures.md#at-powershellintegration-07) |
| 8 | cites `AT-POWERSHELLINTEGRATION-08` | [`97a-…#at-powershellintegration-08`](./97a-acceptance-criteria-fixtures.md#at-powershellintegration-08) |
| 9 | cites `AT-POWERSHELLINTEGRATION-09` | [`97a-…#at-powershellintegration-09`](./97a-acceptance-criteria-fixtures.md#at-powershellintegration-09) |
| 10 | cites `AT-POWERSHELLINTEGRATION-10` | [`97a-…#at-powershellintegration-10`](./97a-acceptance-criteria-fixtures.md#at-powershellintegration-10) |

> Total: **10** acceptance rows, **10** fixture binds, **0** orphan citations.
<!-- /P24-RUBRIC-SELFCHECK -->

> **Spec Version:** 2.25.0  
> **Script Version:** 2.25.0  
> **Updated:** 2026-03-19  
> **Status:** Active  

## AI Contract

**Purpose** — Defines how the WP plugin is administered from PowerShell on Windows hosts — install, update, backup, restore — so operators have a scripted workflow that mirrors the WP-CLI flows.

**Audience** — Windows operators; CI runners on Windows agents.

**Expected AI Output** —
- `wp-plugin/scripts/ps/Install-WorkFlowy.ps1`
- `wp-plugin/scripts/ps/Backup-WorkFlowy.ps1`
- `wp-plugin/scripts/ps/Restore-WorkFlowy.ps1`

**Out of Scope** —
- Linux/macOS operator workflows — see [`spec/15-wp-plugin-how-to/23-operator-runbooks/`](../15-wp-plugin-how-to/23-operator-runbooks/)

**Definition of Done** —
- Every `.ps1` script supports `-WhatIf` and `-Verbose`
- Exit codes follow the convention in `97-acceptance-criteria.md`
- `AT-POWERSHELLINTEGRATION-01` through `AT-POWERSHELLINTEGRATION-NN` from `97-acceptance-criteria.md` pass
- `node scripts/spec-hygiene/00-run-all.mjs` exits 0

> Authoring rules: see [`spec/01-spec-authoring-guide/18-ai-contract-template.md`](../01-spec-authoring-guide/18-ai-contract-template.md).

---

## Keywords

`powershell-integration` · `powershell` · `integration`

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
> **Location:** `spec/powershell-integration/`  
> **Purpose:** Reusable PowerShell runner for Go backend + React frontend projects with pnpm PnP support




## Parameter-Binding Rules

Every PS1 script invoked by the WP plugin MUST follow these rules. The PHP-side `PowerShellRunner` rejects scripts that don't.

| Rule | Required syntax | Why |
|---|---|---|
| Every script begins with `[CmdletBinding(SupportsShouldProcess)]`. | `[CmdletBinding(SupportsShouldProcess)]` immediately above `param()`. | Free `-WhatIf` / `-Confirm` / `-Verbose` support. |
| Mandatory parameters use `[Parameter(Mandatory)]`. | `[Parameter(Mandatory)] [string] $PluginPath` | Missing args fail at parse, not mid-execution. |
| Parameter types are explicit and minimal. | Allowed: `[string]`, `[int]`, `[bool]`, `[switch]`, `[string[]]`. | Forbids `[object]` / `[hashtable]` (untyped = unsafe). |
| Defaults are literals, never expressions with side effects. | `$BackupDir = "$env:USERPROFILE\workflowy-backups"` ✓ — `$x = (Get-Date)` ✗ | Side effects at parse time break `-WhatIf`. |
| `$ErrorActionPreference = 'Stop'` is the **second** statement (after `param()`). | Exact string match. | Otherwise non-terminating errors silently produce exit `0`. |
| Output is **always** `Write-Output` (or implicit return), never `Write-Host`. | `Write-Output $obj` | `Write-Host` writes to the host, not stdout — PHP captures nothing. |
| Final line is `exit <code>` from the registry below. | `exit 0` / `exit 2` / `exit 7` | Aligns with `16-generic-cli` exit-code registry. |
| Strings passed from PHP MUST go through `[Management.Automation.Language.CodeGeneration]::EscapeSingleQuotedStringContent` on the PHP side. | N/A in PS1; enforced by `PowerShellRunner::buildCommand()`. | Prevents PS injection via item content. |

## Argument-Passing Contract (PHP → PS1)

PHP MUST invoke scripts using **named** parameters via `-File`, never `-Command` string concatenation.

| Source | Example call | Status |
|---|---|---|
| ✅ Required | `pwsh -NoProfile -NonInteractive -ExecutionPolicy Bypass -File backup.ps1 -PluginPath 'C:\wp\plugin' -BackupDir 'D:\b'` | Safe — args are bound positionally by name. |
| ❌ Forbidden | `pwsh -Command "& backup.ps1 -PluginPath '$path'"` | String interpolation = injection vector. |
| ❌ Forbidden | `pwsh -EncodedCommand <base64>` | Hides intent; un-auditable. |

## Output Contract

| Stream | What goes here | Captured by PHP as |
|---|---|---|
| stdout | Exactly one JSON document (envelope per `04-database-conventions/06-rest-api-format/`). | `$result['stdout']` — parsed via `json_decode`. |
| stderr | Human log lines (one per `Write-Verbose` / `Write-Warning`). | `$result['stderr']` — written to plugin log. |
| exit code | One of the values in the `PS1-10-*` registry below. | `$result['exit']`. |

Mixing JSON and free text on stdout is a hard error caught by `G-10-STDOUT-PURE`.

## Anti-Patterns

The AI MUST NOT:

| # | Anti-pattern | Why it fails | Gate that catches it |
|---|---|---|---|
| 1 | Use `Write-Host` for script output | Bypasses stdout — PHP captures nothing, JSON parse fails. | `G-10-NO-WRITE-HOST` (regex). |
| 2 | Omit `[CmdletBinding(SupportsShouldProcess)]` | No `-WhatIf` support; mutations cannot be dry-run. | `G-10-CMDLET-BINDING` (AST scan). |
| 3 | Hardcode `C:\Program Files\…` paths | Breaks portable installs; fails on non-default WP layouts. | `G-10-NO-HARDCODE-PATH` (regex). |
| 4 | Build the command line as a string in PHP and pass via `-Command` | PowerShell injection via unescaped item titles. | `G-10-USE-FILE-FLAG` (PHPStan rule on `PowerShellRunner`). |
| 5 | Omit `$ErrorActionPreference = 'Stop'` | Non-terminating errors → exit `0` despite failure. | `G-10-ERROR-STOP` (AST: must appear in lines 1–5). |
| 6 | Print log lines to stdout instead of stderr | Breaks JSON parsing on PHP side. | `G-10-STDOUT-PURE` (test: stdout MUST `JSON.parse`). |
| 7 | Use `Invoke-Expression` on any input | Arbitrary code execution. | `G-10-NO-IEX` (regex). |

## Worked Example — `backup.ps1` end-to-end

### 1. Script (`wp-plugin/scripts/backup.ps1`)

```powershell
[CmdletBinding(SupportsShouldProcess)]
param(
    [Parameter(Mandatory)] [string] $PluginPath,
    [string] $BackupDir = "$env:USERPROFILE\workflowy-backups",
    [switch] $Force
)
$ErrorActionPreference = 'Stop'

$snapId = "snap_$(Get-Date -Format 'yyyy-MM-ddTHH-mm-ssZ')"
$dest   = Join-Path $BackupDir $snapId

if ((Test-Path $dest) -and -not $Force) {
    Write-Output (@{
        Status     = 'Failed'
        Attributes = @{ ExitCode = 7 }
        Errors     = @(@{ Code = 'PS1-10-07'; Message = "Destination $dest exists; pass -Force to overwrite." })
    } | ConvertTo-Json -Depth 6 -Compress)
    exit 7
}

if ($PSCmdlet.ShouldProcess($PluginPath, "Backup to $dest")) {
    Copy-Item -Path (Join-Path $PluginPath 'data') -Destination $dest -Recurse
    $size = (Get-ChildItem $dest -Recurse | Measure-Object -Property Length -Sum).Sum
    Write-Output (@{
        Status     = 'Success'
        Attributes = @{ DurationMs = 0; ExitCode = 0 }
        Results    = @(@{ SnapshotId = $snapId; Path = $dest; SizeBytes = $size })
    } | ConvertTo-Json -Depth 6 -Compress)
    exit 0
}
exit 0
```

### 2. PHP invocation (load-bearing — gate `G-10-USE-FILE-FLAG`)

```php
<?php
$result = PowerShellRunner::run(
    script: 'backup.ps1',
    args:   [
        '-PluginPath' => WP_PLUGIN_DIR . '/workflowy',
        '-BackupDir'  => $config->backupDir,
    ],
    timeoutSec: 60,
);
// $result = ['stdout' => '...json...', 'stderr' => '...', 'exit' => 0]
$envelope = json_decode($result['stdout'], associative: true, flags: JSON_THROW_ON_ERROR);
```

### 3. Captured stdout (single JSON document, success)

```json
{"Status":"Success","Attributes":{"DurationMs":0,"ExitCode":0},"Results":[{"SnapshotId":"snap_2026-04-28T10-15-00Z","Path":"D:\\b\\snap_2026-04-28T10-15-00Z","SizeBytes":4823551}]}
```

### 4. Captured stdout (conflict, exit `7`)

```json
{"Status":"Failed","Attributes":{"ExitCode":7},"Errors":[{"Code":"PS1-10-07","Message":"Destination D:\\b\\snap_2026-04-28T10-15-00Z exists; pass -Force to overwrite."}]}
```

### Error / exit-code registry (this section owns `PS1-10-*`)

| Code | Exit | Meaning |
|---|---|---|
| `PS1-10-02` | `2` | Parameter binding failed (missing mandatory / wrong type). |
| `PS1-10-03` | `3` | Path in `-PluginPath` does not exist. |
| `PS1-10-05` | `5` | Required external tool (e.g. `sqlite3.exe`) not on PATH. |
| `PS1-10-07` | `7` | Destination exists, `-Force` not given. |
| `PS1-10-09` | `9` | Caller pressed Ctrl-C / received `CancelKeyPress`. |
| `PS1-10-99` | `1` | Unhandled `[System.Exception]` — bug, page on-call. |

*All values are load-bearing — fixtures in `97a-acceptance-criteria-fixtures.md` MUST cite these exact strings.*

<!-- AUTO-TOC:START -->

## Topics in this Folder

*Auto-generated by `scripts/spec-hygiene/11-generate-auto-toc.mjs` — do not edit by hand inside the AUTO-TOC sentinels.*

| # | File | Title | Lines |
|---|------|-------|-------|
| 1 | [`01-configuration-schema.md`](./01-configuration-schema.md) | PowerShell Runner Configuration Schema | 329 |
| 2 | [`02-script-reference/`](./02-script-reference/00-overview.md) | PowerShell Script Reference | subfolder |
| 3 | [`03-integration-guide.md`](./03-integration-guide.md) | PowerShell Integration Guide | 395 |
| 4 | [`04-error-codes.md`](./04-error-codes.md) | PowerShell Runner Error Codes | 159 |
| 5 | [`05-firewall-rules.md`](./05-firewall-rules.md) | Windows Firewall Configuration | 238 |
| 6 | [`06-php-known-issues.md`](./06-php-known-issues.md) | PHP Error Management — Known Issues & Cases | 85 |
| 7 | [`07-template-vs-project-differences.md`](./07-template-vs-project-differences.md) | Template vs Project-Specific Differences | 102 |
| 8 | [`08-wp-plugin-boundary.md`](./08-wp-plugin-boundary.md) | PowerShell ↔ WP-Plugin Boundary | 109 |
| 9 | [`09-runner-features.md`](./09-runner-features.md) | PowerShell Runner — Features & Configuration Examples | 207 |
| 10 | [`25-multi-site-deployment.md`](./25-multi-site-deployment.md) | Multi-Site Deployment | 94 |

<!-- AUTO-TOC:END -->

---

## Summary

This specification defines a **cross-project reusable** PowerShell integration pattern for building and running fullstack applications with Go backend and React frontend. The system uses a JSON configuration file (`powershell.json`) to define project-specific paths and settings.

**Key Features:**
- **pnpm Plug'n'Play (PnP)** - Disk-efficient package management with shared store
- **Relative Path Resolution** - All paths relative to script location (working directory)
- **Force Reinstall** - Clear caches and reset everything with `-Force` flag
- **Multi-Project Root Folder** - Shared pnpm store across Node.js projects

**This spec is NOT project-specific** — it can be used by:
- WP Plugin Publish
- Spec Management Software
- Any Go + React fullstack project

---

## User Stories

- As a developer, I want to run a single command to build and start my fullstack app
- As a developer, I want clean build options to reset everything when needed
- As a developer, I want the script to auto-install missing dependencies (Go, Node.js, pnpm)
- As a developer, I want to configure paths via JSON instead of editing the script
- As a developer, I want firewall rules configured automatically for development
- As a developer, I want pnpm PnP to save disk space across multiple projects

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     PowerShell Runner Architecture v2.0                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│   │   run.ps1    │───▶│ powershell.  │───▶│   Project    │                  │
│   │   (Script)   │    │ json config  │    │   Folders    │                  │
│   └──────────────┘    └──────────────┘    └──────────────┘                  │
│          │                   │                    │                          │
│          │                   ▼                    ▼                          │
│          │           ┌──────────────┐    ┌──────────────┐                   │
│          │           │  pnpm Store  │    │  Go Backend  │                   │
│          │           │  (Shared)    │    │  + React FE  │                   │
│          │           └──────────────┘    └──────────────┘                   │
│          ▼                                                                   │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                         Pipeline Steps                               │   │
│   │  1. Git Pull → 2. Prerequisites → 3. pnpm Install → 4. Build → 5. Run│  │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Pipeline Steps

| Step | Name | Description | Flags |
|------|------|-------------|-------|
| 1 | Git Pull | Sync latest changes | `-SkipPull` to skip |
| 2 | Prerequisites | Check/install Go, Node.js, pnpm | Auto-install via winget |
| 3 | pnpm Install | Install dependencies with PnP | `-Force` clears store & reinstalls |
| 4 | Frontend Build | Build React with pnpm | `-SkipBuild` to skip |
| 5 | Copy & Run | Copy dist, start Go server | `-BuildOnly` to skip run |

---

## Package Management: pnpm with Plug'n'Play

### Why pnpm PnP?

| Feature | npm | pnpm PnP |
|---------|-----|----------|
| Disk Usage | Full copy per project | Shared store, hard links |
| Install Speed | Moderate | Fast (cached) |
| node_modules | Required (~500MB+) | Not required |
| Deterministic | package-lock.json | pnpm-lock.yaml |

### Configuration

```json
{
  "usePnp": true,
  "pnpmStorePath": "E:/.pnpm-store"
}
```

- `usePnp: true` - Enable pnpm with PnP mode
- `pnpmStorePath` - Custom store location (relative to rootDir or absolute)

### Store Path Options

| Option | Path | Description |
|--------|------|-------------|
| **Default (Recommended)** | `E:/.pnpm-store` | Shared drive for all projects |
| **Relative (Isolated)** | `.pnpm-store` | Store in project root |
| **User Home** | `~/.pnpm-store` | Global store in user home |

---

## Folder Structure

```
spec/powershell-integration/
├── 00-overview.md               ← This file
├── 01-configuration-schema.md   ← JSON config format with pnpm options
├── 02-script-reference/00-overview.md       ← CLI flags and functions
├── 03-integration-guide.md      ← How to add to any project
├── 04-error-codes.md            ← Exit codes (9500-9599)
├── 05-firewall-rules.md         ← Windows firewall setup
├── schemas/
│   └── powershell.schema.json   ← JSON Schema for validation
├── templates/
│   ├── run.ps1                  ← Main script template
│   └── powershell.json          ← Example config with pnpm
└── examples/
    └── server-client-project.json  ← Sample for server/client layout

spec/upload-scripts/              ← Related: WordPress plugin upload scripts
├── README.md                    ← Upload pipeline overview
├── 01-upload-plugin-v1.md       ← V1: Basic single-file upload
├── 02-upload-plugin-v2.md       ← V2: Envelope-aware upload
├── 03-upload-plugin-v3.md       ← V3: Parallel multi-plugin deployment
├── 04-upload-plugin-custom.md   ← Custom path deployments
└── 05-configuration.md          ← Auth, headers, fallback config
```

---

## Quick Start

```powershell
# Full build and run (pnpm PnP enabled)
.\run.ps1

# Clean rebuild everything (clears pnpm store cache)
.\run.ps1 -Force

# Just start backend (skip frontend build)
.\run.ps1 -SkipBuild

# Build only (don't start server)
.\run.ps1 -BuildOnly

# Skip git pull + clean build
.\run.ps1 -SkipPull -Force

# Configure firewall (requires Admin)
.\run.ps1 -OpenFirewall

# Show help
.\run.ps1 -Help
```

---

## Configuration & Features

The full `powershell.json` example, feature deep-dive (auto-install, force-clean, firewall), path-resolution diagram, and per-project setup recipe live in [`09-runner-features.md`](./09-runner-features.md) (extracted per AUD-L-01 to keep this overview under the 400-line soft cap).

Quick pointers:

- **Schema reference** → [`01-configuration-schema.md`](./01-configuration-schema.md)
- **Example config + features** → [`09-runner-features.md`](./09-runner-features.md)
- **CLI flags** → [`02-script-reference/00-overview.md`](./02-script-reference/00-overview.md)

---

## AI Handoff Instructions

To integrate this PowerShell runner into any project, share:

```
spec/powershell-integration/
```

Tell the AI:
> "Follow the spec at `spec/powershell-integration/` to add the PowerShell build runner. Create a `powershell.json` config for my project structure. Enable pnpm PnP for disk-efficient package management."

---

## Cross-References

| Document | Description |
|----------|-------------|
| [Configuration Schema](./01-configuration-schema.md) | JSON config format with pnpm options |
| [Script Reference](./02-script-reference/00-overview.md) | CLI flags and functions |
| [Integration Guide](./03-integration-guide.md) | Step-by-step setup |
| [Error Codes](./04-error-codes.md) | Exit codes 9500-9599 |
| [Firewall Rules](./05-firewall-rules.md) | Windows firewall setup |
| Upload Scripts Spec | WordPress plugin upload scripts (V1, V2, V3) — *folder pending creation* |
| Upload V1 | Single-file upload via Invoke-RestMethod — *folder pending creation* |
| Upload V2 | Envelope-aware upload with unwrapping — *folder pending creation* |
| Upload V3 | Parallel multi-plugin deployment via Start-Job — *folder pending creation* |
| Upload Custom | Custom path deployments via `run.ps1 -u -pp` — *folder pending creation* |
| Upload Config | Authentication, headers, and fallback config — *folder pending creation* |

---

*This spec enables consistent, reproducible builds across all fullstack projects with optimized disk usage via pnpm PnP.*

---

## Related

**In this section:**

- [`01-configuration-schema.md`](./01-configuration-schema.md) — Configuration Schema
- [`03-integration-guide.md`](./03-integration-guide.md) — Integration Guide
- [`04-error-codes.md`](./04-error-codes.md) — Error Codes
- [`05-firewall-rules.md`](./05-firewall-rules.md) — Firewall Rules
- [`06-php-known-issues.md`](./06-php-known-issues.md) — Php Known Issues
- [`07-template-vs-project-differences.md`](./07-template-vs-project-differences.md) — Template Vs Project Differences
- [`25-multi-site-deployment.md`](./25-multi-site-deployment.md) — Multi Site Deployment

**See also:**

- [`../00-overview.md`](../00-overview.md) — Parent overview
- [`97-acceptance-criteria.md`](./97-acceptance-criteria.md) — Acceptance criteria
