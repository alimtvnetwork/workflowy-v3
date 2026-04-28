# Rust Standards — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 14 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-RUST-01` … `AT-RUST-14`

---

## Criteria

### Naming overrides (file 01)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-RUST-01 | Rust code MUST follow RFC 430 community conventions: `snake_case` for functions/variables, `PascalCase` for types/traits/enums, `SCREAMING_SNAKE_CASE` for constants; the project-wide PascalCase mandate is OVERRIDDEN here because rustc enforces snake_case via lint warnings. | [`00-overview.md`](./00-overview.md), [`01-naming-conventions.md`](./01-naming-conventions.md) |
| AT-RUST-02 | PascalCase MUST be preserved at exactly two boundaries: (a) database identifiers (table/column names in SQL strings), (b) enum string values when an enum serializes to a string. Any other PascalCase use in Rust source is a Code-Red convention bug. | [`00-overview.md`](./00-overview.md), [`01-naming-conventions.md`](./01-naming-conventions.md) |
| AT-RUST-03 | Module structure MUST follow the documented layout (one concept per file, `mod.rs` only for re-exports); deep nested `mod` blocks in single files are forbidden. | [`01-naming-conventions.md`](./01-naming-conventions.md) |

### Error handling (file 02)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-RUST-04 | Library code MUST use `thiserror`-derived typed errors; `anyhow` is allowed ONLY in `bin/` and integration tests — using `anyhow` in library code is a Code-Red API-leakage bug. | [`02-error-handling.md`](./02-error-handling.md) |
| AT-RUST-05 | `?` operator MUST propagate typed errors with `From` conversions; `unwrap()` / `expect()` in non-test code is forbidden except behind a documented `// SAFETY:` comment with a tracking ID. | [`02-error-handling.md`](./02-error-handling.md) |
| AT-RUST-06 | `panic!` / `unimplemented!` / `todo!` are forbidden in shipped code paths; CI MUST grep for these and fail the build. | [`02-error-handling.md`](./02-error-handling.md) |

### Async patterns (file 03)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-RUST-07 | Async runtime MUST be Tokio (single runtime per binary); mixing async-std, smol, or futures-executor is forbidden because it deadlocks on cross-runtime polling. | [`03-async-patterns.md`](./03-async-patterns.md) |
| AT-RUST-08 | Spawned tasks MUST honour cancellation via `CancellationToken` or scoped `JoinSet`; "fire-and-forget" `tokio::spawn` without a join handle is a Code-Red leak bug. | [`03-async-patterns.md`](./03-async-patterns.md) |
| AT-RUST-09 | Bounded channels (`tokio::sync::mpsc::channel(N)`) MUST be used for back-pressure; `unbounded_channel` is forbidden except behind a documented capacity-justification comment. | [`03-async-patterns.md`](./03-async-patterns.md) |

### Memory safety (file 04)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-RUST-10 | `unsafe` blocks MUST be wrapped in a documented helper with a `// SAFETY:` invariant proof; bare `unsafe` in business code is forbidden. | [`04-memory-safety.md`](./04-memory-safety.md) |
| AT-RUST-11 | `Rc<RefCell<T>>` is forbidden in async code paths (use `Arc<Mutex<T>>` / `Arc<RwLock<T>>`); mixing the two is a Code-Red Send/Sync bug. | [`04-memory-safety.md`](./04-memory-safety.md) |

### Testing (file 05)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-RUST-12 | Tests MUST follow AAA pattern with each phase visually separated; `#[test]` functions that intermix arrange/act/assert fail review. | [`05-testing-standards.md`](./05-testing-standards.md), [`../../15-wp-plugin-how-to/09-testing-patterns/97-acceptance-criteria.md`](../../15-wp-plugin-how-to/09-testing-patterns/97-acceptance-criteria.md) |
| AT-RUST-13 | Integration tests MUST live in `tests/` (NOT `src/`); `#[cfg(test)] mod` blocks are reserved for unit tests of internal items. | [`05-testing-standards.md`](./05-testing-standards.md) |

### FFI / platform (file 06)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-RUST-14 | All FFI boundaries MUST go through a single `platform/` abstraction layer; calling `libc::*` or `winapi::*` directly from business code is a Code-Red portability bug. | [`06-ffi-platform.md`](./06-ffi-platform.md) |

---

## Verification

```bash
# unwrap/expect/panic scan
rg -nP "\.(unwrap|expect)\(" --type rust src/ | grep -v 'SAFETY:'
rg -nP "\b(panic|unimplemented|todo)!\(" --type rust src/

# anyhow in library code
rg -nP "use anyhow" --type rust src/ | grep -v 'src/bin\|tests/'

# unbounded_channel discipline
rg -nP "unbounded_channel" --type rust src/

# Hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../01-cross-language/00-overview.md`](../01-cross-language/00-overview.md) — Cross-language guidelines (most rules apply)
- [`../01-cross-language/07-database-naming.md`](../01-cross-language/07-database-naming.md) — DB naming SSOT (PascalCase boundary)
- [`../06-ai-optimization/05-enum-naming-quick-reference.md`](../06-ai-optimization/05-enum-naming-quick-reference.md) — Cross-language enum rules

---

*Curated 2026-04-25 — closes batch-17 item 4. Replaces v3.1.0 placeholder.*


---

## Fixtures

Fixtures for every AT row in this file are covered by the global P2g sweep — see [`../../97a-acceptance-criteria-fixtures.md`](../../97a-acceptance-criteria-fixtures.md) (apply the matching pattern by section).
