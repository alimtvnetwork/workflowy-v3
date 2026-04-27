# Ambiguity #33 — G-31.6 island-detection: WARN advisory vs ERROR + scope of "island"

**Date:** 2026-04-27
**Task:** F-future-G31c (G-31.6 documentation-island detection)
**Mode:** No-questions (33/40)

## Question
Two design decisions to crystallise:

**(1)** Should islands fail CI (ERROR) or be advisory (WARN)?
**(2)** Should "island" mean strictly **zero in + zero out** within the scope, or also count files reachable only via aggregator pages (overviews, AT-registries) as islands?

## Inferred answer

### (1) WARN advisory — **permanent**, not staged

**Why:**
1. **Asymmetric epistemics with reciprocity.** Reciprocity (G-31.1–4) is mechanically derivable: if A → B exists and B → A doesn't, the fix is unambiguous. Island status is a **judgement call** — some files are genuinely terminal leaves (e.g. a self-contained reference page) and adding cargo-cult cross-links to satisfy the linter would degrade quality.
2. **Probe data supports judgement.** The 14 surfaced islands include MVP-leaf addendum slices (`07b/08b/11b/12b/13b`) created during F1–F5 specifically as standalone children of overview pages, plus self-contained endpoint files. Many of these are reachable from `00-overview.md` (which is excluded from the scope). Forcing peer cross-links could introduce false intimacy between unrelated specs.
3. **No precedent for WARN→ERROR promotion of judgement-class checks.** The F24/F27/F28 staged-rollout pattern was used for **mechanically-correct drift** (citations, reciprocity); G-31.6 is the first sub-check where "violation" is a smell, not a defect.
4. **Cleanup path stays open.** Authors who want the cleanest possible doc graph can drain the queue and either author cross-refs (preferred — strengthens connectivity) or allow-list with rationale (acceptable for genuine leaves). G-31.5 enforces rationales on the allow-list, so opt-outs leave an audit trail.

### (2) Strict in/out within the scope

**Why:**
1. **Aggregator-page exclusion is upstream.** `00-overview.md` / `02-personas.md` / `97-acceptance-criteria.md` / `99-consistency-report.md` are already excluded from the scope by `excludeRx`. Counting them as "valid back-links" would re-introduce them as graph nodes — and they're aggregator pages by definition, so every leaf would be reachable from them, defeating the check.
2. **Reciprocity sub-checks use the same scope boundary.** Consistent semantics: G-31.1–4 ask "does B link back to A?" within scope. G-31.6 asks "is F linked-to or linking-to anyone in scope?" Same matrix, same boundary.
3. **Aggregators are listed in TOCs anyway.** A file linked only from `00-overview.md` is already discoverable via the index; an island-by-this-definition would be a peer-graph orphan, which is the smell we want to surface.

## Crystallised parameters

- WARN-only at v2.5.0; will likely stay WARN even after drain (re-evaluate at F-future-G31e completion).
- Island = `outgoing.size === 0 && incoming.size === 0 && !islandExemptions.has(filename)`.
- Per-scope exemption Set `*_ISLAND_EXEMPT` registered in `ALLOWLIST_NAMES` for G-31.5 rationale enforcement.
- Aggregator pages excluded by the existing `scope.excludeRx` — no separate aggregator-treatment logic needed.
- Output: per-scope ⚠️ block listing each island filename + cleanup hint (author peer link OR allow-list with rationale).

## Status
- [x] Decided: WARN-permanent, strict in-scope in/out
- [x] Allow-lists registered for G-31.5 rationale enforcement
- [x] Cleanup queue (14 islands) deferred to F-future-G31e
- [x] WARN→ERROR re-evaluation deferred to post-F-future-G31e
