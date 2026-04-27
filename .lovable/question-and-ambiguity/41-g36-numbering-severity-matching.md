# Ambiguity #41 — G-36 numbering, severity, and matching strategy

**Task:** F-future-G31h — true cross-scope island detection (renumbered → G-36)
**Date:** 2026-04-27

## Context

Three design choices made without asking (mode expired but batch in flight):

## Inferences

1. **Gate ID: G-36 (not G-31.8).**
   - Alternative: extend G-31 cluster to a 7th sub-check.
   - Rejected: G-31 is now bounded at 7 sub-checks (1 ERROR-reciprocity ×4 + 1 meta + 2 WARN advisories). Adding cross-scope analysis to G-31 muddies its scope ("workflow-xref reciprocity") with global graph analysis. G-36 stands as a peer gate; cross-references G-31.6 in its SSOT for context.
   - Cleaner ownership: G-31's 698-line runner doesn't bloat further; G-36 owns the corpus-walk machinery independently.

2. **Severity: G-36.1 WARN advisory, G-36.2 ERROR meta.**
   - Alternative: ERROR for G-36.1 (forces immediate cleanup).
   - Rejected: bare-filename literal matching has a known false-positive tail (`09-x.md` substring matching `09-xy.md`). Promoting to ERROR before validating false-positive rate would create unfix-ables. Same-scope siblings are excluded but cross-scope substring collisions are still possible. Today: 0 true orphans, so the question is moot, but the design has to be future-safe.

3. **Match strategy: bare-filename literal regex (no MD link parsing).**
   - Alternative A: parse `[text](path)` properly. Misses `mem://`, code comments, import paths.
   - Alternative B: AST-walk every file by type. ~10× implementation cost for a WARN-advisory gate.
   - Chosen: literal regex on bare filename across all corpus text. Captures all citation shapes. False positives are tolerable for a WARN gate; false negatives (the dangerous direction for an orphan-detector) are minimised.

## Other small decisions

- `SEARCH_ROOTS = [spec, src, .lovable]` — covers all human-authored documentation surfaces. Excludes `linters/`, `node_modules/`, generated `dist/`.
- Same-scope sibling exclusion via `dirname(path) === ownDir` — sharpens the "true orphan" signal vs G-31.6.
- `--verbose` flag (not env var) for symmetry with G-33 `--info` and G-34 `--info`.

## What to override if disagreed

- **Promote to G-31.8 instead of G-36**: re-host the script as a G-31 sub-check (rebrand only — algorithm unchanged).
- **Promote G-36.1 to ERROR**: change `WARN` log to `error` + add `failed = true` branch in main.
- **Tighten matching**: replace `RegExp(needle, "g")` with a markdown-link parser using `marked` or hand-rolled walker; restrict matches to `[…](.../needle)` and `mem://…/needle` patterns.
