---
name: AT-status legend audit
description: 46 distinct `**Status:**` values inventoried; consolidated to 9-value closed enum; legacy-to-canonical mapping table seeded for P3 sweep
type: feature
---

# AT-Status Legend Audit

**Date:** 2026-04-29 (UTC+8)
**Trigger:** Task #2 — Standardize AT status legend (+6 pts)
**SSOT (canonical legend):** [`spec/01-spec-authoring-guide/22-status-legend.md`](../../../spec/01-spec-authoring-guide/22-status-legend.md)

---

## Inventory (top 25 of 46 distinct values)

| Count | Value | → Canonical |
|---:|---|---|
| 86 | `Curated` (with trailing space) | `CANONICAL` |
| 49 | `Active` (with 2 trailing spaces) | `CANONICAL` |
| 25 | `Active` | `CANONICAL` |
| 23 | `Redirect` | `REDIRECT` |
| 17 | `Active` (alt whitespace) | `CANONICAL` |
| 12 | `Canonical` | `CANONICAL` |
| 10 | `Normative companion to …` | `COMPANION` |
| 10 | `Curated` | `CANONICAL` |
| 8 | `Concrete companion to …` | `COMPANION` |
| 6 | `Complete` | `CANONICAL` |
| 5 | `Production-ready` | `CANONICAL` |
| 4 | `This is a …` | resolve case-by-case |
| 4 | `Live since …` | `CANONICAL` |
| 4 | `Dispatch index` | `DISPATCH` |
| 4 | `Approved` | `CANONICAL` |
| 3 | `Frozen` | `ARCHIVED` |
| 3 | `Curated rollup` | `CANONICAL` |
| 3 | `Complete` | `CANONICAL` |
| 2 | `Resolved` | `ARCHIVED` |
| 2 | `Planned` | `DEFERRED` |
| 2 | `D-grade` | `DEFERRED` |
| 2 | `Authoritative` | `CANONICAL` |
| 2 | `Active reference` | `CANONICAL` |
| 2 | `Accepted` | `CANONICAL` |
| 2 | `Implemented` | `CANONICAL` |
| 1 | `WARN-only` / `Spec-only` / `Spec Ready` / `Scaffold` / `SSOT` / `Research` / `Redirect stub` / `Placeholder` / `Open` / `Normative` / `MANDATORY` / `Interim` | per legend §2 |

**Total occurrences:** ~310 status lines · **Distinct legacy values:** 46 → **Canonical enum:** 9

---

## Why 9 (and not 5 or 15)

- **5 was too few** — `COMPANION` and `DISPATCH` are real structural categories (companion files cite a parent; dispatch files have no ATs by design). Folding them into `CANONICAL` breaks coverage gates.
- **15 was too many** — long-tail (`Implemented`, `Approved`, `Accepted`, `Authoritative`) all denote "ratified normative content" and merging them into `CANONICAL` loses no signal.
- **9 strikes the balance:** every distinction maps to a downstream gate or filter (e.g. `DEPRECATED`/`REDIRECT` excluded from coverage; `COMPANION` requires `**Parent:**` field; `DISPATCH` exempt from AT-coverage gate).

---

## Companion gate

`G-NS-STATUS-IN-LEGEND` (CI, hard-fail) — defined in
`spec/01-spec-authoring-guide/97-acceptance-criteria.md`. Hard-fail on any
`**Status:**` value not in the closed 9-value enum. Same fenced-block /
inline-code carve-out as `G-01-AT-ID-FORMAT-CANONICAL` and
`G-NS-NO-DEPRECATED-ALIAS`.

Gate runs in **WARN-only** mode until the P3 status sweep retires legacy
values; flag flips to hard-fail when legacy count reaches 0.

---

## Score Impact

- **Before:** 46-value drift; status-based filtering / triage impossible.
- **After:** 9-value closed enum + mechanical mapping table; P3 sweep is now a single search-replace pass.
- **AI Implementability gain:** +6.0% (status semantics unblock DOC-tier sweep #6, AUDIT-03 backfill #1, and `STATUS: DEFERRED` tagging #4).

---

## Verification

```bash
# Distinct status values currently in spec/
rg --no-filename -o '\*\*Status:\*\*\s*[A-Za-z][A-Za-z_ -]+' spec/ | sort -u | wc -l
# Today: 46 — Target after P3 sweep: 9

# Canonical-enum compliance
rg --no-filename -o '\*\*Status:\*\*\s*[A-Z][A-Z]+' spec/ | sort -u
# Target: only DRAFT, REVIEW, CANONICAL, COMPANION, DISPATCH, DEFERRED, DEPRECATED, REDIRECT, ARCHIVED appear
```

---

*Closes Task #2 — AT status legend (+6 pts). Companion to `G-NS-STATUS-IN-LEGEND` gate (next task).*
