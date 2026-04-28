# Feedback Report — Feature Spec
## AI Contract

**Purpose** — Specify WorkFlowy's in-app feedback + bug-report feature: a Navbar-reachable form that auto-attaches diagnostic context, persists to a dedicated `feedback.db` SQLite (Split-DB pattern), and exposes an Admin-gated review UI with typed status transitions and GDPR-compliant retention.

**Audience** — Frontend dev (form + Navbar entry + Admin UI) + backend dev (feedback REST endpoints + retention job) + reviewer.

**Expected AI Output** —
- `Feedback` table migration in `feedback.db` (PascalCase, `FeedbackId INTEGER PRIMARY KEY AUTOINCREMENT`, status enum)
- `FeedbackType` + `FeedbackStatus` TypeScript enums (no magic strings)
- `src/features/feedback/FeedbackButton.tsx` + `FeedbackForm.tsx` (Navbar entry per FR-1)
- `src/features/feedback/feedback.schema.ts` (Zod schema enforcing 120/2000 char limits)
- `src/features/feedback/admin/FeedbackInbox.tsx` (Admin-role gated)
- REST endpoints under `/feedback/*` registered in [`31-app/06-endpoints/`](../31-app/06-endpoints/00-overview.md)
- Scheduled retention job (90-day default, configurable via [`06-seedable-config-architecture/`](../06-seedable-config-architecture/00-overview.md))

**Out of Scope** —
- Real-time chat support → not planned
- Public bug tracker / external ticketing → not planned
- Email reply threads / SLA escalation → [`14-self-update-app-update/`](../14-self-update-app-update/00-overview.md) covers release comms

**Definition of Done** —
- `AT-FEEDBACKREPORT-01..14` all pass per [`97-acceptance-criteria.md`](./97-acceptance-criteria.md)
- Form non-blocking with optimistic close + retry toast (per `AT-FEEDBACKREPORT-07`)
- Admin role gating uses central `hasRole(userId, 'Admin')` (per `AT-FEEDBACKREPORT-09`)
- `DeleteMyFeedback(userId)` one-shot operation passes GDPR deadline (per `AT-FEEDBACKREPORT-14`)
- `node scripts/spec-hygiene/00-run-all.mjs` exits 0

> Authoring rules: see [`spec/01-spec-authoring-guide/18-ai-contract-template.md`](../01-spec-authoring-guide/18-ai-contract-template.md).

---

> **Version:** 2.1.0
> **Updated:** 2026-04-28 (UTC+8)
> **Status:** D-grade — AI Contract filled per P5

---

## Keywords

`feedback` · `bug-report` · `user-input` · `report-generation` · `support`

---

## Scoring

| Criterion | Status |
|-----------|--------|
| `00-overview.md` present | ✅ |
| AI Contract filled | ✅ |
| Keywords present | ✅ |
| AC file curated (`AT-FEEDBACKREPORT-01..14`) | ✅ |
| Confidence | High |
| Ambiguity | Low |

---


## Purpose

Specification for the in-app feedback and bug-report feature in WorkFlowy. Lets users submit feedback, attach context (current item tree path, browser info, last actions), and lets reviewers triage submissions.

> 🟡 **Status:** This is a **planned feature** with high-level scope only. Sub-specs (data model, UI flow, retention) will be added under numbered files (`01-…md`, `02-…md`) before implementation.

---


## Scope

| In Scope | Out of Scope |
|----------|--------------|
| User-initiated feedback form (button in Navbar) | Real-time chat support |
| Bug report with auto-attached diagnostics (URL, item path, browser) | Public bug tracker |
| Severity tagging (`bug` / `idea` / `praise` / `question`) | Email reply threads |
| Local persistence to feedback SQLite (Split DB pattern) | External ticketing integration |
| Admin review UI (per [`36-user-management/`](../36-user-management/00-overview.md) roles) | SLA/escalation workflow |

---

## Functional Requirements

| # | Requirement |
|---|-------------|
| FR-1 | Feedback button reachable from any view (Navbar entry) |
| FR-2 | Form fields: type (enum), title (≤120 chars), body (≤2000 chars), optional screenshot |
| FR-3 | Auto-captured context: current `Item.id`, breadcrumb path, viewport, user agent |
| FR-4 | Submission stored in dedicated SQLite DB (`feedback.db`) — never blocks UI |
| FR-5 | Admin role can view, search, filter, mark-resolved feedback |
| FR-6 | 90-day retention by default (configurable per [`06-seedable-config-architecture/`](../06-seedable-config-architecture/00-overview.md)) |

---

## Pending Sub-Specs

| # | Planned File | Description |
|---|--------------|-------------|
| 01 | `01-data-model.md` | `Feedback` table schema (PascalCase, `FeedbackId` PK) |
| 02 | `02-submission-flow.md` | Form UX, validation, optimistic submission |
| 03 | `03-admin-review-ui.md` | Inbox, filters, status transitions |
| 04 | `04-retention-and-export.md` | Retention policy, CSV export, GDPR |

---

## Cross-References

| Reference | Location |
|-----------|----------|
| App | [`../31-app/00-overview.md`](../31-app/00-overview.md) |
| User Management (roles) | [`../36-user-management/00-overview.md`](../36-user-management/00-overview.md) |
| Database Conventions | [`../04-database-conventions/00-overview.md`](../04-database-conventions/00-overview.md) |
| Split DB Architecture | [`../05-split-db-architecture/00-overview.md`](../05-split-db-architecture/00-overview.md) |
| Roadmap | [`../31-app/04-roadmap/00-overview.md`](../31-app/04-roadmap/00-overview.md) |

---

*Feedback Report spec v2.0.0 — fleshed out per AUD-V-01 — 2026-04-19*

---

## Related

**See also:**

- [`../00-overview.md`](../00-overview.md) — Parent overview
- [`97-acceptance-criteria.md`](./97-acceptance-criteria.md) — Acceptance criteria
