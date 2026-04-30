# ADR-0001: Singular DDL vs plural prose

## Status

`Accepted` — 2026-04-28

## Context

Across `spec/` we accumulated two competing naming pressures:

1. **Prose readability** favours plural English nouns: "the user sees their
   items", "favorites are returned first", "mirrors stay in sync". QA, PMs,
   and UI specs naturally write this way.
2. **DDL precision** favours **singular PascalCase** identifiers: `Item`,
   `User`, `MirrorGroup`, `Item.IsFavorite`. SQLite tables, foreign keys,
   migrations, and the REST envelope (`Status`, `Attributes`, `Results`)
   all depend on stable, singular identifiers.

The April 2026 audit (recorded in
`.lovable/question-and-ambiguity/00-triage-summary.md`) surfaced
**ambiguity #01** (`Items` vs `Item`), **#03** (`Content` field vs
`Content` table), and **#17** (`Favorites` table vs `Item.IsFavorite`
column) as load-bearing inconsistencies. Without a binding rule, future
sections will silently invent tables (`Favorite`, `Content`, `Items`) that
do not exist in DDL — leading to hallucinated endpoints
(`EP-FAVORITES-LIST`), broken AT fixtures, and migrations that contradict
each other.

P32, P37, and P40 already reference this rule from
`spec/04-database-conventions/00-overview.md`,
`spec/31-app/06-endpoints/03-layout-structure.md`, and the `31-app`
overview/feature/endpoint backlinks. Those references currently say
"MUST first amend via ADR" (per `G-ADR-0001-AMENDMENT-REQUIRED`) — that phrase is only enforceable once an
actual ADR exists. This ADR is that anchor.

## Decision

The spec **MUST** treat all DDL identifiers as **singular PascalCase** and treat plural English nouns as **prose aliases only** — enforced by `G-04-NO-DDL-PLURALS` (DDL side) + `G-04-ALIAS-DDL-CANONICAL` (alias-bridge side).

- DDL tables and columns are **always singular PascalCase**:
  `Item`, `User`, `MirrorGroup`, `MirrorMember`, `Template`,
  `TemplateBody`, `Session`, `Role`, `UserRole`, `AuditEvent`,
  `RateLimitBucket`, `FeedbackReport`, `ActivityEvent`,
  `EnforcementEvent`.
- Prose pages (overviews, features, AT statements) **MAY** use plural
  aliases (`items`, `users`, `mirrors`, `favorites`) for readability.
- API envelope keys remain **PascalCase** (`Status`, `Attributes`,
  `Results`, `Navigation`, `Errors`, `MethodsStack`) per
  `spec/04-database-conventions/06-rest-api-format/`. Plural envelope keys
  used inside `Results` (e.g. `Results.Items`) are **collection aliases**
  over the singular `Item` table — they do **not** imply a separate `Items`
  table.
- AT **fixtures** (JSON / SQL under `97a-`/`97b-`/…) **MUST** use the canonical singular identifier in payloads and queries — enforced by `G-ADR-0001-FIXTURE-SINGULAR-DDL` (sub-rule of `G-04-NO-DDL-PLURALS` scoped to the fixture corpus).
- **Favorites** is a column (`Item.IsFavorite`), not a table. Reads use
  `EP-ITEMS-LIST?includeFavorites=1`; writes use `EP-ITEMS-UPDATE
  { "IsFavorite": true }`. **No `EP-FAVORITES-*` endpoint family exists.**
- **Content** is a column (`Item.Content`), not a table.
- Any change to this rule (e.g. promoting `Favorite` to a real table) **MUST** be ratified by a new ADR that supersedes this one — never by silent prose drift, endpoint addition, or migration. Enforced by `G-ADR-0001-AMENDMENT-REQUIRED` (umbrella) which composes `G-ADR-0001-NO-SILENT-DRIFT` (forbids prose-only relaxation) — both load-bearing for the §"Forbidden families" lock at L117–118.

## Consequences

**Positive**

- Closes audit ambiguities #01, #03, #17 with a single binding rule.
- Makes endpoint and DDL hallucinations CI-detectable via
  `G-04-NO-DDL-PLURALS` (forbids `Favorites`/`Items`/`Contents` in DDL)
  and `G-04-ALIAS-DDL-CANONICAL` (every alias must map to a real DDL
  identifier).
- Lets prose stay readable without paying a migration tax.
- Establishes the first usage pattern for the `spec/00-adrs/` registry.

**Negative**

- Authors must remember: prose may pluralize, fixtures may not. Mixing
  the two inside the same code-fence is the most common mistake.
- A few legacy spec passages still referencing `Favorites` as a table
  must be swept (tracked by P48).
- Promoting a column to a table now requires the ADR ceremony — a small
  but real velocity tax for the right reasons.


**Spec impact** — Downstream sections affected by this decision: [`spec/04-database-conventions/`](../04-database-conventions/).

## Alternatives Considered

1. **Plural DDL identifiers (`Items`, `Users`, `Favorites`)** — rejected.
   Misaligns with the existing PascalCase singular envelope keys
   (`Status`, `Attributes`, `Results`), forces every existing migration
   and endpoint to rename, and gives no readability win that prose aliases
   don't already provide.
2. **Forbid plural prose entirely; require `Item` even in user-facing
   text** — rejected. Makes overviews, AT statements, and UI copy read
   like SQL DDL; QA and PMs reject the style. The cost is borne by every
   reader for the benefit of a check that CI can already enforce
   structurally.
3. **Do nothing (status quo)** — rejected. The April 2026 audit showed
   the status quo *is* the source of ambiguities #01/#03/#17. Without a
   binding rule, the next contributor will invent a `Favorites` table or
   `EP-CONTENT-LIST` endpoint and the alias bridge collapses.

## Gates Touched

- **New gates:** `G-ADR-0001-AMENDMENT-REQUIRED` (DOC-NORM umbrella), `G-ADR-0001-NO-SILENT-DRIFT` (DOC-NORM, sub-rule), `G-ADR-0001-FIXTURE-SINGULAR-DDL` (DOC-NORM, sub-rule of `G-04-NO-DDL-PLURALS` scoped to `97a-/97b-` fixture corpus)
- **Modified gates:** `G-04-ALIAS-DDL-CANONICAL` (now load-bearing),
  `G-04-NO-DDL-PLURALS` (now load-bearing)
- **Endpoints locked:**
  - `EP-ITEMS-*` — alias over `Item`
  - `EP-USERS-*` — alias over `User`
  - `EP-MIRRORS-*` — alias over `MirrorGroup` + `MirrorMember`
  - `EP-TEMPLATES-*` — alias over `Template` + `TemplateBody`
  - `EP-SESSIONS-*` — alias over `Session`
  - `EP-ROLES-*` — alias over `Role` + `UserRole`
  - **Forbidden families:** `EP-FAVORITES-*`, `EP-CONTENT-*`,
    `EP-FAVORITE-*`
- **DDL identifiers locked (singular PascalCase, exhaustive for
  alias-bridge):** `Item`, `Item.Title`, `Item.Content`,
  `Item.IsFavorite`, `User`, `MirrorGroup`, `MirrorMember`, `Template`,
  `TemplateBody`, `Session`, `Role`, `UserRole`, `AuditEvent`,
  `RateLimitBucket`, `FeedbackReport`, `ActivityEvent`,
  `EnforcementEvent`

## Supersedes / Superseded-By

- **Supersedes:** `(none)`
- **Superseded-By:** `(none)`
