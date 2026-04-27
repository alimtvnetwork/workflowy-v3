# Active Plans

> **Updated:** 2026-04-27 (UTC+8) · **Status:** ✅ **AT-* STUB POLISH (BLOCK 1) DONE — 2 ROLLUP FILES CURATED.** Polish track started per user direction (one item per `next`). Discovered the "22 stubs" figure was stale (suggestions-tracker shows actual count = 1 after A-26, but `📝 To populate` scan revealed 2 out-of-date scaffold files). Curated both: (1) `spec/31-app/05-conventions/97-acceptance-criteria.md` v0.1.0→v1.0.0 — enumerated all **22 source files** (was 3) with canonical AT prefixes (`AT-AXIOS`/`CIGATE`/`WORKFLOW`/`G19`/`PRECOMMIT`/`G20`/`G21`/`RATELIMIT`/`AUDIT`/`ESCAL`/`TOKEN`/`MFA`/`EXPORT`/`BACKUP`/`G22`/`G23`/`G24`/`G25`/`G26`/`G27`/`G28`/`SKEL`), **199 total criteria** (181 hosted in source files + 15 hosted inline + 3 reified from prose). Reified AT-AXIOS-01..05 from `01-axios-version-control.md` §Acceptance Criteria prose list into testable Given/When/Then rows. Hosted AT-AUDIT-01..15 inline in §3.2 (per `09-audit-log-policy.md` L178 + L339 deferral) covering chain integrity, restore re-walk, PII redaction, 7-year retention, RequestId correlation, i18n parity, actor-snapshot frozen-at-write rule, WAL recovery. (2) `spec/31-app/07-db-diagram/97-acceptance-criteria.md` v0.1.0→v1.0.0 — enumerated all **7 ERD files** with **21 structural criteria** (3 per file) covering master ERD bidirectional parity, Root↔App DB scope discipline (no cross-DB FKs), App-DB Items shape, Mirror self-FK + BrokenAt LWW marker, slice scope narrowness, lifecycle no-dead-state, lifecycle audit pairing, 30-day Trash retention citation, index↔migration symmetry, monotonic migration prefixes, forward-only migration rule. All `📝 To populate` markers retired (only historical refs inside changelog rows remain). Hygiene 18/18: `08-check-acceptance-coverage.mjs` ✅ 0 warnings; full runner unchanged. Spec-only constraint preserved. Only **A-01** remains gated. **Next polish queue:** AT-CONCURRENCY-16..22 for §14.5 SSE contract → AT-WF-* canonicalisation → AT-APP-NN backfill (Today/Templates/Concurrency).

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
