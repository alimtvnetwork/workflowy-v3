# Consistency Report — 01-features

> **Version:** 2.2.0
> **Updated:** 2026-04-27 (UTC+8) — Registered 7 new addendum SSOTs (`07b`, `08b`, `09b`, `11b`, `12b`, `13b`, `14b`) and `16-search-ranking.md` from product-clarification batches B1–B4. All 7 parent SSOTs bumped (cross-ref headers added). Zero contradictions vs parents. Prior: 2026-04-26 — Re-audit pass: all 14 content-alignment dimensions closed; all 6 Round-3 audits closed; pseudocode in `14-concurrency-and-sync.md` §14.2/§14.4 PascalCase'd (residual F-08); enum-source link added to `06-item-context-menu.md` §5.1 (residual F-02). Prior: 2026-04-26 — APP-FIX-11: structural vs content score split, content-audit disclaimer added (closes F-09).
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
| Snake_case DB identifiers absent | ✅ AUDIT-02a CLOSED 2026-04-26 (12 files renamed; pseudocode also cleaned in re-audit pass) | [`spec/18-spec-issues/05-audit-02a-column-rename.md`](../../18-spec-issues/05-audit-02a-column-rename.md) |
| Storage section present in persistence-touching files | ✅ APP-FIX-02 done (9 files) | [`06-app-folder-audit-2026-04-26.md`](../../18-spec-issues/06-app-folder-audit-2026-04-26.md) §F-03 |
| Realtime Transport callout in real-time files | ✅ APP-FIX-03 done (6 files) | §F-05 |
| `Auth::hasRole()` PHP contract pinned | ✅ APP-FIX-04 done (`15-roles-and-permissions.md` v1.5.0) | §F-06 |
| Settings keys enum-backed (Seedable Config) | ✅ APP-FIX-05 done (4 files) | §F-04 |
| `Mirrors.BrokenAt` LWW rule pinned | ✅ APP-FIX-09 done (`14-concurrency-and-sync.md` §14.4) | §F-14 |
| Aspirational-paths disclaimer in Component Contract tables | ✅ APP-FIX-08 done (10 files) | §F-07 |
| Boolean Conventions callout in overview | ✅ APP-FIX-10 done (`00-overview.md` v2.3.0) | §F-13 |
| Casing Layers callout in overview | ✅ APP-FIX-07 done | §F-08 |
| Enum sources linked from feature files | ✅ APP-FIX-06 done + re-audit residual fix in `06-item-context-menu.md` §5.1 | §F-02 |
| Workflow folder coverage (cross-feature flows) | ✅ APP-FIX-12 done (3 new flows: template-application, share-invite, trash-restore) | §F-10 |
| Edge cases split (user vs system vs cross-feature) | ✅ APP-FIX-13 done (`03-edge-cases/01-edge-cases.md` v2.0.0) | §F-11 |
| AT-APP / AT-APPF naming reconciliation | ✅ APP-FIX-14 done (canonical AT-APP-NN; AT-APPF frozen) | §F-12 |
| Dashboard taxonomy (`ItemType` enum membership) | ✅ AUDIT-03 CLOSED (`mirror` → `dashboard`; count stays 12) | [`07-audit-03-dashboard-taxonomy.md`](../../18-spec-issues/07-audit-03-dashboard-taxonomy.md) |
| SSE transport contract pinned | ✅ AUDIT-06 CLOSED (`14-concurrency-and-sync.md` §14.5) | [`08-audit-06-sse-transport-contract.md`](../../18-spec-issues/08-audit-06-sse-transport-contract.md) |
| Personas styling | ℹ️ Stylistic only | §F-15 |

**Content-alignment status:** ✅ **All 14 audit dimensions closed (15 with AUDIT-03 / AUDIT-06).** Re-audit 2026-04-26 confirmed zero residuals after pseudocode cleanup + enum-link patch.

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
| 05a | `05a-hotkey-table.md` | ✅ Present | v1.0.0 (machine-readable hotkey SSOT) |
| 06 | `06-item-context-menu.md` | ✅ Present | v2.3.0 (Storage + Realtime + disclaimer) |
| 07 | `07-board-view.md` | ✅ Present | v2.6.0 (sibling 07b cross-ref) |
| 07b | `07b-dashboard-view.md` | ✅ Present | v1.0.0 (depth-1 inline-editable card grid; B2) |
| 08 | `08-share-dialog.md` | ✅ Present | v2.4.0 (08b addendum cross-ref) |
| 08b | `08b-sharing-mirror-interaction.md` | ✅ Present | v1.0.0 (per-instance ACL on peer groups; B4) |
| 09 | `09-mirrors.md` | ✅ Present | v2.5.0 (09b authoritative-model cross-ref) |
| 09a | `09a-mirror-cycle-detection.md` | ✅ Present | v1.1.0 (DFS algorithm spec) |
| 09b | `09b-mirror-peer-group-model.md` | ✅ Present | v1.0.0 (peer-group identity, Workflowy parity; B1) |
| 10 | `10-today-view.md` | ✅ Present | v2.1.0 (Settings Keys: timezone) |
| 11 | `11-trash-view.md` | ✅ Present | v2.5.0 (11b addendum cross-ref) |
| 11b | `11b-trash-reaper.md` | ✅ Present | v1.0.0 (30d cron hard-delete; B4) |
| 12 | `12-multi-select.md` | ✅ Present | v2.4.0 (12b addendum cross-ref) |
| 12b | `12b-multi-select-zoom.md` | ✅ Present | v1.0.0 (virtual-scope zoom; B4) |
| 13 | `13-templates.md` | ✅ Present | v2.4.0 (13b addendum cross-ref) |
| 13b | `13b-templates-snapshot-semantics.md` | ✅ Present | v1.0.0 (snapshot copy semantics; B4) |
| 14 | `14-concurrency-and-sync.md` | ✅ Present | v1.8.0 (14b addendum cross-ref) |
| 14b | `14b-offline-queue.md` | ✅ Present | v1.0.0 (full local mirror + FIFO replay + LWW; B3) |
| 15 | `15-roles-and-permissions.md` | ✅ Present | v1.6.0 (Active) |
| 16 | `16-search-ranking.md` | ✅ Present | v1.0.0 (hybrid relevance + recency; B3) |
| 97 | `97-acceptance-criteria.md` | ✅ Present | v2.1.0 (AT-APP-* canonical) |
| 99 | `99-consistency-report.md` | ✅ Present | v2.2.0 (this file) |

**Total:** 27 files (was 18 in v2.1.0; +9: hotkey table, dashboard, mirror cycle/peer-group, trash reaper, multi-select zoom, templates snapshot, offline queue, search ranking, sharing×mirror).

---

## Cross-Reference Validation

All internal links verified valid. ✅

> Validated by `scripts/spec-hygiene/` link-checker. This is structural — it does not verify the *target* says what the citing file claims it says.

---

## Content Audit Tracker

When content drift is suspected, run the audits in this order:

| Audit | Scope | Tracker file |
|-------|-------|-------------|
| Round-3 spec audit | Cross-folder contradictions, SSE contract gaps, dashboard taxonomy | `spec/18-spec-issues/` (AUDIT-01 ✅, AUDIT-02a ✅, AUDIT-03 ✅, AUDIT-04 ✅, **AUDIT-06 ✅**) — **all 6 Round-3 audits closed 2026-04-26** |
| App-folder audit (15 findings) | This folder, normative content checks | [`06-app-folder-audit-2026-04-26.md`](../../18-spec-issues/06-app-folder-audit-2026-04-26.md) — all 13 APP-FIX phases done |
| Column-rename audit | snake_case → PascalCase across 12 files | [`05-audit-02a-column-rename.md`](../../18-spec-issues/05-audit-02a-column-rename.md) — ✅ CLOSED |
| Dashboard taxonomy | `ItemType` enum membership of `dashboard` vs `mirror` | [`07-audit-03-dashboard-taxonomy.md`](../../18-spec-issues/07-audit-03-dashboard-taxonomy.md) — ✅ CLOSED |
| Acceptance-criteria coverage | AT-APP / AT-APPF naming, missing IDs | ✅ Closed by APP-FIX-14 (canonical AT-APP-NN scheme) |

If any tracker has open items, the **content-alignment status above must read ⚠️ Partial**, not ✅, regardless of the structural score.

---

## Validation History

| Date | Version | Action |
|------|---------|--------|
| 2026-04-18 | 1.0.0 | Initial consistency report after restructure |
| 2026-04-21 | 1.0.1 | Marked all 15 files present; reported "100/100 (A+)" — later flagged as misleading by F-09 |
| 2026-04-26 | 2.0.0 | **APP-FIX-11.** Split score into Structural vs Content; added disclaimer; refreshed inventory to 18 files; added Content Audit Tracker pointing at `spec/18-spec-issues/`. Closes F-09. |
| 2026-04-26 | 2.1.0 | Re-audit pass — all 14 content dimensions + all 6 Round-3 audits closed; pseudocode PascalCase'd; enum-source link patched. |
| 2026-04-27 | 2.2.0 | **Product-clarification batches B1–B4.** Registered 7 new addendum SSOTs (`07b`, `08b`, `09b`, `11b`, `12b`, `13b`, `14b`) + `16-search-ranking.md`; bumped 7 parent SSOTs with cross-ref headers; inventory grew 18 → 27. Zero contradictions vs parents. |
