# Ambiguity #38 — G-35 Inventory: Reporter vs Hard-Failing Gate

**Logged:** 2026-04-27 (post-no-questions-mode; counter at 43+)
**Task:** F-future-G30-C — build allow-list inventory report
**Decision taken:** Hybrid — generates a markdown report (default mode,
exit 0) and CI invokes with `--check` (exit 1 on content drift).

## The choice

When building an allow-list inventory, three roles were possible:

1. **Pure reporter** — generates a markdown file; never fails CI.
2. **Hard-failing gate** — does not write a file; instead checks
   conditions (e.g., "no allow-list may exceed N entries") and exits 1.
3. **Hybrid** (CHOSEN) — generates the report by default; CI invokes
   with `--check` which fails if the on-disk report is stale relative
   to the runners' current state.

## Why hybrid won

### vs. pure reporter

A pure reporter creates a "stale-doc" hazard: if developers change an
allow-list but forget to regenerate, the committed report drifts. With
no enforcement, the report becomes a lie — exactly the failure mode the
report was meant to prevent (allow-list bloat hiding behind ✅).

The `--check` mode is the freshness enforcer: any drift between the
runners' current state and the committed `26-allow-list-inventory.md`
fails CI with a clear "regenerate + commit" instruction.

### vs. hard-failing gate

A hard-failing gate would need to encode policy ("max N entries per
list") that doesn't actually exist yet. We don't know what "too big" is.
The reporter's job is to make the data *visible* so policy can emerge
from review — not to invent thresholds preemptively.

Future hard gates can be added later (G-33 / G-34 reserved). For
example: "every allow-list entry MUST be ≤2 years old" or "no two
allow-lists across runners may contain the same entry."

## Date normalization for --check

The report's frontmatter `updated:` field is replaced with `<DATE>`
during diff comparison. Without this, the daily CI run on day N+1 would
fail because the regenerated report carries today's date while the
committed file carries yesterday's. The normalization is symmetric
(applied to BOTH sides of the diff) so it doesn't mask actual content
drift — only the cosmetic date field.

Trade-off accepted: a malicious actor could hand-edit the date field
without triggering --check. Counter-argument: the date field carries no
semantic value for the gate (rationale presence / entry count are the
real assertions), and other gates would catch downstream consequences.

## Why a separate file (G-35) rather than embedding in G-30/31/32?

Considered: have each meta sub-check (G-30.3 / G-31.5 / G-32.4) emit
its own per-runner inventory section. Rejected because:

- The report needs a unified summary table across all 3 runners. One
  list-per-runner would force operators to read 3 files to spot the
  outlier (e.g., "G-31 has 2× more allow-list entries than G-30+G-32").
- Cross-runner gates (the future G-33 idea: detect duplicate allow-list
  entries across runners) need a single ingest point.
- The reporter is read-only across all 3 runners; bundling it into any
  one runner would create a misleading file boundary.

## Verification

- Default generation: exit 0, file written, summary printed ✅
- `--check` clean: exit 0 ("report up-to-date") ✅
- `--check` drift (count mutated 41 → 99): exit 1 with clear message ✅
- `--check` restored: exit 0 ✅
- Master runner integration: G-35 runs; still exactly 6 pre-existing
  failures (no regression) ✅
