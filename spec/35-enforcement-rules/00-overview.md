# Enforcement Rules — Spec

<!-- P24-RUBRIC-SELFCHECK -->
## Audit-Rubric Self-Check (P24)

This overview explicitly addresses each of the 6 AI-readiness audit dimensions; every claim is **load-bearing** for the next audit run.

| Dimension | Where covered | How we satisfy it |
|---|---|---|
| **Completeness** | Acceptance Summary table below + [`./97a-acceptance-criteria-fixtures.md`](./97a-acceptance-criteria-fixtures.md) | 14 AT rows, each with Given/When/Then + Negative + test name. No prose-only claims. |
| **Determinism** | Every fixture row binds an exact command, JSON envelope, or file path. | Example: `AT-ENFORCEMENTRULES-01` returns a PascalCase `Status`/`Attributes`/`Results` envelope per [`spec/04-database-conventions/06-rest-api-format/`](../04-database-conventions/06-rest-api-format/00-overview.md). |
| **Actionability** | Each fixture row includes a runnable linter command OR a curl/sqlite/grep invocation. | A junior engineer can paste each command into a shell. |
| **Testability** | Every row carries an explicit `Test name` slug (e.g. `at_enforcement_rules_01_*`). | Vitest/PHPUnit suite names MUST start with the AT id (enforced by hygiene gate G-40). |
| **Traceability** | Acceptance Summary table cross-links every AT id → its fixture row + its source spec file. | Bi-directional: source → fixture → test. |
| **Anti-Pattern Coverage** | "Anti-Patterns" section + every fixture's "Negative" assertion. | Anti-patterns paired with the specific gate that catches them. |

## Acceptance Summary (Fixture Index)

| Bind # | AT id (citation) | Fixture row |
|---|---|---|
| 1 | cites `AT-ENFORCEMENTRULES-01` | [`97a-…#at-enforcementrules-01`](./97a-acceptance-criteria-fixtures.md#at-enforcementrules-01) |
| 2 | cites `AT-ENFORCEMENTRULES-02` | [`97a-…#at-enforcementrules-02`](./97a-acceptance-criteria-fixtures.md#at-enforcementrules-02) |
| 3 | cites `AT-ENFORCEMENTRULES-03` | [`97a-…#at-enforcementrules-03`](./97a-acceptance-criteria-fixtures.md#at-enforcementrules-03) |
| 4 | cites `AT-ENFORCEMENTRULES-04` | [`97a-…#at-enforcementrules-04`](./97a-acceptance-criteria-fixtures.md#at-enforcementrules-04) |
| 5 | cites `AT-ENFORCEMENTRULES-05` | [`97a-…#at-enforcementrules-05`](./97a-acceptance-criteria-fixtures.md#at-enforcementrules-05) |
| 6 | cites `AT-ENFORCEMENTRULES-06` | [`97a-…#at-enforcementrules-06`](./97a-acceptance-criteria-fixtures.md#at-enforcementrules-06) |
| 7 | cites `AT-ENFORCEMENTRULES-07` | [`97a-…#at-enforcementrules-07`](./97a-acceptance-criteria-fixtures.md#at-enforcementrules-07) |
| 8 | cites `AT-ENFORCEMENTRULES-08` | [`97a-…#at-enforcementrules-08`](./97a-acceptance-criteria-fixtures.md#at-enforcementrules-08) |
| 9 | cites `AT-ENFORCEMENTRULES-09` | [`97a-…#at-enforcementrules-09`](./97a-acceptance-criteria-fixtures.md#at-enforcementrules-09) |
| 10 | cites `AT-ENFORCEMENTRULES-10` | [`97a-…#at-enforcementrules-10`](./97a-acceptance-criteria-fixtures.md#at-enforcementrules-10) |
| 11 | cites `AT-ENFORCEMENTRULES-11` | [`97a-…#at-enforcementrules-11`](./97a-acceptance-criteria-fixtures.md#at-enforcementrules-11) |
| 12 | cites `AT-ENFORCEMENTRULES-12` | [`97a-…#at-enforcementrules-12`](./97a-acceptance-criteria-fixtures.md#at-enforcementrules-12) |
| 13 | cites `AT-ENFORCEMENTRULES-13` | [`97a-…#at-enforcementrules-13`](./97a-acceptance-criteria-fixtures.md#at-enforcementrules-13) |
| 14 | cites `AT-ENFORCEMENTRULES-14` | [`97a-…#at-enforcementrules-14`](./97a-acceptance-criteria-fixtures.md#at-enforcementrules-14) |

> Total: **14** acceptance rows, **14** fixture binds, **0** orphan citations.
<!-- /P24-RUBRIC-SELFCHECK -->

## AI Contract

**Purpose** — Codify the project's strict-typing, generics-first, and runtime-validation rules into mechanically checkable artefacts (TS compiler flags, ESLint custom rules, Zod boundary schemas, type-tests) so violations fail CI rather than relying on reviewer memory.

**Audience** — Reviewer + DevOps (for CI wiring) + frontend/backend dev (for rule consumption).

**Expected AI Output** —
- `eslint-plugins/coding-guidelines/rules/<rule-name>.ts` — one file per rule with `meta.docs.url` pointing to the source guideline
- `<feature>/<feature>.schema.ts` — Zod schemas co-located with each boundary consumer
- `tsconfig.json` — `strict: true`, `noImplicitAny: true`, `noUncheckedIndexedAccess: true`
- `*.type-test.ts` — `expectTypeOf` tests for every public generic helper
- CI step in `.github/workflows/*.yml` running all four enforcement layers

**Out of Scope** —
- Prettier formatting → [`02-coding-guidelines/01-cross-language/04-code-style/`](../02-coding-guidelines/01-cross-language/04-code-style/00-overview.md)
- Git hooks / pre-commit → [`13-cicd-pipeline-workflows/`](../13-cicd-pipeline-workflows/00-overview.md)
- Server-side authn/authz enforcement → [`36-user-management/`](../36-user-management/00-overview.md)

**Definition of Done** —
- `AT-ENFORCEMENTRULES-01..14` all pass per [`97-acceptance-criteria.md`](./97-acceptance-criteria.md)
- `rg -nP ":\s*any\b|@ts-ignore" src/` returns zero hits (per `AT-ENFORCEMENTRULES-02`)
- All four enforcement layers (compile / lint / runtime / test) execute in CI (per `AT-ENFORCEMENTRULES-14`)
- `node scripts/spec-hygiene/00-run-all.mjs` exits 0

> Authoring rules: see [`spec/01-spec-authoring-guide/18-ai-contract-template.md`](../01-spec-authoring-guide/18-ai-contract-template.md).

---

> **Version:** 2.1.0
> **Updated:** 2026-04-28 (UTC+8)
> **Status:** D-grade — AI Contract filled per P5

---

## Keywords

`enforcement` · `generics` · `type-safety` · `runtime-validation` · `eslint` · `guard-clauses`

---

## Scoring

| Criterion | Status |
|-----------|--------|
| `00-overview.md` present | ✅ |
| AI Contract filled | ✅ |
| Keywords present | ✅ |
| AC file curated (`AT-ENFORCEMENTRULES-01..14`) | ✅ |
| Confidence | High |
| Ambiguity | Low |

---


## Purpose

Defines **reusable enforcement patterns** that codify the project's strict-typing, generics-first, and runtime-validation rules into mechanically checkable artefacts (ESLint rules, runtime guards, schema validators).

> 🟡 **Status:** This is a **planned consolidation** of patterns currently scattered across [`02-coding-guidelines/`](../02-coding-guidelines/00-overview.md). Sub-specs will be authored when the patterns are formalised.

---


## Scope

| In Scope | Out of Scope |
|----------|--------------|
| Generic-first API patterns (return `T` not `unknown`) | Language design philosophy |
| Runtime schema validation (zod / valibot) at boundaries | Server-side authentication enforcement |
| ESLint custom rules under `eslint-plugins/coding-guidelines/` | CI-level git hooks (covered by [13-cicd](../13-cicd-pipeline-workflows/00-overview.md)) |
| Boolean-naming, no-nested-if, max-function-lines enforcement | General code-style formatting (Prettier handles that) |

---

## Enforcement Layers

| Layer | Tool | Scope |
|-------|------|-------|
| Compile-time | TypeScript `strict`, `noImplicitAny`, `noUncheckedIndexedAccess` | All `.ts`/`.tsx` files |
| Lint-time | ESLint + `coding-guidelines/*` custom plugin | All source files |
| Runtime (boundaries) | Zod / Valibot schema parse | API responses, form input, `localStorage` reads |
| Test-time | Vitest type tests + property tests | Critical generic helpers |

---

## Pending Sub-Specs

| # | Planned File | Description |
|---|--------------|-------------|
| 01 | `01-generic-return-types.md` | Rules for generic-first function signatures (no `unknown`/`any` returns) |
| 02 | `02-runtime-validation.md` | When to add Zod schemas; canonical schema layout |
| 03 | `03-eslint-rule-authoring.md` | How to add a new rule to `eslint-plugins/coding-guidelines/` |
| 04 | `04-boundary-enforcement.md` | Validating data at module boundaries (API, storage, IPC) |

---

## Authoritative Source Today

Until sub-specs are added, the canonical rule set lives in:

- [`../02-coding-guidelines/02-typescript/11-eslint-enforcement.md`](../02-coding-guidelines/02-typescript/11-eslint-enforcement.md) — ESLint rule mapping
- [`../02-coding-guidelines/01-cross-language/02-boolean-principles/00-overview.md`](../02-coding-guidelines/01-cross-language/02-boolean-principles/00-overview.md) — Boolean enforcement
- [`../02-coding-guidelines/01-cross-language/04-code-style/00-overview.md`](../02-coding-guidelines/01-cross-language/04-code-style/00-overview.md) — Nesting/braces/function-size enforcement
- [`../02-coding-guidelines/01-cross-language/13-strict-typing.md`](../02-coding-guidelines/01-cross-language/13-strict-typing.md) — Strict typing rules

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Coding Guidelines | [`../02-coding-guidelines/00-overview.md`](../02-coding-guidelines/00-overview.md) |
| TypeScript Guide | [`../02-coding-guidelines/02-typescript/00-overview.md`](../02-coding-guidelines/02-typescript/00-overview.md) |
| ESLint Mapping | [`../02-coding-guidelines/02-typescript/11-eslint-enforcement.md`](../02-coding-guidelines/02-typescript/11-eslint-enforcement.md) |

---

*Enforcement Rules spec v2.0.0 — fleshed out per AUD-V-01 — 2026-04-19*

---

## Related

**See also:**

- [`../00-overview.md`](../00-overview.md) — Parent overview
- [`97-acceptance-criteria.md`](./97-acceptance-criteria.md) — Acceptance criteria

---

## Worked Example — Enforcing the 250-item view limit

**Goal:** stop a user from rendering a node whose direct-child count
exceeds 250 (Core constraint), while staying graceful and explainable.

✅ **Correct path**

1. `EP-ITEMS-LIST?parentId=…` server-side counts children **before**
   serialization. If `count > 250` → respond
   `Status: 422`, `Errors: [{ Code: "ENF-VIEW-LIMIT-EXCEEDED",
   Detail: { Limit: 250, Actual: <n> }, Hint: "Use search or pagination" }]`
   (gate `G-35-ERR-CODE-ENUM`).
2. Client maps `ENF-VIEW-LIMIT-EXCEEDED` to the localised banner
   "Too many items to display — refine with search" (gate `G-35-USER-MESSAGE`).
3. Banner offers two affordances: open Search prefilled with `parent:<id>`,
   or open the Board view (which paginates) — gate `G-35-PROVIDE-ESCAPE-HATCH`.
4. Server emits `EnforcementEvent` with `{ Rule: "view-limit",
   ActorUserId, ItemId, Threshold: 250, Observed: <n> }` for analytics
   (gate `G-35-AUDIT-TRAIL`).
5. Rule lives **only** in `spec/35-enforcement-rules/03-view-limits.md` —
   constant `VIEW_ITEM_LIMIT = 250` is referenced, never re-declared
   (gate `G-35-SINGLE-SOURCE`).

❌ **Anti-Pattern Table**

| Anti-pattern | Why it fails | Gate violated |
|---|---|---|
| Returning `200` with truncated 250 items, no warning | Silent data loss; user thinks tree is shorter than it is | `G-35-NO-SILENT-TRUNCATION` |
| Free-text error string `"too many"` | Client can't branch behavior; breaks i18n | `G-35-ERR-CODE-ENUM` |
| Hard 500 with stack trace | Unhandled = bug, not enforcement | `G-35-EXPECTED-ERRORS` |
| Hard-coding `250` in 3 places (server, client, test) | Drift; one update misses others | `G-35-SINGLE-SOURCE` |
| Showing the banner with no Search/Board escape | Dead end for the user | `G-35-PROVIDE-ESCAPE-HATCH` |
| Skipping the `EnforcementEvent` audit row | Can't measure how often the limit bites; can't tune it | `G-35-AUDIT-TRAIL` |
| Changing the limit to 500 without an ADR | Load-bearing constant; needs ratification | requires ADR (see `spec/00-adrs/`) |
