# Active Plans

> **Updated:** 2026-04-27 (UTC+8) · **Status:** 📘 **G-27 ALGORITHM SSOT AUTHORED** — created `spec/31-app/05-conventions/20-g27-export-coverage-gate.md` v1.0.0, 6th in the orphan-gate cluster (G-22..G-26 done earlier; only G-28 left). Six-axis algorithm: (1) every `register_rest_route` whose route starts with `/export/` calls BOTH `Mfa::requireFreshness(300)` AND `RateLimit::bucket('export', …)` inside callback, (2) every `file_put_contents`/`fwrite`/`move_uploaded_file` to `wp-content/workflowy-exports/` is paired within 30 lines with `Crypto::aesGcmEncrypt()`, (3) every serializer under `wp-plugin/Export/Serializers/` calls `Redactor::redactForViewer()` before any echo/return/fwrite of redactable fields (`Owner`/`SharedWith`/`Comments`/`LastEditedBy`/`Mentions`/`Backlinks`/`MirrorOf`/`OwnerEmail`), (4) `FormatRegistry::ALLOWED` writes/array_pushes are contained to canonical `wp-plugin/Export/FormatRegistry.php`, (5) install hook `wp-plugin/Lifecycle/Install.php` contains literal `workflowy-exports` + `.htaccess` + `Deny from all`/`Require all denied` strings (3-substring conjunction), (6) signed-URL shape `/wp-json/workflowy/v1/exports/[a-f0-9]{32,}/download` and `$signed*` variables never appear in `Logger::*`/`error_log`/`var_dump`/`wp_send_json` — Email::send* is the only allowed sink. 16 acceptance tests (AT-G27-01..16) covering wrapper-encryption pattern, getter-vs-array-access serializer caveat, line-local Email-skip, route registration self-reference exemption. Caught and corrected another real numbering collision: policy §10 said implementation goes at `scripts/spec-hygiene/17-export-policy-coverage-audit.mjs` but slot `17-` is reserved for `check-cross-references.mjs` (G-17); renamed to `27-` to match gate ID. Updated `13-data-export-policy.md` v1.0.0→v1.0.1, `02-ci-quality-gates.md` (added G-27 row, narrowed reserved range to G-28 only), `00-overview.md` TOC + Files + Related, `spec/spec-index.md`. Spec-only constraint preserved. Hygiene 17/18 unchanged; only **A-01** remains gated. **Say `exit spec-only` to apply A-01 and start P1.1 Bootstrap.**

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
