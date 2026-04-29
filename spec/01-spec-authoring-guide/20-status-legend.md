# Spec Status Legend (SSOT)

> **Version:** 1.0.0
> **Created:** 2026-04-29 (UTC+8)
> **Status:** Canonical (this file's own status uses the legend it defines)
> **Parent:** [`00-overview.md`](./00-overview.md)
> **Companion gate:** `G-NS-STATUS-IN-LEGEND` (CI, hard-fail) — see `97-acceptance-criteria.md`

---

## Why this exists

A 2026-04-29 audit found **46 distinct `**Status:**` values** in use across
`spec/` (top inventory: `Curated` 96 · `Active` 91 · `Redirect` 23 ·
`Canonical` 12 · `Normative companion to …` 12 · `Curated rollup` 3 · plus 40
long-tail variants like `D-grade`, `WARN-only`, `Spec Ready`, `Live since …`,
`Dispatch index`).

This drift makes status filtering, triage, and the planned DOC-tier sweep
mechanically impossible. This file defines **the closed enum of 9 canonical
status values**. Every spec file's `**Status:**` line MUST resolve to one of
these 9; free-form prose statuses are forbidden.

---

## §1 — Canonical Status Enum (closed, 9 values)

| Status | Meaning | Lifecycle position |
|---|---|---|
| `DRAFT` | Authoring in progress; not yet reviewed. Subject to breaking changes. | Pre-review |
| `REVIEW` | Author-complete; awaiting peer review or ADR ratification. | In review |
| `CANONICAL` | Reviewed, ratified, and is the SSOT for its topic. **Default for shipped specs.** | Active |
| `COMPANION` | Concrete companion to a CANONICAL parent (e.g. `97a-…-fixtures.md` files). MUST cite parent. | Active |
| `DISPATCH` | Meta-index that delegates ATs to numbered children (e.g. `spec/18-spec-issues/97-…`). No ATs of its own by design. | Active |
| `DEFERRED` | Out-of-scope for current release; tracked but not implemented. | Parked |
| `DEPRECATED` | Superseded by a newer canonical file. MUST cite successor in front-matter. | Sunsetting |
| `REDIRECT` | Stub that redirects to a canonical file. Body MUST be ≤10 lines. | Sunsetting |
| `ARCHIVED` | Historical record; do not modify. Excluded from hygiene gates. | Terminal |

**Forbidden:** any other free-form value (`Active`, `Curated`, `Complete`,
`Production-ready`, `Live since 2026-…`, `D-grade`, `WARN-only`, `Spec Ready`,
`MANDATORY`, `Frozen`, `Open`, `Resolved`, `Implemented`, `Approved`,
`Accepted`, `Authoritative`, `SSOT`, `Normative`, `Interim`, `Research`,
`Placeholder`, `Scaffold`, `Spec-only`, etc.).

---

## §2 — Migration Mapping (legacy → canonical)

The 2026-04-29 audit produced this one-to-one rewrite table. The P3 status-sweep
applies it mechanically; ambiguous cases route to `CANONICAL` by default.

| Legacy value (count) | → Canonical | Rationale |
|---|---|---|
| `Curated` (86) · `Curated` (10) · `Curated rollup` (3) | → `CANONICAL` | Reviewed and shipped. |
| `Active` (49) · `Active` (25) · `Active` (17) · `Active reference` (2) | → `CANONICAL` | "Active" was the historical default for shipped specs. |
| `Redirect` (23) · `Redirect stub` (1) | → `REDIRECT` | Direct rename. |
| `Canonical` (12) | → `CANONICAL` | Case normalization. |
| `Normative companion to …` (10/2/1) · `Concrete companion to …` (8) | → `COMPANION` | Suffix prose moves to a `**Parent:**` field. |
| `Complete` (6/3) · `Production-ready` (5) · `Implemented` (2) · `Live since …` (4) | → `CANONICAL` | All denote shipped+reviewed state. |
| `Dispatch index` (4) | → `DISPATCH` | Direct rename. |
| `Approved` (4) · `Accepted` (2) · `Authoritative` (2) · `SSOT` (1) · `Normative` (1) · `MANDATORY` (1) | → `CANONICAL` | All denote ratified normative content. |
| `Frozen` (3) | → `ARCHIVED` | "Frozen" historically meant do-not-modify. |
| `Resolved` (2) | → `ARCHIVED` | Closed audit findings — do not modify. |
| `Draft` (2) | → `DRAFT` | Case normalization. |
| `Planned` (2) · `Spec-only` (1) · `Spec Ready` (1) · `Interim` (1) | → `DEFERRED` | Not yet implemented. |
| `D-grade` (2) | → `DEFERRED` | Audit grade indicating remediation pending. |
| `WARN-only` (1) | → `DEFERRED` | Gate not yet hard-failing — implementation deferred. |
| `Research` (1) | → `DRAFT` | Exploratory; not reviewed. |
| `Open` (1) | → `DRAFT` | Audit/issue still being authored. |
| `Placeholder` (1) · `Scaffold` (1) | → `DRAFT` | Stub awaiting content. |
| `This is a …` (4) | → resolve case-by-case (most → `CANONICAL`) | Prose status; needs human disambiguation. |

**Audit-trail requirement:** the P3 sweep MUST land as a single mechanical
commit using this table; manual deviations require an inline `<!-- STATUS-MAP-EXCEPTION: <reason> -->` comment so future audits can re-verify.

---

## §3 — Front-matter format (required)

Every spec file's front-matter block MUST contain exactly one `**Status:**`
line whose value is one of the 9 canonical tokens, optionally followed by a
free-text qualifier in parentheses (excluded from gate matching).

**Good:**
```markdown
> **Status:** CANONICAL
> **Status:** CANONICAL (post-AUDIT-03 backfill)
> **Status:** REDIRECT (→ spec/04-database-conventions/06-rest-api-format/)
> **Status:** DEFERRED (P3 sweep populates exemptions)
> **Status:** COMPANION (parent: 97-acceptance-criteria.md)
```

**Bad (gate fails):**
```markdown
> **Status:** Curated                 ← legacy free-form
> **Status:** Active reference        ← not in enum
> **Status:** Live since 2026-04-25   ← prose
> **Status:** D-grade                 ← audit jargon
```

---

## §4 — `STATUS:` inline tag (per-AT row)

Individual AT rows inside `97-acceptance-criteria.md` MAY carry an inline
`STATUS: <token>` tag in their description column, using the same 9 tokens.
Most rows omit it (defaults to `CANONICAL` per the file's front-matter).
Use the inline tag only when a row's status diverges from its file:

```markdown
| AT-FOO-07 | Validates …  STATUS: DEFERRED (blocked on ADR-0027 Phase 2) | … |
| AT-FOO-12 | …  STATUS: ARCHIVED (see 99-consistency-report.md §3.2)     | … |
```

---

## §5 — Verification

```bash
# Inventory current status drift (target: only the 9 canonical values appear)
rg --no-filename -o '\*\*Status:\*\*\s*[A-Z][A-Z]+' spec/ | sort -u

# Count rows still using legacy values (target: 0 after P3 sweep)
rg -c '\*\*Status:\*\*\s*(Curated|Active|Complete|Production-ready|Live since|D-grade|WARN-only|Spec Ready|Frozen|Open|Resolved|Implemented|Approved|Accepted|Authoritative|MANDATORY|Normative|Interim|Research|Placeholder|Scaffold|Redirect stub|Active reference|Curated rollup|Dispatch index|Normative companion|Concrete companion|This is a)\b' spec/ | awk -F: '{s+=$2} END{print s}'
```

---

## Related

- [`97-acceptance-criteria.md`](./97-acceptance-criteria.md) — Companion gate `G-NS-STATUS-IN-LEGEND` definition
- [`.lovable/memory/audit/at-status-legend-audit.md`](../../.lovable/memory/audit/at-status-legend-audit.md) — Source inventory + mapping rationale
- [`spec/_GATE-REGISTRY.md`](../_GATE-REGISTRY.md) — Gate index

---

*Closes Task #2 — Standardize AT status legend (+6 pts). 46 → 9 enum reduction; mapping table makes P3 sweep mechanical.*
