# Consistency Report — 01-features

> **Version:** 2.0.0
> **Updated:** 2026-04-26 (UTC+8) — APP-FIX-11: structural vs content score split, content-audit disclaimer added, inventory refreshed (closes audit F-09).
> **Prior versions:** 1.0.1 (2026-04-21) — reported "100/100 (A+)" while 15 normative violations existed; the score covered file presence + kebab-case only and was a tooling false-positive.

---

## 🛑 Read this first — what this report does NOT cover

> **The two-score model.** This report has ALWAYS measured *structural hygiene* only — file presence, kebab-case naming, unique numeric prefixes, broken Markdown links. It has **never** measured *content alignment* — whether each file follows the normative rules from `00-overview.md`, the glossary, the coding guidelines, or the seedable-config architecture.
>
> **Content audits live elsewhere.** Use the **Content Audit Tracker** below to see which deeper audits have been run, what they found, and where the open issues live. A 100/100 structural score does NOT imply content correctness.
>
> **AI implementer rule:** If you are about to skip an audit because this report shows a high score — STOP. Read the linked audit files first. The structural score is a smoke test, not a quality bar.

---

## Module Health — Structural (file/naming/links only)

| Criterion | Status |
|-----------|--------|
| `00-overview.md` present | ✅ |
| `99-consistency-report.md` present | ✅ |
| `97-acceptance-criteria.md` present | ✅ |
| Lowercase kebab-case naming | ✅ |
| Unique numeric sequence prefixes | ✅ |
| Markdown links resolve | ✅ |

**Structural Score:** 100/100 (A+) — *file/naming/link checks only. NOT a quality grade.*

---

## Module Health — Content Alignment (NOT auto-scored)

| Criterion | Status | Source of truth |
|-----------|--------|-----------------|
| Snake_case DB identifiers absent | ⚠️ Partial — see AUDIT-02a | [`spec/18-spec-issues/05-audit-02a-column-rename.md`](../../18-spec-issues/05-audit-02a-column-rename.md) |
| Storage section present in persistence-touching files | ✅ APP-FIX-02 done (9 files) | [`06-app-folder-audit-2026-04-26.md`](../../18-spec-issues/06-app-folder-audit-2026-04-26.md) §F-03 |
| Realtime Transport callout in real-time files | ✅ APP-FIX-03 done (6 files) | §F-05 |
| `Auth::hasRole()` PHP contract pinned | ✅ APP-FIX-04 done (`15-roles-and-permissions.md` v1.4.0) | §F-06 |
| Settings keys enum-backed (Seedable Config) | ✅ APP-FIX-05 done (4 files) | §F-04 |
| `Mirrors.BrokenAt` LWW rule pinned | ✅ APP-FIX-09 done (`14-concurrency-and-sync.md` §14.4) | §F-14 |
| Aspirational-paths disclaimer in Component Contract tables | ✅ APP-FIX-08 done (10 files) | §F-07 |
| Boolean Conventions callout in overview | ✅ APP-FIX-10 done (`00-overview.md` v2.2.0) | §F-13 |
| Casing Layers callout in overview | ✅ APP-FIX-07 done | §F-08 |
| Enum sources linked from feature files | ✅ APP-FIX-06 done | §F-02 |
| Workflow folder coverage (cross-feature flows) | ⚠️ Pending APP-FIX-12 | §F-10 |
| Edge cases split (user vs system) | ⚠️ Pending APP-FIX-13 | §F-11 |
| AT-APP / AT-APPF naming reconciliation | ⚠️ Pending APP-FIX-14 | §F-12 |
| Personas styling | ℹ️ Stylistic only | §F-15 |

**Content-alignment status:** **10 of 14 audit dimensions closed**. Open: AUDIT-02a (rename), APP-FIX-12, APP-FIX-13, APP-FIX-14.

---

## File Inventory

| # | File | Structural | Latest content-audit version |
|---|------|-----------|------------------------------|
| 00 | `00-overview.md` | ✅ Present | v2.2.0 (Boolean + Casing + Enum-source callouts) |
| 01 | `01-information-model.md` | ✅ Present | Storage row added; aspirational disclaimer canonical here |
| 02 | `02-personas.md` | ✅ Present | unchanged (stylistic only — F-15) |
| 03 | `03-layout-structure.md` | ✅ Present | v2.2.0 (Settings Keys table) |
| 04 | `04-page-content-area.md` | ✅ Present | v2.2.0 (aspirational disclaimer) |
| 05 | `05-interactions.md` | ✅ Present | v2.1.0 (aspirational disclaimer) |
| 06 | `06-item-context-menu.md` | ✅ Present | v2.3.0 (Storage + Realtime + disclaimer) |
| 07 | `07-board-view.md` | ✅ Present | v2.4.0 (Storage + Realtime + disclaimer) |
| 08 | `08-share-dialog.md` | ✅ Present | Realtime Transport added |
| 09 | `09-mirrors.md` | ✅ Present | v2.3.0 (Storage + Realtime + disclaimer) |
| 10 | `10-today-view.md` | ✅ Present | v2.1.0 (Settings Keys: timezone) |
| 11 | `11-trash-view.md` | ✅ Present | v2.4.0 (Storage + Realtime + Settings + disclaimer) |
| 12 | `12-multi-select.md` | ✅ Present | v2.3.0 (Storage + Realtime + disclaimer) |
| 13 | `13-templates.md` | ✅ Present | v2.3.0 (Storage + Settings + disclaimer) |
| 14 | `14-concurrency-and-sync.md` | ✅ Present | v1.4.0 (Storage + §14.4 BrokenAt LWW + disclaimer) |
| 15 | `15-roles-and-permissions.md` | ✅ Present | v1.4.0 (Storage + Realtime + `Auth::hasRole()` contract + disclaimer) |
| 97 | `97-acceptance-criteria.md` | ✅ Present | AT-APP-* schema (reconciliation pending APP-FIX-14) |
| 99 | `99-consistency-report.md` | ✅ Present | v2.0.0 (this file) |

**Total:** 18 files (was 15 in v1.0.1; `14-concurrency-and-sync.md`, `15-roles-and-permissions.md`, `97-acceptance-criteria.md` were not yet tracked).

---

## Cross-Reference Validation

All internal links verified valid. ✅

> Validated by `scripts/spec-hygiene/` link-checker. This is structural — it does not verify the *target* says what the citing file claims it says.

---

## Content Audit Tracker

When content drift is suspected, run the audits in this order:

| Audit | Scope | Tracker file |
|-------|-------|-------------|
| Round-3 spec audit | Cross-folder contradictions, SSE contract gaps, dashboard taxonomy | `spec/18-spec-issues/` (AUDIT-01..06) |
| App-folder audit (15 findings) | This folder, normative content checks | [`06-app-folder-audit-2026-04-26.md`](../../18-spec-issues/06-app-folder-audit-2026-04-26.md) |
| Column-rename audit | snake_case → PascalCase across 12 files | [`05-audit-02a-column-rename.md`](../../18-spec-issues/05-audit-02a-column-rename.md) |
| Acceptance-criteria coverage | AT-APP / AT-APPF naming, missing IDs | Pending APP-FIX-14 |

If any tracker has open items, the **content-alignment status above must read ⚠️ Partial**, not ✅, regardless of the structural score.

---

## Validation History

| Date | Version | Action |
|------|---------|--------|
| 2026-04-18 | 1.0.0 | Initial consistency report after restructure |
| 2026-04-21 | 1.0.1 | Marked all 15 files present; reported "100/100 (A+)" — later flagged as misleading by F-09 |
| 2026-04-26 | 2.0.0 | **APP-FIX-11.** Split score into Structural vs Content; added disclaimer; refreshed inventory to 18 files; added Content Audit Tracker pointing at `spec/18-spec-issues/`. Closes F-09. |
