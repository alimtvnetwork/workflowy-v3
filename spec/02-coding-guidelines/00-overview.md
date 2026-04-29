
# 02 — Coding Guidelines


> **Version:** 3.2.0  
> **Updated:** 2026-04-19  
> **Status:** Active

## AI Contract

**Purpose** — Define normative coding rules across every language used in the WorkFlowy stack (TypeScript, PHP, PowerShell, Rust, Go, C#) so a mediocre AI produces code that passes hygiene gates on the first commit. Strict-TS rules from `mem://constraints/coding-guidelines` are the canonical source for the TS surface.

**Audience** — Every implementer (frontend dev, backend dev, DevOps, reviewer). Also consumed by lint configs in `eslint.config.js`, PHPStan rules in `wp-plugin/phpstan.neon`, and pre-commit hooks in `scripts/git-hooks/`.

**Expected AI Output** —
- Lint configs honoring all rules: `eslint.config.js`, `wp-plugin/phpstan.neon`, `wp-plugin/.php-cs-fixer.php`.
- Code that satisfies: zero `any`, max 3 params, no nested `if`s, 15-line logic limit, pure positive guard clauses (TS); PHP 8.1+ `enum: string`, `declare(strict_types=1)`, `final class` by default; PascalCase DB field names per `04-database-conventions/`.
- Per-AT test in `97-acceptance-criteria.md` enforced by a hygiene script under `scripts/spec-hygiene/`.

**Out of Scope** —
- Architecture/runtime choices → [`mem://architecture/tech-stack`](mem://architecture/tech-stack) and `15-wp-plugin-how-to/`.
- REST envelope shape → [`04-database-conventions/06-rest-api-format/`](../04-database-conventions/06-rest-api-format/).
- File/folder naming for product features → [`08-file-folder-naming/`](./08-file-folder-naming/).

**Definition of Done** —
- Every `AT-CODINGGUIDELINES-*` row in `97-acceptance-criteria.md` is enforced by either a lint rule (config diff) or a hygiene script (script path).
- `eslint.config.js` and `wp-plugin/phpstan.neon` parse cleanly and reject every counter-example listed in this section.
- `node scripts/spec-hygiene/00-run-all.mjs` exits 0.

> Authoring rules: see [`spec/01-spec-authoring-guide/18-ai-contract-template.md`](../01-spec-authoring-guide/18-ai-contract-template.md).

---

## Keywords

`coding-guidelines` · `coding` · `guidelines`

---

## Scoring

| Criterion | Status |
|-----------|--------|
| `00-overview.md` present | ✅ |
| AI Confidence assigned | ✅ |
| Ambiguity assigned | ✅ |
| Keywords present | ✅ |
| Scoring table present | ✅ |
| AI Confidence (auto-backfill) | Medium |
| Ambiguity (auto-backfill) | Medium |
| Health Score | 92% (A-) |

---




## Hard Rules — Enforcement Matrix

Every rule below is **gate-enforced**. The AI MUST NOT propose code that violates any of them.

| # | Rule | Gate | Severity |
|---|---|---|---|
| R1 | Zero `any` (TS) and zero `mixed` without justification (PHP). | `@typescript-eslint/no-explicit-any` + PHPStan level 9. | Error. |
| R2 | Functions take **at most 3 positional parameters**. Use an options object beyond that. | `max-params: ["error", 3]` + `phpstan-strict-rules`. | Error. |
| R3 | No nested `if` — flatten via guard clauses or extract a helper. | `sonarjs/no-nested-conditional` + custom PHP rule. | Error. |
| R4 | No `else` / `else if` — return early instead. | `no-else-return` (with custom extension to ban `else if`). | Error. |
| R5 | A function's logic body MUST be ≤ **15 lines** (excluding signature, braces, blank lines). | Custom ESLint rule `local/max-logic-lines`. | Error. |
| R6 | Guard clauses MUST be **positive** — `if (!x) return` not `if (x) { … } else …`. | Custom ESLint rule `local/positive-guards`. | Error. |
| R7 | No `switch` statements — use a dispatch object/`Map<key, handler>`. | `no-restricted-syntax: SwitchStatement`. | Error. |
| R8 | Every exported function has an explicit return type. | `@typescript-eslint/explicit-function-return-type`. | Error. |
| R9 | SQLite tables, columns, and indexes are **PascalCase**. Tables singular (`Item`, not `Items_tbl`). | Migration linter `G-04-NAMING`. | Error. |
| R10 | No `console.log` in committed code (use `Log.debug/info/warn/error`). | `no-console`. | Error. |

## Bad / Good Code Pairs

Each pair below is the canonical example for the cited rule. Fixtures in `97a-acceptance-criteria-fixtures.md` MUST cite these snippets verbatim.

### R1 — No `any`

```ts
// ❌ Bad
function parse(input: any): any {
  return JSON.parse(input);
}

// ✅ Good
function parse<T>(input: string, schema: ZodSchema<T>): T {
  return schema.parse(JSON.parse(input));
}
```

### R2 — Max 3 params

```ts
import type { ItemId, OwnerId, Item, ItemType } from "@/types"; // branded IDs per ADR-0020

// ❌ Bad — 5 positional params, AND raw `string` IDs (violates ADR-0020 D1)
function createItem(parentId: string, content: string, type: ItemType, sortKey: string, ownerId: string) { /* … */ }

// ✅ Good — options object + branded IDs (`ItemId`/`OwnerId`); `sortKey` is the
//          lexicographic base-62 fractional string per ADR-0016, never `number`.
type CreateItemInput = {
  parentId: ItemId | null; content: string; type: ItemType; sortKey: string; ownerId: OwnerId;
};
function createItem(input: CreateItemInput): Item { /* … */ }
```

### R3 + R4 — No nested `if`, no `else`

```ts
// ❌ Bad — nested + else
function publishItem(item: Item, ctx: Ctx): Result {
  if (ctx.isAuthenticated) {
    if (!item.isArchived) {
      return repo.publish(item.id);
    } else {
      return { status: 'error', reason: 'archived' };
    }
  } else {
    return { status: 'error', reason: 'unauth' };
  }
}

// ✅ Good — flat guard clauses, no else
function publishItem(item: Item, ctx: Ctx): Result {
  if (!ctx.isAuthenticated) return { status: 'error', reason: 'unauth' };
  if (item.isArchived)      return { status: 'error', reason: 'archived' };
  return repo.publish(item.id);
}
```

### R5 — Max 15-line logic body

```ts
// ❌ Bad — 22 logic lines, mixed concerns
function syncItem(item: Item): SyncResult {
  const local = repo.find(item.id);
  if (!local) return { status: 'created' };
  const conflict = detectConflict(local, item);
  if (conflict) {
    const merged = merge(local, item);
    repo.save(merged);
    log.info('merged', { id: item.id });
    metrics.inc('sync.merged');
    queue.enqueue({ kind: 'notify', id: item.id });
    return { status: 'merged' };
  }
  repo.save(item);
  log.info('updated', { id: item.id });
  metrics.inc('sync.updated');
  queue.enqueue({ kind: 'notify', id: item.id });
  return { status: 'updated' };
}

// ✅ Good — extract helpers
function syncItem(item: Item): SyncResult {
  const local = repo.find(item.id);
  if (!local) return { status: 'created' };
  if (detectConflict(local, item)) return mergeAndPersist(local, item);
  return updateAndPersist(item);
}
```

### R6 — Positive guards

```ts
// ❌ Bad — negated double-check
function send(req: Req): void {
  if (req.body) {
    if (req.body.length > 0) transport.send(req);
  }
}

// ✅ Good — single positive guard
function send(req: Req): void {
  if (!req.body?.length) return;
  transport.send(req);
}
```

### R7 — No `switch`

```ts
// ❌ Bad
function renderNode(n: Node): JSX.Element {
  switch (n.itemType) {
    case 'task':    return <Task n={n} />;
    case 'note':    return <Note n={n} />;
    case 'mirror':  return <Mirror n={n} />;
    default:        return <Unknown n={n} />;
  }
}

// ✅ Good — dispatch table
const RENDERERS: Record<ItemType, (n: Node) => JSX.Element> = {
  task:   (n) => <Task n={n} />,
  note:   (n) => <Note n={n} />,
  mirror: (n) => <Mirror n={n} />,
};
function renderNode(n: Node): JSX.Element {
  return RENDERERS[n.itemType]?.(n) ?? <Unknown n={n} />;
}
```

### R8 — Explicit return types

```ts
// ❌ Bad — return type inferred (drift risk)
export function getActiveItems(parentId: string) {
  return repo.list(parentId).filter(i => !i.archivedAt);
}

// ✅ Good
export function getActiveItems(parentId: string): readonly Item[] {
  return repo.list(parentId).filter(i => !i.archivedAt);
}
```

### R9 — SQLite naming

```sql
-- ❌ Bad
CREATE TABLE items_tbl (
  item_id TEXT PRIMARY KEY,
  parent_id TEXT,
  created_at_ts INTEGER
);

-- ✅ Good
CREATE TABLE Item (
  Id        TEXT PRIMARY KEY,
  ParentId  TEXT REFERENCES Item(Id) ON DELETE CASCADE,
  CreatedAt INTEGER NOT NULL
);
CREATE INDEX IX_Item_ParentId ON Item(ParentId);
```

### R10 — No `console.log`

```ts
// ❌ Bad
export function onSave(item: Item): void {
  console.log('saving', item);
  repo.save(item);
}

// ✅ Good
import { Log } from '@/lib/log';
export function onSave(item: Item): void {
  Log.debug('saving', { id: item.id });
  repo.save(item);
}
```

## Anti-Patterns

The AI MUST NOT:

| # | Anti-pattern | Why it fails | Gate that catches it |
|---|---|---|---|
| 1 | Add a coding rule without a paired automated check | Rule rots — humans won't enforce by review alone. | `G-02-RULE-HAS-GATE` (cross-checks every rule id against ESLint/PHPStan config). |
| 2 | Cite a rule without **both** a bad and a good snippet | AI consumers can't disambiguate intent. | `G-02-PAIRED-EXAMPLES` (markdown lint: every R# heading needs a `❌` block then a `✅` block). |
| 3 | Use `// eslint-disable-next-line` to silence a hard rule | Defeats the gate; bug ships. | `G-02-NO-DISABLE` (CI blocks `eslint-disable` of rules in this section). |
| 4 | Introduce a `switch` "for performance" | Premature optimization; dispatch tables are O(1) too. | `no-restricted-syntax: SwitchStatement` (R7). |
| 5 | Replace a guard with a ternary that hides early-return intent | Reduces readability; breaks line-counter heuristics. | Code review checklist (`G-02-NO-RETURN-TERNARY`). |

*All R# ids are load-bearing — fixtures in `97a-acceptance-criteria-fixtures.md` MUST cite them by `R<N>`.*

<!-- AUTO-TOC:START -->

## Topics in this Folder

*Auto-generated by `scripts/spec-hygiene/11-generate-auto-toc.mjs` — do not edit by hand inside the AUTO-TOC sentinels.*

| # | File | Title | Lines |
|---|------|-------|-------|
| 1 | [`00-overview-condensed.md`](./00-overview-condensed.md) | Condensed Overview — `spec/02-coding-guidelines/` (P11) | 281 |
| 2 | [`01-cross-language/`](./01-cross-language/00-overview.md) | 01 — Cross-Language Coding Guidelines | subfolder |
| 3 | [`02-typescript/`](./02-typescript/00-overview.md) | 02 — TypeScript Standards | subfolder |
| 4 | [`03-golang/`](./03-golang/00-overview.md) | 03 — Golang Standards | subfolder |
| 5 | [`04-php/`](./04-php/00-overview.md) | 04 — PHP Standards | subfolder |
| 6 | [`05-rust/`](./05-rust/00-overview.md) | 05 — Rust Coding Standards | subfolder |
| 7 | [`06-ai-optimization/`](./06-ai-optimization/00-overview.md) | 06 — AI Optimization | subfolder |
| 8 | [`07-csharp/`](./07-csharp/00-overview.md) | 07 — C# Coding Standards | subfolder |
| 9 | [`08-file-folder-naming/`](./08-file-folder-naming/00-overview.md) | 08 — File & Folder Naming Conventions | subfolder |
| 10 | [`09-powershell-integration/`](./09-powershell-integration/00-overview.md) | 09 — PowerShell Integration | subfolder |
| 11 | [`10-research/`](./10-research/00-overview.md) | 10 — Research | subfolder |
| 12 | [`11-security/`](./11-security/00-overview.md) | 11 — Security Guidelines | subfolder |
| 13 | [`22-app-issues/`](./22-app-issues/00-overview.md) | 22 — App Issues | subfolder |

<!-- AUTO-TOC:END -->

---

## Purpose

Consolidated coding standards and conventions organized by category. This folder is the **single canonical location** for all language-specific and cross-language coding guidelines, including file naming, security policies, database design conventions, PowerShell integration, and research.

---

> 🔴 **MANDATORY — AI Agents Must Commit These Rules to Memory**
>
> After reading this coding guideline, you **MUST** internalize the following rules and apply them to **every single code change** without exception. Do not proceed with implementation until you have understood and committed these to your working memory:
>
> 1. **Error Management is the #1 priority** — Error handling from [03-error-manage/](../03-error-manage/00-overview.md) must be implemented from the **very first line of code**. Never write business logic without proper error handling wrapping it. This is non-negotiable.
> 2. **Boolean naming** — All booleans use `is`/`has`/`should` prefixes and are **positively named only** (`IsActive`, never `IsDisabled`). Extract multi-part conditions into named variables.
> 3. **if/else and nesting** — Zero nesting. Use early returns and guard clauses. No nested `if` blocks.
> 4. **Database conventions** — Singular table names (`User` not `Users`), PascalCase everywhere, `{TableName}Id` as `INTEGER PRIMARY KEY AUTOINCREMENT`, FK uses the exact PK name. See [Database Conventions](../04-database-conventions/00-overview.md).
> 5. **Never hallucinate** — If a requirement is unclear or missing, **ask a clarifying question** instead of guessing. Wrong assumptions cause rewrites.
> 6. **Function metrics** — Functions: 8–15 lines. Files: < 300 lines. React components: < 100 lines.
>
> These rules are **CODE RED** — violations are treated as bugs and must be fixed before merge.

---

## ⚠️ Naming Convention Policy — AI Critical Instruction

```
STOP — EVERY AI AGENT MUST READ THIS SECTION BEFORE GENERATING CODE.

This project uses a HYBRID naming convention strategy. Most languages follow the
project-wide PascalCase mandate. Rust is an INTENTIONAL EXCEPTION.

╔══════════════════════════════════════════════════════════════════════╗
║  LANGUAGE         IDENTIFIER CONVENTION         DATABASE    ENUM   ║
║                                                 COLUMNS    VALUES  ║
╠══════════════════════════════════════════════════════════════════════╣
║  Go               PascalCase (exported)         PascalCase PascalCase ║
║  TypeScript        PascalCase (keys/values)      PascalCase PascalCase ║
║  PHP               PascalCase (keys/values)      PascalCase PascalCase ║
║  C#                PascalCase (methods/props)     PascalCase PascalCase ║
║  Rust              snake_case (community std)     PascalCase PascalCase ║
╚══════════════════════════════════════════════════════════════════════╝

KEY INSIGHT:
- Go, TypeScript, PHP, C# → PascalCase is the DEFAULT for identifiers, keys, JSON.
- Rust → snake_case is the DEFAULT per community conventions (RFC 430).
- ALL LANGUAGES (including Rust) → PascalCase for DATABASE and ENUM STRING VALUES.

WHY RUST IS DIFFERENT:
Rust's compiler enforces snake_case for functions/variables via lint warnings.
Fighting the compiler and ecosystem to force PascalCase is impractical.
Instead, Rust follows its community standard EXCEPT at cross-system boundaries
(database and enum serialization) where PascalCase is mandatory for interop.

WHEN GENERATING RUST CODE:
- Functions → snake_case:        fn get_active_window()
- Variables → snake_case:        let session_id = 42;
- Constants → SCREAMING_SNAKE:   const MAX_RETRIES: u32 = 3;
- Types/Enums → PascalCase:      struct BrowserActivity (Rust standard)
- DB columns → PascalCase:       "SELECT SessionId FROM Session"
- Enum strings → PascalCase:     "TabChange" (serde default for PascalCase variants)
- JSON keys → PascalCase:        #[serde(rename_all = "PascalCase")]

WHEN GENERATING Go/TS/PHP/C# CODE:
- Follow the PascalCase mandate from 01-cross-language/11-key-naming-pascalcase.md
- Database columns → PascalCase (same as Rust)
- Enum values → PascalCase (same as Rust)

See 05-rust/01-naming-conventions.md for the complete Rust naming reference.
See 01-cross-language/11-key-naming-pascalcase.md for the general PascalCase mandate.
```

---

## ⚠️ Numbering Convention — AI Instruction

```
IMPORTANT — AI INSTRUCTION:

1. Folders 01–20 are RESERVED for core fundamentals only.
   - Language standards, cross-cutting principles, naming, security, database, integrations, research.
   - No app-specific content may appear in this range.

2. Folders 21+ are for APP-SPECIFIC content.
   - 21-app: Application feature specs, workflows, architecture decisions.
   - 22-app-issues: App bug analysis, root cause analysis, fix documentation.

3. Decision guide for placement:
   - Reusable, foundational, or principle-driven → 01–20 (core fundamentals)
   - Exploratory, comparative, or evaluative → 10-research
   - App feature or workflow definition → 21-app
   - App bug/failure/root cause analysis → 22-app-issues

4. New core fundamental folders use the next available number within 01–20.
5. New app folders use the next available number after 22.
```

---

## Categories

### Core Fundamentals (01–20)

#### Language & Cross-Language Standards

| # | Category | Description | Files |
|---|----------|-------------|-------|
| 01 | [Cross-Language](./01-cross-language/00-overview.md) | Language-agnostic rules: DRY, naming, booleans, typing, complexity, lazy eval, regex, mutation, null safety, nesting, slugs | 29 |
| 02 | [TypeScript](./02-typescript/00-overview.md) | TypeScript enum patterns, type safety, promise/await patterns | 13 |
| 03 | [Golang](./03-golang/00-overview.md) | Go coding standards, enum specification, boolean rules, defer, internals, severity | 16 |
| 04 | [PHP](./04-php/00-overview.md) | PHP coding standards, enums, forbidden patterns, naming, spacing/imports, ResponseKeyType | 12 |
| 05 | [Rust](./05-rust/00-overview.md) | Rust standards: naming, error handling, async, memory safety, FFI | 10 |
| 06 | [AI Optimization](./06-ai-optimization/00-overview.md) | Anti-hallucination rules, AI quick-reference checklist, common AI mistakes, enum naming reference | 8 |
| 07 | [C#](./07-csharp/00-overview.md) | C# standards: naming, method design, error handling, type safety | 5 |

#### Infrastructure & Convention Standards

| # | Category | Description | Files |
|---|----------|-------------|-------|
| 08 | [File & Folder Naming](./08-file-folder-naming/00-overview.md) | Per-language file and folder naming conventions (PHP/WordPress, Go, TS/JS, Rust, C#) | 7 |
| 09 | [PowerShell Integration](./09-powershell-integration/00-overview.md) | PowerShell scripting conventions and cross-platform automation | 0 |
| 10 | [Research](./10-research/00-overview.md) | Comparative studies, technology evaluations, exploratory technical notes | 0 |
| 11 | [Security](./11-security/00-overview.md) | Security policies, dependency pinning (Axios), vulnerability tracking | 6 |
| 12–20 | _Reserved_ | Available for future core fundamental topics | — |

### App-Specific (21+) — moved out of this folder

The app-specific subfolders (`21-app/`, `23-app-database/`, `24-app-design-system-and-ui/`) were removed during the 2026-04-18 audit (issues I-02/I-03/I-04). Canonical locations:

| Topic | Canonical location |
|-------|--------------------|
| App features, workflows, architecture | `spec/31-app/01-features/` |
| App design system & UI | `spec/32-ui-design/` |
| App database (per-app schemas) | `spec/04-database-conventions/` (general) + per-app folders |
| App bug analysis | [22-app-issues/](./22-app-issues/00-overview.md) (kept — has real content) |

---

## Consolidation Status

✅ **Complete.** All unique content from 5 legacy sources has been merged into this canonical location.

---

## Migration History

| Date | Change |
|------|--------|
| 2026-04-16 | **Flattened structure** — removed nested `03-coding-guidelines-spec/` folder, moved all subfolders to root level |
| 2026-04-09 | Restructured: 09→PowerShell, 10→Research, 09-security→11, 10-database→12, added 21-app, 22-app-issues |
| 2026-04-02 | Added `10-database-conventions/` (8 files: schema design, ORM, views, testing, REST API format) |
| 2026-04-02 | Added `09-security/` and moved Axios version control from `spec/01-app/` |
| 2026-04-02 | Added `08-file-folder-naming/` (per-language conventions) |
| 2026-04-02 | Added `28-slug-conventions.md` to cross-language |
| 2026-03-31 | Consolidated 5 guideline sources into this canonical location |

---

## Document Inventory

| File | Description |
|------|-------------|
| [consolidated-review-guide/00-overview.md](./consolidated-review-guide/00-overview.md) | Full code review guide with examples (all languages) — split into 16 files |
| [consolidated-review-guide-condensed.md](./consolidated-review-guide-condensed.md) | One-liner bullet-point checklist for quick scanning |
| 97-acceptance-criteria.md | Testable criteria across guideline categories |
| 99-consistency-report.md | Module health and file inventory |

---

## Cross-References

- [Spec Authoring Guide](../01-spec-authoring-guide/00-overview.md)
- [Error Management](../03-error-manage/00-overview.md) — **Highest priority spec. Read first.**
- [Database Conventions](../04-database-conventions/00-overview.md) — Naming, schema, key design

---

*Coding guidelines v1.1.0 — 2026-04-16*

---

## Related

**See also:**

- [`../00-overview.md`](../00-overview.md) — Parent overview
- [`97-acceptance-criteria.md`](./97-acceptance-criteria.md) — Acceptance criteria

---

## 🔖 ADR Backlinks (P46)

Coding guideline rules in this section are load-bearing because they are ratified by:

- **[ADR-0002 — WordPress plugin + PHP 8.1+ + SQLite](../00-adrs/0002-wp-plugin-php-sqlite-backend.md)** (`Accepted` 2026-04-28) — anchors the PHP 8.1+ floor, SQLite-flavoured DDL, and the WP-plugin folder skeleton conventions referenced from this section.
- **[ADR-0001 — Singular DDL vs plural prose](../00-adrs/0001-singular-ddl-vs-plural-prose.md)** (`Accepted` 2026-04-28) — anchors the singular-PascalCase identifier rule that all guideline examples assume.

Strict-TS rules (zero `any`, max 3 params, no nested `if`s, 15-line logic limit, pure positive guard clauses) and the SQLite naming rules **MUST NOT** be relaxed without a new ADR superseding the relevant one. See [`spec/00-adrs/00-overview.md`](../00-adrs/00-overview.md).
