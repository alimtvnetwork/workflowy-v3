# Audit Findings Ledger

> **Version:** 1.0.0
> **Created:** 2026-04-29 (UTC+8)
> **Status:** Authoritative SSOT for every `F-AUDIT-NN` and `F-AUDxx-NN` finding produced by any spec-implementability or per-folder audit.
> **Closes:** F-AUDIT-30 (MED, "Poor Discoverability of Resolution Evidence")
> **Hygiene gate:** [`scripts/spec-hygiene/74-check-audit-findings-ledger.mjs`](../scripts/spec-hygiene/74-check-audit-findings-ledger.mjs)
> **Parent:** [`spec/health-dashboard.md`](./health-dashboard.md)

---

## Why this ledger exists

The v7 Gemini-2.5-Pro audit (2026-04-29) raised **F-AUDIT-30** after observing
that `F-AUDIT-26` had been carried as "open" across **two consecutive audit
cycles** despite being resolved in v4 by `_GATE-GRADUATION-LEDGER` v1.1.0 +
ADR-0031. Root cause: no single, machine-checkable place mapped a finding ID
to its resolution evidence, so each new audit had to re-discover prior work.

This ledger is that single place. **Every** finding produced by **any** audit
artifact under `/mnt/documents/spec*audit*` MUST appear in the table below
within the same response that mentions it. The hygiene gate fails CI if a
finding is referenced in `spec/` but absent from this table, or if a row is
marked `Resolved` without a verifiable evidence link.

---

## Status vocabulary (closed enum)

| Status | Meaning |
|---|---|
| `Open` | Finding is real, ratified, and not yet resolved. Evidence link MAY be `—`. |
| `Resolved` | Fix landed; evidence link MUST point to the closing artifact (ADR, ledger, file:line, or hygiene script). |
| `Stale` | Was carried as Open in a prior audit but had already been resolved earlier. Evidence link MUST point to the prior resolution artifact. Used to prevent re-discovery loops. |
| `Retracted` | Finding was a false positive or based on misread spec. Evidence link MUST point to the corrective explanation. |

Out-of-vocabulary statuses (`Pending`, `WIP`, `Wontfix`, `Deferred`, …) are
**forbidden** and will fail the gate.

---

## Findings — `F-AUDIT-NN` family (cross-cycle implementability audits)

| ID | Severity | First raised | Status | Resolved by | Evidence |
|---|---|---|---|---|---|
| F-AUDIT-02 | LOW | v3 | Resolved | Exemption granted | [`spec/_AUDIT-EXEMPTIONS.md`](./_AUDIT-EXEMPTIONS.md) |
| F-AUDIT-15 | MED | v4 | Retracted | False-positive cascade ratified by v6→v7 | [`spec/00-adrs/97-acceptance-criteria.md#F-AUDIT-15`](./00-adrs/97-acceptance-criteria.md) |
| F-AUDIT-21 | HIGH | v5 | Resolved | AT-ADR-G07..G14 (7 ADRs) | [`spec/00-adrs/97-acceptance-criteria.md#F-AUDIT-21`](./00-adrs/97-acceptance-criteria.md) |
| F-AUDIT-24 | LOW | v5 | Resolved | Exemption granted | [`spec/_AUDIT-EXEMPTIONS.md`](./_AUDIT-EXEMPTIONS.md) |
| F-AUDIT-25 | MED | v6 | Resolved | `scripts/spec-hygiene/44-fix-feature-block-format.mjs` parser fix | [`spec/00-adrs/97-acceptance-criteria.md#F-AUDIT-25`](./00-adrs/97-acceptance-criteria.md) |
| F-AUDIT-26 | MED | v5 | **Stale** | Resolved in v4 by `_GATE-GRADUATION-LEDGER` v1.1.0 + ADR-0031 (audit failed to detect) | [`spec/00-adrs/0031-warn-only-strict-flip-pattern.md`](./00-adrs/0031-warn-only-strict-flip-pattern.md), [`spec/_GATE-GRADUATION-LEDGER.md`](./_GATE-GRADUATION-LEDGER.md) |
| F-AUDIT-27 | MED | v6 | Resolved | Ratified closed by v7 | [`spec/00-adrs/97-acceptance-criteria.md#F-AUDIT-27`](./00-adrs/97-acceptance-criteria.md) |
| F-AUDIT-28 | MED | v6 | Resolved | `spec/00-scoping.md` SSOT (36 Active / 3 Archived / 5 Legacy) | [`spec/00-scoping.md`](./00-scoping.md) |
| F-AUDIT-29 | LOW | v6 | Resolved | 5 corpus-wide false-positives only; ratified by v7 | [`spec/00-adrs/97-acceptance-criteria.md#F-AUDIT-29`](./00-adrs/97-acceptance-criteria.md) |
| F-AUDIT-30 | MED | v7 | Resolved | This ledger + hygiene gate #74 | [`spec/AUDIT-FINDINGS-LEDGER.md`](./AUDIT-FINDINGS-LEDGER.md), [`scripts/spec-hygiene/74-check-audit-findings-ledger.mjs`](../scripts/spec-hygiene/74-check-audit-findings-ledger.mjs) |
| F-AUDIT-31 | MED | v6 | Resolved | ADR-0030 audit-exemption manifest | [`spec/00-adrs/0030-audit-exemption-manifest.md`](./00-adrs/0030-audit-exemption-manifest.md) |
| F-AUDIT-32 | LOW | v6 | Resolved | `_GATE-REGISTRY` row + `AT-FIX-COMPANION-SHAPE` baseline | [`spec/_GATE-REGISTRY.md`](./_GATE-REGISTRY.md), [`spec/_LEDGER-G-00-AT-FIX-COMPANION-SHAPE-BASELINE.md`](./_LEDGER-G-00-AT-FIX-COMPANION-SHAPE-BASELINE.md) |

**Open count:** 0 — **Resolved:** 10 — **Stale:** 1 — **Retracted:** 1

---

## Findings — `F-AUDxx-NN` family (per-folder content audits)

| ID | Severity | Source audit | Status | Evidence |
|---|---|---|---|---|
| F-AUD27-01 | MED | spec/18-spec-issues/06-app-folder-audit-2026-04-26.md | Resolved | [`spec/18-spec-issues/09-app-folder-re-audit-2026-04-26.md`](./18-spec-issues/09-app-folder-re-audit-2026-04-26.md) |
| F-AUD27-02 | LOW | spec/18-spec-issues/06-app-folder-audit-2026-04-26.md | Resolved | [`spec/18-spec-issues/09-app-folder-re-audit-2026-04-26.md`](./18-spec-issues/09-app-folder-re-audit-2026-04-26.md) |
| F-AUD27-03 | LOW | spec/18-spec-issues/06-app-folder-audit-2026-04-26.md | Resolved | [`spec/18-spec-issues/09-app-folder-re-audit-2026-04-26.md`](./18-spec-issues/09-app-folder-re-audit-2026-04-26.md) |
| F-AUD30-01 | MED | spec/18-spec-issues/10-content-audit-endpoints-and-db-diagram.md | Resolved | SSE event vocabulary fix in same pass — see [`spec/18-spec-issues/10-content-audit-endpoints-and-db-diagram.md`](./18-spec-issues/10-content-audit-endpoints-and-db-diagram.md) |
| F-AUD30-02 | LOW | spec/18-spec-issues/10-content-audit-endpoints-and-db-diagram.md | Resolved | [`spec/18-spec-issues/10-content-audit-endpoints-and-db-diagram.md`](./18-spec-issues/10-content-audit-endpoints-and-db-diagram.md) |
| F-AUD30-03 | LOW | spec/18-spec-issues/10-content-audit-endpoints-and-db-diagram.md | Resolved | [`spec/18-spec-issues/10-content-audit-endpoints-and-db-diagram.md`](./18-spec-issues/10-content-audit-endpoints-and-db-diagram.md) |
| F-AUD30-07 | MED | spec/18-spec-issues/11-content-audit-at-app-coverage.md | Resolved | Canonical 9-name SSE event set restored — see [`spec/18-spec-issues/11-content-audit-at-app-coverage.md`](./18-spec-issues/11-content-audit-at-app-coverage.md) |
| F-AUD30-09 | LOW | spec/18-spec-issues/11-content-audit-at-app-coverage.md | Resolved | [`spec/18-spec-issues/11-content-audit-at-app-coverage.md`](./18-spec-issues/11-content-audit-at-app-coverage.md) |

**Open count:** 0 — **Resolved:** 8

---

## Implementation-side findings (`F-IMPL-AUD-NN`)

Audit-v8 (spec-vs-impl, 2026-04-29) raised these against the `src/` scaffold.
Implementation findings are **deferred** until the user issues `exit spec-only`
or `go for implementation`. They are recorded here for traceability.

| ID | Severity | Subject | Status | Notes |
|---|---|---|---|---|
| F-IMPL-AUD-02 | HIGH | `Item.sortOrder: number` violates ADR-0016 (must be base-62 string) | Resolved | Closed under `exit spec-only` exception (AUD-02 task) — `src/types/index.ts` now exposes branded `SortKey` + `asSortKey()` constructor |
| F-IMPL-AUD-03 | HIGH | `src/main.tsx` uses `BrowserRouter` instead of RRv7 data-router (ADR-0023) | Open | Deferred — requires `exit spec-only` |
| F-IMPL-AUD-04 | LOW | `"dashboard"` in `ItemType` allegedly violates ADR-0015 | Retracted | Re-read of ADR-0015 confirms `"dashboard"` is canonical (12-type set). AUD-04 task instead formalized `ITEM_TYPES` registry + `assertNeverItemType` exhaustive-switch trap |
| F-IMPL-AUD-05 | MED | `Enter` key collision in `itemRow` scope (`ItemSplit` vs `ItemNewSibling`) | Resolved | AUD-05 task: added `WhenContext` predicate to `HotkeyBinding` + `resolveHotkey()` dispatcher + uniqueness/mutual-exclusion hygiene tests |
| F-IMPL-AUD-06 | LOW | 8 `.gitkeep.ts` files leak into TS pipeline | Open | Deferred — requires `exit spec-only`; rename to `.gitkeep` |

---

## Update protocol

1. **Adding a new finding:** append a row in the matching family table within the same response that introduces the ID. Status starts as `Open` (or `Retracted` if it's a same-pass false positive).
2. **Closing a finding:** flip status to `Resolved`/`Stale`/`Retracted` AND populate the Evidence column with a clickable relative path. Same-day fixes MAY cite the closing commit hash inline.
3. **Never delete rows.** Historical IDs are permanent; closure is by status flip only. Audit cycles depend on this for stale-detection.
4. **Counts at the bottom of each table** MUST be hand-updated to match the rows above. The hygiene gate verifies this arithmetic.

---

## Related

- [`spec/_AUDIT-EXEMPTIONS.md`](./_AUDIT-EXEMPTIONS.md) — granted exemptions per ADR-0030
- [`spec/_GATE-REGISTRY.md`](./_GATE-REGISTRY.md) — every CI gate
- [`spec/_GATE-GRADUATION-LEDGER.md`](./_GATE-GRADUATION-LEDGER.md) — warn→strict graduation history (ADR-0031)
- [`spec/00-scoping.md`](./00-scoping.md) — folder scoping SSOT (closes F-AUDIT-28)
- [`spec/18-spec-issues/00-overview.md`](./18-spec-issues/00-overview.md) — per-folder audit dashboard
- [`/mnt/documents/spec-ai-implementability-audit-v7.json`](../mnt/documents/spec-ai-implementability-audit-v7.json) — v7 audit artifact (raised F-AUDIT-30)
- [`mem://index.md`](mem://index.md) — Core rules referencing this ledger
