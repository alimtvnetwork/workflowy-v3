# Pre-Commit Hook Contract — Convention SSOT

> **Version:** 1.0.0
> **Updated:** 2026-04-26 (UTC+8)
> **Parent:** [00-overview.md](./00-overview.md)
> **Sibling specs:** [02-ci-quality-gates.md](./02-ci-quality-gates.md), [03-github-actions-workflow.md](./03-github-actions-workflow.md), [04-g19-workflow-contract-gate.md](./04-g19-workflow-contract-gate.md)
> **Closes:** A-33 (fourth of A-30..A-35 cluster — local pre-commit enforcement)

---

## Overview

This document is the **Single Source of Truth** for the local git pre-commit hook that runs the spec-hygiene suite before allowing a commit. CI in `03-github-actions-workflow.md` is the **second** line of defence; the pre-commit hook is the **first** — it catches drift on the contributor's machine before a push ever leaves.

Two artifacts are governed:
1. The hook installer script (`scripts/install-git-hooks.mjs`)
2. The hook body shipped under `scripts/git-hooks/pre-commit`

A future hygiene gate **G-20** (reserved) will detect drift between this contract and the actual files.

---

## User Story

As a contributor about to commit a spec change, I want my local environment to run the same checks CI will run — and to fail fast — so that I never push a commit that wastes CI minutes by failing on a problem I could have caught locally in seconds.

---

## Inputs

| Input | Source | Notes |
|-------|--------|-------|
| Staged file list | `git diff --cached --name-only --diff-filter=ACMR` | Filtered to `spec/**` and `scripts/spec-hygiene/**` |
| Working tree state | `git diff --name-only` | Used after the runner to detect generator output |
| `package.json` `spec:check` script | Repository root | The single entry point (per AT-CIGATE-08) |
| `.git/` directory | Repository root | Skip install when absent (worktree, sandbox, fresh tarball) |

## Outputs

| Output | Persisted? | Channel | Notes |
|--------|-----------|---------|-------|
| Hook stdout | ❌ | Console | Per-step status, final pass/fail |
| Commit allowed | ✅ git | Process exit | `0` allows commit, non-zero blocks |
| Regenerated artefact warning | ❌ | Console | Lists files the runner rewrote, asks user to amend |

---

## Installer Contract — `scripts/install-git-hooks.mjs`

| Field | Required value | Rationale |
|-------|----------------|-----------|
| Source directory | `scripts/git-hooks/` | Versioned hook bodies live in the repo |
| Destination directory | `.git/hooks/` | Standard git location |
| File mode after copy | `0o755` (owner rwx, group/other rx) | Hook must be executable |
| Behaviour when `.git` is absent or not a directory | `console.log` skip notice + `process.exit(0)` | Worktrees, sandboxes, tarball releases |
| Behaviour when `scripts/git-hooks/` is absent | `console.log` skip notice + `process.exit(0)` | First-run before hooks land |
| Idempotency | Re-running overwrites without warning | Versioned hook set is canonical |
| Auto-invocation | `package.json` `"prepare": "node scripts/install-git-hooks.mjs"` | Runs after `bun install` / `npm install` |

> **Why not Husky?** Husky requires an extra runtime dep and a `.husky/` directory. The shipped pattern (script + native `.git/hooks/`) is one file lighter and avoids the lockfile churn forbidden during SPEC-ONLY mode.

---

## Hook Body Contract — `scripts/git-hooks/pre-commit`

The hook is a POSIX `sh` script (not bash) so it runs on every Unix-like contributor machine including the macOS default shell.

### Required Steps (in order)

1. **`set -e`** — abort on first non-zero command.
2. **Compute staged changes** — `git diff --cached --name-only --diff-filter=ACMR | grep -E '^(spec/|scripts/spec-hygiene/)' || true`
3. **Short-circuit when irrelevant** — if no spec or hygiene files are staged, `exit 0`. Keeps everyday code commits fast.
4. **Announce** — `echo "🧪 Spec hygiene pre-commit: running checks…"`
5. **Run the runner** — exactly one command: `bun run spec:check`. **Do not** invoke `node scripts/spec-hygiene/00-run-all.mjs` directly (per AT-CIGATE-08, single entry point).
6. **On failure** — print recovery hint including `git commit --no-verify`, then `exit 1`.
7. **Detect regenerated artefacts** — `git diff --name-only -- 'spec/spec-index.md' 'spec/32-ui-design/01-architecture/05-component-contract-map.md' 'spec/**/00-overview.md'`. If non-empty, print the list with the `git add -A && git commit --amend --no-edit` instruction, then `exit 1`.
8. **Success** — `echo "✅ Spec hygiene passed"` and `exit 0`.

### Forbidden in the Hook Body

- ❌ `node scripts/spec-hygiene/...` direct invocations (must go through `bun run spec:check`).
- ❌ Network calls (`curl`, `wget`, `git fetch`).
- ❌ Modifying tracked files except via the registered generator gates.
- ❌ Bash-only syntax (`[[ ... ]]`, arrays, `function` keyword) — POSIX `sh` only.
- ❌ Skipping checks based on environment variables other than the standard `--no-verify` git mechanism.

### Currently Identified Drift

The shipped `scripts/git-hooks/pre-commit` (read 2026-04-26) violates step 5 — it runs `node scripts/spec-hygiene/00-run-all.mjs`. This is the same single-entry-point violation A-31 identified in the workflow file. **G-20** (reserved hygiene gate) will detect both classes of drift in one pass.

---

## Edge Cases

1. Contributor commits only code changes (no spec files staged) → step 3 short-circuits; hook exits 0 in <50 ms.
2. Contributor uses `git commit --no-verify` to bypass → hook never runs; documented escape hatch (CI still enforces).
3. `.git` is a file (worktree) → installer skips; hook absent; CI is the only enforcement. Acceptable.
4. Contributor is on Windows / Git Bash → POSIX `sh` syntax must remain compatible (no `bash`-isms per Forbidden list).
5. The hygiene runner takes longer than 30 s on a slow machine → no special handling required; contributor sees runner output live (stdio inherited).
6. Staged change is a rename (`R`) → included via `--diff-filter=ACMR`.
7. Two parallel `git commit` invocations → git itself serialises hook execution per repo lock; no extra coordination needed.
8. The runner regenerates a file but the contributor only staged a doc change → hook still blocks with the amend instruction; this is the intended forcing function (no commit may leave generator output stale).

---

## Acceptance Tests

| ID | Given | When | Then | testid |
|----|-------|------|------|--------|
| AT-PRECOMMIT-01 | Spec file `spec/foo.md` is staged with no errors | `git commit` runs | Hook prints `✅ Spec hygiene passed`; commit succeeds | `precommit-clean-spec-pass` |
| AT-PRECOMMIT-02 | Code-only change is staged (no spec/** paths) | `git commit` runs | Hook exits 0 in <50 ms with no checker output | `precommit-no-spec-skip` |
| AT-PRECOMMIT-03 | Spec file with broken link is staged | `git commit` runs | Hook exits 1; G-03 violation visible; commit blocked | `precommit-blocks-broken-link` |
| AT-PRECOMMIT-04 | `--no-verify` flag is passed | `git commit --no-verify` | Hook does not run; commit succeeds | `precommit-bypass-flag` |
| AT-PRECOMMIT-05 | Runner regenerates `spec-index.md` | Hook completes runner step | Hook lists the file and exits 1 with amend instruction | `precommit-detect-stale-artefact` |
| AT-PRECOMMIT-06 | Hook body contains `node scripts/spec-hygiene/00-run-all.mjs` | G-20 (reserved) runs | Exits 1 with violation `pre-commit uses node directly; expected bun run spec:check` | `precommit-detect-direct-node` |
| AT-PRECOMMIT-07 | Hook body contains a bash-only construct (`[[ ... ]]`) | G-20 runs | Exits 1 with portability violation | `precommit-detect-bashism` |
| AT-PRECOMMIT-08 | `.git` is a regular file (worktree) | `bun install` runs `prepare` | Installer prints skip notice; exits 0 | `precommit-installer-worktree-safe` |
| AT-PRECOMMIT-09 | Installer is re-run on top of an existing hook | Re-execution observed | Hook overwritten silently; mode set to `0755` | `precommit-installer-idempotent` |
| AT-PRECOMMIT-10 | Hook + installer both match this contract | G-20 runs | Exits 0 | `precommit-contract-clean` |

---

## Component Contract

> **Aspirational paths** — installer and hook exist today but need the `bun run spec:check` migration. G-20 hygiene script is reserved.

| Concern | Path | Status |
|---------|------|--------|
| Installer | `scripts/install-git-hooks.mjs` | ✅ Present and matches installer contract |
| Hook body | `scripts/git-hooks/pre-commit` | ✅ Present; ⚠ uses `node` directly — needs migration to `bun run spec:check` (gated by AT-PRECOMMIT-06) |
| Auto-install hook | `package.json` `"prepare"` script | ✅ Present |
| G-20 drift gate | `scripts/spec-hygiene/20-check-precommit-contract.mjs` | ⛔ Reserved — A-34 will spec the algorithm |
| G-20 catalogue row | [`02-ci-quality-gates.md`](./02-ci-quality-gates.md) Gate Catalogue | ⛔ Reserved |

---

## Cross-References

| Topic | Link |
|-------|------|
| Sibling: gate runner contract | [02-ci-quality-gates.md](./02-ci-quality-gates.md) |
| Sibling: workflow contract | [03-github-actions-workflow.md](./03-github-actions-workflow.md) |
| Sibling: G-19 workflow gate | [04-g19-workflow-contract-gate.md](./04-g19-workflow-contract-gate.md) |
| Single entry point rule | [02-ci-quality-gates.md](./02-ci-quality-gates.md) AT-CIGATE-08 |
| Conventions overview | [00-overview.md](./00-overview.md) |
| Coding guidelines (lockfile rule) | `mem://constraints/coding-guidelines` |
