# G-22 Error-Code Catalogue Drift Gate — Algorithm Spec

> **Version:** 1.0.0
> **Updated:** 2026-04-27 (UTC+8)
> **Parent:** [00-overview.md](./00-overview.md)
> **Reserved Gate ID:** G-22 (per [`02-ci-quality-gates.md`](./02-ci-quality-gates.md) catalogue)
> **Origin:** Promised in three places without an algorithm SSOT — ([`05-error-code-catalogue.md`](../../03-error-manage/02-error-architecture/05-response-envelope/05-error-code-catalogue.md) §9), ([`10-role-escalation-policy.md`](./10-role-escalation-policy.md) drift-output reference), and ([`23-operator-runbooks/00-overview.md`](../../15-wp-plugin-how-to/23-operator-runbooks/00-overview.md) sibling-shape reference). This file closes the gap.

---

## Overview

This is the **fourth** drift-detector in the CI cluster (siblings: G-19 workflow, G-20 pre-commit, G-21 gate-discovery). G-22 watches the **error-code surface area**: every `ERR_*` literal that appears in PHP, TypeScript, or Markdown sources MUST exist as a row in the canonical error-code catalogue, AND every catalogue row MUST have an HTTP-status that matches the actual handler emitting it.

Without G-22, two failure modes go undetected:

1. **Drift from spec** — a developer adds `ERR_NEW_THING` in a handler but forgets to register it in the catalogue → frontend i18n table has no `MessageKey` for it → user sees a debug string.
2. **Status mismatch** — a handler emits `ERR_AUTH_REQUIRED` with HTTP 500 but the catalogue says HTTP 401 → Axios interceptor's status-based branching mishandles it.

G-22 makes both classes of drift impossible to merge.

---

## User Story

As a backend engineer adding a new error code to a REST handler, I want CI to fail unless I have **also** added a row to the error-code catalogue with a matching `HttpStatus`, so that the frontend i18n table, the Axios interceptor, and the operator-facing log dashboard all stay in sync with the real surface area.

---

## Inputs

| Input | Type | Source | Notes |
|-------|------|--------|-------|
| All `ERR_*` literals in source | Filesystem scan | `src/**/*.{ts,tsx}`, `wp-plugin/**/*.php`, `spec/**/*.md` | Ungrouped raw set |
| Parsed catalogue rows | Markdown table | `spec/03-error-manage/02-error-architecture/05-response-envelope/05-error-code-catalogue.md` §5 | Authoritative ledger |
| Excluded directories | Inline constant | This script | `node_modules/`, `dist/`, `.release/`, generated paths |
| Excluded literals | Inline constant | This script | Test-only sentinels (e.g. `ERR_TEST_FIXTURE_*`) |

## Outputs

| Output | Persisted? | Channel | Notes |
|--------|-----------|---------|-------|
| Per-violation line | ❌ | stdout | Format: `❌ G-22: <file>:<line> <code> — <reason>` |
| Final summary | ❌ | stdout | `✅ G-22: <N> code(s) reconciled` or `❌ G-22: <V> violation(s)` |
| Exit code | ❌ | Process exit | `0` clean, `1` any violation |

---

## Categories

Every discovered `ERR_*` literal must fall into exactly **one** of these categories:

| Category | Definition | Where listed |
|----------|------------|--------------|
| **Catalogued** | Appears as a row in §5 of the catalogue | `05-error-code-catalogue.md` §5 |
| **Test fixture** | Filename matches `*.test.{ts,tsx,php}` AND literal is in the test-fixture allow-list | This script's `TEST_FIXTURES` set |
| **Installer-only** | Lives under `spec/10-powershell-integration/` AND `HttpStatus = 0` in the catalogue | Catalogue row marked `installer` |

A literal that matches **none** is a violation: "unregistered". A literal that matches **more than one** is a violation: "ambiguous classification".

---

## Algorithm

```text
function auditErrorCodeCatalogue(SourceRoots, CataloguePath, TestFixtures, Excludes) -> int:
    Literals    := [] # {File, Line, Code, EmitterContext}
    for each Root in SourceRoots:
        for each File in walk(Root) where not matchesAny(File, Excludes):
            for each (Line, Match) in scanForPattern(File, /\bERR_[A-Z][A-Z0-9_]*\b/):
                Literals.push({File, Line, Code: Match, EmitterContext: detectEmitter(File, Line)})

    Catalogue   := parseCatalogueTable(readFileSync(CataloguePath))
    Violations  := []

    # Forward check — every literal must be catalogued
    for each L in Literals:
        Categories := classify(L, Catalogue, TestFixtures)
        if Categories.length == 0:
            Violations.push({...L, reason: "unregistered — no row in 05-error-code-catalogue.md §5"})
        if Categories.length > 1:
            Violations.push({...L, reason: `ambiguous — matches ${Categories.join(", ")}`})

    # Status-parity check — handler-emitted codes must match catalogue HttpStatus
    for each L in Literals where L.EmitterContext.kind == "rest-handler":
        Row := Catalogue.get(L.Code)
        if Row and L.EmitterContext.HttpStatus != Row.HttpStatus:
            Violations.push({...L, reason: `HttpStatus mismatch — handler emits ${L.EmitterContext.HttpStatus}, catalogue says ${Row.HttpStatus}`})

    # Reverse check — every catalogue row must have at least one emitter
    for each Row in Catalogue where Row.kind != "reserved":
        if not Literals.some(L => L.Code == Row.Code):
            Violations.push({File: CataloguePath, Line: Row.LineNumber, Code: Row.Code, reason: "catalogued but no emitter found in src/ or wp-plugin/"})

    for each V in Violations:
        print(`❌ G-22: ${V.File}:${V.Line} ${V.Code} — ${V.reason}`)
    if Violations.length > 0:
        print(`❌ G-22: ${Violations.length} violation(s) across ${Literals.length} literal(s)`)
        return 1
    print(`✅ G-22: ${Literals.length} code(s) reconciled against ${Catalogue.size} catalogue row(s)`)
    return 0
```

### Parser Helpers (light-touch)

| Helper | Strategy |
|--------|----------|
| `scanForPattern` | Line-by-line regex scan; no AST parse — keeps G-22 hermetic and language-agnostic. |
| `parseCatalogueTable` | Locate the `## 5 ·` heading; parse the markdown table rows; key by the `Code` column; record line numbers for diagnostics. |
| `detectEmitter` | Inspect surrounding 3 lines: if call site matches `Auth::error(<code>, ...)` (PHP) OR `throw new ApiError(<code>, ...)` (TS), classify as `rest-handler` and parse the inferred `HttpStatus` from the call's third argument or the surrounding controller's `@status` annotation. Else: `reference-only` (no status check applied). |
| `classify` | Returns the set of categories matched; mutually-exclusive set per the table above. |

---

## Test-Fixture Allow-List (initial)

| Code pattern | Why excluded |
|--------------|--------------|
| `ERR_TEST_FIXTURE_*` | Reserved prefix for unit-test sentinels — never reachable in production. |
| `ERR_E2E_SIMULATED_*` | Reserved prefix for E2E synthetic-failure tests. |

> **Maintenance rule** — adding a new prefix requires (a) a justification line in the same commit, AND (b) a corresponding entry in this table. The script enforces (b) only; review enforces (a).

---

## Rules

1. **Hermetic** — reads only files inside the repo; never network, never `git`, never spawns.
2. **Single source of truth** — the catalogue's §5 table is the ledger. Any divergence between code and catalogue is a violation in **either** direction.
3. **No silent additions** — emitting a new `ERR_*` literal *requires* a paired catalogue row in the same PR.
4. **Status parity** — for handler emitters, the `HttpStatus` argument MUST equal the catalogue's `HttpStatus` column.
5. **No dead codes** — a catalogue row without a real emitter signals either (a) a leftover plan that never shipped, or (b) a code that lost its caller; either way the operator should remove or restore it explicitly.

---

## Edge Cases

1. **String concatenation** — code emits `Auth::error("ERR_" . $suffix, ...)` → regex matches only the literal prefix; emit a *warning* "dynamic error code construction — cannot verify" rather than a violation. Forces explicit static codes.
2. **Code referenced in markdown only** — appears in spec but never in any source emitter → "no emitter found" violation; either delete the catalogue row or implement the emitter.
3. **Code in a deprecated path** — handler removed but catalogue row left behind → "no emitter found" triggers; operator must explicitly delete the row to acknowledge removal.
4. **Status read from constant** — `Auth::error(ERR_X, $this->forbiddenStatus)` where `$this->forbiddenStatus = 403` → emitter detector follows one level of constant resolution; if it cannot resolve, emit *warning* "unable to verify HttpStatus statically" — never a hard violation.
5. **Code appears in test fixture but lacks the `*.test.*` filename suffix** — classified as production literal; if not catalogued, hard violation. Forces the file-naming convention.
6. **Duplicate catalogue rows for the same code** — parse error; G-22 fails with line numbers of all occurrences.
7. **i18n MessageKey drift** — out of scope for G-22. Frontend i18n is verified by a *future* gate (G-24, reserved). G-22 only checks code-presence and HttpStatus.

---

## Acceptance Tests

| ID | Given | When | Then | testid |
|----|-------|------|------|--------|
| AT-G22-01 | All emitters reconciled with catalogue | G-22 runs | Exits 0 with `✅ G-22: <N> code(s) reconciled` | `g22-clean` |
| AT-G22-02 | New `ERR_FOO` in `wp-plugin/Auth/Auth.php` not in catalogue | G-22 runs | Exits 1 with "unregistered" violation citing file:line | `g22-detect-unregistered` |
| AT-G22-03 | Handler emits `ERR_AUTH_REQUIRED` with HTTP 500; catalogue says 401 | G-22 runs | Exits 1 with "HttpStatus mismatch" violation | `g22-detect-status-drift` |
| AT-G22-04 | Catalogue row exists for `ERR_LEGACY_X` but no emitter found | G-22 runs | Exits 1 with "no emitter found" violation citing catalogue line | `g22-detect-orphan-row` |
| AT-G22-05 | `ERR_TEST_FIXTURE_X` appears in `Auth.test.ts` only | G-22 runs | Ignored; clean exit | `g22-test-fixture-allowed` |
| AT-G22-06 | Code constructed dynamically via string concat | G-22 runs | Prints warning, does not fail | `g22-dynamic-warning` |
| AT-G22-07 | Catalogue table has duplicate rows for same code | G-22 runs | Exits 1 with parse-error citing both line numbers | `g22-duplicate-rows` |
| AT-G22-08 | Same code emitted at two call sites with consistent HttpStatus | G-22 runs | Both emitters reconciled; exits 0 | `g22-multiple-emitters-ok` |
| AT-G22-09 | Same code emitted at two call sites with **different** HttpStatus | G-22 runs | Exits 1 with "HttpStatus mismatch" for the divergent emitter | `g22-multiple-emitters-divergent` |
| AT-G22-10 | G-22 reads only repo files | Process is observed | No network, no git, no spawn | `g22-hermetic` |

---

## Component Contract

> **Aspirational paths** — implementation gated behind SPEC-ONLY-mode exit.

| Concern | Path | Function |
|---------|------|----------|
| Gate script | `scripts/spec-hygiene/22-check-error-code-catalogue.mjs` | `default export async function run(): Promise<number>` |
| Test-fixture constants | inline in `22-check-error-code-catalogue.mjs` | Mirror of the Test-Fixture Allow-List table |
| Runner registration | `scripts/spec-hygiene/00-run-all.mjs` `checks` array | Append after entry 21 |
| Catalogue update | [`02-ci-quality-gates.md`](./02-ci-quality-gates.md) Gate Catalogue | Promote G-22 from "reserved" to active row in the same commit |
| Sibling: G-19 (workflow) | [`04-g19-workflow-contract-gate.md`](./04-g19-workflow-contract-gate.md) | Same hermetic shape |
| Sibling: G-20 (pre-commit) | [`06-g20-precommit-contract-gate.md`](./06-g20-precommit-contract-gate.md) | Same hermetic shape |
| Sibling: G-21 (gate discovery) | [`07-g21-gate-discovery-audit.md`](./07-g21-gate-discovery-audit.md) | Same hermetic shape |

### Numbering Correction

The error-code catalogue (`05-error-code-catalogue.md` §9) currently states the implementation lives at `scripts/spec-hygiene/12-error-code-catalogue-audit.mjs`. That slot is **already occupied** by `12-check-required-files.mjs` (gate G-12). This spec corrects the path to `22-check-error-code-catalogue.mjs` so the script's numeric prefix matches its gate ID (the convention used by every other reserved gate: G-19→`19-`, G-20→`20-`, G-21→`21-`). A follow-up edit to the catalogue's §9 reference is required when this spec is committed.

---

## Cross-References

| Topic | Link |
|-------|------|
| Origin: catalogue §9 G-22 row | [`05-error-code-catalogue.md`](../../03-error-manage/02-error-architecture/05-response-envelope/05-error-code-catalogue.md) |
| Origin: drift-output format reference | [`10-role-escalation-policy.md`](./10-role-escalation-policy.md) §Drift output |
| Origin: runbook sibling-shape reference | [`23-operator-runbooks/00-overview.md`](../../15-wp-plugin-how-to/23-operator-runbooks/00-overview.md) |
| Sibling: G-19 workflow drift gate | [04-g19-workflow-contract-gate.md](./04-g19-workflow-contract-gate.md) |
| Sibling: G-20 pre-commit drift gate | [06-g20-precommit-contract-gate.md](./06-g20-precommit-contract-gate.md) |
| Sibling: G-21 gate-discovery audit | [07-g21-gate-discovery-audit.md](./07-g21-gate-discovery-audit.md) |
| Single entry point rule | [02-ci-quality-gates.md](./02-ci-quality-gates.md) AT-CIGATE-08 |
| Conventions overview | [00-overview.md](./00-overview.md) |
| Coding guidelines | `mem://constraints/coding-guidelines` |

---

## Changelog

| Version | Date | Change |
|---|---|---|
| 1.0.0 | 2026-04-27 | Initial SSOT — algorithm + 10 ATs + numbering correction (12→22 slot). Closes the orphan G-22 reference triangle (catalogue / role-escalation / runbook). |
