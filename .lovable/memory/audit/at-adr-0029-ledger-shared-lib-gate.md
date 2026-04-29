# Audit — ADR-0029 + G-13-LEDGER-USES-SHARED-LIB

**Date:** 2026-04-29
**Registry:** v1.6.4 → v1.6.5
**Tasks:** Remaining-task #11 (ADR-0029) + #12 (enforcing gate) bundled.

## What shipped

1. **ADR-0029** (`spec/00-adrs/0029-per-gate-path-ledger-shared-lib.md`)
   - Codifies the proven G-30/G-31/G-32 trilogy refactor as architectural rule.
   - D1: All ledger consumers MUST import from `scripts/spec-hygiene/_lib/per-gate-path-ledger.mjs`.
   - D2: Runners contribute only a `parseGateCell()` glue function.
   - D3: Frozen ledger schema — `## Entries` heading, 5-column table.
   - D4: Three forbidden inline patterns.
   - 5 acceptance tests (AT-29-D1 through AT-29-D4-NO-DIRECT-LEDGER-READ).

2. **Gate `G-13-LEDGER-USES-SHARED-LIB`** (CI, new — runner #48)
   - Scans every `.mjs` under `scripts/spec-hygiene/` (excluding `_lib/`).
   - Flags inline `globToRegExp`, inline `walkLedger`, direct `readFile` of ledger files, and ledger mentions without the shared-lib import.
   - Result: 51 runners conform; exit=0.

## Negative test

- Swapped G-30's `from "./_lib/per-gate-path-ledger.mjs"` → `from "node:path"`.
- Re-ran gate: exit=1, surfaces "references ledger without importing _lib/per-gate-path-ledger.mjs" with file path + remediation hint pointing to ADR-0029.
- Restored: exit=0, 51 conform.

## Counts

- Gates total: 310 → 311 (+1 CI: `G-13-LEDGER-USES-SHARED-LIB`)
- CI tier: 41 → 42
- Hygiene runners: 47 → 48
- ADRs: 28 → 29
