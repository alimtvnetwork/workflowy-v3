# Audit — G-00-OVERVIEW-AI-CONTRACT-COMPLETE

**Date:** 2026-04-29
**Task:** Lock the AI Contract body schema so `…-PRESENT` cannot be gamed by an empty heading.

## Why

`G-00-OVERVIEW-AI-CONTRACT-PRESENT` (minted earlier today) only checks that an `## AI Contract` heading exists. A regression that strips the body but leaves the heading would PASS the presence gate. The trio's content-completeness layer was missing.

## Schema (from `18-ai-contract-template.md`)

Five mandatory subsections in canonical order:

1. `**Purpose**` — single sentence (≤25 words)
2. `**Audience**` — single sentence (≤25 words)
3. `**Expected AI Output**` — paths, not prose
4. `**Out of Scope**` — bullets with markdown links to owning sections
5. `**Definition of Done**` — bullets citing `AT-*` IDs / `G-*` gates / script paths

## Baseline (2026-04-29)

| Tier | Files | Rule 1+2 (presence + order) | Rules 3–5 (body quality) |
|------|------:|----------------------------:|-------------------------:|
| Top-level (`spec/[0-9][0-9]-*/00-overview.md`) | 25 | 25/25 ✅ | not yet baselined (WARN) |
| Sub-overview | 125 | scope-exempt (Authoring rule §6) | scope-exempt |

Verified via shell sweep — every top-level overview carries all 5 bold-prefix lines.

Gate ships hard-fail rules 1+2 from day 1, zero violations. Rules 3–5 ship as WARN-only until a first content-quality sweep is scoped (most likely candidates for body-quality issues: `Definition of Done` bullets that read like prose without an `AT-*` citation).

## Trio status

| Layer | Gate | Aspect | Tier |
|-------|------|--------|------|
| 1 (presence) | G-09-OVERVIEW-H1-MATCHES-FOLDER-INDEX | H1 numeric prefix | hard-fail (top + sub) |
| 1 (presence) | G-00-OVERVIEW-SCORING-TABLE-PRESENT | Scoring section | hard-fail (top) |
| 1 (presence) | G-00-OVERVIEW-AI-CONTRACT-PRESENT | AI Contract heading | hard-fail (top) + WARN (sub) |
| 2 (completeness) | **G-00-OVERVIEW-AI-CONTRACT-COMPLETE** | AI Contract body schema | hard-fail rules 1+2 (top); WARN rules 3–5 (top); exempt (sub) |

## Future

- `G-00-OVERVIEW-SCORING-TABLE-COMPLETE` would mirror this for Scoring rows (enforce `AI Confidence`, `Ambiguity`, `Health Score` row presence). Deferred until canonical scoring schema is ratified.
- Promotion of rules 3–5 to hard-fail after first content-quality sweep.

## Exempt zones

- Fenced code blocks (a `**Purpose**` line inside a `\`\`\`` fence is template syntax, not real subsection presence).
- `spec/01-spec-authoring-guide/18-ai-contract-template.md` itself (the template uses these tokens inside example blocks; gate scope is overviews only).
- `spec/00-adrs/` per-ADR files (scope is `spec/[0-9][0-9]-*/00-overview.md`, not per-ADR files).
