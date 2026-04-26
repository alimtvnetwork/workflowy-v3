# Active Plans

> **Updated:** 2026-04-26 (UTC+8) · **Status:** 🎉 **A-42 CLOSED — MFA policy done**. Created `spec/31-app/05-conventions/12-mfa-policy.md` v1.0.0: 3 allowed factors (TOTP RFC 6238, WebAuthn FIDO2, 10 recovery codes argon2id-hashed), explicit ban on SMS/email-OTP/voice/push-only/remember-device, mandatory enrollment on first login (Owners must add WebAuthn), 5-tier step-up freshness ladder (5 min for password/email/escalation/MFA-config/export · 1 h for sharing · 12 h for writes · ∞ for reads), TOTP secrets AES-256-GCM under WP_AUTH_KEY-derived HKDF, recovery flow disables (not deletes) factors + revokes RefreshToken family + forces re-enrollment, anti-bypass rules (no MFA_DISABLED env, no bypass_mfa, no remember-device cookies), constant-time TOTP compare with ±1 window (90s) clock skew, WebAuthn signature-counter rollback detection, lockout after 20 failures in 1 h, hygiene gate **G-26** (MFA coverage + factor whitelist), 16 ATs `AT-MFA-01..16`, migration `M-015`, 11 new audit codes for combined v1.2.0 batch (now **30 codes total** across A-40+A-41+A-42). Prior: A-41 (sessions/tokens, G-25), A-40 (escalation, G-24), A-39 (audit-log, G-23). Hygiene 17/18; only **A-01** remains — `src/types/index.ts` `mirror` → `dashboard`, gated by `mem://constraints/spec-only-mode`. **Say `exit spec-only` to apply that fix and start P1.1 Bootstrap.**

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
