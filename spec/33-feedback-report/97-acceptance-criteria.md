# Feedback Report — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Status:** Curated — 14 testable criteria
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-FEEDBACKREPORT-01` … `AT-FEEDBACKREPORT-14`

---

## Criteria

### Entry point & form

| ID | Criterion | Source |
|----|-----------|--------|
| AT-FEEDBACKREPORT-01 | A Feedback button MUST be reachable from any view via the Navbar (FR-1); hiding it inside a sub-menu is forbidden because it harms reachability. | [`00-overview.md`](./00-overview.md) |
| AT-FEEDBACKREPORT-02 | Form fields MUST be: `type` (enum: `bug` / `idea` / `praise` / `question`), `title` (≤ 120 chars), `body` (≤ 2000 chars), optional screenshot. Server MUST re-validate every limit — client-only validation is a Code-Red trust bug. | [`00-overview.md`](./00-overview.md) |
| AT-FEEDBACKREPORT-03 | The `type` field MUST be a typed enum constant (NOT a magic string in templates); adding a new type MUST require updating the enum + this AT. | [`00-overview.md`](./00-overview.md) |

### Auto-captured context

| ID | Criterion | Source |
|----|-----------|--------|
| AT-FEEDBACKREPORT-04 | Submission MUST auto-attach: current `Item.id`, breadcrumb path, viewport size, user-agent string (FR-3); missing any field fails review. | [`00-overview.md`](./00-overview.md) |
| AT-FEEDBACKREPORT-05 | Auto-captured context MUST exclude PII beyond what's strictly required (no clipboard contents, no other items' content, no auth tokens); leaking PII is a Code-Red privacy bug. | [`00-overview.md`](./00-overview.md) |

### Storage & non-blocking submission

| ID | Criterion | Source |
|----|-----------|--------|
| AT-FEEDBACKREPORT-06 | Feedback MUST persist in a dedicated `feedback.db` SQLite (Split-DB pattern) — sharing the user data DB is forbidden. | [`00-overview.md`](./00-overview.md), [`../05-split-db-architecture/01-fundamentals/97-acceptance-criteria.md`](../05-split-db-architecture/01-fundamentals/97-acceptance-criteria.md) |
| AT-FEEDBACKREPORT-07 | Submission MUST be non-blocking (FR-4): the form MUST close optimistically and queue the write; a failure MUST surface a toast + retry option (NOT a silent drop). | [`00-overview.md`](./00-overview.md) |
| AT-FEEDBACKREPORT-08 | The `Feedback` table MUST follow naming conventions: singular PascalCase table name, `FeedbackId` PK as `INTEGER PRIMARY KEY AUTOINCREMENT`. | [`00-overview.md`](./00-overview.md), [`../36-user-management/97-acceptance-criteria.md`](../36-user-management/97-acceptance-criteria.md) |

### Admin review

| ID | Criterion | Source |
|----|-----------|--------|
| AT-FEEDBACKREPORT-09 | Admin review UI access MUST be gated by the `Admin` role via the central `hasRole(userId, 'Admin')` helper (FR-5); ad-hoc role checks are forbidden. | [`00-overview.md`](./00-overview.md), [`../36-user-management/97-acceptance-criteria.md`](../36-user-management/97-acceptance-criteria.md) |
| AT-FEEDBACKREPORT-10 | Admin UI MUST support filter by `type`, `status`, `userId`, `createdAt range`; server-side filtering is mandatory (client-side filtering of the full table is forbidden — leaks data + breaks at scale). | [`00-overview.md`](./00-overview.md) |
| AT-FEEDBACKREPORT-11 | Status transitions MUST be a typed enum (`new → triaged → resolved → archived`) with one-way arrows; arbitrary transitions fail review. | [`00-overview.md`](./00-overview.md) |

### Retention & GDPR

| ID | Criterion | Source |
|----|-----------|--------|
| AT-FEEDBACKREPORT-12 | Default retention MUST be 90 days, configurable via the seedable-config layer (FR-6); hardcoded retention windows are forbidden. | [`00-overview.md`](./00-overview.md), [`../06-seedable-config-architecture/01-fundamentals/97-acceptance-criteria.md`](../06-seedable-config-architecture/01-fundamentals/97-acceptance-criteria.md) |
| AT-FEEDBACKREPORT-13 | Retention purge MUST run as a scheduled job AND log per-purge counts at INFO level; silent purge is forbidden because it breaks audit-ability. | [`00-overview.md`](./00-overview.md) |
| AT-FEEDBACKREPORT-14 | A user-initiated `DeleteMyFeedback(userId)` MUST be a one-shot operation that removes all the user's feedback rows + screenshots within the GDPR deadline; piecemeal deletion fails GDPR. | [`00-overview.md`](./00-overview.md), [`../05-split-db-architecture/02-features/05-user-scoped-isolation/97-acceptance-criteria.md`](../05-split-db-architecture/02-features/05-user-scoped-isolation/97-acceptance-criteria.md) |

---

## Verification

```bash
# Feedback form reachable from Navbar
rg -nP "feedback" src/components/Navbar*.tsx

# Type enum referenced (not magic strings)
rg -nP "'bug'|'idea'|'praise'|'question'" src/ | grep -v 'FeedbackType\.'

# Hygiene suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../36-user-management/97-acceptance-criteria.md`](../36-user-management/97-acceptance-criteria.md) — Admin role gating
- [`../05-split-db-architecture/01-fundamentals/97-acceptance-criteria.md`](../05-split-db-architecture/01-fundamentals/97-acceptance-criteria.md) — Dedicated SQLite placement
- [`../06-seedable-config-architecture/01-fundamentals/97-acceptance-criteria.md`](../06-seedable-config-architecture/01-fundamentals/97-acceptance-criteria.md) — Configurable retention

---

*Curated 2026-04-25 — closes batch-16 item 2. Replaces v1.0.0 scaffold.*
