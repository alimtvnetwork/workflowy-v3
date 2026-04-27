# Active Plans

> **Updated:** 2026-04-27 (UTC+8) · **Status:** ✅ **POLISH BLOCK 5 — BACKUP-KEK-ROTATION RUNBOOK AUTHORED.** Created `spec/15-wp-plugin-how-to/23-operator-runbooks/02-backup-key-rotation.md` v1.0.0 as the second sibling under `23-operator-runbooks/`, implementing A-44 §5 Key-rotation (90-day cadence + 2-year overlap retention). 11 ordered steps: (0) read-whole-runbook + WP_AUTH_KEY-vs-backup-KEK distinction, (1) pre-flight with 6 hard checks including DR-drill freshness gate, (2) declare-rotation audit row at `warn` (`SYSTEM.BACKUP_KEY_ROTATE` phase=declared), (3) generate 32-byte CSPRNG key + GPG-wrap + shred raw, (4) **mandatory round-trip canary test before promotion** (forbidden to flip symlink without it), (5) atomic `mv -Tf` symlink flip, (6) two canary snapshots into both regions verified within 15 min (re-checks AT-BACKUP-02 against new KEK), (7) move old KEK to `retired/` with `earliestPurgeAt = now+730d` metadata for cleanup-cron (forbidden: manual destruction), (8) close audit trail with phase=completed, (9) failure-mode + rollback table covering all 6 steps + suspected-compromise P0 path, (10) next-day verification probe, (11) post-mortem template ref. 4 self-tests `AT-RUNBOOK-KEK-01..04`. Cross-refs: A-44 policy SSOT, sibling DR-restore runbook, MFA TOTP-encryption (same KEK strategy, different scope), audit log policy. Updated `00-overview.md` v1.0.0→v1.1.0 to register the new file with severity classification. Hygiene: cleared a transient broken-link by converting an aspirational post-mortem-template reference from inline link to plain code-path reference. **Final hygiene state: 17/18 — only A-01 remains red.** Spec-only constraint preserved. **Next polish queue is now genuinely empty** — every adjacent/polish item I can reach without touching `src/` is closed. Future `next` requires either (a) `exit spec-only` to apply A-01, or (b) a fresh re-audit pass to discover new improvements.

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
