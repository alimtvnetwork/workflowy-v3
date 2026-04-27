---
slug: g30-at-citation-validity-gate
version: 1.2.0
updated: 2026-04-27
parent: ../../05-conventions/02-ci-quality-gates.md
status: canonical
gate_id: G-30
---

# G-30 — AT Citation Validity Gate

> **Version:** 1.2.0
> **Updated:** 2026-04-27 (UTC+8)
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

    spec/31-app/06-endpoints/15-search.md:42  AT-APP-200
    spec/31-app/06-endpoints/11b-trash-reaper.md:18  AT-MGP-58
    spec/31-app/06-endpoints/11b-trash-reaper.md:19  AT-MGP-58

  Resolution:
    1) If the citation is a typo: fix the number to match the registered ID.
    2) If the AT is genuinely new: register it in the appropriate
       97-acceptance-criteria.md as `AT-APP-NN` (canonical) before citing.
    3) Never invent ad-hoc prefixes like AT-MGP-* — see APP-FIX-14.
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

## G-30.2 — Open-prefix redundancy advisory (v1.2.0)

**Status:** WARN-only — never changes exit code.

**Problem this addresses.** Now that F15 + F20 closed 25 alias prefixes into
explicit registration tables (908 closed IDs as of 2026-04-27), most of the
41 surviving open-prefix declarations are technically dead — every cited ID
under their prefix already has a closed-table row. They were originally
needed to license citations before per-ID rows existed; they now linger as
historical baggage.

**What it reports.** When invoked with `--warn-redundant` (or env
`G30_WARN_REDUNDANT=1`), the runner enumerates open prefixes whose:

- citations are 100% covered by closed declarations (e.g. `AT-MIRROR-NN`
  declared but `AT-MIRROR-01..06` all live in closed alias-enumeration table), OR
- have zero matching citations across all 3 consumer scopes (e.g.
  `AT-MULTISELECT-NN` — declared but no consumer cites it).

**Allow-list.** Five prefixes are excluded from the advisory because they
are intentional future-licensing slots, not cleanup candidates:

| Prefix | Why excluded |
|--------|-------------|
| `AT-FOO-` | Doc-example placeholder in `02-ci-quality-gates.md` |
| `AT-WORKFLOWS-` | Reserves namespace for future per-workflow ATs |
| `AT-ROADMAP-` | Reserves roadmap AT space |
| `AT-ENDPOINTS-` | Reserves endpoints AT space |
| `AT-DBDIAGRAM-` | Reserves DB-diagram AT space |

To suppress additional prefixes, edit `REDUNDANCY_ALLOWLIST` in the runner.

**Why WARN-only.** Some closed ID coverage is provisional (e.g. an alias
table may be removed in a v3.0.0 sweep). Failing CI on redundancy would
incentivise re-adding open declarations defensively. Advisory output lets
F-series cleanup tasks (e.g. F-future) prune in batches without churn.

**Sample output.**
```
G-30.2 redundancy advisory (WARN-only): 36 open prefix(es) may be safe to remove
  (citations 100% covered by closed declarations OR zero usage)

  AT-ROLES-              10 cited / all closed  spec/31-app/01-features/15-roles-and-permissions.md
  AT-MULTISELECT-       zero citations          spec/31-app/01-features/97-acceptance-criteria.md
  AT-WF-CREATE-          5 cited / all closed   spec/31-app/02-workflows/00-overview.md
  ...
  To suppress: add the prefix to REDUNDANCY_ALLOWLIST in this runner
  (intentional future-licensing) or delete the open declaration row.
```

**Invocation.**
```sh
node scripts/spec-hygiene/30-check-at-citation-validity.mjs --warn-redundant
# or
G30_WARN_REDUNDANT=1 node scripts/spec-hygiene/00-run-all.mjs
```

The master runner (`00-run-all.mjs`) does NOT pass the flag by default —
opt-in only. Promotion to default-on is reserved for a future loop after
the redundancy queue is drained.

---

## Change history

| Version | Date | Change |
|---------|------|--------|
| 1.2.0 | 2026-04-27 | F24 — added G-30.2 open-prefix redundancy advisory (`--warn-redundant`, WARN-only); allow-list of 5 future-licensing prefixes; current advisory surfaces 36 cleanup candidates |
| 1.1.0 | 2026-04-27 | F14 — extended consumer scope to `02-workflows/` and `07-db-diagram/04-feature-slices.md`; output now reports per-scope provenance on failure |
| 1.0.0 | 2026-04-27 | Initial — created in response to F9 drift discovery |
