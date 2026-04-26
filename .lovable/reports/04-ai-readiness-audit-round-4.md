# AI-Readiness Audit — Round 4 (2026-04-26)
> **Scope:** 1270 spec files / 24 top-level modules
> **Method:** Deterministic 6-dim rubric. AI-Gateway scoring **blocked** — credits exhausted on every model attempted.
> **Previous:** Round 3 = 92/100 (2026-04-26 morning).

---
## 🎯 Overall Score: **92 / 100**

| Dimension | Score | Weight |
|---|---:|---:|
| Completeness | 99 | 20% |
| Consistency | 100 | 15% |
| Clarity | 63 | 15% |
| Testability | 94 | 20% |
| Ai Actionability | 99 | 20% |
| Alignment | 95 | 10% |

---

## 🚨 Ranked Findings (severity × impact)

### F-R4-01 — ItemType enum drift: src uses `mirror`, spec uses `dashboard`
- **Severity:** 9/10 · **Impact:** 9/10 · **Score:** 81 · **Category:** Drift
- **Why a mediocre AI fails:** AI generates dispatch/Zod schemas with wrong literal; type errors cascade.
- **Fix:** Edit src/types/index.ts: replace `| "mirror"` with `| "dashboard"`. Blocked by spec-only-mode.
- **Evidence:** src/types/index.ts contains 'mirror'

### F-R4-03 — 2 modules have AC files lacking atomic AC-NN/AT-XXX-NN IDs
- **Severity:** 7/10 · **Impact:** 7/10 · **Score:** 49 · **Category:** Missing-Test
- **Why a mediocre AI fails:** Cannot assert 'all ACs satisfied' for PR merge gate.
- **Fix:** Atomize narrative checklists into AC-NN rows OR mark file as `> Type: Dispatch Index`.
- **Evidence:** 18-spec-issues, 31-app

### F-R4-04 — 296 TBD/TODO/FIXME markers across 21 modules
- **Severity:** 6/10 · **Impact:** 7/10 · **Score:** 42 · **Category:** Ambiguity
- **Why a mediocre AI fails:** AI invents values (e.g. 'last 5 results', random hex); user rejects output.
- **Fix:** Resolve each TBD or wrap in `<<TBD-PhaseN>>` token the runner refuses to compile.
- **Evidence:** 18-spec-issues(8); 31-app(31); 32-ui-design(86); 02-coding-guidelines(48); 03-error-manage(24); 15-wp-plugin-how-to(32)

### F-R4-07 — Spec=1270 files, src=25 files — 99% of surface unimplemented
- **Severity:** 3/10 · **Impact:** 8/10 · **Score:** 24 · **Category:** Implementation-Risk
- **Why a mediocre AI fails:** Fresh AI without spec-only-mode memory may treat empty modules as 'done'.
- **Fix:** Add src/STATUS.md mirroring spec/31-app/04-roadmap/03-implementation-checklist.md.
- **Evidence:** src has 8 placeholder files

### F-R4-06 — 2 short-stub files (<400 chars) treated as authoritative
- **Severity:** 4/10 · **Impact:** 5/10 · **Score:** 20 · **Category:** Gap
- **Why a mediocre AI fails:** AI treats stub as complete spec ('workflow is empty → no workflow exists').
- **Fix:** Expand to ≥ 800 chars or add `> Status: Placeholder — see <link>` banner.
- **Evidence:** 02-coding-guidelines:01-workflow-and-process.md; 10-powershell-integration:06-pnpm-store-commands.md

### F-R4-05 — 10 hedge phrases (might/maybe/probably) in normative text
- **Severity:** 3/10 · **Impact:** 5/10 · **Score:** 15 · **Category:** Clarity
- **Why a mediocre AI fails:** Creates false branches in AI planning tree; generates code for both paths.
- **Fix:** Rewrite to definitive imperatives: 'If X, abort; else retry exactly twice.'
- **Evidence:** worst: 18-spec-issues

### F-R4-08 — Two 'consolidation' folders exist (12-consolidated-guidelines + 02-.../consolidated-review-guide)
- **Severity:** 3/10 · **Impact:** 4/10 · **Score:** 12 · **Category:** Inconsistency
- **Why a mediocre AI fails:** AI reads both, finds divergent advice, freezes.
- **Fix:** Pick one canonical; demote other to redirect. (Round 3 added disambiguation banners — verify.)

---

## 📊 Per-Module Scoreboard (sorted lowest → highest)

| Score | Module | Files | ACs | TBDs | Hedges | Stubs | Meta% |
|---:|---|---:|---:|---:|---:|---:|---:|
| 🟠 73 | `18-spec-issues` | 11 | 1 | 8 | 3 | 0 | 100% |
| 🟡 80 | `31-app` | 41 | 4 | 31 | 2 | 0 | 100% |
| 🟡 81 | `32-ui-design` | 120 | 17 | 86 | 0 | 0 | 100% |
| 🟡 83 | `02-coding-guidelines` | 308 | 30 | 48 | 1 | 1 | 100% |
| 🟡 84 | `03-error-manage` | 187 | 19 | 24 | 1 | 0 | 100% |
| 🟡 84 | `15-wp-plugin-how-to` | 216 | 16 | 32 | 0 | 0 | 100% |
| 🟢 91 | `06-seedable-config-architecture` | 50 | 4 | 11 | 0 | 0 | 100% |
| 🟢 92 | `05-split-db-architecture` | 45 | 4 | 10 | 0 | 0 | 100% |
| 🟢 93 | `01-spec-authoring-guide` | 21 | 1 | 0 | 0 | 0 | 67% |
| 🟢 94 | `11-research` | 2 | 0 | 2 | 0 | 0 | 100% |
| 🟢 94 | `13-cicd-pipeline-workflows` | 36 | 3 | 8 | 0 | 0 | 100% |
| 🟢 95 | `08-docs-viewer-ui` | 29 | 3 | 6 | 0 | 0 | 100% |
| 🟢 95 | `10-powershell-integration` | 24 | 2 | 4 | 0 | 1 | 100% |
| 🟢 95 | `14-self-update-app-update` | 32 | 2 | 6 | 1 | 0 | 100% |
| 🟢 95 | `16-generic-cli` | 43 | 3 | 6 | 1 | 0 | 100% |
| 🟢 98 | `04-database-conventions` | 16 | 2 | 2 | 0 | 0 | 100% |
| 🟢 98 | `09-code-block-system` | 14 | 1 | 2 | 0 | 0 | 100% |
| 🟢 98 | `17-generic-update` | 11 | 1 | 2 | 1 | 0 | 100% |
| 🟢 98 | `33-feedback-report` | 3 | 1 | 2 | 0 | 0 | 100% |
| 🟢 98 | `34-activity-feed` | 3 | 1 | 2 | 0 | 0 | 100% |
| 🟢 98 | `35-enforcement-rules` | 3 | 1 | 2 | 0 | 0 | 100% |
| 🟢 98 | `36-user-management` | 3 | 1 | 2 | 0 | 0 | 100% |
| 🟢 100 | `07-design-system` | 16 | 1 | 0 | 0 | 0 | 100% |
| 🟢 100 | `12-consolidated-guidelines` | 26 | 1 | 0 | 0 | 0 | 100% |

---

## 🛠 Path to 100/100 — Remaining Actions

| # | Action | Effort | Score gain | Blocker |
|---|---|---:|---:|---|
| 1 | Apply F-R4-01 — fix `ItemType` in `src/types/index.ts` (3 lines) | 5 min | +5 | spec-only-mode |
| 2 | Resolve all TBD markers (F-R4-04) — replace with concrete values | 60 min | +2 | none |
| 3 | Backfill Keywords + Scoring + AI Confidence in low-meta overviews (F-R4-02) | 30 min | +2 | none |
| 4 | Atomize narrative ACs (F-R4-03) into AC-NN IDs | 20 min | +1 | none |
| 5 | Add `src/STATUS.md` mirroring roadmap (F-R4-07) | 10 min | +1 | spec-only-mode |
| 6 | Sync `mem://index.md` Core to mention WP-plugin backend (F-R4-09) | 5 min | +0.5 | none |
| 7 | Re-run AI-Gateway scoring once credits return | 15 min | calibration | credits |

**Estimated final score after items 1-6: 100/100**

---

## ⚠️ Audit Limitation

This is a **deterministic** audit. The AI-Gateway LLM scoring layer (Gemini 2.5 Flash) returned HTTP 402 (Credits Exhausted) on every spec attempted. Subjective dimensions (clarity nuance, contradiction-detection across siblings) are approximated by regex heuristics. Re-run when credits are restored: `python3 /tmp/audit_run.py`.
