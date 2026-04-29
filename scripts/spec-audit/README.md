# `scripts/spec-audit/` — AI-driven spec implementability audits

> **Status:** Process tooling. Companion to `spec/_AUDIT-EXEMPTIONS.md`,
> `spec/_GATE-REGISTRY.md`, and the `📊 AI Implementability` block required by
> `mem://index.md` Core.

## Scripts

### `10-run-ai-audit.mjs`

Re-runs the Gemini-2.5-Pro spec audit via the Lovable AI Gateway and writes a
versioned JSON artifact to `/mnt/documents/spec-ai-implementability-audit-vN.json`.

Auto-detects the prior version, builds a corpus-metrics + prior-audit context
snapshot, and asks the model to score against the calibration rules pinned in
the runner (per-task delta caps, no >90 without re-audit, etc.).

#### Usage

```bash
# Standard re-audit (auto-versions to next vN)
node scripts/spec-audit/10-run-ai-audit.mjs

# With change-context bullets the runner can't auto-derive
node scripts/spec-audit/10-run-ai-audit.mjs --notes "Closed F-AUDIT-15: drained 27 placeholders in 31-app"

# Inspect the prompt without spending an API call
node scripts/spec-audit/10-run-ai-audit.mjs --dry-run
```

#### Output schema

Strict JSON, written to `/mnt/documents/spec-ai-implementability-audit-vN.json`:

| Field | Type | Purpose |
|-------|------|---------|
| `overallScore` | int 0-100 | Headline implementability score |
| `previousScore` | int \| null | Prior audit's `overallScore` |
| `delta` | int | `overallScore - previousScore` |
| `confidenceTier` | enum | `BLOCKING\|RISKY\|WORKABLE\|STRONG\|EXCELLENT` |
| `tierChange` | str | e.g. `RISKY → WORKABLE` |
| `scopeScoresChanged` | array | Per-scope deltas with reason |
| `remainingFindingsUnchanged` | array | F-AUDIT-NN strings not yet fixed |
| `resolvedFindings` | array | `{id, resolution}` |
| `newFindings` | array | `{id, title, severity, evidence, remediation, pointsIfFixed, effort}` |
| `verdict` | str | One paragraph |
| `honestAssessment` | str | Candid assessment — substantive vs ceremonial |

#### Exit codes

| Code | Meaning |
|------|---------|
| `0` | Success — artifact written, summary printed |
| `1` | `LOVABLE_API_KEY` missing |
| `2` | AI gateway returned non-2xx |
| `3` | Response parse / file-write error (raw content dumped to stderr) |

#### When to run

- After any ratification bundle that touches ADRs, gates, or fixture files.
- Before bumping the baseline pinned in `mem://index.md` Core block.
- Never skip when crossing a tier boundary (e.g. RISKY → WORKABLE @ 80).

#### Related

- Calibration rules pinned in the runner itself (`buildPrompt()`).
- Baseline ledger: `mem://index.md` Core block (single-line audit-trail).
- Detailed audit-trail: `spec/_GATE-REGISTRY.md` `> Updated:` blurb.
- Manifest under measurement: `spec/_AUDIT-EXEMPTIONS.md`.
