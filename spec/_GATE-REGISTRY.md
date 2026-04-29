# Gate Registry — Master Index of `G-*` Compliance Gates

> **Version:** 1.7.11  
> **Updated:** 2026-04-29 — **batch-14 prose→AT migration:** registered 7 new `G-13-*` sub-gates in **ADR-0013** section (`-OVERVIEW-ARCHETYPE-EMIT`, `-DAG-EXACT-MIRROR`, `-BRANCH-PROTECTION-MIRROR`, `-SIGN-REQUIRED-ON-TAG`, `-ANTIPATTERN-COMPLIANCE`, `-FIXTURE-STRING-PARITY`, `-FOLDER-PLACEMENT`) covering all 7 prose-MUSTs in `spec/13-cicd-pipeline-workflows/00-overview.md`. All DOC-NORM tier (gate-table consumers / spec-shape claims). Pre-flight namespace check applied (G-13-* family was already established with 16 sibling gates; no collisions). Prior: 1.7.10 (batch-13 G-ERRCODE-* gates).

- **Total named gates:** 399 (+7 this revision: seven `G-13-*`)
- **WARN-only gates:** 9 (tracked at [`_GATE-GRADUATION-LEDGER.md`](./_GATE-GRADUATION-LEDGER.md))
- **CI:** 79 (unchanged)
- **TEST:** 17 (unchanged)
- **DOC-NORM:** 98 (+7 this revision)
- **DOC:** 202 (unchanged)
- **Areas covered:** 46 (unchanged)
- **Areas covered:** 37 (unchanged)

> ⚠️ **Classifications are heuristic.** Each row links to its primary spec file; promote DOC-NORM → CI/TEST as automation is added by editing this registry.

> 🆕 **2026-04-28 batch (20 new gates):**
> • **ADR-0012 §D7** logical-utility mandate: `G-12-LOGICAL-MARGINS-PADDING` / `G-12-LOGICAL-TEXT-ALIGN` / `G-12-LOGICAL-INSET` (all CI).
> • **ADR-0027** SSE shared ring: `G-27-RING-IS-SQLITE-WAL` / `G-27-PRODUCER-COMPLETENESS` / `G-27-NO-INPROCESS-PUBSUB` / `G-27-NO-EXTERNAL-BROKER` (CI), `G-27-RING-TTL-300S` / `G-27-COLD-GAP-RESYNC` / `G-27-MULTIWORKER-REPLAY` (TEST), `G-27-SERVERSEQ-MONOTONIC` (DOC-NORM).
> • **ADR-0028** i18n: `G-28-LIBRARY-IS-I18NEXT` / `G-28-NO-HTML-IN-JSON` / `G-28-INTL-EXPLICIT-LOCALE` / `G-28-TYPED-KEYS` (CI), `G-28-MISSING-KEY-LOGGED` / `G-28-FALLBACK-CHAIN` / `G-28-RTL-DIR-ATTR` / `G-28-DETECTION-ORDER` (TEST), `G-28-LOCALE-WRITE-VIA-QUEUE` (DOC-NORM). Plus 2 superseded: `G-28-NO-PHYSICAL-MARGINS` and `G-28-NO-PHYSICAL-ALIGN` (folded into the canonical `G-12-LOGICAL-*` gates).

---

## 3. Gate Registry by Area

### ADR-0002

| Gate | Tier | Primary File | Brief |
|------|------|--------------|-------|
| `G-02-CHAIN-MULTILINE` | **DOC** | [`spec/00-adrs/0007-strict-typescript-rules.md`](./00-adrs/0007-strict-typescript-rules.md) | - G-02-CHAIN-MULTILINE — enforces R7. |
| `G-02-MAX-2-BOOL-OPERANDS` | **DOC** | [`spec/00-overview.md`](./00-overview.md) | Enforces ADR-0007 — Strict TypeScript coding rules (R1–R7). |
| `G-02-MAX-3-PARAMS` | **DOC** | [`spec/00-overview.md`](./00-overview.md) | Enforces ADR-0007 — Strict TypeScript coding rules (R1–R7). |
| `G-02-NO-ANY` | **DOC** | [`spec/00-adrs/0007-strict-typescript-rules.md`](./00-adrs/0007-strict-typescript-rules.md) | - G-02-NO-ANY — enforces R1. |
| `G-02-NO-DISABLE` | **CI** | [`spec/02-coding-guidelines/00-overview.md`](./02-coding-guidelines/00-overview.md) | Use // eslint-disable-next-line to silence a hard rule Defeats the gate; bug ships. |
| `G-02-NO-NESTED-IF` | **DOC** | [`spec/00-adrs/0007-strict-typescript-rules.md`](./00-adrs/0007-strict-typescript-rules.md) | G-02-NO-NESTED-IF) have no decision to cite. |
| `G-02-NO-RETURN-TERNARY` | **DOC** | [`spec/02-coding-guidelines/00-overview.md`](./02-coding-guidelines/00-overview.md) | Replace a guard with a ternary that hides early-return intent Reduces readability; breaks line-counter heuristics. Co. |
| `G-02-PAIRED-EXAMPLES` | **DOC** | [`spec/02-coding-guidelines/00-overview.md`](./02-coding-guidelines/00-overview.md) | Cite a rule without both a bad and a good snippet AI consumers can't disambiguate intent. |
| `G-02-POSITIVE-GUARDS` | **DOC** | [`spec/00-adrs/0007-strict-typescript-rules.md`](./00-adrs/0007-strict-typescript-rules.md) | - G-02-POSITIVE-GUARDS — enforces R5. |
| `G-02-RULE-HAS-GATE` | **DOC** | [`spec/02-coding-guidelines/00-overview.md`](./02-coding-guidelines/00-overview.md) | Add a coding rule without a paired automated check Rule rots — humans won't enforce by review alone. |

### ADR-0003

| Gate | Tier | Primary File | Brief |
|------|------|--------------|-------|
| `G-03-CODE-ASCII` | **DOC** | [`spec/03-error-manage/00-overview.md`](./03-error-manage/00-overview.md) | Localize the Code field Codes are machine identifiers; localization belongs in Message. |
| `G-03-CODE-FORMAT` | **DOC** | [`spec/03-error-manage/00-overview.md`](./03-error-manage/00-overview.md) | Codes are UPPER_SNAKE_CASE, ≤ 40 chars. Gate G-03-CODE-FORMAT (regex ^[A-Z][A-Z0-9_]{0,39}$). |
| `G-03-CODE-UNIQUE` | **DOC** | [`spec/03-error-manage/00-overview.md`](./03-error-manage/00-overview.md) | Codes are unique across the entire codebase. Gate G-03-CODE-UNIQUE (grep). |
| `G-03-ENVELOPE-ONLY` | **TEST** | [`spec/03-error-manage/00-overview.md`](./03-error-manage/00-overview.md) | Return a non-envelope body on error (raw string, plain object) Frontend error handler cannot parse uniformly. |
| `G-03-FIELD-CONDITIONAL` | **DOC-NORM** | [`spec/03-error-manage/00-overview.md`](./03-error-manage/00-overview.md) | Field is required when the error references a specific input field; forbidden otherwise. Gate G-03-FIELD-CONDITIONAL. |
| `G-03-MESSAGE-PRESENT` | **DOC-NORM** | [`spec/03-error-manage/00-overview.md`](./03-error-manage/00-overview.md) | Each code MUST have a one-line human message template in errors.messages.<code>. Gate G-03-MESSAGE-PRESENT. |
| `G-03-NO-BARE-THROW` | **CI** | [`spec/03-error-manage/00-overview.md`](./03-error-manage/00-overview.md) | Throw a bare xception / Error without errorCode Caller cannot branch on cause; observability cannot bucket. |
| `G-03-NO-LEAK` | **DOC** | [`spec/03-error-manage/00-overview.md`](./03-error-manage/00-overview.md) | Leak stack traces or SQL into Message Information disclosure; violates security review. |
| `G-03-STATUS-CONSISTENT` | **DOC** | [`spec/03-error-manage/00-overview.md`](./03-error-manage/00-overview.md) | Set Status: "Success" while the Errors array is non-empty Self-contradicting envelope; clients double-render. |
| `G-03-CODE-LOAD-BEARING` | **DOC-NORM** | [`spec/03-error-manage/00-overview.md`](./03-error-manage/00-overview.md) | All `Code` values shown in 00-overview canonical envelopes are load-bearing — fixtures in `97a-acceptance-criteria-fixtures.md` MUST cite these exact strings. Drift forbidden. |
| `G-03-FRONTEND-STATUS-PRIMARY` | **DOC-NORM** | [`spec/03-error-manage/00-overview.md`](./03-error-manage/00-overview.md) | Frontend detection logic MUST use HTTP status codes (2xx) as the primary indicator, NOT response body fields. Cross-ref AT-RESTAPIFORMAT-06..08. |
| `G-03-MIDDLEWARE` | **DOC-NORM** | [`spec/03-error-manage/00-overview.md`](./03-error-manage/00-overview.md) | Central `ErrorMiddleware` MUST: (1) resolve Category from `ErrorCode::categoryOf`; (2) map category → HTTP status; (3) append `RequestId`; (4) strip stack traces unless `WORKFLOWY_DEBUG=1`. |
| `G-03-RETRY-AFTER` | **DOC-NORM** | [`spec/03-error-manage/00-overview.md`](./03-error-manage/00-overview.md) | Only `TransientError` is eligible for client-side retry; the response MUST include `Retry-After` (seconds). Other categories MUST NOT include `Retry-After`. |

### ADR-0004

| Gate | Tier | Primary File | Brief |
|------|------|--------------|-------|
| `G-04-ALIAS-DDL-CANONICAL` | **DOC-NORM** | [`spec/00-adrs/0001-singular-ddl-vs-plural-prose.md`](./00-adrs/0001-singular-ddl-vs-plural-prose.md) | and G-04-ALIAS-DDL-CANONICAL (every alias must map to a real DDL |
| `G-04-ENVELOPE-DEBUG-FLAG` | **DOC** | [`spec/00-adrs/0004-rest-envelope-pascalcase.md`](./00-adrs/0004-rest-envelope-pascalcase.md) | - G-04-ENVELOPE-DEBUG-FLAG — MethodsStack present iff |
| `G-04-ENVELOPE-NO-EMPTY-ERRORS` | **DOC** | [`spec/00-adrs/0004-rest-envelope-pascalcase.md`](./00-adrs/0004-rest-envelope-pascalcase.md) | - G-04-ENVELOPE-NO-EMPTY-ERRORS — Errors key absent on success. |
| `G-04-ENVELOPE-SHAPE` | **DOC** | [`spec/00-adrs/0004-rest-envelope-pascalcase.md`](./00-adrs/0004-rest-envelope-pascalcase.md) | - Anchors gate G-04-ENVELOPE-SHAPE (already drafted in |
| `G-04-ENVELOPE-STATUS-ENUM` | **DOC** | [`spec/00-adrs/0004-rest-envelope-pascalcase.md`](./00-adrs/0004-rest-envelope-pascalcase.md) | - G-04-ENVELOPE-STATUS-ENUM — Status value drawn from the |
| `G-04-ENVELOPE-VALIDATOR` | **DOC** | [`spec/00-overview.md`](./00-overview.md) | [0019](./00-adrs/0019-rest-envelope-optional-keys.md) REST envelope optional keys — omit-never-null, page-based paginat |
| `G-04-ERRORS-FOUR-KEYS-REQUIRED` | **DOC-NORM** | [`spec/00-adrs/0019-rest-envelope-optional-keys.md`](./00-adrs/0019-rest-envelope-optional-keys.md) | - G-04-ERRORS-FOUR-KEYS-REQUIRED — enforces D5 (when present, |
| `G-04-ERRORS-LOCKSTEP` | **DOC** | [`spec/00-overview.md`](./00-overview.md) | [0019](./00-adrs/0019-rest-envelope-optional-keys.md) REST envelope optional keys — omit-never-null, page-based paginat |
| `G-04-FAVORITE-TABLE` | **DOC** | [`spec/00-adrs/00-overview.md`](./00-adrs/00-overview.md) | add new gate G-04-FAVORITE-TABLE, add EP-FAVORITES- endpoints. |
| `G-04-METHODSSTACK-DEBUG-ONLY` | **DOC** | [`spec/00-adrs/0019-rest-envelope-optional-keys.md`](./00-adrs/0019-rest-envelope-optional-keys.md) | - G-04-METHODSSTACK-DEBUG-ONLY — enforces D6/D7 (omitted in |
| `G-04-NAMING` | **DOC** | [`spec/02-coding-guidelines/00-overview.md`](./02-coding-guidelines/00-overview.md) | R9 SQLite tables, columns, and indexes are PascalCase. Tables singular (Item, not Items_tbl). Migration linter G-04-NAM |
| `G-04-NAVIGATION-PAGE-BASED` | **DOC** | [`spec/00-adrs/0019-rest-envelope-optional-keys.md`](./00-adrs/0019-rest-envelope-optional-keys.md) | - G-04-NAVIGATION-PAGE-BASED — enforces D3 (no ?cursor=, |
| `G-04-NAVIGATION-PRESENCE` | **DOC** | [`spec/00-adrs/0019-rest-envelope-optional-keys.md`](./00-adrs/0019-rest-envelope-optional-keys.md) | - G-04-NAVIGATION-PRESENCE — enforces D2 (presence iff |
| `G-04-NESTED-ARRAY-NEVER-NULL` | **DOC** | [`spec/00-adrs/0019-rest-envelope-optional-keys.md`](./00-adrs/0019-rest-envelope-optional-keys.md) | - G-04-NESTED-ARRAY-NEVER-NULL — enforces D9 (any declared |
| `G-04-NESTED-DECLARED-FIELD-PRESENT` | **DOC** | [`spec/00-adrs/0019-rest-envelope-optional-keys.md`](./00-adrs/0019-rest-envelope-optional-keys.md) | - G-04-NESTED-DECLARED-FIELD-PRESENT — enforces D9 (declared |
| `G-04-NO-DDL-PLURALS` | **DOC** | [`spec/00-adrs/0006-migrate-spec-sql-to-singular-ddl.md`](./00-adrs/0006-migrate-spec-sql-to-singular-ddl.md) | 5. Gate G-04-NO-DDL-PLURALS is hereby promoted from |
| `G-04-OPTIONAL-OMIT-NEVER-NULL` | **DOC** | [`spec/00-adrs/0019-rest-envelope-optional-keys.md`](./00-adrs/0019-rest-envelope-optional-keys.md) | - G-04-OPTIONAL-OMIT-NEVER-NULL — enforces D1 (no |
| `G-04-WIRE-PASCALCASE` | **DOC** | [`spec/00-adrs/0019-rest-envelope-optional-keys.md`](./00-adrs/0019-rest-envelope-optional-keys.md) | - Modified gates: G-04-WIRE-PASCALCASE (ADR-0004) clarified |

### ADR-0005

| Gate | Tier | Primary File | Brief |
|------|------|--------------|-------|
| `G-05-ATTACH-ORDER` | **TEST** | [`spec/05-split-db-architecture/00-overview.md`](./05-split-db-architecture/00-overview.md) | - The order is fixed; reordering is a spec violation caught by gate G-05-ATTACH-ORDER (PHPUnit asserts sqlite_master que |
| `G-05-AUDIT-NONBLOCKING` | **DOC-NORM** | [`spec/05-split-db-architecture/00-overview.md`](./05-split-db-architecture/00-overview.md) | audit writes are fire-and-forget — they MUST NOT roll back the parent transaction on failure. Gate G-05-AUDIT-NONBLOCKI |
| `G-05-MIN-TABLES` | **DOC** | [`spec/05-split-db-architecture/00-overview.md`](./05-split-db-architecture/00-overview.md) | Split a domain that owns < 3 tables Overhead (extra ATTACH, extra backup target) exceeds isolation benefit. |
| `G-05-NO-ADHOC-PDO` | **CI** | [`spec/05-split-db-architecture/00-overview.md`](./05-split-db-architecture/00-overview.md) | Open ad-hoc new PDO(...) instead of using DbConnectionPool::for($name) Bypasses pragmas, attach order, and pooling. G. |
| `G-05-NO-RAW-CROSS-JOIN` | **DOC-NORM** | [`spec/05-split-db-architecture/00-overview.md`](./05-split-db-architecture/00-overview.md) | Raw SQL joins across attached schemas are forbidden in handler code. Gate G-05-NO-RAW-CROSS-JOIN (grep: JOIN\s+(usersau |
| `G-05-REGISTRY-COMPLETE` | **DOC** | [`spec/05-split-db-architecture/00-overview.md`](./05-split-db-architecture/00-overview.md) | Omit a new file from wp-plugin/config/db-split.json Orchestrator never attaches it; queries silently target the wrong. |
| `G-05-REPO-COMPOSE` | **DOC-NORM** | [`spec/05-split-db-architecture/00-overview.md`](./05-split-db-architecture/00-overview.md) | Cross-DB reads MUST go through a repository method that performs two queries and joins in PHP. Gate G-05-REPO-COMPOSE. |

### ADR-0006

| Gate | Tier | Primary File | Brief |
|------|------|--------------|-------|
| `G-06-CACHE-INVALIDATE` | **DOC-NORM** | [`spec/06-seedable-config-architecture/00-overview.md`](./06-seedable-config-architecture/00-overview.md) | Cache config without invalidation hook Settings UI changes don't take effect until restart. |
| `G-06-ENV-VIA-REGISTRY` | **DOC** | [`spec/06-seedable-config-architecture/00-overview.md`](./06-seedable-config-architecture/00-overview.md) | Use ENV at runtime via getenv() outside ConfigRegistry Two competing sources of truth. |
| `G-06-IDEMPOTENT` | **TEST** | [`spec/06-seedable-config-architecture/00-overview.md`](./06-seedable-config-architecture/00-overview.md) | Never overwrite a key already present in WorkflowyConfigOverride or WorkflowyConfigUserOverride. Gate G-06-IDEMPOTENT ( |
| `G-06-LOG-INSERT` | **DOC-NORM** | [`spec/06-seedable-config-architecture/00-overview.md`](./06-seedable-config-architecture/00-overview.md) | Inserting a new key from seed MUST log seed.inserted with key + value. Gate G-06-LOG-INSERT. |
| `G-06-NO-IMPLICIT-DELETE` | **DOC-NORM** | [`spec/06-seedable-config-architecture/00-overview.md`](./06-seedable-config-architecture/00-overview.md) | Removing a key from seed/config.json does not remove it from the DB — operators must run wp workflowy config prune. Gat |
| `G-06-NO-SECRETS-IN-SEED` | **DOC** | [`spec/06-seedable-config-architecture/00-overview.md`](./06-seedable-config-architecture/00-overview.md) | Put secrets in seed/config.json Seed file ships in the plugin zip — secrets leak to every install. |
| `G-06-NO-TYPE-DRIFT` | **DOC-NORM** | [`spec/06-seedable-config-architecture/00-overview.md`](./06-seedable-config-architecture/00-overview.md) | Type widening (e.g. int → enum) requires a versioned migration; the seeder MUST refuse to apply it. Gate G-06-NO-TYPE-D |
| `G-06-SCHEMA-PARITY` | **DOC** | [`spec/06-seedable-config-architecture/00-overview.md`](./06-seedable-config-architecture/00-overview.md) | Define a key in seed without a matching ConfigSchema entry Validator silently accepts garbage. |
| `G-06-VIA-REGISTRY` | **CI** | [`spec/06-seedable-config-architecture/00-overview.md`](./06-seedable-config-architecture/00-overview.md) | Read config directly from DB in hot paths Bypasses validator + cache; type drift not caught. |

### ADR-0010

| Gate | Tier | Primary File | Brief |
|------|------|--------------|-------|
| `G-10-CMDLET-BINDING` | **DOC** | [`spec/10-powershell-integration/00-overview.md`](./10-powershell-integration/00-overview.md) | Omit [CmdletBinding(SupportsShouldProcess)] No -WhatIf support; mutations cannot be dry-run. |
| `G-10-ERROR-STOP` | **DOC-NORM** | [`spec/10-powershell-integration/00-overview.md`](./10-powershell-integration/00-overview.md) | Omit $ErrorActionPreference = 'Stop' Non-terminating errors → exit 0 despite failure. |
| `G-10-NO-HARDCODE-PATH` | **DOC** | [`spec/10-powershell-integration/00-overview.md`](./10-powershell-integration/00-overview.md) | Hardcode C:\Program Files\… paths Breaks portable installs; fails on non-default WP layouts. |
| `G-10-NO-IEX` | **DOC** | [`spec/10-powershell-integration/00-overview.md`](./10-powershell-integration/00-overview.md) | Use Invoke-Expression on any input Arbitrary code execution. |
| `G-10-NO-WRITE-HOST` | **DOC** | [`spec/10-powershell-integration/00-overview.md`](./10-powershell-integration/00-overview.md) | Use Write-Host for script output Bypasses stdout — PHP captures nothing, JSON parse fails. |
| `G-10-STDOUT-PURE` | **DOC** | [`spec/10-powershell-integration/00-overview.md`](./10-powershell-integration/00-overview.md) | Mixing JSON and free text on stdout is a hard error caught by G-10-STDOUT-PURE. |
| `G-10-USE-FILE-FLAG` | **CI** | [`spec/10-powershell-integration/00-overview.md`](./10-powershell-integration/00-overview.md) | Build the command line as a string in PHP and pass via -Command PowerShell injection via unescaped item titles. |

### ADR-0011

| Gate | Tier | Primary File | Brief |
|------|------|--------------|-------|
| `G-11-REAPER-AUDIT-ROW` | **DOC** | [`spec/00-overview.md`](./00-overview.md) | [0009](./00-adrs/0009-trash-30-day-retention.md) Trash — 30-day retention, soft-delete, daily reaper at 03:00 UTC, batc |
| `G-11-REAPER-BATCH-1000` | **DOC** | [`spec/00-adrs/0009-trash-30-day-retention.md`](./00-adrs/0009-trash-30-day-retention.md) | - G-11-REAPER-BATCH-1000 — enforces D4 (batch size 1000, |
| `G-11-REAPER-CASCADE-SCOPE` | **DOC** | [`spec/00-adrs/0009-trash-30-day-retention.md`](./00-adrs/0009-trash-30-day-retention.md) | - G-11-REAPER-CASCADE-SCOPE — enforces D5 (descendants + |
| `G-11-REAPER-DAILY-03-UTC` | **DOC** | [`spec/00-adrs/0009-trash-30-day-retention.md`](./00-adrs/0009-trash-30-day-retention.md) | - G-11-REAPER-DAILY-03-UTC — enforces D3 (single deterministic |
| `G-11-TRASH-30-DAY-WINDOW` | **DOC** | [`spec/00-adrs/0009-trash-30-day-retention.md`](./00-adrs/0009-trash-30-day-retention.md) | - G-11-TRASH-30-DAY-WINDOW — enforces D2 (cutoff is exactly |
| `G-11-TRASH-SOFT-DELETE-ONLY` | **DOC** | [`spec/00-adrs/0009-trash-30-day-retention.md`](./00-adrs/0009-trash-30-day-retention.md) | - G-11-TRASH-SOFT-DELETE-ONLY — enforces D1 (no user path issues |

### ADR-0012

| Gate | Tier | Primary File | Brief |
|------|------|--------------|-------|
| `G-12-LOGICAL-MARGINS-PADDING` | **CI** | [`spec/00-adrs/0012-tailwind-v4-theme-block-token-registry.md`](./00-adrs/0012-tailwind-v4-theme-block-token-registry.md) | ESLint bans `pl-*`/`pr-*`/`ml-*`/`mr-*`/`border-l-*`/`border-r-*`/`rounded-l-*`/`rounded-r-*` in `src/` outside `src/components/ui/` (grandfathered). Escape hatch: `/* a11y-rtl-exempt: <reason> */` on the preceding line. ADR-0012 §D7. |
| `G-12-LOGICAL-TEXT-ALIGN` | **CI** | [`spec/00-adrs/0012-tailwind-v4-theme-block-token-registry.md`](./00-adrs/0012-tailwind-v4-theme-block-token-registry.md) | ESLint bans `text-left` / `text-right`; require `text-start` / `text-end`. Same exemption-comment escape hatch. ADR-0012 §D7. |
| `G-12-LOGICAL-INSET` | **CI** | [`spec/00-adrs/0012-tailwind-v4-theme-block-token-registry.md`](./00-adrs/0012-tailwind-v4-theme-block-token-registry.md) | ESLint bans `left-*` / `right-*` positional utilities; require `start-*` / `end-*`. Same exemption-comment escape hatch. ADR-0012 §D7. |

### ADR-0013

| Gate | Tier | Primary File | Brief |
|------|------|--------------|-------|
| `G-13-ACTION-VERSIONS` | **DOC** | [`spec/13-cicd-pipeline-workflows/00-overview.md`](./13-cicd-pipeline-workflows/00-overview.md) | Use actions/checkout@v3 or older Known supply-chain CVE; loses sparse-checkout. |
| `G-13-ARCHETYPE-DECLARED` | **DOC-NORM** | [`spec/13-cicd-pipeline-workflows/00-overview.md`](./13-cicd-pipeline-workflows/00-overview.md) | Add a new repo without picking one of the documented archetypes Pipeline drift — each repo invents its own gates. |
| `G-13-CACHE-KEY` | **DOC** | [`spec/00-overview.md`](./00-overview.md) | Enforces ADR-0002 — WordPress plugin + PHP 8.1+ + SQLite. |
| `G-13-CONCURRENCY` | **DOC** | [`spec/13-cicd-pipeline-workflows/00-overview.md`](./13-cicd-pipeline-workflows/00-overview.md) | concurrency: { group: ${{ github.workflow }}-${{ github.ref }}, cancel-in-progress: true } on every PR workflow. Gate G |
| `G-13-DAG-PARALLEL` | **DOC-NORM** | [`spec/13-cicd-pipeline-workflows/00-overview.md`](./13-cicd-pipeline-workflows/00-overview.md) | Run jobs in series when DAG allows parallel Wastes CI minutes; balloons feedback time. |
| `G-13-HYGIENE-PRESENT` | **DOC** | [`spec/13-cicd-pipeline-workflows/00-overview.md`](./13-cicd-pipeline-workflows/00-overview.md) | Skip the spec-hygiene step Spec rot ships unchecked. |
| `G-13-NO-CANCEL-TAG` | **DOC-NORM** | [`spec/13-cicd-pipeline-workflows/00-overview.md`](./13-cicd-pipeline-workflows/00-overview.md) | Tag workflows MUST set cancel-in-progress: false — releases are never cancelled mid-flight. Gate G-13-NO-CANCEL-TAG. |
| `G-13-NO-SECRET-ECHO` | **DOC** | [`spec/13-cicd-pipeline-workflows/00-overview.md`](./13-cicd-pipeline-workflows/00-overview.md) | Secrets accessed only via ${{ secrets. }}; never echoed to logs. Gate G-13-NO-SECRET-ECHO (regex over workflow). |
| `G-13-NO-SECRET-LITERAL` | **DOC** | [`spec/13-cicd-pipeline-workflows/00-overview.md`](./13-cicd-pipeline-workflows/00-overview.md) | Hardcode secrets / registry URLs in workflow YAML Token leak; rotation impossible. |
| `G-13-PROTECTION-MATCH` | **DOC-NORM** | [`spec/13-cicd-pipeline-workflows/00-overview.md`](./13-cicd-pipeline-workflows/00-overview.md) | Mark scan-security as required Slows merges on third-party CVE noise. Branch-protection JSON checked into repo, valid. |
| `G-13-PUBLISH-NEEDS-SIGN` | **DOC** | [`spec/13-cicd-pipeline-workflows/00-overview.md`](./13-cicd-pipeline-workflows/00-overview.md) | Publish from a job that didn't depend on sign-artifact Unsigned release reaches users. |
| `G-13-FIXTURE-AS-SPEC-SHAPE` | **DOC-NORM** | [`spec/13-cicd-pipeline-workflows/scripts-as-spec/fixture-as-spec-shape-audit.md`](./13-cicd-pipeline-workflows/scripts-as-spec/fixture-as-spec-shape-audit.md) | Phase 4 (FINAL): every file in `scripts-as-spec/` (except `README.md`) MUST contain the 6 required H2 sections; the Algorithm section MUST contain a tagged fenced code block (`python`/`bash`/`sh`/`js`/`ts`); the banner blockquote MUST cite ≥1 gate ID resolving in this registry; AND the cited gate's registry row MUST link back to the fixture file (with `BACKLINK_EXEMPT` carve-out for gates whose authoritative spec lives elsewhere, e.g. `G-00-ADR-XLINK-SYMMETRY`). Closes meta-symmetry loop. |
| `G-13-PLACEHOLDER-TOKEN-PARITY` | **DOC-NORM** | [`spec/13-cicd-pipeline-workflows/scripts-as-spec/placeholder-token-parity-audit.md`](./13-cicd-pipeline-workflows/scripts-as-spec/placeholder-token-parity-audit.md) | Drift guard: the `PLACEHOLDER_TOKENS` literal in `fixture-as-spec-shape-audit.md` MUST equal the set of tokens listed in this file's §5.1 "Documentation placeholders" row Silent drift between the two would either falsely flag real gate IDs as placeholders or accept a real gate as a placeholder. |
| `G-13-LEDGER-ROW-COUNT-PARITY` | **DOC-NORM** | [`spec/13-cicd-pipeline-workflows/scripts-as-spec/ledger-row-count-lint.md`](./13-cicd-pipeline-workflows/scripts-as-spec/ledger-row-count-lint.md) | Phase-5 nibble: visual-row count under `## Exempt gates` in `_LEDGER-G-13-BACKLINK-EXEMPT.md` MUST equal `len(load_backlink_exempt())` Silent row drop (typo in leading number, missing backtick on gate ID) shrinks the exempt set without any signal — falsely re-flagging carve-out gates as Phase-4 violations. |
| `G-13-LEDGER-NUMBERING-CONTIGUOUS` | **DOC-NORM** | [`spec/13-cicd-pipeline-workflows/scripts-as-spec/ledger-numbering-contiguous-lint.md`](./13-cicd-pipeline-workflows/scripts-as-spec/ledger-numbering-contiguous-lint.md) | Sibling Phase-5 lint: leading-number column under `## Exempt gates` MUST form a contiguous `1..N` sequence Hard-deleting a row instead of marking `Removed` per the ledger's deletion convention erases the audit trail of why a gate was once exempt. |
| `G-13-LEDGER-PER-GATE-PATH` | **CI** | [`spec/13-cicd-pipeline-workflows/scripts-as-spec/per-gate-path-ledger-schema.md`](./13-cicd-pipeline-workflows/scripts-as-spec/per-gate-path-ledger-schema.md) | Per-(gate, path) ledger upgrade — Phase-3 promoted to CI 2026-04-29 (G-30 first consumer): ledger rows MUST carry the canonical 5-column schema (`gate` × `pathGlob` × `entry` × `rationale` × `addedOn`); each exemption is bounded to its (gate × file-path-glob) pair (NOT a global wildcard). G-30.2 now consults `pathGlob` per row before silencing — corrupting an exemption row's `pathGlob` to a non-matching path correctly re-surfaces the redundancy advisory (negative-test verified with AT-INFO- → wrong path → 7 candidates re-flagged). Phase-2 ledger: `spec/01-spec-authoring-guide/_LEDGER-G-30-EXEMPTIONS.md` (41 rows). Sibling migrations (G-31 `WORKFLOW_PROXY_ALLOWLIST`, G-32 `DDL_UNIQUE_ALLOWLIST`) tracked separately. |
| `G-13-OVERVIEW-ARCHETYPE-EMIT` | **DOC-NORM** | [`spec/13-cicd-pipeline-workflows/00-overview.md`](./13-cicd-pipeline-workflows/00-overview.md) | batch-14 prose→AT migration (L40): the three archetypes (WP-Plugin, Frontend-SPA, Browser-Extension) MUST emit one of the three named workflow YAML files (`wp-plugin-ci.yml`, `frontend-ci.yml`, `bitbucket-pipelines.yml`); a new archetype without a corresponding YAML emitter is a spec drift. |
| `G-13-DAG-EXACT-MIRROR` | **DOC-NORM** | [`spec/13-cicd-pipeline-workflows/00-overview.md`](./13-cicd-pipeline-workflows/00-overview.md) | batch-14 prose→AT migration (L89): every WP-Plugin pipeline MUST realize the exact 11-node Pipeline-Job DAG (setup → {spec-hygiene, lint-php, lint-ts} → {test-phpunit, test-vitest} → build-plugin-zip → {sign-artifact ∥ scan-security} → publish); adding/removing nodes requires an ADR. |
| `G-13-BRANCH-PROTECTION-MIRROR` | **DOC-NORM** | [`spec/13-cicd-pipeline-workflows/00-overview.md`](./13-cicd-pipeline-workflows/00-overview.md) | batch-14 prose→AT migration (L133): repo branch-protection rules MUST mirror the Required-vs-Optional Gate Matrix exactly — `main` requires {setup, spec-hygiene, lint-php, lint-ts, test-phpunit, test-vitest}; tag pushes additionally require {build-plugin-zip, sign-artifact, publish}; `scan-security` is never required. |
| `G-13-SIGN-REQUIRED-ON-TAG` | **DOC-NORM** | [`spec/13-cicd-pipeline-workflows/00-overview.md`](./13-cicd-pipeline-workflows/00-overview.md) | batch-14 prose→AT migration (L144): on tag pushes, `sign-artifact` is **Required** and `publish` MUST NOT run if `sign-artifact` failed or was skipped; releases MUST NOT publish unsigned. Pairs with `G-13-PUBLISH-NEEDS-SIGN` (DAG edge) for both static and runtime enforcement. |
| `G-13-ANTIPATTERN-COMPLIANCE` | **DOC-NORM** | [`spec/13-cicd-pipeline-workflows/00-overview.md`](./13-cicd-pipeline-workflows/00-overview.md) | batch-14 prose→AT migration (L164): the AI MUST NOT emit any of the 7 enumerated anti-patterns (undeclared archetype, missing spec-hygiene, hardcoded secrets, scan-security required, serial DAG, publish without sign, outdated `actions/checkout`). Each anti-pattern row in `00-overview.md`'s table cites its catching gate; this umbrella asserts the table is exhaustive (every anti-pattern has a catching gate; no orphan rows). |
| `G-13-FIXTURE-STRING-PARITY` | **DOC-NORM** | [`spec/13-cicd-pipeline-workflows/00-overview.md`](./13-cicd-pipeline-workflows/00-overview.md) | batch-14 prose→AT migration (L275): all values in the §Error-code registry table (`CI-13-00`..`CI-13-09` codes, job names, recovery strings) are load-bearing — fixtures in `97a-acceptance-criteria-fixtures.md` MUST cite these exact strings (case-sensitive, byte-equal). |
| `G-13-FOLDER-PLACEMENT` | **DOC-NORM** | [`spec/13-cicd-pipeline-workflows/00-overview.md`](./13-cicd-pipeline-workflows/00-overview.md) | batch-14 prose→AT migration (L310): all CI/CD pipeline content (build pipelines, deployment workflows, environment-promotion strategies, CI/CD tooling configs) MUST be documented under `spec/13-cicd-pipeline-workflows/` — never scattered across other module folders. App-specific deployment notes belong in `spec/31-app/` instead.  |
| `G-13-FIXTURE-SHAPE-6-SECTIONS` | **DOC-NORM** | [`spec/13-cicd-pipeline-workflows/scripts-as-spec/fixture-as-spec-shape-audit.md`](./13-cicd-pipeline-workflows/scripts-as-spec/fixture-as-spec-shape-audit.md) | batch-15 prose→AT migration (L18, L35): every file in `spec/13-cicd-pipeline-workflows/scripts-as-spec/` (other than `README.md`) MUST contain all 6 required H2 sections (Purpose, Inputs, Outputs, Algorithm, Exemptions, and either Strictness-roadmap OR Test-fixtures). A fixture MAY add extras (See-also, Frozen-header-banner) but MUST NOT omit any of the 6. Sub-rule of `G-13-FIXTURE-AS-SPEC-SHAPE`. |
| `G-13-FIXTURE-SHAPE-EVOLUTION-LINK` | **DOC-NORM** | [`spec/13-cicd-pipeline-workflows/scripts-as-spec/fixture-as-spec-shape-audit.md`](./13-cicd-pipeline-workflows/scripts-as-spec/fixture-as-spec-shape-audit.md) | batch-15 prose→AT migration (L31): at least one of "Strictness roadmap" OR "Test fixtures" link MUST be present in every fixture file so the gate's evolution path is traceable (sibling to `G-13-FIXTURE-SHAPE-6-SECTIONS`). |
| `G-13-FIXTURE-SHAPE-PHASE2-LANG-TAG` | **DOC-NORM** | [`spec/13-cicd-pipeline-workflows/scripts-as-spec/fixture-as-spec-shape-audit.md`](./13-cicd-pipeline-workflows/scripts-as-spec/fixture-as-spec-shape-audit.md) | batch-15 prose→AT migration (L184–186): Phase-2 of the shape audit — Algorithm fence MUST declare an info-string from the closed allowlist `{python, bash, sh, javascript, js, typescript, ts}`. Plain ` ``` ` fences (no info-string) and other tags (e.g. `txt`, `yaml`) hard-fail. |
| `G-13-FIXTURE-SHAPE-PHASE3-GATE-CITED` | **DOC-NORM** | [`spec/13-cicd-pipeline-workflows/scripts-as-spec/fixture-as-spec-shape-audit.md`](./13-cicd-pipeline-workflows/scripts-as-spec/fixture-as-spec-shape-audit.md) | batch-15 prose→AT migration (L188–189): Phase-3 of the shape audit — every fixture's banner blockquote MUST cite ≥1 gate ID, AND every cited gate ID MUST resolve to a row in `spec/_GATE-REGISTRY.md` (modulo the 3 documentation-placeholder tokens enforced by `G-13-PLACEHOLDER-TOKEN-PARITY`). |
| `G-13-FIXTURE-SHAPE-PHASE4-BACKLINK` | **DOC-NORM** | [`spec/13-cicd-pipeline-workflows/scripts-as-spec/fixture-as-spec-shape-audit.md`](./13-cicd-pipeline-workflows/scripts-as-spec/fixture-as-spec-shape-audit.md) | batch-15 prose→AT migration (L192): Phase-4 (FINAL) of the shape audit — for every gate ID cited in a fixture's banner, the corresponding `spec/_GATE-REGISTRY.md` row MUST link back to that fixture file (filename match in the row's primary-file link). Carve-outs go in `_LEDGER-G-13-BACKLINK-EXEMPT.md`. Closes the meta-symmetry loop. |

### ADR-0014

| Gate | Tier | Primary File | Brief |
|------|------|--------------|-------|
| `G-14-BACKUP-RETAIN` | **DOC-NORM** | [`spec/14-self-update-app-update/00-overview.md`](./14-self-update-app-update/00-overview.md) | Delete the SQLite backup before phase 7 commits Loses the only rollback target. |
| `G-14-CONFLICT-UX-SILENT` | **DOC** | [`spec/00-adrs/0010-offline-fifo-replay-queue.md`](./00-adrs/0010-offline-fifo-replay-queue.md) | - G-14-CONFLICT-UX-SILENT — enforces D5 (no prompts; "restored |
| `G-14-LWW-SERVERTS-CANONICAL` | **DOC** | [`spec/00-overview.md`](./00-overview.md) | [0010](./00-adrs/0010-offline-fifo-replay-queue.md) Offline FIFO replay queue (IndexedDB) + server-stamped LWW reconcil |
| `G-14-NO-HARDCODE-URL` | **DOC-NORM** | [`spec/14-self-update-app-update/00-overview.md`](./14-self-update-app-update/00-overview.md) | Hardcode the update-server URL in PHP Breaks air-gapped/self-hosted deployments. |
| `G-14-NO-SWALLOW` | **CI** | [`spec/14-self-update-app-update/00-overview.md`](./14-self-update-app-update/00-overview.md) | Catch Throwable in apply() and return success Hides corruption; later phases run on broken state. |
| `G-14-PHASE-ORDER` | **TEST** | [`spec/14-self-update-app-update/00-overview.md`](./14-self-update-app-update/00-overview.md) | Run ExtractFiles before BackupSqlite succeeded No rollback target — partial extraction corrupts plugin. |
| `G-14-QUEUE-FIFO-LOCALSEQ` | **DOC** | [`spec/00-adrs/0010-offline-fifo-replay-queue.md`](./00-adrs/0010-offline-fifo-replay-queue.md) | - G-14-QUEUE-FIFO-LOCALSEQ — enforces D1 (strict LocalSeq order, |
| `G-14-QUEUE-INDEPENDENT-OF-VIEW-CAP` | **DOC** | [`spec/00-adrs/0010-offline-fifo-replay-queue.md`](./00-adrs/0010-offline-fifo-replay-queue.md) | - G-14-QUEUE-INDEPENDENT-OF-VIEW-CAP — enforces D6 (queue + local |
| `G-14-QUEUE-INDEXEDDB-ONLY` | **DOC** | [`spec/00-adrs/0010-offline-fifo-replay-queue.md`](./00-adrs/0010-offline-fifo-replay-queue.md) | - G-14-QUEUE-INDEXEDDB-ONLY — enforces D2 (no localStorage / |
| `G-14-REPLAY-IDEMPOTENT-CMID` | **DOC** | [`spec/00-adrs/0010-offline-fifo-replay-queue.md`](./00-adrs/0010-offline-fifo-replay-queue.md) | - G-14-REPLAY-IDEMPOTENT-CMID — enforces D4 (ClientMutationId + |
| `G-14-SIG-REQUIRED` | **CI** | [`spec/14-self-update-app-update/00-overview.md`](./14-self-update-app-update/00-overview.md) | Skip Ed25519 signature verification Allows arbitrary RCE via spoofed update server. |
| `G-14-STAGING-ONLY` | **DOC** | [`spec/14-self-update-app-update/00-overview.md`](./14-self-update-app-update/00-overview.md) | Mutate the live plugin/ dir instead of plugin/.staging/ A crash mid-extract leaves users with a half-installed plugin. |

### ADR-0015

| Gate | Tier | Primary File | Brief |
|------|------|--------------|-------|
| `G-15-CASCADE-AND-WIN-RULES` | **DOC** | [`spec/00-overview.md`](./00-overview.md) | [0014](./00-adrs/0014-sharing-public-vs-invited-permission-model.md) Sharing — public + invited, 5-role item ACL, separ |
| `G-15-DEFAULT-PRIVATE` | **DOC** | [`spec/00-adrs/0014-sharing-public-vs-invited-permission-model.md`](./00-adrs/0014-sharing-public-vs-invited-permission-model.md) | - G-15-DEFAULT-PRIVATE — enforces D9 (no implicit grants beyond |
| `G-15-ITEMTYPE-LOWERCASE` | **DOC** | [`spec/20-enums-index.md`](./20-enums-index.md) | > Updated: 2026-04-28 — AUDIT-05 fix: added Universal Rule #10 codifying the ItemType lowercase exception (cross-languag |
| `G-15-MIRROR-ACL-PER-INSTANCE` | **DOC** | [`spec/00-adrs/0014-sharing-public-vs-invited-permission-model.md`](./00-adrs/0014-sharing-public-vs-invited-permission-model.md) | - G-15-MIRROR-ACL-PER-INSTANCE — enforces D7 (ItemShare keyed |
| `G-15-NO-CROSS-DB-AUTH-JOIN` | **DOC** | [`spec/00-adrs/0014-sharing-public-vs-invited-permission-model.md`](./00-adrs/0014-sharing-public-vs-invited-permission-model.md) | - G-15-NO-CROSS-DB-AUTH-JOIN — enforces D5 (Root DB and App DB |
| `G-15-RESOLVER-SOLE-ENTRY` | **DOC** | [`spec/00-adrs/0014-sharing-public-vs-invited-permission-model.md`](./00-adrs/0014-sharing-public-vs-invited-permission-model.md) | violation of G-15-RESOLVER-SOLE-ENTRY. |
| `G-15-REVOKE-60S-SLA` | **DOC** | [`spec/00-adrs/0014-sharing-public-vs-invited-permission-model.md`](./00-adrs/0014-sharing-public-vs-invited-permission-model.md) | - G-15-REVOKE-60S-SLA — enforces D8 (revocation propagates within |
| `G-15-ROLE-ENUM-CLOSED` | **DOC** | [`spec/00-overview.md`](./00-overview.md) | [0014](./00-adrs/0014-sharing-public-vs-invited-permission-model.md) Sharing — public + invited, 5-role item ACL, separ |
| `G-15-ROLES-SEPARATE-TABLE` | **DOC** | [`spec/00-adrs/0014-sharing-public-vs-invited-permission-model.md`](./00-adrs/0014-sharing-public-vs-invited-permission-model.md) | - G-15-ROLES-SEPARATE-TABLE — enforces D4 (no role / |

### ADR-0016

| Gate | Tier | Primary File | Brief |
|------|------|--------------|-------|
| `G-16-CLI-CODE-LOAD-BEARING` | **DOC-NORM** | [`spec/16-generic-cli/00-overview.md`](./16-generic-cli/00-overview.md) | All `CLI-16-NN` codes shown in 16-generic-cli/00-overview.md exit-code-mapping table are load-bearing — fixtures in `97a-acceptance-criteria-fixtures.md` MUST cite these exact strings. Drift forbidden. |
| `G-16-CONFIG-VIA-FLAG` | **DOC-NORM** | [`spec/16-generic-cli/00-overview.md`](./16-generic-cli/00-overview.md) | Read config file paths from positional args Confuses <file> semantics with config plumbing. |
| `G-16-EMPTY-QUERY-NO-FALLBACK` | **DOC** | [`spec/00-adrs/0013-search-relevance-then-recency-ranking.md`](./00-adrs/0013-search-relevance-then-recency-ranking.md) | - G-16-EMPTY-QUERY-NO-FALLBACK — enforces D6 (zero results, never |
| `G-16-EXIT-DOCUMENTED` | **DOC-NORM** | [`spec/16-generic-cli/00-overview.md`](./16-generic-cli/00-overview.md) | - The hygiene gate G-16-EXIT-DOCUMENTED rejects help text that lists an undocumented code. |
| `G-16-EXIT-NONZERO-ON-FAIL` | **TEST** | [`spec/16-generic-cli/00-overview.md`](./16-generic-cli/00-overview.md) | Return exit 0 on partial failure Hides errors from CI; cron jobs miss alerts. |
| `G-16-FIELD-WEIGHTS-CONTENT-NOTE` | **DOC** | [`spec/00-adrs/0013-search-relevance-then-recency-ranking.md`](./00-adrs/0013-search-relevance-then-recency-ranking.md) | - G-16-FIELD-WEIGHTS-CONTENT-NOTE — enforces D3 (max(Content×1.5, |
| `G-16-FLAG-PRECEDENCE` | **DOC-NORM** | [`spec/16-generic-cli/00-overview.md`](./16-generic-cli/00-overview.md) | When a setting is multi-sourced, CLI MUST resolve in this exact order (highest wins): (1) explicit CLI flag, (2) `WORKFLOWY_<NAME>` env, (3) `./.workflowy/config.json`, (4) `$XDG_CONFIG_HOME/workflowy/config.json`, (5) built-in default (must be a value, never `nil`). Boolean `--no-foo` always overrides `--foo`; `--json` and `--quiet` mutually exclusive. |
| `G-16-FLAG-STYLE` | **DOC-NORM** | [`spec/16-generic-cli/00-overview.md`](./16-generic-cli/00-overview.md) | Use -flagName (single dash + camelCase) Conflicts with POSIX short-flag bundling (-abc = -a -b -c). |
| `G-16-JSON-PURE` | **DOC-NORM** | [`spec/16-generic-cli/00-overview.md`](./16-generic-cli/00-overview.md) | Print free-form text to stdout when --json is set Breaks downstream jq pipelines; unparseable. |
| `G-16-MATCH-TIER-TABLE` | **DOC** | [`spec/00-adrs/0013-search-relevance-then-recency-ranking.md`](./00-adrs/0013-search-relevance-then-recency-ranking.md) | - G-16-MATCH-TIER-TABLE — enforces D2 (the five tier values |
| `G-16-MIRROR-PEERS-INDEPENDENT` | **DOC** | [`spec/00-adrs/0013-search-relevance-then-recency-ranking.md`](./00-adrs/0013-search-relevance-then-recency-ranking.md) | - G-16-MIRROR-PEERS-INDEPENDENT — enforces D8 (no dedup of peer |
| `G-16-OPERATORS-AS-PREDICATE` | **DOC** | [`spec/00-adrs/0013-search-relevance-then-recency-ranking.md`](./00-adrs/0013-search-relevance-then-recency-ranking.md) | - G-16-OPERATORS-AS-PREDICATE — enforces D4 (operators narrow |
| `G-16-RANKING-HYBRID-BUCKETED` | **DOC** | [`spec/00-adrs/0013-search-relevance-then-recency-ranking.md`](./00-adrs/0013-search-relevance-then-recency-ranking.md) | - G-16-RANKING-HYBRID-BUCKETED — enforces D1 (5 buckets of |
| `G-16-SEARCH-300MS-SLA` | **DOC** | [`spec/00-adrs/0013-search-relevance-then-recency-ranking.md`](./00-adrs/0013-search-relevance-then-recency-ranking.md) | - G-16-SEARCH-300MS-SLA — enforces D5 (< 300 ms on ≥ 5 000-item |
| `G-16-STRICT-FLAGS` | **DOC-NORM** | [`spec/16-generic-cli/00-overview.md`](./16-generic-cli/00-overview.md) | Silently ignore unknown flags Typos pass undetected; users blame the tool. |
| `G-16-TTY-DETECT` | **TEST** | [`spec/16-generic-cli/00-overview.md`](./16-generic-cli/00-overview.md) | Emit ANSI color codes when stdout is not a TTY Garbles logs and CI output. |

### ADR-0017

| Gate | Tier | Primary File | Brief |
|------|------|--------------|-------|
| `G-17-CHANGELOG-MATCH` | **DOC** | [`spec/17-generic-update/00-overview.md`](./17-generic-update/00-overview.md) | Skip the CHANGELOG.md row for the new targetVersion() Downstream installers cannot present release notes; semver prov. |
| `G-17-NO-SWALLOW` | **CI** | [`spec/17-generic-update/00-overview.md`](./17-generic-update/00-overview.md) | Catch Throwable in apply() and return UpdateResult::success() Hides corruption; rollback never triggered. |
| `G-17-ROLLBACK-DECLARED` | **DOC** | [`spec/17-generic-update/00-overview.md`](./17-generic-update/00-overview.md) | Implement an updater without declaring rollbackStrategy() Operators cannot reason about recovery; CI cannot route to. |
| `G-17-SINGLE-CONCERN` | **DOC** | [`spec/17-generic-update/00-overview.md`](./17-generic-update/00-overview.md) | Mix a schema bump and a data migration in one updater Partial failure leaves DB in a state that matches no targetVers. |
| `G-17-SINGLE-VERSION` | **DOC-NORM** | [`spec/17-generic-update/00-overview.md`](./17-generic-update/00-overview.md) | Hard-code the version string in two places Drift between class constant and changelog. |
| `G-17-TXN-WRAP` | **TEST** | [`spec/17-generic-update/00-overview.md`](./17-generic-update/00-overview.md) | Run apply() outside a transaction on a writable DB Crash mid-statement leaves half-applied schema. |

### ADR-0018

| Gate | Tier | Primary File | Brief |
|------|------|--------------|-------|
| `G-18-FROZEN` | **DOC** | [`spec/18-spec-issues/00-overview.md`](./18-spec-issues/00-overview.md) | Edit a closed audit in place Erases the historical record; future readers can't reconstruct what changed. |
| `G-18-ONE-FINDING` | **DOC-NORM** | [`spec/18-spec-issues/00-overview.md`](./18-spec-issues/00-overview.md) | Mix multiple findings in one audit file Cannot be partially closed; blocks unrelated fixes. |
| `G-18-OWNER-LINK` | **DOC-NORM** | [`spec/18-spec-issues/00-overview.md`](./18-spec-issues/00-overview.md) | Open an audit without an owning section link Resolver cannot find what to fix. |
| `G-18-RESOLUTION-TRIPLE` | **DOC-NORM** | [`spec/18-spec-issues/00-overview.md`](./18-spec-issues/00-overview.md) | Resolve an audit without citing the spec edit + gate + AT Future regression cannot be detected. |
| `G-18-SEVERITY-ROUTING` | **DOC** | [`spec/18-spec-issues/00-overview.md`](./18-spec-issues/00-overview.md) | Use severity Critical without paging the on-call channel Severity becomes meaningless inflation. |
| `G-18-VERBATIM-QUOTE` | **DOC** | [`spec/18-spec-issues/00-overview.md`](./18-spec-issues/00-overview.md) | Re-use an active rule wording inside an audit body Audits document the past state verbatim; mirroring active wording. |

### ADR-0019

| Gate | Tier | Primary File | Brief |
|------|------|--------------|-------|
| `G-19-WORKFLOW-CONTRACT` | **DOC** | [`spec/00-adrs/0002-wp-plugin-php-sqlite-backend.md`](./00-adrs/0002-wp-plugin-php-sqlite-backend.md) | G-04-NO-DDL-PLURALS (SQLite-flavoured DDL), G-19-WORKFLOW-CONTRACT |

### ADR-0020

| Gate | Tier | Primary File | Brief |
|------|------|--------------|-------|
| `G-20-DASHBOARD-BOARD-CHILD-RENDER` | **DOC** | [`spec/00-adrs/0015-twelve-itemtypes-enum.md`](./00-adrs/0015-twelve-itemtypes-enum.md) | - G-20-DASHBOARD-BOARD-CHILD-RENDER — enforces D4 (any code path |
| `G-20-ITEMTYPE-CLOSED-12` | **DOC** | [`spec/00-adrs/0015-twelve-itemtypes-enum.md`](./00-adrs/0015-twelve-itemtypes-enum.md) | - G-20-ITEMTYPE-CLOSED-12 — enforces D1 + D5 (exactly the twelve |
| `G-20-ITEMTYPE-LOWERCASE` | **DOC** | [`spec/00-adrs/0015-twelve-itemtypes-enum.md`](./00-adrs/0015-twelve-itemtypes-enum.md) | - G-20-ITEMTYPE-LOWERCASE — enforces D2 (lowercase only in code, |
| `G-20-ITEMTYPE-TRI-SSOT-LOCKSTEP` | **DOC** | [`spec/00-adrs/0015-twelve-itemtypes-enum.md`](./00-adrs/0015-twelve-itemtypes-enum.md) | - G-20-ITEMTYPE-TRI-SSOT-LOCKSTEP — enforces D6 (CI compares the |
| `G-20-NO-MIRROR-ITEMTYPE` | **DOC-NORM** | [`spec/00-adrs/0015-twelve-itemtypes-enum.md`](./00-adrs/0015-twelve-itemtypes-enum.md) | - G-20-NO-MIRROR-ITEMTYPE — enforces D3 (mirror MUST NOT appear |
| `G-20-PRECOMMIT-CONTRACT` | **CI** | [`spec/00-adrs/0011-axios-only-http-client.md`](./00-adrs/0011-axios-only-http-client.md) | - Pre-commit hook (per G-20-PRECOMMIT-CONTRACT). |

### ADR-0021

| Gate | Tier | Primary File | Brief |
|------|------|--------------|-------|
| `G-21-INSERT-NO-SIBLING-MUTATION` | **DOC** | [`spec/00-overview.md`](./00-overview.md) | [0016](./00-adrs/0016-fractional-index-sortorder.md) SortOrder — lexicographic base-62 string, midpoint split, per-pare |
| `G-21-LWW-ID-TIEBREAK` | **DOC** | [`spec/00-adrs/0026-lww-canonical-tiebreak.md`](./00-adrs/0026-lww-canonical-tiebreak.md) | ADR-0016 (G-21-LWW-ID-TIEBREAK) implied ItemId gate name only |
| `G-21-NO-NUMERIC-MIDPOINT` | **DOC** | [`spec/00-adrs/0016-fractional-index-sortorder.md`](./00-adrs/0016-fractional-index-sortorder.md) | - G-21-NO-NUMERIC-MIDPOINT — explicitly forbids (A+B)/2, |
| `G-21-REBALANCE-PER-PARENT` | **DOC** | [`spec/00-adrs/0016-fractional-index-sortorder.md`](./00-adrs/0016-fractional-index-sortorder.md) | - G-21-REBALANCE-PER-PARENT — enforces D5 scope (rebalance |
| `G-21-REBALANCE-TRIGGER-64B` | **DOC** | [`spec/00-adrs/0016-fractional-index-sortorder.md`](./00-adrs/0016-fractional-index-sortorder.md) | - G-21-REBALANCE-TRIGGER-64B — enforces D5 trigger (64-byte key |
| `G-21-SORTORDER-BASE62-ALPHABET` | **DOC** | [`spec/00-adrs/0016-fractional-index-sortorder.md`](./00-adrs/0016-fractional-index-sortorder.md) | - G-21-SORTORDER-BASE62-ALPHABET — enforces D2 (0-9A-Za-z |
| `G-21-SORTORDER-STRING-ONLY` | **DOC** | [`spec/00-adrs/0016-fractional-index-sortorder.md`](./00-adrs/0016-fractional-index-sortorder.md) | - G-21-SORTORDER-STRING-ONLY — enforces D1 (Item.SortOrder is |

### ADR-0022

| Gate | Tier | Primary File | Brief |
|------|------|--------------|-------|
| `G-22-BOUNDARY-ISOLATION` | **DOC** | [`spec/00-adrs/0017-eight-error-boundaries-ui-virtualization.md`](./00-adrs/0017-eight-error-boundaries-ui-virtualization.md) | - G-22-BOUNDARY-ISOLATION — enforces D2 (no |
| `G-22-BOUNDARY-NAMES-CLOSED` | **DOC** | [`spec/00-adrs/0017-eight-error-boundaries-ui-virtualization.md`](./00-adrs/0017-eight-error-boundaries-ui-virtualization.md) | - G-22-BOUNDARY-NAMES-CLOSED — enforces D1's name list |
| `G-22-ERROR-BOUNDARIES-EXACTLY-8` | **DOC** | [`spec/00-adrs/0017-eight-error-boundaries-ui-virtualization.md`](./00-adrs/0017-eight-error-boundaries-ui-virtualization.md) | - G-22-ERROR-BOUNDARIES-EXACTLY-8 — enforces D1 (CI counts |
| `G-22-FALLBACK-CONTRACT` | **DOC** | [`spec/00-adrs/0017-eight-error-boundaries-ui-virtualization.md`](./00-adrs/0017-eight-error-boundaries-ui-virtualization.md) | - G-22-FALLBACK-CONTRACT — enforces D3 (every fallback must |
| `G-22-NO-SILENT-FALLBACK` | **DOC** | [`spec/00-adrs/0017-eight-error-boundaries-ui-virtualization.md`](./00-adrs/0017-eight-error-boundaries-ui-virtualization.md) | - G-22-NO-SILENT-FALLBACK — enforces D6 (boundary fallbacks |
| `G-22-REGISTRY-LOCKSTEP` | **DOC** | [`spec/03-error-manage/00-overview.md`](./03-error-manage/00-overview.md) | Add an error code outside the two registry files PHP↔TS drift; Code becomes meaningless string. |
| `G-22-VIRTUALIZATION-1000` | **DOC** | [`spec/00-adrs/0017-eight-error-boundaries-ui-virtualization.md`](./00-adrs/0017-eight-error-boundaries-ui-virtualization.md) | - G-22-VIRTUALIZATION-1000 — enforces D4 (any list/tree/grid |
| `G-22-VIRTUALIZER-TANSTACK-ONLY` | **DOC** | [`spec/00-adrs/0017-eight-error-boundaries-ui-virtualization.md`](./00-adrs/0017-eight-error-boundaries-ui-virtualization.md) | - G-22-VIRTUALIZER-TANSTACK-ONLY — enforces D5 (only |

### ADR-0023

| Gate | Tier | Primary File | Brief |
|------|------|--------------|-------|
| `G-23-ACTION-ENQUEUE-ONLY` | **DOC** | [`spec/00-adrs/0023-route-loaders-offline-queue-interaction.md`](./00-adrs/0023-route-loaders-offline-queue-interaction.md) | - G-23-ACTION-ENQUEUE-ONLY — every action writes mirror + queue in |
| `G-23-ACTION-NO-THROW` | **DOC** | [`spec/00-adrs/0023-route-loaders-offline-queue-interaction.md`](./00-adrs/0023-route-loaders-offline-queue-interaction.md) | - G-23-ACTION-NO-THROW — actions resolve with Status envelope; never |
| `G-23-COLD-OFFLINE-SHELL` | **DOC** | [`spec/00-adrs/0023-route-loaders-offline-queue-interaction.md`](./00-adrs/0023-route-loaders-offline-queue-interaction.md) | - G-23-COLD-OFFLINE-SHELL — root loader returns |
| `G-23-DATA-ROUTER-API` | **DOC-NORM** | [`spec/00-adrs/0018-react-router-v7-data-router-and-lucide-react-only.md`](./00-adrs/0018-react-router-v7-data-router-and-lucide-react-only.md) | - G-23-DATA-ROUTER-API — enforces D1 (root must use |
| `G-23-FETCHER-SAME-PATH` | **DOC** | [`spec/00-adrs/0023-route-loaders-offline-queue-interaction.md`](./00-adrs/0023-route-loaders-offline-queue-interaction.md) | - G-23-FETCHER-SAME-PATH — useFetcher().submit() routes through the |
| `G-23-ICONS-CURRENTCOLOR` | **DOC** | [`spec/00-adrs/0018-react-router-v7-data-router-and-lucide-react-only.md`](./00-adrs/0018-react-router-v7-data-router-and-lucide-react-only.md) | - G-23-ICONS-CURRENTCOLOR — enforces D4 (no color="#..." |
| `G-23-ICONS-LUCIDE-ONLY` | **DOC** | [`spec/00-overview.md`](./00-overview.md) | [0018](./00-adrs/0018-react-router-v7-data-router-and-lucide-react-only.md) Router v7 data-router API + lucide-react on |
| `G-23-ICONS-NAMED-IMPORTS` | **DOC** | [`spec/00-adrs/0018-react-router-v7-data-router-and-lucide-react-only.md`](./00-adrs/0018-react-router-v7-data-router-and-lucide-react-only.md) | - G-23-ICONS-NAMED-IMPORTS — enforces D4 (import { X } from |
| `G-23-LOADER-MIRROR-FIRST` | **DOC** | [`spec/00-adrs/0023-route-loaders-offline-queue-interaction.md`](./00-adrs/0023-route-loaders-offline-queue-interaction.md) | - G-23-LOADER-MIRROR-FIRST — every loader reads IndexedDB mirror |
| `G-23-LOADER-NO-MUTATE` | **DOC-NORM** | [`spec/00-adrs/0023-route-loaders-offline-queue-interaction.md`](./00-adrs/0023-route-loaders-offline-queue-interaction.md) | - G-23-LOADER-NO-MUTATE — loaders MUST NOT call queue API or write |
| `G-23-NO-EMOJI-AS-ICON` | **DOC** | [`spec/00-adrs/0018-react-router-v7-data-router-and-lucide-react-only.md`](./00-adrs/0018-react-router-v7-data-router-and-lucide-react-only.md) | - G-23-NO-EMOJI-AS-ICON — enforces D5 (no emoji codepoints in |
| `G-23-RECONNECT-LOCK` | **DOC** | [`spec/00-adrs/0023-route-loaders-offline-queue-interaction.md`](./00-adrs/0023-route-loaders-offline-queue-interaction.md) | - G-23-RECONNECT-LOCK — queue worker holds exclusive lock during |
| `G-23-ROUTER-ERRORELEMENT` | **DOC** | [`spec/00-adrs/0018-react-router-v7-data-router-and-lucide-react-only.md`](./00-adrs/0018-react-router-v7-data-router-and-lucide-react-only.md) | - G-23-ROUTER-ERRORELEMENT — enforces D1 + ADR-0017 |
| `G-23-ROUTER-V7-ONLY` | **DOC** | [`spec/00-adrs/0018-react-router-v7-data-router-and-lucide-react-only.md`](./00-adrs/0018-react-router-v7-data-router-and-lucide-react-only.md) | - G-23-ROUTER-V7-ONLY — enforces D1 (no react-router-dom@^6 |
| `G-23-WARM-LOADER-16MS` | **DOC** | [`spec/00-overview.md`](./00-overview.md) | [0023](./00-adrs/0023-route-loaders-offline-queue-interaction.md) Route loaders ↔ offline FIFO queue — mirror-first rea |

### ADR-0024

| Gate | Tier | Primary File | Brief |
|------|------|--------------|-------|
| `G-24-AUDIT-SCORE-FROZEN` | **DOC-NORM** | [`spec/00-adrs/0024-ratify-soft-confirm-triage-rulings.md`](./00-adrs/0024-ratify-soft-confirm-triage-rulings.md) | - G-24-AUDIT-SCORE-FROZEN — 100/100 audit score MUST NOT be |
| `G-24-DDL-SINGULAR-LOCKED` | **DOC-NORM** | [`spec/00-adrs/0024-ratify-soft-confirm-triage-rulings.md`](./00-adrs/0024-ratify-soft-confirm-triage-rulings.md) | - G-24-DDL-SINGULAR-LOCKED — DDL identifiers MUST be singular; |
| `G-24-FAVORITES-TABLE-ONLY` | **DOC-NORM** | [`spec/00-adrs/0024-ratify-soft-confirm-triage-rulings.md`](./00-adrs/0024-ratify-soft-confirm-triage-rulings.md) | - G-24-FAVORITES-TABLE-ONLY — Favorites MUST be table-level; no |
| `G-24-ID-CONSTRUCTORS-VALIDATE` | **DOC** | [`spec/00-adrs/0020-branded-itemid-ownerid.md`](./00-adrs/0020-branded-itemid-ownerid.md) | - G-24-ID-CONSTRUCTORS-VALIDATE — enforces D4 (helper |
| `G-24-ID-WIRE-REGEX` | **DOC** | [`spec/00-adrs/0020-branded-itemid-ownerid.md`](./00-adrs/0020-branded-itemid-ownerid.md) | - G-24-ID-WIRE-REGEX — enforces D3 (REST handlers and the |
| `G-24-IDS-MUST-BE-BRANDED` | **DOC** | [`spec/00-overview.md`](./00-overview.md) | [0020](./00-adrs/0020-branded-itemid-ownerid.md) Branded ItemId/OwnerId — opaque-string brands, as<Brand>() constructor |
| `G-24-NO-INLINE-AS-BRAND` | **DOC** | [`spec/00-adrs/0020-branded-itemid-ownerid.md`](./00-adrs/0020-branded-itemid-ownerid.md) | - G-24-NO-INLINE-AS-BRAND — enforces D2 (as ItemId, |

### ADR-0025

| Gate | Tier | Primary File | Brief |
|------|------|--------------|-------|
| `G-25-QUEUE-INDEXEDDB-ONLY` | **DOC** | [`spec/00-adrs/0021-undo-100-offline-queue-unbounded.md`](./00-adrs/0021-undo-100-offline-queue-unbounded.md) | - G-25-QUEUE-INDEXEDDB-ONLY — enforces D2 (no |
| `G-25-QUEUE-NO-SILENT-DROP` | **DOC** | [`spec/00-adrs/0021-undo-100-offline-queue-unbounded.md`](./00-adrs/0021-undo-100-offline-queue-unbounded.md) | - G-25-QUEUE-NO-SILENT-DROP — enforces D2 (quota errors |
| `G-25-QUEUE-UNBOUNDED` | **DOC** | [`spec/00-adrs/0021-undo-100-offline-queue-unbounded.md`](./00-adrs/0021-undo-100-offline-queue-unbounded.md) | - G-25-QUEUE-UNBOUNDED — enforces D2 (no constant named |
| `G-25-SSE-ENDPOINT-CLOSED` | **DOC** | [`spec/00-adrs/0025-sse-realtime-transport.md`](./00-adrs/0025-sse-realtime-transport.md) | - G-25-SSE-ENDPOINT-CLOSED — only /stream/page/{id} and |
| `G-25-SSE-EVENT-NAMES-CLOSED` | **DOC** | [`spec/00-adrs/0025-sse-realtime-transport.md`](./00-adrs/0025-sse-realtime-transport.md) | - G-25-SSE-EVENT-NAMES-CLOSED — event names ∈ {item.created, |
| `G-25-SSE-FRAME-ENVELOPE` | **DOC** | [`spec/00-overview.md`](./00-overview.md) | [0025](./00-adrs/0025-sse-realtime-transport.md) SSE sole realtime transport — /stream/page + /stream/user, PascalCase |
| `G-25-SSE-HEARTBEAT-15S` | **TEST** | [`spec/00-adrs/0025-sse-realtime-transport.md`](./00-adrs/0025-sse-realtime-transport.md) | - G-25-SSE-HEARTBEAT-15S — server emits : ping every 15 s. |
| `G-25-SSE-LAST-EVENT-ID` | **DOC** | [`spec/00-adrs/0025-sse-realtime-transport.md`](./00-adrs/0025-sse-realtime-transport.md) | - G-25-SSE-LAST-EVENT-ID — server honours Last-Event-ID with |
| `G-25-SSE-READ-ONLY-SIGNAL` | **DOC-NORM** | [`spec/00-adrs/0025-sse-realtime-transport.md`](./00-adrs/0025-sse-realtime-transport.md) | - G-25-SSE-READ-ONLY-SIGNAL — SSE frames MUST NOT enqueue to FIFO |
| `G-25-SSE-WORKER-CAP` | **DOC** | [`spec/00-adrs/0025-sse-realtime-transport.md`](./00-adrs/0025-sse-realtime-transport.md) | - G-25-SSE-WORKER-CAP — concurrent SSE connections capped per D8; |
| `G-25-TRANSPORT-SSE-ONLY` | **DOC** | [`spec/00-overview.md`](./00-overview.md) | [0025](./00-adrs/0025-sse-realtime-transport.md) SSE sole realtime transport — /stream/page + /stream/user, PascalCase |
| `G-25-UNDO-CAP-100` | **DOC** | [`spec/00-adrs/0021-undo-100-offline-queue-unbounded.md`](./00-adrs/0021-undo-100-offline-queue-unbounded.md) | - G-25-UNDO-CAP-100 — enforces D1 (undo + redo stacks each |
| `G-25-UNDO-COMPENSATING-ENQUEUE` | **DOC** | [`spec/00-adrs/0021-undo-100-offline-queue-unbounded.md`](./00-adrs/0021-undo-100-offline-queue-unbounded.md) | - G-25-UNDO-COMPENSATING-ENQUEUE — enforces D3 (every |
| `G-25-UNDO-IN-MEMORY-ONLY` | **DOC** | [`spec/00-adrs/0021-undo-100-offline-queue-unbounded.md`](./00-adrs/0021-undo-100-offline-queue-unbounded.md) | - G-25-UNDO-IN-MEMORY-ONLY — enforces D1/D4 (no |
| `G-25-UNDO-PER-TAB` | **DOC** | [`spec/00-adrs/0021-undo-100-offline-queue-unbounded.md`](./00-adrs/0021-undo-100-offline-queue-unbounded.md) | - G-25-UNDO-PER-TAB — enforces D1 (no BroadcastChannel, |

### ADR-0026

| Gate | Tier | Primary File | Brief |
|------|------|--------------|-------|
| `G-26-COMPONENT-BASE-SHADCN-RADIX` | **DOC** | [`spec/00-adrs/0022-shadcn-radix-component-base.md`](./00-adrs/0022-shadcn-radix-component-base.md) | - G-26-COMPONENT-BASE-SHADCN-RADIX — enforces D1 |
| `G-26-LWW-CANONICAL-COMPARATOR` | **DOC** | [`spec/00-adrs/0026-lww-canonical-tiebreak.md`](./00-adrs/0026-lww-canonical-tiebreak.md) | - G-26-LWW-CANONICAL-COMPARATOR — exactly one resolveLWW function |
| `G-26-LWW-NO-CLIENT-TS` | **DOC-NORM** | [`spec/00-adrs/0026-lww-canonical-tiebreak.md`](./00-adrs/0026-lww-canonical-tiebreak.md) | - G-26-LWW-NO-CLIENT-TS — clientTs MUST NOT appear in any |
| `G-26-LWW-STRICT-ORDERING` | **DOC** | [`spec/00-overview.md`](./00-overview.md) | [0026](./00-adrs/0026-lww-canonical-tiebreak.md) Canonical LWW tie-break — single 3-tier (ServerTs DESC, OwnerId ASC, I |
| `G-26-NO-MIXED-COMPONENT-BASES` | **DOC** | [`spec/00-adrs/0022-shadcn-radix-component-base.md`](./00-adrs/0022-shadcn-radix-component-base.md) | - G-26-NO-MIXED-COMPONENT-BASES — enforces D6 (no second |
| `G-26-NO-SHADCN-RUNTIME-DEP` | **DOC-NORM** | [`spec/00-overview.md`](./00-overview.md) | [0022](./00-adrs/0022-shadcn-radix-component-base.md) shadcn/ui (CLI-vendored) + Radix sole base; MUI/Mantine/Ant/Headl |
| `G-26-OWNER-ID-CANONICAL` | **DOC** | [`spec/00-adrs/0026-lww-canonical-tiebreak.md`](./00-adrs/0026-lww-canonical-tiebreak.md) | - G-26-OWNER-ID-CANONICAL — OwnerId is the canonical brand; |
| `G-26-RADIX-MATRIX-PINNED` | **DOC-NORM** | [`spec/00-overview.md`](./00-overview.md) | [0022](./00-adrs/0022-shadcn-radix-component-base.md) shadcn/ui (CLI-vendored) + Radix sole base; MUI/Mantine/Ant/Headl |
| `G-26-SHADCN-PATCHES-TRACKED` | **DOC** | [`spec/00-adrs/0022-shadcn-radix-component-base.md`](./00-adrs/0022-shadcn-radix-component-base.md) | - G-26-SHADCN-PATCHES-TRACKED — enforces D4 (any diff |
| `G-26-WIRE-OWNERID-ONLY` | **CI + TEST** | [`spec/00-adrs/0026-lww-canonical-tiebreak.md`](./00-adrs/0026-lww-canonical-tiebreak.md) | CI: regex `\bOwnerUserId\s*[:?,}]` over `06-endpoints/**` → 0 + 3-file fixture whitelist. TEST: `AT-WIRE-EGRESS-01` PHPUnit serializer test (spec at `06-endpoints/97b-endpoint-envelope-fixtures.md`). |

### ADR-0027

| Gate | Tier | Primary File | Brief |
|------|------|--------------|-------|
| `G-27-RING-IS-SQLITE-WAL` | **CI** | [`spec/00-adrs/0027-sse-multiworker-shared-ring-buffer.md`](./00-adrs/0027-sse-multiworker-shared-ring-buffer.md) | Realtime DB connection MUST set `PRAGMA journal_mode = WAL` at boot. CI asserts `PRAGMA journal_mode;` returns `wal`. ADR-0027 §D2. |
| `G-27-PRODUCER-COMPLETENESS` | **CI** | [`spec/00-adrs/0027-sse-multiworker-shared-ring-buffer.md`](./00-adrs/0027-sse-multiworker-shared-ring-buffer.md) | Every REST handler mutating `Items`/`Mirrors`/`Favorites`/`Trash` MUST `INSERT INTO SseRing` in the same transaction (PHPStan custom rule). ADR-0027 §D3. |
| `G-27-NO-INPROCESS-PUBSUB` | **CI** | [`spec/00-adrs/0027-sse-multiworker-shared-ring-buffer.md`](./00-adrs/0027-sse-multiworker-shared-ring-buffer.md) | No PHP source may reference `pcntl_fork`, `posix_kill`, `shm_*`, or any in-process pub/sub library (phpcs deny-list). ADR-0027 §D7. |
| `G-27-NO-EXTERNAL-BROKER` | **CI** | [`spec/00-adrs/0027-sse-multiworker-shared-ring-buffer.md`](./00-adrs/0027-sse-multiworker-shared-ring-buffer.md) | `composer.lock` MUST NOT contain Redis/Memcached/RabbitMQ/NATS/Pusher clients. ADR-0027 §D7. |
| `G-27-RING-TTL-300S` | **TEST** | [`spec/00-adrs/0027-sse-multiworker-shared-ring-buffer.md`](./00-adrs/0027-sse-multiworker-shared-ring-buffer.md) | Reaper test: insert 1000 rows with `CreatedAtUnix - 301`, run cron, assert `COUNT(*) = 0`. ADR-0027 §D5. |
| `G-27-COLD-GAP-RESYNC` | **TEST** | [`spec/00-adrs/0027-sse-multiworker-shared-ring-buffer.md`](./00-adrs/0027-sse-multiworker-shared-ring-buffer.md) | Connect with `Last-Event-ID = 1`, oldest ring row `ServerSeq = 5000` → server emits one `event: resync` frame and closes. ADR-0027 §D6. |
| `G-27-MULTIWORKER-REPLAY` | **TEST** | [`spec/00-adrs/0027-sse-multiworker-shared-ring-buffer.md`](./00-adrs/0027-sse-multiworker-shared-ring-buffer.md) | Integration test with 4 PHP-FPM workers: write 100 events, reconnect from each worker, assert every reconnect sees all 100 in order. ADR-0027 §D7. |
| `G-27-SERVERSEQ-MONOTONIC` | **DOC-NORM** | [`spec/00-adrs/0027-sse-multiworker-shared-ring-buffer.md`](./00-adrs/0027-sse-multiworker-shared-ring-buffer.md) | `ServerSeq` MUST be strictly monotonically increasing per host; rollback gaps tolerated, reordering not. ADR-0027 §D8. |

### ADR-0028

| Gate | Tier | Primary File | Brief |
|------|------|--------------|-------|
| `G-28-LIBRARY-IS-I18NEXT` | **CI** | [`spec/00-adrs/0028-i18n-locale-strategy.md`](./00-adrs/0028-i18n-locale-strategy.md) | `package.json` MUST list `react-i18next` and `i18next`; CI denies `react-intl`/`lingui`/`@formatjs/*` imports or deps. ADR-0028 §D1. |
| `G-28-NO-HTML-IN-JSON` | **CI** | [`spec/00-adrs/0028-i18n-locale-strategy.md`](./00-adrs/0028-i18n-locale-strategy.md) | Pre-commit hook greps every `locales/**/*.json` for `<` / `>` / `&[a-z]+;` and fails. Use `<Trans>` component for inline markup. ADR-0028 §D9. |
| `G-28-INTL-EXPLICIT-LOCALE` | **CI** | [`spec/00-adrs/0028-i18n-locale-strategy.md`](./00-adrs/0028-i18n-locale-strategy.md) | ESLint rule: `.toLocaleString()` / `.toLocaleDateString()` calls without an explicit first arg fail. ADR-0028 §D7. |
| `G-28-TYPED-KEYS` | **CI** | [`spec/00-adrs/0028-i18n-locale-strategy.md`](./00-adrs/0028-i18n-locale-strategy.md) | `tsc --noEmit` MUST fail if `t('foo.bar')` references an unknown key (TS module augmentation per D8). ADR-0028 §D8. |
| `G-28-MISSING-KEY-LOGGED` | **TEST** | [`spec/00-adrs/0028-i18n-locale-strategy.md`](./00-adrs/0028-i18n-locale-strategy.md) | Test fakes a missing key; assert one entry hits the error logger with category `Frontend`. ADR-0028 §D5. |
| `G-28-FALLBACK-CHAIN` | **TEST** | [`spec/00-adrs/0028-i18n-locale-strategy.md`](./00-adrs/0028-i18n-locale-strategy.md) | Acceptance test: request `es-MX` → assert `es` then `en` are tried in order; final string is `en` text when `es` lacks the key. ADR-0028 §D5. |
| `G-28-RTL-DIR-ATTR` | **TEST** | [`spec/00-adrs/0028-i18n-locale-strategy.md`](./00-adrs/0028-i18n-locale-strategy.md) | Switch to `ar`; assert `document.documentElement.dir === 'rtl'` and `lang === 'ar'`. ADR-0028 §D6. |
| `G-28-DETECTION-ORDER` | **TEST** | [`spec/00-adrs/0028-i18n-locale-strategy.md`](./00-adrs/0028-i18n-locale-strategy.md) | All 5 detection tiers covered by a parameterised test; tier-1 `?locale=` overrides every other tier. ADR-0028 §D3. |
| `G-28-LOCALE-WRITE-VIA-QUEUE` | **DOC-NORM** | [`spec/00-adrs/0028-i18n-locale-strategy.md`](./00-adrs/0028-i18n-locale-strategy.md) | Locale change MUST go through the offline FIFO queue — no direct `fetch` to `OwnerSettings`. ADR-0028 §D10. |
| ~~`G-28-NO-PHYSICAL-MARGINS`~~ | **— (superseded)** | [`spec/00-adrs/0028-i18n-locale-strategy.md`](./00-adrs/0028-i18n-locale-strategy.md) | **Superseded by `G-12-LOGICAL-MARGINS-PADDING` + `G-12-LOGICAL-INSET`** (ADR-0012 §D7). Retained for traceability. |
| ~~`G-28-NO-PHYSICAL-ALIGN`~~ | **— (superseded)** | [`spec/00-adrs/0028-i18n-locale-strategy.md`](./00-adrs/0028-i18n-locale-strategy.md) | **Superseded by `G-12-LOGICAL-TEXT-ALIGN`** (ADR-0012 §D7). Retained for traceability. |

### ADR-0031

| Gate | Tier | Primary File | Brief |
|------|------|--------------|-------|
| `G-31-NO-MIRROR-ENUM` | **DOC** | [`spec/18-spec-issues/00-overview.md`](./18-spec-issues/00-overview.md) | - Added gate G-31-NO-MIRROR-ENUM in CI that fails on any reintroduction. |
| `G-31-NO-PARALLEL-NODE` | **DOC** | [`spec/00-overview.md`](./00-overview.md) | Enforces ADR-0008 — Unified Node interface + 250-item per-view limit. |
| `G-31-NODE-ID-PERSISTENT` | **DOC** | [`spec/00-overview.md`](./00-overview.md) | Enforces ADR-0008 — Unified Node interface + 250-item per-view limit. |
| `G-31-NODE-INTERFACE-CANONICAL` | **DOC-NORM** | [`spec/00-adrs/0008-unified-item-node-interface.md`](./00-adrs/0008-unified-item-node-interface.md) | - G-31-NODE-INTERFACE-CANONICAL — enforces D1 (mandatory fields, |
| `G-31-ROOT-SINGLETON` | **DOC** | [`spec/00-adrs/0008-unified-item-node-interface.md`](./00-adrs/0008-unified-item-node-interface.md) | - G-31-ROOT-SINGLETON — enforces D3 (exactly one parentId === null, |
| `G-31-VIEW-250-CAP` | **DOC** | [`spec/00-adrs/0008-unified-item-node-interface.md`](./00-adrs/0008-unified-item-node-interface.md) | - G-31-VIEW-250-CAP — enforces D4 (no default view renders > 250 |

### ADR-0032

| Gate | Tier | Primary File | Brief |
|------|------|--------------|-------|
| `G-32-A11Y-CONTRAST` | **DOC** | [`spec/32-ui-design/00-overview.md`](./32-ui-design/00-overview.md) | 4. Verify contrast ratio ≥ 4.5:1 in both modes (gate G-32-A11Y-CONTRAST). |
| `G-32-AXIOS-EXACT-PIN` | **DOC-NORM** | [`spec/00-adrs/0011-axios-only-http-client.md`](./00-adrs/0011-axios-only-http-client.md) | - G-32-AXIOS-EXACT-PIN — enforces D3 (package.json value MUST be |
| `G-32-AXIOS-ONLY` | **DOC** | [`spec/00-adrs/0011-axios-only-http-client.md`](./00-adrs/0011-axios-only-http-client.md) | - G-32-AXIOS-ONLY — enforces D1 (no fetch / XHR / alternative |
| `G-32-AXIOS-SINGLETON` | **DOC** | [`spec/00-adrs/0011-axios-only-http-client.md`](./00-adrs/0011-axios-only-http-client.md) | - G-32-AXIOS-SINGLETON — enforces D2 (one instance, canonical path |
| `G-32-DARK-MODE-PARITY` | **DOC** | [`spec/00-overview.md`](./00-overview.md) | [0003](./00-adrs/0003-react-19-ts-strict-frontend.md) Vite 5.4 + React 19 + TS 5.6 (strict) + Tailwind v4 frontend Acce |
| `G-32-HSL-ONLY-TOKENS` | **DOC** | [`spec/00-adrs/0012-tailwind-v4-theme-block-token-registry.md`](./00-adrs/0012-tailwind-v4-theme-block-token-registry.md) | - G-32-HSL-ONLY-TOKENS — enforces D3 (no hsl() wrapper, no hex, |
| `G-32-LICENSE-FILES-PRESENT` | **CI** (WARN-only — see graduation ledger) | [`spec/00-adrs/0032-license-decision.md`](./00-adrs/0032-license-decision.md) | Enforces ADR-0032 D1–D3: repo root MUST contain `LICENSE` (GPL-2.0-or-later full text), `LICENSE-SPEC` (CC-BY-4.0 full text), and `TRADEMARK.md` (project-name policy). Runner skeleton: `scripts/spec-hygiene/75-check-license-files-present.mjs` (warn-only until first F-IMPL cycle lands the three files; flips HARD on `targetDate` per [`_GATE-GRADUATION-LEDGER.md`](./_GATE-GRADUATION-LEDGER.md)). NOTE: `G-32-*` prefix is overloaded across ADR-0011/ADR-0012/ADR-0032 + 32-ui-design — pre-existing convention; no rename. |
| `G-32-NO-CLIENT-WRAPPER-FACADE` | **DOC** | [`spec/00-adrs/0011-axios-only-http-client.md`](./00-adrs/0011-axios-only-http-client.md) | - G-32-NO-CLIENT-WRAPPER-FACADE — enforces D5 (no fetch-shaped |
| `G-32-NO-INLINE-STYLE` | **DOC** | [`spec/00-adrs/0003-react-19-ts-strict-frontend.md`](./00-adrs/0003-react-19-ts-strict-frontend.md) | - G-32-NO-INLINE-STYLE (no inline style={{…}} for token values) |
| `G-32-NO-RAW-COLORS` | **DOC** | [`spec/00-adrs/0003-react-19-ts-strict-frontend.md`](./00-adrs/0003-react-19-ts-strict-frontend.md) | - G-32-NO-RAW-COLORS (Tailwind v4 @theme token enforcement; see |
| `G-32-NO-SECOND-STYLING-SYSTEM` | **DOC** | [`spec/00-overview.md`](./00-overview.md) | [0012](./00-adrs/0012-tailwind-v4-theme-block-token-registry.md) Tailwind v4 @theme block sole token registry; HSL-only |
| `G-32-NO-TAILWIND-CONFIG` | **DOC** | [`spec/00-adrs/0012-tailwind-v4-theme-block-token-registry.md`](./00-adrs/0012-tailwind-v4-theme-block-token-registry.md) | violation of G-32-NO-TAILWIND-CONFIG. |
| `G-32-SEMANTIC-NAMING` | **DOC** | [`spec/00-adrs/0003-react-19-ts-strict-frontend.md`](./00-adrs/0003-react-19-ts-strict-frontend.md) | - G-32-SEMANTIC-NAMING (token names describe purpose, not hue) |
| `G-32-TOKEN-REGISTRY` | **DOC** | [`spec/00-adrs/0012-tailwind-v4-theme-block-token-registry.md`](./00-adrs/0012-tailwind-v4-theme-block-token-registry.md) | - G-32-TOKEN-REGISTRY — enforces D2 (single @theme block in |
| `G-32-VARIANT-SEMANTIC-ONLY` | **DOC** | [`spec/00-adrs/0012-tailwind-v4-theme-block-token-registry.md`](./00-adrs/0012-tailwind-v4-theme-block-token-registry.md) | color is a hard violation of G-32-VARIANT-SEMANTIC-ONLY. |

### ADR-0033

| Gate | Tier | Primary File | Brief |
|------|------|--------------|-------|
| `G-33-CATEGORY-ENUM` | **DOC** | [`spec/33-feedback-report/00-overview.md`](./33-feedback-report/00-overview.md) | pre-selected (gate G-33-CATEGORY-ENUM). |
| `G-33-NO-CONTENT-BODY` | **DOC** | [`spec/33-feedback-report/00-overview.md`](./33-feedback-report/00-overview.md) | Content body (gate G-33-NO-PII, G-33-NO-CONTENT-BODY). |
| `G-33-NO-PII` | **DOC** | [`spec/33-feedback-report/00-overview.md`](./33-feedback-report/00-overview.md) | Content body (gate G-33-NO-PII, G-33-NO-CONTENT-BODY). |
| `G-33-RATE-LIMIT` | **DOC** | [`spec/33-feedback-report/00-overview.md`](./33-feedback-report/00-overview.md) | Skipping rate limit → unlimited reports per minute Spam vector; DoS on maintainers G-33-RATE-LIMIT |
| `G-33-RECEIPT` | **DOC** | [`spec/33-feedback-report/00-overview.md`](./33-feedback-report/00-overview.md) | 5. UI shows toast with ReportId for follow-up (gate G-33-RECEIPT). |

### ADR-0034

| Gate | Tier | Primary File | Brief |
|------|------|--------------|-------|
| `G-34-FANOUT-RESPECTS-ACL` | **DOC** | [`spec/34-activity-feed/00-overview.md`](./34-activity-feed/00-overview.md) | receives the event in their feed query (gate G-34-FANOUT-RESPECTS-ACL). |
| `G-34-IDEMPOTENT` | **DOC** | [`spec/34-activity-feed/00-overview.md`](./34-activity-feed/00-overview.md) | event (gate G-34-IDEMPOTENT). |
| `G-34-RETENTION-90D` | **DOC** | [`spec/34-activity-feed/00-overview.md`](./34-activity-feed/00-overview.md) | (gate G-34-RETENTION-90D). |
| `G-34-SERVER-TIME` | **DOC** | [`spec/34-activity-feed/00-overview.md`](./34-activity-feed/00-overview.md) | Using local clock for OccurredAtUtc Clock skew ⇒ out-of-order feed G-34-SERVER-TIME |
| `G-34-VERB-DICTIONARY` | **DOC** | [`spec/34-activity-feed/00-overview.md`](./34-activity-feed/00-overview.md) | to localize text — never inline strings (gate G-34-VERB-DICTIONARY). |

### ADR-0035

| Gate | Tier | Primary File | Brief |
|------|------|--------------|-------|
| `G-35-AUDIT-TRAIL` | **DOC** | [`spec/35-enforcement-rules/00-overview.md`](./35-enforcement-rules/00-overview.md) | (gate G-35-AUDIT-TRAIL). |
| `G-35-ERR-CODE-ENUM` | **DOC** | [`spec/35-enforcement-rules/00-overview.md`](./35-enforcement-rules/00-overview.md) | (gate G-35-ERR-CODE-ENUM). |
| `G-35-EXPECTED-ERRORS` | **DOC** | [`spec/35-enforcement-rules/00-overview.md`](./35-enforcement-rules/00-overview.md) | Hard 500 with stack trace Unhandled = bug, not enforcement G-35-EXPECTED-ERRORS |
| `G-35-NO-SILENT-TRUNCATION` | **DOC** | [`spec/35-enforcement-rules/00-overview.md`](./35-enforcement-rules/00-overview.md) | Returning 200 with truncated 250 items, no warning Silent data loss; user thinks tree is shorter than it is G-35-NO-SIL |
| `G-35-PROVIDE-ESCAPE-HATCH` | **DOC** | [`spec/35-enforcement-rules/00-overview.md`](./35-enforcement-rules/00-overview.md) | or open the Board view (which paginates) — gate G-35-PROVIDE-ESCAPE-HATCH. |
| `G-35-SINGLE-SOURCE` | **DOC** | [`spec/35-enforcement-rules/00-overview.md`](./35-enforcement-rules/00-overview.md) | (gate G-35-SINGLE-SOURCE). |
| `G-35-USER-MESSAGE` | **DOC** | [`spec/35-enforcement-rules/00-overview.md`](./35-enforcement-rules/00-overview.md) | "Too many items to display — refine with search" (gate G-35-USER-MESSAGE). |

### ADR-0036

| Gate | Tier | Primary File | Brief |
|------|------|--------------|-------|
| `G-36-CLIENT-NO-ROLE` | **DOC-NORM** | [`spec/36-user-management/00-overview.md`](./36-user-management/00-overview.md) | Admin status MUST NOT be read from client-side storage (localStorage, sessionStorage, cookies). Gate G-36-CLIENT-NO-ROL |
| `G-36-HAS-ROLE-DEFINER` | **DOC** | [`spec/36-user-management/00-overview.md`](./36-user-management/00-overview.md) | Implement Auth::hasRole as a plain SQL view (not SECURITY DEFINER) RLS recursion — query inside the policy queries th. |
| `G-36-NO-HARDCODE-ADMIN` | **DOC** | [`spec/36-user-management/00-overview.md`](./36-user-management/00-overview.md) | Hardcode an admin email/UUID in PHP Cannot be rotated; lost-key disaster. |
| `G-36-NO-ROLE-COLUMN` | **DOC-NORM** | [`spec/36-user-management/00-overview.md`](./36-user-management/00-overview.md) | Roles live only in UserRole (separate table). NEVER on User or UserProfile. Gate G-36-NO-ROLE-COLUMN (DDL lint rejects |
| `G-36-NO-SELF-ROLE` | **DOC-NORM** | [`spec/36-user-management/00-overview.md`](./36-user-management/00-overview.md) | Self-assign a role via POST /users/{me}/roles Privilege escalation by the user themselves. |
| `G-36-PASSWORD-WRITE-ONLY` | **DOC-NORM** | [`spec/36-user-management/00-overview.md`](./36-user-management/00-overview.md) | Passwords are write-only — never appear in any response envelope. Gate G-36-PASSWORD-WRITE-ONLY (response-schema test: |
| `G-36-SESSION-MIN` | **DOC-NORM** | [`spec/36-user-management/00-overview.md`](./36-user-management/00-overview.md) | Sessions store opaque tokens only — no role is baked into JWT/session payloads (must re-check). Gate G-36-SESSION-MIN. |
| `G-36-VIA-HAS-ROLE` | **CI** | [`spec/36-user-management/00-overview.md`](./36-user-management/00-overview.md) | Role checks go through Auth::hasRole(int $userId, AppRole $role): bool — a SECURITY DEFINER SQL function. Gate G-36-VIA |

### Spec-Authoring

| Gate | Tier | Primary File | Brief |
|------|------|--------------|-------|
| `G-01-AT-ID-FORMAT-CANONICAL` | **CI** | [`spec/01-spec-authoring-guide/97-acceptance-criteria.md`](./01-spec-authoring-guide/97-acceptance-criteria.md) | Every acceptance-test ID in `spec/**/97-acceptance-criteria.md` MUST match `^AT-[A-Z][A-Z0-9]*(-[A-Z0-9]+)*-[GA-Z]?[0-9]{2,3}$`. Legacy `AC-NNN` form is forbidden (sweep closed 2026-04-29 at 0/2,387). Carve-out: matches inside fenced code blocks (```…```) and inline `code spans` are exempt — the lint MUST strip those before regex application. Failure mode: CI lint reports each offending file:line with the offending token. |
| `G-NS-NO-DEPRECATED-ALIAS` | **CI** | [`spec/01-spec-authoring-guide/97-acceptance-criteria.md`](./01-spec-authoring-guide/97-acceptance-criteria.md) | Forbids any new AT row using one of the 17 deprecated namespace aliases (`AT-DESIGNSYSTEM-`, `AT-UIDS-`, `AT-MIRRORS-`, `AT-WORKFLOW-`, `AT-CODINGGUIDELINES-`, `AT-MASTERCODINGGUIDELINES-`, `AT-ERRORMANAGE-`, `AT-RESTAPICONVENTIONS-`, `AT-TYPESCRIPT-`, `AT-GOLANG-`, `AT-PHP-`, `AT-ENUMSPECIFICATION-`, `AT-OPERATORRUNBOOKS-`, `AT-RATE-`, `AT-VISUALRENDER-`, `AT-CONSOLIDATEDREVIEWGUIDE-`, `AT-SR-`-collision-with-`AT-SERVERRESPONSE-` — pending §17 reconciliation per ADR-0024). Canonical SSOT: `.lovable/memory/audit/at-namespace-synonym-audit.md`. Same code-span/fenced-block carve-out as `G-01-AT-ID-FORMAT-CANONICAL`. Failure mode: CI lint reports each offending file:line and points to canonical. Existing legacy rows are exempted via dated allow-list (`spec/_LEDGER-G-NS-LEGACY-EXEMPT.md`) until P3 consolidation sweep retires them. |
| `G-NS-STATUS-IN-LEGEND` | **CI** | [`spec/01-spec-authoring-guide/97-acceptance-criteria.md`](./01-spec-authoring-guide/97-acceptance-criteria.md) | Every `**Status:**` line in `spec/**/*.md` MUST resolve to one of the 9 canonical tokens (`DRAFT|REVIEW|CANONICAL|COMPANION|DISPATCH|DEFERRED|DEPRECATED|REDIRECT|ARCHIVED`). Optional parenthetical qualifier permitted. SSOT: `spec/01-spec-authoring-guide/22-status-legend.md` §1; mapping table in §2; audit ledger `.lovable/memory/audit/at-status-legend-audit.md`. Same code-span/fenced-block carve-out as the other `G-NS-*` and `G-01-*` gates. **WARN-only initial mode** until P3 status sweep retires the 46 legacy values; flag flips to hard-fail when legacy count reaches 0. |
| `G-NS-ADR-MUST-HAS-AT` | **CI** | [`spec/01-spec-authoring-guide/97-acceptance-criteria.md`](./01-spec-authoring-guide/97-acceptance-criteria.md) | Every ADR in `spec/00-adrs/` whose body contains ≥5 `MUST`/`SHALL` rules MUST be cited by ≥1 `97-acceptance-criteria.md` row using `ADR-NNNN` token or path link. As of 2026-04-29: 23 ADRs uncited (285 orphaned MUSTs); ADR-0026 closed via `AT-APP-108..110`. SSOT: `.lovable/memory/audit/at-prose-must-shall-sweep.md`; allow-list ledger: `spec/_LEDGER-G-NS-ADR-COVERAGE.md` (90-day TTL). Same code-span/fenced-block carve-out. **WARN-only initial mode** until AUDIT-03 backfill (#1) empties allow-list; flag flips to hard-fail when allow-list is empty. ADRs with <5 MUSTs are exempt. |
| `G-01-DOD-NO-NN-PLACEHOLDER` | **CI** | [`spec/01-spec-authoring-guide/97-acceptance-criteria.md`](./01-spec-authoring-guide/97-acceptance-criteria.md) | Forbids non-testable placeholders in Definition-of-Done blocks (template rule §5). Three banned patterns inside any DoD block (`**Definition of Done**` → next `---`/`## `/`> Authoring`) of `spec/**/00-overview.md`: literal `AT-[A-Z]+-NN` ranges, broken xref `see this section's  once authored`, and `_AT rows pending —` prose. Canonical replacement form: `Every \`AT-<SECTION>-*\` row in \`97-acceptance-criteria.md\` passes`. Same code-span/fenced-block carve-out as other `G-01-*` gates. Audit-document table titles outside DoD blocks are scope-exempt. SSOT: `.lovable/memory/audit/at-dod-range-sweep.md`. Hard-fail from day 1 (sweep closed 13/13 on 2026-04-29). |
| `G-01-DOD-CONDENSED-MIRRORS-OVERVIEW` | **CI** | [`spec/01-spec-authoring-guide/97-acceptance-criteria.md`](./01-spec-authoring-guide/97-acceptance-criteria.md) | For every directory containing both `00-overview.md` and `00-overview-condensed.md` (currently 5: `02-coding-guidelines`, `03-error-manage`, `15-wp-plugin-how-to`, `31-app`, `32-ui-design`), the Definition-of-Done block MUST hash-match across both siblings. Enforces template rule §6 ("DoD lives in overview only — sub-files MUST NOT duplicate"). **WARN-only** initial mode (baseline confirmed clean 2026-04-29); promotion to hard-fail deferred until next overview-condensation pass. SSOT: `.lovable/memory/audit/at-dod-range-sweep.md` §"Sibling-mirror baseline". |
| `G-09-OVERVIEW-H1-MATCHES-FOLDER-INDEX` | **CI** | [`spec/01-spec-authoring-guide/97-acceptance-criteria.md`](./01-spec-authoring-guide/97-acceptance-criteria.md) | **Hard-fail mandatory (Phase 3 active 2026-04-29)**: every numeric-folder `spec/**/00-overview.md` (top-level + sub-overview) H1 MUST match `^# (\d{2,3})\b — ` and the captured prefix MUST equal the parent folder's leading numeric prefix. Phase history: P1 = WARN conditional (1/25 baseline at top-level); P2-top = top-level sweep authored prefixes in 24 files (audit ledger `.lovable/memory/audit/at-h1-prefix-sweep.md`); P2-sub = sub-overview sweep authored prefixes in 119 files (audit ledger `.lovable/memory/audit/at-sub-overview-h1-and-scoring-gate.md`); P3 = current — both presence and value enforced across all 144 numeric-folder overviews. Closes audit-issue-#6 regression class. Per-ADR files in `spec/00-adrs/` (`# ADR-NNNN — Title`) exempt — only that folder's own `00-overview.md` is in scope. 6 non-numeric sub-folders (`consolidated-review-guide`, `app-issues`, `diagrams`, two `skeletons`, `sql`) automatically scope-exempt (no numeric prefix to match). |
| `G-00-OVERVIEW-SCORING-TABLE-PRESENT` | **CI** | [`spec/01-spec-authoring-guide/97-acceptance-criteria.md`](./01-spec-authoring-guide/97-acceptance-criteria.md) | Every top-level `spec/[0-9][0-9]-*/00-overview.md` MUST contain at least one of: `^(##|###)\s+Scoring\b`, `^\*\*Scoring\*\*`, or `^\| Criterion \|`. Sub-overview files are out of scope (Scoring lives at section root only). Fenced-code-block carve-out applies (Scoring inside a code fence doesn't count). **Hard-fail from day 1** — baseline 2026-04-29: 25 of 25 top-level overviews already compliant; gate locks in today's clean state. SSOT: `.lovable/memory/audit/at-sub-overview-h1-and-scoring-gate.md` Part 2. Future companion `G-00-OVERVIEW-SCORING-TABLE-COMPLETE` (deferred) would enforce specific row presence once canonical scoring schema is ratified. |
| `G-00-OVERVIEW-AI-CONTRACT-PRESENT` | **CI** | [`spec/01-spec-authoring-guide/97-acceptance-criteria.md`](./01-spec-authoring-guide/97-acceptance-criteria.md) | Every top-level `spec/[0-9][0-9]-*/00-overview.md` MUST contain a heading line matching `^(##|###)\s+AI Contract\b`. Bare phrase in body prose does NOT count — must be a real section heading. **Dual-tier:** hard-fail at top-level (25 files), WARN-only at sub-overview tier (125 files). Fenced-code-block carve-out applies. **Clean baseline 2026-04-29: 25/25 top-level compliant** — gate ships hard-fail at top-level from day 1. Sub-overview WARN-tier surfaces signal without blocking; promotion to hard-fail deferred until sub-overview AI-Contract sweep is scoped. Per-ADR files in `spec/00-adrs/` exempt — only that folder's own `00-overview.md` is in scope. SSOT: `spec/01-spec-authoring-guide/18-ai-contract-template.md`. Completes the **overview-root contract trio** with `G-09-OVERVIEW-H1-MATCHES-FOLDER-INDEX` (H1) and `G-00-OVERVIEW-SCORING-TABLE-PRESENT` (Scoring). |
| `G-13-AUDIT-RUNNER-CONTRACT` | **CI** | [`spec/01-spec-authoring-guide/97-acceptance-criteria.md`](./01-spec-authoring-guide/97-acceptance-criteria.md) | Locks invariants of the spec-hygiene runner so the registry's `**CI**`-tier label is trustworthy. Six rules (all hard-fail): (1) `scripts/spec-hygiene/00-run-all.mjs` MUST exist as the single entry point with a top-level `checks` array; (2) runner MUST aggregate non-zero exits via `process.exit(1)` after the loop; (3) no silent skips — `try`/`catch` around `spawnSync` that swallows failures without `failed++` is forbidden; (4) every entry in `checks` MUST resolve to an existing file on disk (no stale entries pointing at deleted scripts); (5) `.github/workflows/spec-hygiene.yml` MUST invoke `node scripts/spec-hygiene/00-run-all.mjs` (per-script CI invocation forbidden); (6) every `\d{2}-check-*.mjs` checker file in `scripts/spec-hygiene/` MUST appear in the `checks` array (whitelist of helper/generator scripts exempt). **Clean baseline 2026-04-29:** runner exists, aggregates via line 55, wires 32 checker scripts, CI workflow invokes the runner. SSOT: `.lovable/memory/audit/at-audit-runner-contract.md`. Future companion `G-13-AUDIT-RUNNER-PARITY` (deferred) would assert runner-array length parity with CI-tier registry rows. |
| `G-00-OVERVIEW-AI-CONTRACT-COMPLETE` | **CI** | [`spec/01-spec-authoring-guide/97-acceptance-criteria.md`](./01-spec-authoring-guide/97-acceptance-criteria.md) | Locks the canonical 5-subsection schema inside every top-level `## AI Contract` block. Five rules: (1) all five bold-prefix subsections present — `**Purpose**`, `**Audience**`, `**Expected AI Output**`, `**Out of Scope**`, `**Definition of Done**`; (2) canonical order; (3) non-empty bodies; (4) every `**Out of Scope**` bullet contains a markdown link; (5) every `**Definition of Done**` bullet cites an `AT-*` ID, `G-*` gate, script path, or runner invocation. **Hard-fail rules 1+2 from day 1; rules 3–5 WARN-only** until first content-quality sweep. **Clean baseline 2026-04-29: 25/25 top-level overviews carry all 5 subsections in canonical order.** Sub-overviews out of scope (Authoring rule §6: contract lives in overview only, sub-files inherit). Fenced-code-block + `18-ai-contract-template.md` carve-out. SSOT: `spec/01-spec-authoring-guide/18-ai-contract-template.md` §"Required block" + §"Authoring rules". Audit ledger: `.lovable/memory/audit/at-overview-ai-contract-complete-gate.md`. Closes the gaming-loop on `G-00-OVERVIEW-AI-CONTRACT-PRESENT` (heading-only blocks now rejected). |
| `G-00-OVERVIEW-SCORING-TABLE-COMPLETE` | **CI** | [`spec/01-spec-authoring-guide/97-acceptance-criteria.md`](./01-spec-authoring-guide/97-acceptance-criteria.md) | Mirrors `G-00-OVERVIEW-AI-CONTRACT-COMPLETE` for the Scoring side. Three rules: (1) Scoring block MUST contain three canonical row tokens — `AI Confidence`/`AI Implementability`, `Ambiguity`, `Health Score`/`Overall`/`Total`; (2) **Health Score row** MUST carry a parseable numeric (`\d{1,3}%`, `\d{1,3}/\d{1,3}`, or `[A-F][+\-]?` grade) — AI Confidence/Ambiguity rows exempt because their canonical values are tokens (per Layer-2.5 gate `…-VALUE-FORMAT`), not numerics; (3) Health/Overall/Total row MUST be last. **All three rules hard-fail from 2026-04-29** (Rule 3 promoted from WARN-only after baseline 25/25 confirmed clean at promotion time). Runner: `scripts/spec-hygiene/20-check-scoring-table-complete.mjs` (slot 20). Block-finder prefers `### Scoring` heading over `^| Criterion |` table marker so rubric tables don't shadow values blocks. SSOT: `spec/01-spec-authoring-guide/14-scoring-metrics.md`. Audit ledger: `.lovable/memory/audit/at-overview-scoring-complete-gate.md` (updated post-Rule-3-promotion). Completes Layer-2 of the trio (paired with `…-AI-CONTRACT-COMPLETE`). |
| `G-00-OVERVIEW-SCORING-VALUE-FORMAT` | **CI** | [`spec/01-spec-authoring-guide/97-acceptance-criteria.md`](./01-spec-authoring-guide/97-acceptance-criteria.md) | Layer-2.5 of the overview trio: locks one canonical value shape per Scoring row so a single regex can extract scores corpus-wide. **Four rules, all hard-fail from 2026-04-29:** (1) Health Score / Overall / Total value MUST match `^\d{1,3}%\s\([A-F][+\-]?\)$` (e.g. `95% (A)`) — `100/100` denominator and decoration FORBIDDEN; (2) AI Confidence value MUST be one of `{Very High, High, Medium, Low, Very Low}` exact case, no emoji/prose trailer (legacy `Production-Ready` mapped to `Very High`); (3) Ambiguity value MUST be one of `{None, Low, Medium, High, Very High}` exact case, no emoji; (4) **single Scoring section per file** — exactly 1 `^(##|###)\s+Scoring\b` heading; per-feature criterion grids MUST use `## Quality Breakdown` or `## Per-Feature Scoring`. **Baseline 25/25 clean** after two sweeps: value-format normalized 10 cells across 5 files (`03`/`05`/`06`/`07`/`12`); dedupe renamed `08`'s second Scoring → `## Quality Breakdown` and removed stale boilerplate dupe blocks in `34`/`36` (rationale preserved as blockquote). Linter walks **all** Scoring blocks (the previous "first block per file" carve-out was retired post-dedupe — Rule 4 makes it redundant). Sub-overviews out of scope. Fenced-code carve-out. SSOT: `spec/01-spec-authoring-guide/14-scoring-metrics.md`. Audit ledger: `.lovable/memory/audit/at-overview-scoring-value-format-gate.md` (post-dedupe). Completes Layer-2.5 (no AI Contract counterpart by design — bodies are prose). |
| `G-00-ADR-CONSEQUENCES-XLINK` | **CI** | [`spec/00-adrs/97-acceptance-criteria.md`](./00-adrs/97-acceptance-criteria.md) | Enforces `AT-ADR-009`: every ADR's `## Consequences` section MUST contain ≥1 markdown link pointing into a downstream `spec/` scope (non-ADR target). Sibling ADR links (`NNNN-*.md`) do NOT count — they're horizontal, not downstream. Runner: `scripts/spec-hygiene/52-check-adr-consequences-xlink.mjs`. **HARD-FAIL** (graduated 2026-04-29 — first entry in `_GATE-GRADUATION-LEDGER.md` "Graduated entries" table; allow-list ledger empty since baseline). Each ADR enriched with a downstream xlink in Consequences removes its row from `_LEDGER-G-00-ADR-CONSEQUENCES-XLINK-BASELINE.md` (90-day TTL, currently 0 rows). Companion to `G-NS-ADR-MUST-HAS-AT` (citation side) and `G-00-ADR-XLINK-SYMMETRY` (Related-ADRs side). |
| `G-00-OVERVIEW-SCORING-VALUES-FRESH` | **CI** | [`spec/01-spec-authoring-guide/97-acceptance-criteria.md`](./01-spec-authoring-guide/97-acceptance-criteria.md) | Layer-2.6 of the overview Scoring trio: catches **stale Scoring tables** that haven't been re-evaluated even as the spec underneath churns. Heuristic: for every top-level overview with a Scoring block, take max(`> **Updated:** YYYY-MM-DD`, `> Scoring fresh as of YYYY-MM-DD`). WARN at >90 days; HARD-FAIL at >180 days (currently flag-gated to flip on 2026-07-28 to give authors 90-day grace window). Runner: `scripts/spec-hygiene/53-check-scoring-values-fresh.mjs` (slot 53). Authors refresh the clock by adding `> Scoring fresh as of <today>` after re-evaluation, OR by bumping `**Updated:**`. Baseline 2026-04-29: 21/25 fresh; 4 overviews lack date metadata (`00-adrs/`, `16-generic-cli/`, `34-activity-feed/`, `36-user-management/`) — surfaced as WARNs, tracked in `.lovable/memory/audit/at-overview-scoring-values-fresh.md`. Sub-overviews out of scope. Completes Layer-2.6 (closes the time-axis gap left open by 2.5). |
| `G-00-AUDIT-EXEMPTION-REVIEW` | **CI** | [`spec/00-adrs/97-acceptance-criteria.md`](./00-adrs/97-acceptance-criteria.md) §AT-ADR-G05 | Enforces 8 invariants on `spec/_AUDIT-EXEMPTIONS.md` (canonical false-positive ledger): **I1** file exists; **I2** exactly one `## Exemption rows` H2; **I3** header `pathGlob \| category \| rationale \| closes \| addedOn`; **I4** every `pathGlob` starts `spec/`; **I5** no blank-cheque globs (`spec/**`, `spec/**/*`, `spec/**/*.md`, `spec/*`, `**/*` forbidden); **I6** `closes` cites `AUD-*`/`F-AUDIT-NN`/`F-AUDxx-NN`/`ADR-NNNN`/`n/a`; **I7** `addedOn` ISO `YYYY-MM-DD`; **I8** prints `matches N/M files (P.P%)` for reviewer drift detection — locked by meta-test [`scripts/spec-hygiene/_tests/57.test.mjs`](../scripts/spec-hygiene/_tests/57.test.mjs) (wired into `00-run-all.mjs` 2026-04-29; negative-tested with tampered runner → exits 1; restored → exits 0). Warns when union of globs covers >10% of corpus. Runner: `scripts/spec-hygiene/57-check-audit-exemption-review.mjs`. Authoritative ADR: [`spec/00-adrs/0030-audit-exemption-manifest.md`](./00-adrs/0030-audit-exemption-manifest.md). Closes F-AUDIT-31 (LOW) from re-audit v2. Inaugural baseline: 8 rows, 53/1513 files (3.5%). Negative-tested: tampering row 2 to `spec/**` correctly trips I5; restoration → green. Caught real citation defect (`P22 plan` → `n/a`) on first run. |
| `G-00-AT-FIX-COMPANION-SHAPE` | **CI** (WARN-only until 2026-05-13) | [`spec/01-spec-authoring-guide/19-acceptance-criteria-io-table.md`](./01-spec-authoring-guide/19-acceptance-criteria-io-table.md) §"Companion-file pattern" | Enforces 7 invariants on every `spec/**/97a-acceptance-criteria-fixtures.md` (sweep file `spec/97a-…` excluded): **S1** companion has sibling `97-acceptance-criteria.md`; **S2** singleton per scope (filename literal); **S3** front-matter has `Version`/`Created`/`Status`/`Format SSOT`/`Closes`; **S4** exactly one `## Scope` H2; **S5** exactly one `## Verification` H2; **S6** exactly one `## Related` H2; **S7** parent `97-AC` `## Related` discoverability backlink. Closes F-AUDIT-32 (LOW) from re-audit v3 follow-up (#28). Runner: [`scripts/spec-hygiene/58-check-at-fix-companion-shape.mjs`](../scripts/spec-hygiene/58-check-at-fix-companion-shape.mjs). Baseline ledger: [`spec/_LEDGER-G-00-AT-FIX-COMPANION-SHAPE-BASELINE.md`](./_LEDGER-G-00-AT-FIX-COMPANION-SHAPE-BASELINE.md) waives 19 pre-existing companions (P2a–P2g sweep artifacts that pre-date the shape spec) for 14-day drain TTL. Inaugural state: 19 companions enumerated, 63 violations all waived; only `00-adrs/97a-…` (the file authored under the new spec in #17) is shape-clean. |
| `G-00-PLACEHOLDER-DENSITY` | **CI** (WARN-only until F-AUDIT-15 closes) | [`spec/_AUDIT-EXEMPTIONS.md`](./_AUDIT-EXEMPTIONS.md) | Caps per-scope placeholder density at **≤15%**, exemption-aware (consumes the same `pathGlob` rows validated by `G-00-AUDIT-EXEMPTION-REVIEW`). Placeholder heuristic mirrors the 2026-04-29 Gemini-2.5-Pro audit: file size <600 B OR body matches `/placeholder\|stub\|to be defined\|to-be-determined\|coming soon/i` (literal `T·B·D` token also matched). Per-scope = first-level dir under `spec/` (e.g. `00-adrs`, `31-app`); top-level files form synthetic scope `_root`. Visibility line (mandatory): `density <pct>% across <scopes> scope(s); cap 15%` — locked by meta-test [`scripts/spec-hygiene/_tests/59.test.mjs`](../scripts/spec-hygiene/_tests/59.test.mjs) (wired into `00-run-all.mjs` 2026-04-29; negative-tested by replacing `density` template token with `DRIFT` → exits 1; restored → exits 0). Runner: [`scripts/spec-hygiene/59-check-placeholder-density.mjs`](../scripts/spec-hygiene/59-check-placeholder-density.mjs). Inaugural baseline 2026-04-29: global density **11.8%** (matches audit v3 baseline exactly); 8 scopes over cap (`_root` 31.6%, `01-spec-authoring-guide` 29.6%, `08-docs-viewer-ui` 17.2%, `09-code-block-system` 28.6%, `13-cicd-pipeline-workflows` 33.3%, `18-spec-issues` 28.6%, `31-app` 17.0%, `36-user-management` 50.0%) — all tracked under tasks #2/#3/#4/#7. Mode flips to HARD-FAIL by setting `STRICT = true` in the runner once global ≤8% AND no scope >15%. Closes F-AUDIT-15 tooling-gap (cleanup remains scope-by-scope work). |
| `G-00-GRADUATION-LEDGER-FRESH` | **CI** | [`spec/_GATE-GRADUATION-LEDGER.md`](./_GATE-GRADUATION-LEDGER.md) | Schema gate for the gate-graduation ledger seeded 2026-04-29. Enforces 9 invariants: **L1** file exists; **L2** exactly one `## Entries` H2; **L3** header `gate \| mode \| flipCriterion \| flipMechanism \| targetDate \| addedOn \| linkedTask` (case-sensitive, in order); **L4** every gate ID well-formed AND found in `_GATE-REGISTRY.md` (no orphan rows); **L5** mode is `WARN` or `HARD-FAIL` verbatim; **L6** flipCriterion contains no ambiguous tokens (`eventually`/`soon`/`someday`/`T·B·D`/`to be determined`); **L7/L8** ISO `YYYY-MM-DD` dates; **L9** prints `tracking N WARN gate(s); M graduated` — locked by meta-test [`scripts/spec-hygiene/_tests/60.test.mjs`](../scripts/spec-hygiene/_tests/60.test.mjs) (wired into `00-run-all.mjs` 2026-04-29; negative-tested by replacing `tracking` template token with `DRIFT` → exits 1; restored → exits 0). Mirrors `G-00-AUDIT-EXEMPTION-REVIEW`'s role for `_AUDIT-EXEMPTIONS.md`. Runner: [`scripts/spec-hygiene/60-check-graduation-ledger-fresh.mjs`](../scripts/spec-hygiene/60-check-graduation-ledger-fresh.mjs). Inaugural baseline 2026-04-29: 8 WARN rows valid, 0 graduated. Negative-tested: replacing `2026-04-29` with `someday` correctly trips L6 AND L7; restoration → green. Closes task #37. |
| `G-00-GRADUATION-LEDGER-DATE-DRIFT` | **CI** | [`spec/_GATE-GRADUATION-LEDGER.md`](./_GATE-GRADUATION-LEDGER.md) | Date-freshness gate for the gate-graduation ledger. Companion to `G-00-GRADUATION-LEDGER-FRESH` (schema side). For every WARN row, compares `targetDate` against today (UTC): **HARD-FAIL** when `targetDate < today` (overdue — flip the gate or push the date with cited reason); **WARN** when `targetDate < today + 14 days` (due-soon — reviewer awareness); **PASS** otherwise. Visibility line (mandatory): `<O> overdue, <D> due-soon, <T> on-track` — locked by meta-test [`scripts/spec-hygiene/_tests/61.test.mjs`](../scripts/spec-hygiene/_tests/61.test.mjs) (wired into `00-run-all.mjs` 2026-04-29; negative-tested by replacing `overdue` template token with `STALE` → exits 1; restored → exits 0). Runner: [`scripts/spec-hygiene/61-check-graduation-ledger-date-drift.mjs`](../scripts/spec-hygiene/61-check-graduation-ledger-date-drift.mjs). Inaugural baseline 2026-04-29: 0 overdue, 0 due-soon, 8 on-track (earliest target: 2026-05-13 = `G-00-AT-FIX-COMPANION-SHAPE`). Negative-tested: backdating `G-00-AT-FIX-COMPANION-SHAPE` target to `2024-01-01` correctly trips overdue → exits 1; restoration → green. Closes task #40. |

### Domain-API

| Gate | Tier | Primary File | Brief |
|------|------|--------------|-------|
| `G-API-01` | **DOC** | [`spec/17-generic-update/99a-worked-example-fixtures.md`](./17-generic-update/99a-worked-example-fixtures.md) | Manifest with non-PascalCase keys gate G-API-01 |

### Domain-CLI

| Gate | Tier | Primary File | Brief |
|------|------|--------------|-------|
| `G-CLI-01` | **DOC** | [`spec/16-generic-cli/99a-worked-example-fixtures.md`](./16-generic-cli/99a-worked-example-fixtures.md) | Help text duplicated between --help output and README gate G-CLI-01 (auto-gen check) |
| `G-CLI-02` | **DOC** | [`spec/16-generic-cli/99a-worked-example-fixtures.md`](./16-generic-cli/99a-worked-example-fixtures.md) | Multiple flag libraries imported (e.g., commander + yargs) gate G-CLI-02 (single SSOT) |
| `G-CLI-03` | **DOC** | [`spec/16-generic-cli/99a-worked-example-fixtures.md`](./16-generic-cli/99a-worked-example-fixtures.md) | Error envelope on stdout instead of stderr gate G-CLI-03 (stdout/stderr separation) |
| `G-CLI-04` | **DOC** | [`spec/16-generic-cli/99a-worked-example-fixtures.md`](./16-generic-cli/99a-worked-example-fixtures.md) | console.log in non---format=text mode gate G-CLI-04 |

### Domain-DB

| Gate | Tier | Primary File | Brief |
|------|------|--------------|-------|
| `G-DB-01` | **DOC** | [`spec/05-split-db-architecture/99a-worked-example-fixtures.md`](./05-split-db-architecture/99a-worked-example-fixtures.md) | Anti-pattern: raw cross-DB JOIN written outside a Repository class. Detected by gate G-DB-01 (AST grep for FROM items\. |

### Domain-ERR

| Gate | Tier | Primary File | Brief |
|------|------|--------------|-------|
| `G-ERR-01` | **DOC** | [`spec/03-error-manage/99a-worked-example-fixtures.md`](./03-error-manage/99a-worked-example-fixtures.md) | {"error": "..."} flat string breaks parser, no Code/TraceId gate G-ERR-01 (envelope schema) |
| `G-ERR-02` | **DOC-NORM** | [`spec/03-error-manage/99a-worked-example-fixtures.md`](./03-error-manage/99a-worked-example-fixtures.md) | Throwing new Error(JSON.stringify(envelope)) in frontend loses prototype, breaks instanceof gate G-ERR-02 (custom AppEr |
| `G-ERR-03` | **DOC** | [`spec/03-error-manage/99a-worked-example-fixtures.md`](./03-error-manage/99a-worked-example-fixtures.md) | Logging Stack in production leaks code paths to attackers gate G-ERR-03 (NODE_ENV check) |
| `G-ERR-04` | **DOC** | [`spec/03-error-manage/99a-worked-example-fixtures.md`](./03-error-manage/99a-worked-example-fixtures.md) | Email un-redacted in Details.Email PII leak gate G-ERR-04 (regex scan in CI logs) |
| `G-ERR-05` | **DOC** | [`spec/03-error-manage/99a-worked-example-fixtures.md`](./03-error-manage/99a-worked-example-fixtures.md) | Reusing a Code across two domains violates registry uniqueness gate G-ERR-05 (registry build-time check) |

### Domain-MIRROR

| Gate | Tier | Primary File | Brief |
|------|------|--------------|-------|
| `G-MIRROR-CYCLE-PRECHECK` | **DOC** | [`spec/00-adrs/0005-mirror-as-peer-group.md`](./00-adrs/0005-mirror-as-peer-group.md) | - G-MIRROR-CYCLE-PRECHECK — every structural mutation that |
| `G-MIRROR-DISSOLVE-SINGLETON` | **DOC** | [`spec/00-adrs/0005-mirror-as-peer-group.md`](./00-adrs/0005-mirror-as-peer-group.md) | - G-MIRROR-DISSOLVE-SINGLETON — every detach workflow MUST |
| `G-MIRROR-LWW-TIEBREAK` | **DOC** | [`spec/00-adrs/0005-mirror-as-peer-group.md`](./00-adrs/0005-mirror-as-peer-group.md) | - G-MIRROR-LWW-TIEBREAK — every conflict-resolution code path |
| `G-MIRROR-NO-ITEMTYPE` | **DOC** | [`spec/00-overview.md`](./00-overview.md) | Enforces ADR-0005 — Mirror is a peer-group relation (not an ItemType). |
| `G-MIRROR-PEER-COLUMN` | **DOC** | [`spec/00-adrs/0005-mirror-as-peer-group.md`](./00-adrs/0005-mirror-as-peer-group.md) | - G-MIRROR-PEER-COLUMN — Item.PeerGroupId is the only |

### Domain-SPLIT

| Gate | Tier | Primary File | Brief |
|------|------|--------------|-------|
| `G-SPLIT-01` | **DOC** | [`spec/05-split-db-architecture/99a-worked-example-fixtures.md`](./05-split-db-architecture/99a-worked-example-fixtures.md) | Splitting before threshold (premature optimisation) gate G-SPLIT-01 (decision matrix lint) |
| `G-SPLIT-02` | **DOC** | [`spec/05-split-db-architecture/99a-worked-example-fixtures.md`](./05-split-db-architecture/99a-worked-example-fixtures.md) | ATTACH issued lazily (per-query) instead of once at connection open gate G-SPLIT-02 (ATTACH count per request = 0) |
| `G-SPLIT-03` | **DOC** | [`spec/05-split-db-architecture/99a-worked-example-fixtures.md`](./05-split-db-architecture/99a-worked-example-fixtures.md) | Editing db-split.json without atomic rename gate G-SPLIT-03 (file-watch test) |
| `G-SPLIT-04` | **DOC** | [`spec/05-split-db-architecture/99a-worked-example-fixtures.md`](./05-split-db-architecture/99a-worked-example-fixtures.md) | DETACH while transaction is open SQLite native error → gate G-SPLIT-04 |

### Domain-UPD

| Gate | Tier | Primary File | Brief |
|------|------|--------------|-------|
| `G-UPD-01` | **DOC** | [`spec/14-self-update-app-update/99a-worked-example-fixtures.md`](./14-self-update-app-update/99a-worked-example-fixtures.md) | cp -r instead of atomic mv -T torn write if process is killed mid-copy gate G-UPD-01 (grep for non-atomic copy in insta |
| `G-UPD-02` | **DOC** | [`spec/14-self-update-app-update/99a-worked-example-fixtures.md`](./14-self-update-app-update/99a-worked-example-fixtures.md) | Healthcheck without --max-time hangs indefinitely; never rolls back gate G-UPD-02 |
| `G-UPD-03` | **DOC** | [`spec/14-self-update-app-update/99a-worked-example-fixtures.md`](./14-self-update-app-update/99a-worked-example-fixtures.md) | sha256 check after swap system already running unverified code gate G-UPD-03 (order check in update.sh AST) |
| `G-UPD-04` | **DOC** | [`spec/17-generic-update/99a-worked-example-fixtures.md`](./17-generic-update/99a-worked-example-fixtures.md) | sha256 stored in URL fragment instead of Sha256 field gate G-UPD-04 (regex #sha256=) |

### Domain-AUDIT

| Gate | Tier | Primary File | Brief |
|------|------|--------------|-------|
| `G-A4-STREAM-SEPARATION` | **DOC-NORM** | [`spec/31-app/05-conventions/09-audit-log-policy.md`](./31-app/05-conventions/09-audit-log-policy.md) | Activity-feed, operational log, and audit log MUST be physically separate tables. Conflation violates least-privilege, bloats activity-feed pagination, and prevents tamper detection. |
| `G-A4-FORBIDDEN-CATEGORIES` | **DOC-NORM** | [`spec/31-app/05-conventions/09-audit-log-policy.md`](./31-app/05-conventions/09-audit-log-policy.md) | Item content edits, drag-reorders, search queries, and SSE keepalive metrics MUST NOT be written to the audit log — they belong in the activity feed or operational log. |
| `G-A4-RETENTION-FLOOR` | **DOC-NORM** | [`spec/31-app/05-conventions/09-audit-log-policy.md`](./31-app/05-conventions/09-audit-log-policy.md) | Records younger than the per-category minimum MUST NOT be deleted, even on owner request — answer `ERR_RETENTION_PROTECTED` (HTTP 409). |
| `G-A4-RETENTION-CEILING` | **DOC-NORM** | [`spec/31-app/05-conventions/09-audit-log-policy.md`](./31-app/05-conventions/09-audit-log-policy.md) | Records older than the per-category maximum MUST be deleted within 24 h of the cron schedule. No "indefinite" retention. |
| `G-A4-CANONICAL-JSON` | **DOC-NORM** | [`spec/31-app/05-conventions/09-audit-log-policy.md`](./31-app/05-conventions/09-audit-log-policy.md) | Hash-chain canonical JSON encoding (`JSON_UNESCAPED_SLASHES \| JSON_UNESCAPED_UNICODE \| JSON_PRESERVE_ZERO_FRACTION` + alphabetically sorted keys) MUST be identical between writer and verifier. |
| `G-A4-BACKUP-BEFORE-PURGE` | **DOC-NORM** | [`spec/31-app/05-conventions/09-audit-log-policy.md`](./31-app/05-conventions/09-audit-log-policy.md) | Backup procedure MUST snapshot the `audit_log` table before the purge cron runs. |
| `G-A4-COALESCE` | **DOC-NORM** | [`spec/31-app/05-conventions/09-audit-log-policy.md`](./31-app/05-conventions/09-audit-log-policy.md) | When per-minute quota is exceeded for a `(ActorOwnerId, Action)` pair, identical events MUST be merged into a single row with `Metadata.coalescedCount` and `Metadata.coalescedWindowEnd`; first event preserved verbatim. |
| `G-A4-CLIENT-NO-WRITE` | **DOC-NORM** | [`spec/31-app/05-conventions/09-audit-log-policy.md`](./31-app/05-conventions/09-audit-log-policy.md) | The frontend MUST NOT write audit events directly. All audit writes happen server-side as side-effects of authenticated mutations. |
| `G-A4-QUERY-CACHE-MAX` | **DOC-NORM** | [`spec/31-app/05-conventions/09-audit-log-policy.md`](./31-app/05-conventions/09-audit-log-policy.md) | Audit query responses MUST be cached for at most 60 s — audit data must always look fresh. |

### Domain-SCOPING

> Reserved gate IDs for the corpus-scoping SSOT. `G-NS-SCOPING-INVENTORY-COMPLETE`, `G-NS-SCOPING-STATUS-VALID`, `G-NS-SCOPING-LEGACY-NO-CITATIONS` already named in `spec/00-scoping.md` §"Hygiene Gate" with reserved CI-future tier per ADR-0031. Batch-6 (2026-04-29) registers them here for parser visibility and adds 5 new DOC-NORM gates for the inline normative claims in §"Classification Vocabulary" and §"Reclassification Procedure".

| Gate | Tier | Primary File | Brief |
|------|------|--------------|-------|
| `G-NS-SCOPING-INVENTORY-COMPLETE` | **DOC-NORM** | [`spec/00-scoping.md`](./00-scoping.md) | Every top-level directory and file under `spec/` (excluding `spec/00-scoping.md` itself) MUST appear in exactly one row of the inventory tables. Diff failures (missing rows or orphan files on disk) are CI errors. Future-CI per ADR-0031. |
| `G-NS-SCOPING-STATUS-VALID` | **DOC-NORM** | [`spec/00-scoping.md`](./00-scoping.md) | Each row's Status column MUST be one of `✅ Active`, `📦 Archived`, `🗑 Legacy`. Free-text statuses are CI errors. Future-CI per ADR-0031. |
| `G-NS-SCOPING-LEGACY-NO-CITATIONS` | **DOC-NORM** | [`spec/00-scoping.md`](./00-scoping.md) | Files under any 🗑 Legacy directory MUST NOT be cited from any ✅ Active file. Active→Legacy citations are CI errors. Future-CI per ADR-0031. |
| `G-NS-SCOPING-STATUS-REQUIRED` | **DOC-NORM** | [`spec/00-scoping.md`](./00-scoping.md) | Every top-level entry under `spec/` MUST carry exactly one of the three statuses (`✅ Active`, `📦 Archived`, `🗑 Legacy`). Status-less rows are forbidden. |
| `G-NS-SCOPING-AI-ACTIVE-CONSUME` | **DOC-NORM** | [`spec/00-scoping.md`](./00-scoping.md) | AI implementer behaviour for `✅ Active` rows: MUST consume; MUST emit code matching its acceptance criteria; MUST flag any cross-scope contradictions. |
| `G-NS-SCOPING-AI-ARCHIVED-NOEMIT` | **DOC-NORM** | [`spec/00-scoping.md`](./00-scoping.md) | AI implementer behaviour for `📦 Archived` rows: MAY consult for rationale; MUST NOT treat as a directive for new code. |
| `G-NS-SCOPING-AI-LEGACY-NOCONSUME` | **DOC-NORM** | [`spec/00-scoping.md`](./00-scoping.md) | AI implementer behaviour for `🗑 Legacy` rows: MUST NOT consume; MUST NOT emit code from; treat any feature-spec citation of a Legacy file as a stale reference and surface as a content bug. |
| `G-NS-SCOPING-NO-SILENT-RECLASS` | **DOC-NORM** | [`spec/00-scoping.md`](./00-scoping.md) | A scope's status MUST NOT be silently changed. Reclassification requires a new ADR following the §"Reclassification Procedure" steps. |
| `G-NS-SCOPING-RECLASS-ADR-COUPLING` | **DOC-NORM** | [`spec/00-scoping.md`](./00-scoping.md) | The reclassification ADR MUST cite this file and the row being changed; once `Accepted`, both files MUST land in the same PR. |

### Spec-Authoring · F8 Feature-Block Format

> Reserved gate IDs for the Feature-Reference Appendix block-format SSOT. `G-39` was already cited inline in `spec/01-spec-authoring-guide/21-feature-block-format.md` (front matter + R3/R4 prose) and bound by 4 ATs (`AT-F8-01..04`); batch-7 (2026-04-29) registers the umbrella gate and 4 sub-rule gates for parser visibility.

| Gate | Tier | Primary File | Brief |
|------|------|--------------|-------|
| `G-39` | **CI** | [`spec/01-spec-authoring-guide/21-feature-block-format.md`](./01-spec-authoring-guide/21-feature-block-format.md) | Umbrella gate — enforced by `scripts/spec-hygiene/39-check-feature-block-format.mjs`. Combines R1 (row shape), R2 (shortcut placement), R3 (slash-command backticks), R4 (search-operator backticks). In-scope files matched by `## Workflowy … Reference` / `F[1-6] … Appendix` headings or explicit opt-in marker. |
| `G-39-R1-ROW-SHAPE` | **CI** | [`spec/01-spec-authoring-guide/21-feature-block-format.md`](./01-spec-authoring-guide/21-feature-block-format.md) | Every appendix feature row MUST use the form `**<Title>** — <Description>.`: true em-dash separator (U+2014, not `-`/`--`), bold title containing only the feature name (no shortcut/slash command), single-sentence description ending in a period. AT: `AT-F8-01`. |
| `G-39-R2-SHORTCUT-PLACEMENT` | **CI** | [`spec/01-spec-authoring-guide/21-feature-block-format.md`](./01-spec-authoring-guide/21-feature-block-format.md) | When a feature carries a shortcut, it MUST appear at end of line, backtick-wrapped, prefixed `Shortcut:`. Multiple shortcuts comma-separated inside one backtick group. The shortcut MUST also appear in the canonical hotkey table (`spec/31-app/01-features/05-interactions.md`). AT: `AT-F8-02`. |
| `G-39-R3-SLASH-INLINE` | **CI** | [`spec/01-spec-authoring-guide/21-feature-block-format.md`](./01-spec-authoring-guide/21-feature-block-format.md) | Slash commands MUST appear inline as `` `/command` `` backtick-wrapped. Bare `/command` outside backticks forbidden. URL paths (`/wp-json/…`, `/api/…`, `/items/…`) exempt. AT: `AT-F8-03`. |
| `G-39-R4-SEARCH-OPERATORS` | **CI** | [`spec/01-spec-authoring-guide/21-feature-block-format.md`](./01-spec-authoring-guide/21-feature-block-format.md) | Search operators (`is:todo`, `in:Inbox`, `has:note`, `tag:#work`, `due:7d`, …) MUST be backtick-wrapped wherever they appear in prose. Bare operators forbidden. AT: `AT-F8-04`. |

### Domain-CG (Coding Guidelines · Hard Rules)

> Reserved gate IDs for the Coding Guidelines Hard-Rules enforcement matrix in `spec/02-coding-guidelines/00-overview.md` §"Hard Rules". The ESLint/PHPStan rule names cited in the matrix's Gate column (`@typescript-eslint/no-explicit-any`, `local/max-logic-lines`, etc.) are the underlying linter implementations; the `G-CG-RN` IDs are the spec-side handles binding each rule row to the AT layer (`AT-CG-G01..G05`). Batch-8 (2026-04-29) registers the umbrella + 2 sub-rule gates load-bearing in this turn; remaining R1/R2/R3/R4/R7/R8/R9/R10 reserved for future batches as their narrative prose surfaces.

| Gate | Tier | Primary File | Brief |
|------|------|--------------|-------|
| `G-CG-HARD-RULES` | **CI** | [`spec/02-coding-guidelines/00-overview.md`](./02-coding-guidelines/00-overview.md) | Umbrella — every rule in the §"Hard Rules" enforcement matrix is gate-enforced via the linker shown in the Gate column; the AI MUST NOT propose code that violates any of them. Composed of `G-CG-R1..R10` sub-rules. |
| `G-CG-R5-MAX-LOGIC-LINES` | **CI** | [`spec/02-coding-guidelines/00-overview.md`](./02-coding-guidelines/00-overview.md) | A function's logic body MUST be ≤ 15 lines (excluding signature, braces, blank lines). Implementation: custom ESLint rule `local/max-logic-lines`. |
| `G-CG-R6-POSITIVE-GUARDS` | **CI** | [`spec/02-coding-guidelines/00-overview.md`](./02-coding-guidelines/00-overview.md) | Guard clauses MUST be positive — `if (!x) return` not `if (x) { … } else …`. Implementation: custom ESLint rule `local/positive-guards`. |
| `G-CG-FIXTURE-CITE-VERBATIM` | **DOC-NORM** | [`spec/02-coding-guidelines/00-overview.md`](./02-coding-guidelines/00-overview.md) | Bad/Good code-pair snippets in §"Bad / Good Code Pairs" are canonical examples; fixtures in `97a-acceptance-criteria-fixtures.md` MUST cite them verbatim by `R<N>` id. R# ids are load-bearing — renaming requires superseding ADR. |
| `G-CG-AI-ANTIPATTERN-FORBIDDEN` | **DOC-NORM** | [`spec/02-coding-guidelines/00-overview.md`](./02-coding-guidelines/00-overview.md) | The 5 anti-patterns in §"Anti-Patterns" are the closed set the AI MUST NOT do. Each row cites its catching gate (`G-02-RULE-HAS-GATE`, `G-02-PAIRED-EXAMPLES`, `G-02-NO-DISABLE`, R7's `no-restricted-syntax`, `G-02-NO-RETURN-TERNARY`). |
| `G-CG-ADR-REQUIRED-TO-RELAX` | **DOC-NORM** | [`spec/02-coding-guidelines/00-overview.md`](./02-coding-guidelines/00-overview.md) | Strict-TS rules (zero `any`, max 3 params, no nested `if`s, 15-line logic limit, pure positive guard clauses) and SQLite naming rules MUST NOT be relaxed without a new ADR superseding the relevant one (ADR-0001/ADR-0002 lineage). |

### Domain-HLPIN (Highlighter Dependency Pin)

> Reserved gate IDs for the highlight.js dependency-pin SSOT in `spec/09-code-block-system/11-highlighter-dependency-pin.md` (closes audit gap F-04). All 8 sub-rules already have an enforcing AT (`AT-HLPIN-01..08`); batch-9 (2026-04-29) registers the umbrella + 6 narrative-bound sub-rule gates so the parser regex `\bG-[A-Z0-9][A-Z0-9-]*\b` recognises the citations and the corpus prose-MUST counter no longer flags the pin file.

| Gate | Tier | Primary File | Brief |
|------|------|--------------|-------|
| `G-HLPIN-PIN` | **CI** | [`spec/09-code-block-system/11-highlighter-dependency-pin.md`](./09-code-block-system/11-highlighter-dependency-pin.md) | Umbrella — `highlight.js ^11.10.0` is the locked syntax-highlighter; forbidden alternatives (Shiki, Prism, react-syntax-highlighter, starry-night, CDN imports) MUST NOT appear in `package.json` or `src/`. Composed of `G-HLPIN-LOCKFILE-MAJOR`, `-IMPORT-PATHS`, `-NO-VENDOR-CSS`, `-USE-HSL-TOKENS`, `-CI-BUNDLE-BUDGET`, `-UPGRADE-MAJOR-SPEC-PR`. Verifications: `AT-HLPIN-01..08`. |
| `G-HLPIN-LOCKFILE-MAJOR` | **CI** | [`spec/09-code-block-system/11-highlighter-dependency-pin.md`](./09-code-block-system/11-highlighter-dependency-pin.md) | The lockfile-resolved `highlight.js` version MUST NOT cross a major (must remain within `^11.x`). Drift between `package.json` `^11.10.0` and `bun.lock` resolved version that crosses a major is a CI error. AT: `AT-HLPIN-02`. |
| `G-HLPIN-IMPORT-PATHS` | **CI** | [`spec/09-code-block-system/11-highlighter-dependency-pin.md`](./09-code-block-system/11-highlighter-dependency-pin.md) | All `highlight.js` imports MUST use the canonical paths in §"Canonical Import Paths" — `highlight.js/lib/core` for the engine and `highlight.js/lib/languages/<name>` for each registered language. Relative paths, namespace imports (`import * as hljs`), bare `from 'highlight.js'` (full bundle), and CDN URLs are forbidden. AT: `AT-HLPIN-05`, `AT-HLPIN-08`. |
| `G-HLPIN-NO-VENDOR-CSS` | **CI** | [`spec/09-code-block-system/11-highlighter-dependency-pin.md`](./09-code-block-system/11-highlighter-dependency-pin.md) | Code MUST NOT import any `highlight.js/styles/*` vendor stylesheet. Vendor themes ship hex colors and break the project's HSL-token system. AT: `AT-HLPIN-04`. |
| `G-HLPIN-USE-HSL-TOKENS` | **DOC-NORM** | [`spec/09-code-block-system/11-highlighter-dependency-pin.md`](./09-code-block-system/11-highlighter-dependency-pin.md) | Highlighter token coloring MUST use project HSL tokens; the complete `.hljs-*` → CSS-variable mapping is the single responsibility of [`05-styling.md`](./09-code-block-system/05-styling.md). Satisfies `AT-CODEBLOCKSYSTEM-10` (always-dark) and `AT-CODEBLOCKSYSTEM-11` (HSL-only). |
| `G-HLPIN-CI-BUNDLE-BUDGET` | **CI** | [`spec/09-code-block-system/11-highlighter-dependency-pin.md`](./09-code-block-system/11-highlighter-dependency-pin.md) | CI MUST fail if `dist/assets/highlighter-*.js` exceeds 100 KB minified (≤ 35 KB gzipped). Enforced by the `Verify highlighter bundle budget` step in the `package` job of `spec/13-cicd-pipeline-workflows/18-wp-plugin-deploy/02-github-actions-workflow.md`. AT: `AT-HLPIN-07`. |
| `G-HLPIN-UPGRADE-MAJOR-SPEC-PR` | **DOC-NORM** | [`spec/09-code-block-system/11-highlighter-dependency-pin.md`](./09-code-block-system/11-highlighter-dependency-pin.md) | Major upgrades (`11.x → 12.x`) MUST update this pin file in the same spec PR with a styling regression test; switching to a different highlighter library MUST rewrite this pin file and re-run the F-04 audit gate. Patch/minor changes are automatic via lockfile. |

### Domain-AUI (Admin-UI Patterns · Misc, Composition, Accessibility)

> Reserved gate IDs for the misc-components / template-composition / accessibility rules in `spec/15-wp-plugin-how-to/13-admin-ui-patterns/11-misc-and-rules.md`. Batch-10 (2026-04-29) registers an umbrella + 8 narrative-bound sub-rule gates so the parser regex `\bG-[A-Z0-9][A-Z0-9-]*\b` recognises the citations and the corpus prose-MUST counter no longer flags this file. The 8 sub-rules split into 2 template-composition rules (`-PARTIAL-*`) and 6 accessibility rules (`-A11Y-*`); the 10 anti-patterns in §"Anti-Patterns" remain prose-only this turn (closed forbidden-list, NEVER-DO format — out of scope for the MUST→gate migration).

| Gate | Tier | Primary File | Brief |
|------|------|--------------|-------|
| `G-AUI-MISC` | **DOC-NORM** | [`spec/15-wp-plugin-how-to/13-admin-ui-patterns/11-misc-and-rules.md`](./15-wp-plugin-how-to/13-admin-ui-patterns/11-misc-and-rules.md) | Umbrella — admin-UI partials and a11y obligations are gate-bound; AI MUST NOT emit admin templates that violate any sub-rule. Composed of `G-AUI-PARTIAL-DOCBLOCK`, `-PARTIAL-UNSET`, `-A11Y-TH-SCOPE`, `-A11Y-LABEL-FOR`, `-A11Y-INPUT-TYPE`, `-A11Y-REQUIRED-MARK`, `-A11Y-DASHICON-WRAP`, `-A11Y-INTERACTIVE-TAG`. |
| `G-AUI-PARTIAL-DOCBLOCK` | **DOC-NORM** | [`spec/15-wp-plugin-how-to/13-admin-ui-patterns/11-misc-and-rules.md`](./15-wp-plugin-how-to/13-admin-ui-patterns/11-misc-and-rules.md) | Every partial under `templates/partials/**` MUST open with a PHP docblock listing required and optional variables it expects from parent scope. Missing or out-of-date docblocks are review failures. |
| `G-AUI-PARTIAL-UNSET` | **DOC-NORM** | [`spec/15-wp-plugin-how-to/13-admin-ui-patterns/11-misc-and-rules.md`](./15-wp-plugin-how-to/13-admin-ui-patterns/11-misc-and-rules.md) | Partials that define temporary variables MUST `unset()` them at end-of-file to prevent scope bleed into subsequent `include`/`require` calls inside the same parent template. |
| `G-AUI-A11Y-TH-SCOPE` | **CI** | [`spec/15-wp-plugin-how-to/13-admin-ui-patterns/11-misc-and-rules.md`](./15-wp-plugin-how-to/13-admin-ui-patterns/11-misc-and-rules.md) | Every `<th>` cell MUST carry `scope="row"` or `scope="col"`. Lint: `grep -nE '<th\\b' templates/**/*.php` MUST find no row missing `scope=`. |
| `G-AUI-A11Y-LABEL-FOR` | **CI** | [`spec/15-wp-plugin-how-to/13-admin-ui-patterns/11-misc-and-rules.md`](./15-wp-plugin-how-to/13-admin-ui-patterns/11-misc-and-rules.md) | Every `<label>` MUST carry a `for=` attribute matching the `id` of a real input on the same page. Implicit-wrap labels forbidden. |
| `G-AUI-A11Y-INPUT-TYPE` | **CI** | [`spec/15-wp-plugin-how-to/13-admin-ui-patterns/11-misc-and-rules.md`](./15-wp-plugin-how-to/13-admin-ui-patterns/11-misc-and-rules.md) | Every `<input>` MUST carry an explicit `type=` attribute. Missing `type` falls back to `text` silently and breaks screen-reader announcements. |
| `G-AUI-A11Y-REQUIRED-MARK` | **DOC-NORM** | [`spec/15-wp-plugin-how-to/13-admin-ui-patterns/11-misc-and-rules.md`](./15-wp-plugin-how-to/13-admin-ui-patterns/11-misc-and-rules.md) | Required fields MUST display `<span class="required">*</span>` inside the `<label>` (in addition to the form-side `required` attribute). Provides the WCAG-recommended visible-and-programmatic dual signal. |
| `G-AUI-A11Y-DASHICON-WRAP` | **CI** | [`spec/15-wp-plugin-how-to/13-admin-ui-patterns/11-misc-and-rules.md`](./15-wp-plugin-how-to/13-admin-ui-patterns/11-misc-and-rules.md) | Decorative dashicons MUST be wrapped in a `<span class="dashicons dashicons-…">`, never emitted as a standalone tag. Required so the wrapper can carry `aria-hidden="true"` without poisoning the parent control's accessible name. |
| `G-AUI-A11Y-INTERACTIVE-TAG` | **CI** | [`spec/15-wp-plugin-how-to/13-admin-ui-patterns/11-misc-and-rules.md`](./15-wp-plugin-how-to/13-admin-ui-patterns/11-misc-and-rules.md) | Interactive controls MUST be `<button>` or `<a>` — never `<div>` or `<span>` with click handlers. Restores keyboard focus, Enter/Space activation, and assistive-tech role inference for free. |

### Domain-RE (Role-Escalation Policy · Dual-Control & Lifecycle)

> Reserved gate IDs for the role-escalation control-plane invariants in `spec/31-app/05-conventions/10-role-escalation-policy.md`. The umbrella `G-24` was already named in §7 "Hygiene Gate G-24 (proposed)" of the source file; batch-11 (2026-04-29) promotes it to a formal registry row with implementation-script reservation `scripts/spec-hygiene/24-check-role-escalation-coverage.mjs`, plus 8 sub-rule gates that bind every prose-MUST in the §3 dual-control rule, §4 expiry contract, §5 revocation propagation table, and §6 audit integration callout. Sub-rules split into 4 dual-control (`-DC-*`), 1 renewal (`-RENEW-*`), 1 expiry-enforcement (`-EXPIRY-*`), 1 revocation-deadline (`-REVOCATION-*`), and 1 audit-coupling (`-AUDIT-*`) gate.

| Gate | Tier | Primary File | Brief |
|------|------|--------------|-------|
| `G-24` | **CI** | [`spec/31-app/05-conventions/10-role-escalation-policy.md`](./31-app/05-conventions/10-role-escalation-policy.md) | Umbrella — every transition in the role-escalation lifecycle is gate-bound; AI MUST NOT emit any code path that grants `Owner` synchronously without dual-control or grants permanent `Admin` outside the L1 flow. Composed of `G-24-DC-*` (4), `G-24-RENEW-REMINDER`, `G-24-EXPIRY-AT-REQUEST-TIME`, `G-24-REVOCATION-PROPAGATION-60S`, `G-24-AUDIT-TAXONOMY-COUPLING`. Implementation script reservation: `scripts/spec-hygiene/24-check-role-escalation-coverage.mjs`. |
| `G-24-DC-REQUESTER-DISTINCT` | **CI** | [`spec/31-app/05-conventions/10-role-escalation-policy.md`](./31-app/05-conventions/10-role-escalation-policy.md) | The Requester actor on an L2/L3 grant MUST NOT equal the grantee. Server-side check enforced before the request row is persisted. |
| `G-24-DC-APPROVER-DISTINCT` | **CI** | [`spec/31-app/05-conventions/10-role-escalation-policy.md`](./31-app/05-conventions/10-role-escalation-policy.md) | The Approver actor MUST NOT equal the requester AND MUST NOT equal the grantee. Composite distinctness check enforced at approval time. |
| `G-24-DC-DIFFERENT-SESSION` | **CI** | [`spec/31-app/05-conventions/10-role-escalation-policy.md`](./31-app/05-conventions/10-role-escalation-policy.md) | Requester and Approver MUST be authenticated from different `SessionId` values (anti-collusion). Same-session approval rejected with `ERR_ESCALATION_SAME_SESSION`. |
| `G-24-DC-FRESH-AUTH` | **CI** | [`spec/31-app/05-conventions/10-role-escalation-policy.md`](./31-app/05-conventions/10-role-escalation-policy.md) | The approval action MUST re-confirm the approver's password OR a fresh MFA challenge ≤ 5 min old. Long-lived sessions cannot silently approve escalations. |
| `G-24-DC-GRANTEE-PRENOTIFY` | **DOC-NORM** | [`spec/31-app/05-conventions/10-role-escalation-policy.md`](./31-app/05-conventions/10-role-escalation-policy.md) | The grantee MUST receive the email notification *before* the grant transitions to `Active`, with a ≥ 60 s grace window honoring the "this wasn't me — cancel" link. Email-send and state-transition are not parallel — email-first ordering is mandatory. |
| `G-24-RENEW-REMINDER` | **DOC-NORM** | [`spec/31-app/05-conventions/10-role-escalation-policy.md`](./31-app/05-conventions/10-role-escalation-policy.md) | Backend MUST send renewal-reminder emails at T-7d and T-1d before any L1 standing-`Admin` expiry. Missing either reminder is a P1 bug. |
| `G-24-EXPIRY-AT-REQUEST-TIME` | **CI** | [`spec/31-app/05-conventions/10-role-escalation-policy.md`](./31-app/05-conventions/10-role-escalation-policy.md) | `Auth::hasRole()` MUST treat any `WorkspaceMember` row with `ExpiresAt < NOW()` as non-existent, regardless of cron-sweep latency. Defense-in-depth against late sweeps; tested via injected clock-skew fixtures. |
| `G-24-REVOCATION-PROPAGATION-60S` | **TEST** | [`spec/31-app/05-conventions/10-role-escalation-policy.md`](./31-app/05-conventions/10-role-escalation-policy.md) | Every authorization-cache layer (in-process LRU, REST tokens, SSE subscribers, frontend role badge) MUST invalidate within the per-layer deadlines tabled in §5. Any layer not visibly enforcing revocation within 60 s is a P0 bug. Fixture: synthetic revoke-then-replay test. |
| `G-24-AUDIT-TAXONOMY-COUPLING` | **DOC-NORM** | [`spec/31-app/05-conventions/10-role-escalation-policy.md`](./31-app/05-conventions/10-role-escalation-policy.md) | All ten action codes from §6 (`AUTHZ.ROLE_REQUEST`, `…ROLE_APPROVE`, `…ROLE_DENY`, `…ROLE_DENY_TIMEOUT`, `…ROLE_GRANT`, `…ROLE_RENEW`, `…ROLE_EXPIRE`, `…ROLE_REVOKE`, `…OWNER_TRANSFER`, `…BREAK_GLASS`) MUST land in `09-audit-log-policy.md` §Action Taxonomy v1.1.0 in the same PR. Cross-file coupling enforced by the audit-taxonomy-coverage gate. |

### Domain-BACKUP (Backup & Disaster-Recovery Policy)

> Reserved gate IDs for the backup/DR control-plane invariants in `spec/31-app/05-conventions/14-backup-and-dr-policy.md`. Batch-12 (2026-04-29) registers an umbrella + 6 narrative-bound sub-rule gates covering off-site placement, encryption-before-upload, audit-chain preservation/rewalk/ack, restore-time integrity check, and pager alerting. **Namespace note:** the source file's §10 names its umbrella `G-28 (proposed)`, but `G-28-*` is already owned by ADR-0028 (i18n, 9 gates + 2 superseded). Batch-12 sidesteps the collision by using `G-BACKUP-*`; renaming the source-file callout from `G-28` → `G-BACKUP` is tracked as follow-up finding F-SCOPE-15-FOLLOWUP.

| Gate | Tier | Primary File | Brief |
|------|------|--------------|-------|
| `G-BACKUP` | **CI** | [`spec/31-app/05-conventions/14-backup-and-dr-policy.md`](./31-app/05-conventions/14-backup-and-dr-policy.md) | Umbrella — every backup tarball produced by the plugin MUST be off-site-replicated, client-side-encrypted, integrity-verified at restore time, and pager-alerted on fatal events. AI MUST NOT emit a backup code path that violates any sub-rule. Composed of `G-BACKUP-TWO-REGIONS`, `-CLIENT-SIDE-ENCRYPT` (already implicit from §5; reserved), `-AUDIT-CHAIN-PRESERVE`, `-AUDIT-CHAIN-REWALK`, `-AUDIT-REWIND-ACK`, `-RESTORE-INTEGRITY-CHECK`, `-FATAL-PAGER-ALERT`. Implementation script reservation: `scripts/spec-hygiene/28-check-backup-policy-coverage.mjs` (already declared in source §10; numeric prefix retained, but the **gate ID itself is `G-BACKUP`**, NOT `G-28`, to avoid namespace collision with ADR-0028). |
| `G-BACKUP-TWO-REGIONS` | **CI** | [`spec/31-app/05-conventions/14-backup-and-dr-policy.md`](./31-app/05-conventions/14-backup-and-dr-policy.md) | Daily/Weekly/Monthly/Yearly backups MUST replicate to **at least two geographically separate regions**. Single-region failure MUST NOT block restore. Lifecycle policy in object-storage config encodes this; CI inspects the deployed bucket policy via `aws s3api get-bucket-replication` (or equivalent) and fails on missing/unhealthy replication. |
| `G-BACKUP-AUDIT-CHAIN-PRESERVE` | **CI** | [`spec/31-app/05-conventions/14-backup-and-dr-policy.md`](./31-app/05-conventions/14-backup-and-dr-policy.md) | Audit-DB backups MUST include the *last hash row* of the live DB at the moment of `\SQLite3::backup()` snapshot. Backups missing the chain tip cannot be re-walked → P0 finding at restore time. |
| `G-BACKUP-AUDIT-CHAIN-REWALK` | **TEST** | [`spec/31-app/05-conventions/14-backup-and-dr-policy.md`](./31-app/05-conventions/14-backup-and-dr-policy.md) | Restore verifier MUST re-walk the audit hash chain from genesis to last row and produce an `IntegrityHash` that matches the value recorded by the live DB. Tested in restore-drill harness. Composite check: also enforced as restore-procedure step 7. |
| `G-BACKUP-AUDIT-REWIND-ACK` | **DOC-NORM** | [`spec/31-app/05-conventions/14-backup-and-dr-policy.md`](./31-app/05-conventions/14-backup-and-dr-policy.md) | Restoring an audit DB to a point earlier than the live latest MUST emit `SYSTEM.AUDIT_CHAIN_REWIND` at `fatal` severity on the next live write, AND the operator runbook MUST require explicit acknowledgement before any further audit writes are accepted. |
| `G-BACKUP-RESTORE-INTEGRITY-CHECK` | **TEST** | [`spec/31-app/05-conventions/14-backup-and-dr-policy.md`](./31-app/05-conventions/14-backup-and-dr-policy.md) | Restore step 6 — `PRAGMA integrity_check` against the decrypted SQLite file MUST return `ok`. Skipping or short-circuiting this check is forbidden (codified in §7 "Forbidden during restore"). Quarterly restore-drill harness exercises both pass and synthetic-corruption paths. |
| `G-BACKUP-FATAL-PAGER-ALERT` | **CI** | [`spec/31-app/05-conventions/14-backup-and-dr-policy.md`](./31-app/05-conventions/14-backup-and-dr-policy.md) | Every audit row at `fatal` severity in the §9 monitoring table MUST trigger an operator pager alert (PagerDuty/OpsGenie/equivalent). Alert-routing config inspected by CI; missing routing for any `fatal` code in the §9 catalogue is a build failure. |

### Domain-ERRCODE (Error-Code Catalogue · SSOT Drift Rules)

> Reserved gate IDs for the runtime-error-code SSOT in `spec/03-error-manage/02-error-architecture/05-response-envelope/05-error-code-catalogue.md`. Distinct from the existing `G-ERR-*` family (which covers envelope shape; see §99a-worked-example-fixtures.md) and the pre-existing `G-22-REGISTRY-LOCKSTEP` (which guards the registry-build step). Batch-13 (2026-04-29) registers an umbrella + 7 narrative-bound sub-rule gates covering the catalogue's runtime-agnostic naming, intrinsic severity, HTTP-status parity, deprecation grace window, and frontend interceptor/unknown-funnel/i18n contracts.

| Gate | Tier | Primary File | Brief |
|------|------|--------------|-------|
| `G-ERRCODE` | **CI** | [`spec/03-error-manage/02-error-architecture/05-response-envelope/05-error-code-catalogue.md`](./03-error-manage/02-error-architecture/05-response-envelope/05-error-code-catalogue.md) | Umbrella — every runtime error code MUST appear in the §5 catalogue, MUST be emitted via `Auth::error()` (already covered by `G-22-REGISTRY-LOCKSTEP`), and MUST satisfy all sub-rules below. AI MUST NOT emit a code path that violates any sub-rule. Composed of `G-ERRCODE-RUNTIME-AGNOSTIC`, `-SEVERITY-INTRINSIC`, `-HTTPSTATUS-PARITY`, `-DEPRECATION-GRACE`, `-INTERCEPTOR-SWITCHES-ON-CODE`, `-UNKNOWN-FUNNEL`, `-I18N-MESSAGEKEY-LOOKUP`. |
| `G-ERRCODE-RUNTIME-AGNOSTIC` | **CI** | [`spec/03-error-manage/02-error-architecture/05-response-envelope/05-error-code-catalogue.md`](./03-error-manage/02-error-architecture/05-response-envelope/05-error-code-catalogue.md) | Runtime error codes MUST NOT carry backend-runtime infixes (`ERR_GO_*`, `ERR_NODE_*`, etc.). The sole exception is the `installer` tier where bootstrap-runtime identity is unavoidable. Cross-references `mem://constraints/backend-runtime-deferred`. |
| `G-ERRCODE-SEVERITY-INTRINSIC` | **CI** | [`spec/03-error-manage/02-error-architecture/05-response-envelope/05-error-code-catalogue.md`](./03-error-manage/02-error-architecture/05-response-envelope/05-error-code-catalogue.md) | Severity is a property of the code itself; the same code MUST NOT be emitted at different severities by different call sites. Severity is read-once from the catalogue at emit time, not parameterised. |
| `G-ERRCODE-HTTPSTATUS-PARITY` | **CI** | [`spec/03-error-manage/02-error-architecture/05-response-envelope/05-error-code-catalogue.md`](./03-error-manage/02-error-architecture/05-response-envelope/05-error-code-catalogue.md) | The HTTP status set by the REST handler MUST equal the `HttpStatus` column in the §5 catalogue row for the emitted code. Mismatch is a `G-22` violation; `0` reserved for non-HTTP (CLI/installer) codes. |
| `G-ERRCODE-DEPRECATION-GRACE` | **DOC-NORM** | [`spec/03-error-manage/02-error-architecture/05-response-envelope/05-error-code-catalogue.md`](./03-error-manage/02-error-architecture/05-response-envelope/05-error-code-catalogue.md) | When a code is deprecated, the backend SHOULD stop emitting it but the frontend MUST continue to recognise it for **one full minor version**. Removal in the same minor that deprecates the code is forbidden. |
| `G-ERRCODE-INTERCEPTOR-SWITCHES-ON-CODE` | **CI** | [`spec/03-error-manage/02-error-architecture/05-response-envelope/05-error-code-catalogue.md`](./03-error-manage/02-error-architecture/05-response-envelope/05-error-code-catalogue.md) | The Axios response interceptor MUST branch on `Errors.Code`, never on `Status.Message`. Lint forbids `Status.Message ===` / `.includes(` patterns inside the interceptor module. |
| `G-ERRCODE-UNKNOWN-FUNNEL` | **CI** | [`spec/03-error-manage/02-error-architecture/05-response-envelope/05-error-code-catalogue.md`](./03-error-manage/02-error-architecture/05-response-envelope/05-error-code-catalogue.md) | Unknown codes (not in §5) MUST be funnelled through `ERR_UNKNOWN` in the UI layer without silent remapping to any sibling code, AND simultaneously logged to the analytics channel for catalogue back-fill. Silent remap is a P1 finding. |
| `G-ERRCODE-I18N-MESSAGEKEY-LOOKUP` | **CI** | [`spec/03-error-manage/02-error-architecture/05-response-envelope/05-error-code-catalogue.md`](./03-error-manage/02-error-architecture/05-response-envelope/05-error-code-catalogue.md) | i18n lookups MUST use the catalogue's `MessageKey` column. Raw English strings from the backend's `Status.Message` are debug-only and MUST NOT be rendered to end users. |

### Meta-00

| Gate | Tier | Primary File | Brief |
|------|------|--------------|-------|
| `G-00-ADR-INDEX-FRESH` | **DOC** | [`spec/00-adrs/_INDEX_AUTOMATION.md`](./00-adrs/_INDEX_AUTOMATION.md) | > G-00-ADR-INDEX-FRESH is implemented. |
| `G-00-ADR-NUMBERING` | **DOC-NORM** | [`spec/00-adrs/_INDEX_AUTOMATION.md`](./00-adrs/_INDEX_AUTOMATION.md) | Reusing a Rejected ADR's number for a new ADR Breaks ADR-NNNN citation stability across history G-00-ADR-NUMBERING |
| `G-00-ADR-SHAPE` | **DOC** | [`spec/00-adrs/_INDEX_AUTOMATION.md`](./00-adrs/_INDEX_AUTOMATION.md) | Deleting a Superseded row from the index Erases decision history; future readers can't trace why something was overturn |
| `G-00-ADR-STATUS` | **DOC-NORM** | [`spec/00-adrs/00-overview.md`](./00-adrs/00-overview.md) | G-00-ADR-STATUS Status MUST be one of the 5 enum values; Accepted required for any G- reference. |
| `G-00-ADR-SUPERSEDE` | **DOC-NORM** | [`spec/00-adrs/00-overview.md`](./00-adrs/00-overview.md) | G-00-ADR-SUPERSEDE A new ADR that supersedes another MUST update the older ADR's status in the same change. |
| `G-00-ADR-XLINK-SYMMETRY` | **DOC-NORM** | [`spec/00-adrs/_INDEX_AUTOMATION.md`](./00-adrs/_INDEX_AUTOMATION.md) | Outbound links from an Accepted ADR's `## Decision` section to non-ADR repo files MUST have a reciprocal back-link at the linked anchor. Reference precedent: ADR-0024 §D1/D2/D3 ↔ triage `### #01/#03/#17`. |
| `G-00-ADR-CONSEQUENCES-XLINK` | **DOC** | [`spec/00-adrs/_INDEX_AUTOMATION.md`](./00-adrs/_INDEX_AUTOMATION.md) | Sibling-advisory to `G-00-ADR-XLINK-SYMMETRY`. Outbound links from an Accepted ADR's `## Consequences` section that contain an action verb (must/requires/add/update/migrate/backfill/rename/remove) SHOULD have a reciprocal back-link. WARN-only; promotes to DOC-NORM at ≥10 baseline pairs. |

---

## 4. Maintenance Rules

1. **Adding a new gate:** define it in its source ADR/spec file, then append a row to the appropriate Area table here in the same PR.
2. **Promoting a gate:** when a DOC-NORM gate gets a CI check or test fixture, update its `Tier` column and add a link to the workflow/test file.
3. **Removing a gate:** mark with `~~strikethrough~~` and add a `Superseded-by:` cross-reference; never delete history.
4. **Audit cadence:** regenerate via `rg -o 'G-[A-Z0-9-]+' spec/ | sort -u` quarterly to detect orphan or duplicate gate IDs.
5. **Naming:** new gates MUST use either `G-NN-NAME` (ADR-scoped, NN = ADR number) or `G-DOMAIN-NN` (cross-cutting, e.g. `G-MIRROR-*`, `G-ERR-*`). Bare numeric `G-NN` references are deprecated and excluded from this registry.

---

## 5. Known Gaps

- 44 bare `G-NN` references in spec are section pointers, not real gates — excluded from this registry.
- Heuristic classifier may mis-tier some gates; the 200 DOC-tier rows from the v1.0.0 inventory are still **unaudited** — many likely belong in CI/TEST tiers (e.g. `G-26-LWW-CANONICAL-COMPARATOR` is currently DOC but is enforced in practice). Per-area manual sweep is the largest remaining quality task.
- ~63 placeholder `97-acceptance-criteria.md` files (AUDIT-03) still empty — their TEST-tier gates show file path but lack runnable fixtures. **As of 2026-04-28 this also affects the 7 new TEST-tier gates from ADR-0027 / 0028** (`G-27-RING-TTL-300S`, `G-27-COLD-GAP-RESYNC`, `G-27-MULTIWORKER-REPLAY`, `G-28-MISSING-KEY-LOGGED`, `G-28-FALLBACK-CHAIN`, `G-28-RTL-DIR-ATTR`, `G-28-DETECTION-ORDER`) — they are well-specified but won't run until the AC backfill lands.
- Two `G-28-*` rows are intentionally retained as **superseded** (strikethrough) — never delete history per §4 rule 3.

### 5.1 Citation-vs-row Reconciliation (audited 2026-04-28)

A naive `rg -o '\`G-[A-Z0-9-]+\`' spec/_GATE-REGISTRY.md | sort -u` returns **296** unique tokens, which superficially appears inconsistent with the **291** active-row count in §2. The reconciliation is:

| Bucket | Count | Source |
|--------|------:|--------|
| Active gate rows (counted in §2) | 291 | Non-strikethrough table rows |
| Superseded gate rows (strikethrough, retained per §4 rule 3) | 2 | `G-28-NO-PHYSICAL-MARGINS`, `G-28-NO-PHYSICAL-ALIGN` (folded into `G-12-LOGICAL-*`) |
| **Real gate IDs total** | **293** | |
| Documentation placeholders in §4 naming-rule prose (NOT gates) | 3 | `G-NN`, `G-NN-NAME`, `G-DOMAIN-NN` (see §4 rule 5) |
| **Unique tokens matching `\`G-…\`` regex** | **296** | |

**Implication for fixture-as-spec audits:** any tool that parses gate IDs from this file MUST exclude the 3 documentation-placeholder tokens (`{"G-NN", "G-NN-NAME", "G-DOMAIN-NN"}`) and SHOULD treat strikethrough rows as registered (regex must allow optional `~~` around the backticked ID). The reference implementation in [`spec/13-cicd-pipeline-workflows/scripts-as-spec/fixture-as-spec-shape-audit.md`](./13-cicd-pipeline-workflows/scripts-as-spec/fixture-as-spec-shape-audit.md) does both as of v1.0.1 (Phase-4 hardening). **Set equality between this row's tokens and the audit fixture's `PLACEHOLDER_TOKENS` literal is itself enforced by [`G-13-PLACEHOLDER-TOKEN-PARITY`](./13-cicd-pipeline-workflows/scripts-as-spec/placeholder-token-parity-audit.md).**

