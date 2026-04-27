# 03 — No-Questions Mode (40-task batch)

> **Trigger phrases:** `no question`, `not ques for 40`, `no-questions mode`
> **Created:** 2026-04-27
> **Scope:** Next 40 user tasks from activation.

---

## Purpose

Eliminate all clarifying questions for the next **40 tasks**. Instead of pausing to ask the user, the AI logs the ambiguity to disk, picks the most reasonable inference, and proceeds.

---

## Hard Rules

1. **Do NOT call `questions--ask_questions`** for the next 40 tasks. Zero exceptions.
2. Whenever ambiguity, uncertainty, or a meaningful design choice arises, write a note to `.lovable/question-and-ambiguity/NN-brief-title.md` (sequential, zero-padded).
3. Pick the inference that:
   - aligns with existing codebase / spec style,
   - is the simpler of viable options,
   - matches the most common UX pattern for the context.
4. Continue the task without interruption after logging.
5. Increment `.lovable/question-and-ambiguity/task-counter.md` after each completed task.
6. When the counter reaches 40, automatically resume normal question-asking behaviour and inform the user.

---

## Ambiguity Note Format

```markdown
# NN — <brief title>

**Date:** YYYY-MM-DD
**Task #:** N / 40
**Related spec / file:** <path or feature>

## Question
<exact point of uncertainty>

## Inferred decision
<assumption made to proceed>

## Impact
<how this decision affects the implementation>

## Suggested clarification
<what the user should confirm on review>
```

Keep each note **under 200 words**.

---

## Task Counter

- File: `.lovable/question-and-ambiguity/task-counter.md`
- Format: running log with one line per completed task: `NN | YYYY-MM-DD | <one-line task summary> | ambiguities: <count or "none">`
- Header at top shows current count: `**Tasks completed: N / 40**`

---

## Exit Conditions

The mode auto-exits when **any** of the following is true:
- Task counter reaches 40.
- User explicitly says `exit no-questions`, `resume questions`, or equivalent.
- A truly destructive / irreversible action requires explicit consent (e.g. dropping a production table, publishing, paying money) — in that case the AI MAY ask one safety question, log it, and otherwise stay in mode.

On exit, the AI summarises all logged ambiguities and asks the user to review.
