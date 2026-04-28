# ADR-0026: Canonical LWW tie-break ordering — `(ServerTs, OwnerId, ItemId)`

## Status

`Accepted` — 2026-04-28

## Context

LWW conflict resolution is referenced in three independent spec sites,
each with a slightly different tie-break key — exactly the drift
condition AUDIT-02 of the AI-implementability audit flagged:

| Site | Stated tie-break | Source |
|---|---|---|
| ADR-0010 D3 (offline queue, item field-level LWW) | `OwnerId ASC` | line 99 (prose body, no gate) |
| `spec/31-app/01-features/09b-mirror-peer-group-model.md` R-5 + AT-MPG-09 | `OwnerUserId ASC` (note: `OwnerUserId`, not `OwnerId`) | feature spec |
| ADR-0016 (`G-21-LWW-ID-TIEBREAK`) | implied `ItemId` | gate name only |

A mediocre AI confronted with three different keys for the same
operation will either (a) pick one arbitrarily and break the other two
sites, or (b) implement three resolvers and produce non-deterministic
state divergence. Neither is acceptable for a system whose offline
guarantee depends on every client and the server reaching the same
post-replay state.

This ADR collapses all three sites onto a **single, totally-ordered
3-tier comparison** so the result is bit-identical regardless of which
code path performs the resolution.

## Decision

**D1 — Canonical comparator (MUST).** The LWW resolver MUST compare
candidates in this exact order, returning the **greater** as the
winner:

```
compare(a, b) =
  1. a.ServerTs            DESC   (later wall-clock wins)
  2. a.OwnerId             ASC    (lower opaque-string ID wins)  // ADR-0020 brand
  3. a.ItemId              ASC    (lower opaque-string ID wins)  // ADR-0020 brand
```

All three keys are mandatory; comparison MUST short-circuit at the
first non-equal tier. Strings are compared **lexicographically over
the wire-regex alphabet `[A-Za-z0-9_-]`** (ASCII byte order is
sufficient — the regex excludes locale-sensitive characters).

**D2 — Naming alignment (MUST).** The user/owner key in the
comparator is **`OwnerId`** (per ADR-0020 branded type). The legacy
spelling `OwnerUserId` (used in `09b-mirror-peer-group-model.md` R-5
and AT-MPG-09) MUST be treated as an **alias** of `OwnerId` and is
catalogued in the [column-level Spec↔DDL Alias Bridge](../04-database-conventions/00-overview.md#alias-bridge-columns) (4 tables: `Item`, `Template`, `Tag`, `Workspace`). New writes MUST use
`OwnerId`. **Housekeeping closure (2026-04-28):** `09b-mirror-peer-group-model.md` R-5 prose has been migrated to canonical `OwnerId` with a forward-pointer to the column-level bridge; the lone residual `OwnerUserId` in §6.1 SQL pseudocode is whitelisted per §D6 and carries an inline annotation. The alias bridge remains load-bearing for storage-layer fixtures and DDL.

**D3 — Three-site ratification (MUST).** The same comparator applies
to:

- **Item field-level LWW** (ADR-0010 D3) — replaces the prose-only
  "Tiebreak on identical `ServerTs` is `OwnerId` ASC".
- **Mirror peer-group conflict** (ADR-0005, mirror feature R-5) —
  replaces the `(UpdatedAt DESC, OwnerUserId ASC)` 2-tier rule.
- **SortOrder collision** (ADR-0016, `G-21-LWW-ID-TIEBREAK`) — the
  `ItemId` ASC tie at tier 3 covers the case where two clients
  simultaneously generate the same fractional-index string.

Implementations MUST NOT keep three separate resolvers. There MUST be
**one** function `resolveLWW(a, b)` (or its PHP/SQL equivalent) used
by every call site.

**D4 — Server clock authority (MUST).** `ServerTs` MUST be assigned
by the SQLite `strftime('%Y-%m-%dT%H:%M:%fZ', 'now')` expression at
the moment of the `UPDATE`. Client-supplied `clientTs` MUST NOT
participate in the comparator (per ADR-0010 D3, restated for
emphasis).

**D5 — Determinism guarantee (MUST).** For any two candidate writes
`a` and `b`, the comparator MUST return a **strict** ordering — never
"equal". Equality at tier 3 (same `ItemId`) means `a == b` and is
mathematically impossible for two distinct writes (since `ItemId` is
the primary key). If the resolver ever observes equality at all three
tiers, it MUST raise a hard error to the boundary defined in
ADR-0017; silent acceptance is forbidden.

**D6 — Wire-boundary canonicalisation (MUST).** All REST/SSE wire
payloads MUST emit the canonical key **`OwnerId`**. The DDL spelling
`OwnerUserId` is permitted **only** in: (a) `*.sql` DDL files,
(b) `07-db-diagram/` ERD/index/migration tables, (c) SQL pseudocode
inside workflow specs. The PHP serializer layer MUST translate
`Templates.OwnerUserId`, `Items.OwnerUserId`, etc. → wire `OwnerId` at
the `EP-*` boundary (alias-bridge per D2 applied at egress, not at the
storage layer). Endpoint specs (`spec/31-app/06-endpoints/**`),
fixtures (`04a-fixtures/**`), and SSE frame schemas (ADR-0025) MUST
NOT expose `OwnerUserId` in any documented `Results` shape, JSON
example, or TypeScript wire type. **Exception:** fixtures explicitly
labelled "matches `Item` SQL row" (i.e. storage-layer fixtures, not
wire fixtures) MAY retain `OwnerUserId` since they document the DDL
column directly; such fixtures MUST carry an inline comment
`// DDL-mirror fixture; wire egress translates to OwnerId per ADR-0026 D6`.

## Consequences

**Positive**
- Eliminates the three-way drift between ADR-0010, mirror R-5, and
  ADR-0016 — single resolver, single test surface.
- AI implementer has exactly one function to write and one set of
  fixtures to satisfy.
- 3-tier ordering is total: no equality paths, no non-determinism.
- ASCII byte order over the brand-regex alphabet is locale-free and
  works identically in JS, PHP, and SQLite without `COLLATE` clauses.

**Negative**
- ~~`09b-mirror-peer-group-model.md` R-5 and AT-MPG-09 now contain a stale 2-tier rule referencing `OwnerUserId`.~~ **Resolved 2026-04-28** — R-5 prose, AT-MPG-09, and §6.1 SQL pseudocode all migrated/annotated to canonical `OwnerId` with cross-link to the column-level Spec↔DDL Alias Bridge. AUDIT-07 closed.
- One additional gate ID per call site (3 new gates; now 5 with `G-26-OWNER-ID-CANONICAL` and `G-26-WIRE-OWNERID-ONLY`).

## Alternatives Considered

1. **Keep three resolvers, accept drift as documentation-only.**
   Rejected — already produced one user-visible bug (mirror state
   divergence between tabs after offline edit storm); root-cause was
   exactly this drift.
2. **2-tier `(ServerTs, OwnerId)` only, treat `ItemId` collision as
   impossible.** Rejected — D5's "strict ordering, no equality" is
   a stronger correctness guarantee than "should never happen", and
   `ItemId` is already required in every comparison context.
3. **Use `OwnerUserId` as canonical, alias `OwnerId` to it.**
   Rejected — `OwnerId` is the ADR-0020 branded name; aliasing the
   newer brand to a legacy spelling reverses the direction of the
   alias bridge.
4. **Lexicographic comparison with full Unicode collation.**
   Rejected — adds locale dependency for zero benefit; the wire
   regex `^[A-Za-z0-9_-]{8,64}$` (ADR-0020) already constrains the
   alphabet to ASCII.

## Gates Touched

- `G-26-LWW-CANONICAL-COMPARATOR` — exactly one `resolveLWW` function
  exists; 3-tier `(ServerTs DESC, OwnerId ASC, ItemId ASC)`.
- `G-26-LWW-NO-CLIENT-TS` — `clientTs` MUST NOT appear in any
  comparator code path; CI grep-fail on `clientTs.*compare|compare.*clientTs`.
- `G-26-LWW-STRICT-ORDERING` — comparator MUST raise on triple-tie;
  no silent equality.
- `G-26-OWNER-ID-CANONICAL` — `OwnerId` is the canonical brand;
  `OwnerUserId` is an alias-bridge entry, not a column name.
- `G-26-WIRE-OWNERID-ONLY` — **Dual enforcement** (CI + TEST):
  - **CI half (regex):** In `spec/31-app/06-endpoints/**`, no `Results` shape, JSON example, or TypeScript wire type may declare an `OwnerUserId` **field** (regex: `\bOwnerUserId\s*[:?,}]` MUST match zero lines; bare prose mentions of `Templates.OwnerUserId` qualifying the DDL column are permitted). In `spec/31-app/04a-fixtures/**`, `OwnerUserId` is permitted **only** in three explicitly-DDL-mirror artifacts: `00-overview.md`, `generate.py`, and `item-tree-217.json` (all derived from the App DB `Item` table per `03-app-db-erd.md`).
  - **TEST half (PHPUnit):** `AT-WIRE-EGRESS-01` — runtime serializer test specified in [`spec/31-app/06-endpoints/97b-endpoint-envelope-fixtures.md`](../31-app/06-endpoints/97b-endpoint-envelope-fixtures.md#php-serializer-egress-test--g-26-wire-ownerid-only-enforcement) §"PHP Serializer Egress Test". Recursively scans every `EP-*` JSON response (success + error envelopes) and asserts zero `OwnerUserId` keys, ADR-0020-shaped `OwnerId` values, and matrix-driven coverage parity. Failure message MUST include literal `[G-26-WIRE-OWNERID-ONLY]`. (Per D6.)

Updates / strengthens (does NOT supersede):

- ADR-0005 — mirror peer-group LWW now uses canonical comparator.
- ADR-0010 D3 — promotes prose "Tiebreak on identical `ServerTs` is
  `OwnerId` ASC" to a numbered, gated rule.
- ADR-0016 — `G-21-LWW-ID-TIEBREAK` is now the **third tier** of the
  canonical comparator, not a standalone rule.

## Supersedes / Superseded-By

- Supersedes: (none — promotes prose-only tie-breaks across three
  ADRs into a single ratified comparator)
- Superseded-By: (none)
- Composes with: ADR-0005 (mirror peer-group), ADR-0010 (offline
  FIFO + LWW guard), ADR-0016 (fractional sortOrder), ADR-0017
  (error boundaries — D5 raise target), ADR-0020 (branded IDs).
