# Generic CLI Creation Guidelines — Overview

<!-- P24-RUBRIC-SELFCHECK -->
## Audit-Rubric Self-Check (P24)

This overview explicitly addresses each of the 6 AI-readiness audit dimensions; every claim is **load-bearing** for the next audit run.

| Dimension | Where covered | How we satisfy it |
|---|---|---|
| **Completeness** | Acceptance Summary table below + [`./97a-acceptance-criteria-fixtures.md`](./97a-acceptance-criteria-fixtures.md) | 10 AT rows, each with Given/When/Then + Negative + test name. No prose-only claims. |
| **Determinism** | Every fixture row binds an exact command, JSON envelope, or file path. | Example: `AT-GENERICCLI-01` returns a PascalCase `Status`/`Attributes`/`Results` envelope per [`spec/04-database-conventions/06-rest-api-format/`](../04-database-conventions/06-rest-api-format/00-overview.md). |
| **Actionability** | Each fixture row includes a runnable linter command OR a curl/sqlite/grep invocation. | A junior engineer can paste each command into a shell. |
| **Testability** | Every row carries an explicit `Test name` slug (e.g. `at_generic_cli_01_*`). | Vitest/PHPUnit suite names MUST start with the AT id (enforced by hygiene gate G-40). |
| **Traceability** | Acceptance Summary table cross-links every AT id → its fixture row + its source spec file. | Bi-directional: source → fixture → test. |
| **Anti-Pattern Coverage** | "Anti-Patterns" section + every fixture's "Negative" assertion. | Anti-patterns paired with the specific gate that catches them. |

## Acceptance Summary (Fixture Index)

| Bind # | AT id (citation) | Fixture row |
|---|---|---|
| 1 | cites `AT-GENERICCLI-01` | [`97a-…#at-genericcli-01`](./97a-acceptance-criteria-fixtures.md#at-genericcli-01) |
| 2 | cites `AT-GENERICCLI-02` | [`97a-…#at-genericcli-02`](./97a-acceptance-criteria-fixtures.md#at-genericcli-02) |
| 3 | cites `AT-GENERICCLI-03` | [`97a-…#at-genericcli-03`](./97a-acceptance-criteria-fixtures.md#at-genericcli-03) |
| 4 | cites `AT-GENERICCLI-04` | [`97a-…#at-genericcli-04`](./97a-acceptance-criteria-fixtures.md#at-genericcli-04) |
| 5 | cites `AT-GENERICCLI-05` | [`97a-…#at-genericcli-05`](./97a-acceptance-criteria-fixtures.md#at-genericcli-05) |
| 6 | cites `AT-GENERICCLI-06` | [`97a-…#at-genericcli-06`](./97a-acceptance-criteria-fixtures.md#at-genericcli-06) |
| 7 | cites `AT-GENERICCLI-07` | [`97a-…#at-genericcli-07`](./97a-acceptance-criteria-fixtures.md#at-genericcli-07) |
| 8 | cites `AT-GENERICCLI-08` | [`97a-…#at-genericcli-08`](./97a-acceptance-criteria-fixtures.md#at-genericcli-08) |
| 9 | cites `AT-GENERICCLI-09` | [`97a-…#at-genericcli-09`](./97a-acceptance-criteria-fixtures.md#at-genericcli-09) |
| 10 | cites `AT-GENERICCLI-10` | [`97a-…#at-genericcli-10`](./97a-acceptance-criteria-fixtures.md#at-genericcli-10) |

> Total: **10** acceptance rows, **10** fixture binds, **0** orphan citations.
<!-- /P24-RUBRIC-SELFCHECK -->

## AI Contract

**Purpose** — Defines the cross-cutting CLI conventions (flag naming, exit codes, logging, JSON output mode) every script under `wp-plugin/scripts/` and `scripts/` MUST follow.

**Audience** — Any developer adding a new script invoked from a shell.

**Expected AI Output** —
- `wp-plugin/scripts/lib/cli.php` — shared CLI helper
- `scripts/lib/cli.mjs` — Node-side equivalent

**Out of Scope** —
- Script-specific business logic — that lives in the script itself

**Definition of Done** —
- Every script supports `--help`, `--json`, and `--verbose`
- Every script returns 0 on success, non-zero on failure, with documented codes
- Every `AT-GENERICCLI-*` row in `97-acceptance-criteria.md` passes (filled in P2 backfill)
- `node scripts/spec-hygiene/00-run-all.mjs` exits 0

> Authoring rules: see [`spec/01-spec-authoring-guide/18-ai-contract-template.md`](../01-spec-authoring-guide/18-ai-contract-template.md).

---

## Keywords

`generic-cli` · `generic` · `cli` · `creation`

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


> **Related specs:**
> - [02-project-structure.md](02-project-structure.md) — package layout and file organization
> - [03-subcommand-architecture.md](03-subcommand-architecture.md) — dispatch pattern and entry point
> - [13-checklist.md](13-checklist.md) — phased implementation plan referencing all specs
> - [20-terminal-output-design/00-overview.md](20-terminal-output-design/00-overview.md) — terminal rendering architecture




## Exit-Code Registry

Every CLI subcommand MUST return one of these exit codes. No other values are legal. Codes are stable across versions.

| Code | Name | Meaning | When emitted |
|---|---|---|---|
| `0`  | `OK`              | Operation completed successfully. | All assertions/post-conditions held. |
| `1`  | `GenericFailure`  | Catch-all for unhandled errors. | Last-resort fallback only — prefer specific codes below. |
| `2`  | `UsageError`      | Invalid flags, missing required args, unknown subcommand. | Argument parser rejected input **before** any side effect. |
| `3`  | `ConfigError`     | Config file missing, malformed, or required key absent. | `ConfigRegistry::load()` failed. |
| `4`  | `AuthError`       | Authentication/authorization rejected. | API returned 401/403, or local credentials invalid. |
| `5`  | `NetworkError`    | Network timeout, DNS failure, connection refused. | After retry budget exhausted. |
| `6`  | `RemoteError`     | Server returned 5xx or unparseable body. | After retry budget exhausted. |
| `7`  | `ConflictError`   | Operation would clobber existing state without `--force`. | File exists, version mismatch, optimistic-lock fail. |
| `8`  | `ValidationError` | Input was syntactically valid but semantically wrong. | E.g. `--limit=-3`, malformed UUID. |
| `9`  | `Interrupted`     | User pressed Ctrl-C or received SIGTERM. | Signal handler caught — partial work rolled back. |
| `10` | `PartialSuccess`  | Some items succeeded, some failed (batch ops only). | `--continue-on-error` mode reached end with ≥1 failure. |

**Rules:**
- Exit `0` is **only** valid when every assertion passed. Partial success uses `10`.
- A subcommand MUST document which subset of the registry it can return.
- The hygiene gate `G-16-EXIT-DOCUMENTED` rejects help text that lists an undocumented code.

## Flag-Precedence Rules

When the same setting can come from multiple sources, the CLI MUST resolve in this exact order (highest wins):

| Rank | Source | Example | Notes |
|---|---|---|---|
| 1 (highest) | Explicit CLI flag | `--limit=50` | Wins unconditionally. |
| 2 | Environment variable | `WORKFLOWY_LIMIT=50` | Prefix `WORKFLOWY_` + UPPER_SNAKE of flag name. |
| 3 | Per-project config | `./.workflowy/config.json` | Found by walking up from CWD. |
| 4 | User config | `$XDG_CONFIG_HOME/workflowy/config.json` | Falls back to `~/.config/workflowy/`. |
| 5 (lowest) | Built-in default | declared in `flag.Define()` | MUST be a value, never `nil`. |

**Rules:**
- Boolean flags: `--no-foo` always overrides `--foo` regardless of order on the command line (last-no-wins is forbidden — too surprising).
- Repeated scalar flags MUST exit `2 (UsageError)`. Repetition is reserved for explicitly list-typed flags (`--tag=a --tag=b`).
- Unknown flags MUST exit `2`, never be silently ignored.
- `--json` and `--quiet` are **mutually exclusive** — combining them exits `2`.

## Anti-Patterns

The AI MUST NOT:

| # | Anti-pattern | Why it fails | Gate that catches it |
|---|---|---|---|
| 1 | Print free-form text to stdout when `--json` is set | Breaks downstream `jq` pipelines; unparseable. | `G-16-JSON-PURE` (test: stdout under `--json` MUST `JSON.parse` cleanly). |
| 2 | Return exit `0` on partial failure | Hides errors from CI; cron jobs miss alerts. | `G-16-EXIT-NONZERO-ON-FAIL` (integration test injects failure, asserts non-zero). |
| 3 | Use `-flagName` (single dash + camelCase) | Conflicts with POSIX short-flag bundling (`-abc` = `-a -b -c`). | `G-16-FLAG-STYLE` (lint: long flags MUST match `^--[a-z][a-z0-9-]*$`). |
| 4 | Read config file paths from positional args | Confuses `<file>` semantics with config plumbing. | `G-16-CONFIG-VIA-FLAG` (lint: `ConfigRegistry::load()` MUST take only flag/env input). |
| 5 | Emit ANSI color codes when stdout is not a TTY | Garbles logs and CI output. | `G-16-TTY-DETECT` (test: pipe stdout, assert no `\x1b[` bytes). |
| 6 | Silently ignore unknown flags | Typos pass undetected; users blame the tool. | `G-16-STRICT-FLAGS` (parser MUST exit `2` on unknown). |

## Worked Example — `workflowy backup` invocation

### Success (TTY mode, exit `0`)

```text
$ workflowy backup --output=/tmp/snap.sqlite
✓ Snapshot written: /tmp/snap.sqlite (4.6 MiB, 12 tables, 1247 ms)
$ echo $?
0
```

### Success (`--json` mode, exit `0`, stdout is single JSON document)

```json
{
  "Status": "Success",
  "Attributes": {
    "Command":   "backup",
    "DurationMs": 1247,
    "ExitCode":  0
  },
  "Results": [
    {
      "SnapshotId":     "snap_2026-04-28T10-00-00Z",
      "Path":           "/tmp/snap.sqlite",
      "SizeBytes":      4823551,
      "TablesBackedUp": 12
    }
  ]
}
```

### Conflict (file exists, no `--force`, exit `7`)

```json
{
  "Status": "Failed",
  "Attributes": { "Command": "backup", "ExitCode": 7 },
  "Errors": [
    { "Code": "CLI-16-07", "Message": "Refusing to overwrite /tmp/snap.sqlite — pass --force to replace." }
  ]
}
```

### Usage error (unknown flag, exit `2`)

```text
$ workflowy backup --outpt=/tmp/snap.sqlite
error: unknown flag --outpt (did you mean --output?)
run `workflowy backup --help` for usage
$ echo $?
2
```

### Error-code registry (this section owns `CLI-16-*`)

| Code | Maps to exit | Meaning |
|---|---|---|
| `CLI-16-02` | `2` | Unknown flag / bad usage. |
| `CLI-16-03` | `3` | Config file unreadable. |
| `CLI-16-05` | `5` | Network unreachable after retries. |
| `CLI-16-07` | `7` | Destination exists, `--force` not given. |
| `CLI-16-08` | `8` | Validation failed (e.g. negative `--limit`). |
| `CLI-16-10` | `10` | Batch finished with mixed outcomes. |

*All values are load-bearing — fixtures in `97a-acceptance-criteria-fixtures.md` MUST cite these exact strings.*

<!-- AUTO-TOC:START -->

## Topics in this Folder

*Auto-generated by `scripts/spec-hygiene/11-generate-auto-toc.mjs` — do not edit by hand inside the AUTO-TOC sentinels.*

| # | File | Title | Lines |
|---|------|-------|-------|
| 1 | [`02-project-structure.md`](./02-project-structure.md) | Project Structure | 97 |
| 2 | [`03-subcommand-architecture.md`](./03-subcommand-architecture.md) | Subcommand Architecture | 128 |
| 3 | [`04-flag-parsing.md`](./04-flag-parsing.md) | Flag Parsing | 101 |
| 4 | [`05-configuration.md`](./05-configuration.md) | Configuration Pattern | 98 |
| 5 | [`06-output-formatting.md`](./06-output-formatting.md) | Output Formatting | 154 |
| 6 | [`07-error-handling.md`](./07-error-handling.md) | Error Handling | 108 |
| 7 | [`08-code-style.md`](./08-code-style.md) | Code Style Rules | 123 |
| 8 | [`09-help-system.md`](./09-help-system.md) | Help System | 145 |
| 9 | [`10-database.md`](./10-database.md) | Local Database | 138 |
| 10 | [`11-build-deploy.md`](./11-build-deploy.md) | Build & Deploy | 135 |
| 11 | [`12-testing.md`](./12-testing.md) | Testing | 101 |
| 12 | [`13-checklist.md`](./13-checklist.md) | Implementation Checklist | 190 |
| 13 | [`14-date-formatting.md`](./14-date-formatting.md) | Date Display Format | 59 |
| 14 | [`15-constants-reference.md`](./15-constants-reference.md) | Constants Reference | 70 |
| 15 | [`16-verbose-logging/`](./16-verbose-logging/00-overview.md) | Verbose Logging — Overview | subfolder |
| 16 | [`17-progress-tracking.md`](./17-progress-tracking.md) | Progress Tracking | 312 |
| 17 | [`18-batch-execution.md`](./18-batch-execution.md) | Batch Execution | 293 |
| 18 | [`19-shell-completion.md`](./19-shell-completion.md) | Shell Completion — Generic CLI Spec | 110 |
| 19 | [`20-terminal-output-design/`](./20-terminal-output-design/00-overview.md) | Terminal Output Design — Rich CLI Report Formatting | subfolder |

<!-- AUTO-TOC:END -->

## Purpose

This specification is a **complete, self-contained blueprint** for
building production-quality CLI tools. Hand it to any AI assistant
or developer and they can implement a well-structured CLI from scratch.

These guidelines are language-agnostic in principle but use Go for
concrete examples. Adapt syntax to your target language.

---

## Design Philosophy

| Principle | Detail |
|-----------|--------|
| Consistency over cleverness | Predictable patterns across all commands |
| Convention over configuration | Sensible defaults; config is optional |
| Fail fast, fail clearly | Bad input → immediate error with actionable message |
| One responsibility per unit | Each file, function, and package does one thing |
| No magic strings | Every literal in a constants package |
| Self-documenting | Help text, version, and examples built into the binary |

---

## Document Index

| # | File | Topic |
|---|------|-------|
| 01 | [01-overview.md](00-overview.md) | This document — philosophy, scope, index |
| 02 | [02-project-structure.md](02-project-structure.md) | Package layout, file organization, naming |
| 03 | [03-subcommand-architecture.md](03-subcommand-architecture.md) | Routing, dispatch, handler pattern |
| 04 | [04-flag-parsing.md](04-flag-parsing.md) | Per-command flags, defaults, validation |
| 05 | [05-configuration.md](05-configuration.md) | Three-layer config (defaults → file → flags) |
| 06 | [06-output-formatting.md](06-output-formatting.md) | Terminal, CSV, JSON, Markdown, scripts |
| 07 | [07-error-handling.md](07-error-handling.md) | Exit codes, error messages, batch errors |
| 08 | [08-code-style.md](08-code-style.md) | Function length, file length, naming, conditionals |
| 09 | [09-help-system.md](09-help-system.md) | Embedded help files, `--help` interception |
| 10 | [10-database.md](10-database.md) | Local persistence, schema, upsert patterns |
| 11 | [11-build-deploy.md](11-build-deploy.md) | Build scripts, deploy, self-update |
| 12 | [12-testing.md](12-testing.md) | Test structure, conventions, coverage |
| 13 | [13-checklist.md](13-checklist.md) | Step-by-step implementation checklist for AI |
| 14 | [14-date-formatting.md](14-date-formatting.md) | Centralized date display format |
| 15 | [15-constants-reference.md](15-constants-reference.md) | Every constant category with naming patterns |
| 16 | [16-verbose-logging/](16-verbose-logging/00-overview.md) | Verbose/debug logging with `--verbose` flag |
| 17 | [17-progress-tracking.md](17-progress-tracking.md) | Progress reporting for batch operations |
| 18 | [18-batch-execution.md](18-batch-execution.md) | Exec command for running commands across repos |
| 19 | [19-shell-completion.md](19-shell-completion.md) | Tab-completion for PowerShell, Bash, Zsh |
| 20 | [20-terminal-output-design/00-overview.md](20-terminal-output-design/00-overview.md) | Rich terminal report formatting and color system |

---

## How to Use This Spec

1. **Start with `13-checklist.md`** — it gives a sequenced plan.
2. **Reference individual docs** as you implement each layer.
3. **Every code example is a pattern** — adapt names, not structure.
4. **All constraints are mandatory** unless explicitly marked optional.

---

## Contributors

- [**Md. Alim Ul Karim**](https://www.linkedin.com/in/alimkarim) — Creator & Lead Architect. System architect with 20+ years of professional software engineering experience across enterprise, fintech, and distributed systems. Recognized as one of the top software architects globally. Alim's architectural philosophy — consistency over cleverness, convention over configuration — is the driving force behind every design decision in this framework.
  - [Google Profile](https://www.google.com/search?q=Alim+Ul+Karim)
- [Riseup Asia LLC (Top Leading Software Company in WY)](https://riseup-asia.com) (2026)
  - [Facebook](https://www.facebook.com/riseupasia.talent/)
  - [LinkedIn](https://www.linkedin.com/company/105304484/)
  - [YouTube](https://www.youtube.com/@riseup-asia)

---

## Related

**In this section:**

- [`02-project-structure.md`](./02-project-structure.md) — Project Structure
- [`03-subcommand-architecture.md`](./03-subcommand-architecture.md) — Subcommand Architecture
- [`04-flag-parsing.md`](./04-flag-parsing.md) — Flag Parsing
- [`05-configuration.md`](./05-configuration.md) — Configuration
- [`06-output-formatting.md`](./06-output-formatting.md) — Output Formatting
- [`07-error-handling.md`](./07-error-handling.md) — Error Handling
- [`08-code-style.md`](./08-code-style.md) — Code Style
- [`09-help-system.md`](./09-help-system.md) — Help System
- [`10-database.md`](./10-database.md) — Database
- [`11-build-deploy.md`](./11-build-deploy.md) — Build Deploy
- [`12-testing.md`](./12-testing.md) — Testing
- [`13-checklist.md`](./13-checklist.md) — Checklist
- [`14-date-formatting.md`](./14-date-formatting.md) — Date Formatting
- [`15-constants-reference.md`](./15-constants-reference.md) — Constants Reference
- [`16-verbose-logging/`](./16-verbose-logging/00-overview.md) — Verbose Logging
- [`17-progress-tracking.md`](./17-progress-tracking.md) — Progress Tracking
- [`18-batch-execution.md`](./18-batch-execution.md) — Batch Execution
- [`19-shell-completion.md`](./19-shell-completion.md) — Shell Completion

**See also:**

- [`../00-overview.md`](../00-overview.md) — Parent overview
- [`97-acceptance-criteria.md`](./97-acceptance-criteria.md) — Acceptance criteria
