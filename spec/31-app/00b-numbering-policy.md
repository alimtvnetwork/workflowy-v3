# 00b — Numbering Policy (Normative)

> **Version:** 1.0.0
> **Updated:** 2026-04-30 (UTC+8) — created per F-AUD42-26 to make sibling-file numbering rules explicit and enforceable.
> **Status:** ✅ Normative SSOT for `spec/31-app/` file numbering.
> **Parent:** [`./00-overview.md`](./00-overview.md)
> **Resolves:** F-AUD42-26 (Numbering gaps / sibling sub-features off-pattern).

---

## 1. Numbering Rules

### 1.1 Primary index

- Each `spec/31-app/{NN-folder}/` uses **two-digit primary numbers** starting at `00-overview.md`.
- Primary numbers are **stable** — once assigned to a topic, they never shift, even if a lower number is later removed.
- Reserved suffixes: `97-acceptance-criteria.md`, `99-consistency-report.md` (always present in every folder).

### 1.2 Sub-feature suffixes (`a`, `b`, …)

- A primary file MAY have lowercase letter suffixes for **sub-feature splits** that share the parent's domain.
- Order: `Na` before `Nb` before `Nc`. Skipping a letter (e.g., `Na` then `Nc`) is **forbidden**.
- A sub-feature MUST cite its parent in the front-matter header: `> **Parent feature:** [...](./NN-parent.md)` (gate **G-NS-STATUS-COMPANION-CITES-PARENT**).
- Sub-features inherit the parent's domain — they MUST NOT introduce a new top-level concern (use a new primary number for that) (gate **G-NS-STATUS-COMPANION-CITES-PARENT**).

### 1.3 Intentional gaps (numbering-skip log)

(gate **G-00-ADR-NUMBERING**, applied here to feature-numbering by analogy) Gaps in the primary sequence are **allowed** but MUST be enumerated here with rationale. Re-using a skipped number later requires updating this log.

| Folder | Skipped # | Successor | Rationale | Date |
|--------|-----------|-----------|-----------|------|
| `01-features/` | `17` | `18-integrations.md` | Reserved for a future "Notifications" feature (post-MVP); skipping avoids renaming `18-integrations.md` and its 5 cross-refs. | 2026-04-30 |

> Re-claiming `17` later: drop a new `17-notifications.md`, link from `00-overview.md`, and update this row.

---

## 2. Sub-Feature Parity Rule

When a feature in `01-features/` has sub-feature suffixes (`Na`, `Nb`), the corresponding entries in `06-endpoints/` and `02-workflows/` SHOULD mirror the same suffix pattern **iff** the sub-feature introduces a distinct endpoint or workflow.

### 2.1 Current parity status (audit 2026-04-30)

| Primary | `01-features/` sub-files | `06-endpoints/` mirror | Status | Notes |
|---------|--------------------------|------------------------|--------|-------|
| 05 | `05a-hotkey-table.md` | — | ✅ N/A | Hotkey table is UI-only; no endpoint surface. |
| 07 | `07b-dashboard-view.md` | — | ✅ N/A | Dashboard reuses `04-page-content-area` endpoint surface (no new routes). |
| 08 | `08b-sharing-mirror-interaction.md` | — | ✅ N/A | Composition rule; reuses `08-share-dialog` + `09-mirrors` endpoints (per its own Backend Write Surface N/A declaration). |
| 09 | `09a-mirror-cycle-detection.md`, `09b-mirror-peer-group-model.md` | `09b-mirror-peer-group.md` | ✅ Partial | `09a` is pure algorithm (no endpoint); `09b` mirrors data model (endpoint exists). |
| 11 | `11b-trash-reaper.md` | `11b-trash-reaper.md` | ✅ Match | |
| 12 | `12b-multi-select-zoom.md` | — | ✅ N/A | Reuses `12-multi-select` bulk routes scoped to zoom subtree. |
| 13 | `13b-templates-snapshot-semantics.md` | — | ✅ N/A | Snapshot semantics; write surface lives in `13-templates`. |
| 14 | `14b-offline-queue.md` | `14b-sync-replay.md` | ✅ Match | Endpoint name reflects the action; both anchor the same sub-feature. |
| 15 | — | `15b-search.md` | ⚠️ Endpoint-only | Search endpoint splits from `15-roles-and-permissions.md` because routing diverged; documented in `15b-search.md` v1.1.0. Acceptable per Rule 1.1 (numbers stable). |

**Conclusion:** all sub-feature splits are accounted for; no orphan sub-files. Future sub-features MUST be listed here on creation.

---

## 3. Gates

- `[gate: G-NUMBERING-NO-SKIP]` — hygiene script `76-check-numbering-policy.mjs` (planned) MUST flag any new primary-number skip not enumerated in §1.3.
- `[gate: G-SUBFEATURE-LETTER-ORDER]` — same script MUST reject `Nc` without `Na`+`Nb`, or `Nb` without `Na`.
- `[gate: G-SUBFEATURE-PARITY-LOGGED]` — same script MUST flag any new `Nb`/`Nc` in `01-features/` without an updated row in §2.1.

---

## 4. Keywords

`numbering` · `sub-feature` · `parity` · `policy` · `f-aud42-26`
