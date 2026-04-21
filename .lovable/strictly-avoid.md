# Strictly Avoid — Hard Prohibitions

> **Updated:** 2026-04-18  
> **Severity:** Violating ANY rule below is a critical failure.

---

## Runtime / Stack
- ❌ **No Go, PHP, Postgres, or Supabase.** Stack is Vite + React + TypeScript + SQLite.
- ❌ **No alternative frameworks** (Angular, Vue, Svelte, Next.js).
- ❌ **No `.lovable/memories/`** (plural). The canonical folder is `.lovable/memory/` (singular).

## TypeScript / Code Style
- ❌ **No `any`**, `unknown`, or `Record<string, unknown>`.
- ❌ **No string-union types** for enums — use real `enum` with PascalCase values and `Type` suffix.
- ❌ **No nested `if`** — absolute ban.
- ❌ **No file > 300 lines.**
- ❌ **No function body > 15 lines** (error lines exempt).
- ❌ **No more than 3 parameters** per function.
- ❌ **No raw `!` on function calls** — use named guard functions.
- ❌ **No boolean flag parameters** — split into named methods.
- ❌ **No negative boolean names** (`isNotReady`, `hasNoItems`).
- ❌ **No single-line `if`** — always use braces.
- ❌ **No empty line after opening brace** or at start of file.
- ❌ **No raw filesystem calls** — use wrapper utilities.

## Naming
- ❌ **No underscores in identifiers.**
- ❌ **No camelCase / snake_case** for DB columns, JSON keys, or string keys — always **PascalCase**.
- ❌ **No abbreviations** like `Id` written as `ID` in code identifiers (use `Id`, `Url`); BUT acronyms like `DB`, `API`, `HTTP`, `URL`, `ID` use full uppercase per Section 1.3 of consolidated coding guidelines.

## Process
- ❌ **Never touch `.release/`.**
- ❌ **Never edit `spec/` folders 01–17.** READ-ONLY. Editable spec scope is folders **18 and above** only (`18-spec-issues/`, `31-app/`, `32-ui-design/`, `33-feedback-report/`, `34-activity-feed/`, `35-enforcement-rules/`, `36-user-management/`, plus root files `19-glossary.md`, `20-enums-index.md`, `21-ai-readiness-audit-round-2.md`, `99-consistency-report.md`, `spec-index.md`). No hygiene/auto-TOC scripts may touch 01–17.
- ❌ **Never resume task R3-1** (400-line cap split) — it targeted the now-read-only `02-coding-guidelines`. Task is VOID.
- ❌ **Never invent rules** not in the spec — if silent, ask.
- ❌ **Never merge conventions** from other projects/training data.
- ❌ **Never make a code change** without bumping at least the minor version.
- ❌ **Never append filler** ("Let me know if…", "Hope this helps!").

## Memory
- ❌ **Never overwrite memory files in full** when only adding new content — preserve existing entries.
- ❌ **Never add a memory file** without updating `.lovable/memory/index.md`.

---

*Detailed per-rule files (one per rule) live in `.lovable/strictly-avoid/`.*
