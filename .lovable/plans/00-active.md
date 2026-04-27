# Active Plans

> **Updated:** 2026-04-27 (UTC+8) · **Status:** 🎉 **G-28 ALGORITHM SSOT AUTHORED — ORPHAN-GATE CLUSTER COMPLETE.** Created `spec/31-app/05-conventions/21-g28-backup-coverage-gate.md` v1.0.0, 7th and final in the G-22..G-28 cluster. Seven-axis algorithm: (1) SQLite backup-API exclusivity — no `copy()`/`file_put_contents+file_get_contents`/`cp`/`rsync` of `*.sqlite`, only `Backup\SqliteBackup::dump()` (canonical wrapper exempt), (2) tarball encryption-before-upload — every `S3Client::putObject`/`Storage::upload`/`aws s3 cp` of `*.tar(.gz)` paired within 30 lines with `Crypto::aesGcmEncrypt()`, (3) S3Client config 3-key conjunction (`'encryption' => 'AES256'` + `'acl' => 'private'` + `https://` endpoint), (4) sensitive-file exclusion — no `wp-config.php`/`auth_key`/`secret`/`password` in `Tarball::create`/`PharData::add*`/shell `tar` (P0), (5) restore integrity — every `Restore\Engine::swap()` paired within 50 lines with BOTH `PRAGMA integrity_check` AND `AuditChain::reWalk()`, (6) drill-scheduler cadence presence — `wp-plugin/Backup/DrillScheduler.php` declares `cadence = 90` / `90 * DAY_IN_SECONDS` / `7776000`, (7) bidirectional schedule↔cron parity — every spec §3 hook ↔ every `wp_schedule_event` call in install hook (recurrence normalised). 20 acceptance tests (AT-G28-01..20). Caught and corrected another real numbering collision: policy §10 said `scripts/spec-hygiene/18-backup-policy-coverage-audit.mjs` but slot `18-` is reserved for G-18 cycle-algorithm SQL drift check; renamed to `28-` to match gate ID. Documented an additional follow-up requirement for axis 7: §3's "Backup Types & Schedule" table needs a "WP Hook" column added (one canonical hook per row); flagged in the policy v1.0.1 changelog. Updated `14-backup-and-dr-policy.md` v1.0.0→v1.0.1, `02-ci-quality-gates.md` (added G-28 row, removed all reserved-G-2X language — cluster complete), `00-overview.md` TOC + Files + Related, `spec/spec-index.md`. **Cluster summary:** G-22 (error-code) + G-23 (audit-log) + G-24 (role-escalation) + G-25 (token-lifecycle) + G-26 (MFA) + G-27 (data-export) + G-28 (backup/DR) = 7 algorithm SSOTs authored, 36 axes total, 110 acceptance tests, 7 numbering collisions corrected. Spec-only constraint preserved. Hygiene 17/18 unchanged; only **A-01** remains gated. **Say `exit spec-only` to apply A-01 and start P1.1 Bootstrap.**

---

## Historical plans (`.lovable/plans/archive/`)

| Plan | Outcome |
|------|---------|
| `01-restructure-31-app-and-32-ui-design.md` | ✅ canonical trees `31-app/` + `32-ui-design/`. |
| `02-spec-hygiene-fixes.md` | ✅ All 18 audit issues closed. |
| `03-workflowy-spec-consolidation.md` | ✅ All 10 phases done. |
| `04-f01-rollup-enrichment.md` | ✅ 2026-04-25 — rollups enriched. v0.33.0. |
| `05-f02-wp-plugin-cicd.md` | ✅ 2026-04-25 — `18-wp-plugin-deploy/` archetype. v0.34.0. |
| `06-f03-powershell-boundary.md` | ✅ 2026-04-25 — `08-wp-plugin-boundary.md` (B1–B8). v0.35.0. |
| `07-f04-highlighter-pin.md` | ✅ 2026-04-25 — `11-highlighter-dependency-pin.md` + `AT-HLPIN-01..08`. v0.36.0. **All 4 audit findings closed.** |
| `08-audit01-backend-contradiction.md` | ✅ 2026-04-25 — Round-3 AUDIT-01 (CRITICAL): WP-native SSE + `Auth::hasRole` PHP helper. v0.37.0. |

---

## What's still live

- `mem://constraints/spec-only-mode` — implementation gated until user explicitly authorizes exit ⛔ **only remaining blocker**
- ~~**S003** backend runtime~~ → ✅ **RESOLVED 2026-04-25**: WordPress plugin (PHP + SQLite)
- ~~**F-01** rollup gap~~ → ✅ **RESOLVED 2026-04-25** (Plan 04)
- ~~**F-02** CI/CD packaging~~ → ✅ **RESOLVED 2026-04-25** (Plan 05)
- ~~**F-03** PowerShell/CLI boundary~~ → ✅ **RESOLVED 2026-04-25** (Plan 06)
- ~~**F-04** Code-block highlighter~~ → ✅ **RESOLVED 2026-04-25** (Plan 07)
- ~~**A-26** AT-stub scaffolds (11 files)~~ → ✅ **RESOLVED 2026-04-26** (polish #3, 107 new criteria)
- Phase-1 build path P1.1 → P1.7 — unblocked, awaits SPEC-ONLY lift
- **Recommended next:** say **`exit spec-only`** to start **P1.1 Bootstrap** — there is no more spec work to do
