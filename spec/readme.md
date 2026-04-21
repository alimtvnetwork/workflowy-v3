# Specifications Index

> **Version:** 1.1.0  
> **Updated:** 2026-04-18  
> **Purpose:** Central index of all specification folders in this project.

---

## Specification Folders

| # | Folder | Description | Key Files |
|---|--------|-------------|-----------|
| 01 | [01-spec-authoring-guide/](./01-spec-authoring-guide/00-overview.md) | Spec authoring conventions and templates | `00-overview.md` |
| 02 | [02-coding-guidelines/](./02-coding-guidelines/00-overview.md) | All coding standards — naming, booleans, complexity, DRY, typing, enums, TypeScript | `00-overview.md` |
| 03 | [03-error-manage/](./03-error-manage/00-overview.md) | Error handling, modal, logging, response envelope | Per-feature subfolders |
| 04 | [04-database-conventions/](./04-database-conventions/00-overview.md) | Database naming and schema conventions | `00-overview.md` |
| 05 | [05-split-db-architecture/](./05-split-db-architecture/00-overview.md) | Split-database architecture | `01-fundamentals.md` |
| 06 | [06-seedable-config-architecture/](./06-seedable-config-architecture/00-overview.md) | Seedable configuration architecture | `01-fundamentals/00-overview.md` |
| 07 | [07-design-system/](./07-design-system/00-overview.md) | Design system and theming rules | `00-overview.md` |
| 08 | [08-docs-viewer-ui/](./08-docs-viewer-ui/00-overview.md) | Docs viewer UI specification | `01-fundamentals.md` |
| 09 | [09-code-block-system/](./09-code-block-system/00-overview.md) | Code block rendering and interactions | `00-overview.md` |
| 10 | [10-powershell-integration/](./10-powershell-integration/00-overview.md) | PowerShell integration | `00-overview.md` |
| 11 | [11-research/](./11-research/00-overview.md) | Research notes | `00-overview.md` |
| 12 | [12-consolidated-guidelines/](./12-consolidated-guidelines/00-overview.md) | Consolidated cross-module guidelines | `00-overview.md` |
| 13 | [13-cicd-pipeline-workflows/](./13-cicd-pipeline-workflows/00-overview.md) | CI/CD pipeline and release workflows | `00-overview.md` |
| 14 | [14-self-update-app-update/](./14-self-update-app-update/00-overview.md) | Self-update / app-update mechanism | `00-overview.md` |
| 15 | [15-wp-plugin-how-to/](./15-wp-plugin-how-to/00-overview.md) | WordPress plugin how-to guide | `00-overview.md` |
| 16 | [16-generic-cli/](./16-generic-cli/00-overview.md) | Generic CLI creation guidelines | `00-overview.md` |
| 17 | [17-generic-update/](./17-generic-update/00-overview.md) | Generic update / handoff mechanism | `00-overview.md` |
| ~~21~~ | _Removed (P3 cleanup)_ | Merged into `31-app/` | — |
| ~~22~~ | _Removed (P3 cleanup)_ | Merged into `02-coding-guidelines/22-app-issues/` | — |
| ~~23~~ | _Removed (P3 cleanup)_ | Merged into `04-database-conventions/` + `05-split-db-architecture/` | — |
| ~~24~~ | _Removed (P3 cleanup)_ | Merged into `32-ui-design/` | — |
| 31 | [31-app/](./31-app/00-overview.md) | Application specs — features, audits, workflows, edge cases, roadmap, conventions | `01-features/`, `02-audits/`, `03-workflows/`, `04-edge-cases/`, `05-roadmap/`, `06-conventions/` |
| 32 | [32-ui-design/](./32-ui-design/00-overview.md) | Frontend UI/UX specification — architecture, state, design system, editor, quality | `01-architecture/`, `02-state-and-data/`, `03-design-system/`, `04-editor/`, `05-quality/` |
| 33 | [33-feedback-report/](./33-feedback-report/00-overview.md) | Feedback report feature specification | `00-overview.md` |
| 34 | [34-activity-feed/](./34-activity-feed/00-overview.md) | Fleet-wide activity audit log (Feature E2) | `00-overview.md` |
| 35 | [35-enforcement-rules/](./35-enforcement-rules/00-overview.md) | Generic / type enforcement patterns | `00-overview.md` |
| 36 | [36-user-management/](./36-user-management/00-overview.md) | User management specification | `00-overview.md` |

---

## Standalone Documents

| File | Description |
|------|-------------|
| [licensing-strategy.md](./licensing-strategy.md) | Licensing strategy and implementation plan |
| [folder-structure-root.md](./folder-structure-root.md) | Root folder structure overview |
| [health-dashboard.md](./health-dashboard.md) | Spec health dashboard |
| [99-consistency-report.md](./99-consistency-report.md) | Top-level consistency report |

---

## Reading Order (for new AI sessions)

1. **Project context:** `.lovable/memory/index.md`
2. **This index** — then drill into relevant spec folders
3. **Coding standards:** `02-coding-guidelines/`
4. **Error system:** `03-error-manage/`
5. **App specs:** `31-app/`

---

*Maintain this index when adding, removing, or renumbering spec folders.*
