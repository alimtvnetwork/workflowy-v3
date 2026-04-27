# 31 — G-31.3 back-link row prose style (Cross-References table)

**Date:** 2026-04-27
**Context:** F-future-G31a-promote-endpoints drained 8 endpoint
asymmetries by adding rows to existing `## Cross-References` tables in
3 target files. The runner only checks for filename substring presence
inside the section, so any row format would satisfy the gate. But
prose style affects reviewability and re-use over time.

## Options considered

- **Option A (semantic-only)** — describe what the linked endpoint
  consumes / depends on:
  `| Item CRUD producers | [./01-information-model.md] |`
- **Option B (back-link tagged)** — explicitly mark the row as a
  reciprocal back-link, naming the originating endpoint:
  `| ← Item CRUD producers (forward link from) | [./01-information-model.md] |`
- **Option C (auto-formulaic)** — uniform row like
  `| Reciprocal back-link | [./xx.md] |` for every entry.

## Decision

**Option B.** Rationale:

1. **Distinguishes back-links from authored cross-refs.** The 3 target
   files already had authored Cross-References rows (e.g., "Full
   transport contract", "Roles SSOT"). Mixing 8 new rows in without a
   visual marker would conflate "I deliberately link out to X" with
   "X links to me." The `←` arrow + parenthetical "(forward link
   from)" makes the difference scannable.
2. **Keeps semantic content.** Each new row still names the topic
   ("Item CRUD producers", "Mirror peer-group events", etc.), so a
   reviewer can judge appropriateness without opening the source file.
3. **Avoids cargo-cult.** Per ambiguity #30 §"Why not auto-drain", we
   reject auto-inserted formulaic boilerplate. Option C (uniform
   "Reciprocal back-link" labels) would have been the formulaic
   anti-pattern.

## Trade-off accepted

The `←` arrow is a visual convention not enforced by the gate. Future
authors adding back-links to drain G-31.2 / G-31.4 queues are NOT
required to use this format — only required to add a link. We document
this in the SSOT v2.1.0 changelog as a recommended convention, not a
gate-enforced rule.
