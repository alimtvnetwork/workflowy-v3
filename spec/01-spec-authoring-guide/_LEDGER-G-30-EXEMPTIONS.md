# Ledger — `G-30-AT-CITATION-VALIDITY` exemptions (per-(gate, path), Phase 2)

> **Type:** Per-(gate, path) ledger (canonical schema, see [`per-gate-path-ledger-schema.md`](../13-cicd-pipeline-workflows/scripts-as-spec/per-gate-path-ledger-schema.md)).
> **Source gate:** [`G-30-AT-CITATION-VALIDITY`](../_GATE-REGISTRY.md) sub-rule **§G-30.2** (open-prefix redundancy advisory).
> **Consumer runner:** [`scripts/spec-hygiene/30-check-at-citation-validity.mjs`](../../scripts/spec-hygiene/30-check-at-citation-validity.mjs) — reads this ledger via `loadG30RedundancyExemptions(LEDGER_PATH)`.
> **Migrated:** 2026-04-29 from in-source `REDUNDANCY_ALLOWLIST` Set (16 active rows + 16 well-known closed AT-WF-* rows + 2 frozen dispatch rows). Behaviour is preserved (every row's `pathGlob` is `spec/01-features/**/*.md` because that is the runner's consumer scope; future Phase 3 may narrow per-row).

## Purpose

Enumerate every open-prefix exemption that silences a `G-30.2` redundancy
advisory. Three intentional categories live here (preserved verbatim from
the original in-source comment; see SSOT §G-30.2 + F27 task log):

- **(a) FUTURE-LICENSING** — reserve a namespace for files not yet authored.
- **(b) CONVENTION-DOCUMENTATION** — open-prefix row retained as a Coverage-Map / Open-prefix-declarations entry that documents the naming scheme even though every concrete cited ID is registered via a closed declaration elsewhere (F15 + F20 closures kept the prefix rows intentionally).
- **(c) NAMESPACE-PLACEHOLDER** — feature files whose citations either map 1:1 to closed canonical `AT-APP-NN` rows or have zero current citations because the feature's ATs live fully under a different prefix.

## Exemption rows

| gate | pathGlob | entry | rationale | addedOn |
|---|---|---|---|---|
| G-30-AT-CITATION-VALIDITY | spec/01-features/**/*.md | AT-FOO- | (a) Future-licensing — doc-example placeholder cited by 02-ci-quality-gates.md | 2026-04-29 |
| G-30-AT-CITATION-VALIDITY | spec/01-features/**/*.md | AT-WORKFLOWS- | (a) Future-licensing — 02-workflows/97 future canonical index reservation | 2026-04-29 |
| G-30-AT-CITATION-VALIDITY | spec/01-features/**/*.md | AT-ROADMAP- | (a) Future-licensing — 04-roadmap/97 future canonical index reservation | 2026-04-29 |
| G-30-AT-CITATION-VALIDITY | spec/01-features/**/*.md | AT-ENDPOINTS- | (a) Future-licensing — 06-endpoints/97 future canonical index reservation | 2026-04-29 |
| G-30-AT-CITATION-VALIDITY | spec/01-features/**/*.md | AT-DBDIAGRAM- | (a) Future-licensing — 07-db-diagram/97 future canonical index reservation | 2026-04-29 |
| G-30-AT-CITATION-VALIDITY | spec/01-features/**/*.md | AT-INFO- | (b) F15 alias closure to AT-INFOMODEL-NN; row kept for convention | 2026-04-29 |
| G-30-AT-CITATION-VALIDITY | spec/01-features/**/*.md | AT-MIRROR- | (b) F15 alias closure to AT-MIRRORS-NN; row kept for convention | 2026-04-29 |
| G-30-AT-CITATION-VALIDITY | spec/01-features/**/*.md | AT-MULTI- | (b) F20 alias closure to AT-MULTISELECT-NN; row kept for convention | 2026-04-29 |
| G-30-AT-CITATION-VALIDITY | spec/01-features/**/*.md | AT-BOARD- | (b) F20 identity closure; row kept for convention documentation | 2026-04-29 |
| G-30-AT-CITATION-VALIDITY | spec/01-features/**/*.md | AT-CONCURRENCY- | (b) F20 identity closure; row kept for convention documentation | 2026-04-29 |
| G-30-AT-CITATION-VALIDITY | spec/01-features/**/*.md | AT-CTXMENU- | (b) F20 identity closure; row kept for convention documentation | 2026-04-29 |
| G-30-AT-CITATION-VALIDITY | spec/01-features/**/*.md | AT-INTERACT- | (b) F20 identity closure; row kept for convention documentation | 2026-04-29 |
| G-30-AT-CITATION-VALIDITY | spec/01-features/**/*.md | AT-LAYOUT- | (b) F20 identity closure; row kept for convention documentation | 2026-04-29 |
| G-30-AT-CITATION-VALIDITY | spec/01-features/**/*.md | AT-PAGE- | (b) F20 identity closure; row kept for convention documentation | 2026-04-29 |
| G-30-AT-CITATION-VALIDITY | spec/01-features/**/*.md | AT-ROLES- | (b) F20 identity closure; row kept for convention documentation | 2026-04-29 |
| G-30-AT-CITATION-VALIDITY | spec/01-features/**/*.md | AT-SHARE- | (b) F20 identity closure; row kept for convention documentation | 2026-04-29 |
| G-30-AT-CITATION-VALIDITY | spec/01-features/**/*.md | AT-TEMPLATES- | (b) F20 identity closure; row kept for convention documentation | 2026-04-29 |
| G-30-AT-CITATION-VALIDITY | spec/01-features/**/*.md | AT-TODAY- | (b) F20 identity closure; row kept for convention documentation | 2026-04-29 |
| G-30-AT-CITATION-VALIDITY | spec/01-features/**/*.md | AT-TRASH- | (b) F20 identity closure; row kept for convention documentation | 2026-04-29 |
| G-30-AT-CITATION-VALIDITY | spec/01-features/**/*.md | AT-MULTISELECT- | (c) Source-file prefix; canonical AT-APP-17..18 in 12-multi-select | 2026-04-29 |
| G-30-AT-CITATION-VALIDITY | spec/01-features/**/*.md | AT-INFOMODEL- | (c) Source-file prefix; canonical AT-APP-01..05 in 01-information-model | 2026-04-29 |
| G-30-AT-CITATION-VALIDITY | spec/01-features/**/*.md | AT-MIRRORS- | (c) Source-file prefix; canonical AT-APP-24 in 09-mirrors | 2026-04-29 |
| G-30-AT-CITATION-VALIDITY | spec/01-features/**/*.md | AT-DV- | (c) 07b-dashboard-view inline; canonical AT-APP-68..75 | 2026-04-29 |
| G-30-AT-CITATION-VALIDITY | spec/01-features/**/*.md | AT-SM- | (c) 08b-sharing-mirror-interaction inline; canonical AT-APP-76..80 | 2026-04-29 |
| G-30-AT-CITATION-VALIDITY | spec/01-features/**/*.md | AT-MPG- | (c) 09b-mirror-peer-group-model inline; canonical AT-APP-58..67 | 2026-04-29 |
| G-30-AT-CITATION-VALIDITY | spec/01-features/**/*.md | AT-TR- | (c) 11b-trash-reaper inline; canonical AT-APP-81..85 | 2026-04-29 |
| G-30-AT-CITATION-VALIDITY | spec/01-features/**/*.md | AT-MZ- | (c) 12b-multi-select-zoom inline; canonical AT-APP-86..91 | 2026-04-29 |
| G-30-AT-CITATION-VALIDITY | spec/01-features/**/*.md | AT-TPL- | (c) 13b-templates-snapshot-semantics inline; canonical AT-APP-92..96 | 2026-04-29 |
| G-30-AT-CITATION-VALIDITY | spec/01-features/**/*.md | AT-OQ- | (c) 14b-offline-queue inline; canonical AT-APP-97..102 | 2026-04-29 |
| G-30-AT-CITATION-VALIDITY | spec/01-features/**/*.md | AT-SR- | (c) 16-search-ranking inline; canonical AT-APP-103..107 | 2026-04-29 |
| G-30-AT-CITATION-VALIDITY | spec/02-workflows/**/*.md | AT-WF-MIGRATE- | Workflow family; AT-APP-66/67 per 10-migration-execution-flow | 2026-04-29 |
| G-30-AT-CITATION-VALIDITY | spec/02-workflows/**/*.md | AT-WF-CREATE- | Workflow family; AT-APP-58/59/62/66/67 per 09-mirror-create-flow | 2026-04-29 |
| G-30-AT-CITATION-VALIDITY | spec/02-workflows/**/*.md | AT-WF-REAPER- | Workflow family; AT-APP-81..85 per 05-trash-reaper-flow | 2026-04-29 |
| G-30-AT-CITATION-VALIDITY | spec/02-workflows/**/*.md | AT-WF-SEARCH- | Workflow family; AT-APP-103..107 per 06-search-query-flow | 2026-04-29 |
| G-30-AT-CITATION-VALIDITY | spec/02-workflows/**/*.md | AT-WF-REPLAY- | Workflow family; AT-APP-97..102 per 07-sync-replay-flow | 2026-04-29 |
| G-30-AT-CITATION-VALIDITY | spec/02-workflows/**/*.md | AT-WF-DETACH- | Workflow family; AT-APP-60..65 subset per 08-mirror-detach-flow | 2026-04-29 |
| G-30-AT-CITATION-VALIDITY | spec/02-workflows/**/*.md | AT-WF-TEMPLATE- | Workflow family; AT-APP-43..46 per 02-template-application-flow | 2026-04-29 |
| G-30-AT-CITATION-VALIDITY | spec/02-workflows/**/*.md | AT-WF-SHARE- | Workflow family; AT-APP-47..51 per 03-share-invite-flow | 2026-04-29 |
| G-30-AT-CITATION-VALIDITY | spec/02-workflows/**/*.md | AT-WF-RESTORE- | Workflow family; AT-APP-52..57 per 04-trash-restore-flow | 2026-04-29 |
| G-30-AT-CITATION-VALIDITY | spec/**/*.md | AT-APP- | Top-of-file frozen dispatch — CANONICAL AT family in 97-acceptance-criteria.md | 2026-04-29 |
| G-30-AT-CITATION-VALIDITY | spec/**/*.md | AT-APPF- | Top-of-file frozen dispatch — FROZEN legacy column (APP-FIX-14) | 2026-04-29 |

## Maintenance protocol

1. **Adding an exemption:** append a new row with the canonical 5 columns. The runner reads this ledger on every CI run; no in-source edits required.
2. **Removing an exemption:** delete the row (the entry will resume triggering G-30.2 advisory). If historical context matters, prefix the row's rationale with `Removed YYYY-MM-DD —` and leave the row in place; the runner ignores rows whose rationale starts with `Removed `.
3. **Path-scoping migration (Phase 3 follow-on):** today every row's `pathGlob` is the runner's consumer scope (`spec/01-features/**/*.md` or `spec/02-workflows/**/*.md`) which is informational only — the runner currently iterates a single consumer set per registered prefix and does not check the row's `pathGlob` against the citing file. When the runner is updated to pass the citing-file path through `isExempt(gate, entry, filePath)`, narrow each row's `pathGlob` to the smallest accurate set.

## See also

- [`spec/13-cicd-pipeline-workflows/scripts-as-spec/per-gate-path-ledger-schema.md`](../13-cicd-pipeline-workflows/scripts-as-spec/per-gate-path-ledger-schema.md) — canonical schema spec.
- [`scripts/spec-hygiene/30-check-at-citation-validity.mjs`](../../scripts/spec-hygiene/30-check-at-citation-validity.mjs) — consumer runner.
- [`spec/_GATE-REGISTRY.md`](../_GATE-REGISTRY.md) — gate definitions.
