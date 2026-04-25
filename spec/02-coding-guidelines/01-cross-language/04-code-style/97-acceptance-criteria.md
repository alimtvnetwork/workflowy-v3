# Cross-Language Code Style — Acceptance Criteria

> **Version:** 2.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## Purpose

Testable acceptance criteria for cross-language code-style rules (PHP, TypeScript, Go) — braces, nesting, condition extraction, function size, multi-line formatting, comments.

ID format: `AT-CODESTYLE-NN`.

---

## Criteria

### Braces & Nesting (AT-CODESTYLE-01..04)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-CODESTYLE-01 | Every `if`, `else`, `for`, `while`, `switch`, function body uses braces — no single-line bodies, even for one statement. | [`01-braces-and-nesting.md`](./01-braces-and-nesting.md) |
| AT-CODESTYLE-02 | No nested `if` (zero-nesting rule); use early-return guards or extracted helpers. | [`01-braces-and-nesting.md`](./01-braces-and-nesting.md) + `mem://constraints/coding-guidelines` |
| AT-CODESTYLE-03 | The documented exemptions (test fixtures, generated code, JSON-shape literals) are the only places nesting is allowed. | [`01-braces-and-nesting.md`](./01-braces-and-nesting.md) |
| AT-CODESTYLE-04 | Opening brace position is consistent per language (TS/JS: same line; Go: same line; PHP: per PSR-12). | [`01-braces-and-nesting.md`](./01-braces-and-nesting.md) |

### Condition Extraction (AT-CODESTYLE-05..06)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-CODESTYLE-05 | Any condition with 2+ logical operators (`&&`, `\|\|`) is extracted into a named guard function. | [`02-conditions-and-extraction.md`](./02-conditions-and-extraction.md) |
| AT-CODESTYLE-06 | Negative conditions (`!isReady`) at the top of a guard block use early return, not a nested else. | [`02-conditions-and-extraction.md`](./02-conditions-and-extraction.md) |

### Blank Lines & Spacing (AT-CODESTYLE-07..08)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-CODESTYLE-07 | Blank-line rules in `03-blank-lines-and-spacing/` are enforced (one blank line between functions, no blank line at the start/end of a block). | [`03-blank-lines-and-spacing/`](./03-blank-lines-and-spacing/00-overview.md) |
| AT-CODESTYLE-08 | No multiple consecutive blank lines anywhere in source. | [`03-blank-lines-and-spacing/`](./03-blank-lines-and-spacing/00-overview.md) |

### Function & Type Size (AT-CODESTYLE-09..11)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-CODESTYLE-09 | Function bodies are ≤ 15 lines of logic (excluding signature, braces, blank lines, comments). | [`04-function-and-type-size.md`](./04-function-and-type-size.md) + `mem://constraints/coding-guidelines` |
| AT-CODESTYLE-10 | Functions have ≤ 3 parameters; more requires an options object. | [`04-function-and-type-size.md`](./04-function-and-type-size.md) |
| AT-CODESTYLE-11 | Type definitions (interfaces, classes, structs) with > 8 fields are reviewed for split or composition. | [`04-function-and-type-size.md`](./04-function-and-type-size.md) |

### Multi-Line Formatting (AT-CODESTYLE-12..13)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-CODESTYLE-12 | Function calls / declarations exceeding the documented line width break with one argument per line, closing paren on its own line. | [`05-multi-line-formatting.md`](./05-multi-line-formatting.md) |
| AT-CODESTYLE-13 | Trailing commas appear on every multi-line list (arguments, array, object) where the language allows. | [`05-multi-line-formatting.md`](./05-multi-line-formatting.md) |

### Comments & Dead Code (AT-CODESTYLE-14..15)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-CODESTYLE-14 | Comments explain *why*, never *what*; `what` belongs in the code itself or function name. | [`06-comments-and-documentation.md`](./06-comments-and-documentation.md) |
| AT-CODESTYLE-15 | No dead code — commented-out blocks, unreachable branches, and unused exports are removed before merge. | [`06-comments-and-documentation.md`](./06-comments-and-documentation.md) |

### Reviewer Checklist (AT-CODESTYLE-16)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-CODESTYLE-16 | The checklist in `07-checklist.md` runs against every code-touching PR. | [`07-checklist.md`](./07-checklist.md) |

---

## Verification

```bash
grep -rn "AT-CODESTYLE-" spec/02-coding-guidelines/01-cross-language/04-code-style/
node scripts/spec-hygiene/00-run-all.mjs
bunx eslint src/
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Subsection overview
- [`07-checklist.md`](./07-checklist.md) — Reviewer checklist
- [`../15-master-coding-guidelines/03-code-style-and-errors.md`](../15-master-coding-guidelines/03-code-style-and-errors.md) — Master rollup
- [`../02-boolean-principles/00-overview.md`](../02-boolean-principles/00-overview.md) — Boolean naming rules
- [`spec/19-glossary.md`](../../../19-glossary.md) — Terminology SSOT
- [`spec/20-enums-index.md`](../../../20-enums-index.md) — Enum registry

*Curated v2.0.0 — 2026-04-25 (UTC+8). Replaced auto-generated H-2.1 scaffold.*
