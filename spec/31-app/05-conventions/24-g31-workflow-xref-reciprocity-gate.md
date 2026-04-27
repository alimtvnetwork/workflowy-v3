---
slug: g31-workflow-xref-reciprocity-gate
version: 2.5.0
updated: 2026-04-27
parent: ../../05-conventions/02-ci-quality-gates.md
status: canonical
gate_id: G-31
---

# G-31 — Cross-Reference Reciprocity Gate

> **Version:** 2.5.0
> **Updated:** 2026-04-27 (UTC+8) — v2.6.0 (F-future-G31d) added the **G-31.7 canonical-heading normalisation sub-check** (WARN advisory): each scope declares one `canonicalHead` (workflows + features → `## Related`; endpoints + db-diagram → `## Cross-References`); files using one of the OTHER accepted variants (`## Cross-References` / `## See also` / etc.) are flagged so authors can normalise prose for cross-scope readability. Reciprocity logic still accepts ALL variants (back-compat preserved). Per-scope `*_HEAD_EXEMPT` Sets opt out legitimate variants (G-31.5-enforced rationale; ALLOWLIST_NAMES grew 8 → 12). Initial probe: workflows 0, features 3 (`09a-mirror-cycle-detection.md`, `14b-offline-queue.md`, `16-search-ranking.md` all use `## Cross-References` instead of canonical `## Related`), endpoints 0, db-diagram 0. Earlier: v2.5.0 added G-31.6 island-detection (WARN); v2.4.0 added the G-31.5 meta sub-check enforcing rationale comments on all per-scope exemption Sets (algorithm ported verbatim from G-32.4); v2.3.0 drained features (30 → 0); v2.2.0 drained db-diagram (6 → 0); v2.1.0 drained endpoints (8 → 0); v2.0.0 generalised to N parameterised scopes; v1.0.0 originated as the F25 prototype `/tmp/audit_xrefs.mjs`.
> **Parent:** [`02-ci-quality-gates.md`](./02-ci-quality-gates.md)
> **Sibling:** [`23-g30-at-citation-validity-gate.md`](./23-g30-at-citation-validity-gate.md), [`25-g32-ddl-unique-coverage-gate.md`](./25-g32-ddl-unique-coverage-gate.md)
> **Runner:** [`scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs`](../../../scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs)

---

## Sub-checks

| ID       | Scope            | Mode  | Folder                       | Files (current) | Violations (current) | Added in |
|----------|------------------|-------|------------------------------|-----------------|----------------------|----------|
| G-31.1   | workflows        | ERROR | `spec/31-app/02-workflows/`  | 9               | 0 asymmetries ✅      | v1.0.0   |
| G-31.2   | features         | ERROR | `spec/31-app/01-features/`   | 23              | 0 asymmetries ✅      | v2.0.0 (WARN) → v2.3.0 (ERROR) |
| G-31.3   | endpoints        | ERROR | `spec/31-app/06-endpoints/`  | 19              | 0 asymmetries ✅      | v2.0.0 (WARN) → v2.1.0 (ERROR) |
| G-31.4   | db-diagram       | ERROR | `spec/31-app/07-db-diagram/` | 7               | 0 asymmetries ✅      | v2.0.0 (WARN) → v2.2.0 (ERROR) |
| G-31.5   | meta (rationale) | ERROR | (runner self)                | 12 Sets, 0 entries | 0 unrationaled ✅    | v2.4.0   |
| G-31.6   | islands (advisory) | WARN | all 4 scopes               | 58 (sum)        | 14 islands ⚠️         | v2.5.0   |
| G-31.7   | heading (advisory) | WARN | all 4 scopes               | 58 (sum)        | 3 heading-drift ⚠️    | v2.6.0   |

**Mode semantics:**
- **ERROR** — any asymmetry, or any unrationaled exemption entry (G-31.5), contributes to exit code 1; CI fails.
- **WARN** — violations are reported in stdout but exit code stays 0. G-31.6 (islands) and G-31.7 (heading drift) are permanent-WARN by design (not staged rollouts) — both are smells, not always bugs (a heading variant may be intentional for cross-domain pages; a leaf may legitimately have no peers). The historical staged-rollout pattern was for the 4 reciprocity scopes (G-31.2 / G-31.3 / G-31.4) and is now complete.

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

Two enhancements remain (F-future-G31a, G31b, G31c, and G31d are all complete):

1. **F-future-G31e** (logged at v2.5.0): Drain the 14 G-31.6 island advisories (workflows 0, features 5, endpoints 9, db-diagram 0) — for each island, either author one peer cross-reference (preferred — strengthens the doc graph) or add the bare filename to the per-scope `*_ISLAND_EXEMPT` Set with a rationale (acceptable for genuine leaves). Most islands are MVP-leaf addendum slices (`07b/08b/11b/12b/13b` from F1–F5) and self-contained endpoint pages — triage required to decide per file. Once the queue reaches 0 across all scopes, G-31.6 could be promoted from WARN to ERROR; alternatively, leave it permanent-WARN since "is this file a leaf?" is sometimes a judgement call.
2. **F-future-G31f** (newly logged at v2.6.0): Drain the 3 G-31.7 heading-drift advisories (`01-features/09a-mirror-cycle-detection.md`, `01-features/14b-offline-queue.md`, `01-features/16-search-ranking.md` — all use `## Cross-References` instead of canonical `## Related`). Either rename the heading in each file or add the bare filename to `FEATURES_HEAD_EXEMPT` with a rationale (e.g. "uses Cross-References intentionally because the linked content is cross-domain rather than peer-feature"). Once drained, the runner's per-scope `relatedHeads[]` could be tightened to a single string for each scope (currently keeps all 3 variants for back-compat).

Logging here so they're discoverable when "check memory for remaining tasks" runs in a later loop.

---

## Change history

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-04-27 | F29 — initial implementation; promoted from F25 prototype `/tmp/audit_xrefs.mjs`; allow-list empty; current state ✅ 28 reciprocated cross-flow links across 9 files. |
| 2.0.0 | 2026-04-27 | F-future-G31a — generalised the runner from a single workflows scope to **N parameterised scopes** with per-scope `mode: "error" \| "warn"`. New `SCOPES` registry array (each entry: `id`, `label`, `dir`, `filenameRx`, `excludeRx`, `relatedHeads[]`, `mode`, `exemptions`). New helpers: per-scope `listSiblingFiles()`, `extractRelatedSection()` accepts multiple heading variants in priority order and stops at next H2 that isn't another related-head, `printScopeReport()` emits per-scope `❌`/`⚠️` verdict + (WARN-only) drain-and-promote hint, `findAsymmetries()` consults per-scope exemption Set. Final exit = `totalErrorAsym === 0 ? 0 : 1` (WARN drift never fails). 4 separate exemption Sets: `WORKFLOWS_EXEMPT`, `FEATURES_EXEMPT`, `ENDPOINTS_EXEMPT`, `DB_DIAGRAM_EXEMPT` (all empty at v2.0.0). Added 3 new sub-checks: G-31.2 features (23 files, 64 cross-links, 30 asymmetries WARN), G-31.3 endpoints (19 files, 8 cross-links, 8 asymmetries WARN), G-31.4 db-diagram (7 files, 8 cross-links, 6 asymmetries WARN). Negative-tested: ERROR-scope drift in `02-workflows/04-trash-restore-flow.md` (sed-rewrote one filename) → exit 1; restored → exit 0. WARN-scope drift surfaces in stdout but stays exit 0. Master runner unchanged. Promotion path (per-scope `mode` flip) is documented in §Sub-checks. |
| 2.1.0 | 2026-04-27 | F-future-G31a-promote-endpoints — drained the G-31.3 endpoints WARN scope from 8 unreciprocated forward-links to 0 by adding back-link rows to three target files' `## Cross-References` tables: `14-concurrency-and-sync.md` (×5: from `01-information-model`, `09-mirrors`, `09b-mirror-peer-group`, `11-trash-view`, `14b-sync-replay`), `15-roles-and-permissions.md` (×2: from `02-personas`, `08-share-dialog`), and `11-trash-view.md` (×1: from `11b-trash-reaper`). Each new row is prefixed with `← <topic> (forward link from)` to make the back-link's purpose self-documenting. Cross-References link count rose from 8 to 16 (matched 8↔8). Promoted `G-31.3` from `mode: "warn"` to `mode: "error"` in the runner's `SCOPES` registry. Negative-tested: removing one of the new rows → exit 1; restored → exit 0. Decision rationale (cargo-cult avoidance): each new row names the originating endpoint explicitly so reviewers can trace the reason for the link rather than seeing formulaic boilerplate (per ambiguity log #30 §"Why not auto-drain"). |
| 2.2.0 | 2026-04-27 | F-future-G31a-promote-db-diagram — drained the G-31.4 db-diagram WARN scope from 6 unreciprocated forward-links to 0 by adding back-link rows to five target files' `## Cross-References` tables: `02-root-db-erd.md` (×1: from `01-master-erd`), `03-app-db-erd.md` (×2: from `01-master-erd`, `04-feature-slices`), `06-indexes.md` (×2: from `01-master-erd`, `07-migrations`), `04-feature-slices.md` (×1: from `03-app-db-erd`), and `05-lifecycle-flows.md` (×1: from `04-feature-slices`). Reused the `← <topic> (forward link from)` row-prose convention established in v2.1.0 (per ambiguity #31). Cross-References link count rose from 8 to 14 (matched 7↔7 — the 8th original forward-link was an already-symmetric pair). Promoted `G-31.4` from `mode: "warn"` to `mode: "error"` in the runner's `SCOPES` registry. Final state: G-31.1 (workflows) ✅, G-31.3 (endpoints) ✅, G-31.4 (db-diagram) ✅ all ERROR-mode at 0; only G-31.2 (features, 30 asymmetries) remains in WARN. `node 31-check-...mjs` exits 0. |
| 2.3.0 | 2026-04-27 | F-future-G31a-promote-features — drained the G-31.2 features WARN scope from 30 unreciprocated forward-links to 0 by programmatically appending back-link rows across 12 target files via `/tmp/drain_g312.py` (insertion under existing `## Related` / `## Cross-References` sections, preserving each target's native bullet-vs-table format; reused the `← <topic> (forward link from)` row-prose convention from v2.1.0/v2.2.0). Cross-sibling link count rose from 64 to 94 (matched 47↔47). Promoted `G-31.2` from `mode: "warn"` to `mode: "error"`. **All 4 G-31 sub-checks now ERROR-mode at 0 asymmetries — staged WARN-then-ERROR rollout complete.** |
| 2.4.0 | 2026-04-27 | F-future-G31b — added the **G-31.5 meta sub-check** enforcing rationale comments on every entry of the 4 per-scope exemption Sets (`WORKFLOWS_EXEMPT` / `FEATURES_EXEMPT` / `ENDPOINTS_EXEMPT` / `DB_DIAGRAM_EXEMPT`). New helpers `findUnrationaledEntries()` + `printRationaleReport()` ported verbatim from G-32.4 (`32-check-ddl-unique-coverage.mjs` v4.0.0 `findUnrationaledEntries()`), parameterised on a 4-name `ALLOWLIST_NAMES` array and a `SELF_PATH` constant. Algorithm: for each named Set, parse the runner's own source between the `const NAME = new Set([` opener and the next `]`; for every active entry line (matches `/^\s*"…"…/`, sample lines `// "…"` skipped) accept either (a) trailing inline `// …` on the same line or (b) at least one contiguous `// …` line directly above with no blank-line gap (pure separator comments like `// ====` are skipped). Final exit changed from `totalErrorAsym === 0 ? 0 : 1` to `failed = totalErrorAsym > 0 \|\| unrationaled.length > 0` so unrationaled entries fail the gate. Updated comment block above the 4 Set declarations: removed the stale "informational; not yet machine-enforced" note, replaced with "machine-enforced by G-31.5 since v2.4.0". All 4 Sets are currently empty so the gate ships green; this locks in the convention before any exemption is added. Negative-tested: injecting `"foo.md → bar.md"` (no rationale) into `FEATURES_EXEMPT` → exit 1 with `[FEATURES_EXEMPT]` violation row; restored → exit 0. Positive-tested both rationale styles (trailing `// rationale: …` AND `// rationale: …` line above) → exit 0. Master runner output enriched with a 5th sub-check section + summary now reports unrationaled-entry count alongside ERROR/WARN asymmetries. |
| 2.5.0 | 2026-04-27 | F-future-G31c — added the **G-31.6 island-detection sub-check** (WARN advisory). New helpers `findIslands(scope, files, matrix)` (derives an incoming-link tally from the existing outgoing matrix in O(N²); filters to files where both tallies are 0 and the bare filename is not in `scope.islandExemptions`) + `printIslandReport(scope, files, islands)` (per-scope ⚠️ block listing each island filename + cleanup hint). Added 4 new exemption Sets `WORKFLOWS_ISLAND_EXEMPT` / `FEATURES_ISLAND_EXEMPT` / `ENDPOINTS_ISLAND_EXEMPT` / `DB_DIAGRAM_ISLAND_EXEMPT` (all empty at v2.5.0); registered all 4 in `ALLOWLIST_NAMES` so G-31.5 enforces rationale comments on island opt-outs identically to reciprocity exemptions (8 Sets total scanned by G-31.5 now). Each `SCOPES` entry gained an `islandExemptions` field. Initial probe via `/tmp/probe_islands.mjs` found 14 islands across 2 scopes — workflows 0, **features 5** (`07b-dashboard-view.md`, `08b-sharing-mirror-interaction.md`, `11b-trash-reaper.md`, `12b-multi-select-zoom.md`, `13b-templates-snapshot-semantics.md` — all addendum slices from F1–F5), **endpoints 9** (`03-layout-structure.md`, `04-page-content-area.md`, `05-interactions.md`, `06-item-context-menu.md`, `07-board-view.md`, `10-today-view.md`, `12-multi-select.md`, `13-templates.md`, `15-search.md`), db-diagram 0. Exit-code semantics unchanged: islands are advisory-only and do NOT influence exit (only ERROR-asymmetries and unrationaled exemptions fail). Negative-tested injecting `"07b-dashboard-view.md"` (no rationale) into `FEATURES_ISLAND_EXEMPT` → exit 1 with `[FEATURES_ISLAND_EXEMPT]` G-31.5 violation row; same entry with `// rationale: …` → exit 0, features-island count drops 5→4 and total drops 14→13, named file disappears from the warn list; restored → exit 0 with all 14 advisories back. Master runner output enriched with a 6th sub-check section (per scope) + summary now reports island-advisory count alongside ERROR/WARN asymmetries and unrationaled-entry count. Cleanup of the 14 surfaced islands deferred to F-future-G31e. |
| 2.6.0 | 2026-04-27 | F-future-G31d — added the **G-31.7 canonical-heading normalisation sub-check** (WARN advisory). Each scope declares one `canonicalHead` (the dominant H2 used by the majority of files in that scope: workflows + features → `## Related`; endpoints + db-diagram → `## Cross-References` — picked from a heading inventory across all 4 scopes showing 75 % / 87 % / 70 % majorities). New helpers `findHeadingDrift(scope, files)` (for each non-exempt file, finds the first matching head from `scope.relatedHeads` in priority order via whole-line H2 regex; flags as drift when the found head differs from `canonicalHead`; files with NO related-section heading are NOT flagged here — that's G-31.6's island-advisory job) + `printHeadingReport(scope, files, drift)` (per-scope ⚠️ block listing each drift filename + the variant it uses + cleanup hint). Added 4 new exemption Sets `WORKFLOWS_HEAD_EXEMPT` / `FEATURES_HEAD_EXEMPT` / `ENDPOINTS_HEAD_EXEMPT` / `DB_DIAGRAM_HEAD_EXEMPT` (all empty at v2.6.0); registered all 4 in `ALLOWLIST_NAMES` so G-31.5 enforces rationale comments on heading opt-outs identically to reciprocity + island exemptions (12 Sets total scanned by G-31.5 now). Each `SCOPES` entry gained `canonicalHead` + `headExemptions` fields. Initial run found 3 drift files (all in features scope, all using `## Cross-References` instead of canonical `## Related`): `09a-mirror-cycle-detection.md`, `14b-offline-queue.md`, `16-search-ranking.md`. Reciprocity logic untouched — `relatedHeads[]` still accepts all variants for back-compat (no change to G-31.1 / G-31.2 / G-31.3 / G-31.4 link counts or symmetry verdicts). Exit-code semantics unchanged: heading drift is advisory-only and does NOT influence exit (only ERROR-asymmetries and unrationaled exemptions fail). Negative-tested injecting `"99-no-rationale.md"` (no rationale) into `FEATURES_HEAD_EXEMPT` → exit 1 with `[FEATURES_HEAD_EXEMPT]` G-31.5 violation row referencing line 220; restored → exit 0. Master runner output enriched with a 7th sub-check section (per scope) + summary now reports heading-drift count alongside ERROR/WARN asymmetries, island count, and unrationaled-entry count. Cleanup of the 3 surfaced drift files deferred to F-future-G31f. |
