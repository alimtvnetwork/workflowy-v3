# ADR Registry Index — Manual Update Protocol

> **Status:** Interim — manual protocol in force until CI gate
> `G-00-ADR-INDEX-FRESH` is implemented.
> **Authored:** 2026-04-28 (P49).
> **Scope:** governs the **Index** table inside
> [`spec/00-adrs/00-overview.md`](./00-overview.md) and the cross-link table
> inside [`spec/00-overview.md`](../00-overview.md) (root spec entrypoint).

---

## Why this file exists

The registry overview (`00-overview.md`) calls the ADR index
"auto-maintained". Until the linting/CI side is built, that maintenance
is **a human responsibility on every ADR-touching commit**. This file is
the binding protocol that closes that gap.

> **Rule of resolution:** if the index disagrees with the actual files on
> disk under `spec/00-adrs/NNNN-*.md`, **the files win**. The index is a
> derived view; the files are the SSOT.

---

## When to update the index

You **MUST** update both index tables in the **same change** as any of:

| Trigger | Action on index |
|---|---|
| Add a new `NNNN-*.md` ADR file | Append a new row with link, title, status, date |
| Change an ADR's `Status` (Proposed → Accepted, Accepted → Superseded, …) | Update the `Status` cell in the existing row |
| Supersede an existing ADR | Update **both** rows: the new ADR's row *and* flip the old ADR's status to `Superseded by ADR-NNNN` |
| Reject a `Proposed` ADR | Update the row's `Status` to `Rejected`; do **not** delete the row, do **not** reuse the number |
| Deprecate an `Accepted` ADR with no successor | Update `Status` to `Deprecated`; row remains for history |

You **MUST NOT** update either index for:

- Cosmetic edits to an ADR's body (typos, link fixes, formatting).
- Adding/removing the `_TEMPLATE.md` file (excluded from numbering and
  from the index).
- Adding ledger files prefixed with `_` (e.g.
  `_LEDGER-P48-PLURAL-DDL-SWEEP.md`) — these are informational, not ADRs.

---

## The two index tables

There are exactly **two** index surfaces that must stay in sync. Any
others are derivative documentation and do not need updating in lockstep.

### 1. `spec/00-adrs/00-overview.md` → "Index" section

Source of truth for **all** ADR rows. Required columns, in order:

| ADR | Title | Status | Date |

- `ADR` cell **MUST** be a markdown link
  `[``NNNN``](./NNNN-kebab-case-title.md)`.
- `Status` cell **MUST** be one of the 5 enum values from the lifecycle
  (`Proposed`, `Accepted`, `Superseded by ADR-NNNN`, `Rejected`,
  `Deprecated`) wrapped in backticks.
- `Date` cell is the most recent **status transition** date (ISO
  `YYYY-MM-DD`).

### 2. `spec/00-overview.md` → "🏛️ Architecture Decision Records (ADRs)" section

Discoverability surface for the root spec. Required columns:

| ADR | Title | Status | Anchors (selected) |

- Same `ADR` and `Title` rules as above; relative paths use `./00-adrs/…`.
- `Status` cell **MUST** include both the value and the date
  (e.g. `` `Accepted` 2026-04-28 ``).
- `Anchors (selected)` cell lists the most load-bearing gate IDs / endpoint
  families locked by the ADR — pulled from the ADR's own
  `## Gates Touched` section. Do not list every gate; list the 2–4 most
  consequential.

---

## Step-by-step: adding a new ADR

1. **Reserve the next number.** `ls spec/00-adrs/[0-9]*.md | sort` →
   pick the next zero-padded 4-digit integer above the highest existing.
   **Never reuse** a number, even from a `Rejected` ADR.
2. **Create the file** by copying `_TEMPLATE.md` to
   `NNNN-kebab-case-title.md` and filling all 8 mandatory sections.
3. **Decide initial status.** New ADRs almost always start at `Proposed`.
   If the decision has already been ratified out-of-band (e.g. lifted
   from `mem://`), `Accepted` with the lift date is acceptable — note
   the source in `## Context`.
4. **Update `spec/00-adrs/00-overview.md`** Index — append the row.
5. **Update `spec/00-overview.md`** ADR section — append the row.
6. **(If superseding)** Edit the older ADR's `## Status` block and the
   `Status` cell in **both** index tables to
   `Superseded by ADR-NNNN`. Also update the older ADR's
   `## Supersedes / Superseded-By` → `Superseded-By: ADR-NNNN`.

All six steps **MUST** land in a single change. Splitting them across
commits leaves the index stale and trips reviewers.

---

## Worked Example — promoting `Favorite` from column to table

Hypothetical: a future contributor wants a real `Favorite` table.

1. `ls spec/00-adrs/[0-9]*.md | sort` → highest is currently `0002`,
   so reserve `0042` (skipping numbers is fine; uniqueness matters,
   density doesn't).
2. `cp spec/00-adrs/_TEMPLATE.md spec/00-adrs/0042-promote-favorite-to-table.md`.
3. Fill 8 sections; `Status: Proposed` 2026-MM-DD; `Supersedes: ADR-0001`.
4. Edit `spec/00-adrs/00-overview.md` Index — add row for ADR-0042.
5. Edit `spec/00-overview.md` ADR section — add row for ADR-0042.
6. *On acceptance:* flip ADR-0042 status to `Accepted`; flip ADR-0001
   status to `Superseded by ADR-0042` in **both** index tables and in
   ADR-0001's `## Status` and `## Supersedes / Superseded-By` blocks.

---

## Anti-Pattern Table

| Anti-pattern | Why it fails | Future gate |
|---|---|---|
| Adding a new ADR file but not updating either index | Reviewers and AI agents miss the new decision | `G-00-ADR-INDEX-FRESH` (planned) |
| Updating only `00-adrs/00-overview.md` and forgetting the root entrypoint | Root spec discoverability breaks | `G-00-ADR-INDEX-FRESH` (planned) |
| Reusing a `Rejected` ADR's number for a new ADR | Breaks ADR-NNNN citation stability across history | `G-00-ADR-NUMBERING` |
| Deleting a `Superseded` row from the index | Erases decision history; future readers can't trace why something was overturned | `G-00-ADR-SHAPE` |
| Citing a `Proposed` ADR from a `G-*` gate | `Proposed` is not load-bearing; only `Accepted` may anchor gates | `G-00-ADR-STATUS` |
| Listing `_TEMPLATE.md` or `_LEDGER-*.md` in the index | These are not ADRs and do not get numbers | `G-00-ADR-NUMBERING` |
| Updating one index table but not the other | The two surfaces diverge; readers see different statuses | `G-00-ADR-INDEX-FRESH` (planned) |
| Recording a status flip without the date | Loses audit trail; can't tell when the rule changed | `G-00-ADR-SHAPE` |
| Citing an external file (e.g. `.lovable/question-and-ambiguity/00-triage-summary.md`) from an ADR's Decision section without a reciprocal back-link from that file to the ADR's anchor (`§Dn`) | Cross-references rot one-way; readers landing on the external file can't tell the soft-confirm has been ratified, risking accidental reversal | `G-00-ADR-XLINK-SYMMETRY` (planned) |

---

## Future automation (planned, not yet active)

When `G-00-ADR-INDEX-FRESH` ships under
`spec/13-cicd-pipeline-workflows/`, it **MUST**:

1. Parse every `spec/00-adrs/NNNN-*.md` (ignoring `_*.md` and the
   overview itself), extract `Status` + title from frontmatter or first
   `# ADR-NNNN:` heading.
2. Diff against the table rows in `spec/00-adrs/00-overview.md` and
   `spec/00-overview.md` "🏛️ Architecture Decision Records (ADRs)"
   section.
3. Fail CI on **any** divergence: missing row, stale status, wrong date,
   wrong link target.
4. Be advisory-only for the `Anchors (selected)` cell (humans curate
   "selected"; the gate cannot judge selection quality).

Until then: **this file is the gate**. Reviewers consult it on every PR
that touches `spec/00-adrs/`.

### `G-00-ADR-XLINK-SYMMETRY` (planned)

**Tier:** DOC-NORM (mechanizable to CI when shipped under
`spec/13-cicd-pipeline-workflows/`).

**Scope.** Every link from an `Accepted` ADR's Decision section
(`## Decision` and the `**Dn —**` clauses beneath it) to a non-ADR file
inside the repo (e.g. `.lovable/question-and-ambiguity/*.md`,
`spec/04-database-conventions/*.md`, fixture files) MUST have a
**reciprocal back-link** from the linked anchor (or the file's banner
section if no anchor is targeted) back to the ADR's `§Dn` clause.

**Algorithm (when mechanized).**

1. For every file `spec/00-adrs/NNNN-*.md` with `Status: Accepted`:
   a. Parse the `## Decision` section.
   b. Extract every Markdown link of the form `[text](path#anchor)`
      whose `path` resolves to a file **outside** `spec/00-adrs/`.
   c. Record the tuple `(adr_number, dn_clause, target_path,
      target_anchor)`.
2. For every recorded target file:
   a. Read its full text.
   b. Assert at least one link of the form
      `[text](…/00-adrs/NNNN-…md#dn-anchor)` or a prose mention
      `Ratified by ADR-NNNN §Dn` exists at or above the recorded
      `target_anchor` heading. If `target_anchor` is empty, the
      back-link MUST appear in the file's first H2 section.
3. Fail CI listing any one-way link with the recommended fix
   (`add reciprocal: in <target_path> add ">  Ratified by [ADR-NNNN
   §Dn](…)"`).

**Exemptions.**

- Links from ADR `## Context` or `## Consequences` sections (these are
  citations, not load-bearing decisions).
- Links to spec files in `spec/00-adrs/` (intra-ADR cross-refs are
  governed by `G-00-ADR-INDEX-FRESH`).
- Links to external URLs (`https://…`) — not under repo control.

**Reference implementation precedent.** ADR-0024 §§ D1/D2/D3 link to
`.lovable/question-and-ambiguity/00-triage-summary.md` `### #01/#03/#17`,
which in turn each carry an inline
`> ✅ Ratified by [ADR-0024 §Dn](…)` blockquote (added 2026-04-28). This
is the canonical "symmetric round-trip" shape the gate enforces.

**Frozen reference algorithm:**
[`spec/13-cicd-pipeline-workflows/scripts-as-spec/xlink-symmetry-audit.md`](../13-cicd-pipeline-workflows/scripts-as-spec/xlink-symmetry-audit.md)
captures the load-bearing algorithm + exemptions + Phase-2 strictness
roadmap. Any CI implementation MUST be derived from that fixture.

**Baseline ledger:**
[`spec/00-adrs/_LEDGER-G-00-ADR-XLINK-SYMMETRY-BASELINE.md`](./_LEDGER-G-00-ADR-XLINK-SYMMETRY-BASELINE.md)
documents the 4 known-good symmetric pairs as of 2026-04-28; future
audit runs MUST be diffable against it.

**Until shipped: this file + the fixture-as-spec are the gate.** PR
reviewers MUST manually verify symmetry whenever an ADR Decision
section adds an outbound link, and MUST update the baseline ledger in
the same PR.

---

## See also

- [`spec/00-adrs/00-overview.md`](./00-overview.md) — registry SSOT,
  status lifecycle, 8 required sections, enforcement gates.
- [`spec/00-adrs/_TEMPLATE.md`](./_TEMPLATE.md) — copy this file when
  adding a new ADR; **excluded** from the index.
- [`spec/00-adrs/_LEDGER-P48-PLURAL-DDL-SWEEP.md`](./_LEDGER-P48-PLURAL-DDL-SWEEP.md)
  — example of an `_`-prefixed ledger file (informational, not an ADR,
  not in the index).
