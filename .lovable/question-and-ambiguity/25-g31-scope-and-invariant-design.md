# Ambiguity #25 — F29 G-31 design: scope, allow-list semantics, exclusions

**Date:** 2026-04-27
**Task:** F29 (promote `/tmp/audit_xrefs.mjs` to permanent gate G-31)
**Decision class:** Gate scope + invariant choice

## The branch points

Promoting a prototype audit script to a permanent CI gate is not just a
code-move — it forces several scope decisions that weren't relevant when
the script was a one-shot probe.

### Choice 1: What's the invariant?

Three candidates considered:

- **Reciprocity** (chosen): every directed cross-flow link must have a
  back-link. Local invariant. Easy to fix per violation.
- **Strong connectivity**: cross-flow graph must be strongly connected.
  Global invariant. Hard to fix — "make this less star-shaped" is not
  actionable in PR review.
- **Bidirectional density floor**: every flow must reciprocate at least
  N peers. Arbitrary threshold; hostile to legitimately-isolated flows
  like `01-keyboard-shortcuts.md`.

**Decision: reciprocity.** It catches the F25 drift class without
overreach. Documented rationale in SSOT §"Why reciprocity not graph
connectivity".

### Choice 2: What counts as a flow file?

Two candidates:

- **All `*.md` in `02-workflows/`**: includes `00-overview.md`,
  `97-acceptance-criteria.md`, `01-keyboard-shortcuts.md`. These are
  indices/registries, not flows — including them would generate
  false-positive asymmetries (the overview file links to ALL flows;
  no flow links back to overview).
- **Strict `/^\d{2}-.+-flow\.md$/` pattern** (chosen): only files whose
  names end in `-flow.md` qualify. The overview, AT registry, and
  keyboard-shortcut reference are excluded by design.

**Decision: strict regex.** Mirrors how G-30's consumer-scope works
(named filters, not directory walks). Documented in SSOT §Scope.

### Choice 3: Should the allow-list be string-keyed or object-keyed?

- **Object-keyed** (e.g. `{ from: "10-...", to: "02-...", reason: "…" }`):
  more structured; rationale lives next to the entry.
- **String-keyed** (chosen, e.g. `"10-... → 02-..."`): simpler set
  membership check; rationale lives in adjacent `// comment`.

**Decision: string-keyed.** Matches the `REDUNDANCY_ALLOWLIST` pattern
from G-30.2 (consistent across the gate family). The runner does a
single `.has()` check per directed pair — no need for richer querying.
A future enhancement (logged as F-future-G31b) could machine-check that
every allow-list entry has a rationale comment.

### Choice 4: Cross-domain references — in scope?

A workflow file frequently links to feature files (`01-features/*`),
endpoints (`06-endpoints/*`), or DB diagrams (`07-db-diagram/*`). Should
G-31 enforce that those targets link BACK to the workflow?

**Decision: no, out of scope.** A feature file is a generic SSOT; a
workflow contextualises it. Forcing back-links would pollute feature
files with workflow-specific cross-refs, inverting the
specific→generic dependency direction.

## What surprised me

The matrix-build phase for prototype `/tmp/audit_xrefs.mjs` and for the
production runner are **identical** (same regex, same substring
detection, same set semantics). The 90% of the work in F29 was NOT the
algorithm — it was:

1. **Exit code typing** (0 / 1 / 2 vs prototype's "always 0").
2. **Allow-list infrastructure** (didn't exist in prototype).
3. **Output formatting** to match the G-29/G-30 visual conventions
   (header line + summary counters + per-violation hint + suppression
   instructions).
4. **SSOT documentation** (~190 lines; the prototype had a docstring
   but no design rationale, no exit-code table, no scope justification).
5. **Scope-decision documentation** (this file).

This is healthy — the prototype was right to be 50 lines; the production
gate is right to be 145 lines + 190 lines of SSOT.

## Future-promotion ladder (deferred — NOT F29)

Three further escalation steps logged in the SSOT:

1. **F-future-G31a**: Extend scope to other folders with `## Related`
   sections. Requires deciding whether reciprocity is the right
   invariant for non-flow content.
2. **F-future-G31b**: Add G-31.2 enforcing every `ASYMMETRIC_BY_DESIGN`
   entry has a rationale comment (machine-checkable; mirrors G-30.3
   plan).
3. **F-future-G31c**: Detect documentation-island flow files (no
   incoming, no outgoing). These are smells but not always bugs.

## Files changed

- `scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs` (new, v1.0.0)
- `scripts/spec-hygiene/00-run-all.mjs` (registered new check)
- `spec/31-app/05-conventions/02-ci-quality-gates.md` (added G-31 row, updated note)
- `spec/31-app/05-conventions/24-g31-workflow-xref-reciprocity-gate.md` (new SSOT, v1.0.0)
