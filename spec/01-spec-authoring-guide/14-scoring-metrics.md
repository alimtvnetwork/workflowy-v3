# Scoring Metrics

> **Parent:** [`00-overview.md`](./00-overview.md)
> **Category:** Rules

---

(gate **G-NS-STATUS-FRONTMATTER-EXACTLY-ONE**) Every `00-overview.md` MUST include these three scores.

## AI Confidence

Measures how ready the specification is for an AI agent to implement the described feature.

| Tier | Icon | Meaning | When to Use |
|------|------|---------|-------------|
| **Production-Ready** | ✅ | Specs are complete, unambiguous, and fully implementable | All interfaces defined, acceptance criteria explicit, error codes mapped |
| **High** | 🟢 | Minor gaps exist but AI can proceed with reasonable assumptions | Most sections complete; a few edge cases undefined |
| **Medium** | 🟡 | Significant gaps; AI will need clarification or make risky assumptions | Missing types, partial acceptance criteria, unclear validation rules |
| **Low** | 🔴 | Major sections missing; do NOT attempt implementation | No interfaces, no acceptance criteria, vague requirements |

**Factors that increase confidence:** Complete interfaces, explicit acceptance criteria, error code mappings, clear data models, defined API contracts.

**Factors that decrease confidence:** Missing types, vague requirements ("should handle errors"), undefined edge cases, no acceptance criteria.

## Ambiguity

Measures how much interpretation is required. **Lower tiers are better.**

| Tier | Icon | Meaning | When to Use |
|------|------|---------|-------------|
| **None** | ✅ | No interpretation needed; every detail is explicit | All fields typed, all flows documented, all errors handled |
| **Low** | 🟢 | A few areas need assumptions; acceptable for implementation | Minor gaps in edge cases or optional features |
| **Medium** | 🟡 | Multiple areas require interpretation; review recommended | Several undefined behaviors, partial validation rules |
| **High** | 🟠 | Many areas open to interpretation; rewrite recommended | Missing data models, unclear permissions, vague UI specs |
| **Critical** | 🔴 | Spec is too vague to implement; MUST be rewritten | <!-- (gate **G-NS-STATUS-FRONTMATTER-EXACTLY-ONE**) --> No clear structure, contradictory requirements, missing core definitions |

**Common ambiguity sources:** Undefined field types, unclear validation rules, missing error handling paths, unspecified permissions, vague UI requirements.

## Health Score (0–100)

Structural compliance score calculated by the dashboard scanner:

| Criterion | Weight |
|-----------|--------|
| `00-overview.md` present | 25% |
| `99-consistency-report.md` present | 25% |
| Lowercase kebab-case naming | 25% |
| Unique numeric sequence prefixes | 25% |

**100/100 = A+** — All four criteria met.

---

## File Categories

Every spec file falls into one of these categories. When creating a new file, assign it the correct category to help AI agents and contributors navigate:

| Category | Purpose | Examples |
|----------|---------|----------|
| **Overview** | Module entry point with metadata and file index | `00-overview.md` |
| **Architecture** | System design, data flow, component structure | `01-architecture.md`, `02-data-model.md` |
| **API / Interface** | Endpoints, contracts, request/response schemas | `03-api-design.md`, `04-rest-endpoints.md` |
| **Logic / Rules** | Business logic, validation rules, algorithms | `05-validation-rules.md`, `06-scoring-logic.md` |
| **UI / Frontend** | Component specs, layouts, user flows | `07-ui-components.md`, `08-user-flows.md` |
| **Backend** | Server-side implementation, database, services | `09-database-schema.md`, `10-service-layer.md` |
| **Diagrams** | Mermaid diagrams, architecture visuals, flow charts | `11-diagrams.md`, `12-sequence-diagrams.md` |
| **Testing** | Test plans, acceptance criteria, QA standards | `97-acceptance-criteria.md` |
| **Meta / Reports** | Consistency reports, changelogs, migration notes | `99-consistency-report.md`, `98-changelog.md` |

> **Rule:** Assign a category in the file's metadata block so AI agents can filter and prioritize what to read.

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`15-folder-examples.md`](./15-folder-examples.md) — Concrete folder layouts
