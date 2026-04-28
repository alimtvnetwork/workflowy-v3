# Error Resolution — Acceptance Criteria I/O Fixtures

> **Version:** 1.0.0
> **Created:** 2026-04-28 (UTC+8)
> **Status:** Concrete companion to [`97-acceptance-criteria.md`](./97-acceptance-criteria.md) (and `01-error-resolution/97-acceptance-criteria.md`). Replaces P20 stub seed.
> **Format spec:** [`spec/01-spec-authoring-guide/19-acceptance-criteria-io-table.md`](../01-spec-authoring-guide/19-acceptance-criteria-io-table.md)
> **Spawned by:** `.lovable/plans/00-active.md` § P21.

---

## `AT-ERRORRESOLUTION-01` — Cross-reference diagram nodes resolve

| Linter command | `node scripts/spec-hygiene/03-check-links.mjs --scope spec/03-error-manage/01-error-resolution/01-cross-reference-diagram.md` |
|---|---|
| **Expected exit code** | `0`. |
| **Negative** | Any node label in the mermaid diagram that does not resolve to a real spec file MUST fail link-check. |
| **Test name** | `at_errorresolution_01_diagram_nodes_resolve` |

## `AT-ERRORRESOLUTION-02` — Cheat sheet covers PHP / Go / TS uniformly

| Given | `02-debugging-cheat-sheet.md`. |
|---|---|
| **When** | Linter parses each H2 (one per language). |
| **Then** | Exactly 3 H2 sections (`## PHP`, `## Go`, `## TypeScript`); each contains a 4-column table with header `Symptom \| Diagnostic \| Fix \| Spec link`; row count per language ≥ 5. |
| **Negative** | Only 2 languages, or a 3-column table, MUST fail. |

## `AT-ERRORRESOLUTION-03` — Retrospectives use canonical 6-section format

| Linter command | `for f in spec/03-error-manage/01-error-resolution/03-retrospectives/R-*.md; do rg -L "## (Summary\|Timeline\|Root Cause\|Resolution\|Prevention\|Related)" "$f"; done` |
|---|---|
| **Expected exit code** | `1` (every retro contains all 6 sections, so `-L` lists nothing). |
| **Negative** | A retro missing any of the 6 sections MUST fail. |

## `AT-ERRORRESOLUTION-04` — Net-new failure → new retro before merge

| Given | A PR introduces a new error code `XYZ-3001` (registry diff). |
|---|---|
| **When** | Pre-merge gate runs. |
| **Then** | Gate requires `spec/03-error-manage/01-error-resolution/03-retrospectives/R-XYZ-3001.md` to exist in the PR diff; otherwise PR check fails with `PROCESS_VIOLATION_NO_RETRO`. |
| **Negative** | Merging a new error code without a matching retro MUST fail. |

## `AT-ERRORRESOLUTION-05` — Verification recipes are runnable

| Linter command | `rg -nP '^\` \`\` \`bash$' spec/03-error-manage/01-error-resolution/04-verification-patterns/ -A 1 \| rg -vP '^(--\|.*```bash)$' \| wc -l` |
|---|---|
| **Expected** | `≥ 5` runnable bash blocks (one per recipe). |
| **Negative** | A recipe documented in prose only (no fenced code block) MUST fail. |

## `AT-ERRORRESOLUTION-06` — Frontend-backend sync covers 5 axes

| Given | A verification recipe of type `frontend-backend-sync`. |
|---|---|
| **When** | Lint parses the recipe. |
| **Then** | Recipe asserts all 5 axes for each endpoint: `path`, `method`, `envelope shape`, `status-code mapping`, `error-code coverage`. Output JSON: `{"Status":"success","Results":{"Endpoint":"/api/v1/items","Checks":{"Path":true,"Method":true,"Envelope":true,"StatusCodes":true,"ErrorCodes":true}}}`. |
| **Negative** | A recipe missing any of the 5 keys MUST fail. |

## `AT-ERRORRESOLUTION-07` — Each debugging guide has sibling acceptance file

| Linter command | `for d in spec/03-error-manage/01-error-resolution/05-debugging-guides/0[1-9]-*/; do test -f "$d/97-acceptance-criteria.md" \|\| { echo "missing: $d"; exit 1; }; done` |
|---|---|
| **Expected exit code** | `0`. |
| **Negative** | Any guide subfolder lacking `97-acceptance-criteria.md` MUST fail. |

## `AT-ERRORRESOLUTION-08` — PHP debugging guide registers Xdebug breakpoints

| Given | `05-debugging-guides/01-debugging-php/`. |
|---|---|
| **When** | Lint scans for the Xdebug section. |
| **Then** | File contains H2 `## Xdebug Setup` AND a code block setting `xdebug.mode=debug,develop`; documented breakpoint flow uses `xdebug_break()` or IDE-side `F9`. |
| **Negative** | A PHP guide with no Xdebug section MUST fail. |

## `AT-ERRORRESOLUTION-09` — Go debugging guide registers Delve

| Given | `05-debugging-guides/02-debugging-go/`. |
|---|---|
| **When** | Lint scans for `dlv` invocations. |
| **Then** | Guide contains at least one `dlv debug` AND one `dlv attach` example, plus a remote-debug snippet (`dlv exec --headless --listen=:2345 --api-version=2`). |
| **Negative** | A Go guide that only mentions `fmt.Println` debugging MUST fail. |

## `AT-ERRORRESOLUTION-10` — TypeScript guide covers source-maps

| Given | `05-debugging-guides/03-debugging-typescript/`. |
|---|---|
| **When** | Lint scans for source-map coverage. |
| **Then** | Guide contains H2 `## Source Maps` AND mentions both Vite (`build.sourcemap: true`) and browser DevTools "Enable JavaScript source maps" toggle; includes a worked example mapping a stack frame back to `.ts`. |
| **Negative** | A TS guide that only debugs the compiled `.js` output MUST fail. |

---

## Verification

```bash
grep -c "^## \`AT-ERRORRESOLUTION-" spec/03-error-manage/97a-acceptance-criteria-fixtures.md
# expected: 10
node scripts/spec-hygiene/00-run-all.mjs
```

## Related

- [`97-acceptance-criteria.md`](./97-acceptance-criteria.md) — Source AT prose (top-level)
- [`01-error-resolution/`](./01-error-resolution/) — Owning subfolder
- [`spec/04-database-conventions/06-rest-api-format/`](../04-database-conventions/06-rest-api-format/00-overview.md) — Envelope SSOT
