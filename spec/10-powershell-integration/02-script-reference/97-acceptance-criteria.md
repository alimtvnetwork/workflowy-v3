# Script Reference — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 14 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-SCRIPTREFERENCE-01` … `AT-SCRIPTREFERENCE-14`

---

## Criteria

### CLI flags (file 01)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-SCRIPTREFERENCE-01 | Every flag in `01-cli-flags.md` MUST be documented with: name, type, default, required/optional, and a one-line description; missing any column fails review. | [`01-cli-flags.md`](./01-cli-flags.md) |
| AT-SCRIPTREFERENCE-02 | Boolean flags MUST follow PowerShell convention (`[switch]$Foo`) — string-coerced booleans like `-Foo "true"` are forbidden because they break tab-completion and IntelliSense. | [`01-cli-flags.md`](./01-cli-flags.md) |

### Usage examples (file 02)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-SCRIPTREFERENCE-03 | Every example block MUST be copy-paste runnable on a clean PowerShell 7+ session (no implicit `cd`, no undocumented prerequisites); broken examples are a Code-Red docs bug. | [`02-usage-examples.md`](./02-usage-examples.md) |
| AT-SCRIPTREFERENCE-04 | Each example MUST show the expected exit code (0 / non-zero) so users know what success looks like; ambiguous examples fail review. | [`02-usage-examples.md`](./02-usage-examples.md), [`05-timing-and-exit-codes.md`](./05-timing-and-exit-codes.md) |

### Functions reference (file 03)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-SCRIPTREFERENCE-05 | Every helper function MUST document `Synopsis`, `Parameters`, `Returns`, and `Example` using PowerShell comment-based help (`<# .SYNOPSIS … #>`); missing comment-help blocks fail lint. | [`03-functions-reference.md`](./03-functions-reference.md) |
| AT-SCRIPTREFERENCE-06 | Function names MUST follow `Verb-Noun` PowerShell convention with an approved verb (`Get-Verb`); custom verbs are forbidden. | [`03-functions-reference.md`](./03-functions-reference.md) |

### Pipeline steps (file 04)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-SCRIPTREFERENCE-07 | Each pipeline step MUST log a `▶ Step N/Total: <name>` header so users can track progress; silent steps are forbidden. | [`04-pipeline-steps.md`](./04-pipeline-steps.md) |
| AT-SCRIPTREFERENCE-08 | A step failure MUST short-circuit the pipeline AND emit a typed exit code (NOT a generic `1`); silent continue-on-error is a Code-Red reliability bug. | [`04-pipeline-steps.md`](./04-pipeline-steps.md), [`05-timing-and-exit-codes.md`](./05-timing-and-exit-codes.md) |

### Timing & exit codes (file 05)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-SCRIPTREFERENCE-09 | Final summary MUST print elapsed time per step AND total elapsed time; missing the breakdown fails review. | [`05-timing-and-exit-codes.md`](./05-timing-and-exit-codes.md) |
| AT-SCRIPTREFERENCE-10 | Exit codes MUST be drawn from a documented enum (`ExitCode.Success = 0`, `ExitCode.ConfigError = 2`, `ExitCode.PipelineFailure = 3`, etc.); ad-hoc numeric exits are forbidden. | [`05-timing-and-exit-codes.md`](./05-timing-and-exit-codes.md) |

### pnpm store commands (file 06)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-SCRIPTREFERENCE-11 | `pnpm store` invocations MUST go through a wrapper that pins the pnpm major version; calling `pnpm` directly with no version check is forbidden because lockfile drift breaks reproducibility. | [`06-pnpm-store-commands.md`](./06-pnpm-store-commands.md) |
| AT-SCRIPTREFERENCE-12 | Cache-clear operations MUST require `-Force` to prevent accidental wipes; a missing confirmation is a Code-Red destructive-action bug. | [`06-pnpm-store-commands.md`](./06-pnpm-store-commands.md) |

### wpPlugins config (file 07)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-SCRIPTREFERENCE-13 | `wpPlugins` config blocks MUST validate against a JSON schema before use; invalid configs MUST fail-fast (≤1 s validation budget) with a pointer to the offending field — silent skip is forbidden. | [`07-wp-plugins-config.md`](./07-wp-plugins-config.md) |
| AT-SCRIPTREFERENCE-14 | Plugin upload destinations MUST be parameterized via the config — hardcoded WordPress paths in `upload-plugin-*.ps1` are forbidden because they prevent multi-environment use. | [`07-wp-plugins-config.md`](./07-wp-plugins-config.md) |

---

## Verification

```bash
# Comment-help presence on all functions
pwsh -c "Get-Help ./scripts/run.ps1 -Full" | grep -i synopsis

# Schema validation
pwsh -c "Test-Json -Path config/wp-plugins.json -SchemaFile schemas/wp-plugins.schema.json"

# Hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../00-overview.md`](../00-overview.md) — PowerShell integration overview
- [`../../16-generic-cli/20-terminal-output-design/97-acceptance-criteria.md`](../../16-generic-cli/20-terminal-output-design/97-acceptance-criteria.md) — Output formatting conventions

---

*Curated 2026-04-25 — closes batch-15 item 3. Replaces v0.1.0 stub.*


---

## Fixtures

Fixtures for every AT row in this file are covered by the global P2g sweep — see [`../../97a-acceptance-criteria-fixtures.md`](../../97a-acceptance-criteria-fixtures.md) (apply the matching pattern by section).
