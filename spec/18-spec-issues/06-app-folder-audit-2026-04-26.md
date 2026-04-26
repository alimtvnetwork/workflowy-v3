# App Folder Audit — 2026-04-26

> **Version:** 1.0.0
> **Created:** 2026-04-26 (UTC+8)
> **Status:** Open — findings only, NO fixes applied
> **Auditor mode:** Read-only gap analysis
> **Parent:** [`00-overview.md`](./00-overview.md)
> **Scope:** `spec/31-app/**` measured against foundational SSOTs (coding guidelines, glossary, enums, split-DB, seedable-config, naming conventions)

---

## 0. Executive Summary

| Dimension | Score | Verdict |
|-----------|:-----:|---------|
| Structural consistency | 85 / 100 | Good — folders + numbering clean |
| Foundational alignment | **42 / 100** | **Poor — multiple normative violations** |
| Content completeness | 70 / 100 | Acceptable for behavior contracts; thin on backend hooks |
| AI-readiness | **55 / 100** | **Risky — guessing required in 6 distinct areas** |
| **Composite** | **63 / 100** | **NOT safe to hand to AI blindly** |

**Blind-AI failure probability: ~70 %.** An AI given only this folder will:
1. Pick the wrong DB casing (snake vs Pascal) — see §F-01.
2. Invent a TS enum strategy — see §F-02.
3. Skip seedable-config + settings hooks — see §F-04.
4. Treat sample component paths as binding — see §F-07.
5. Miss the SSE/poll transport contract for several features — see §F-05.
6. Hallucinate field names that contradict the glossary — see §F-01, §F-08.

---

## 1. Method

1. Listed every file in `spec/31-app/`.
2. Compared identifiers against [`spec/19-glossary.md`](../19-glossary.md) §Database Vocabulary (PascalCase rule, normative as of v1.1.0).
3. Compared TS code blocks against [`spec/02-coding-guidelines/02-typescript/00-overview.md`](../02-coding-guidelines/02-typescript/00-overview.md) Strategy B (`as const` + derived union).
4. Compared boolean usage against [`spec/02-coding-guidelines/consolidated-review-guide/05-boolean-and-conditionals.md`](../02-coding-guidelines/consolidated-review-guide/05-boolean-and-conditionals.md).
5. Compared DB hints against [`spec/05-split-db-architecture/`](../05-split-db-architecture/00-overview.md) and [`spec/04-database-conventions/`](../04-database-conventions/00-overview.md).
6. Compared config/settings hints against [`spec/06-seedable-config-architecture/`](../06-seedable-config-architecture/00-overview.md) and [`spec/15-wp-plugin-how-to/15-settings-architecture/`](../15-wp-plugin-how-to/15-settings-architecture/00-overview.md).
7. Counted forced-guess surfaces (places where an AI must invent behavior).

Raw probes used:

```bash
rg -nP "[a-z]+_[a-z]" spec/31-app/01-features/ -c
rg -nP "split.?db|root.?db|app.?db" spec/31-app/ -c
rg -nP "seedable|seed.config" spec/31-app/ -c
rg -nP "settings|register_setting|OptionName" spec/31-app/ -c
rg -nP "enum|::Case|as const" spec/31-app/01-features/ -c
```

---

## 2. Findings (atomic, fix-task-ready)

Each finding has: ID · Severity · Files · What's wrong · Why it matters · Fix hint (NOT applied).

---

### F-01 — `snake_case` DB identifiers across 12 files

- **Severity:** **CRITICAL** (foundational rule violation)
- **Rule violated:** [`19-glossary.md`](../19-glossary.md) §Database Vocabulary v1.1.0 — *"All SQLite table names, column names, and JSON keys are PascalCase"*.
- **Files (12):** `00-overview.md`, `01-information-model.md`, `03-layout-structure.md`, `04-page-content-area.md`, `05-interactions.md`, `06-item-context-menu.md` (worst, 14 hits), `07-board-view.md` (13), `08-share-dialog.md`, `09-mirrors.md`, `12-multi-select.md`, `14-concurrency-and-sync.md`, `15-roles-and-permissions.md`.
- **Examples observed:** `items.parent_id`, `items.item_type`, `items.sort_order`, `completed_at`, `due_date`, `user_id`, `source_id`, `item_tags`, `activity_log`.
- **Already partially tracked:** [`05-audit-02a-column-rename.md`](./05-audit-02a-column-rename.md) (8 files). **This audit widens the scope to 12 files.**
- **AI risk:** AI will pick whichever case it sees first → schema split-brain.

---

### F-02 — TS enum strategy not enforced in feature code blocks

- **Severity:** HIGH
- **Rule violated:** TS Strategy B (`as const` + derived union). `enum` keyword and bare literal unions forbidden ([`20-enums-index.md`](../20-enums-index.md) §1 rule 9; AUDIT-05 closure).
- **Symptom:** `01-information-model.md` line 71 says `` `ItemType` enum `` with no link to its canonical `as const` shape. `15-roles-and-permissions.md` lists role names as plain strings (`Owner`, `Admin`, `Edit`, `View`, `PublicView`) without referencing an enum file.
- **Missing:** No App-folder file points to a canonical enum source for `ItemType`, `WorkspaceRole`, `ItemRole`, `ConflictField`.
- **AI risk:** AI invents a TS `enum WorkspaceRole { Owner, Admin, ... }` (banned).
- **Fix hint:** Each enum mention must link to its file under `spec/20-enums-index.md` and use Strategy B example.

---

### F-03 — Split-DB architecture never referenced

- **Severity:** HIGH
- **Rule violated:** [`spec/05-split-db-architecture/`](../05-split-db-architecture/00-overview.md) — every feature touching persistence must declare which DB (`Root` vs `App`).
- **Symptom:** `rg "split-db|root-db|app-db" spec/31-app/` → **0 hits**. Every feature implicitly says "SQLite" without naming the database.
- **Affected:** `01-information-model.md`, `06-item-context-menu.md`, `07-board-view.md`, `09-mirrors.md`, `11-trash-view.md`, `12-multi-select.md`, `13-templates.md`, `14-concurrency-and-sync.md`, `15-roles-and-permissions.md`.
- **AI risk:** AI puts everything in one DB and breaks the architecture's isolation guarantees.
- **Fix hint:** Add a `## Storage` row to each feature file: `Root DB: …`, `App DB: …`, `Cross-DB joins: forbidden`.

---

### F-04 — Seedable-config architecture never referenced

- **Severity:** HIGH
- **Rule violated:** [`spec/06-seedable-config-architecture/`](../06-seedable-config-architecture/00-overview.md) + [`spec/15-wp-plugin-how-to/15-settings-architecture/`](../15-wp-plugin-how-to/15-settings-architecture/00-overview.md) — settings keys must be enum-backed (`OptionNameType::Case->value`), grouped, sanitized, defaulted.
- **Symptom:** `rg "seedable|seed.config" spec/31-app/` → **0 hits**. Settings appear in `03-layout-structure.md` (theme, font size, default view, show completed, auto-collapse depth), `13-templates.md` (Settings → Templates list), `10-today-view.md` (timezone), `11-trash-view.md` (sidebar entry) — all with no enum key, no default, no sanitizer, no group name.
- **AI risk:** AI hard-codes string keys → violates anti-pattern #1 in `15-settings-architecture/13-anti-patterns.md`.
- **Fix hint:** Each settings touchpoint must declare `OptionNameType` enum case + default + sanitizer + group.

---

### F-05 — SSE/poll-fallback transport only documented in 14-concurrency-and-sync

- **Severity:** HIGH
- **Rule:** `00-overview.md` L9 — "Realtime via WP-native SSE + 5 s poll fallback".
- **Symptom:** Only `14-concurrency-and-sync.md` v1.1.0 mentions transport. `09-mirrors.md`, `07-board-view.md`, `12-multi-select.md`, `11-trash-view.md`, `08-share-dialog.md` say "broadcast" / "real-time" / "live update" without naming the channel or fallback.
- **AI risk:** AI reaches for WebSockets / Pusher / Supabase Realtime (all banned).
- **Fix hint:** Each "realtime" sentence must add `(via SSE per 14.x; 5 s poll fallback)`.

---

### F-06 — `Auth::hasRole()` PHP helper referenced but never specified in App folder

- **Severity:** HIGH (also tracked as Round-3 AUDIT-04)
- **Symptom:** `00-overview.md` L8 + `97-acceptance-criteria.md` AT-APP-22 cite `Auth::hasRole($userId, $role)` but `15-roles-and-permissions.md` never gives its signature, exception types, return contract, or where it lives.
- **AI risk:** AI invents the helper inside React/TS or skips server-side enforcement entirely.
- **Fix hint:** Add `## PHP Authorization Helper Contract` section with signature, exceptions, examples — runtime-agnostic prose was already chosen, but the *contract* is still missing.

---

### F-07 — Component paths in spec are aspirational but read as normative

- **Severity:** MEDIUM
- **Files:** every feature with a `## Component Contract` table (≈10 files).
- **Symptom:** `01-information-model.md` line 129 says *"None of these components exist yet — paths are the planned implementation order"* — but the same disclaimer is missing in `04-page-content-area.md`, `05-interactions.md`, `06-item-context-menu.md`, `07-board-view.md`, `09-mirrors.md`, `11-trash-view.md`, `12-multi-select.md`, `13-templates.md`, `14-concurrency-and-sync.md`, `15-roles-and-permissions.md`.
- **AI risk:** AI may try to import from non-existent paths, or treat the path layout as binding when it should be advisory.
- **Fix hint:** Add the same one-line disclaimer to every `## Component Contract` table.

---

### F-08 — Mixed identifier casing within the same file

- **Severity:** MEDIUM
- **Examples:**
  - `14-concurrency-and-sync.md` uses **PascalCase** in column refs (`Item.<field>UpdatedAt`) but **snake_case** in pseudocode (`I.<F>_updated_at`, `M.client_attempted_at`, `M.server_ts`).
  - `01-information-model.md` Inputs table uses camelCase fields (`userId`, `parentId`) while Outputs table column refs are snake_case (`items.parent_id`).
- **AI risk:** AI cannot decide which is the wire format vs DB format.
- **Fix hint:** Add a 1-paragraph "Casing Layers" callout to `00-overview.md`: `wire = camelCase`, `DB = PascalCase`, `pseudocode = match the layer being described`.

---

### F-09 — `99-consistency-report.md` reports 100/100 while folder has 12 normative violations

- **Severity:** HIGH (false-positive in tooling)
- **File:** `spec/31-app/01-features/99-consistency-report.md`
- **Symptom:** Reports "Health Score: 100/100 (A+)" yet F-01..F-08 above are real and counted by `rg`.
- **Why:** The report only checks file presence + kebab-case naming, not content alignment.
- **AI risk:** Anyone trusting the score skips the audit.
- **Fix hint:** Extend hygiene script to also flag snake_case identifiers + missing storage row + missing enum link, OR add a "Content audits not covered" disclaimer to the report.

---

### F-10 — Workflow folder thin: only keyboard shortcuts

- **Severity:** MEDIUM
- **File:** `spec/31-app/02-workflows/01-keyboard-shortcuts.md`
- **Symptom:** Folder is named "Workflows" but contains only a shortcut reference. Cross-feature flows referenced in `00-overview.md` ("template application", "share invite", "trash restore") are NOT documented as flows.
- **AI risk:** AI assembles flow steps from feature files (which describe behavior, not sequence) and gets order wrong.
- **Fix hint:** Add `02-template-application-flow.md`, `03-share-invite-flow.md`, `04-trash-restore-flow.md`.

---

### F-11 — Edge-case file does not separate "user edge" from "system edge"

- **Severity:** LOW
- **File:** `spec/31-app/03-edge-cases/01-edge-cases.md` (not deeply audited yet — flagged for Phase 2).
- **Fix hint:** Split into "Input edge cases" (empty, max-length, paste-bomb) vs "System edge cases" (network drop, conflict storm, quota exceeded).

---

### F-12 — Acceptance-criteria split: 25 in `97-acceptance-criteria.md` vs 85 in `01-features/97-acceptance-criteria.md`

- **Severity:** MEDIUM
- **Symptom:** Two ID schemes (`AT-APP-NN` and `AT-APPF-NN`) overlap in scope. Some AT-APPF stubs are unverified (file says "[x] All 14 feature files contain a Acceptance Criteria section" but per-feature counts vary).
- **AI risk:** Test generator picks one scheme and misses the other.
- **Fix hint:** Either fold AT-APPF into AT-APP with a documented map, or add cross-link table.

---

### F-13 — No mention of `BooleanHelpers::hasValue()` or boolean-fix patterns

- **Severity:** MEDIUM
- **Rule violated:** [`spec/02-coding-guidelines/06-ai-optimization/03-common-ai-mistakes/03-control-flow.md`](../02-coding-guidelines/06-ai-optimization/03-common-ai-mistakes/03-control-flow.md) Mistake #9 + Settings anti-pattern #10.
- **Symptom:** Boolean checkboxes in Settings (show completed, auto-collapse) and item flags (`isCompleted`, `isArchived`) are mentioned without invoking the `hasValue()` helper or positive-guard rule.
- **Fix hint:** Add a "Boolean Conventions" callout under `00-overview.md` referencing the SSOT.

---

### F-14 — Mirror-broken state vs Trash cascade not aligned with concurrency

- **Severity:** HIGH
- **Symptom:** `01-information-model.md` Edge 7 says "mirrors of any descendant become broken". `14-concurrency-and-sync.md` LWW algorithm has no rule for the `broken` flag — concurrent restore-from-trash + mirror-create may set `broken` then immediately unset it without LWW guard.
- **AI risk:** Race produces zombie mirrors.
- **Fix hint:** Add a row to the LWW field list for `Mirror.brokenAt` (or equivalent PascalCase field) and define the tie-break.

---

### F-15 — Personas file (`02-personas.md`) cites "developers jotting TODOs" — only stylistic flag

- **Severity:** LOW
- **Symptom:** Single user-facing TODO mention; not a spec defect — listed for completeness.

---

## 3. AI-Readiness Failure Probability — Per Feature

| File | Failure Risk | Drivers |
|------|:------------:|---------|
| `01-information-model.md` | **HIGH** | F-01, F-02, F-08, F-13 |
| `04-page-content-area.md` | HIGH | F-01, F-03, F-07 |
| `05-interactions.md` | HIGH | F-01, F-05, F-07 |
| `06-item-context-menu.md` | **CRITICAL** | F-01 (worst), F-03, F-05, F-07 |
| `07-board-view.md` | **CRITICAL** | F-01, F-03, F-05 |
| `09-mirrors.md` | HIGH | F-01, F-05, F-14 |
| `11-trash-view.md` | HIGH | F-04 (settings), F-05 |
| `12-multi-select.md` | HIGH | F-01, F-05 |
| `13-templates.md` | HIGH | F-04, F-05 |
| `14-concurrency-and-sync.md` | MEDIUM | F-01, F-08, F-14 |
| `15-roles-and-permissions.md` | HIGH | F-02, F-06 |
| `03-layout-structure.md` | MEDIUM | F-04 (settings dropdown), F-13 |
| `08-share-dialog.md` | MEDIUM | F-01, F-05 |
| `10-today-view.md` | MEDIUM | F-04 (timezone setting) |
| `02-personas.md`, `00-overview.md` | LOW | minor |

---

## 4. Atomic Fix Phases (DO NOT EXECUTE — for next-driven rollout)

> Each phase is sized for one `next` round. No phase touches more than one foundational rule, so failure is local.

| # | Phase ID | Title | Files touched | Foundational rule it closes |
|---|----------|-------|---------------|-----------------------------|
| 1 | **APP-FIX-01** ✅ | Widen AUDIT-02a column rename to 12 files | 4 extra files added to existing rename map | F-01 — **DONE 2026-04-26 (tracker widened to 12; mechanical rename of identifiers tracked there)** |
| 2 | **APP-FIX-02** ✅ | Add `Storage` row (Root vs App DB) to every persistence-touching feature | 9 feature files | F-03 — **DONE 2026-04-26 (01, 06, 07, 09, 11, 12, 13, 14, 15 versions bumped; Storage section inserted)** |
| 3 | **APP-FIX-03** ✅ | Add SSE/poll-fallback callout to every realtime mention | 6 feature files | F-05 — **DONE 2026-04-26 (06, 07, 08, 09, 11, 12 versions bumped; Realtime Transport callout inserted)** |
| 4 | **APP-FIX-04** ✅ | Document `Auth::hasRole()` PHP contract in `15-roles-and-permissions.md` | 1 file | F-06 — **DONE 2026-04-26 (15-roles-and-permissions.md v1.3.0; signature, exceptions, return contract, call sites, forbidden patterns added). Also closes Round-3 AUDIT-04.** |
| 5 | **APP-FIX-05** ✅ | Add settings/seedable-config keys to all settings touchpoints | 4 feature files (`03`, `10`, `11`, `13`) | F-04 — **DONE 2026-04-26 (03 v2.2.0, 10 v2.1.0, 11 v2.3.0, 13 v2.2.0; enum-backed key + default + sanitizer + group + storage tabled per touchpoint).** |
| 6 | **APP-FIX-06** ✅ | Link every enum mention to canonical Strategy-B file | 6 feature files | F-02 — **DONE 2026-04-26 (01, 03, 04, 07, 08, 15 versions bumped; Enum Sources callout inserted)** |
| 7 | **APP-FIX-07** ✅ | Add Casing-Layers callout in `01-features/00-overview.md` | 1 file | F-08 — **DONE 2026-04-26 (00-overview.md v2.1.0)** |
| 8 | **APP-FIX-08** ✅ | Replicate aspirational-paths disclaimer in Component Contract tables | 10 feature files (`04`, `05`, `06`, `07`, `09`, `11`, `12`, `13`, `14`, `15`) | F-07 — **DONE 2026-04-26 (versions bumped: 04→2.2.0, 05→2.1.0, 06→2.3.0, 07→2.4.0, 09→2.3.0, 11→2.4.0, 12→2.3.0, 13→2.3.0, 14→1.4.0, 15→1.4.0; one-line disclaimer mirrors `01-information-model.md` L149).** |
| 9 | **APP-FIX-09** ✅ | Add `Mirror.BrokenAt` LWW row to concurrency spec | 1 file | F-14 — **DONE 2026-04-26 (14-concurrency-and-sync.md v1.3.0; §14.4 added with field/algorithm/cascade/forbidden tables; `mirrorBrokenAt` added to Inputs field enum and §14.1 conflict-scope row).** |
| 10 | **APP-FIX-10** ✅ | Boolean Conventions callout (positive guards + `hasValue`) | 1 file (`00-overview.md`) | F-13 — **DONE 2026-04-26 (00-overview.md v2.2.0; SSOT table + 4-rule paragraph + forbidden list pointing at cross-language, control-flow, PHP booleans, PHP architecture, and Settings anti-pattern #10).** |
| 11 | **APP-FIX-11** ✅ | Update `99-consistency-report.md` scoring or add disclaimer | 1 file | F-09 — **DONE 2026-04-26 (99-consistency-report.md v2.0.0; split into Structural-only score vs Content-alignment status, added "Read this first" disclaimer + Content Audit Tracker, refreshed inventory from 15 → 18 files).** |
| 12 | **APP-FIX-12** ✅ | Add 3 missing workflow files (template, share-invite, trash-restore) | 3 new files | F-10 — **DONE 2026-04-26 (`02-template-application-flow.md`, `03-share-invite-flow.md`, `04-trash-restore-flow.md` v1.0.0; each pins actors/preconditions/sequence/failure-modes/idempotency/forbidden/AT-WF-* tests; overview bumped to v2.0.0; consistency report 3→6 files).** |
| 13 | **APP-FIX-13** ✅ | Split edge-cases into user vs system | 1 file | F-11 — **DONE 2026-04-26 (`03-edge-cases/01-edge-cases.md` v2.0.0; reorganized into §1 User Input (7 rows), §2 System (10 rows), §3 Cross-feature (7 rows); added Layer column + Routing rule for AI implementers). All 13 APP-FIX phases complete.** |
| 14 | **APP-FIX-14** ✅ | Reconcile AT-APP / AT-APPF ID schemes | 2 AC files | F-12 — **DONE 2026-04-26 (`spec/31-app/97-acceptance-criteria.md` v2.1.0 declared canonical; `01-features/97-acceptance-criteria.md` v2.0.0 demoted to frozen dispatch index with 3-column Coverage Map mapping canonical AT-APP-NN ↔ inline prefix ↔ legacy AT-APPF-NN; "How to add a new criterion" rule added).** |

**Suggested order:** 01 → 07 → 06 → 02 → 03 → 04 → 05 → 09 → 10 → 08 → 11 → 14 → 12 → 13.

(Order pins normative-rule fixes first, then content depth, then cleanup.)

---

## 5. What This Audit Did NOT Touch

- `spec/32-ui-design/**` — UI SSOT, separate audit needed.
- `spec/35-enforcement-rules/**` — already covered by Round-3 audit (AUDIT-04, AUDIT-06 open).
- App-folder code-block syntax (TS / PHP) — surface scan only; deep lint deferred.
- Cross-references TO App folder from other folders — reverse-link audit deferred.

---

## 6. Recommended Next Step

Say `next` to begin **APP-FIX-01** (widen AUDIT-02a rename to 12 files). One phase per `next`.

---

## Related

- [`00-overview.md`](./00-overview.md) — Spec-issues parent
- [`05-audit-02a-column-rename.md`](./05-audit-02a-column-rename.md) — narrower predecessor (8 files)
- [`97-acceptance-criteria.md`](./97-acceptance-criteria.md) — Spec-issues AC index
- [`spec/19-glossary.md`](../19-glossary.md) — DB casing SSOT
- [`spec/02-coding-guidelines/02-typescript/00-overview.md`](../02-coding-guidelines/02-typescript/00-overview.md) — TS Strategy B SSOT
- [`spec/05-split-db-architecture/00-overview.md`](../05-split-db-architecture/00-overview.md) — Split-DB SSOT
- [`spec/06-seedable-config-architecture/00-overview.md`](../06-seedable-config-architecture/00-overview.md) — Seedable-config SSOT
- [`spec/15-wp-plugin-how-to/15-settings-architecture/13-anti-patterns.md`](../15-wp-plugin-how-to/15-settings-architecture/13-anti-patterns.md) — Settings anti-patterns
