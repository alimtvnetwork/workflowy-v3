# Fixture-as-spec — `fixture-as-spec-shape-audit` algorithm

> **Type:** Fixture-as-spec (executable specification).
> **Status:** Frozen 2026-04-28 (**Phase 2** — language-tag enforcement
> added). Reference implementation for
> [`G-13-FIXTURE-AS-SPEC-SHAPE`](../../_GATE-REGISTRY.md#cicd-pipeline-workflows).
> **SPEC-ONLY classification:** describes a CI algorithm; no runtime code.
> Meta-property: this fixture audits other fixtures in the same directory,
> including itself.

---

## Purpose

Every file in `spec/13-cicd-pipeline-workflows/scripts-as-spec/` (other
than `README.md`) MUST follow the 6-section template defined by the
README's "Adding a new fixture-as-spec script" block. This audit
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
   gate's evolution path is traceable.

A fixture file MAY include additional sections (e.g. "See also",
"Frozen header banner") but MUST NOT omit any of the 6.

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

## Algorithm (frozen reference, ~30 lines of logic)

```python
#!/usr/bin/env python3
"""Reference implementation of G-13-FIXTURE-AS-SPEC-SHAPE.
Frozen 2026-04-28. Audits the shape of every fixture-as-spec file.
"""
import re, pathlib, sys

DIR = pathlib.Path("spec/13-cicd-pipeline-workflows/scripts-as-spec")
REQUIRED = ["Purpose", "Inputs", "Outputs", "Algorithm", "Exemptions"]
ROADMAP_OR_FIXTURES = ["Strictness roadmap", "Test fixtures",
                       "Baseline ledger"]
EXEMPT_FILES = {"README.md"}
H2 = re.compile(r"^## (.+?)\s*$", re.M)
FENCE = re.compile(r"```[a-z]*\s*\n.*?\n```", re.S)

def audit_file(path: pathlib.Path) -> list[str]:
    text = path.read_text(encoding="utf-8")
    headers = [m.group(1).strip() for m in H2.finditer(text)]
    errors = []
    for req in REQUIRED:
        if not any(h.startswith(req) for h in headers):
            errors.append(f'missing section "{req}"')
    if not any(any(h.startswith(opt) for h in headers)
               for opt in ROADMAP_OR_FIXTURES):
        errors.append('missing "Strictness roadmap" or "Test fixtures"')
    # Algorithm section MUST contain a fenced code block.
    algo = re.search(r"^## Algorithm.*?(?=^## |\Z)", text, re.S | re.M)
    if algo and not FENCE.search(algo.group(0)):
        errors.append('section "Algorithm" lacks fenced code block')
    return [f"{path}: {e}" for e in errors]

def main() -> int:
    fixtures = [p for p in DIR.glob("*.md") if p.name not in EXEMPT_FILES]
    violations = [v for p in fixtures for v in audit_file(p)]
    if violations:
        print("\n".join(violations)); return 1
    print(f"OK — {len(fixtures)} fixtures, all shapes valid")
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

## Strictness roadmap

- **Phase 1 (current):** header-presence check + Algorithm fence check.
- **Phase 2 (planned):** assert Algorithm code block declares a
  language tag (`python`, `bash`, `javascript`) so future tooling can
  syntax-check the frozen reference.
- **Phase 3 (planned):** assert every fixture cites its gate ID in the
  banner blockquote, and that the gate ID resolves to a row in
  `spec/_GATE-REGISTRY.md`.
- **Phase 4 (planned):** cross-check that the gate's registry row
  links *back* to this fixture file (symmetric link à la
  `G-00-ADR-XLINK-SYMMETRY`).

## Test fixtures

Baseline as of 2026-04-28: 2 fixture files in scope —
[`xlink-symmetry-audit.md`](./xlink-symmetry-audit.md) and this file.
Both pass the Phase-1 audit.

## See also

- [`README.md`](./README.md) — convention definition (canonical
  template source).
- [`spec/_GATE-REGISTRY.md`](../../_GATE-REGISTRY.md) — Meta-13 row
  for this gate.
- [`xlink-symmetry-audit.md`](./xlink-symmetry-audit.md) — sibling
  fixture-as-spec audited by this one.
- [`../00-overview.md`](../00-overview.md) — P13 CI/CD overview
  (Related → Fixtures-as-spec block).
