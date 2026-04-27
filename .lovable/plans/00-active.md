# Active Plans

> **Updated:** 2026-04-27 (UTC+8) · **Status:** 🟢 **AI READINESS AUDIT (ROUND 4) — COMPOSITE 99/100 (was 89 → was 78), CONFIDENCE: HIGH.** v1.2.0 of `spec/18-spec-issues/12-ai-readiness-audit-round-4-2026-04-27.md` closed the remaining 4 spec-side findings (+10 pts): (AUDIT-AI-03) authored `spec/31-app/07-db-diagram/sql/` — 6 executable `.sql` files (`01-root-schema`, `02-app-schema`, `03-app-indexes`, `04-app-triggers`, `05-root-seeds`, `06-app-seeds`) covering 6 Root + 14 App tables, 21 indexes, 3 triggers (auto-touch UpdatedAt + soft-delete/restore cascade), and 22 lookup seed rows; verified end-to-end via Python `sqlite3` install (PRAGMA fk=1, journal=WAL, CHECK constraints enforce, idempotent re-seed, soft-delete cascade verified 2/2 rows, restore cascade 0/2); 8 ATs (`AT-DDL-01..08`); (AUDIT-AI-04) authored `spec/31-app/04-fixtures/` — `generate.py` deterministic seeded generator + `item-tree-217.json` (217 items, 12/12 ItemTypes, depth 5, 8 mirrors, 6 soft-deleted, 91 dues, 34 completed, 1 × 2KB long paragraph; documented why 120 KB is the realistic stress profile, not 1MB); 8 ATs (`AT-FIXTURE-01..08`); (AUDIT-AI-05) authored `spec/31-app/06-endpoints/16-endpoint-at-matrix.md` — full 41-endpoint × 120+ AT cross-reference matrix + 7 universal-envelope/gate ATs that apply to every endpoint; (AUDIT-AI-06) authored `spec/31-app/01-features/00-state-management-architecture.md` — DRAFT-default state strategy: TanStack Query v5 (server cache, 14 query keys mapped to endpoints) + Zustand v4 (6 client stores: ui/editor/undo/offline-queue/auth/realtime), per-zoom-id undo stack, mirror propagation via cache patch + SSE with LWW tiebreak `(UpdatedAt, OwnerUserId ASC)`, full state-ownership map, 3 scenario diagrams, 7 must-not-violate rules, target `src/` layout, 8 ATs (`AT-STATE-01..08`). **1 finding remains (-1 pt to 100/100):** 🟢 AUDIT-AI-07 A-01 enum drift, gated by `mem://constraints/spec-only-mode`. **Recommendation:** say `exit spec-only` to apply A-01 (+1 → 100/100) and start P1.1 Bootstrap.

> **Previous status (archived):** 🟢 89/100 after v1.1.0 closed AUDIT-AI-01 (local WP dev harness) + AUDIT-AI-02 (PHP SSE fixtures), both CRITICAL.

> **Previous status (archived):** ⚠️ **AI READINESS AUDIT (ROUND 4) — COMPOSITE 78/100, CONFIDENCE: LOW.** Ran a brutally-honest AI-driven audit (Gemini 3 Pro via Lovable AI Gateway, structured-output mode, schema-enforced 10 dimensions × 7 findings) against 1,329 spec files + `src/` inventory + 10 verified probes. **Verdict challenges the prior internal `spec/31-app/**` 100/100 verdict** on grounds that "product-spec completeness" was confused with "implementability by a fresh AI session". 7 findings: 🔴 2 CRITICAL — (AUDIT-AI-01) **no local WP dev harness** strategy (zero `@wordpress/env`/express-mock docs in `spec/15-wp-plugin-how-to/`; AI will hallucinate Vite proxies endlessly); (AUDIT-AI-02) **no PHP SSE code fixtures** (zero ```php blocks in `14-concurrency-and-sync.md` or `05-conventions/`; AI will write naive `while(true){echo}` that leaks PHP memory). 🟠 2 HIGH — (AUDIT-AI-03) **no concrete SQLite DDL `.sql` files** (only ERD prose; AI will guess `BOOLEAN` which SQLite lacks); (AUDIT-AI-04) **no complex item-tree JSON fixtures** (only error-envelope fixtures exist; AI cannot test 250-item virtualisation). 🟡 2 MEDIUM — (AUDIT-AI-05) **sparse endpoint↔AT cross-refs** (42 endpoints × 1-7 ATs each vs 498 feature ATs); (AUDIT-AI-06) **no state-orchestration map** (17 feature contracts list aspirational `src/components/*` paths without context-vs-prop strategy). 🟢 1 LOW — (AUDIT-AI-07) A-01 ItemType drift (already known, gated). **Dimension scores:** completeness 85, unambiguity 85, **implementability 60**, **testability 65**, consistency_internal 95, consistency_spec_to_code 90, discoverability 90, **examples_and_fixtures 50**, edge_case_coverage 95, operational_readiness 75. **Path to 100:** 7 ordered actions totalling +22 pts (~30-50h effort) → 100/100 ceiling. Persisted as `spec/18-spec-issues/12-ai-readiness-audit-round-4-2026-04-27.md` v1.0.0; raw JSON at `/mnt/documents/spec-ai-readiness-audit-2026-04-27.json`. Hygiene preserved at 17/18. Spec-only constraint preserved. **Polish queue is no longer empty** — 6 high-impact spec-side gaps (AUDIT-AI-01..06) are addressable in spec-only mode.

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
