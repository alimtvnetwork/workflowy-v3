---
name: Specifications
description: Structure and style rules for the spec/ directory. SCOPE LOCKED to folders 18+ only. Includes F-AUDIT-34 cross-walk methodology (7 instances proven).
type: reference
---
- **SCOPE LOCK (CRITICAL):** Only modify spec folders **18 and above**. Folders 01-17 are READ-ONLY — never edit, split, restructure, or run hygiene/auto-TOC scripts that touch them. Allowed editable scopes: `18-spec-issues/`, `31-app/`, `32-ui-design/`, `33-feedback-report/`, `34-activity-feed/`, `35-enforcement-rules/`, `36-user-management/`, and any future folders ≥18. Root files (`19-glossary.md`, `20-enums-index.md`, `21-ai-readiness-audit-round-2.md`, `99-consistency-report.md`, `spec-index.md`) are also editable.
- **Forbidden references:** Do not propose work, splits, link updates, or hygiene runs against `01-spec-authoring-guide`, `02-coding-guidelines`, `03-error-manage`, `04-database-conventions`, `05-split-db-architecture`, `06-seedable-config-architecture`, `07-design-system`, `08-docs-viewer-ui`, `09-code-block-system`, `10-powershell-integration`, `11-research`, `12-consolidated-guidelines`, `13-cicd-pipeline-workflows`, `14-self-update-app-update`, `15-wp-plugin-how-to`, `16-generic-cli`, `17-generic-update`. Read-only.
- **R3-1 task is void:** The 400-line-cap splitting task only targeted 02-coding-guidelines files — do not resume it. Do not suggest it as "next".
- Required overview: Every editable spec folder must contain a `00-overview.md` file at its root. Subfolders with multiple files should also include their own `00-overview.md`.
- Style: Specs must be purely descriptive of behavior/UX/architecture; strictly forbidden from containing implementation code.
- Header: Standard versioning header in blockquote required at top: `> **Version:** X.Y.Z \n> **Updated:** YYYY-MM-DD`. No other metadata fields allowed.

## Gate naming conventions & overload caveats (added 2026-04-30)

Gate IDs follow `G-{namespace}-{rule}` where `{namespace}` is one of:

- **`G-{NN}-*`** — spec-folder-tier gates (e.g., `G-02-*` for coding-guidelines, `G-32-*` for ui-design). **`G-32-*` is overloaded**: it covers both folder-32 spec rules AND design-token rules (HSL-only, `@theme` block SSOT). Always grep both interpretations.
- **`G-ADR-{NNNN}-*`** — Domain-ADR umbrella gates (e.g., `G-ADR-0003-VITE-5_4-PINNED`, `G-ADR-0003-FRONTEND-STACK-LOCK`). Single ADR may spawn 8+ child gates under one umbrella.
- **`G-CG-R{N}-*`** — Coding-Guideline runtime gates enforced by ESLint (e.g., `G-CG-R5-MAX-LOGIC-LINES`, `G-CG-R6-POSITIVE-GUARDS`). These live in `eslint-plugin-local/` rules, NOT spec folders.
- **`G-A11Y-*`**, **`G-EDGE-*`**, **`G-NS-*`** — implementation-folder namespaces (a11y rules, edge cases, namespace ledgers).

## F-AUDIT-34 cross-walk methodology (MANDATORY before authoring "missing" gate)

**7 false-positive instances proven** between 2026-04-28 and 2026-04-30 (instances #1–#7 logged in `spec/AUDIT-FINDINGS-LEDGER.md` as F-AUDIT-34..F-AUDIT-38). Pattern: per-namespace grep against `G-{NN}-*` alone misses Domain-ADR umbrellas and ESLint-tier enforcement, leading to redundant gate authoring.

**Required cross-walk before claiming a Core memory rule is uncovered:**

1. Grep `G-{NN}-*` (spec-folder tier) — e.g., `rg "G-02-" spec/`.
2. Grep `G-ADR-{any}-*` umbrellas for the topic — e.g., `rg "G-ADR-0003-" spec/`.
3. Grep `G-CG-R{any}-*` ESLint-tier — e.g., `rg "G-CG-R" eslint-plugin-local/ spec/`.
4. Grep `G-A11Y-*`, `G-EDGE-*`, `G-NS-*` implementation namespaces.
5. Grep `_LEDGER-G-*.md` and `spec/_GATE-REGISTRY.md` for any gate touching the rule's keywords.
6. Only after all 5 searches return no match may a new gate be authored. **Document each search command in the gate-authoring task.**

**Anti-recurrence rule:** Any task proposing a new gate MUST include the 5-step grep evidence inline; otherwise it is presumed to be an F-AUDIT-34 instance and rejected.
