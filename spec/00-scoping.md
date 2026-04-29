# 00 — Spec Corpus Scoping

> **Status:** Authoritative SSOT for corpus boundary classification.
> **Created:** 2026-04-29 — closes **F-AUDIT-28** ("Implicit or Out-of-Corpus Scoping", v6 audit MED, +3).
> **Authority:** This file overrides any contradictory implicit assumptions in feature specs, ADRs, or memory. To re-classify a scope, supersede this file via a new entry in `spec/00-adrs/`.

## Why This File Exists

Prior to 2026-04-29, scope classification was **implicit** — communicated only via side-channel "change notes" to the v6 audit and via memory entries dated 2026-04-25. The Gemini-2.5-Pro v6 audit flagged this as a procedural fault (F-AUDIT-28):

> *"This critical scoping information is not present within the spec corpus itself, creating a risk of confusion and wasted effort for any new contributor or AI implementer."*

This file remedies that by making scope status **machine-checkable** and **first-class** in the corpus.

## Classification Vocabulary

Every top-level entry under `spec/` MUST carry exactly one of these three statuses:

| Status | Meaning | AI Implementer Behaviour | Audit Behaviour |
|---|---|---|---|
| ✅ **Active** | In-scope for the current WorkFlowy WP-plugin product. SSOT. | MUST consume; MUST emit code matching its acceptance criteria; MUST flag any cross-scope contradictions. | Counted in implementability score; placeholder/density caps enforced; ATs CI-gated. |
| 📦 **Archived** | Historical decision record, completed work, or solved-issue log. Read-only after archival date. | MAY consult for rationale; MUST NOT treat as a directive for new code. | Excluded from implementability score; placeholder caps not enforced; CI gates may continue to assert immutability. |
| 🗑 **Legacy** | Inherited from a prior product (browser-extension / Go-binary CLI deploy pipeline) before the 2026-04-25 backend decision. **Out of scope for WorkFlowy.** Retained only because deletion would lose institutional knowledge. | MUST NOT consume; MUST NOT emit code from; if a feature spec cites a Legacy file, treat the citation as a stale reference and surface it as a content bug. | Excluded from implementability score (per `mem://preferences/spec-implementability-percentage` weighting); placeholder caps not enforced; AT counts not credited. |

## Corpus Inventory (2026-04-29)

### Directories

| Path | Status | Rationale | First-classified |
|---|---|---|---|
| `spec/00-adrs/` | ✅ Active | Architectural Decision Records — load-bearing source of truth for every decision. | 2026-04-29 |
| `spec/01-spec-authoring-guide/` | ✅ Active | Meta-spec governing how specs themselves are written. Required by every contributor. | 2026-04-29 |
| `spec/02-coding-guidelines/` | ✅ Active | Strict TypeScript + SQLite naming rules referenced by every implementation task. | 2026-04-29 |
| `spec/03-error-manage/` | ✅ Active | Error-handling contract referenced by ADR-0017 (8 named boundaries). | 2026-04-29 |
| `spec/04-database-conventions/` | ✅ Active | Singular DDL identifiers, REST envelope format, alias-bridge SSOT (per ADR-0024). | 2026-04-29 |
| `spec/05-split-db-architecture/` | ✅ Active | Multi-database routing for the WP-plugin SQLite backend. | 2026-04-29 |
| `spec/06-seedable-config-architecture/` | ✅ Active | Seedable configuration model for WP-plugin install + multi-tenant deploy. | 2026-04-29 |
| `spec/07-design-system/` | ✅ Active | Tailwind CSS v4 token registry per ADR-0012. | 2026-04-29 |
| `spec/08-docs-viewer-ui/` | ✅ Active | In-app documentation viewer surface (part of WorkFlowy UI). | 2026-04-29 |
| `spec/09-code-block-system/` | ✅ Active | Code-block rendering & syntax-highlighting subsystem (part of WorkFlowy UI). | 2026-04-29 |
| `spec/10-powershell-integration/` | 🗑 Legacy | PowerShell wrapper for a prior CLI/extension product. Not part of WorkFlowy WP-plugin. v6 audit flagged. | 2026-04-29 |
| `spec/11-research/` | 📦 Archived | Background research notes, no implementation directives. 85 lines, no stub markers. | 2026-04-29 |
| `spec/12-consolidated-guidelines/` | ✅ Active | Cross-cutting consolidated rules referenced by multiple feature specs. | 2026-04-29 |
| `spec/13-cicd-pipeline-workflows/` | 🗑 Legacy | CI/CD pipelines for browser-extension + Go-binary deploy targets. WorkFlowy WP-plugin uses a separate (unspecified) deploy path. v6 audit flagged. | 2026-04-29 |
| `spec/14-self-update-app-update/` | 🗑 Legacy | Self-update mechanism for standalone CLI/extension binaries. WP-plugin updates via WordPress plugin update API. v6 audit flagged. | 2026-04-29 |
| `spec/15-wp-plugin-how-to/` | ✅ Active | WP-plugin installation, configuration, and operational documentation. | 2026-04-29 |
| `spec/16-generic-cli/` | 🗑 Legacy | Generic CLI scaffolding from prior product. WorkFlowy has no CLI surface. v6 audit flagged. | 2026-04-29 |
| `spec/17-generic-update/` | 🗑 Legacy | Generic update mechanism from prior product. Superseded by WordPress plugin update API. v6 audit flagged. | 2026-04-29 |
| `spec/18-spec-issues/` | 📦 Archived | Audit reports + issue logs (round 1..N). Append-only history. | 2026-04-29 |
| `spec/31-app/` | ✅ Active | App-layer feature specs (information model, offline queue, search, sharing, …). Primary feature corpus. | 2026-04-29 |
| `spec/32-ui-design/` | ✅ Active | UI component design specs (state, data types, layout, panels). Primary UI corpus. | 2026-04-29 |
| `spec/33-feedback-report/` | ✅ Active | In-app feedback + bug-report feature spec. | 2026-04-29 |
| `spec/34-activity-feed/` | ✅ Active | Activity-feed feature spec (per-account stream of mutations). | 2026-04-29 |
| `spec/35-enforcement-rules/` | ✅ Active | Cross-cutting enforcement rules for hygiene gates and CI. | 2026-04-29 |
| `spec/36-user-management/` | ✅ Active | User account, settings, MFA, backups, referrals, roles. Auth surface for WP-plugin. | 2026-04-29 |

### Top-level files

| Path | Status | Rationale |
|---|---|---|
| `spec/00-overview.md` | ✅ Active | Spec-corpus entry point. |
| `spec/00-scoping.md` | ✅ Active | **This file.** Scope SSOT. |
| `spec/19-glossary.md` | ✅ Active | Canonical term definitions. |
| `spec/20-enums-index.md` | ✅ Active | Enum SSOT (ItemType, etc.) per ADR-0015. |
| `spec/21-ai-readiness-audit-round-2.md` | 📦 Archived | Round-2 audit snapshot. |
| `spec/22-contract-json.md` | ✅ Active | API contract reference. |
| `spec/23-ai-build-walkthrough.md` | ✅ Active | Walkthrough for AI implementers. |
| `spec/97a-acceptance-criteria-fixtures.md` | ✅ Active | Top-level fixture index. |
| `spec/99-consistency-report.md` | ✅ Active | Cross-scope consistency report (auto-generated). |
| `spec/_AUDIT-EXEMPTIONS.md` | ✅ Active | Audit exemption manifest per ADR-0030. |
| `spec/_GATE-GRADUATION-LEDGER.md` | ✅ Active | Gate-graduation ledger per ADR-0031. |
| `spec/_GATE-REGISTRY.md` | ✅ Active | Master gate registry. |
| `spec/_LEDGER-*.md` (4 files) | ✅ Active | Per-gate enforcement ledgers per ADR-0029. |
| `spec/contract.json` | ✅ Active | Machine-readable API contract. |
| `spec/dashboard-data.json` | ✅ Active | Dashboard fixture data. |
| `spec/folder-structure-root.md` | ✅ Active | Folder-structure SSOT. |
| `spec/health-dashboard.md` | ✅ Active | Spec-health dashboard. |
| `spec/licensing-strategy.md` | ✅ Active | License decision (will be ratified by ADR-0032 — see task #52). |
| `spec/readme.md` | ✅ Active | Corpus README. |
| `spec/spec-index.md` | ✅ Active | Master index. |

## Aggregate Counts (2026-04-29)

| Status | Directories | Top-level files | Total entries |
|---|---:|---:|---:|
| ✅ Active | 19 | 17 | 36 |
| 📦 Archived | 2 | 1 | 3 |
| 🗑 Legacy | 5 | 0 | 5 |
| **Total** | **26** | **18** | **44** |

**Active fraction:** 36 / 44 = **81.8%** of top-level entries are in-scope for WorkFlowy implementation.

## Reclassification Procedure

A scope's status MUST NOT be silently changed. To reclassify any entry:

1. Author a new ADR under `spec/00-adrs/` titled `ADR-NNNN: Reclassify <scope> from <old> to <new>`.
2. The ADR MUST cite this file and the row being changed.
3. Once the ADR reaches `Accepted`, update this file in the same PR — both files MUST land together.
4. Update the row's `First-classified` column to the reclassification date and add a `Reclassified` column note.

**Forbidden:** Silent edits, memory-only reclassifications, side-channel notes to audits.

## Hygiene Gate (G-NS-SCOPING-INVENTORY)

A new hygiene runner under `scripts/spec-hygiene/` MUST be authored to enforce:

- **G-NS-SCOPING-INVENTORY-COMPLETE** — Every top-level directory and file under `spec/` (excluding `spec/00-scoping.md` itself) MUST appear in exactly one row of the inventory tables above. Diff failures (missing rows or orphan files on disk) are CI errors.
- **G-NS-SCOPING-STATUS-VALID** — Each row's Status column MUST be one of `✅ Active`, `📦 Archived`, `🗑 Legacy`. Free-text statuses are CI errors.
- **G-NS-SCOPING-LEGACY-NO-CITATIONS** — Files under any 🗑 Legacy directory MUST NOT be cited from any ✅ Active file. Cross-references from Legacy → Active are permitted (and remain stale-but-tolerated). Cross-references from Active → Legacy are CI errors.

The runner is unwritten as of 2026-04-29; named here so the gate ID is reserved and CI promotion is tractable per ADR-0031.

## Acceptance Criteria

This file is governed by the following AT row, registered in `spec/00-adrs/97-acceptance-criteria.md` v1.13.0:

- **AT-NS-SCOPING-SSOT** — `spec/00-scoping.md` MUST exist, MUST classify every top-level directory + top-level file under `spec/` into exactly one of `✅ Active` / `📦 Archived` / `🗑 Legacy`, and MUST be the sole source of truth for corpus boundary. Reclassifications MUST follow the ADR procedure documented in §"Reclassification Procedure" above. Implicit scoping via memory-only or side-channel notes is forbidden.

## Cross-references

- **Closes:** F-AUDIT-28 (v6 audit, MED, +3).
- **Composes with:** ADR-0030 (audit exemption manifest); ADR-0031 (gate-graduation pattern).
- **Memory cross-link:** `mem://constraints/backend-runtime-deferred` (the 2026-04-25 backend decision is the underlying basis for the 5 Legacy classifications).
