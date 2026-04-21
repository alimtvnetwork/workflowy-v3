# The `.lovable/` Folder Guide

> **Parent:** [`00-overview.md`](./00-overview.md)
> **Category:** Guide

---

The `.lovable/` directory is the **institutional knowledge hub** for the project. It persists AI-learned patterns, decisions, and workflows across sessions.

## Canonical Structure

```
.lovable/
├── memories/                    # ← CANONICAL memory folder (single source of truth)
│   ├── 00-memory-index.md       # Complete inventory of all memory files
│   ├── readme.md                # Simplified high-level overview
│   ├── architecture/            # System design decisions
│   ├── constraints/             # Hard rules (e.g., no-code policy, coding standards)
│   ├── features/                # Feature-specific knowledge
│   ├── guidelines/              # Development guidelines
│   ├── logic/                   # Business logic, formulas, algorithms
│   ├── patterns/                # Reusable templates
│   ├── pending/                 # Work-in-progress / pending tasks
│   ├── planned/                 # Planned tasks (queued for future work)
│   ├── done/                    # Completed tasks archive
│   ├── completed-issues/        # Resolved issues archive
│   ├── project/                 # Project status and tracking
│   ├── qa/                      # Quality standards
│   ├── reports/                 # Reliability reports, audit reports
│   ├── spec-management/         # Spec management conventions
│   ├── suggestions/             # Suggestion tracking
│   │   └── completed/           # Archived completed suggestions
│   ├── training/                # AI training materials
│   ├── ui/                      # UI component patterns
│   ├── workflow/                # Process conventions
│   └── wp-plugins/              # WordPress plugin knowledge
├── plan.md                      # Current execution plan
├── reliability-risk-report.md   # Project-level reliability assessment
└── [other root files]           # Standards archive, audit history, etc.
```

## Task & Issue Tracking Folders

The memory folder includes dedicated folders for tracking work items:

| Folder | Purpose | When to Use |
|--------|---------|-------------|
| `pending/` | Tasks currently in progress or awaiting action | Active work items, blocked tasks |
| `planned/` | Tasks queued for future execution | Upcoming batches, prioritized backlog |
| `done/` | Completed tasks archive | Finished work items (move from pending/planned) |
| `completed-issues/` | Resolved issues archive | Bug fixes, resolved problems, closed issues |

> **Workflow:** Create task files in `planned/` → move to `pending/` when work starts → move to `done/` when complete. Issues follow the same flow but end in `completed-issues/`.

## Consolidation Rule

> **There is only ONE memory folder: `.lovable/memories/`.** The legacy `.lovable/memory/` variant is prohibited. If found during audits, migrate all contents to `.lovable/memories/` and delete the legacy folder.

## Memory File Conventions

| Rule | Detail |
|------|--------|
| **Naming** | Lowercase kebab-case; numeric prefixes optional (unlike spec files) |
| **Format** | Every file: H1 title → metadata (Updated, Version, Status) → Overview → Content → Cross-References |
| **Index** | Always update `00-memory-index.md` when adding/removing files |
| **Depth** | Maximum 2 levels: `memories/{category}/{file}.md` |
| **No duplication** | Don't duplicate information already in spec files |

## What Goes in Memories vs. Specs

| Content | Location |
|---------|----------|
| Formal specifications, APIs, data models | `spec/` |
| Architectural decisions, conventions, patterns | `.lovable/memories/` |
| Execution plans and batch tracking | `.lovable/plan.md` |
| Suggestion tracking | `.lovable/memories/suggestions/` |
| Pending / planned / done tasks | `.lovable/memories/pending/`, `planned/`, `done/` |
| Completed issues | `.lovable/memories/completed-issues/` |
| Reliability assessments | `.lovable/memories/reports/` or `spec/validation-reports/` |

## Where AI Should Write Updates

When an AI agent learns something new or the user provides instructions:

| User Says | AI Writes To |
|-----------|-------------|
| "Remember this pattern" | `.lovable/memories/patterns/` or relevant category |
| "Add this to the plan" | `.lovable/plan.md` |
| "Track this task" | `.lovable/memories/planned/` or `pending/` |
| "This issue is resolved" | Move to `.lovable/memories/completed-issues/` |
| "Update coding guidelines" | `.lovable/memories/constraints/` |
| "Add WP plugin spec" | `spec/XX-wp-plugin-name/` (spec tree) |
| "Remember WP plugin convention" | `.lovable/memories/wp-plugins/` |

See [07-memory-folder-guide.md](./07-memory-folder-guide.md) for the complete memory folder guide.

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`07-memory-folder-guide.md`](./07-memory-folder-guide.md) — Detailed memory folder guide
