# 22 — Cross-flow back-link asymmetries vs cargo-cult "sister flow" labels

**Loop:** 23 / 40 (F25)
**Date:** 2026-04-27
**Files touched:**
- `02-workflows/04-trash-restore-flow.md` (v1.1.0 → v1.2.0)
- `02-workflows/05-trash-reaper-flow.md` (v1.0.0 → v1.1.0)
- `02-workflows/07-sync-replay-flow.md` (v1.0.0 → v1.1.0)

## Audit method

Probe `/tmp/audit_xrefs.mjs` parses `## Related` sections of all 9 flow
files and renders a 9×9 reciprocity matrix. Detected **6 asymmetric
forward-links** (A links to B; B has no back-link to A):

| From | To | Decision |
|------|-----|----------|
| 05 → 02 | template-application | **Drop forward-link** — cargo-cult "sister cross-feature flow" boilerplate; no semantic relation between reaper and template application |
| 05 → 04 | trash-restore | **Add back-link in 04** — restore and reaper are inverse operations on the same `Item.DeletedAt` window |
| 07 → 05 | trash-reaper | **Add back-link in 05** — replay returns HTTP 410 when in-flight queued mutation targets a reaper-deleted row |
| 08 → 05 | trash-reaper | **Add back-link in 05** — reaper hard-delete cascades into peer-group membership; reuses detach trigger path |
| 09 → 07 | sync-replay | **Add back-link in 07** — offline mirror-create mutations queue + drain through this same FIFO |
| 10 → 05 | trash-reaper | **Add back-link in 05** — bootstrap-time M-117 singleton-sweep mimics reaper's auto-dissolve cascade |

## Decision: 5 back-links added, 1 forward-link dropped

I deliberately did NOT mechanically add all 6 back-links — that would
have re-introduced the cargo-cult "sister flow" pattern that this audit
exposed in 05's original Related section. The 05→02 link claimed
template-application as a "sister flow" but no consumer of either flow
ever crosses between the two. Better to delete the misleading forward
than create a matching misleading back.

The remaining 5 asymmetries did represent real semantic relationships
that were just under-documented from the consumer side.

## Outcome

Reciprocity matrix is now 0/0 asymmetric (down from 6). Per-flow link
counts:

```
02 → [03, 04]            (unchanged)
03 → [02, 04]            (unchanged)
04 → [02, 03, 05]        (+05)
05 → [04, 06, 07, 08, 10] (+07, +08, +10; -02)
06 → [05, 07]            (unchanged — was already symmetric)
07 → [05, 06, 08, 09]    (+09)
08 → [05, 07, 09, 10]    (unchanged)
09 → [07, 08, 10]        (unchanged)
10 → [05, 08, 09]        (unchanged)
```

## Why this drifted

Flows 02/03/04 (Trash family) were created in APP-FIX-12 (2026-04-26)
and used "sister cross-feature flow" boilerplate to link to each other.
F11 (2026-04-27) added flows 05/06/07/08 with a different convention
(semantic descriptions instead of "sister flow"), but the new flows
copy-pasted the boilerplate when linking back to the older trio. F16/F17
(09/10) used clean semantic descriptions throughout and never dropped
into boilerplate. F21 fixed the 08↔09 mirror trio explicitly; F25 closes
the remaining gaps.

## Future-proofing

A G-31 "cross-flow link reciprocity gate" would catch this automatically
but is over-engineered for a 9-file collection. Re-run
`/tmp/audit_xrefs.mjs` (or rewrite as a permanent script) before
adding new workflow files. Logged as a deferred-but-low-priority
follow-up — not added to the active queue.

## Status

✅ Closed in this loop. G-29 + G-30 still ✅ green (no AT changes).
