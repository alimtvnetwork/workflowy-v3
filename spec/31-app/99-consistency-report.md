# Consistency Report — App

> **Version:** 2.0.0
> **Updated:** 2026-04-30 (UTC+8) — full reconciliation per F-AUD42-27 (claims-vs-actual mismatch).
> **Parent:** [`./00-overview.md`](./00-overview.md)
> **Resolves:** F-AUD42-27.

---

## Module Health

| Criterion | Status |
|-----------|--------|
| `00-overview.md` present | ✅ |
| `00b-numbering-policy.md` present (new SSOT, F-AUD42-26) | ✅ |
| `97-acceptance-criteria.md` present | ✅ |
| `99-consistency-report.md` present | ✅ (this file) |
| Lowercase kebab-case naming | ✅ |
| Unique numeric sequence prefixes | ✅ |
| Numbering policy compliance | ✅ — gaps documented in `00b-numbering-policy.md` §1.3 |
| Sub-feature parity logged | ✅ — full table in `00b-numbering-policy.md` §2.1 |
| Monolith files removed | ✅ |

**Health Score:** 100/100 (A+)

---

## Folder Inventory (actual state, audited 2026-04-30)

| # | Folder/File | Status | Notes |
|---|-------------|--------|-------|
| 00 | `00-overview.md` | ✅ Present | Root SSOT |
| 00b | `00b-numbering-policy.md` | ✅ Present | New SSOT (2026-04-30) — closes F-AUD42-26 |
| 01 | `01-features/` | ✅ Present | 29 files |
| 02 | `02-workflows/` | ✅ Present | 13 files (renumbered from 03 — 2026-04-21) |
| 03 | `03-edge-cases/` | ✅ Present | (renumbered from 04 — 2026-04-21) |
| 04 | `04-roadmap/` | ✅ Present | (renumbered from 05 — 2026-04-21) |
| 04a | `04a-fixtures/` | ✅ Present | Sub-feature of roadmap (test fixtures) |
| 05 | `05-conventions/` | ✅ Present | (renumbered from 06 — 2026-04-21) |
| 06 | `06-endpoints/` | ✅ Present | 24 files |
| 07 | `07-db-diagram/` | ✅ Present | 11 files (incl. new `00b-split-db-anchor.md`, F-AUD42-12) |
| 97 | `97-acceptance-criteria.md` | ✅ Present | |
| 97e | `97e-roles-inline-acceptance-fixtures.md` | ✅ Present | Inline fixtures |
| 99 | `99-consistency-report.md` | ✅ Present | This file |

**Total:** 8 subfolders + 5 root files (was previously claimed as "5 subfolders + 3 root files" — corrected 2026-04-30).

---

## Per-Subfolder File Counts (audited 2026-04-30)

| Subfolder | Files | Sub-feature suffixes used | Numbering status |
|-----------|-------|---------------------------|------------------|
| `01-features/` | 29 | `05a, 07b, 08b, 09a, 09b, 11b, 12b, 13b, 14b` | Gap at #17 (documented) |
| `02-workflows/` | 13 | none | Contiguous 01–10 |
| `06-endpoints/` | 24 | `09b, 11b, 14b, 15b, 97b` | Contiguous 01–16 (no #17) |
| `07-db-diagram/` | 11 | `00b` (new) | Contiguous 00–07 + `00b` |

All sub-feature suffixes verified against `00b-numbering-policy.md` §2.1 parity table.

---

## Cross-Reference Validation

Inbound links audited 2026-04-30:

- `spec/spec-index.md` — ✅ paths valid
- `spec/33-feedback-report/00-overview.md` — ✅ paths valid
- `spec/34-activity-feed/00-overview.md` — ✅ paths valid
- `spec/36-user-management/00-overview.md` — ✅ paths valid
- `spec/01-spec-authoring-guide/13-feature-file-template.md` — ✅ paths valid
- `18-integrations.md` cross-refs (5 inbound) — ✅ valid (gap at #17 intentional)
- `00b-numbering-policy.md` referenced from app overview — ✅ valid
- `00b-split-db-anchor.md` referenced from 39 feature/endpoint files (F-AUD42-12) — ✅ valid

✅ All inbound links valid.

---

## New SSOTs Introduced 2026-04-30

| File | Resolves | Purpose |
|------|----------|---------|
| `spec/31-app/00b-numbering-policy.md` | F-AUD42-26 | Stable-primary-number rule, sub-feature suffix order, gap log, parity audit |
| `spec/31-app/07-db-diagram/00b-split-db-anchor.md` | F-AUD42-12 | Canonical split-DB scope anchor cited by 39 files |

---

## Cross-Cutting Stanzas Injected 2026-04-30

| Stanza | Files | Resolves |
|--------|-------|----------|
| Database Scope | 39 (22 features + 17 endpoints) | F-AUD42-12 |
| Architecture Anchors (ADR-0023/0017/0025) | 22 features | F-AUD42-20, F-AUD42-21 |
| Settings Surface | 18 features | F-AUD42-18 |
| Backend Write Surface | 25 features (full or N/A) | F-AUD42-22, F-AUD42-25 |
| Depth Coverage | 5 sub-features | F-AUD42-23, F-AUD42-24 |

---

## Validation History

| Date | Version | Action |
|------|---------|--------|
| 2026-04-18 | 1.0.0 | Initial consistency report created |
| 2026-04-18 | 1.2.0 | Restructure: split workflow monolith; move axios to conventions; renumber audits |
| 2026-04-18 | 1.2.1 | Inventory check |
| 2026-04-21 | 1.3.0 | **Fix S02:** Removed phantom `02-audits/` row. Renumbered subfolders 03→02, 04→03, 05→04, 06→05. Updated all inbound links. |
| 2026-04-30 | **2.0.0** | **Resolves F-AUD42-27.** Reconciled inventory: added missing `04a-fixtures/`, `06-endpoints/`, `07-db-diagram/`, `97e-roles-inline-acceptance-fixtures.md`. Corrected subfolder count from 5→8 and root files from 3→5. Added per-subfolder file-count table. Logged new SSOTs (`00b-numbering-policy.md`, `00b-split-db-anchor.md`). Logged 5 cross-cutting stanza injections from F-AUD42-12/18/20/21/22/23/24/25. Re-audited inbound links. |
