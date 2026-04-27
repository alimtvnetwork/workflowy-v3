# Ambiguity #32 — G-31.5 meta sub-check: shared helper vs verbatim port

**Date:** 2026-04-27
**Task:** F-future-G31b (G-31.5 meta rationale-comment sub-check)
**Mode:** No-questions (32/40)

## Question
Should the rationale-comment scanner shared between G-32.4 (DDL allow-lists) and the new G-31.5 (reciprocity exemption Sets) be:
- **(A) Extracted into a shared helper** in `scripts/spec-hygiene/lib/` and imported by both runners, or
- **(B) Ported verbatim** into 31-check-workflow-xref-reciprocity.mjs with parameterised constants (`SELF_PATH`, `ALLOWLIST_NAMES`).

## Inferred answer (B — verbatim port with parameterisation)

**Why:**
1. **No `lib/` precedent** — `scripts/spec-hygiene/` is currently flat; introducing a new module structure on a 2-runner overlap would be the first such extraction. The existing 24 runners all stand alone.
2. **Tiny surface area** — the algorithm is ~70 lines. Two copies cost ~70 lines of duplication; a `lib/` extraction would cost a new file + 2 imports + a unit-test concern + README update for ~70 lines of "saved" code. Negative ROI at N=2.
3. **Independent evolution** — G-32.4 may grow file-specific quirks (e.g. multi-line array literals across SQL allow-lists) that would force the shared helper to become parameterised on regex shape. Two copies stay loosely coupled and can drift independently.
4. **Discoverability** — when a reader debugging G-31.5 wants to understand the algorithm, having the code right there in the runner avoids a cross-file jump. With only 2 callers, "go to definition" navigation isn't a meaningful win.
5. **No obvious extraction trigger** — the project's other shared concerns (e.g. parsing CREATE INDEX statements) live inline in the runners that need them.

**Crystallised parameters (kept consistent for future merge):**
- `ALLOWLIST_NAMES`: array of `const NAME = new Set([...]);` identifiers in the runner's own source.
- `SELF_PATH`: relative path from repo root to the runner file.
- Entry regex: `/^\s*"([^"]+)"\s*,?\s*(\/\/.*)?$/` — same shape both runners.
- Skip rules: blank line breaks contiguous-comment-above scan; pure separators (`// ===`/`// ---`/`// ***`/`// ___` of length ≥3) are transparent.
- Trailing inline `// …` (any content) satisfies the rule unconditionally.

## Promotion trigger (when (A) becomes correct)

If a 3rd runner needs the same scanner — for example a future G-30.3 enforcing rationale on `REDUNDANCY_ALLOWLIST` — extract then. Keep the constant-name conventions identical across runners so the extraction is a mechanical refactor:
- `ALLOWLIST_NAMES: string[]`
- `SELF_PATH: string`
- Function signature `findUnrationaledEntries(): {listName, entry, line}[]`
- Function signature `printRationaleReport(violations): void`

## Status
- [x] Decided: (B) verbatim port
- [x] Parameters factored into `ALLOWLIST_NAMES` + `SELF_PATH` constants in 31-runner
- [x] Promotion trigger documented (3rd caller)
- [ ] Promotion deferred (current N=2)
