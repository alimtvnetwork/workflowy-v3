# G-24 Role-Escalation Drift Gate — Algorithm Spec

> **Version:** 1.0.0
> **Updated:** 2026-04-27 (UTC+8)
> **Parent:** [00-overview.md](./00-overview.md)
> **Reserved Gate ID:** G-24 (per [`02-ci-quality-gates.md`](./02-ci-quality-gates.md) catalogue)
> **Origin:** Promised in [`10-role-escalation-policy.md`](./10-role-escalation-policy.md) §7 with 4 enumerated checks but no algorithm SSOT. This file closes the gap.

---

## Overview

This is the **sixth** drift-detector in the CI cluster (siblings: G-19 workflow, G-20 pre-commit, G-21 gate-discovery, G-22 error-code catalogue, G-23 audit-log coverage). G-24 watches **four distinct privilege-escalation surfaces** that policy v1.0.0 introduced together but which decay independently:

1. **Privilege-mutation gating** — every code path that writes `WorkspaceRole = 'Admin' | 'Owner'` MUST be immediately preceded (within the same scope) by a call to `Escalation::approve()` OR `Escalation::breakGlass()`.
2. **Break-glass containment** — `Escalation::breakGlass()` MUST exist only inside `wp-plugin/Auth/Escalation.php`. Any reference outside that file is a sandbox escape.
3. **Expiry sanity** — every `RoleEscalationRequest` insert (i.e. row creation in the request table) MUST set `ExpiresAt` to a value ≤ 24 h from `CreatedAt`.
4. **Test parity** — every PHP file under `wp-plugin/Auth/Escalation/` MUST have a sibling test file matching `*Test.php` (mirroring the WP-plugin testing convention from `15-wp-plugin-how-to/09-testing-patterns/`).

Without G-24, any of four catastrophic regressions could merge silently:

- A handler updates `WorkspaceRole` to `Admin` without an approval call → silent privilege grant.
- A new caller imports `Escalation::breakGlass` from a non-Escalation file → break-glass loses dual-control containment.
- A request is created with `ExpiresAt = 7 days` → permanent JIT grant defeats the 4-hour ceiling.
- A new escalation source file lands without a test → behaviour drifts from spec.

G-24 makes all four classes impossible to merge.

---

## User Story

As a security-conscious reviewer of a PR that touches the privilege surface, I want CI to fail unless **every** role mutation, break-glass call, request insert, and source file is provably aligned with the role-escalation policy SSOT, so that the dual-control + JIT + audit chain cannot be defeated by an off-policy code path.

---

## Inputs

| Input | Type | Source | Notes |
|-------|------|--------|-------|
| Role-mutation sites | Filesystem scan | `wp-plugin/**/*.php` | Pattern: `WorkspaceRole = 'Admin'` / `WorkspaceRole = 'Owner'` SQL fragments + ORM equivalents |
| `Escalation::approve()` call sites | Filesystem scan | `wp-plugin/**/*.php` | Coverage proof for axis 1 |
| `Escalation::breakGlass()` call sites | Filesystem scan | `wp-plugin/**/*.php` | Containment proof for axis 2 |
| `RoleEscalationRequest` insert sites | Filesystem scan | `wp-plugin/**/*.php` | Pattern: `INSERT INTO RoleEscalationRequest` + ORM equivalent `RoleEscalationRequest::insert(` / `->insert(['ExpiresAt' =>` chain |
| Escalation source files | Filesystem listing | `wp-plugin/Auth/Escalation/**/*.php` | Files that must have sibling tests |
| Allow-list for break-glass file | Inline constant | This script | Single-entry: `wp-plugin/Auth/Escalation.php` |
| Read-only methods on Escalation | Inline constant | This script | Methods that don't insert requests (e.g. `Escalation::status`) |

## Outputs

| Output | Persisted? | Channel | Notes |
|--------|-----------|---------|-------|
| Per-violation line | ❌ | stdout | Format: `❌ G-24: <file>:<line> <code> message` (matches G-22 / G-23 drift format per §7 promise) |
| Final summary | ❌ | stdout | `✅ G-24: <axes-summary>` or `❌ G-24: <V> violation(s)` |
| Exit code | ❌ | Process exit | `0` clean, `1` violation, `2` runner error (matches §7 contract) |

---

## Algorithm

```text
function auditRoleEscalationDrift(SourceRoot, EscalationDir, BreakGlassFile, ReadOnlyMethods) -> int:
    Mutations    := [] # {File, Line, NewRole}
    Approvals    := [] # {File, Line}
    BreakGlasses := [] # {File, Line}
    Inserts      := [] # {File, Line, ExpiresAtExpr}
    Violations   := []

    for each File in walk(SourceRoot, "*.php"):
        for each (Line, Match) in scanForPattern(File, /WorkspaceRole\s*=\s*['"](Admin|Owner)['"]/):
            Mutations.push({File, Line, NewRole: Match.group(1)})
        for each (Line, Match) in scanForPattern(File, /WorkspaceRole'\s*=>\s*['"](Admin|Owner)['"]/):
            Mutations.push({File, Line, NewRole: Match.group(1)})  # ORM associative array form
        for each (Line, _) in scanForPattern(File, /Escalation::approve\s*\(/):
            Approvals.push({File, Line})
        for each (Line, _) in scanForPattern(File, /Escalation::breakGlass\s*\(/):
            BreakGlasses.push({File, Line})
        for each (Line, Match) in scanForPattern(File, /(?:INSERT\s+INTO\s+RoleEscalationRequest|RoleEscalationRequest::(?:insert|create))/i):
            ExpiresAtExpr := extractExpiresAt(File, Line)  # null if not found in next 30 lines
            Inserts.push({File, Line, ExpiresAtExpr})

    EscalationFiles := walk(EscalationDir, "*.php").filter(f => not f.endsWith("Test.php"))

    # Axis 1 — privilege-mutation gating
    for each M in Mutations:
        Preceded := Approvals.some(A => A.File == M.File and 0 < (M.Line - A.Line) <= 30)
                 || BreakGlasses.some(B => B.File == M.File and 0 < (M.Line - B.Line) <= 30)
        if not Preceded:
            Violations.push({File: M.File, Line: M.Line, code: "ungated-privilege-mutation",
                             reason: `WorkspaceRole = '${M.NewRole}' without preceding Escalation::approve() or Escalation::breakGlass() within 30 lines`})

    # Axis 2 — break-glass containment
    for each B in BreakGlasses:
        if B.File != BreakGlassFile:
            Violations.push({File: B.File, Line: B.Line, code: "breakglass-leak",
                             reason: `Escalation::breakGlass() must only appear inside ${BreakGlassFile}`})

    # Axis 3 — expiry sanity
    for each I in Inserts:
        if I.ExpiresAtExpr == null:
            Violations.push({File: I.File, Line: I.Line, code: "missing-expires-at",
                             reason: "RoleEscalationRequest insert has no ExpiresAt within 30 lines of the call"})
        elif not exprBoundedBy24h(I.ExpiresAtExpr):
            Violations.push({File: I.File, Line: I.Line, code: "expires-at-too-far",
                             reason: `ExpiresAt expression "${I.ExpiresAtExpr}" cannot be statically proven ≤ 24h from now`})

    # Axis 4 — test parity
    for each F in EscalationFiles:
        SiblingTest := dirname(F) + "/" + basename(F, ".php") + "Test.php"
        if not exists(SiblingTest):
            Violations.push({File: F, Line: 1, code: "missing-test",
                             reason: `escalation source file has no sibling ${basename(SiblingTest)}`})

    for each V in Violations:
        print(`❌ G-24: ${V.File}:${V.Line} ${V.code} — ${V.reason}`)
    if Violations.length > 0:
        print(`❌ G-24: ${Violations.length} violation(s) across ${Mutations.length} mutation(s) + ${Inserts.length} insert(s) + ${EscalationFiles.length} source file(s)`)
        return 1
    print(`✅ G-24: ${Mutations.length} mutation(s) gated · ${BreakGlasses.length} break-glass call(s) contained · ${Inserts.length} insert(s) bounded · ${EscalationFiles.length} source file(s) tested`)
    return 0
```

### Parser Helpers (light-touch)

| Helper | Strategy |
|--------|----------|
| `scanForPattern` | Line-by-line regex scan; no AST parse — keeps G-24 hermetic. |
| `extractExpiresAt` | Within 30 lines after the insert call site, search for any `ExpiresAt` assignment / array entry: `'ExpiresAt' => <expr>` OR SQL `ExpiresAt = <expr>` OR setter `->setExpiresAt(<expr>)`. Returns the literal expression string (whitespace-trimmed) or `null`. |
| `exprBoundedBy24h` | Static safelist of acceptable patterns: matches `time() + N` where N ≤ 86400, `(new DateTime())->modify('+N hours')` where N ≤ 24, `Carbon::now()->addHours(N)` where N ≤ 24, `now() + INTERVAL N HOUR` where N ≤ 24. Anything else returns false. Forces explicit static bounds. |

The static safelist is intentionally narrow: dynamic computations (`$user->preferredTtl`, `Config::get('escalation.ttl')`) are rejected as "cannot prove statically" — operators must inline the bound at the insert site.

---

## Read-Only Allow-List (initial)

| Method | Why excluded from axis 1 |
|--------|--------------------------|
| `Escalation::status` | Read-only state inspection. |
| `Escalation::listActive` | Read-only enumeration. |
| `Escalation::canApprove` | RBAC pre-check. |

> Methods on the `Escalation` class itself that legitimately call `Escalation::approve` internally are out of scope — axis 1 only checks **call sites that mutate `WorkspaceRole`**, not all `Escalation::*` callers.

---

## Rules

1. **Hermetic** — reads only files inside the repo; never network, never `git`, never spawns.
2. **Single source of truth** — `10-role-escalation-policy.md` is the policy ledger; this script is the algorithm. Drift in either policy or code is a violation.
3. **Four-axis coverage** — all four checks run on every invocation; one axis cannot mask another. Aggregate exit code is `1` if any axis fires.
4. **Static-only bounds** — axis 3 rejects dynamic TTL expressions to force visible, reviewable bounds at every insert site.
5. **Containment is binary** — break-glass either lives in the one allow-listed file, or it doesn't. No `Escalation::breakGlass` re-export, alias, or wrapper is permitted.

---

## Edge Cases

1. **Direct SQL via raw `$wpdb->query("UPDATE ... SET WorkspaceRole = 'Admin' ...")`** — regex catches `WorkspaceRole = 'Admin'` literal; same approval-precedence check applies. ✅
2. **Role string built dynamically** — `$role = 'Admin'; ... WorkspaceRole = $role` → regex misses; emit *warning* "dynamic role assignment — cannot verify gating". Forces explicit literals.
3. **Approval call lives in a parent method** — caller `do()` calls `approve()`, then `do()` calls private `_setRole()` which mutates. Axis 1 fires "ungated-privilege-mutation" because the approval is in another scope. **Resolution**: inline the mutation into `do()` after `approve()`, OR wrap the mutation in an `Escalation::approve()` call inside `_setRole()` (the helper is idempotent within the same request lifetime per policy §3).
4. **30-line proximity window misses a long approval block** — operator must compress the block or refactor. The window is intentionally tight; reviewers prefer false positives over false negatives on privilege gating.
5. **`ExpiresAt` set via DB column default** (`DEFAULT (datetime('now', '+24 hours'))`) — column default lives in schema, not in the insert site. Axis 3 cannot see it from PHP source → fires "missing-expires-at". **Resolution**: explicit insert with `'ExpiresAt' => "datetime('now', '+24 hours')"` so the gate sees the bound.
6. **Sibling test exists but is named `EscalationApproveTest.php` (camelCase action)** instead of `EscalationTest.php` (matches source file `Escalation.php`) — strict basename match fires. **Resolution**: rename test file to match source; cleaner one-to-one mapping anyway.
7. **`Escalation.php` itself contains `breakGlass()` AND a unit-test mock that re-defines `breakGlass`** in the test file → containment passes (test file's break-glass is a method on a different class, not `Escalation::breakGlass`). Regex requires the exact `Escalation::` prefix.
8. **Owner-transfer atomic swap** — both old Owner and new Owner rows mutate in the same transaction. Both mutation sites need approval-precedence; one shared `Escalation::approve()` call before the transaction satisfies axis 1 for both (proximity window sees one approval before each).
9. **Role mutation in a migration script** — `wp-plugin/migrations/*.php` files are out of scope; migrations bypass the request flow by design (see policy §2 Lifecycle). **Resolution**: add migration directory to an explicit `MIGRATIONS_EXEMPT` list in this script's constants; document each exempt path in the same commit.

---

## Acceptance Tests

| ID | Given | When | Then | testid |
|----|-------|------|------|--------|
| AT-G24-01 | All mutations gated, break-glass contained, inserts bounded, source files tested | G-24 runs | Exits 0 with full reconciliation summary | `g24-clean` |
| AT-G24-02 | New `Sharing::promoteToAdmin()` writes `WorkspaceRole = 'Admin'` without approval call | G-24 runs | Exits 1 with "ungated-privilege-mutation" violation | `g24-detect-ungated` |
| AT-G24-03 | Approval call exists in same file but 50 lines before mutation | G-24 runs | Exits 1 with "ungated-privilege-mutation" (window is 30 lines) | `g24-window-too-far` |
| AT-G24-04 | Approval call within 30 lines, then mutation | G-24 runs | Clean exit | `g24-window-ok` |
| AT-G24-05 | `Escalation::breakGlass()` referenced from `Admin/Recovery.php` | G-24 runs | Exits 1 with "breakglass-leak" violation | `g24-detect-breakglass-leak` |
| AT-G24-06 | `RoleEscalationRequest::insert([..., 'ExpiresAt' => time() + 7*86400])` | G-24 runs | Exits 1 with "expires-at-too-far" violation | `g24-detect-expires-too-far` |
| AT-G24-07 | Insert with `'ExpiresAt' => time() + 4*3600` | G-24 runs | Clean (4h ≤ 24h ceiling) | `g24-expires-bounded-ok` |
| AT-G24-08 | Insert with no `ExpiresAt` in next 30 lines | G-24 runs | Exits 1 with "missing-expires-at" violation | `g24-detect-missing-expires` |
| AT-G24-09 | Dynamic ExpiresAt: `'ExpiresAt' => $user->preferredTtl` | G-24 runs | Exits 1 with "expires-at-too-far" (cannot prove statically) | `g24-detect-dynamic-expires` |
| AT-G24-10 | New `wp-plugin/Auth/Escalation/Notifier.php` without `NotifierTest.php` | G-24 runs | Exits 1 with "missing-test" violation | `g24-detect-missing-test` |
| AT-G24-11 | Dynamic role assignment via `$role` variable | G-24 runs | Prints warning, does not fail | `g24-dynamic-role-warning` |
| AT-G24-12 | G-24 reads only repo files | Process is observed | No network, no git, no spawn | `g24-hermetic` |

---

## Component Contract

> **Aspirational paths** — implementation gated behind SPEC-ONLY-mode exit.

| Concern | Path | Function |
|---------|------|----------|
| Gate script | `scripts/spec-hygiene/24-check-role-escalation-coverage.mjs` | `default export async function run(): Promise<number>` |
| Break-glass allow-list | inline in `24-check-role-escalation-coverage.mjs` | Single entry: `wp-plugin/Auth/Escalation.php` |
| Migrations-exempt list | inline in `24-check-role-escalation-coverage.mjs` | Per Edge Case 9 |
| Read-only methods | inline in `24-check-role-escalation-coverage.mjs` | Mirror of the Read-Only Allow-List table |
| Runner registration | `scripts/spec-hygiene/00-run-all.mjs` `checks` array | Append after entry 23 |
| Catalogue update | [`02-ci-quality-gates.md`](./02-ci-quality-gates.md) Gate Catalogue | Promote G-24 from "reserved" to active row in the same commit |
| Sibling: G-22 (error-code catalogue) | [`15-g22-error-code-catalogue-gate.md`](./15-g22-error-code-catalogue-gate.md) | Same hermetic shape |
| Sibling: G-23 (audit-log coverage) | [`16-g23-audit-log-coverage-gate.md`](./16-g23-audit-log-coverage-gate.md) | Same hermetic shape, two-axis precedent |

### Numbering Correction

The role-escalation policy (`10-role-escalation-policy.md` §7) currently states the implementation lives at `scripts/spec-hygiene/14-role-escalation-coverage-audit.mjs`. That slot is **already occupied** by `14-split-oversized-files.mjs` (G-14, operator-only). This spec corrects the path to `24-check-role-escalation-coverage.mjs` so the script's numeric prefix matches its gate ID (matching the convention used by G-19→`19-`, G-20→`20-`, G-21→`21-`, G-22→`22-`, G-23→`23-`). A follow-up edit to the policy's §7 reference is required when this spec is committed.

---

## Cross-References

| Topic | Link |
|-------|------|
| Origin: policy §7 G-24 row + 4 enumerated checks | [`10-role-escalation-policy.md`](./10-role-escalation-policy.md) §7 |
| Audit integration | [`10-role-escalation-policy.md`](./10-role-escalation-policy.md) §6 → [`09-audit-log-policy.md`](./09-audit-log-policy.md) §2.1 `AUTHZ` rows |
| Sibling: G-19 workflow drift gate | [04-g19-workflow-contract-gate.md](./04-g19-workflow-contract-gate.md) |
| Sibling: G-20 pre-commit drift gate | [06-g20-precommit-contract-gate.md](./06-g20-precommit-contract-gate.md) |
| Sibling: G-21 gate-discovery audit | [07-g21-gate-discovery-audit.md](./07-g21-gate-discovery-audit.md) |
| Sibling: G-22 error-code catalogue gate | [15-g22-error-code-catalogue-gate.md](./15-g22-error-code-catalogue-gate.md) |
| Sibling: G-23 audit-log coverage gate | [16-g23-audit-log-coverage-gate.md](./16-g23-audit-log-coverage-gate.md) |
| Single entry point rule | [02-ci-quality-gates.md](./02-ci-quality-gates.md) AT-CIGATE-08 |
| Conventions overview | [00-overview.md](./00-overview.md) |
| Coding guidelines | `mem://constraints/coding-guidelines` |

---

## Changelog

| Version | Date | Change |
|---|---|---|
| 1.0.0 | 2026-04-27 | Initial SSOT — algorithm with **four-axis coverage** (privilege-mutation gating + break-glass containment + 24h expiry sanity + test-file parity), 12 acceptance tests (AT-G24-01..12), 30-line proximity window for approval-precedence check, static-only ExpiresAt bound safelist, dynamic-role warning. Closes the orphan G-24 reference in policy §7. Numbering correction (`14-` → `24-` slot) documented. |
