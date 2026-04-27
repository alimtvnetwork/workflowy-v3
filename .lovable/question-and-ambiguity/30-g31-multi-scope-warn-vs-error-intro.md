# 30 — G-31.2/3/4 introduce as WARN vs ERROR

**Date:** 2026-04-27
**Context:** F-future-G31a extends G-31 reciprocity beyond `02-workflows/`
to `01-features/`, `06-endpoints/`, and `07-db-diagram/`. Probe ran
before the change and reported 30 + 8 + 6 = 44 pre-existing asymmetries
across the 3 new scopes. Two intro modes were possible:

- **Option A (ERROR at intro)**: ship runner failing on all 44 asymmetries,
  then drain in the same task by adding back-links across ~25 files.
- **Option B (WARN at intro)**: ship runner reporting drift in stdout but
  not failing CI; defer drainage to follow-up `F-future-G31a-promote`
  tasks (one per scope).

## Decision

**Option B (WARN).** Three reasons:

1. **Atomicity** — Adding 44 back-links touches ~25 files in 3 folders
   that have nothing to do with the runner change itself. Mixing
   "infrastructure: parameterise scope" with "content: add 44 links"
   makes review hard and rollback harder.
2. **Triage cost** — Some asymmetries may be intentional and need
   exemption-Set entries with rationales rather than back-links. That
   triage is a content task, not a runner task.
3. **Precedent** — F24/F27/F28 used the same WARN-then-ERROR rollout
   for G-30.2 (redundancy advisory): introduce → drain → promote.
   Worked cleanly there; same shape works here.

## Promotion path

Per-scope, independent. To promote a scope to ERROR:

1. Run `node scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs`
   and confirm the scope reports 0 unreciprocated forward-links (or all
   remaining ones are in its exemption Set with rationales).
2. Edit `scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs`,
   change that scope's `mode: "warn"` to `mode: "error"`.
3. Bump SSOT change-history; update §Sub-checks mode column; update
   the CI registry G-31 row.
4. Re-run master suite to confirm no regression.

## Trade-off accepted

WARN drift will accumulate noise in CI stdout if not drained. We accept
this because the WARN tag (`⚠️`) and the trailing "WARN scope — does not
fail" hint make it visible-but-non-blocking. New asymmetries added to
WARN scopes will appear in PR diffs alongside the file change that
caused them; reviewers can decide to back-link or exempt at that point.

## Why not auto-drain in the runner

Considered: have the runner mutate target files to insert back-links.
Rejected — back-link **placement** (which Related section, which order,
what semantic comment) is editorial. Auto-insertion would produce
formulaic noise like the cargo-cult "sister flow" entries F25 had to
delete. Authors decide the back-link prose; the gate only enforces
existence.
