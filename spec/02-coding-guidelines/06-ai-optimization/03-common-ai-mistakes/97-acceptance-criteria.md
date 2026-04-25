# Common AI Mistakes — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 13 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)
> **Purpose:** Encode the "20 most common AI hallucinations" so each one is testable, not just narrated.

---

## ID Range

`AT-COMMONAIMISTAKES-01` … `AT-COMMONAIMISTAKES-13`

---

## Criteria

### Naming & style (file 01)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-COMMONAIMISTAKES-01 | **Mistake #1 (camelCase JSON keys)** — every JSON key produced by the backend OR consumed by the frontend MUST be PascalCase per the Golden Rule; AI-generated `camelCase` keys are caught by lint and CI. | [`01-naming-and-style.md`](./01-naming-and-style.md), [`spec/04-database-conventions/06-rest-api-format/97-acceptance-criteria.md`](../../../04-database-conventions/06-rest-api-format/97-acceptance-criteria.md) |
| AT-COMMONAIMISTAKES-02 | **Mistake #2 (uppercase abbreviations)** — abbreviations in identifiers are PascalCase only on first letter (`HttpClient`, `JsonParser`, `XmlReader`); `HTTPClient`, `JSONParser`, `XMLReader` are forbidden. | [`01-naming-and-style.md`](./01-naming-and-style.md) |

### Go type system (file 02)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-COMMONAIMISTAKES-03 | **Mistake #3 (multi-return Go functions)** — exported Go functions return a single `Result[T]` / `*AppError`, NOT the idiomatic `(T, error)` pair; `(T, error)` is reserved for stdlib boundaries only. | [`02-go-type-system.md`](./02-go-type-system.md), [`spec/03-error-manage/02-error-architecture/06-apperror-package/01-apperror-reference/97-acceptance-criteria.md`](../../../03-error-manage/02-error-architecture/06-apperror-package/01-apperror-reference/97-acceptance-criteria.md) |
| AT-COMMONAIMISTAKES-04 | **Mistake #4 (`fmt.Errorf` instead of `apperror`)** — `fmt.Errorf` is forbidden in domain code; every error originates from `apperror.New` / `apperror.NewType` / `apperror.Wrap`. | [`02-go-type-system.md`](./02-go-type-system.md) |
| AT-COMMONAIMISTAKES-05 | **Mistake #8/#13/#14 (Go type-system slips)** — `interface{}` / `any` / map-of-interface as a return type, untyped enum, and missing `String()` on enums are all banned and caught by static analysis. | [`02-go-type-system.md`](./02-go-type-system.md), [`spec/02-coding-guidelines/03-golang/01-enum-specification/97-acceptance-criteria.md`](../../03-golang/01-enum-specification/97-acceptance-criteria.md) |

### Control flow (file 03)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-COMMONAIMISTAKES-06 | **Mistake #5 (nested `if` statements)** — zero nested `if` is enforced in every language; AI-suggested nested branches must be refactored into early-return guards or extracted helpers. | [`03-control-flow.md`](./03-control-flow.md), [`mem://constraints/coding-guidelines`](mem://constraints/coding-guidelines) |
| AT-COMMONAIMISTAKES-07 | **Mistake #9 (negated compound conditions)** — `!isX && isY`-style mixed-polarity conditions are forbidden; use a positive-named local for the negation first. | [`03-control-flow.md`](./03-control-flow.md), [`spec/02-coding-guidelines/01-cross-language/02-boolean-principles/97-acceptance-criteria.md`](../../01-cross-language/02-boolean-principles/97-acceptance-criteria.md) |

### Parameters (file 04)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-COMMONAIMISTAKES-08 | **Mistake #15 (boolean flag parameters)** — functions never accept `bool` as a flag parameter; split into two named methods (`processAsync()` / `processSync()`) or accept an enum option. | [`04-parameters.md`](./04-parameters.md), [`spec/02-coding-guidelines/01-cross-language/24-boolean-flag-methods.md`](../../01-cross-language/24-boolean-flag-methods.md) |

### PHP-specific (file 05)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-COMMONAIMISTAKES-09 | **Mistake #11 (PHP magic methods, variable variables, `extract`)** — banned constructs match the PHP forbidden-patterns spec; AI-suggested `extract($_POST)` / `$$var` / `__call` magic-routing fail lint. | [`05-php-specific.md`](./05-php-specific.md), [`spec/02-coding-guidelines/04-php/02-forbidden-patterns/97-acceptance-criteria.md`](../../04-php/02-forbidden-patterns/97-acceptance-criteria.md) |

### Enum usage (file 06)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-COMMONAIMISTAKES-10 | **Mistake #12 (raw string enums)** — passing raw strings where an enum/variant exists is forbidden; AI-generated `"E2010"` / `"completed"` literals must be replaced with `apperrtype.SiteNotFound` / `StatusType::Completed`. | [`06-enum-usage.md`](./06-enum-usage.md), [`spec/02-coding-guidelines/04-php/01-enums/97-acceptance-criteria.md`](../../04-php/01-enums/97-acceptance-criteria.md), [`spec/02-coding-guidelines/03-golang/01-enum-specification/97-acceptance-criteria.md`](../../03-golang/01-enum-specification/97-acceptance-criteria.md) |

### Caching (CODE RED — file 07)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-COMMONAIMISTAKES-11 | **Mistakes #16–#20 (caching CODE RED)** — AI-introduced caching layers (in-memory maps, `transient`, Redis, browser SW cache) are forbidden without an explicit spec entry; every cache MUST declare TTL, invalidation trigger, key shape, and consistency model. | [`07-caching-red.md`](./07-caching-red.md) |

### Pattern recognition (file 08)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-COMMONAIMISTAKES-12 | **Hallucination signals** — when an AI suggests an API/method/library not present in the dependency matrix, the change is rejected; reviewers must verify against `mem://architecture/tech-stack` and `package.json`. | [`08-pattern-recognition.md`](./08-pattern-recognition.md), [`mem://architecture/tech-stack`](mem://architecture/tech-stack) |

### Coverage

| ID | Criterion | Source |
|----|-----------|--------|
| AT-COMMONAIMISTAKES-13 | The **Top-5 frequency table** in `00-overview.md` is kept in sync with the per-file mistake numbering; each top-5 row links to its anchor in the source file. | [`00-overview.md`](./00-overview.md) "Quick Reference: Top 5 by Frequency" |

---

## Verification

```bash
# camelCase JSON keys leaking out of backend (PHP / Go)
rg -n '"[a-z][a-zA-Z]*"\s*:\s*' --type go --type php | grep -v '_test\.\|fixture'

# fmt.Errorf in domain code
rg -n 'fmt\.Errorf\(' --type go internal/ | grep -v '_test\.go'

# Hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`spec/02-coding-guidelines/06-ai-optimization/01-anti-hallucination-rules.md`](../01-anti-hallucination-rules.md) — Anti-hallucination rules
- [`spec/02-coding-guidelines/06-ai-optimization/02-ai-quick-reference-checklist.md`](../02-ai-quick-reference-checklist.md) — Quick reference checklist
- [`spec/04-database-conventions/06-rest-api-format/97-acceptance-criteria.md`](../../../04-database-conventions/06-rest-api-format/97-acceptance-criteria.md) — PascalCase Golden Rule

---

*Curated 2026-04-25 — closes A-17 (batch 6).*
