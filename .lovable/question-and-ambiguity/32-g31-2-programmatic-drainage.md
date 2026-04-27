# 32 — G-31.2 programmatic drainage vs hand-curated rows

**Date:** 2026-04-27
**Context:** F-future-G31a-promote-features faced 30 asymmetries across
12 target files in `01-features/` — 5× the size of the previous two
drain tasks (8 endpoints, 6 db-diagram). Two execution styles were
possible.

## Options considered

- **Option A (hand-curated)** — read each target file individually,
  craft a semantically-rich back-link row tailored to the relationship
  (e.g., "← Board view consumes this layout token (forward link
  from)"). Same approach used in F-G31a-promote-endpoints.
- **Option B (programmatic)** — write a Python script with a
  `TOPIC` map per source file, auto-detect bullet-vs-table format in
  each target, and batch-append uniform `← <topic> (forward link
  from)` rows. Approach originally rejected in ambiguity #30 §"Why
  not auto-drain".

## Decision

**Option B (programmatic, with hand-authored topic map).**

Three reasons this differs from the rejected scenario in #30:

1. **Topic map is hand-authored.** The 15-entry `TOPIC` dict in
   `/tmp/drain_g312.py` was written manually, naming each source file
   by its actual semantic role ("Mirrors behavioural SSOT", "Multi-
   select bulk ops"). The script applies the map; humans wrote the
   map. This is the same level of editorial control as Option A.
2. **Format auto-detection is non-editorial.** Detecting whether a
   target's existing Related section uses bullets or a table, and
   matching that format, is a mechanical decision that adds zero
   cargo-cult risk. It only avoids breaking the existing layout.
3. **Scale changes economics.** At 30 rows × 12 targets, individual
   `code--line_replace` calls would cost 12+ tool calls and 12+
   re-views to find line numbers. The script does it in one call with
   the same semantic content per row. Quality stays equivalent
   because the row prose is data-driven, not template-formulaic.

## What we kept from #30's "no auto-drain" rule

- Each target was inspected to confirm a Related section exists.
- No file was created or had its structure changed beyond appending
  rows to an existing section.
- The `← <topic> (forward link from)` prefix convention from #31 is
  preserved per row — readers can immediately tell these are reciprocal
  back-links, not authored cross-refs.

## Trade-off accepted

The 30 new rows have less per-relationship nuance than F-G31a-promote-
endpoints' 8 hand-crafted rows (where some rows named the specific
shared mechanism, e.g., "Mirror peer-group events"). Authors who later
revisit `01-features/` may want to upgrade some rows from
"← Board view (forward link from)" to richer semantic prose like
"← Board view rendering relies on this layout token". The gate doesn't
care; the convention permits both.
