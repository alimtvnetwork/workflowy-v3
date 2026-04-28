# Acceptance-Criteria I/O Table — Authoring Guide

> **Version:** 1.0.0
> **Created:** 2026-04-28 (UTC+8)
> **Status:** Normative — all `97-acceptance-criteria.md` files MUST use this format for new criteria; legacy criteria are converted incrementally per plan step **P2**.
> **Parent:** [`00-overview.md`](./00-overview.md)
> **Spawned by:** `.lovable/plans/00-active.md` § P2.

---

## Purpose

Existing acceptance-criteria rows describe behaviour in prose ("MUST be hashed with Argon2id"). That is testable by a human reviewer but **not** by an AI implementer that needs to write the test. P2 closes the gap by requiring every AT row to be paired with a **concrete I/O fixture**: deterministic Given / When / Then plus literal request/response JSON where applicable.

---

## Mandatory format

Every leaf criterion (one that an implementer can write a single test for) MUST appear as **two adjacent rows** in the file:

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
- **Request body / Response envelope** — when present they MUST be valid JSON literals (parseable by `JSON.parse`). Use realistic example IDs (`"itm_01HXYZ…"`), not `<placeholder>` strings.
- **Response envelope** — MUST conform to `spec/04-database-conventions/06-rest-api-format/` (PascalCase keys, mandatory `Status` / `Attributes` / `Results`).
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

## Hygiene gate (added in same PR as P2g closure)

`scripts/spec-hygiene/` will gain check **AT-FIX-01**:

> For every line matching `^\| \`AT-[A-Z]+-\d+\``, the next non-blank line MUST be either (a) a `> **\`AT-…\` fixture**` block header, or (b) the explicit `> _Fixture: N/A …_` opt-out line. Otherwise FAIL.

Until P2g lands, the check runs in **report-only** mode and tallies coverage in `.lovable/plans/p2-coverage.md`.

---

## Related

- `spec/04-database-conventions/06-rest-api-format/` — envelope spec the JSON rows MUST conform to.
- `spec/01-spec-authoring-guide/14-scoring-metrics.md` — testability + determinism dimensions that this format unblocks (audit projects testability 21 → 55, determinism 21 → 50).
- `.lovable/plans/00-active.md` § P2, P3, P9 — plan steps that depend on this format.
