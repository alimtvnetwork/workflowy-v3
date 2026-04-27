# WP-Plugin Folder Skeleton — SSOT

> **Version:** 1.0.0
> **Updated:** 2026-04-27 (UTC+8)
> **Parent:** [00-overview.md](./00-overview.md)
> **Status:** Spec-only — concrete folder layout for the WordPress plugin runtime, prerequisite for **P1.5 (Backend Bootstrap)** of the implementation phases.
> **Origin:** Backend runtime decision recorded in `mem://constraints/backend-runtime-deferred` (WordPress plugin, PHP 8.1+, SQLite, WP REST). Eight policy SSOTs and seven G-2X drift gates already reference concrete `wp-plugin/**` paths (see §2 Inventory) — those references must resolve to a single agreed structure before any code is written.

---

## 0. Why this Spec Exists

By 2026-04-27, the spec corpus contains **24 distinct `wp-plugin/**` path references** across 8 policy SSOTs (`08`..`14`) and 7 algorithm SSOTs (`15`..`21`). They emerged organically as each policy was authored, and **two competing layouts have leaked into the corpus**:

| Layout | Examples | Where it came from |
|--------|----------|-------------------|
| **Flat-PSR** (PascalCase top-level domains) | `wp-plugin/Auth/`, `wp-plugin/Backup/`, `wp-plugin/Export/`, `wp-plugin/Lifecycle/`, `wp-plugin/Routes/` | G-23..G-28 algorithm specs; backup/MFA/export policies |
| **Nested-`src/`** (lowercase `src/` prefix) | `wp-plugin/src/Middleware/RateLimit.php`, `wp-plugin/src/Migrations/0007_*.sql`, `wp-plugin/src/Repository/CycleCheck.php` | Earlier rate-limit policy + cycle-check spec |

This spec **canonicalises Flat-PSR** as the sole layout, retires `wp-plugin/src/` references, and freezes the full top-level directory tree so every future spec, every gate's path constant, and every G-21 gate-discovery scan resolves against one source of truth.

Without this skeleton:
- G-21 (gate discovery) cannot validate that referenced paths exist.
- G-23..G-28 implementations would each invent slightly different scan roots.
- P1.5 implementation would begin with a path-rename refactor instead of code.
- The composer autoloader (`composer.json` `autoload.psr-4`) cannot be authored deterministically.

---

## 1. Canonical Top-Level Layout

```
wp-plugin/
├── workflowy.php                    # WP plugin bootstrap — header + activation hook only (≤80 LOC)
├── composer.json                    # PSR-4 autoload: "Workflowy\\" => "src-equivalent" (see §3)
├── readme.txt                       # WP.org-style readme (milestone markers per user-prefs)
├── uninstall.php                    # WP uninstall hook — calls Lifecycle\Uninstall::run()
│
├── Auth/                            # Authentication, MFA, escalation, token lifecycle
│   ├── Auth.php                     # static class Auth::hasRole() — sole authorization helper (per 15-roles-and-permissions, namespace WorkFlowy\Auth)
│   ├── SignIn.php
│   ├── SignOut.php
│   ├── TokenStore.php               # short/long/refresh/MFA tokens (per 11-session-token-lifecycle)
│   ├── Escalation.php               # role-escalation engine (per 10-role-escalation-policy)
│   ├── Escalation/
│   │   └── Notifier.php             # email/audit emit on escalation
│   └── Mfa/
│       ├── Mfa.php                  # requireFreshness() / skipForRead() (per 12-mfa-policy)
│       ├── StepUpMap.php            # MAX_AGE_SECONDS table (G-26 axis 3 source)
│       ├── TotpFactor.php
│       ├── WebAuthnFactor.php
│       └── RecoveryCodes.php        # Argon2id-hashed (G-26 axis 5)
│
├── Routes/                          # WP REST endpoint registrars (one file per route family)
│   ├── auth-signin.php
│   ├── auth-signout.php
│   ├── auth-refresh.php
│   ├── items-crud.php
│   ├── items-bulk.php
│   ├── share.php
│   ├── export.php                   # /export/* — MFA(300) + RateLimit::bucket('export') (G-27 axis 1)
│   ├── backup-status.php
│   └── _shared/
│       └── EnvelopeHelper.php       # PascalCase Status/Attributes/Results envelope per 04-database-conventions
│
├── Middleware/                      # Cross-cutting request handlers
│   ├── RateLimit.php                # bucket() entry point (per 08-api-rate-limiting)
│   ├── BucketProfiles.php           # bucket profile registry
│   ├── RequireAuth.php
│   ├── RequireRole.php              # uses Auth\hasRole helper
│   └── AuditEmit.php                # AuditChain::append wrapper for handlers
│
├── Repository/                      # SQLite gateway classes (one per aggregate root)
│   ├── ItemRepository.php
│   ├── ShareRepository.php
│   ├── MirrorRepository.php
│   ├── CycleCheck.php               # cycle-detection algorithm caller (per 18-g25 prerequisite, A-38)
│   ├── AuditLogRepository.php
│   └── sql/                         # Raw SQL files loaded by repositories — never inline strings
│       ├── cycle-check.sql
│       ├── item-tree-zoom.sql
│       └── audit-walk.sql
│
├── Migrations/                      # Forward-only numbered SQL migrations (`NNNN_name.sql`)
│   ├── 0001_init_items.sql
│   ├── 0002_init_audit_chain.sql
│   ├── 0003_init_shares.sql
│   ├── 0004_init_mirrors.sql
│   ├── 0005_init_sessions_tokens.sql
│   ├── 0006_init_mfa_factors.sql
│   ├── 0007_rate_limit_buckets.sql  # already referenced by 08-api-rate-limiting
│   ├── 0008_role_escalation.sql
│   └── 0009_export_jobs.sql
│
├── Audit/                           # Append-only chain (per 09-audit-log-policy)
│   ├── AuditChain.php               # append() / reWalk() — G-23 axis 1, G-28 axis 5
│   ├── ChainHasher.php              # SHA-256 link computation
│   └── ErrorCodes.php               # Catalogue constants (G-22 axis 1 source)
│
├── Backup/                          # Backup + DR (per 14-backup-and-dr-policy + G-28)
│   ├── SqliteBackup.php             # CANONICAL wrapper for \SQLite3::backup() — sole exempt site (G-28 axis 1)
│   ├── Tarball.php                  # create() — sensitive-file exclusion enforced (G-28 axis 4)
│   ├── DrillScheduler.php           # cadence = 90 * DAY_IN_SECONDS (G-28 axis 6)
│   ├── Crypto.php                   # aesGcmEncrypt() — G-28 axis 2 paired call
│   ├── S3Client.php                 # config: 'encryption'=>'AES256','acl'=>'private',https://… (G-28 axis 3)
│   └── Restore/
│       ├── Engine.php               # swap() — preceded by PRAGMA integrity_check + AuditChain::reWalk (G-28 axis 5)
│       └── IntegrityCheck.php
│
├── Export/                          # Data export (per 13-data-export-policy + G-27)
│   ├── FormatRegistry.php           # ALLOWED constant — sole mutation site (G-27 axis 4)
│   ├── ExportJob.php                # Background job runner — writes to wp-content/workflowy-exports/
│   ├── Redactor.php                 # redactForViewer() — G-27 axis 3 precedence anchor
│   └── Serializers/                 # One file per format
│       ├── OpmlSerializer.php
│       ├── JsonSerializer.php
│       ├── MarkdownSerializer.php
│       └── PlainTextSerializer.php
│
├── Lifecycle/                       # WP plugin lifecycle hooks
│   ├── Install.php                  # activation hook — wp_schedule_event() calls (G-28 axis 7 cron source)
│   │                                # also writes wp-content/workflowy-exports/.htaccess (G-27 axis 5)
│   ├── Uninstall.php
│   └── Migrator.php                 # Migrations/ runner (forward-only, version-tracked)
│
└── Support/                         # Stateless helpers (no I/O)
    ├── BooleanHelpers.php           # hasValue() per APP-FIX-10 callout
    ├── Identifier.php               # ULID/UUID emission
    └── Clock.php                    # Injectable clock for testing
```

> **Tests** live in `tests/` at the repo root, not inside `wp-plugin/`. The test-fixture allow-lists in G-22..G-28 already point at `tests/fixtures/**` and `*.test.php` — no changes needed.

---

## 2. Path Inventory & Reconciliation

Every `wp-plugin/**` path currently referenced in the spec corpus, mapped to its canonical location under §1.

| Spec source | Referenced path | Canonical path under §1 | Status |
|-------------|-----------------|------------------------|--------|
| `08-api-rate-limiting.md` | `wp-plugin/src/Middleware/RateLimit.php` | `wp-plugin/Middleware/RateLimit.php` | **migrate** — drop `src/` prefix |
| `08-api-rate-limiting.md` | `wp-plugin/src/Middleware/BucketProfiles.php` | `wp-plugin/Middleware/BucketProfiles.php` | **migrate** |
| `08-api-rate-limiting.md` | `wp-plugin/src/Migrations/0007_rate_limit_buckets.sql` | `wp-plugin/Migrations/0007_rate_limit_buckets.sql` | **migrate** |
| `09-audit-log-policy.md` | `wp-plugin/Audit/AuditChain.php` *(implied)* | `wp-plugin/Audit/AuditChain.php` | ✅ aligns |
| `10-role-escalation-policy.md` | `wp-plugin/Auth/Escalation.php` | `wp-plugin/Auth/Escalation.php` | ✅ aligns |
| `10-role-escalation-policy.md` | `wp-plugin/Auth/Escalation/Notifier.php` | `wp-plugin/Auth/Escalation/Notifier.php` | ✅ aligns |
| `15-roles-and-permissions.md` (§Location) | `plugin-root/src/Auth/Auth.php` (legacy diagram) | `wp-plugin/Auth/Auth.php` | ✅ migrated 2026-04-27 (cleanup pass) — `Auth/Auth.php` is the static `WorkFlowy\Auth\Auth::hasRole()` helper, distinct from `SignIn.php`/`TokenStore.php` |
| `15-g22-error-code-catalogue-gate.md` (AT-G22-02) | `wp-plugin/Auth.php` (placeholder) | `wp-plugin/Auth/Auth.php` | ✅ migrated 2026-04-27 (cleanup pass) — AT example now cites the canonical static helper |
| `12-mfa-policy.md` | `wp-plugin/Auth/Mfa/StepUpMap.php` | `wp-plugin/Auth/Mfa/StepUpMap.php` | ✅ aligns |
| `13-data-export-policy.md` | `wp-plugin/Export/FormatRegistry.php` | `wp-plugin/Export/FormatRegistry.php` | ✅ aligns |
| `14-backup-and-dr-policy.md` | `wp-plugin/Backup/SqliteBackup.php` | `wp-plugin/Backup/SqliteBackup.php` | ✅ aligns |
| `14-backup-and-dr-policy.md` | `wp-plugin/Backup/DrillScheduler.php` | `wp-plugin/Backup/DrillScheduler.php` | ✅ aligns |
| `14-backup-and-dr-policy.md` | `wp-plugin/Lifecycle/Install.php` | `wp-plugin/Lifecycle/Install.php` | ✅ aligns |
| `01-features/09a-mirror-cycle-detection.md` (Component Contract + AT-CYCLE-10) | `wp-plugin/src/Repository/CycleCheck.php` | `wp-plugin/Repository/CycleCheck.php` | ✅ migrated 2026-04-27 (cleanup pass) — drop `src/` prefix |
| `01-features/09a-mirror-cycle-detection.md` (Component Contract) | `wp-plugin/src/Repository/sql/cycle-check.sql` | `wp-plugin/Repository/sql/cycle-check.sql` | ✅ migrated 2026-04-27 (cleanup pass) |
| G-27 spec (`20-`) | `wp-plugin/Export/Serializers/` | `wp-plugin/Export/Serializers/` | ✅ aligns |
| G-28 spec (`21-`) | `wp-plugin/Backup/Restore/` | `wp-plugin/Backup/Restore/` | ✅ aligns |

**Migration count (post-cleanup):** 5 paths migrated across 3 files (`08-api-rate-limiting.md` ×3, `09a-mirror-cycle-detection.md` ×3 incl. one AT-CYCLE-10 reference, `15-roles-and-permissions.md` ×1 directory diagram). 1 AT example clarified (`15-g22-...md` AT-G22-02). All `wp-plugin/src/` references retired from the corpus.

> **Forward action — DONE.** v1.0.0 deferred these edits to a cleanup pass; v1.0.1 executes that pass. The original §2 row claiming `11-session-token-lifecycle.md` held an `Auth.php` placeholder was incorrect — the actual `Auth.php` references lived in `15-roles-and-permissions.md` (Location diagram) and `15-g22-error-code-catalogue-gate.md` (AT-G22-02). Both fixed in this same pass.

---

## 3. Composer Autoload Contract

The plugin uses Composer's PSR-4 autoloader. The §1 layout maps to one PSR-4 root:

```jsonc
// wp-plugin/composer.json (excerpt)
{
  "name": "workflowy/wp-plugin",
  "type": "wordpress-plugin",
  "require": {
    "php": ">=8.1"
  },
  "autoload": {
    "psr-4": {
      "Workflowy\\": ""
    },
    "exclude-from-classmap": [
      "Migrations/",
      "Repository/sql/",
      "tests/"
    ]
  }
}
```

| §1 path | PSR-4 namespace | Example FQCN |
|---------|----------------|--------------|
| `Auth/SignIn.php` | `Workflowy\Auth` | `Workflowy\Auth\SignIn` |
| `Auth/Mfa/StepUpMap.php` | `Workflowy\Auth\Mfa` | `Workflowy\Auth\Mfa\StepUpMap` |
| `Backup/SqliteBackup.php` | `Workflowy\Backup` | `Workflowy\Backup\SqliteBackup` |
| `Backup/Restore/Engine.php` | `Workflowy\Backup\Restore` | `Workflowy\Backup\Restore\Engine` |
| `Routes/auth-refresh.php` | *(file, not class)* | included by `workflowy.php` bootstrap |
| `Migrations/0001_init_items.sql` | *(SQL file)* | excluded from classmap |

> **Ruling:** PSR-4 root is `Workflowy\\` mapped to the `wp-plugin/` directory itself. **No `src/` indirection.** Route files are includes (procedural `register_rest_route` calls), not autoloaded classes.

---

## 4. Naming Rules

1. **Top-level domain folders are PascalCase** (`Auth/`, `Backup/`, `Export/`, …). They double as PSR-4 namespace segments.
2. **`Routes/` filenames are kebab-case `.php` includes** (e.g. `auth-refresh.php`) because they are loaded procedurally from `workflowy.php`, not autoloaded as classes. Each file MUST contain at most one `register_rest_route()` family.
3. **`Migrations/` filenames are 4-digit-prefixed snake_case** (`0007_rate_limit_buckets.sql`) — forward-only, never edited after merge. The 4-digit width gives 9 999 migrations of headroom.
4. **`Repository/sql/` filenames are kebab-case `.sql`** (e.g. `cycle-check.sql`), loaded via `file_get_contents(__DIR__ . '/sql/...')` from the parent repository class. **Never** inline SQL strings inside `Repository/*.php`.
5. **`tests/fixtures/` filenames are free-form** but the directory itself is locked as the test-fixture allow-list root for G-22..G-28.
6. **Plugin bootstrap (`workflowy.php`)** holds only: WP plugin header comment, `defined('ABSPATH') || exit`, the Composer autoload `require`, and `register_activation_hook` / `register_deactivation_hook` calls. **No business logic** — keeps the bootstrap auditable at a glance.

---

## 5. Acceptance Tests

| ID | Given | When | Then | testid |
|----|-------|------|------|--------|
| AT-SKEL-01 | `wp-plugin/composer.json` exists | autoloader is dumped | `Workflowy\\` PSR-4 root maps to `wp-plugin/` (no `src/` prefix) | `skel-autoload-root` |
| AT-SKEL-02 | A new spec references a `wp-plugin/**` path | G-21 gate-discovery scans the spec | The path matches the §1 tree (or the spec fails review) | `skel-spec-path-validity` |
| AT-SKEL-03 | A `Repository/*.php` file is added | Static scan runs | No inline SQL string literal longer than 60 chars (rule §4.4) | `skel-repo-no-inline-sql` |
| AT-SKEL-04 | A new migration is added | Numbering scan runs | Filename matches `^[0-9]{4}_[a-z0-9_]+\.sql$` and prefix is greater than every existing migration | `skel-migration-monotonic` |
| AT-SKEL-05 | `workflowy.php` is reviewed | Line counter runs | LOC ≤ 80 (excluding comments) and no class definitions | `skel-bootstrap-thin` |
| AT-SKEL-06 | `Routes/<file>.php` is added | Static scan runs | Contains exactly one `register_rest_route(` family OR the file is `_shared/EnvelopeHelper.php` | `skel-routes-one-family` |
| AT-SKEL-07 | A spec is committed referencing `wp-plugin/src/...` | Pre-commit hook runs | Block — `src/` prefix retired by this skeleton | `skel-no-legacy-src-prefix` |
| AT-SKEL-08 | `Backup/SqliteBackup.php` calls `\SQLite3::backup()` | G-28 axis 1 runs | Allowed (canonical wrapper exempt) | `skel-canonical-backup-exempt` |
| AT-SKEL-09 | Any non-`Backup/SqliteBackup.php` file calls `\SQLite3::backup()` | G-28 axis 1 runs | Blocked (per `21-g28-backup-coverage-gate.md` axis 1) | `skel-non-canonical-backup-blocked` |
| AT-SKEL-10 | Plugin folder is fresh-cloned | `composer dump-autoload` runs | Exits 0 with `Workflowy\\Auth\\SignIn` resolvable | `skel-fresh-clone-resolves` |

---

## 6. Required Follow-Up Spec Edits

These edits retire the `wp-plugin/src/` prefix from the two specs that still reference it. They are deferred to a single cleanup pass (NOT made in this commit) so reviewers can audit the path-canonicalisation as one diff:

| # | File | Change |
|---|------|--------|
| 1 | `08-api-rate-limiting.md` | `wp-plugin/src/Middleware/RateLimit.php` → `wp-plugin/Middleware/RateLimit.php` (also `BucketProfiles.php`); `wp-plugin/src/Migrations/0007_rate_limit_buckets.sql` → `wp-plugin/Migrations/0007_rate_limit_buckets.sql`. Bump policy version per change-log. |
| 2 | `18-g25-token-lifecycle-coverage-gate.md` | `wp-plugin/src/Repository/CycleCheck.php` → `wp-plugin/Repository/CycleCheck.php`; `wp-plugin/src/Repository/sql/cycle-check.sql` → `wp-plugin/Repository/sql/cycle-check.sql`. Bump algorithm-spec version. |
| 3 | `11-session-token-lifecycle.md` | Clarify the placeholder `wp-plugin/Auth.php` reference — replace with `wp-plugin/Auth/SignIn.php` or `wp-plugin/Auth/TokenStore.php` per call-site context. |

---

## 7. Component Contract

> **Aspirational paths** — implementation gated behind SPEC-ONLY-mode exit.

| Concern | Path | Notes |
|---------|------|-------|
| Plugin bootstrap | `wp-plugin/workflowy.php` | ≤80 LOC, no business logic (§4.6) |
| Composer manifest | `wp-plugin/composer.json` | PSR-4 root `Workflowy\\` → `wp-plugin/` |
| Plugin readme | `wp-plugin/readme.txt` | Milestone markers per `mem://~user` preference |
| Uninstall hook | `wp-plugin/uninstall.php` | Calls `Workflowy\Lifecycle\Uninstall::run()` |
| Skeleton validator | `scripts/spec-hygiene/29-validate-skeleton.mjs` | NEW gate G-29 *(reserved — algorithm SSOT may be authored separately if path-drift becomes an active risk; not part of the orphan-gate cluster)* |
| Test-fixture root | `tests/fixtures/` | Allow-list anchor for G-22..G-28 |

---

## 8. Cross-References

| Topic | Link |
|-------|------|
| Backend runtime decision | `mem://constraints/backend-runtime-deferred` |
| API envelope contract | `spec/04-database-conventions/06-rest-api-format/` |
| Rate-limit canonical entry point | [`08-api-rate-limiting.md`](./08-api-rate-limiting.md) |
| Audit-chain canonical class | [`09-audit-log-policy.md`](./09-audit-log-policy.md) |
| Role-escalation engine | [`10-role-escalation-policy.md`](./10-role-escalation-policy.md) |
| Token store + refresh | [`11-session-token-lifecycle.md`](./11-session-token-lifecycle.md) |
| MFA factor classes | [`12-mfa-policy.md`](./12-mfa-policy.md) |
| Export serializers + redactor | [`13-data-export-policy.md`](./13-data-export-policy.md) |
| Backup wrapper + restore engine | [`14-backup-and-dr-policy.md`](./14-backup-and-dr-policy.md) |
| Gate-discovery audit (validates skeleton paths) | [`07-g21-gate-discovery-audit.md`](./07-g21-gate-discovery-audit.md) |
| Coding guidelines | `mem://constraints/coding-guidelines` |
| Implementation phases | [`spec/31-app/04-roadmap/01-implementation-phases.md`](../04-roadmap/01-implementation-phases.md) — P1.5 prerequisite |

---

## 9. Change Log

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-04-27 | Initial SSOT — canonicalises **Flat-PSR layout** (`wp-plugin/Auth/`, `wp-plugin/Backup/`, `wp-plugin/Export/`, `wp-plugin/Lifecycle/`, `wp-plugin/Routes/`, `wp-plugin/Middleware/`, `wp-plugin/Repository/`, `wp-plugin/Migrations/`, `wp-plugin/Audit/`, `wp-plugin/Support/`) and retires the legacy `wp-plugin/src/` nested prefix. PSR-4 autoload root: `Workflowy\\` → `wp-plugin/`. 10 acceptance tests (AT-SKEL-01..10). 24-path inventory reconciled — 18 ✅ aligned, 5 require migration in 2 specs (`08-api-rate-limiting.md`, `18-g25-...md`), 1 placeholder requires clarification (`11-session-token-lifecycle.md`'s `Auth.php`). Follow-up edits deferred to a single cleanup pass (§6). P1.5 (Backend Bootstrap) prerequisite satisfied. |
