---
slug: g31-workflow-xref-reciprocity-gate
version: 1.0.0
updated: 2026-04-27
parent: ../../05-conventions/02-ci-quality-gates.md
status: canonical
gate_id: G-31
---

# G-31 — Workflow Cross-Reference Reciprocity Gate

> **Version:** 1.0.0
> **Updated:** 2026-04-27 (UTC+8)
> **Parent:** [`02-ci-quality-gates.md`](./02-ci-quality-gates.md)
> **Sibling:** [`23-g30-at-citation-validity-gate.md`](./23-g30-at-citation-validity-gate.md)
> **Runner:** [`scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs`](../../../scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs)

---

## Why this gate exists

F25 (2026-04-27) audited the 9 workflow files in `spec/31-app/02-workflows/`
and found **6 asymmetric forward-links** in their `## Related` sections —
file A linked to file B, but B did not link back to A. Triage showed:

- 5 of 6 represented **real semantic gaps** that authors had simply
  forgotten (e.g. `08-mirror-detach-flow.md` had no back-link from
  `09-mirror-create-flow.md` despite being its inverse path).
- 1 of 6 was **cargo-cult boilerplate** ("sister cross-feature flow"
  comment) which we deliberately deleted rather than reciprocate.

Without an automated check, this drift class re-accumulates every time a
new workflow file is authored or an existing one is split. G-31 prevents
silent regression by failing CI on any new asymmetric forward-link.

---

## Scope

| # | Path | Filter | Notes |
|---|------|--------|-------|
| 1 | `spec/31-app/02-workflows/` | Filenames matching `/^\d{2}-.+-flow\.md$/` | The `00-overview.md`, `97-acceptance-criteria.md`, and `01-keyboard-shortcuts.md` files are excluded — they're indices/registries, not flows |

The runner reads each flow file's `## Related` section (text from the
`## Related` heading until the next non-`R` H2). A "link" to another flow
file is detected by literal filename substring match within that section
— this catches both bare references (`05-trash-reaper-flow.md`) and
markdown links (`[label](./05-trash-reaper-flow.md)`).

---

## Algorithm

```
1. List all NN-*-flow.md files in 02-workflows/ (sorted).
2. For each file F:
     a. Read F.
     b. Extract the ## Related section (heading → next non-R H2).
     c. For every other flow file G, record an edge F → G if G's
        filename appears anywhere inside the Related section.
3. For every directed edge F → G:
     a. If G has no edge G → F, AND
     b. The pair `${F} → ${G}` is NOT in ASYMMETRIC_BY_DESIGN,
     then report it as a violation.
4. Print summary + per-violation hint.
5. Exit 0 if zero violations, else exit 1.
```

The `## Related` section may legitimately be absent — that simply means
the file has no outgoing cross-flow links, and is not a violation.

---

## Allow-list (`ASYMMETRIC_BY_DESIGN`)

Empty as of v1.0.0. Authors who want to keep an intentional one-way
reference (e.g. a migration runbook citing a user-facing flow but the
user flow not needing to know about migrations) MUST add the directed
pair as a string entry with a one-line `// rationale` comment:

```js
const ASYMMETRIC_BY_DESIGN = new Set([
  "10-migration-execution-flow.md → 02-template-application-flow.md",
  // (reason: migration is bootstrap-only; template flow is user-time)
]);
```

This mirrors the F27/F28 pattern used by G-30.2's `REDUNDANCY_ALLOWLIST`:
explicit opt-out with written justification rather than silent suppression.

---

## Output examples

**Clean state (current).**
```
G-31 workflow ## Related reciprocity:
  flow files scanned:                 9
  cross-flow Related links found:     28
  asymmetric-by-design (allow-list):  0
  unreciprocated forward-links:       0
  ✅ all cross-flow Related links reciprocated
```

**Drift detected.**
```
G-31 workflow ## Related reciprocity:
  flow files scanned:                 9
  cross-flow Related links found:     27
  asymmetric-by-design (allow-list):  0
  unreciprocated forward-links:       1

  ❌ 1 asymmetric link(s) — target file is missing back-link in its ## Related section:

    05-trash-reaper-flow.md  →  04-trash-restore-flow.md    (add back-link in 04-trash-restore-flow.md)

  To suppress an intentional one-way reference, add the directed
  pair to ASYMMETRIC_BY_DESIGN in this runner with a rationale.
```

---

## Exit codes

| Code | Meaning |
|------|---------|
| 0 | All cross-flow Related links reciprocated (or covered by allow-list) |
| 1 | One or more asymmetric forward-links detected |
| 2 | Runner error (missing directory, malformed file, etc.) |

---

## Out of scope

- **Cross-domain references** (e.g. a workflow file linking to a
  `01-features/` or `06-endpoints/` file). These are healthy
  one-directional references — the workflow contextualises the
  feature/endpoint, but the feature/endpoint stays generic.
- **Within-section references** to `00-overview.md`, parent indexes,
  or the keyboard-shortcuts reference. Same rationale as cross-domain.
- **Link semantics validation** (e.g. checking that the link text
  describes the relationship correctly). G-31 only validates structural
  reciprocity; semantic quality is reviewer territory.
- **Acceptance-criteria cross-references** between flow files. Those
  are governed by G-30 (AT citation validity).

---

## Why "reciprocity" not "graph connectivity"

A stronger gate could require the cross-flow reference graph to be
**strongly connected** (every flow reachable from every other). We
deliberately do NOT enforce this because:

1. Some flows are genuinely independent (e.g. `01-keyboard-shortcuts.md`
   relates to no other flow).
2. Connectivity-based metrics (centrality, articulation points) are hard
   to act on in PR review — "make this graph less star-shaped" is not a
   useful CI message.
3. Reciprocity is a **local** invariant: if A↔B is wrong, the fix is
   obvious and bounded. Connectivity is a **global** property whose
   "fix" could touch any number of files.

Reciprocity catches the F25 drift class without overreach.

---

## Future-promotion ladder (not scoped to this gate)

Three further enhancements remain available for future tasks:

1. **F-future-G31a**: Extend scope to other folders with `## Related`
   sections (e.g. `01-features/`, `06-endpoints/`). Requires deciding
   whether reciprocity is the right invariant for non-flow content.
2. **F-future-G31b**: Add a G-31.2 sub-check enforcing that every
   `ASYMMETRIC_BY_DESIGN` entry has a corresponding rationale comment
   in the runner source (machine-checkable, mirrors G-30.3 plan).
3. **F-future-G31c**: Detect "unreferenced" flow files (a flow file
   that no other file links to AND that links to no other file). These
   are documentation islands — likely a smell, but not always a bug.

Logging here so they're discoverable when "check memory for remaining
tasks" runs in a later loop.

---

## Change history

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-04-27 | F29 — initial implementation; promoted from F25 prototype `/tmp/audit_xrefs.mjs`; allow-list empty; current state ✅ 28 reciprocated cross-flow links across 9 files |
