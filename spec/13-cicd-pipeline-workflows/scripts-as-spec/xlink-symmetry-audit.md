# Fixture-as-spec — `xlink-symmetry-audit` algorithm

> **Type:** Fixture-as-spec (executable specification).
> **Status:** Frozen 2026-04-28. Reference implementation for
> [`G-00-ADR-XLINK-SYMMETRY`](../../00-adrs/_INDEX_AUTOMATION.md#g-00-adr-xlink-symmetry-planned).
> **SPEC-ONLY classification:** describes a CI algorithm; no runtime code.
> When the gate is mechanized under
> `spec/13-cicd-pipeline-workflows/`, the implementation MUST produce
> the same input → output behaviour as this fixture, validated against
> the [baseline ledger](../../00-adrs/_LEDGER-G-00-ADR-XLINK-SYMMETRY-BASELINE.md).

---

## Purpose

Mechanize the symmetry check that `G-00-ADR-XLINK-SYMMETRY` mandates:
every outbound link from an Accepted ADR's `## Decision` section to a
non-ADR repo file MUST have a reciprocal back-link.

## Inputs

- **`spec/00-adrs/`** — directory containing all ADR markdown files
  named `NNNN-*.md`.
- **Repo root** — for resolving relative link paths.

## Outputs

- **stdout (success):** summary line + `0 violations`.
- **stdout (failure):** one line per violation in the form
  `ADR-NNNN → <target-path>[#<anchor>] [<reason>]`.
- **exit code:** `0` on clean audit, `1` on any violation.

## Algorithm (frozen reference, 35 lines of logic)

```python
#!/usr/bin/env python3
"""Reference implementation of G-00-ADR-XLINK-SYMMETRY.
Frozen 2026-04-28 from /tmp/xlink_audit.py used in retro-audit.
"""
import re, pathlib, sys

ADR_DIR = pathlib.Path("spec/00-adrs")
link_re = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")

def decision_section(text: str) -> str:
    """Extract the `## Decision` section body (until next H2)."""
    m = re.search(r"^## Decision\s*$", text, re.M)
    if not m: return ""
    start = m.end()
    n = re.search(r"^## ", text[start:], re.M)
    return text[start:start + (n.start() if n else len(text))]

violations = []
checked = 0

for adr_path in sorted(ADR_DIR.glob("[0-9][0-9][0-9][0-9]-*.md")):
    adr_num = adr_path.name[:4]
    decision = decision_section(adr_path.read_text())
    if not decision: continue

    for label, url in link_re.findall(decision):
        path_part = url.split("#", 1)[0]
        anchor = url.split("#", 1)[1] if "#" in url else ""
        if not path_part or path_part.startswith(("http://", "https://", "mailto:")):
            continue
        target = (adr_path.parent / path_part).resolve()
        try: rel = target.relative_to(pathlib.Path(".").resolve())
        except ValueError: continue
        # Skip intra-ADR links (covered by G-00-ADR-INDEX-FRESH).
        if str(rel).startswith("spec/00-adrs/"): continue
        if not target.exists() or target.is_dir():
            violations.append((adr_num, label, str(rel), anchor, "TARGET MISSING"))
            continue
        checked += 1
        ttext = target.read_text(errors="ignore")
        # Reciprocal back-link: filename ref OR `ADR-NNNN` mention.
        back_re = re.compile(rf"{adr_num}-[a-z0-9-]+\.md|ADR-{adr_num}\b")
        if not back_re.search(ttext):
            violations.append((adr_num, label, str(rel), anchor, "NO BACK-LINK"))

print(f"Checked {checked} outbound non-ADR Decision-section links.")
print(f"  ❌ Violations: {len(violations)}")
for v in violations:
    print(f"  ADR-{v[0]} → {v[2]}{('#'+v[3]) if v[3] else ''} [{v[4]}]")
sys.exit(1 if violations else 0)
```

## Exemptions (canonical, must be preserved by the implementation)

| Exemption | Rationale |
|---|---|
| Links from `## Context` or `## Consequences` (only `## Decision` is scanned) | Citations and forward-references in those sections are not load-bearing decisions. |
| Links into `spec/00-adrs/` (intra-ADR cross-refs) | Covered by sibling gate `G-00-ADR-INDEX-FRESH`. |
| External URLs (`http://`, `https://`, `mailto:`) | Not under repo control. |
| Bare anchor links (`[…](#anchor)`) | Self-reference within the same ADR; symmetry is trivially intra-file. |

## Test fixtures (golden inputs)

The [baseline ledger](../../00-adrs/_LEDGER-G-00-ADR-XLINK-SYMMETRY-BASELINE.md)
documents the **4 known-good symmetric pairs** as of 2026-04-28:

1. `ADR-0024 §D1` ↔ `.lovable/question-and-ambiguity/00-triage-summary.md#01--…`
2. `ADR-0024 §D2` ↔ `.lovable/question-and-ambiguity/00-triage-summary.md#03--…`
3. `ADR-0024 §D3` ↔ `.lovable/question-and-ambiguity/00-triage-summary.md#17--…`
4. `ADR-0026 §D2` ↔ `spec/04-database-conventions/00-overview.md#alias-bridge-columns`

A correct CI implementation MUST produce `Checked 4`, `Violations: 0`,
and `exit 0` against the unmodified `main` branch on or after 2026-04-28
until the ledger is amended.

## Strictness roadmap

The frozen algorithm above checks **file-level** back-link presence
(any `ADR-NNNN` mention anywhere in the target). A future Phase-2 of
this gate MUST tighten to **anchor-locality**: the back-link must
appear at-or-above the linked target anchor heading, matching the
prose form `Ratified by ADR-NNNN §Dn` or a Markdown link to
`…0024-…md#dn`. Phase-2 promotion requires:

1. A new ledger snapshot demonstrating zero anchor-locality violations.
2. Updating this fixture's algorithm to include the locality check.
3. Bumping the gate's tier from DOC-NORM to CI in
   `spec/_GATE-REGISTRY.md`.

## See also

- [`spec/00-adrs/_INDEX_AUTOMATION.md`](../../00-adrs/_INDEX_AUTOMATION.md#g-00-adr-xlink-symmetry-planned)
  — gate specification.
- [`spec/00-adrs/_LEDGER-G-00-ADR-XLINK-SYMMETRY-BASELINE.md`](../../00-adrs/_LEDGER-G-00-ADR-XLINK-SYMMETRY-BASELINE.md)
  — baseline ledger (4 symmetric pairs).
- [`spec/_GATE-REGISTRY.md`](../../_GATE-REGISTRY.md) — Meta-00 row.
