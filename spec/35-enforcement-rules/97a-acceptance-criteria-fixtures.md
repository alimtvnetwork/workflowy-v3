# Enforcement Rules — Acceptance Criteria I/O Fixtures

> **Version:** 1.0.0
> **Created:** 2026-04-28 (UTC+8)
> **Status:** Normative companion to [`97-acceptance-criteria.md`](./97-acceptance-criteria.md).
> **Format spec:** [`spec/01-spec-authoring-guide/19-acceptance-criteria-io-table.md`](../01-spec-authoring-guide/19-acceptance-criteria-io-table.md)
> **Spawned by:** `.lovable/plans/00-active.md` § P2e.

---

## `AT-ENFORCEMENTRULES-01` — Strict tsconfig

| Linter command | `node -e "const c=require('./tsconfig.json').compilerOptions;process.exit(c.strict&&c.noImplicitAny&&c.noUncheckedIndexedAccess?0:1)"` |
|---|---|
| **Expected exit code** | `0` |
| **Negative assertion** | Setting any of the three to `false` MUST fail CI. |

## `AT-ENFORCEMENTRULES-02` — Zero `any`, zero `@ts-ignore`

| Linter command | `rg -nP ":\s*any\b\|@ts-ignore" src/ \| rg -v "@ts-expect-error:"` |
|---|---|
| **Expected exit code** | `1` |
| **Negative assertion** | Bare `@ts-ignore` MUST fail; `@ts-expect-error: <ID>` is the only allowed escape hatch. |

## `AT-ENFORCEMENTRULES-03` — Custom rules under one folder

| Linter command | `ls eslint-plugins/coding-guidelines/rules/ \| wc -l && rg -nP "rules:\s*\{" .eslintrc* \| wc -l` |
|---|---|
| **Then** | First > 0; second equals number of rules referenced from the plugin (no override blocks define new rules outside the plugin). |

## `AT-ENFORCEMENTRULES-04` — Plugin enforces five rules

| Given | The plugin manifest `eslint-plugins/coding-guidelines/index.js`. |
|---|---|
| **When** | Test imports the plugin. |
| **Then** | `Object.keys(plugin.rules)` ⊇ `["boolean-naming","no-nested-if","max-three-params","max-fifteen-line-logic","positive-guard-clauses"]`; each rule's `meta.docs.url` is a valid path under `spec/02-coding-guidelines/`. |

## `AT-ENFORCEMENTRULES-05` — Rule meta + examples + auto-fix

| Given | Each rule file. |
|---|---|
| **Then** | Rule module exports `{ meta:{ docs:{ url }, fixable }, create, valid:[…], invalid:[…] }`; `valid.length>=1` and `invalid.length>=1`; rules where `meta.fixable === "code"` MUST provide a `fix` function. |
| **Linter command** | `node eslint-plugins/coding-guidelines/scripts/check-rule-shape.js` |
| **Expected exit code** | `0` |

## `AT-ENFORCEMENTRULES-06` — Boundary inputs through Zod

| Linter command | `rg -nP "JSON\.parse\(" src/ \| rg -v "\.schema\.\|/test/\|\.test\."` |
|---|---|
| **Expected exit code** | `1` |
| **Negative assertion** | Bare `JSON.parse` followed by `as Foo` outside `*.schema.ts` MUST fail. |

## `AT-ENFORCEMENTRULES-07` — Typed errors + co-located schemas

| Given | A schema parse failure. |
|---|---|
| **When** | Test runs `parseFoo(invalidInput)`. |
| **Then** | Returns `{ ok:false, error:{ Code:"E_PARSE_FAILED", Issues:[…] } }`; never `throw new Error("invalid")`. Schema file MUST sit at `<consumer>.schema.ts` in the same folder as the consumer. |

## `AT-ENFORCEMENTRULES-08` — `z.infer` is sole type source

| Linter command | `rg -nP "^export (type\|interface) (\w+)" src/ \| while read line; do name=$(echo $line \| grep -oP "(?<=type \|interface )\w+"); rg -lP "z\.infer<typeof ${name}Schema>" src/ >/dev/null \|\| echo "ORPHAN: $name"; done` |
|---|---|
| **Expected** | No `ORPHAN:` lines. |
| **Negative assertion** | Twin manually-maintained type alongside a Zod schema MUST fail. |

## `AT-ENFORCEMENTRULES-09` — Public APIs return generic `T`

| Given | Public exported function `pickOne<T>(items: T[]): T`. |
|---|---|
| **Linter command** | `rg -nP "^export function \w+\([^)]*\):\s*unknown\b" src/` |
| **Expected exit code** | `1` |
| **Negative assertion** | Returning `unknown` from non-boundary code MUST fail. |

## `AT-ENFORCEMENTRULES-10` — Helpers generic over data shape

| Linter command | `rg -nP "Record<string,\s*unknown>" src/ \| rg -v "/boundary/\|\.schema\."` |
|---|---|
| **Expected exit code** | `1` |
| **Negative assertion** | Accepting `Record<string, unknown>` outside boundary code MUST fail. |

## `AT-ENFORCEMENTRULES-11` — Type tests for generics

| Linter command | `find src -name "*.type.test.ts" \| xargs -I{} npx vitest run {}` |
|---|---|
| **Expected exit code** | `0` |
| **Then** | Every file in `src/lib/generics/` has a sibling `*.type.test.ts` using `expectTypeOf`. |

## `AT-ENFORCEMENTRULES-12` — Property-based tests

| Linter command | `rg -nP "fc\.(property\|assert)" src/lib/generics/*.test.ts \| wc -l` |
|---|---|
| **Expected** | ≥ 1 per critical helper file; absent ones fail review. |

## `AT-ENFORCEMENTRULES-13` — Authoritative-source citation freshness

| Linter command | `node scripts/spec-hygiene/09-check-xrefs.mjs spec/35-enforcement-rules/` |
|---|---|
| **Expected exit code** | `0` |
| **Negative assertion** | Orphan citation (target file missing) MUST fail. |

## `AT-ENFORCEMENTRULES-14` — All four CI layers run

| Given | `.github/workflows/*.yml`. |
|---|---|
| **Linter command** | `node scripts/spec-hygiene/19-check-runbook-staleness.mjs --layers compile,lint,runtime,test` |
| **Expected exit code** | `0` |
| **Then** | Each of the four layers has at least one CI job step; missing one fails the check with `E_LAYER_MISSING: <name>`. |

---

## Verification

```bash
grep -rn "AT-ENFORCEMENTRULES-" spec/35-enforcement-rules/97a-acceptance-criteria-fixtures.md | wc -l   # → 14
node scripts/spec-hygiene/00-run-all.mjs
```

## Related

- [`97-acceptance-criteria.md`](./97-acceptance-criteria.md) — Prose rollup
- [`spec/02-coding-guidelines/02-typescript/11-eslint-enforcement.md`](../02-coding-guidelines/02-typescript/11-eslint-enforcement.md) — ESLint rule mapping

*P2e/C — created 2026-04-28 (UTC+8). Covers 14/14 enforcement-rules ATs.*
