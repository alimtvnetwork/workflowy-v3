import json
from pathlib import Path
data = json.loads(Path('/tmp/ambiguity_audit.json').read_text())
ranked = data['ranked_files']
totals = data['totals']

LEGIT_PROSE = {'_GATE-REGISTRY.md', 'AUDIT-FINDINGS-LEDGER.md', 'AMBIGUITY-LEDGER.md',
               '_GATE-GRADUATION-LEDGER.md',
               '_LEDGER-G-00-AT-FIX-COMPANION-SHAPE-BASELINE.md', '_LEDGER-G-13-BACKLINK-EXEMPT.md',
               '_LEDGER-G-NS-ADR-COVERAGE.md', '_LEDGER-G-NS-CORE-MEMORY-COVERAGE.md',
               '_LEDGER-G-NS-LEGACY-EXEMPT.md', '_AUDIT-EXEMPTIONS.md', '99-consistency-report.md',
               '21-ai-readiness-audit-round-2.md', '01-spec-authoring-guide/97-acceptance-criteria.md',
               '00-adrs/_INDEX_AUTOMATION.md'}

real_targets = [r for r in ranked if r['file'] not in LEGIT_PROSE]
exempt = [r for r in ranked if r['file'] in LEGIT_PROSE]
real_unbacked = sum(r['unbacked_count'] for r in real_targets)
exempt_unbacked = sum(r['unbacked_count'] for r in exempt)
real_pct = 100*real_unbacked/totals['normative_clauses']
bound = 100 - real_pct

md = []
md.append("# AMBIGUITY-LEDGER — Unbacked Normative Clauses")
md.append("")
md.append("**Generated:** GAP-AMB-01 (2026-04-30) by `scripts/spec-hygiene/ambiguity_audit.py`")
md.append("**Heuristic:** A `MUST` / `SHALL` / `MUST NOT` / `SHALL NOT` / `REQUIRED` clause is *backed* if an `AT-…` ID OR a `G-NN-…` gate ID OR a `gate G-…` reference appears within ±5 lines (same paragraph window).")
md.append("")
md.append("## Corpus totals")
md.append("")
md.append("| Metric | Count | % |")
md.append("|---|---|---|")
md.append(f"| Files containing normative clauses | {totals['files']} | — |")
md.append(f"| Total normative clauses | {totals['normative_clauses']} | 100% |")
md.append(f"| Backed (AT- or G- within ±5 lines) | {totals['backed']} | {100*totals['backed']/totals['normative_clauses']:.1f}% |")
md.append(f"| **Unbacked** | **{totals['unbacked']}** | **{100*totals['unbacked']/totals['normative_clauses']:.1f}%** |")
md.append(f"| — Exempt registry/ledger prose | {exempt_unbacked} | {100*exempt_unbacked/totals['normative_clauses']:.1f}% |")
md.append(f"| — **Actionable (true findings)** | **{real_unbacked}** | **{real_pct:.1f}%** |")
md.append("")
md.append("## Mediocre-AI implementability impact")
md.append("")
md.append(f"At the user-set bar ('mediocre AI, zero follow-up, 100% intent match'), every actionable unbacked clause is a coin-flip: a strong AI infers correctly, a mediocre AI may diverge. With **{real_pct:.1f}% actionable-unbacked**, mediocre-AI score is bounded by `(100 − actionable_unbacked_pct)` ≈ **{bound:.0f}/100** before any other factor — well below the v7 strong-AI baseline of 95.".format(real_pct=real_pct, bound=bound))
md.append("")
md.append("## Actionable findings — top 30 (by unbacked count, exempts removed)")
md.append("")
md.append("| # | Unbacked | File | Top example (line) |")
md.append("|---|---|---|---|")
for i, r in enumerate(real_targets[:30], 1):
    ex = r['examples'][0] if r['examples'] else {'line':'-','text':''}
    text = ex['text'].replace('|','\\|')[:120]
    md.append(f"| {i} | {r['unbacked_count']} | `{r['file']}` | L{ex['line']}: {text} |")

md.append("")
md.append("## Exempt registry/ledger files (legitimate prose, no AT needed)")
md.append("")
for r in exempt:
    md.append(f"- `{r['file']}` — {r['unbacked_count']} clauses (registry/ledger meta-prose)")

md.append("")
md.append("## By scope")
md.append("")
md.append("| Scope | Unbacked | Files |")
md.append("|---|---|---|")
for scope, st in sorted(data['by_scope'].items(), key=lambda kv: -kv[1]['unbacked'])[:15]:
    md.append(f"| `{scope}/` | {st['unbacked']} | {st['files']} |")

md.append("")
md.append("## Resolution protocol")
md.append("")
md.append("1. **Findings GAP-AMB-01-NN** are auto-generated, one per actionable file in the ranked table above.")
md.append("2. Each finding requires either: (a) adding adjacent `AT-`/`G-` IDs to the existing clause, OR (b) demoting the prose `MUST` to `SHOULD`/`MAY` if non-normative was intended, OR (c) marking the file in `LEGIT_PROSE` exemption set with justification.")
md.append("3. Burn-down target: actionable-unbacked → **<5%** of corpus to claim mediocre-AI EXCELLENT (matches v7 strong-AI score).")
md.append("4. Re-run `scripts/spec-hygiene/ambiguity_audit.py` after each batch.")
md.append("")
md.append("## Next tasks (auto-derived)")
md.append("")
md.append("- **GAP-AMB-01-01..30** — bind top-30 actionable files (ranked above)")
md.append("- **GAP-AMB-02** — vague-modifier sweep (queued)")
md.append("- **GAP-AMB-03** — undefined-term audit against `spec/19-glossary.md` (queued)")
md.append("")

Path('spec/AMBIGUITY-LEDGER.md').write_text('\n'.join(md))
print(f"Wrote spec/AMBIGUITY-LEDGER.md ({sum(len(l) for l in md)} bytes)")
print(f"Actionable findings: {len(real_targets)} files / {real_unbacked} clauses ({real_pct:.1f}%)")
print(f"Exempt prose: {len(exempt)} files / {exempt_unbacked} clauses")
print(f"Mediocre-AI score upper bound from this dimension alone: {bound:.0f}/100")
