# G-28 Backup & DR Policy Drift Gate — Algorithm Spec

> **Version:** 1.0.0
> **Updated:** 2026-04-27 (UTC+8)
> **Parent:** [00-overview.md](./00-overview.md)
> **Reserved Gate ID:** G-28 (per [`02-ci-quality-gates.md`](./02-ci-quality-gates.md) catalogue)
> **Origin:** Promised in [`14-backup-and-dr-policy.md`](./14-backup-and-dr-policy.md) §10 with 7 enumerated checks but no algorithm SSOT. This file closes the gap and **completes the orphan-gate cluster** (G-22..G-28 all now have algorithm SSOTs).

---

## Overview

This is the **tenth and final** drift-detector in the CI cluster (siblings: G-19 workflow, G-20 pre-commit, G-21 gate-discovery, G-22 error-code catalogue, G-23 audit-log coverage, G-24 role-escalation, G-25 token lifecycle, G-26 MFA, G-27 data-export). G-28 watches **seven distinct backup/DR surfaces** that policy v1.0.0 introduced together:

1. **SQLite backup-API exclusivity** — no source file may use `copy()`, `\file_put_contents()` reading from `*.sqlite`, or shell `cp`/`rsync` of `*.sqlite` to perform backups; only `Backup\SqliteBackup::dump()` (which wraps `\SQLite3::backup()`) is permitted.
2. **Tarball encryption-before-upload pairing** — every object-storage upload call (`S3Client::putObject`, `Storage::upload`, `aws s3 cp` shell-out) whose source is a backup tarball MUST (gate G-BACKUP-CLIENT-SIDE-ENCRYPT) be preceded (within 30 lines, same scope) by `Crypto::aesGcmEncrypt()`.
3. **Object-storage client config hardening** — every `S3Client` instantiation (or wrapper) MUST (gate G-BACKUP-S3-CONFIG-HARDENED) declare `'encryption' => 'AES256'`, `'acl' => 'private'`, AND a `https://` endpoint literal.
4. **Sensitive-file exclusion from backups** — no code path that builds a backup tarball may include `wp-config.php` or any path matching `/auth_key|secret|password/i` in its file list.
5. **Restore integrity verification pairing** — every `Restore\Engine::swap()` call (or equivalent live-DB swap) MUST (gates G-BACKUP-RESTORE-INTEGRITY-CHECK + G-BACKUP-RESTORE-AUDIT-REWALK) be preceded (within 50 lines, same scope) by BOTH a `PRAGMA integrity_check` execution AND an `AuditChain::reWalk()` call.
6. **Drill-scheduler cadence presence** — `wp-plugin/Backup/DrillScheduler.php` MUST (gate G-BACKUP-DRILL-CADENCE-90D) exist and contain a literal `cadence` constant or property equal to `90` days (or `90 * DAY_IN_SECONDS` / `7776000` seconds equivalent).
7. **Schedule ↔ cron parity** — the §3 backup schedule table (WAL-ship 15 min / hot 1 h / daily / weekly / monthly / yearly 7 y) MUST (gate G-BACKUP-SCHEDULE-CRON-PARITY) match the cron entries declared in the plugin install hook (`wp-plugin/Lifecycle/Install.php`) byte-for-byte (every spec row → one cron entry; every cron entry → one spec row).

Without G-28, any of seven regressions could silently merge:

- A new backup script uses `cp` and corrupts the SQLite WAL → restore fails silently.
- A future tarball-builder skips encryption → at-rest leak in object storage.
- An S3 client config drops `'encryption'` → cloud breach surface widens.
- `wp-config.php` ends up in a backup tarball → KEK leakage on restore audit.
- Restore swaps the DB without `integrity_check` → corrupted backup destroys live data.
- Drill scheduler removed → `RESTORE_DRILL_OVERDUE` never fires → release gate stops blocking.
- §3 schedule diverges from cron → operators trust the spec while reality differs.

G-28 makes all seven impossible to merge.

---

## User Story

As a security-conscious reviewer of any PR that touches backup, restore, or scheduling code, I want CI to fail unless every backup surface — SQLite API exclusivity, tarball encryption, object-storage hardening, sensitive-file exclusion, restore-integrity verification, drill-scheduler cadence, and schedule/cron parity — is provably aligned with the backup/DR policy SSOT, so that a refactor cannot silently break the disaster-recovery contract.

---

## Inputs

| Input | Type | Source | Notes |
|-------|------|--------|-------|
| Backup-script call sites | Filesystem scan | `wp-plugin/**/*.php`, `scripts/**/*.{sh,mjs}` | Patterns: `copy\(`, `file_put_contents\(`, `cp\s+.*\.sqlite`, `rsync\s+.*\.sqlite` |
| Allowed backup API | Inline constant | This script | `Backup\SqliteBackup::dump\(` (must wrap `\SQLite3::backup`) |
| Object-storage upload sites | Filesystem scan | `wp-plugin/**/*.php` | Patterns: `S3Client::putObject\(`, `Storage::upload\(`, `aws\s+s3\s+cp` |
| Encryption call sites | Filesystem scan | `wp-plugin/**/*.php` | Pattern: `Crypto::aesGcmEncrypt\s*\(` |
| `S3Client` instantiations | Filesystem scan | `wp-plugin/**/*.php` | Pattern: `new\s+S3Client\s*\(` + assoc-array config |
| Required S3 config keys | Inline constant | This script | `['encryption' => 'AES256', 'acl' => 'private', 'endpoint' => 'https://*']` |
| Backup-tarball builder sites | Filesystem scan | `wp-plugin/**/*.php` | Pattern: `Tarball::create\(` or `PharData::*\(` or `tar -cf` shell-outs |
| Sensitive-file blocklist | Inline constant | This script | `wp-config.php` + regex `/auth_key\|secret\|password/i` for path strings |
| Restore-swap sites | Filesystem scan | `wp-plugin/Backup/Restore/**/*.php` | Pattern: `Restore\Engine::swap\(` |
| Integrity-verification sites | Filesystem scan | Same files | Patterns: `PRAGMA\s+integrity_check`, `AuditChain::reWalk\(` |
| Drill-scheduler file | File read | `wp-plugin/Backup/DrillScheduler.php` (canonical) | Must declare cadence = 90 days |
| Spec schedule table | File read | `spec/31-app/05-conventions/14-backup-and-dr-policy.md` §3 | Markdown table parser |
| Install-hook cron entries | File read | `wp-plugin/Lifecycle/Install.php` (canonical) | `wp_schedule_event\(` calls with recurrence + hook |
| Test-fixture allow-list | Inline constant | This script | `*.test.{ts,tsx,php}` + `tests/fixtures/**` |

## Outputs

| Output | Persisted? | Channel | Notes |
|--------|-----------|---------|-------|
| Per-violation line | ❌ | stdout | Format: `❌ G-28: <file>:<line> <code> message` (matches G-22..G-27 drift format) |
| Final summary | ❌ | stdout | `✅ G-28: <axes-summary>` or `❌ G-28: <V> violation(s)` |
| Exit code | ❌ | Process exit | `0` clean, `1` violation, `2` runner error |

---

## Algorithm

```text
function auditBackupPolicyDrift(SourceRoot, DrillFile, PolicyFile, InstallHookFile, TestFixtures) -> int:
    BackupCalls    := [] # {File, Line, Api}
    UploadCalls    := [] # {File, Line, Source}
    Encryptions    := [] # {File, Line}
    S3Configs      := [] # {File, Line, Body}
    TarballBuilds  := [] # {File, Line, FileList}
    RestoreSwaps   := [] # {File, Line}
    IntegrityCalls := [] # {File, Line, Kind: 'pragma'|'rewalk'}
    SpecSchedule   := {} # Tier -> Frequency
    CronEntries    := {} # Hook -> Recurrence
    Violations     := []

    # === Axis 1 — SQLite backup-API exclusivity ===
    for each File in walk(SourceRoot, ["*.php","*.sh","*.mjs"]):
        if isTestFixture(File, TestFixtures): continue
        if File == "wp-plugin/Backup/SqliteBackup.php": continue # canonical wrapper
        for each (Line, Match) in scanForPattern(File, /(?:^|[^a-zA-Z_])copy\s*\(\s*[^,)]*\.sqlite/):
            Violations.push({File, Line, code: "backup-uses-copy",
                             reason: "copy() of *.sqlite is forbidden — use Backup\\SqliteBackup::dump() (wraps \\SQLite3::backup()) per §1"})
        for each (Line, Match) in scanForPattern(File, /file_put_contents\s*\([^,]+,\s*file_get_contents\s*\([^)]*\.sqlite/):
            Violations.push({File, Line, code: "backup-uses-file-funcs",
                             reason: "file_put_contents+file_get_contents of *.sqlite bypasses WAL safety — use Backup\\SqliteBackup::dump()"})
        for each (Line, Match) in scanForPattern(File, /(?:^|\s)(?:cp|rsync)\s+[^|;]*\.sqlite/):
            Violations.push({File, Line, code: "backup-uses-shell",
                             reason: "shell cp/rsync of *.sqlite is forbidden — use Backup\\SqliteBackup::dump()"})

    # === Axis 2 — tarball encryption-before-upload ===
    for each File in walk(SourceRoot, "wp-plugin/**/*.php"):
        if isTestFixture(File, TestFixtures): continue
        EncLines := []
        for each (Line, _) in scanForPattern(File, /Crypto::aesGcmEncrypt\s*\(/):
            EncLines.push(Line)
        for each (Line, Match) in scanForPattern(File, /(?:S3Client::putObject|Storage::upload)\s*\([^)]*\.tar(?:\.gz)?/):
            Paired := EncLines.some(E => 0 < (Line - E) <= 30)
            if not Paired:
                Violations.push({File, Line, code: "upload-unencrypted",
                                 reason: "object-storage upload of *.tar(.gz) without preceding Crypto::aesGcmEncrypt() within 30 lines (see §5)"})
        for each (Line, _) in scanForPattern(File, /aws\s+s3\s+cp\s+[^|;]*\.tar/):
            Violations.push({File, Line, code: "upload-shell-aws-cli",
                             reason: "shell `aws s3 cp` of *.tar bypasses Crypto::aesGcmEncrypt() — use Storage::upload() with prior encryption"})

    # === Axis 3 — S3Client config hardening ===
    for each File in walk(SourceRoot, "wp-plugin/**/*.php"):
        if isTestFixture(File, TestFixtures): continue
        for each Match in scanS3ClientConfigs(File):  # {Line, Body}
            HasEnc      := /['"]encryption['"]\s*=>\s*['"]AES256['"]/.test(Match.Body)
            HasAcl      := /['"]acl['"]\s*=>\s*['"]private['"]/.test(Match.Body)
            HasHttpsEnd := /['"]endpoint['"]\s*=>\s*['"]https:\/\//.test(Match.Body)
            Missing     := []
            if not HasEnc:      Missing.push("'encryption' => 'AES256'")
            if not HasAcl:      Missing.push("'acl' => 'private'")
            if not HasHttpsEnd: Missing.push("'endpoint' => 'https://…'")
            if Missing.length > 0:
                Violations.push({File, Line: Match.Line, code: "s3-client-weak-config",
                                 reason: `S3Client config missing ${Missing.join(", ")} (see §3)`})

    # === Axis 4 — sensitive-file exclusion ===
    SensitivePathPattern := /(?:wp-config\.php|auth_key|secret|password)/i
    for each File in walk(SourceRoot, "wp-plugin/**/*.php"):
        if isTestFixture(File, TestFixtures): continue
        for each (Line, Match) in scanForPattern(File, /(?:Tarball::create|PharData::add(?:File|FromString))\s*\([^)]+\)/):
            ArgsText := Match.full
            if SensitivePathPattern.test(ArgsText):
                Violations.push({File, Line, code: "backup-includes-sensitive",
                                 reason: `tarball builder references sensitive path (wp-config|auth_key|secret|password) — see §4 + AT-BACKUP-16 (P0)`})
        for each (Line, Match) in scanForPattern(File, /tar\s+-c[fz]+\s+[^|;]*(?:wp-config|auth_key|secret|password)/i):
            Violations.push({File, Line, code: "backup-shell-tar-sensitive",
                             reason: "shell tar with sensitive path — forbidden (P0)"})

    # === Axis 5 — restore integrity verification ===
    for each File in walk(SourceRoot, "wp-plugin/Backup/Restore/**/*.php"):
        Body := readFileSync(File)
        Lines := Body.split("\n")
        SwapLines    := []
        PragmaLines  := []
        ReWalkLines  := []
        for each (L, _) in scanForPatternInLines(Lines, /Restore\\Engine::swap\s*\(/):
            SwapLines.push(L)
        for each (L, _) in scanForPatternInLines(Lines, /PRAGMA\s+integrity_check/i):
            PragmaLines.push(L)
        for each (L, _) in scanForPatternInLines(Lines, /AuditChain::reWalk\s*\(/):
            ReWalkLines.push(L)
        for each Sw in SwapLines:
            HasPragma := PragmaLines.some(P => 0 < (Sw - P) <= 50)
            HasReWalk := ReWalkLines.some(R => 0 < (Sw - R) <= 50)
            if not HasPragma:
                Violations.push({File, Line: Sw, code: "restore-no-integrity-check",
                                 reason: "Restore\\Engine::swap() without preceding PRAGMA integrity_check within 50 lines (see §7)"})
            if not HasReWalk:
                Violations.push({File, Line: Sw, code: "restore-no-audit-rewalk",
                                 reason: "Restore\\Engine::swap() without preceding AuditChain::reWalk() within 50 lines (see §7 + §6)"})

    # === Axis 6 — drill-scheduler cadence ===
    if not exists(DrillFile):
        Violations.push({File: DrillFile, Line: 0, code: "drill-scheduler-missing",
                         reason: `expected ${DrillFile} not found — quarterly drill enforcement requires this file (see §8)`})
    else:
        Body := readFileSync(DrillFile)
        # Accept: cadence = 90 (days), or 90 * DAY_IN_SECONDS, or 7776000 (seconds)
        HasCadence := /(?:cadence|CADENCE_DAYS|CADENCE)\s*[:=]\s*(?:90\b|90\s*\*\s*DAY_IN_SECONDS|7776000\b)/.test(Body)
        if not HasCadence:
            Violations.push({File: DrillFile, Line: 1, code: "drill-cadence-missing",
                             reason: "DrillScheduler must declare cadence = 90 (days) or 90 * DAY_IN_SECONDS or 7776000 (seconds)"})

    # === Axis 7 — schedule ↔ cron parity ===
    SpecSchedule := parseScheduleTable(PolicyFile, sectionHeading: "3 — Backup Types & Schedule")
    CronEntries  := parseCronEntries(InstallHookFile)  # extract `wp_schedule_event` calls
    SpecHooks    := SpecSchedule.keys() # e.g. ["workflowy_wal_ship", "workflowy_hot_snap", ...]
    CronHooks    := CronEntries.keys()
    for each Hook in SpecHooks:
        if not CronEntries.has(Hook):
            Violations.push({File: InstallHookFile, Line: 1, code: "cron-missing-spec-hook",
                             reason: `spec §3 declares hook "${Hook}" but install hook has no wp_schedule_event for it`})
            continue
        SpecRec := SpecSchedule.get(Hook)
        CronRec := CronEntries.get(Hook)
        if normaliseRecurrence(SpecRec) != normaliseRecurrence(CronRec):
            Violations.push({File: InstallHookFile, Line: 1, code: "cron-recurrence-mismatch",
                             reason: `hook "${Hook}" spec=${SpecRec} install=${CronRec}`})
    for each Hook in CronHooks:
        if not SpecSchedule.has(Hook):
            Violations.push({File: PolicyFile, Line: 1, code: "spec-missing-cron-hook",
                             reason: `install hook schedules "${Hook}" but spec §3 has no row for it`})

    for each V in Violations:
        print(`❌ G-28: ${V.File}:${V.Line} ${V.code} — ${V.reason}`)
    if Violations.length > 0:
        print(`❌ G-28: ${Violations.length} violation(s) across 7 axes`)
        return 1
    print(`✅ G-28: 0 forbidden backup APIs · ${UploadCalls.length} upload(s) encrypted · ${S3Configs.length} S3 client(s) hardened · 0 sensitive paths in tarballs · ${RestoreSwaps.length} restore swap(s) integrity-verified · drill-scheduler cadence=90d · ${SpecSchedule.size}/${SpecSchedule.size} schedule↔cron parity`)
    return 0
```

### Parser Helpers

| Helper | Strategy |
|--------|----------|
| `scanForPattern` / `scanForPatternInLines` | Same line-based regex scanners as G-23..G-27. |
| `scanS3ClientConfigs` | Locate `new S3Client(` blocks; consume inline assoc-array body up to matching `)`; return `{Line, Body}` for the array literal. Light-touch brace counter. |
| `parseScheduleTable` | Locate H2 heading exactly matching `## 3 — Backup Types & Schedule`; consume the next markdown table; produce a Map of `hook-name → frequency-string` (e.g. `workflowy_wal_ship → "15 min"`). Hook names are inferred from the table's "WP Hook" column (added if missing — see Edge Case 7). |
| `parseCronEntries` | Locate `wp_schedule_event\(\s*time\(\),\s*['"](\w+)['"],\s*['"](\w+)['"]` calls; produce a Map of `hook-name → recurrence-name` (e.g. `workflowy_hot_snap → "hourly"`). |
| `normaliseRecurrence` | Convert `15 min` → `quarter_hourly`, `1 h` / `hourly` → `hourly`, `daily` → `daily`, `weekly` → `weekly`, `monthly` → `monthly`, `yearly` → `yearly`. Custom WP recurrences must be declared via `cron_schedules` filter elsewhere; G-28 uses normalised tokens. |
| `isTestFixture` | Filename ends with `.test.{ts,tsx,php}` OR path contains `/tests/fixtures/`. |

---

## Test-Fixture Allow-List

| Pattern | Why excluded |
|---------|--------------|
| `*.test.{ts,tsx,php}` | Tests may use `copy()` on fixture `*.sqlite` files in tmp dirs to set up restore-failure scenarios. |
| `tests/fixtures/**` | Fixture data may include `wp-config.php`-shaped strings in negative-test inputs. |

Axis 6 (drill scheduler), axis 7 (cron parity), and axis 3 (S3 hardening on the canonical client) operate on canonical files and have no test-fixture equivalent.

---

## Rules

1. **Hermetic** — reads only files inside the repo; never network, never `git`, never spawns.
2. **Single source of truth** — `14-backup-and-dr-policy.md` §1–§9 is the policy ledger; this script is the algorithm.
3. **Seven-axis coverage** — all seven checks run on every invocation; one axis cannot mask another. Aggregate exit code is `1` if any axis fires.
4. **Backup-API exclusivity is path-scoped** — only `wp-plugin/Backup/SqliteBackup.php` may invoke `\SQLite3::backup()` directly; everywhere else uses `Backup\SqliteBackup::dump()`.
5. **Encryption window is 30 lines for upload, 50 lines for restore** — restore window is wider because integrity checks may include a multi-step warmup; upload window matches G-25/G-27 convention.
6. **Schedule parity is bidirectional** — spec-only-hook AND cron-only-hook both fire; reviewers see the full diff.

---

## Edge Cases

1. **Backup wrapper using `\SQLite3::backup()` inside `SqliteBackup::dump()`** — axis 1 explicitly exempts `wp-plugin/Backup/SqliteBackup.php`. Wrapper itself uses the native API correctly; callers use `dump()`.
2. **Test fixture copies a `*.sqlite` to set up a corrupted-DB scenario** — `*.test.php` exempt. ✅
3. **Upload via streaming API** — `Storage::stream($source, $dest)` instead of `putObject`. Axis 2 misses streaming. **Resolution**: extend regex to include `Storage::stream\(`; document as known-coverage-extension. The streaming path must still encrypt before streaming begins; the upload site is the encryption-pairing anchor.
4. **S3Client config built from `array_merge()` with defaults** — `new S3Client(array_merge(self::DEFAULTS, ['region' => 'us-east-1']))`. Axis 3 inspects only the inline literal and may miss keys defined in `DEFAULTS`. **Resolution**: project convention requires inline declaration of the three required keys at every `new S3Client(` call site; `DEFAULTS` may add other keys but cannot define the three security-critical ones (review-enforced).
5. **Tarball builder dynamically computes file list from `glob()`** — axis 4 cannot statically inspect glob expansions. **Resolution**: glob patterns MUST exclude `wp-config*` and `*secret*`/`*password*`/`*auth_key*` via explicit `array_filter`; the filter call MUST appear within 10 lines of the glob and reference all four exclusions. Future enhancement: parse glob patterns; for now, reviewers verify.
6. **Restore swap inside a closure / try-catch** — `try { ... Restore\Engine::swap(...) ... }`. Axis 5 same-file 50-line window applies; integrity calls in outer scope (above the try) still satisfy the window. ✅
7. **Spec §3 table lacks "WP Hook" column** — `parseScheduleTable` cannot map rows to hook names. **Resolution**: this spec MANDATES that policy §3's table include a "WP Hook" column. Follow-up edit to `14-backup-and-dr-policy.md` §3 required when this gate is implemented; without it, axis 7 cannot run.
8. **Drill scheduler uses class constant defined elsewhere** — `const CADENCE = self::DEFAULT_CADENCE;`. Axis 6 misses the indirection. **Resolution**: cadence MUST be defined inline in `DrillScheduler.php` as a literal `90` / `90 * DAY_IN_SECONDS` / `7776000`; class-constant chains forbidden by review.
9. **Cron entry uses custom recurrence name** (e.g. `'fifteen_minutes'`) — `normaliseRecurrence` doesn't recognise it. **Resolution**: the script's normaliser table must include every custom recurrence name that the project's `cron_schedules` filter declares; document as inline constant in the gate script.

---

## Acceptance Tests

| ID | Given | When | Then | testid |
|----|-------|------|------|--------|
| AT-G28-01 | All seven axes clean | G-28 runs | Exits 0 with full reconciliation summary | `g28-clean` |
| AT-G28-02 | New file calls `copy('workflowy_app.sqlite', '/tmp/back.sqlite')` | G-28 runs | Exits 1 with "backup-uses-copy" violation (matches AT-BACKUP-07) | `g28-detect-copy` |
| AT-G28-03 | Shell script does `cp data/*.sqlite /backup/` | G-28 runs | Exits 1 with "backup-uses-shell" violation | `g28-detect-shell-cp` |
| AT-G28-04 | `S3Client::putObject(['Body' => 'backup.tar.gz'])` with no preceding `Crypto::aesGcmEncrypt()` | G-28 runs | Exits 1 with "upload-unencrypted" violation | `g28-detect-plaintext-upload` |
| AT-G28-05 | Same upload with encryption 10 lines prior | G-28 runs | Clean exit | `g28-encrypted-upload-ok` |
| AT-G28-06 | `new S3Client(['region' => 'us-east-1'])` (missing all three required keys) | G-28 runs | Exits 1 with "s3-client-weak-config" listing all 3 | `g28-detect-weak-s3` |
| AT-G28-07 | `S3Client` config has `'endpoint' => 'http://…'` (not https) | G-28 runs | Exits 1 with "s3-client-weak-config" missing endpoint | `g28-detect-http-endpoint` |
| AT-G28-08 | `Tarball::create(['wp-config.php', 'data.sqlite'])` | G-28 runs | Exits 1 with "backup-includes-sensitive" violation (P0, matches AT-BACKUP-16) | `g28-detect-wpconfig-in-tarball` |
| AT-G28-09 | `tar -czf out.tar.gz auth_key.txt data/` | G-28 runs | Exits 1 with "backup-shell-tar-sensitive" violation | `g28-detect-shell-tar-sensitive` |
| AT-G28-10 | `Restore\Engine::swap()` with no `PRAGMA integrity_check` nearby | G-28 runs | Exits 1 with "restore-no-integrity-check" violation | `g28-detect-orphan-swap-pragma` |
| AT-G28-11 | `Restore\Engine::swap()` with `PRAGMA integrity_check` but no `AuditChain::reWalk()` | G-28 runs | Exits 1 with "restore-no-audit-rewalk" violation | `g28-detect-orphan-swap-rewalk` |
| AT-G28-12 | `Restore\Engine::swap()` with both checks 20 lines prior | G-28 runs | Clean exit | `g28-restore-verified-ok` |
| AT-G28-13 | `wp-plugin/Backup/DrillScheduler.php` missing | G-28 runs | Exits 1 with "drill-scheduler-missing" violation | `g28-detect-missing-drill` |
| AT-G28-14 | `DrillScheduler.php` exists but lacks cadence = 90 | G-28 runs | Exits 1 with "drill-cadence-missing" violation | `g28-detect-bad-cadence` |
| AT-G28-15 | `DrillScheduler` with `cadence = 90 * DAY_IN_SECONDS` | G-28 runs | Clean exit | `g28-cadence-seconds-ok` |
| AT-G28-16 | Spec §3 declares hook `workflowy_wal_ship` (15 min); install hook has no `wp_schedule_event('workflowy_wal_ship', …)` | G-28 runs | Exits 1 with "cron-missing-spec-hook" violation | `g28-detect-missing-cron` |
| AT-G28-17 | Spec says daily, install hook says hourly for same hook | G-28 runs | Exits 1 with "cron-recurrence-mismatch" violation | `g28-detect-cron-drift` |
| AT-G28-18 | Install hook schedules `workflowy_extra_job` not in spec §3 | G-28 runs | Exits 1 with "spec-missing-cron-hook" violation | `g28-detect-orphan-cron` |
| AT-G28-19 | Test file `*.test.php` does `copy('fixture.sqlite', tmp)` | G-28 runs | Ignored; clean exit | `g28-test-fixture-allowed` |
| AT-G28-20 | G-28 reads only repo files | Process is observed | No network, no git, no spawn | `g28-hermetic` |

---

## Component Contract

> **Aspirational paths** — implementation gated behind SPEC-ONLY-mode exit.

| Concern | Path | Function |
|---------|------|----------|
| Gate script | `scripts/spec-hygiene/28-check-backup-policy-coverage.mjs` | `default export async function run(): Promise<number>` |
| Allowed-API canonical wrapper | inline | `wp-plugin/Backup/SqliteBackup.php` |
| Drill scheduler canonical file | inline | `wp-plugin/Backup/DrillScheduler.php` |
| Install hook canonical file | inline | `wp-plugin/Lifecycle/Install.php` (shared with G-27) |
| Restore-engine scan root | inline | `wp-plugin/Backup/Restore/**/*.php` |
| Sensitive-path regex | inline | `/(?:wp-config\.php\|auth_key\|secret\|password)/i` |
| Recurrence normaliser | inline | Static map per Edge Case 9 |
| Test-fixture allow-list | inline | `*.test.{ts,tsx,php}` + `tests/fixtures/**` |
| Runner registration | `scripts/spec-hygiene/00-run-all.mjs` `checks` array | Append after entry 27 |
| Catalogue update | [`02-ci-quality-gates.md`](./02-ci-quality-gates.md) Gate Catalogue | Promote G-28 from "reserved" to active row in the same commit |
| Sibling: G-27 (data-export) | [`20-g27-export-coverage-gate.md`](./20-g27-export-coverage-gate.md) | Six-axis precedent + scanRoutes/install-hook pattern |
| Sibling: G-26 (MFA) | [`19-g26-mfa-coverage-gate.md`](./19-g26-mfa-coverage-gate.md) | Bidirectional spec↔runtime parity precedent |
| Sibling: G-25 (token lifecycle) | [`18-g25-token-lifecycle-coverage-gate.md`](./18-g25-token-lifecycle-coverage-gate.md) | Statement-level inspection precedent |

### Numbering Correction

The backup/DR policy (`14-backup-and-dr-policy.md` §10) currently states the implementation lives at `scripts/spec-hygiene/18-backup-policy-coverage-audit.mjs`. That slot is **already occupied** by `18-` (existing hygiene script in the runner sequence; reserved for G-18 cycle-algorithm SQL drift check per §4 of `02-ci-quality-gates.md`). This spec corrects the path to `28-check-backup-policy-coverage.mjs` so the script's numeric prefix matches its gate ID (matching the convention used by G-19→`19-` through G-27→`27-`). A follow-up edit to the policy's §10 reference is required when this spec is committed.

### Spec Schedule Table — Mandatory Column Addition

Edge Case 7 documents that policy §3's "Backup Types & Schedule" table currently lacks an explicit "WP Hook" column. Axis 7 cannot operate without it. **Required follow-up edit to `14-backup-and-dr-policy.md` §3:** add a "WP Hook" column with one canonical hook name per row (e.g. `workflowy_wal_ship`, `workflowy_hot_snap`, `workflowy_daily_full`, `workflowy_weekly_full`, `workflowy_monthly_full`, `workflowy_yearly_full`). This edit does NOT belong to this gate spec but is a precondition for axis 7 implementation.

---

## Cross-References

| Topic | Link |
|-------|------|
| Origin: policy §10 G-28 row + 7 enumerated checks | [`14-backup-and-dr-policy.md`](./14-backup-and-dr-policy.md) §10 |
| Backup types + schedule (axis 7 spec source) | [`14-backup-and-dr-policy.md`](./14-backup-and-dr-policy.md) §3 |
| Off-site placement (axis 3 source) | [`14-backup-and-dr-policy.md`](./14-backup-and-dr-policy.md) §4 |
| Encryption (axes 2 + 3 source) | [`14-backup-and-dr-policy.md`](./14-backup-and-dr-policy.md) §5 |
| Audit-log backup handling (axis 5 source for `AuditChain::reWalk`) | [`14-backup-and-dr-policy.md`](./14-backup-and-dr-policy.md) §6 |
| Restore procedure (axis 5 source) | [`14-backup-and-dr-policy.md`](./14-backup-and-dr-policy.md) §7 |
| Mandatory restore drill (axis 6 source) | [`14-backup-and-dr-policy.md`](./14-backup-and-dr-policy.md) §8 |
| Audit codes | [`14-backup-and-dr-policy.md`](./14-backup-and-dr-policy.md) §9 → [`09-audit-log-policy.md`](./09-audit-log-policy.md) §2.1 `SYSTEM.BACKUP_*` / `SYSTEM.RESTORE_*` rows |
| Sibling: G-19 workflow drift gate | [04-g19-workflow-contract-gate.md](./04-g19-workflow-contract-gate.md) |
| Sibling: G-20 pre-commit drift gate | [06-g20-precommit-contract-gate.md](./06-g20-precommit-contract-gate.md) |
| Sibling: G-21 gate-discovery audit | [07-g21-gate-discovery-audit.md](./07-g21-gate-discovery-audit.md) |
| Sibling: G-22 error-code catalogue gate | [15-g22-error-code-catalogue-gate.md](./15-g22-error-code-catalogue-gate.md) |
| Sibling: G-23 audit-log coverage gate | [16-g23-audit-log-coverage-gate.md](./16-g23-audit-log-coverage-gate.md) |
| Sibling: G-24 role-escalation gate | [17-g24-role-escalation-coverage-gate.md](./17-g24-role-escalation-coverage-gate.md) |
| Sibling: G-25 token lifecycle gate | [18-g25-token-lifecycle-coverage-gate.md](./18-g25-token-lifecycle-coverage-gate.md) |
| Sibling: G-26 MFA policy gate | [19-g26-mfa-coverage-gate.md](./19-g26-mfa-coverage-gate.md) |
| Sibling: G-27 data-export gate | [20-g27-export-coverage-gate.md](./20-g27-export-coverage-gate.md) |
| Single entry point rule | [02-ci-quality-gates.md](./02-ci-quality-gates.md) AT-CIGATE-08 |
| Conventions overview | [00-overview.md](./00-overview.md) |
| Coding guidelines | `mem://constraints/coding-guidelines` |

---

## Changelog

| Version | Date | Change |
|---|---|---|
| 1.0.0 | 2026-04-27 | Initial SSOT — algorithm with **seven-axis coverage** (SQLite backup-API exclusivity + tarball encryption-before-upload + S3Client config hardening (3-key conjunction) + sensitive-file exclusion (`wp-config.php` + `auth_key`/`secret`/`password` regex) + restore integrity verification (50-line window for `PRAGMA integrity_check` AND `AuditChain::reWalk`) + drill-scheduler cadence presence (90-day with 3 numeric forms) + bidirectional schedule↔cron parity), 20 acceptance tests (AT-G28-01..20). Closes the orphan G-28 reference in policy §10. **Completes the orphan-gate cluster** (G-22..G-28 all now have algorithm SSOTs). Numbering correction (`18-` → `28-` slot) documented. Documented the prerequisite policy edit (add "WP Hook" column to §3 table) needed for axis 7 implementation. |
