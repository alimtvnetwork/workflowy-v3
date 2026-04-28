# TEST FIXTURE — Phase-4 deliberate FAIL: asymmetric back-link

> **Type:** Test fixture (frozen negative case).
> **Targets:** `G-13-FIXTURE-AS-SPEC-SHAPE`
> **Phase:** 4 (registry-row back-link symmetry)
> **Expected exit:** `1`
> **Expected stdout substring:** `registry row for \`G-12-LOGICAL-MARGINS-PADDING\` links to "...", expected back-link to "PHASE-4-FAIL-asymmetric-backlink.md"`
> **Out-of-scope for production scan** (lives under `_TEST-CORPUS/`).

---

## Purpose

This fixture cites `G-12-LOGICAL-MARGINS-PADDING` in its banner.
That gate's registry row points at `spec/00-adrs/0012-…` (or wherever
ADR-0012 §D7 lives) — **NOT** at this file. The gate is also **NOT**
listed in `spec/_LEDGER-G-13-BACKLINK-EXEMPT.md`. Therefore Phase 4
of the shape audit MUST report an asymmetric back-link violation and
exit non-zero.

If the audit returns `OK` for this file, the Phase-4 check has
regressed and is no longer enforcing back-link symmetry.

## Inputs

- This file itself (a synthetic fixture-as-spec).
- A snapshot of `spec/_GATE-REGISTRY.md` containing the
  `G-12-LOGICAL-MARGINS-PADDING` row pointing at ADR-0012.
- A snapshot of `spec/_LEDGER-G-13-BACKLINK-EXEMPT.md` that does NOT
  contain `G-12-LOGICAL-MARGINS-PADDING`.

## Outputs

When the shape audit is run with this file in scope:

- **Expected exit:** `1`.
- **Expected stdout (one of the violation lines):**
  `…/PHASE-4-FAIL-asymmetric-backlink.md: registry row for \`G-12-LOGICAL-MARGINS-PADDING\` links to "<ADR-0012 path>", expected back-link to "PHASE-4-FAIL-asymmetric-backlink.md" (asymmetric: add \`G-12-LOGICAL-MARGINS-PADDING\` to spec/_LEDGER-G-13-BACKLINK-EXEMPT.md or point its registry row at this fixture)`

## Algorithm

```text
This file has no Algorithm of its own — it is a frozen INPUT to the
audit under test. The audit's Algorithm is in
../fixture-as-spec-shape-audit.md.
```

## Exemptions

| Case | Reason |
|------|--------|
| Production audit scan | This file lives under `_TEST-CORPUS/`; the production scan uses non-recursive `glob("*.md")` and never sees it. |

## Test fixtures

This file IS a test fixture; runner contract is defined in
[`./README.md`](./README.md).
