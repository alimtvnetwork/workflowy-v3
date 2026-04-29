# Audit — G-13-AUDIT-RUNNER-CONTRACT

**Date:** 2026-04-29
**Task:** Lock invariants of `scripts/spec-hygiene/00-run-all.mjs` so the gate registry's `**CI**`-tier label is enforced by a real runner contract (not a documentation promise).

## Why

Before this gate, any of the following could silently break CI without tripping a guard:
- Drop a checker from the runner's `checks` array → orphan checker, gate becomes documentation-only.
- Add `try`/`catch` around `spawnSync` swallowing non-zero exits → CI passes despite gate failures.
- Replace `process.exit(1)` with bare `return` after the loop → aggregated failure lost.
- Point CI workflow at individual checks → drift from runner; per-script invocation desync.
- Leave a stale entry pointing at a deleted script → `node` exits 1 silently per check, but failure attribution is lost.

## Baseline (2026-04-29)

| Rule | Status |
|------|--------|
| 1. Single entry point | ✅ `scripts/spec-hygiene/00-run-all.mjs` exists |
| 2. Aggregated `process.exit(1)` | ✅ line 55 |
| 3. No silent skips | ✅ no `try`/`catch` around `spawnSync` |
| 4. No stale entries | ✅ all 32 entries resolve to disk files |
| 5. CI workflow uses runner | ✅ `.github/workflows/spec-hygiene.yml` invokes `node scripts/spec-hygiene/00-run-all.mjs` |
| 6. No orphan checkers | ✅ every `\d{2}-check-*.mjs` outside whitelist is wired |

Ships hard-fail from day 1 with zero violations.

## Whitelist (helper/generator scripts exempt from rule 6)

- `04-generate-index.mjs`
- `10-fix-related-blocks.mjs`
- `11-generate-auto-toc.mjs`
- `13-generate-at-stubs.mjs`
- `14-split-oversized-files.mjs`
- `35-allow-list-inventory.mjs` (invoked with `--check` flag in runner)
- `40-generate-contract-json.mjs`
- `41-generate-skeletons.mjs`
- `43-generate-condensed-overviews.mjs`
- `44-fix-feature-block-format.mjs`
- `45-append-p13-orphan-stubs.mjs`
- `49-fixture-stub-generator.mjs`
- `50-append-fixtures-to-condensed.mjs`
- `51-thicken-f-overviews.mjs`
- `99-convert-headers.mjs`

These are codegen / autofix utilities, not pass/fail checkers, so excluding them from rule 6 is correct.

## Future

`G-13-AUDIT-RUNNER-PARITY` would assert `len(runner.checks) == count(CI-tier rows in _GATE-REGISTRY.md)`. Currently 32 vs 33 (delta = this meta-gate, enforced by file-existence rather than a checker). Deferred until at least one more meta-gate exists, to confirm the offset is meaningful rather than off-by-one.
