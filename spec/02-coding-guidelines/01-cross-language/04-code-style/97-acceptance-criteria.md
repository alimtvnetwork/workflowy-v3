# Cross-Language Code Style — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 14 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-CODESTYLE-01` … `AT-CODESTYLE-14`

> Applies to **PHP, TypeScript, Go** uniformly. Per-language exemptions are documented inline in each topic file.

---

## Criteria

### Braces & nesting (file 01)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-CODESTYLE-01 | **Opening braces** are on the same line as the construct (K&R style) for PHP/TS/Go; allman/egyptian variants are forbidden. | [`01-braces-and-nesting.md`](./01-braces-and-nesting.md) |
| AT-CODESTYLE-02 | **Zero nested `if`** — nested `if` statements are forbidden across all 3 languages; use early-return guards, switch, or extracted helpers. The documented exemptions are the only allowed cases. | [`01-braces-and-nesting.md`](./01-braces-and-nesting.md), [`mem://constraints/coding-guidelines`](mem://constraints/coding-guidelines) |
| AT-CODESTYLE-03 | Single-line `if`/`for`/`while` bodies without braces are forbidden; every block is wrapped in `{ }`. | [`01-braces-and-nesting.md`](./01-braces-and-nesting.md) |

### Condition extraction (file 02)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-CODESTYLE-04 | Compound conditions (≥3 sub-expressions OR mixed AND/OR) MUST be extracted into a positively-named local boolean before use in the `if`. | [`02-conditions-and-extraction.md`](./02-conditions-and-extraction.md) |
| AT-CODESTYLE-05 | Negated compound conditions (`!a && b`) are forbidden — assign the negation to a positive-named local first. | [`02-conditions-and-extraction.md`](./02-conditions-and-extraction.md), [`spec/02-coding-guidelines/01-cross-language/02-boolean-principles/97-acceptance-criteria.md`](../02-boolean-principles/97-acceptance-criteria.md) |

### Blank lines & spacing (file 03 — subfolder)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-CODESTYLE-06 | **Rule 4** — `return`/`throw` preceded by other statements MUST have a blank line before it. | [`03-blank-lines-and-spacing/01-rule-4-before-return-throw.md`](./03-blank-lines-and-spacing/01-rule-4-before-return-throw.md), [`03-blank-lines-and-spacing/97-acceptance-criteria.md`](./03-blank-lines-and-spacing/97-acceptance-criteria.md) |
| AT-CODESTYLE-07 | **Rule 5** — closing `}` followed by more code MUST have a blank line after it. | [`03-blank-lines-and-spacing/02-rule-5-after-closing-brace.md`](./03-blank-lines-and-spacing/02-rule-5-after-closing-brace.md) |
| AT-CODESTYLE-08 | **Rule 10** — control structures (`if`/`for`/`while`/`switch`) preceded by other statements MUST have a blank line before them. | [`03-blank-lines-and-spacing/03-rule-10-before-control-structures.md`](./03-blank-lines-and-spacing/03-rule-10-before-control-structures.md) |

### Function & type size (file 04)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-CODESTYLE-09 | **Function size** ≤ **15 logical lines** (excluding signature, braces, blank lines, comments); longer functions MUST be extracted. | [`04-function-and-type-size.md`](./04-function-and-type-size.md) |
| AT-CODESTYLE-10 | **Function parameters** ≤ **3**; functions with 4+ parameters take a typed options struct/object instead. | [`04-function-and-type-size.md`](./04-function-and-type-size.md) |
| AT-CODESTYLE-11 | **Type/class size** has documented soft + hard caps (per §04); files exceeding the hard cap MUST be split. | [`04-function-and-type-size.md`](./04-function-and-type-size.md) |

### Multi-line formatting (file 05)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-CODESTYLE-12 | Function signatures with >2 parameters are formatted **one parameter per line** with trailing comma; same rule applies to call sites with >2 arguments. | [`05-multi-line-formatting.md`](./05-multi-line-formatting.md) |

### Comments & documentation (file 06)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-CODESTYLE-13 | **Dead code** (commented-out code, unreachable branches) is forbidden; the only acceptable annotation is `// EXEMPTED: <reason>` per the casting-elimination spec. | [`06-comments-and-documentation.md`](./06-comments-and-documentation.md), [`spec/02-coding-guidelines/01-cross-language/03-casting-elimination-patterns/97-acceptance-criteria.md`](../03-casting-elimination-patterns/97-acceptance-criteria.md) |

### Checklist (file 07)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-CODESTYLE-14 | Every checklist item in `07-checklist.md` corresponds to one of `AT-CODESTYLE-01..13` (or to a subfolder AT) — orphan checklist items fail review. | [`07-checklist.md`](./07-checklist.md) |

---

## Verification

```bash
# Single-line if without braces
rg -nP 'if\s*\([^)]+\)\s*\w' --type php --type ts --type go

# Functions over 15 lines (heuristic)
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`./03-blank-lines-and-spacing/97-acceptance-criteria.md`](./03-blank-lines-and-spacing/97-acceptance-criteria.md) — Subfolder AT
- [`spec/02-coding-guidelines/01-cross-language/02-boolean-principles/97-acceptance-criteria.md`](../02-boolean-principles/97-acceptance-criteria.md) — Boolean principles
- [`spec/02-coding-guidelines/01-cross-language/16-static-analysis/00-overview.md`](../16-static-analysis/00-overview.md) — Linter enforcement

---

*Curated 2026-04-25 — closes A-19 (batch 8).*


---

## Fixtures

Fixtures for every AT row in this file are covered by the global P2g sweep — see [`../../../97a-acceptance-criteria-fixtures.md`](../../../97a-acceptance-criteria-fixtures.md) (apply the matching pattern by section).
