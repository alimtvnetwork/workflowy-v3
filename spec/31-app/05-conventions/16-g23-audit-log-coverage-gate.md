# G-23 Audit-Log Drift Gate — Algorithm Spec

> **Version:** 1.0.0
> **Updated:** 2026-04-27 (UTC+8)
> **Parent:** [00-overview.md](./00-overview.md)
> **Reserved Gate ID:** G-23 (per [`02-ci-quality-gates.md`](./02-ci-quality-gates.md) catalogue)
> **Origin:** Promised in three places without an algorithm SSOT — ([`09-audit-log-policy.md`](./09-audit-log-policy.md) §9 G-23 row, §2.1 deprecation timer, §2.1 shorthand normalization), ([`10-role-escalation-policy.md`](./10-role-escalation-policy.md) drift-output reference). This file closes the gap.

---

## Overview

This is the **fifth** drift-detector in the CI cluster (siblings: G-19 workflow, G-20 pre-commit, G-21 gate-discovery, G-22 error-code catalogue). G-23 watches **two distinct audit surfaces** that policy v1.2.0 introduced together but which decay independently:

1. **Action-name registry drift** — every `Audit::action(<shorthand>)` call in PHP source MUST resolve via the normalization rules in `09-audit-log-policy.md` §2.1 to a row that exists in the §2.1 taxonomy table.
2. **Handler coverage** — every PHP method matching the mutation surface (`Auth::*`, `Sharing::*`, `Admin::*` excluding pure read methods) MUST contain at least one `AuditLog::write(...)` or `Audit::log(...)` call in the same execution path.

Without G-23, two failure modes go undetected:

- A handler emits `Audit::action("AUTH.LOGIN_NEW_THING")` that normalizes to `auth.login.new.thing` — a row that does not exist → audit row written with phantom action → frontend Activity feed has no i18n key → user sees raw debug string.
- A new mutation method is added to `Sharing.php` and the developer forgets the audit write → the action goes silently unrecorded → policy violation invisible until the next forensic review.

G-23 makes both classes of drift impossible to merge.

---

## User Story

As a backend engineer adding a new audited action OR a new mutation handler, I want CI to fail unless (a) my shorthand resolves to a real taxonomy row AND (b) my handler emits at least one `AuditLog::write` on every non-error code path, so that the policy SSOT, the i18n table, the forensic query API, and the actual write-side behaviour stay locked together.

---

## Inputs

| Input | Type | Source | Notes |
|-------|------|--------|-------|
| All `Audit::action(...)` literal calls | Filesystem scan | `wp-plugin/**/*.php` | The shorthand argument |
| All `AuditLog::write(...)` / `Audit::log(...)` calls | Filesystem scan | `wp-plugin/**/*.php` | Coverage proof |
| Mutation-method surface | Filesystem scan | `wp-plugin/**/*.php` | Methods on classes `Auth`, `Sharing`, `Admin` not in the read-only allow-list |
| Parsed taxonomy table | Markdown table | `09-audit-log-policy.md` §2.1 | Authoritative ledger |
| Shorthand normalization rules | Markdown table | `09-audit-log-policy.md` §2.1 sub-table | Prefix-expansion ledger |
| Deprecation overlap window | Markdown text | `09-audit-log-policy.md` §2.1 deprecation note | Date until legacy names accepted |
| Read-only method allow-list | Inline constant | This script | e.g. `Auth::currentUser`, `Sharing::list`, `Admin::query` |

## Outputs

| Output | Persisted? | Channel | Notes |
|--------|-----------|---------|-------|
| Per-violation line | ❌ | stdout | Format: `❌ G-23: <file>:<line> <code> message` (matches G-22 / role-escalation drift format) |
| Final summary | ❌ | stdout | `✅ G-23: <N> action call(s) + <M> handler(s) reconciled` or `❌ G-23: <V> violation(s)` |
| Exit code | ❌ | Process exit | `0` clean, `1` any violation |

---

## Categories

Every `Audit::action(...)` literal must fall into exactly **one** of these categories:

| Category | Definition | Where listed |
|----------|------------|--------------|
| **Canonical** | Resolves via §2.1 normalization rules to a current row in the taxonomy table | `09-audit-log-policy.md` §2.1 |
| **Deprecated (in overlap)** | Resolves to a row marked deprecated AND today's date precedes the overlap end (default 2027-04-26 for v1.0.0 names) | §2.1 deprecation note |
| **Test fixture** | Filename matches `*.test.php` AND argument matches `*.TEST.*` pattern | This script's `TEST_FIXTURES` set |

A literal that matches **none** is a violation: "unmapped action". A literal that matches **deprecated past overlap end** is also a violation: "deprecated-expired".

Every mutation method must fall into exactly **one** of these categories:

| Category | Definition |
|----------|------------|
| **Audited** | At least one `AuditLog::write` / `Audit::log` call on every non-error return path |
| **Read-only** | Method name in the inline `READ_ONLY_METHODS` allow-list |

A mutation method matching neither is a violation: "unaudited mutation".

---

## Algorithm

```text
function auditAuditLogDrift(SourceRoot, PolicyPath, ReadOnlyMethods, TestFixtures) -> int:
    Calls       := [] # {File, Line, Shorthand}
    Writes      := [] # {File, Line, Method}
    Methods     := [] # {File, Line, Class, Method, Paths: [...]}

    for each File in walk(SourceRoot, "*.php"):
        for each (Line, Match) in scanForPattern(File, /Audit::action\(\s*"([A-Z][A-Z0-9_.]*)"\s*\)/):
            Calls.push({File, Line, Shorthand: Match.group(1)})
        for each (Line, Match) in scanForPattern(File, /(?:AuditLog::write|Audit::log)\s*\(/):
            Writes.push({File, Line})
        for each (Class, MethodName, MethodLines) in extractMethods(File, classes={"Auth","Sharing","Admin"}):
            ReturnPaths := analyseReturnPaths(MethodLines)
            Methods.push({File, Line: MethodLines.start, Class, Method: MethodName, Paths: ReturnPaths})

    Taxonomy        := parseTaxonomyTable(readFileSync(PolicyPath))
    NormalizeRules  := parseNormalizationTable(readFileSync(PolicyPath))
    DeprecationEnd  := parseDeprecationDate(readFileSync(PolicyPath)) # e.g. 2027-04-26
    Today           := getTodayUTC()
    Violations      := []

    # 1. Action-name registry drift
    for each C in Calls:
        if isTestFixture(C, TestFixtures): continue
        Canonical := normalize(C.Shorthand, NormalizeRules)
        Row := Taxonomy.get(Canonical)
        if Row == null:
            Violations.push({...C, code: "unmapped-action", reason: `${C.Shorthand} → ${Canonical} not in §2.1 taxonomy`})
            continue
        if Row.deprecated and Today >= DeprecationEnd:
            Violations.push({...C, code: "deprecated-expired", reason: `${C.Shorthand} resolves to deprecated ${Canonical}; overlap ended ${DeprecationEnd}`})

    # 2. Reverse check — every taxonomy row needs at least one emitter
    for each Row in Taxonomy where not Row.deprecated:
        Canonical := Row.name
        if not Calls.some(C => normalize(C.Shorthand, NormalizeRules) == Canonical):
            Violations.push({File: PolicyPath, Line: Row.LineNumber, code: "orphan-row", reason: `${Canonical} catalogued but no Audit::action() emitter found`})

    # 3. Handler coverage
    for each M in Methods:
        if ReadOnlyMethods.has(`${M.Class}::${M.Method}`): continue
        for each Path in M.Paths where not Path.isErrorReturn:
            if not Path.containsCallTo(Writes):
                Violations.push({File: M.File, Line: Path.line, code: "unaudited-mutation",
                                 reason: `${M.Class}::${M.Method} returns at line ${Path.line} without AuditLog::write on this path`})

    # Print + exit
    for each V in Violations:
        print(`❌ G-23: ${V.File}:${V.Line} ${V.code} — ${V.reason}`)
    if Violations.length > 0:
        print(`❌ G-23: ${Violations.length} violation(s) across ${Calls.length} action call(s) + ${Methods.length} handler(s)`)
        return 1
    print(`✅ G-23: ${Calls.length} action call(s) + ${Methods.length} handler(s) reconciled against ${Taxonomy.size} taxonomy row(s)`)
    return 0
```

### Parser Helpers (light-touch)

| Helper | Strategy |
|--------|----------|
| `scanForPattern` | Line-by-line regex scan; no AST parse — keeps G-23 hermetic. |
| `extractMethods` | Match `class Foo {` boundaries, then `function methodName(` declarations within; record line ranges. Brace-balance counter handles nested closures; comments stripped before scan. |
| `analyseReturnPaths` | Within method body, find every `return` statement; classify each as `isErrorReturn = true` if the statement's surrounding 5 lines contain `Auth::error(` / `throw new` / `return Response::error(`; otherwise `isErrorReturn = false`. |
| `Path.containsCallTo(Writes)` | True if any `Writes` entry's line falls between the method-body-start and the path's return line, **and** lies within the same brace-scope (no `if`-branch isolation). |
| `parseTaxonomyTable` | Locate the §2.1 sub-tables (one per category: `AUTH`, `AUTHZ`, `DATA`, `SHARING`, `POLICY`, `SYSTEM`, `ADMIN`); concatenate rows; record whether each row sits under a "Deprecated" sub-heading. |
| `parseNormalizationTable` | Locate the "Shorthand → canonical normalization rules" sub-table; build prefix → replacement map. |
| `normalize` | Apply the longest-match prefix rule first; fall back to dot-lower with `_` → `.` for `All others`. |

---

## Read-Only Method Allow-List (initial)

| Method | Why excluded |
|--------|--------------|
| `Auth::currentUser` | Pure session lookup; no mutation. |
| `Auth::hasRole` | Pure RBAC check (per `Auth::hasRole` PHP helper added in F-08 fix). |
| `Sharing::list` | Read-only enumeration of shared workspaces. |
| `Sharing::resolveLink` | Read-only token → workspace lookup. |
| `Admin::query` | Read-only forensic query (audited at the query-router layer, not per-method). |
| `Admin::healthCheck` | System ping; covered by ops monitoring, not audit. |

> **Maintenance rule** — adding a method requires (a) a justification line in the same commit, AND (b) a corresponding entry in this table. The script enforces (b); review enforces (a).

---

## Test-Fixture Allow-List (initial)

| Pattern | Why excluded |
|---------|--------------|
| `*.TEST.*` shorthand inside `*.test.php` | Reserved for unit-test sentinels; never reaches a real taxonomy row. |

---

## Rules

1. **Hermetic** — reads only files inside the repo; never network, never `git`, never spawns.
2. **Single source of truth** — `09-audit-log-policy.md` §2.1 is the action ledger; the read-only allow-list in this file is the coverage exemption ledger. Drift in either direction is a violation.
3. **Two-axis coverage** — both *action-name validity* AND *handler-call presence* are checked; a handler that emits the *wrong* action still triggers axis 1.
4. **Path-level granularity** — the coverage check examines each non-error `return` path separately; an `if`-branch that bypasses the audit write is a violation even if a sibling branch writes correctly.
5. **Deprecation-aware** — legacy names accepted until the documented overlap end-date; **today's date** is read at script start (only non-hermetic dependency, justified because deprecation is calendar-driven).

---

## Edge Cases

1. **Dynamic action argument** — `Audit::action($var)` → regex does not match the literal pattern; emit a *warning* "dynamic action argument — cannot verify" rather than a violation. Forces explicit static shorthands.
2. **Handler returns via exception** — `throw new ApiError(...)` is treated as an error return; no audit write required on that path.
3. **Audit write inside a callback** — `array_map(fn($x) => Audit::log(...), $items)` lives within the method body but inside a closure. Brace-scope check still finds it; OK.
4. **Method delegates to a private helper** — `public function delete() { return $this->doDelete(); }` and the helper writes the audit. Coverage check on `delete()` itself fails because the write is in another method scope. Resolution: either move the write into the public method or add the public method to the read-only allow-list with justification "thin delegator — write in `doDelete`".
5. **New action added to taxonomy without emitter** — reverse-check axis fires "orphan-row" violation; either implement the emitter or remove the row.
6. **Shorthand resolves under a special-case rule** (`EXPORT.SCRAPING_SUSPECTED` → `policy.export.scraping.suspected`) → the special-case must be exact-match, applied **before** the wildcard `EXPORT.*` rule. Normalize() iterates rules in spec order; longest-match-first prevents collision.
7. **Taxonomy row lives under a "Deprecated" sub-heading but the deprecation note documents a different end-date** → parser uses the per-row sub-heading metadata if present; falls back to the §2.1 default. Mismatch logged as a *parse warning* but not a violation (policy authors decide).
8. **Policy file edited mid-CI run** (race) — file is read once at script start; no re-read mid-execution.
9. **Method on `Auth` class with name not matching the read-only allow-list, but obviously a getter** (e.g. `Auth::getMaxLoginAttempts`) → not in allow-list → violation. Resolution: add to allow-list with justification — the gate intentionally over-fires here to force explicit categorisation.

---

## Acceptance Tests

| ID | Given | When | Then | testid |
|----|-------|------|------|--------|
| AT-G23-01 | All emitters resolve to taxonomy rows; all mutations audited | G-23 runs | Exits 0 with `✅ G-23: <N> action call(s) + <M> handler(s) reconciled` | `g23-clean` |
| AT-G23-02 | New `Audit::action("AUTH.LOGIN_NEW_THING")` not in taxonomy | G-23 runs | Exits 1 with "unmapped-action" violation citing file:line | `g23-detect-unmapped` |
| AT-G23-03 | Call uses deprecated `EXPORT.REQUESTED` and today < 2027-04-26 | G-23 runs | Clean exit; deprecated-but-in-overlap accepted | `g23-deprecation-overlap-ok` |
| AT-G23-04 | Same call, today ≥ 2027-04-26 | G-23 runs | Exits 1 with "deprecated-expired" violation | `g23-deprecation-expired` |
| AT-G23-05 | Taxonomy row exists but no `Audit::action(...)` emitter found | G-23 runs | Exits 1 with "orphan-row" violation citing policy line | `g23-detect-orphan-row` |
| AT-G23-06 | New `Sharing::revokeAll` mutation method has no `AuditLog::write` | G-23 runs | Exits 1 with "unaudited-mutation" violation citing return line | `g23-detect-unaudited-handler` |
| AT-G23-07 | Mutation has audit write on success branch but not on the early-`if` exit branch | G-23 runs | Exits 1 with "unaudited-mutation" citing the early exit's return line | `g23-detect-path-gap` |
| AT-G23-08 | Method in read-only allow-list (`Auth::hasRole`) has no audit write | G-23 runs | Ignored; clean exit | `g23-readonly-allowed` |
| AT-G23-09 | `Audit::action($dynamic)` — non-literal argument | G-23 runs | Prints warning, does not fail | `g23-dynamic-warning` |
| AT-G23-10 | Special-case shorthand `EXPORT.SCRAPING_SUSPECTED` | G-23 runs | Resolves to `policy.export.scraping.suspected`; clean exit | `g23-special-case-prefix` |
| AT-G23-11 | Test-fixture call `Audit::action("AUDIT.TEST.FOO")` in `Auth.test.php` | G-23 runs | Ignored; clean exit | `g23-test-fixture-allowed` |
| AT-G23-12 | G-23 reads only repo files (and `Date.now()` for overlap check) | Process is observed | No network, no git, no spawn | `g23-hermetic` |

---

## Component Contract

> **Aspirational paths** — implementation gated behind SPEC-ONLY-mode exit.

| Concern | Path | Function |
|---------|------|----------|
| Gate script | `scripts/spec-hygiene/23-check-audit-log-coverage.mjs` | `default export async function run(): Promise<number>` |
| Read-only allow-list | inline in `23-check-audit-log-coverage.mjs` | Mirror of the Read-Only Method Allow-List table |
| Test-fixture allow-list | inline in `23-check-audit-log-coverage.mjs` | Mirror of the Test-Fixture Allow-List table |
| Runner registration | `scripts/spec-hygiene/00-run-all.mjs` `checks` array | Append after entry 22 |
| Catalogue update | [`02-ci-quality-gates.md`](./02-ci-quality-gates.md) Gate Catalogue | Promote G-23 from "reserved" to active row in the same commit |
| Sibling: G-19 (workflow) | [`04-g19-workflow-contract-gate.md`](./04-g19-workflow-contract-gate.md) | Same hermetic shape |
| Sibling: G-20 (pre-commit) | [`06-g20-precommit-contract-gate.md`](./06-g20-precommit-contract-gate.md) | Same hermetic shape |
| Sibling: G-21 (gate discovery) | [`07-g21-gate-discovery-audit.md`](./07-g21-gate-discovery-audit.md) | Same hermetic shape |
| Sibling: G-22 (error-code catalogue) | [`15-g22-error-code-catalogue-gate.md`](./15-g22-error-code-catalogue-gate.md) | Same hermetic shape |

### Numbering Correction

The audit-log policy (`09-audit-log-policy.md` §9) currently states the implementation lives at `scripts/spec-hygiene/13-audit-log-coverage-audit.mjs`. That slot is **already occupied** by `13-generate-at-stubs.mjs` (gate G-13). This spec corrects the path to `23-check-audit-log-coverage.mjs` so the script's numeric prefix matches its gate ID (matching the convention used for G-19→`19-`, G-20→`20-`, G-21→`21-`, G-22→`22-`). A follow-up edit to the policy's §9 reference is required when this spec is committed.

---

## Cross-References

| Topic | Link |
|-------|------|
| Origin: policy §9 G-23 row | [`09-audit-log-policy.md`](./09-audit-log-policy.md) §9 |
| Origin: §2.1 shorthand normalization | [`09-audit-log-policy.md`](./09-audit-log-policy.md) §2.1 |
| Origin: §2.1 deprecation note | [`09-audit-log-policy.md`](./09-audit-log-policy.md) §2.1 |
| Origin: drift-output format reference | [`10-role-escalation-policy.md`](./10-role-escalation-policy.md) §Drift output |
| Sibling: G-19 workflow drift gate | [04-g19-workflow-contract-gate.md](./04-g19-workflow-contract-gate.md) |
| Sibling: G-20 pre-commit drift gate | [06-g20-precommit-contract-gate.md](./06-g20-precommit-contract-gate.md) |
| Sibling: G-21 gate-discovery audit | [07-g21-gate-discovery-audit.md](./07-g21-gate-discovery-audit.md) |
| Sibling: G-22 error-code catalogue gate | [15-g22-error-code-catalogue-gate.md](./15-g22-error-code-catalogue-gate.md) |
| Single entry point rule | [02-ci-quality-gates.md](./02-ci-quality-gates.md) AT-CIGATE-08 |
| Conventions overview | [00-overview.md](./00-overview.md) |
| Coding guidelines | `mem://constraints/coding-guidelines` |

---

## Changelog

| Version | Date | Change |
|---|---|---|
| 1.0.0 | 2026-04-27 | Initial SSOT — algorithm with two-axis coverage (action-name registry + handler-call presence), 12 acceptance tests (AT-G23-01..12), path-level granularity for handler check, deprecation-overlap awareness with calendar-aware exception, special-case prefix handling for `EXPORT.SCRAPING_SUSPECTED`. Closes the orphan G-23 reference in audit-log policy + role-escalation drift-output reference. Numbering correction (`13-` → `23-` slot) documented. |
