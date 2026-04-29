# ADRs — Acceptance Criteria

> **Version:** 1.4.0
> **Created:** 2026-04-29 — closes G-08 acceptance-coverage gap (P0 quick-win). **Updated:** 2026-04-29 — v1.1.0 added AT-ADR-G04 (ADR-0029 ledger shared-lib, 5 rows: AT-29-D1/D3/D4×3); v1.2.0 added AT-ADR-G05 (ADR-0030 audit-exemption manifest, 8 rows: AT-30-I1..I8); v1.3.0 added AT-ADR-G06 (ADR-0031 warn-only-with-STRICT-flip pattern, 8 rows: AT-31-D1..D7 + AT-31-PROTOCOL); **v1.4.0** added AT-ADR-G07 (ADR-0023 loader↔queue contract, 8 rows: AT-23-L1/A1/S1/D4/R1/L2/A2/F1) — closes F-AUDIT-27 (HIGH).
> **Status:** ✅ SSOT — testable acceptance criteria for the ADR governance scope.

> _Fixture: N/A — pure narrative reference, not a testable criterion._


---

## Overview

This file consolidates the testable acceptance criteria that govern the ADR
authoring + lifecycle workflow. Each row is enforced by a CI gate registered
in [`spec/_GATE-REGISTRY.md`](../_GATE-REGISTRY.md); rows without a gate are
DOC-tier and verified by reviewer checklist only.

The criteria are grouped into 3 categories: **shape** (file structure),
**lifecycle** (status / supersede transitions), and **governance** (cross-link
+ AI-Contract integrity).

---

## AT-ADR-G01: ADR file shape

| # | Criterion | Source | Gate |
|---|-----------|--------|------|
| AT-ADR-001 | Every ADR file lives under `spec/00-adrs/NNNN-kebab-case-title.md` (4-digit zero-padded prefix). | [`00-overview.md`](./00-overview.md) §Required sections | `G-00-ADR-NUMBERING` |
| AT-ADR-002 | Every ADR file contains the 8 required sections in canonical order: `## Status`, `## Context`, `## Decision`, `## Consequences`, `## Alternatives Considered`, `## Compliance / Enforcement`, `## Related ADRs`, `## References`. | [`00-overview.md`](./00-overview.md) §Required sections | `G-00-ADR-SHAPE` |
| AT-ADR-003 | The `## Status` line uses one of the closed values: `Accepted`, `Proposed`, `Superseded by ADR-NNNN`, `Deprecated`. | [`00-overview.md`](./00-overview.md) §Lifecycle | `G-00-ADR-STATUS` |

---

## AT-ADR-G02: ADR lifecycle

| # | Criterion | Source | Gate |
|---|-----------|--------|------|
| AT-ADR-004 | When ADR-N supersedes ADR-M, ADR-M's `## Status` MUST flip to `Superseded by ADR-N` in the **same** change. | [`00-overview.md`](./00-overview.md) §Definition of Done | `G-00-ADR-SUPERSEDE` |
| AT-ADR-005 | New ADRs MUST update both index tables in lock-step: `spec/00-adrs/00-overview.md` §Index **and** `spec/00-overview.md` rollup. | [`00-overview.md`](./00-overview.md) §Definition of Done | `G-13-ADR-INDEX-CASCADE` |
| AT-ADR-006 | ADR files are append-only — accepted ADRs are never edited in place except for `## Status` flips and `## Related ADRs` back-links. | [`00-overview.md`](./00-overview.md) §Purpose | DOC (reviewer) |

---

## AT-ADR-G03: Governance + AI-Contract integrity

| # | Criterion | Source | Gate |
|---|-----------|--------|------|
| AT-ADR-007 | Every load-bearing rule cited by a `G-*` gate MUST trace to an ADR (drained via the `G-NS-ADR-MUST-HAS-AT` allow-list). | [`spec/_GATE-REGISTRY.md`](../_GATE-REGISTRY.md) | `G-NS-ADR-MUST-HAS-AT` |
| AT-ADR-008 | The ADR-overview AI Contract block MUST contain the 5 required subsections (`Purpose`, `Audience`, `Expected AI Output`, `Out of Scope`, `Definition of Done`) plus a `### Scoring` table. | [`00-overview.md`](./00-overview.md) §AI Contract | `G-00-OVERVIEW-AI-CONTRACT-COMPLETE` |
| AT-ADR-009 | Every ADR with non-trivial downstream impact MUST list at least one `## Consequences` bullet that cross-links to the spec scope it locks (e.g. `spec/04-database-conventions/`). | [`00-overview.md`](./00-overview.md) §Required sections | `G-00-ADR-CONSEQUENCES-XLINK` (CI, WARN-only initial mode; baseline allow-list at [`_LEDGER-G-00-ADR-CONSEQUENCES-XLINK-BASELINE.md`](./_LEDGER-G-00-ADR-CONSEQUENCES-XLINK-BASELINE.md), 90-day TTL) |



---

## AT-ADR-G04: ADR-0029 — per-(gate, path) ledger shared library

> Ratifies the 5 acceptance tests cited inline by [`0029-per-gate-path-ledger-shared-lib.md`](./0029-per-gate-path-ledger-shared-lib.md) §6. All five are enforced by CI gate `G-13-LEDGER-USES-SHARED-LIB` ([`scripts/spec-hygiene/48-check-ledger-uses-shared-lib.mjs`](../../scripts/spec-hygiene/48-check-ledger-uses-shared-lib.mjs)) except `AT-29-D3-SCHEMA-FROZEN`, which is owned by `G-13-LEDGER-PER-GATE-PATH`.

| # | Criterion | Source | Gate |
|---|-----------|--------|------|
| AT-29-D1-IMPORT-PRESENT | Every runner under `scripts/spec-hygiene/` (excluding `_lib/`) that references `_LEDGER-G-*-EXEMPTIONS.md` MUST also import from `scripts/spec-hygiene/_lib/per-gate-path-ledger.mjs`. | [`0029-per-gate-path-ledger-shared-lib.md`](./0029-per-gate-path-ledger-shared-lib.md) §D1 | `G-13-LEDGER-USES-SHARED-LIB` |
| AT-29-D3-SCHEMA-FROZEN | Every `_LEDGER-G-*-EXEMPTIONS.md` file MUST contain exactly one `## Entries` H2 and a 5-column table with header row `gate \| pathGlob \| entry \| rationale \| addedOn` (case-sensitive, in order). | [`0029-per-gate-path-ledger-shared-lib.md`](./0029-per-gate-path-ledger-shared-lib.md) §D3 | `G-13-LEDGER-PER-GATE-PATH` |
| AT-29-D4-NO-INLINE-GLOBTOREGEXP | No file under `scripts/spec-hygiene/` outside `_lib/` may define `function globToRegExp` or `const globToRegExp =`. | [`0029-per-gate-path-ledger-shared-lib.md`](./0029-per-gate-path-ledger-shared-lib.md) §D4.1 | `G-13-LEDGER-USES-SHARED-LIB` |
| AT-29-D4-NO-INLINE-WALKLEDGER | No file under `scripts/spec-hygiene/` outside `_lib/` may define `function walkLedger`, `function* walkLedger`, or `const walkLedger =`. | [`0029-per-gate-path-ledger-shared-lib.md`](./0029-per-gate-path-ledger-shared-lib.md) §D4.2 | `G-13-LEDGER-USES-SHARED-LIB` |
| AT-29-D4-NO-DIRECT-LEDGER-READ | No file under `scripts/spec-hygiene/` outside `_lib/` may pass a path matching `_LEDGER-G-*-EXEMPTIONS.md` to `fs.readFile` / `fs.readFileSync` directly — ledger I/O MUST flow through `walkLedger()`. | [`0029-per-gate-path-ledger-shared-lib.md`](./0029-per-gate-path-ledger-shared-lib.md) §D4.3 | `G-13-LEDGER-USES-SHARED-LIB` |

---

## AT-ADR-G05: ADR-0030 — audit exemption manifest

> Ratifies the 8 acceptance tests cited inline by [`0030-audit-exemption-manifest.md`](./0030-audit-exemption-manifest.md) §6. All eight are enforced by CI gate `G-00-AUDIT-EXEMPTION-REVIEW` ([`scripts/spec-hygiene/57-check-audit-exemption-review.mjs`](../../scripts/spec-hygiene/57-check-audit-exemption-review.mjs)). Closes **F-AUDIT-31** (LOW — surfaced by re-audit v2; artifact: `/mnt/documents/spec-ai-implementability-audit-v2.json`).

| # | Criterion | Source | Gate |
|---|-----------|--------|------|
| AT-30-I1-MANIFEST-EXISTS | `spec/_AUDIT-EXEMPTIONS.md` MUST exist at the canonical path. | [`0030-audit-exemption-manifest.md`](./0030-audit-exemption-manifest.md) §D1 | `G-00-AUDIT-EXEMPTION-REVIEW` |
| AT-30-I2-SINGLE-H2 | The manifest MUST contain exactly one `## Exemption rows` H2 (case-sensitive). | [`0030-audit-exemption-manifest.md`](./0030-audit-exemption-manifest.md) §D2 | `G-00-AUDIT-EXEMPTION-REVIEW` |
| AT-30-I3-HEADER-SHAPE | The table header row MUST be `pathGlob \| category \| rationale \| closes \| addedOn` (case-sensitive, in order). | [`0030-audit-exemption-manifest.md`](./0030-audit-exemption-manifest.md) §D2 | `G-00-AUDIT-EXEMPTION-REVIEW` |
| AT-30-I4-SPEC-ROOTED | Every row's `pathGlob` MUST start with `spec/`. | [`0030-audit-exemption-manifest.md`](./0030-audit-exemption-manifest.md) §D3 | `G-00-AUDIT-EXEMPTION-REVIEW` |
| AT-30-I5-NO-BLANK-CHEQUE | Every row's `pathGlob` MUST NOT be a corpus-wide pattern (`spec/**`, `spec/**/*`, `spec/**/*.md`, `spec/*`, `**/*`). | [`0030-audit-exemption-manifest.md`](./0030-audit-exemption-manifest.md) §D3 | `G-00-AUDIT-EXEMPTION-REVIEW` |
| AT-30-I6-CITED | Every row's `closes` cell MUST cite at least one of: `AUD-*`, `F-AUDIT-NN`, `F-AUDxx-NN`, `ADR-NNNN`, or the literal `n/a`. | [`0030-audit-exemption-manifest.md`](./0030-audit-exemption-manifest.md) §D3 | `G-00-AUDIT-EXEMPTION-REVIEW` |
| AT-30-I7-ISO-DATE | Every row's `addedOn` MUST be ISO `YYYY-MM-DD`. | [`0030-audit-exemption-manifest.md`](./0030-audit-exemption-manifest.md) §D3 | `G-00-AUDIT-EXEMPTION-REVIEW` |
| AT-30-I8-VISIBILITY | Every CI run MUST print `matched/total (pct%)` so reviewers can detect drift in PR output. | [`0030-audit-exemption-manifest.md`](./0030-audit-exemption-manifest.md) §D3 | `G-00-AUDIT-EXEMPTION-REVIEW` |

---

## AT-ADR-G06: ADR-0031 — warn-only-with-STRICT-flip gate-graduation pattern

> Ratifies the 8 acceptance tests cited inline by [`0031-warn-only-strict-flip-pattern.md`](./0031-warn-only-strict-flip-pattern.md) §6. Six are CI-enforced (gates `G-00-GRADUATION-LEDGER-FRESH`, `G-00-GRADUATION-LEDGER-DATE-DRIFT`, `G-38-AMBIGUOUS-WORDING`); two are DOC-tier (reviewer-enforced, future CI candidates). Closes **F-SPEC-13** (MED — surfaced by spec-vs-impl audit 2026-04-29) and **F-AUDIT-26** (MED — surfaced by re-audit v4; artifact: `/mnt/documents/spec-ai-implementability-audit-v4.json`).

| # | Criterion | Source | Gate |
|---|-----------|--------|------|
| AT-31-D1-CLOSED-MODES | Every hygiene runner under `scripts/spec-hygiene/[0-9][0-9]-*.mjs` whose top-level docstring declares a `STRICT` constant MUST set it to literal `true` or `false` — no expressions, no `process.env` reads. | [`0031-warn-only-strict-flip-pattern.md`](./0031-warn-only-strict-flip-pattern.md) §D1 | DOC (reviewer; future CI candidate — promote when 4th non-literal STRICT appears) |
| AT-31-D2-LEDGER-COVERAGE | Every `_GATE-REGISTRY.md` row whose description contains the literal `**WARN-only**` MUST appear as a row in `_GATE-GRADUATION-LEDGER.md` §Entries (or §Graduated entries). Conversely, every ledger row MUST cite a registry-known gate. | [`0031-warn-only-strict-flip-pattern.md`](./0031-warn-only-strict-flip-pattern.md) §D2 | `G-00-GRADUATION-LEDGER-FRESH` |
| AT-31-D3-MEASURABLE-PREDICATE | Every §Entries row's `flipCriterion` cell MUST contain at least one of the 5 grammar markers: `count =`, `≤`, `consecutive CI`, `targetDate <`, OR a compound `AND`/`OR` joining two such clauses. Forbidden vague tokens (`eventually`, `to-be-determined`, the three-letter unspecified-marker, `next pass`, `event-driven`, `someday`) MUST NOT appear. | [`0031-warn-only-strict-flip-pattern.md`](./0031-warn-only-strict-flip-pattern.md) §D3 | `G-38-AMBIGUOUS-WORDING` (vague-token rejection) + DOC (grammar shape; future CI as `G-00-GRADUATION-LEDGER-CRITERION-SHAPE` once 4th predicate variant emerges) |
| AT-31-D4-FLIP-MECHANISM-CITES-RUNNER | Every §Entries row's `flipMechanism` cell MUST cite a runner path matching `scripts/spec-hygiene/[0-9][0-9]-*.mjs` OR a ledger filename matching `_LEDGER-G-*-EXEMPTIONS.md` (for ledger-driven gates per ADR-0029). | [`0031-warn-only-strict-flip-pattern.md`](./0031-warn-only-strict-flip-pattern.md) §D4 | DOC (reviewer; future CI candidate — promote when 4th non-runner mechanism appears) |
| AT-31-D5-ISO-DATE | Every §Entries row's `targetDate` MUST match `YYYY-MM-DD` AND MUST NOT be `< addedOn`. | [`0031-warn-only-strict-flip-pattern.md`](./0031-warn-only-strict-flip-pattern.md) §D5 | `G-00-GRADUATION-LEDGER-DATE-DRIFT` |
| AT-31-D5-OVERDUE-FAIL | When `targetDate < today` for any §Entries row, gate #61 MUST exit 1 with stderr matching `/G-00-GRADUATION-LEDGER-DATE-DRIFT.*overdue/`. Meta-test at [`scripts/spec-hygiene/_tests/61.test.mjs`](../../scripts/spec-hygiene/_tests/61.test.mjs) locks the visibility-line contract. | [`0031-warn-only-strict-flip-pattern.md`](./0031-warn-only-strict-flip-pattern.md) §D5 | `G-00-GRADUATION-LEDGER-DATE-DRIFT` |
| AT-31-D6-PROTOCOL-COMPLETE | A graduation PR MUST modify all 3 of: (a) the runner per `flipMechanism`, (b) `_GATE-GRADUATION-LEDGER.md` (row moved to §Graduated entries with `graduatedOn` cell appended), (c) `_GATE-REGISTRY.md` (WARN-only parenthetical removed). PRs missing any leg MUST be rejected. | [`0031-warn-only-strict-flip-pattern.md`](./0031-warn-only-strict-flip-pattern.md) §D6 | DOC (reviewer; future CI as task #42 — `Graduated entries` L10 validation in gate #60) |
| AT-31-D7-NO-RETROACTIVE-DATES | A new §Entries row whose `targetDate < addedOn` MUST be rejected at PR time. Date-sanity branch of gate #61 enforces. | [`0031-warn-only-strict-flip-pattern.md`](./0031-warn-only-strict-flip-pattern.md) §D7 | `G-00-GRADUATION-LEDGER-DATE-DRIFT` |
| AT-31-PROTOCOL-COOLING-WINDOW | The 6-step flip protocol §D6.1 MUST verify `flipCriterion` true for **7 consecutive CI runs** before steps 2–6. Skipping this step is forbidden. | [`0031-warn-only-strict-flip-pattern.md`](./0031-warn-only-strict-flip-pattern.md) §D6 | DOC (reviewer; CI tracking via ledger note column — future) |

---

## AT-ADR-G07: ADR-0023 — loader↔queue contract

> Ratifies the 8 acceptance tests cited inline by [`0023-route-loaders-offline-queue-interaction.md`](./0023-route-loaders-offline-queue-interaction.md) §"Gates Touched". Closes **F-AUDIT-27** (HIGH — recalibrated audit v5: avoidance of high-impact ADR-AT pair authoring; first ratification of the load-bearing loader↔queue ADR per memory `mem://architecture/adr-invariants-15-25`). Each row below maps 1:1 to a `G-23-*` gate; rows marked `DOC` are reviewer-checklist until the CI runner is authored (tracked separately in the gate registry).

| # | Criterion | Source | Gate |
|---|-----------|--------|------|
| AT-23-L1-LOADER-MIRROR-FIRST | Every React Router v7 `loader` MUST resolve from the IndexedDB local mirror before any network I/O. Loader bodies MUST NOT contain `fetch(`, `axios.`, or any `import` from `src/lib/api/*` egress modules — only mirror reads via `src/lib/mirror/loaders/*`. Violation = loader breaks the 16 ms p95 budget AND renders blank screens when offline. | [`0023-route-loaders-offline-queue-interaction.md`](./0023-route-loaders-offline-queue-interaction.md) §Decision D1 + Gates Touched §1 | `G-23-LOADER-MIRROR-FIRST` |
| AT-23-A1-ACTION-ENQUEUE-ONLY | Every React Router v7 `action` MUST commit a single IDB transaction that writes BOTH the optimistic mirror update AND the queue entry. Direct server calls (`fetch`/`axios`) inside action bodies are forbidden — the queue worker is the sole egress per ADR-0010 FIFO contract. | [`0023-route-loaders-offline-queue-interaction.md`](./0023-route-loaders-offline-queue-interaction.md) §Decision D2 + Gates Touched §2 | `G-23-ACTION-ENQUEUE-ONLY` |
| AT-23-S1-COLD-OFFLINE-SHELL | The root loader MUST return the `OfflineColdStartShell` sentinel (typed `{ Status: "OfflineColdStart"; Attributes: {}; Results: [] }` per ADR-0019 envelope) when (a) the IDB mirror is empty AND (b) `navigator.onLine === false`. Throwing to an error boundary in this state is forbidden — the cold-offline shell renders a neutral landing UI, not an error page. | [`0023-route-loaders-offline-queue-interaction.md`](./0023-route-loaders-offline-queue-interaction.md) §Decision D3 + Gates Touched §3 | `G-23-COLD-OFFLINE-SHELL` |
| AT-23-D4-WARM-LOADER-16MS | Warm-start loader p95 latency (mirror hit, no revalidation network call) MUST be ≤ 16 ms (one frame at 60 Hz) measured by the loader-perf harness over a 1000-loader sample. The 16 ms ceiling is non-negotiable: a slower loader stalls navigation and triggers the visible-spinner threshold. | [`0023-route-loaders-offline-queue-interaction.md`](./0023-route-loaders-offline-queue-interaction.md) §Decision D4 + Gates Touched §4 | `G-23-WARM-LOADER-16MS` (DOC; perf harness pending) |
| AT-23-R1-RECONNECT-LOCK | The queue worker MUST hold an exclusive Web Lock (`navigator.locks.request('queue-drain', { mode: 'exclusive' }, …)`) for the entire reconnect drain. Concurrent loader revalidation MUST acquire the same lock in `'shared'` mode and yield until the drain completes. This guarantees create-then-rename ordering survives reconnect. | [`0023-route-loaders-offline-queue-interaction.md`](./0023-route-loaders-offline-queue-interaction.md) §Decision D5 + Gates Touched §5 | `G-23-RECONNECT-LOCK` |
| AT-23-L2-LOADER-NO-MUTATE | Loaders MUST NOT call any queue-public API (`enqueue`, `flush`, `cancel`) and MUST NOT write to the mirror outside the React Router revalidation cache. Read-only purity is required so revalidation can be canceled mid-flight without leaving partial state. | [`0023-route-loaders-offline-queue-interaction.md`](./0023-route-loaders-offline-queue-interaction.md) §Decision D6 + Gates Touched §6 | `G-23-LOADER-NO-MUTATE` |
| AT-23-A2-ACTION-NO-THROW | Actions MUST resolve with a typed Status envelope (`{ Status: "Ok" \| "ValidationFailed" \| "QueueFull" \| "Unauthorized"; Attributes; Results; Errors? }`) and MUST NOT throw to the error boundary. The boundary catches loader errors only — action failures are routed to inline form UI per ADR-0017 boundary partitioning. | [`0023-route-loaders-offline-queue-interaction.md`](./0023-route-loaders-offline-queue-interaction.md) §Decision D7 + Gates Touched §7 | `G-23-ACTION-NO-THROW` |
| AT-23-F1-FETCHER-SAME-PATH | `useFetcher().submit()` calls MUST route through the identical mirror+queue IDB transaction used by route actions. A separate egress path for fetcher submissions is forbidden — divergent paths break FIFO ordering when a fetcher submit interleaves with a navigation-action submit on the same item. | [`0023-route-loaders-offline-queue-interaction.md`](./0023-route-loaders-offline-queue-interaction.md) §Decision D8 + Gates Touched §8 | `G-23-FETCHER-SAME-PATH` |

---




- Gates `G-00-ADR-SHAPE`, `G-00-ADR-NUMBERING`, `G-00-ADR-STATUS`, `G-00-ADR-SUPERSEDE`, and `G-13-ADR-INDEX-CASCADE` are already implemented in `scripts/spec-hygiene/`.
- `G-00-ADR-CONSEQUENCES-XLINK` was authored 2026-04-29 in [`scripts/spec-hygiene/52-check-adr-consequences-xlink.mjs`](../../scripts/spec-hygiene/52-check-adr-consequences-xlink.mjs) (WARN-only; baseline allow-list at [`_LEDGER-G-00-ADR-CONSEQUENCES-XLINK-BASELINE.md`](./_LEDGER-G-00-ADR-CONSEQUENCES-XLINK-BASELINE.md), 90-day TTL).
- This file deliberately defers per-ADR criteria (e.g. "ADR-0026 §D6 mandates `OwnerId` egress") to the consuming spec scope's `97-acceptance-criteria.md` — the present file covers only the *governance* of ADRs, not their content.

---

## Related

- [`97a-acceptance-criteria-fixtures.md`](./97a-acceptance-criteria-fixtures.md) — Sibling I/O fixtures for AT-29-* and AT-30-* (closes AT-FIX-01)
- [`spec/00-adrs/00-overview.md`](./00-overview.md) — ADR authoring contract + index
- [`spec/_GATE-REGISTRY.md`](../_GATE-REGISTRY.md) — gate ↔ AT bindings
- [`spec/00-overview.md`](../00-overview.md) — top-level ADR rollup table
