# TEST FIXTURE — Phase-4 deliberate FAIL: strikethrough-only row

> **Type:** Test fixture (frozen negative case).
> **Targets gate:** the production gate enforcing fixture-as-spec
> shape (cited in this banner via inline-code backticks below so the
> audit picks it up — but the violation we want to surface is about a
> different, superseded gate also cited below).
> **Phase:** 4 (registry-row back-link symmetry, with strikethrough
> rows treated as registered).
> **Expected exit:** `1`
> **Expected stdout substring:** `expected back-link to "PHASE-4-FAIL-strikethrough-only.md"`
> **Out-of-scope for production scan** (lives under `_TEST-CORPUS/`).
> **Banner gate citations:** `G-28-NO-PHYSICAL-MARGINS` (a SUPERSEDED
> strikethrough row in the registry) and `G-13-FIXTURE-AS-SPEC-SHAPE`
> (the production gate this corpus exercises).

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
1. Strikethrough rows ARE counted as registered (Phase 3 passes — no
   `unregistered ...` violation appears for the superseded gate).
2. Strikethrough rows are NOT auto-exempt from Phase 4 (asymmetry
   detection still fires for them).

If Phase 4 returns `OK` for this file, the strikethrough-aware regex
has accidentally been promoted into a back-link bypass — a
regression.

## Inputs

- This file itself.
- The live `spec/_GATE-REGISTRY.md` whose
  `~~G-28-NO-PHYSICAL-MARGINS~~` row links to
  `./00-adrs/0028-i18n-locale-strategy.md`.
- The live `spec/_LEDGER-G-13-BACKLINK-EXEMPT.md` (does NOT contain
  the superseded gate).

## Outputs

- **Expected exit:** `1`.
- **Expected stdout substring:**
  `…/PHASE-4-FAIL-strikethrough-only.md: registry row for \`G-28-NO-PHYSICAL-MARGINS\` links to "./00-adrs/0028-i18n-locale-strategy.md", expected back-link to "PHASE-4-FAIL-strikethrough-only.md"`

## Algorithm

```bash
# This file has no algorithm of its own; it is a frozen INPUT to the
# audit under test. See ../fixture-as-spec-shape-audit.md for the
# algorithm being verified.
:
```

## Exemptions

| Case | Reason |
|------|--------|
| Production audit scan | This file lives under `_TEST-CORPUS/`; the production scan uses non-recursive `glob("*.md")` and never sees it. |

## Test fixtures

This file IS a test fixture; runner contract is defined in
[`./README.md`](./README.md).
