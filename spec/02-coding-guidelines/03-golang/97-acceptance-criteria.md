# Golang Standards — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 14 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-GOLANG-01` … `AT-GOLANG-14`

---

## Criteria

### Enum specification (file 01)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-GOLANG-01 | Every Go enum MUST live in its own package `pkg/enums/<name>type/` and follow the documented file layout (`variant.go`, `parser.go`, `validator.go`); ad-hoc `const ( … iota )` blocks scattered in business packages are forbidden. | [`01-enum-specification/00-overview.md`](./01-enum-specification/00-overview.md), [`03-httpmethod-enum.md`](./03-httpmethod-enum.md) |
| AT-GOLANG-02 | Enum types MUST be `type Foo string` (NOT `type Foo int` / `iota`); string-backed enums are mandatory for wire-format stability. | [`01-enum-specification/00-overview.md`](./01-enum-specification/00-overview.md) |
| AT-GOLANG-03 | Each enum MUST expose `String()`, `IsValid()`, and `Parse(raw string)` methods; missing any of the three is a Code-Red enforcement bug. | [`01-enum-specification/02-required-methods/00-overview.md`](./01-enum-specification/02-required-methods/00-overview.md) |

### Boolean standards (file 02)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-GOLANG-04 | Boolean variables / functions MUST start with `Is`/`Has`/`Should`/`Can`/`Will`; non-prefixed booleans fail lint. | [`02-boolean-standards/00-overview.md`](./02-boolean-standards/00-overview.md), [`../01-cross-language/02-boolean-principles/00-overview.md`](../01-cross-language/02-boolean-principles/00-overview.md) |
| AT-GOLANG-05 | Boolean function parameters MUST be replaced with split methods OR a typed enum (NOT `func DoThing(force bool)`); boolean flag params are forbidden. | [`../01-cross-language/24-boolean-flag-methods.md`](../01-cross-language/24-boolean-flag-methods.md) |

### Defer rules (file 05)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-GOLANG-06 | `defer` MUST be placed immediately after the resource is acquired (`f, err := os.Open(…); if err != nil { … }; defer f.Close()`); deferring later is a Code-Red leak bug. | [`05-defer-rules.md`](./05-defer-rules.md) |
| AT-GOLANG-07 | `defer` in a loop MUST be wrapped in a function (or refactored) — un-wrapped loop defers are a Code-Red leak bug because they accumulate until function exit. | [`05-defer-rules.md`](./05-defer-rules.md) |

### String/slice internals (file 06)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-GOLANG-08 | `string([]byte)` and `[]byte(string)` conversions MUST be avoided in hot paths; use `unsafe.String` / `unsafe.Slice` ONLY behind a documented helper with a benchmark — bare unsafe casts are forbidden. | [`06-string-slice-internals.md`](./06-string-slice-internals.md) |
| AT-GOLANG-09 | Slice growth in hot paths MUST pre-allocate via `make([]T, 0, cap)`; un-capped `append` in a known-length loop is a perf bug. | [`06-string-slice-internals.md`](./06-string-slice-internals.md) |

### Severity taxonomy (file 07)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-GOLANG-10 | Every coding-rule violation MUST be tagged with one of the documented severities (`Code-Red` / `Code-Orange` / `Code-Yellow` / `Code-Green`); un-severitied violations fail review. | [`07-code-severity-taxonomy.md`](./07-code-severity-taxonomy.md) |
| AT-GOLANG-11 | `Code-Red` issues MUST block merge in CI; downgrading via inline comments requires a tracking ID and PR review. | [`07-code-severity-taxonomy.md`](./07-code-severity-taxonomy.md) |

### Path/file utilities (file 08)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-GOLANG-12 | All filesystem path manipulation MUST go through the `pathutil` package (NOT `path/filepath` directly in business code); raw `filepath.Join` outside `pathutil` is forbidden because it bypasses traversal protection. | [`08-pathutil-fileutil-spec.md`](./08-pathutil-fileutil-spec.md), [`../../05-split-db-architecture/02-features/05-user-scoped-isolation/97-acceptance-criteria.md`](../../05-split-db-architecture/02-features/05-user-scoped-isolation/97-acceptance-criteria.md) |
| AT-GOLANG-13 | All file I/O MUST go through the `fileutil` package, which enforces atomic-write semantics (temp + rename); raw `os.WriteFile` in business code is forbidden because crash-mid-write corrupts data. | [`08-pathutil-fileutil-spec.md`](./08-pathutil-fileutil-spec.md) |

### Standards reference (file 04)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-GOLANG-14 | The standards-reference subfolder MUST be the SSOT for Go-specific rules; any rule duplicated outside this folder MUST link back here — drift is a Code-Red consistency bug. | [`04-golang-standards-reference/00-overview.md`](./04-golang-standards-reference/00-overview.md) |

---

## Verification

```bash
# String-backed enums only
rg -nP "type \w+ int.*//.*enum" pkg/enums/

# Required enum methods
for d in pkg/enums/*/; do
  for m in String IsValid Parse; do
    grep -q "func.*$m" "$d"*.go || echo "MISSING $m in $d"
  done
done

# pathutil/fileutil discipline
rg -nP "filepath\.Join|os\.WriteFile" --type go internal/ | grep -v 'pathutil\|fileutil\|_test'

# Hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../01-cross-language/02-boolean-principles/00-overview.md`](../01-cross-language/02-boolean-principles/00-overview.md) — Boolean naming SSOT
- [`../01-cross-language/24-boolean-flag-methods.md`](../01-cross-language/24-boolean-flag-methods.md) — Boolean-flag refactor rule
- [`../../05-split-db-architecture/02-features/05-user-scoped-isolation/97-acceptance-criteria.md`](../../05-split-db-architecture/02-features/05-user-scoped-isolation/97-acceptance-criteria.md) — Path traversal protection

---

*Curated 2026-04-25 — closes batch-17 item 2. Replaces v3.1.0 placeholder.*


---

## Fixtures

Fixtures for every AT row in this file are covered by the global P2g sweep — see [`../../97a-acceptance-criteria-fixtures.md`](../../97a-acceptance-criteria-fixtures.md) (apply the matching pattern by section).
