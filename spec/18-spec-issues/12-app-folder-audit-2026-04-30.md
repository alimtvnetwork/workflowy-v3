# 31-app/ folder audit — 2026-04-30 (Phases 1–6)

**Auditor:** Lovable AI (in-loop, spec-only mode)
**Scope:** All 136 files in `spec/31-app/`
**Method:** 6 read-only phases (Structural, Coding-Guidelines, Booleans/Enums, Split-DB & Seedable-Config, Content-Completeness, AI-Readiness scoring)
**Defaults:** Q1=31-app only · Q2=Critical+High in backlog · Q3=30 max per phase

## Summary

| Phase | Findings | Critical | High | Med | Low |
|---|---:|---:|---:|---:|---:|
| P1 Structural | 10 | 2 | 2 | 4 | 2 |
| P2 Coding-Guidelines (post-withdrawal of F-APP-CG-01) | 9 | 0 | 4 | 3 | 2 |
| P3 Booleans/Enums | 8 | 1 | 3 | 3 | 1 |
| P4 Split-DB & Seedable-Config | 9 | 2 | 4 | 2 | 1 |
| P5 Content Completeness | 10 | 2 | 4 | 3 | 1 |
| P6 AI-Readiness | 5 | 1 | 2 | 2 | 0 |
| **Total** | **51** | **8** | **19** | **17** | **7** |

**Critical+High (this ledger entry):** 27 findings (`F-AUD42-01` through `F-AUD42-27`).

## Top architectural themes

1. **Endpoint files are the weakest layer** — 24/24 lack DB-routing declarations; 14/24 score 1–2/5 on API contract.
2. **No central registries** — ItemType list, OptionNameType groups, enum vocabulary all live as scattered literals.
3. **17 of 18 feature files have zero cross-link to `06-endpoints/`** — bidirectional traceability is broken.
4. **`16-search-ranking.md` is F-tier (7/25)** — flagship feature with stub-only spec.
5. **ADR-0023 loader↔queue contract and ADR-0017 named error boundaries cited 0× in feature files.**
6. **`14-concurrency-and-sync.md` is the only 25/25** — promote as authoring template.

## Phase-2 correction (recorded for transparency)

`F-APP-CG-01` (initially Critical, "IndexedDB used as primary persistence") was **WITHDRAWN** the same audit cycle. Core memory clarifies offline queue + local mirror are *correctly* IndexedDB-backed (ADR-0021/0023). The "IndexedDB-as-primary forbidden" rule applies to primary domain data only.

## Findings → ledger mapping

The 27 Critical+High findings are tracked as `F-AUD42-01..27` in `spec/AUDIT-FINDINGS-LEDGER.md`.
Med + Low findings (24 items) are recorded in this audit document only and may be promoted on demand.

## Critical (8)

| Local ID | Ledger ID | Title |
|---|---|---|
| F-APP-DB-01 | F-AUD42-01 | All 24 endpoint files lack DB-routing declarations |
| F-APP-DB-02 | F-AUD42-02 | 10 of 18 feature files lack DB-routing tables |
| F-APP-EN-01 | F-AUD42-03 | ItemType case drift across spec (Bullet/Board/board/dashboard/Root) |
| F-APP-CC-01 | F-AUD42-04 | 17 of 18 feature files have zero cross-link to `06-endpoints/` |
| F-APP-CC-02 | F-AUD42-05 | `16-search-ranking.md` is critically thin (BE/FE/DB ≤2, EP=0) |
| F-APP-AI-01 | F-AUD42-06 | Search scores 7/25 (F-tier) |
| F-APP-STR-01 | F-AUD42-07 | (Phase-1 Critical) Endpoint AT-matrix gaps |
| F-APP-STR-02 | F-AUD42-08 | (Phase-1 Critical) Missing/stale `00-overview.md` references |

## High (19)

| Local ID | Ledger ID | Title |
|---|---|---|
| F-APP-CG-02 | F-AUD42-09 | Raw `string` IDs in field tables (violates ADR-0020 branded `ItemId`) |
| F-APP-CG-03 | F-AUD42-10 | 5-second SSE polling fallback contradicts ADR-0025 (SSE-only) |
| F-APP-CG-04 | F-AUD42-11 | `bool` keyword used in TS/API contracts (should be `boolean`) |
| F-APP-CG-05 | F-AUD42-12 | Split-DB referenced in only 3 of 24 endpoint/feature files |
| F-APP-EN-02 | F-AUD42-13 | Boolean naming convention violated in 14 endpoint/field declarations |
| F-APP-EN-03 | F-AUD42-14 | PHP-style `bool` in TS contracts (4 occurrences) |
| F-APP-EN-04 | F-AUD42-15 | `Completed: boolean` API drops `CompletedAt` fidelity |
| F-APP-DB-03 | F-AUD42-16 | Search workspace-scoping vs cross-workspace search undefined |
| F-APP-DB-04 | F-AUD42-17 | Cross-DB template apply lacks crash/idempotency contract |
| F-APP-SC-01 | F-AUD42-18 | 18 of 18 non-settings feature files lack seedable-config N/A justification |
| F-APP-SC-02 | F-AUD42-19 | `Sanitizer::oneOf(string-array)` instead of enum class |
| F-APP-CC-03 | F-AUD42-20 | ADR-0023 loader↔queue contract cited in 0 feature files |
| F-APP-CC-04 | F-AUD42-21 | ADR-0017 named error boundaries cited in 0 feature files |
| F-APP-CC-05 | F-AUD42-22 | 6 feature files have BE:0 (context-menu, share-dialog, mirrors, …) |
| F-APP-CC-06 | F-AUD42-23 | 5 sub-feature files thin across multiple axes (07b/08b/12b/13b/14b) |
| F-APP-AI-02 | F-AUD42-24 | All 4 sub-feature files (07b, 08b, 12b, 13b) score D-tier |
| F-APP-AI-03 | F-AUD42-25 | API axis is the weakest column corpus-wide (14/24 score 1–2/5) |
| F-APP-STR-03 | F-AUD42-26 | (Phase-1 High) Numbering gaps / sibling sub-features off-pattern |
| F-APP-STR-04 | F-AUD42-27 | (Phase-1 High) `99-consistency-report.md` claims contradict actual file state |

## Med + Low (24, not promoted to ledger per Q2 default)

See per-phase responses in chat history (Phases 1–6, dated 2026-04-30) for full details.
Promote on demand via `next promote F-APP-…` instruction.

## Methodology notes

- Read-only audit. Zero spec edits during Phases 1–6.
- Phase-7 ledger write-up (this document + `AUDIT-FINDINGS-LEDGER.md` rows) is the only spec mutation in the audit cycle.
- AI Implementability stayed within audit-cap range: 97.7% → 97.2% (Δ −0.5 across 6 phases, all `audit` type).
