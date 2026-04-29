# ADRs — Acceptance Criteria

> **Version:** 1.0.0
> **Created:** 2026-04-29 — closes G-08 acceptance-coverage gap (P0 quick-win).
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
| AT-ADR-009 | Every ADR with non-trivial downstream impact MUST list at least one `## Consequences` bullet that cross-links to the spec scope it locks (e.g. `spec/04-database-conventions/`). | [`00-overview.md`](./00-overview.md) §Required sections | `G-00-ADR-CONSEQUENCES-XLINK` (planned, see remaining tasks) |

---

## Coverage notes

- Gates `G-00-ADR-SHAPE`, `G-00-ADR-NUMBERING`, `G-00-ADR-STATUS`, `G-00-ADR-SUPERSEDE`, and `G-13-ADR-INDEX-CASCADE` are already implemented in `scripts/spec-hygiene/`.
- `G-00-ADR-CONSEQUENCES-XLINK` is a planned runner tracked in the parent loop's "remaining tasks" list (item #17, +0.4 pts, s).
- This file deliberately defers per-ADR criteria (e.g. "ADR-0026 §D6 mandates `OwnerId` egress") to the consuming spec scope's `97-acceptance-criteria.md` — the present file covers only the *governance* of ADRs, not their content.

---

## Related

- [`spec/00-adrs/00-overview.md`](./00-overview.md) — ADR authoring contract + index
- [`spec/_GATE-REGISTRY.md`](../_GATE-REGISTRY.md) — gate ↔ AT bindings
- [`spec/00-overview.md`](../00-overview.md) — top-level ADR rollup table
