# G-20 Pre-Commit Hook Drift Gate — Algorithm Spec

> **Version:** 1.0.0
> **Updated:** 2026-04-26 (UTC+8)
> **Parent:** [00-overview.md](./00-overview.md)
> **Reserved Gate ID:** G-20 (per [`02-ci-quality-gates.md`](./02-ci-quality-gates.md) catalogue)
> **Closes:** A-34 (fifth of A-30..A-35 cluster — pre-commit drift detection)
> **Origin:** A-33 identified that the shipped `scripts/git-hooks/pre-commit` runs `node scripts/spec-hygiene/00-run-all.mjs` directly, violating the **single entry point** rule (AT-CIGATE-08). G-20 is the automated detector that prevents this drift from recurring after the hook is migrated.

---

## Overview

This document is the **algorithmic SSOT** for the hygiene gate that asserts both `scripts/install-git-hooks.mjs` and `scripts/git-hooks/pre-commit` match the contract defined in [`05-precommit-hook-contract.md`](./05-precommit-hook-contract.md).

G-20 sits beside its sibling **G-19** (workflow drift gate, A-32). Together they enforce that *every* CI-related artefact — workflow files **and** local hooks — stay synchronised with their respective contract specs.

---

## User Story

As a maintainer, I want the spec-hygiene runner itself to fail when someone edits the pre-commit hook or its installer in a way that diverges from the agreed contract, so that contract drift is impossible to land silently.

---

## Inputs

| Input | Type | Source | Notes |
|-------|------|--------|-------|
| `scripts/install-git-hooks.mjs` | JavaScript text | Repository | Read as plain text + parsed for installer assertions |
| `scripts/git-hooks/pre-commit` | POSIX shell text | Repository | Read as plain text and matched against required-step + forbidden-construct sets |
| Contract constants | Inline in the script | Hard-coded mirror of `05-precommit-hook-contract.md` | Same pattern as G-19 |

## Outputs

| Output | Persisted? | Channel | Notes |
|--------|-----------|---------|-------|
| Per-violation line | ❌ | stdout | Format: `❌ <file>: <rule-id> — <human message>` |
| Final summary | ❌ | stdout | `✅ G-20: 2 file(s) match contract` or `❌ G-20: V violation(s)` |
| Exit code | ❌ | Process exit | `0` clean, `1` any violation |

---

## Contract Expectations

### Installer (`scripts/install-git-hooks.mjs`)

| Rule ID | Required pattern | Source |
|---------|------------------|--------|
| INST-01 | Source dir constant equals `"scripts/git-hooks"` | A-33 §Installer Contract |
| INST-02 | Destination dir constant equals `".git/hooks"` | A-33 §Installer Contract |
| INST-03 | `chmodSync(..., 0o755)` is called on every copied file | A-33 §Installer Contract |
| INST-04 | `existsSync(".git")` guard with `process.exit(0)` on absence | A-33 Edge Case 3 + worktree rule |
| INST-05 | `existsSync(SRC)` guard with `process.exit(0)` on absence | A-33 §Installer Contract |
| INST-06 | No `import` from `"husky"` or any third-party hook lib | A-33 "Why not Husky?" rationale |

### Hook Body (`scripts/git-hooks/pre-commit`)

| Rule ID | Required pattern | Source |
|---------|------------------|--------|
| HOOK-01 | First non-comment line is `set -e` | A-33 §Required Steps step 1 |
| HOOK-02 | Shebang is `#!/usr/bin/env sh` (not `bash`) | A-33 §Hook Body Contract |
| HOOK-03 | Contains the staged-files filter `git diff --cached --name-only --diff-filter=ACMR` piped through `grep -E '^(spec/\|scripts/spec-hygiene/)'` | A-33 step 2 |
| HOOK-04 | Contains an early `exit 0` when the staged-files filter is empty | A-33 step 3 |
| HOOK-05 | Contains exactly one `bun run spec:check` invocation | A-33 step 5 (single entry point) |
| HOOK-06 | Does **not** contain `node scripts/spec-hygiene/` | A-33 §Forbidden in the Hook Body |
| HOOK-07 | Failure branch references `git commit --no-verify` in the recovery message | A-33 step 6 |
| HOOK-08 | Regenerated-artefact detection step references at minimum `spec/spec-index.md` and `spec/32-ui-design/01-architecture/05-component-contract-map.md` | A-33 step 7 |
| HOOK-09 | Does not contain bash-only constructs: `[[ ... ]]`, `function NAME()`, array syntax `arr=( ... )` | A-33 §Forbidden in the Hook Body |
| HOOK-10 | Does not contain `curl`, `wget`, or `git fetch` | A-33 §Forbidden in the Hook Body |

---

## Algorithm

```text
function checkPrecommitDrift(InstallerPath, HookPath, ContractRules) -> int:
    Violations := []

    # 1. Installer rules
    InstallerSrc := readFileSync(InstallerPath, "utf-8")
    for each Rule in ContractRules.installer:
        if not Rule.match(InstallerSrc):
            Violations.push({file: InstallerPath, ruleId: Rule.id, message: Rule.message})

    # 2. Hook rules
    if not exists(HookPath):
        Violations.push({file: HookPath, ruleId: "HOOK-MISSING", message: "Hook body missing"})
    else:
        HookSrc := readFileSync(HookPath, "utf-8")
        for each Rule in ContractRules.hook:
            if not Rule.match(HookSrc):
                Violations.push({file: HookPath, ruleId: Rule.id, message: Rule.message})

    # 3. Print + exit
    for each V in Violations:
        print(`❌ ${V.file}: ${V.ruleId} — ${V.message}`)
    if Violations.length > 0:
        print(`❌ G-20: ${Violations.length} violation(s)`)
        return 1
    print(`✅ G-20: 2 file(s) match contract`)
    return 0
```

### Match Function Semantics

| Match kind | Used for | Implementation |
|------------|----------|----------------|
| `regex` | Most pattern checks (e.g. `bun run spec:check`) | `RegExp.test(src)` |
| `regex-count` | "Exactly one" rules (HOOK-05) | `(src.match(re) ?? []).length === expectedCount` |
| `regex-absent` | Forbidden-construct rules (HOOK-06, HOOK-09, HOOK-10) | `!RegExp.test(src)` |
| `line-prefix` | First-non-comment-line rule (HOOK-01) | walk lines skipping `#`-prefixed and blank, assert next line === expected |

All regexes operate on raw file text. No tokenisation — the gate is intentionally cheap.

---

## Rules

1. **Hermetic** — reads only the two files plus its inline constants. No network, no `git`, no spawn.
2. **Deterministic** — same input always produces same exit code; no time, no randomness.
3. **Bounded** — O(R · L) where R = total rules (≤ 16) and L = file size in chars (≤ 5 KB each). Worst case <10 ms.
4. **One-pass per file** — read each file exactly once.
5. **Hook-absence is a violation only when installer is present** — covers the case where a contributor deletes the hook body without removing the installer.

---

## Edge Cases

1. Repo cloned without `.git/hooks/pre-commit` (fresh clone before `bun install` runs `prepare`) → G-20 reads `scripts/git-hooks/pre-commit` from the **repo**, not from `.git/hooks/`. Cloned repos always have the source path; clean.
2. Installer path missing entirely → INST rules all fail with one violation per rule. Acceptable forcing function.
3. Hook body uses CRLF line endings (Windows) → match patterns use `/m` flag and tolerate `\r`. Add `\r?` before `$` anchors.
4. Hook body adds a NEW step not covered by HOOK-01..10 → not a violation. The contract is "must contain" not "must contain only"; freedom to extend with additional safe steps.
5. Installer adopts ESM `import.meta.url` for path resolution → still satisfies INST-01/02 because the matching is on the constant string values, not on the variable's name.
6. Someone adds a Husky `.husky/` directory in addition to the existing pattern → INST-06 fails on import; explicit signal that Husky was rejected per A-33 rationale.
7. Hook body wraps `bun run spec:check` in a conditional (e.g. `if [ "$CI" = "1" ]; then ... fi`) → still passes HOOK-05 (regex-count finds exactly one occurrence) but introduces a skip path; future revision may add HOOK-11 forbidding env-based skips per A-33 Forbidden list.
8. Multiple `bun run spec:check` lines (e.g. once for spec, once for code) → HOOK-05 fails because count > 1; force consolidation into the single runner.

---

## Acceptance Tests

| ID | Given | When | Then | testid |
|----|-------|------|------|--------|
| AT-G20-01 | Both files match every rule | G-20 runs | Exits 0 with `✅ G-20: 2 file(s) match contract` | `g20-clean` |
| AT-G20-02 | Hook body contains `node scripts/spec-hygiene/00-run-all.mjs` | G-20 runs | Exits 1; HOOK-06 violation visible | `g20-detect-direct-node` |
| AT-G20-03 | Hook shebang is `#!/usr/bin/env bash` | G-20 runs | Exits 1; HOOK-02 violation | `g20-detect-bash-shebang` |
| AT-G20-04 | Hook body has two `bun run spec:check` lines | G-20 runs | Exits 1; HOOK-05 count violation | `g20-detect-duplicate-runner` |
| AT-G20-05 | Hook body uses `[[ ... ]]` bash construct | G-20 runs | Exits 1; HOOK-09 violation | `g20-detect-bashism` |
| AT-G20-06 | Installer omits `chmodSync(..., 0o755)` | G-20 runs | Exits 1; INST-03 violation | `g20-detect-missing-chmod` |
| AT-G20-07 | Installer imports from `"husky"` | G-20 runs | Exits 1; INST-06 violation | `g20-detect-husky-import` |
| AT-G20-08 | Hook body uses CRLF line endings | G-20 runs | Exits 0 if rules otherwise satisfied (no false positive from line-ending diff) | `g20-crlf-tolerant` |
| AT-G20-09 | Hook body extended with a benign extra `echo` step | G-20 runs | Exits 0 (must-contain, not must-contain-only) | `g20-extension-allowed` |
| AT-G20-10 | G-20 is registered in `00-run-all.mjs` checks array | `bun run spec:check` runs | Final tally includes G-20 result | `g20-registered-in-runner` |

---

## Component Contract

> **Aspirational paths** — implementation gated behind SPEC-ONLY-mode exit.

| Concern | Path | Function |
|---------|------|----------|
| Gate script | `scripts/spec-hygiene/20-check-precommit-contract.mjs` | `default export async function run(): Promise<number>` |
| Contract constants | inline in `20-check-precommit-contract.mjs` | Mirror of the Contract Expectations tables above |
| Runner registration | `scripts/spec-hygiene/00-run-all.mjs` `checks` array | Append after entry 19 |
| Catalogue update | [`02-ci-quality-gates.md`](./02-ci-quality-gates.md) Gate Catalogue | Promote G-20 from "reserved" to active row |
| Sibling: G-19 algorithm | [`04-g19-workflow-contract-gate.md`](./04-g19-workflow-contract-gate.md) | Same shape; same hermetic guarantees |

---

## Cross-References

| Topic | Link |
|-------|------|
| Origin: pre-commit contract | [05-precommit-hook-contract.md](./05-precommit-hook-contract.md) |
| Sibling: workflow contract drift gate | [04-g19-workflow-contract-gate.md](./04-g19-workflow-contract-gate.md) |
| Single entry point rule | [02-ci-quality-gates.md](./02-ci-quality-gates.md) AT-CIGATE-08 |
| Conventions overview | [00-overview.md](./00-overview.md) |
| Coding guidelines | `mem://constraints/coding-guidelines` |
