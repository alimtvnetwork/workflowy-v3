# Ambiguity #24 — F28 default-on flip: opt-out semantics + back-compat

**Date:** 2026-04-27
**Task:** F28 (promote G-30.2 to default-on)
**Decision class:** API/CLI surface design

## The branch points

Promoting an opt-in flag to default-on involves three small but
consequential design choices:

### Choice 1: Keep the legacy `--warn-redundant` flag or remove it?

**Option A — Remove.** Cleaner CLI surface; one fewer no-op to document.
**Option B — Keep as no-op.** Back-compat for any saved CI scripts,
README copy-paste examples, or developer muscle memory from v1.2.0–v1.3.0.

**Decision: Option B.** The flag's lifespan was only ~2 hours in our
timeline, but the **principle** matters: silently removing a documented
flag is a breaking CLI change. Cost of keeping is one comment line. We
explicitly document the no-op status both in the runner header and in
SSOT v1.4.0 §"Invocation".

### Choice 2: Opt-out flag name

Considered:
- `--no-warn-redundant` (mirrors GNU `--no-foo` convention)
- `--quiet-redundancy`
- `--suppress-advisory`

**Decision: `--no-warn-redundant`.** Direct negation of the legacy flag
preserves discoverability — anyone who remembers the v1.3.0 flag will
guess the negation correctly. Symmetric env var: `G30_WARN_REDUNDANT=0`
(value-based negation rather than separate variable).

### Choice 3: Should advisory output count as an "issue" for the master runner?

The master runner `00-run-all.mjs` aggregates per-check exit codes. G-30.2
is WARN-only by design, so the answer is **no** — advisory output stays in
stdout and does not influence the per-check pass/fail bookkeeping. This
preserves the F24 design constraint that "G-30.2 never affects exit
code", carried forward unchanged.

## Why this is now safe

F27 drained the queue to 0 candidates via REDUNDANCY_ALLOWLIST expansion
(5 → 41 entries, 3 documented intent-categories). Default-on therefore
produces **zero noise** in the current state. The negative-test probe
confirmed: removing one allow-list entry surfaces exactly that one
candidate in stdout while exit code stays 0.

## Forward-looking risk: allow-list maintenance

With default-on, any author who introduces a new feature/workflow file
declaring an `AT-{NEWPREFIX}-NN` placeholder will see their declaration
flagged in CI on the very first run after merge. They have two correct
fixes:

1. **Close** the citations (preferred) — register concrete IDs in a
   table and let G-30 resolve them via closed declarations.
2. **Allow-list** the prefix (escape hatch) — add an entry under category
   (a), (b), or (c) of `REDUNDANCY_ALLOWLIST` with a one-line written
   rationale.

Both paths are healthier than the v1.2.0–v1.3.0 era, where new
declarations could accumulate silently because the advisory was opt-in.

## Future-promotion ladder (deferred — NOT F28)

Three further escalation steps remain available for a future task:

1. **F-future-A**: Promote G-30.2 from WARN to ERROR (changes exit
   code). Requires confidence that the allow-list is stable and that
   no provisional alias-table churn is on the horizon.
2. **F-future-B**: Add a G-30.3 sub-check enforcing that every
   allow-list entry has a corresponding rationale comment in the
   runner source (machine-checkable).
3. **F-future-C**: Generate a markdown report of allow-list contents
   into `spec/31-app/05-conventions/` so reviewers don't have to read
   the runner source to audit category membership.

None of these block F28; logging here so they're discoverable when
"check memory for remaining tasks" runs in a later loop.

## Files changed

- `scripts/spec-hygiene/30-check-at-citation-validity.mjs` (v1.3.0 → v1.4.0)
- `spec/31-app/05-conventions/23-g30-at-citation-validity-gate.md` (v1.3.0 → v1.4.0)
- `spec/31-app/05-conventions/02-ci-quality-gates.md` (G-30 row updated)
