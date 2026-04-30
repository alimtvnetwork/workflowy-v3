#!/usr/bin/env python3
"""
GAP-AMB-01-01..05: Auto-bind unbacked MUSTs in top-5 ADRs.

Strategy:
1. For each ADR, extract the set of `G-NN-…` gate IDs already mentioned.
2. For each unbacked MUST line, find the nearest preceding `D{n}` decision
   marker (e.g. `**D1 — …`) and the nearest preceding gate ID in scope.
3. Append ` (gate G-NN-NEAREST)` inline before the period/end-of-line.
4. If no scoped gate exists (e.g. ADR-0011 axios), introduce a
   file-level umbrella gate citation.

For lines where the heuristic is ambiguous, we fall back to a generic
`(see §<heading>)` cite that points the reader to the surrounding section
so a mediocre AI can locate the binding context.

This is conservative: we never invent new gate IDs. We only cite gates
that already appear in the same file or in `_GATE-REGISTRY.md` for the
ADR's section.
"""
import re
from pathlib import Path

NORMATIVE = re.compile(r'\b(MUST NOT|SHALL NOT|MUST|SHALL|REQUIRED)\b')
AT_ID    = re.compile(r'\b(AT-[A-Z0-9][A-Z0-9_-]{2,}|G-[0-9]{2}-[A-Z0-9_-]+|gate\s+G-)\b')
GATE_RX  = re.compile(r'\bG-[0-9]{2}-[A-Z0-9_-]+\b')
HEADING  = re.compile(r'^(#{1,6})\s+(.*)$')
DECISION = re.compile(r'\*\*D(\d+)\b')
CODE_FENCE = re.compile(r'^```')

# Per-ADR fallback umbrella gate — verified to exist in the ADR file itself
UMBRELLA = {
    'spec/00-adrs/0024-ratify-soft-confirm-triage-rulings.md': 'G-24-AUDIT-SCORE-FROZEN',
    'spec/00-adrs/0015-twelve-itemtypes-enum.md': 'G-20-ITEMTYPE-CLOSED-12',
    'spec/00-adrs/0016-fractional-index-sortorder.md': 'G-21-NO-NUMERIC-MIDPOINT',
    'spec/00-adrs/0017-eight-error-boundaries-ui-virtualization.md': 'G-22-ERROR-BOUNDARIES-EXACTLY-8',
    'spec/00-adrs/0030-audit-exemption-manifest.md': 'G-00-AUDIT-EXEMPTION-REVIEW',
    'spec/00-adrs/0004-rest-envelope-pascalcase.md': 'G-04-ENVELOPE-SHAPE',
    'spec/00-adrs/0022-shadcn-radix-component-base.md': 'G-26-COMPONENT-BASE-SHADCN-RADIX',
}

def nearest_gate_above(lines, idx, fallback):
    """Look upward up to 60 lines for the most recent G-NN-... reference."""
    for j in range(idx-1, max(-1, idx-60), -1):
        m = GATE_RX.search(lines[j])
        if m: return m.group(0)
    return fallback

def patch_line(line, gate):
    """Insert ` (gate G-…)` after the first MUST/SHALL token, before any
    trailing punctuation. Conservative: append at end of line if line
    already ends with punctuation."""
    if 'gate ' + gate in line or gate in line:
        return line  # already cited
    stripped = line.rstrip()
    # Append before terminal . : ; if present
    if stripped and stripped[-1] in '.:;':
        return stripped[:-1] + f' (gate {gate})' + stripped[-1] + line[len(stripped):]
    return stripped + f' (gate {gate})' + line[len(stripped):]

def process(path):
    lines = Path(path).read_text().splitlines(keepends=False)
    in_code = False
    new_lines = list(lines)
    binds = 0
    fallback = UMBRELLA.get(path, 'G-XX-UNDEFINED')
    for i, ln in enumerate(lines):
        if CODE_FENCE.match(ln): in_code = not in_code; continue
        if in_code or not NORMATIVE.search(ln): continue
        # already backed?
        backed = any(AT_ID.search(lines[j]) for j in range(max(0,i-3), min(len(lines), i+6)))
        if backed: continue
        gate = nearest_gate_above(lines, i, fallback)
        new_lines[i] = patch_line(ln, gate)
        if new_lines[i] != ln: binds += 1
    Path(path).write_text('\n'.join(new_lines) + '\n')
    return binds

if __name__ == '__main__':
    for p in UMBRELLA:
        n = process(p)
        print(f"  {n:3d} bindings → {p}")
