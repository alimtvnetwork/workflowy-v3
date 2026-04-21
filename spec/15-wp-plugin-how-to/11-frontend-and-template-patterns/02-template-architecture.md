# 11.2 Template Architecture

> **Parent:** [00-overview.md](./00-overview.md)

## Directory structure

```
plugin-slug/
├── templates/
│   ├── admin-settings.php           ← Page template (orchestrator)
│   ├── admin-logs.php               ← Page template
│   ├── admin-agents.php             ← Page template
│   └── partials/
│       ├── shared/                   ← Cross-page reusable partials
│       │   ├── page-header.php       ← Standard header with icon + title + version
│       │   ├── pagination.php        ← Pagination controls
│       │   ├── modal-wrapper.php     ← Modal shell (content injected)
│       │   ├── notice.php            ← Admin notice partial
│       │   └── empty-state.php       ← "No data" placeholder
│       ├── settings/                 ← Settings-page-specific partials
│       │   ├── section-general.php
│       │   ├── section-advanced.php
│       │   └── section-update.php
│       ├── logs/                     ← Logs-page-specific partials
│       │   ├── log-filters.php
│       │   └── log-table.php
│       └── agents/                   ← Agents-page-specific partials
│           ├── agent-form.php
│           └── agent-list.php
```

## Naming conventions

| Convention | Example | Rule |
|-----------|---------|------|
| Page templates | `admin-{page}.php` | One per admin page |
| Shared partials | `partials/shared/{name}.php` | Reused across 2+ pages |
| Page partials | `partials/{page}/{name}.php` | Specific to one page |
| Prefix pattern | `section-`, `form-`, `list-`, `table-`, `modal-` | Describes the UI element |
