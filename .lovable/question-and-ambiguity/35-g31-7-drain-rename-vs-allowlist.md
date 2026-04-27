# Ambiguity #35 — G-31.7 drain: rename vs allow-list per file

**Date:** 2026-04-27
**Task:** F-future-G31f — drain G-31.7 heading-drift queue (3 files)

## The ambiguity

For each of the 3 features-scope files using `## Cross-References` instead of canonical `## Related`, choose between:

- **(R) Rename** the heading to `## Related` to match the scope canonical.
- **(A) Allow-list** the file in `FEATURES_HEAD_EXEMPT` with a rationale.

There's no syntactic rule that decides — both options leave G-31.7 ✅ green. The decision is editorial.

## Decision criterion

Adopted a **content-based criterion**: inspect the citations in the section and pick R or A based on what dominates.

- If **majority of citations are peer features** in the same scope → rename to `## Related` (matches the scope-majority semantic where `## Related` reads as "other features I relate to").
- If **majority of citations are cross-domain** (endpoints, `mem://`, `src/types`, edge-cases, infra constraints) → allow-list with `## Cross-References` (the heading reads more naturally for "things outside my scope that I reference").

## Per-file outcomes

| File | Citations | Decision | Reason |
|---|---|---|---|
| `09a-mirror-cycle-detection.md` | 1 peer (`09-mirrors`, `14-concurrency-and-sync`) + 3 cross-domain (endpoints, edge-cases, mem://) | **Allow-list** | 3/5 cross-domain — `Cross-References` reads more accurately |
| `14b-offline-queue.md` | 1 peer (§14.2) + 2 cross-domain (`src/types`, `mem://`) | **Allow-list** | 2/3 cross-domain |
| `16-search-ranking.md` | 2 peer (`09b-mirror-peer-group-model`, `11-trash-view`) + 1 cross-domain (`mem://`) | **Rename** | 2/3 peer features — `Related` reads more accurately |

## Why not rename all 3 for uniformity

Forcing uniformity would lose information. The heading is a 1-bit signal to the reader about whether the linked content is a same-level peer or a different-domain reference. Different is fine — that's why G-31.7 is permanent-WARN, not ERROR. The allow-list with rationale **codifies the intent**, so future drift away from this judgement gets caught.

## Reversibility

To undo: delete the entry from `FEATURES_HEAD_EXEMPT` → re-run the runner → the file resurfaces as a heading-drift advisory; rename or re-allow-list as desired. The runner has no hidden state.
