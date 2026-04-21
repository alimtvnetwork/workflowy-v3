# Language-Specific CI Commands

> **Parent:** [09-ci-pipeline-quality-gate overview](./00-overview.md)

---

## 3. Language-Specific CI Commands

### 3.1 TypeScript (Frontend)

| Stage | Command | Spec Reference |
|-------|---------|----------------|
| Format | `npx prettier --check .` | — |
| Lint | `npx eslint . --max-warnings 0` | [TS ESLint](../../../02-typescript/11-eslint-enforcement.md) |
| Type | `npx tsc --noEmit --strict` | — |
| Test | `npx vitest run --coverage` | — |

### 3.2 Go

| Stage | Command | Spec Reference |
|-------|---------|----------------|
| Format | `gofmt -l . \| grep . && exit 1 \|\| true` | — |
| Lint | `golangci-lint run --timeout 5m` | [Go golangci-lint](../02-go-golangci-lint.md) |
| Type | `go vet ./...` | — |
| Test | `go test -race -coverprofile=coverage.out ./...` | — |

### 3.3 PHP

| Stage | Command | Spec Reference |
|-------|---------|----------------|
| Format | `php-cs-fixer fix --dry-run --diff` | — |
| Lint | `phpcs --standard=phpcs.xml src/` | [PHP PHPCS](../03-php-phpcs-phpstan.md) |
| Type | `phpstan analyse --level=9` | [PHP PHPStan](../03-php-phpcs-phpstan.md) |
| Test | `phpunit --coverage-clover coverage.xml` | — |

### 3.4 C#

| Stage | Command | Spec Reference |
|-------|---------|----------------|
| Format | `dotnet format --verify-no-changes` | — |
| Lint | `dotnet build /warnaserror` | [C# StyleCop](../04-csharp-stylecop.md) |
| Type | (included in `dotnet build`) | — |
| Test | `dotnet test --collect:"XPlat Code Coverage"` | — |

### 3.5 Rust

| Stage | Command | Spec Reference |
|-------|---------|----------------|
| Format | `cargo fmt --all -- --check` | [Rust Clippy](../05-rust-clippy.md) |
| Lint | `cargo clippy --all-targets --all-features -- -D warnings` | [Rust Clippy](../05-rust-clippy.md) |
| Type | (included in `cargo clippy`) | — |
| Test | `cargo tarpaulin --out xml` | — |

### 3.6 VB.NET

| Stage | Command | Spec Reference |
|-------|---------|----------------|
| Format | `dotnet format --verify-no-changes` | — |
| Lint | `dotnet build /warnaserror` | [VB.NET Analyzers](../06-vb-dotnet-analyzers.md) |
| Type | (included in `dotnet build`) | — |
| Test | `dotnet test --collect:"XPlat Code Coverage"` | — |

### 3.7 Node.js (Server)

| Stage | Command | Spec Reference |
|-------|---------|----------------|
| Format | `npx prettier --check .` | — |
| Lint | `npx eslint . --max-warnings 0` | [Node.js ESLint](../07-nodejs-eslint.md) |
| Type | `npx tsc --noEmit --strict` | — |
| Test | `npx vitest run --coverage` or `npx jest --coverage` | — |

### 3.8 Python

| Stage | Command | Spec Reference |
|-------|---------|----------------|
| Format | `ruff format --check .` | [Python Ruff](../08-python-ruff.md) |
| Lint | `ruff check . --output-format=github` | [Python Ruff](../08-python-ruff.md) |
| Type | `mypy . --strict` | [Python Ruff](../08-python-ruff.md) |
| Test | `pytest --cov --cov-report=xml` | — |

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`02-pipeline-stages.md`](./02-pipeline-stages.md) — Pipeline stages
- [`05-ci-workflows.md`](./05-ci-workflows.md) — CI workflow templates

---

*Language commands v3.2.0 — 2026-04-20*
