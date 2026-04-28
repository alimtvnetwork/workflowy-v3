# TEST FIXTURE — Phases 1-3 deliberate PASS: baseline

> **Type:** Test fixture (frozen positive case).
> **Targets gate:** `G-13-FIXTURE-AS-SPEC-SHAPE`
> **Phases covered:** 1 (header presence), 2 (Algorithm fence has
> allowlisted lang tag), 3 (banner cites a gate ID resolving in the
> registry). **Phase 4 is N/A** for this fixture — see Exemptions.
> **Expected exit (Phase ≤3 only):** `0`.
> **Expected stdout substring:** absence of any violation line
> referencing this file's name.
> **Out-of-scope for production scan** (lives under `_TEST-CORPUS/`).
> **Banner gate citation:** `G-13-FIXTURE-AS-SPEC-SHAPE`

---

## Purpose

This is the minimal-conforming counterpart to the `PHASE-4-FAIL-*`
fixtures in this folder. It MUST pass Phases 1-3 of the shape audit
when intentionally scanned, demonstrating the algorithm's positive
case for the parts of the contract that are universally checkable:

1. **Phase 1** — has all 6 required H2 sections.
2. **Phase 2** — Algorithm fence has an allowlisted language tag
   (`bash`).
3. **Phase 3** — banner cites a gate ID that resolves in the
   registry (`G-13-FIXTURE-AS-SPEC-SHAPE`).

If this file ever produces a Phase 1-3 violation, the audit has
broken its positive contract and is rejecting valid input.

## Inputs

- This file itself.
- The live `spec/_GATE-REGISTRY.md`.

## Outputs

When the shape audit is intentionally pointed at this file under a
**Phase ≤3 runner profile** (default for test-corpus baselines):

- **Expected exit:** `0`.
- **Expected stdout:** no line containing `PHASE-4-PASS-baseline.md`.

When run under a **Phase-4 runner profile** (NOT the default — only
the production-scan profile applies Phase 4), this fixture is
**expected to fail** with the same back-link asymmetry violation as
the `PHASE-4-FAIL-asymmetric-backlink.md` sibling, because the cited
gate's registry row legitimately points at the production fixture
and there is no per-(gate, file) carve-out available.

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
| Phase-4 back-link symmetry | **Phase 4 is N/A for test-corpus baselines.** The runner contract (defined in [`./README.md`](./README.md)) MUST set `phase_max=3` when scanning test-corpus PASS fixtures; otherwise this baseline would fail (the cited gate's registry row points at the production fixture, not at this one). The existing `BACKLINK_EXEMPT` ledger uses per-gate granularity, which is too coarse to express "exempt only inside `_TEST-CORPUS/`" without weakening the production guarantee. A future per-(gate, path) ledger upgrade COULD allow Phase-4 here, but is deferred. |

## Test fixtures

This file IS a test fixture; runner contract is defined in
[`./README.md`](./README.md).
