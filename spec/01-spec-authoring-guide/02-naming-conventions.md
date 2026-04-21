# Naming Conventions

> **Version:** 3.4.0  
> **Updated:** 2026-04-19

---

## Overview

All files and folders in the `spec/` and `.lovable/memory/` trees follow strict naming conventions. These rules are non-negotiable and enforced by the health dashboard scanner.

---

## Folder Naming

### Format

```
{NN}-{kebab-case-name}/
```

### Rules

1. **Two-digit numeric prefix** — Always zero-padded (e.g., `01`, `08`, `33`)
2. **Kebab-case** — All lowercase, words separated by hyphens
3. **No spaces, underscores, or camelCase**
4. **Descriptive slug** — The name should clearly identify the module's purpose

### Examples

✅ Correct:
```
09-gsearch-cli/
01-backend/
03-coding-guidelines/
99-archive/
```

❌ Incorrect:
```
gsearch-cli/          # Missing numeric prefix
08_gsearch_cli/       # Underscores instead of hyphens
08-GSearchCli/        # PascalCase
8-gsearch-cli/        # Single-digit prefix
```

---

## File Naming

### Format

```
{NN}-{kebab-case-name}.md
```

### Rules

1. **Two-digit numeric prefix** — Sequential within the folder
2. **Kebab-case** — All lowercase, words separated by hyphens
3. **`.md` extension** — All spec files are Markdown
4. **No gaps in sequence** — Content files (01–89) should be contiguous

### Examples

✅ Correct:
```
00-overview.md
01-architecture.md
07-error-codes.md
97-acceptance-criteria.md
99-consistency-report.md
```

❌ Incorrect:
```
overview.md               # Missing numeric prefix
01-Architecture.md        # Capital letter
01_architecture.md        # Underscore
architecture-01.md        # Number at end
1-architecture.md         # Single-digit prefix
```

---

## Reserved File Prefixes

These numeric prefixes have fixed meanings across the entire spec tree:

| Prefix | File | Purpose | Required? |
|--------|------|---------|-----------|
| `00` | `00-overview.md` | Module index — lists all files, provides metadata | ✅ Always required |
| `96` | `96-ai-context.md` | AI-specific context notes | Optional |
| `97` | `97-acceptance-criteria.md` | Testable acceptance criteria | ✅ Recommended for all modules |
| `98` | `98-changelog.md` | Chronological change log | Optional (recommended for active modules) |
| `99` | `99-consistency-report.md` | Structural health report | ✅ Always required at top-level |

---

## Reserved Folder-Prefix Bands (Root Level)

Top-level `spec/NN-*/` folders are grouped into numeric bands. Gaps between bands are **intentional reserved space** for future growth — not numbering errors.

| Band | Range | Purpose | Examples |
|------|-------|---------|----------|
| Authoring & Process | `01`–`03` | How specs themselves are written / governed | `01-spec-authoring-guide`, `02-coding-guidelines`, `03-error-manage` |
| Data & Architecture | `04`–`07` | Cross-cutting data, config, design foundations | `04-database-conventions`, `05-split-db-architecture`, `07-design-system` |
| Subsystems | `08`–`11` | Reusable subsystems and integrations | `08-docs-viewer-ui`, `10-powershell-integration` |
| Consolidation | `12` | Cross-cutting summaries | `12-consolidated-guidelines` |
| Delivery & Tooling | `13`–`17` | CI/CD, generic tooling, packaging | `13-cicd-pipeline-workflows`, `16-generic-cli` |
| Spec Hygiene | `18` | Spec-tree audits & remediation logs | `18-spec-issues` |
| **Reserved** | `19`–`30` | Intentionally unused — future fundamentals | _(none)_ |
| App-Specific | `31`–`39` | This product's app domain | `31-app`, `32-ui-design`, `33-feedback-report` |

**Resolution of I-01 + I-11:** The 19–30 gap is reserved by design. Slot `18` is documented above as the canonical home for spec-hygiene work. Do not backfill 19–30 unless a genuinely new fundamentals-tier domain emerges.

---

## Non-Markdown Files

Some modules contain non-markdown files. These follow relaxed naming:

| File Type | Naming Rule | Example |
|-----------|-------------|---------|
| JSON data files | Kebab-case, no numeric prefix | `error-codes.json` |
| Configuration | Kebab-case | `config.json` |
| Diagrams | Kebab-case with prefix | `01-architecture-diagram.svg` |

---

## Metadata Header

Every `.md` file MUST begin with a standardized metadata header in **blockquote form**:

```markdown
# Title of the Document

> **Version:** X.Y.Z  
> **Updated:** YYYY-MM-DD

---
```

### Rules

- **H1 title** — First line, exactly one per file
- **Blockquote prefix** — Both `Version` and `Updated` lines MUST be prefixed with `> ` (canonical form, matches `mem://docs/specifications`)
- **Version** — Semantic versioning (Major.Minor.Patch)
- **Updated** — ISO date format (YYYY-MM-DD). The label MUST be `Updated:` — never `Last Updated:`
- **Horizontal rule** — Separates metadata from content

### Optional Metadata Fields

If used, they also belong inside the blockquote:

```markdown
> **Status:** Draft | Active | Deprecated  
> **Language:** Go | Rust | TypeScript | PHP  
> **Priority:** Critical | High | Medium | Low
```

> **Note:** Forbidden fields in `00-overview.md` (per spec hygiene audit I-07): `AI Confidence`, `Ambiguity`, `Health Score`, `Keywords`, `Scoring`, `Status` blocks. These will be stripped in Phase 3.

---

## Source Code Files (Non-Spec)

Source code files in `src/` follow **different** conventions:

| Language | Convention | Example |
|----------|-----------|---------|
| TypeScript/React | PascalCase for components | `SpecFileViewer.tsx` |
| TypeScript | camelCase for utilities | `utils.ts` |
| Entry points | Lowercase | `main.ts`, `index.tsx` |
| Go / Rust | snake_case for files | `mapper_test.go`, `lib_utils.rs` |
| PHP (procedural/config) | snake_case allowed | `constants.php` |

**Important:** Spec files and source code files use DIFFERENT naming conventions. Do not mix them.

---

## Underscore Rule — Scope Clarification

The "no underscores" rule applies **only to the `spec/` and `.lovable/memory/` trees** (folder + file names). It does **not** govern source code.

| Domain | Underscores Allowed? | Authority |
|--------|----------------------|-----------|
| `spec/**` filenames & folders | ❌ Never | This file (kebab-case mandate) |
| `.lovable/memory/**` filenames | ❌ Never | This file (kebab-case mandate) |
| Source code identifiers (constants, variables) | ✅ Per language | Language-specific guides under `spec/02-coding-guidelines/` |
| Source code filenames (Go `_test.go`, Rust modules, PHP procedural) | ✅ Per language | Language-specific guides + `spec/16-generic-cli/08-code-style.md` |
| Database persistence keys (WP `wp_options`, SQLite `_snapshot_meta`) | ✅ Native casing retained | `spec/02-coding-guidelines/04-php/03-naming-conventions/03-array-keys.md` |

**Resolution of I-09:** There is no contradiction. The strict-avoid rule is documentation-tree-scoped; source-code conventions remain governed by their language guides.
