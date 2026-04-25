# File & Folder Naming — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 14 testable criteria (universal + per-language)
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-FILEFOLDERNAMING-01` … `AT-FILEFOLDERNAMING-14`

---

## Criteria

### Universal (cross-language)

| ID | Criterion | Source |
|----|-----------|--------|
| AT-FILEFOLDERNAMING-01 | No file or folder name contains a space character. | [`01-cross-language.md`](./01-cross-language.md) §1 |
| AT-FILEFOLDERNAMING-02 | File and folder names use only `[A-Za-z0-9._-]`. No `@`, `()`, `#`, etc. | [`01-cross-language.md`](./01-cross-language.md) §2 |
| AT-FILEFOLDERNAMING-03 | All folders are lowercase **except C# projects** (PascalCase folders). PHP `Domain/` PSR-4 folders are documented as the per-language override. | [`01-cross-language.md`](./01-cross-language.md) §3, [`02-php-wordpress.md`](./02-php-wordpress.md) |
| AT-FILEFOLDERNAMING-04 | File extensions match the declared language (`.ts`/`.tsx`, `.go`, `.php`, `.ps1`/`.psm1`/`.psd1`, `.rs`, `.cs`). | [`01-cross-language.md`](./01-cross-language.md) §4 |
| AT-FILEFOLDERNAMING-05 | Test files follow the language-specific pattern: Go `*_test.go`, TS `*.test.ts`/`*.spec.ts`, PHP `*Test.php`, C# `*Tests.cs`. | [`01-cross-language.md`](./01-cross-language.md) §5 |
| AT-FILEFOLDERNAMING-06 | Config files are lowercase with hyphens or dots (`tsconfig.json`, `docker-compose.yml`); never `Docker-Compose.yml`. | [`01-cross-language.md`](./01-cross-language.md) §6 |
| AT-FILEFOLDERNAMING-07 | `README.md`, `LICENSE`, `CHANGELOG.md` are the only UPPERCASE-name exceptions. | [`01-cross-language.md`](./01-cross-language.md) §7 |
| AT-FILEFOLDERNAMING-08 | No name has a trailing hyphen/underscore, double separator (`--`, `__`), or numeric-only stem. | [`01-cross-language.md`](./01-cross-language.md) "Forbidden Patterns" |

### Per-language

| ID | Criterion | Source |
|----|-----------|--------|
| AT-FILEFOLDERNAMING-09 | **PHP/WordPress**: classic includes use `class-*.php` kebab-case; PSR-4 namespaces use `PascalCase.php`. Folder is `kebab-case/` or PascalCase domain folder per autoloader. | [`02-php-wordpress.md`](./02-php-wordpress.md) |
| AT-FILEFOLDERNAMING-10 | **Go**: source files are `snake_case.go`; folders are flat lowercase (no hyphens). | [`03-golang.md`](./03-golang.md) |
| AT-FILEFOLDERNAMING-11 | **TypeScript**: utilities/hooks use `kebab-case.ts` (`use-auth.ts`); React components use `PascalCase.tsx` (`UserCard.tsx`). | [`04-typescript-javascript.md`](./04-typescript-javascript.md) |
| AT-FILEFOLDERNAMING-12 | **PowerShell**: script/module/manifest files are `lowercase-kebab-case` (`upload-plugin.ps1`); functions inside scripts use `Verb-Noun` PascalCase (`Get-ServiceStatus`). | [`01-cross-language.md`](./01-cross-language.md) "PowerShell Naming Convention" |
| AT-FILEFOLDERNAMING-13 | **Rust**: files and folders are `snake_case` (`http_client.rs`, `error_handling/`). | [`05-rust-csharp.md`](./05-rust-csharp.md) |
| AT-FILEFOLDERNAMING-14 | **C#**: files and folders are `PascalCase` (`UserService.cs`, `Models/`). | [`05-rust-csharp.md`](./05-rust-csharp.md) |

---

## Verification

```bash
# Hunt for spaces in tracked filenames (project-wide)
git ls-files | grep -P ' ' && echo "VIOLATION" || echo "OK"

# Hunt for special characters
git ls-files | grep -P '[^A-Za-z0-9._/-]' && echo "VIOLATION" || echo "OK"

# Run hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`spec/02-coding-guidelines/04-php/03-naming-conventions/97-acceptance-criteria.md`](../04-php/03-naming-conventions/97-acceptance-criteria.md) — PHP symbol naming
- [`spec/19-glossary.md`](../../19-glossary.md) — Terminology SSOT

---

*Curated 2026-04-25 — closes A-16 (batch 5).*
