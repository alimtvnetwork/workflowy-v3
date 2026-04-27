# Ambiguity 11 — Feature-slice AT citations not validated by G-30

**Date:** 2026-04-27
**Task:** F13 — Add `ReaperRuns` + `MirrorPeerGroup*` rows to `04-feature-slices.md`
**Mode:** No-Questions (auto-decided)

## Context

In F13 I added `**ATs**:` lines to feature-slice sections (§4.2, §4.6, §4.10, §4.11) citing IDs like `AT-APP-58..65`, `AT-WF-DETACH-01..05`, etc.

The G-30 gate (`scripts/spec-hygiene/30-check-at-citation-validity.mjs`) only scans `spec/31-app/06-endpoints/`. So these new feature-slice citations are **not** validated for existence.

## Decision

I deliberately did **not** extend G-30 to cover `07-db-diagram/04-feature-slices.md` in this task because:

1. F13's scope is "add rows to feature-slices" — extending the gate is task **F14** (already in the remaining list).
2. The cited IDs in §4.2 / §4.6 / §4.10 / §4.11 were copy-pasted from the corresponding endpoint files (already G-30-validated) and from `02-workflows/` which uses the same registered open prefixes.
3. Manual cross-check: every range I added (`AT-APP-58..65`, `AT-APP-81..85`, `AT-APP-97..102`, `AT-APP-103..107`, `AT-WF-DETACH-01..05`, `AT-WF-REAPER-01..05`, `AT-WF-SEARCH-01..05`, `AT-WF-REPLAY-01..06`) is registered in `97-acceptance-criteria.md` or in the open-prefix table in `02-workflows/00-overview.md`.

## Future cleanup

F14 will broaden G-30 to scan the broader `spec/31-app/` tree (or at minimum `04-feature-slices.md` and `02-workflows/`), which will close this gap automatically.
