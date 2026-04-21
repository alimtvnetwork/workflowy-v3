---
name: Specifications
description: Structure and style rules for the spec/ directory. SCOPE LOCKED to folders 18+ only.
type: reference
---
- **SCOPE LOCK (CRITICAL):** Only modify spec folders **18 and above**. Folders 01-17 are READ-ONLY — never edit, split, restructure, or run hygiene/auto-TOC scripts that touch them. Allowed editable scopes: `18-spec-issues/`, `31-app/`, `32-ui-design/`, `33-feedback-report/`, `34-activity-feed/`, `35-enforcement-rules/`, `36-user-management/`, and any future folders ≥18. Root files (`19-glossary.md`, `20-enums-index.md`, `21-ai-readiness-audit-round-2.md`, `99-consistency-report.md`, `spec-index.md`) are also editable.
- **Forbidden references:** Do not propose work, splits, link updates, or hygiene runs against `01-spec-authoring-guide`, `02-coding-guidelines`, `03-error-manage`, `04-database-conventions`, `05-split-db-architecture`, `06-seedable-config-architecture`, `07-design-system`, `08-docs-viewer-ui`, `09-code-block-system`, `10-powershell-integration`, `11-research`, `12-consolidated-guidelines`, `13-cicd-pipeline-workflows`, `14-self-update-app-update`, `15-wp-plugin-how-to`, `16-generic-cli`, `17-generic-update`. Read-only.
- **R3-1 task is void:** The 400-line-cap splitting task only targeted 02-coding-guidelines files — do not resume it. Do not suggest it as "next".
- Required overview: Every editable spec folder must contain a `00-overview.md` file at its root. Subfolders with multiple files should also include their own `00-overview.md`.
- Style: Specs must be purely descriptive of behavior/UX/architecture; strictly forbidden from containing implementation code.
- Header: Standard versioning header in blockquote required at top: `> **Version:** X.Y.Z \n> **Updated:** YYYY-MM-DD`. No other metadata fields allowed.
