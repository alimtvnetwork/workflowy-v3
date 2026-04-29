# Audit Ledger — `G-00-OVERVIEW-SCORING-VALUES-FRESH`

> **Created:** 2026-04-29 (UTC+8)
> **Gate:** `G-00-OVERVIEW-SCORING-VALUES-FRESH` (CI, WARN-only initial mode; hard-fail flag flips 2026-07-28)
> **Runner:** [`scripts/spec-hygiene/53-check-scoring-values-fresh.mjs`](../../../scripts/spec-hygiene/53-check-scoring-values-fresh.mjs)

## Purpose

Layer-2.6 of the overview Scoring trio. Catches stale Scoring tables: values
that haven't been re-evaluated in >90 days (WARN) / >180 days (HARD-FAIL).

## Baseline 2026-04-29 — 25/25 fresh ✅ (drained same day)

### Initially-surfaced WARNs (all closed 2026-04-29)

| File | Resolution |
|---|---|
| `spec/00-adrs/00-overview.md` | Added `> Scoring fresh as of 2026-04-29` after `#### Current values` block (line 50) |
| `spec/16-generic-cli/00-overview.md` | Added `> Scoring fresh as of 2026-04-29` after Scoring table (line 77) |
| `spec/34-activity-feed/00-overview.md` | Added `> Scoring fresh as of 2026-04-29` above Confidence-rationale blockquote (line 79) |
| `spec/36-user-management/00-overview.md` | Added `> Scoring fresh as of 2026-04-29` above Confidence-rationale blockquote (line 83) |

Final state: runner reports `✅ all Scoring blocks fresh (≤90 days)`.

### Resolution recipe

Authors refresh the freshness clock in one of two ways:
1. Bump the file's `> **Updated:** YYYY-MM-DD` blockquote (preferred when the whole file was reviewed).
2. Add `> Scoring fresh as of YYYY-MM-DD` immediately after the Scoring table (preferred when only the Scoring values were re-evaluated).

The runner takes `max(updated, fresh)` so either path satisfies the gate.

## Hard-fail promotion plan

- **Today (2026-04-29):** WARN-only. CI exits 0 regardless.
- **2026-07-28:** Flip `PROMOTED_HARDFAIL = true` in the runner. Stale-180+ blocks become CI failures.
- **Companion gate:** `34-check-allow-list-age.mjs` will independently warn if any allow-list TTL is breached, but this gate stands on its own (no allow-list — every overview is in scope).
