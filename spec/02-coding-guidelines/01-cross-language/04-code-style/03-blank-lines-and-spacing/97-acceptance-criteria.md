# Blank Lines & Spacing — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 11 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-BLANKLINESANDSPACING-01` … `AT-BLANKLINESANDSPACING-11`

> Applies to **PHP, TypeScript, Go** uniformly. Enforced by linters per `16-static-analysis/`.

---

## Criteria

### Rule 4 — blank line before `return`/`throw` (file 01)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-BLANKLINESANDSPACING-01 | When `return` (or `throw`) is preceded by **at least one other statement** in the same block, exactly **one** blank line MUST appear between them. | [`01-rule-4-before-return-throw.md`](./01-rule-4-before-return-throw.md) |
| AT-BLANKLINESANDSPACING-02 | When `return`/`throw` is the **only** statement in the block (e.g., guard clause body), NO blank line is required (and adding one is a style violation). | [`01-rule-4-before-return-throw.md`](./01-rule-4-before-return-throw.md) |
| AT-BLANKLINESANDSPACING-03 | Multiple consecutive blank lines are forbidden; the rule produces **exactly one** blank line, not two. | [`01-rule-4-before-return-throw.md`](./01-rule-4-before-return-throw.md) |

### Rule 5 — blank line after closing `}` (file 02)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-BLANKLINESANDSPACING-04 | A closing `}` followed by **more code** in the same scope MUST be followed by exactly one blank line before that next statement. | [`02-rule-5-after-closing-brace.md`](./02-rule-5-after-closing-brace.md) |
| AT-BLANKLINESANDSPACING-05 | The rule does NOT apply when the next token is `else`, `else if`, `catch`, `finally`, or another chainable continuation; those follow on the same line. | [`02-rule-5-after-closing-brace.md`](./02-rule-5-after-closing-brace.md) |
| AT-BLANKLINESANDSPACING-06 | The rule does NOT apply at the end of a parent block (closing `}` immediately followed by another closing `}`). | [`02-rule-5-after-closing-brace.md`](./02-rule-5-after-closing-brace.md) |
| AT-BLANKLINESANDSPACING-07 | The rule applies uniformly to function bodies, control-structure blocks, and inline anonymous functions/closures. | [`02-rule-5-after-closing-brace.md`](./02-rule-5-after-closing-brace.md) |

### Rule 10 — blank line before control structures (file 03)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-BLANKLINESANDSPACING-08 | A control structure (`if`/`for`/`while`/`switch`/`do`) preceded by **another statement** MUST have exactly one blank line before it. | [`03-rule-10-before-control-structures.md`](./03-rule-10-before-control-structures.md) |
| AT-BLANKLINESANDSPACING-09 | The rule does NOT apply when the control structure is the **first statement** in its block (no preceding statement). | [`03-rule-10-before-control-structures.md`](./03-rule-10-before-control-structures.md) |
| AT-BLANKLINESANDSPACING-10 | The rule applies to nested-but-not-stacked control structures: a `for` loop directly after another statement gets the blank line, even when both are inside a parent block. | [`03-rule-10-before-control-structures.md`](./03-rule-10-before-control-structures.md) |

### Enforcement

| ID | Criterion | Source |
|----|-----------|--------|
| AT-BLANKLINESANDSPACING-11 | Rules 4, 5, 10 are enforced by the linters listed in [`16-static-analysis/`](../../16-static-analysis/00-overview.md); a CI failure on any of these rules blocks merge. | [`00-overview.md`](./00-overview.md), [`spec/02-coding-guidelines/01-cross-language/16-static-analysis/00-overview.md`](../../16-static-analysis/00-overview.md) |

---

## Verification

```bash
# Heuristic: more than 1 consecutive blank line
rg -nU '\n\n\n' --type php --type ts --type go src/

# Hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../97-acceptance-criteria.md`](../97-acceptance-criteria.md) — Code-style rollup
- [`spec/02-coding-guidelines/01-cross-language/16-static-analysis/00-overview.md`](../../16-static-analysis/00-overview.md) — Linter enforcement

---

*Curated 2026-04-25 — closes A-19 (batch 8).*
