# Folder Structure Examples

> **Parent:** [`00-overview.md`](./00-overview.md)
> **Category:** Architecture

---

## Standard Module (Flat)

```
spec/17-research-queries/
├── 00-overview.md
├── 01-query-types.md
├── 02-search-algorithms.md
├── 97-acceptance-criteria.md
└── 99-consistency-report.md
```

## CLI Tool Module (3-Folder Pattern)

```
spec/09-gsearch-cli/
├── 00-overview.md
├── 01-backend/
│   ├── 01-architecture.md
│   ├── 02-commands.md
│   └── 03-api-design.md
├── 02-frontend/
│   ├── 01-ui-components.md
│   └── 02-user-flows.md
├── 03-diagrams/
│   └── 01-architecture-diagram.md
├── 97-acceptance-criteria.md
└── 99-consistency-report.md
```

## WordPress / App Module (Features + Issues Pattern)

App and WordPress projects use `01-fundamentals.md` as the first content file, then `02-features/` and `03-issues/` folders:

```
spec/13-wp-plugin/03-exam-manager/
├── 00-overview.md
├── 01-fundamentals.md                    # Core architecture, schema, lifecycle
│
├── 02-features/                          # Feature specifications
│   ├── 00-overview.md                   # Feature index with status table
│   ├── 01-exam-builder/
│   │   ├── 00-overview.md
│   │   ├── 01-backend.md
│   │   ├── 02-frontend.md
│   │   └── 03-wp-admin.md
│   └── 02-question-bank/
│       ├── 00-overview.md
│       ├── 01-backend.md
│       └── 02-frontend.md
│
├── 03-issues/                            # Tracked issues and investigations
│   ├── 00-overview.md                   # Issue index with status/severity
│   ├── 01-score-rounding/
│   │   ├── 00-overview.md
│   │   ├── 01-investigation.md
│   │   └── 02-resolution.md
│   └── 02-wp-65-compat.md              # Simple issues can be single files
│
├── 97-acceptance-criteria.md
└── 99-consistency-report.md
```

> **Key insight:** App/WP projects split features into `01-backend.md`, `02-frontend.md`, `03-wp-admin.md` inside each feature folder. Issues follow the same `{NN}-{kebab-name}` convention with `00-overview.md` required for multi-file issues. See [05-app-project-template.md](./05-app-project-template.md) for the full template.

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`01-folder-structure.md`](./01-folder-structure.md) — Canonical structure rules
- [`04-cli-module-template.md`](./04-cli-module-template.md) — CLI template
- [`05-app-project-template.md`](./05-app-project-template.md) — App template
- [`06-non-cli-module-template.md`](./06-non-cli-module-template.md) — Non-CLI template
