# G-25 Session & Token Lifecycle Drift Gate — Algorithm Spec

> **Version:** 1.0.0
> **Updated:** 2026-04-27 (UTC+8)
> **Parent:** [00-overview.md](./00-overview.md)
> **Reserved Gate ID:** G-25 (per [`02-ci-quality-gates.md`](./02-ci-quality-gates.md) catalogue)
> **Origin:** Promised in [`11-session-token-lifecycle.md`](./11-session-token-lifecycle.md) §10 with 5 enumerated checks but no algorithm SSOT. This file closes the gap.

---

## Overview

This is the **seventh** drift-detector in the CI cluster (siblings: G-19 workflow, G-20 pre-commit, G-21 gate-discovery, G-22 error-code catalogue, G-23 audit-log coverage, G-24 role-escalation coverage). G-25 watches **five distinct token-handling surfaces** that policy v1.0.0 introduced together:

1. **Browser-storage prohibition** — no source under `src/` or `wp-plugin/` may call `localStorage.setItem` / `sessionStorage.setItem` / `IndexedDB.put` with a key matching `/token|jwt|refresh|bearer|access/i`.
2. **Issuance audit pairing** — every `Auth::issueAccessToken()` call MUST be preceded (within the same scope, ≤30 lines) by an `Audit::log('AUTH.LOGIN_SUCCESS', …)` OR `Audit::log('AUTH.TOKEN_REFRESH', …)` call.
3. **Revocation audit pairing** — every `Auth::revokeFamily()` call MUST be paired (within the same scope, ≤30 lines) with one of `AUTH.LOGOUT*`, `AUTH.PASSWORD_CHANGE`, `AUTHZ.REFRESH_REUSE`, or `ADMIN.USER_DISABLE` audit calls.
4. **Refresh cookie path-scoping** — the refresh endpoint route declaration MUST contain the literal `'cookie_path' => '/wp-json/workflowy/v1/auth/refresh'` string.
5. **Refresh cookie hardening** — every `Set-Cookie: refresh=…` emitter MUST include all three flags `HttpOnly`, `Secure`, `SameSite=Strict` in the same statement.

Without G-25, any of five regressions could silently merge:

- A new component caches a JWT in `localStorage` for "convenience" → XSS exfiltration risk reopens.
- A handler issues a token without auditing the issuance → forensic gap.
- A handler revokes a token family without audit context → operators cannot correlate the revocation reason.
- The refresh cookie path widens to `/` → CSRF amplification.
- A flag is dropped from `Set-Cookie` → token theft via JS, sniffing, or third-party context.

G-25 makes all five impossible to merge.

---

## User Story

As a security-conscious reviewer of any PR that touches authentication, I want CI to fail unless every token issuance, revocation, storage write, cookie path, and cookie flag is provably aligned with the session/token-lifecycle policy SSOT, so that a refactor cannot silently soften the auth surface area.

---

## Inputs

| Input | Type | Source | Notes |
|-------|------|--------|-------|
| Browser-storage call sites | Filesystem scan | `src/**/*.{ts,tsx,js}`, `wp-plugin/**/*.{js,php}` | Pattern: `(localStorage|sessionStorage)\.setItem\(\s*['"]<token-key>['"]` + `IndexedDB`/`idb` writes |
| `Auth::issueAccessToken()` call sites | Filesystem scan | `wp-plugin/**/*.php` | Issuance proof |
| `Audit::log('AUTH.LOGIN_SUCCESS' \| 'AUTH.TOKEN_REFRESH', …)` calls | Filesystem scan | `wp-plugin/**/*.php` | Pairing for axis 2 |
| `Auth::revokeFamily()` call sites | Filesystem scan | `wp-plugin/**/*.php` | Revocation proof |
| Revocation-audit calls (`AUTH.LOGOUT*` / `AUTH.PASSWORD_CHANGE` / `AUTHZ.REFRESH_REUSE` / `ADMIN.USER_DISABLE`) | Filesystem scan | `wp-plugin/**/*.php` | Pairing for axis 3 |
| Refresh-endpoint route file | Filesystem read | `wp-plugin/Routes/auth-refresh.php` (canonical) | Path-scoping check |
| `Set-Cookie: refresh=…` emitters | Filesystem scan | `wp-plugin/**/*.php` | Pattern: `setcookie\(\s*['"]refresh['"]` + `header\(\s*['"]Set-Cookie:\s*refresh=` |
| Token-key allow-list | Inline constant | This script | Per-axis-1 regex: `/token\|jwt\|refresh\|bearer\|access/i` |
| Test-fixture allow-list | Inline constant | This script | Files matching `*.test.{ts,tsx,php}` allowed to write `_test_token` keys |

## Outputs

| Output | Persisted? | Channel | Notes |
|--------|-----------|---------|-------|
| Per-violation line | ❌ | stdout | Format: `❌ G-25: <file>:<line> <code> message` (matches G-22 / G-23 / G-24 drift format) |
| Final summary | ❌ | stdout | `✅ G-25: <axes-summary>` or `❌ G-25: <V> violation(s)` |
| Exit code | ❌ | Process exit | `0` clean, `1` violation, `2` runner error |

---

## Algorithm

```text
function auditTokenLifecycleDrift(SourceRoot, RouteFile, TokenKeyPattern, TestFixtures) -> int:
    StorageWrites := [] # {File, Line, Api, Key}
    Issuances     := [] # {File, Line}
    LoginAudits   := [] # {File, Line, Action}
    Revocations   := [] # {File, Line}
    RevokeAudits  := [] # {File, Line, Action}
    CookieEmits   := [] # {File, Line, Statement}
    Violations    := []

    for each File in walk(SourceRoot, ["*.ts","*.tsx","*.js","*.php"]):
        if isTestFixture(File, TestFixtures): continue
        for each (Line, Match) in scanForPattern(File, /(localStorage|sessionStorage)\.setItem\(\s*['"]([^'"]+)['"]/):
            if TokenKeyPattern.test(Match.group(2)):
                StorageWrites.push({File, Line, Api: Match.group(1), Key: Match.group(2)})
        for each (Line, Match) in scanForPattern(File, /(?:idb|indexedDB)\.[a-zA-Z]*put\(\s*['"]([^'"]+)['"]/):
            if TokenKeyPattern.test(Match.group(1)):
                StorageWrites.push({File, Line, Api: "indexedDB", Key: Match.group(1)})

    for each File in walk(SourceRoot, "*.php"):
        for each (Line, _) in scanForPattern(File, /Auth::issueAccessToken\s*\(/):
            Issuances.push({File, Line})
        for each (Line, Match) in scanForPattern(File, /Audit::log\s*\(\s*['"](AUTH\.LOGIN_SUCCESS|AUTH\.TOKEN_REFRESH)['"]/):
            LoginAudits.push({File, Line, Action: Match.group(1)})
        for each (Line, _) in scanForPattern(File, /Auth::revokeFamily\s*\(/):
            Revocations.push({File, Line})
        for each (Line, Match) in scanForPattern(File, /Audit::log\s*\(\s*['"](AUTH\.LOGOUT[A-Z_]*|AUTH\.PASSWORD_CHANGE|AUTHZ\.REFRESH_REUSE|ADMIN\.USER_DISABLE)['"]/):
            RevokeAudits.push({File, Line, Action: Match.group(1)})
        for each (Line, _) in scanForPattern(File, /(?:setcookie\s*\(\s*['"]refresh['"]|header\s*\(\s*['"]Set-Cookie:\s*refresh=)/):
            CookieEmits.push({File, Line, Statement: extractStatement(File, Line)})

    # Axis 1 — browser-storage prohibition
    for each W in StorageWrites:
        Violations.push({File: W.File, Line: W.Line, code: "browser-storage-token-write",
                         reason: `${W.Api}.setItem with token-shaped key "${W.Key}" — tokens MUST stay in memory or HttpOnly cookies (see §1)`})

    # Axis 2 — issuance audit pairing
    for each I in Issuances:
        Paired := LoginAudits.some(A => A.File == I.File and 0 < (I.Line - A.Line) <= 30)
        if not Paired:
            Violations.push({File: I.File, Line: I.Line, code: "issuance-audit-missing",
                             reason: "Auth::issueAccessToken() with no preceding Audit::log('AUTH.LOGIN_SUCCESS'|'AUTH.TOKEN_REFRESH') within 30 lines"})

    # Axis 3 — revocation audit pairing
    for each R in Revocations:
        Paired := RevokeAudits.some(A => A.File == R.File and abs(R.Line - A.Line) <= 30)
        if not Paired:
            Violations.push({File: R.File, Line: R.Line, code: "revocation-audit-missing",
                             reason: "Auth::revokeFamily() with no AUTH.LOGOUT*/AUTH.PASSWORD_CHANGE/AUTHZ.REFRESH_REUSE/ADMIN.USER_DISABLE audit within 30 lines"})

    # Axis 4 — refresh cookie path-scoping
    if exists(RouteFile):
        Body := readFileSync(RouteFile)
        if not Body.includes("'cookie_path' => '/wp-json/workflowy/v1/auth/refresh'"):
            Violations.push({File: RouteFile, Line: 1, code: "refresh-path-not-scoped",
                             reason: "missing literal `'cookie_path' => '/wp-json/workflowy/v1/auth/refresh'` declaration (see §1 RefreshToken row)"})
    else:
        Violations.push({File: RouteFile, Line: 0, code: "refresh-route-missing",
                         reason: `expected refresh route file ${RouteFile} not found`})

    # Axis 5 — refresh cookie hardening
    for each E in CookieEmits:
        Stmt := E.Statement.toLowerCase()
        Missing := []
        if not Stmt.includes("httponly"):  Missing.push("HttpOnly")
        if not Stmt.includes("secure"):    Missing.push("Secure")
        if not (Stmt.includes("samesite=strict") or Stmt.includes("samesite' => 'strict") or Stmt.includes('"samesite" => "strict"')):
            Missing.push("SameSite=Strict")
        if Missing.length > 0:
            Violations.push({File: E.File, Line: E.Line, code: "refresh-cookie-weak-flags",
                             reason: `Set-Cookie: refresh missing ${Missing.join(", ")}`})

    for each V in Violations:
        print(`❌ G-25: ${V.File}:${V.Line} ${V.code} — ${V.reason}`)
    if Violations.length > 0:
        print(`❌ G-25: ${Violations.length} violation(s) across 5 axes`)
        return 1
    print(`✅ G-25: ${Issuances.length} issuance(s) audited · ${Revocations.length} revocation(s) audited · ${CookieEmits.length} cookie emit(s) hardened · refresh path scoped · 0 browser-storage token writes`)
    return 0
```

### Parser Helpers (light-touch)

| Helper | Strategy |
|--------|----------|
| `scanForPattern` | Line-by-line regex scan; no AST parse — keeps G-25 hermetic. |
| `extractStatement` | Read forward from the matched line until the first balanced `;` (PHP) or end of statement; collapse to a single line; strip surrounding whitespace. Used by axis 5 to inspect the full cookie-flag set across multi-line statements. |
| `isTestFixture` | Filename ends with `.test.ts`, `.test.tsx`, or `.test.php`. Test code may write `_test_token` keys for unit tests. |

---

## Test-Fixture Allow-List

| Pattern | Why excluded |
|---------|--------------|
| `*.test.{ts,tsx,php}` | Unit tests may use `localStorage._test_refresh_*` keys to drive token-rotation simulations. Production code remains under the gate. |

---

## Rules

1. **Hermetic** — reads only files inside the repo; never network, never `git`, never spawns.
2. **Single source of truth** — `11-session-token-lifecycle.md` §1 + §10 is the policy ledger; this script is the algorithm.
3. **Five-axis coverage** — all five checks run on every invocation; one axis cannot mask another. Aggregate exit code is `1` if any axis fires.
4. **Token-key regex is broad on purpose** — `/token|jwt|refresh|bearer|access/i` over-fires intentionally; the cost of a false-positive review is much lower than a real token in `localStorage`.
5. **Cookie hardening is statement-level** — all three flags must appear in the same statement; flags split across separate `header()` calls do not count (browser merges them by name, but reviewers cannot trust that).

---

## Edge Cases

1. **Token written via wrapper** — `tokenStore.set(key, value)` where `tokenStore` internally calls `localStorage.setItem` → axis 1 misses the wrapper. **Resolution**: gate the wrapper file once with an inline `// eslint-disable-next-line g25-storage` comment AND add wrapper file path to the inline allow-list with justification "centralised wrapper, 0 tokens written through it" — the wrapper itself must NOT actually call `localStorage.setItem` with a token key.
2. **Issuance inside a closure** — `array_map(fn() => Auth::issueAccessToken(), $users)` — the audit call may live in the outer scope. Same-file 30-line window applies; reviewers prefer the issuance to live next to its audit anyway.
3. **Conditional issuance** — `if ($valid) { Audit::log('AUTH.LOGIN_SUCCESS', …); Auth::issueAccessToken(); }` — both calls in same scope; pairing OK.
4. **Revocation triggered from a different file than the audit** (e.g. cron sweep calls `Auth::revokeFamily()`, audit is written in the cron's caller) — pairing window is same-file; cron must emit its own audit row in the same file. **Resolution**: the cron sweep emits `AUTH.LOGOUT_TIMEOUT` directly when revoking expired families.
5. **Refresh route declared via attribute (`#[Route(cookie_path: '...')]`)** instead of array literal — axis 4 string-match misses. **Resolution**: file MUST contain the literal string somewhere — even as a comment if attribute-based — for grep-ability of policy compliance.
6. **`setcookie` called with array-form options** (`setcookie('refresh', $val, ['httponly' => true, 'secure' => true, 'samesite' => 'Strict'])`) — `extractStatement` walks the multi-line array and the case-insensitive substring check picks up `httponly`, `secure`, `samesite' => 'strict`. ✅
7. **Cookie deletion** — `setcookie('refresh', '', time() - 3600)` is a delete; technically lacks `Secure`/`HttpOnly` flags depending on style. **Resolution**: deletion calls MUST still set the flags identically (browsers require flag-match for deletion); axis 5 enforces consistently.
8. **`localStorage.setItem('userPreferences', JSON.stringify({theme:'dark', lastToken:'…'}))`** — key is `userPreferences`, not token-shaped → axis 1 misses. **Resolution**: this is a real risk; document in `97-acceptance-criteria.md` that the regex must be updated whenever a non-obvious key surface emerges. Future enhancement: scan stringified values for JWT shape (`/eyJ[A-Za-z0-9_-]+\./`).
9. **Test files using real-shaped key for E2E** (`localStorage.setItem('refresh_token', 'fake-jwt')`) — `*.test.*` allow-list exempts them. E2E specs that live under `tests/e2e/` without the `.test.` suffix must be added to the exemption list explicitly.

---

## Acceptance Tests

| ID | Given | When | Then | testid |
|----|-------|------|------|--------|
| AT-G25-01 | All five axes clean | G-25 runs | Exits 0 with full reconciliation summary | `g25-clean` |
| AT-G25-02 | New `localStorage.setItem('access_token', jwt)` in `src/auth/Login.tsx` | G-25 runs | Exits 1 with "browser-storage-token-write" violation | `g25-detect-storage-write` |
| AT-G25-03 | `sessionStorage.setItem('refresh', …)` | G-25 runs | Exits 1 with "browser-storage-token-write" violation | `g25-detect-session-storage` |
| AT-G25-04 | `Auth::issueAccessToken()` with no audit pairing | G-25 runs | Exits 1 with "issuance-audit-missing" violation | `g25-detect-orphan-issuance` |
| AT-G25-05 | `Audit::log('AUTH.LOGIN_SUCCESS')` 5 lines before `Auth::issueAccessToken()` | G-25 runs | Clean exit | `g25-issuance-paired-ok` |
| AT-G25-06 | `Auth::revokeFamily()` with no revocation audit nearby | G-25 runs | Exits 1 with "revocation-audit-missing" violation | `g25-detect-orphan-revoke` |
| AT-G25-07 | Refresh route file lacks `cookie_path` literal | G-25 runs | Exits 1 with "refresh-path-not-scoped" violation | `g25-detect-path-leak` |
| AT-G25-08 | Refresh route file missing entirely | G-25 runs | Exits 1 with "refresh-route-missing" violation | `g25-detect-missing-route` |
| AT-G25-09 | `setcookie('refresh', $v, ['httponly'=>true, 'secure'=>true, 'samesite'=>'Strict'])` | G-25 runs | Clean exit | `g25-cookie-hardened-ok` |
| AT-G25-10 | Same call without `samesite` | G-25 runs | Exits 1 with "refresh-cookie-weak-flags — SameSite=Strict" violation | `g25-detect-missing-samesite` |
| AT-G25-11 | Cookie deletion call missing flags | G-25 runs | Exits 1 with "refresh-cookie-weak-flags" violation | `g25-detect-weak-deletion` |
| AT-G25-12 | Test-file `*.test.tsx` with `localStorage.setItem('access_token', …)` | G-25 runs | Ignored; clean exit | `g25-test-fixture-allowed` |
| AT-G25-13 | IndexedDB `idb.put('token', …)` in production code | G-25 runs | Exits 1 with "browser-storage-token-write" violation | `g25-detect-indexeddb` |
| AT-G25-14 | G-25 reads only repo files | Process is observed | No network, no git, no spawn | `g25-hermetic` |

---

## Component Contract

> **Aspirational paths** — implementation gated behind SPEC-ONLY-mode exit.

| Concern | Path | Function |
|---------|------|----------|
| Gate script | `scripts/spec-hygiene/25-check-token-lifecycle-coverage.mjs` | `default export async function run(): Promise<number>` |
| Token-key regex | inline in `25-check-token-lifecycle-coverage.mjs` | `/token\|jwt\|refresh\|bearer\|access/i` |
| Test-fixture allow-list | inline | Per the table above |
| Wrapper-file allow-list | inline | Per Edge Case 1 |
| Refresh route file path | inline | `wp-plugin/Routes/auth-refresh.php` |
| Runner registration | `scripts/spec-hygiene/00-run-all.mjs` `checks` array | Append after entry 24 |
| Catalogue update | [`02-ci-quality-gates.md`](./02-ci-quality-gates.md) Gate Catalogue | Promote G-25 from "reserved" to active row in the same commit |
| Sibling: G-23 (audit-log coverage) | [`16-g23-audit-log-coverage-gate.md`](./16-g23-audit-log-coverage-gate.md) | Two-axis precedent |
| Sibling: G-24 (role-escalation) | [`17-g24-role-escalation-coverage-gate.md`](./17-g24-role-escalation-coverage-gate.md) | Multi-axis precedent + 30-line window |

### Numbering Correction

The session-token policy (`11-session-token-lifecycle.md` §10) currently states the implementation lives at `scripts/spec-hygiene/15-token-lifecycle-coverage-audit.mjs`. That slot is **already occupied** by `15-check-enums-in-sync.mjs` (gate G-15). This spec corrects the path to `25-check-token-lifecycle-coverage.mjs` so the script's numeric prefix matches its gate ID (matching the convention used by G-19→`19-`, G-20→`20-`, G-21→`21-`, G-22→`22-`, G-23→`23-`, G-24→`24-`). A follow-up edit to the policy's §10 reference is required when this spec is committed.

---

## Cross-References

| Topic | Link |
|-------|------|
| Origin: policy §10 G-25 row + 5 enumerated checks | [`11-session-token-lifecycle.md`](./11-session-token-lifecycle.md) §10 |
| Token kinds + storage rules (axis 1 source) | [`11-session-token-lifecycle.md`](./11-session-token-lifecycle.md) §1 |
| Audit integration | [`11-session-token-lifecycle.md`](./11-session-token-lifecycle.md) §9 → [`09-audit-log-policy.md`](./09-audit-log-policy.md) §2.1 `AUTH` rows |
| Sibling: G-19 workflow drift gate | [04-g19-workflow-contract-gate.md](./04-g19-workflow-contract-gate.md) |
| Sibling: G-20 pre-commit drift gate | [06-g20-precommit-contract-gate.md](./06-g20-precommit-contract-gate.md) |
| Sibling: G-21 gate-discovery audit | [07-g21-gate-discovery-audit.md](./07-g21-gate-discovery-audit.md) |
| Sibling: G-22 error-code catalogue gate | [15-g22-error-code-catalogue-gate.md](./15-g22-error-code-catalogue-gate.md) |
| Sibling: G-23 audit-log coverage gate | [16-g23-audit-log-coverage-gate.md](./16-g23-audit-log-coverage-gate.md) |
| Sibling: G-24 role-escalation gate | [17-g24-role-escalation-coverage-gate.md](./17-g24-role-escalation-coverage-gate.md) |
| Single entry point rule | [02-ci-quality-gates.md](./02-ci-quality-gates.md) AT-CIGATE-08 |
| Conventions overview | [00-overview.md](./00-overview.md) |
| Coding guidelines | `mem://constraints/coding-guidelines` |

---

## Changelog

| Version | Date | Change |
|---|---|---|
| 1.0.0 | 2026-04-27 | Initial SSOT — algorithm with **five-axis coverage** (browser-storage prohibition + issuance-audit pairing + revocation-audit pairing + refresh-cookie path-scoping + refresh-cookie flag hardening), 14 acceptance tests (AT-G25-01..14), broad token-key regex, statement-level cookie-flag inspection (handles array-form `setcookie`), test-fixture exemption. Closes the orphan G-25 reference in policy §10. Numbering correction (`15-` → `25-` slot) documented. |
