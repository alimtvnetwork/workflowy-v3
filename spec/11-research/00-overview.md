# Research


> **Version:** 3.1.0  
> **Updated:** 2026-04-16  


---

## AI Contract

**Purpose** — Holds in-progress research notes that have not yet been promoted to a normative spec section. Files here are advisory and MUST NOT be cited as a source of truth.

**Audience** — Spec authors evaluating new ideas; reviewers checking provenance of design decisions.

**Expected AI Output** —
- `spec/11-research/<topic>.md` — research note with explicit "Status: Research" header

**Out of Scope** —
- Anything normative — once a research file becomes binding, it MUST be moved into a numbered section and given an AT row.

**Definition of Done** —
- Every file in this folder carries `> **Status:** Research (not normative)` in its front-matter
- `AT-RESEARCH-01` from `97-acceptance-criteria.md` passes (or the file is empty)
- `node scripts/spec-hygiene/00-run-all.mjs` exits 0

> Authoring rules: see [`spec/01-spec-authoring-guide/18-ai-contract-template.md`](../01-spec-authoring-guide/18-ai-contract-template.md).

---

## Keywords

`research`

---

## Scoring

| Criterion | Status |
|-----------|--------|
| `00-overview.md` present | ✅ |
| AI Confidence assigned | ✅ |
| Ambiguity assigned | ✅ |
| Keywords present | ✅ |
| Scoring table present | ✅ |
| AI Confidence (auto-backfill) | Medium |
| Ambiguity (auto-backfill) | Medium |

---


## Overview

Dedicated folder for all exploratory and evaluative work that supports the spec system. This is the **single canonical location** for research content at the root spec level.

---

## What Belongs Here

| Content Type | Examples |
|-------------|----------|
| Comparative studies | Framework X vs Framework Y |
| Technology evaluations | Assessing a new library or tool |
| Exploratory technical notes | Proof-of-concept findings |
| Game development research | Engine comparisons, architecture patterns |
| Language evaluations | Assessing a new language for the stack |

## Placement Rule

All root-level research content MUST be placed in this folder (`spec/10-research/`) unless explicitly categorized elsewhere. Language-specific research within coding guidelines belongs in `spec/02-coding-guidelines/10-research/`.

---

## Contents

_No research documents added yet. Add research files as numbered entries (e.g., `01-framework-comparison.md`)._

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Coding Guidelines Research | [../02-coding-guidelines/10-research/00-overview.md](../02-coding-guidelines/10-research/00-overview.md) |
| Spec Authoring Guide | [../01-spec-authoring-guide/00-overview.md](../01-spec-authoring-guide/00-overview.md) |
| Consolidated Guidelines | [../12-consolidated-guidelines/12-root-research.md](../12-consolidated-guidelines/12-root-research.md) |

---

## Related

**See also:**

- [`../00-overview.md`](../00-overview.md) — Parent overview
