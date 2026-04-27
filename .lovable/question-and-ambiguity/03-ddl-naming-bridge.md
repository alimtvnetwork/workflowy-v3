# 03 — DDL naming: `Item.Content` vs spec `Items.Title`

**Date:** 2026-04-27
**Task #:** 3 / 40
**Related spec / file:** `spec/31-app/07-db-diagram/sql/02-app-schema.sql` vs B1–B4 addendums

## Question
SQL DDL uses singular table name **`Item`** with column **`Content`**. The 50 new ATs (`AT-APP-58..107`) and B1–B4 addendum prose reference **`Items.Title`** (plural table, "Title" column). Same drift exists in older ATs. Which is authoritative?

## Inferred decision
DDL is the ground-truth implementation contract (per `mem://constraints/backend-runtime-deferred` — WP plugin SQLite is committed). Treat `Item` (singular) + `Content` (text body) as canonical at the DB layer. Treat `Items.Title` in spec prose as a **conceptual alias** that maps to `Item.Content` (Workflowy semantics: an item's first line IS its title). I will NOT rewrite 50 ATs in this pass. Instead I'll add a one-line "Naming Bridge" callout to `spec/31-app/07-db-diagram/sql/00-overview.md` documenting the alias, so AI implementers don't get tripped up.

## Impact
Saves ~50 cosmetic edits. AI implementers reading either layer get a single bridge sentence. Risk: future audit may flag this as drift — it's pre-existing, not introduced now.

## Suggested clarification
Option A (chosen): keep DDL singular + alias spec terms.
Option B: rename DDL to `Items` plural and add `Title` virtual column. Bigger blast radius.
