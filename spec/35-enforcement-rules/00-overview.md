# Enforcement Rules — Spec
## AI Contract

**Purpose** — _TODO(P1): one sentence describing what `Enforcement Rules — Spec` solves._

**Audience** — _TODO(P1): which implementer role (spec author / frontend dev / backend dev / DevOps / reviewer)._

**Expected AI Output** —
- _TODO(P1): list concrete artifact paths (files, fixtures, migrations) the AI should produce when implementing this section._

**Out of Scope** —
- _TODO(P1): bullet adjacent concerns and link to owning section._

**Definition of Done** —
- _TODO(P1): testable bullets, each referencing an `AT-*` ID from this section's `97-acceptance-criteria.md` or a hygiene-script name._
- `node scripts/spec-hygiene/00-run-all.mjs` exits 0

> Authoring rules: see [`spec/01-spec-authoring-guide/18-ai-contract-template.md`](../01-spec-authoring-guide/18-ai-contract-template.md).

---

## Scoring

| Criterion | Status |
|-----------|--------|
| `00-overview.md` present | ✅ |
| AI Confidence assigned | ✅ |
| Ambiguity assigned | ✅ |
| Keywords present | ✅ |
| Scoring table present | ✅ |
| AI Confidence (auto-backfill) | Medium |
| Ambiguity (auto-backfill) | Medium |

---


> **Version:** 2.0.0  
> **Updated:** 2026-04-19  
> **Status:** Planned (not yet implemented)

---

## Keywords

`enforcement` · `generics` · `type-safety` · `runtime-validation` · `eslint` · `guard-clauses`

---

## Scoring

| Criterion | Status |
|-----------|--------|
| Overview present | ✅ |
| Confidence rated | ✅ |
| Ambiguity rated | ✅ |
| Keywords present | ✅ |
| Scoring table present | ✅ |

## Confidence

Draft (high-level only) · Ambiguity: Medium (sub-specs pending)

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
