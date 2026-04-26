# Active Plans

> **Updated:** 2026-04-26 (UTC+8) · **Status:** 🎉 **A-40 CLOSED — role-escalation policy done**. Created `spec/31-app/05-conventions/10-role-escalation-policy.md` v1.0.0: 4 grant classes (L0 self-service / L1 privileged / L2 sensitive / L3 emergency JIT), dual-control rule with same-session and same-actor anti-collusion, break-glass single-actor path (≤1h, ≥20-char reason, fan-out email, `Critical` audit), expiry timers (L1 90d default / L3 4h default, `Auth::hasRole` enforces at request-time even if cron is late), revocation propagation deadlines (DB immediate, in-process cache ≤30s, tokens/SSE/UI ≤60s), 10 new audit action codes for `09-audit-log-policy.md` v1.1.0, hygiene gate **G-24** (role-escalation coverage), 12 acceptance tests `AT-ESCAL-01..12`, Root-DB schema `RoleEscalationRequest` + migration slot `M-014`. Prior: A-39 (audit-log SSOT, G-23), A-37 (error-code SSOT, G-22), A-36 (rate-limiting), A-30..A-35 (CI cluster). Hygiene 17/18; only **A-01** remains — `src/types/index.ts` `mirror` → `dashboard`, gated by `mem://constraints/spec-only-mode`. **Say `exit spec-only` to apply that fix and start P1.1 Bootstrap.**

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
