# GitHub Actions Workflow Contract — Convention SSOT

> **Version:** 1.0.0
> **Updated:** 2026-04-26 (UTC+8)
> **Parent:** [00-overview.md](./00-overview.md)
> **Sibling:** [02-ci-quality-gates.md](./02-ci-quality-gates.md) — gate runner contract
> **Closes:** A-31 (CI workflow contract — second of A-30..A-35 cluster)

---

## Overview

This document is the **Single Source of Truth** for what the GitHub Actions workflows in `.github/workflows/` must look like, when they trigger, what they install, and how they enforce derived-artifact freshness. The sibling spec [`02-ci-quality-gates.md`](./02-ci-quality-gates.md) defines *which gates exist*; this file defines *how those gates are wired into CI*.

There is exactly **one** required workflow today (`spec-hygiene.yml`) and **two reserved** future workflows (`code-checks.yml`, `release.yml`) that will be added when SPEC-ONLY mode is lifted.

---

## User Story

As a contributor pushing to a branch, I want CI to fail loudly and quickly when my change breaks a hygiene rule or leaves a derived artifact stale, so that a PR review never has to manually re-run scripts to know whether the spec is consistent.

---

## Inputs

| Input | Source | Notes |
|-------|--------|-------|
| `package.json` | Repository root | Declares `spec:check` script |
| `bun.lock` | Repository root | Locked dependency tree (currently read-only per `mem://constraints/coding-guidelines`) |
| `scripts/spec-hygiene/**` | Repository | Referenced by the runner |
| Git diff after generators run | Workflow runtime | Used to detect stale derived artifacts |

## Outputs

| Output | Persisted? | Channel | Notes |
|--------|-----------|---------|-------|
| Workflow run status | ✅ GitHub | Checks API | `success` / `failure` per run |
| Annotated `::error::` lines | ❌ | GitHub UI | Surface stale-artifact failures inline |
| Workflow log | ✅ GitHub | Actions tab | 90-day retention (GitHub default) |

---

## Required Workflow: `spec-hygiene.yml`

### Triggers

| Event | Branches / paths | Required? |
|-------|------------------|-----------|
| `push` | `branches: [main]`, paths: `spec/**`, `scripts/spec-hygiene/**`, `src/types/**`, `src/index.css`, `.github/workflows/spec-hygiene.yml` | ✅ |
| `pull_request` | All branches; same path filter | ✅ |
| `workflow_dispatch` | Manual trigger from Actions tab | ✅ |

> **Why `src/types/**` + `src/index.css` are in the path filter:** gates G-15 (enum sync) and G-16 (Tailwind tokens) read those files. Without them, a PR that drifts code without touching spec would skip CI.

### Job Contract

| Field | Value | Rationale |
|-------|-------|-----------|
| `runs-on` | `ubuntu-latest` | Cheapest, fastest GH-hosted runner |
| `timeout-minutes` | `5` | Spec-check runs ~30 s today; 10× headroom |
| `permissions` | `contents: read` | Workflow only reads code, never writes |

### Required Steps (in order)

1. **Checkout** — `actions/checkout@v4` with `fetch-depth: 1` (shallow is fine; gates are hermetic).
2. **Setup runtime** — `oven-sh/setup-bun@v2` with `bun-version: latest`. Bun is the project's package manager (per `mem://architecture/tech-stack`); using `setup-node` only would force every gate to be node-launchable, which is true today but not a guarantee.
3. **Install dependencies** — `bun install --frozen-lockfile` to honour the locked `bun.lock`.
4. **Run gates** — exactly one command: `bun run spec:check`. **Do not** invoke individual gates here (per `02-ci-quality-gates.md` — single-entry-point rule, AT-CIGATE-08).
5. **Drift detection** — for every generator gate that writes into the working tree, run `git diff --exit-code <generated-path>`. On non-zero, print a `::error::` annotation telling the contributor which local script to run.

### Drift-Detection Targets

| Generator gate | Watched path(s) | Error message |
|----------------|------------------|----------------|
| G-04 `04-generate-index.mjs` | `spec/spec-index.md` | "spec-index.md is out of date. Run `bun run spec:check` locally and commit." |
| G-07 `07-extract-contract-map.mjs` | `spec/32-ui-design/01-architecture/05-component-contract-map.md` | "Component contract map is out of date. Run `bun run spec:check` locally and commit." |
| G-11 `11-generate-auto-toc.mjs` | `spec/**/00-overview.md` | "Auto-TOC blocks are stale. Run `bun run spec:check` locally and commit." |
| G-13 `13-generate-at-stubs.mjs` | `spec/**/97-acceptance-criteria.md` (when newly created) | "AT-stub generator created files. Commit them." |

> **Note on the existing workflow** (`.github/workflows/spec-hygiene.yml`): currently uses `node scripts/spec-hygiene/00-run-all.mjs` directly. This violates the **single entry point** rule (AT-CIGATE-08). A separate hygiene gate (G-19, reserved) will be added under A-32 to assert the workflow file matches this contract.

---

## Reserved Workflows (Spec-Only Mode)

These are **not yet present** and **must not be created** until SPEC-ONLY mode is lifted. They are documented here so the eventual implementation matches the agreed contract.

### `code-checks.yml` (Phase 1)

| Field | Value |
|-------|-------|
| Triggers | `push` to `main`, `pull_request` on all branches; paths: `src/**`, `package.json`, `bun.lock`, `tsconfig*.json`, `vite.config.ts`, `.github/workflows/code-checks.yml` |
| `timeout-minutes` | `10` |
| Steps | Checkout → setup-bun → `bun install --frozen-lockfile` → `bun run typecheck` → `bun run lint` → `bun run test` → `bun run build` |

### `release.yml` (Phase 5)

| Field | Value |
|-------|-------|
| Triggers | `push` of tags matching `v*.*.*`; `workflow_dispatch` |
| `timeout-minutes` | `15` |
| Steps | Checkout → setup-bun → `bun install` → `bun run spec:check` → `bun run build` → upload artifacts → create GitHub Release with auto-generated changelog |

---

## Edge Cases

1. A PR touches only `README.md` → path filter skips both required workflows; no CI runs. Acceptable: README has no enforced contract.
2. GitHub Actions outage → contributor cannot merge until CI re-runs; documented in `mem://features/offline-resilience` as an external dependency.
3. `bun install --frozen-lockfile` fails because `bun.lock` is out of date → CI fails on step 3 with a clear message; contributor must regenerate the lock locally.
4. A drift-detection step finds a diff but the diff is in a file the contributor didn't touch → still a failure; contributor must run `bun run spec:check` locally and commit the regenerated artifact (this is the intended forcing function).
5. `workflow_dispatch` triggered on a feature branch → runs the same job on that branch's HEAD; useful for re-running after a flaky network step.
6. Two PRs race to update the same generated file → second PR's CI fails on drift; contributor rebases and re-runs `bun run spec:check`.
7. A new gate is added but `package.json` `spec:check` still points at the old runner → CI passes silently; mitigated by AT-CIGATE-05 (unregistered-script audit).
8. Workflow file edited but path filter still excludes the change → mitigated by including `.github/workflows/spec-hygiene.yml` in its own path filter.

---

## Acceptance Tests

| ID | Given | When | Then | testid |
|----|-------|------|------|--------|
| AT-WORKFLOW-01 | A PR modifies a file under `spec/` | PR is opened | `Spec Hygiene` workflow runs and reports a check status | `workflow-spec-trigger` |
| AT-WORKFLOW-02 | A PR modifies only `README.md` | PR is opened | `Spec Hygiene` workflow does **not** run (path filter excludes it) | `workflow-no-trigger-readme` |
| AT-WORKFLOW-03 | A PR drifts `src/types/index.ts` away from spec enums | CI runs | G-15 fails inside `bun run spec:check`; workflow status is `failure` | `workflow-enum-drift-fails` |
| AT-WORKFLOW-04 | A PR forgets to commit a regenerated `spec-index.md` | CI runs | Drift-detection step prints `::error::` and exits 1 | `workflow-stale-index-fails` |
| AT-WORKFLOW-05 | Workflow file content matches this spec | Hygiene gate G-19 (reserved) runs | Exits 0 | `workflow-contract-match` |
| AT-WORKFLOW-06 | Workflow file uses `node scripts/...` instead of `bun run spec:check` | Hygiene gate G-19 runs | Exits 1 with message "Use single entry point per AT-CIGATE-08" | `workflow-single-entrypoint-violation` |
| AT-WORKFLOW-07 | Workflow runs on `ubuntu-latest` and finishes within 5 min | CI history inspected | Median runtime ≤ 90 s; p95 ≤ 180 s | `workflow-runtime-budget` |
| AT-WORKFLOW-08 | `code-checks.yml` does not yet exist while spec-only mode is active | Repository inspected | File is absent; reserved-workflow rule satisfied | `workflow-reserved-not-present` |

---

## Component Contract

> **Aspirational paths** — only `spec-hygiene.yml` exists today. The other two are gated by SPEC-ONLY-mode exit.

| Concern | Path | Status |
|---------|------|--------|
| Spec hygiene CI | `.github/workflows/spec-hygiene.yml` | ✅ Present (needs update to use `bun run spec:check` per A-32 follow-up) |
| Code checks CI | `.github/workflows/code-checks.yml` | ⛔ Reserved — Phase 1 |
| Release CI | `.github/workflows/release.yml` | ⛔ Reserved — Phase 5 |
| Workflow contract gate | `scripts/spec-hygiene/19-check-workflow-contract.mjs` (G-19) | ⛔ Reserved — A-32 |

---

## Cross-References

| Topic | Link |
|-------|------|
| Sibling: gate runner contract | [02-ci-quality-gates.md](./02-ci-quality-gates.md) |
| Conventions overview | [00-overview.md](./00-overview.md) |
| Tech stack (Bun runtime) | `mem://architecture/tech-stack` |
| Coding guidelines (frozen lockfile rule) | `mem://constraints/coding-guidelines` |
| Implementation roadmap | [`../04-roadmap/01-implementation-phases.md`](../04-roadmap/01-implementation-phases.md) |
