# Casting Elimination Patterns — Acceptance Criteria

> **Version:** 2.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## Purpose

Testable acceptance criteria for the canonical casting-elimination patterns (§7.2). Eliminates raw type assertions from business logic by centralizing them into typed accessors with mandatory `// EXEMPTED:` annotations.

ID format: `AT-CASTINGELIMINATIONPATTERNS-NN`.

---

## Criteria

### Context Values & Error Types (AT-CASTINGELIMINATIONPATTERNS-01..03)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-CASTINGELIMINATIONPATTERNS-01 | Context-value reads go through typed accessor functions (e.g. `GetUserId(ctx)`); raw `ctx.Value(key).(Type)` casts in business logic are forbidden. | [`01-context-and-errors.md`](./01-context-and-errors.md) |
| AT-CASTINGELIMINATIONPATTERNS-02 | Error-type extraction uses `errors.As()` or `apperror.Extract()`; raw `err.(*MyError)` casts are forbidden. | [`01-context-and-errors.md`](./01-context-and-errors.md) |
| AT-CASTINGELIMINATIONPATTERNS-03 | Every cast inside an accessor carries `// EXEMPTED: typed context accessor internal (§7.2)` (or the matching annotation for error packages). | [`01-context-and-errors.md`](./01-context-and-errors.md) |

### Cache & External JSON (AT-CASTINGELIMINATIONPATTERNS-04..05)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-CASTINGELIMINATIONPATTERNS-04 | `sync.Map` and similar untyped caches are wrapped in typed accessors; the cast lives only inside the wrapper. | [`02-cache-and-json.md`](./02-cache-and-json.md) |
| AT-CASTINGELIMINATIONPATTERNS-05 | External JSON / WebSocket payloads are deserialized into typed structs at the boundary; downstream code uses the struct, not `map[string]any`. | [`02-cache-and-json.md`](./02-cache-and-json.md) |

### Stdlib Boundaries (AT-CASTINGELIMINATIONPATTERNS-06..07)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-CASTINGELIMINATIONPATTERNS-06 | `sql.Scanner.Scan(src any)` implementations cast `src` exactly once at the top of the method, annotated `// EXEMPTED: sql.Scanner stdlib interface (§7.2)`. | [`03-stdlib-boundaries.md`](./03-stdlib-boundaries.md) |
| AT-CASTINGELIMINATIONPATTERNS-07 | JSON-LD / dynamic-decoder `.(type)` switches sit only at the decoder boundary; downstream code consumes typed values. | [`03-stdlib-boundaries.md`](./03-stdlib-boundaries.md) |

### CastOrFail Utility (AT-CASTINGELIMINATIONPATTERNS-08..09)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-CASTINGELIMINATIONPATTERNS-08 | `CastOrFail[T]` (or its language equivalent) is the centralized safe-cast utility; it returns a typed error on failure rather than panicking. | [`04-cast-or-fail-utility.md`](./04-cast-or-fail-utility.md) |
| AT-CASTINGELIMINATIONPATTERNS-09 | `CastOrFail[T]` is the only place a generic `any → T` cast is allowed without a per-call `// EXEMPTED:` annotation. | [`04-cast-or-fail-utility.md`](./04-cast-or-fail-utility.md) |

### Rules & Verification (AT-CASTINGELIMINATIONPATTERNS-10..12)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-CASTINGELIMINATIONPATTERNS-10 | Every raw cast in source has either (a) a documented exemption category or (b) a `// EXEMPTED:` annotation citing §7.2. | [`05-rules-and-verification.md`](./05-rules-and-verification.md) |
| AT-CASTINGELIMINATIONPATTERNS-11 | A linter rule enforces the rule above: any unannotated cast outside the documented categories fails the build. | [`05-rules-and-verification.md`](./05-rules-and-verification.md) + [`../16-static-analysis/09-ci-pipeline-quality-gate/00-overview.md`](../16-static-analysis/09-ci-pipeline-quality-gate/00-overview.md) |
| AT-CASTINGELIMINATIONPATTERNS-12 | The decision matrix in §5 unambiguously maps every cast scenario to one of the 6 documented patterns; "other" is not a valid answer. | [`05-rules-and-verification.md`](./05-rules-and-verification.md) |

---

## Verification

```bash
grep -rn "AT-CASTINGELIMINATIONPATTERNS-" spec/02-coding-guidelines/01-cross-language/03-casting-elimination-patterns/
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Subsection overview
- [`../02-boolean-principles/97-acceptance-criteria.md`](../02-boolean-principles/97-acceptance-criteria.md) — Boolean principles (sibling cross-language rule)
- [`../15-master-coding-guidelines/97-acceptance-criteria.md`](../15-master-coding-guidelines/97-acceptance-criteria.md) — Master rules
- [`../16-static-analysis/09-ci-pipeline-quality-gate/97-acceptance-criteria.md`](../16-static-analysis/09-ci-pipeline-quality-gate/97-acceptance-criteria.md) — Linter enforcement in CI

*Curated v2.0.0 — 2026-04-25 (UTC+8). Replaced auto-generated H-2.1 scaffold.*


---

## Fixtures

Fixtures for every AT row in this file are covered by the global P2g sweep — see [`../../../97a-acceptance-criteria-fixtures.md`](../../../97a-acceptance-criteria-fixtures.md) (apply the matching pattern by section).
