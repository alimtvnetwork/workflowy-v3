# 20.16 Phase Coverage Matrix

> **Parent:** [Phase 20 overview](./00-overview.md)

---

Every phase of the Gold Standard applied in this walkthrough:

| Phase | Where Applied | Step |
|-------|---------------|------|
| **0 — Quick Start** | Followed the 5-file creation order | Steps 2–7 |
| **1 — Foundation** | Folder structure, ABSPATH guards, namespace, bootstrap | Steps 1–3 |
| **2 — Enums** | All constants as backed enums, `match` metadata, comparison trio | Step 4 |
| **3 — Traits** | ResponseTrait, AuthTrait, TypeCheckerTrait, feature traits | Steps 6–10 |
| **4 — Logging** | FileLogger, two-tier architecture, debug-mode gating, shutdown handler | Steps 5, 7 |
| **5 — Helpers** | EnvelopeBuilder, PathHelper, DateHelper, ErrorLogHelper | Step 6 |
| **6 — Validation** | Guard clauses, `validationError()`, type checking, sanitisation | Step 10 |
| **7 — Reference Impl** | All files follow Phase 7 templates with search-replace | Steps 2–7 |
| **8 — WP Integration** | Admin menu, settings page, SQLite migration | Steps 9, 11, 12 |
| **9 — Testing** | PHPUnit test structure, enum tests | Step 13 |
| **10 — Deployment** | Uninstall cleanup | Step 14 |
| **11 — Frontend** | Template ≤200 lines, output escaping | Step 11 |
| **12 — Design System** | CSS variable tokens in admin styles, slug substitution | Step 11 |
| **13 — Admin UI** | Settings page layout, form controls | Step 11 |
| **14 — REST API** | Namespace, route naming, grouped registration | Steps 4, 8 |
| **15 — Settings** | `OptionNameType`, settings registration, defaults | Step 12 |
| **16 — Error Handling** | `ErrorResponse`, forbidden patterns avoided | Steps 2, 10 |
| **17 — Data Files** | Seed manifest (referenced) | Step 1 folder structure |
| **18 — Frontend JS** | (Not needed — no JS interactivity in this minimal example) | — |
| **19 — Micro-ORM** | (Not used — direct PDO for minimal plugin; use ORM for complex queries) | — |
