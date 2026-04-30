# AI Onboarding SSOT — Methodological Checklist

> **Version:** 1.0.0
> **Created:** 2026-04-30
> **Status:** Active — MANDATORY pre-flight reading for any AI agent
> **Source:** Synthesizes top 15 historical lessons from `spec/AUDIT-FINDINGS-LEDGER.md`, `spec/AMBIGUITY-LEDGER.md`, ADR-0023..0033, and the F-AUDIT/F-SCOPE finding series.
> **Audited by:** Gemini-2.5-Pro v8 audit (2026-04-30) — closes F-AUDIT-43 (Process Complexity Assumes Advanced AI Cognition).

---

## Purpose

A mediocre AI agent (GPT-3.5-class) cannot synthesize hundreds of historical findings on demand. This file collapses the load-bearing methodological lessons into a flat, prescriptive checklist. **Recite §1 before any spec-touching task. Apply §2–§4 when its trigger condition matches (per the decision tree in §3).**

If you skip this file, you WILL repeat a known-resolved methodological error. The ledgers exist to prove every item below was learned the hard way.

---

## §1 — Mandatory Pre-Flight Checklist (every spec-touching task)

Before editing any file under `spec/`, `mem://`, or `scripts/spec-hygiene/`:

- [ ] **C-01 — Spec-only mode check.** If the user request requires editing `src/`, `index.html`, `package.json`, Tailwind config, runtime PHP, executable SQL, components, hooks, routes, or scaffolding: STOP unless the user has said `exit spec-only` or `go for implementation` in this session. (Memory core; SPEC-ONLY VIOLATION LOG 2026-04-29.)
- [ ] **C-02 — Scorecard rule.** Every spec-related response — including refusals, `next` halts, planning, audits, scorecard requests — MUST end with the **📊 AI Implementability** block (Score / Δ / Baseline / Open findings / Gap drivers). Omitting it is logged as a violation. (SCORECARD VIOLATION LOG 2026-04-30.)
- [ ] **C-03 — Tooling-task cap.** Score deltas for tooling, test-only, or parser-fix tasks are capped at +0.0..+0.1pp. >2 consecutive tooling tasks without addressing a content finding is FORBIDDEN. EXCEPTION: parser-fix counts as content when it eliminates a false-positive content finding. (Memory core.)
- [ ] **C-04 — Strict-filter inventory.** Any "N files contain X" claim MUST exclude `LEDGER`, `AUDIT`, `ai-readiness`, `18-spec-issues/`, `97-acceptance-criteria.md`, and `00-adrs/0*.md` UNLESS the finding explicitly counts those. (F-AUDIT-32 / GAP-INVENTORY-AUDIT.)
- [ ] **C-05 — Cohort-triage first, substitute second.** Before substituting a forbidden vague modifier, check `spec/19-glossary.md` §"Standing cohort exemptions" (10 cohorts as of v1.4.0). If the occurrence matches a cohort, mark exempt; do not substitute. (GAP-AMB-01-tail batches #2–#4.)
- [ ] **C-06 — Gate-namespace pre-flight.** Before introducing a new gate ID `G-<NS>-<NAME>`, grep `spec/_GATE-REGISTRY.md` and `spec/AUDIT-FINDINGS-LEDGER.md` for the `<NS>` prefix to avoid namespace collision. ADR-0033 governs umbrella↔sub-rule composition. (F-SCOPE-41/44/57.)
- [ ] **C-07 — Ledger ownership split.** `spec/AMBIGUITY-LEDGER.md` = **append-only process journal** (per-batch detail). `spec/AUDIT-FINDINGS-LEDGER.md` = **mutable state-of-finding** (current status). Never duplicate state across both. (F-AUDIT-37.)

---

## §2 — Top 15 Historical Lessons (anti-patterns the corpus has already eliminated)

Each lesson cites the originating finding; consult that row in `spec/AUDIT-FINDINGS-LEDGER.md` for the full retraction case study.

| # | Lesson | Anti-pattern (DON'T) | Pattern (DO) | Origin |
|---|---|---|---|---|
| **L-01** | **Counting methodology** | Claim "57 files affected" without specifying the filter | State filter inline: "~95 files matching `\b(appropriate\|reasonable\|...)\b` excluding ledgers/audits/ADRs" | F-SCOPE-* series, F-AUDIT-32 |
| **L-02** | **Parser robustness** | Use literal `## Decision` string match | Use regex `^##\s+(?:\d+\.\s+)?Decision\s*$` to allow numbered ADR templates | Runner-78 fix 2026-04-30, F-AUDIT-33 |
| **L-03** | **Gate IDs are SSOT** | Cite `G-FOO-BAR` in spec without registering it | Register every gate in `_GATE-REGISTRY.md` BEFORE first citation; orphans go through ADR-0033 umbrella resolution | F-AUDIT-45, F-SCOPE-41/44/57 |
| **L-04** | **Vague modifiers** | Write `appropriate`, `fast`, `robust`, `seamless` (backtick-wrapped here as quoted examples) in normative text | Substitute with quantified value, named pattern, or matrix; if cohort-exempt, leave + tag | F-SPEC-14, glossary v1.2.0–v1.4.0 |
| **L-05** | **Cohort exemptions are catalogued** | Re-flag `## Graceful Shutdown` as a vague-modifier violation | Check `spec/19-glossary.md` cohort table (10 patterns); 6 added in batches #3–#4 | GAP-AMB-01-tail batch #4 |
| **L-06** | **Score self-grading bias** | Self-report 100/100 capped without external review | Trigger Gemini-2.5-Pro re-baseline every 10 deltas OR every 7 days | F-AUDIT-35, GAP-REBASE-01 |
| **L-07** | **Inventory drift compounds** | Trust closure claims without re-scan | Add `Inventory-Audit: <date> | filter | Was: X | Is: Y` row on every closure | F-AUDIT-32 |
| **L-08** | **Backlog estimates rot** | Quote yesterday's "~57 files" today | Re-run the strict filter at quote-time; never trust cached counts | F-AUDIT-32, batch #4 correction |
| **L-09** | **Closed findings can reopen** | Mark CLOSED after one batch | A finding stays OPEN-CAPPED until inventory-audit confirms zero | F-AUDIT-30, F-SPEC-14 |
| **L-10** | **Acceptance criteria must cite ADRs verbatim** | Paraphrase ADR text in AT fixtures | Use `<!-- verbatim-from: ADR-NNNN -->` anchor + exact quote (AC-AUTHOR-RULE-04) | GAP-AC-AUTHOR-04 |
| **L-11** | **Glossary↔ADR drift is silent** | Edit ADR `## Decision` without re-baselining glossary | Run `78-check-glossary-adr-parity.mjs`; commit updated `_LEDGER-G-GLOSSARY-ADR-PARITY.json` in the same change | G-GLOSSARY-ADR-PARITY, F-AUDIT-33 |
| **L-12** | **Performance claims need fixtures** | Write "≤16ms p95" in an ADR with no AT | Author `AT-LOADER-PERF-001` with Given/When/Then + measurable threshold | F-AUDIT-38, ADR-0023 |
| **L-13** | **Memory core is load-bearing** | Add a new project rule only to a sub-doc | If the rule applies to EVERY action, add to `mem://index.md` Core (≤150 chars, one-liner) | Memory rules section |
| **L-14** | **Spec-only mode is enforced** | "Quick fix" in `src/` while in spec-only mode | Refuse the request with the trigger-phrase explanation; AUD-02/04/05 are logged violations | SPEC-ONLY VIOLATION LOG |
| **L-15** | **Tooling-only sprints decay score** | Three parser fixes in a row | After 2 tooling tasks, force a content finding next; parser-fix-as-content exception requires false-positive elimination proof | C-03, memory core |

---

## §3 — Decision Trees (when stuck)

### §3.1 — "I found a forbidden vague modifier; do I substitute?"

```
1. Is the term inside backticks?              → SKIP (escape rule)
2. Is the line a paired-example marker        → SKIP (cohort 1)
   (// ✅ GOOD, // ❌ BAD)?
3. Is it a YAML/CI keyword (fail-fast)?       → SKIP (cohort 2)
4. Is it a defined TS pattern name            → SKIP (cohort 3)
   (proper enum / proper type)?
5. Is it a tier-name (capitalized Simple)?    → SKIP (cohort 4)
6. Is it a test-runner mode (short/fast)?     → SKIP (cohort 5)
7. Is it `Modern` (WP admin scheme)?          → SKIP (cohort 6)
8. Is it `modern <API symbol>`                → SKIP (cohort 7)
   (modern navigator.clipboard)?
9. Is it inside parentheses reformulating     → SKIP (cohort 8)
   a concrete value (graceful fallback)?
10. Is it a self-defining compound            → SKIP (cohort 9)
    (self-sufficient, self-contained)?
11. Is it a §-heading whose body defines      → SKIP (cohort 10)
    the contract (## Graceful Shutdown)?
12. Is it inside ## Background / ## Context / → SKIP (cohort 11)
    **Why:** prose?
13. Is it a Keep-a-Changelog subsection name  → SKIP (cohort 12)
    (Added, Fixed, Changed)?
14. Otherwise → SUBSTITUTE per glossary v1.4.0 table.
```

### §3.2 — "I want to add a new gate"

```
1. Grep _GATE-REGISTRY.md for the namespace prefix.
   - If exists → use existing namespace OR follow ADR-0033 sub-rule pattern.
   - If new → proceed.
2. Grep AUDIT-FINDINGS-LEDGER.md for the gate-ID literal.
   - If a finding cites it but it's unregistered → resolve as orphan first.
3. Author the gate row in _GATE-REGISTRY.md FIRST.
4. Then cite it from spec files.
5. Implement the runner under scripts/spec-hygiene/ with sequential number.
6. Add a baseline JSON ledger if the gate is data-driven.
```

### §3.3 — "I want to claim a finding is closed"

```
1. Re-run the strict-filter scan from the finding row.
2. If count > 0 → status remains OPEN-CAPPED, add progress note.
3. If count = 0 → status = CLOSED, add Inventory-Audit row with date+filter+counts.
4. Append closure entry to AMBIGUITY-LEDGER.md.
5. If the finding had a corresponding gate → ensure gate is enforcing-mode (block-all or block-new).
```

---

## §4 — Forbidden Operations (hard stops)

A mediocre AI must REFUSE these even if asked:

- **F-01** — Edit `src/`, `index.html`, `package.json`, Tailwind config, components, hooks, routes, runtime PHP, executable SQL — without `exit spec-only` trigger phrase in the current session.
- **F-02** — Use `localStorage` anywhere (ADR-0021 forbids; IndexedDB is the only client persistence).
- **F-03** — Use `WebSocket`, long-polling, or 3rd-party push services for realtime (ADR-0025 mandates SSE-only).
- **F-04** — Use raw string IDs for `ItemId` or `OwnerId` (ADR-0020 mandates branded types).
- **F-05** — Treat `SortOrder` as a number (ADR-0016 mandates base-62 lexicographic string).
- **F-06** — Add a 13th `ItemType` (ADR-0015 closes the enum at 12).
- **F-07** — Add a single top-level error boundary (ADR-0017 mandates 8 named boundaries).
- **F-08** — Suggest Lovable Cloud, Supabase, sql.js, IndexedDB-as-primary, Postgres, MySQL, standalone Node, Cloudflare D1, or Go (Backend RESOLVED 2026-04-25; WordPress plugin + PHP 8.1+ + SQLite + REST is the only allowed runtime).
- **F-09** — Use emoji glyphs as icons (lucide-react is the sole icon library).
- **F-10** — Self-report a score >v8 baseline (96.7) without an external Gemini-2.5-Pro re-baseline run.
- **F-11** — Omit the **📊 AI Implementability** block from any spec-related response.
- **F-12** — Run >2 consecutive tooling tasks without addressing a content finding (parser-fix-as-content exception requires false-positive elimination proof).

---

## §5 — Quick Reference (scorecard formula reminder)

See `mem://preferences/spec-implementability-percentage` for the placeholder-weighted formula. Headline:

```
score = base
      + Σ(content-task deltas, each capped per finding-severity)
      + Σ(tooling-task deltas, each capped at +0.0..+0.1)
      − Σ(violations, regressions, drift detections)
```

External re-baseline is the ONLY way to set a new baseline. Self-reported scores drift over ~10 deltas; freshness window is 7 days.

---

## §6 — Cross-References

- [Memory Core](mem://index.md) — every load-bearing rule (always in context)
- [Spec Implementability % preference](mem://preferences/spec-implementability-percentage) — scorecard formula
- [Audit Findings Ledger](./AUDIT-FINDINGS-LEDGER.md) — full state of all findings
- [Ambiguity Ledger](./AMBIGUITY-LEDGER.md) — process journal of substitution batches
- [Glossary](./19-glossary.md) — vague-modifier substitution table + cohort exemptions
- [Gate Registry](./_GATE-REGISTRY.md) — every gate, its tier, and enforcement mode
- [Spec Authoring Guide](./01-spec-authoring-guide/00-overview.md) — how to write a spec file
- [ADR Index](./00-adrs/) — every architectural decision (33 ADRs as of 2026-04-30)
- [Spec Root Entrypoint](./00-overview.md) — top-level navigation

---

*v1.0.0 — 2026-04-30: Initial publication. Closes F-AUDIT-43 (Process Complexity Assumes Advanced AI Cognition) per Gemini-2.5-Pro v8 audit recommendation #1. Synthesizes 15 lessons from F-SCOPE-*, F-AUDIT-30..46, F-SPEC-14, GAP-AMB-01-tail batches #1–#4, GAP-AC-AUTHOR-04, GAP-REBASE-01.*
