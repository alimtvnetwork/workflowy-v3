# Architecture Decision Records (ADRs)

> **Version:** 1.0.0
> **Created:** 2026-04-28
> **Status:** ✅ SSOT — every load-bearing scope/architecture decision lives here.

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
