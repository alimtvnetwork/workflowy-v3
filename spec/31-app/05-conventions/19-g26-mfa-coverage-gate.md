# G-26 MFA Policy Drift Gate — Algorithm Spec

> **Version:** 1.0.0
> **Updated:** 2026-04-27 (UTC+8)
> **Parent:** [00-overview.md](./00-overview.md)
> **Reserved Gate ID:** G-26 (per [`02-ci-quality-gates.md`](./02-ci-quality-gates.md) catalogue)
> **Origin:** Promised in [`12-mfa-policy.md`](./12-mfa-policy.md) §9 with 5 enumerated checks but no algorithm SSOT. This file closes the gap.

---

## Overview

This is the **eighth** drift-detector in the CI cluster (siblings: G-19 workflow, G-20 pre-commit, G-21 gate-discovery, G-22 error-code catalogue, G-23 audit-log coverage, G-24 role-escalation, G-25 token lifecycle). G-26 watches **five distinct MFA-policy surfaces** that policy v1.0.0 introduced together:

1. **Forbidden-literal prohibition** — no source under `src/` or `wp-plugin/` may contain the literals `'sms'`, `'email_otp'`, `'voice'`, `'remember_mfa'`, `MFA_DISABLED`, or `bypass_mfa` as factor names, cookie names, env-var names, or query parameters. `[G-26-FORBIDDEN-LITERAL]`
2. **Mutation-route freshness declaration** — every PHP route file declaring an HTTP `POST`/`PUT`/`DELETE` handler MUST call either `Mfa::requireFreshness(seconds)` or `Mfa::skipForRead()` (the latter only legal for endpoints policy-marked as read-only mutations like idempotent telemetry). `[G-26-MUTATION-FRESHNESS]`
3. **Step-up-map parity** — the endpoint→staleness table in `12-mfa-policy.md` §6 MUST match `Auth\Mfa\StepUpMap::MAX_AGE_SECONDS` byte-for-byte (entry count + per-row pattern + seconds value). `[G-26-STEPUP-MAP-PARITY]`
4. **Factor-registry containment** — every call to `mfa_factor_create()` (or its OO equivalent `MfaFactor::create()`) MUST pass a `Kind` argument whose static value is one of `'TOTP'`, `'WebAuthn'`, `'Recovery'`. `[G-26-FACTOR-KIND-CLOSED]`
5. **Recovery-code hash strength** — every call to `password_hash` whose first argument is a recovery-code variable (`$code`, `$recoveryCode`, `$recovery_code`) MUST use `PASSWORD_ARGON2ID` as the second argument; `PASSWORD_DEFAULT`, `md5`, `sha1`, `password_hash($_, PASSWORD_BCRYPT, …)` for recovery codes are all forbidden. `[G-26-RECOVERY-ARGON2ID]`

> **Umbrella note** — the five sub-rule tokens above are structurally covered by `G-26-MFA-DRIFT-COVERAGE` (Umbrella, family=convention-drift) per ADR-0033 §Decision (NEW-29 same-number disambiguation). The `family=convention-drift` qualifier disambiguates this `G-26` from `ADR-0022`'s component-base `G-26-*` namespace AND `ADR-0026`'s LWW `G-26-*` namespace (triple-reserved numeric prefix).

Without G-26, any of five regressions could silently merge:

- A new flow allows SMS as a factor → policy promises only phishing-resistant factors.
- A new mutation endpoint forgets `requireFreshness` → step-up never triggers, sensitive write becomes one-factor.
- The §6 table drifts from the runtime map → spec lies about runtime behavior.
- A factor registry expansion adds `'EMAIL'` → silent SMS/email-OTP regression.
- Recovery codes stored under MD5 → catastrophic breach surface.

G-26 makes all five impossible to merge.

---

## User Story

As a security-conscious reviewer of any PR that touches authentication routes, factor registries, or recovery-code handling, I want CI to fail unless the MFA policy SSOT, the runtime factor whitelist, and the per-endpoint freshness ladder are provably aligned, so that a refactor cannot silently soften the MFA surface area.

---

## Inputs

| Input | Type | Source | Notes |
|-------|------|--------|-------|
| Forbidden-literal scan | Filesystem scan | `src/**/*.{ts,tsx,js,php}`, `wp-plugin/**/*.{ts,js,php}` | Token-boundary regex (avoid matching `voiceover`, `email_otp_label`, etc.) |
| Mutation-route declarations | Filesystem scan | `wp-plugin/Routes/**/*.php` | Pattern: `register_rest_route` calls with `methods` containing `POST`, `PUT`, or `DELETE` |
| Freshness-call presence | Filesystem scan | Same files | `Mfa::requireFreshness(<int>)` or `Mfa::skipForRead()` within the route's `callback` closure |
| Spec step-up map (§6) | File read | `spec/31-app/05-conventions/12-mfa-policy.md` | Markdown table parser (rows under `## 6 — Sensitive-Endpoint Step-Up Map`) |
| Runtime step-up map | File read | `wp-plugin/Auth/Mfa/StepUpMap.php` | PHP constant `MAX_AGE_SECONDS` (assoc array literal) |
| Factor-registry call sites | Filesystem scan | `wp-plugin/**/*.php` | Pattern: `mfa_factor_create\(` or `MfaFactor::create\(` with `Kind:` named argument or 1st-position string literal |
| Allowed-factor whitelist | Inline constant | This script | `['TOTP', 'WebAuthn', 'Recovery']` (mirror of `Auth\Mfa\FactorRegistry::ALLOWED`) |
| Recovery-code hash sites | Filesystem scan | `wp-plugin/**/*.php` | Pattern: `password_hash\(\s*\$(code|recoveryCode|recovery_code)` |
| Test-fixture allow-list | Inline constant | This script | `*.test.{ts,tsx,php}` AND `tests/fixtures/**` exempt from axes 1, 4, 5 |

## Outputs

| Output | Persisted? | Channel | Notes |
|--------|-----------|---------|-------|
| Per-violation line | ❌ | stdout | Format: `❌ G-26: <file>:<line> <code> message` (matches G-22..G-25 drift format) |
| Final summary | ❌ | stdout | `✅ G-26: <axes-summary>` or `❌ G-26: <V> violation(s)` |
| Exit code | ❌ | Process exit | `0` clean, `1` violation, `2` runner error |

---

## Algorithm

```text
function auditMfaPolicyDrift(SourceRoot, PolicyFile, RuntimeMapFile, AllowedFactors, TestFixtures) -> int:
    Forbidden     := [] # {File, Line, Literal}
    Mutations     := [] # {File, Line, Route, Method, CallbackBody}
    SpecMap       := {} # Pattern -> Seconds (or "infinity")
    RuntimeMap    := {} # Pattern -> Seconds
    FactorCalls   := [] # {File, Line, Kind|null}
    HashCalls     := [] # {File, Line, Var, Algo}
    Violations    := []

    ForbiddenLiterals := [
        {pat: /['"]sms['"]/,            literal: "'sms'"},
        {pat: /['"]email_otp['"]/,      literal: "'email_otp'"},
        {pat: /['"]voice['"]/,          literal: "'voice'"},
        {pat: /['"]remember_mfa[^'"]*['"]/, literal: "'remember_mfa*'"},
        {pat: /\bMFA_DISABLED\b/,       literal: "MFA_DISABLED"},
        {pat: /\bbypass_mfa\b/,         literal: "bypass_mfa"}
    ]

    # === Axis 1 — forbidden-literal scan ===
    for each File in walk(SourceRoot, ["*.ts","*.tsx","*.js","*.php"]):
        if isTestFixture(File, TestFixtures): continue
        for each (Line, Text) in eachLine(File):
            for each F in ForbiddenLiterals:
                if F.pat.test(Text):
                    Forbidden.push({File, Line, Literal: F.literal})

    # === Axis 2 — mutation-route freshness declaration ===
    for each File in walk(SourceRoot, "wp-plugin/Routes/**/*.php"):
        for each Match in scanRoutes(File):
            # Match has: {RouteLine, Route, Methods[], CallbackBody}
            HasMutation := Match.Methods.some(M => M in ['POST','PUT','DELETE'])
            if not HasMutation: continue
            HasFreshness := /Mfa::requireFreshness\s*\(\s*\d+\s*\)/.test(Match.CallbackBody)
            HasSkip      := /Mfa::skipForRead\s*\(\s*\)/.test(Match.CallbackBody)
            if not (HasFreshness or HasSkip):
                Violations.push({File, Line: Match.RouteLine, code: "mutation-route-freshness-missing",
                                 reason: `${Match.Methods.join('|')} route ${Match.Route} must call Mfa::requireFreshness(<sec>) or Mfa::skipForRead() inside its callback`})

    # === Axis 3 — step-up-map parity ===
    SpecMap    := parseMarkdownTable(PolicyFile, sectionHeading: "6 — Sensitive-Endpoint Step-Up Map")
    RuntimeMap := parsePhpAssocArray(RuntimeMapFile, constantName: "MAX_AGE_SECONDS")
    if SpecMap.size != RuntimeMap.size:
        Violations.push({File: RuntimeMapFile, Line: 1, code: "stepup-map-size-mismatch",
                         reason: `spec has ${SpecMap.size} rows, runtime has ${RuntimeMap.size} rows`})
    for each (Pattern, SpecSec) in SpecMap:
        if not RuntimeMap.has(Pattern):
            Violations.push({File: RuntimeMapFile, Line: 1, code: "stepup-map-missing-runtime",
                             reason: `pattern "${Pattern}" present in spec §6 but absent from MAX_AGE_SECONDS`})
            continue
        RunSec := RuntimeMap.get(Pattern)
        if normalizeSeconds(SpecSec) != normalizeSeconds(RunSec):
            Violations.push({File: RuntimeMapFile, Line: 1, code: "stepup-map-value-mismatch",
                             reason: `pattern "${Pattern}" spec=${SpecSec} runtime=${RunSec}`})
    for each Pattern in RuntimeMap.keys():
        if not SpecMap.has(Pattern):
            Violations.push({File: PolicyFile, Line: 1, code: "stepup-map-missing-spec",
                             reason: `pattern "${Pattern}" present in runtime but absent from spec §6 table`})

    # === Axis 4 — factor-registry containment ===
    for each File in walk(SourceRoot, "wp-plugin/**/*.php"):
        if isTestFixture(File, TestFixtures): continue
        for each (Line, Match) in scanForPattern(File, /(?:mfa_factor_create|MfaFactor::create)\s*\(\s*(?:Kind:\s*)?['"]([^'"]+)['"]/):
            Kind := Match.group(1)
            if not AllowedFactors.includes(Kind):
                Violations.push({File, Line, code: "factor-not-in-registry",
                                 reason: `factor Kind="${Kind}" not in FactorRegistry::ALLOWED ${JSON.stringify(AllowedFactors)}`})
        # Also flag dynamic kinds — cannot prove safety
        for each (Line, _) in scanForPattern(File, /(?:mfa_factor_create|MfaFactor::create)\s*\(\s*(?:Kind:\s*)?\$/):
            Violations.push({File, Line, code: "factor-dynamic-kind",
                             reason: "mfa_factor_create() with non-literal Kind — gate cannot statically prove registry membership"})

    # === Axis 5 — recovery-code hash strength ===
    for each File in walk(SourceRoot, "wp-plugin/**/*.php"):
        if isTestFixture(File, TestFixtures): continue
        for each (Line, Match) in scanForPattern(File, /password_hash\s*\(\s*\$(code|recoveryCode|recovery_code)\s*,\s*([A-Z_a-z0-9]+)/):
            Var  := Match.group(1)
            Algo := Match.group(2)
            if Algo != "PASSWORD_ARGON2ID":
                Violations.push({File, Line, code: "recovery-hash-weak-algo",
                                 reason: `password_hash($${Var}, ${Algo}) — recovery codes MUST use PASSWORD_ARGON2ID (see §3)`})
        # Also flag md5/sha1 over recovery-code variables
        for each (Line, Match) in scanForPattern(File, /(?:md5|sha1|hash\s*\(\s*['"](?:md5|sha1)['"]\s*,)\s*\$(code|recoveryCode|recovery_code)/):
            Violations.push({File, Line, code: "recovery-hash-broken-algo",
                             reason: `md5/sha1 of recovery-code variable — forbidden`})

    # === Aggregate axis 1 violations ===
    for each F in Forbidden:
        Violations.push({File: F.File, Line: F.Line, code: "mfa-forbidden-literal",
                         reason: `${F.Literal} — forbidden by §1 + §8 (no SMS/email-OTP/voice factors, no remember-MFA cookies, no MFA_DISABLED env, no bypass_mfa query)`})

    for each V in Violations:
        print(`❌ G-26: ${V.File}:${V.Line} ${V.code} — ${V.reason}`)
    if Violations.length > 0:
        print(`❌ G-26: ${Violations.length} violation(s) across 5 axes`)
        return 1
    print(`✅ G-26: 0 forbidden literals · ${Mutations.length} mutation route(s) freshness-checked · stepup-map ${SpecMap.size}/${SpecMap.size} parity · ${FactorCalls.length} factor call(s) registry-bound · ${HashCalls.length} recovery-hash call(s) argon2id`)
    return 0
```

### Parser Helpers

| Helper | Strategy |
|--------|----------|
| `scanRoutes` | Locate `register_rest_route(<ns>, <route>, [...])` blocks; extract `methods` array (string-split `'POST,PUT,DELETE'` or array form), capture the inline closure body up to its matching `}` brace. Light-touch line-balanced brace counter, no AST. |
| `parseMarkdownTable` | Locate the H2 heading exactly matching `## 6 — Sensitive-Endpoint Step-Up Map`; consume the next markdown table; produce a Map of `pattern → seconds-string` (preserve `5 min` / `1 h` / `12 h` / `∞`). |
| `parsePhpAssocArray` | Locate `const MAX_AGE_SECONDS = [` (or `public const`); consume up to matching `];`; parse `'pattern' => <int>,` rows. `PHP_INT_MAX` normalises to `∞`. |
| `normalizeSeconds` | Convert `5 min` → 300, `1 h` → 3600, `12 h` → 43200, `∞` → `Infinity`, `PHP_INT_MAX` → `Infinity`, bare integers stay numeric. |
| `scanForPattern` | Line-by-line regex scan; no AST parse — keeps G-26 hermetic. |
| `isTestFixture` | Filename ends with `.test.{ts,tsx,php}` OR path contains `/tests/fixtures/`. |

---

## Test-Fixture Allow-List

| Pattern | Why excluded |
|---------|--------------|
| `*.test.{ts,tsx,php}` | Unit tests may stub `'sms'` or `'email_otp'` to verify rejection paths. |
| `tests/fixtures/**` | Fixture data may include forbidden literals as negative-test inputs. |

Axes 2 (route freshness) and 3 (map parity) do NOT exempt test files because routes and runtime constants have no test-fixture equivalent.

---

## Rules

1. **Hermetic** — reads only files inside the repo; never network, never `git`, never spawns.
2. **Single source of truth** — `12-mfa-policy.md` §1, §6, §8, §9 is the policy ledger; this script is the algorithm.
3. **Five-axis coverage** — all five checks run on every invocation; one axis cannot mask another. Aggregate exit code is `1` if any axis fires.
4. **Spec-first parity (axis 3)** — when spec and runtime disagree, the gate fails open: it reports both directions (spec-missing-from-runtime AND runtime-missing-from-spec) so reviewers see the full diff.
5. **Dynamic factor kinds rejected (axis 4)** — `mfa_factor_create($userInput)` is forbidden because the gate cannot statically prove `$userInput` ∈ `ALLOWED`. Callers must use literal strings.

---

## Edge Cases

1. **Legitimate use of `'sms'` in unrelated context** — e.g. `phoneFormatter.formatAs('sms')` in a non-auth helper. **Resolution**: rename the variable; G-26 cannot AST-discriminate. The forbidden-literal regex deliberately over-fires; cost of one rename is much lower than risk of accidental SMS-MFA reintroduction. Document a single-line exemption inline if rename is impossible.
2. **Route registered via attribute (`#[Route(methods: 'POST')]`) without `register_rest_route`** — axis 2 misses it. **Resolution**: WP-plugin convention requires `register_rest_route`; attribute-based routing is forbidden by `02-ci-quality-gates.md` AT-CIGATE-08 (single entry point). If a future attribute syntax is adopted, extend `scanRoutes` accordingly.
3. **Step-up map row added to spec but with prose-only seconds** (e.g. `5 minutes`) — `normalizeSeconds` recognises only the canonical forms `5 min`, `1 h`, `12 h`, `∞`. **Resolution**: the spec MUST use those canonical forms; a follow-up spec hygiene check (G-23 sibling) could enforce this.
4. **`Mfa::requireFreshness(0)`** — declares zero-second freshness, effectively requires fresh MFA on every call. Technically passes axis 2 but is operationally hostile. **Resolution**: not gate-enforced; reviewer responsibility.
5. **Recovery-code hashing inside a generic helper** (`hashSecret($code, $algo)` where `$algo` is a parameter) — axis 5 misses because the literal `password_hash` doesn't appear at the call site. **Resolution**: helper itself must call `password_hash($_, PASSWORD_ARGON2ID, …)` literally, which axis 5 then catches; the wrapper pattern is acceptable as long as the leaf call is literal.
6. **Spec table with a row commented out** — `<!-- | /old | 5 min | -->` is ignored by `parseMarkdownTable` (only fenced table rows count).
7. **Runtime map key with PHP variable** (`KEY_PREFIX . '/account/password' => 300`) — `parsePhpAssocArray` cannot evaluate the concat. **Resolution**: use literal keys only in `MAX_AGE_SECONDS`; document this as an inline comment requirement.
8. **`MfaFactor::create(['kind' => 'TOTP'])`** — array-form arg; current regex captures position-1 only. **Resolution**: extend regex to also match `['kind'\s*=>\s*['"]([^'"]+)['"]` or document that the call must use `Kind:` named-argument or position-1 literal form.
9. **Test fixture file ends with `.spec.ts` instead of `.test.ts`** — not exempt. **Resolution**: project convention is `.test.*`; update naming or add `.spec.*` to allow-list with justification.

---

## Acceptance Tests

| ID | Given | When | Then | testid |
|----|-------|------|------|--------|
| AT-G26-01 | All five axes clean | G-26 runs | Exits 0 with full reconciliation summary | `g26-clean` |
| AT-G26-02 | New `'sms'` literal appears in `wp-plugin/Auth/SignIn.php` | G-26 runs | Exits 1 with "mfa-forbidden-literal" violation | `g26-detect-sms` |
| AT-G26-03 | Cookie name `'remember_mfa_30d'` introduced in `src/auth/MfaModal.tsx` | G-26 runs | Exits 1 with "mfa-forbidden-literal" violation | `g26-detect-remember-cookie` |
| AT-G26-04 | Env var `MFA_DISABLED=true` referenced in code | G-26 runs | Exits 1 with "mfa-forbidden-literal" violation | `g26-detect-env-bypass` |
| AT-G26-05 | New `POST /workspace/seed` route lacks `Mfa::requireFreshness` and `Mfa::skipForRead` | G-26 runs | Exits 1 with "mutation-route-freshness-missing" violation | `g26-detect-orphan-mutation` |
| AT-G26-06 | `POST /workspace/seed` route calls `Mfa::requireFreshness(43200)` | G-26 runs | Clean exit | `g26-mutation-paired-ok` |
| AT-G26-07 | Spec §6 has 13 rows, runtime `MAX_AGE_SECONDS` has 12 | G-26 runs | Exits 1 with "stepup-map-size-mismatch" + "stepup-map-missing-runtime" violations | `g26-detect-map-size` |
| AT-G26-08 | Spec says `/account/password = 5 min`, runtime says `300`, parity holds | G-26 runs | Clean exit (normalised) | `g26-map-normalised-ok` |
| AT-G26-09 | Spec says `5 min`, runtime says `600` | G-26 runs | Exits 1 with "stepup-map-value-mismatch" violation | `g26-detect-map-value-drift` |
| AT-G26-10 | `mfa_factor_create('SMS')` in production code | G-26 runs | Exits 1 with "factor-not-in-registry" violation | `g26-detect-bad-factor-kind` |
| AT-G26-11 | `MfaFactor::create(Kind: $userInput)` | G-26 runs | Exits 1 with "factor-dynamic-kind" violation | `g26-detect-dynamic-factor` |
| AT-G26-12 | `password_hash($code, PASSWORD_DEFAULT)` for recovery code | G-26 runs | Exits 1 with "recovery-hash-weak-algo" violation | `g26-detect-weak-recovery-hash` |
| AT-G26-13 | `md5($recoveryCode)` anywhere | G-26 runs | Exits 1 with "recovery-hash-broken-algo" violation | `g26-detect-md5-recovery` |
| AT-G26-14 | Test file `*.test.php` contains `'sms'` literal as rejection-test fixture | G-26 runs | Ignored; clean exit | `g26-test-fixture-allowed` |
| AT-G26-15 | Runtime map has `/extra/route` not in spec §6 | G-26 runs | Exits 1 with "stepup-map-missing-spec" violation | `g26-detect-runtime-orphan` |
| AT-G26-16 | G-26 reads only repo files | Process is observed | No network, no git, no spawn | `g26-hermetic` |

---

## Component Contract

> **Aspirational paths** — implementation gated behind SPEC-ONLY-mode exit.

| Concern | Path | Function |
|---------|------|----------|
| Gate script | `scripts/spec-hygiene/26-check-mfa-policy-coverage.mjs` | `default export async function run(): Promise<number>` |
| Forbidden-literal patterns | inline in `26-check-mfa-policy-coverage.mjs` | Per the table above |
| Allowed-factor whitelist | inline | `['TOTP', 'WebAuthn', 'Recovery']` |
| Test-fixture allow-list | inline | `*.test.{ts,tsx,php}` + `tests/fixtures/**` |
| Spec policy file | inline | `spec/31-app/05-conventions/12-mfa-policy.md` |
| Runtime map file | inline | `wp-plugin/Auth/Mfa/StepUpMap.php` |
| Runner registration | `scripts/spec-hygiene/00-run-all.mjs` `checks` array | Append after entry 25 |
| Catalogue update | [`02-ci-quality-gates.md`](./02-ci-quality-gates.md) Gate Catalogue | Promote G-26 from "reserved" to active row in the same commit |
| Sibling: G-25 (token lifecycle) | [`18-g25-token-lifecycle-coverage-gate.md`](./18-g25-token-lifecycle-coverage-gate.md) | Five-axis precedent + statement-level inspection |
| Sibling: G-23 (audit-log coverage) | [`16-g23-audit-log-coverage-gate.md`](./16-g23-audit-log-coverage-gate.md) | Two-axis precedent |
| Sibling: G-24 (role-escalation) | [`17-g24-role-escalation-coverage-gate.md`](./17-g24-role-escalation-coverage-gate.md) | Multi-axis + 30-line window |

### Numbering Correction

The MFA policy (`12-mfa-policy.md` §9) currently states the implementation lives at `scripts/spec-hygiene/16-mfa-policy-coverage-audit.mjs`. That slot is **already occupied** by `16-check-rest-envelope-format.mjs` (gate G-16). This spec corrects the path to `26-check-mfa-policy-coverage.mjs` so the script's numeric prefix matches its gate ID (matching the convention used by G-19→`19-`, G-20→`20-`, G-21→`21-`, G-22→`22-`, G-23→`23-`, G-24→`24-`, G-25→`25-`). A follow-up edit to the policy's §9 reference is required when this spec is committed.

---

## Cross-References

| Topic | Link |
|-------|------|
| Origin: policy §9 G-26 row + 5 enumerated checks | [`12-mfa-policy.md`](./12-mfa-policy.md) §9 |
| Allowed factors (axis 1 + 4 source) | [`12-mfa-policy.md`](./12-mfa-policy.md) §1 |
| Step-up map (axis 3 spec source) | [`12-mfa-policy.md`](./12-mfa-policy.md) §6 |
| Anti-bypass rules (axis 1 source) | [`12-mfa-policy.md`](./12-mfa-policy.md) §8 |
| Recovery storage (axis 5 source) | [`12-mfa-policy.md`](./12-mfa-policy.md) §3 |
| Audit integration | [`12-mfa-policy.md`](./12-mfa-policy.md) §10 → [`09-audit-log-policy.md`](./09-audit-log-policy.md) §2.1 `AUTH.MFA_*` rows |
| Sibling: G-19 workflow drift gate | [04-g19-workflow-contract-gate.md](./04-g19-workflow-contract-gate.md) |
| Sibling: G-20 pre-commit drift gate | [06-g20-precommit-contract-gate.md](./06-g20-precommit-contract-gate.md) |
| Sibling: G-21 gate-discovery audit | [07-g21-gate-discovery-audit.md](./07-g21-gate-discovery-audit.md) |
| Sibling: G-22 error-code catalogue gate | [15-g22-error-code-catalogue-gate.md](./15-g22-error-code-catalogue-gate.md) |
| Sibling: G-23 audit-log coverage gate | [16-g23-audit-log-coverage-gate.md](./16-g23-audit-log-coverage-gate.md) |
| Sibling: G-24 role-escalation gate | [17-g24-role-escalation-coverage-gate.md](./17-g24-role-escalation-coverage-gate.md) |
| Sibling: G-25 token lifecycle gate | [18-g25-token-lifecycle-coverage-gate.md](./18-g25-token-lifecycle-coverage-gate.md) |
| Single entry point rule | [02-ci-quality-gates.md](./02-ci-quality-gates.md) AT-CIGATE-08 |
| Conventions overview | [00-overview.md](./00-overview.md) |
| Coding guidelines | `mem://constraints/coding-guidelines` |

---

## Changelog

| Version | Date | Change |
|---|---|---|
| 1.0.0 | 2026-04-27 | Initial SSOT — algorithm with **five-axis coverage** (forbidden-literal prohibition + mutation-route freshness declaration + step-up-map bidirectional parity + factor-registry static containment + recovery-code argon2id hash strength), 16 acceptance tests (AT-G26-01..16), markdown-table parser, PHP assoc-array parser, normalised seconds comparison, dynamic-Kind rejection, test-fixture exemption (axes 1/4/5 only). Closes the orphan G-26 reference in policy §9. Numbering correction (`16-` → `26-` slot) documented. |
