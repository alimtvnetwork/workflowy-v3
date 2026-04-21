# Read Memory — AI Onboarding Prompt

> **Version:** 1.0  
> **Updated:** 2026-04-18  
> **Trigger phrase:** "read memory"

> **Purpose:** This document is a mandatory onboarding sequence for any AI assistant joining this project. It ensures you internalize all specifications, rules, and conventions before writing a single line of code.

> **Rule #0:** Follow every phase sequentially. Do not skip, summarize prematurely, or assume knowledge from training data. The specs are the single source of truth.

---

## Table of Contents

1. [Phase 1 — AI Context Layer](#phase-1--ai-context-layer)
2. [Phase 2 — Consolidated Guidelines](#phase-2--consolidated-guidelines)
3. [Phase 3 — Spec Authoring Rules](#phase-3--spec-authoring-rules)
4. [Phase 4 — Deep-Dive Source Specs](#phase-4--deep-dive-source-specs-task-driven)
5. [Anti-Hallucination Contract](#anti-hallucination-contract)
6. [Memory Update Protocol](#memory-update-protocol)
7. [Completion Confirmation](#completion-confirmation)

---

## Phase 1 — AI Context Layer

**Goal:** Load the project's identity, hard rules, and institutional memory into your working context.

### Step 1.1 — Read core files in EXACT order

| Order | File | What You Learn |
|-------|------|----------------|
| 1 | `.lovable/overview.md` | Project summary, tech stack, navigation map |
| 2 | `.lovable/strictly-avoid.md` | **Hard prohibitions** — violating ANY of these is a critical failure |
| 3 | `.lovable/user-preferences` | How the human expects you to communicate and behave |
| 4 | `.lovable/memory/index.md` | Index of all institutional knowledge files |
| 5 | `.lovable/plan.md` | Current active roadmap and priorities |
| 6 | `.lovable/suggestions.md` | Pending improvement ideas (not yet approved) |

### Step 1.2 — Read EVERY file referenced in `.lovable/memory/index.md`

- If the index lists 12 files, you read 12 files. No exceptions.
- If there are subfolders, traverse them recursively.
- If a file is missing or empty, note it — do not silently skip.

### Step 1.3 — Self-check (answer these internally before continuing)

- [ ] What are the project's **CODE RED** rules?
- [ ] What naming conventions are enforced (files, folders, DB columns, variables)?
- [ ] What is the error handling philosophy?
- [ ] What is the current plan and what tasks are in progress?
- [ ] What patterns/tools/approaches are **strictly forbidden**?

> ⛔ **DO NOT proceed to Phase 2 until every file above has been read and internalized.**

---

## Phase 2 — Consolidated Guidelines

**Goal:** Absorb the project's unified rulebook — self-contained guideline documents.

### Instructions

1. Navigate to `spec/12-consolidated-guidelines/`.
2. Read files in **numeric order**: `01-*.md` through the highest-numbered file.
3. Each file is self-contained. Treat each as a standalone policy document.

### After reading, confirm internally

- [ ] Total number of guideline files read.
- [ ] One-sentence summary of the key rule from each file.
- [ ] Any rules that contradict your default training (these are intentional — the spec wins).

> ⛔ **DO NOT proceed to Phase 3 until all consolidated files have been read.**

---

## Phase 3 — Spec Authoring Rules

**Goal:** Understand how specifications themselves are structured, so you can read them correctly and author new ones if asked.

### Instructions

1. Navigate to `spec/01-spec-authoring-guide/`.
2. Read all files in numeric order.

### After reading, confirm you understand

| Concept | Where It's Defined |
|---------|-------------------|
| File and folder naming conventions | `02-naming-conventions.md` |
| Required files in every spec folder (`00-overview.md`, `99-consistency-report.md`) | `03-required-files.md` |
| The `.lovable/` folder structure and its purpose | `07-memory-folder-guide.md` |
| Linter infrastructure requirements | `10-mandatory-linter-infrastructure.md` |

> ⛔ **DO NOT begin any task until Phases 1–3 are complete.**

---

## Phase 4 — Deep-Dive Source Specs (Task-Driven)

**Goal:** Before performing any task, read the relevant source spec(s) so your work is compliant.

### Lookup Table

| If your task involves... | Read this spec folder |
|--------------------------|----------------------|
| Writing or reviewing code | `spec/02-coding-guidelines/` |
| Error handling | `spec/03-error-manage/` |
| Database schema or queries | `spec/04-database-conventions/` |
| SQLite or multi-database architecture | `spec/05-split-db-architecture/` |
| Configuration systems | `spec/06-seedable-config-architecture/` |
| UI theming, CSS variables, design tokens | `spec/07-design-system/` |
| Documentation viewer features | `spec/08-docs-viewer-ui/` |
| Code block rendering | `spec/09-code-block-system/` |
| PowerShell scripts | `spec/10-powershell-integration/` |
| CI/CD pipelines | `spec/13-cicd-pipeline-workflows/` |
| CLI self-update system | `spec/14-self-update-app-update/` |
| WordPress plugins | `spec/15-wp-plugin-how-to/` |
| Generic CLI scaffolding | `spec/16-generic-cli/` |
| Generic update infrastructure | `spec/17-generic-update/` |
| App-specific features (nested: 01-features, 02-audits, 03-workflows, 04-edge-cases, 05-roadmap, 06-conventions) | `spec/31-app/` |
| App-wide UI design | `spec/32-ui-design/` |
| Feedback/report features | `spec/33-feedback-report/` |
| Activity feed | `spec/34-activity-feed/` |
| Generic enforcement | `spec/35-enforcement-rules/` |
| User management | `spec/36-user-management/` |

### Reading order within each folder

1. `00-overview.md` — always first
2. All numbered files in order
3. `99-consistency-report.md` — always last (if present)

---

## Anti-Hallucination Contract

These rules are **absolute and non-negotiable**. Violating any of them is a critical failure.

### 1. Never Invent Rules
If a spec does not mention a rule, that rule does not exist. Do not fill gaps with assumptions from your training data.

### 2. Specs Override Training Data
If your pre-trained knowledge conflicts with a spec, **the spec wins**. Every time. No exceptions.

### 3. Cite Your Sources
When enforcing a rule, reference the **specific file and section**.

### 4. Ask When Uncertain
If a spec is ambiguous or silent on a topic, **ask the human**. Do not guess.

### 5. Never Merge Conventions
This project has its own conventions (e.g., PascalCase DB columns). Do not blend them with conventions from other projects, languages, or frameworks you've seen in training.

### 6. Bump Minor Version on Code Changes
Any code change must bump at least the minor version.

### 7. No Filler
Never append boilerplate like "Let me know if you have questions!" Just deliver the work.

---

## Memory Update Protocol

```
New information discovered
│
├─ Institutional knowledge (pattern, convention, decision)?
│  └─ YES → Write to `.lovable/memory/` and update `.lovable/memory/index.md`
│
├─ Something that must NEVER be done?
│  └─ YES → Add to `.lovable/strictly-avoid.md` (and optionally a file in `.lovable/strictly-avoid/`)
│
├─ A suggestion or improvement idea (not yet approved)?
│  └─ YES → Add to `.lovable/suggestions.md`
│
└─ None of the above → Do not persist it
```

### Critical Rules
- The memory folder is `.lovable/memory/` — **never** `.lovable/memories/` (no trailing `s`).
- When adding a new memory file, **always** update the index at `.lovable/memory/index.md`.
- When modifying an existing memory, preserve all other content — do not truncate or overwrite unrelated entries.

---

## Completion Confirmation

After completing **Phases 1 through 3**, respond with exactly this format:

```
✅ Onboarding complete.
- Memory files read: [X]
- Consolidated guidelines read: [Y]
- Spec authoring files read: [Z]

I understand:
- CODE RED rules: [list the top 3–5]
- Naming conventions: [brief summary]
- Error handling approach: [one sentence]
- Active plan: [current milestone or focus]
- Strict avoidances: [top 3–5 forbidden patterns]

Ready for tasks.
```

Then **stop and wait** for instructions. Do not suggest next steps. Do not ask exploratory questions. Just wait.

---

*Prompt v1.0 — Update in sync with spec version changes.*
