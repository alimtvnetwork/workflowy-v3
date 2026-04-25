# Plan 07 — F-04 Highlighter Dependency Pin

> **Created:** 2026-04-25 (UTC+8)
> **Executed:** 2026-04-25 (UTC+8)
> **Status:** ✅ Complete
> **Closes:** Audit finding F-04 (Impact 5/10 → projected score +3)
> **Version bump:** v0.35.0 → v0.36.0

---

## Goal

Pin the syntax-highlighter dependency to **`highlight.js ^11.10.0`** with exact import paths, theme strategy, frozen language set, bundle budget, and forbidden alternatives — so an AI implementer cannot substitute Shiki/Prism/CDN imports.

## Gap Analysis

| Issue | Evidence |
|-------|----------|
| Library mentioned generically | `03-syntax-highlighting.md` says "highlight.js v11+" with no exact version |
| No npm package pinning | Could be `highlight.js`, `@highlightjs/cdn-assets`, or `react-highlight` |
| No import-path lock | Risk of full-bundle (~500KB) vs core (~30KB) |
| No theme decision | Could import vendor `github-dark.css` and break HSL token system |
| No bundle budget | Risk of unbounded growth |
| No forbidden-list | Shiki/Prism could be silently swapped in |

## Files Created

1. `spec/09-code-block-system/11-highlighter-dependency-pin.md` — locked-choice rationale, canonical imports, frozen 11-language list, theme rule (HSL tokens only), bundle budget (≤100KB min), upgrade policy, 8 verification gates

## Files Updated

- `spec/09-code-block-system/97-acceptance-criteria.md` — added `AT-HLPIN-01..08` (v1.0.0 → v1.1.0)
- `package.json` — v0.35.0 → v0.36.0
- `.lovable/plans/00-active.md` — moved F-04 to "resolved"; **all 4 audit findings now closed**

## Audit Score Impact

| Before | After | Δ |
|--------|-------|---|
| ~97/100 | **~100/100** | **+3** |

All four audit findings (F-01, F-02, F-03, F-04) closed in a single 24-hour cycle.

## Key Decisions

1. **`highlight.js`** wins over Shiki/Prism — smaller, no WASM, no peer deps, matches existing token CSS
2. **Core + per-language registration** (not full bundle) — keeps highlighter under 100KB
3. **Project HSL tokens** are the only theme source — vendor CSS forbidden (would break `--primary`/`--accent`)
4. **Frozen 11-language set** — TS, Go, PHP, CSS, JSON, Bash, SQL, Rust, XML, YAML, Markdown
5. **CI budget gate** — `dist/assets/highlighter-*.js` > 100KB fails the release pipeline
6. **Forbidden list explicit** — Shiki, Prism, react-syntax-highlighter, starry-night, all CDNs

## Verification

- ✅ `node scripts/spec-hygiene/00-run-all.mjs` — passed
- ✅ `package.json` bumped to v0.36.0
- ✅ AT file extended with 8 new criteria, all source-traced

---

*Plan 07 archived 2026-04-25 (UTC+8). All audit findings now closed; project at projected 100/100 AI-readiness.*
