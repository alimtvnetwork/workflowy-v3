# G-27 Data-Export Policy Drift Gate — Algorithm Spec

> **Version:** 1.0.0
> **Updated:** 2026-04-27 (UTC+8)
> **Parent:** [00-overview.md](./00-overview.md)
> **Reserved Gate ID:** G-27 (per [`02-ci-quality-gates.md`](./02-ci-quality-gates.md) catalogue)
> **Origin:** Promised in [`13-data-export-policy.md`](./13-data-export-policy.md) §10 with 6 enumerated checks but no algorithm SSOT. This file closes the gap.

---

## Overview

This is the **ninth** drift-detector in the CI cluster (siblings: G-19 workflow, G-20 pre-commit, G-21 gate-discovery, G-22 error-code catalogue, G-23 audit-log coverage, G-24 role-escalation, G-25 token lifecycle, G-26 MFA). G-27 watches **six distinct data-export surfaces** that policy v1.0.0 introduced together:

1. **Export-route hardening** — every `register_rest_route` declaring an `/export/*` path MUST call BOTH `Mfa::requireFreshness(300)` (5-minute MFA) AND `RateLimit::bucket('export', …)` inside its callback.
2. **Encryption-at-rest containment** — every `file_put_contents`, `fwrite`, or `move_uploaded_file` whose destination path matches `wp-content/workflowy-exports/` MUST be preceded (within 30 lines, same scope) by a `Crypto::aesGcmEncrypt()` call.
3. **Redaction precedence** — every JSON/OPML/Markdown/HTML serializer file under `wp-plugin/Export/Serializers/` MUST call `Redactor::redactForViewer($item, $viewerId)` before any `echo`/`return`/`fwrite` of the redactable fields enumerated in §6 (e.g. `$item['Owner']`, `$item['SharedWith']`, `$item['Comments']`).
4. **Format-registry containment** — `Export\FormatRegistry::ALLOWED` mutations may only appear in `wp-plugin/Export/FormatRegistry.php`; no other file may write to that constant or push to that array.
5. **`.htaccess` install-hook presence** — the plugin install/activation hook (canonical: `wp-plugin/Lifecycle/Install.php`) MUST contain a literal write of an `.htaccess` file under `wp-content/workflowy-exports/` containing `Deny from all` or `Require all denied`.
6. **Signed-URL leak prevention** — no `Logger::*()`, `error_log()`, `var_dump`, or non-email REST response body may emit a string matching the signed-download-URL shape (`/wp-json/workflowy/v1/exports/[a-f0-9]{32,}/download`); only `Email::send*()` callers may handle the signed URL.

Without G-27, any of six regressions could silently merge:

- A new export endpoint forgets MFA gating → unauthenticated bulk extraction.
- A future serializer writes plaintext to disk → at-rest leak.
- A new field surfaces in JSON output without redaction → cross-tenant data spill.
- Format registry expands silently to allow `'CSV'` → policy violation.
- Plugin update drops the `.htaccess` write → public directory listing of encrypted blobs (hash crack risk).
- A debug log line prints the signed URL → 7-day download window stolen.

G-27 makes all six impossible to merge.

---

## User Story

As a security-conscious reviewer of any PR that touches export routes, serializers, file writes, or logging, I want CI to fail unless every export surface — auth gating, encryption-at-rest, redaction, format whitelist, public-directory protection, and signed-URL containment — is provably aligned with the data-export policy SSOT, so that a refactor cannot silently widen the data-egress attack surface.

---

## Inputs

| Input | Type | Source | Notes |
|-------|------|--------|-------|
| Export-route declarations | Filesystem scan | `wp-plugin/Routes/**/*.php` | Pattern: `register_rest_route` calls whose route argument matches `/^/export/` |
| MFA + rate-limit calls | Filesystem scan | Same files | `Mfa::requireFreshness(300)` AND `RateLimit::bucket(['"]export['"]` inside callback body |
| Disk-write call sites | Filesystem scan | `wp-plugin/**/*.php` | Patterns: `file_put_contents\(`, `fwrite\(`, `move_uploaded_file\(` |
| Encryption call sites | Filesystem scan | `wp-plugin/**/*.php` | Pattern: `Crypto::aesGcmEncrypt\(` |
| Serializer files | Filesystem scan | `wp-plugin/Export/Serializers/**/*.php` | One file per format (`JsonSerializer.php`, `OpmlSerializer.php`, `MarkdownSerializer.php`, `HtmlSerializer.php`) |
| Redactable-field whitelist | Inline constant | This script | Per §6: `Owner`, `SharedWith`, `Comments`, `LastEditedBy`, `Mentions`, `Backlinks`, `MirrorOf`, `OwnerEmail` |
| Format-registry mutations | Filesystem scan | `wp-plugin/**/*.php` | Pattern: writes to `FormatRegistry::ALLOWED` or `Export\FormatRegistry::ALLOWED[]` |
| Install hook file | File read | `wp-plugin/Lifecycle/Install.php` (canonical) | Must contain `.htaccess` write under `workflowy-exports` |
| Log/response sites | Filesystem scan | `wp-plugin/**/*.php` | Patterns: `Logger::(info\|warn\|error\|debug)`, `error_log\(`, `var_dump\(`, `wp_send_json` (any) |
| Email-send sites | Filesystem scan | Same files | Pattern: `Email::send` (any method) — these are exempt from axis 6 |
| Test-fixture allow-list | Inline constant | This script | `*.test.{ts,tsx,php}` AND `tests/fixtures/**` |

## Outputs

| Output | Persisted? | Channel | Notes |
|--------|-----------|---------|-------|
| Per-violation line | ❌ | stdout | Format: `❌ G-27: <file>:<line> <code> message` (matches G-22..G-26 drift format) |
| Final summary | ❌ | stdout | `✅ G-27: <axes-summary>` or `❌ G-27: <V> violation(s)` |
| Exit code | ❌ | Process exit | `0` clean, `1` violation, `2` runner error |

---

## Algorithm

```text
function auditExportPolicyDrift(SourceRoot, InstallHookFile, RedactableFields, TestFixtures) -> int:
    ExportRoutes  := [] # {File, Line, Route, CallbackBody}
    DiskWrites    := [] # {File, Line, Path}
    Encryptions   := [] # {File, Line}
    Serializers   := [] # {File, Body}
    RegistryWrites:= [] # {File, Line}
    LogSites      := [] # {File, Line, Statement}
    EmailSites    := [] # {File, Line}
    Violations    := []

    # === Axis 1 — export-route hardening ===
    for each File in walk(SourceRoot, "wp-plugin/Routes/**/*.php"):
        for each Match in scanRoutes(File):
            if not Match.Route.startsWith("/export/"): continue
            HasMfa  := /Mfa::requireFreshness\s*\(\s*300\s*\)/.test(Match.CallbackBody)
            HasRate := /RateLimit::bucket\s*\(\s*['"]export['"]/.test(Match.CallbackBody)
            if not HasMfa:
                Violations.push({File, Line: Match.RouteLine, code: "export-route-mfa-missing",
                                 reason: `${Match.Route} must call Mfa::requireFreshness(300) (see §5)`})
            if not HasRate:
                Violations.push({File, Line: Match.RouteLine, code: "export-route-ratelimit-missing",
                                 reason: `${Match.Route} must call RateLimit::bucket('export', …) (see §4)`})

    # === Axis 2 — encryption-at-rest ===
    for each File in walk(SourceRoot, "wp-plugin/**/*.php"):
        if isTestFixture(File, TestFixtures): continue
        EncLines := []
        for each (Line, _) in scanForPattern(File, /Crypto::aesGcmEncrypt\s*\(/):
            EncLines.push(Line)
        for each (Line, Match) in scanForPattern(File, /(?:file_put_contents|fwrite|move_uploaded_file)\s*\(\s*[^,)]*workflowy-exports/):
            Paired := EncLines.some(E => 0 < (Line - E) <= 30)
            if not Paired:
                Violations.push({File, Line, code: "export-disk-write-unencrypted",
                                 reason: "write to wp-content/workflowy-exports/ without preceding Crypto::aesGcmEncrypt() within 30 lines (see §8)"})

    # === Axis 3 — redaction precedence ===
    for each File in walk(SourceRoot, "wp-plugin/Export/Serializers/**/*.php"):
        Body := readFileSync(File)
        Lines := Body.split("\n")
        RedactLines := []
        for each (Line, _) in scanForPatternInLines(Lines, /Redactor::redactForViewer\s*\(/):
            RedactLines.push(Line)
        for each Field in RedactableFields:
            EmitPattern := new RegExp(`(?:echo|return|fwrite\\s*\\([^,]+,)\\s*[^;]*\\$item\\[['"]${Field}['"]\\]`)
            for each (Line, _) in scanForPatternInLines(Lines, EmitPattern):
                Preceded := RedactLines.some(R => R < Line)
                if not Preceded:
                    Violations.push({File, Line, code: "export-redaction-missing",
                                     reason: `serializer emits $item['${Field}'] without prior Redactor::redactForViewer() call (see §6)`})

    # === Axis 4 — format-registry containment ===
    for each File in walk(SourceRoot, "wp-plugin/**/*.php"):
        if isTestFixture(File, TestFixtures): continue
        # Allow the canonical file
        if File == "wp-plugin/Export/FormatRegistry.php": continue
        for each (Line, _) in scanForPattern(File, /(?:Export\\\\)?FormatRegistry::ALLOWED\s*(?:\[\s*\]\s*)?=/):
            Violations.push({File, Line, code: "format-registry-foreign-write",
                             reason: "writes to FormatRegistry::ALLOWED outside wp-plugin/Export/FormatRegistry.php"})
        for each (Line, _) in scanForPattern(File, /array_push\s*\(\s*(?:Export\\\\)?FormatRegistry::ALLOWED/):
            Violations.push({File, Line, code: "format-registry-foreign-push",
                             reason: "array_push into FormatRegistry::ALLOWED outside the canonical file"})

    # === Axis 5 — .htaccess install-hook presence ===
    if not exists(InstallHookFile):
        Violations.push({File: InstallHookFile, Line: 0, code: "install-hook-missing",
                         reason: `expected install hook ${InstallHookFile} not found`})
    else:
        Body := readFileSync(InstallHookFile)
        # Must reference workflowy-exports AND .htaccess AND a deny directive
        HasPath  := Body.includes("workflowy-exports")
        HasFile  := /\.htaccess/.test(Body)
        HasDeny  := /(Deny\s+from\s+all|Require\s+all\s+denied)/i.test(Body)
        if not (HasPath and HasFile and HasDeny):
            Violations.push({File: InstallHookFile, Line: 1, code: "htaccess-install-missing",
                             reason: "install hook must write .htaccess under workflowy-exports/ with 'Deny from all' or 'Require all denied' (see §8)"})

    # === Axis 6 — signed-URL leak prevention ===
    SignedUrlPattern := /\/wp-json\/workflowy\/v1\/exports\/[a-f0-9]{32,}\/download/
    SignedVarPattern := /\$signed(?:Url|DownloadUrl|_url)/  # heuristic for variable names carrying signed URL
    for each File in walk(SourceRoot, "wp-plugin/**/*.php"):
        if isTestFixture(File, TestFixtures): continue
        for each (Line, Text) in eachLine(File):
            # Skip lines inside Email::send* call statements
            if /Email::send/.test(Text): continue
            if SignedUrlPattern.test(Text):
                # Allow the route registration itself (the route IS this URL)
                if /register_rest_route/.test(Text): continue
                if /Logger::|error_log\s*\(|var_dump\s*\(|wp_send_json/.test(Text):
                    Violations.push({File, Line, code: "signed-url-leak-literal",
                                     reason: "signed export download URL appears in log/response statement (see §7) — only Email::send* may handle it"})
            if SignedVarPattern.test(Text):
                if /(?:Logger::|error_log\s*\(|var_dump\s*\(|wp_send_json)[^;]*\$signed/.test(Text):
                    Violations.push({File, Line, code: "signed-url-leak-variable",
                                     reason: "signed-URL variable passed to log/response sink — only Email::send* may consume it"})

    for each V in Violations:
        print(`❌ G-27: ${V.File}:${V.Line} ${V.code} — ${V.reason}`)
    if Violations.length > 0:
        print(`❌ G-27: ${Violations.length} violation(s) across 6 axes`)
        return 1
    print(`✅ G-27: ${ExportRoutes.length} export route(s) hardened · ${DiskWrites.length} disk write(s) encrypted · ${Serializers.length} serializer(s) redaction-checked · format registry contained · .htaccess install-hook present · 0 signed-URL leaks`)
    return 0
```

### Parser Helpers

| Helper | Strategy |
|--------|----------|
| `scanRoutes` | Same as G-26 — locate `register_rest_route(<ns>, <route>, [...])` blocks; extract route literal and inline closure body via line-balanced brace counter. |
| `scanForPatternInLines` | Same as `scanForPattern` but operates on a pre-split line array (used by axis 3 to share `Lines` between redact-call detection and field-emit detection). |
| `eachLine` | Yields `(Line, Text)` tuples for each line of a file. |
| `isTestFixture` | Filename ends with `.test.{ts,tsx,php}` OR path contains `/tests/fixtures/`. |

---

## Test-Fixture Allow-List

| Pattern | Why excluded |
|---------|--------------|
| `*.test.{ts,tsx,php}` | Tests may stub `file_put_contents` to verify rejection paths and may print signed URLs into test assertion output. |
| `tests/fixtures/**` | Fixture data may contain signed-URL-shaped strings as negative-test inputs. |

Axis 1 (route hardening) does NOT exempt test files because routes are production-only artefacts. Axis 5 (install hook) operates on a single canonical file and has no test-fixture equivalent.

---

## Rules

1. **Hermetic** — reads only files inside the repo; never network, never `git`, never spawns.
2. **Single source of truth** — `13-data-export-policy.md` §4–§9 is the policy ledger; this script is the algorithm.
3. **Six-axis coverage** — all six checks run on every invocation; one axis cannot mask another. Aggregate exit code is `1` if any axis fires.
4. **Encryption window is same-scope, 30 lines** — matches G-23/G-25 audit-pairing convention; cross-function encryption helpers must inline-encrypt at the leaf write site.
5. **Format registry is a closed set** — additions require editing `Export/FormatRegistry.php` directly, which then triggers G-26-style policy review (CSV/XLSX/PDF/SQL still banned).
6. **Email is the only signed-URL sink** — `Email::send*` calls are the policy-defined egress channel; any other sink (log, response, dump) is a leak by definition.

---

## Edge Cases

1. **Export-route group registration** — `register_rest_route('workflowy/v1', '/export/(?P<scope>\w+)', …)` matches `/^/export/` ✅. Single registration with a regex param is a single route from the gate's perspective.
2. **Disk-write via wrapper** — `Storage::write($path, $data)` where `Storage::write` internally calls `file_put_contents`. Axis 2 misses the wrapper. **Resolution**: the wrapper itself must call `Crypto::aesGcmEncrypt()` before its `file_put_contents` and that internal call IS scanned. Wrapper callers are then implicitly safe.
3. **Serializer emits redacted field via getter** — `echo $item->getOwner()` instead of `$item['Owner']`. Axis 3 regex misses the getter. **Resolution**: serializers MUST use array-access form for redactable fields (matches the `Item` envelope contract); enforce via separate convention.
4. **Format registry uses class constant defined inline** — `FormatRegistry.php` declares `const ALLOWED = ['JSON', 'OPML', 'Markdown', 'HTML', 'ZIP']`; no foreign file can override a class constant in PHP without reflection (which is also banned). Axis 4 catches `=` and `array_push`; reflection-based mutation is undetectable but already against project conventions.
5. **`.htaccess` deny directive in non-canonical install hook** — e.g. user puts the deny in a separate `setup-htaccess.php` file. **Resolution**: the canonical install hook MUST `require_once` or directly contain the deny logic; reviewers verify via the hook's contents.
6. **Signed URL is reconstructed from JobId rather than passed as a string** — e.g. `wp_send_json(['jobId' => $jobId])` and the client builds the URL. The literal URL never appears in the log/response, so axis 6 doesn't fire. This is an acceptable pattern as long as the signed signature itself is delivered only via email.
7. **Logger call inside `Email::send` callback** — e.g. `Email::send($to, $subject, fn() => Logger::info("sending to $to"))`. The `Logger::info` line does NOT match `Email::send` literally. **Resolution**: skip-line check is line-local; this would false-positive only if the closure also includes the signed URL — extremely rare. Document as a known false-positive class with an inline `// g27-allow: email-only logger` exemption.
8. **Test file `*.test.php` deliberately writes plaintext to a tmp directory not under `workflowy-exports/`** — axis 2 only scans for `workflowy-exports` path; tmp paths are ignored. ✅
9. **`Mfa::requireFreshness(60)` instead of 300** — passes "is called" test but violates 5-minute policy. **Resolution**: the regex enforces literal `300`; any other value fires axis 1 violation.

---

## Acceptance Tests

| ID | Given | When | Then | testid |
|----|-------|------|------|--------|
| AT-G27-01 | All six axes clean | G-27 runs | Exits 0 with full reconciliation summary | `g27-clean` |
| AT-G27-02 | New `/export/account` route lacks `Mfa::requireFreshness(300)` | G-27 runs | Exits 1 with "export-route-mfa-missing" violation | `g27-detect-orphan-mfa` |
| AT-G27-03 | New `/export/workspace` route lacks `RateLimit::bucket('export', …)` | G-27 runs | Exits 1 with "export-route-ratelimit-missing" violation | `g27-detect-orphan-ratelimit` |
| AT-G27-04 | `Mfa::requireFreshness(60)` instead of 300 | G-27 runs | Exits 1 with "export-route-mfa-missing" (literal `300` required) | `g27-detect-wrong-freshness` |
| AT-G27-05 | `file_put_contents("/path/to/workflowy-exports/job123.zip", $data)` with no preceding `Crypto::aesGcmEncrypt()` | G-27 runs | Exits 1 with "export-disk-write-unencrypted" violation | `g27-detect-plaintext-write` |
| AT-G27-06 | Same write with `$enc = Crypto::aesGcmEncrypt($data); file_put_contents(…, $enc)` 5 lines apart | G-27 runs | Clean exit | `g27-encrypted-write-ok` |
| AT-G27-07 | `JsonSerializer.php` echoes `$item['Owner']` without prior `Redactor::redactForViewer()` | G-27 runs | Exits 1 with "export-redaction-missing" violation | `g27-detect-unredacted-field` |
| AT-G27-08 | `MarkdownSerializer.php` calls `Redactor::redactForViewer($item, $viewer)` then echoes `$item['SharedWith']` | G-27 runs | Clean exit | `g27-redacted-emit-ok` |
| AT-G27-09 | `Export/CustomLoader.php` adds `FormatRegistry::ALLOWED[] = 'CSV'` | G-27 runs | Exits 1 with "format-registry-foreign-push" violation | `g27-detect-foreign-registry-mutation` |
| AT-G27-10 | Install hook missing entirely | G-27 runs | Exits 1 with "install-hook-missing" violation | `g27-detect-missing-hook` |
| AT-G27-11 | Install hook present but lacks `.htaccess` write | G-27 runs | Exits 1 with "htaccess-install-missing" violation | `g27-detect-missing-htaccess` |
| AT-G27-12 | `Logger::info("download URL: /wp-json/workflowy/v1/exports/abc123…/download")` | G-27 runs | Exits 1 with "signed-url-leak-literal" violation | `g27-detect-url-in-log` |
| AT-G27-13 | `wp_send_json(['url' => $signedDownloadUrl])` | G-27 runs | Exits 1 with "signed-url-leak-variable" violation | `g27-detect-url-in-response` |
| AT-G27-14 | `Email::send($to, $subject, "Click: $signedDownloadUrl")` | G-27 runs | Clean exit (Email is the only allowed sink) | `g27-email-sink-allowed` |
| AT-G27-15 | Test file writes plaintext to `/tmp/test-export.zip` (not under `workflowy-exports/`) | G-27 runs | Clean exit | `g27-tmp-write-allowed` |
| AT-G27-16 | G-27 reads only repo files | Process is observed | No network, no git, no spawn | `g27-hermetic` |

---

## Component Contract

> **Aspirational paths** — implementation gated behind SPEC-ONLY-mode exit.

| Concern | Path | Function |
|---------|------|----------|
| Gate script | `scripts/spec-hygiene/27-check-export-policy-coverage.mjs` | `default export async function run(): Promise<number>` |
| Redactable-field whitelist | inline in `27-check-export-policy-coverage.mjs` | Per §6: `Owner`, `SharedWith`, `Comments`, `LastEditedBy`, `Mentions`, `Backlinks`, `MirrorOf`, `OwnerEmail` |
| Format-registry canonical file | inline | `wp-plugin/Export/FormatRegistry.php` |
| Install-hook canonical file | inline | `wp-plugin/Lifecycle/Install.php` |
| Test-fixture allow-list | inline | `*.test.{ts,tsx,php}` + `tests/fixtures/**` |
| Runner registration | `scripts/spec-hygiene/00-run-all.mjs` `checks` array | Append after entry 26 |
| Catalogue update | [`02-ci-quality-gates.md`](./02-ci-quality-gates.md) Gate Catalogue | Promote G-27 from "reserved" to active row in the same commit |
| Sibling: G-26 (MFA) | [`19-g26-mfa-coverage-gate.md`](./19-g26-mfa-coverage-gate.md) | Five-axis precedent + scanRoutes parser |
| Sibling: G-25 (token lifecycle) | [`18-g25-token-lifecycle-coverage-gate.md`](./18-g25-token-lifecycle-coverage-gate.md) | Statement-level inspection precedent |
| Sibling: G-23 (audit-log coverage) | [`16-g23-audit-log-coverage-gate.md`](./16-g23-audit-log-coverage-gate.md) | 30-line pairing window precedent |

### Numbering Correction

The data-export policy (`13-data-export-policy.md` §10) currently states the implementation lives at `scripts/spec-hygiene/17-export-policy-coverage-audit.mjs`. That slot is **already occupied** by `17-check-cross-references.mjs` (gate G-17 reservation slot). This spec corrects the path to `27-check-export-policy-coverage.mjs` so the script's numeric prefix matches its gate ID (matching the convention used by G-19→`19-` through G-26→`26-`). A follow-up edit to the policy's §10 reference is required when this spec is committed.

---

## Cross-References

| Topic | Link |
|-------|------|
| Origin: policy §10 G-27 row + 6 enumerated checks | [`13-data-export-policy.md`](./13-data-export-policy.md) §10 |
| Throttling (axis 1 source) | [`13-data-export-policy.md`](./13-data-export-policy.md) §4 |
| MFA gating (axis 1 source) | [`13-data-export-policy.md`](./13-data-export-policy.md) §5 |
| Redaction matrix (axis 3 source) | [`13-data-export-policy.md`](./13-data-export-policy.md) §6 |
| Download URL signing (axis 6 source) | [`13-data-export-policy.md`](./13-data-export-policy.md) §7 |
| Encryption at rest (axes 2 + 5 source) | [`13-data-export-policy.md`](./13-data-export-policy.md) §8 |
| Audit integration | [`13-data-export-policy.md`](./13-data-export-policy.md) §11 → [`09-audit-log-policy.md`](./09-audit-log-policy.md) §2.1 `EXPORT.*` rows |
| Sibling: G-19 workflow drift gate | [04-g19-workflow-contract-gate.md](./04-g19-workflow-contract-gate.md) |
| Sibling: G-20 pre-commit drift gate | [06-g20-precommit-contract-gate.md](./06-g20-precommit-contract-gate.md) |
| Sibling: G-21 gate-discovery audit | [07-g21-gate-discovery-audit.md](./07-g21-gate-discovery-audit.md) |
| Sibling: G-22 error-code catalogue gate | [15-g22-error-code-catalogue-gate.md](./15-g22-error-code-catalogue-gate.md) |
| Sibling: G-23 audit-log coverage gate | [16-g23-audit-log-coverage-gate.md](./16-g23-audit-log-coverage-gate.md) |
| Sibling: G-24 role-escalation gate | [17-g24-role-escalation-coverage-gate.md](./17-g24-role-escalation-coverage-gate.md) |
| Sibling: G-25 token lifecycle gate | [18-g25-token-lifecycle-coverage-gate.md](./18-g25-token-lifecycle-coverage-gate.md) |
| Sibling: G-26 MFA policy gate | [19-g26-mfa-coverage-gate.md](./19-g26-mfa-coverage-gate.md) |
| Single entry point rule | [02-ci-quality-gates.md](./02-ci-quality-gates.md) AT-CIGATE-08 |
| Conventions overview | [00-overview.md](./00-overview.md) |
| Coding guidelines | `mem://constraints/coding-guidelines` |

---

## Changelog

| Version | Date | Change |
|---|---|---|
| 1.0.0 | 2026-04-27 | Initial SSOT — algorithm with **six-axis coverage** (export-route MFA + rate-limit hardening + at-rest encryption pairing + serializer redaction precedence + format-registry containment + `.htaccess` install-hook presence + signed-URL leak prevention with Email-only sink), 16 acceptance tests (AT-G27-01..16), 30-line encryption pairing window, line-local Email-skip for axis 6, registry-canonical-file exemption, install-hook 3-substring conjunction (path + filename + deny directive). Closes the orphan G-27 reference in policy §10. Numbering correction (`17-` → `27-` slot) documented. |
