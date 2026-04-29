# Ledger: G-32 DDL Unique-Coverage Exemptions

> **Scope:** Per-(gate, path) exemptions consumed by
> `scripts/spec-hygiene/32-check-ddl-unique-coverage.mjs` (G-32). Sibling #3
> of the per-(gate, path) Phase-2 trilogy after G-30 and G-31.
>
> **Schema:** `gate | pathGlob | entry | rationale | addedOn`
> — see `spec/13-cicd-pipeline-workflows/scripts-as-spec/per-gate-path-ledger-schema.md`.
>
> **G-32 specialisation:** the `gate` column carries the sub-gate suffix
> matching the in-source Set being seeded:
> - `G-32.1.coverage` → `COVERAGE_EXEMPT` (DDL UNIQUE → docs missing)
> - `G-32.2.reverse` → `REVERSE_EXEMPT` (doc index name → no DDL match)
> - `G-32.3.nonunique` → `NONUNIQUE_EXEMPT` (CREATE INDEX undocumented)
> - `G-32.5.parity` → `PARITY_EXEMPT` (`${ddlName}:${aspect}`)
>
> **`pathGlob` semantics (G-32):** the entry's natural host file. For
> `G-32.2.reverse`, that is `spec/31-app/07-db-diagram/06-indexes.md` — the
> doc index that legitimately mentions a name without a DDL match. For
> `G-32.1.coverage`, the DDL file containing the un-documented UNIQUE.
>
> **In-source emergency overrides:** Each Set in
> `32-check-ddl-unique-coverage.mjs` remains as an empty skeleton so a
> hot-fix exemption can land without a ledger PR. The runner unions
> ledger entries ∪ in-source entries.

## Entries

| gate | pathGlob | entry | rationale | addedOn |
|------|----------|-------|-----------|---------|
| G-32.2.reverse | `spec/31-app/07-db-diagram/06-indexes.md` | `IdxUser_Email` | logical tag for sqlite_autoindex_User_*; conceptual name in §Implicit Indexes prose | 2026-04-29 |
| G-32.2.reverse | `spec/31-app/07-db-diagram/06-indexes.md` | `IdxWorkspace_AppDbPath` | logical tag for sqlite_autoindex_Workspace_*; conceptual name in §Implicit Indexes prose | 2026-04-29 |
| G-32.2.reverse | `spec/31-app/07-db-diagram/06-indexes.md` | `IdxItem_Content` | §"Indexes NOT created" — FTS5 ships in Phase 2; runner cannot distinguish prose-rejected from prose-claimed | 2026-04-29 |
| G-32.2.reverse | `spec/31-app/07-db-diagram/06-indexes.md` | `IdxItem_CreatedAt` | §"Indexes NOT created" — order is by FractionalIndex, not CreatedAt | 2026-04-29 |
| G-32.2.reverse | `spec/31-app/07-db-diagram/06-indexes.md` | `IdxComment_AuthorUserId` | §"Indexes NOT created" — "all my comments" is not an MVP view | 2026-04-29 |
| G-32.2.reverse | `spec/31-app/07-db-diagram/06-indexes.md` | `IdxItem_MirrorOfItemId` | v2-deprecated; dropped by M-117 (legacy Mirror table); kept in deprecation note for traceability | 2026-04-29 |
| G-32.2.reverse | `spec/31-app/07-db-diagram/06-indexes.md` | `IdxMirror_SourceItemId` | v2-deprecated; dropped by M-117 (legacy Mirror table); kept in deprecation note for traceability | 2026-04-29 |
| G-32.2.reverse | `spec/31-app/07-db-diagram/06-indexes.md` | `IdxMirror_MirrorItemId` | v2-deprecated; dropped by M-117 (legacy Mirror table); kept in deprecation note for traceability | 2026-04-29 |

**Row count:** 8 (all G-32.2.reverse). Other categories (`coverage`, `nonunique`, `parity`) are currently empty in-source and empty here.

## Loader contract (consumed by `32-check-ddl-unique-coverage.mjs`)

```
function loadG32Exemptions() → {
  coverage:  Set<string>,
  reverse:   Set<string>,
  nonunique: Set<string>,
  parity:    Set<string>,
}
```

Parser rules (identical to G-30/G-31 sibling parsers):
1. Locate `## Entries` table.
2. For each row, split `gate` on `.`; require shape `G-32.<n>.<category>` where
   `category ∈ {coverage, reverse, nonunique, parity}`.
3. Strip surrounding markdown backticks from `entry` cell (sibling-pattern hygiene).
4. Hard-fail on empty `entry` or empty `rationale`.
5. Insert `entry` into `out[category]`.

The runner unions ledger Sets with the same-named in-source override Sets.

## Promotion path

- **Phase 2 (this PR):** Ledger created, loader threaded, runner consumes union.
  Status: **DOC-NORM** behaviour-equivalent.
- **Phase 3 (already enacted for G-30):** Per-row `pathGlob` enforcement
  (each `entry`'s natural host file must match the row's `pathGlob`) — for
  G-32.2.reverse, all 8 rows resolve to a single host (`06-indexes.md`),
  so glob enforcement is trivially satisfiable. Future G-32.1.coverage
  rows would each cite their own `*.sql` host.
