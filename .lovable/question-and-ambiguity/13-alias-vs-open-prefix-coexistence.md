# Ambiguity 13 — Alias rows + open prefix coexist

**Date:** 2026-04-27
**Task:** F15 — close `AT-INFO-*` + `AT-MIRROR-*` open prefixes
**Status:** Resolved by decision

## Question

After F15 enumerates `AT-INFO-01..07` and `AT-MIRROR-01..06` as explicit
alias table rows, the original open-prefix declarations (`` `AT-INFO-NN` ``
and `` `AT-MIRROR-NN` ``) still exist in the Coverage Map. Should those
open prefixes be removed/struck-through to make the alias rows the sole
declaration source?

## Decision

**No — keep both.**

- The Coverage Map's "Inline prefix in source" column documents the *naming
  convention* for the feature folder (e.g. "use `AT-INFO-NN` when citing
  information-model tests in this app"). Removing it would lose human-readable
  guidance.
- The new alias-enumeration table is the *machine-checked closure*. G-30
  finds the closed alias row first, so the open prefix is functionally
  redundant for those 13 IDs but harmless.
- If a citation appears for a number outside the enumerated range
  (`AT-INFO-08`), the open prefix would let it pass — which is the
  intended behavior: it tells the author "you're allowed to add a new alias,
  but you must add it to the enumeration table in the same PR."

## Future toggle

If the team decides open prefixes are too permissive, removing them is a
single-line edit per prefix in `97-acceptance-criteria.md`. The G-30 runner
needs no change.
