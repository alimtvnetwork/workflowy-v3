# `_TEST-CORPUS/` — Deliberate-fail fixtures for audit gates

> **Type:** Test-corpus (frozen, data-only).
> **Status:** Live since 2026-04-28.
> **Out-of-scope for production audits.** The Phase-4 shape audit
> (`G-13-FIXTURE-AS-SPEC-SHAPE`) and the parity audit
> (`G-13-PLACEHOLDER-TOKEN-PARITY`) both scan
> `spec/13-cicd-pipeline-workflows/scripts-as-spec/` with `glob("*.md")`
> (non-recursive); files in this sub-directory are therefore invisible
> to those production runs.

---

## Why this folder exists

A fixture-as-spec algorithm is only as trustworthy as its rejection
behaviour. Without a frozen corpus of inputs that **MUST** trip each
algorithm, regressions to the algorithm itself can silently turn a
real defect into a false negative.

This folder hosts two kinds of files:

1. **Negative cases** (`*-FAIL-*.md`) — files engineered to violate a
   specific phase of an audit gate. The expected behaviour is
   **exit code 1** with a specific violation message.
2. **Positive cases** (`*-PASS-*.md`) — minimal files engineered to
   pass every phase. The expected behaviour is **exit code 0**.

Each test fixture's banner declares (a) which gate it targets,
(b) which phase, (c) the expected exit code, and (d) the expected
substring(s) in stdout.

---

## Contents (2026-04-28)

| File | Targets | Phase | Expected exit | Expected stdout substring |
|------|---------|-------|--------------:|---------------------------|
| [`PHASE-4-FAIL-asymmetric-backlink.md`](./PHASE-4-FAIL-asymmetric-backlink.md) | `G-13-FIXTURE-AS-SPEC-SHAPE` | 4 | `1` | `registry row for ... links to ..., expected back-link to "PHASE-4-FAIL-asymmetric-backlink.md"` |
| [`PHASE-4-FAIL-strikethrough-only.md`](./PHASE-4-FAIL-strikethrough-only.md) | `G-13-FIXTURE-AS-SPEC-SHAPE` | 4 | `1` | `registry row for \`G-28-NO-PHYSICAL-MARGINS\` links to ".../0028-i18n-locale-strategy.md"` |

---

## Runner contract (specified, not yet implemented)

A future CI workflow MUST iterate this folder, copy each test fixture
into a temp directory alongside a snapshot of `spec/_GATE-REGISTRY.md`
and `spec/_LEDGER-G-13-BACKLINK-EXEMPT.md`, run the target audit, and
assert:

1. The exit code matches `Expected exit`.
2. Every substring in `Expected stdout substring` is present in stdout.

This contract is itself a candidate for a future
`G-13-AUDIT-RUNNER-CONTRACT` gate (deferred — not minted today).

---

## How to add a new test fixture

1. Choose `PHASE-N-FAIL-<slug>.md` or `PHASE-N-PASS-<slug>.md`.
2. Banner MUST cite: target gate ID, phase, expected exit code,
   expected stdout substring(s).
3. Body MUST be the minimal example that triggers the case.
4. Append a row to the table above.

## SPEC-ONLY classification

These files are inert markdown. They MUST NOT be `import`ed by runtime
code. The future runner described above is itself a SPEC-ONLY artifact
until the `exit spec-only` trigger is invoked.

## See also

- [`../fixture-as-spec-shape-audit.md`](../fixture-as-spec-shape-audit.md) — Audit under test (Phase 4).
- [`../placeholder-token-parity-audit.md`](../placeholder-token-parity-audit.md) — Sibling audit (parity guard).
- [`../README.md`](../README.md) — Parent directory convention.
