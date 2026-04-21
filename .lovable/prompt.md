# Lovable Prompts Index

> **Updated:** 2026-04-20

This file lists every reusable prompt stored under `.lovable/prompts/`. Saying the **trigger phrase** in chat tells the AI to load and follow that prompt verbatim.

---

## Available Prompts

| # | Trigger Phrase | File | Purpose |
|---|----------------|------|---------|
| 01 | `read memory` | [`prompts/01-read-memory-prompt.md`](./prompts/01-read-memory-prompt.md) | Mandatory AI onboarding sequence — load identity, hard rules, specs, and consolidated guidelines before any task |
| 02 | `write memory` / `end memory` / `update memory` | [`prompts/02-write-memory-prompt.md`](./prompts/02-write-memory-prompt.md) | Session persistence protocol — audit, update memory/plan/suggestions/issues, validate consistency |

---

## Conventions

- One file per prompt under `.lovable/prompts/` using the pattern `NN-name-prompt.md`.
- Add a row to the table above whenever a new prompt is created.
- Trigger phrases must be unique and case-insensitive.
