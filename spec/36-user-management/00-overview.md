# User Management — Feature Spec
## AI Contract

**Purpose** — _TODO(P1): one sentence describing what `User Management — Feature Spec` solves._

**Audience** — _TODO(P1): which implementer role (spec author / frontend dev / backend dev / DevOps / reviewer)._

**Expected AI Output** —
- _TODO(P1): list concrete artifact paths (files, fixtures, migrations) the AI should produce when implementing this section._

**Out of Scope** —
- _TODO(P1): bullet adjacent concerns and link to owning section._

**Definition of Done** —
- _TODO(P1): testable bullets, each referencing an `AT-*` ID from this section's `97-acceptance-criteria.md` or a hygiene-script name._
- `node scripts/spec-hygiene/00-run-all.mjs` exits 0

> Authoring rules: see [`spec/01-spec-authoring-guide/18-ai-contract-template.md`](../01-spec-authoring-guide/18-ai-contract-template.md).

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


> **Version:** 2.0.0  
> **Updated:** 2026-04-19  
> **Status:** Planned (not yet implemented)

---

## Keywords

`users` · `roles` · `permissions` · `auth` · `rbac` · `admin`

---

## Scoring

| Criterion | Status |
|-----------|--------|
| Overview present | ✅ |
| Confidence rated | ✅ |
| Ambiguity rated | ✅ |
| Keywords present | ✅ |
| Scoring table present | ✅ |

## Confidence

Draft (high-level only) · Ambiguity: Medium (sub-specs pending)

---


## Purpose

Specification for WorkFlowy's user management system: accounts, roles, permissions, authentication, and administrative operations.

> 🟡 **Status:** This is a **planned feature** with high-level scope only. Sub-specs (data model, RBAC, auth flow) will be authored before implementation.

---


## Scope

| In Scope | Out of Scope |
|----------|--------------|
| User accounts (`User` table — singular, PascalCase per [04-db-conventions](../04-database-conventions/00-overview.md)) | Multi-tenant org hierarchy |
| Role-based access control (RBAC) — `User`, `Editor`, `Admin` | OAuth provider implementation |
| Local-first auth (no required server login for solo use) | Federated identity (SAML / SSO) |
| Optional sync account for cross-device | Real-time presence cursors |
| Per-item sharing permissions ([`mem://features/sharing-model`](mem://features/sharing-model)) | Public read-only landing pages |

---

## Roles & Permissions Matrix

| Capability | User | Editor | Admin |
|------------|:----:|:------:|:-----:|
| Read own items | ✅ | ✅ | ✅ |
| Create / edit own items | ✅ | ✅ | ✅ |
| Mirror / template own items | ✅ | ✅ | ✅ |
| Edit shared items (invitee) | ❌ | ✅ | ✅ |
| Manage shared invites | ❌ | ✅ | ✅ |
| Review feedback ([`33-feedback-report/`](../33-feedback-report/00-overview.md)) | ❌ | ❌ | ✅ |
| View activity audit ([`34-activity-feed/`](../34-activity-feed/00-overview.md)) for other users | ❌ | ❌ | ✅ |
| Bulk-purge trash beyond retention | ❌ | ❌ | ✅ |

---

## Functional Requirements

| # | Requirement |
|---|-------------|
| FR-1 | `User` table with `UserId` PK (INTEGER PRIMARY KEY AUTOINCREMENT — no UUID) |
| FR-2 | `UserRole` table linking `UserId` ↔ `Role` enum (no role columns on `User`) |
| FR-3 | Auth via password + optional WebAuthn passkey |
| FR-4 | Session token stored in httpOnly cookie when sync enabled; `localStorage` fallback for solo mode |
| FR-5 | Admin UI for inviting, deactivating, role-changing users |
| FR-6 | All RBAC checks via central `hasRole(userId, role)` helper (mirrors security-definer pattern) |

---

## Security Notes

- ❌ **NEVER** store roles in `localStorage`/`sessionStorage` for client-side role checks.
- ❌ **NEVER** put role columns on the `User` table — always a separate `UserRole` table.
- ✅ Always validate role server-side via the central RBAC helper.
- ✅ Follow [`mem://constraints/coding-guidelines`](mem://constraints/coding-guidelines) for typed boundaries.

---

## Pending Sub-Specs

| # | Planned File | Description |
|---|--------------|-------------|
| 01 | `01-data-model.md` | `User`, `UserRole` tables + `Role` enum |
| 02 | `02-auth-flow.md` | Login, registration, passkey, session lifecycle |
| 03 | `03-rbac-helpers.md` | `hasRole`/`requireRole` helper API |
| 04 | `04-admin-ui.md` | Invitee/role-management screens |

---

## Cross-References

| Reference | Location |
|-----------|----------|
| App | [`../31-app/00-overview.md`](../31-app/00-overview.md) |
| Database Conventions | [`../04-database-conventions/00-overview.md`](../04-database-conventions/00-overview.md) |
| Split DB Architecture | [`../05-split-db-architecture/00-overview.md`](../05-split-db-architecture/00-overview.md) |
| Sharing Model | [`mem://features/sharing-model`](mem://features/sharing-model) |
| Feedback Report (admin reviewer) | [`../33-feedback-report/00-overview.md`](../33-feedback-report/00-overview.md) |
| Activity Feed (admin auditor) | [`../34-activity-feed/00-overview.md`](../34-activity-feed/00-overview.md) |
| Roadmap | [`../31-app/04-roadmap/00-overview.md`](../31-app/04-roadmap/00-overview.md) |

---

*User Management spec v2.0.0 — fleshed out per AUD-V-01 — 2026-04-19*

---

## Related

**See also:**

- [`../00-overview.md`](../00-overview.md) — Parent overview
- [`97-acceptance-criteria.md`](./97-acceptance-criteria.md) — Acceptance criteria
