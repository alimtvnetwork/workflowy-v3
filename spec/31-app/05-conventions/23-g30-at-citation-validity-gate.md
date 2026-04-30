---
slug: g30-at-citation-validity-gate
version: 1.6.0
updated: 2026-04-27
parent: ../../05-conventions/02-ci-quality-gates.md
status: canonical
gate_id: G-30
---

# G-30 — AT Citation Validity Gate

> **Version:** 1.6.0
> **Updated:** 2026-04-27 (UTC+8) — v1.6.0 (F-future-G30-B) added **G-30.3 meta sub-check** (ERROR) enforcing that every entry in `REDUNDANCY_ALLOWLIST` carries a rationale comment (trailing inline `// …` or contiguous `// …` lines immediately above). Algorithm ported verbatim from G-31.5 (which itself ports G-32.4). Closes the meta gap in the G-30 family — allow-list bloat is now machine-detectable. Initial run: 41 entries, 0 unrationaled (all hand-curated with intent categories during F27/F28). Negative-tested by injecting a bare `"AT-NORATIONALE-"` row → runner correctly exited 1 with `[REDUNDANCY_ALLOWLIST] "AT-NORATIONALE-"` diagnostic. v1.6.0 also restructured `main()` to aggregate G-30.1/2/3 failures into a single `G-30 FAILED:` summary block before exit-1 (cleaner CI diagnostics). Earlier: v1.5.0 promoted G-30.2 WARN→ERROR; v1.4.0 default-on advisory; v1.3.0 drained queue 5→0; v1.2.0 added G-30.2; v1.1.0 extended consumer scopes; v1.0.0 initial gate.
> **Parent:** [`02-ci-quality-gates.md`](./02-ci-quality-gates.md)
> **Sibling:** [`22-g29-endpoint-matrix-coverage-gate.md`](./22-g29-endpoint-matrix-coverage-gate.md)
> **Runner:** [`scripts/spec-hygiene/30-check-at-citation-validity.mjs`](../../../scripts/spec-hygiene/30-check-at-citation-validity.mjs)

---

## Purpose

Prevent **citation drift** — endpoint contracts (and other consumer files)
referencing `AT-*` identifiers that do not exist in any declaration source.

This gate is the natural follow-up to **F9 (2026-04-27)**, where 7 wrong
`AT-APP-*` numbers were discovered in 4 freshly-created endpoint files. A
runtime check is the durable guardrail.

---

## Scope

### Consumer scope (what gets checked)

As of v1.1.0, three scopes are scanned (closes F14):

| # | Path | Recursion | Notes |
|---|------|-----------|-------|
| 1 | `spec/31-app/06-endpoints/` | All `*.md` | Original v1.0.0 scope |
| 2 | `spec/31-app/02-workflows/` | All `*.md` | Cross-feature flow specs (added v1.1.0) |
| 3 | `spec/31-app/07-db-diagram/04-feature-slices.md` | Single file | Per-slice `**ATs**:` cross-refs (added v1.1.0) |

`99-consistency-report.md` is excluded everywhere (audit reports may freely
quote historical IDs).

### Declaration scope (what counts as "registered")

The union of `AT-*` IDs **declared in markdown table rows** of the form
`| \`AT-FOO-NN\` |` in any file under `spec/31-app/`. This is intentionally
broad because the project uses **multiple AT registries by design**:

- `97-acceptance-criteria.md` (canonical AT-APP-NN)
- `01-features/97-acceptance-criteria.md` (frozen AT-APPF-NN dispatch)
- `02-workflows/*.md` (per-workflow AT-WF-* sets)
- `01-features/15-roles-and-permissions.md` (AT-ROLES-*)
- `05-conventions/10..14, 23..24-*.md` (AT-MFA, AT-SSE-PHP, AT-STATE, etc.)
- `06-endpoints/16-endpoint-at-matrix.md` (cross-reference; declares no new IDs)
- `07-db-diagram/sql/00-overview.md` (AT-DDL-*)
- `04a-fixtures/00-overview.md` (AT-FIX-*)

Any future registry file added under `spec/31-app/**` is automatically picked
up — no allow-list maintenance.

---

## Algorithm

```
1. registered = ∅
   for each *.md under spec/31-app/:
     for each line matching `^\| \`(AT-[A-Z][A-Z0-9-]*-?\d+)\` \|`:
       registered.add(id)

2. citations = []
   for each *.md under spec/31-app/06-endpoints/ (excl. 99-consistency-report.md):
     for each match of /`(AT-[A-Z][A-Z0-9-]*-?\d+)`/:
       citations.push({ id, file, line })

3. unregistered = citations.filter(c => !registered.has(c.id))

4. exit 1 if unregistered.length > 0 else exit 0
```

### Declaration regexes

Three independent declaration shapes are accepted:

1. **Single-ID** (`RX_DECL_SINGLE`) — first table cell, optionally backticked:
   ```
   ^\|\s*`?(AT-[A-Z][A-Z0-9-]*-?\d+)`?\s*\|
   ```
   Matches both `` | `AT-APP-01` | `` and `| AT-LAYOUT-01 |`.

2. **Backticked range** (`RX_DECL_RANGE`) — `` `AT-APPF-01..05` ``:
   ```
   `(AT-[A-Z][A-Z0-9]*(?:-[A-Z][A-Z0-9]*)*-)(\d+)\.\.(\d+)`
   ```
   Expanded to every integer in `[start, end]`. The trailing `-` in the
   prefix capture prevents digit-swallowing (an early bug split `AT-APPF-01`
   into prefix `AT-APPF-0` + number `1`).

3. **Open-prefix placeholder** (`RX_DECL_OPEN`) — `` `AT-INFO-NN` ``:
   ```
   `(AT-[A-Z][A-Z0-9]*(?:-[A-Z][A-Z0-9]*)*-)NN`
   ```
   Licenses the entire numeric series under that prefix. Citations whose
   prefix matches plus a tail of `^\d+$` resolve as registered. This codifies
   the "inline-prefix" convention documented in
   `01-features/97-acceptance-criteria.md` (per APP-FIX-14 reconciliation).

---

## Output

### Clean run (exit 0)

```
G-30 AT citation validity:
  registered AT IDs (spec/31-app/**): 188
  endpoint citations scanned:         175
  unregistered citations:               0
  ✅ all citations resolve
```

### Failure run (exit 1)

```
G-30 AT citation validity FAILED:

  ❌ 3 unregistered AT citation(s) in spec/31-app/06-endpoints/:

    spec/31-app/06-endpoints/15b-search.md:42  AT-APP-200
    spec/31-app/06-endpoints/11b-trash-reaper.md:18  AT-MPG-58
    spec/31-app/06-endpoints/11b-trash-reaper.md:19  AT-MPG-58

  Resolution:
    1) If the citation is a typo: fix the number to match the registered ID.
    2) If the AT is genuinely new: register it in the section's
       `97-acceptance-criteria.md` (the file co-located with the section's `00-overview.md`) as `AT-APP-NN` (canonical) before citing.
    3) Never invent ad-hoc prefixes like AT-MPG-* — see APP-FIX-14.
```

---

## Exit codes

| Code | Meaning |
|------|---------|
| 0 | Clean — every citation resolves |
| 1 | ≥1 unregistered citation |
| 2 | Runner error (missing dir, IO failure) |

---

## Registration

- **Catalogue:** `spec/31-app/05-conventions/02-ci-quality-gates.md` row G-30
- **Master runner:** `scripts/spec-hygiene/00-run-all.mjs`
- **CI:** runs after G-29 (matrix coverage) — both must pass for endpoint changes

---

## Out of scope (v1.2.0)

- Other `07-db-diagram/*.md` files (only `04-feature-slices.md` is in scope;
  the master ERD and migration plan use prose-style refs, not citation density)
- Reverse-direction check ("registered but never cited") → see G-30.2 below;
  emitted as advisory, not failure.
- Cross-domain AT IDs (e.g. `spec/16-generic-cli/`) → out of App-domain scope

---

## G-30.2 — Open-prefix redundancy advisory (v1.4.0 default-on)

**Status:** WARN-only — never changes exit code. **DEFAULT-ON as of v1.4.0 (F28).**

**Problem this addresses.** Now that F15 + F20 closed 25 alias prefixes into
explicit registration tables (908 closed IDs as of 2026-04-27), most of the
41 surviving open-prefix declarations are technically dead — every cited ID
under their prefix already has a closed-table row. They were originally
needed to license citations before per-ID rows existed; they now linger as
historical baggage.

**What it reports.** On every run (no flag needed), the runner enumerates
open prefixes whose:

- citations are 100% covered by closed declarations (e.g. `AT-MIRROR-NN`
  declared but `AT-MIRROR-01..06` all live in closed alias-enumeration table), OR
- have zero matching citations across all 3 consumer scopes (e.g.
  `AT-MULTISELECT-NN` — declared but no consumer cites it).

…and emits a one-line advisory per candidate. **No flag required.**

**Allow-list (v1.3.0 — drained by F27).** The allow-list contains 41
entries grouped into three documented intent-categories. As of v1.3.0 the
runner reports **zero** cleanup candidates while preserving every Coverage
Map row for naming-scheme documentation:

| Category | Count | Examples | Why excluded |
|----------|-------|----------|--------------|
| (a) Future-licensing | 5 | `AT-FOO-`, `AT-WORKFLOWS-`, `AT-ROADMAP-`, `AT-ENDPOINTS-`, `AT-DBDIAGRAM-` | Reserve namespace for not-yet-authored canonical index files |
| (b) Convention-documentation | 14 | `AT-INFO-`, `AT-MIRROR-`, `AT-MULTI-`, `AT-BOARD-`, `AT-LAYOUT-`, `AT-ROLES-`, `AT-TRASH-`, … | Coverage-Map rows kept on purpose after F15/F20 closure work; they document the inline-prefix naming convention even though every cited ID resolves through closed alias rows |
| (c) Namespace-placeholder | 22 | `AT-MPG-`, `AT-DV-`, `AT-OQ-`, `AT-SR-`, `AT-WF-CREATE-`, `AT-WF-MIGRATE-`, …, `AT-APP-`, `AT-APPF-` | Feature/workflow files where citations live under canonical `AT-APP-NN`; the prefix row documents the source-file inline scheme (and for `AT-WF-*`, the canonical-map convention) |

To **revisit** a specific entry (e.g. you intend to delete the prose row),
remove it from `REDUNDANCY_ALLOWLIST` in the runner and rerun the runner.
To suppress newly-introduced redundancy in the future, add the prefix with
a one-line rationale in the appropriate category.

**Why WARN-only.** Some closed ID coverage is provisional (e.g. an alias
table may be removed in a v3.0.0 sweep). Failing CI on redundancy would
incentivise re-adding open declarations defensively. Advisory output
surfaces drift early without breaking PR pipelines.

**Why default-on (v1.4.0).** F27 drained the queue to 0 candidates. With
no signal noise, default-on means any **new** redundant declaration shows
up in CI logs immediately rather than accumulating until a future audit.
Authors of new feature/workflow files now have two correct paths: (a)
close their citations into a registration table, or (b) add an allow-list
entry with a written justification — both healthier than silent growth.

**Sample output (clean state).**
```
G-30 AT citation validity:
  ✅ all citations resolve

  G-30.2 redundancy advisory: no cleanup candidates 🎉
```

**Sample output (drift detected).**
```
G-30.2 redundancy advisory (WARN-only): 1 open prefix(es) may be safe to remove
  (citations 100% covered by closed declarations OR zero usage)

  AT-NEWFEATURE-         zero citations      spec/31-app/01-features/22-newfeature.md

  To suppress: add the prefix to REDUNDANCY_ALLOWLIST in this runner
  (intentional future-licensing) or delete the open declaration row.
```

**Invocation.**
```sh
# Default — advisory always runs
node scripts/spec-hygiene/30-check-at-citation-validity.mjs

# Opt-out (rarely needed) — suppress advisory output
node scripts/spec-hygiene/30-check-at-citation-validity.mjs --no-warn-redundant
# or
G30_WARN_REDUNDANT=0 node scripts/spec-hygiene/00-run-all.mjs
```

The legacy `--warn-redundant` flag and `G30_WARN_REDUNDANT=1` env var are
still accepted as no-ops for backward compatibility with any saved CI
configurations from the v1.2.0–v1.3.0 era.

---

## Change history

| Version | Date | Change |
|---------|------|--------|
| 1.4.0 | 2026-04-27 | F28 — promoted G-30.2 advisory to **DEFAULT-ON**; safe because F27 drained queue to 0; opt-out via `--no-warn-redundant` flag or `G30_WARN_REDUNDANT=0` env var; legacy `--warn-redundant` flag preserved as no-op for back-compat |
| 1.3.0 | 2026-04-27 | F27 — drained G-30.2 redundancy queue 36→0 by expanding `REDUNDANCY_ALLOWLIST` 5→41 entries across three documented intent-categories (future-licensing / convention-documentation / namespace-placeholder); preserves every Coverage Map row for naming-scheme docs |
| 1.2.0 | 2026-04-27 | F24 — added G-30.2 open-prefix redundancy advisory (`--warn-redundant`, WARN-only); initial allow-list of 5 future-licensing prefixes; advisory then surfaced 36 cleanup candidates |
| 1.1.0 | 2026-04-27 | F14 — extended consumer scope to `02-workflows/` and `07-db-diagram/04-feature-slices.md`; output now reports per-scope provenance on failure |
| 1.0.0 | 2026-04-27 | Initial — created in response to F9 drift discovery |
