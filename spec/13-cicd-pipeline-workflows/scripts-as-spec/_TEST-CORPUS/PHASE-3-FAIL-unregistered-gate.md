# TEST FIXTURE — Phase-3 deliberate FAIL: unregistered gate citation

> **Type:** Test fixture (frozen negative case).
> **Targets gate:** `G-13-FIXTURE-AS-SPEC-SHAPE`
> **Phase:** 3 (banner cites a gate ID that resolves in the registry)
> **Expected exit:** `1`
> **Expected stdout substring:** `unregistered \`G-99-NONEXISTENT-DEMO\``
> **Out-of-scope for production scan** (lives under `_TEST-CORPUS/`).
> **Banner gate citation:** `G-99-NONEXISTENT-DEMO` (synthetic — not
> in `spec/_GATE-REGISTRY.md` and never will be; no ADR-0099 exists or
> is planned).

---

## Purpose

This fixture cites `G-99-NONEXISTENT-DEMO`, which matches the audit's
gate-ID regex (`G-[A-Z0-9][A-Z0-9-]+`) but does NOT appear in
`spec/_GATE-REGISTRY.md`. Phase 3 of the shape audit MUST report
`unregistered \`G-99-NONEXISTENT-DEMO\`` and exit non-zero.

This test exists specifically to prove that:
1. The audit's banner-citation extraction works (the cited token IS
   recognised — otherwise we'd see `no gate cited` instead).
2. The registry-resolution check fires when a citation does not match
   any registered row (Phase 3 enforcement is live).
3. The 3 documented placeholder tokens (`G-NN`, `G-NN-NAME`,
   `G-DOMAIN-NN`, see `spec/_GATE-REGISTRY.md` §5.1) are the ONLY
   tokens whitelisted out — any other unrecognised token MUST fail.

If Phase 3 returns `OK` for this file, either the placeholder-skip
logic has accidentally been broadened, or the registry-resolution
check has regressed to a no-op.

## Inputs

- This file itself.
- The live `spec/_GATE-REGISTRY.md` (which does NOT contain
  `G-99-NONEXISTENT-DEMO`).

## Outputs

- **Expected exit:** `1`.
- **Expected stdout substring:**
  `…/PHASE-3-FAIL-unregistered-gate.md: banner cites unregistered \`G-99-NONEXISTENT-DEMO\``.

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
| Registry-pollution risk | The cited token `G-99-NONEXISTENT-DEMO` uses ADR slot 99, which is reserved-by-convention and will never be assigned. If a future PR proposes ADR-0099, this fixture's banner MUST be migrated to a fresh synthetic token (`G-100-NONEXISTENT-DEMO`, etc.) in the same PR. |

## Test fixtures

This file IS a test fixture; runner contract is defined in
[`./README.md`](./README.md).
