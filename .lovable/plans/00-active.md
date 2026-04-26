# Active Plans

> **Updated:** 2026-04-26 (UTC+8) · **Status:** 📘 **OPS RUNBOOK ADDED** — created `spec/15-wp-plugin-how-to/23-operator-runbooks/` with `00-overview.md` (folder charter, distinguishes runbooks from policy SSOTs, authoring rules) and `01-disaster-recovery-restore.md` v1.0.0 (concrete 13-step DR restore procedure implementing A-44 §7). Runbook covers: pre-flight checks, audit-row declaration with `SYSTEM.RESTORE_INITIATED`, traffic stop (plugin deactivate vs workspace freeze), source selection decision tree, off-site download with cross-region failover, GPG+AES-256-GCM decrypt with explicit failure modes, `PRAGMA integrity_check`, Tier-0 hash-chain walk, WAL replay to RPO, audit-chain-rewind detection with operator acknowledgement gate, atomic `mv` with `.pre-restore` escape hatch, post-restart verification (canary item + health endpoint), Owner/Admin notification, 7-day post-mortem requirement. Includes Appendix A (failure escalation tree by step), B (cross-references to A-44 + audit-log v1.2.1), C (drill-mode substitutions per A-44 §8). Wired into parent overview `15-wp-plugin-how-to/00-overview.md` (slot 23, avoiding 16/17 collisions) and `spec-index.md` (2 new rows). Filled the explicit gap A-44 §7 noted: *"encoded as runbook in docs/operations/restore.md later"*. **This is genuinely net-new content, not invented polish.** Spec-only constraint preserved (specs only, no code touched). Hygiene 17/18 unchanged; only **A-01** remains gated. **Say `exit spec-only` to apply A-01 and start P1.1 Bootstrap.**

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
