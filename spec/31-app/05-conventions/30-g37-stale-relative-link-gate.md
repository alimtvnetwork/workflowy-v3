# G-37 — Stale Relative-Link Gate (Algorithm SSOT)


> **Parent:** [`./00-overview.md`](./00-overview.md) — added 2026-04-30 (AUD-REMEDIATE-CRIT-7, F-AUD42-08 closure).

> **Version:** 1.0.0
> **Updated:** 2026-04-27 (UTC+8)
> **Parent:** [02-ci-quality-gates.md](./02-ci-quality-gates.md)
> **Implements:** F-future-G37
> **Runner:** `scripts/spec-hygiene/37-check-stale-relative-links.mjs`

---

## Purpose

Complement G-03 (link resolution) by distinguishing between two kinds of broken relative markdown links:

1. **Stale-rename** — the link target's basename exists elsewhere in the repo. Likely a renumbering or folder move; the fix is mechanical (update the path).
2. **Stale-missing** — no candidate file exists. G-03 already covers this; G-37 suppresses unless `--verbose` to avoid double-noise.

This division turns a blob of "broken links" into actionable categories, accelerating cleanup after large reorganisations.

---

## Sub-Checks

| ID | Severity | What it asserts |
|----|----------|------------------|
| **G-37.1** | WARN (advisory) | For every broken `[label](./x.md)` in `spec/**/*.md`, look up `basename(x.md)` in a global filename index spanning `spec/` + `src/`. Report `STALE-RENAME` (1 candidate, suggest path), `STALE-AMBIGUOUS` (≥2 candidates), or `STALE-MISSING` (0 candidates; suppressed unless `--verbose`). |
| **G-37.2** | ERROR | Every entry in `STALE_LINK_EXEMPT` MUST carry a rationale comment (inline `// …` or contiguous `// …` line directly above). Algorithm ported verbatim from G-30.3 / G-31.5 / G-32.4 / G-34.2 / G-36.2. |

WARN-only severity for G-37.1 is intentional: a "stale-rename" suggestion can be wrong (multiple unrelated files may share a basename), so authors must judge. CI does not fail on G-37.1.

---

## Inputs

| Input | Source | Notes |
|-------|--------|-------|
| `spec/**/*.md` | Repository | Source-link scan domain |
| `spec/**/*.md` + `src/**/*.{ts,tsx,md,css}` | Repository | Filename-index domain |
| `__filename` self-read | Runner source | G-37.2 introspection target |

Skip rules (mirror G-03): `http(s)://`, `mailto:`, `mem://`, `#anchor-only`, fenced code blocks, inline code spans, blockquote-prefixed fences.

---

## Outputs

| Output | Channel | Notes |
|--------|---------|-------|
| `⚠️  G-37.1: N stale-rename link(s) — target moved:` | stderr | Per-link source path, broken href, suggested replacement |
| `⚠️  G-37.1: N stale-ambiguous link(s) — multiple candidates:` | stderr | Per-link candidate list |
| `⚠️  G-37.1 (verbose): N broken link(s) with no rename candidate (G-03 territory):` | stderr | Only with `--verbose` |
| `❌ G-37.2: N unrationaled STALE_LINK_EXEMPT entry(ies):` | stderr | Per-line offender |
| `✅ G-37: …` summary | stdout | Always emitted on exit 0 |

---

## Exit Codes

| Code | Meaning |
|------|---------|
| `0` | No G-37.2 violations (G-37.1 is advisory) |
| `1` | One or more unrationaled `STALE_LINK_EXEMPT` entries |
| `2` | Runner error (cannot read source) |

---

## Allow-List Format

```js
const STALE_LINK_EXEMPT = new Set([
  // <rationale on the line directly above OR inline at end>
  "spec/path/source-file.md::./broken/href.md",
]);
```

Composite key shape: `"<source-file-relative-to-repo>::<broken-href-as-written>"`. Both halves are required and case-sensitive.

---

## Acceptance Tests

| ID | Scenario | Expected |
|----|----------|----------|
| AT-G37-01 | Broken link whose basename resolves to exactly one other location | WARN line; exit 0 |
| AT-G37-02 | Broken link whose basename resolves to ≥2 locations | WARN ambiguous line; exit 0 |
| AT-G37-03 | Broken link with no basename match anywhere | Suppressed unless `--verbose`; exit 0 |
| AT-G37-04 | `STALE_LINK_EXEMPT` entry with no rationale comment | ERROR; exit 1 |
| AT-G37-05 | `STALE_LINK_EXEMPT` entry with inline `// rationale` | Exit 0 |
| AT-G37-06 | `STALE_LINK_EXEMPT` entry with `// rationale` on line directly above (no blank gap) | Exit 0 |

---

## Related

- [02-ci-quality-gates.md](./02-ci-quality-gates.md) — Gate registry
- [29-g36-cross-scope-island-gate.md](./29-g36-cross-scope-island-gate.md) — Sibling orphan detector
- `scripts/spec-hygiene/03-check-links.mjs` — G-03 baseline link integrity
- [26-allow-list-inventory.md](./26-allow-list-inventory.md) — Operator-visible exemption registry

---

## Change History

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-04-27 | Initial implementation. Baseline scan: 0 stale-rename, 0 stale-ambiguous, 6 stale-missing (G-03 territory). G-37.2 negative-tested via injected unrationaled entry. |
