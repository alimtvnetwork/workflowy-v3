# Spec Authoring Guide — Acceptance Criteria

> **Version:** 3.2.0  
> **Updated:** 2026-04-29 — renamed 4 section headers `AC-01..04` → `AT-SPECAUTHORING-G01..G04` and 18 row IDs `AC-001..018` → `AT-SPECAUTHORING-001..018` (audit task #20, P3 hot-spot closed). Cascading refs in `00-overview.md` updated; template-example IDs in `03-required-files.md` and `04-cli-module-template.md` migrated to `AT-EXAMPLE-NNN`. **22 active legacy IDs migrated; new `AT-SPECAUTHORING-` namespace registered.**

---

## Overview

18 testable criteria across 4 areas covering spec structure, naming, content, and tooling.

---

## AT-SPECAUTHORING-G01: Folder Structure & Required Files

| # | Criterion | Source |
|---|-----------|--------|
| AT-SPECAUTHORING-001 | Every spec module has `00-overview.md` at root | `03-required-files.md` |
| AT-SPECAUTHORING-002 | Every spec module has `99-consistency-report.md` at root | `03-required-files.md` |
| AT-SPECAUTHORING-003 | CLI modules follow 3-folder pattern (`01-backend/`, `02-frontend/`, `03-deploy/`) | `04-cli-module-template.md` |
| AT-SPECAUTHORING-004 | Subfolders with 3+ files include their own `00-overview.md` | `03-required-files.md` |

---

## AT-SPECAUTHORING-G02: Naming Conventions

| # | Criterion | Source |
|---|-----------|--------|
| AT-SPECAUTHORING-005 | All files use lowercase kebab-case naming | `02-naming-conventions.md` |
| AT-SPECAUTHORING-006 | All folders use lowercase kebab-case naming | `02-naming-conventions.md` |
| AT-SPECAUTHORING-007 | All spec files have unique numeric sequence prefixes within their folder | `02-naming-conventions.md` |
| AT-SPECAUTHORING-008 | Reserved prefixes (00, 97, 98, 99) used only for their designated purposes | `02-naming-conventions.md` |

---

## AT-SPECAUTHORING-G03: Overview Content Standards

| # | Criterion | Source |
|---|-----------|--------|
| AT-SPECAUTHORING-009 | Every `00-overview.md` includes Version and Updated metadata | `00-overview.md` |
| AT-SPECAUTHORING-010 | Every `00-overview.md` includes AI Confidence score | `00-overview.md` |
| AT-SPECAUTHORING-011 | Every `00-overview.md` includes Ambiguity score | `00-overview.md` |
| AT-SPECAUTHORING-012 | Every `00-overview.md` includes Keywords section | `00-overview.md` |
| AT-SPECAUTHORING-013 | Every `00-overview.md` includes Scoring table | `00-overview.md` |
| AT-SPECAUTHORING-014 | Every `00-overview.md` includes numbered file inventory table | `00-overview.md` |
| AT-SPECAUTHORING-015 | Every `00-overview.md` includes Cross-References table | `00-overview.md` |

---

## AT-SPECAUTHORING-G04: Cross-References & Validation

| # | Criterion | Source |
|---|-----------|--------|
| AT-SPECAUTHORING-016 | All cross-references use relative paths (never root-relative or absolute) | `08-cross-references.md` |
| AT-SPECAUTHORING-017 | All linked files include `.md` extension | `08-cross-references.md` |
| AT-SPECAUTHORING-018 | Zero broken links reported by dashboard scanner | `08-cross-references.md` |

---

## Cross-References

- [Overview](./00-overview.md)
- [Required Files](./03-required-files.md)
- [Naming Conventions](./02-naming-conventions.md)
- [Cross-References Guide](./08-cross-references.md)


---

## Fixtures

Fixtures for every AT row in this file are covered by the global P2g sweep — see [`../97a-acceptance-criteria-fixtures.md`](../97a-acceptance-criteria-fixtures.md) (apply the matching pattern by section).

---

## Enforcement Gate

**`G-01-AT-ID-FORMAT-CANONICAL`** (CI, minted 2026-04-29 — see `_GATE-REGISTRY.md` → Spec-Authoring).

- **Regex:** `^AT-[A-Z][A-Z0-9]*(-[A-Z0-9]+)*-[GA-Z]?[0-9]{2,3}$`
- **Scope:** all `spec/**/97-acceptance-criteria.md` and `spec/**/97a-acceptance-criteria-fixtures.md`.
- **Exempt zones (lint MUST strip before regex):** fenced code blocks (```` ``` ````) and inline `code spans` (single backticks). This carve-out exists because guidance docs legitimately quote legacy IDs as illustrative bad-examples.
- **Failure mode:** CI lint emits `<file>:<line>: non-canonical AT-ID '<token>'` and exits non-zero.
- **Enforceable since:** 2026-04-29 (legacy `AC-NNN` sweep closed at 0/2,387 — no exemption list required).
