---
slug: g31-workflow-xref-reciprocity-gate
version: 2.4.0
updated: 2026-04-27
parent: ../../05-conventions/02-ci-quality-gates.md
status: canonical
gate_id: G-31
---

# G-31 — Cross-Reference Reciprocity Gate

> **Version:** 2.4.0
> **Updated:** 2026-04-27 (UTC+8) — v2.4.0 (F-future-G31b) added the **G-31.5 meta sub-check** enforcing rationale comments on every entry of the 4 per-scope exemption Sets (`WORKFLOWS_EXEMPT` / `FEATURES_EXEMPT` / `ENDPOINTS_EXEMPT` / `DB_DIAGRAM_EXEMPT`). Algorithm ported verbatim from G-32.4 (`32-check-ddl-unique-coverage.mjs` v4.0.0): trailing inline `// …` OR contiguous `// …` line(s) directly above with no blank-line gap; sample/template `// "…"` lines are skipped. All 4 Sets are currently empty so the gate ships green; this locks the convention before the first exemption is added so authors can't sneak in silent suppressions. Earlier: v2.3.0 drained features (30 → 0); v2.2.0 drained db-diagram (6 → 0); v2.1.0 drained endpoints (8 → 0); v2.0.0 generalised to N parameterised scopes; v1.0.0 originated as the F25 prototype `/tmp/audit_xrefs.mjs` covering only workflows.
> **Parent:** [`02-ci-quality-gates.md`](./02-ci-quality-gates.md)
> **Sibling:** [`23-g30-at-citation-validity-gate.md`](./23-g30-at-citation-validity-gate.md), [`25-g32-ddl-unique-coverage-gate.md`](./25-g32-ddl-unique-coverage-gate.md)
> **Runner:** [`scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs`](../../../scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs)

---

## Sub-checks

| ID       | Scope            | Mode  | Folder                       | Files (current) | Asymmetries (current) | Added in |
|----------|------------------|-------|------------------------------|-----------------|------------------------|----------|
| G-31.1   | workflows        | ERROR | `spec/31-app/02-workflows/`  | 9               | 0 ✅                  | v1.0.0   |
| G-31.2   | features         | ERROR | `spec/31-app/01-features/`   | 23              | 0 ✅                  | v2.0.0 (WARN) → v2.3.0 (ERROR) |
| G-31.3   | endpoints        | ERROR | `spec/31-app/06-endpoints/`  | 19              | 0 ✅                  | v2.0.0 (WARN) → v2.1.0 (ERROR) |
| G-31.4   | db-diagram       | ERROR | `spec/31-app/07-db-diagram/` | 7               | 0 ✅                  | v2.0.0 (WARN) → v2.2.0 (ERROR) |
| G-31.5   | meta (rationale) | ERROR | (runner self)                | 4 Sets, 0 entries | 0 ✅                | v2.4.0   |

**Mode semantics:**
- **ERROR** — any asymmetry (or, for G-31.5, any unrationaled exemption entry) contributes to exit code 1; CI fails.
- **WARN** — asymmetries are reported in stdout but exit code stays 0. Used as a staged-rollout pattern (mirrors F24/F27/F28 G-30.2 rollout): introduce the check, surface drift, drain via follow-up tasks, then promote to ERROR.

A scope is promoted to ERROR by changing the literal `mode: "warn"` to `mode: "error"` on its entry in the runner's `SCOPES` array. No other code changes are needed.



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

| # | Path | Filter | Excluded aggregators | Headings recognised | Mode | Notes |
|---|------|--------|----------------------|---------------------|------|-------|
| 1 | `spec/31-app/02-workflows/` | `/^\d{2}-.+-flow\.md$/` | (regex already strict) | `## Related` | ERROR | Drained F25 → 0 asymmetries; current state ✅ |
| 2 | `spec/31-app/01-features/`  | `/^\d{2}[a-z]?-.+\.md$/i` | `00-overview`, `02-personas`, `05a-hotkey-table`, `97-acceptance-criteria`, `99-consistency-report` | `## Related`, `## Cross-References`, `## See also` | ERROR | Drained 2026-04-27 (30 → 0); promoted to ERROR in v2.3.0 |
| 3 | `spec/31-app/06-endpoints/` | `/^\d{2}[a-z]?-.+\.md$/i` | `00-overview`, `16-endpoint-at-matrix`, `97-acceptance-criteria`, `99-consistency-report` | `## Related`, `## Cross-References`, `## See also` | ERROR | Drained 2026-04-27 (8 → 0); promoted to ERROR in v2.1.0 |
| 4 | `spec/31-app/07-db-diagram/` | `/^\d{2}-.+\.md$/` (top-level only — skips `sql/` subfolder) | `00-overview`, `97-acceptance-criteria`, `99-consistency-report` | `## Cross-References`, `## Related`, `## See also` | ERROR | Drained 2026-04-27 (6 → 0); promoted to ERROR in v2.2.0 |

The runner reads each scoped file's back-link section (text from the first matching heading until the next H2 that isn't another related-head variant). A "link" to a sibling file is detected by literal filename substring match within that section — this catches both bare references (`05-trash-reaper-flow.md`) and markdown links (`[label](./05-trash-reaper-flow.md)`).

**Why three heading variants?** Different folders adopted different conventions before G-31 existed: workflows use `## Related`; db-diagram historically used `## Cross-References`; some features pages use `## See also`. Rather than force a renaming sweep, the runner accepts any of the three (in scope-specific priority order). A future task can normalise heading names if drift becomes a pain.

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

Two further enhancements remain (F-future-G31a and F-future-G31b are both complete):

1. **F-future-G31c**: Detect "unreferenced" sibling files (a file that no other sibling links to AND that links to no other sibling). These are documentation islands — likely a smell, but not always a bug.
2. **F-future-G31d** (newly logged): A heading-name normalisation sweep — pick one of `## Related` / `## Cross-References` / `## See also` per scope and rename the others. Currently the runner accepts all three (in scope-priority order) for back-compat; once drained, this flexibility is dead weight.

Logging here so they're discoverable when "check memory for remaining tasks" runs in a later loop.

---

## Change history

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-04-27 | F29 — initial implementation; promoted from F25 prototype `/tmp/audit_xrefs.mjs`; allow-list empty; current state ✅ 28 reciprocated cross-flow links across 9 files. |
| 2.0.0 | 2026-04-27 | F-future-G31a — generalised the runner from a single workflows scope to **N parameterised scopes** with per-scope `mode: "error" \| "warn"`. New `SCOPES` registry array (each entry: `id`, `label`, `dir`, `filenameRx`, `excludeRx`, `relatedHeads[]`, `mode`, `exemptions`). New helpers: per-scope `listSiblingFiles()`, `extractRelatedSection()` accepts multiple heading variants in priority order and stops at next H2 that isn't another related-head, `printScopeReport()` emits per-scope `❌`/`⚠️` verdict + (WARN-only) drain-and-promote hint, `findAsymmetries()` consults per-scope exemption Set. Final exit = `totalErrorAsym === 0 ? 0 : 1` (WARN drift never fails). 4 separate exemption Sets: `WORKFLOWS_EXEMPT`, `FEATURES_EXEMPT`, `ENDPOINTS_EXEMPT`, `DB_DIAGRAM_EXEMPT` (all empty at v2.0.0). Added 3 new sub-checks: G-31.2 features (23 files, 64 cross-links, 30 asymmetries WARN), G-31.3 endpoints (19 files, 8 cross-links, 8 asymmetries WARN), G-31.4 db-diagram (7 files, 8 cross-links, 6 asymmetries WARN). Negative-tested: ERROR-scope drift in `02-workflows/04-trash-restore-flow.md` (sed-rewrote one filename) → exit 1; restored → exit 0. WARN-scope drift surfaces in stdout but stays exit 0. Master runner unchanged. Promotion path (per-scope `mode` flip) is documented in §Sub-checks. |
| 2.1.0 | 2026-04-27 | F-future-G31a-promote-endpoints — drained the G-31.3 endpoints WARN scope from 8 unreciprocated forward-links to 0 by adding back-link rows to three target files' `## Cross-References` tables: `14-concurrency-and-sync.md` (×5: from `01-information-model`, `09-mirrors`, `09b-mirror-peer-group`, `11-trash-view`, `14b-sync-replay`), `15-roles-and-permissions.md` (×2: from `02-personas`, `08-share-dialog`), and `11-trash-view.md` (×1: from `11b-trash-reaper`). Each new row is prefixed with `← <topic> (forward link from)` to make the back-link's purpose self-documenting. Cross-References link count rose from 8 to 16 (matched 8↔8). Promoted `G-31.3` from `mode: "warn"` to `mode: "error"` in the runner's `SCOPES` registry. Negative-tested: removing one of the new rows → exit 1; restored → exit 0. Decision rationale (cargo-cult avoidance): each new row names the originating endpoint explicitly so reviewers can trace the reason for the link rather than seeing formulaic boilerplate (per ambiguity log #30 §"Why not auto-drain"). |
| 2.2.0 | 2026-04-27 | F-future-G31a-promote-db-diagram — drained the G-31.4 db-diagram WARN scope from 6 unreciprocated forward-links to 0 by adding back-link rows to five target files' `## Cross-References` tables: `02-root-db-erd.md` (×1: from `01-master-erd`), `03-app-db-erd.md` (×2: from `01-master-erd`, `04-feature-slices`), `06-indexes.md` (×2: from `01-master-erd`, `07-migrations`), `04-feature-slices.md` (×1: from `03-app-db-erd`), and `05-lifecycle-flows.md` (×1: from `04-feature-slices`). Reused the `← <topic> (forward link from)` row-prose convention established in v2.1.0 (per ambiguity #31). Cross-References link count rose from 8 to 14 (matched 7↔7 — the 8th original forward-link was an already-symmetric pair). Promoted `G-31.4` from `mode: "warn"` to `mode: "error"` in the runner's `SCOPES` registry. Final state: G-31.1 (workflows) ✅, G-31.3 (endpoints) ✅, G-31.4 (db-diagram) ✅ all ERROR-mode at 0; only G-31.2 (features, 30 asymmetries) remains in WARN. `node 31-check-...mjs` exits 0. |
