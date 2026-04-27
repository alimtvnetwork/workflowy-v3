# Ambiguity #23 — F27 G-30.2 drain strategy: allow-list vs row-deletion

**Date:** 2026-04-27
**Task:** F27 (drain G-30.2 open-prefix redundancy queue)
**Decision class:** Implementation strategy

## The branch point

F27's instruction was "delete safe `AT-*-NN` open declarations in batches".
Inspection revealed that **all 36 currently-flagged prefixes** live in two
files where the open-prefix rows are NOT vestigial licensing — they are
intentional **convention documentation**:

1. `spec/31-app/01-features/97-acceptance-criteria.md`
   - The "Coverage Map" table (lines 25–49) lists every feature file's
     **Inline prefix in source** column, e.g. `| 3 | Layout structure | …
     | AT-LAYOUT-NN | AT-APPF-11..15 |`. These rows document the naming
     scheme used inside each source file.
   - F15's v2.3.0 closure note explicitly says: *"the open-prefix
     declarations [...] remain (they document the naming convention)"*.
   - F20's v2.4.0 closure note repeats the same intent.

2. `spec/31-app/02-workflows/00-overview.md`
   - The "Open-prefix declarations (G-30 §RX_DECL_OPEN)" table (lines
     105–116) is normative documentation of every workflow file's
     `AT-WF-{FLOW}-NN` namespace mapped to its canonical `AT-APP-NN`
     range. Deleting these rows would erase the canonical-map
     contract that F11/F16/F17 deliberately built.

## The two options

**Option A — Delete the rows.** Drains the queue via deletion. Loses
naming-scheme documentation. Forces consumers to dig into source files
to discover the prefix-to-canonical mapping. Contradicts F15/F20's
explicit "kept on purpose" intent.

**Option B — Expand `REDUNDANCY_ALLOWLIST` with intent-categories.**
Drains the queue via runner allow-listing. Preserves every Coverage Map
and Open-prefix-declarations row. Requires documenting WHY each prefix
is allow-listed (otherwise the allow-list itself becomes a
maintainability hazard).

## Decision: Option B

Chose Option B because:

1. **Preserves prior intent.** F15 + F20 spent dedicated tasks closing
   citations *without* deleting the documentation rows. F27 should not
   silently undo that decision.

2. **Categorisation makes the allow-list auditable.** The 41 entries
   are grouped into three labelled categories:
   - (a) Future-licensing — 5 entries, reserve namespace for
     not-yet-authored canonical files
   - (b) Convention-documentation — 14 entries, Coverage Map rows
     kept after F15/F20 closure
   - (c) Namespace-placeholder — 22 entries, feature/workflow inline
     prefixes whose citations live under canonical `AT-APP-NN`
   Each entry has a one-line `// comment` rationale next to it.

3. **Unblocks F28 cleanly.** F28 was "promote G-30.2 to default-on"
   gated on F27. With the queue at 0 candidates, F28 can flip
   `WARN_REDUNDANT` to default-on without spurious noise.

## Reversibility

To revisit any specific allow-listed prefix in the future:
1. Delete the entry from `REDUNDANCY_ALLOWLIST` in
   `scripts/spec-hygiene/30-check-at-citation-validity.mjs`.
2. Run `--warn-redundant` to re-surface it as a candidate.
3. If desired, then delete the prose row from the source markdown.

## Risk: allow-list bloat

If future feature files keep declaring open prefixes, the allow-list
will grow. Mitigation: F28 can flip the default to default-on, making
ANY new redundant declaration immediately visible in CI output. New
authors will then be forced to either (a) close their citations, or
(b) add an allow-list entry with a written justification — both of
which are healthier than silent accumulation.

## Files changed

- `scripts/spec-hygiene/30-check-at-citation-validity.mjs` (v1.2.0 → v1.3.0)
- `spec/31-app/05-conventions/23-g30-at-citation-validity-gate.md` (v1.2.0 → v1.3.0)
