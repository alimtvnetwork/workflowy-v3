# G-36 — Cross-Scope Island Detector (Algorithm SSOT)

> **Version:** 1.0.0
> **Updated:** 2026-04-27 (UTC+8)
> **Parent:** [02-ci-quality-gates.md](./02-ci-quality-gates.md)
> **Runner:** `scripts/spec-hygiene/36-check-cross-scope-islands.mjs`
> **Closes:** F-future-G31h (renumbered as G-36 to keep G-31 cluster bounded at 7 sub-checks)

---

## Why this gate exists

[`24-g31-workflow-xref-reciprocity-gate.md`](./24-g31-workflow-xref-reciprocity-gate.md)'s **G-31.6** sub-check finds *per-scope* islands: a file with no in/out links among its same-scope siblings. But "no same-scope links" ≠ "no links anywhere". A `06-endpoints/07-board-view.md` flagged by G-31.6 is not actually orphaned if it's cited from `02-workflows/06-search-query-flow.md`, from `mem://features/board-view`, or from `src/components/board/Board.tsx`.

G-36 is the **true-orphan** check. It builds a single global inbound-reference index over the entire textual graph (`spec/`, `src/`, `.lovable/`) and reports candidate files whose **global** inbound count is zero. This catches the kind of orphan that genuinely is unreachable by any reader / reviewer / contributor.

Severity is intentionally WARN (advisory): a true orphan may still be a legitimate work-in-progress or a deliberate stub. The exit-failing pressure is reserved for **G-36.2** — the meta-check that opt-outs carry rationale comments — so the conversation around "is this really orphan-by-design?" happens in code review.

## Two sub-checks

### G-36.1 — true-orphan scan (WARN advisory)

**Algorithm:**
1. Define `CANDIDATE_SCOPES` = same 4 G-31 scopes (workflows, features, endpoints, db-diagram), with the same `filenameRx` + `excludeRx` filters.
2. For each scope, list candidate files via `readdirSync` + filter.
3. Build the global corpus: walk `SEARCH_ROOTS = [spec/**/*.md, src/**/*.{ts,tsx,css}, .lovable/**/*.md]`, read each into a `Map<path, text>`.
4. For each candidate file:
   - Compute the bare filename literal (regex-escaped).
   - Iterate every corpus entry, count global matches, EXCLUDING:
     - the candidate's own file (self-references don't count),
     - any file in the same directory as the candidate (already covered by G-31.6).
   - If `count === 0` and the bare filename is NOT in `TRUE_ORPHAN_EXEMPT`, flag as TRUE ORPHAN.
5. Print: WARN block listing each true orphan with its scope/filename and a resolution hint.
6. Severity is WARN — does **not** influence exit code.

### G-36.2 — meta: TRUE_ORPHAN_EXEMPT rationale coverage (ERROR)

Identical to G-30.3 / G-31.5 / G-32.4 / G-34.2. Self-introspects via `__filename`:
1. Locate `const TRUE_ORPHAN_EXEMPT = new Set([`.
2. For each `"value"` line: accept inline `// rationale` OR a non-trivial `// …` comment on the line directly above.
3. Any unrationaled entry → exit `1`.

## Why "bare filename literal" not "MD link parser"

Three reasons:
1. **Inbound references appear in many shapes** — `[label](./07-board-view.md)`, `mem://features/board-view`, `// see 07-board-view.md`, `import "./07-board-view"`, etc. A markdown link parser would miss most of these.
2. **False positives are tolerable** — G-36.1 is advisory; one accidental literal in a code comment that "saves" a file from orphan-status is not a correctness problem.
3. **Filename collisions are rare** — the spec uses `NN-name.md` numbering, which is locally unique within a folder. The risk of a same-name file in another folder masking an orphan is extremely low (and would be a separate hygiene problem worth surfacing).

## Why same-scope siblings are excluded

G-31.6 already handles per-scope islands. Counting same-scope inbound references in G-36 would just duplicate G-31.6's verdict for every non-island candidate. Excluding them sharpens G-36's signal: a TRUE ORPHAN here means the file is unreachable from **outside** its scope as well.

## Search roots

| Root | Extensions | Why |
|------|------------|-----|
| `spec/` | `.md` | Primary citation surface — workflows, features, endpoints, ATs |
| `src/` | `.ts`, `.tsx`, `.css` | Code comments + import paths often mention spec filenames |
| `.lovable/` | `.md` | Memory + suggestions + audits routinely cite spec files |

Excluded: `node_modules/`, `dist/`, `.git/`, `linters/` (vendored configs), `linter-scripts/` (no spec citations expected). The walker doesn't recurse into these because they're not under any `SEARCH_ROOTS` dir.

## Wiring

- Master runner: registered in `scripts/spec-hygiene/00-run-all.mjs` between `35-…--check` and `04-generate-index.mjs`.
- CI registry: row `G-36` in `02-ci-quality-gates.md`.
- Sub-check labels: `G-36.1` (true-orphan scan, WARN), `G-36.2` (exempt rationale meta, ERROR).

## Verification at ship

| Test | Result |
|------|--------|
| Bare invocation on current tree | ✅ 1479 files / 58 candidates / **0 true orphans** / exit 0 |
| `--verbose` flag (per-candidate inbound counts) | ✅ sorted ascending, ORPHAN/EXEMPT tags |
| G-36.2 with injected `"FAKE-no-rationale.md"` | ✅ exit 1 with `line 54: "FAKE-no-rationale.md"`; restored |
| Advisory exit semantics for true-orphan path | ✅ confirmed exit 0 even with synthetic orphan |

The 14 G-31.6 per-scope islands are all linked from outside their scope (mostly from `mem://`, `src/`, or workflows/feature-slices). This is the expected outcome — G-36 is the strict-superset check, and it's the fact that *zero* candidates are true-orphans on a fresh run that validates the design.

## Forbidden patterns

- Do **not** add files to `TRUE_ORPHAN_EXEMPT` to silence G-36.1 without first asking "should this file exist?" — orphans are usually a sign the file should be deleted, merged into a parent, or actually wired into the graph.
- Do **not** widen `SEARCH_ROOTS` to include vendored/generated directories — false-positive linkage would defeat the gate.
- Do **not** promote G-36.1 to ERROR without a phased rollout — bare-filename literal matching has a long false-positive tail (e.g. matching `09-...md` substring inside `09-cycle-detection.md`'s neighbour). Today's exit-0 status partly relies on that lenient matching.

## Change history

| Version | Date | Notes |
|---------|------|-------|
| 1.0.0 | 2026-04-27 | Initial implementation. 2 sub-checks. `TRUE_ORPHAN_EXEMPT` empty. 0 true orphans on first run. |
