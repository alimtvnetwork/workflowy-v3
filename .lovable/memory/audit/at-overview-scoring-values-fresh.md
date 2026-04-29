# Audit Ledger — `G-00-OVERVIEW-SCORING-VALUES-FRESH`

> **Created:** 2026-04-29 (UTC+8)
> **Gate:** `G-00-OVERVIEW-SCORING-VALUES-FRESH` (CI, WARN-only initial mode; hard-fail flag flips 2026-07-28)
> **Runner:** [`scripts/spec-hygiene/53-check-scoring-values-fresh.mjs`](../../../scripts/spec-hygiene/53-check-scoring-values-fresh.mjs)

## Purpose

Layer-2.6 of the overview Scoring trio. Catches stale Scoring tables: values
that haven't been re-evaluated in >90 days (WARN) / >180 days (HARD-FAIL).

## Baseline 2026-04-29 — 21/25 fresh

### Surfaced WARNs (4 — no date metadata, cannot evaluate)

| File | Action |
|---|---|
| `spec/00-adrs/00-overview.md` | Add `> **Updated:** 2026-04-29` (or `> Scoring fresh as of 2026-04-29`) below Scoring table |
| `spec/16-generic-cli/00-overview.md` | Same |
| `spec/34-activity-feed/00-overview.md` | Same |
| `spec/36-user-management/00-overview.md` | Same |

### Resolution recipe

Authors refresh the freshness clock in one of two ways:
1. Bump the file's `> **Updated:** YYYY-MM-DD` blockquote (preferred when the whole file was reviewed).
2. Add `> Scoring fresh as of YYYY-MM-DD` immediately after the Scoring table (preferred when only the Scoring values were re-evaluated).

The runner takes `max(updated, fresh)` so either path satisfies the gate.

## Hard-fail promotion plan

- **Today (2026-04-29):** WARN-only. CI exits 0 regardless.
- **2026-07-28:** Flip `PROMOTED_HARDFAIL = true` in the runner. Stale-180+ blocks become CI failures.
- **Companion gate:** `34-check-allow-list-age.mjs` will independently warn if any allow-list TTL is breached, but this gate stands on its own (no allow-list — every overview is in scope).
