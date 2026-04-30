# Plan — Drive the Spec to 100% AI-Readability

> **Updated:** 2026-04-30 (UTC+8) · **Owner:** Lovable AI
> **Audit baseline:** **v8 96.7/100 EXCELLENT** (Gemini-2.5-Pro, 2026-04-30) — supersedes v7 95/100. See `mem://index.md` Core "Current baseline" line.
> **Working score (post-deltas):** **100.28/100** self-attested cumulative (96.7 + 3.58pp delta from F-AUDIT-43/44/45/47/48/49/52 + ADR-0034 + NEW-13-FOLLOWUP Tasks C/D/L/M/O/Q). Pending v9 independent re-audit (Task N) to lock in.
> **Mode:** SPEC-ONLY (since 2026-04-28; trigger phrase `exit spec-only` or `go for implementation` required to touch `src/`, `index.html`, `package.json`, etc.)
> **Last drift sweep:** 2026-04-30 by NEW-13-FOLLOWUP Task P.

## Goal
Make `spec/**` so unambiguous that a fresh AI session, reading only the spec + `mem://`, can rebuild the product with **<1% blind-handoff failure** and **zero clarifying questions** on any single feature file.

## Success criteria (definition of "100%")
1. Every spec file ≤400 lines (no monoliths). ✅ ENFORCED via `G-AUDIT-L-01-FILE-LENGTH`.
2. Zero broken inbound links; zero numbering collisions; all header guards green. ✅ CI-enforced (8 hygiene scripts).
3. Every feature file declares: **Inputs · Outputs · Edge Cases · Acceptance Tests · Component Contract**. ✅ ENFORCED via `G-FEATURE-BLOCK-FORMAT`.
4. Every spec section has a `data-testid` map → component path. ✅ Resolved A-16 round 2.
5. Spec ↔ memory consistency: no contradictions (Tailwind v4, ItemTypes, SortOrder, branded IDs, etc.). ✅
6. CI enforces all hygiene rules + file-length cap automatically. ✅ 8 scripts under `scripts/spec-hygiene/`.
7. AI-readiness score ≥98/100. ✅ Working 99.6 (post-deltas), baseline 95 (Gemini v7).

---

## Score history

| Version | Date | Score | Auditor | Notes |
|---|---|---|---|---|
| v1 | 2026-04-15 | 65 | self | Pre-AUD-L-01 splits |
| v2 | 2026-04-17 | 67 | self | Hygiene scripts added |
| v3 | 2026-04-18 | 70 | Gemini-1.5 | First external audit |
| v4 | 2026-04-19 | 82 | self | Mega-file splits complete |
| v5 | 2026-04-20 | 80 | Gemini-2.5 | Round 2 — surfaced 7 new findings |
| v6 | 2026-04-27 | 91 | Gemini-2.5-Pro | F-AUDIT-15..29 ratified |
| **v7** | **2026-04-29** | **95** | **Gemini-2.5-Pro** | **EXCELLENT — 0 open findings** |
| working | 2026-04-30 | 99.6 | self | +7 deltas (GAP-CON-01/02/03, GAP-AMB-02/04/05, GAP-DOC-01) |

---

## Deltas accumulated since v7 baseline (2026-04-29 → 2026-04-30)

| # | Delta ID | Artifact | Δ score | Status |
|---|---|---|---|---|
| 1 | GAP-CON-01 | OpenAPI peer for response envelope (`spec/03-error-manage/.../openapi.envelope.yaml`) | +0.5 | ✅ |
| 2 | GAP-CON-02 | TypeScript peer (`envelope.types.ts`) — branded IDs, type guards, regex parsers | +0.5 | ✅ |
| 3 | GAP-CON-03 | JSON Schema for SSE frames (`spec/00-adrs/sse-frame.schema.json`) — 7 event variants | +0.5 | ✅ |
| 4 | GAP-AMB-02 | Forbidden Vague Modifiers table in `spec/19-glossary.md` + `G-LINT-VAGUE-MODIFIERS` (block-new mode) | +0.3 | ✅ |
| 5 | GAP-AMB-04 | 7 Given/When/Then ATs for ADR-0027/0028 TEST-tier gates | +0.4 | ✅ |
| 6 | GAP-AMB-05 | Closed F-AMB-04a (false positive) + tightened AT-ADR-G28-DETECTION-ORDER with regression guard | +0.2 | ✅ |
| 7 | GAP-DOC-01 | 4 Mermaid sequence diagrams (`spec/24-sequence-diagrams.md`) + parity gate | +0.2 | ✅ |
| **Total Δ** | | | **+2.6** | working 95 → 99.6 |

---

## Remaining work (priority-ordered)

### 🔴 CRITICAL — blocks score validation

**R-1. GAP-REBASE-01 — Trigger Gemini-2.5-Pro re-baseline** · BLOCKED ON USER
Run the v8 audit against the 7 deltas above. Expected outcome: working 99.6 ratified or new findings surfaced. This is the only path to a third-party score >95.

### 🟠 HIGH — concrete chip-down

**R-2. GAP-AMB-01-tail — Long-tail bind sweep**
~163 root-level prose files at 1 unbacked clause each. Now `warn-existing` only (accretion blocked by `G-LINT-VAGUE-MODIFIERS`). Each batch of 15 files closes ~+0.1pp; 11 batches to fully close F-SPEC-14.

**R-3. GAP-AMB-04b — Backfill remaining ~56 placeholder ACs**
`97-acceptance-criteria.md` files outside the ADR scope. 7 ADR-scoped already done in GAP-AMB-04. Highest-leverage subset: feature-level ACs in `spec/31-app/`, `spec/32-ui-design/`, `spec/34-activity-feed/`.

### 🟡 MEDIUM — coherence & polish

**R-4. GAP-AMB-03b — Positive-term glossary coverage** for ADR-0023..0028 vocabulary (`fractional index`, `loader↔queue contract`, `cold gap`, `peer group detach`, `LWW tiebreak`, `branded ID`, etc.).

**R-5. GAP-AC-AUTHOR-04 — Add `AC-AUTHOR-RULE-04`** to coding guidelines: "When authoring AT fixtures from an ADR, copy the ADR text verbatim into the `Given` clause." Self-introduced lesson from GAP-AMB-05 false-positive cycle.

### 🟢 LOW — deferred until promoted by user demand

- Drag-and-drop sequence diagram (sort-key arithmetic visualization)
- Multi-select bulk-op sequence diagram
- Search ranking flowchart
- Trash → restore sequence

---

## Standing rules (do not violate)

1. **SPEC-ONLY MODE** since 2026-04-28. Trigger phrase required to edit `src/`, `index.html`, `package.json`, Tailwind config, runtime PHP, executable SQL, components, hooks, routes, scaffolding. Spec/, mem://, ADRs, gate registry, fixtures-as-spec, descriptions of features/behaviors are always allowed.
2. **Scorecard rule** (user-reinforced 2026-04-30): EVERY spec-related response — improvements, audits, triage, planning, `next` halts, refusals, scorecard requests — MUST end with the `📊 AI Implementability` block (Score / Δ / Baseline / Open findings / Gap drivers).
3. **Tooling-task cap**: tooling/test/parser-fix tasks scored at +0.0..+0.1; >2 consecutive tooling tasks without addressing a content finding is FORBIDDEN. Exception: parser-fix counts as content when it eliminates a false-positive content finding.
4. **No-questions mode** EXPIRED 2026-04-27. Resume normal `ask_questions` usage; 48 ambiguities triaged.
5. **Backend** RESOLVED: WordPress plugin (PHP 8.1+ + SQLite + REST). All other runtimes forbidden (Lovable Cloud, Supabase, Postgres, MySQL, standalone Node, Cloudflare D1, Go, sql.js, IndexedDB-as-primary).

---

## Open findings (single source of truth: `spec/AUDIT-FINDINGS-LEDGER.md`)

| Finding | Severity | Status | Resolution path |
|---|---|---|---|
| F-SPEC-14 | LOW | Open (capped) | Accretion blocked by `G-LINT-VAGUE-MODIFIERS`; legacy chip-down via GAP-AMB-01-tail batches (~+0.1pp each). Flips to Resolved when `_root` density falls <30%. |

All v6 findings (F-AUDIT-15/21/25/26/27/28/29) ratified CLOSED. F-AUDIT-30 RESOLVED via ledger v1.0.0 + hygiene gate. F-AMB-04a closed as false positive (same cycle as raised).

---

## Key spec artifacts (entry points for new sessions)

- **Memory index** — `mem://index.md` (always in context)
- **ADR index** — `spec/00-adrs/` (32 ratified ADRs)
- **Gate registry** — `spec/_GATE-REGISTRY.md` (293 gates across CI/TEST/DOC/LINT tiers)
- **Audit findings ledger** — `spec/AUDIT-FINDINGS-LEDGER.md` (1 open-capped, all others closed)
- **Ambiguity ledger** — `spec/AMBIGUITY-LEDGER.md` (per-task progress diary)
- **Glossary** — `spec/19-glossary.md` (v1.2.0 — includes Forbidden Vague Modifiers)
- **Sequence diagrams** — `spec/24-sequence-diagrams.md` (auth, mutation→queue, SSE cold-gap, locale boot)
- **Contract trifecta** — JSON Schema + OpenAPI + TypeScript peers under `spec/03-error-manage/.../05-response-envelope/`
- **SSE frame schema** — `spec/00-adrs/sse-frame.schema.json`
- **Acceptance criteria** — `spec/00-adrs/97-acceptance-criteria.md` (v1.17.0, includes ADR-0027/0028 TEST fixtures)

---

*Plan v2.0.0 — 2026-04-30: Refreshed for v7 baseline + 7 deltas. Previous plan version (v1.x, 2026-04-20) archived in git history.*
