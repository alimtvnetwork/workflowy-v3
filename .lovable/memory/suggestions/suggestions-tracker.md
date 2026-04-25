# Lovable Suggestions Tracker

> **Convention:** All suggestions tracked in this single file. Update status when completed. Move completed entries to `completed/` folder.
> **Updated:** 2026-04-25 (UTC+8) — A-19 closed (8th batch of leaf AT files curated; running totals: 41 AT files curated → ~472 testable criteria authored)

---

## Active Suggestions

### S003 — Resolve Backend Runtime Strategy
- **Created:** 2026-03-18
- **Source:** Lovable
- **Affected:** Architecture (all backend modules)
- **Description:** Specs describe split SQLite backend with filesystem access, but Lovable only runs frontend code.
- **Rationale:** Without resolution, auth, data persistence, file uploads, and multi-user features are impossible.
- **Proposed Change:** Choose one: (a) Lovable Cloud, (b) WordPress backend, (c) browser SQLite (sql.js), (d) frontend-only with localStorage.
- **Acceptance Criteria:** Clear decision documented. Plan.md and specs updated to reflect chosen approach.
- **Status:** open — **BLOCKS IMPLEMENTATION** of auth, data layer, and all persistence features
- **User action required:** Yes — must choose backend strategy (memory hint: leaning WordPress)

### A-04 — Enum-sync hygiene check (ItemType drift guard) → ✅ closed
- **Closed:** 2026-04-25 (UTC+8)
- **Result:** Added `scripts/spec-hygiene/15-check-enums-in-sync.mjs` (extensible `ENUMS` table). Wired into `00-run-all.mjs`. Verified positive ✅ on 12-case `ItemType` and negative ❌ on a synthetic `phantom` case (exit 1). Adding new tracked enums = one row in the script's `ENUMS` array.

### A-05 — Tailwind token-sync hygiene check → ✅ closed
- **Closed:** 2026-04-25 (UTC+8)
- **Result:** Added `scripts/spec-hygiene/16-check-tailwind-tokens.mjs`. Parses `@theme` block (39 colors / 12 spacing / 8 font-size / 3 radius), then scans 24 source files and asserts every token-bound utility (`bg-*`, `text-*`, `m*-*`, `rounded-*`, etc.) resolves. Built-in Tailwind utilities and arbitrary `[…]` values are correctly ignored. Wired into `00-run-all.mjs`. Negative-test verified (synthetic `text-h99` caught with exit 1).

### A-11 — Encode `MAX_ITEMS_PER_VIEW = 250` → ✅ closed
- **Closed:** 2026-04-25 (UTC+8)
- **Result:** Constant added to `src/lib/constants.ts` with SSOT cross-link to `mem://architecture/data-model` and `spec/31-app/01-features/04-page-content-area.md`. Other constants now annotated with spec refs too.

### A-12 — Curate top-level AT rollups for App + UI Design → ✅ closed
- **Closed:** 2026-04-25 (UTC+8)
- **Result:** Replaced placeholder scaffolds in `spec/31-app/97-acceptance-criteria.md` (23 criteria, AT-APP-01..23) and `spec/32-ui-design/97-acceptance-criteria.md` (28 criteria, AT-UIDESIGN-01..28). Every criterion cites a source spec or named SSOT.

### A-13 — Curate 5 coding-guideline AT files → ✅ closed
- **Closed:** 2026-04-25 (UTC+8)
- **Result:** Curated `02-typescript/` (13 criteria), `01-cross-language/02-boolean-principles/` (11), `01-cross-language/15-master-coding-guidelines/` (17), `01-cross-language/27-types-folder-convention/` (11), `01-cross-language/04-code-style/` (16). Total: 68 testable criteria. Version 0.12.0.

### A-14 — Curate 5 error-mgmt + DB + PHP + Go AT files → ✅ closed
- **Closed:** 2026-04-25 (UTC+8)
- **Result:** Curated `03-error-manage/02-error-architecture/04-error-modal/` (12 criteria), `02-coding-guidelines/03-golang/01-enum-specification/` (13), `02-coding-guidelines/04-php/02-forbidden-patterns/` (13), `04-database-conventions/06-rest-api-format/` (11, anchors the PascalCase Golden Rule), `02-coding-guidelines/04-php/01-enums/` (19 — covers all 17 PHP enum cases). Total: 68 testable criteria. All 18 hygiene checks pass. Stub count: 79 → 80 (auto-stub generator created 1 new placeholder for a folder that gained an entry). Version 0.13.0.

### A-15 — Curate 5 envelope + registry + casting + CI + DB-rollup AT files → ✅ closed
- **Closed:** 2026-04-25 (UTC+8)
- **Result:** Curated `03-error-manage/02-error-architecture/05-response-envelope/` (9 criteria, anchors envelope SSOT), `03-error-manage/03-error-code-registry/` (12, cross-project collision prevention), `02-coding-guidelines/01-cross-language/03-casting-elimination-patterns/` (12, §7.2 enforcement), `02-coding-guidelines/01-cross-language/16-static-analysis/09-ci-pipeline-quality-gate/` (13, universal quality gate), `04-database-conventions/` top-level rollup (13, anchors PascalCase Golden Rule end-to-end). Total: 59 testable criteria. Fixed 3 broken links (envelope path depth + registry overview filename `01-overview.md` not `00-overview.md`). All 18 hygiene checks pass. Stub count: 80 → 75. Version 0.14.0.

### A-16 — Curate 5 PHP-naming + file-folder + apperror-ref + debugging-TS + Go-bool AT files → ✅ closed
- **Closed:** 2026-04-25 (UTC+8)
- **Result:** Curated `02-coding-guidelines/04-php/03-naming-conventions/` (13 criteria, AT-NAMINGCONVENTIONS-01..13 — PSR-12 baseline + PascalCase array keys), `02-coding-guidelines/08-file-folder-naming/` (14, AT-FILEFOLDERNAMING-01..14 — universal + 6 per-language profiles incl. PowerShell), `03-error-manage/02-error-architecture/06-apperror-package/01-apperror-reference/` (15, AT-APPERRORREFERENCE-01..15 — 4 invariants I-1..I-4 + StackTrace + Variation enum policy + skip table + 300-line file budget), `03-error-manage/01-error-resolution/05-debugging-guides/03-debugging-typescript/` (12, AT-DEBUGGINGTYPESCRIPT-01..12 — envelope validation, DiagnosticsPanel, structured logger, ErrorBoundary), `02-coding-guidelines/03-golang/02-boolean-standards/` (15, AT-BOOLEANSTANDARDS-01..15 — P1..P9 + 3 idiomatic exemptions + linter enforcement). Total: 69 testable criteria. Fixed 1 broken link (PHP-naming path depth `../../../../` → `../../../`). All 18 hygiene checks pass. Stub count: 75 → 70. Version 0.15.0.

### A-17 — Curate 5 TS-ref + PHP-ref + retros + error-handling-ref + AI-mistakes AT files → ✅ closed
- **Closed:** 2026-04-25 (UTC+8)
- **Result:** Curated `02-coding-guidelines/02-typescript/08-typescript-standards-reference/` (14 criteria, AT-TYPESCRIPTSTANDARDSREFERENCE-01..14 — generics-first, zero-`any`, no-magic, 15-line/zero-nesting, isDefined guards, discriminated unions, enum parity, envelope validation), `02-coding-guidelines/04-php/07-php-standards-reference/` (13, AT-PHPSTANDARDSREFERENCE-01..13 — naming, structured errors, no-swallow catch, magic-value ban, constructor purity, isDefined guards, no-extract/eval/`$$var`, prepared statements + PascalCase DB keys), `03-error-manage/01-error-resolution/03-retrospectives/` (10, AT-RETROSPECTIVES-01..10 — Symptom→Root Cause→Detection→Fix→Prevention→Lessons format + 4 R-NN incident anchors), `03-error-manage/02-error-architecture/01-error-handling-reference/` (13, AT-ERRORHANDLINGREFERENCE-01..13 — 3-tier architecture, DelegatedRequestServer block, Global Error Modal tabs, E9999 unknown-code fallback), `02-coding-guidelines/06-ai-optimization/03-common-ai-mistakes/` (13, AT-COMMONAIMISTAKES-01..13 — 20 numbered mistakes incl. caching CODE RED §16-20, hallucination signals via tech-stack memory). Total: 63 testable criteria. All 18 hygiene checks pass. Stub count: 70 → 65. Version 0.16.0.

### A-18 — Curate 5 error-modal-ref + apperror-struct + apperrtype-enums + debugging-go + session-logging AT files → ✅ closed
- **Closed:** 2026-04-25 (UTC+8)
- **Result:** Curated `03-error-manage/02-error-architecture/04-error-modal/03-error-modal-reference/` (15 criteria, AT-ERRORMODALREFERENCE-01..15 — CapturedError model, fixed Backend tabs Overview/Log/Execution/Stack/Session/Request/Traversal + Frontend tabs Overview/Stack/Context/Fixes, 3-hop request chain, deterministic Compact/Full reports, modal as sole error consumer), `03-error-manage/02-error-architecture/06-apperror-package/01-apperror-reference/02-apperror-struct/` (12, AT-APPERRORSTRUCT-01..12 — struct purity, exact basic constructor set New/Wrap/NewType/WrapType/WrapTypeMsg, exact convenience set PathError/UrlError/SlugError/SiteError/EndpointError, Merge nil short-circuit, deterministic display methods), `03-error-manage/02-error-architecture/06-apperror-package/01-apperror-reference/05-apperrtype-enums/` (13, AT-APPERRTYPEENUMS-01..13 — Variation as uint16, E1xxx-E18xxx ranges, JSON serializes by Code string, registry bijection, v1.x→v2.0 migration), `03-error-manage/01-error-resolution/05-debugging-guides/02-debugging-go/` (12, AT-DEBUGGINGGO-01..12 — 5-step boot order, zerolog structured fields, no-`http.Error` rule, pprof loopback-only, ORM-only policy, DBOperation wrapper), `03-error-manage/02-error-architecture/07-logging-and-diagnostics/02-session-based-logging/` (14, AT-SESSIONBASEDLOGGING-01..14 — SessionId at edge, 6-field complete capture, DelegatedRequestInfo for proxied calls, redact-before-persist, retention worker, 8 documented REST endpoints). Total: 66 testable criteria. All 18 hygiene checks pass. Stub count: 65 → 60. Version 0.17.0.

### A-19 — Curate 5 retry-debounce-dedup + code-style + blank-lines + boolean-principles + error-resolution-rollup AT files → ✅ closed
- **Closed:** 2026-04-25 (UTC+8)
- **Result:** Curated `03-error-manage/01-error-resolution/03-retrospectives/02-retry-debounce-dedup-fixes/` (14 criteria, AT-RETRYDEBOUNCEDEDUPFIXES-01..14 — global QueryClient retry policy, refetchOnWindowFocus disabled, API-level publish dedup lock + cooldown, stable WS listener cleanup, toast dedup window, circuit breaker, snapshot suppression, typed RetryPolicy value object), `02-coding-guidelines/01-cross-language/04-code-style/` (14, AT-CODESTYLE-01..14 — K&R braces, zero nested if, ≤15 logical lines, ≤3 params, multi-line params with trailing comma, no dead code), `02-coding-guidelines/01-cross-language/04-code-style/03-blank-lines-and-spacing/` (11, AT-BLANKLINESANDSPACING-01..11 — Rules 4/5/10 with explicit exemptions, no consecutive blanks), `02-coding-guidelines/01-cross-language/02-boolean-principles/` (13, AT-BOOLEANPRINCIPLES-01..13 — positive prefixes, no plural booleans, isDefined/isEmpty guards, no boolean-flag params, ternary-cond ban, adapter conversion at API boundary), `03-error-manage/01-error-resolution/` (12, AT-ERRORRESOLUTION-01..12 — cross-ref diagram SSOT, uniform cheat-sheet template, retro-before-merge rule, 5-field frontend↔backend sync recipe, registered-code requirement). Total: 64 testable criteria. All 18 hygiene checks pass. Stub count: 60 → 55. Version 0.18.0.

---

## Closed Suggestions (this sweep — 2026-04-25)

### S001 — Reconcile Legacy Docs with Current Specs → ✅ obsolete
- **Closed:** 2026-04-25 (UTC+8)
- **Reason:** The `docs/` folder no longer exists. Verified via `ls docs/`. Migrated into `spec/` during 2026-03 → 2026-04 restructure.

### S002 — Rename Spec Columns to PascalCase → ✅ obsolete
- **Closed:** 2026-04-25 (UTC+8)
- **Reason:** Target files `spec/03-BACKEND.spec.md` and `spec/04-SYSTEM-ARCHITECTURE.spec.md` no longer exist. Current database specs already enforce PascalCase as standard.

### S005-original — Run Backend Failure Analysis → ✅ obsolete
- **Closed:** 2026-04-25 (UTC+8)
- **Reason:** Original referenced specs no longer exist. Closing as superseded; new gap analysis to be run against whichever backend stack is chosen via S003.

> Note: "S005" in `05-ci-gate-broken-relative-links.md` is a different item (closed alongside S03).

---

## Completed Suggestions

> Completed suggestions are moved to `.lovable/memory/suggestions/completed/` as individual files.

### A-04 — Enum-sync hygiene check
- **Completed:** 2026-04-25 (UTC+8)
- **Result:** New `15-check-enums-in-sync.mjs` parses `spec/20-enums-index.md` row + `src/types/index.ts` literal union for each tracked enum and fails on any drift. Wired into `00-run-all.mjs`. Negative-test verified.

### Phase 4 — Workflowy Spec Consolidation (plan 03)
- **Completed:** 2026-04-25 (UTC+8)
- **Result:** Verified all 10 sub-phases live under `spec/32-ui-design/06-workflowy-ui/01-navbar/` … `10-mobile/` with consistency report scoring 100/100. All 4 cross-cutting blockers resolved (B1 hex swatches in `05-editor/04-color-palettes.md`, B2 sidebar drag = move-or-⌥-mirror in `06-sidebar/03-drag-drop.md`, B3 launch themes = light+dark in `08-app-shell/02-themes.md`, D1 LinkedIn read-only in `09-integrations/00-overview.md`). Also closed plan 02 (all 18 audit issues I-01…I-18 verified resolved — parallel folders gone, `.lovable/memories/` gone, audits folder gone, 18 hygiene scripts wired). Archived all three plans to `.lovable/plans/archive/`; created `00-active.md` index. Fixed 3 broken xrefs from spec → archived plan paths. Full hygiene suite passes; 28/28 tests pass.

### A-07 — Wire Toaster to typed queue
- **Completed:** 2026-04-25 (UTC+8)
- **Result:** Replaced no-op `Toaster` (returned `null`) with a real implementation: `src/contexts/ToastContext.tsx` exposes `<ToastProvider>`, `useToast()`, typed variants (`success | error | info | warning`), optional `errorCode` field for future `apperror` linkage, default 3000 ms auto-dismiss with overridable `durationMs`, plus `dismiss()` and `clear()`. `Toaster` now renders the queue with semantic-token classes only. Wired `<ToastProvider>` at `App.tsx` root. Added 9 tests (queue add/dismiss/auto-expire/custom-duration/clear/errorCode + render & empty-state) — total 28/28 pass.

### A-06 — Wire AppLayout into routes
- **Completed:** 2026-04-25 (UTC+8)
- **Result:** `App.tsx` now wraps `<Home>` and `<NotFound>` in `<AppLayout>` via React Router `<Outlet />`. AppLayout provides `min-h-screen` background/foreground tokens; ready for Navbar + Sidebar slots in P1.3. Build clean, 19/19 tests still pass.

### A-08 — Vitest setup + tests for pure helpers
- **Completed:** 2026-04-25 (UTC+8)
- **Result:** Added `vitest@3.2.4`, `@testing-library/react@16.3.2`, `@testing-library/jest-dom@6.9.1`, `jsdom@25.0.1`. Created `vitest.config.ts`, `src/test/setup.ts`. Added `test` / `test:watch` scripts. Wrote 19 tests covering `matches()`, `formatCombo()`, `getHotkey()`, registry shape, `asItemId()`, `asOwnerId()` — all passing in 3.7s. Closes audit finding A-08; partly mitigates A-02 (registry now snapshot-locked).

### SC001 — Frontend Spec Gap Analysis (26 gaps)
- **Completed:** 2026-03-18
- **Description:** Identified and fixed 26 frontend spec gaps across 4 severity levels.
- **Result:** Sections §6A–§6F added to `spec/02-FRONTEND.spec.md`. Score: 100/100.
- **File:** `completed/SC001-frontend-gap-analysis.md`

### S004 — Add Versioning to Spec Files
- **Completed:** 2026-03-31
- **Result:** Each spec file has a Version header.

### S02 — Fix 5 Audit Findings in spec/ 31–36
- **Completed:** 2026-04-21
- **File:** `02-fix-spec-31-36-audit-findings.md`

### S03 — Fix 49 Broken Relative Links
- **Completed:** 2026-04-25
- **File:** `03-fix-49-broken-relative-links.md`
- **Result:** Independent re-scan of 1,248 files found 0 broken links out of 2,622 real links.

### S04 — CI Gate: Required Files
- **Completed:** 2026-04-21
- **File:** `04-ci-gate-overview-and-consistency.md`
- **Result:** `scripts/spec-hygiene/12-check-required-files.mjs` wired into `00-run-all.mjs`.

### S05 — CI Gate: Broken Relative Links
- **Completed:** 2026-04-25
- **File:** `05-ci-gate-broken-relative-links.md`
- **Result:** Existing `03-check-links.mjs` already meets every requirement; closed as redundant-with-existing-implementation.

### S06 — Move Parallel Spec Folders
- **Completed:** 2026-04-23
- **File:** `06-move-parallel-spec-folders.md`
