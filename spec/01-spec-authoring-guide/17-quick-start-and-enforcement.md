# AI Quick Start & Folder Structure Enforcement

> **Parent:** [`00-overview.md`](./00-overview.md)
> **Category:** Guide

---

## Quick Start for AI Agents

> 🔴 **MANDATORY — Commit to Memory Before Implementation**
>
> After reading this spec authoring guide and the linked coding guidelines, you **MUST** internalize and retain the following rules in your working memory for the entire session. These are non-negotiable and must be applied to every code change, every file you create, and every review you perform:
>
> 1. **Error Management is the highest priority** — error handling patterns from [03-error-manage/](../03-error-manage/00-overview.md) must be implemented from the very first line of code. Never defer error handling to "later."
> 2. **Boolean and if/else naming** — follow the strict boolean naming conventions (`is`/`has`/`should` prefixes, positive-only names, no negatives). Extract complex conditions into named variables. See [Coding Guidelines](../02-coding-guidelines/00-overview.md).
> 3. **Database conventions** — singular table names, PascalCase, `{TableName}Id` integer PKs, exact FK name matching. See [Database Conventions](../04-database-conventions/00-overview.md).
> 4. **Never hallucinate** — if any requirement is unclear, ambiguous, or missing from the spec, **stop and ask clarifying questions** rather than guessing or making assumptions. Incorrect assumptions waste more time than asking.
> 5. **Zero-nesting rule** — no nested `if` blocks. Use early returns and guard clauses.
>
> Failure to follow these rules will produce code that fails review and must be rewritten.

1. **Read [01-folder-structure.md](./01-folder-structure.md)** — the single source of truth for all folder structure rules
2. **Read this overview** to understand the file inventory, scoring, and conventions
3. **Read [01-folder-structure.md](./01-folder-structure.md)** for the tree layout
4. **Read [02-naming-conventions.md](./02-naming-conventions.md)** for naming rules
5. **Read [03-required-files.md](./03-required-files.md)** for mandatory file checklist
6. **Choose a template**: [04-cli-module-template.md](./04-cli-module-template.md), [05-app-project-template.md](./05-app-project-template.md), or [06-non-cli-module-template.md](./06-non-cli-module-template.md)
7. **Check [09-exceptions.md](./09-exceptions.md)** for edge cases before creating files
8. **Verify linter infrastructure** — read [10-mandatory-linter-infrastructure.md](./10-mandatory-linter-infrastructure.md) and confirm `linter-scripts/` exists
9. **Score the module** — set AI Confidence and Ambiguity percentages in `00-overview.md`
10. **Validate cross-references** — run the link scanner and fix any broken links
11. **Check `.lovable/memories/`** — read relevant memories before writing new specs

---

## Folder Structure Enforcement

When asked to "follow the spec authoring guideline and fix the folder structure," an AI agent MUST perform these steps in order:

### Step 1 — Verify Root Structure

1. Read [`01-folder-structure.md`](./01-folder-structure.md) — the single source of truth for all folder structure rules
2. Confirm all required root folders (01–11, 21–22) exist
3. Confirm they are correctly numbered and named
4. If any are missing, create them with at least `00-overview.md`

### Step 2 — Verify Folder Ordering

1. Core fundamentals use the 01–20 range; app-specific content uses 21+
2. No app-specific folders may appear in the 01–20 range
3. Numbering must be sequential (gaps are acceptable for historical reasons)

### Step 3 — Verify Naming Conventions

1. All folders use lowercase kebab-case: `{NN}-{kebab-case-name}/`
2. All files use lowercase kebab-case: `{NN}-{kebab-case-name}.md`
3. No spaces, underscores, or camelCase anywhere

### Step 4 — Verify Required Files

1. Every folder has `00-overview.md`
2. Top-level folders have `99-consistency-report.md`
3. Root `spec/` has `00-overview.md` and `99-consistency-report.md` (plus `folder-structure-root.md` as a redirect)

### Step 5 — Update Cross-References

1. If any folder was renamed, renumbered, or moved, grep for all old references
2. Update every broken reference to the new path
3. Run the link scanner: `node linter-scripts/generate-dashboard-data.cjs`
4. Confirm zero broken links

> **This process is NOT optional.** If inconsistencies exist, they MUST be fixed before any new spec work begins.

---

## Reliability Check Report

Every module SHOULD include a **reliability risk assessment** to evaluate implementation feasibility before coding begins. These reports are stored in `spec/validation-reports/` or inline within the module.

### What It Covers

| Section | Content |
|---------|---------|
| **Complexity Tier** | Simple / Medium / Complex Agentic / End-to-End |
| **Success Probability** | Estimated % chance of first-pass implementation success |
| **Failure Modes** | Where, why, and how failures can manifest |
| **Risk Mitigations** | Specific actions to reduce failure likelihood |
| **Dependency Risks** | External APIs, shared modules, or integrations that add risk |

### When to Create

- Before implementing any **Complex Agentic** or **End-to-End** module
- When a module's AI Confidence Score is below 70%
- When multiple modules have interdependencies
- After a major spec rewrite or architectural change

---

## Cross-Reference Validation Checklist

Every spec file must pass these cross-reference checks:

| # | Check | Rule |
|---|-------|------|
| 1 | **Relative paths only** | Never use root-relative (`/spec/...`) or absolute filesystem paths |
| 2 | **File extension included** | Always end with `.md` — never bare paths |
| 3 | **Target exists** | Every linked file must exist on disk |
| 4 | **Lowercase paths** | Path segments must be entirely lowercase kebab-case |
| 5 | **Depth correctness** | Count `../` levels carefully from source to target |
| 6 | **Bidirectional linking** | If module A references module B, module B should reference A |
| 7 | **Post-rename audit** | After any module renumbering, grep and update ALL references |

**Automated validation:** Run `node linter-scripts/generate-dashboard-data.cjs` — the output JSON reports all broken links. Zero broken links = passing.

See [08-cross-references.md](./08-cross-references.md) for full syntax and examples.

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`08-cross-references.md`](./08-cross-references.md) — Cross-reference syntax
- [`10-mandatory-linter-infrastructure.md`](./10-mandatory-linter-infrastructure.md) — Linter scripts
- [`11-ai-onboarding-prompt.md`](./11-ai-onboarding-prompt.md) — Full AI onboarding prompt
