---
task: F10 — implement G-30 AT citation validity gate
date: 2026-04-27
status: inferred-and-proceeded
---

# Ambiguity: AT-INFO-NN open-prefix declaration semantics

## Context
Implementing G-30 surfaced **20 cited AT IDs** (`AT-INFO-01..07`, `AT-MIRROR-01..06`, `AT-MULTI-01..07`) that the matrix uses but that do not appear as enumerated rows anywhere in `spec/31-app/`. The dispatch index in `01-features/97-acceptance-criteria.md` declares them only as `` `AT-INFO-NN` `` (literal "NN") — an "inline-prefix" placeholder pattern.

## Conflict
Two valid interpretations of `` `AT-FOO-NN` ``:

| View | Implication for G-30 |
|------|----------------------|
| **A. Reservation only** — the prefix is reserved for future use; specific IDs must still be enumerated row-by-row before they can be cited. | All 20 cites are drift; matrix should switch to canonical `AT-APP-*` only. |
| **B. License the series** — the prefix declaration grants implicit registration to every numbered ID in the family. | The 20 cites are valid; G-30 should accept any `AT-FOO-N+` whose prefix has an `NN` declaration. |

## Decision (inferred)
**Adopted view B**, encoded as `RX_DECL_OPEN` in the runner. Rationale:

1. The dispatch index explicitly says `AT-APPF-NN` ranges + `AT-FOO-NN` inline prefixes are "the convention" — implying ID space is owned, not pre-enumerated.
2. View A would force a 20-row write across 3 feature files for IDs whose **content already exists implicitly** (the matrix rows describe them via the cross-referenced feature file).
3. View A would also break the matrix's existing pre-G-30 invariants without adding test value (these IDs aren't ambiguous — `AT-MIRROR-03` clearly belongs to mirrors).
4. View B keeps G-30's true purpose tight: catch **typos** (e.g. AT-APP-200) and **invented prefixes** (e.g. AT-MGP-58) — both still fail, as proven by the negative test.

## What the user should review
- Whether the 20 implicitly-licensed IDs (AT-INFO-01..07, AT-MIRROR-01..06, AT-MULTI-01..07) should be **explicitly enumerated** in their feature files for documentation completeness, even though G-30 accepts them. If yes, that's an APP-FIX follow-up that affects 3 files (`01-information-model.md`, `09-mirrors.md`, `13-multi-select.md`).
- Whether view A would have been preferred for stricter long-term hygiene — view B is more permissive and could mask future drift if someone invents a new `AT-INFO-99` that shouldn't exist.

## Implementation note
The `RX_DECL_OPEN` regex requires backtick-wrapped placeholders (`` `AT-FOO-NN` ``), so prose mentions like "the AT-FOO-NN series" without backticks do **not** activate licensing — the declaration must be in the standard table-row form documented by the dispatch index.
