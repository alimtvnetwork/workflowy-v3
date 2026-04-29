# Audit — G-00-OVERVIEW-SCORING-TABLE-COMPLETE

**Date:** 2026-04-29
**Task:** Mirror `G-00-OVERVIEW-AI-CONTRACT-COMPLETE` for the Scoring side. Layer-2 completeness gate for Scoring rows.

## Why

`G-00-OVERVIEW-SCORING-TABLE-PRESENT` (Layer 1) only checks that *some* Scoring marker exists. A Scoring section can pass `…-PRESENT` with arbitrary or missing rows, making per-section quality signals unreliable across the corpus. This gate locks the 3-row schema (AI Confidence, Ambiguity, Health Score) so `health-dashboard.md` and any future score-aggregator can rely on canonical row presence.

## Schema

Three canonical rows in any Scoring section:

1. **AI Confidence** OR **AI Implementability** (case-insensitive) — per-section AI handoff signal
2. **Ambiguity** — open-questions / unresolved-decisions count
3. **Health Score** OR **Overall** OR **Total** — aggregate (MUST be last)

Each row's value MUST be parseable: percentage (`92%`), fraction (`23/25`), or letter grade (`A+`).

## Baseline (2026-04-29)

| Bucket | Count | Files |
|--------|------:|-------|
| Fully compliant (3/3) | **0** | — |
| Partial (AI + Ambiguity, missing aggregate) | 19 | `02`, `04`, `08`–`18`, `31`, `32`, `34`, `36` |
| Partial (1/3) | 2 | `33-feedback-report`, `35-enforcement-rules` |
| No canonical Scoring schema | 6 | `00-adrs`, `01-spec-authoring-guide`, `03-error-manage`, `05-split-db-architecture`, `06-seedable-config-architecture`, `07-design-system` |

**Dirty baseline → gate ships WARN-only.** Promotion to hard-fail requires a backfill sweep:
- **Quick wins (19 files):** add `Health Score` / `Overall` row to existing partial tables. Estimated effort: s.
- **Schema authoring (6 files):** author full Scoring section per `14-scoring-metrics.md`. Estimated effort: m.

## Trio Layer-2 status (complete after this mint)

| Aspect | Layer-1 (presence) | Layer-2 (completeness) |
|--------|-------------------|------------------------|
| H1 numeric prefix | `G-09-OVERVIEW-H1-MATCHES-FOLDER-INDEX` | n/a (single-line by design) |
| AI Contract | `G-00-OVERVIEW-AI-CONTRACT-PRESENT` | `G-00-OVERVIEW-AI-CONTRACT-COMPLETE` |
| Scoring | `G-00-OVERVIEW-SCORING-TABLE-PRESENT` | **`G-00-OVERVIEW-SCORING-TABLE-COMPLETE`** ← this mint |

## Future

- **Scoring backfill sweep** (new task #16 candidate, +1.5 pts m) — promotes this gate WARN→hard-fail.
- A `G-00-OVERVIEW-SCORING-VALUES-FRESH` gate (deferred) would enforce that scores aren't stale (e.g., updated within 90 days of the file's last `Updated:` frontmatter).
