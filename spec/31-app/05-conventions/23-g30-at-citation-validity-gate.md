---
slug: g30-at-citation-validity-gate
version: 1.0.0
updated: 2026-04-27
parent: ../../05-conventions/02-ci-quality-gates.md
status: canonical
gate_id: G-30
---

# G-30 — AT Citation Validity Gate

> **Version:** 1.0.0
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

All `*.md` under:

- `spec/31-app/06-endpoints/`

(Future: extend to `02-workflows/` consumers; deliberately tight v1.0.0 scope
to mirror the file set that F6/F9 created and that G-29 already polices.)

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

### Why backtick-fenced declaration regex

Tables use `` `AT-FOO-NN` `` in the **first cell**. This excludes prose
mentions ("the AT-FOO-* series describes…") that are not formal declarations.
A consumer file that *cites* an ID inside a sentence still gets caught
because step 2 matches any backtick-wrapped occurrence.

### Why citations may include same ID multiple times

Citations are line-tracked so the failure report shows *every* offending site.
A single bad ID rippled across 3 files surfaces as 3 distinct violations.

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

## Out of scope (v1.0.0)

- Workflow files (`02-workflows/`) consumer-side checks → G-30.1 follow-up
- Reverse-direction check ("registered but never cited") → not a defect
  per current policy; ATs may be declared ahead of consumers
- Cross-domain AT IDs (e.g. `spec/16-generic-cli/`) → out of App-domain scope

---

## Change history

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-04-27 | Initial — created in response to F9 drift discovery |
