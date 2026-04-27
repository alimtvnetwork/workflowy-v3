# Ambiguity #26 — G-32.2 reverse-drift allow-list categories

**Date logged:** 2026-04-27
**Context:** F-future-G32a (G-32 v2.0.0 — reverse-drift sub-check)
**Status:** Logged for later review (no-questions mode active)

## Question

The G-32.2 reverse check classifies a doc-claimed identifier as
"fabricated" when it has no explicit DDL `CREATE INDEX`, no
UNIQUE-implied autoindex on a real table, and no alias row in
`sql/00-overview.md` §Index-name aliases. The runner ships with **8**
allow-list entries grouped into three categories:

1. **Logical-tag aliases** (2): `IdxUser_Email`, `IdxWorkspace_AppDbPath`
   — these are *names* the docs use as shorthand for an autoindex (e.g.
   `sqlite_autoindex_User_*` is the actual index; `IdxUser_Email` is
   just the conceptual label). They appear in §Implicit Indexes prose
   alongside the autoindex form.
2. **Prose-rejected names** (3): `IdxItem_Content`, `IdxItem_CreatedAt`,
   `IdxComment_AuthorUserId` — listed in §"Indexes intentionally NOT
   created" so readers understand *why* they don't exist. The runner
   has no way to detect "rejected mention" vs "claim of existence"
   without a custom Markdown sectioning parser.
3. **v2-deprecated names** (3): `IdxItem_MirrorOfItemId`,
   `IdxMirror_SourceItemId`, `IdxMirror_MirrorItemId` — mentioned in
   the v1.3.0 deprecation note for traceability after the M-117
   migration dropped the legacy `Mirror` table.

## Open question (intentionally not asked)

Should categories 1–3 be moved out of the runner allow-list and
expressed as **section-aware skips**? E.g. teach the runner to skip any
identifier whose only occurrences are inside §"Implicit Indexes" (where
logical-tag form is normal) or §"Indexes intentionally NOT created"
(where rejection is the whole point).

**Pro:** Eliminates 5/8 allow-list entries (categories 1+2). New
identifiers added to those sections wouldn't need allow-list updates.

**Con:** Couples the runner to specific section heading strings in
`06-indexes.md`. If the doc reorganises (e.g. inlines §Implicit
Indexes into Required-Indexes), the runner silently stops protecting
that surface.

## Decision (no-questions mode)

Kept the simple flat allow-list. The 8 entries are stable (categories
2 and 3 are by construction historical; category 1 only grows when a
new UNIQUE column is added to a Root table, which is rare). Documented
the categorisation in this file so future maintainers understand the
groupings without reading runner-source comments.

If the allow-list grows past ~15 entries, revisit the section-aware
approach as a v2.1.0 enhancement.

## Files affected

- `scripts/spec-hygiene/32-check-ddl-unique-coverage.mjs` (v2.0.0 — added `REVERSE_EXEMPT`)
- `spec/31-app/05-conventions/25-g32-ddl-unique-coverage-gate.md` (v2.0.0)
