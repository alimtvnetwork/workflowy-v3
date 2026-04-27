# Active Plans

> **Updated:** 2026-04-27 (UTC+8) · **Status:** 📘 **G-25 ALGORITHM SSOT AUTHORED** — created `spec/31-app/05-conventions/18-g25-token-lifecycle-coverage-gate.md` v1.0.0, 4th in the orphan-gate cluster (G-22, G-23, G-24 done earlier). Five-axis algorithm: (1) no `localStorage`/`sessionStorage`/`IndexedDB` writes with token-shaped keys (regex `/token\|jwt\|refresh\|bearer\|access/i`), (2) every `Auth::issueAccessToken()` paired within 30 lines with `Audit::log('AUTH.LOGIN_SUCCESS'\|'AUTH.TOKEN_REFRESH')`, (3) every `Auth::revokeFamily()` paired within 30 lines with `AUTH.LOGOUT*`/`AUTH.PASSWORD_CHANGE`/`AUTHZ.REFRESH_REUSE`/`ADMIN.USER_DISABLE` audit, (4) refresh route file declares literal `'cookie_path' => '/wp-json/workflowy/v1/auth/refresh'`, (5) every `setcookie('refresh', …)` includes `HttpOnly` + `Secure` + `SameSite=Strict` in the same statement (handles array-form options). 14 acceptance tests (AT-G25-01..14) covering wrapper-file edge case, cookie-deletion flag parity, IndexedDB writes, and test-fixture exemption. Caught and corrected another real numbering collision: policy §10 said implementation goes at `scripts/spec-hygiene/15-token-lifecycle-coverage-audit.mjs` but slot `15-` is occupied by `check-enums-in-sync.mjs` (G-15); renamed to `25-` to match gate ID. Updated `11-session-token-lifecycle.md` v1.0.0→v1.0.1, `02-ci-quality-gates.md` (added G-25 row, narrowed reserved range to G-26..G-28), `00-overview.md` TOC + Files + Related, `spec/spec-index.md`. Spec-only constraint preserved. Hygiene 17/18 unchanged; only **A-01** remains gated. **Say `exit spec-only` to apply A-01 and start P1.1 Bootstrap.**

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
