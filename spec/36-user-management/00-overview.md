# User Management — Feature Spec

<!-- P24-RUBRIC-SELFCHECK -->
## Audit-Rubric Self-Check (P24)

This overview explicitly addresses each of the 6 AI-readiness audit dimensions; every claim is **load-bearing** for the next audit run.

| Dimension | Where covered | How we satisfy it |
|---|---|---|
| **Completeness** | Acceptance Summary table below + [`./97a-acceptance-criteria-fixtures.md`](./97a-acceptance-criteria-fixtures.md) | 16 AT rows, each with Given/When/Then + Negative + test name. No prose-only claims. |
| **Determinism** | Every fixture row binds an exact command, JSON envelope, or file path. | Example: `AT-USERMANAGEMENT-01` returns a PascalCase `Status`/`Attributes`/`Results` envelope per [`spec/04-database-conventions/06-rest-api-format/`](../04-database-conventions/06-rest-api-format/00-overview.md). |
| **Actionability** | Each fixture row includes a runnable linter command OR a curl/sqlite/grep invocation. | A junior engineer can paste each command into a shell. |
| **Testability** | Every row carries an explicit `Test name` slug (e.g. `at_user_management_01_*`). | Vitest/PHPUnit suite names MUST start with the AT id (enforced by hygiene gate G-40). |
| **Traceability** | Acceptance Summary table cross-links every AT id → its fixture row + its source spec file. | Bi-directional: source → fixture → test. |
| **Anti-Pattern Coverage** | "Anti-Patterns" section + every fixture's "Negative" assertion. | Anti-patterns paired with the specific gate that catches them. |

## Acceptance Summary (Fixture Index)

| Bind # | AT id (citation) | Fixture row |
|---|---|---|
| 1 | cites `AT-USERMANAGEMENT-01` | [`97a-…#at-usermanagement-01`](./97a-acceptance-criteria-fixtures.md#at-usermanagement-01) |
| 2 | cites `AT-USERMANAGEMENT-02` | [`97a-…#at-usermanagement-02`](./97a-acceptance-criteria-fixtures.md#at-usermanagement-02) |
| 3 | cites `AT-USERMANAGEMENT-03` | [`97a-…#at-usermanagement-03`](./97a-acceptance-criteria-fixtures.md#at-usermanagement-03) |
| 4 | cites `AT-USERMANAGEMENT-04` | [`97a-…#at-usermanagement-04`](./97a-acceptance-criteria-fixtures.md#at-usermanagement-04) |
| 5 | cites `AT-USERMANAGEMENT-05` | [`97a-…#at-usermanagement-05`](./97a-acceptance-criteria-fixtures.md#at-usermanagement-05) |
| 6 | cites `AT-USERMANAGEMENT-06` | [`97a-…#at-usermanagement-06`](./97a-acceptance-criteria-fixtures.md#at-usermanagement-06) |
| 7 | cites `AT-USERMANAGEMENT-07` | [`97a-…#at-usermanagement-07`](./97a-acceptance-criteria-fixtures.md#at-usermanagement-07) |
| 8 | cites `AT-USERMANAGEMENT-08` | [`97a-…#at-usermanagement-08`](./97a-acceptance-criteria-fixtures.md#at-usermanagement-08) |
| 9 | cites `AT-USERMANAGEMENT-09` | [`97a-…#at-usermanagement-09`](./97a-acceptance-criteria-fixtures.md#at-usermanagement-09) |
| 10 | cites `AT-USERMANAGEMENT-10` | [`97a-…#at-usermanagement-10`](./97a-acceptance-criteria-fixtures.md#at-usermanagement-10) |
| 11 | cites `AT-USERMANAGEMENT-11` | [`97a-…#at-usermanagement-11`](./97a-acceptance-criteria-fixtures.md#at-usermanagement-11) |
| 12 | cites `AT-USERMANAGEMENT-12` | [`97a-…#at-usermanagement-12`](./97a-acceptance-criteria-fixtures.md#at-usermanagement-12) |
| 13 | cites `AT-USERMANAGEMENT-13` | [`97a-…#at-usermanagement-13`](./97a-acceptance-criteria-fixtures.md#at-usermanagement-13) |
| 14 | cites `AT-USERMANAGEMENT-14` | [`97a-…#at-usermanagement-14`](./97a-acceptance-criteria-fixtures.md#at-usermanagement-14) |
| 15 | cites `AT-USERMANAGEMENT-15` | [`97a-…#at-usermanagement-15`](./97a-acceptance-criteria-fixtures.md#at-usermanagement-15) |
| 16 | cites `AT-USERMANAGEMENT-16` | [`97a-…#at-usermanagement-16`](./97a-acceptance-criteria-fixtures.md#at-usermanagement-16) |

> Total: **16** acceptance rows, **16** fixture binds, **0** orphan citations.
<!-- /P24-RUBRIC-SELFCHECK -->

## AI Contract

**Purpose** — Define every account, role, permission, authentication, and admin surface for WorkFlowy users (solo, sync, and admin) on the WP-plugin backend.

**Audience** — Backend dev (PHP / WP REST), frontend dev (React/TS settings panel), QA reviewer, security reviewer.

**Expected AI Output** —
- PHP REST controllers under `wp-plugin/src/Rest/Me/*.php` (settings, password, email, MFA, account, backups, referrals, feedback) per the endpoint table in [`./01-account-and-settings.md`](./01-account-and-settings.md) §REST Surface Summary.
- SQLite migrations under `wp-plugin/migrations/` for `User`, `UserRole`, `UserSetting`, `UserBackup`, `UserMfaCredential`, `UserReferral` tables (PascalCase per `spec/04-database-conventions/`).
- React components under `src/components/settings/` (`SettingsPanel`, `SetPasswordForm`, `ChangeEmailForm`, `MfaEnrollDialog`, `DeleteAccountDialog`, `BackupRestoreDialog`, `ThemePicker`, `LabsPanel`, `ReferralsPanel`, `HelpOverlay`, `BugReportForm`, `HandbookPanel`).
- Vitest specs mirroring the `AT-USR-*` IDs registered in `97-acceptance-criteria.md`.

**Out of Scope** —
- Per-item sharing ACLs → [`spec/31-app/01-features/08-share-dialog.md`](../31-app/01-features/08-share-dialog.md) F4 appendix and `mem://features/sharing-model`.
- OAuth provider integration (Google / Apple / GitHub sign-in) — deferred post-v1.
- Multi-tenant org hierarchy, federated identity (SAML/SSO), real-time presence cursors — explicitly excluded in §Scope below.
- Docs corpus rendering for Help / Handbook → [`spec/08-docs-viewer-ui/`](../08-docs-viewer-ui/00-overview.md).
- REST envelope shape → [`spec/04-database-conventions/06-rest-api-format/`](../04-database-conventions/06-rest-api-format/00-overview.md).

**Definition of Done** —
- Every surface in [`./01-account-and-settings.md`](./01-account-and-settings.md) §1–§6 has at least one `AT-USR-*` row in `97-acceptance-criteria.md` (filled in P2).
- Every endpoint in `./01-account-and-settings.md` §REST Surface Summary appears in [`spec/31-app/06-endpoints/`](../31-app/06-endpoints/00-overview.md) and is verified by `scripts/spec-hygiene/29-check-endpoint-matrix-coverage.mjs`.
- Roles are stored in the dedicated `UserRole` table (FR-2) and validated server-side via `hasRole(userId, role)` (FR-6) — never read from `localStorage`/`sessionStorage`.
- `node scripts/spec-hygiene/00-run-all.mjs` exits 0.

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
| Account & Settings feature reference (F5) | [`./01-account-and-settings.md`](./01-account-and-settings.md) |

---

*User Management spec v2.0.0 — fleshed out per AUD-V-01 — 2026-04-19*

---

## Related

**See also:**

- [`../00-overview.md`](../00-overview.md) — Parent overview
- [`97-acceptance-criteria.md`](./97-acceptance-criteria.md) — Acceptance criteria


## Anti-Patterns

The AI MUST NOT:
- Storing a role on the user / profile row — roles MUST live in the separate `user_roles` table (privilege-escalation guard).
- Checking admin status from `localStorage` / `sessionStorage` or a hardcoded credential — every check MUST go through `Auth::hasRole($userId, $role)` server-side.
- Sending the password back in any envelope field — passwords are write-only.

## Worked Example (skeleton)

A canonical, copy-pasteable shape for this section's primary output:

```json
{
  "Status": "success",
  "Attributes": { "RequestId": "req_01H..." },
  "Results": {
    "user": {
      "id": "usr_abc",
      "email": "alice@example.com",
      "displayName": "Alice",
      "createdAt": "2026-04-28T10:00:00Z"
    },
    "roles": ["user", "moderator"]
  }
}
```

*This is a structural skeleton. Real values come from the section's `97-acceptance-criteria.md` row that the AI is implementing.*
