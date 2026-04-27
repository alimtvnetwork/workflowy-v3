# Ambiguity #42 — G-37 Rename-Suggestion Confidence Model

**Date:** 2026-04-27
**Task:** F-future-G37 — Stale Relative-Link Detector
**Mode:** No-questions (expired but batch continues)

## Question deferred

How aggressive should G-37.1's "stale-rename" suggestion be? Three plausible models:

1. **Bare-basename match (chosen, v1.0.0)** — index by `basename(href)`; 1 match → STALE-RENAME with suggestion; ≥2 → STALE-AMBIGUOUS; 0 → STALE-MISSING.
2. **Path-suffix match** — index by trailing path segments (e.g. `06-endpoints/03-x.md`) for stronger confidence; 1 match → high-confidence rename.
3. **Git-history match** — invoke `git log --diff-filter=R --name-status` to track actual rename events; surface the new path with maximum confidence.

## Default applied

Model 1 (bare-basename). Rationale:
- Zero git dependency (works in shallow clones, freshly-cloned worktrees, and CI snapshots that don't fetch full history).
- `NN-name.md` filenames in this spec are unique by convention (G-01), so the bare-basename match has high precision in practice.
- WARN-only severity tolerates the occasional false-positive when an unrelated `00-overview.md` lives in another folder.
- Cheap to compute (one filesystem walk, one Map lookup per broken link).

Models 2 and 3 are deferred — promotable later if the false-positive rate proves high (currently 0 false positives because there are 0 stale-renames in the baseline).

## Severity choice (G-37.1 = WARN, not ERROR)

A rename-suggestion can be wrong (semantically unrelated files share basenames). Forcing CI to fail would force authors to add allow-list entries for legitimate cases, growing the `STALE_LINK_EXEMPT` Set with low-value debt. WARN keeps the signal visible without coercing low-confidence fixes.

## Scope choice (source = spec/ only; index = spec/ + src/)

Stale links most commonly appear in spec/ when files are renumbered. The target may now live under either spec/ (most cases) or src/ (when a feature spec references a code module). Casting a wide net for the index minimizes false-negatives at near-zero cost. Excluding `.lovable/` from the index avoids matches against ephemeral memory snapshots.

## Resolution criteria

If the bare-basename model produces ≥3 false-positive STALE-RENAME suggestions in real cleanup work, promote to model 2 (path-suffix). Track with `// FP` comments in `STALE_LINK_EXEMPT` rationales.
