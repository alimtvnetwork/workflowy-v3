# Ambiguity #36 — G-30.2 Promotion: Strict ERROR vs Soft WARN+CI-block

**Logged:** 2026-04-27 (post-no-questions-mode; counter at 41+)
**Task:** F-future-G30-A — promote G-30.2 redundancy advisory WARN→ERROR
**Decision taken:** Hard ERROR (process.exit(1)) with two documented bypasses.

## The choice

When promoting a long-stable advisory from WARN to ERROR, three patterns
were available:

1. **Hard ERROR with no bypass** — flip exit code from 0 to 1 on any
   violation. Maximally strict. Requires immediate cleanup or CI break.
2. **Hard ERROR with emergency bypass** (CHOSEN) — flip exit code, but
   provide an env-var bypass (`G30_REDUNDANT_ENFORCE=0`) and a CLI flag
   (`--warn-redundant-only`) for short-lived regression-recovery windows.
3. **Soft WARN + external CI check** — keep runner exit 0, add a separate
   GitHub Actions step that greps the output for "MUST be removed" and
   fails the workflow.

## Why option 2 won

### vs. option 1 (no bypass)

A hard-no-bypass would mirror G-31.2/3/4 promotions, but those gates have
NEVER had to be temporarily disabled because their drain work happened
cleanly. G-30.2 is at 0 violations now, but the redundancy queue can
re-grow if someone adds a Coverage Map row whose citations subsequently
get aliased (the F15 alias pattern). In that recovery window, a hard-no-
bypass would force the operator to either:
  - immediately delete the open declaration (might be premature),
  - or add a permanent allow-list entry (might be wrong long-term).

The bypass gives a third option: leave it for a sprint, then triage.

### vs. option 3 (external CI grep)

External grepping creates two sources of truth (runner output + workflow
YAML) and breaks local-dev parity (`node 30-check.mjs` would exit 0 even
when the workflow would fail). Internal exit-code enforcement keeps the
runner self-contained.

## Bypass discipline

Both bypasses are documented as **regression-recovery only**:
  - `G30_REDUNDANT_ENFORCE=0` — env var, ephemeral per-CI-run.
  - `--warn-redundant-only` — CLI flag, ephemeral per-invocation.

Neither is "set it and forget it" — there's no commit-able config file
that disables enforcement. To permanently allow a prefix, the operator
must add it to `REDUNDANCY_ALLOWLIST` with a rationale comment (which
is enforced by G-31.5-style meta gates if we ever extend them to G-30,
which is F-future-G30-B).

## Why "warn-redundant-only" rather than "no-error-redundant"?

The flag name signals **intent** ("I want to see warnings without
enforcement") rather than **mechanism** ("I want to disable an error").
The latter framing invites misuse; the former scopes the use case.

## Verification

- Green path (queue=0, default ERROR mode): exit 0 ✅
- Negative path (AT-FOO- removed from allow-list): exit 1 with full
  diagnostic output ✅
- Bypass env var: exit 0 with WARN label ✅
- Bypass CLI flag: exit 0 with WARN label ✅
- Restored state: exit 0 ✅
