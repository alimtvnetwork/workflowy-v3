# Glossary — Cross-Spec Terminology SSOT

> **Version:** 1.1.0
> **Updated:** 2026-04-26
> **Status:** Active
> **Purpose:** Single source of truth for every recurring term, acronym, and named concept across the spec/ directory.

This file is the canonical reference for terminology. When a term is used in any spec file with a meaning specific to this codebase, it must be defined here first. New AI sessions and contributors should consult this file before introducing alternative phrasings.

---

## Naming Conventions

| Term | Definition |
|------|-----------|
| **camelCase** | First word lowercase, subsequent words capitalised (e.g., `pluginSlug`). Mandatory for all variable names, function arguments, log context keys (PHP/Go/TS). |
| **PascalCase** | All words capitalised (e.g., `PluginSlug`). Mandatory for class names, type names, exported Go identifiers, **all DB table & column names**, and enum constant names. |
| **snake_case** | Words separated by underscores (e.g., `plugin_slug`). **PROHIBITED** project-wide except inside protocol-driven enums (HTTP headers, content types, etc.) and WordPress hook callbacks. |
| **kebab-case** | Words separated by hyphens (e.g., `plugin-slug`). Used only for URL slugs, file names, CSS classes, and directory names. |
| **SCREAMING_SNAKE_CASE** | All uppercase with underscores. Reserved for compile-time constants in PHP only (e.g., `class-level const FATAL_TYPES`). |

---

## Architecture Tiers

| Term | Definition |
|------|-----------|
| **Tier 1 — Delegated Server** | Any downstream service the Go backend proxies to (PHP/WordPress plugin, Node.js microservice, Chrome extension, etc.). Returns structured JSON errors with stack traces. |
| **Tier 2 — Go Backend** | Central API layer. Wraps every error in `apperror`, builds `DelegatedRequestServer` blocks, manages session-based logging. |
| **Tier 3 — Frontend** | React/TypeScript UI. Captures errors via Zustand `errorStore.ts`, renders Global Error Modal with 7 diagnostic tabs. |
| **Universal Response Envelope** | Standardised JSON shape returned by every Tier-2 endpoint: `{ Status, Data, Errors, Attributes, MethodsStack }`. |
| **DelegatedRequestServer** | v2.0.0 structured block injected into the envelope when a Tier-1 request fails (≥400). Captures endpoint, method, status, request body, response, stack trace, additional messages. |

---

## Error Handling Vocabulary

| Term | Definition |
|------|-----------|
| **`apperror`** | Go package providing typed result wrappers: `Result[T]`, `ResultSlice[T]`, `ResultMap[K,V]`. Every service method must return one. Forbids raw `(T, error)` tuples and `fmt.Errorf` for cross-boundary errors. |
| **`safeExecute`** | PHP wrapper around every REST endpoint handler. Catches `Throwable` (not just `Exception`) and returns a structured envelope. |
| **Error Code Range** | Numeric range (E1000–E9999) categorising errors by domain (network, validation, infrastructure, etc.). See `03-error-manage/02-error-architecture/01-error-handling-reference/05-error-codes-and-fallbacks.md`. |
| **Session ID** | UUID assigned to every HTTP request. Links frontend errors to backend session logs at `backend/data/request-sessions/{date}/{hour}/{uuid}.json`. |
| **Dedup Hash** | MD5 of `action + siteId + plugin + endpoint + statusCode + responseBody`. Suppresses identical error log entries. Cleared via Settings button. |
| **Global Error Modal** | Frontend modal with 7 tabs (Overview, Log, Execution, Stack, Session, Request, Traversal). Auto-fetches session diagnostics when `sessionId` present. |

---

## Coding Standards Vocabulary

| Term | Definition |
|------|-----------|
| **EXEMPTED annotation** | `// EXEMPTED: <reason> (§7.2)` comment marking the single permitted location for a type assertion. Required at every cast boundary; forbidden in business logic. |
| **`CastOrFail[T]`** | Centralised generic cast utility in `pkg/typecast/`. Returns `apperror.Result[T]` on failure. All cast/conversion in business logic must go through it. |
| **Positive guard clause** | Early return on the failure condition using a positive boolean (e.g., `if user.IsInvalid() { return }`) instead of nested `if user.IsValid() { ... }`. Mandatory project-wide. |
| **`IsXMissing()` / `IsXAbsent()`** | Positive counterpart of `IsX()`. Required when `!IsX()` is used 2+ times. Eliminates raw `!` operator from business logic. |
| **15-line logic limit** | Maximum body length for a single function before extraction is required. Excludes signature, braces, and comments. |
| **3-parameter limit** | Maximum positional parameters per function. Beyond 3, parameters must be one-per-line (Rule 9a) or moved into a typed struct. |
| **Zero `any`/`interface{}`** | No `any`, `interface{}`, `map[string]any` in exported APIs. Permitted only at SQL args, logger fields, and third-party library boundaries. |
| **Zero magic strings** | Every domain string must reference an enum case via `EnumType::Case->value` (PHP) or `EnumType.Case` (Go/TS). Hardcoded `"success"`, `"all"`, etc. are prohibited. |

---

## Database Vocabulary

| Term | Definition |
|------|-----------|
| **Root DB** | Shared SQLite database storing cross-site data (sites, agents, snapshots index). |
| **Per-site DB** | Per-WordPress-site SQLite database storing site-scoped data (transactions, plugin state). |
| **`TableType` enum** | PHP enum whose values exactly match PascalCase SQLite table names (e.g., `Items`, `Mirrors`, `Comments`). |
| **`LogColumnType` enum** | Type-safe column-name accessor for logging tables. |
| **V13 Migration** | Schema migration that renamed all snake_case tables/columns to PascalCase. See `02-coding-guidelines/01-cross-language/01-issues-and-fixes-log/02-database-casing.md`. |
| **PHP micro-ORM** | Minimal PHP query helper in the WP-plugin runtime. Provides `Insert`, `Update`, `Upsert`, `Select` with PascalCase column binding. |

> **Normative DB-casing rule (SSOT — resolves AUDIT-02):**
> All SQLite table names, column names, and JSON keys representing rows are **PascalCase** (e.g., `Items.ItemType`, `Items.ParentId`, `Items.CompletedAt`, `Items.SortOrder`, `Items.DueDate`).
> Any spec file showing snake_case identifiers (`items.item_type`, `items.parent_id`, `completed_at`, `sort_order`, `due_date`, `user_id`, `plugin_slug`, `item_tags`, `source_id`, etc.) is **stale** and tracked under **AUDIT-02a — Downstream column-name rename** in `spec/18-spec-issues/`. PascalCase wins on every conflict.

---

## Frontend Vocabulary

| Term | Definition |
|------|-----------|
| **Node** (WorkFlowy) | Unified item interface: `{ id, parentId, content, itemType }`. Every outliner item — bullet, todo, h1/h2/h3, paragraph, numbered, board, dashboard, quote, code, divider — is a Node. A **Mirror** is a separate concept (a row in the `Mirrors` table) and is NOT a Node `itemType`. |
| **itemType** | Enum field on Node. Exactly 12 values: `bullet`, `h1`, `h2`, `h3`, `paragraph`, `todo`, `numbered`, `board`, `dashboard`, `quote`, `code`, `divider`. Authoritative SSOT: [`spec/20-enums-index.md`](./20-enums-index.md) §3.5. **Note:** `mirror` is intentionally NOT a value — see [`spec/18-spec-issues/07-audit-03-dashboard-taxonomy.md`](./18-spec-issues/07-audit-03-dashboard-taxonomy.md). |
| **Mirror** | Linked instance of an existing Node. Edits propagate to all mirrors of the source. |
| **Zoom** | Focus mode that treats a single Node as the temporary root. Drives `/item/:id` URL routing and breadcrumbs. |
| **Fractional sort key** | String-based ordering key (e.g., `a0`, `a0V`) allowing infinite insertion between siblings without re-numbering. |
| **250-item view limit** | Hard cap on visible Nodes per single zoom level. Triggers virtualisation at ≥1000 total descendants. |
| **errorStore** | Zustand store at `src/stores/errorStore.ts`. Centralises every captured error; backs the Global Error Modal. |

---

## Spec-System Vocabulary

| Term | Definition |
|------|-----------|
| **00-overview.md** | Required entry point of every spec subfolder. Contains topic index + cross-references. |
| **97-acceptance-criteria.md** | Testable acceptance criteria for the section, with stable IDs (`AT-<SECTION>-NN`). |
| **99-consistency-report.md** | Audit log for the section: contradictions found, fixes applied, residual debt. |
| **AUD-L-01** | Audit rule: no spec file may exceed 800 lines (target: <400 lines per file). Files breaching the cap must be split into a numbered subfolder. |
| **Spec hygiene checks** | 8 Node scripts under `scripts/spec-hygiene/` validating link integrity, file length, feature shape, contract maps, etc. Run via `00-run-all.mjs`. |

---

## Forbidden Vague Modifiers — Normative Substitutes

**Status:** NORMATIVE. Enforced by hygiene gate `G-LINT-VAGUE-MODIFIERS` (registry §15). Files MUST replace each forbidden term with a measurable substitute or an explicit cross-reference to a SLA/budget/ADR. Bare prose use is a hygiene-gate failure.

| Forbidden Term | Why Forbidden | Required Substitute |
|---|---|---|
| **appropriate** | Subjective; no audit handle | Cite ADR or SLA: e.g. "per ADR-0023 (≤16 ms p95 loader)" |
| **reasonable** | Subjective | State the numeric bound: "≤200 ms", "≤5% CPU", "≤100 items" |
| **fast** | Subjective | State p50/p95/p99 latency budget |
| **efficient** | Subjective | State throughput target: "≥1000 ops/s", "O(log n)" |
| **proper** | Subjective | Cite the rule: "per coding-guideline §X" or "per ADR-NNNN" |
| **suitable** | Subjective | Same as *appropriate* |
| **good / better / nice** | Subjective | Replace with measurable comparison or remove |
| **optimal** | Subjective; usually false | State the algorithm class ("Cormen Ch. 12 RB-tree") or measured budget |
| **robust** | Subjective | Cite failure modes covered: "handles network partition + LWW conflict per ADR-0024" |
| **scalable** | Subjective | State scale envelope: "tested to 10⁶ nodes, 250-item view cap" |
| **secure** | Subjective | Cite STRIDE category and mitigation ADR |
| **simple / clean / elegant** | Subjective | Remove or replace with measurable code metric (cyclomatic ≤10, LOC ≤15) |
| **modern** | Time-relative; rots | State concrete tech version: "ES2023", "React 19", "PHP 8.1+" |
| **handle gracefully** | Vague error contract | Cite error code from `spec/03-error-manage/.../05-response-envelope/` |
| **as needed / if needed** | Subjective trigger | State precondition: "when X > Y", "when ItemId.parse() throws" |

**Exemption process:** A file may use a forbidden term inside a quoted requirement, audit finding, or third-party API name by wrapping the offending word in backticks and adding `<!-- vague-exempt: <reason> -->` on the same line. The hygiene gate skips backtick-wrapped occurrences.

**Resolution path for legacy occurrences:** Tracked under `F-SPEC-14` in `spec/AUDIT-FINDINGS-LEDGER.md`. Bind sweeps proceed batch-wise; pre-commit hook blocks NEW occurrences from 2026-04-30 forward (`G-LINT-VAGUE-MODIFIERS` enforcing-mode = `block-new`, `warn-existing`).

---

## Cross-References

- [Coding Guidelines](./02-coding-guidelines/00-overview.md)
- [Error Handling Reference](./03-error-manage/02-error-architecture/01-error-handling-reference/00-overview.md)
- [Issues & Fixes Log](./02-coding-guidelines/01-cross-language/01-issues-and-fixes-log/00-overview.md)
- [Casting Elimination Patterns](./02-coding-guidelines/01-cross-language/03-casting-elimination-patterns/00-overview.md)
- [Enums Index](./20-enums-index.md)
- [Audit Findings Ledger — F-SPEC-14](./AUDIT-FINDINGS-LEDGER.md)
- [Gate Registry — G-LINT-VAGUE-MODIFIERS](./_GATE-REGISTRY.md)

---

*Glossary v1.2.0 — 2026-04-30: Added Forbidden Vague Modifiers table (closes GAP-AMB-02 + collapses GAP-AMB-01-tail enforcement path; F-SPEC-14 now has normative substitution table + grandfather rule).*
