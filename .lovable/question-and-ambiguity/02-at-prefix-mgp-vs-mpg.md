# 02 — AT prefix typo: `AT-MGP` vs `AT-MPG`

**Date:** 2026-04-27
**Task #:** 2 / 40
**Related spec / file:** `spec/31-app/01-features/09b-mirror-peer-group-model.md`

## Question
The `09b` addendum uses inline AT prefix **`AT-MGP-NN`** (Mirror-Group-Peer? letter order off). The natural prefix for "Mirror Peer Group" is **`AT-MPG-NN`**. My consolidation work and consistency report previously referenced both. Which is canonical?

## Inferred decision
Treat **`AT-MGP-NN`** as canonical because (a) it is what the source file actually contains and (b) renaming would invalidate any external references. Register `AT-MGP-01..10` in the canonical AT-APP file and the dispatch index. Add a one-line "ID prefix note" in `09b` clarifying that the letters stand for "Mirror Group Peer" (artifact of authoring order) and are stable.

## Impact
Zero — only a naming aesthetic. AT IDs remain stable per the spec's "never renumber" rule.

## Suggested clarification
Confirm `AT-MGP-` is fine, or rename file-wide to `AT-MPG-` and bump `09b` to v1.1.0.
