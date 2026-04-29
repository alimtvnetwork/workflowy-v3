# ADRs — Acceptance Criteria

> **Version:** 1.2.0
> **Created:** 2026-04-29 — closes G-08 acceptance-coverage gap (P0 quick-win). **Updated:** 2026-04-29 — v1.1.0 added AT-ADR-G04 (ADR-0029 ledger shared-lib, 5 rows: AT-29-D1/D3/D4×3); v1.2.0 added AT-ADR-G05 (ADR-0030 audit-exemption manifest, 8 rows: AT-30-I1..I8).
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


- Gates `G-00-ADR-SHAPE`, `G-00-ADR-NUMBERING`, `G-00-ADR-STATUS`, `G-00-ADR-SUPERSEDE`, and `G-13-ADR-INDEX-CASCADE` are already implemented in `scripts/spec-hygiene/`.
- `G-00-ADR-CONSEQUENCES-XLINK` was authored 2026-04-29 in [`scripts/spec-hygiene/52-check-adr-consequences-xlink.mjs`](../../scripts/spec-hygiene/52-check-adr-consequences-xlink.mjs) (WARN-only; baseline allow-list at [`_LEDGER-G-00-ADR-CONSEQUENCES-XLINK-BASELINE.md`](./_LEDGER-G-00-ADR-CONSEQUENCES-XLINK-BASELINE.md), 90-day TTL).
- This file deliberately defers per-ADR criteria (e.g. "ADR-0026 §D6 mandates `OwnerId` egress") to the consuming spec scope's `97-acceptance-criteria.md` — the present file covers only the *governance* of ADRs, not their content.

---

## Related

- [`spec/00-adrs/00-overview.md`](./00-overview.md) — ADR authoring contract + index
- [`spec/_GATE-REGISTRY.md`](../_GATE-REGISTRY.md) — gate ↔ AT bindings
- [`spec/00-overview.md`](../00-overview.md) — top-level ADR rollup table
