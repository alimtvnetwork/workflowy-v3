# Plan — Spec Hygiene Fixes (Phased)

> **Version:** 1.1.0 · **Updated:** 2026-04-25 (UTC+8) · **Status:** ✅ ARCHIVED
> **Resolution audit (2026-04-25):** All 18 audit issues (I-01 … I-18) are closed. Verified:
> - Parallel folders `spec/21-app/`, `spec/22-app-issues/`, `spec/23-app-database/`, `spec/24-app-design-system-and-ui/` and slots 25–30 are **gone** (closes I-02, I-03, I-04, I-17).
> - `.lovable/memories/` is gone, only `.lovable/memory/` remains (closes I-10).
> - `spec/31-app/02-audits/` removed (closes I-12, I-16).
> - 18 hygiene scripts in `scripts/spec-hygiene/` wired into `00-run-all.mjs` (closes I-18).
> **Source of truth for issues:** `spec/18-spec-issues/01-audit-2026-04-18.md`
> **Memory mirror:** `.lovable/memory/issues/spec-hygiene.md`

---

## Phasing Principle

Each phase is **small enough to succeed in one "next" turn**. No phase touches more than one theme. After each phase the user reviews, then says **next**.

| Phase | Theme | Issues Closed | Risk |
|-------|-------|---------------|------|
| P1 | Quick wins — broken link + plural memories typo | I-10, I-12 | Trivial |
| P2 | Header rule reconciliation (decide one canonical form) | I-06, I-08 | Low (decision needed) |
| P3 | Strip forbidden metadata fields from old overview files | I-07 | Low |
| P4 | Resolve `21-app` vs `31-app` overlap (decision + redirect or merge) | I-02, I-17 part 1 | Medium (decision needed) |
| P5 | Resolve `24-app-design-system-and-ui` vs `32-ui-design` overlap | I-03, I-17 part 2 | Medium (decision needed) |
| P6 | Resolve database folder hierarchy (`04`, `05`, `23`) | I-04, I-17 part 3 | Medium (decision needed) |
| P7 | Renumbering pass — close gaps 18–20 and 25–30 | I-01, I-05 | Medium (touches many cross-refs) |
| P8 | Naming-guide cleanup — clarify underscore scope, document slot 18 | I-09, I-11 | Low |
| P9 | Plan archival — mark `.lovable/plans/01-...md` executed, drop stale refs | I-13, I-14 | Trivial |
| P10 | Pre-emptive split for files trending toward 300 lines | I-15 | Low |
| P11 | Populate or delete `31-app/02-audits/` | I-16 | Low (decision needed) |
| P12 | Add CI / pre-commit guard scripts | I-18 | Medium |

---

## Per-Phase Detail

### P1 — Quick wins  *(no decisions)*
1. Fix `spec/31-app/02-audits/00-overview.md` link `../../../22-app-issues/...` → `../../22-app-issues/...`.
2. Fix `spec/01-spec-authoring-guide/02-naming-conventions.md` line 10: `.lovable/memories/` → `.lovable/memory/`.
3. Bump touched files' patch version + `Updated`.

### P2 — Header rule  *(needs decision)*
- Decide: blockquote form (per `mem://docs/specifications`) **or** plain form (per `01-spec-authoring-guide/02-naming-conventions.md`).
- Rewrite the losing source to point at the winning rule.
- Update all 14 non-blockquote `99-consistency-report.md` files in `31-app/` + `32-ui-design/` to match.

### P3 — Forbidden fields
- Strip `AI Confidence`, `Ambiguity`, `Keywords`, `Scoring`, `Status` blocks from `21-app`, `22-app-issues`, `23-app-database`, `24-app-design-system-and-ui` overview files (and any siblings).
- Convert headers to blockquote form (assuming P2 picks blockquote).

### P4 — App-root overlap
Options to decide:
- **(a)** Delete `spec/21-app/`, update all references to point at `spec/31-app/`.
- **(b)** Demote `spec/21-app/` to a redirect file pointing at `31-app/`.
- **(c)** Move `31-app/` content into `21-app/` and renumber.

### P5 — UI-root overlap
Same three options as P4 for `24-app-design-system-and-ui/` vs `32-ui-design/`.

### P6 — Database trees
- Inventory each of `04-database-conventions/`, `05-split-db-architecture/`, `23-app-database/`.
- Decide foundational vs app-specific split, then merge or relabel.

### P7 — Renumber root
- Close 18–20 gap and 25–30 gap.
- Touches every cross-reference; do AFTER P4–P6 so we don't renumber twice.
- Provide a `git mv` map first for review.

### P8 — Naming guide cleanup
- Scope underscore allowance explicitly to source-code files (Go, Rust).
- Add `18` to reserved-prefix table or document it as the first non-reserved fundamental slot.

### P9 — Plan archival
- Add "Executed: 2026-04-18" banner to `.lovable/plans/01-restructure-31-app-and-32-ui-design.md`.
- Move to `.lovable/plans/archive/` if such a folder exists; otherwise leave with banner.

### P10 — Pre-emptive splits
- Only triggered if the trending files cross 250 lines after future edits.
- Track in a watchlist inside this plan.

### P11 — Populate audits folder
- Decision: write the first real audit OR delete the folder until needed.

### P12 — CI guards
- Script 1: numbering contiguity scan.
- Script 2: header-format scan.
- Script 3: link integrity scan.
- Script 4: forbidden-metadata-field scan.
- Wire into pre-commit (advisory) and CI (blocking).

---

## How to Run This Plan

When the user says **next**, execute the next P# in order. If a phase needs a decision, ask **one** focused question before doing anything else, then execute on the answer.

Do **not** combine phases unless the user explicitly says so.
