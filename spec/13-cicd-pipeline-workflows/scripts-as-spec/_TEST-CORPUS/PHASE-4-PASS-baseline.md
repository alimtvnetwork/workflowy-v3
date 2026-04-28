# TEST FIXTURE — Phase-4 deliberate PASS: baseline

> **Type:** Test fixture (frozen positive case).
> **Targets gate:** `G-13-FIXTURE-AS-SPEC-SHAPE`
> **Phase:** 4 (registry-row back-link symmetry — passes via
> `BACKLINK_EXEMPT` carve-out registered in
> `spec/_LEDGER-G-13-BACKLINK-EXEMPT.md` row #2).
> **Expected exit:** `0`
> **Expected stdout substring:** `OK — 1 fixtures, Phase-4 symmetric`
> (when scanned in isolation; in a multi-file scan, the substring is
> simply the absence of any violation line referencing this file).
> **Out-of-scope for production scan** (lives under `_TEST-CORPUS/`).
> **Banner gate citation:** `G-13-FIXTURE-AS-SPEC-SHAPE`

---

## Purpose

This fixture is the minimal-conforming counterpart to the
`PHASE-4-FAIL-*` test fixtures in this folder. It MUST pass every
phase of the shape audit when intentionally scanned, demonstrating
the algorithm's positive case:

1. **Phase 1** — has all 6 required H2 sections.
2. **Phase 2** — Algorithm fence has an allowlisted language tag.
3. **Phase 3** — banner cites a gate ID that resolves in the registry.
4. **Phase 4** — back-link symmetry holds (via the
   `BACKLINK_EXEMPT` carve-out — see Exemptions).

If this file ever produces a violation under Phase ≤4, the audit has
broken its positive contract and is rejecting valid input.

## Inputs

- This file itself.
- The live `spec/_GATE-REGISTRY.md`.
- The live `spec/_LEDGER-G-13-BACKLINK-EXEMPT.md` (MUST contain a row
  for `G-13-FIXTURE-AS-SPEC-SHAPE` scoped to this test corpus — see
  Exemptions below).

## Outputs

When the shape audit is intentionally pointed at this file:

- **Expected exit:** `0`.
- **Expected stdout (single-file run):** `OK — 1 fixtures, Phase-4
  symmetric (N gates known, M rows parsed, K ledger-exempt)`.
- **Expected stdout (multi-file run including this one):** no line
  containing `PHASE-4-PASS-baseline.md` appears in the violations
  block.

## Algorithm

```bash
# This file has no algorithm of its own; it is a frozen INPUT to the
# audit under test. The algorithm being verified lives in
# ../fixture-as-spec-shape-audit.md.
:
```

## Exemptions

| Case | Reason |
|------|--------|
| Production audit scan | Lives under `_TEST-CORPUS/`; the production scan uses non-recursive `glob("*.md")` and never sees it. |
| Phase-4 back-link symmetry for the cited gate | The cited gate `G-13-FIXTURE-AS-SPEC-SHAPE` legitimately points its registry-row link at the **production** fixture (`fixture-as-spec-shape-audit.md`), not at this test-corpus baseline. The carve-out is recorded in `spec/_LEDGER-G-13-BACKLINK-EXEMPT.md` row #2 with a `Scope: test-corpus only` justification, so the production scan's symmetry guarantee is unaffected. |

## Test fixtures

This file IS a test fixture; runner contract is defined in
[`./README.md`](./README.md).
