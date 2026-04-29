# Fixture-as-spec — `fixture-as-spec-shape-audit` algorithm

> **Type:** Fixture-as-spec (executable specification).
> **Status:** Frozen 2026-04-28 (**Phase 4** — registry-row back-link
> symmetry check; v1.0.1 hardening: skip 3 documentation-placeholder
> tokens + accept strikethrough rows as registered, per
> [`spec/_GATE-REGISTRY.md` §5.1](../../_GATE-REGISTRY.md)). Reference
> implementation for [`G-13-FIXTURE-AS-SPEC-SHAPE`](../../_GATE-REGISTRY.md#cicd-pipeline-workflows).
> **SPEC-ONLY classification:** describes a CI algorithm; no runtime code.
> Meta-property: this fixture audits other fixtures in the same directory,
> including itself, AND audits the registry's reciprocal links to them.

---

## Purpose

Every file in `spec/13-cicd-pipeline-workflows/scripts-as-spec/` (other
than `README.md`) MUST follow the 6-section template defined by the
README's "Adding a new fixture-as-spec script" block (gate `G-13-FIXTURE-SHAPE-6-SECTIONS`). This audit
mechanizes that template check so a reviewer can verify shape
compliance without re-reading the README.

The 6 required sections are:

1. **Purpose** — single paragraph stating what the gate enforces.
2. **Inputs** — files/dirs the algorithm reads.
3. **Outputs** — stdout shape + exit code semantics.
4. **Algorithm** — fenced code block, frozen reference implementation.
5. **Exemptions** — canonical list of cases the gate skips.
6. **Strictness roadmap** *(optional but recommended)* OR **Test
   fixtures** link — at least one of the two MUST be present so the
   gate's evolution path is traceable (gate `G-13-FIXTURE-SHAPE-EVOLUTION-LINK`).

A fixture file MAY include additional sections (e.g. "See also",
"Frozen header banner") but MUST NOT omit any of the 6 (gate `G-13-FIXTURE-SHAPE-6-SECTIONS`).

## Inputs

- **`spec/13-cicd-pipeline-workflows/scripts-as-spec/`** — directory
  containing all fixture-as-spec markdown files.
- **`spec/13-cicd-pipeline-workflows/scripts-as-spec/README.md`** —
  the canonical template definition (used to extract the required
  section list, so this fixture self-updates if the README changes).

## Outputs

- **stdout (success):** `OK — N fixtures, all shapes valid` summary.
- **stdout (failure):** one line per violation in the form
  `<fixture-path>: missing section "<section-name>"` or
  `<fixture-path>: section "Algorithm" lacks fenced code block`.
- **exit code:** `0` on clean audit, `1` on any violation.

## Algorithm (frozen reference, ~75 lines of logic)

```python
#!/usr/bin/env python3
"""Reference implementation of G-13-FIXTURE-AS-SPEC-SHAPE.
Frozen 2026-04-28 — Phase 4 (registry-row back-link symmetry).
Audits the shape of every fixture-as-spec file AND the reciprocal
registry rows that cite them.
"""
import re, pathlib, sys

DIR = pathlib.Path("spec/13-cicd-pipeline-workflows/scripts-as-spec")
REGISTRY = pathlib.Path("spec/_GATE-REGISTRY.md")
REQUIRED = ["Purpose", "Inputs", "Outputs", "Algorithm", "Exemptions"]
ROADMAP_OR_FIXTURES = ["Strictness roadmap", "Test fixtures",
                       "Baseline ledger"]
EXEMPT_FILES = {"README.md"}
ALLOWED_LANGS = {"python", "bash", "sh", "javascript", "js",
                 "typescript", "ts"}
H2 = re.compile(r"^## (.+?)\s*$", re.M)
FENCE_TAGGED = re.compile(r"```([a-zA-Z0-9_+-]+)\s*\n.*?\n```", re.S)
FENCE_ANY = re.compile(r"```[a-zA-Z0-9_+-]*\s*\n.*?\n```", re.S)
GATE_ID = re.compile(r"`(G-[A-Z0-9][A-Z0-9-]+)`")
BANNER = re.compile(r"^> .+(?:\n> .+)*", re.M)
# Documentation placeholders in §4 naming-rule prose — NOT real gates.
# Reconciliation rationale: see spec/_GATE-REGISTRY.md §5.1.
PLACEHOLDER_TOKENS = {"G-NN", "G-NN-NAME", "G-DOMAIN-NN"}
# Phase 4: registry row = a markdown table row that starts with
# `| \`G-NN-...\` |` and contains a link path. Capture (gate_id, link_path).
# Optional `~~` allows superseded (strikethrough) rows to count as registered
# per §4 rule 3 ("never delete history").
REGISTRY_ROW = re.compile(
    r"^\|\s*~?~?`(G-[A-Z0-9][A-Z0-9-]+)`~?~?\s*\|[^|]*\|\s*\[[^\]]+\]\(([^)]+)\)",
    re.M,
)
# Phase-4 carve-out: gates whose authoritative spec lives outside
# scripts-as-spec/ are loaded from the ledger file (append-only, audited).
EXEMPT_LEDGER = pathlib.Path("spec/_LEDGER-G-13-BACKLINK-EXEMPT.md")
EXEMPT_ROW = re.compile(r"^\|\s*\d+\s*\|\s*`(G-[A-Z0-9][A-Z0-9-]+)`",
                        re.M)

def load_backlink_exempt() -> set[str]:
    if not EXEMPT_LEDGER.exists():
        return set()
    return set(EXEMPT_ROW.findall(
        EXEMPT_LEDGER.read_text(encoding="utf-8")))

def registry_gate_ids() -> set[str]:
    raw = set(GATE_ID.findall(REGISTRY.read_text(encoding="utf-8")))
    return raw - PLACEHOLDER_TOKENS

def registry_rows() -> dict[str, str]:
    """Map gate_id → primary-file path as written in the registry row."""
    return {m.group(1): m.group(2)
            for m in REGISTRY_ROW.finditer(REGISTRY.read_text(encoding="utf-8"))}

def audit_file(path: pathlib.Path, known_gates: set[str],
               rows: dict[str, str],
               exempt: set[str]) -> list[str]:
    text = path.read_text(encoding="utf-8")
    headers = [m.group(1).strip() for m in H2.finditer(text)]
    errors = []
    for req in REQUIRED:
        if not any(h.startswith(req) for h in headers):
            errors.append(f'missing section "{req}"')
    if not any(any(h.startswith(opt) for h in headers)
               for opt in ROADMAP_OR_FIXTURES):
        errors.append('missing "Strictness roadmap" or "Test fixtures"')
    algo = re.search(r"^## Algorithm.*?(?=^## |\Z)", text, re.S | re.M)
    if algo:
        body = algo.group(0)
        tagged = [m.group(1).lower() for m in FENCE_TAGGED.finditer(body)]
        if not FENCE_ANY.search(body):
            errors.append('Algorithm lacks fenced code block')
        elif not tagged:
            errors.append('Algorithm fence lacks language tag')
        elif not any(t in ALLOWED_LANGS for t in tagged):
            errors.append(f'Algorithm uses disallowed lang(s): {tagged}')
    banner = BANNER.search(text)
    cited = GATE_ID.findall(banner.group(0) if banner else "")
    if not cited:
        errors.append('banner cites no gate ID')
    for gid in cited:
        if gid not in known_gates:
            errors.append(f'banner cites unregistered `{gid}`')
            continue
        # Phase 4: registry row for this gate MUST link back to THIS
        # file, UNLESS the gate is in the ledger-driven exempt set
        # (authoritative spec lives elsewhere).
        if gid in exempt:
            continue
        row_path = rows.get(gid, "")
        if path.name not in row_path:
            errors.append(
                f'registry row for `{gid}` links to "{row_path}", '
                f'expected back-link to "{path.name}" '
                f'(asymmetric: add `{gid}` to '
                f'spec/_LEDGER-G-13-BACKLINK-EXEMPT.md or '
                f'point its registry row at this fixture)')
    return [f"{path}: {e}" for e in errors]

def main() -> int:
    known = registry_gate_ids()
    rows = registry_rows()
    exempt = load_backlink_exempt()
    fixtures = [p for p in DIR.glob("*.md") if p.name not in EXEMPT_FILES]
    violations = [v for p in fixtures
                  for v in audit_file(p, known, rows, exempt)]
    if violations:
        print("\n".join(violations)); return 1
    print(f"OK — {len(fixtures)} fixtures, Phase-4 symmetric "
          f"({len(known)} gates known, {len(rows)} rows parsed, "
          f"{len(exempt)} ledger-exempt)")
    return 0

if __name__ == "__main__":
    sys.exit(main())
```

## Exemptions

| File / pattern | Reason |
|---------------|--------|
| `README.md` | Convention definition, not a fixture. |
| Files prefixed with `_` (e.g. `_DRAFT-*.md`) | Reserved for in-progress drafts; promote by removing prefix. |
| H2 headers with trailing parenthetical (e.g. `## Algorithm (frozen reference, 35 lines of logic)`) | Match by `startswith()` — the parenthetical is informational. |
| **Phase-4 ledger-driven carve-out:** gates whose authoritative spec lives outside `scripts-as-spec/` are listed in [`spec/_LEDGER-G-13-BACKLINK-EXEMPT.md`](../../_LEDGER-G-13-BACKLINK-EXEMPT.md) and loaded into the algorithm at runtime. The fixture MUST still cite the gate (Phase 3) and the authoritative spec MUST link forward to the fixture (covered by `G-00-ADR-XLINK-SYMMETRY`-style review). To exempt a new gate, add a row to the ledger — do NOT edit this fixture. |

## Strictness roadmap

- **Phase 1 (shipped 2026-04-28 morning):** header-presence check + Algorithm fence check.
- **Phase 2 (shipped 2026-04-28 afternoon):** Algorithm fence MUST
  declare an allowed language tag from
  `{python, bash, sh, javascript, js, typescript, ts}` (gate `G-13-FIXTURE-SHAPE-PHASE2-LANG-TAG`).
- **Phase 3 (shipped 2026-04-28 evening):** the file's banner
  blockquote MUST cite at least one gate ID, AND every cited gate ID
  MUST resolve to a row in `spec/_GATE-REGISTRY.md` (gate `G-13-FIXTURE-SHAPE-PHASE3-GATE-CITED`).
- **Phase 4 (current — shipped 2026-04-28 night, FINAL phase):** for
  every gate ID cited in a fixture's banner, the corresponding
  `spec/_GATE-REGISTRY.md` row MUST link back to that fixture file (by
  filename match in the row's primary-file link) (gate `G-13-FIXTURE-SHAPE-PHASE4-BACKLINK`). This closes the
  meta-symmetry loop and makes `G-13-FIXTURE-AS-SPEC-SHAPE` the
  fixture-corpus equivalent of `G-00-ADR-XLINK-SYMMETRY` for the ADR
  corpus. No further phases planned; further extensions require a new
  sibling gate.

## Test fixtures

Baseline as of 2026-04-28 (post-Phase-4, FINAL):
- [`xlink-symmetry-audit.md`](./xlink-symmetry-audit.md) — banner
  cites `G-00-ADR-XLINK-SYMMETRY`; registry row's primary-file link
  resolves to `spec/00-adrs/_INDEX_AUTOMATION.md` (the gate's
  authoritative spec) — **NOT** to this fixture file. **This is an
  expected exception**: the fixture-as-spec convention allows a gate's
  authoritative spec to live outside `scripts-as-spec/` provided the
  fixture is referenced from there. See "Exemptions" below for the
  carve-out.
- [`fixture-as-spec-shape-audit.md`](./fixture-as-spec-shape-audit.md)
  (this file) — banner cites `G-13-FIXTURE-AS-SPEC-SHAPE`; registry
  row's primary-file link resolves to this very file ✓ symmetric.

Phase-4 result: 2/2 fixtures pass once the carve-out for
"authoritative-spec-elsewhere" gates is applied.

## See also

- [`README.md`](./README.md) — convention definition (canonical
  template source).
- [`spec/_GATE-REGISTRY.md`](../../_GATE-REGISTRY.md) — Meta-13 row
  for this gate.
- [`xlink-symmetry-audit.md`](./xlink-symmetry-audit.md) — sibling
  fixture-as-spec audited by this one.
- [`../00-overview.md`](../00-overview.md) — P13 CI/CD overview
  (Related → Fixtures-as-spec block).
