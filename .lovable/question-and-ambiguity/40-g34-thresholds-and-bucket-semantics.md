# Ambiguity #40 — G-34 thresholds, exempt-key shape, blame strategy

**Task:** F-future-G34 — Allow-List Entry Age Tracker
**Date:** 2026-04-27

## Context

Three independent design choices, each defensible multiple ways. No-Questions Mode has expired (counter 45/40), but task is part of the in-flight batch — proceeding with documented inferences and expecting later review.

## Inferences

1. **Thresholds: 180d WARN / 365d ERROR.**
   - Alternatives: 90/180 (aggressive), 365/730 (lax), per-list configurable.
   - Inferred: 180/365 matches industry "annual review" cadence and is what the user previously surfaced ("warn >180d, error >365d") in the F-future-G34 task line.

2. **`AGE_EXEMPT` key format: `"<LIST_NAME>::<value>"` (composite).**
   - Alternative: bare `<value>` (simpler) or `<gate>::<list>::<value>` (more explicit).
   - Rejected bare-value: G-33 enforces no cross-gate duplicates of values, but each list's review clock is independent — bare keys would couple them.
   - Rejected gate-prefixed: list names are already globally unique across the 3 runners (`REDUNDANCY_ALLOWLIST`, `WORKFLOWS_EXEMPT`, `COVERAGE_EXEMPT`, …), so the gate prefix is redundant.

3. **Blame strategy: `git blame -L line,line --porcelain` on the live file.**
   - Alternative: `git log -L :line,line:file --format="%at"` (slower, follows renames).
   - Rejected: rename-following matters less than per-line freshness; allow-list moves are rare and "clock resets on rename" is acceptable. Porcelain blame is ~10× faster and stdlib-parseable.

## Other small choices made silently

- Subcheck numbering G-34.1 / G-34.2 (not G-34.3) because there is no inventory to audit — G-35 already exists.
- `--info` flag (not env var) for symmetry with G-33's `--info`.
- INFO is suppressed by default (only counts in summary line) — keeps CI logs scannable.

## What to override if disagreed

- **Thresholds**: change `WARN_DAYS` / `ERROR_DAYS` constants at top of runner.
- **Key shape**: refactor `AGE_EXEMPT.has()` lookup + update SSOT §"Opt-out semantics".
- **Blame approach**: replace `blameLine()` body; rest of pipeline is unchanged.
