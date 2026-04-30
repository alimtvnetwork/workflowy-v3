# 11.1 File Size Limits

> **Parent:** [00-overview.md](./00-overview.md)

Every file in the plugin — PHP classes, traits, templates, partials, JS, CSS — must respect strict line limits.

| File type | Ideal | Maximum | Action when exceeded |
|-----------|-------|---------|---------------------|
| PHP template (page) | 50–100 | 200 | Extract sections into `partials/` |
| PHP partial | 30–50 | 100 | Split into smaller partials |
| PHP class / trait | 50–100 | 200 | Decompose into additional traits (Phase 3) |
| JavaScript file | 50–100 | 200 | Extract into modules |
| CSS file | 50–100 | 200 | Split by component or section |

**Rule:** If a file exceeds 200 lines, it **must** be refactored before merging. No exceptions.

## Why this matters

- Files under 100 lines are easier to review, test, and debug
- Smaller files reduce merge conflicts
- AI code generators produce higher-fidelity output (measurably fewer hallucinated symbols and reference errors) when working with focused, single-purpose files
- Long templates are a sign of missing abstraction
