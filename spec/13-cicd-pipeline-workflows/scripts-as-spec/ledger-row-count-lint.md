# Ledger Row-Count Lint — Frozen Audit Algorithm

> **Type:** Fixture-as-spec (frozen reference algorithm).
> **Version:** 1.0.0 — initial.
> **Status:** Live since 2026-04-28.
> **Cited gates:** `G-13-LEDGER-ROW-COUNT-PARITY`
> (see [`spec/_GATE-REGISTRY.md`](../../_GATE-REGISTRY.md)).
> **Companion ledger:** [`spec/_LEDGER-G-13-BACKLINK-EXEMPT.md`](../../_LEDGER-G-13-BACKLINK-EXEMPT.md)
> — failure-modes block §"Algorithm-side contract" explicitly defers
> this Phase-5 lint to a separate fixture; this file fulfils that
> deferral.

---

## Purpose

Detect silent **row drop** in `_LEDGER-G-13-BACKLINK-EXEMPT.md`. The
ledger's loader (`load_backlink_exempt()`) tolerates malformed rows by
skipping them — a useful failure mode for production safety, but a
liability for ledger integrity: a typo in a row's leading number column
or a missing backtick around the gate ID would silently shrink the
exempt set without any signal.

This audit asserts **set-size parity** between two row counts:

1. **Visual count** — rows under the `## Exempt gates` H2 whose first
   non-pipe cell parses as a positive integer.
2. **Loader count** — `len(load_backlink_exempt())`.

Any mismatch → exit 1.

---

## Algorithm

```python
import pathlib, re, sys

LEDGER = pathlib.Path("spec/_LEDGER-G-13-BACKLINK-EXEMPT.md")
HEADING = "## Exempt gates"
ROW_NUMBERED = re.compile(r"^\|\s*(\d+)\s*\|", re.M)
ROW_LOADED = re.compile(r"^\|\s*\d+\s*\|\s*`(G-[A-Z0-9][A-Z0-9-]+)`",
                        re.M)

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
    visual = ROW_NUMBERED.findall(section)
    loaded = ROW_LOADED.findall(section)
    if len(visual) != len(loaded):
        dropped = set(visual) - {v for v, _ in zip(visual, loaded)}
        print(f"FAIL — visual rows={len(visual)} "
              f"loader rows={len(loaded)} "
              f"(silent drop suspected near row #{sorted(dropped)[0] if dropped else '?'})")
        return 1
    print(f"OK — {len(visual)} ledger row(s) parse cleanly "
          f"(visual == loader).")
    return 0

if __name__ == "__main__":
    sys.exit(main())
```

---

## Inputs

- `spec/_LEDGER-G-13-BACKLINK-EXEMPT.md` — the only file read.

## Outputs

- Exit `0` + `OK …` line on parity (or absent ledger).
- Exit `1` + `FAIL …` line on drop, naming the suspected row #.

## Failure modes

- **Both regexes fail to match** → counts equal at 0 → exits OK. This
  is acceptable: an empty/missing-section ledger means strict symmetry
  for ALL gates, which Phase 4 will then surface separately.
- **Numbering gap** (e.g. rows 1, 2, 4 — row 3 deleted not marked
  Removed) → both counts equal 3 → exits OK. Numbering hygiene is out
  of scope for this lint and belongs to a future
  `G-13-LEDGER-NUMBERING-CONTIGUOUS` gate (not minted today).

## Test corpus

Live frozen fixtures under `_TEST-CORPUS/` cover the FAIL paths for
sibling Phase-3/Phase-4 audits. A FAIL fixture for this lint
(`PHASE-5-FAIL-ledger-row-drop.md`) is **not** minted today because the
lint operates on a single project-wide ledger rather than per-file
specs; corpus-style isolation would require a separate test-only
ledger path, which is deferred to the runner-contract gate
(`G-13-AUDIT-RUNNER-CONTRACT`, pending).

---

## See also

- [`fixture-as-spec-shape-audit.md`](./fixture-as-spec-shape-audit.md)
  — Phase 4 consumer of `load_backlink_exempt()`.
- [`spec/_LEDGER-G-13-BACKLINK-EXEMPT.md`](../../_LEDGER-G-13-BACKLINK-EXEMPT.md)
  — The ledger this lint guards.
- [`README.md`](./README.md) — Index of fixture-as-spec scripts.

---

*Created 2026-04-28 — fulfils the Phase-5 lint deferred by the
ledger's "Algorithm-side contract" failure-modes block.*
