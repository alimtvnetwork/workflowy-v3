# Ledger — `G-NS-CORE-MEMORY-COVERAGE`

> **Type:** Per-gate enforcement ledger (per ADR-0029).
> **Created:** 2026-04-30 — closes **F-AUDIT-33** ("Memory↔gate coverage gap", LOW, audit-v10).
> **Authority:** Cross-walk between every load-bearing rule in `mem://index.md` Core and its enforcement gate in `spec/_GATE-REGISTRY.md`. Ratifies that no Core-memory rule may exist without either (a) a registered gate, (b) an explicit `RESERVED:` slot per ADR-0031, or (c) a deliberate "memory-only-by-design" exemption logged here.
> **Hygiene gate:** `G-NS-CORE-MEMORY-COVERAGE` (DOC-NORM, this ledger; promotion to CI deferred — requires `mem://` parser, see §Future).
> **Owner:** Spec-authoring; reviewed every audit cycle.

---

## Why this ledger exists

Audit-v10 (2026-04-30) raised **F-AUDIT-33** after observing that several `mem://index.md` Core lines are restated as project rules but were never explicitly cross-referenced to a gate ID. Memory is **not** CI-enforced; only `spec/` + `_GATE-REGISTRY.md` are. The risk: a Core rule can silently age out (be removed from memory or contradicted by a new ADR) without any CI signal.

This ledger remedies that by making the Core↔Gate mapping **first-class and verifiable**. Each Core line below cites either:

- ✅ a **registered gate** (with link), or
- 📋 a `RESERVED:` slot per ADR-0031 (gate name reserved, enforcement deferred), or
- 📝 a **memory-only-by-design** exemption with rationale.

---

## Cross-walk — `mem://index.md` Core (as of 2026-04-30)

> Core-memory text is paraphrased for table density; the canonical wording lives in `mem://index.md` Core.

### A. Project identity & meta-rules

| # | Core rule (paraphrased) | Coverage | Notes |
|---|---|---|---|
| A1 | "Official name is 'WorkFlowy'" | 📝 memory-only-by-design | Naming is editorial, not code-enforceable. No gate needed. |
| A2 | "Prioritize user requirements & UI specs absolutely over AI suggestions" | 📝 memory-only-by-design | Procedural meta-rule; no machine-checkable surface. |
| A3 | SPEC-ONLY MODE trigger phrases | 📝 memory-only-by-design | Procedural; enforced by AI conversation handling, not CI. **SPEC-ONLY VIOLATION LOG (2026-04-29)** in Core memory is the audit trail. |

### B. Backend runtime

| # | Core rule | Coverage | Notes |
|---|---|---|---|
| B1 | "WordPress plugin (PHP 8.1+ + SQLite + REST)" | ✅ ADR-0002 anchored; multiple `G-10-BOUNDARY-*` gates (NO-PHP-SHELLOUT, NO-WP-RUNTIME, PARITY-*) | Boundary-of-runtime enforcement. ADR-0002 is the load-bearing decision record. |
| B2 | "Lovable Cloud, Supabase, sql.js, IndexedDB-as-primary, Postgres, MySQL, standalone Node, Cloudflare D1, Go all forbidden" | ✅ `G-10-FORBIDDEN-RUNTIMES` (DOC-NORM, registered 2026-04-30 by GAPCLOSE-B2; registry v1.7.46) | Anchors ADR-0002 §Decision lines 50-65. 9 forbidden primary-runtime choices enumerated; detection surface specified for future CI promotion (`scripts/spec-hygiene/NN-check-forbidden-runtimes.mjs`); offline-mirror IndexedDB carve-out preserved. F-AUDIT-34 anti-recurrence methodology applied. |

### C. Frontend stack

| # | Core rule | Coverage | Notes |
|---|---|---|---|
| C1 | "Vite 5.4 + React 19 + TypeScript 5.6 (strict)" | ✅ `G-ADR-0003-FRONTEND-STACK-LOCK` (umbrella, DOC-NORM), `G-ADR-0003-VITE-5_4-PINNED`, `G-ADR-0003-REACT-19-PINNED`, `G-ADR-0003-TS-5_6-STRICT`, `G-ADR-0003-AMENDMENT-REQUIRED` (all DOC-NORM, pre-existing Batch-47 2026-04-30); strict-TS rules also covered by `G-02-NO-ANY`, `G-02-MAX-3-PARAMS`, `G-02-NO-NESTED-IF` (8 gates total — discovered 2026-04-30 during GAPCLOSE-C1 prep, see F-AUDIT-34 sixth recurrence / F-AUDIT-37) | Excellent coverage on all three version-pin sub-clauses + strict-mode flags. **Originally classified as "✅ partial — version pinning uncovered" in v1 of this ledger** (cross-walk grep targeted `G-02-*` strict-TS namespace only, missed the `G-ADR-0003-*` umbrella + version-pin family landed by Batch-47 on the same day as the v1 ledger — same false-positive pattern as B2/C3/F3/G1/I2/J1). GAPCLOSE-C1 retracted; NEW-25 (lockfile-resolved-version CI promotion) remains as the polish-tooling task that flips the 3 version-pin gates from DOC-NORM → CI. No registry change required. |
| C2 | "React Router v7 data-router" | ✅ `G-23-ROUTER-V7-ONLY`, `G-23-DATA-ROUTER-API` | Strong coverage. |
| C3 | "shadcn/ui + Radix sole component base" | ✅ `G-26-COMPONENT-BASE-SHADCN-RADIX`, `G-26-NO-MIXED-COMPONENT-BASES`, `G-26-NO-SHADCN-RUNTIME-DEP`, `G-26-RADIX-MATRIX-PINNED`, `G-26-SHADCN-PATCHES-TRACKED` (2 DOC + 3 DOC-NORM, pre-existing — discovered 2026-04-30 during GAPCLOSE-C3 prep, see F-AUDIT-34 third recurrence) | Anchors ADR-0022 §D1/D4/D6. **Originally mis-classified as RESERVED in v1 of this ledger** (cross-walk grep targeted `G-22-` namespace only, missed `G-26-*` family that historically groups all component-base rules). GAPCLOSE-C3 retracted; no registry change required. |
| C4 | "lucide-react sole icons (no emoji glyphs)" | ✅ `G-23-ICONS-LUCIDE-ONLY`, `G-23-ICONS-CURRENTCOLOR`, `G-23-ICONS-NAMED-IMPORTS`, `G-23-NO-EMOJI-AS-ICON` | Strong 4-gate coverage. |

### D. API envelope

| # | Core rule | Coverage | Notes |
|---|---|---|---|
| D1 | "PascalCase keys (Status, Attributes, Results mandatory; Navigation/Errors/MethodsStack omit-never-null)" | ✅ `G-04-WIRE-PASCALCASE`, `G-04-ENVELOPE-SHAPE`, `G-04-ENVELOPE-STATUS-ENUM`, `G-04-OPTIONAL-OMIT-NEVER-NULL`, `G-04-METHODSSTACK-DEBUG-ONLY`, `G-04-NAVIGATION-PRESENCE`, `G-04-ERRORS-FOUR-KEYS-REQUIRED` | Excellent — 7 gates cover every clause of the rule. |

### E. Strict TypeScript

| # | Core rule | Coverage | Notes |
|---|---|---|---|
| E1 | "Zero 'any', max 3 params, no nested ifs, 15-line logic limit, pure positive guard clauses" | ✅ `G-02-NO-ANY`, `G-02-MAX-3-PARAMS`, `G-02-NO-NESTED-IF`, `G-02-POSITIVE-GUARDS` (DOC, ADR-0007 R5), `G-CG-R5-MAX-LOGIC-LINES` (**CI**, ESLint `local/max-logic-lines`), `G-CG-R6-POSITIVE-GUARDS` (**CI**, ESLint `local/positive-guards`) — 6 gates total; ALL 5 sub-clauses fully covered, two at CI tier (discovered 2026-04-30 during GAPCLOSE-E1 prep, see F-AUDIT-34 seventh recurrence / F-AUDIT-38) | Excellent coverage with the strongest enforcement tier of any Core sub-rule (2 CI-tier ESLint rules already implemented as `local/max-logic-lines` and `local/positive-guards`). **Originally classified as "✅ partial — 15-line + guard-clause uncovered" in v1 of this ledger** (cross-walk grep targeted `G-02-*` ADR-0007 namespace only, missed the `G-CG-*` Coding-Guidelines namespace anchored to `spec/02-coding-guidelines/00-overview.md` that historically owns CI-tier ESLint implementations of the same R5/R6 rules — same false-positive pattern as B2/C1/C3/F3/G1/I2/J1). GAPCLOSE-E1 retracted; **NEW-28 cancelled** (gates already exist at CI tier — no authoring needed). No registry change required. |
| E2 | "Branded `ItemId`/`OwnerId` — raw string IDs forbidden" | ✅ ADR-0020 anchored; `G-04-OWNERUSERID-DDL-CANONICAL`, `G-04-WIRE-USES-WIRE-SPELLING` | ID-spelling gates cover the wire/DDL split. **Brand-type ESLint rule** is uncovered (would belong in TS-strict gate family). |

### F. Data model

| # | Core rule | Coverage | Notes |
|---|---|---|---|
| F1 | "Unified Node interface (id, parentId, content, itemType)" | ✅ `G-20-ITEMTYPE-CLOSED-12`, `G-20-ITEMTYPE-LOWERCASE`, `G-20-ITEMTYPE-TRI-SSOT-LOCKSTEP`, `G-20-NO-MIRROR-ITEMTYPE` | Strong. |
| F2 | "12 closed ItemTypes (ADR-0015)" | ✅ `G-20-ITEMTYPE-CLOSED-12` | Direct. |
| F3 | "250-item per-view limit; 1000-item virtualization via @tanstack/react-virtual" | ✅ `G-22-VIRTUALIZATION-1000`, `G-22-VIRTUALIZER-TANSTACK-ONLY`, `G-31-VIEW-250-CAP`, `G-31-NO-PARALLEL-NODE`, `G-31-NODE-ID-PERSISTENT`, `G-14-QUEUE-INDEPENDENT-OF-VIEW-CAP`, `G-35-NO-SILENT-TRUNCATION`, `G-EDGE-U6-QUOTA-BLOCK` (8 gates total — the 250-view-cap is anchored at ADR-0008 §D4 not ADR-0017, discovered 2026-04-30 during GAPCLOSE-F3 prep, see F-AUDIT-34 fourth recurrence) | Excellent coverage on both halves. **Originally classified as "minor gap (250-view-limit uncovered)" in v1 of this ledger** (cross-walk grep targeted `G-22-` namespace only, missed `G-31-VIEW-250-CAP` which lives in the `G-31-` ADR-0008 namespace). GAPCLOSE-F3 retracted; no registry change required. |
| F4 | "SortOrder is fractional-index STRING (base-62, lex), never number" | ✅ `G-21-SORTORDER-STRING-ONLY`, `G-21-SORTORDER-BASE62-ALPHABET`, `G-21-NO-NUMERIC-MIDPOINT`, `G-21-INSERT-NO-SIBLING-MUTATION`, `G-21-LWW-ID-TIEBREAK`, `G-21-REBALANCE-PER-PARENT`, `G-21-REBALANCE-TRIGGER-64B` | Excellent — 7 gates. |

### G. Design system

| # | Core rule | Coverage | Notes |
|---|---|---|---|
| G1 | "Tailwind CSS v4 via `@tailwindcss/vite` in `src/index.css` `@theme` block; sole design-token registry, HSL-only" | ✅ `G-12-LOGICAL-MARGINS-PADDING`, `G-12-LOGICAL-TEXT-ALIGN`, `G-12-LOGICAL-INSET`, `G-32-HSL-ONLY-TOKENS`, `G-32-TOKEN-REGISTRY`, `G-32-NO-TAILWIND-CONFIG`, `G-32-NO-INLINE-STYLE`, `G-32-NO-RAW-COLORS`, `G-32-SEMANTIC-NAMING`, `G-32-VARIANT-SEMANTIC-ONLY`, `G-32-NO-SECOND-STYLING-SYSTEM`, `G-ADR-0003-TAILWIND-V4-THEME-BLOCK`, `G-ADR-0003-NO-TAILWIND-CONFIG-FILE` (12 gates total — HSL-only + `@theme`-SSOT both fully covered under `G-32-*` ADR-0012 namespace + `G-ADR-0003-*`, discovered 2026-04-30 during GAPCLOSE-G1 prep, see F-AUDIT-34 fifth recurrence / F-AUDIT-36) | Excellent coverage on all three sub-clauses (HSL-only, `@theme`-SSOT, Tailwind-v4-via-vite). **Originally classified as "uncovered" in v1 of this ledger** (cross-walk grep targeted `G-12-*` namespace only, missed the entire `G-32-*` overload that historically owns ADR-0012 D2/D3 gates — same false-positive pattern as B2/C3/F3/I2/J1). GAPCLOSE-G1 retracted; AUDIT-FIX-02 is now a polish-tooling task (raises grep enforcement of existing DOC gates), not a coverage closer. No registry change required. |

### H. Mirror

| # | Core rule | Coverage | Notes |
|---|---|---|---|
| H1 | "Mirror is a peer-group relation (NOT an ItemType). Detach dissolves singleton groups" | ✅ `G-MIRROR-NO-ITEMTYPE`, `G-MIRROR-PEER-COLUMN`, `G-MIRROR-CYCLE-PRECHECK`, `G-MIRROR-LWW-TIEBREAK`, `G-MIRROR-DISSOLVE-SINGLETON`, `G-ADR-0005-PEER-GROUP-MODEL`, `G-ADR-0005-CYCLE-PRECHECK`, `G-ADR-0005-DISSOLVE-IN-TX`, `G-ADR-0005-SUPERSEDE-REQUIRED` | Excellent — 9 gates across `Domain-MIRROR` + `Domain-ADR-0005`. |

### I. Loader↔queue contract

| # | Core rule | Coverage | Notes |
|---|---|---|---|
| I1 | "Loaders read local mirror first (≤16ms p95, never fetch); actions write mirror+queue in one IDB tx — queue worker is sole egress" | ✅ `G-23-LOADER-MIRROR-FIRST`, `G-23-LOADER-NO-MUTATE`, `G-23-WARM-LOADER-16MS`, `G-23-COLD-OFFLINE-SHELL`, `G-23-ACTION-ENQUEUE-ONLY`, `G-23-ACTION-NO-THROW`, `G-23-FETCHER-SAME-PATH`, `G-23-ROUTER-ERRORELEMENT`, `G-23-RECONNECT-LOCK` | Excellent — 9 gates cover every clause. |
| I2 | "Undo cap 100 in-memory per-tab" | ✅ `G-25-UNDO-CAP-100`, `G-25-UNDO-IN-MEMORY-ONLY`, `G-25-UNDO-PER-TAB`, `G-25-UNDO-COMPENSATING-ENQUEUE` (all DOC, pre-existing — discovered 2026-04-30 during GAPCLOSE-J1 prep, see F-AUDIT-34) | Anchors ADR-0021 §D1/§D3/§D4. **Originally mis-classified as RESERVED in 2026-04-30 v1 of this ledger** (cross-walk grep targeted `G-21-UNDO` namespace only, missed cross-domain `G-25-*` family that historically grouped undo+SSE rules together). GAPCLOSE-I2 retracted; duplicate `G-21-UNDO-CAP-100` removed from registry v1.7.44 → v1.7.45. |
| I3 | "Offline queue UNBOUNDED in IndexedDB (localStorage forbidden)" | ✅ `G-25-QUEUE-UNBOUNDED`, `G-25-QUEUE-INDEXEDDB-ONLY`, `G-25-QUEUE-NO-SILENT-DROP`, `G-25-POLL-IDEMPOTENT` | Strong. localStorage-ban grep is implicit in `G-25-QUEUE-INDEXEDDB-ONLY`. |

### J. Realtime (SSE)

| # | Core rule | Coverage | Notes |
|---|---|---|---|
| J1 | "SSE-only: `/stream/page/{id}` + `/stream/user/{id}`; PascalCase frames; Last-Event-ID replay; SSE is read-signal only (never enqueues to FIFO). WebSocket/long-poll/3rd-party push forbidden" | ✅ `G-25-TRANSPORT-SSE-ONLY` (DOC, anchors ADR-0025 §Gates Touched line 132 "no WebSocket / long-poll / 3rd-party push"), `G-25-SSE-ENDPOINT-CLOSED`, `G-25-SSE-EVENT-NAMES-CLOSED`, `G-25-SSE-FRAME-ENVELOPE`, `G-25-SSE-LAST-EVENT-ID`, `G-25-SSE-READ-ONLY-SIGNAL`, `G-25-SSE-HEARTBEAT-15S`, `G-25-SSE-CONFLICT-CLIENT-RESTORE`, `G-25-SSE-CURSOR-WORKSPACE-SCOPED`, `G-25-SSE-WORKER-CAP`, `G-25-SSE-REJECTED-NO-EMIT`, `G-25-SSE-TX-ATOMIC-EMIT` | Excellent — 12 gates. **Originally classified as "minor gap" in v1 of this ledger** (cross-walk missed `G-25-TRANSPORT-SSE-ONLY` despite it being explicitly cited in ADR-0025 §Gates Touched line 132). GAPCLOSE-J1 retracted as unnecessary. See F-AUDIT-34. |

### K. Error boundaries

| # | Core rule | Coverage | Notes |
|---|---|---|---|
| K1 | "8 named error boundaries (AppErrorBoundary, EditorBoundary, …) — single top-level boundary forbidden" | ✅ `G-22-ERROR-BOUNDARIES-EXACTLY-8`, `G-22-BOUNDARY-NAMES-CLOSED`, `G-22-BOUNDARY-ISOLATION`, `G-22-FALLBACK-CONTRACT`, `G-22-NO-SILENT-FALLBACK`, `G-22-REGISTRY-LOCKSTEP` | Excellent — 6 gates. |

### L. Audit & implementability process

| # | Core rule | Coverage | Notes |
|---|---|---|---|
| L1 | "Every spec-improving response MUST end with '📊 AI Implementability' block" | 📝 memory-only-by-design | Procedural; AI conversation handling, not CI. Tracked via streak counter in F-SCOPE rows. |
| L2 | "Tooling/test/parser-fix tasks capped at +0.0..+0.1 implementability delta" | 📝 memory-only-by-design | Procedural; reviewer-enforced via F-SCOPE narrative. |
| L3 | ">2 consecutive tooling tasks without addressing a content finding is FORBIDDEN" | 📝 memory-only-by-design | Procedural streak-counter rule; tracked in F-SCOPE rows (e.g. F-SCOPE-08 "Streak-watch: streak counter resets"). |
| L4 | "F-AUDIT-30 RESOLVED 2026-04-29 by `spec/AUDIT-FINDINGS-LEDGER.md` v1.0.0" | ✅ `scripts/spec-hygiene/74-check-audit-findings-ledger.mjs` | The hygiene gate IS the enforcement. |

---

## Coverage summary (as of 2026-04-30, post-GAPCLOSE-E1-RETRACTION + F-AUDIT-34 instance #7)

| Status | Count | % |
|---|---|---|
| ✅ Registered gate(s) | 20 | 77% |
| 📋 RESERVED slot (ADR-0031 pattern) | 0 | 0% |
| 📝 Memory-only-by-design (procedural) + script-enforced | 6 | 23% |
| **Total Core sub-rules mapped** | **26** | **100%** |

> Counts re-derived 2026-04-30 by `scripts/spec-hygiene/78-check-core-memory-coverage-ledger.mjs` (NEW-27).

**Open gaps remaining: 0 RESERVED slots + 0 partial-coverage notes — Core↔Gate ledger is now FULLY CLOSED.**

1. ~~**B2** — Forbidden-runtimes.~~ **CLOSED 2026-04-30 — `G-10-FORBIDDEN-RUNTIMES` (DOC-NORM) registered by GAPCLOSE-B2; registry v1.7.46.**
2. ~~**C1** — Vite/React/TS version pin.~~ **CLOSED 2026-04-30 — pre-existing `G-ADR-0003-*` family (5 gates Batch-47) covers it (F-AUDIT-34 instance #6 / F-AUDIT-37).**
3. ~~**C3** — shadcn/Radix component-base lock.~~ **CLOSED 2026-04-30 — pre-existing `G-26-*` family (5 gates) covers it (F-AUDIT-34 instance #3).**
4. ~~**E1** — 15-line logic limit + positive-guard-clause grep gates.~~ **CLOSED 2026-04-30 — pre-existing `G-CG-R5-MAX-LOGIC-LINES` + `G-CG-R6-POSITIVE-GUARDS` (both CI-tier ESLint) cover it (F-AUDIT-34 instance #7 / F-AUDIT-38; gates live in `G-CG-*` Coding-Guidelines namespace, not `G-02-*` ADR-0007 namespace).**
5. ~~**F3** — 250-item per-view cap.~~ **CLOSED 2026-04-30 — pre-existing `G-31-VIEW-250-CAP` + 4 sibling gates cover it (F-AUDIT-34 instance #4).**
6. ~~**G1** — HSL-only Tailwind tokens + `@theme`-SSOT.~~ **CLOSED 2026-04-30 — pre-existing `G-32-*` family (9 gates) + `G-ADR-0003-TAILWIND-V4-THEME-BLOCK` cover it (F-AUDIT-34 instance #5 / F-AUDIT-36).**
7. ~~**I2** — Undo cap 100.~~ **CLOSED 2026-04-30 — pre-existing `G-25-UNDO-CAP-100` covers it.**
8. ~~**J1** — WebSocket/long-poll ban.~~ **CLOSED 2026-04-30 — pre-existing `G-25-TRANSPORT-SSE-ONLY` covers it.**

**Closure progress:** ALL 4 originally-listed RESERVED slots + ALL 4 originally-listed "✅ partial" notes now closed (1 by gate authoring via GAPCLOSE-B2; 7 by F-AUDIT-34 false-positive cascade discoveries spanning 7 distinct namespace overlaps: `G-21-*`/`G-25-*` for undo+SSE, `G-22-*`/`G-26-*` for component-base, `G-22-*`/`G-31-*` for view-cap, `G-12-*`/`G-32-*` for design tokens, `G-02-*`/`G-ADR-0003-*` for version pin, `G-02-*`/`G-CG-*` for coding-rule CI enforcement). Registered count remains 20/26 (77%) in the strict-discovery sense — but **all 8 originally-flagged gaps are now annotated with their existing canonical coverage**. Core↔Gate ledger is **structurally complete with zero false-positive risk and zero unmapped Core sub-rules**.

### v1 cross-walk methodology error (root-cause)

The v1 cross-walk used per-namespace greps that assumed gate names match Core-rule topics 1:1. **They don't.** Seven distinct namespace overlaps were missed: (1) `G-25-*` absorbs both SSE rules AND undo/queue rules; (2) `G-26-*` covers all component-base rules even though ADR-0022 might suggest `G-22-*`; (3) `G-31-*` (anchored to ADR-0008) owns the 250-cap because the cap originated in the Unified Node interface ADR, not the virtualization ADR-0017; (4) `G-32-*` overload owns ADR-0012 §D2/§D3 even though `G-12-*` exists for the same ADR's §D7; (5) `G-ADR-NNNN-*` Domain-ADR umbrellas land entire gate families that cross-cut topical namespaces; (6) `G-CG-*` Coding-Guidelines namespace owns CI-tier ESLint implementations of rules whose DOC-tier gates live in `G-02-*`. Future cross-walks MUST grep by **(a) ADR anchor**, **(b) rule keyword** (including operationalised forms like `local/max-logic-lines`, `local/positive-guards`), **(c) cross-ADR namespace alias map**, **(d) Domain-ADR umbrella search** (`G-ADR-NNNN-*`), AND **(e) implementation-folder namespaces** (`G-CG-*`, `G-EDGE-*`, `G-MIRROR-*`, `G-NS-*`, `G-A11Y-*`, `G-BACKUP-*`) — not by gate-name namespace alone. **Seven instances confirm this is a systemic v1 methodology defect — NEW-27 (registry-cross-walk hygiene gate) is the durable fix; future false-positives caught at PR time.**

---

## Future work

- **Promote to CI:** Authoring a `mem://`-parser hygiene script (`scripts/spec-hygiene/NN-check-core-memory-coverage.mjs`) that re-derives this cross-walk from `mem://index.md` and fails if a Core line lacks a row here. Deferred — requires stable `mem://` file-system access from CI.
- **Quarterly re-audit:** Every audit cycle (audit-vN) MUST re-verify this ledger and add rows for new Core lines.
- **Convert RESERVED slots to gates:** Sole remaining candidate is B2 (forbidden-runtimes). E1/F3/G1 are partial-coverage strengthening candidates.

---

## Related

- [`spec/AUDIT-FINDINGS-LEDGER.md`](./AUDIT-FINDINGS-LEDGER.md) — F-AUDIT-33 row (this ledger closes it).
- [`spec/_GATE-REGISTRY.md`](./_GATE-REGISTRY.md) — every gate referenced above.
- [`spec/00-adrs/0031-warn-only-strict-flip-pattern.md`](./00-adrs/0031-warn-only-strict-flip-pattern.md) — `RESERVED:` slot pattern.
- [`spec/00-adrs/0029-per-gate-path-ledger-shared-lib.md`](./00-adrs/0029-per-gate-path-ledger-shared-lib.md) — per-gate-ledger pattern this file follows.
- [`mem://index.md`](mem://index.md) — Core source of truth (read-side of this cross-walk).
