# Ledger: G-31 Workflow / Feature / Endpoint Cross-Reference Exemptions


> **Parent:** [`./00-overview.md`](./00-overview.md) — added 2026-04-30 (AUD-REMEDIATE-CRIT-7, F-AUD42-08 closure).

> **Scope:** This ledger holds per-(gate, scope, category) exemptions consumed
> by `scripts/spec-hygiene/31-check-workflow-xref-reciprocity.mjs` (G-31).
> It is the **per-(gate, path) Phase-2 sibling** of `_LEDGER-G-30-EXEMPTIONS.md`,
> applying the same proven pattern to G-31's twelve in-source allow-list Sets
> (4 scopes × 3 categories).
>
> **Schema (Phase 1, ratified):** `gate | pathGlob | entry | rationale | addedOn`
> — see `spec/13-cicd-pipeline-workflows/scripts-as-spec/per-gate-path-ledger-schema.md`.
>
> **G-31 specialisation:** the `gate` column carries the sub-gate suffix
> (`.peer` / `.island` / `.head`) so a single loader can yield the
> three-category shape the runner expects. The `pathGlob` column is the
> per-scope directory glob (workflows / features / endpoints / db-diagram).
> `entry` is bare filename(s) per the runner's existing semantics:
> `${from} → ${to}` for peer-pair, `${file}` for island/head.
>
> **In-source emergency overrides:** Each Set in
> `31-check-workflow-xref-reciprocity.mjs` remains as an empty skeleton
> (`new Set()`) so a hot-fix exemption can land without a ledger PR.
> The runner unions ledger entries ∪ in-source entries.
>
> **Emptiness:** Empty categories (e.g. workflows-peer, db-diagram-head) are
> intentionally absent from this ledger; they remain empty in-source.

## Entries

| gate | pathGlob | entry | rationale | addedOn |
|------|----------|-------|-----------|---------|
| G-31.2.peer | `spec/31-app/01-features/**` | `07b-dashboard-view.md → 04-page-content-area.md` | sister-list-view context cite (addendum → cross-domain peer; back-link would bloat parent) | 2026-04-27 |
| G-31.2.peer | `spec/31-app/01-features/**` | `08b-sharing-mirror-interaction.md → 09b-mirror-peer-group-model.md` | peer-group identity cite (addendum → cross-domain peer) | 2026-04-27 |
| G-31.2.peer | `spec/31-app/01-features/**` | `08b-sharing-mirror-interaction.md → 15-roles-and-permissions.md` | ACL model cite (addendum → cross-domain peer) | 2026-04-27 |
| G-31.2.peer | `spec/31-app/01-features/**` | `11b-trash-reaper.md → 09b-mirror-peer-group-model.md` | peer-group dissolve rule cite | 2026-04-27 |
| G-31.2.peer | `spec/31-app/01-features/**` | `12b-multi-select-zoom.md → 05-interactions.md` | base zoom-hotkey cite | 2026-04-27 |
| G-31.2.peer | `spec/31-app/01-features/**` | `12b-multi-select-zoom.md → 09b-mirror-peer-group-model.md` | peer sync inside scope cite | 2026-04-27 |
| G-31.2.peer | `spec/31-app/01-features/**` | `13b-templates-snapshot-semantics.md → 09b-mirror-peer-group-model.md` | mirrors-not-snapshotted cite | 2026-04-27 |
| G-31.3.island | `spec/31-app/06-endpoints/**` | `03-layout-structure.md` | top-level shell; no sibling endpoint depends on it | 2026-04-27 |
| G-31.3.island | `spec/31-app/06-endpoints/**` | `04-page-content-area.md` | main outliner surface; cross-refs go to features | 2026-04-27 |
| G-31.3.island | `spec/31-app/06-endpoints/**` | `05-interactions.md` | global interaction catalog; standalone | 2026-04-27 |
| G-31.3.island | `spec/31-app/06-endpoints/**` | `06-item-context-menu.md` | context-menu surface; standalone | 2026-04-27 |
| G-31.3.island | `spec/31-app/06-endpoints/**` | `07-board-view.md` | board surface; cross-refs go to features | 2026-04-27 |
| G-31.3.island | `spec/31-app/06-endpoints/**` | `10-today-view.md` | today surface; cross-refs go to features | 2026-04-27 |
| G-31.3.island | `spec/31-app/06-endpoints/**` | `12-multi-select.md` | multi-select surface; cross-refs go to features | 2026-04-27 |
| G-31.3.island | `spec/31-app/06-endpoints/**` | `13-templates.md` | templates surface; cross-refs go to features | 2026-04-27 |
| G-31.3.island | `spec/31-app/06-endpoints/**` | `15b-search.md` | search surface; cross-refs go to features | 2026-04-27 |
| G-31.2.head | `spec/31-app/01-features/**` | `09a-mirror-cycle-detection.md` | citations are predominantly cross-domain (endpoints, edge-cases, mem://) rather than peer features | 2026-04-27 |
| G-31.2.head | `spec/31-app/01-features/**` | `14b-offline-queue.md` | citations are predominantly cross-domain (src/types, mem://, infra constraint) rather than peer features | 2026-04-27 |

**Row count:** 18 (= 7 peer + 9 island + 2 head).

## Loader contract (consumed by `31-check-workflow-xref-reciprocity.mjs`)

```
function loadG31Exemptions() → {
  "G-31.1": { peer: Set<string>, island: Set<string>, head: Set<string> },
  "G-31.2": { peer: Set<string>, island: Set<string>, head: Set<string> },
  "G-31.3": { peer: Set<string>, island: Set<string>, head: Set<string> },
  "G-31.4": { peer: Set<string>, island: Set<string>, head: Set<string> },
}
```

Parser rules:
1. Read this file; locate the `## Entries` table.
2. For each non-header row, split `gate` on `.`; require shape `G-31.<scopeNum>.<category>`.
3. `category ∈ {peer, island, head}` else hard-fail.
4. Insert `entry` into `out[scopeId][category]`.
5. Missing buckets default to empty `Set`.

The runner unions ledger Sets with the same-named in-source Sets
(emergency-override slot, normally empty).

## Promotion path

- **Phase 2 (this PR):** Ledger created; loader threaded; runner consumes union.
  Status: **DOC-NORM** (no behaviour change).
- **Phase 3:** Once `G-13-LEDGER-PER-GATE-PATH` promotes to CI, this ledger's
  `pathGlob` column will be re-validated per row (each `entry` filename must
  resolve under the row's `pathGlob`).
