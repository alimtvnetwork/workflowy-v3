# `.lovable/memory/audit/` — Audit Reports

> Per-spec and rollup audits. Each report is a snapshot — older entries are overwritten on re-audit.

| File | Type | Coverage | Generated |
|------|------|----------|-----------|
| `per-spec-audit.md` | Markdown report | 30 specs × 6-dim rubric + 124 drift findings | 2026-04-25 v0.37.0 |
| `per-spec-audit.json` | Raw JSON | Same data, machine-readable | 2026-04-25 v0.37.0 |

## Reading guide

1. **Aggregate Rubric** — quick health check across all specs (Completeness/Consistency/Alignment/Clarity/Maintainability/TestCoverage).
2. **Top Drift Findings** — top-15 by severity × impact. Skip flagged false-positives noted in the Author's Note.
3. **Per-Spec Scoreboard** — sorted lowest → highest weighted score. Lowest scores need attention first.
4. **Highest-Priority Corrections** — actionable spec edits (severity ≥ 7).

## Cross-references

- `/mnt/documents/spec_vs_impl_audit.{md,json}` — original 10-finding round-3 audit (the "small-impl-vs-big-spec" reality check).
- `/mnt/documents/spec_ai_readiness_audit_round2_final.{md,json}` — round-2 AI-readiness score (99/100 Excellent).
- `.lovable/plans/archive/04..08-*.md` — plans that closed F-01..F-04 + AUDIT-01.

## Re-audit

Run `/tmp/per_spec_audit.ts` (uses Gemini 2.5 Flash via Lovable AI Gateway) and `/tmp/per_spec_synth.ts` (synthesizes the report). Quota-blocked specs get deterministic placeholders.
