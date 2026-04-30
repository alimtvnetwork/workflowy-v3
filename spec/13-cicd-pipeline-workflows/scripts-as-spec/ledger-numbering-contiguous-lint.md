# Ledger Numbering Contiguity Lint — Frozen Audit Algorithm

> **Type:** Fixture-as-spec (frozen reference algorithm).
> **Version:** 1.0.0 — initial.
> **Status:** Live since 2026-04-28.
> **Cited gates:** `G-13-LEDGER-NUMBERING-CONTIGUOUS`
> (see [`spec/_GATE-REGISTRY.md`](../../_GATE-REGISTRY.md)).
> **Sibling lint:** [`ledger-row-count-lint.md`](./ledger-row-count-lint.md)
> — that lint guards visual↔loader parity (typo / missing backtick);
> this lint guards the orthogonal failure mode of **gaps** in the
> leading number column (e.g. rows `1, 2, 4` after row 3 was deleted
> instead of marked `Removed` per the ledger's deletion convention).

---

## Purpose

`spec/_LEDGER-G-13-BACKLINK-EXEMPT.md` documents a hard rule:
*"Exemptions are not deleted — they are marked with a `Removed`
column."* That rule is currently enforced only by code review. This
lint mechanizes it: any non-contiguous numbering is treated as
evidence that a row was hard-deleted, erasing the audit trail.

The lint is intentionally **separate** from
`G-13-LEDGER-ROW-COUNT-PARITY` because the two failure modes are
orthogonal — a ledger can have parity (visual rows == loader rows)
yet still skip a number, and vice versa.

---

## Algorithm

```python
import pathlib, re, sys

LEDGER = pathlib.Path("spec/_LEDGER-G-13-BACKLINK-EXEMPT.md")
HEADING = "## Exempt gates"
ROW_NUMBERED = re.compile(r"^\|\s*(\d+)\s*\|", re.M)

def section_after(text: str, heading: str) -> str:
    idx = text.find(heading)
    if idx < 0:
        return ""
    rest = text[idx + len(heading):]
    nxt = re.search(r"^## ", rest, re.M)
    return rest[:nxt.start()] if nxt else rest

def main() -> int:
    if not LEDGER.exists():
        print(f"OK — ledger absent ({LEDGER}); nothing to lint.")
        return 0
    body = LEDGER.read_text(encoding="utf-8")
    section = section_after(body, HEADING)
    nums = [int(n) for n in ROW_NUMBERED.findall(section)]
    if not nums:
        print("OK — no numbered rows; vacuous pass.")
        return 0
    expected = list(range(1, len(nums) + 1))
    if nums != expected:
        gaps = sorted(set(expected) - set(nums))
        dups = sorted({n for n in nums if nums.count(n) > 1})
        print(f"FAIL — numbering not contiguous 1..{len(nums)}. "
              f"Found={nums} gaps={gaps} duplicates={dups}. "
              f"Hard-deleted rows must be re-added with a `Removed` "
              f"column per ledger §'How to remove an exemption'.")
        return 1
    print(f"OK — {len(nums)} ledger row(s) numbered contiguously "
          f"1..{len(nums)}.")
    return 0

if __name__ == "__main__":
    sys.exit(main())
```

---

## Inputs

- `spec/_LEDGER-G-13-BACKLINK-EXEMPT.md` — the only file read.

## Outputs

- Exit `0` + `OK …` line on contiguous numbering (or absent ledger /
  empty section).
- Exit `1` + `FAIL …` line on gap or duplicate, naming both sets.

## Failure modes

- **Removed-but-renumbered** → if a maintainer deletes row 3 AND
  renumbers rows 4+ down by one, this lint passes (numbers are
  contiguous) but the audit trail is still erased. That failure mode
  is owned by `G-00-ADR-XLINK-SYMMETRY` Phase 2 (anchor-level
  back-link check, pending) which would notice the missing forward
  link from the formerly-exempt gate's authoritative spec.
- **Out-of-order numbering** (e.g. `1, 3, 2`) → counted as a gap
  failure (sequence ≠ `1..N`), which is the desired behaviour.

## Test corpus

Not minted today; same rationale as
[`ledger-row-count-lint.md`](./ledger-row-count-lint.md) §"Test
corpus" — the lint operates on a single project-wide ledger, so
isolation requires the runner-contract gate
(`G-13-AUDIT-RUNNER-CONTRACT`, pending) to thread an alternate ledger
path. Until then, this lint is verified by manual review of its
algorithm against the ledger's `known-good` baseline (commit hash recorded in the runner's golden-fixture).

---

## See also

- [`ledger-row-count-lint.md`](./ledger-row-count-lint.md)
  — Sibling lint (visual↔loader parity).
- [`spec/_LEDGER-G-13-BACKLINK-EXEMPT.md`](../../_LEDGER-G-13-BACKLINK-EXEMPT.md)
  §"How to remove an exemption" — Normative rule this lint enforces.
- [`README.md`](./README.md) — Index of fixture-as-spec scripts.

---

*Created 2026-04-28 — completes the Phase-5 ledger-integrity pair
(parity + contiguity) deferred from the row-count lint's scope.*
