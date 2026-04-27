# Active Plans

> **Updated:** 2026-04-27 (UTC+8) · **Status:** 📘 **G-26 ALGORITHM SSOT AUTHORED** — created `spec/31-app/05-conventions/19-g26-mfa-coverage-gate.md` v1.0.0, 5th in the orphan-gate cluster (G-22, G-23, G-24, G-25 done earlier). Five-axis algorithm: (1) forbidden-literal scan for `'sms'`/`'email_otp'`/`'voice'`/`'remember_mfa'`/`MFA_DISABLED`/`bypass_mfa` across `src/` + `wp-plugin/`, (2) every `register_rest_route` with POST/PUT/DELETE methods declares `Mfa::requireFreshness(<sec>)` or `Mfa::skipForRead()` inside its callback, (3) bidirectional parity between policy §6 step-up table and runtime `Auth\Mfa\StepUpMap::MAX_AGE_SECONDS` (size + per-pattern + normalised seconds via `5 min`→300/`1 h`→3600/`12 h`→43200/`∞`→Infinity), (4) every `mfa_factor_create()` / `MfaFactor::create()` passes a literal `Kind` ∈ `['TOTP','WebAuthn','Recovery']` (dynamic kinds rejected — cannot statically prove), (5) every `password_hash($code|$recoveryCode|$recovery_code, …)` uses `PASSWORD_ARGON2ID` (md5/sha1 over recovery vars also caught). 16 acceptance tests (AT-G26-01..16) covering test-fixture exemption (axes 1/4/5 only), normalised-seconds parity, dynamic-Kind rejection, runtime-orphan detection. Caught and corrected another real numbering collision: policy §9 said implementation goes at `scripts/spec-hygiene/16-mfa-policy-coverage-audit.mjs` but slot `16-` is occupied by `check-rest-envelope-format.mjs` (G-16); renamed to `26-` to match gate ID. Updated `12-mfa-policy.md` v1.0.0→v1.0.1, `02-ci-quality-gates.md` (added G-26 row, narrowed reserved range to G-27..G-28), `00-overview.md` TOC + Files + Related, `spec/spec-index.md`. Spec-only constraint preserved. Hygiene 17/18 unchanged; only **A-01** remains gated. **Say `exit spec-only` to apply A-01 and start P1.1 Bootstrap.**

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
