# TEST FIXTURE — Phase-4 deliberate FAIL: asymmetric back-link

> **Type:** Test fixture (frozen negative case).
> **Targets gate:** G-13-FIXTURE-AS-SPEC-SHAPE (intentionally cited in
> the banner below using inline-code backticks so the audit picks it up).
> **Phase:** 4 (registry-row back-link symmetry)
> **Expected exit:** `1`
> **Expected stdout substring:** `expected back-link to "PHASE-4-FAIL-asymmetric-backlink.md"`
> **Out-of-scope for production scan** (lives under `_TEST-CORPUS/`).
> **Banner gate citation:** `G-13-FIXTURE-AS-SPEC-SHAPE`

---

## Purpose

This fixture cites the production gate `G-13-FIXTURE-AS-SPEC-SHAPE`
in its banner. That gate's registry row legitimately points at the
production fixture (`fixture-as-spec-shape-audit.md`), NOT at this
test-corpus file. The gate is also NOT listed in
`spec/_LEDGER-G-13-BACKLINK-EXEMPT.md`. Therefore Phase 4 of the
shape audit MUST report an asymmetric back-link violation when this
file is included in the scan, and exit non-zero.

If the audit returns `OK` for this file (when intentionally scanned),
the Phase-4 check has regressed and is no longer enforcing back-link
symmetry.

## Inputs

- This file itself (a synthetic fixture-as-spec).
- The live `spec/_GATE-REGISTRY.md`.
- The live `spec/_LEDGER-G-13-BACKLINK-EXEMPT.md`.

## Outputs

When the shape audit is intentionally pointed at this file:

- **Expected exit:** `1`.
- **Expected stdout substring:**
  `…/PHASE-4-FAIL-asymmetric-backlink.md: registry row for \`G-13-FIXTURE-AS-SPEC-SHAPE\` links to "./13-cicd-pipeline-workflows/scripts-as-spec/fixture-as-spec-shape-audit.md", expected back-link to "PHASE-4-FAIL-asymmetric-backlink.md"`

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
| Production audit scan | This file lives under `_TEST-CORPUS/`; the production scan uses non-recursive `glob("*.md")` and never sees it. |

## Test fixtures

This file IS a test fixture; runner contract is defined in
[`./README.md`](./README.md).

