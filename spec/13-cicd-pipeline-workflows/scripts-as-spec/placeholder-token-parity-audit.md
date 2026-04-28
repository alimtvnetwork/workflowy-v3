# Fixture-as-spec — `placeholder-token-parity-audit` algorithm

> **Type:** Fixture-as-spec (executable specification).
> **Status:** Frozen 2026-04-28 (Phase 1 — set-equality drift guard).
> Reference implementation for [`G-13-PLACEHOLDER-TOKEN-PARITY`](../../_GATE-REGISTRY.md#cicd-pipeline-workflows).
> **SPEC-ONLY classification:** describes a CI algorithm; no runtime code.
> Companion to [`fixture-as-spec-shape-audit.md`](./fixture-as-spec-shape-audit.md) — guards against silent drift between its `PLACEHOLDER_TOKENS` constant and the registry's §5.1 reconciliation table.

---

## Purpose

The `fixture-as-spec-shape-audit.md` algorithm hard-codes a
`PLACEHOLDER_TOKENS = {"G-NN", "G-NN-NAME", "G-DOMAIN-NN"}` set that
filters documentation-placeholder tokens out of the registry's
gate-ID universe. The same set is documented in narrative form in
`spec/_GATE-REGISTRY.md` §5.1 ("Citation-vs-row Reconciliation").

If the two go out of sync (a new placeholder is added to one but not
the other), the audit fixture will either falsely report unregistered
citations OR silently accept a real gate ID as a placeholder. This
gate enforces **set equality** between the two locations so a single
PR is forced to update both, or CI fails.

## Inputs

- **`spec/13-cicd-pipeline-workflows/scripts-as-spec/fixture-as-spec-shape-audit.md`** — extract the `PLACEHOLDER_TOKENS = {...}` literal from the Algorithm fence.
- **`spec/_GATE-REGISTRY.md`** — extract the `Documentation placeholders` row of the §5.1 table (the cell containing the comma-separated `` `G-…` `` tokens).

## Outputs

- **stdout (success):** `OK — placeholder-token parity holds (N tokens: {set})`.
- **stdout (failure):** one line per missing-from-either-side token:
  - `MISSING IN AUDIT FIXTURE: <token>` (registry §5.1 lists it but audit fixture does not skip it).
  - `MISSING IN REGISTRY §5.1: <token>` (audit fixture skips it but §5.1 does not document why).
- **exit code:** `0` on parity, `1` on any drift.

## Algorithm (frozen reference, ~40 lines of logic)

```python
#!/usr/bin/env python3
"""Reference implementation of G-13-PLACEHOLDER-TOKEN-PARITY.
Frozen 2026-04-28 — Phase 1 (set-equality drift guard).
"""
import re, pathlib, sys

AUDIT_FIXTURE = pathlib.Path(
    "spec/13-cicd-pipeline-workflows/scripts-as-spec/"
    "fixture-as-spec-shape-audit.md")
REGISTRY = pathlib.Path("spec/_GATE-REGISTRY.md")

# Match: PLACEHOLDER_TOKENS = {"G-NN", "G-NN-NAME", "G-DOMAIN-NN"}
PLACEHOLDER_LITERAL = re.compile(
    r'PLACEHOLDER_TOKENS\s*=\s*\{([^}]*)\}', re.S)
QUOTED_TOKEN = re.compile(r'"(G-[A-Z0-9][A-Z0-9-]*)"')
# Match the §5.1 row whose first cell text starts with
# "Documentation placeholders" (case-insensitive). Capture the row body.
REG_ROW = re.compile(
    r'^\|\s*Documentation placeholders[^|]*\|[^|]*\|([^|]*)\|',
    re.I | re.M)
BACKTICK_TOKEN = re.compile(r'`(G-[A-Z0-9][A-Z0-9-]*)`')

def audit_fixture_set() -> set[str]:
    text = AUDIT_FIXTURE.read_text(encoding="utf-8")
    m = PLACEHOLDER_LITERAL.search(text)
    if not m:
        raise SystemExit(
            "FATAL: PLACEHOLDER_TOKENS literal not found in audit fixture")
    return set(QUOTED_TOKEN.findall(m.group(1)))

def registry_set() -> set[str]:
    text = REGISTRY.read_text(encoding="utf-8")
    m = REG_ROW.search(text)
    if not m:
        raise SystemExit(
            "FATAL: §5.1 'Documentation placeholders' row not found")
    return set(BACKTICK_TOKEN.findall(m.group(1)))

def main() -> int:
    audit = audit_fixture_set()
    registry = registry_set()
    drift = []
    for tok in sorted(registry - audit):
        drift.append(f"MISSING IN AUDIT FIXTURE: {tok}")
    for tok in sorted(audit - registry):
        drift.append(f"MISSING IN REGISTRY §5.1: {tok}")
    if drift:
        print("\n".join(drift))
        return 1
    print(f"OK — placeholder-token parity holds "
          f"({len(audit)} tokens: {sorted(audit)})")
    return 0

if __name__ == "__main__":
    sys.exit(main())
```

## Exemptions

| File / pattern | Reason |
|---------------|--------|
| None | Set equality is binary — there is no legitimate carve-out. If a placeholder is genuinely needed in only one location, the design is wrong; promote the reconciliation table or the audit fixture, never bypass this check. |

## Strictness roadmap

- **Phase 1 (current — shipped 2026-04-28 night):** set equality between the audit fixture's `PLACEHOLDER_TOKENS` literal and the registry §5.1 "Documentation placeholders" row.
- **Phase 2 (future, optional):** also assert that **none** of the placeholder tokens appear anywhere in `spec/_GATE-REGISTRY.md` outside §4 rule 5 prose and the §5.1 row itself — i.e. nobody is writing real gate citations using placeholder syntax. Requires a section-aware parser; deferred until needed.

## Test fixtures

Baseline as of 2026-04-28 (post-Phase-1):
- Audit fixture set: `{"G-NN", "G-NN-NAME", "G-DOMAIN-NN"}` (3 tokens).
- Registry §5.1 row: `{"G-NN", "G-NN-NAME", "G-DOMAIN-NN"}` (3 tokens).
- Result: ✅ parity holds; algorithm exits 0.

## See also

- [`fixture-as-spec-shape-audit.md`](./fixture-as-spec-shape-audit.md) — the audited fixture (owns the `PLACEHOLDER_TOKENS` literal).
- [`spec/_GATE-REGISTRY.md` §5.1](../../_GATE-REGISTRY.md) — the audited registry section.
- [`README.md`](./README.md) — directory convention.
