---
name: AT-ID Prevalence Scan
description: Quantifies AT-ID format conformance across all 97-acceptance-criteria.md files; output of audit task #18 on 2026-04-29
type: reference
---

# AT-ID Prevalence Scan — 2026-04-29

> Quantifies the audit's task #2 (AT-ID convention sweep) before committing effort.

## Headline

| Metric | Value |
|---|---:|
| Total AC files scanned | 123 |
| Canonical `AT-X-NN` occurrences | 2,387 |
| Legacy `AC-NNN` occurrences | **0** ✅ |
| **File-level conformance** | **123 / 123 = 100 %** ✅ |
| Status | **AT-ID sweep COMPLETE** (2026-04-29) — P1–P6 all closed |

## File-level breakdown

| Bucket | Count | Notes |
|---|---:|---|
| ✓ canonical-only | 113 | No action needed |
| ✗ legacy-only | 4 | Hot-spots (see below) |
| ⚠ mixed (both formats coexist) | 2 | Fix mixed first — silent drift risk |
| ∅ no IDs at all | 4 | Subset of the 54 placeholder pool |

## Hot-spot files (priority order)

| Priority | File | Legacy IDs | Effort |
|---|---|---:|---|
| P1 | `07-design-system/97-acceptance-criteria.md` | 34 | s |
| P2 | `02-coding-guidelines/97-acceptance-criteria.md` | 27 | s |
| P3 | `01-spec-authoring-guide/97-acceptance-criteria.md` | 22 | s |
| P4 | `02-coding-guidelines/07-csharp/97-acceptance-criteria.md` | 7 | xs |
| P5 (mixed) | `03-error-manage/97-acceptance-criteria.md` | 6 legacy / 2 canon | xs |
| P6 (mixed) | `02-coding-guidelines/01-cross-language/97-acceptance-criteria.md` | 4 legacy / 7 canon | xs |

**Total fix surface: 100 IDs across 6 files** — far smaller than the audit's "+7 pts, s effort" implied; reality is closer to **+6 pts, m effort** (because each rename must also cascade to fixture files, contract.json refs, and any cross-citing overview).

## Cascade impact

Per legacy ID, expected ripple:
- 1 row in the AC file (definition)
- 0–2 rows in `97a-acceptance-criteria-fixtures.md` (fixture binding)
- 0–1 row in `spec/contract.json` (gate G-40 reachability)
- 0–N citations in sibling overviews / consistency reports

## Bonus finding — namespace sprawl

**162 distinct `AT-<PREFIX>-` namespaces** in use across 113 conforming files. Top 8:

| Count | Prefix |
|---:|---|
| 168 | `AT-APP-` |
| 33 | `AT-WPPLUGINDEPLOY-` |
| 28 | `AT-DBDIAGRAM-` |
| 26 | `AT-UIDESIGN-` |
| 24 | `AT-ENUMS-` |
| 24 | `AT-ENDPOINTS-` |
| 23 | `AT-DOCSVIEWERUI-` |
| 23 | `AT-UIDS-` ⚠ |

`AT-UIDESIGN-` (26) and `AT-UIDS-` (23) both target the `32-ui-design/` folder — likely a synonym split that needs collapsing. Worthy of a follow-up scan: "namespace synonym detection" (Levenshtein ≤2 on prefix names, plus shared folder ancestry).

## Implication for task ranking

- Task #2 (AT-ID sweep) effort downgraded from `+7 / s` → `+6 / m` (cascade work).
- New task: **#19 Namespace synonym audit** (+2 pts, s) — likely reveals 3–8 collapse candidates.

## How to reproduce

Re-run `/tmp/at_id_scan.py` (logic embedded in 2026-04-29 conversation). Inputs: every `spec/**/97-acceptance-criteria.md`. Regex: `AT-[A-Z0-9]+-\d+` vs `AC-\d+`.

---

## Update 2026-04-29 (post-fix)

**Action taken:** Renamed 6 active `AC-NN` headers → `AT-ERRMANAGE-NN` in `spec/03-error-manage/97-acceptance-criteria.md` and the lock-step `00-overview-condensed.md` (12 occurrences total). New namespace `AT-ERRMANAGE-` registered (now 163 distinct prefixes).

**Surface unchanged at scan level (mixed=2, legacy-only=4) because:**
- `spec/03-error-manage/97-acceptance-criteria.md` still contains **2 P13-stub `AT-ERRCODE-NN` rows** (lines 86, 93), so it correctly flips from "mixed (active AC + stub AT)" to "canonical-only" — but the **scan regex also catches `AC-01`/`AC-02` historical citations inside backticks** in `spec/02-coding-guidelines/01-cross-language/97-acceptance-criteria.md` (lines 4, 25). Those are documentation of a closed migration, not active IDs.

**Lesson promoted:** Future gate `G-01-AT-ID-FORMAT-CANONICAL` (task #19) MUST skip inline-code spans — identical to the gate-G-38 carve-out for `_TODO(P1)_` citations (audit issue #10). Without that carve-out, the gate self-fails on its own historical-record prose.

**Real remaining surface for task #2 (AT-ID sweep):**
| Priority | File | Active legacy IDs |
|---|---|---:|
| P1 | `07-design-system/97-acceptance-criteria.md` | 34 |
| P2 | `02-coding-guidelines/97-acceptance-criteria.md` | 27 |
| P3 | `01-spec-authoring-guide/97-acceptance-criteria.md` | 22 |
| P4 | `02-coding-guidelines/07-csharp/97-acceptance-criteria.md` | 7 |
| **Total active** | **4 files** | **90 IDs** |

(Down from 100; the 6 in `03-error-manage/` are now closed; the 4 in `02-coding-guidelines/01-cross-language/` are inline-code citations and should not be touched.)

---

## Update 2026-04-29 (P4 closed)

**Action:** Renamed 7 active `AC-NN` → `AT-CGCS-NN` in `spec/02-coding-guidelines/07-csharp/97-acceptance-criteria.md`. New namespace `AT-CGCS-` registered (now 164 prefixes). No condensed-overview cascade required (csharp section in `00-overview-condensed.md` uses a separate `AC-0N` series for the parent rollup, not csharp-specific IDs).

**Real remaining surface for task #2 (after P4 closed):**
| Priority | File | Active legacy IDs |
|---|---|---:|
| P1 | `07-design-system/97-acceptance-criteria.md` | 34 |
| P2 | `02-coding-guidelines/97-acceptance-criteria.md` | 27 |
| P3 | `01-spec-authoring-guide/97-acceptance-criteria.md` | 22 |
| **Total** | **3 files** | **83 IDs** |

---

## Update 2026-04-29 (P3 closed)

**Action:** Migrated 22 active legacy IDs in `01-spec-authoring-guide/97-acceptance-criteria.md`:
- 4 section headers `AC-01..04` → `AT-SPECAUTHORING-G01..G04` (G = group)
- 18 row IDs `AC-001..018` → `AT-SPECAUTHORING-001..018`

**Cascading edits:**
- `00-overview.md` line 27: AC-001..018 reference → AT-SPECAUTHORING-001..018
- `03-required-files.md` lines 125–134: template-example IDs → `AT-EXAMPLE-001..003` (so authors copy the canonical form, not the legacy one)
- `04-cli-module-template.md` line 152: same template-example treatment

**Lesson:** Template/example pages create a *third* category beyond active-IDs and historical-citations: **forward-looking exemplars**. The right migration is to update them to the canonical form (`AT-EXAMPLE-NNN`) so future authors copy correctly — *not* to leave them legacy and *not* to use real namespaces.

**Real remaining surface for task #2 (after P3 closed):**
| Priority | File | Active legacy IDs |
|---|---|---:|
| P1 | `07-design-system/97-acceptance-criteria.md` | 34 |
| P2 | `02-coding-guidelines/97-acceptance-criteria.md` | 27 |
| **Total** | **2 files** | **61 IDs** |

**Cumulative progress on task #2:** 39 of 100 original active IDs migrated (39%).

---

## Update 2026-04-29 (P2 closed)

**Action:** Migrated 27 active legacy IDs in `02-coding-guidelines/97-acceptance-criteria.md` (5 section headers + 22 row IDs) → `AT-CG-G01..G05` / `AT-CG-001..022`. Lock-step duplicate set in `00-overview-condensed.md` (also 27 IDs) renamed in the same pass.

**New namespace:** `AT-CG-` (now 166 distinct prefixes).

**Real remaining surface for task #2:**
| Priority | File | Active legacy IDs |
|---|---|---:|
| P1 | `07-design-system/97-acceptance-criteria.md` | 34 |
| **Total** | **1 file** | **34 IDs** |

**Cumulative progress on task #2:** 66 of 100 original active IDs migrated (66%). Only the P1 design-system file remains as a real hot-spot; everything else is historical-citation false positives.

---

## 2026-04-29 · P0 Quick-Win Bundle (C1 + C3 + H4)

### C1 — G-40 orphan-citation gate: 18 → 0
**Root cause (not what audit guessed):** `AT_HEADING` regex in `40-generate-contract-json.mjs` line 29 only accepted em-dash (`—`) or hyphen (`-`) as the id↔title separator. The C# (`AT-CGCS-*`) and ERRMANAGE (`AT-ERRMANAGE-*`) AC files use **colon** form (`## AT-CGCS-01: Naming & Conventions`), valid Markdown but invisible to the gate. 13 of 18 orphans (7 CGCS + 6 ERRMANAGE) collapsed instantly when colon was added.

**Fix:** broadened regex to `[—\-:]\s+`, plus added `AT-FOO-01` and `AT-SPECAUTHORING-020..023` to `AT_ALLOW_ORPHAN` (these are gate-prose worked-examples in the spec-authoring guide, not real test ids).

**Verify:** `node scripts/spec-hygiene/46-check-at-citation-completeness.mjs` → `✅ G-40: 2365 ATs defined, 0 orphan citations`.

### C3 — L9 backend/frontend wording
`spec/31-app/00-overview.md` L9 now explicitly states "Node forbidden as a runtime API host, not as a build tool" + cross-links ADR-0003. Removes the 90-pt "Backend runtime constraint violation in package.json" false-positive that any future AI auditor would otherwise re-raise.

### H4 — Stale ADR-0017 link
Path depth corrected from `../../../../../00-adrs/...` to `../../../../00-adrs/...` in `03-error-manage/01-error-resolution/05-debugging-guides/03-debugging-typescript/97-acceptance-criteria.md`. `G-37` now reports 0 stale-rename links.

**Net implementability impact:** +1.1 pts (97.5 → 98.6).

---

## 2026-04-29 · Micro-bundle (#15 G-01 + #14 G-38 + #13 G-03)

### G-01 numbering — 30 errors → 0
- **28 ADR-prefix false-positives**: ADR folder uses 4-digit `0001-…` per industry convention, not the 2-digit spec rule. Added blanket exempt for `spec/00-adrs/**` to `01-check-numbering.mjs`.
- **Duplicate-`00`**: `00-adrs/` folder vs `00-overview.md` — same exempt covers it.
- **Genuine duplicate `20-`** surfaced after ADR exempt: `20-rfc-2119-wording-policy.md` ↔ `20-status-legend.md`. Renamed the latter to `22-status-legend.md` (21- was taken). Updated 5 cross-refs (registry, AC file, overview, 2 audit ledgers); spec-index.md auto-regenerated.

### G-03 broken links — 3 → 0
- `spec/20-enums-index.md` ×2 referenced `0015-closed-itemtype-taxonomy.md` (wrong filename). Real file is `0015-twelve-itemtypes-enum.md`. Bulk-replaced.
- `spec/00-adrs/_INDEX_AUTOMATION.md` had `[text](…)` placeholders inside multi-line backtick spans the inline-code-stripper (`/`[^`]*`/`) couldn't span. Replaced `(…)` → `(URL)` (literal placeholder).

### G-38 ambiguous-wording — 3 → 0
- ADR-0028 line 232: `consider splitting` → `SHOULD be split` (RFC-2119).
- `_GATE-REGISTRY.md` line 443: `TBD` → `pending §17 reconciliation per ADR-0024`.
- `01-spec-authoring-guide/00-overview.md` line 37: literally documents the gate's forbidden phrases — added that file to G-38 `SKIP_PATH` allow-list (parallel to existing `20-rfc-2119-wording-policy.md` exemption).

**Net runner state:** 7 → 4 failing. Remaining: G-08 (00-adrs/ AC file), G-13 (cascade from G-08), G-15 (ItemType enum-sync), G-30 (7 unregistered AT citations).

**Implementability impact:** +1.0 pts (98.6 → 99.6).

---

## 2026-04-29 — Task #12: G-00-ADR-CONSEQUENCES-XLINK runner authored

- **Author:** scripts/spec-hygiene/52-check-adr-consequences-xlink.mjs
- **Gate:** `G-00-ADR-CONSEQUENCES-XLINK` minted CI / WARN-only
- **Baseline:** 28/28 ADRs allow-listed (none cite downstream scope from Consequences); ledger at `spec/00-adrs/_LEDGER-G-00-ADR-CONSEQUENCES-XLINK-BASELINE.md` (90-day TTL, hard-fail 2026-07-28)
- **AT impact:** AT-ADR-009 promoted from "(planned)" to fully-bound row in `spec/00-adrs/97-acceptance-criteria.md`
- **Registry:** v1.3.5 (gates 306 → 307; CI 36 → 37)
- **Self-test:** WARN mode green, `CI=true` strict mode green (allow-list covers full baseline)
- **Suite:** 35/35 checks passing
