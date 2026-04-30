# `scripts-as-spec/` — Executable specifications for CI gates

> **Purpose.** When a gate is mechanizable but not yet shipped as a CI
> workflow under `spec/13-cicd-pipeline-workflows/`, its **algorithm
> MUST be frozen here** as a fixture-as-spec. The frozen markdown is (gate `G-13-FIXTURE-AS-SPEC-SHAPE`)
> the load-bearing source: any later CI implementation is a derivative
> and must produce identical input → output behaviour.

## Why this directory exists

The project's spec/ tree allows fixtures-as-spec (data + algorithms
described declaratively). `scripts-as-spec/` is the narrower convention
for gate algorithms specifically:

- A gate is defined in its source ADR or in
  `spec/00-adrs/_INDEX_AUTOMATION.md`.
- Its **algorithm** (parsing, traversal, comparison) is frozen here.
- Its **acceptance baseline** is captured in a sibling
  `_LEDGER-*.md` next to the gate definition.
- Its **CI workflow** (when shipped) lives elsewhere under
  `spec/13-cicd-pipeline-workflows/` and MUST cite this fixture as (gate `G-13-FIXTURE-AS-SPEC-SHAPE`)
  its specification.

## Contents (2026-04-28)

| File | Gate | Status |
|------|------|--------|
| [`xlink-symmetry-audit.md`](./xlink-symmetry-audit.md) | `G-00-ADR-XLINK-SYMMETRY` | Frozen — Phase 1 (file-level back-link check) |
| [`fixture-as-spec-shape-audit.md`](./fixture-as-spec-shape-audit.md) | `G-13-FIXTURE-AS-SPEC-SHAPE` | Frozen — Phase 4 (FINAL): header presence + tagged Algorithm fence + banner cites resolved gate ID + registry row back-links to fixture (with `BACKLINK_EXEMPT` carve-out for authoritative-spec-elsewhere gates). Self-audits this directory. |
| [`placeholder-token-parity-audit.md`](./placeholder-token-parity-audit.md) | `G-13-PLACEHOLDER-TOKEN-PARITY` | Frozen — Phase 1: set equality between `fixture-as-spec-shape-audit.md`'s `PLACEHOLDER_TOKENS` literal and registry §5.1 "Documentation placeholders" row (drift guard). |
| [`ledger-row-count-lint.md`](./ledger-row-count-lint.md) | `G-13-LEDGER-ROW-COUNT-PARITY` | Frozen — Phase 5 nibble: visual-row count under `## Exempt gates` in `_LEDGER-G-13-BACKLINK-EXEMPT.md` MUST equal `len(load_backlink_exempt())`; guards against silent row-drop typos. |
| [`ledger-numbering-contiguous-lint.md`](./ledger-numbering-contiguous-lint.md) | `G-13-LEDGER-NUMBERING-CONTIGUOUS` | Frozen — Phase 5 sibling: leading-number column MUST form `1..N` contiguous sequence; guards against hard-deleted rows that erase audit trail. |

> **Test corpus.** Deliberate-fail and minimal-pass fixtures for the audits above live in [`./_TEST-CORPUS/`](./_TEST-CORPUS/README.md). The production scan uses non-recursive `glob("*.md")` and never picks them up; they exist as a frozen rejection-behaviour spec for a future audit-runner CI job.

## Adding a new fixture-as-spec script

1. The gate MUST already exist in `spec/_GATE-REGISTRY.md`.
2. Create `<gate-slug>.md` in this directory with sections:
   - Purpose (1 paragraph)
   - Inputs / Outputs / Exit codes
   - **Algorithm** — fenced code block, frozen reference implementation
   - Exemptions table (canonical list)
   - Test fixtures (link to baseline ledger)
   - Strictness roadmap (if Phase-N promotion is anticipated)
3. Append a row to the table above.
4. Cross-link from the gate's defining file (per
   `G-00-ADR-XLINK-SYMMETRY` itself).

## SPEC-ONLY classification

Files here describe algorithms; they MUST NOT be `import`ed or `exec`-ed
by runtime code. Promotion to runtime requires the user trigger phrase
`exit spec-only` or `go for implementation` per the project's
SPEC-ONLY MODE invariant.

## Parent

- [`../00-overview.md`](../00-overview.md) — P13 CI/CD overview (Related → Fixtures-as-spec block surfaces this directory).
