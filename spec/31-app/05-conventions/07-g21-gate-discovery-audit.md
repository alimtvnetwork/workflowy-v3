# G-21 Gate Discovery & Registration Audit — Algorithm Spec

> **Version:** 1.0.0
> **Updated:** 2026-04-26 (UTC+8)
> **Parent:** [00-overview.md](./00-overview.md)
> **Reserved Gate ID:** G-21 (per [`02-ci-quality-gates.md`](./02-ci-quality-gates.md) catalogue)
> **Closes:** A-35 (last of A-30..A-35 cluster — registration-drift detection)
> **Origin:** Promised by AT-CIGATE-05 in [`02-ci-quality-gates.md`](./02-ci-quality-gates.md): "A new `NN-*.mjs` script exists in `scripts/spec-hygiene/` but is missing from `00-run-all.mjs` → G-21 emits warning". This file is the algorithmic SSOT.

---

## Overview

This is the **third** drift-detector in the CI cluster (siblings: G-19 workflow, G-20 pre-commit). G-21 watches the hygiene-script directory itself: every `NN-<name>.mjs` file in `scripts/spec-hygiene/` must be either (a) registered in the runner's `checks` array, (b) explicitly excluded as an operator-only script, or (c) explicitly reserved with a "future" marker in the catalogue.

Without G-21, a contributor can add a hygiene script that *appears* in the directory listing, *passes* code review, and yet never runs in CI because no one remembered to append it to `00-run-all.mjs`. G-21 makes that class of silent failure impossible.

---

## User Story

As a maintainer reviewing a PR that adds a new hygiene script, I want CI to fail unless the new script is **also** registered in the runner or explicitly listed as operator-only, so that hygiene gates can never silently disappear from the CI surface area.

---

## Inputs

| Input | Type | Source | Notes |
|-------|------|--------|-------|
| Directory listing of `scripts/spec-hygiene/*.mjs` | Filesystem | Repository | All scripts that *could* be gates |
| Parsed `checks` array from `00-run-all.mjs` | JavaScript source | Repository | Read as text + extract the literal string array |
| Operator-only allow-list | Inline constant | This script | Files that legitimately must not run in CI |
| Catalogue table | `02-ci-quality-gates.md` | Repository | Read to verify each registered script has a row |

## Outputs

| Output | Persisted? | Channel | Notes |
|--------|-----------|---------|-------|
| Per-violation line | ❌ | stdout | Format: `❌ G-21: <script> — <reason>` |
| Final summary | ❌ | stdout | `✅ G-21: <N> script(s) reconciled` or `❌ G-21: <V> violation(s)` |
| Exit code | ❌ | Process exit | `0` clean, `1` any violation |

---

## Allow-List & Categories

Every `*.mjs` file under `scripts/spec-hygiene/` must fall into exactly **one** of these categories:

| Category | Pattern | Where listed | Example |
|----------|---------|--------------|---------|
| **Runner** | Filename `00-run-all.mjs` | (itself) | `00-run-all.mjs` |
| **Registered gate** | Path appears in the `checks` array of `00-run-all.mjs` | `00-run-all.mjs` `checks[]` | `01-check-numbering.mjs` |
| **Operator-only** | Filename in the inline `OPERATOR_ONLY` set | This script's constants | `14-split-oversized-files.mjs`, `99-convert-headers.mjs` |
| **Reserved** | Filename listed in `02-ci-quality-gates.md` catalogue with status "Reserved" | The catalogue table | (e.g. `17-check-hotkeys.mjs`, `18-check-cycle-algo.mjs`, `19-check-workflow-contract.mjs`, `20-check-precommit-contract.mjs`, `21-check-gate-discovery.mjs`) |

A file that matches **none** of the four categories is a violation: "orphan script". A file that matches **more than one** category is also a violation: "ambiguous registration".

---

## Algorithm

```text
function auditGateRegistration(HygieneDir, RunnerPath, CataloguePath, OperatorOnly) -> int:
    Files       := readdirSync(HygieneDir).filter(f => f.endsWith(".mjs"))
    Registered  := parseChecksArray(readFileSync(RunnerPath))
    Reserved    := parseReservedRows(readFileSync(CataloguePath))
    Violations  := []

    for each File in Files:
        Categories := []
        if File == "00-run-all.mjs":           Categories.push("runner")
        if Registered.includes(`${HygieneDir}/${File}`): Categories.push("registered")
        if OperatorOnly.has(File):             Categories.push("operator-only")
        if Reserved.has(File):                 Categories.push("reserved")

        if Categories.length == 0:
            Violations.push({File, reason: "orphan — not in checks[], not operator-only, not reserved"})
        if Categories.length > 1:
            Violations.push({File, reason: `ambiguous — matches ${Categories.join(", ")}`})

    # Reverse check — every entry in checks[] must point at an existing file
    for each RegisteredPath in Registered:
        if not exists(RegisteredPath):
            Violations.push({File: RegisteredPath, reason: "registered in checks[] but file missing"})

    # Catalogue check — every registered file must have a catalogue row
    Catalogue := parseCatalogueTable(readFileSync(CataloguePath))
    for each File in Files where Categories includes "registered":
        if not Catalogue.has(File):
            Violations.push({File, reason: "registered but missing from 02-ci-quality-gates.md Gate Catalogue"})

    # Print + exit
    for each V in Violations:
        print(`❌ G-21: ${V.File} — ${V.reason}`)
    if Violations.length > 0:
        print(`❌ G-21: ${Violations.length} violation(s) across ${Files.length} script(s)`)
        return 1
    print(`✅ G-21: ${Files.length} script(s) reconciled`)
    return 0
```

### Parser Helpers (light-touch)

| Helper | Strategy |
|--------|----------|
| `parseChecksArray` | Match the literal `const checks = [ ... ];` block via regex; extract every quoted string. No JS evaluation — text-only to keep G-21 hermetic. |
| `parseReservedRows` | Scan `02-ci-quality-gates.md` for table rows where the script filename appears AND the row contains the word "Reserved" (case-insensitive). |
| `parseCatalogueTable` | Scan the `## Gate Catalogue` table for rows; the second column's filename is the key. |

---

## Operator-Only Allow-List (initial)

| Filename | Why excluded |
|----------|--------------|
| `14-split-oversized-files.mjs` | Destructive operator action — must run manually with confirmation. Already documented in `02-ci-quality-gates.md` G-14 row. |
| `99-convert-headers.mjs` | One-shot header-format migration utility; not a recurring check. |
| `10-fix-related-blocks.mjs` | (Currently registered as a generator; if demoted to operator-only, must be moved here in the same PR.) |

> **Maintenance rule** — adding a script to this allow-list requires a justification line in the same commit message. G-21 does not enforce the justification (it cannot read commit messages hermetically); review enforces.

---

## Rules

1. **Hermetic** — reads only files inside the repo; never network, never `git`, never spawns.
2. **Single source of truth** — `00-run-all.mjs` is the registration ledger; `02-ci-quality-gates.md` is the human-readable catalogue. G-21 cross-checks both.
3. **No silent additions** — adding a `NN-*.mjs` file *requires* a paired update to either (a) the runner, (b) the operator-only list in this file, or (c) the catalogue's reserved rows.
4. **Reverse integrity** — a registered path that no longer exists on disk is also a violation (catches accidental file deletions).
5. **Catalogue parity** — every registered gate also needs a catalogue row, so the human-facing list never drifts behind the runner.

---

## Edge Cases

1. New script `NN-foo.mjs` added without registration → "orphan" violation; PR cannot land.
2. Script registered in runner but file deleted in same PR → "registered but file missing" violation; PR cannot land.
3. Script renamed (`15-check-enums-in-sync.mjs` → `15-check-enum-sync.mjs`) → registered path mismatch → "registered but file missing" + new file is orphan; both violations push the contributor toward updating runner + catalogue together.
4. Script appears in **both** the runner AND the operator-only list → "ambiguous" violation; categories are mutually exclusive.
5. Reserved row exists but the file is also registered (i.e. promoted from reserved to active) → "ambiguous" violation; the reserved row must be deleted from the catalogue when the gate becomes active.
6. Catalogue parses with a malformed row (missing pipe) → fail loudly with line number; contributor sees a clear parse error rather than a misleading false positive.
7. `00-run-all.mjs` uses a dynamic loader (`fs.readdirSync` to auto-discover) → G-21 cannot extract the literal array; emits violation `runner uses dynamic discovery; G-21 requires a static checks[] literal`. Forces the static-list discipline that keeps the registry auditable.
8. New non-`.mjs` file in the directory (e.g. `README.md`, a `.ts` helper) → ignored by the file filter. Allowed.

---

## Acceptance Tests

| ID | Given | When | Then | testid |
|----|-------|------|------|--------|
| AT-G21-01 | All scripts categorised correctly | G-21 runs | Exits 0 with `✅ G-21: <N> script(s) reconciled` | `g21-clean` |
| AT-G21-02 | New `NN-foo.mjs` exists, not in checks[], not operator-only, not reserved | G-21 runs | Exits 1 with "orphan" violation | `g21-detect-orphan` |
| AT-G21-03 | `checks[]` lists `99-missing.mjs` but the file is absent | G-21 runs | Exits 1 with "registered but file missing" violation | `g21-detect-stale-registration` |
| AT-G21-04 | Script appears in both `checks[]` and `OPERATOR_ONLY` set | G-21 runs | Exits 1 with "ambiguous" violation | `g21-detect-ambiguous` |
| AT-G21-05 | Script registered but no row in the Gate Catalogue table | G-21 runs | Exits 1 with "missing from 02-ci-quality-gates.md catalogue" violation | `g21-detect-catalogue-gap` |
| AT-G21-06 | Reserved file becomes registered without removing the reserved row | G-21 runs | Exits 1 with "ambiguous" violation | `g21-detect-stale-reserved` |
| AT-G21-07 | Runner uses dynamic `readdirSync` discovery instead of literal array | G-21 runs | Exits 1 with "dynamic discovery" violation | `g21-detect-dynamic-runner` |
| AT-G21-08 | A non-`.mjs` file (e.g. `helper.ts`) lives in the directory | G-21 runs | Ignores it; clean exit | `g21-non-mjs-ignored` |
| AT-G21-09 | G-21 itself is registered in `checks[]` and has a catalogue row | `bun run spec:check` | G-21 reconciles itself; exits 0 | `g21-self-registration` |
| AT-G21-10 | G-21 reads only the hygiene dir + runner + catalogue | Process is observed | No network, no git, no spawn | `g21-hermetic` |

---

## Component Contract

> **Aspirational paths** — implementation gated behind SPEC-ONLY-mode exit.

| Concern | Path | Function |
|---------|------|----------|
| Gate script | `scripts/spec-hygiene/21-check-gate-discovery.mjs` | `default export async function run(): Promise<number>` |
| Operator-only constant | inline in `21-check-gate-discovery.mjs` | Mirror of the Operator-Only Allow-List table |
| Runner registration | `scripts/spec-hygiene/00-run-all.mjs` `checks` array | Append after entry 20 |
| Catalogue update | [`02-ci-quality-gates.md`](./02-ci-quality-gates.md) Gate Catalogue | Promote G-21 from "reserved" to active row in the same commit |
| Sibling: G-19 (workflow) | [`04-g19-workflow-contract-gate.md`](./04-g19-workflow-contract-gate.md) | Same hermetic shape |
| Sibling: G-20 (pre-commit) | [`06-g20-precommit-contract-gate.md`](./06-g20-precommit-contract-gate.md) | Same hermetic shape |

---

## Cross-References

| Topic | Link |
|-------|------|
| Origin: AT-CIGATE-05 | [`02-ci-quality-gates.md`](./02-ci-quality-gates.md) |
| Sibling: G-19 workflow drift gate | [04-g19-workflow-contract-gate.md](./04-g19-workflow-contract-gate.md) |
| Sibling: G-20 pre-commit drift gate | [06-g20-precommit-contract-gate.md](./06-g20-precommit-contract-gate.md) |
| Single entry point rule | [02-ci-quality-gates.md](./02-ci-quality-gates.md) AT-CIGATE-08 |
| Conventions overview | [00-overview.md](./00-overview.md) |
| Coding guidelines | `mem://constraints/coding-guidelines` |
