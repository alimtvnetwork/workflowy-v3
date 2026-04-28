# Ledger — `G-00-ADR-XLINK-SYMMETRY` baseline (2026-04-28)

> **Type:** Audit ledger (informational, not an ADR).
> **Source gate:** [`G-00-ADR-XLINK-SYMMETRY`](./_INDEX_AUTOMATION.md#g-00-adr-xlink-symmetry-planned)
> **Audit script:** [`spec/13-cicd-pipeline-workflows/scripts-as-spec/xlink-symmetry-audit.md`](../13-cicd-pipeline-workflows/scripts-as-spec/xlink-symmetry-audit.md)
> (frozen 2026-04-28). The fixture-as-spec is the load-bearing
> algorithm; CI implementation pending under
> `spec/13-cicd-pipeline-workflows/`.

## Purpose

Captures the **baseline set** of outbound links from Accepted-ADR
`## Decision` sections to non-ADR repo files, with their reciprocal
back-link verified. Any new ADR or any new Decision-section link added
after this date MUST be diffable against this ledger and ship with
matching back-link in the same change.

## Scope of audit

- **ADRs scanned:** 28 (`spec/00-adrs/0001-…md` through `0028-…md`).
- **Sections scanned:** `## Decision` only (per gate exemptions for
  `## Context` and `## Consequences`).
- **Targets considered:** non-ADR files inside the repo (links into
  `spec/00-adrs/` are exempt — covered by `G-00-ADR-INDEX-FRESH`;
  external `https://` URLs are exempt).

## Result

- **Outbound links found:** 4
- **Symmetric (reciprocal back-link present):** 4 ✅
- **Violations:** 0

## Baseline pairs (4)

| ADR | Decision-clause label | Target file | Target anchor | Back-link verified |
|---|---|---|---|---|
| ADR-0024 §D1 | `#01` | `.lovable/question-and-ambiguity/00-triage-summary.md` | `#01--audit-100100-score-should-b1b4-addendums-add-a-new-dimension` | ✅ inline `> ✅ Ratified by [ADR-0024 §D1](…)` blockquote at anchor |
| ADR-0024 §D2 | `#03` | `.lovable/question-and-ambiguity/00-triage-summary.md` | `#03--ddl-singular-itemtitle-vs-spec-plural-itemscontent` | ✅ inline `> ✅ Ratified by [ADR-0024 §D2](…)` blockquote at anchor |
| ADR-0024 §D3 | `#17` | `.lovable/question-and-ambiguity/00-triage-summary.md` | `#17--favorites-endpoint-vs-table-contradiction` | ✅ inline `> ✅ Ratified by [ADR-0024 §D3](…)` blockquote at anchor |
| ADR-0026 §D2 | `column-level Spec↔DDL Alias Bridge` | `spec/04-database-conventions/00-overview.md` | `#alias-bridge-columns` | ✅ prose mention `ADR-0026 §D6 mandates that …` immediately under the anchor heading |

## Maintenance protocol

1. **Adding an outbound Decision-section link:** the same PR MUST add a
   reciprocal back-link in the target file at-or-above the linked
   anchor and append a row to this ledger.
2. **Removing an outbound Decision-section link:** the same PR MUST
   remove (or at minimum strikethrough) the reciprocal back-link **and**
   the corresponding ledger row, with a `Superseded-by:` note if the
   removal is consequential.
3. **Re-running the audit:** quarterly, or whenever a new ADR reaches
   `Accepted` status. The audit algorithm is frozen at
   [`spec/13-cicd-pipeline-workflows/scripts-as-spec/xlink-symmetry-audit.md`](../13-cicd-pipeline-workflows/scripts-as-spec/xlink-symmetry-audit.md);
   copy the fenced code block into a runnable `.py` to execute. Promote
   to a CI workflow under `spec/13-cicd-pipeline-workflows/` when
   `G-00-ADR-XLINK-SYMMETRY` is mechanized.

## See also

- [`spec/00-adrs/_INDEX_AUTOMATION.md`](./_INDEX_AUTOMATION.md) — gate
  specification, algorithm, exemptions.
- [`spec/_GATE-REGISTRY.md`](../_GATE-REGISTRY.md) — Meta-00 section,
  registry row.
- [ADR-0024](./0024-ratify-soft-confirm-triage-rulings.md) — the
  reference precedent (3 of the 4 baseline pairs).
- [ADR-0026](./0026-lww-canonical-tiebreak.md) — the 4th baseline pair
  (column-level alias bridge).
