#!/usr/bin/env python3
"""
GAP-AMB-01: Corpus-wide audit for unbacked MUST/SHALL clauses.

Heuristic: a normative clause is "backed" if an AT-ID appears within
the same paragraph (separated by blank lines) OR within 5 lines after.
"""
import os, re, json, sys
from pathlib import Path
from collections import defaultdict

SPEC = Path("spec")
NORMATIVE = re.compile(r'\b(MUST NOT|SHALL NOT|MUST|SHALL|REQUIRED)\b')
AT_ID    = re.compile(r'\b(AT-[A-Z0-9][A-Z0-9_-]{2,}|G-[0-9]{2}-[A-Z0-9_-]+|gate\s+G-)\b')
HEADING  = re.compile(r'^#{1,6}\s')
CODE_FENCE = re.compile(r'^```')

def audit_file(path: Path):
    """Return list of {line, snippet, backed, file} for each MUST/SHALL line."""
    lines = path.read_text(encoding='utf-8', errors='replace').splitlines()
    in_code = False
    findings = []
    # Pre-compute paragraph spans
    para_of = [0] * len(lines)
    pid = 0
    for i, ln in enumerate(lines):
        if CODE_FENCE.match(ln):
            in_code = not in_code
        if not ln.strip():
            pid += 1
        para_of[i] = pid
    in_code = False
    for i, ln in enumerate(lines):
        if CODE_FENCE.match(ln):
            in_code = not in_code; continue
        if in_code: continue
        if not NORMATIVE.search(ln): continue
        # ignore prose talking about MUST conceptually (heuristic: must be in a sentence with action verb)
        if ln.strip().startswith(('>', '|')) and 'MUST' not in ln.split('|')[0]:
            # table header etc — still count
            pass
        # backed if AT-ID in same paragraph or within 5 following lines
        my_para = para_of[i]
        backed = False
        # same paragraph window
        for j in range(max(0, i-3), min(len(lines), i+6)):
            if para_of[j] != my_para and j > i+5: break
            if AT_ID.search(lines[j]):
                backed = True; break
        findings.append({
            'line': i+1,
            'text': ln.strip()[:200],
            'backed': backed,
        })
    return findings

results = defaultdict(list)
totals = {'files': 0, 'normative_clauses': 0, 'backed': 0, 'unbacked': 0}

for md in SPEC.rglob('*.md'):
    if '.git' in md.parts: continue
    f = audit_file(md)
    if not f: continue
    totals['files'] += 1
    rel = str(md.relative_to(SPEC))
    for clause in f:
        totals['normative_clauses'] += 1
        if clause['backed']:
            totals['backed'] += 1
        else:
            totals['unbacked'] += 1
            results[rel].append(clause)

# Rank by unbacked count
ranked = sorted(results.items(), key=lambda kv: -len(kv[1]))

print("="*70)
print("GAP-AMB-01: Ambiguity Audit — Unbacked Normative Clauses")
print("="*70)
print(f"Files scanned with normative clauses: {totals['files']}")
print(f"Total MUST/SHALL/REQUIRED clauses:    {totals['normative_clauses']}")
print(f"  Backed by AT-ID (≤5 lines away):    {totals['backed']} ({100*totals['backed']/max(1,totals['normative_clauses']):.1f}%)")
print(f"  UNBACKED:                            {totals['unbacked']} ({100*totals['unbacked']/max(1,totals['normative_clauses']):.1f}%)")
print()
print("TOP 25 OFFENDING FILES (by unbacked count):")
print("-"*70)
for rel, clauses in ranked[:25]:
    print(f"  {len(clauses):4d}  {rel}")

# Scope summary
scope_buckets = defaultdict(lambda: {'unbacked': 0, 'files': 0})
for rel, clauses in ranked:
    scope = rel.split('/')[0] if '/' in rel else '(root)'
    scope_buckets[scope]['unbacked'] += len(clauses)
    scope_buckets[scope]['files'] += 1

print()
print("BY SCOPE (top-level dir):")
print("-"*70)
for scope, st in sorted(scope_buckets.items(), key=lambda kv: -kv[1]['unbacked'])[:15]:
    print(f"  {st['unbacked']:5d} unbacked across {st['files']:3d} files  —  {scope}")

# Persist full ledger
out = {
    'totals': totals,
    'ranked_files': [
        {'file': rel, 'unbacked_count': len(clauses), 'examples': clauses[:5]}
        for rel, clauses in ranked
    ],
    'by_scope': dict(scope_buckets),
}
Path('/tmp/ambiguity_audit.json').write_text(json.dumps(out, indent=2))
print(f"\nFull ledger → /tmp/ambiguity_audit.json ({len(ranked)} files with unbacked clauses)")
