# Ledger — `G-13-FIXTURE-AS-SPEC-SHAPE` Phase-4 Backlink Exemptions

> **Type:** Ledger (frozen list, append-only).
> **Status:** Live since 2026-04-28.
> **Consumed by:**
> [`spec/13-cicd-pipeline-workflows/scripts-as-spec/fixture-as-spec-shape-audit.md`](./13-cicd-pipeline-workflows/scripts-as-spec/fixture-as-spec-shape-audit.md)
> — Phase-4 algorithm loads the `Gate ID` column of the table below
> into its `BACKLINK_EXEMPT` set.
> **Cited gate:** `G-13-FIXTURE-AS-SPEC-SHAPE` (see
> [`spec/_GATE-REGISTRY.md`](./_GATE-REGISTRY.md)).

---

## Why this ledger exists

Phase 4 of `G-13-FIXTURE-AS-SPEC-SHAPE` enforces that, for every gate
ID cited in a fixture-as-spec banner, the corresponding row in
`spec/_GATE-REGISTRY.md` MUST link back to the fixture file.

Some gates legitimately violate that rule because their **authoritative
spec** lives outside `spec/13-cicd-pipeline-workflows/scripts-as-spec/`.
For those gates, the registry row points at the authoritative spec
(correctly), and the fixture-as-spec is merely a *frozen reference
algorithm* — not the source of truth. Without an exemption, Phase 4
would falsely flag these as asymmetric.

This ledger is the **single source of truth** for the carve-out set.
The fixture-as-spec algorithm MUST load this file rather than
hard-coding the set, so additions are reviewable in version control
and never silently embedded in code.

---

## Exempt gates

| # | Gate ID | Authoritative Spec (where registry row points) | Fixture (where algorithm lives) | Added | Justification |
|---|---------|------------------------------------------------|---------------------------------|-------|---------------|
| 1 | `G-00-ADR-XLINK-SYMMETRY` | [`spec/00-adrs/_INDEX_AUTOMATION.md`](./00-adrs/_INDEX_AUTOMATION.md) | [`scripts-as-spec/xlink-symmetry-audit.md`](./13-cicd-pipeline-workflows/scripts-as-spec/xlink-symmetry-audit.md) | 2026-04-28 | The gate's binding spec is the ADR-index automation file (it governs ADR Decision-section symmetry); the fixture only freezes the audit algorithm. Forward link `_INDEX_AUTOMATION.md` → fixture already exists (verified by manual review of the same file's "Frozen reference algorithm" subsection). |

---

## How to add a new exemption

1. Open a PR that adds a row to the table above with all 5 columns
   filled in.
2. The `Justification` column MUST explain why the gate's authoritative
   spec lives outside `scripts-as-spec/` and confirm that a *forward*
   link from the authoritative spec to the fixture exists.
3. Bump the consumer fixture's banner status if the carve-out logic
   itself changes (the set being read from this file is data, not
   logic — adding rows does NOT bump the consumer).
4. Re-run the Phase-4 self-audit; expect the new gate to print as
   `(BACKLINK_EXEMPT — carve-out applied) ✓`.

## How to remove an exemption

Exemptions are **not deleted** — they are marked with a `Removed`
column and a `Superseded-by:` cross-reference (mirrors the registry's
deletion convention). Removing a row entirely would erase the audit
trail of why a gate was once exempt.

---

## Algorithm-side contract

The Phase-4 algorithm reads this file as follows (frozen reference):

```python
EXEMPT_LEDGER = pathlib.Path("spec/_LEDGER-G-13-BACKLINK-EXEMPT.md")
EXEMPT_ROW = re.compile(r"^\|\s*\d+\s*\|\s*`(G-[A-Z0-9][A-Z0-9-]+)`",
                        re.M)

def load_backlink_exempt() -> set[str]:
    if not EXEMPT_LEDGER.exists():
        return set()
    return set(EXEMPT_ROW.findall(EXEMPT_LEDGER.read_text(encoding="utf-8")))

# In main():
BACKLINK_EXEMPT = load_backlink_exempt()
```

Failure modes:
- Ledger file missing → empty set (Phase 4 enforces strict symmetry on
  ALL gates, surfacing any new asymmetric pair as a violation).
- Row malformed (non-numeric leading column, missing backticks) →
  silently skipped; **enforced by Phase-5 lint
  [`G-13-LEDGER-ROW-COUNT-PARITY`](./13-cicd-pipeline-workflows/scripts-as-spec/ledger-row-count-lint.md)**
  which asserts visual-row count equals loader-set size.

---

## See also

- [`spec/_GATE-REGISTRY.md`](./_GATE-REGISTRY.md) — `G-13-FIXTURE-AS-SPEC-SHAPE` registry row.
- [`spec/13-cicd-pipeline-workflows/scripts-as-spec/fixture-as-spec-shape-audit.md`](./13-cicd-pipeline-workflows/scripts-as-spec/fixture-as-spec-shape-audit.md) — Consumer fixture (Phase 4 algorithm).
- [`spec/00-adrs/_LEDGER-G-00-ADR-XLINK-SYMMETRY-BASELINE.md`](./00-adrs/_LEDGER-G-00-ADR-XLINK-SYMMETRY-BASELINE.md) — Sibling ledger pattern (baseline pairs for ADR symmetry gate).

---

*Created 2026-04-28 — promotes the hard-coded `BACKLINK_EXEMPT` set
out of the fixture's algorithm into a versioned, append-only ledger.*
