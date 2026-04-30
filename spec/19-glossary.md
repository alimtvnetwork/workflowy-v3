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

## ADR-0023..0028 Runtime Vocabulary (added 2026-04-30)

These terms are load-bearing in the seven post-v7 ADRs and are referenced from `mem://index.md` Core rules. Each definition cites its authoritative ADR; conflicts MUST be resolved in favour of the ADR.

| Term | Definition | Authoritative ADR |
|------|-----------|-------------------|
| **Loader↔queue contract** | The two-sided runtime invariant for client-side data flow: (1) route loaders MUST read from the local IndexedDB mirror only (≤16 ms p95, never network); (2) state-mutating actions MUST write the mirror update AND insert a queue row in **one IndexedDB transaction**; (3) the queue worker is the **sole egress** to network. Test fixtures: `G-23-LOADER-NO-FETCH`, `G-23-MIRROR-QUEUE-ATOMIC`, `G-23-WORKER-SOLE-EGRESS`. | ADR-0023 |
| **Local mirror** | The per-tab IndexedDB read-side cache that mirrors server state for all routes the user has visited. Loaders read from it directly. Updated by (a) optimistic component writes inside the loader↔queue tx, (b) queue-worker confirmations, (c) SSE read-signals triggering loader revalidation. NEVER backed by localStorage (ADR-0021). | ADR-0023, ADR-0021 |
| **Queue worker** | A singleton Web Worker (one per tab) that polls the IndexedDB queue table, posts mutations to the WP-Plugin REST API, applies LWW conflict resolution, and deletes confirmed rows. Sole network egress. Backoff = exponential, max 30 s. Queue is **unbounded** (ADR-0021). | ADR-0023 |
| **ClientMutationId** | Branded `string` (per ADR-0020) generated client-side at mutation enqueue time. Used for idempotent retry: server MUST treat duplicate `ClientMutationId` values as the same mutation and return the original outcome. Format: ULID. | ADR-0023, ADR-0020 |
| **Undo cap (100)** | The in-memory undo stack per-tab is capped at 100 entries. Eviction = FIFO (oldest discarded). The cap is in-memory only — it does NOT bound the IndexedDB queue, which is unbounded for offline durability. | ADR-0021 |
| **Offline queue (unbounded)** | The IndexedDB `Queue` table has NO size cap — it MUST grow to accommodate any offline session length. localStorage is forbidden as a queue backing store (size-limit + sync-API). | ADR-0021 |
| **LWW tiebreak** | "Last Write Wins" conflict resolution: when two clients mutate the same field, the server-side `UpdatedAtUnix` (millisecond) selects the winner. Tie-break on equal timestamps = lexicographic compare of `OwnerId`. The loser's mutation is discarded; client receives `Code:"E_LWW_LOSER"` envelope error and the winning row in `Attributes.WinningRow`. Canonical comparator: `G-26-LWW-CANONICAL-COMPARATOR`. | ADR-0024 |
| **Peer group** | The Workflowy-parity model for mirrors: a `PeerGroup` row groups N node-rows that all share content. Editing any peer propagates to all. Mirror is a **relation, NOT an itemType**. **Detach** dissolves singleton groups (group of 1 → group of 0 → row deleted). | ADR-0024 |
| **Singleton dissolution** | When a peer group reaches 1 member (via detach or peer deletion), the group row itself MUST be deleted in the same transaction — no orphan singleton groups may persist. Gate: `G-24-NO-SINGLETON-GROUPS`. | ADR-0024 |
| **SSE read-signal** | An SSE frame is a **read trigger**, NOT a write. It causes affected loaders to revalidate (re-read the mirror after the queue worker has applied the change). SSE frames MUST NOT enqueue to the FIFO mutation queue — that would create a write-loop. Gate: `G-25-SSE-NEVER-ENQUEUES`. | ADR-0025 |
| **Last-Event-ID replay** | SSE clients send `Last-Event-ID: <ServerSeq>` on reconnect. Server replays all ring-buffer rows with `ServerSeq > Last-Event-ID` in order. If the requested seq is older than the ring's oldest row → cold gap. | ADR-0025, ADR-0027 |
| **Cold gap** | The condition where a reconnecting SSE client's `Last-Event-ID` is **lower than `MIN(ServerSeq)` in the ring buffer** (i.e., the missed events have aged out via the 300 s TTL reaper). Server response: emit exactly **one** `event: resync` frame and close. Client response: full mirror reload via REST + fresh SSE reconnect. AT: `G-27-COLD-GAP-RESYNC`. | ADR-0027 |
| **Ring buffer (SseRing)** | The shared SQLite table backing SSE fan-out across PHP-FPM workers. WAL mode mandatory. Schema: `(ServerSeq INTEGER PK AUTO, PageId, Event, Payload JSON, CreatedAtUnix)`. TTL = 300 s; reaper runs every 60 s. Producer contract: every state-mutating REST handler MUST `INSERT INTO SseRing` in the **same transaction** that writes the domain table. Gate: `G-27-PRODUCER-COMPLETENESS`. | ADR-0027 |
| **ServerSeq** | Strictly monotonically increasing per-host integer assigned by SQLite `AUTOINCREMENT` on `SseRing` insert. Gaps from rolled-back transactions are tolerated; reordering is not. The wire `id:` field of every SSE frame equals `ServerSeq`. | ADR-0027 |
| **TTL reaper** | A single shared cron job that deletes `SseRing` rows where `CreatedAtUnix < (now - 300)`. Runs every 60 s. AT: `G-27-RING-TTL-300S` (asserts purge of 1000 stale rows in <500 ms). | ADR-0027 |
| **Producer completeness** | The static-analysis invariant requiring every REST handler that mutates `Items`, `Mirrors`, `Favorites`, or `Trash` to also `INSERT INTO SseRing` in the same transaction. PHPStan custom rule enforces; offenders fail CI. Gate: `G-27-PRODUCER-COMPLETENESS`. | ADR-0027 |
| **Detection chain (5-tier)** | The ordered locale resolver in `detector.ts`: (1) URL `?locale=`, (2) authenticated user's `OwnerSettings.PreferredLocale` via REST, (3) IndexedDB `i18nLocale` key (NOT localStorage — ADR-0021), (4) `navigator.language` + `navigator.languages[]` with regional→language fold, (5) hard fallback `'en'`. First match in `SUPPORTED_LOCALES` wins. p95 ≤5 ms. AT: `G-28-DETECTION-ORDER`. | ADR-0028 |
| **Regional → language fold** | Locale normalization step where `de-CH`, `de-AT`, `de-DE` all fold to `de` if `de` ∈ `SUPPORTED_LOCALES` and the regional variant is not. Applied during tier 4 (navigator) of the detection chain. | ADR-0028 |
| **Fallback chain (i18n)** | Per-key resolution order at `t(key)` call time: (1) requested regional locale JSON, (2) requested language JSON, (3) default-language (`en`) JSON, (4) `DEFAULT_KEY` literal `"???"`. Missing key in production MUST log to `errorStore` with `Code:"i18n.missing_key"`. AT: `G-28-FALLBACK-CHAIN`. | ADR-0028 |
| **RTL locale** | A `SupportedLocale` value present in `RTL_LOCALES = ['ar', 'he', 'fa', 'ur']`. When detected, app MUST set `document.documentElement.dir = 'rtl'` BEFORE first paint. CSS MUST use logical properties only (`margin-inline-start` not `margin-left`); enforced by `G-12-LOGICAL-MARGINS-PADDING` / `G-12-LOGICAL-INSET` / `G-12-LOGICAL-TEXT-ALIGN`. AT: `G-28-RTL-DIR-ATTR`. | ADR-0028, ADR-0012 |
| **Logical CSS properties** | The Tailwind v4 / native CSS rule that all directional spacing and alignment MUST use logical properties (`-inline-start/-end`, `-block-start/-end`, `text-align: start/end`) rather than physical (`-left/-right/-top/-bottom`, `text-align: left/right`). Enables RTL without per-component overrides. Originally raised as `G-28-NO-PHYSICAL-*`; superseded by `G-12-LOGICAL-*` (lives at the styling-system authority, not duplicated at the i18n authority). | ADR-0012 §D7 |
| **Typed i18n keys** | TypeScript module augmentation pattern that types the `t()` function's first argument as a string-literal union of all known keys. `tsc --noEmit` fails on unknown keys. Generated from `locales/en/*.json` at build time. Gate: `G-28-TYPED-KEYS`. | ADR-0028 |
| **Branded ID** | A nominal type pattern: `type ItemId = string & { readonly __brand: unique symbol }`. Raw `string` values cannot be assigned to `ItemId` without going through the sanctioned parser (`parseItemId(raw): ItemId`). Eliminates ID-mixup bugs at compile time. Coverage: `ItemId`, `OwnerId`, `SortOrder`, `PeerGroupId`, `ClientMutationId`. Sole sanctioned cast site: `envelope.types.ts`. Gate: `G-CON-02-TYPES-BRANDED-IDS`. | ADR-0020 |
| **SortOrder (fractional index)** | Base-62 lexicographic string used for sibling ordering. Inserting between siblings `a0` and `a1` produces `a0V` (or any string ordered between them). Never a number. Comparator = standard string compare. Algorithm: `spec/00-adrs/0016-sortorder-fractional-string.md` §D3 (Cormen Ch. 12 RB-tree-style midpoint generation). Gate: `G-16-SORTORDER-IS-STRING`. | ADR-0016 |
| **Envelope (response)** | The mandatory PascalCase JSON shape returned by every WP-Plugin REST endpoint: `{Status, Attributes, Results, Navigation, Errors, MethodsStack}`. First three are mandatory (always present); last three are omit-never-null (omit the key entirely when empty, never serialize as `null`). Contract trifecta: JSON Schema + OpenAPI + TypeScript peers (GAP-CON-01/02). Gate: `G-CON-02-TYPES-PASCALCASE`. | ADR-0004, ADR-0019 |
| **Named error boundary** | One of the 8 React `ErrorBoundary` components scoped to a specific subtree (`AppErrorBoundary`, `RouteErrorBoundary`, `EditorBoundary`, `BoardBoundary`, `DashboardBoundary`, `SidebarBoundary`, `AuthErrorBoundary`, `ModalBoundary`). A single top-level boundary is forbidden — it forces full-app remount on any subtree error. Gate: `G-17-NAMED-BOUNDARIES`. | ADR-0017 |

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

*Glossary v1.3.0 — 2026-04-30: Added ADR-0023..0028 Runtime Vocabulary section (26 terms: loader↔queue contract, local mirror, queue worker, ClientMutationId, undo cap, offline queue, LWW tiebreak, peer group, singleton dissolution, SSE read-signal, Last-Event-ID replay, cold gap, ring buffer, ServerSeq, TTL reaper, producer completeness, detection chain, regional-language fold, fallback chain, RTL locale, logical CSS, typed i18n keys, branded ID, SortOrder, envelope, named error boundary). Closes GAP-AMB-03b.*

*Glossary v1.2.0 — 2026-04-30: Added Forbidden Vague Modifiers table (closes GAP-AMB-02 + collapses GAP-AMB-01-tail enforcement path; F-SPEC-14 now has normative substitution table + grandfather rule).*
