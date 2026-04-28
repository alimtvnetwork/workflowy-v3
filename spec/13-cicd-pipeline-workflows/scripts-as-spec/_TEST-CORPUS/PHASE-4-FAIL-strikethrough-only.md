# TEST FIXTURE — Phase-4 deliberate FAIL: strikethrough-only row

> **Type:** Test fixture (frozen negative case).
> **Targets:** `G-13-FIXTURE-AS-SPEC-SHAPE`
> **Phase:** 4 (registry-row back-link symmetry)
> **Expected exit:** `1`
> **Expected stdout substring:** `registry row for \`G-28-NO-PHYSICAL-MARGINS\` links to "./00-adrs/0028-i18n-locale-strategy.md"`
> **Out-of-scope for production scan** (lives under `_TEST-CORPUS/`).

---

## Purpose

This fixture cites `G-28-NO-PHYSICAL-MARGINS`, a gate that exists in
`spec/_GATE-REGISTRY.md` ONLY as a **strikethrough row** (superseded
by `G-12-LOGICAL-MARGINS-PADDING` per ADR-0012 §D7). The
strikethrough-aware row regex (added to the audit in v1.0.1) makes
this gate "registered" for Phase 3 (banner cites a known gate), but
its row's primary-file link points at the ADR — not at this fixture.

Therefore Phase 4 MUST flag the row as asymmetric and exit `1`.

This test exists specifically to prove that:
1. Strikethrough rows ARE counted as registered (Phase 3 passes).
2. Strikethrough rows are NOT auto-exempt from Phase 4 (asymmetry
   detection still fires).

If Phase 4 returns `OK` for this file, the strikethrough-aware regex
has accidentally been promoted into a back-link bypass — a regression.

## Inputs

- This file itself.
- A snapshot of `spec/_GATE-REGISTRY.md` whose
  `~~G-28-NO-PHYSICAL-MARGINS~~` row links to
  `./00-adrs/0028-i18n-locale-strategy.md`.
- A snapshot of `spec/_LEDGER-G-13-BACKLINK-EXEMPT.md` that does NOT
  contain `G-28-NO-PHYSICAL-MARGINS`.

## Outputs

- **Expected exit:** `1`.
- **Expected stdout (violation line):**
  `…/PHASE-4-FAIL-strikethrough-only.md: registry row for \`G-28-NO-PHYSICAL-MARGINS\` links to "./00-adrs/0028-i18n-locale-strategy.md", expected back-link to "PHASE-4-FAIL-strikethrough-only.md" (asymmetric: add \`G-28-NO-PHYSICAL-MARGINS\` to spec/_LEDGER-G-13-BACKLINK-EXEMPT.md or point its registry row at this fixture)`

## Algorithm

```text
This file has no Algorithm of its own — it is a frozen INPUT to the
audit under test. See ../fixture-as-spec-shape-audit.md for the
algorithm being verified.
```

## Exemptions

| Case | Reason |
|------|--------|
| Production audit scan | This file lives under `_TEST-CORPUS/`; the production scan uses non-recursive `glob("*.md")` and never sees it. |

## Test fixtures

This file IS a test fixture; runner contract is defined in
[`./README.md`](./README.md).
