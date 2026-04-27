# Question & Ambiguity Log

This folder captures every ambiguity encountered while running in **No-Questions Mode** (see `.lovable/prompts/03-no-questions-prompt.md`).

## Files

- `task-counter.md` — running tally of tasks completed under no-questions mode (target: 40).
- `NN-<brief-title>.md` — one note per ambiguity, sequentially numbered.

## Review workflow

1. User reads `task-counter.md` to see which tasks logged ambiguities.
2. User opens each `NN-*.md` note to review the inferred decision.
3. User overrides any inference they disagree with — AI then revises the affected work.

## Rules

- Each note ≤ 200 words.
- Filename uses zero-padded sequence: `01-`, `02-`, …
- Notes are append-only during the 40-task window. Edits happen only on user review.
