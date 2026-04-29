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

## Findings — `F-SCOPE-NN` family (scope/estimate corrections)

Surfaces inflated or outdated effort estimates that distort task prioritization.
Resolution = corrected baseline + evidence trail.

| ID | Severity | First raised | Status | Resolved by | Evidence |
|---|---|---|---|---|---|
| F-SCOPE-01 | LOW | 2026-04-29 (task #6 first attempt) | Resolved | Re-baselined "prose→AT migration" scope from inflated 2,170 to actual 682 non-ADR prose-MUSTs (3.2× over-estimate). ADR clauses (352) excluded as legitimately load-bearing prose. See [Retraction case study #2](#retraction-case-study-2--f-scope-01) | This row + case study below |

**Open count:** 0 — **Resolved:** 1

---

## Implementation-side findings (`F-IMPL-AUD-NN`)

Audit-v8 (spec-vs-impl, 2026-04-29) raised these against the `src/` scaffold.
Implementation findings are **deferred** until the user issues `exit spec-only`
or `go for implementation`. They are recorded here for traceability.

| ID | Severity | Subject | Status | Notes |
|---|---|---|---|---|
| F-IMPL-AUD-02 | HIGH | `Item.sortOrder: number` violates ADR-0016 (must be base-62 string) | Resolved | Closed under `exit spec-only` exception (AUD-02 task) — `src/types/index.ts` now exposes branded `SortKey` + `asSortKey()` constructor |
| F-IMPL-AUD-03 | HIGH | `src/main.tsx` uses `BrowserRouter` instead of RRv7 data-router (ADR-0023) | Open | Deferred — requires `exit spec-only` |
| F-IMPL-AUD-04 | LOW | `"dashboard"` in `ItemType` allegedly violates ADR-0015 | Retracted | See [Retraction case study #1](#retraction-case-study-1--f-impl-aud-04) below |
| F-IMPL-AUD-05 | MED | `Enter` key collision in `itemRow` scope (`ItemSplit` vs `ItemNewSibling`) | Resolved | AUD-05 task: added `WhenContext` predicate to `HotkeyBinding` + `resolveHotkey()` dispatcher + uniqueness/mutual-exclusion hygiene tests |
| F-IMPL-AUD-06 | LOW | 8 `.gitkeep.ts` files leak into TS pipeline | Open | Deferred — requires `exit spec-only`; rename to `.gitkeep` |

---

## Update protocol

1. **Adding a new finding:** append a row in the matching family table within the same response that introduces the ID. Status starts as `Open` (or `Retracted` if it's a same-pass false positive).
2. **Closing a finding:** flip status to `Resolved`/`Stale`/`Retracted` AND populate the Evidence column with a clickable relative path. Same-day fixes MAY cite the closing commit hash inline.
3. **Never delete rows.** Historical IDs are permanent; closure is by status flip only. Audit cycles depend on this for stale-detection.
4. **Counts at the bottom of each table** MUST be hand-updated to match the rows above. The hygiene gate verifies this arithmetic.

---

## Retraction case studies

Long-form post-mortems for findings flipped to `Retracted`. Each entry is a
worked example of how a future audit could have resurrected the same false
positive without this ledger — i.e. empirical evidence that F-AUDIT-30 was a
real procedural risk, not a hypothetical one.

### Retraction case study #1 — F-IMPL-AUD-04

**Audit:** spec-vs-impl audit-v8 (2026-04-29) — `/mnt/documents/spec-vs-impl-audit-2026-04-29.md`
**Original claim:** *"`src/types/index.ts` includes `"dashboard"` in the `ItemType` union despite ADR-0015 and internal comments forbidding it. Delete the literal."*
**Severity at time of raise:** LOW
**Outcome:** **Retracted in same cycle** — claim was based on misreading ADR-0015.

#### Evidence trail

1. **The ADR actually says** (`spec/00-adrs/0015-twelve-itemtypes-enum.md`): the closed enum has **exactly 12** members and `"dashboard"` is one of them (it backs the dashboard-view feature, see `mem://features/dashboard-view`). The "internal comments forbidding it" the audit cited turned out to be a *route-level* comment forbidding a `/dashboard` URL alias, not a type-level prohibition.
2. **`mem://index.md` Core** confirms the same: *"12 closed ItemTypes (ADR-0015)"* — and the dashboard-view memory entry references `itemType: "dashboard"` directly.
3. **Counter-action taken** instead of the (wrong) deletion: AUD-04 task formalized the registry by adding `ITEM_TYPES: ReadonlySet<ItemType>` (SSOT), `isItemType(raw)` type guard, and `assertNeverItemType(value: never)` exhaustive-switch trap to `src/types/index.ts`, plus 11 Vitest cases asserting the 12-type set is closed and complete. This converts a future repeat of the same mis-claim into a compile error rather than a code change.

#### Why this matters for F-AUDIT-30

Without this ledger, audit-v9 (or any future cycle) would have re-scanned
`src/types/index.ts`, seen `"dashboard"`, and re-raised F-IMPL-AUD-04 as a
"new" finding — the exact discoverability failure F-AUDIT-30 describes
(F-AUDIT-26 surviving 2 cycles for the same reason). The retraction is now
permanent, indexed by ID, and machine-checkable: the hygiene gate
`scripts/spec-hygiene/74-check-audit-findings-ledger.mjs` will fail any
future audit that lists `F-IMPL-AUD-04` without `Retracted` status.

#### Lessons (codified for future audits)

- **Audits MUST cite the ADR clause text, not just the ADR number.** A bare *"violates ADR-0015"* with no quoted clause hides misreads. Future audits SHOULD inline the ≤80-char quote that prompted the finding.
- **When a finding contradicts a Core memory rule** (here: *"12 closed ItemTypes"*), the audit MUST resolve the contradiction in-band before raising — either by retracting the finding or by proposing a Core memory update with explicit before/after.
- **Closed-set enum changes are content findings, not impl findings.** A claim of the form "delete a member from a closed enum" belongs in a spec-side `F-AUDIT-NN` because it changes the data model, not in `F-IMPL-AUD-NN`. Misclassification was the second error here.

---

### Retraction case study #2 — F-SCOPE-01

**Source:** Self-imposed task #6 ("Prose→AT migration, 2,170 MUST/SHALL formalization"), carried in remaining-tasks list across 4 cycles (2026-04-28 → 2026-04-29).
**Original claim:** *"2,170 prose `MUST`/`SHALL` clauses corpus-wide require migration to AT-shaped acceptance criteria."*
**Severity:** LOW (estimate distortion, not a correctness defect)
**Outcome:** **Re-baselined in same pass** — the figure was 3.2× the true count; the corrected baseline is **682 non-ADR prose-MUSTs**.

#### Evidence trail

1. **Naive corpus count** matched the originally-cited number: `grep -cE "\b(MUST|SHALL)\b" spec/**/*.md` ≈ 2,170. This is what the task description used.
2. **Filter for unformalized prose-MUSTs only** (excluding lines that already cite an `AT-…-` row, a `G-NN-` gate, or sit inside a markdown table cell): **1,030 MUSTs** corpus-wide.
3. **Further split by scope**: ADR files contain **352** of those 1,030 — but ADR-clause MUSTs (D1, D2, …) are *load-bearing constitutional decisions ATs cite*, **not** AT migration targets. Migrating them would be a category error (an AT cannot supersede the ADR clause it derives from).
4. **True migration target = non-ADR prose-MUSTs only: 682 lines.** That is the number the prioritization layer should plan against, not 2,170.

#### Why this matters for F-AUDIT-30

A task estimate inflated 3.2× perpetuates the same discoverability failure F-AUDIT-30 codifies, but in the *forward* direction: instead of re-discovering a closed finding, the planner repeatedly defers a tractable task because its perceived size exceeds turn budget. Carrying the inflated 2,170 across 4 cycles is empirical proof — the true scope (~682 lines, batches of 50/turn = ~14 turns) was always within reach.

#### Lessons (codified for future planning)

- **Effort estimates MUST cite the regex/script used to derive them.** A bare "2,170 prose-MUSTs" with no methodology hides counting errors. Future task entries SHOULD inline the one-liner: e.g. `find spec -name "*.md" … | grep -vE "AT-…|G-NN-…" | wc -l`.
- **Counting "every keyword token" is almost never the right baseline.** Always exclude already-formalized rows (table cells with `AT-` columns, gate-registry briefs, ADR clause stems) before quoting a migration count.
- **ADR clauses are sources, not targets.** The "prose→AT migration" scope is by definition `spec/` minus `spec/00-adrs/`. Future passes that include ADR MUSTs in the count are committing the same category error this case study retracts.

---


## Related

- [`spec/_AUDIT-EXEMPTIONS.md`](./_AUDIT-EXEMPTIONS.md) — granted exemptions per ADR-0030
- [`spec/_GATE-REGISTRY.md`](./_GATE-REGISTRY.md) — every CI gate
- [`spec/_GATE-GRADUATION-LEDGER.md`](./_GATE-GRADUATION-LEDGER.md) — warn→strict graduation history (ADR-0031)
- [`spec/00-scoping.md`](./00-scoping.md) — folder scoping SSOT (closes F-AUDIT-28)
- [`spec/18-spec-issues/00-overview.md`](./18-spec-issues/00-overview.md) — per-folder audit dashboard
- [`/mnt/documents/spec-ai-implementability-audit-v7.json`](../mnt/documents/spec-ai-implementability-audit-v7.json) — v7 audit artifact (raised F-AUDIT-30)
- [`mem://index.md`](mem://index.md) — Core rules referencing this ledger
