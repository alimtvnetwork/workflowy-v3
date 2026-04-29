---
gate: G-13-RUNNER-NO-INVALID-REGEX-ANCHORS
runner: scripts/spec-hygiene/55-check-runner-regex-anchors.mjs
slot: 55
created: 2026-04-29
status: CI hard-fail from day 1 (clean baseline)
ssot: this file
---

# Audit — `G-13-RUNNER-NO-INVALID-REGEX-ANCHORS`

## Why this gate exists

JavaScript's `RegExp` does NOT recognise `\Z` (end-of-string) or `\A` (start-of-string) anchors that exist in PCRE / Ruby / Python. JS silently treats them as the literal characters `Z` / `A`, which can dramatically alter runner behavior without any error.

**Real-world cost (2026-04-29):** the gate `G-00-ADR-CONSEQUENCES-XLINK` mis-reported the same-day drain progress as `26/28; 2 allow-listed` because its SECTION regex used `(?=^## |\Z)` and the `Z` matched the literal `Z` at the start of "Zero new infra…" in ADR-0027, prematurely truncating the captured Consequences body before the appended `**Spec impact**` xlink. Two ADRs (0027, 0028) appeared still-allow-listed. Required a debug session to spot.

## What it checks

For every `scripts/spec-hygiene/*.mjs` (excluding the runner's own source):
1. Strip block + line comments (so JSDoc examples don't trip the lint).
2. Find every regex literal `/.../[gimsuy]*` and every `new RegExp("…")` string.
3. Inside each regex body, search for `\Z` or `\A` followed by a non-letter.
4. If any offender is found, exit 1 with the file + snippet + recommended fix.

Recommended replacements:
- `\Z` → `$(?![\s\S])` (proper EOF lookahead)
- `\A` → `(?<![\s\S])` (proper SOF lookbehind) or anchor at a known position

## Baseline (2026-04-29)

**0 offenders across all 36 sibling runners.** Clean from day 1.

The historical offender (`52-check-adr-consequences-xlink.mjs` line 30) was fixed in the same session as part of Task #5 (`G-00-ADR-CONSEQUENCES-XLINK` drain).

## Verification

```bash
node scripts/spec-hygiene/55-check-runner-regex-anchors.mjs
# expected: ✅ G-13-RUNNER-NO-INVALID-REGEX-ANCHORS: 0 offenders across hygiene runners.

# Negative test:
echo 'const BAD = /^foo\Z/m;' > scripts/spec-hygiene/_negtest-anchor.mjs
node scripts/spec-hygiene/55-check-runner-regex-anchors.mjs
# expected: ❌ ... 1 offender(s) — JS RegExp does NOT support \Z/\A anchors
rm scripts/spec-hygiene/_negtest-anchor.mjs
```

## Cross-references

- Sibling runner-contract gate: `G-13-AUDIT-RUNNER-CONTRACT` (locks runner aggregator invariants).
- Trigger for this gate's creation: Task #15 in 2026-04-29 roadmap, after Task #5 surfaced the bug class.
