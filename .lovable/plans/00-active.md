# Active Plans

> **Updated:** 2026-04-26 (UTC+8) · **Status:** 🎉 **A-44 CLOSED — backup & DR policy done**. Created `spec/31-app/05-conventions/14-backup-and-dr-policy.md` v1.0.0: 5 backup tiers (Audit/Root/App/Files/Config) with RPO 15min→7d / RTO 1h→24h, 6 backup types (WAL-ship 15min · hot-snapshot 1h · daily 30d · weekly 12w · monthly 12m · yearly 7y audit-floor), `\SQLite3::backup()` API mandatory (no `cp`/`copy()`/`rsync` of `*.sqlite` files — that's torn-page corruption), client-side AES-256-GCM with backup-only operator-vault KEK (separate blast radius from `WP_AUTH_KEY`, 90-day rotation, 2-yr key overlap), two-region off-site placement with WORM + versioning + private bucket policy + lifecycle policy, audit-chain re-walk **required** on restore (per A-39 hash chain), **mandatory quarterly restore drill** (>100 days overdue blocks releases via G-28; 2 consecutive failed/missed drills = no production), 12-signal monitoring (WAL lag warn / failures error / daily-missed fatal / restore-initiated fatal / chain-rewind fatal) with pager alerts on `fatal`, hygiene gate **G-28** (forbids file-copy backup, requires AES-GCM, blocks `wp-config.php` upload, enforces integrity-check on restore), 18 ATs `AT-BACKUP-01..18`, 12 new audit codes for v1.2.0 batch (now **52 total** across A-40+A-41+A-42+A-43+A-44). 🏁 **All security/ops SSOT planning complete.** Prior: A-43 (export, G-27), A-42 (MFA, G-26), A-41 (sessions/tokens, G-25), A-40 (escalation, G-24), A-39 (audit-log, G-23). Hygiene 17/18; only **A-01** remains — `src/types/index.ts` `mirror` → `dashboard`, gated by `mem://constraints/spec-only-mode`. **Say `exit spec-only` to apply that fix and start P1.1 Bootstrap.**

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
