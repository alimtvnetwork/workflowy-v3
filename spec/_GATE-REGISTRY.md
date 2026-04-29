# Gate Registry — Master Index of `G-*` Compliance Gates

> **Version:** 1.3.2  
> **Updated:** 2026-04-29 — patch: dedupe sweep + `G-00-OVERVIEW-SCORING-VALUE-FORMAT` Rule 4 added (single-Scoring-section invariant) and "first block per file" carve-out retired. Sweep: `08-docs-viewer-ui` second `## Scoring` (per-feature criterion grid) renamed → `## Quality Breakdown`; `34-activity-feed` and `36-user-management` had stale boilerplate dupe blocks (12+14 lines including duplicate `## Confidence` heading) removed, rationale preserved as `> **Confidence rationale:**` blockquote under canonical Scoring. **Baseline 25/25: exactly 1 `## Scoring` per overview, zero value-format violations across all blocks.** Prior: 1.3.1 (VALUE-FORMAT rules 1+2+3 promoted hard-fail), 1.3.0 (VALUE-FORMAT minted WARN-only), 1.2.9 (Scoring backfill sweep + COMPLETE rule 1 promoted), 1.2.8 (G-00-OVERVIEW-SCORING-TABLE-COMPLETE minted WARN-only), 1.2.7 (G-00-OVERVIEW-AI-CONTRACT-COMPLETE), 1.2.6 (G-13-AUDIT-RUNNER-CONTRACT), 1.2.5 (G-00-OVERVIEW-AI-CONTRACT-PRESENT), 1.2.4 (G-00-OVERVIEW-SCORING-TABLE-PRESENT + sub-overview H1 sweep), 1.2.3 (G-09 → Phase 3), 1.2.2 (G-09 minted WARN-conditional), 1.2.1 (G-01-DOD-NO-NN-PLACEHOLDER + G-01-DOD-CONDENSED-MIRRORS-OVERVIEW), 1.2.0 (G-NS-ADR-MUST-HAS-AT), 1.1.9 (G-NS-STATUS-IN-LEGEND), 1.1.8 (G-NS-NO-DEPRECATED-ALIAS), 1.1.7 (G-01-AT-ID-FORMAT-CANONICAL), 1.1.6 (G-13-LEDGER-NUMBERING-CONTIGUOUS), 1.1.5 (G-13-LEDGER-ROW-COUNT-PARITY), 1.1.4 (G-13-PLACEHOLDER-TOKEN-PARITY), 1.1.3 (§5.1 reconciliation), 1.1.2 (G-26-WIRE-OWNERID-ONLY dual tier), 1.1.1 (added the gate), 1.1.0 (20 new gates from ADR-0012 §D7, ADR-0027, ADR-0028).  

- **Total named gates:** 306 (+1: `G-00-OVERVIEW-SCORING-VALUE-FORMAT`)
- **CI:** 36 (+1; one gate `G-26-WIRE-OWNERID-ONLY` is dual-tier)
- **TEST:** 14 (unchanged)
- **DOC-NORM:** 54 (unchanged)
- **DOC:** 202 (unchanged)
- **Areas covered:** 37 (unchanged — `G-NS-*` registered under existing `Spec-Authoring`)

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
| `G-16-CONFIG-VIA-FLAG` | **DOC-NORM** | [`spec/16-generic-cli/00-overview.md`](./16-generic-cli/00-overview.md) | Read config file paths from positional args Confuses <file> semantics with config plumbing. |
| `G-16-EMPTY-QUERY-NO-FALLBACK` | **DOC** | [`spec/00-adrs/0013-search-relevance-then-recency-ranking.md`](./00-adrs/0013-search-relevance-then-recency-ranking.md) | - G-16-EMPTY-QUERY-NO-FALLBACK — enforces D6 (zero results, never |
| `G-16-EXIT-DOCUMENTED` | **DOC-NORM** | [`spec/16-generic-cli/00-overview.md`](./16-generic-cli/00-overview.md) | - The hygiene gate G-16-EXIT-DOCUMENTED rejects help text that lists an undocumented code. |
| `G-16-EXIT-NONZERO-ON-FAIL` | **TEST** | [`spec/16-generic-cli/00-overview.md`](./16-generic-cli/00-overview.md) | Return exit 0 on partial failure Hides errors from CI; cron jobs miss alerts. |
| `G-16-FIELD-WEIGHTS-CONTENT-NOTE` | **DOC** | [`spec/00-adrs/0013-search-relevance-then-recency-ranking.md`](./00-adrs/0013-search-relevance-then-recency-ranking.md) | - G-16-FIELD-WEIGHTS-CONTENT-NOTE — enforces D3 (max(Content×1.5, |
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
| `G-NS-NO-DEPRECATED-ALIAS` | **CI** | [`spec/01-spec-authoring-guide/97-acceptance-criteria.md`](./01-spec-authoring-guide/97-acceptance-criteria.md) | Forbids any new AT row using one of the 17 deprecated namespace aliases (`AT-DESIGNSYSTEM-`, `AT-UIDS-`, `AT-MIRRORS-`, `AT-WORKFLOW-`, `AT-CODINGGUIDELINES-`, `AT-MASTERCODINGGUIDELINES-`, `AT-ERRORMANAGE-`, `AT-RESTAPICONVENTIONS-`, `AT-TYPESCRIPT-`, `AT-GOLANG-`, `AT-PHP-`, `AT-ENUMSPECIFICATION-`, `AT-OPERATORRUNBOOKS-`, `AT-RATE-`, `AT-VISUALRENDER-`, `AT-CONSOLIDATEDREVIEWGUIDE-`, `AT-SR-`-collision-with-`AT-SERVERRESPONSE-` TBD). Canonical SSOT: `.lovable/memory/audit/at-namespace-synonym-audit.md`. Same code-span/fenced-block carve-out as `G-01-AT-ID-FORMAT-CANONICAL`. Failure mode: CI lint reports each offending file:line and points to canonical. Existing legacy rows are exempted via dated allow-list (`spec/_LEDGER-G-NS-LEGACY-EXEMPT.md`) until P3 consolidation sweep retires them. |
| `G-NS-STATUS-IN-LEGEND` | **CI** | [`spec/01-spec-authoring-guide/97-acceptance-criteria.md`](./01-spec-authoring-guide/97-acceptance-criteria.md) | Every `**Status:**` line in `spec/**/*.md` MUST resolve to one of the 9 canonical tokens (`DRAFT|REVIEW|CANONICAL|COMPANION|DISPATCH|DEFERRED|DEPRECATED|REDIRECT|ARCHIVED`). Optional parenthetical qualifier permitted. SSOT: `spec/01-spec-authoring-guide/20-status-legend.md` §1; mapping table in §2; audit ledger `.lovable/memory/audit/at-status-legend-audit.md`. Same code-span/fenced-block carve-out as the other `G-NS-*` and `G-01-*` gates. **WARN-only initial mode** until P3 status sweep retires the 46 legacy values; flag flips to hard-fail when legacy count reaches 0. |
| `G-NS-ADR-MUST-HAS-AT` | **CI** | [`spec/01-spec-authoring-guide/97-acceptance-criteria.md`](./01-spec-authoring-guide/97-acceptance-criteria.md) | Every ADR in `spec/00-adrs/` whose body contains ≥5 `MUST`/`SHALL` rules MUST be cited by ≥1 `97-acceptance-criteria.md` row using `ADR-NNNN` token or path link. As of 2026-04-29: 23 ADRs uncited (285 orphaned MUSTs); ADR-0026 closed via `AT-APP-108..110`. SSOT: `.lovable/memory/audit/at-prose-must-shall-sweep.md`; allow-list ledger: `spec/_LEDGER-G-NS-ADR-COVERAGE.md` (90-day TTL). Same code-span/fenced-block carve-out. **WARN-only initial mode** until AUDIT-03 backfill (#1) empties allow-list; flag flips to hard-fail when allow-list is empty. ADRs with <5 MUSTs are exempt. |
| `G-01-DOD-NO-NN-PLACEHOLDER` | **CI** | [`spec/01-spec-authoring-guide/97-acceptance-criteria.md`](./01-spec-authoring-guide/97-acceptance-criteria.md) | Forbids non-testable placeholders in Definition-of-Done blocks (template rule §5). Three banned patterns inside any DoD block (`**Definition of Done**` → next `---`/`## `/`> Authoring`) of `spec/**/00-overview.md`: literal `AT-[A-Z]+-NN` ranges, broken xref `see this section's  once authored`, and `_AT rows pending —` prose. Canonical replacement form: `Every \`AT-<SECTION>-*\` row in \`97-acceptance-criteria.md\` passes`. Same code-span/fenced-block carve-out as other `G-01-*` gates. Audit-document table titles outside DoD blocks are scope-exempt. SSOT: `.lovable/memory/audit/at-dod-range-sweep.md`. Hard-fail from day 1 (sweep closed 13/13 on 2026-04-29). |
| `G-01-DOD-CONDENSED-MIRRORS-OVERVIEW` | **CI** | [`spec/01-spec-authoring-guide/97-acceptance-criteria.md`](./01-spec-authoring-guide/97-acceptance-criteria.md) | For every directory containing both `00-overview.md` and `00-overview-condensed.md` (currently 5: `02-coding-guidelines`, `03-error-manage`, `15-wp-plugin-how-to`, `31-app`, `32-ui-design`), the Definition-of-Done block MUST hash-match across both siblings. Enforces template rule §6 ("DoD lives in overview only — sub-files MUST NOT duplicate"). **WARN-only** initial mode (baseline confirmed clean 2026-04-29); promotion to hard-fail deferred until next overview-condensation pass. SSOT: `.lovable/memory/audit/at-dod-range-sweep.md` §"Sibling-mirror baseline". |
| `G-09-OVERVIEW-H1-MATCHES-FOLDER-INDEX` | **CI** | [`spec/01-spec-authoring-guide/97-acceptance-criteria.md`](./01-spec-authoring-guide/97-acceptance-criteria.md) | **Hard-fail mandatory (Phase 3 active 2026-04-29)**: every numeric-folder `spec/**/00-overview.md` (top-level + sub-overview) H1 MUST match `^# (\d{2,3})\b — ` and the captured prefix MUST equal the parent folder's leading numeric prefix. Phase history: P1 = WARN conditional (1/25 baseline at top-level); P2-top = top-level sweep authored prefixes in 24 files (audit ledger `.lovable/memory/audit/at-h1-prefix-sweep.md`); P2-sub = sub-overview sweep authored prefixes in 119 files (audit ledger `.lovable/memory/audit/at-sub-overview-h1-and-scoring-gate.md`); P3 = current — both presence and value enforced across all 144 numeric-folder overviews. Closes audit-issue-#6 regression class. Per-ADR files in `spec/00-adrs/` (`# ADR-NNNN — Title`) exempt — only that folder's own `00-overview.md` is in scope. 6 non-numeric sub-folders (`consolidated-review-guide`, `app-issues`, `diagrams`, two `skeletons`, `sql`) automatically scope-exempt (no numeric prefix to match). |
| `G-00-OVERVIEW-SCORING-TABLE-PRESENT` | **CI** | [`spec/01-spec-authoring-guide/97-acceptance-criteria.md`](./01-spec-authoring-guide/97-acceptance-criteria.md) | Every top-level `spec/[0-9][0-9]-*/00-overview.md` MUST contain at least one of: `^(##|###)\s+Scoring\b`, `^\*\*Scoring\*\*`, or `^\| Criterion \|`. Sub-overview files are out of scope (Scoring lives at section root only). Fenced-code-block carve-out applies (Scoring inside a code fence doesn't count). **Hard-fail from day 1** — baseline 2026-04-29: 25 of 25 top-level overviews already compliant; gate locks in today's clean state. SSOT: `.lovable/memory/audit/at-sub-overview-h1-and-scoring-gate.md` Part 2. Future companion `G-00-OVERVIEW-SCORING-TABLE-COMPLETE` (deferred) would enforce specific row presence once canonical scoring schema is ratified. |
| `G-00-OVERVIEW-AI-CONTRACT-PRESENT` | **CI** | [`spec/01-spec-authoring-guide/97-acceptance-criteria.md`](./01-spec-authoring-guide/97-acceptance-criteria.md) | Every top-level `spec/[0-9][0-9]-*/00-overview.md` MUST contain a heading line matching `^(##|###)\s+AI Contract\b`. Bare phrase in body prose does NOT count — must be a real section heading. **Dual-tier:** hard-fail at top-level (25 files), WARN-only at sub-overview tier (125 files). Fenced-code-block carve-out applies. **Clean baseline 2026-04-29: 25/25 top-level compliant** — gate ships hard-fail at top-level from day 1. Sub-overview WARN-tier surfaces signal without blocking; promotion to hard-fail deferred until sub-overview AI-Contract sweep is scoped. Per-ADR files in `spec/00-adrs/` exempt — only that folder's own `00-overview.md` is in scope. SSOT: `spec/01-spec-authoring-guide/18-ai-contract-template.md`. Completes the **overview-root contract trio** with `G-09-OVERVIEW-H1-MATCHES-FOLDER-INDEX` (H1) and `G-00-OVERVIEW-SCORING-TABLE-PRESENT` (Scoring). |
| `G-13-AUDIT-RUNNER-CONTRACT` | **CI** | [`spec/01-spec-authoring-guide/97-acceptance-criteria.md`](./01-spec-authoring-guide/97-acceptance-criteria.md) | Locks invariants of the spec-hygiene runner so the registry's `**CI**`-tier label is trustworthy. Six rules (all hard-fail): (1) `scripts/spec-hygiene/00-run-all.mjs` MUST exist as the single entry point with a top-level `checks` array; (2) runner MUST aggregate non-zero exits via `process.exit(1)` after the loop; (3) no silent skips — `try`/`catch` around `spawnSync` that swallows failures without `failed++` is forbidden; (4) every entry in `checks` MUST resolve to an existing file on disk (no stale entries pointing at deleted scripts); (5) `.github/workflows/spec-hygiene.yml` MUST invoke `node scripts/spec-hygiene/00-run-all.mjs` (per-script CI invocation forbidden); (6) every `\d{2}-check-*.mjs` checker file in `scripts/spec-hygiene/` MUST appear in the `checks` array (whitelist of helper/generator scripts exempt). **Clean baseline 2026-04-29:** runner exists, aggregates via line 55, wires 32 checker scripts, CI workflow invokes the runner. SSOT: `.lovable/memory/audit/at-audit-runner-contract.md`. Future companion `G-13-AUDIT-RUNNER-PARITY` (deferred) would assert runner-array length parity with CI-tier registry rows. |
| `G-00-OVERVIEW-AI-CONTRACT-COMPLETE` | **CI** | [`spec/01-spec-authoring-guide/97-acceptance-criteria.md`](./01-spec-authoring-guide/97-acceptance-criteria.md) | Locks the canonical 5-subsection schema inside every top-level `## AI Contract` block. Five rules: (1) all five bold-prefix subsections present — `**Purpose**`, `**Audience**`, `**Expected AI Output**`, `**Out of Scope**`, `**Definition of Done**`; (2) canonical order; (3) non-empty bodies; (4) every `**Out of Scope**` bullet contains a markdown link; (5) every `**Definition of Done**` bullet cites an `AT-*` ID, `G-*` gate, script path, or runner invocation. **Hard-fail rules 1+2 from day 1; rules 3–5 WARN-only** until first content-quality sweep. **Clean baseline 2026-04-29: 25/25 top-level overviews carry all 5 subsections in canonical order.** Sub-overviews out of scope (Authoring rule §6: contract lives in overview only, sub-files inherit). Fenced-code-block + `18-ai-contract-template.md` carve-out. SSOT: `spec/01-spec-authoring-guide/18-ai-contract-template.md` §"Required block" + §"Authoring rules". Audit ledger: `.lovable/memory/audit/at-overview-ai-contract-complete-gate.md`. Closes the gaming-loop on `G-00-OVERVIEW-AI-CONTRACT-PRESENT` (heading-only blocks now rejected). |
| `G-00-OVERVIEW-SCORING-TABLE-COMPLETE` | **CI** | [`spec/01-spec-authoring-guide/97-acceptance-criteria.md`](./01-spec-authoring-guide/97-acceptance-criteria.md) | Mirrors `G-00-OVERVIEW-AI-CONTRACT-COMPLETE` for the Scoring side. Three rules: (1) Scoring section MUST contain three canonical row tokens — `AI Confidence`/`AI Implementability`, `Ambiguity`, `Health Score`/`Overall`/`Total`; (2) each row MUST be followed by a parseable numeric score (`\d+%`, `\d+/\d+`, or letter grade); (3) aggregate Health/Overall/Total row MUST be last. **Hard-fail rule 1 from 2026-04-29 (post-backfill); rules 2–3 WARN-only.** Baseline 25/25 clean after backfill sweep (added Health Score row to 17 partials, normalized 2 to `AI Confidence`, added values block to `00-adrs`). Sub-overviews out of scope (Scoring lives at section root only). Fenced-code-block carve-out applies. SSOT: `spec/01-spec-authoring-guide/14-scoring-metrics.md`. Audit ledger: `.lovable/memory/audit/at-overview-scoring-complete-gate.md` (updated post-sweep). Completes Layer-2 of the trio (paired with `…-AI-CONTRACT-COMPLETE`). |
| `G-00-OVERVIEW-SCORING-VALUE-FORMAT` | **CI** | [`spec/01-spec-authoring-guide/97-acceptance-criteria.md`](./01-spec-authoring-guide/97-acceptance-criteria.md) | Layer-2.5 of the overview trio: locks one canonical value shape per Scoring row so a single regex can extract scores corpus-wide. Three rules (**all hard-fail from 2026-04-29 post-sweep**): (1) Health Score / Overall / Total value MUST match `^\d{1,3}%\s\([A-F][+\-]?\)$` (e.g. `95% (A)`) — `100/100` denominator and decoration FORBIDDEN; (2) AI Confidence value MUST be one of `{Very High, High, Medium, Low, Very Low}` exact case, no emoji/prose trailer (legacy `Production-Ready` mapped to `Very High`); (3) Ambiguity value MUST be one of `{None, Low, Medium, High, Very High}` exact case, no emoji. **Baseline 25/25 clean** — sweep normalized 10 cells across 5 files (`03`/`05`/`06`/`07`/`12`). Linter scope: **first** `## Scoring` block per file (so `08`/`34`/`36` per-feature criterion grids don't false-flag — see task #17 dedupe). Sub-overviews out of scope. Fenced-code carve-out. SSOT: `spec/01-spec-authoring-guide/14-scoring-metrics.md`. Audit ledger: `.lovable/memory/audit/at-overview-scoring-value-format-gate.md` (post-sweep). Completes Layer-2.5 (no AI Contract counterpart by design — bodies are prose). |
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

