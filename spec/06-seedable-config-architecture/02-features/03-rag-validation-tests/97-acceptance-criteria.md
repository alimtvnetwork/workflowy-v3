# RAG Validation Tests — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 16 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-RAGVALIDATIONTESTS-01` … `AT-RAGVALIDATIONTESTS-16`

---

## Criteria

### Per-field validation tests (files 01–06)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-RAGVALIDATIONTESTS-01 | `ChunkSize` tests MUST cover both error codes `AB-9301` (out-of-range) and `AB-9302` (non-multiple-of-step) with explicit boundary cases (min, min-1, max, max+1, valid-step, off-step). | [`01-chunk-size-tests.md`](./01-chunk-size-tests.md) |
| AT-RAGVALIDATIONTESTS-02 | `ChunkOverlap` tests MUST verify `AB-9303` and assert overlap < chunk-size invariant; equal-to and greater-than cases MUST fail. | [`02-chunk-overlap-tests.md`](./02-chunk-overlap-tests.md) |
| AT-RAGVALIDATIONTESTS-03 | `ContextBudget` tests MUST verify `AB-9304` with min/max boundaries and assert the value is a positive integer (zero and negatives MUST fail). | [`03-context-budget-tests.md`](./03-context-budget-tests.md) |
| AT-RAGVALIDATIONTESTS-04 | `EmbeddingModel` tests MUST verify `AB-9305` against the seeded allow-list (NOT a hardcoded slice) — additions to the allow-list at runtime MUST be picked up without code changes. | [`04-embedding-model-tests.md`](./04-embedding-model-tests.md) |
| AT-RAGVALIDATIONTESTS-05 | `SimilarityThreshold` tests MUST verify `AB-9306` with float boundary cases (0.0, 1.0, NaN, ±Inf) — NaN/Inf MUST fail with a distinct error path, NOT the generic out-of-range. | [`05-similarity-threshold-tests.md`](./05-similarity-threshold-tests.md) |
| AT-RAGVALIDATIONTESTS-06 | `TopK` tests MUST verify `AB-9307` with min/max boundaries and reject zero, negatives, and values above the per-model cap. | [`06-topk-tests.md`](./06-topk-tests.md) |

### Integration & load/save (files 07–08)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-RAGVALIDATIONTESTS-07 | Full-config tests MUST exercise the validator end-to-end and assert that ALL field errors are accumulated (no short-circuit) — a config with 3 invalid fields MUST surface 3 distinct error codes. | [`07-full-config-tests.md`](./07-full-config-tests.md) |
| AT-RAGVALIDATIONTESTS-08 | Load tests MUST verify `AB-9308` (missing file), `AB-9309` (malformed JSON), and `AB-9310` (schema mismatch) as three independent failure paths — collapsing them into a single error is forbidden. | [`08-config-load-save-tests.md`](./08-config-load-save-tests.md) |
| AT-RAGVALIDATIONTESTS-09 | Save tests MUST verify atomic write semantics (temp-file + rename); a crash mid-write MUST leave the previous config intact. | [`08-config-load-save-tests.md`](./08-config-load-save-tests.md) |

### Helpers, benchmarks, fixtures (files 09–10)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-RAGVALIDATIONTESTS-10 | Test helpers MUST be pure (no global state, no network, no filesystem outside `t.TempDir()`); helpers that touch shared state are forbidden. | [`09-helpers-and-benchmarks.md`](./09-helpers-and-benchmarks.md) |
| AT-RAGVALIDATIONTESTS-11 | Benchmarks MUST exist for the hot path (`ValidateConfig`) and document baseline ns/op + allocs/op so regressions are detectable in CI. | [`09-helpers-and-benchmarks.md`](./09-helpers-and-benchmarks.md) |
| AT-RAGVALIDATIONTESTS-12 | Test data files MUST live under `testdata/` (Go convention) and be checked into the repo — generating fixtures at test-time is forbidden because it makes failures non-reproducible. | [`10-test-data-files.md`](./10-test-data-files.md) |

### Cross-cutting test-quality rules

| ID | Criterion | Source |
|----|-----------|--------|
| AT-RAGVALIDATIONTESTS-13 | Every test MUST follow AAA (Arrange-Act-Assert) with each phase visually separated by a blank line; merging phases is forbidden because it harms readability. | [`09-helpers-and-benchmarks.md`](./09-helpers-and-benchmarks.md), [`../../../15-wp-plugin-how-to/09-testing-patterns/97-acceptance-criteria.md`](../../../15-wp-plugin-how-to/09-testing-patterns/97-acceptance-criteria.md) |
| AT-RAGVALIDATIONTESTS-14 | Coverage thresholds: ≥ 90 % line coverage on `validation/` package; PRs that drop coverage below the floor MUST fail CI. | [`00-overview.md`](./00-overview.md) |
| AT-RAGVALIDATIONTESTS-15 | Table-driven tests MUST use named subtests (`t.Run(name, …)`) so individual cases are addressable via `go test -run`; anonymous-only tables are forbidden. | [`01-chunk-size-tests.md`](./01-chunk-size-tests.md) |
| AT-RAGVALIDATIONTESTS-16 | Error assertions MUST compare against the typed `ValidationErrorCode` constant (NOT the error string) — string-matching error messages is a Code-Red brittleness bug. | [`../02-rag-validation-helpers/97-acceptance-criteria.md`](../02-rag-validation-helpers/97-acceptance-criteria.md) |

---

## Verification

```bash
# Coverage
go test -cover ./internal/validation/...

# Boundary keyword scan (every per-field file should mention min/max)
rg -nP 'min|max|boundary' spec/06-seedable-config-architecture/02-features/03-rag-validation-tests/0[1-6]-*.md

# Hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../02-rag-validation-helpers/97-acceptance-criteria.md`](../02-rag-validation-helpers/97-acceptance-criteria.md) — Validators under test
- [`../../../15-wp-plugin-how-to/09-testing-patterns/97-acceptance-criteria.md`](../../../15-wp-plugin-how-to/09-testing-patterns/97-acceptance-criteria.md) — Cross-language test conventions

---

*Curated 2026-04-25 — closes batch-15 item 1. Replaces v0.1.0 stub.*


---

## Fixtures

Fixtures for every AT row in this file are covered by the global P2g sweep — see [`../../../97a-acceptance-criteria-fixtures.md`](../../../97a-acceptance-criteria-fixtures.md) (apply the matching pattern by section).
