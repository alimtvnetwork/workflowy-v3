# Acceptance-Criteria I/O Table — Authoring Guide

> **Version:** 1.1.0
> **Created:** 2026-04-28 (UTC+8)
> **Updated:** 2026-04-30 — Bound 5 prose-MUSTs to new `G-AT-IO-*` namespace gates (batch-35).
> **Status:** Normative — all `97-acceptance-criteria.md` files MUST use this format for new criteria; legacy criteria are converted incrementally per plan step **P2**. (Gate `G-AT-IO-FORMAT-MANDATED-ALL`)
> **Parent:** [`00-overview.md`](./00-overview.md)
> **Spawned by:** `.lovable/plans/00-active.md` § P2.

**Reserved Gate IDs (this file):** `G-AT-IO-FORMAT-MANDATED-ALL`, `G-AT-IO-TWO-ROW-PAIRING`, `G-AT-IO-JSON-LITERAL-VALID`, `G-AT-IO-ENVELOPE-CONFORM`, `G-AT-IO-RELATED-ENVELOPE-XLINK` — see [`spec/_GATE-REGISTRY.md`](../_GATE-REGISTRY.md) §Domain-AT-IO.

---

## Purpose

Existing acceptance-criteria rows describe behaviour in prose ("MUST be hashed with Argon2id") (illustrative legacy quote — gate `G-AT-IO-FORMAT-MANDATED-ALL` makes the format mandate normative). That is testable by a human reviewer but **not** by an AI implementer that needs to write the test. P2 closes the gap by requiring every AT row to be paired with a **concrete I/O fixture**: deterministic Given / When / Then plus literal request/response JSON where applicable.

---

## Mandatory format

Every leaf criterion (one that an implementer can write a single test for) MUST appear as **two adjacent rows** in the file (gate `G-AT-IO-TWO-ROW-PAIRING`):

1. The **prose row** (legacy two-column shape: `ID | Criterion | Source`) — kept verbatim for back-references.
2. A **fixture block** immediately under the prose row, using the canonical I/O table below.

### Canonical I/O block

```markdown
> **`AT-XYZ-NN` fixture**
>
> | Slot | Value |
> |------|-------|
> | **Given** (preconditions) | `<state literal — DB rows, session, env, feature flags>` |
> | **When** (action under test) | `<HTTP verb + path>` OR `<UI gesture: keys, click target>` OR `<function call signature>` |
> | **Request body** | <code-fenced JSON literal — omit row if N/A> |
> | **Then** (expected outcome) | `<observable state change OR response shape>` |
> | **Response envelope** | <code-fenced JSON literal using PascalCase envelope `{ Status, Attributes, Results, Navigation?, Errors?, MethodsStack? }`> |
> | **Side effects** | `<DB writes, emitted events, audit-log entries, cache invalidation>` |
> | **Negative assertion** | `<what MUST NOT happen — e.g. "no row written to AuditLog", "no SSE frame on channel X">` |
```

### Field rules

- **Given / When / Then** — single-line, imperative, no hedging vocabulary (`should`, `may`, `consider` are forbidden inside fixtures; reserve those for the prose row when the rule is genuinely soft).
- **Request body / Response envelope** — when present they MUST be valid JSON literals (parseable by `JSON.parse`) — gate `G-AT-IO-JSON-LITERAL-VALID`. Use realistic example IDs (`"itm_01HXYZ…"`), not `<placeholder>` strings.
- **Response envelope** — MUST conform to `spec/04-database-conventions/06-rest-api-format/` (PascalCase keys, mandatory `Status` / `Attributes` / `Results`) — gate `G-AT-IO-ENVELOPE-CONFORM`.
- **Side effects** and **Negative assertion** — required for any AT that mutates state. For pure read-only or pure-UI ATs, write `none` rather than omitting the row.
- **N/A rows** are collapsed (omit the entire row) only for `Request body` and `Response envelope`. The other five rows are mandatory.

### Two AT shapes that opt out of the JSON rows

| Shape | Example | Replace JSON rows with |
|-------|---------|------------------------|
| Pure UI gesture (no network) | `AT-INTERACT-04` Tab indents | `Visible DOM diff` row showing before/after `outerHTML` snippet (≤ 200 chars) |
| Static-analysis / lint rule | `AT-TYPESCRIPT-05` zero `any` | `Linter command` + `Expected exit code` + `Expected stderr regex` rows |

---

## Worked example (from `spec/31-app/97-acceptance-criteria.md`)

Prose row (unchanged):

```markdown
| `AT-APP-12` | Pressing **Enter** on an item creates a new sibling **after** it; Enter at start with empty content creates a sibling **before**. | `01-features/05-interactions.md` |
```

Fixture block (added directly underneath):

```markdown
> **`AT-APP-12` fixture**
>
> | Slot | Value |
> |------|-------|
> | **Given** | Authenticated user `usr_01`; root has child `itm_A` with content `"hello"`, caret at position 5 (end). |
> | **When** | UI gesture: focus `<ItemRow id="itm_A">`, dispatch `keydown {key:"Enter"}`. |
> | **Then** | A new sibling `itm_B` appears immediately after `itm_A` with empty content; caret is in `itm_B`. |
> | **Side effects** | `POST /wp-json/workflowy/v1/items` body `{ "ParentId": "<root>", "AfterSiblingId": "itm_A", "Content": "" }`; SSE frame `{ "Event":"item.created", "Id":"itm_B" }` on the page channel. |
> | **Negative assertion** | `itm_A` content is unchanged; no row inserted **before** `itm_A`; no row appended at the end of the parent's children list. |
```

---

## Conversion workflow (P2 sub-tasks)

Conversion is sequenced so that the **canonical** AT file in each domain is converted first, then the dispatch / sub-leaf files inherit by reference.

| Sub-task | Scope | Files |
|----------|-------|-------|
| **P2a** | App canonical (highest leverage — cited by 8 endpoint matrix rows) | `spec/31-app/97-acceptance-criteria.md` |
| **P2b** | App per-feature inline AT files | `spec/31-app/01-features/*97-acceptance-criteria.md` and inline `## Acceptance Tests` blocks in feature files |
| **P2c** | REST + DB conventions | `spec/04-database-conventions/**/97-acceptance-criteria.md` |
| **P2d** | UI design + design system | `spec/32-ui-design/**/97-acceptance-criteria.md`, `spec/07-design-system/97-acceptance-criteria.md` |
| **P2e** | User management + roles + sharing + 33 / 34 / 35 / 36 | `spec/33-…`, `spec/34-…`, `spec/35-…`, `spec/36-…` |
| **P2f** | Coding-guidelines, error-manage, plugin how-to (mostly **lint-rule shape** — apply the opt-out variant) | `spec/02-…`, `spec/03-…`, `spec/15-…` |
| **P2g** | Remainder (CI/CD, self-update, CLI, docs viewer, etc.) | everything not covered above |

Each sub-task is one `next` step, runs the spec hygiene script, and closes when every AT row in scope has either a fixture block or an explicit `> _Fixture: N/A — pure narrative reference, not a testable criterion._` opt-out (which the hygiene script accepts).

---

## Companion-file pattern: `97a-acceptance-criteria-fixtures.md`

> **Status:** Normative since 2026-04-29. Closes F-AUDIT-32 (audit v3). Established by precedent in `spec/00-adrs/97a-acceptance-criteria-fixtures.md` (AT-29-* + AT-30-*) and the corpus-wide sweep file `spec/97a-acceptance-criteria-fixtures.md` (P2g).

### When to use a sibling fixture file (vs inline `> **AT-… fixture**` blocks)

Use a sibling `97a-acceptance-criteria-fixtures.md` (placed next to its parent `97-acceptance-criteria.md`) when **any** of the following holds:

1. **Fixture verbosity** — the I/O block(s) for any single AT exceed ~10 lines (multi-row tables, multiple negative fixtures, JSON envelopes >5 keys).
2. **Cross-AT shared setup** — multiple ATs in the same `97-…` file share Given/When state that would otherwise be copy-pasted.
3. **ADR ratification** — ATs that ratify an ADR's invariants (`AT-NN-*` rows tied to `ADR-NNNN`) MUST live in a sibling file so the ADR's `## Consequences` xlinks (`G-00-ADR-CONSEQUENCES-XLINK`) can point at a single canonical fixture entry.
4. **Sweep / pattern catalogue** — when one fixture pattern applies across many sibling specs, prefer the corpus-wide sweep file (`spec/97a-acceptance-criteria-fixtures.md`) over duplicating it per scope.

Use **inline `> **AT-… fixture**` blocks** in the parent `97-…` file when:

- The AT has exactly one Given/When/Then triple, ≤6 lines total, no JSON envelope, and no shared setup with sibling ATs.

### Required shape of `97a-acceptance-criteria-fixtures.md`

| Section | Requirement |
|---------|-------------|
| **Front-matter** | `## Version`, `## Created`, `## Status`, `## Format SSOT` (link back to **this** file), and `## Closes` (cite F-AUDIT-NN or AT-FIX-NN deficit being resolved). |
| **`## Scope` table** | Tabular index of every AT cluster covered: columns `\| AT cluster \| Owning ADR/Spec \| Owning gate(s) \| Section below \|`. |
| **One `## §N — <AT cluster> fixtures` H2 per cluster** | One `### §N.M AT-NN-LABEL` H3 per AT row; each H3 contains the canonical 5-row fixture table from §"Canonical I/O block" above. |
| **`## Verification` block** | Bash snippet listing the gate runner(s) that enforce these fixtures (e.g. `node scripts/spec-hygiene/57-check-…mjs`). |
| **`## Related` block** | Backlink to parent `97-acceptance-criteria.md`, owning ADR(s), owning gate registry rows, format SSOT (this file), and the sweep file `../97a-acceptance-criteria-fixtures.md` (if applicable). |

### Pairing rule (enforced by `AT-FIX-01`)

For every AT row in a parent `97-…` or `98-…` file, the gate accepts ONE of:

- (a) Inline `> **AT-… fixture**` block on the next non-blank line, OR
- (b) Inline `> _Fixture: N/A — pure narrative reference, not a testable criterion._` opt-out, OR
- (c) Parent file links to a sibling `97a-…-fixtures.md` (in `## Related`) OR to a pattern in the corpus-wide `spec/97a-acceptance-criteria-fixtures.md`.

The third path is the **companion-file pattern** formalised in this section.

### Naming + placement

- **Filename:** literally `97a-acceptance-criteria-fixtures.md` (the trailing `a` distinguishes it from `97-acceptance-criteria.md`; no other suffix is permitted).
- **Location:** in the **same directory** as its parent `97-acceptance-criteria.md`. Cross-directory pairings are forbidden — use the sweep file instead.
- **Singleton per scope:** at most one `97a-…` file per directory. Multiple AT clusters share the file via numbered `## §N` sections.

### Discoverability

The parent `97-acceptance-criteria.md` MUST list the companion in its `## Related` section using the literal title `Sibling I/O fixtures for …` so reviewers and the AT-FIX-01 gate can both find it.

---

## Hygiene gate (added in same PR as P2g closure)

`scripts/spec-hygiene/` will gain check **AT-FIX-01**:

> For every line matching `^\| \`AT-[A-Z]+-\d+\``, the next non-blank line MUST be either (a) a `> **\`AT-…\` fixture**` block header, or (b) the explicit `> _Fixture: N/A …_` opt-out line. Otherwise FAIL.

Until P2g lands, the check runs in **report-only** mode and tallies coverage in `.lovable/plans/p2-coverage.md`.

---

## Author Checklist (AC-AUTHOR-RULE-01..04)

> **Status:** Normative since 2026-04-30. Numbered author rules MUST be cited verbatim in PR descriptions when adding/modifying any `97-acceptance-criteria.md` row.

| Rule | Statement | Enforced by |
|---|---|---|
| **AC-AUTHOR-RULE-01** | Every leaf criterion MUST appear as **two adjacent rows**: prose row + canonical I/O fixture block. | `G-AT-IO-TWO-ROW-PAIRING` |
| **AC-AUTHOR-RULE-02** | Request body / Response envelope cells MUST be valid JSON literals (`JSON.parse` clean) using realistic IDs (`"itm_01HXYZ…"`), never `<placeholder>` strings. | `G-AT-IO-JSON-LITERAL-VALID` |
| **AC-AUTHOR-RULE-03** | Response envelope MUST conform to `spec/04-database-conventions/06-rest-api-format/` — PascalCase keys, mandatory `Status`/`Attributes`/`Results`. | `G-AT-IO-ENVELOPE-CONFORM` |
| **AC-AUTHOR-RULE-04** | When authoring an AT fixture from an ADR, the `Given` clause MUST quote the ADR's normative text **verbatim** (copy-paste from the ADR file) before parameterising. Paraphrasing from memory of similar libraries / standards is forbidden — it is the root cause of the ADR-0027/0028 fixture drift retro-closed in `spec/AMBIGUITY-LEDGER.md` 2026-04-29. | `G-GLOSSARY-ADR-PARITY` (sister gate — see below) |

### AC-AUTHOR-RULE-04 — Verbatim-from-ADR (full rule)

**Trigger:** Any new fixture row in `97-acceptance-criteria.md` or `97a-acceptance-criteria-fixtures.md` whose `## Source` cell cites an ADR (`ADR-NNNN`).

**Procedure:**

1. Open the cited ADR file in a side pane.
2. Locate the normative paragraph (usually under `## Decision` or `## Consequences`).
3. Copy the sentence(s) **verbatim** into the fixture's `Given` cell, wrapped in `> ` blockquote markers so the verbatim region is unambiguous to grep.
4. Append parameterisation **after** the blockquote (e.g., concrete IDs, sample values).
5. Cite the ADR file path + section anchor as `<!-- verbatim-from: spec/00-adrs/0027-…md#decision -->` HTML comment on the line below the blockquote.

**Negative — paraphrase forbidden:**

```markdown
> ❌ FORBIDDEN
> | Given | The SSE ring buffer expires entries after about 5 minutes |

> ✅ REQUIRED
> | Given | <!-- verbatim-from: spec/00-adrs/0027-sse-ring-buffer.md#decision -->
> > "Ring TTL = **300 seconds**; reaper runs every **60 seconds**; rows where `CreatedAtUnix < (now - 300)` are deleted."
> > — ADR-0027 §Decision
> > Concrete: 1000 stale rows, p95 purge < 500 ms. |
```

**Why:** The ADR file is the SSOT for normative wording. Paraphrasing decouples the fixture from the ADR's revision history, so when the ADR changes the fixture silently goes stale. Verbatim quoting + the `verbatim-from:` anchor lets `G-GLOSSARY-ADR-PARITY` (and the future `G-AT-IO-VERBATIM-ADR-DRIFT` once promoted) detect drift by hashing the cited substring against the live ADR file.

### Companion gate: `G-GLOSSARY-ADR-PARITY`

**Tier:** DOC-NORM (graduates to LINT once corpus baseline is clean).
**Source:** `scripts/spec-hygiene/78-check-glossary-adr-parity.mjs`.
**Audit invariant:** Every glossary entry in `spec/19-glossary.md` whose `Source` column cites `ADR-NNNN` (24 rows in v1.4.0, all in §"ADR-0023..0028 Runtime Vocabulary") MUST have its definition cell updated in the **same commit** as any change to the cited ADR's `## Decision` or `## Consequences` section. Inverse drift detection: if an ADR's normative section changes without a glossary update, the gate fails with `GLOSSARY_DRIFT: <term>` listing the affected term + ADR + commit-hash mismatch.

**Registered in:** [`spec/_GATE-REGISTRY.md`](../_GATE-REGISTRY.md) §4a.

---

## Related

- `spec/04-database-conventions/06-rest-api-format/` — envelope spec the JSON rows MUST conform to (gate `G-AT-IO-RELATED-ENVELOPE-XLINK` enforces this backlink's presence).
- `spec/01-spec-authoring-guide/14-scoring-metrics.md` — testability + determinism dimensions that this format unblocks (audit projects testability 21 → 55, determinism 21 → 50).
- `.lovable/plans/00-active.md` § P2, P3, P9 — plan steps that depend on this format.
