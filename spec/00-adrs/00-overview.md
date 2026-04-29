# Architecture Decision Records (ADRs)

> **Version:** 1.1.0
> **Created:** 2026-04-28 · **Updated:** 2026-04-29 — added AI Contract block + Scoring table (audit issue #9: missing Scoring table; broader fix: full AI Contract was absent).
> **Status:** ✅ SSOT — every load-bearing scope/architecture decision lives here.

---

## AI Contract

**Purpose** — Lock load-bearing scope/architecture decisions in append-only ADR files so spec gates (`G-04-*`, `G-13-*`, `G-00-ADR-*`) have a stable referent and silent drift is impossible.

**Audience** — Spec authors, reviewers, and any AI implementer asked to "amend the rule" before changing code.

**Expected AI Output** —
- `spec/00-adrs/NNNN-kebab-case-title.md` with the 8 required sections (see "Required sections" below)
- Updated `## Index` table in this file **and** the rollup table in `spec/00-overview.md` — both in the same change

**Out of Scope** —
- Implementation code — see the spec section the ADR locks (e.g. `spec/04-database-conventions/`)
- Cosmetic copy edits, single-subsection clarifications, and tooling preferences with no `G-*` gate attached

**Definition of Done** —
- New file passes gates `G-00-ADR-SHAPE`, `G-00-ADR-NUMBERING`, `G-00-ADR-STATUS`, `G-00-ADR-SUPERSEDE`
- If superseding, the older ADR's `## Status` flips to `Superseded by ADR-NNNN` in the **same** change
- Both index tables (`spec/00-adrs/00-overview.md` §Index + `spec/00-overview.md` rollup) are updated in lock-step
- `node scripts/spec-hygiene/00-run-all.mjs` exits 0

### Scoring

| Dimension | Weight | Criterion |
|---|---:|---|
| Section completeness | 30 | All 8 required sections present in declared order |
| Status correctness | 20 | `Status` is one of 5 enum values; `Accepted` required for any `G-*` citation |
| Numbering integrity | 15 | Zero-padded 4-digit, monotonic, never reused |
| Supersede lock-step | 15 | New ADR + older ADR's status update land in the same commit |
| Index freshness | 10 | Both index tables match files on disk |
| Alternatives rigour | 10 | `## Alternatives Considered` lists ≥2 options with rejection rationale |

> Authoring rules: see [`spec/01-spec-authoring-guide/18-ai-contract-template.md`](../01-spec-authoring-guide/18-ai-contract-template.md).

---

## Purpose

An **ADR** captures a single, load-bearing decision that constrains future
work. ADRs exist to:

1. **Lock in** decisions referenced by spec gates (e.g.
   `G-04-ALIAS-DDL-CANONICAL`, `G-13-CACHE-KEY`).
2. **Block silent drift** — any change to a locked decision **MUST** first be
   ratified by superseding the existing ADR with a new one.
3. **Provide an audit trail** that survives spec rewrites and refactors.

> **Golden Rule:** if a spec page says *"MUST first amend via ADR"*, that
> phrase is enforceable **only** because this directory exists. Removing or
> renaming an ADR file is itself a breaking change.

---

## When to write an ADR

Write an ADR when **any** of these is true:

| Trigger | Example |
|---|---|
| Decision is referenced by a spec **Gate ID** | `G-04-NO-DDL-PLURALS` → must trace to ADR |
| Decision **forbids** a class of solutions | "No `EP-FAVORITES-*` endpoints" |
| Decision picks one runtime / framework / pattern over alternatives | WP plugin + SQLite over Supabase |
| Decision changes a previously-ratified ADR | New ADR that **supersedes** the old |
| Decision affects **two or more** sections under `spec/` | Cross-cutting naming, casing, envelope shape |

**Do NOT** write an ADR for:

- Cosmetic copy edits or typo fixes.
- Decisions confined to a single subsection overview (use the overview's
  own "Worked Example" / anti-pattern table instead).
- Tooling preferences that have no spec gate attached.

---

## File naming & numbering

```
spec/00-adrs/NNNN-kebab-case-title.md
```

- `NNNN` is a **zero-padded 4-digit** monotonically increasing integer
  starting at `0001`.
- Numbers are **never reused**, even if an ADR is rejected or superseded.
- Title is **kebab-case**, ≤ 8 words, present tense, declarative
  (e.g. `0001-singular-ddl-vs-plural-prose.md`,
  `0007-wp-plugin-over-supabase.md`).

---

## Required sections

Every ADR file **MUST** contain these sections, in order, using the exact
headings shown:

1. `# ADR-NNNN: Title`
2. `## Status` — one of `Proposed`, `Accepted`, `Superseded by ADR-NNNN`,
   `Rejected`, `Deprecated`. Include the date.
3. `## Context` — what problem / pressure forced this decision.
4. `## Decision` — the rule, in imperative voice. **MUST/MUST NOT** wording.
5. `## Consequences` — positive **and** negative effects, listed separately.
6. `## Alternatives Considered` — at least 2 alternatives + why each was rejected.
7. `## Gates Touched` — explicit list of `G-*` IDs (or `(none yet)`),
   plus any endpoints / DDL identifiers this ADR locks.
8. `## Supersedes / Superseded-By` — cross-reference (or `(none)`).

Deviating from the heading list breaks the gate `G-00-ADR-SHAPE`
(see "Enforcement gates" below).

---

## Status lifecycle

```
            ┌──────────────┐
            │  Proposed    │   (draft, not load-bearing yet)
            └──────┬───────┘
                   │ review + acceptance
                   ▼
            ┌──────────────┐
            │  Accepted    │   (load-bearing; gates may reference it)
            └──┬────────┬──┘
               │        │
       reject  │        │ replaced by newer decision
               ▼        ▼
       ┌──────────┐  ┌─────────────────────────┐
       │ Rejected │  │ Superseded by ADR-NNNN  │
       └──────────┘  └─────────────────────────┘
                              │
                              ▼
                       ┌──────────────┐
                       │ Deprecated   │ (kept for history; do not cite)
                       └──────────────┘
```

- `Proposed` ADRs **MUST NOT** be cited by spec gates.
- `Accepted` is the only status that authorises a `G-*` reference.
- `Superseded` ADRs remain on disk forever; the superseding ADR points back
  with `## Supersedes: ADR-NNNN`.

---

## Worked Example

Suppose someone wants to add a real `Favorite` table (currently forbidden by
`G-04-ALIAS-DDL-CANONICAL` + ADR-0001).

✅ **Correct path**

1. Author `spec/00-adrs/0042-promote-favorite-to-table.md` with
   `Status: Proposed`.
2. Fill all 8 required sections; under `Supersedes` list `ADR-0001`.
3. After acceptance, flip `Status: Accepted` and update ADR-0001 to
   `Status: Superseded by ADR-0042`.
4. Update `spec/04-database-conventions/00-overview.md` alias bridge,
   add new gate `G-04-FAVORITE-TABLE`, add `EP-FAVORITES-*` endpoints.

❌ **Anti-patterns** (each fails CI gate `G-00-ADR-SHAPE` or
`G-04-ALIAS-DDL-CANONICAL`)

| Anti-pattern | Why it fails |
|---|---|
| Quietly adding `EP-FAVORITES-LIST` without an ADR | Bypasses the alias-bridge lock |
| Editing ADR-0001 in place to allow the new table | ADRs are append-only after `Accepted` |
| Reusing number `0001` for the new ADR | Numbers are never reused |
| Skipping `## Alternatives Considered` | Required section missing → gate fails |
| Citing a `Proposed` ADR from a gate | Only `Accepted` ADRs are load-bearing |

---

## Enforcement gates

| Gate ID | Rule |
|---|---|
| `G-00-ADR-SHAPE` | Every file under `spec/00-adrs/NNNN-*.md` MUST contain the 8 required sections in order. |
| `G-00-ADR-NUMBERING` | Numbers MUST be zero-padded 4-digit, monotonic, never reused. |
| `G-00-ADR-STATUS` | `Status` MUST be one of the 5 enum values; `Accepted` required for any `G-*` reference. |
| `G-00-ADR-SUPERSEDE` | A new ADR that supersedes another MUST update the older ADR's status in the **same** change. |

---

## Index (manually maintained — see protocol)

> **Status note:** "auto-maintained" is aspirational. Until CI gate
> `G-00-ADR-INDEX-FRESH` ships, this index is **manually maintained on
> every ADR-touching commit** per the binding protocol in
> [`_INDEX_AUTOMATION.md`](./_INDEX_AUTOMATION.md). If this table
> disagrees with the files on disk, **the files win**.

| ADR | Title | Status | Date |
|---|---|---|---|
| [`0001`](./0001-singular-ddl-vs-plural-prose.md) | Singular DDL vs plural prose | `Accepted` | 2026-04-28 |
| [`0002`](./0002-wp-plugin-php-sqlite-backend.md) | WordPress plugin + PHP 8.1+ + SQLite as the sole backend runtime | `Accepted` | 2026-04-28 |
| [`0003`](./0003-react-19-ts-strict-frontend.md) | Vite 5.4 + React 19 + TypeScript 5.6 (strict) + Tailwind v4 as the sole frontend stack | `Accepted` | 2026-04-28 |
| [`0004`](./0004-rest-envelope-pascalcase.md) | REST envelope — PascalCase keys, three mandatory + three optional | `Accepted` | 2026-04-28 |
| [`0005`](./0005-mirror-as-peer-group.md) | Mirror is a peer-group relation, not an ItemType | `Accepted` | 2026-04-28 |
| [`0006`](./0006-migrate-spec-sql-to-singular-ddl.md) | Migrate spec SQL fragments to singular DDL identifiers | `Accepted` | 2026-04-28 |
| [`0007`](./0007-strict-typescript-rules.md) | Strict TypeScript coding rules (zero `any`, max 3 params, no nested `if`s, 15-line logic limit, positive guards) | `Accepted` | 2026-04-28 |
| [`0008`](./0008-unified-item-node-interface.md) | Unified `Node` interface + 250-item per-view limit | `Accepted` | 2026-04-28 |
| [`0009`](./0009-trash-30-day-retention.md) | Trash — 30-day retention, soft-delete, daily reaper at 03:00 UTC, batch=1000 | `Accepted` | 2026-04-28 |
| [`0010`](./0010-offline-fifo-replay-queue.md) | Offline FIFO replay queue (IndexedDB) + server-stamped LWW reconciliation | `Accepted` | 2026-04-28 |
| [`0011`](./0011-axios-only-http-client.md) | Axios is the sole HTTP client — pinned to `1.14.0` or `0.30.3` exact | `Accepted` | 2026-04-28 |
| [`0012`](./0012-tailwind-v4-theme-block-token-registry.md) | Tailwind v4 `@theme` block is the sole design-token registry; HSL-only; no raw colors | `Accepted` | 2026-04-28 |
| [`0013`](./0013-search-relevance-then-recency-ranking.md) | Search ranking — hybrid relevance-then-recency, tiered match × field weight, sub-300 ms SLA | `Accepted` | 2026-04-28 |
| [`0014`](./0014-sharing-public-vs-invited-permission-model.md) | Sharing — public link + invited user, 5-role item ACL, separate-table roles, per-instance mirror ACL | `Accepted` | 2026-04-28 |
| [`0015`](./0015-twelve-itemtypes-enum.md) | Twelve `ItemType` enum values — closed set, lowercase, mirror-excluded | `Accepted` | 2026-04-28 |
| [`0016`](./0016-fractional-index-sortorder.md) | Fractional-index `SortOrder` — lexicographic string, base-62, midpoint split, per-parent rebalance | `Accepted` | 2026-04-28 |
| [`0017`](./0017-eight-error-boundaries-ui-virtualization.md) | Eight independent UI error boundaries + 1000-item virtualization (`@tanstack/react-virtual`) | `Accepted` | 2026-04-28 |
| [`0018`](./0018-react-router-v7-data-router-and-lucide-react-only.md) | React Router v7 data-router API + `lucide-react` as the sole icon source | `Accepted` | 2026-04-28 |
| [`0019`](./0019-rest-envelope-optional-keys.md) | REST envelope optional keys — `Navigation`/`Errors`/`MethodsStack` omit-never-null + page-based pagination | `Accepted` | 2026-04-28 |
| [`0020`](./0020-branded-itemid-ownerid.md) | Branded `ItemId`/`OwnerId` — opaque-string brands, validating constructors, wire regex `^[A-Za-z0-9_-]{8,64}$` | `Accepted` | 2026-04-28 |
| [`0021`](./0021-undo-100-offline-queue-unbounded.md) | Undo/redo cap 100 (in-memory, per-tab) + offline queue UNBOUNDED (IndexedDB per ADR-0010, no `localStorage`) | `Accepted` | 2026-04-28 |
| [`0022`](./0022-shadcn-radix-component-base.md) | shadcn/ui (CLI-vendored under `src/components/ui/`) + Radix primitives — sole component base; MUI/Mantine/Ant/HeadlessUI/Chakra forbidden | `Accepted` | 2026-04-28 |
| [`0023`](./0023-route-loaders-offline-queue-interaction.md) | Route loaders ↔ offline FIFO queue contract — local-mirror-first reads, action-only egress, cold-offline shell, reconnect lock | `Accepted` | 2026-04-28 |
| [`0024`](./0024-ratify-soft-confirm-triage-rulings.md) | Ratify 3 soft-confirm triage rulings (#01 audit-frozen, #03 DDL-singular-locked, #17 favorites-table-only) | `Accepted` | 2026-04-28 |
| [`0025`](./0025-sse-realtime-transport.md) | Server-Sent Events as the sole realtime transport — `/stream/page` + `/stream/user`, PascalCase frames, `Last-Event-ID` replay, read-only signal | `Accepted` | 2026-04-28 |
| [`0026`](./0026-lww-canonical-tiebreak.md) | Canonical LWW tie-break — single 3-tier comparator `(ServerTs DESC, OwnerId ASC, ItemId ASC)`; collapses ADR-0005/0010/0016 drift; `OwnerUserId` aliased to `OwnerId` | `Accepted` | 2026-04-28 |
| [`0027`](./0027-sse-multiworker-shared-ring-buffer.md) | SSE multi-worker shared ring buffer — `SseRing` SQLite WAL table replaces per-process buffer; closes ADR-0025 multi-PHP-FPM gap (AUDIT-06) | `Accepted` | 2026-04-28 |
| [`0028`](./0028-i18n-locale-strategy.md) | i18n locale strategy — `react-i18next` + `i18next-icu`; 5-tier locale detection; explicit fallback chain; RTL via logical Tailwind props; typed keys via TS module augmentation | `Accepted` | 2026-04-28 |

> **Maintenance rule (summary — full protocol in [`_INDEX_AUTOMATION.md`](./_INDEX_AUTOMATION.md)):**
> when adding/superseding an ADR, update **both** index tables (this one
> **and** the table in [`spec/00-overview.md`](../00-overview.md)) in the
> **same commit** as the ADR file change. `_TEMPLATE.md` and `_LEDGER-*.md`
> files are **excluded** from numbering and from the index.

---

## See also

- `spec/04-database-conventions/00-overview.md` → alias-bridge gates that
  require an ADR for any DDL change.
- `spec/13-cicd-pipeline-workflows/00-overview.md` → CI step that checks
  `G-00-ADR-SHAPE` on every PR touching `spec/00-adrs/`.
