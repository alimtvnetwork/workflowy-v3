# AI Contract Header — Canonical Template

> **Version:** 1.0.0
> **Created:** 2026-04-28 (UTC+8)
> **Status:** Active — required on every top-level `spec/NN-*/00-overview.md`
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## Why this exists

The 2026-04-28 AI-readiness audit (composite 55/100) found that section overviews
describe *content* but never tell an implementing AI **what success looks like**.
Every section now MUST open with an `## AI Contract` block so a fresh agent can
decide, in under 30 seconds, whether the section is in scope for its current task
and what artifact it is expected to produce.

This file is the single source of truth for the block's shape. Hygiene script
`scripts/spec-hygiene/12-check-required-files.mjs` (extended in P1) verifies it
exists on every top-level overview.

---

## Required block (verbatim shape)

Insert immediately after the version/status frontmatter and before any other
H2. Subsection order is fixed.

```markdown
## AI Contract

**Purpose** — One sentence: what problem this section solves.

**Audience** — Which implementer role consumes this section
(spec author / frontend dev / backend dev / DevOps / reviewer).

**Expected AI Output** — The concrete artifact(s) an AI should produce when
asked to "implement this section": file paths, function signatures, JSON
fixtures, migration files, etc. List by relative path.

**Out of Scope** — Bullet list of adjacent concerns explicitly handled
elsewhere; link each to its owning section.

**Definition of Done** — Bullet list of checkable conditions. Each bullet
SHOULD reference an `AT-*` ID from this section's `97-acceptance-criteria.md`
or a hygiene-script name. Avoid prose like "looks good".
```

---

## Filled example (excerpt — `spec/31-app/00-overview.md`)

```markdown
## AI Contract

**Purpose** — Define every user-visible feature, workflow, edge case, REST
endpoint, and DB table that constitutes the WorkFlowy application.

**Audience** — Frontend dev (React/TS), backend dev (PHP/SQLite WP plugin),
QA reviewer.

**Expected AI Output** —
- React components under `src/components/{outliner,board,panels,...}/`
- PHP REST controllers under `wp-plugin/src/Rest/`
- SQLite migrations under `wp-plugin/migrations/`
- Vitest specs mirroring `97-acceptance-criteria.md` AT-APP-* IDs

**Out of Scope** —
- Visual design tokens → [`spec/32-ui-design/03-design-system/`](../32-ui-design/03-design-system/00-overview.md)
- Error envelope shape → [`spec/03-error-manage/`](../03-error-manage/00-overview.md)
- REST envelope keys → [`spec/04-database-conventions/06-rest-api-format/`](../04-database-conventions/06-rest-api-format/00-overview.md)

**Definition of Done** —
- All `AT-APP-*` rows in `97-acceptance-criteria.md` map to a passing test
- All endpoints in `06-endpoints/` have a JSON fixture under `04a-fixtures/`
- `node scripts/spec-hygiene/00-run-all.mjs` exits 0
```

---

## Authoring rules

1. **No optional subsections.** All five headings (Purpose, Audience, Expected
   AI Output, Out of Scope, Definition of Done) are mandatory.
2. **Purpose and Audience are single sentences**, ≤ 25 words each.
3. **Expected AI Output uses paths, not prose.** "A new React component" is
   wrong; `src/components/outliner/OutlineNode.tsx` is right.
4. **Out of Scope items must link** to the owning section. Bare text fails
   review.
5. **Definition of Done bullets are testable.** A bullet that cannot be checked
   by a script, a test, or a deterministic AT-* row is invalid.
6. The block lives in the overview only — sub-files must not duplicate it; they
   inherit from the parent.

---

## Migration policy

P1 adds the block to all 24 existing top-level overviews with placeholders that
the next responsible agent fills in. Placeholder lines start with `_TODO(P1):_`
and are tracked by `rg -n 'TODO\(P1\)' spec/`.

Subsequent steps (F1–F8 and P2) replace placeholders with concrete content as
each section is touched.

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent
- [`03-required-files.md`](./03-required-files.md) — Required-file matrix (extended in P1)
- [`14-scoring-metrics.md`](./14-scoring-metrics.md) — Audit dimensions this block lifts
