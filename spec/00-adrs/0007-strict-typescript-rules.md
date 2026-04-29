# ADR-0007: Strict TypeScript coding rules (zero `any`, max 3 params, no nested `if`s, 15-line logic limit, positive guard clauses)

## Status

`Accepted` — 2026-04-28

## Context

ADR-0003 ratified TypeScript 5.6 with `strict: true` as the frontend
language baseline, but explicitly **deferred** the project's additional
in-house coding-style rules to a dedicated ADR. Those rules currently
live in two places:

1. **Memory** — `mem://constraints/coding-guidelines` (single source of
   truth for the AI agent).
2. **Prose** — `spec/02-coding-guidelines/00-overview.md` (worked
   examples, not enforceable rules).

Without an ADR anchor:

- A future spec edit could silently relax any of these rules.
- Gates that *should* enforce them (e.g. a future
  `G-02-NO-NESTED-IF`) have no decision to cite.
- An AI generating new TypeScript by imitation could violate them
  invisibly because the rules are not load-bearing in `spec/`.

P54 closes this gap.

## Decision

The following **seven strict-TS rules** are MANDATORY for every
TypeScript file in the project (frontend `src/`, build scripts, and
any future TS tooling). Each rule is binary, machine-checkable in
principle, and may be cited by a `G-02-*` gate.

### R1 — Zero `any`

The literal type `any` MUST NOT appear in source. Use `unknown` +
narrowing, generics, or a precise interface. ESLint rule
`@typescript-eslint/no-explicit-any: error` enforces.

### R2 — Maximum 3 parameters per function

A function (declaration, expression, arrow, method) MUST accept at
most **3 positional parameters**. Beyond 3, the call site MUST pass an
options object (which counts as one parameter). Rest-spread (`...args`)
counts as one parameter.

### R3 — No nested `if` statements

An `if` block MUST NOT contain another `if`/`else if` statement
inside its body. Use early-return guard clauses, ternaries, lookup
tables, or extract a helper. `else if` chains at the **same** depth
are permitted.

### R4 — 15-line logic limit per function

The **logic body** of a function MUST be ≤ **15 source lines**,
**excluding**:

- Guard clauses at the top of the function (one per line).
- `try/catch/finally` scaffolding lines (the `try {`, `} catch (e) {`,
  `}` lines themselves; the *contents* count).
- Blank lines and single-line comments.

If a function exceeds 15 logic lines, extract a helper.

### R5 — Pure positive guard clauses only

Guard clauses at the top of a function MUST be expressed in
**positive** form. Use a semantic positive helper instead of bare
negation.

```ts
// ✅ allowed
if (isMissing(user)) return null;
if (isInvalidEmail(email)) throw new ValidationError();

// ❌ forbidden — bare negation
if (!user) return null;
if (email == null) throw new ValidationError();
```

Helpers like `isDefined`, `isMissing`, `isEmpty`, `isPresent`,
`isInvalidX` are the canonical semantic wrappers.

### R6 — Maximum 2 operands per `&&` / `||`

A single boolean expression chained with `&&` or `||` MUST contain
**at most 2 operands**. Three or more requires extraction into a named
predicate (which itself becomes a positive guard, per R5).

Mixing positive and negative checks within the same `&&`/`||`
expression is **forbidden** — split into separate guards.

### R7 — Method chains > 2 calls go on new lines

A method chain of **3 or more** calls MUST be formatted with each
`.method()` on its own line, indented one level. Chains of 1–2 calls
MAY remain inline.

### Scope of these rules

- **In scope:** all `.ts` and `.tsx` files under `src/`, plus any
  TypeScript build script, ESLint plugin, or codegen tool authored in
  this repo.
- **Out of scope:** generated files (e.g. `src/components/ui/*` from
  shadcn), third-party `.d.ts` files in `node_modules`, and `.json`
  configuration.
- **No grandfathering** — these rules apply to all source from day one;
  there is no migration window.

## Consequences

### Positive

- **Load-bearing rules.** Each of R1–R7 can now be cited by a
  `G-02-*` gate without forward-reference hazard.
- **Memory ↔ spec parity.** `mem://constraints/coding-guidelines` and
  `spec/02-coding-guidelines/00-overview.md` now have a shared ADR
  anchor; either can be regenerated from the ADR if they drift.
- **Imitation-safe.** AIs generating new code from the spec can no
  longer "discover" relaxed style by reading existing prose alone.

### Negative

- **Refactor friction.** Some legitimate patterns (e.g. Redux-style
  reducers with switch+nested-if) require extracting helpers.
  Rule R4 is the most likely to bite during prototyping.
- **R5 (positive guards) requires a small helper library**
  (`isDefined`, `isMissing`, …) before any guard can be written.
  This helper module becomes a load-bearing dependency.


**Spec impact** — Downstream sections affected by this decision: [`spec/02-coding-guidelines/02-typescript/`](../02-coding-guidelines/02-typescript/).

## Alternatives Considered

1. **Leave rules in prose only** — rejected: ADR-0003 already
   committed to deferring ratification here; leaving them prose-only
   means any spec edit can silently relax them, defeating the
   "memory ↔ spec parity" goal.
2. **Adopt the Airbnb / Google TypeScript style guide as-is** —
   rejected: those guides do not include R3 (no nested `if`), R4
   (15-line logic limit), or R5 (pure positive guards), which are the
   project's most distinctive and load-bearing constraints. Adopting a
   third-party guide would dilute the rules that matter most.

## Gates Touched

- `G-02-NO-ANY` — enforces R1.
- `G-02-MAX-3-PARAMS` — enforces R2.
- `G-02-NO-NESTED-IF` — enforces R3.
- `G-02-15-LINE-LOGIC` — enforces R4.
- `G-02-POSITIVE-GUARDS` — enforces R5.
- `G-02-MAX-2-BOOL-OPERANDS` — enforces R6.
- `G-02-CHAIN-MULTILINE` — enforces R7.

All seven gates are formally **anchored** by this ADR; their
enforcement contracts live in
`spec/13-cicd-pipeline-workflows/` (lint stage) and
`spec/35-enforcement-rules/`.

## Supersedes / Superseded-By

- **Supersedes:** (none — refines ADR-0003 by closing its explicit
  deferral).
- **Superseded-By:** (none).
