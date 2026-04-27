# 17 — Favorites endpoint-vs-table contradiction

**Date:** 2026-04-27
**Task:** F19 — Add §4.12 Favorites slice
**Mode:** No-questions (auto-resolved)

## Ambiguity

`spec/31-app/06-endpoints/03-layout-structure.md` line 20 currently states:

> The shell has no persistent server state of its own (no "favorites" table in MVP).

But `spec/31-app/07-db-diagram/sql/02-app-schema.sql` v1.0.0 line 166 already creates:

```sql
CREATE TABLE IF NOT EXISTS Favorite (
    FavoriteId      INTEGER PRIMARY KEY AUTOINCREMENT,
    ItemId          INTEGER NOT NULL,
    UserId          INTEGER NOT NULL,
    FractionalIndex TEXT    NOT NULL,
    ...
);
```

…and `06-indexes.md` indexes it as `IdxFavorite_UserId_FractionalIndex`, and `01-master-erd.md` + `03-app-db-erd.md` both render the entity. The MVP **does** have a Favorites table.

## What I did (F19 only)

Added §4.12 Favorites slice to `04-feature-slices.md` v2.1.0. The slice:

- Documents the existing `Favorite` table schema + invariants (UNIQUE, CASCADE, logical FK).
- Pins the **current MVP wire path**: toggle goes through `EP-ITEMS-UPDATE` carrying an `isFavorited` boolean (per AT-LAYOUT-12 in `01-features/03-layout-structure.md`).
- Explicitly notes that a dedicated `EP-FAVORITES-*` endpoint family is **deferred** — readers MUST NOT invent `EP-FAV-*` citations.
- Calls out the contradiction in `06-endpoints/03-layout-structure.md` and links here.

## What I did NOT do

I did **not** edit `06-endpoints/03-layout-structure.md` line 20. Reason:

1. The endpoint-overview file's claim "no favorites table" is part of a broader narrative about the layout shell having no own state. Editing one sentence risks misrepresenting the surrounding context without a full reread.
2. F19 was scoped to `04-feature-slices.md` per the task list.
3. Better to handle as a separate atomic task **F23** (now added to remaining tasks).

## Resolution path (F23, future task)

When picked up, F23 should:

- Reword `06-endpoints/03-layout-structure.md` line 20 from "no favorites table in MVP" to something like "favorite state lives in the App-DB `Favorite` table (per `04-feature-slices.md` §4.12); the layout shell itself has no own state".
- Also reword line 22 ("Any future 'pin to sidebar' feature would extend `01-information-model.md` with a `Pinned` flag rather than introduce a new endpoint family.") — `Pinned` flag was the **alternative not chosen**; the actual chosen design is the `Favorite` table.
- Bump `06-endpoints/03-layout-structure.md` patch version.

## Decisions auto-made (would have been questions)

1. **Endpoint family — invent now or defer?** → **Defer**. The MVP wire path through `EP-ITEMS-UPDATE` is documented and AT-tested; inventing `EP-FAV-LIST/CREATE/DELETE/REORDER` now would create 4 phantom endpoints with no consumer. F19 only documents what exists.

2. **Where to register sidebar-reorder ATs?** → **AT-LAYOUT-NN open prefix**. Already licensed (per `01-features/97-acceptance-criteria.md`). No new prefix needed.

3. **CASCADE behavior on soft-delete (Trash)?** → **Favorites survive Trash, die on hard-delete**. The DDL's `ON DELETE CASCADE` only fires on actual row removal; Trash is a soft-delete (`DeletedAt IS NOT NULL` flag). Documented this distinction in the slice.
