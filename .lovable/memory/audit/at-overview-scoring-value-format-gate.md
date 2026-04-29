# Audit Ledger — `G-00-OVERVIEW-SCORING-VALUE-FORMAT`

> **Minted:** 2026-04-29  
> **Tier:** CI, WARN-only at mint (per-rule promotion to hard-fail when dirty count = 0/25)  
> **Layer:** 2.5 of the overview-root contract trio (Layer 1 = presence, Layer 2 = canonical rows, **Layer 2.5 = canonical value shapes**)  
> **Scope:** 25 top-level `spec/[0-9][0-9]-*/00-overview.md`. Sub-overviews out of scope.

## Purpose

`G-00-OVERVIEW-SCORING-TABLE-COMPLETE` (Layer-2) enforces that the canonical Scoring rows exist and carry *some* parseable numeric score. It does NOT enforce that values follow a single canonical shape. Today the corpus mixes ten distinct value forms — `95% (A)`, `100/100 (A+)`, `100/100`, `Production-Ready`, `Production-Ready ✅`, `High`, `Low 🟢`, `None`, `Medium`, etc. — making programmatic aggregation by `health-dashboard.md` and the future score-aggregator brittle (each consumer must hand-roll a parser per shape).

This Layer-2.5 gate locks one canonical value shape per canonical row so a single regex per row can extract scores corpus-wide.

## Canonical value shapes

| Row | Canonical regex / token set | Examples |
|-----|-----------------------------|----------|
| Health Score / Overall / Total | `^\d{1,3}%\s\([A-F][+\-]?\)$` | `95% (A)`, `88% (B+)`, `100% (A+)` |
| AI Confidence / AI Implementability | one of `{Very High, High, Medium, Low, Very Low}` exact case | `High`, `Medium` |
| Ambiguity | one of `{None, Low, Medium, High, Very High}` exact case | `Low`, `None` |

**Forbidden decorations (all rows):** trailing emoji (`✅`, `🟢`), parenthetical prose, fraction denominators (`100/100`), bare grade without `\d%` (`(A+)`), tone markers (`Production-Ready`).

## Baseline (2026-04-29, mint day)

Audit method: `awk` extraction of `^(##|###)\s+Scoring\b` blocks from each top-level overview, value-cell regex match per row.

### Health Score (Rule 1)

| File | Current value | Compliant? | Suggested fix |
|------|---------------|:----------:|---------------|
| `03-error-manage` | `100/100 (A+)` | ❌ | `100% (A+)` |
| `05-split-db-architecture` | `100/100 (A+)` | ❌ | `100% (A+)` |
| `06-seedable-config-architecture` | `100/100 (A+)` | ❌ | `100% (A+)` |
| `07-design-system` | `100/100` | ❌ | `100% (A+)` |
| (all 21 others) | `\d{1,3}% (\w+)` shape | ✅ | — |

**Dirty count:** 4 / 25.

### AI Confidence (Rule 2)

| File | Current value | Compliant? | Suggested fix |
|------|---------------|:----------:|---------------|
| `03-error-manage` | `Production-Ready` | ❌ | `Very High` |
| `05-split-db-architecture` | `Production-Ready` | ❌ | `Very High` |
| `06-seedable-config-architecture` | `Production-Ready` | ❌ | `Very High` |
| `07-design-system` | `Production-Ready ✅` | ❌ | `Very High` |
| `12-consolidated-guidelines` | `High (folder is a stable redirect map; rules live in canonical sources)` | ❌ | `High` (move prose to a row caption or footnote) |
| (all 20 others) | bare canonical token | ✅ | — |

**Dirty count:** 5 / 25.

### Ambiguity (Rule 3)

| File | Current value | Compliant? | Suggested fix |
|------|---------------|:----------:|---------------|
| `07-design-system` | `Low 🟢` | ❌ | `Low` |
| (all 24 others) | bare canonical token | ✅ | — |

**Dirty count:** 1 / 25.

## Total dirty cells: 10 across 5 files (`03`, `05`, `06`, `07`, `12`)

## Promotion criteria

Each rule promotes WARN → hard-fail independently when its dirty count reaches 0/25 in a clean CI run. Recommended sweep order:

1. **Ambiguity (Rule 3)** — 1 cell, trivial — quickest hard-fail promotion.
2. **Health Score (Rule 1)** — 4 cells, mechanical — highest-value (most-machine-parsed row).
3. **AI Confidence (Rule 2)** — 5 cells, includes 1 prose-restructure (`12`).

## SSOT

- Schema: [`spec/01-spec-authoring-guide/14-scoring-metrics.md`](../../../spec/01-spec-authoring-guide/14-scoring-metrics.md)
- Gate definition: [`spec/01-spec-authoring-guide/97-acceptance-criteria.md`](../../../spec/01-spec-authoring-guide/97-acceptance-criteria.md) §`G-00-OVERVIEW-SCORING-VALUE-FORMAT`
- Registry row: [`spec/_GATE-REGISTRY.md`](../../../spec/_GATE-REGISTRY.md) v1.3.0

## Trio coverage status (post-mint)

| Layer | H1 | Scoring | AI Contract |
|-------|----|----|----|
| 1 (presence) | `G-09-OVERVIEW-H1-MATCHES-FOLDER-INDEX` ✅ | `G-00-OVERVIEW-SCORING-TABLE-PRESENT` ✅ | `G-00-OVERVIEW-AI-CONTRACT-PRESENT` ✅ |
| 2 (rows / subsections) | n/a — single line | `G-00-OVERVIEW-SCORING-TABLE-COMPLETE` ✅ (R1 hard-fail) | `G-00-OVERVIEW-AI-CONTRACT-COMPLETE` ✅ (R1+2 hard-fail) |
| 2.5 (value shapes) | n/a | **`G-00-OVERVIEW-SCORING-VALUE-FORMAT`** (this gate, all WARN) | n/a — bodies are prose |

Layer-2.5 has no AI Contract counterpart by design: AI Contract subsection bodies are free-form prose, not parseable cells.
