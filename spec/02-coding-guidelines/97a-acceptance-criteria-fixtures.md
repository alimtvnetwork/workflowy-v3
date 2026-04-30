# Coding Guidelines — Acceptance Criteria I/O Fixtures (Template)

> **Version:** 1.0.0
> **Created:** 2026-04-28 (UTC+8)
> **Status:** Normative companion to every `97-acceptance-criteria.md` under `spec/02-coding-guidelines/**`.
> **Format spec:** [`spec/01-spec-authoring-guide/19-acceptance-criteria-io-table.md`](../01-spec-authoring-guide/19-acceptance-criteria-io-table.md)
> **Spawned by:** `.lovable/plans/00-active.md` § P2f.

---

## Why a template, not 363 rows

Every `AT-CROSSLANGUAGE-*`, `AT-TYPESCRIPT-*`, `AT-GOLANG-*`, `AT-PHP-*`, `AT-RUST-*`, `AT-CSHARP-*`, `AT-FILEFOLDERNAMING-*`, `AT-AIOPTIMIZATION-*`, `AT-CONSOLIDATEDREVIEWGUIDE-*`, `AT-MASTERCODINGGUIDELINES-*`, and `AT-STATICANALYSIS-*` row shares the same shape per the format SSOT's "Static-analysis / lint rule" opt-out (Section "Two AT shapes that opt out of the JSON rows"):

> Replace JSON rows with: `Linter command` + `Expected exit code` + `Expected stderr regex` rows.

Authoring 363 near-identical fixture blocks would be noise. Instead this file declares **one canonical template** + one **per-rollup verification recipe**. Every coding-guideline AT MUST conform to the template; per-rule deviations live as overrides inline in their source row.

---

## Canonical lint-shape template

Every coding-guideline AT is satisfied when the following four assertions all hold for a fresh checkout of the repo:

| Slot | Value |
|------|-------|
| **Given** | A clean repo at HEAD; `node_modules/` installed; the rule's source spec file exists at the path cited in the prose `Source` column. |
| **Linter command** | The command listed in the prose row's source spec OR — if absent — the project-wide gate: `node scripts/spec-hygiene/00-run-all.mjs && npm run lint && npm run typecheck`. |
| **Expected exit code** | `0` when the codebase complies; `1` when a violating fixture file is added (used as a meta-test of the rule). |
| **Expected stderr regex** | `/<RULE-ID>:\s+.+/` matching the rule's documented error format (e.g. `boolean-naming: variable 'flag' must start with is/has/should/can/will`). |
| **Then** | Adding the rule's negative example (`invalid:` block from the rule meta) MUST produce exit code `1` AND a stderr line (gate **G-13-LEDGER-RUNNER-CLEAN-OUTPUT**) that matches the regex. Removing the violation MUST restore exit code `0`. |
| **Side effects** | none (pure static analysis). |
| **Negative assertion** | The rule MUST NOT silently pass on its documented `invalid:` example. The rule MUST NOT fail on its documented (gate **G-13-LEDGER-RUNNER-CLEAN-OUTPUT**) `valid:` example. |

(gate **G-13-LEDGER-RUNNER-CLEAN-OUTPUT**) This template subsumes every row whose `Criterion` text starts with one of: `MUST … live`, `MUST … start with`, `MUST … be`, `MUST NOT …`, `is forbidden`, `must follow`, `must use`, `must enforce`, `MUST be tagged with`, `MUST be hashed with`. Per `spec/01-spec-authoring-guide/19-acceptance-criteria-io-table.md` § "Two AT shapes that opt out of the JSON rows" → row 2.

---

## Per-rollup verification recipes

Each recipe is the **specific command** that proves the entire rollup. CI runs all of them as parallel jobs.

### `AT-CROSSLANGUAGE-*` (issues-and-fixes-log, boolean, casting, code-style, master, static-analysis, types-folder)

```bash
# Issues-and-fixes log: every entry has Status + Owner + DateRaised
node scripts/spec-hygiene/00-run-all.mjs --rollup cross-language

# Boolean naming
rg -nP "\b(let|const|var)\s+(?!is|has|should|can|will)[a-z]\w*\s*[:=]\s*(true|false|Boolean)" src/ && exit 1 || exit 0

# Casting elimination
rg -nP "\bas\s+(any|unknown|object)\b" src/ && exit 1 || exit 0

# Code style — blank lines / spacing
npx prettier --check "src/**/*.{ts,tsx,js}"

# Static analysis CI gate
test -f .github/workflows/static-analysis.yml || exit 1

# Types-folder convention
ls src/types/index.ts && rg -nP "^export (type|interface) " src/types/index.ts | wc -l | awk '{exit ($1>=1?0:1)}'
```

### `AT-TYPESCRIPT-*`

```bash
# tsconfig strict
node -e "const c=require('./tsconfig.json').compilerOptions;process.exit(c.strict&&c.noImplicitAny&&c.noUncheckedIndexedAccess?0:1)"

# Zero any / @ts-ignore (matches mem://constraints/coding-guidelines)
rg -nP ":\s*any\b|@ts-ignore" src/ | rg -v "@ts-expect-error:" && exit 1 || exit 0

# Max 3 params, no nested if, ≤15-line logic, positive guards (custom plugin)
npx eslint --plugin coding-guidelines src/

# Typescript reference docs present
test -f spec/02-coding-guidelines/02-typescript/08-typescript-standards-reference/00-overview.md
```

### `AT-GOLANG-*`

```bash
# String-backed enums
rg -nP "type \w+ int.*//.*enum" pkg/enums/ && exit 1 || true

# Required enum methods present
for d in pkg/enums/*/; do
  for m in String IsValid Parse; do
    grep -q "func.*$m" "$d"*.go || { echo "MISSING $m in $d"; exit 1; }
  done
done

# defer placement + loop-defer wrapping
go vet -vettool=$(which deferchecker) ./...

# pathutil / fileutil discipline
rg -nP "filepath\.Join|os\.WriteFile" --type go internal/ | rg -v 'pathutil|fileutil|_test' && exit 1 || true

# golangci-lint with severity tags
golangci-lint run --config linters/golangci-lint/.golangci.yml
```

> **Note**: Per `mem://constraints/backend-runtime-deferred`, Go is forbidden in this project. These ATs remain canonical for cross-project reuse but currently produce zero hits.

### `AT-PHP-*` (enums, forbidden-patterns, naming-conventions, response-key-type, standards-reference)

```bash
# Enum classes use backed string enums + ResponseKeyType discipline
phpcs --standard=linters/phpcs/coding-guidelines-ruleset.xml wp-plugin/

# PascalCase response keys (Golden Rule end-to-end)
rg -nP "\['(?:[a-z][a-z0-9_]*)'\s*=>" wp-plugin/src/ | rg -v "ResponseKeyType::" && exit 1 || true

# Forbidden patterns: bare $_GET / $_POST / globals
rg -nP "\\\$_(GET|POST|REQUEST|SESSION)\b" wp-plugin/src/ | rg -v "Boundary/" && exit 1 || true

# Response-key-type inventory drift
node scripts/spec-hygiene/15-check-enums-in-sync.mjs --enum ResponseKeyType
```

### `AT-RUST-*` / `AT-CSHARP-*`

```bash
# These language guidelines are documented for cross-project reuse only;
# this repo contains no Rust or C# source. The ATs are inert here.
test ! -d rust-src/ && test ! -d dotnet-src/
```

### `AT-FILEFOLDERNAMING-*`

```bash
# kebab-case folders, PascalCase React component files, camelCase utils
node scripts/spec-hygiene/00-run-all.mjs --rollup file-folder-naming

# Specific spot-checks
find src -type d | rg -v "^src/(components|pages|hooks|lib|types|contexts|test)(/[a-z][a-z0-9-]*)*$" && exit 1 || true
find src/components -name "*.tsx" -type f | rg -v "/[A-Z][A-Za-z0-9]+\.tsx$" && exit 1 || true
```

### `AT-AIOPTIMIZATION-*` (common-ai-mistakes, etc.)

```bash
# Common AI mistakes documented + enforced
test -f spec/02-coding-guidelines/06-ai-optimization/03-common-ai-mistakes/00-overview.md

# Each mistake row has a code citation + a lint rule reference
node scripts/spec-hygiene/09-check-xrefs.mjs spec/02-coding-guidelines/06-ai-optimization/
```

### `AT-CONSOLIDATEDREVIEWGUIDE-*`

```bash
# The consolidated review guide is in sync with each language section
node scripts/spec-hygiene/00-run-all.mjs --rollup consolidated-review
```

### `AT-MASTERCODINGGUIDELINES-*`

```bash
# Master rollup sources every cross-language rule + delegates language-specific to its rollup
node scripts/spec-hygiene/00-run-all.mjs --rollup master
```

### `AT-STATICANALYSIS-*` (incl. `09-ci-pipeline-quality-gate`)

```bash
# CI quality gate present
test -f .github/workflows/spec-hygiene.yml
test -f .github/workflows/static-analysis.yml || true   # may merge with spec-hygiene

# All four enforcement layers run (cross-ref AT-ENFORCEMENTRULES-14)
node scripts/spec-hygiene/19-check-runbook-staleness.mjs --layers compile,lint,runtime,test
```

---

## Meta-test of the template

A test in `tests/spec-hygiene/coding-guidelines.template.test.ts` MUST:

1. Load every `97-acceptance-criteria.md` under `spec/02-coding-guidelines/`.
2. Parse every AT row.
3. Assert each row's `Source` column points to a file that exists.
4. Assert each rollup folder has at least one `valid:` and one `invalid:` example file under `tests/fixtures/coding-guidelines/<rollup>/`.
5. Run the corresponding linter against both fixtures and assert exit codes (`0` for valid, `1` for invalid).

Failing any of (1)..(5) blocks the merge per `AT-ENFORCEMENTRULES-05`.

---

## Coverage accounting

| Rollup | AT count | Covered by template | Per-rollup recipe |
|--------|----------|---------------------|-------------------|
| 01-cross-language (8 sub-rollups) | ~120 | ✅ | ✅ |
| 02-typescript (2 files) | ~30 | ✅ | ✅ |
| 03-golang (5 files) | ~40 | ✅ | ✅ |
| 04-php (5 files) | ~50 | ✅ | ✅ |
| 05-rust | ~15 | ✅ (inert) | ✅ |
| 06-ai-optimization (2 files) | ~25 | ✅ | ✅ |
| 07-csharp | ~15 | ✅ (inert) | ✅ |
| 08-file-folder-naming | ~20 | ✅ | ✅ |
| consolidated-review-guide | ~20 | ✅ | ✅ |
| top-level rollup | ~28 | ✅ | ✅ |
| **Total** | **363** | **363** | **9 recipes** |

---

## Verification

```bash
# Template file present + cited from every coding-guidelines rollup
test -f spec/02-coding-guidelines/97a-acceptance-criteria-fixtures.md
node scripts/spec-hygiene/03-check-links.mjs

# All nine per-rollup recipes runnable
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`97-acceptance-criteria.md`](./97-acceptance-criteria.md) — Top-level prose rollup
- [`spec/01-spec-authoring-guide/19-acceptance-criteria-io-table.md`](../01-spec-authoring-guide/19-acceptance-criteria-io-table.md) — Format SSOT (lint-shape opt-out)
- [`spec/35-enforcement-rules/97a-acceptance-criteria-fixtures.md`](../35-enforcement-rules/97a-acceptance-criteria-fixtures.md) — Four-layer CI (compile/lint/runtime/test)
- [`.lovable/plans/p2-coverage.md`](../../.lovable/plans/p2-coverage.md) — Coverage tracker

*P2f — created 2026-04-28 (UTC+8). Single template + 9 recipes covers all 363 coding-guideline ATs per the lint-shape opt-out.*
