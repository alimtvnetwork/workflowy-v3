# AT — Per-(gate, path) Ledger Shared Library Extraction (DRY Refactor)

**Gate:** G-13-LEDGER-PER-GATE-PATH (DRY consolidation)
**Date:** 2026-04-29
**Trigger:** Eliminate 3-way duplication of `globToRegExp()`, ledger table-walker, backtick-strip, and `isExempt` primitive across G-30/G-31/G-32 runners (ADR-0007 R-DRY).

## What changed

### New module: `scripts/spec-hygiene/_lib/per-gate-path-ledger.mjs`

Exports four primitives, each ≤15 logic lines per ADR-0007 R3:

| Export | Purpose |
|---|---|
| `globToRegExp(glob)` | POSIX-glob → RegExp (`**` / `*` / literals) |
| `stripBackticks(s)` | Idempotent markdown-cell unwrap |
| `walkLedger({ ledgerPath, parseGateCell, fail })` | Generator yielding normalised rows from `## Entries` table; hard-fails on schema violations |
| `buildGlobMap(rows, keyOf)` | Per-key → `[RegExp, …]` map builder |
| `isExempt({ overrideSet, entry, key, globMap, hostFile })` | Path-aware suppression check (override-Set + glob-bound) |

The walker delegates the **gate-cell shape** to a caller-supplied `parseGateCell(gate, lineNo)` so each runner keeps gate-specific semantics:
- G-30: literal `G-30-AT-CITATION-VALIDITY` → `{}`
- G-31: `G-31.<n>.<peer|island|head>` → `{scopeId, category}`
- G-32: `G-32.<n>.<coverage|reverse|nonunique|parity>` → `{category}`

### Runner refactors (3 files)

Each runner now imports the four primitives and reduces its loader from
~50 lines to ~15 lines of gate-shape glue:

| Runner | Before | After | Δ |
|---|---:|---:|---:|
| `30-check-at-citation-validity.mjs` | 56 lines (loader + glob + isExempt) | 32 lines (parseGateCell + loader + isExempt thunk) | −24 |
| `31-check-workflow-xref-reciprocity.mjs` | 67 lines | 39 lines | −28 |
| `32-check-ddl-unique-coverage.mjs` | 64 lines | 33 lines | −31 |
| **Net duplicate code removed** | | | **−83 lines** |

### Ledger heading canonicalisation

`spec/01-spec-authoring-guide/_LEDGER-G-30-EXEMPTIONS.md`'s `## Exemption rows` section was renamed to `## Entries` to match the canonical Phase-1 schema fixture (`spec/13-cicd-pipeline-workflows/scripts-as-spec/per-gate-path-ledger-schema.md`). G-31 and G-32 ledgers already used `## Entries`. All three ledgers are now schema-uniform.

## Verification

- Each runner standalone: parity confirmed (G-30: 25 open-prefixes flagged when uncovered; G-31: 0 ERROR-scope asymmetries; G-32: 0 fabricated, 8 reverse-exempt).
- Full sweep `node scripts/spec-hygiene/00-run-all.mjs` → **✅ All spec-hygiene checks passed** after G-35 inventory regen.
- **Negative test (G-30)**: corrupting all `spec/31-app/01-features` pathGlobs → `G-30.2 redundancy (ERROR): 25 open prefix(es) MUST be removed` (was: zero). Restored: zero candidates. **Shared-lib enforcement is real, not vacuous.**

## Why this matters

Future ledger consumers (e.g. a hypothetical G-29 endpoint-coverage ledger
or G-46 AT-citation-completeness ledger) now author **only** the gate-cell
parser and the per-runner check-site wiring — never the table walker,
backtick strip, glob compiler, or exempt primitive. ADR-0029 candidate
("all ledger consumers MUST use `_lib/per-gate-path-ledger.mjs`") becomes
trivial to author and enforce.

## Logic-line audit (ADR-0007 R3 conformance)

All 5 exported functions in `_lib/per-gate-path-ledger.mjs` are ≤15 logic
lines (counted manually 2026-04-29). The two private helpers
(`readLedger`, `isTableDataRow`, `normaliseRow`) are also ≤15 lines each.
