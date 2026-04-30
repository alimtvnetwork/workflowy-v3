# G-19 Workflow Contract Drift Gate — Algorithm Spec

> **Version:** 1.0.0
> **Updated:** 2026-04-26 (UTC+8)
> **Parent:** [00-overview.md](./00-overview.md)
> **Reserved Gate ID:** G-19 (per [`02-ci-quality-gates.md`](./02-ci-quality-gates.md) catalogue)
> **Closes:** A-32 (third of A-30..A-35 cluster — workflow drift detection)
> **Origin:** A-31 identified that the existing `.github/workflows/spec-hygiene.yml` uses `node scripts/spec-hygiene/00-run-all.mjs` directly, violating the **single entry point** rule (AT-CIGATE-08) defined in `02-ci-quality-gates.md`. G-19 is the automated detector that prevents this class of drift from recurring.

---

## Overview

This document is the **algorithmic SSOT** for the hygiene gate that asserts every file under `.github/workflows/` matches the contract defined in [`03-github-actions-workflow.md`](./03-github-actions-workflow.md). Sibling gate G-15 detects spec/code-enum drift; sibling G-16 detects spec/CSS-token drift; **G-19 detects spec/CI-config drift**.

The gate parses each YAML workflow file and compares specific fields against a structured expectation table extracted from the workflow-contract spec. Mismatches produce a single line of human-readable output naming the field, the actual value, and the expected value.

---

## User Story

As a maintainer, I want CI itself to fail-fast (exit ≠0 within the first 30 s of the workflow run) when someone edits a workflow file in a way that diverges from the agreed contract, so that the contract document and the actual `.github/workflows/*.yml` files can never silently drift apart.

---

## Inputs

| Input | Type | Source | Notes |
|-------|------|--------|-------|
| `.github/workflows/*.yml` | YAML | Repository | All workflow files; each must satisfy a contract row |
| Contract table | Structured constants in the script | Hard-coded mirror of `03-github-actions-workflow.md` | The script is allowed to embed expectations because it IS the enforcement layer |

## Outputs

| Output | Persisted? | Channel | Notes |
|--------|-----------|---------|-------|
| Per-violation line | ❌ | stdout | Format: `❌ <file>: <field> = <actual>; expected <expected>` |
| Final summary | ❌ | stdout | `✅ G-19: N workflow file(s) match contract` or `❌ G-19: V violation(s) across N file(s)` |
| Exit code | ❌ | Process exit | `0` clean, `1` any violation (per AT-CIGATE exit-code contract) |

---

## Contract Expectations (Initial Set)

| Workflow file | Field path | Required value | Source |
|---------------|------------|----------------|--------|
| `spec-hygiene.yml` | `name` | `Spec Hygiene` | A-31 §Required Workflow |
| `spec-hygiene.yml` | `on.push.branches` | `[main]` | A-31 Triggers table |
| `spec-hygiene.yml` | `on.push.paths` (set equality) | `{spec/**, scripts/spec-hygiene/**, src/types/**, src/index.css, .github/workflows/spec-hygiene.yml}` | A-31 Triggers table |
| `spec-hygiene.yml` | `on.pull_request.paths` (set equality) | same as push paths | A-31 Triggers table |
| `spec-hygiene.yml` | `on.workflow_dispatch` | present (any value) | A-31 Triggers table |
| `spec-hygiene.yml` | `jobs.<job>.runs-on` | `ubuntu-latest` | A-31 Job Contract |
| `spec-hygiene.yml` | `jobs.<job>.timeout-minutes` | `5` | A-31 Job Contract |
| `spec-hygiene.yml` | A step uses `oven-sh/setup-bun@v2` | true | A-31 Step 2 |
| `spec-hygiene.yml` | A step runs `bun install --frozen-lockfile` | true | A-31 Step 3 |
| `spec-hygiene.yml` | Exactly one step runs `bun run spec:check` | true | A-31 Step 4 (single entry point) |
| `spec-hygiene.yml` | No step runs `node scripts/spec-hygiene/` | true | A-31 §Note + AT-CIGATE-08 |
| `code-checks.yml` | File presence | absent while `mem://constraints/spec-only-mode` active | A-31 Reserved Workflows |
| `release.yml` | File presence | absent while spec-only mode active | A-31 Reserved Workflows |

> **Extending the table** — when a new workflow is added to A-31, append a row above and an acceptance test below. The script must lose 0 violations after the addition.

---

## Algorithm

```text
function checkWorkflowDrift(WorkflowDir, ContractTable, SpecOnlyActive) -> int:
    Violations := []

    # 1. Parse each present workflow file
    for each File in WorkflowDir matching "*.yml":
        Parsed := YAML.parse(read(File))
        for each Row in ContractTable where Row.file == basename(File):
            Actual := getByPath(Parsed, Row.fieldPath)
            if not matches(Actual, Row.expected):
                Violations.push({File, field: Row.fieldPath, actual: Actual, expected: Row.expected})

    # 2. Reserved-workflow absence check
    if SpecOnlyActive:
        for each Reserved in ["code-checks.yml", "release.yml"]:
            if exists(WorkflowDir / Reserved):
                Violations.push({File: Reserved, field: "<presence>", actual: "exists", expected: "absent (spec-only mode)"})

    # 3. Print + exit
    for each V in Violations:
        print(`❌ ${V.File}: ${V.field} = ${V.actual}; expected ${V.expected}`)
    if Violations.length > 0:
        print(`❌ G-19: ${Violations.length} violation(s) across ${countDistinct(Violations.File)} file(s)`)
        return 1
    print(`✅ G-19: ${countYaml(WorkflowDir)} workflow file(s) match contract`)
    return 0
```

### Rules

1. **Hermetic** — script reads only the working tree; never network, never git history.
2. **Set equality, not order** — for list fields like `paths`, the script compares as sets. Re-ordering does not produce a violation.
3. **`matches()` semantics** — string and number fields use `===`. List fields with the `(set equality)` annotation use set comparison. Boolean "step exists" rows use `Array.some(stepMatchesPredicate)`.
4. **Spec-only detection** — the script reads `mem://constraints/spec-only-mode` indirectly via a sentinel: the absence of `src/main.tsx` (Phase-1 bootstrap entry) implies spec-only. Once P1.1 lands, the sentinel flips and reserved-workflow checks become assertions of *presence* via a future contract row.
5. **One-pass** — single read of each file; complexity O(F · R) where F = workflow files (≤ 5 expected), R = contract rows (≤ 20 expected).

---

## Edge Cases

1. Workflow file uses YAML anchors (`&` / `*`) → `js-yaml.load()` resolves them; comparison sees the resolved values.
2. Workflow file has multiple jobs → script iterates all jobs; `jobs.<job>.runs-on` rule applies to **every** job (a job that violates fails the gate).
3. Workflow file has matrix strategy → `runs-on` may be templated (`${{ matrix.os }}`); script treats template strings as opaque and emits a violation directing the maintainer to add an explicit row to the contract table.
4. New `.yml` file under `.github/workflows/` with no contract row → emits warning `⚠ G-19: <file> has no contract row; add one to 03-github-actions-workflow.md or remove the file`. Warning is a **violation** (exit 1) — refusing the change forces the contract to stay in sync.
5. `spec-only-mode` constraint lifted but `code-checks.yml` still missing → reserved-workflow check inverts; script emits a violation telling the maintainer to add the file per A-31 §Reserved Workflows.
6. Duplicate `bun run spec:check` steps (e.g. once normally, once after a manual setup step) → violates "Exactly one step runs `bun run spec:check`"; emits a violation.
7. Workflow uses `setup-node@v4` instead of `setup-bun@v2` → step-existence check fails; suggested fix included in the violation message.
8. Path filter list contains `spec/**` but is missing `src/types/**` → set-equality fails; script lists the missing entries.

---

## Acceptance Tests

| ID | Given | When | Then | testid |
|----|-------|------|------|--------|
| AT-G19-01 | Workflow file matches every contract row | G-19 runs | Exits 0 with `✅ G-19: <N> workflow file(s) match contract` | `g19-clean` |
| AT-G19-02 | Workflow runs `node scripts/spec-hygiene/00-run-all.mjs` | G-19 runs | Exits 1 with violation naming the forbidden command | `g19-detect-node-direct` |
| AT-G19-03 | Workflow `timeout-minutes: 30` | G-19 runs | Exits 1 with violation `timeout-minutes = 30; expected 5` | `g19-detect-timeout-drift` |
| AT-G19-04 | Workflow path filter omits `src/types/**` | G-19 runs | Exits 1; violation lists missing path entries | `g19-detect-path-drift` |
| AT-G19-05 | A new workflow file `deploy.yml` exists with no contract row | G-19 runs | Exits 1 with warning that no contract row exists | `g19-detect-orphan-workflow` |
| AT-G19-06 | `code-checks.yml` exists during spec-only mode | G-19 runs | Exits 1 with reserved-workflow violation | `g19-detect-premature-reserved` |
| AT-G19-07 | Spec-only constraint lifted (sentinel `src/main.tsx` exists) and `code-checks.yml` missing | G-19 runs | Exits 1 with "missing reserved workflow" violation | `g19-detect-missing-reserved` |
| AT-G19-08 | Workflow uses YAML anchor that resolves to correct value | G-19 runs | Exits 0; anchors do not cause false positives | `g19-yaml-anchor-safe` |
| AT-G19-09 | G-19 is registered in `00-run-all.mjs` checks array | `bun run spec:check` runs | Final tally includes G-19 result | `g19-registered-in-runner` |
| AT-G19-10 | G-19 reads only files under `.github/workflows/` and the script's own constants | Script execution observed | No network calls; no `git` invocations; no reads outside whitelist | `g19-hermetic` |

---

## Component Contract

> **Aspirational paths** — files below are agreed implementation targets, not yet present.

| Concern | Path | Function |
|---------|------|----------|
| Gate script | `scripts/spec-hygiene/19-check-workflow-contract.mjs` | `default export async function run(): Promise<number>` |
| YAML parser dependency | `js-yaml` (already in `bun.lock` if present; otherwise add via the only allowed lockfile mutation: spec-only-mode exit) | Used to parse workflow files |
| Contract constants | inline in `19-check-workflow-contract.mjs` | Mirror of the Contract Expectations table above |
| Runner registration | `scripts/spec-hygiene/00-run-all.mjs` `checks` array | Append `"scripts/spec-hygiene/19-check-workflow-contract.mjs"` after entry 16 |
| Catalogue update | [`02-ci-quality-gates.md`](./02-ci-quality-gates.md) Gate Catalogue table | Promote G-19 from "reserved" to active row |

---

## Cross-References

| Topic | Link |
|-------|------|
| Origin: workflow contract | [03-github-actions-workflow.md](./03-github-actions-workflow.md) |
| Sibling: gate runner contract | [02-ci-quality-gates.md](./02-ci-quality-gates.md) |
| Single entry point rule | [02-ci-quality-gates.md](./02-ci-quality-gates.md) AT-CIGATE-08 |
| Spec-only constraint | `mem://constraints/spec-only-mode` |
| Cycle-algorithm sibling drift gate (G-18) | [`../01-features/09a-mirror-cycle-detection.md`](../01-features/09a-mirror-cycle-detection.md) |
